// Real time status, independent from slowed enemy simulation clocks.
export function frostContact(state, round) {
  if (state.frozen || state.finished) return;
  const hits = state.rounds ||= {};
  hits[round] = Math.min(3, (hits[round] || 0) + 1);
  state.rate = Math.max(state.rate || 0, 1 / ({ 1: 9, 2: 6, 3: 3 }[hits[round]]));
  const keys = Object.keys(hits); if (keys.length > 16) delete hits[keys[0]];
}
export function frostStep(state, dt) {
  if (state.finished) return 'done';
  if (state.frozen) {
    state.remaining -= dt;
    if (state.remaining <= 0) { state.finished = true; return 'thaw'; }
  } else {
    state.progress = Math.min(1, (state.progress || 0) + dt * (state.rate || 0));
    if (state.progress >= 1 - 1e-8) { state.progress = 1; state.frozen = true; state.remaining = 7; return 'freeze'; }
  }
  state.slow = state.frozen ? 0 : 1 - (state.progress || 0) * 0.75;
  return null;
}
// Rounds improve the buildup rate only when more beams in that round actually
// connect. Repeated single hits never stack rates or restart buildup/freeze timers.
