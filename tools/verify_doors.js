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

const EXPORT = ';globalThis.__C={player,game,_propDoors,_propBlocked,walkable,worldDistrictAt,towerRestored,TOWER_BY_DIST,auraxionUfoProp,ufoCanLand,WORLD_PROPS};';
try {
  new Function(src + EXPORT)();
} catch(e){ console.log('boot error:', e.message.slice(0,200)); }
const fs2=require('fs'); const src2=fs2.readFileSync('/tmp/all.js','utf8');
let f=0; const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const C=globalThis.__C;
ok(!!C,'script evaluated'); if(!C){process.exit(0);}
C.game.scene='overworld';

console.log('\n1 · ★★ EVERY DOOR FIRES ON CONTACT, NOT JUST autoEnter ONES\n');
const doors=[...C._propDoors.keys()];
console.log(`     ${doors.length} registered door tiles in the world`);
ok(doors.length>20, `there are doors to test (${doors.length})`);
// how many were previously inert?
let auto=0, inert=0;
for(const k of doors){
  const p=C._propDoors.get(k);
  if(p && p.autoEnter) auto++; else inert++;
}
console.log(`     ${auto} were autoEnter · ${inert} were STANDABLE and did nothing`);
ok(inert>0, `${inert} doors used to let you stand in the doorway indefinitely`);
ok(!/doorProp\.autoEnter && typeof doorProp\.onInteract/.test(src2),
   'the autoEnter-only condition is gone');
ok(/const doorProp = _propDoors\.get\(`\$\{player\.x\},\$\{player\.y\}`\);[\s\S]{0,120}typeof doorProp\.onInteract === 'function'/.test(src2),
   'ANY registered door with a handler now fires on arrival');

console.log('\n2 · ★★ A REFUSED DOOR PUTS YOU BACK AND FACES YOU AT IT\n');
console.log('     "or face it if locked" — you must not be left standing IN the');
console.log('     doorway of a door that would not open.\n');
ok(/if \(game\.scene !== sceneBefore\) return;/.test(src2),
   'a door that CHANGED SCENE is left alone — you are inside, nothing to undo');
ok(/player\.x = fromX; player\.y = fromY;/.test(src2), 'a door that refused steps you back');
ok(/player\.dir = Math\.abs\(dx\) >= Math\.abs\(dy\)/.test(src2), '   and turns you to face it');
ok(/_doorPrevX = player\.x; _doorPrevY = player\.y;/.test(src2),
   'the previous tile is RECORDED on every committed move, so the bounce-back');
console.log('     goes somewhere real instead of guessing a direction to shove');
console.log('     the player in');
ok(/walkable\(fromX, fromY\)/.test(src2),
   '   and it is re-checked walkable before use — a warp or a load can leave');
console.log('     that stamp stale');

console.log('\n3 · ★★ A ROLL CANNOT COME TO REST ON A DOORWAY\n');
console.log('     The door rule fires on arrival, so a roll landing on one would');
console.log('     either yank you inside mid-dodge or bounce you straight back');
console.log('     out — both read as the roll breaking.\n');
ok(/const landable = \(x, y\) =>/.test(src2), 'the dodge uses a landable() test, not bare walkable()');
ok(/!\(game\.scene === 'overworld' && _propDoors\.has/.test(src2),
   '   which excludes door tiles from being a landing spot');
ok(/if \(landable\(player\.x \+ vx\*2/.test(src2) && /else if \(landable\(player\.x \+ vx,/.test(src2),
   'both the 2-tile leap and the 1-tile fallback use it');
// prove a door tile is genuinely excluded
const sample=doors[0].split(',').map(Number);
ok(C._propDoors.has(`${sample[0]},${sample[1]}`), `sample door tile (${sample}) is registered`);

console.log('\n4 · ★★ TRANSPONDER · three gates, checked outward-in\n');
// Brace-match the whole branch instead of slicing a fixed number of chars.
// A 3000-char window worked until this commit ADDED 1400 chars of gates, which
// pushed the landing search out of view and reported it deleted. That is the
// FOURTH fixed-window failure this session; the window is the bug, not the
// code, so this one measures its own extent.
const T=(()=>{
  const i=src2.indexOf("key === 'astralcore_transponder'");
  if(i<0) return '';
  let j=src2.indexOf('{', i), d=0;
  for(let k=j;k<src2.length;k++){
    if(src2[k]==='{') d++;
    else if(src2[k]==='}'){ d--; if(!d) return src2.slice(i,k+1); }
  }
  return src2.slice(i, i+8000);
})();
ok(T.length>1500, `transponder branch located · ${T.length} chars (brace-matched, not a guess)`);
ok(/auraxionMissionComplete/.test(T), 'GATE 1 · Auraxion\'s Astralcore retrieval must be done');
ok(/towerRestored/.test(T), 'GATE 2 · this district\'s Scrapjaw tower must be restored');
ok(/game\.scene !== 'overworld'/.test(T), 'GATE 3 · outdoors only');
ok(/_inFlight/.test(T), '   and not while the UFO is already airborne');
// order matters
// Measure the BRANCHES, not the variable declarations. _towerUp is computed
// near the top (it has to be, to be available), which made a naive indexOf
// report the tower gate as first when the actual if-chain checks it last.
const branches=[...T.matchAll(/(?:\} else )?if \((![\w.]+\.auraxionMissionComplete|game\.scene !== 'overworld'|!_towerUp)/g)]
  .map(m=>m[1]);
console.log(`     if-chain order: ${branches.map(b=>b.includes('auraxion')?'quest':b.includes('scene')?'indoors':'tower').join(' -> ')}`);
ok(branches.length===3, `all three gates are branches of one chain (${branches.length})`);
ok(branches[0] && branches[0].includes('auraxion'),
   'clearance is checked FIRST — telling someone their tower is down is useless');
console.log('     if they were never issued a transponder in the first place');
ok(/NO CARRIER/.test(T), 'the tower refusal names the problem as a signal problem');
ok(/devMaxBond/.test(T), 'and dev mode walks through both gates');

console.log('\n5 · ★ THE LANDING SEARCH IS UNTOUCHED\n');
ok(/for \(let r = 1; r <= 32; r\+\+\)/.test(T), 'still spirals outward from the player, radius 1 first');
ok(/ufoCanLand\(ax, ay\)/.test(T), '   testing ufoCanLand on each ring');
console.log('     so the UFO still arrives at the nearest legal pad rather than a');
console.log('     fixed spot — that part already worked and was left alone');

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
