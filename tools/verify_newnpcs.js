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

const EXPORT = ';globalThis.__C={NPCS,findNpcById,worldDistrictAt,isWorldLandTile,isWorldBorderTile,_propBlocked,game,player,contactEligible,WORLD_PROPS};';
try {
  new Function(src + EXPORT)();
} catch(e){ console.log('boot error:', e.message.slice(0,200)); }
const fs2=require('fs'); const src2=fs2.readFileSync('/tmp/all.js','utf8');
let f=0; const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const C=globalThis.__C;
ok(!!C,'script evaluated'); if(!C){process.exit(0);}
C.game.scene='overworld';

const G=C.findNpcById('glaciobolt'), B=C.findNpcById('lost_boy');
console.log('\n1 · ★ BOTH EXIST, IN THE RIGHT DISTRICT\n');
ok(!!G,'Glaciobolt exists');
ok(!!B,'The Lost Boy exists');
if(G) ok(C.worldDistrictAt(G.tileX,G.tileY)==='xilnar', `Glaciobolt is in XILNAR (${C.worldDistrictAt(G.tileX,G.tileY)}) at (${G.tileX},${G.tileY})`);
if(B) ok(C.worldDistrictAt(B.tileX,B.tileY)==='andrannor', `The Lost Boy is in ANDRANNOR (${C.worldDistrictAt(B.tileX,B.tileY)}) at (${B.tileX},${B.tileY})`);
function bad(x,y){
  if(!C.isWorldLandTile(x,y)) return 'water';
  if(C.isWorldBorderTile(x,y)) return 'border';
  if(C._propBlocked && C._propBlocked.has(x+','+y)) return 'inside a prop';
  return null;
}
for(const n of [G,B]) if(n) ok(!bad(n.tileX,n.tileY), `   ${n.name} stands on open ground${bad(n.tileX,n.tileY)?' — '+bad(n.tileX,n.tileY):''}`);
// the boy must actually be NEAR a home, which is the whole point of the spot
if(B){
  let best=1e9, who='';
  for(const p of C.WORLD_PROPS){
    if(!p||!/home|house/i.test(p.id||'')) continue;
    const d=Math.hypot(p.tileX-B.tileX,p.tileY-B.tileY);
    if(d<best){best=d;who=p.id;}
  }
  ok(best<=6, `and he is beside a home — ${best.toFixed(1)} tiles from ${who}`);
}
// nobody may share a tile
let clash=0;
for(const n of [G,B]) if(n && C.NPCS.some(o=>o&&o!==n&&o.scene==='overworld'&&o.tileX===n.tileX&&o.tileY===n.tileY)) clash++;
ok(clash===0, `neither shares a tile with another NPC (${clash})`);

console.log('\n2 · ★★ SPRITES · four facings, feet planted, right size\n');
for(const n of [G,B]){
  if(!n) continue;
  ok(Array.isArray(n.bboxes)&&n.bboxes.length===4&&n.bboxes.every(r=>r.length===4),
     `${n.name} · 4x4 bbox table`);
  ok(Array.isArray(n.footBaselines)&&n.footBaselines.length===4,
     `   and a foot baseline per row`);
  ok(n.cellAnchor===true, `   cellAnchor on — frames anchor to the cell, not to each bbox`);
  // every frame must sample inside the sheet
  let off=0;
  for(let r=0;r<4;r++) for(let c=0;c<4;c++){
    const b=n.bboxes[r][c];
    const x=c*n.cellW+b[0], y=r*n.cellH+b[1];
    if(x<0||y<0||x+b[2]>1254||y+b[3]>1254) off++;
  }
  ok(off===0, `   all 16 frames sample inside the sheet (${off} off)`);
  const tiles=n.scaleRefBh*((48*2)/n.scaleRefBh*n.scaleMul)/48;
  console.log(`     ${n.name} stands ${tiles.toFixed(2)} tiles (refBh ${n.scaleRefBh} x ${n.scaleMul})`);
}
const gT=G? G.scaleRefBh*((48*2)/G.scaleRefBh*G.scaleMul)/48 : 0;
const bT=B? B.scaleRefBh*((48*2)/B.scaleRefBh*B.scaleMul)/48 : 0;
ok(gT>2.4, `Glaciobolt reads as a brute (${gT.toFixed(2)} tiles vs a 2.00 Rizer)`);
ok(bT<1.6, `The Lost Boy reads as a CHILD (${bT.toFixed(2)} tiles) — every other humanoid`);
console.log('     in the district is adult height and he must be small at a glance');
ok(gT>bT*1.8, `   and the two are unmistakably different sizes (${gT.toFixed(2)} vs ${bT.toFixed(2)})`);

console.log('\n3 · ★ GLACIOBOLT IS A TEACHER AND A CONTACT\n');
ok(G && G._moveTeacher==='duelaxe', `he teaches duel-axe combat (_moveTeacher='${G&&G._moveTeacher}')`);
ok(G && G.isEnemy===false, 'not an enemy');
ok(G && C.contactEligible(G)===true, 'and he is CONTACT-ELIGIBLE — a teacher you can call once bonded,');
console.log('     the same shape as Foongus and Sharkfin');

console.log('\n4 · ★ THE LOST BOY IS NOT A CONTACT YET\n');
ok(B && B.mode==='stationary', 'he does not wander — he is waiting');
ok(B && B.wanderRadius===0, '   wanderRadius 0');
ok(B && B._lostBoy===true, '   tagged _lostBoy for the escort quest to find later');
ok(!/gifts you a Vengrizz|received: vengrizz/i.test(src2),
   'the Vengrizz gift is NOT faked — no toast pretends the quest resolved');
console.log('     The escort ("find his parents") and the Vengrizz reward are a');
console.log('     later pass. He is placed and he has a line; that is all.');

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
