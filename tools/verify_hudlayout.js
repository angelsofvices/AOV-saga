// Headless smoke test for rp7b.html — evaluates the whole script against a
// stubbed browser surface, then calls the combat/roster functions directly.
const fs = require('fs');
const src = fs.readFileSync('/tmp/all.js', 'utf8');

const noop = () => {};
global.setInterval=()=>0; global.setTimeout=(f,t)=>0; global.clearInterval=noop; global.clearTimeout=noop;
function makeCtx() {
  const c = {};
  const methods = ['save','restore','beginPath','closePath','moveTo','lineTo','arc','arcTo','rect',
    'fill','stroke','fillRect','strokeRect','clearRect','fillText','strokeText','drawImage','translate',
    'rotate','scale','setTransform','resetTransform','clip','createLinearGradient','createRadialGradient',
    'createPattern','putImageData','getImageData','measureText','ellipse','quadraticCurveTo','bezierCurveTo',
    'setLineDash','transform'];
  for (const m of methods) c[m] = () => ({ addColorStop: noop, data: [], width: 0, height: 0 });
  c.measureText = () => ({ width: 10 });
  c.canvas = { width: 960, height: 540 };
  return c;
}
const CTX = makeCtx();
function makeEl() {
  const el = {
    style: {}, dataset: {}, classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
    width: 960, height: 540, value: '', textContent: '', innerHTML: '', checked: false,
    children: [], childNodes: [], clientWidth: 960, clientHeight: 540,
    getContext: () => CTX, appendChild: noop, removeChild: noop, insertBefore: noop,
    addEventListener: noop, removeEventListener: noop, setAttribute: noop, getAttribute: () => null,
    removeAttribute: noop, focus: noop, blur: noop, click: noop, remove: noop, closest: () => null,
    querySelector: () => makeEl(), querySelectorAll: () => [],
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 960, height: 540, right: 960, bottom: 540 }),
    scrollIntoView: noop, scrollTo: noop, scrollTop: 0,
  };
  return el;
}
global.addEventListener = noop; global.removeEventListener = noop;
global.document = {
  getElementById: () => makeEl(), querySelector: () => makeEl(), querySelectorAll: () => [],
  createElement: () => makeEl(), createTextNode: () => ({}), addEventListener: noop,
  removeEventListener: noop, body: makeEl(), documentElement: makeEl(), head: makeEl(),
  hidden: false, visibilityState: 'visible', activeElement: null, fullscreenElement: null,
};
global.window = global;
global.localStorage = { _d: {}, getItem(k){ return this._d[k] ?? null; }, setItem(k,v){ this._d[k]=String(v); },
  removeItem(k){ delete this._d[k]; }, clear(){ this._d = {}; } };
global.Audio = function(){ return { play: () => Promise.resolve(), pause: noop, load: noop,
  addEventListener: noop, removeEventListener: noop, cloneNode(){ return this; },
  volume: 1, currentTime: 0, duration: 0, paused: true }; };
global.Image = function(){ return { addEventListener: noop, removeEventListener: noop,
  complete: false, naturalWidth: 0, naturalHeight: 0, width: 0, height: 0, src: '' }; };
global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = noop;
global.matchMedia = () => ({ matches: false, addEventListener: noop, removeEventListener: noop, addListener: noop });
global.navigator = { userAgent: 'node', getGamepads: () => [], maxTouchPoints: 0, vibrate: noop };
global.performance = { now: () => 0 };
global.alert = noop; global.confirm = () => true; global.prompt = () => null;
global.getComputedStyle = () => ({ getPropertyValue: () => '' });

const EXPORT = ';globalThis.__C={HUD_MOVABLE,HUD_POS_KEY,HUD_LEGACY_KEY,hudPinned,setHudLayoutMode,resetHudLayout,initHudMovables,makeOverlayDraggable,getMode:()=>hudLayoutMode};';

try { new Function(src + EXPORT)(); } catch(e){ console.log('boot error:', e.message.slice(0,300)); }
const src2 = require('fs').readFileSync('/tmp/all.js','utf8');
// ★ the MARKUP lives in the html, not in the extracted script bundle.  Checking
// DOM ids against /tmp/all.js reported nine phantom failures the first time —
// the check was right, the haystack was wrong.
const HTML = require('fs').readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html','utf8');
// brace-matched function body · a fixed character window silently truncates
// the moment the function grows, which is a test that rots by itself
function fnBody(name){
  const i = src2.indexOf('function ' + name);
  if (i < 0) return '';
  let d = 0, started = false;
  for (let j = i; j < src2.length; j++){
    const c = src2[j];
    if (c === '{'){ d++; started = true; }
    else if (c === '}'){ d--; if (started && d === 0) return src2.slice(i, j + 1); }
  }
  return src2.slice(i);
}
let f=0; const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const C=globalThis.__C;
ok(!!C,'script evaluated');
if(!C){ console.log('\n❌ cannot continue'); process.exit(0); }

console.log('\n★★★ v0.95.935 · MOVABLE HUD OVERLAYS');
console.log('  Creator: "make the volstorm ready dom movable like tiles and dev');
console.log('            mode. most doms should be movable for dev preferences');
console.log('            during gameplay."\n');

console.log('1 · THE REGISTRY\n');
{
  const ids = C.HUD_MOVABLE.map(s => s.id);
  console.log('     ' + C.HUD_MOVABLE.map(s => `${s.label}(#${s.id})`).join(' · '));
  ok(ids.includes('a5Charge'), '★ VOLTSTORM · the one he named, is in the registry');
  ok(ids.length >= 8, `"most doms" is ${ids.length} overlays, not just the one asked for`);
  ok(new Set(ids).size === ids.length, 'no id registered twice');
  ok(C.HUD_MOVABLE.every(s => s.label), 'every entry has a label to show in layout mode');
  // every id must actually exist in the page markup
  const missing = ids.filter(id => !new RegExp(`id="${id}"`).test(HTML)
                                && !new RegExp(`\\.id = '${id}'`).test(src2));
  ok(missing.length === 0,
     'every registered id exists · in the markup, or created in JS (padStatus)'
     + (missing.length ? ` — MISSING: ${missing.join(', ')}` : ''));
}

console.log('\n2 · ★ THE RENAME TRAP · legacy keys are NOT re-keyed\n');
{
  ok(C.HUD_POS_KEY('hud') === 'rp7b_hud_pos_v1',
     'the TILE readout keeps its v0.95.451 storage key');
  ok(C.HUD_POS_KEY('padStatus') === 'rp7b_padstatus_pos_v1',
     'and so does the PAD status');
  console.log('     Both have been draggable since v0.95.451.  Folding them into the new');
  console.log('     naming scheme would have silently discarded positions the Creator has');
  console.log('     already set — a rename is not a migration.\n');
  ok(C.HUD_POS_KEY('a5Charge') === 'rp7b_hudpos_a5Charge_v1',
     'everything new gets the new scheme');
  ok(Object.keys(C.HUD_LEGACY_KEY).length === 2, 'exactly two legacy keys, not a growing pile');
}

console.log('\n3 · ★★ THE PIN · a placed overlay stops being repositioned\n');
{
  // paintA5Charge writes left/top EVERY FRAME, in both branches.  Without the
  // pin a drag would snap back inside 16ms.
  const fn = fnBody('paintA5Charge');
  ok(/const _pinned = \(typeof hudPinned === 'function'\) && hudPinned\(el\);/.test(fn),
     '★ paintA5Charge asks whether the badge was placed by hand');
  ok(/if \(_pinned\)\{[\s\S]{0,200}\} else if \(ready\)\{/.test(fn),
     'and skips BOTH auto-position branches when it was — not just the READY one');
  ok(/el\.textContent\s*=\s*'⚡ VOLTSTORM READY'/.test(fn),
     '★ but still decides what it SAYS · pinning the place must not freeze the text');
  const strip = fnBody('paintCompanionStrip');
  ok(/_stripPinned/.test(strip) && /if \(top != null && !_stripPinned\)/.test(strip),
     'the companion strip follows the same rule');
  ok(/el\._rp7Pinned = true;/.test(src2),
     'and the drag helper is what sets the pin, on save — one writer');
  ok(/function hudPinned/.test(src2) && /localStorage\.getItem\(HUD_POS_KEY\(id\)\)/.test(src2),
     '★ the pin survives a reload · it is read back out of storage, not just held in memory');
  // ★★ the transform trap · found by reading, before it could be reported
  const drag = fnBody('makeOverlayDraggable');
  ok(/if \(el\.style\.transform && el\.style\.transform !== 'none'\)/.test(drag),
     '★★ grabbing a TRANSFORMED overlay bakes the transform into left/top first');
  console.log('       The A5 badge and the COMBO counter are both centred with');
  console.log('       translateX(-50%).  getBoundingClientRect reports where a thing LOOKS,');
  console.log('       transform included — so writing that number back into `left` while the');
  console.log('       transform still applies slides it half its own width on the next frame.');
  ok(/el\.style\.transform = 'none';/.test(drag), 'and then clears it, so what you see is what you grabbed');
}

console.log('\n4 · ★★ WHY IT IS A MODE · click-through during play\n');
{
  ok(/pointer-events:none/.test(HTML.slice(HTML.indexOf('id="a5Charge"'), HTML.indexOf('id="a5Charge"')+400)),
     'the A5 badge is pointer-events:none in normal play');
  const fn = fnBody('setHudLayoutMode');
  ok(/el\.style\.pointerEvents = 'auto';/.test(fn), 'layout mode turns pointer events ON');
  ok(/el\.style\.pointerEvents = el\._rp7PE0 \|\| '';/.test(fn),
     "★ and leaving it restores what the AUTHOR wrote, not a guess ('' would have"
     + ' made every chip permanently clickable)');
  console.log('     The COMBO counter is 64px of type across the middle of the screen and');
  console.log('     the A5 badge rides on Rizer\'s head mid-fight.  Permanent pointer-events');
  console.log('     on those buys a drag and costs a punch.\n');
  ok(/_rp7WasHidden/.test(fn), '★ hidden overlays are revealed in layout mode — otherwise');
  console.log('       VOLTSTORM is only movable during the seconds it happens to be up.');
  ok(/parseFloat\(el\.style\.opacity\) < 0\.5/.test(fn),
     '★ and the COMBO counter, which hides with OPACITY rather than display, gets its');
  console.log('       own lever · two ways to be invisible, two ways to be shown.');
}

console.log('\n5 · RESET MEANS DEFAULTS, NOT A CORNER\n');
{
  const fn = fnBody('resetHudLayout');
  ok(/localStorage\.removeItem\(HUD_POS_KEY\(spec\.id\)\)/.test(fn), 'reset clears the saved positions');
  ok(/el\._rp7Pinned = false;/.test(fn), 'and un-pins, so the paint loop takes the wheel again');
  ok(/el\.style\.left = ''; el\.style\.top = ''/.test(fn),
     "★ it clears the INLINE overrides rather than setting 0 — the stylesheet's own");
  console.log('       corner anchoring takes back over.  Zeroing them would "reset" every');
  console.log('       panel into the same corner, which is not what reset means.');
  ok(/right = ''; el\.style\.bottom = '';/.test(fn),
     'right/bottom too · the drag helper set those to auto on the way in');
}

console.log('\n6 · TWO WAYS IN, AND F9 IS FREE\n');
{
  ok(/\(ev\.key \|\| ''\) !== 'F9'/.test(src2), 'F9 toggles layout mode');
  // it must not already mean something else
  const otherF9 = (src2.match(/['"]f9['"]/gi) || []).filter(m => true).length;
  ok(otherF9 <= 1, `F9 is not bound anywhere else (${otherF9} reference(s) · checked, not assumed)`);
  ok(/id="devHudLayout"/.test(HTML) && /id="devHudLayoutReset"/.test(HTML),
     'and the DEV panel carries the same two actions');
  ok(/hudLayoutBtn\.addEventListener\('click', \(\) => setHudLayoutMode\(!hudLayoutMode\)\)/.test(src2),
     'the button and the key call the ONE function · no second implementation');
  ok(/document\.addEventListener\('DOMContentLoaded', \(\) => \{ try \{ initHudMovables\(\); \}/.test(src2),
     '★ registration does not depend on the gamepad IIFE · that block bails out entirely');
  console.log('       when navigator.getGamepads is missing, which would have meant no saved');
  console.log('       HUD positions at all on a browser without a pad API.');
  ok(/if \(!el \|\| el\._rp7HudReg\) continue;/.test(src2),
     'and initHudMovables is idempotent, so calling it from three places is safe');
}

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
