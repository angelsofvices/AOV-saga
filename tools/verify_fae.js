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

const EXPORT = ';globalThis.__C={player,game,FAE_UNLOCK_COUNT,_fae,collectFaeAt,WORLD_PROPS,worldDistrictAt};';
try {
  new Function(src + EXPORT)();
} catch(e){ console.log('boot error:', e.message.slice(0,200)); }
const fs2=require('fs'); const src2=fs2.readFileSync('/tmp/all.js','utf8');
let f=0; const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const C=globalThis.__C;
ok(!!C,'script evaluated'); if(!C){process.exit(0);}

console.log('\n1 · ★★ ONE NUMBER GATES CELESTRYX\n');
console.log('     There used to be two: FAE_UNLOCK_COUNT (200, which fired the');
console.log('     achievement toast) and a hardcoded REQ = 100 at the Zarvane');
console.log('     altar. The game announced "Celestryx UNLOCKED" at 200 while the');
console.log('     altar had been willing to hand one over since 100.\n');
ok(C.FAE_UNLOCK_COUNT===60, `FAE_UNLOCK_COUNT is 60 (${C.FAE_UNLOCK_COUNT})`);
ok(/const REQ = FAE_UNLOCK_COUNT/.test(src2), 'the altar reads the same constant, not its own copy');
ok(!/const REQ = 100;/.test(src2), 'the hardcoded 100 is gone');
const gates=[...src2.matchAll(/unlocks\.celestryx && player\.faeCollected >= ([A-Z_]+|\d+)/g)].map(m=>m[1]);
console.log(`     celestryx gates found: ${gates.join(', ')||'none'}`);
ok(gates.length>0 && gates.every(g=>g==='FAE_UNLOCK_COUNT'),
   `every Celestryx gate uses the constant (${gates.length} found)`);

console.log('\n2 · ★★ EVERY FAE RESTORES 5% OF MAX HP\n');
ok(/player\.hpMax \|\| 100\) \* 0\.05/.test(src2), 'the heal is 5% of MAX HP, not a flat amount');
console.log('     Percentage so a fae is worth the same fraction of your life at');
console.log('     Lv 5 and at Lv 60 — a flat +5 is a meal early and a rounding');
console.log('     error later.\n');
// exercise it through the real collector
function firstUncollected(){ return (C._fae||[]).find(x=>x && !x.collected); }
const fa=firstUncollected();
ok(!!fa, `there are fae in the world to collect (${(C._fae||[]).length} total)`);
if(fa){
  C.game.scene='overworld';
  // collectFaeAt gates on Kaizari's Fae Net (or the S2 Astralite Matrix, which
  // attracts fae without it). Without one of those it refuses and plays a
  // 'disabled' sound — so the first run of this test measured a REFUSAL and
  // reported the heal broken. Equip the net, the way a player would.
  C.player.items = C.player.items || {}; C.player.items.faenet = 1;
  C.player.hpMax=200; C.player.hp=100;
  C.player.x=fa.x; C.player.y=fa.y;
  const before=C.player.hp;
  C.collectFaeAt(fa.x, fa.y);
  console.log(`     hp ${before}/200 · collected one fae · now ${C.player.hp}`);
  ok(C.player.hp===110, `+5% of 200 = +10 (100 -> ${C.player.hp})`);
  ok(fa.collected===true, 'and the fae is marked collected');
  // must never overheal
  const fb=firstUncollected();
  if(fb){
    C.player.hp=C.player.hpMax;
    C.player.x=fb.x; C.player.y=fb.y;
    C.collectFaeAt(fb.x, fb.y);
    ok(C.player.hp===C.player.hpMax, `never exceeds max HP (${C.player.hp}/${C.player.hpMax})`);
  }
  // a low-level Rizer gets proportionally the same
  const fc=firstUncollected();
  if(fc){
    C.player.hpMax=40; C.player.hp=10;
    C.player.x=fc.x; C.player.y=fc.y;
    C.collectFaeAt(fc.x, fc.y);
    ok(C.player.hp===12, `at hpMax 40 a fae gives +2 (10 -> ${C.player.hp}) — same 5%`);
  }
}
ok(/Math\.max\(1,/.test(src2.slice(src2.indexOf('every fae restores'), src2.indexOf('every fae restores')+600)),
   'and it floors at 1 HP, so a very low hpMax still heals something');

console.log('\n3 · ★ THE ZARVANE ALTAR IS STILL WHERE IT WAS\n');
const alt=(C.WORLD_PROPS||[]).find(p=>p&&p.id==='zarvane_astralite_refinery');
ok(!!alt, 'the Astralite Refinery exists');
if(alt){
  console.log(`     at (${alt.tileX},${alt.tileY}) in ${C.worldDistrictAt(alt.tileX,alt.tileY)}`);
  ok(C.worldDistrictAt(alt.tileX,alt.tileY)==='zarvane', 'and it is in ZARVANE, which is where the gift lives');
}

console.log('\n4 · ★ THE MILESTONE ORDER CHANGED · worth knowing\n');
const amp=[...src2.matchAll(/unlocks\.amplification && player\.faeCollected >= (\d+)/g)].map(m=>+m[1]);
console.log(`     Amplification unlocks at ${amp[0]} fae · Celestryx now at ${C.FAE_UNLOCK_COUNT}`);
ok(amp.length>0, 'the Amplification unlock still exists and is untouched');
ok(C.FAE_UNLOCK_COUNT < amp[0],
   `Celestryx now comes FIRST (${C.FAE_UNLOCK_COUNT} before ${amp[0]}) — it used to be second at 200`);
console.log('     Flagging rather than assuming: if Amplification should still be');
console.log('     the earlier milestone, its 100 needs lowering too.');

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
