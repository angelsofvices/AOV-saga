// RP7D · seating: the reusable INTERACTIVE_SEAT controller (first user: Rizer's Nebuladock chair).
//
// A seat is authored with anchors (home-interior.js · seat.anchors()):
//   approach  where he stands to sit  (in front of the chair, back to it)
//   seat      the pelvis point on the chair; the chair rolls from `rest` to `keys` along one authored line
//   exit      where he stands up (the approach point again, so nothing drifts)
// Animation uses the universal chair slots (chairSit · chairStand · chairToType · chairFromType · chairTyping); the seated
// pose is the last frame of chairSit. The clips are in place, so this controller supplies the root motion that matches
// the pelvis travel in each clip (feet stay planted). Phases:
//   walk → sit → seated ⇄ (roll) → toType → typing → fromType → seated → (rollback) → standup → done
// The seat knows nothing about storage or the PC screen: it only calls onType() when the typing pose is reached,
// and the owner calls pcClosed() when the screen closes.
const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

export function createSeating({ interior, rizer, onType = () => {}, toast = () => {} }) {
  let S = null;
  const act = () => rizer.actor;
  const dur = k => act()?.acts?.[k]?.getClip().duration || 1;
  const trav = (k, d) => (act()?.meta?.[k]?.travel || d) * (act()?.scale || 1.25); // pelvis travel of a clip, in the world
  const anchors = () => interior.seat.anchors();
  const play = (k, opts) => act()?.play(k, 1, opts);
  const seatedPose = () => play('chairSit', { hold: true, from: Math.max(0, dur('chairSit') - 0.03) }); // the last frame, held
  const place = (x, z) => { const p = rizer.position; p.x = x; p.z = z; rizer.facing = Math.PI; };

  function begin() {
    if (S || !interior.seat || rizer.hp <= 0) return false;
    const a = anchors(), T = trav('chairSit', 0.46), ap = { x: a.x, z: a.z0 - T }, p = rizer.position;
    S = { phase: 'walk', arrived: false, ap, roll: 0, t: 0 };
    if (Math.hypot(p.x - ap.x, p.z - ap.z) < 0.25) { S.arrived = true; rizer.facing = Math.PI; }
    else if (!rizer.walkTo(ap, Math.PI, () => { if (S) S.arrived = true; }, { around: { x: a.x, z: a.z0, r: 0.45 }, pass: { x: ap.x, z: ap.z, r: 1.6 } })) { S = null; return false; }
    return true;
  }
  function startSit() {
    const p = rizer.position; S.phase = 'sit'; S.t = 0; S.d = dur('chairSit'); S.from = { x: p.x, z: p.z }; S.roll = 0;
    rizer.sit = {}; rizer.facing = Math.PI; interior.seat.setRoll(0); play('chairSit', { hold: true });
  }
  function finish() { rizer.sit = null; act()?.release(); S = null; }

  function update(dt, inp = {}) {
    if (!S) return;
    if (rizer.hp <= 0) return abort();
    const a = anchors(), p = rizer.position, d = Math.max(dt, 0);
    switch (S.phase) {
      case 'walk':
        if (S.arrived) startSit();
        else if (!rizer.auto) { if (Math.hypot(p.x - S.ap.x, p.z - S.ap.z) < 0.5) startSit(); else S = null; } // he took over: cancelled
        break;
      case 'sit': { // pelvis moves back onto the chair as the clip drops him into it
        S.t += d; const k = sm(0, 0.92, S.t / S.d);
        place(S.from.x + (a.x - S.from.x) * k, S.from.z + (a.z0 - S.from.z) * k);
        if (S.t >= S.d) { place(a.x, a.z0); S.phase = 'seated'; seatedPose(); }
        break;
      }
      case 'seated': {
        place(a.x, a.z0 + (a.z1 - a.z0) * S.roll);
        if (S.roll < 1) { S.roll = Math.min(1, S.roll + d * 1.25); interior.seat.setRoll(S.roll); place(a.x, a.z0 + (a.z1 - a.z0) * S.roll); } // the chair settles in at the desk by itself: no rolling by hand
        if (inp.interact) S.phase = 'rollback'; // ○: stand (the chair eases back out first)
        else if (inp.square && S.roll >= 0.97) { S.phase = 'toType'; S.t = 0; S.d = dur('chairToType'); play('chairToType'); } // □: the PC
        break;
      }
      case 'rollback': // slide back to the open end of the line, then stand
        S.roll = Math.max(0, S.roll - d * 1.7); interior.seat.setRoll(S.roll); place(a.x, a.z0 + (a.z1 - a.z0) * S.roll);
        if (S.roll <= 0) { S.phase = 'standup'; S.t = 0; S.d = dur('chairStand'); S.Ts = trav('chairStand', 0.46); play('chairStand'); }
        break;
      case 'standup': { // pelvis comes forward off the chair to the exit anchor
        S.t += d; const k = sm(0.08, 1, S.t / S.d);
        place(a.x, a.z0 - S.Ts * k);
        if (S.t >= S.d) { place(a.x, a.z0 - trav('chairSit', 0.46)); finish(); } // exactly the approach point: no drift between uses
        break;
      }
      case 'toType':
        place(a.x, a.z1); S.t += d;
        if (S.t >= S.d) { S.phase = 'typing'; play('chairTyping', { loop: true }); onType(); }
        break;
      case 'typing': place(a.x, a.z1); break;
      case 'fromType':
        place(a.x, a.z1); S.t += d;
        if (S.t >= S.d) { S.phase = 'seated'; seatedPose(); }
        break;
    }
  }
  // The PC screen closed: lean back, then he is simply seated at the keyboard again.
  function pcClosed() { if (S?.phase === 'typing' || S?.phase === 'toType') { S.phase = 'fromType'; S.t = 0; S.d = dur('chairFromType'); play('chairFromType'); } }
  function abort() { if (!S) return; interior.seat.setRoll(0); finish(); }
  function prompt() {
    if (!S) return null;
    if (S.phase === 'seated') return S.roll >= 0.97 ? ['NEBULADOCK 3000', 'PC · □ / J   ·   STAND · ○ / E'] : null;
    return null;
  }
  return { begin, update, pcClosed, abort, prompt, get active() { return !!S; }, get phase() { return S?.phase || null; }, get roll() { return S?.roll || 0; } };
}
