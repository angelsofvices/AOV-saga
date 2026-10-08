// RP7D · Interactive TV & collectible DVD system (SYSTEM: RP7D_TV_DVD).
//
// ASSETS       TV_SCREEN · TV_CABINET · DVD_PLAYER · DVD_REMOTE · DVD_CASE · DVD_DISC — separate builders, one set
//              (buildTVSet) placed in Rizer's living room by home-interior.js. Black flat screen on a dark cabinet,
//              player on the middle shelf, cases below, after the pixel-art reference.
// MEDIA        dvd-registry.js says what each disc plays; this file never names a video. Playback renders onto the
//              3D screen (a VideoTexture), with the TV menu and the controls drawn over it.
// INVENTORY    a DVD is an item in storage.js: Zycube, Home Storage, or inventory.tv.disc (inside the player). Inserting
//              moves it out of storage into the player, ejecting moves it back; it is never in two places and
//              watching never consumes it. The last position of each disc is remembered.
// INTERACTION  APPROACH_TV → USE_TV (○ / E) → camera glides to the screen → SELECT_DVD → INSERT_DISC → PLAY_VIDEO ·
//              PAUSE_VIDEO · SEEK_VIDEO · STOP_VIDEO · EJECT_DISC → EXIT_TV restores camera, controls and the world
//              (which waits, frozen, while the TV is up: game.js skips its update).
import * as THREE from 'three';
import { DVDS } from './dvd-registry.js';

const PROGRESS_KEY = 'rp7d.dvd.progress.v1';
const SEEK = 10;                                   // seconds per ← / →
const fmt = s => { s = Math.max(0, Math.floor(s || 0)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ── ASSETS ─────────────────────────────────────────────────────────────────────────────────────────
// All built facing +Z (the screen looks down +Z), base at y = 0, metres.
const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.1, flatShading: true, ...o });
function part(parent, geo, mat, x, y, z) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; }
const box = (p, w, h, d, mat, x, y, z) => part(p, new THREE.BoxGeometry(w, h, d), mat, x, y, z);

// The case cover: the disc's colours, its type and title, drawn once and shared by the case, the disc and the TV menu.
const covers = new Map();
export function coverCanvas(id) {
  if (covers.has(id)) return covers.get(id);
  const d = DVDS[id], c = document.createElement('canvas'); c.width = 270; c.height = 380; const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 380); grad.addColorStop(0, d?.cover?.color || '#1743AA'); grad.addColorStop(1, '#05060d');
  g.fillStyle = grad; g.fillRect(0, 0, 270, 380);
  g.strokeStyle = d?.cover?.accent || '#E9D39C'; g.lineWidth = 6; g.strokeRect(10, 10, 250, 360);
  g.fillStyle = '#ffffff22'; for (let i = 0; i < 40; i++) { g.beginPath(); g.arc((i * 97) % 270, (i * 61) % 240, (i % 3) + 1, 0, 7); g.fill(); }
  g.fillStyle = d?.cover?.accent || '#E9D39C'; g.font = '600 15px sans-serif'; g.textAlign = 'center'; g.fillText(d?.type || 'DVD', 135, 300);
  g.fillStyle = '#fff'; g.font = '700 22px Georgia, serif';
  const words = String(d?.title || id).split(' '); let line = '', y = 330; const lines = [];
  for (const w of words) { if (g.measureText(line + w).width > 230) { lines.push(line); line = ''; } line += w + ' '; } lines.push(line);
  lines.slice(-2).forEach((l, i, a) => g.fillText(l.trim(), 135, y - (a.length - 1 - i) * 24));
  g.fillStyle = '#ffffff'; g.font = '700 30px sans-serif'; g.fillText('DVD', 135, 60);
  covers.set(id, c); return c;
}
export function buildDvdCase(id) { // DVD_CASE · 13.5 × 19 × 1.5 cm
  const g = new THREE.Group(); g.name = 'DVD_CASE';
  const tex = new THREE.CanvasTexture(coverCanvas(id)); tex.colorSpace = THREE.SRGBColorSpace;
  const shell = M('#0b0d16'), front = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 });
  const c = part(g, new THREE.BoxGeometry(0.135, 0.015, 0.19), [shell, shell, front, shell, shell, shell], 0, 0.0075, 0);
  c.name = 'DVD_CASE_' + id; return g;
}
export function buildDvdDisc(id) { // DVD_DISC · 12 cm, silver with the cover colour as its label
  const g = new THREE.Group(); g.name = 'DVD_DISC';
  part(g, new THREE.CylinderGeometry(0.06, 0.06, 0.0015, 32), M('#c9d2dc', { metalness: 0.9, roughness: 0.2 }), 0, 0, 0);
  part(g, new THREE.CylinderGeometry(0.042, 0.042, 0.0018, 32), M(DVDS[id]?.cover?.color || '#1743AA'), 0, 0.0002, 0);
  part(g, new THREE.CylinderGeometry(0.0075, 0.0075, 0.002, 16), M('#0b0d16'), 0, 0.0003, 0);
  return g;
}
// A disc waiting to be found: its case lying flat, ringed by a soft glow so it reads from across the room.
export function buildDvdPickup(id) {
  const g = buildDvdCase(id);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.13, 0.2, 32), new THREE.MeshBasicMaterial({ color: '#5fe2ff', transparent: true, opacity: 0.45, depthWrite: false, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.002; g.add(ring);
  return g;
}
export function buildDvdRemote() { // DVD_REMOTE
  const g = new THREE.Group(); g.name = 'DVD_REMOTE';
  box(g, 0.05, 0.02, 0.19, M('#0b0d16'), 0, 0.01, 0);
  const btn = M('#2a3242'), red = M('#d11c26', { emissive: '#5a0000' }), blue = M('#3a8cff', { emissive: '#0a2a66' });
  part(g, new THREE.CylinderGeometry(0.008, 0.008, 0.006, 10), red, 0.012, 0.021, -0.075);
  part(g, new THREE.CylinderGeometry(0.016, 0.016, 0.005, 16), blue, 0, 0.021, -0.02);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) box(g, 0.009, 0.004, 0.007, btn, (c - 1) * 0.014, 0.021, 0.02 + r * 0.014);
  return g;
}
export function buildDvdPlayer() { // DVD_PLAYER · tray slides out along +Z
  const g = new THREE.Group(); g.name = 'DVD_PLAYER';
  box(g, 0.43, 0.065, 0.3, M('#2c3038', { metalness: 0.6, roughness: 0.35 }), 0, 0.0325, 0);
  box(g, 0.43, 0.004, 0.3, M('#4b525e', { metalness: 0.7 }), 0, 0.066, 0);
  box(g, 0.12, 0.022, 0.004, M('#061018'), 0.08, 0.035, 0.151);
  const lcd = document.createElement('canvas'); lcd.width = 128; lcd.height = 32; const lg = lcd.getContext('2d');
  const lcdTex = new THREE.CanvasTexture(lcd); lcdTex.colorSpace = THREE.SRGBColorSpace;
  const lcdMesh = box(g, 0.1, 0.016, 0.002, new THREE.MeshBasicMaterial({ map: lcdTex }), 0.08, 0.035, 0.1535);
  const setLcd = t => { lg.fillStyle = '#031016'; lg.fillRect(0, 0, 128, 32); lg.fillStyle = '#5fe2ff'; lg.font = 'bold 20px monospace'; lg.textAlign = 'center'; lg.fillText(t, 64, 23); lcdTex.needsUpdate = true; };
  setLcd('RP7D'); lcdMesh.name = 'DVD_PLAYER_DISPLAY';
  const tray = new THREE.Group(); tray.name = 'DVD_TRAY'; tray.position.set(-0.08, 0.03, 0); g.add(tray);
  box(tray, 0.15, 0.01, 0.17, M('#16191f'), 0, 0, 0.06);
  const led = box(g, 0.008, 0.008, 0.004, new THREE.MeshBasicMaterial({ color: '#3dff7a' }), 0.19, 0.045, 0.151);
  for (const x of [0.15, 0.17]) part(g, new THREE.CylinderGeometry(0.008, 0.008, 0.006, 12), M('#8a93a3', { metalness: 0.8 }), x, 0.022, 0.152).rotation.x = Math.PI / 2;
  return { group: g, tray, led, setLcd };
}
export function buildTVCabinet() { // TV_CABINET · 2.1 wide, two open shelves
  const g = new THREE.Group(); g.name = 'TV_CABINET';
  const wood = M('#1d1612', { roughness: 0.75 }), dark = M('#120d0b', { roughness: 0.8 });
  box(g, 2.1, 0.05, 0.55, wood, 0, 0.6, 0);            // top
  box(g, 2.0, 0.035, 0.5, wood, 0, 0.33, 0);           // middle shelf
  box(g, 2.0, 0.04, 0.5, wood, 0, 0.07, 0);            // bottom
  for (const x of [-1.02, 1.02, 0]) box(g, x ? 0.06 : 0.04, 0.6, 0.55, wood, x, 0.32, 0);
  box(g, 2.06, 0.58, 0.02, dark, 0, 0.32, -0.265);     // back panel
  for (const x of [-0.98, 0.98]) for (const z of [-0.23, 0.23]) box(g, 0.06, 0.06, 0.06, dark, x, 0.03, z);
  return g;
}
export function buildTVScreen() { // TV_SCREEN · a black flat screen on a stand; `screen` is the picture plane
  const g = new THREE.Group(); g.name = 'TV_SCREEN';
  const black = M('#07080c', { roughness: 0.35, metalness: 0.3 });
  box(g, 1.66, 0.98, 0.06, black, 0, 0.62, 0);
  const screenMat = new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false });
  const screen = part(g, new THREE.PlaneGeometry(1.56, 0.878), screenMat, 0, 0.625, 0.04); // 1 cm proud of the bezel: any closer and the depth buffer lets the bezel win screen.castShadow = false; screen.name = 'TV_PICTURE';
  box(g, 0.08, 0.14, 0.05, black, 0, 0.08, -0.01);      // neck
  box(g, 0.56, 0.02, 0.26, black, 0, 0.01, 0);          // foot
  box(g, 0.025, 0.012, 0.004, new THREE.MeshBasicMaterial({ color: '#3dff7a' }), 0, 0.15, 0.032); // power light
  return { group: g, screen, screenMat };
}
// The whole entertainment set as it stands in the living room.
export function buildTVSet() {
  const root = new THREE.Group(); root.name = 'RP7D_TV_DVD';
  root.add(buildTVCabinet());
  const tv = buildTVScreen(); tv.group.position.set(0, 0.625, -0.04); root.add(tv.group);
  const player = buildDvdPlayer(); player.group.position.set(0.35, 0.35, 0.02); root.add(player.group);
  const remote = buildDvdRemote(); remote.position.set(0.72, 0.625, 0.12); remote.rotation.y = 0.35; root.add(remote);
  const disc = buildDvdDisc(Object.keys(DVDS)[0]); disc.position.set(0, 0.008, 0.06); disc.visible = false; player.tray.add(disc);
  // a few blank cases on the bottom shelf, for the look of a collection still to come
  for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.19, 0.135), M(['#b8202c', '#1743aa', '#c9b32b', '#2a2f3a', '#7d1c7a', '#1f7941'][i])); c.position.set(-0.85 + i * 0.019, 0.185, 0.02); root.add(c); }
  return { root, screen: tv.screen, screenMat: tv.screenMat, tray: player.tray, trayDisc: disc, setLcd: player.setLcd, led: player.led };
}

// ── the TV ─────────────────────────────────────────────────────────────────────────────────────────
const CSS = `
#game.tv-watching>:not(#world):not(.vignette){visibility:hidden!important}
.tv-ui{position:fixed;inset:0;z-index:215;pointer-events:none;color:#eaf1fb;font:14px/1.45 'DM Sans',system-ui,sans-serif}
.tv-ui>*{pointer-events:auto}
.tv-panel{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(560px,84vw);max-height:76vh;overflow:auto;padding:18px 20px;background:linear-gradient(160deg,#0b1730ee,#060a16f2);border:1px solid #3a6bd0;border-radius:14px;box-shadow:0 18px 50px #000c}
.tv-panel h2{margin:0 0 4px;font:600 15px Cinzel,Georgia,serif;letter-spacing:.24em;color:#e9d39c}
.tv-panel .tv-sub{margin:0 0 12px;font-size:11px;letter-spacing:.14em;color:#9fb4d4;text-transform:uppercase}
.tv-btn{display:flex;align-items:center;gap:12px;width:100%;margin:6px 0;padding:11px 14px;text-align:left;font:inherit;color:inherit;background:#0e1c36;border:1px solid #2b4a80;border-radius:9px;cursor:pointer}
.tv-btn.focus,.tv-btn:hover{border-color:#e9d39c;background:#16305e;box-shadow:0 0 0 1px #e9d39c55}
.tv-btn small{margin-left:auto;font-size:10px;letter-spacing:.14em;color:#9fb4d4;text-transform:uppercase}
.tv-btn img{width:42px;height:59px;border-radius:3px;box-shadow:0 2px 6px #000a}
.tv-btn b{display:block;font-weight:600}.tv-btn i{display:block;font-style:normal;font-size:11px;color:#9fb4d4;letter-spacing:.1em}
.tv-note{margin:10px 0 0;font-size:12px;color:#ffd98a}
.tv-bar{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);width:min(820px,90vw);padding:10px 16px;background:#050a16dd;border:1px solid #2b4a80;border-radius:12px;transition:opacity .4s}
.tv-bar.idle{opacity:0}
.tv-bar .tv-row{display:flex;justify-content:space-between;gap:12px;font-size:12px;letter-spacing:.08em}
.tv-track{position:relative;height:5px;margin:8px 0;background:#1d2b46;border-radius:3px;overflow:hidden}.tv-track span{position:absolute;inset:0 auto 0 0;background:linear-gradient(90deg,#3a8cff,#e9d39c)}
.tv-keys{font-size:10px;letter-spacing:.14em;color:#9fb4d4;text-transform:uppercase}
.tv-sub-line{position:absolute;left:50%;bottom:110px;transform:translateX(-50%);max-width:80vw;padding:4px 12px;font-size:20px;text-align:center;background:#000a;border-radius:6px;text-shadow:0 1px 3px #000}
.tv-sub-line:empty{display:none}
.tv-flash{position:absolute;left:50%;top:14%;transform:translateX(-50%);padding:6px 14px;font-size:12px;letter-spacing:.18em;background:#050a16dd;border:1px solid #2b4a80;border-radius:20px;transition:opacity .4s}
.tv-flash:empty{display:none}
`;

export function createTVSystem({ set, storage, inventory, saveInv, toast, onOpen, onClose }) {
  const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);
  const LOC = storage.LOC;
  let root = null, state = 'closed', focus = 0, video = null, texture = null, idleT = 0, flashT = 0, subIndex = -1, loadStart = 0, saveT = 0, padPrev = [], axisWas = 0, noSrcFrom = 0;
  let progress = {}; try { progress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}') || {}; } catch {}
  const saveProgress = () => { try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); } catch {} };
  inventory.tv ||= { disc: null };
  if (inventory.tv.disc && !DVDS[inventory.tv.disc]) inventory.tv.disc = null;

  // ── where the discs are ──
  const inserted = () => inventory.tv.disc;
  function locate(id) {
    if (inserted() === id) return 'PLAYER';
    if (storage.count(LOC.ZYCUBE, id) > 0) return LOC.ZYCUBE;
    if (storage.count(LOC.HOME_PC, id) > 0) return LOC.HOME_PC;
    return null;
  }
  const library = () => Object.keys(DVDS).filter(locate);
  const owned = id => !!locate(id) || !!inventory.dvdFound?.[id];
  const where = { PLAYER: 'In the player', ZYCUBE: 'Zycube', HOME_PC: 'Home Storage' };

  // ── the picture: a standby card, or the movie ──
  const card = document.createElement('canvas'); card.width = 1024; card.height = 576; const cg = card.getContext('2d');
  const cardTex = new THREE.CanvasTexture(card); cardTex.colorSpace = THREE.SRGBColorSpace;
  function standby(line = '') {
    const gr = cg.createLinearGradient(0, 0, 1024, 576); gr.addColorStop(0, '#0f2a6e'); gr.addColorStop(1, '#040814');
    cg.fillStyle = gr; cg.fillRect(0, 0, 1024, 576);
    cg.fillStyle = '#e9d39c'; cg.font = '600 64px Georgia, serif'; cg.textAlign = 'center'; cg.fillText('RP7D · TV', 512, 260);
    cg.fillStyle = '#9fb4d4'; cg.font = '600 26px sans-serif'; cg.fillText(line || (inserted() ? `DISC · ${DVDS[inserted()].title}` : 'NO DISC'), 512, 320);
    cardTex.needsUpdate = true; set.screenMat.map = cardTex; set.screenMat.color.set('#ffffff'); set.screenMat.needsUpdate = true;
  }
  function screenOff() { set.screenMat.map = null; set.screenMat.color.set('#05070c'); set.screenMat.needsUpdate = true; }
  const syncPlayer = () => { set.trayDisc.visible = false; set.setLcd(inserted() ? 'DISC' : 'RP7D'); };
  screenOff(); syncPlayer();

  // ── the menus ──
  function ui(html) {
    if (!root) return;
    root.innerHTML = html;
    root.querySelectorAll('[data-tv]').forEach((b, i) => { b.onclick = () => { focus = i; act(b.dataset.tv, b.dataset.id); }; b.onmouseenter = () => paint(i); });
    paint(Math.min(focus, buttons().length - 1));
  }
  const buttons = () => [...(root?.querySelectorAll('[data-tv]') || [])];
  function paint(i) { const list = buttons(); focus = Math.max(0, Math.min(i, list.length - 1)); list.forEach((b, k) => b.classList.toggle('focus', k === focus)); list[focus]?.scrollIntoView?.({ block: 'nearest' }); }
  const keysLine = '↑↓ / D-PAD CHOOSE · ENTER / ✕ SELECT · ESC / ○ BACK';
  function home(note = '') {
    state = 'menu'; focus = 0; standby();
    const d = inserted() && DVDS[inserted()];
    ui(`<div class="tv-panel"><h2>TV</h2><p class="tv-sub">${d ? 'Disc in the player · ' + esc(d.title) : 'No disc in the player'}</p>
      ${d ? `<button class="tv-btn" data-tv="play" data-id="${inserted()}">▶ Play the disc<small>${progress[inserted()]?.t > 3 ? 'from ' + fmt(progress[inserted()].t) : ''}</small></button>` : ''}
      <button class="tv-btn" data-tv="shelf">Watch DVD<small>${library().length} disc${library().length === 1 ? '' : 's'}</small></button>
      ${d ? '<button class="tv-btn" data-tv="eject">⏏ Eject disc</button>' : ''}
      <button class="tv-btn" data-tv="exit">Exit TV</button>
      ${note ? `<p class="tv-note">${esc(note)}</p>` : ''}<p class="tv-sub" style="margin-top:12px">${keysLine}</p></div>`);
  }
  function shelf() {
    state = 'shelf'; focus = 0; standby('SELECT A DVD');
    const ids = library();
    ui(`<div class="tv-panel"><h2>WATCH DVD</h2><p class="tv-sub">Discs in the player, the Zycube or Home Storage</p>
      ${ids.length ? ids.map(id => `<button class="tv-btn" data-tv="choose" data-id="${id}"><img src="${coverCanvas(id).toDataURL()}" alt=""><span><b>${esc(DVDS[id].title)}</b><i>${esc(DVDS[id].type)} · ${fmt(DVDS[id].duration)}</i></span><small>${where[locate(id)]}</small></button>`).join('')
        : '<p class="tv-note">No DVDs yet. Discs are collectibles: find them and they will show up here, from the Zycube or Home Storage.</p>'}
      <button class="tv-btn" data-tv="home">Back</button><p class="tv-sub" style="margin-top:12px">${keysLine}</p></div>`);
  }
  function choose(id) {
    const t = progress[id]?.t || 0, resume = t > 3 && t < (DVDS[id].duration || 1e9) - 3;
    if (!resume) return insertAndPlay(id, 0);
    state = 'choose'; focus = 0;
    ui(`<div class="tv-panel"><h2>${esc(DVDS[id].title)}</h2><p class="tv-sub">${esc(DVDS[id].type)}</p><p>${esc(DVDS[id].blurb || '')}</p>
      <button class="tv-btn" data-tv="resume" data-id="${id}">▶ Resume<small>from ${fmt(t)}</small></button>
      <button class="tv-btn" data-tv="restart" data-id="${id}">↺ Play from the start</button>
      <button class="tv-btn" data-tv="shelf">Back</button></div>`);
  }

  // ── INSERT_DISC / EJECT_DISC: one authoritative place, always ──
  function eject({ quiet = false } = {}) {
    const id = inserted(); if (!id) return true;
    stopVideo();
    const to = storage.canStore(LOC.ZYCUBE, id, 1).ok ? LOC.ZYCUBE : LOC.HOME_PC;
    const r = storage.add(to, id, 1);
    if (!r.ok) { toast?.(r.message || 'Nowhere to put the disc'); return false; }
    inventory.tv.disc = null; saveInv(); syncPlayer(); trayAnim(false);
    if (!quiet) toast?.(`${DVDS[id].title} · ejected to ${to === LOC.ZYCUBE ? 'the Zycube' : 'Home Storage'}`);
    return true;
  }
  function insert(id) {
    if (inserted() === id) return true;
    if (inserted() && !eject({ quiet: true })) return false;
    const from = locate(id); if (!from || from === 'PLAYER') return false;
    const r = storage.remove(from, id, 1);
    if (!r.ok) { toast?.(r.message || 'That disc can\'t be moved right now'); return false; }
    inventory.tv.disc = id; saveInv(); syncPlayer(); trayAnim(true);
    return true;
  }
  let tray = null; // tray slide: { open, k }
  function trayAnim(load) { tray = { load, k: 0 }; set.trayDisc.visible = true; }

  // ── PLAY_VIDEO · PAUSE_VIDEO · SEEK_VIDEO · STOP_VIDEO ──
  function insertAndPlay(id, from) {
    if (!insert(id)) return home('That disc could not be put in the player.');
    const d = DVDS[id];
    state = 'loading'; loadStart = performance.now(); noSrcFrom = 0; subIndex = -1;
    standby('LOADING…');
    video = document.createElement('video'); video.playsInline = true; video.preload = 'auto'; video.style.display = 'none';
    for (const src of d.video || []) { const s = document.createElement('source'); s.src = src; video.appendChild(s); }
    for (const t of d.subtitles || []) { const tr = document.createElement('track'); tr.kind = 'subtitles'; tr.label = t.label; tr.srclang = t.lang || 'en'; tr.src = t.src; video.appendChild(tr); }
    document.body.appendChild(video);
    video.addEventListener('loadeddata', () => {
      if (state !== 'loading' || !video) return;
      if (from > 0 && from < (video.duration || 1e9) - 1) video.currentTime = from;
      texture = new THREE.VideoTexture(video); texture.colorSpace = THREE.SRGBColorSpace;
      set.screenMat.map = texture; set.screenMat.color.set('#ffffff'); set.screenMat.needsUpdate = true;
      state = 'playing'; drawBar(); flash(from > 3 ? `RESUMED AT ${fmt(from)}` : d.title.toUpperCase());
      video.play().catch(() => { video.muted = true; video.play().catch(() => {}); flash('PRESS ANY KEY FOR SOUND'); });
    });
    video.addEventListener('ended', () => { if (!video) return; progress[id] = { t: 0, at: Date.now() }; saveProgress(); stopVideo(); home('The disc finished. It stays in the player until you eject it.'); });
    for (const tt of video.textTracks || []) tt.mode = 'hidden';
    ui('');
  }
  function failed(why) {
    const id = inserted(), d = DVDS[id];
    stopVideo(); state = 'error'; focus = 0; standby('DISC ERROR');
    ui(`<div class="tv-panel"><h2>CAN'T READ THIS DISC</h2><p class="tv-sub">${esc(d?.title || '')}</p>
      <p>${esc(why)}</p><p class="tv-note">Looked for: ${esc((d?.video || []).join(' · ') || 'no video listed')}</p>
      <button class="tv-btn" data-tv="eject">⏏ Eject disc</button><button class="tv-btn" data-tv="home">Back</button></div>`);
  }
  function stopVideo() {
    if (!video) return;
    const id = inserted();
    if (id && state !== 'error' && video.currentTime > 0) { progress[id] = { t: video.currentTime, at: Date.now() }; saveProgress(); }
    video.pause(); video.removeAttribute('src'); while (video.firstChild) video.firstChild.remove(); video.load(); video.remove(); video = null;
    texture?.dispose(); texture = null; standby();
  }
  function togglePause() {
    if (!video) return;
    if (state === 'playing') { video.pause(); state = 'paused'; progress[inserted()] = { t: video.currentTime, at: Date.now() }; saveProgress(); }
    else if (state === 'paused') { video.muted = false; video.play().catch(() => {}); state = 'playing'; }
    drawBar(true);
  }
  function seek(s) { if (!video) return; video.currentTime = Math.max(0, Math.min((video.duration || 0) - 0.2, video.currentTime + s)); flash(`${s > 0 ? '»' : '«'} ${fmt(video.currentTime)}`); drawBar(true); }
  function cycleSubs() {
    const tracks = [...(video?.textTracks || [])];
    if (!tracks.length) return flash('NO SUBTITLES ON THIS DISC');
    subIndex = subIndex + 1 >= tracks.length ? -1 : subIndex + 1;
    tracks.forEach((t, i) => { t.mode = 'hidden'; t.oncuechange = i === subIndex ? () => { const el = root?.querySelector('.tv-sub-line'); if (el) el.textContent = [...(t.activeCues || [])].map(c => c.text).join('\n'); } : null; });
    const el = root?.querySelector('.tv-sub-line'); if (el) el.textContent = '';
    flash(subIndex < 0 ? 'SUBTITLES OFF' : `SUBTITLES · ${tracks[subIndex].label || tracks[subIndex].language}`);
  }
  function flash(text) { flashT = 2.2; const el = root?.querySelector('.tv-flash'); if (el) { el.textContent = text; el.style.opacity = 1; } }
  function drawBar(wake = false) {
    if (!root || !video || (state !== 'playing' && state !== 'paused')) return;
    if (!root.querySelector('.tv-bar')) {
      root.innerHTML = `<div class="tv-flash"></div><div class="tv-sub-line"></div><div class="tv-bar"><div class="tv-row"><b data-tv-title></b><span data-tv-time></span></div><div class="tv-track"><span data-tv-fill></span></div>
        <div class="tv-row tv-keys"><span>SPACE / ✕ PAUSE · ←→ / L1 R1 SEEK ${SEEK}s · C / △ SUBTITLES</span><span>E / □ EJECT · ESC / ○ STOP</span></div></div>`;
    }
    const d = DVDS[inserted()] || {}, dur = video.duration || d.duration || 0;
    root.querySelector('[data-tv-title]').textContent = `${state === 'paused' ? '❚❚ PAUSED · ' : '▶ '}${d.title || ''}`;
    root.querySelector('[data-tv-time]').textContent = `${fmt(video.currentTime)} / ${fmt(dur)}`;
    root.querySelector('[data-tv-fill]').style.width = `${dur ? (video.currentTime / dur) * 100 : 0}%`;
    if (wake) idleT = 0;
    root.querySelector('.tv-bar').classList.toggle('idle', state === 'playing' && idleT > 3);
  }

  // ── the controls ──
  function act(kind, id) {
    if (kind === 'home') return home();
    if (kind === 'shelf') return shelf();
    if (kind === 'choose') return choose(id);
    if (kind === 'play') return choose(id);
    if (kind === 'resume') return insertAndPlay(id, progress[id]?.t || 0);
    if (kind === 'restart') return insertAndPlay(id, 0);
    if (kind === 'eject') { eject(); return home(); }
    if (kind === 'exit') return close();
  }
  function back() {
    if (state === 'playing' || state === 'paused') { stopVideo(); return home(); }
    if (state === 'shelf' || state === 'choose' || state === 'error') return home();
    if (state === 'loading') { stopVideo(); return home(); }
    close();
  }
  function command(c) { // keyboard codes and pad buttons both land here
    idleT = 0;
    if (state === 'playing' || state === 'paused') {
      if (video?.muted && state === 'playing') video.muted = false; // a key press is the gesture sound needed
      if (c === 'select') return togglePause();
      if (c === 'left') return seek(-SEEK);
      if (c === 'right') return seek(SEEK);
      if (c === 'subs') return cycleSubs();
      if (c === 'eject') { eject(); return home(); }
      if (c === 'back') return back();
      return drawBar(true);
    }
    if (state === 'loading') { if (c === 'back') back(); return; }
    if (c === 'up' || c === 'left') return paint(focus - 1);
    if (c === 'down' || c === 'right') return paint(focus + 1);
    if (c === 'select') return buttons()[focus]?.click();
    if (c === 'back') return back();
    if (c === 'eject' && inserted()) { eject(); return home(); }
  }
  const KEYMAP = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', Enter: 'select', Space: 'select', Escape: 'back', Backspace: 'back', KeyE: 'eject', KeyC: 'subs' };
  function key(e) { if (!root || e.repeat) return; const c = KEYMAP[e.code]; if (c) command(c); }
  const PADMAP = { 0: 'select', 1: 'back', 2: 'eject', 3: 'subs', 12: 'up', 13: 'down', 14: 'left', 15: 'right', 4: 'left', 5: 'right' };
  function update(dt) {
    if (!root) return;
    const pad = [...(navigator.getGamepads?.() || [])].find(Boolean);
    if (pad) {
      for (const [i, c] of Object.entries(PADMAP)) if (pad.buttons[i]?.pressed && !padPrev[i]) command(c);
      const y = pad.axes[1] || 0, x = pad.axes[0] || 0, dir = Math.abs(y) > 0.6 ? (y > 0 ? 'down' : 'up') : Math.abs(x) > 0.6 ? (x > 0 ? 'right' : 'left') : 0;
      if (dir && dir !== axisWas && state !== 'playing' && state !== 'paused') command(dir);
      axisWas = dir; padPrev = pad.buttons.map(b => b.pressed);
    }
    if (tray) { // INSERT / EJECT: the tray slides out, the disc sits on it, the tray slides back
      tray.k = Math.min(1, tray.k + dt / 0.9); const out = Math.sin(tray.k * Math.PI) * 0.17;
      set.tray.position.z = out; set.trayDisc.visible = tray.k < 0.5 ? !tray.load : tray.load && tray.k < 1;
      if (tray.k >= 1) { tray = null; set.tray.position.z = 0; set.trayDisc.visible = false; }
    }
    if (state === 'loading' && video) { // a missing file must say so, never hang or break the game
      if (video.error) failed('The video file on this disc could not be played (it may be missing or in a format this browser can\'t read).');
      else if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) { noSrcFrom ||= performance.now(); if (performance.now() - noSrcFrom > 1500) failed('The video file for this disc was not found.'); }
      else noSrcFrom = 0;
      if (state === 'loading' && performance.now() - loadStart > 15000) failed('The disc took too long to load.');
    }
    if (state === 'playing' || state === 'paused') {
      idleT += dt; saveT += dt;
      if (saveT > 2 && state === 'playing') { saveT = 0; progress[inserted()] = { t: video.currentTime, at: Date.now() }; saveProgress(); }
      drawBar();
    }
    if (flashT > 0) { flashT -= dt; if (flashT <= 0) { const el = root?.querySelector('.tv-flash'); if (el) el.textContent = ''; } }
  }

  // ── USE_TV / EXIT_TV ──
  function open() {
    if (root) return;
    root = document.createElement('div'); root.className = 'tv-ui'; root.setAttribute('aria-label', 'TV');
    document.body.appendChild(root); padPrev = [...(navigator.getGamepads?.() || [])].find(Boolean)?.buttons.map(b => b.pressed) || [];
    onOpen?.(); home();
  }
  function close() {
    if (!root) return;
    if (video) stopVideo();
    screenOff(); root.remove(); root = null; state = 'closed';
    onClose?.();
  }
  // Where the camera sits to watch: square on to the picture, far enough back for it to fill most of the view.
  function view(fov = 55) {
    set.screen.updateMatrixWorld(true);
    const screen = set.screen.getWorldPosition(new THREE.Vector3()), normal = new THREE.Vector3(0, 0, 1).transformDirection(set.screen.matrixWorld);
    const d = (0.878 / 2) / Math.tan(THREE.MathUtils.degToRad(fov) / 2) / 0.78;
    return { screen, eye: screen.clone().addScaledVector(normal, d) };
  }
  // COLLECT: a disc found in the world goes to the Zycube (or Home Storage if the Zycube is full).
  function collect(id) {
    if (!DVDS[id] || owned(id)) return false;
    const to = storage.canStore(LOC.ZYCUBE, id, 1).ok ? LOC.ZYCUBE : LOC.HOME_PC;
    const r = storage.add(to, id, 1); if (!r.ok) { toast?.(r.message || 'No room for the disc'); return false; }
    (inventory.dvdFound ||= {})[id] = 1; saveInv();
    toast?.(`DVD · ${DVDS[id].title} → ${to === LOC.ZYCUBE ? 'Zycube' : 'Home Storage'} · watch it on the TV downstairs`, 4200);
    return true;
  }
  return { open, close, key, update, view, collect, owned, locate, insert, eject, get isOpen() { return !!root; }, get state() { return state; }, get disc() { return inserted(); }, get video() { return video; } };
}
