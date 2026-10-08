// RP7D · rearranging Rizer's home. Lock on to a piece (R / R3), press ■ (J / Square) to grab it, drag it with the stick,
// press ■ again to set it down. Three clips chain: pull start → pull moving (loops while he walks) → pull stop.
// Only the interior of Rizer's own home is editable. Layouts persist (home-interior.js · localStorage).
//   ○ / E while carrying: put it back where it was.   R again: let go of the lock.
export function createFurnitureMover({ interior, rizer, toast, prompt }) {
  let state = 'idle'; // idle · locked · walk · start · moving · stop
  let lock = null, grab = null, wait = 0;
  const F = interior.furn, snap = v => Math.round(v / F.SNAP) * F.SNAP;
  const A = () => rizer.actor;
  const say = (name, h) => prompt(name, h);
  function release() { if (lock) { F.show(null); lock = null; } state = 'idle'; }
  function finish() { rizer.pulling = null; if (lock) { F.setMoving(lock, false); F.show(lock, true); } grab = null; state = lock ? 'locked' : 'idle'; }
  function abort() {
    if (lock && grab) { F.apply(lock, grab.dx0, grab.dz0); F.setMoving(lock, false); }
    rizer.pulling = null; A()?.release?.(); grab = null; state = lock ? 'locked' : 'idle'; if (lock) F.show(lock, true);
  }
  function begin() {
    const p = lock, pos = rizer.position;
    const ex = pos.x - p.cx, ez = pos.z - p.cz, L = Math.hypot(ex, ez) || 1;
    // the spot he pulls from: just outside the piece's footprint, on the side he is already on
    const k = Math.min(Math.abs(p.hw / (Math.abs(ex / L) || 1e-3)), Math.abs(p.hd / (Math.abs(ez / L) || 1e-3))) + 0.95;
    const spot = { x: p.cx + ex / L * k, z: p.cz + ez / L * k }, face = Math.atan2(p.cx - spot.x, p.cz - spot.z);
    grab = { dx0: p.dx, dz0: p.dz, face, rel: null };
    state = 'walk'; wait = 0; grab.ready = false;
    rizer.walkTo(spot, face, () => { grab.ready = true; });
  }
  function startPull() {
    const p = lock, pos = rizer.position;
    grab.rel = { x: p.cx - pos.x, z: p.cz - pos.z };
    grab.face = Math.atan2(grab.rel.x, grab.rel.z);
    rizer.pulling = { face: grab.face, speed: 1.35 };
    F.setMoving(p, true); state = 'start';
    if (!A()?.play('pullStart', 1)) state = 'moving'; // no clips loaded: still works, just without the animation
  }
  // io: { active, lock, square, cancel } · mutates inp so Rizer stands still during the start / stop clips
  function update(dt, inp, io) {
    const act = A();
    if (!io.active || !act || rizer.hp <= 0) { if (state === 'walk' || state === 'start' || state === 'moving' || state === 'stop') abort(); if (!io.active && lock) release(); return; }
    if (state === 'idle' || state === 'locked') {
      if (lock && (lock.level !== F.level || F.distance(lock, rizer.position) > 7.5)) release();
      if (io.lock) {
        if (lock) { release(); toast('Released'); }
        else { const c = F.focus(rizer.position, rizer.facing, 5); if (c) { lock = c; state = 'locked'; F.show(c, true); toast(`LOCKED · ${c.name} · ■ to move it`); } else toast('Nothing to move nearby'); }
      }
      if (lock && io.square) begin();
      else if (lock) say(lock.name, ' ■ / J · move it · R · let go');
      else say(null);
      return;
    }
    if (state === 'walk') {
      inp.jumpPressed = false; inp.dodgePressed = false;
      if (io.cancel) { abort(); return; }
      wait += dt;
      if (grab.ready) startPull();
      else if (!rizer.auto && wait > 0.4) abort(); // the walk-up was interrupted (the player took over)
      return;
    }
    // From here Rizer is dragging (or starting / stopping): no jumps, rolls, runs or weapons
    inp.jumpPressed = inp.jumpHeld = inp.dodgePressed = false; inp.run = false;
    if (state === 'start') {
      inp.x = inp.z = 0;
      if (!act.shot || act.shot.kind !== 'pullStart') { state = 'moving'; act.play('pullMove', 1, { loop: true }); }
      return;
    }
    if (state === 'stop') {
      inp.x = inp.z = 0;
      if (!act.shot || act.shot.kind !== 'pullStop') finish();
      return;
    }
    // moving
    const p = lock, pos = rizer.position;
    const dx = snap(pos.x + grab.rel.x - p.fx), dz = snap(pos.z + grab.rel.z - p.fz), chk = F.check(p, dx, dz);
    F.apply(p, dx, dz); F.show(p, chk.ok);
    if (act.shot?.kind !== 'pullMove') act.play('pullMove', 1, { loop: true });
    if (act.shot?.kind === 'pullMove') act.shot.speed = Math.hypot(rizer.vel.x, rizer.vel.z) > 0.15 ? 1 : 0; // plants his feet when he stops
    say(p.name, chk.ok ? ' ■ / J · set it down · ○ / E · put it back' : ' ✕ ' + chk.why);
    if (io.cancel) { F.apply(p, grab.dx0, grab.dz0); F.setMoving(p, false); act.play('pullStop', 1); toast('Put back'); state = 'stop'; return; }
    if (io.square) {
      if (!chk.ok) { toast(chk.why); return; }
      F.setMoving(p, false); F.save(); act.play('pullStop', 1); toast(`${p.name} placed`); state = 'stop';
    }
  }
  return { update, release, abort, get state() { return state; }, get busy() { return state === 'walk' || state === 'start' || state === 'moving' || state === 'stop'; }, get locked() { return !!lock; } };
}
