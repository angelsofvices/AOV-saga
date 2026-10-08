// An opaque-origin iframe owns the guest runtime. Only this small, token-scoped bridge crosses it.
function guestBootstrap(config) {
  const { token, initialSave, audio: audioProfile } = config;
  const send = (type, payload = {}) => parent.postMessage({ n3000: token, type, ...payload }, '*');
  const native = { now: performance.now.bind(performance), raf: requestAnimationFrame.bind(window), timeout: setTimeout.bind(window), clear: clearTimeout.bind(window) };
  let paused = false, pauseAt = 0, pausedTime = 0, pads = [], profile = audioProfile;
  const now = () => native.now() - pausedTime - (paused ? native.now() - pauseAt : 0);
  Object.defineProperty(performance, 'now', { value: now });
  const rafs = new Map(), timers = new Map(); let serial = 0;
  window.requestAnimationFrame = fn => { const id = ++serial; rafs.set(id, fn); return id; };
  window.cancelAnimationFrame = id => rafs.delete(id);
  function pump() { if (!paused) { const jobs = [...rafs]; rafs.clear(); for (const [, fn] of jobs) { try { fn(now()); } catch (e) { send('ERROR', { message: String(e.message || e) }); } } } native.raf(pump); }
  native.raf(pump);
  function arm(id) { const t = timers.get(id); if (!t || paused) return; t.due = native.now() + t.left; t.nativeId = native.timeout(() => { if (paused || !timers.has(id)) return; if (!t.interval) timers.delete(id); try { typeof t.fn === 'function' ? t.fn(...t.args) : (0, eval)(t.fn); } finally { if (t.interval && timers.has(id)) { t.left = t.delay; arm(id); } } }, t.left); }
  function timer(fn, delay, args, interval) { const id = ++serial, d = Math.max(interval ? 4 : 0, Number(delay) || 0); timers.set(id, { fn, delay: d, left: d, args, interval }); arm(id); return id; }
  window.setTimeout = (fn, d, ...args) => timer(fn, d, args, false);
  window.setInterval = (fn, d, ...args) => timer(fn, d, args, true);
  window.clearTimeout = window.clearInterval = id => { native.clear(timers.get(id)?.nativeId); timers.delete(id); };
  const storageData = Object.assign(Object.create(null), initialSave);
  function storage(data, persist) { const api = { getItem: k => Object.hasOwn(data, String(k)) ? data[String(k)] : null, setItem(k, v) { data[String(k)] = String(v); if (persist) send('SAVE', { data: { ...data } }); }, removeItem(k) { delete data[String(k)]; if (persist) send('SAVE', { data: { ...data } }); }, clear() { for (const k of Object.keys(data)) delete data[k]; if (persist) send('SAVE', { data: { ...data } }); }, key: i => Object.keys(data)[i] ?? null, get length() { return Object.keys(data).length; } }; return new Proxy(api, { get: (obj, k) => k in obj ? Reflect.get(obj, k) : data[k], set: (obj,k,v) => { obj.setItem(k,v); return true; }, deleteProperty: (obj,k) => { obj.removeItem(k); return true; }, ownKeys: () => Object.keys(data), getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }) }); }
  Object.defineProperty(window, 'localStorage', { value: storage(storageData, true) });
  Object.defineProperty(window, 'sessionStorage', { value: storage(Object.create(null), false) });
  Object.defineProperty(navigator, 'getGamepads', { value: () => paused ? [] : pads });
  const media = new Map(), resumeMedia = new Set(), proto = HTMLMediaElement.prototype;
  const vol = Object.getOwnPropertyDescriptor(proto, 'volume'), mute = Object.getOwnPropertyDescriptor(proto, 'muted'), play = proto.play;
  function record(a) { if (!media.has(a)) media.set(a, { volume: vol.get.call(a), muted: mute.get.call(a) }); return media.get(a); }
  function apply(a) { const m = record(a), kind = a.loop || a.id === 'rp1-bgm' ? profile.music : profile.sfx; vol.set.call(a, Math.max(0, Math.min(1, m.volume * kind.volume))); mute.set.call(a, m.muted || kind.muted); }
  Object.defineProperty(proto, 'volume', { configurable: true, get() { return record(this).volume; }, set(v) { record(this).volume = Math.max(0, Math.min(1, Number(v))); apply(this); } });
  Object.defineProperty(proto, 'muted', { configurable: true, get() { return record(this).muted; }, set(v) { record(this).muted = !!v; apply(this); } });
  proto.play = function() { record(this); apply(this); if (paused) { resumeMedia.add(this); return Promise.resolve(); } return play.call(this); };
  function setPause(value) {
    if (paused === value) return;
    if (value) { paused = true; pauseAt = native.now(); for (const t of timers.values()) { native.clear(t.nativeId); t.left = Math.max(0,t.due-native.now()); } for (const a of media.keys()) if (!a.paused) { resumeMedia.add(a); a.pause(); } for (const code of ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD','Space','KeyB']) window.dispatchEvent(new KeyboardEvent('keyup',{code,key:({KeyW:'w',KeyA:'a',KeyS:'s',KeyD:'d',KeyB:'b',Space:' '})[code]||code,bubbles:true})); pads = []; }
    else { pausedTime += native.now()-pauseAt; paused = false; for (const id of timers.keys()) arm(id); for (const a of resumeMedia) play.call(a).catch(()=>{}); resumeMedia.clear(); }
  }
  addEventListener('message', e => { const m = e.data; if (e.source !== parent || m?.n3000 !== token) return; switch (m.type) { case 'PAUSE': setPause(true); break; case 'RESUME': setPause(false); break; case 'PAD': pads = m.pads || []; break; case 'AUDIO': profile = m.audio; for(const a of media.keys()) apply(a); break; case 'FLUSH': send('FLUSHED',{request:m.request,data:{...storageData}}); break; } });
  let escapeTimer = null;
  addEventListener('keydown', e => { if (e.code === 'F10') { e.preventDefault(); e.stopImmediatePropagation(); send('EXIT_REQUEST'); } if(e.code==='Escape' && !e.repeat) escapeTimer=native.timeout(()=>send('EXIT_REQUEST'),900); if(paused) { e.preventDefault();e.stopImmediatePropagation(); } },true);
  addEventListener('keyup', e => { if(e.code==='Escape') native.clear(escapeTimer); },true);
  addEventListener('blur',()=>native.clear(escapeTimer));
  addEventListener('click', e => { const a=e.target.closest?.('a'); if(a && !a.getAttribute('href')?.startsWith('#')) {e.preventDefault(); send('NOTICE',{message:'Website navigation is unavailable inside N3000. Use Return to Library.'});} },true);
  addEventListener('error', e => { if(e.target!==window) send('ASSET_FAILED',{message:'A guest asset could not load.'}); else send('ERROR',{message:String(e.message||'Guest script error')}); },true);
  addEventListener('unhandledrejection', e => { if(e.reason?.name!=='NotAllowedError' && e.reason?.name!=='AbortError') send('ERROR',{message:String(e.reason?.message||e.reason)}); });
  addEventListener('DOMContentLoaded',()=>{for(const a of document.querySelectorAll('audio,video')){record(a);apply(a);}send('READY');},{once:true});
}
export function createHTMLAdapter({ html, parent, game, audio, onEvent }) {
  if (typeof html !== 'string' || !/<html[\s>]/i.test(html) || !/<script[\s>]/i.test(html)) throw new Error('RP game package has a broken entry point.');
  const token = crypto.randomUUID(), key = game.saveProfile.namespace;
  let cached = {}, saveError = '', destroyed = false, flushSerial = 0;
  const pending = new Map();
  try { cached = JSON.parse(localStorage.getItem(key)||'{}'); } catch { cached = {}; }
  const iframe = document.createElement('iframe'); iframe.title = `${game.id} · ${game.title}`;
  iframe.setAttribute('sandbox','allow-scripts allow-pointer-lock'); iframe.setAttribute('allow','autoplay'); iframe.className = 'n3000-guest';
  function persist(data) {
    try { if(!data || typeof data!=='object' || Array.isArray(data)) throw new Error('Invalid save data'); const clean = Object.fromEntries(Object.entries(data).filter(([k,v])=>k.length<=512 && typeof v==='string')); const encoded=JSON.stringify(clean); if(encoded.length>2e6) throw new Error('Guest save exceeds its storage limit'); localStorage.setItem(key,encoded); cached=clean;saveError='';return true; } catch(e) { saveError = `Guest save failed: ${e.message}. Return remains available.`; onEvent('SAVE_FAILED',{message:saveError});return false; }
  }
  function message(e) { const m=e.data; if(destroyed || e.source!==iframe.contentWindow || m?.n3000!==token)return; if(m.type==='SAVE')persist(m.data); else if(m.type==='FLUSHED') { const ok=persist(m.data);pending.get(m.request)?.(ok);pending.delete(m.request); } else if(['READY','ERROR','ASSET_FAILED','EXIT_REQUEST','NOTICE'].includes(m.type)) onEvent(m.type,m); }
  addEventListener('message',message);
  const send = (type,payload={}) => { if(!destroyed)iframe.contentWindow?.postMessage({n3000:token,type,...payload},'*'); };
  const config=JSON.stringify({token,initialSave:cached,audio}).replace(/</g,'\\u003c');
  const bootstrap=`<script>(${guestBootstrap.toString()})(${config});<\/script>`;
  const csp='<meta http-equiv="Content-Security-Policy" content="default-src data: blob: \'unsafe-inline\' \'unsafe-eval\'; connect-src \'none\'; form-action \'none\';">';
  const doc = html.replace(/<head([^>]*)>/i, `<head$1>${csp}${bootstrap}`);
  return {
    iframe, get saveError(){return saveError;},
    mount(){parent.appendChild(iframe);}, start(){iframe.srcdoc=doc;}, pause(){send('PAUSE');}, resume(){send('RESUME');}, focus(){iframe.contentWindow?.focus();}, blur(){iframe.blur();},
    input(pads){send('PAD',{pads});}, audio(profile){send('AUDIO',{audio:profile});},
    save(){return new Promise(resolve=>{const request=++flushSerial;pending.set(request,resolve);send('FLUSH',{request});setTimeout(()=>{if(pending.has(request)){pending.delete(request);resolve(false);}},1200);});},
    async exit(){this.pause();return this.save();},
    destroy(){destroyed=true;removeEventListener('message',message);for(const resolve of pending.values())resolve(false);pending.clear();iframe.remove();}
  };
}
