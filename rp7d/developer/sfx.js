// Sound effects: footsteps, hit impacts, whiffs and landings (Web Audio).
//   walk  · assets/audio/sfx/walk.mp3   one long walking recording, looped while Rizer walks or sneaks
//   run   · assets/audio/sfx/run.mp3    looped while he runs ("loud run")
//   light / medium / heavy · impact_<weight>_<n>.mp3   a blow that connects, by how hard it hits
//   miss  · miss_<n>.mp3                a punch or kick that swings through air
//   land  · land_<n>.mp3                boots meeting the ground after a jump or a fall
//   wind  · wind.mp3                    a low wind bed while Rizer flies (silent while he hovers)
// Variants (_1, _2, _3) are picked at random with a small pitch spread so repeats don't sound canned.
// Each one-shot starts at its first audible sample (leading silence is skipped), so hits land on the frame.
// The single-file build carries these inline (window.__RP7D_ASSETS, gzip + base64).
const DIR = './assets/audio/sfx/';
export const SFX_FILES = {
  walk: ['walk.mp3'], run: ['run.mp3'],
  light: ['impact_light_1.mp3', 'impact_light_2.mp3'],
  medium: ['impact_medium_1.mp3', 'impact_medium_2.mp3'],
  heavy: ['impact_heavy_1.mp3'],
  miss: ['miss_1.mp3'],
  land: ['land_1.mp3'],
  blast: ['blast_1.mp3'],
  thunder: ['thunder_1.mp3'],
  lift: ['lift_1.mp3'],             // Astralift: the ground-lightning crack as the enemy is thrown
  slide: ['slide_1.mp3'],
  whoosh: ['whoosh_1.mp3'],
  solo: ['guitar_solo.mp3'],        // Psychosyd's guitar: the Beat It solo (a whole track, played with sfx.track)          // Pearlbow: the arrow leaving the string
  arrow_fire: ['arrow_fire_1.mp3'],     // Pearlbow: the arrow leaving the string
  arrow_hit: ['arrow_hit_1.mp3'],       // Pearlbow: the arrow striking an enemy
  light_weapon: ['light_weapon_1.mp3'], // the blue Tearsword connecting
  heavy_weapon: ['heavy_weapon_1.mp3'], // the red Rubypaw and the green Jaded Axe connecting
  thardin: ['thardin_blaster_1.mp3'],   // Thardin Blaster Rifle: a bolt leaving the muzzle
  wind: ['wind.mp3']                 // looped, low, while flying (not hovering)            // ○ Astral Blast / Astralstrike leaving the hand
};
export const SFX_URLS = Object.values(SFX_FILES).flat().map(f => DIR + f);
const KEY = 'rp7d.sfx.v1';
const LEVEL = { walk: 0.55, run: 0.6, light: 0.8, medium: 0.9, heavy: 1, miss: 0.85, land: 0.75, blast: 0.8, thunder: 0.75, lift: 0.85, slide: 0.7, whoosh: 0.8, solo: 0.9, arrow_fire: 1, arrow_hit: 1, light_weapon: 1, heavy_weapon: 1, thardin: 0.8, wind: 0.32 };

async function fetchBuf(url) {
  const packed = globalThis.__RP7D_ASSETS?.[url];
  if (packed) {
    const bin = atob(packed.replace(/^gz:/, '')), buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    return packed.startsWith('gz:') ? new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer() : buf.buffer;
  }
  const r = await fetch(url); if (!r.ok) throw new Error(`${url} ${r.status}`); return r.arrayBuffer();
}
// Seconds of silence before the sound starts.
function onset(b) {
  const d = b.getChannelData(0), th = 0.02;
  for (let i = 0; i < d.length; i++) if (Math.abs(d[i]) > th) return Math.max(0, i / b.sampleRate - 0.004);
  return 0;
}
// Seconds where the sound ends (trailing silence trimmed), so a loop never has a gap at its seam.
function tail(b) {
  const d = b.getChannelData(0), th = 0.02;
  for (let i = d.length - 1; i > 0; i--) if (Math.abs(d[i]) > th) return Math.min(b.duration, i / b.sampleRate + 0.02);
  return b.duration;
}

export function createSfx() {
  let st = { volume: 0.8, muted: false };
  try { st = { ...st, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };
  let hostPaused = false;
  let ctx = null, master = null; const bank = {}; const loops = {};
  // The context is made and every sound decoded up front (it starts suspended until a gesture), so nothing is
  // still loading when the first blow lands; unlock() then only has to resume it.
  function init() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
      master = ctx.createGain(); master.gain.value = st.muted ? 0 : st.volume; master.connect(ctx.destination);
      for (const [kind, files] of Object.entries(SFX_FILES)) bank[kind] = [];
      for (const [kind, files] of Object.entries(SFX_FILES)) for (const f of files)
        fetchBuf(DIR + f).then(a => ctx.decodeAudioData(a)).then(b => bank[kind].push({ b, at: onset(b), end: tail(b) })).catch(e => console.warn('[rp7d] sfx', f, e));
    }
  }
  function unlock() { init(); if (!hostPaused && ctx?.state === 'suspended') ctx.resume(); }
  init();
  // One-shot: kind is a key of SFX_FILES. vol scales the kind's level.
  function play(kind, vol = 1, rate = 1) {
    if (!ctx || st.muted) return;
    const list = bank[kind]; if (!list?.length) return;
    const s = list[Math.floor(Math.random() * list.length)];
    const src = ctx.createBufferSource(), g = ctx.createGain();
    src.buffer = s.b; src.playbackRate.value = kind === 'thunder' ? 1 : rate * (0.94 + Math.random() * 0.12);
    g.gain.value = (LEVEL[kind] ?? 1) * vol; src.connect(g).connect(master); src.start(0, kind === 'thunder' ? 0 : s.at);
  }
  // Footstep beds: mode 'walk' | 'run' | null, loud 0–1. Each bed is one long recording that loops for as
  // long as he keeps moving and picks up where it left off next time (it never restarts at its first step).
  // Silence at either end of the file is trimmed from the loop so the seam is seamless.
  const pos = {};
  function steps(mode, loud = 1, rate = 1) {
    for (const kind of ['walk', 'run']) bed(kind, mode === kind ? LEVEL[kind] * loud : 0, rate);
  }
  // Wind while flying (not while hovering): level 0–1, faded in and out slowly.
  function wind(level) { bed('wind', LEVEL.wind * level, 1, 0.35, 0.5); }
  // A looping bed: `want` is its gain (0 fades it out, then it stops and remembers where it was).
  function bed(kind, want, rate = 1, fadeIn = 0.05, fadeOut = 0.09) {
    if (!ctx) return;
    const now = ctx.currentTime, s = bank[kind]?.[0]; if (!s) return;
    let L = loops[kind];
    const span = Math.max(0.1, s.end - s.at);
    if (want > 0 && !L) { // start (or resume) the bed
      const src = ctx.createBufferSource(), g = ctx.createGain();
      src.buffer = s.b; src.loop = true; src.loopStart = s.at; src.loopEnd = s.end; src.playbackRate.value = rate; g.gain.value = 0;
      const off = pos[kind] ?? s.at;
      src.connect(g).connect(master); src.start(0, off); L = loops[kind] = { src, g, t0: now, off, rate, stopAt: 0 };
    }
    if (!L) return;
    L.g.gain.setTargetAtTime(want, now, want > 0 ? fadeIn : fadeOut);
    L.src.playbackRate.setTargetAtTime(rate, now, 0.1);
    if (want > 0) L.stopAt = 0;
    else if (!L.stopAt) L.stopAt = now + fadeOut * 5; // faded out: stop it, remember where it was
    else if (now >= L.stopAt) {
      pos[kind] = s.at + (((L.off - s.at) + (now - L.t0) * L.rate) % span);
      try { L.src.stop(); } catch (e) {} L.src.disconnect(); loops[kind] = null; return;
    }
    if (want > 0 && Math.abs(rate - L.rate) > 0.01) { L.off = s.at + (((L.off - s.at) + (now - L.t0) * L.rate) % span); L.t0 = now; L.rate = rate; } // keep the resume point honest when the pace changes
  }
  function setVolume(v) { st.volume = v; if (master) master.gain.setTargetAtTime(st.muted ? 0 : v, ctx.currentTime, 0.02); save(); }
  function setMuted(m) { st.muted = !!m; if (master) master.gain.setTargetAtTime(st.muted ? 0 : st.volume, ctx.currentTime, 0.02); save(); }
  const debug = () => ({ pos: { ...pos }, playing: Object.fromEntries(['walk', 'run', 'wind'].map(k => [k, !!loops[k]])), ctx: ctx?.currentTime });
  // A whole track (the guitar solo) from its first sample: returns { duration, stop() } or null if muted / not loaded.
  function track(kind, vol = 1) {
    if (!ctx || st.muted) return null;
    const s = bank[kind]?.[0]; if (!s) return null;
    const src = ctx.createBufferSource(), g = ctx.createGain(); src.buffer = s.b;
    g.gain.value = (LEVEL[kind] ?? 1) * vol; src.connect(g).connect(master); src.start(0);
    return { duration: s.b.duration, stop() { try { g.gain.setTargetAtTime(0, ctx.currentTime, 0.08); src.stop(ctx.currentTime + 0.5); } catch (e) {} } };
  }
  function setHostPaused(value) { hostPaused = !!value; if (hostPaused) ctx?.suspend()?.catch(() => {}); else if (ctx?.state === 'suspended') ctx.resume()?.catch(() => {}); }
  return { setHostPaused, unlock, play, track, steps, wind, debug, setVolume, setMuted, getState: () => ({ ...st, loaded: Object.values(bank).reduce((n, l) => n + l.length, 0), ctx: ctx?.state || "none" }) };
}
// Impact weight from the damage a blow deals (Rizer's and enemies' alike).
export const impactWeight = dmg => dmg >= 7 ? 'heavy' : dmg >= 3.5 ? 'medium' : 'light';
