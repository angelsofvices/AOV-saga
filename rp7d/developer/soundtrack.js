// The entire supplied draft music pack plays in sequence, then loops.
// onChange receives { volume, muted, playing, blocked, error, status }.
// Pair a labelled range input (0–100) with setVolume(value / 100), and a
// button with aria-pressed=state.muted with setMuted(!getState().muted).
const STORAGE_KEY = 'rp7d.soundtrack.v1';
const DEFAULT_VOLUME = 0.16;
const DEFAULT_SOURCE = './assets/audio/fantasy-magical-draft.mp3';

export function createSoundtrack({ onChange, source, volume = DEFAULT_VOLUME } = {}) {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; } catch {}
  const clamp = value => Math.max(0, Math.min(1, value));
  let level = typeof saved.volume === 'number' && Number.isFinite(saved.volume)
    ? clamp(saved.volume) : clamp(Number.isFinite(volume) ? volume : DEFAULT_VOLUME);
  let muted = saved.muted === true;
  let requested = false, blocked = false, error = '', destroyed = false, hostPaused = false;
  let pending = null, requestID = 0;
  const audio = new Audio(source || window.__RP7D_SOUNDTRACK_SRC || DEFAULT_SOURCE);
  audio.loop = true;
  audio.preload = 'metadata';
  let duckK = 1; // a temporary dip under other music (the guitar solo); never saved
  audio.volume = level;
  audio.muted = muted;

  function getState() {
    const playing = !audio.paused && !audio.ended && !error;
    return {
      volume: level, muted, playing, blocked, error,
      status: error ? 'error' : muted || level === 0 ? 'muted' :
        blocked ? 'waiting' : playing ? 'playing' : 'ready'
    };
  }
  function notify() { if (!destroyed) onChange?.(getState()); }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ volume: level, muted })); } catch {}
  }

  // A second play() call inside the actual gesture is intentional: it keeps
  // transient browser activation even if the initial autoplay request is pending.
  function attempt(force = false) {
    if (hostPaused || destroyed || muted || !requested) return Promise.resolve(false);
    if (!audio.paused && !blocked) return Promise.resolve(true);
    if (pending && !force) return pending;
    const id = ++requestID;
    let result;
    try { result = audio.play(); } catch (cause) { result = Promise.reject(cause); }
    pending = Promise.resolve(result).then(() => {
      if (destroyed || id !== requestID) return false;
      blocked = false;
      error = '';
      notify();
      return true;
    }).catch(cause => {
      if (destroyed || id !== requestID) return false;
      if (cause?.name === 'NotAllowedError') {
        blocked = true;
        error = '';
      } else if (cause?.name !== 'AbortError') {
        error = 'Music could not load. Keep the audio folder beside the game.';
      }
      notify();
      return false;
    }).finally(() => { if (id === requestID) pending = null; });
    return pending;
  }
  function start() { requested = true; return attempt(); }
  function unlock() { requested = true; return attempt(true); }
  function onGesture(event) {
    if (event.isTrusted && requested && !muted && (audio.paused || blocked)) attempt(true);
  }
  const gestures = ['pointerdown', 'pointerup', 'touchend', 'keydown'];
  for (const name of gestures) document.addEventListener(name, onGesture, { capture: true, passive: true });

  function onPlaying() { blocked = false; error = ''; notify(); }
  function onError() {
    error = 'Music could not load. Keep the audio folder beside the game.';
    notify();
  }
  audio.addEventListener('playing', onPlaying);
  audio.addEventListener('pause', notify);
  audio.addEventListener('error', onError);

  function setVolume(value) {
    const next = Number(value);
    if (!Number.isFinite(next) || destroyed) return;
    level = clamp(next);
    audio.volume = level * duckK;
    save();
    notify();
    if (requested && !muted) attempt(true);
  }
  function setMuted(value) {
    if (destroyed) return;
    muted = Boolean(value);
    audio.muted = muted;
    save();
    notify();
    if (!muted && requested) attempt(true);
  }
  function destroy() {
    destroyed = true;
    requestID++;
    for (const name of gestures) document.removeEventListener(name, onGesture, true);
    audio.removeEventListener('playing', onPlaying);
    audio.removeEventListener('pause', notify);
    audio.removeEventListener('error', onError);
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
  }

  notify();
  function duck(k = 1) { duckK = clamp(k); audio.volume = level * duckK; }
  function setHostPaused(value) { hostPaused = !!value; if (hostPaused) { ++requestID; pending = null; audio.pause(); } else attempt(true); }
  return { setHostPaused, start, unlock, setVolume, setMuted, getState, destroy, duck };
}
