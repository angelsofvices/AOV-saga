// RP7D · Nebuladock 3000 audio: small synthesized tones (startup, select, transfer, error) and a quiet ZyLink hum while in use.
// It owns its own AudioContext, so it never touches the game's sound bank; setMuted() follows the game's mute.
let ctx = null, hum = null, muted = false;
const ac = () => {
  if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
};
function tone(freq, dur, { type = 'sine', vol = 0.05, at = 0, to = 0 } = {}) {
  if (muted) return; const c = ac(); if (!c) return;
  const t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
}
function ambience(on) {
  const c = ac();
  if (!on) { if (hum) { const h = hum; hum = null; try { h.g.gain.setTargetAtTime(0, c.currentTime, 0.12); setTimeout(() => { try { h.a.stop(); h.b.stop(); } catch (e) {} }, 600); } catch (e) {} } return; }
  if (hum || !c) return;
  const a = c.createOscillator(), b = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
  a.type = 'sine'; a.frequency.value = 58; b.type = 'triangle'; b.frequency.value = 87.5; f.type = 'lowpass'; f.frequency.value = 260;
  g.gain.value = 0; g.gain.setTargetAtTime(muted ? 0 : 0.014, c.currentTime, 0.5);
  a.connect(f); b.connect(f); f.connect(g).connect(c.destination); a.start(); b.start(); hum = { a, b, g };
}
export const nebulaAudio = {
  setMuted(m) { muted = !!m; if (hum && ctx) hum.g.gain.setTargetAtTime(muted ? 0 : 0.014, ctx.currentTime, 0.1); },
  startup() { tone(220, 0.35, { type: 'triangle', vol: 0.05, to: 440 }); tone(440, 0.4, { vol: 0.04, at: 0.18, to: 660 }); tone(880, 0.5, { vol: 0.025, at: 0.34 }); },
  select() { tone(1180, 0.05, { type: 'square', vol: 0.012 }); },
  transfer() { tone(520, 0.1, { type: 'triangle', vol: 0.05 }); tone(780, 0.16, { type: 'triangle', vol: 0.05, at: 0.08 }); },
  error() { tone(150, 0.26, { type: 'sawtooth', vol: 0.045, to: 95 }); },
  ambience
};
