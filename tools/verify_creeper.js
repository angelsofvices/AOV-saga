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

const EXPORT = ';globalThis.__C={NPCS,WORLD_PROPS,worldDistrictAt,isWorldLandTile,isWorldBorderTile,_propBlocked,game,player,buildVerdantCreepers,VERDANT_CREEPER_ART,CREEPER_QUOTA,startMoriDeath,creeperBank};';
try {
  new Function(src + EXPORT)();
} catch(e){ console.log('boot error:', e.message.slice(0,200)); }
const fs2=require('fs'); const src2=fs2.readFileSync('/tmp/all.js','utf8');
let f=0; const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const C=globalThis.__C;
ok(!!C,'script evaluated');
if(!C){ console.log('\n❌ cannot continue'); process.exit(0); }
C.game.scene='overworld';

console.log('\n1 · ★ THREE BANKS · and the attack grid is NOT the others\n');
for(const k of ['idle','walk','attack']){
  const a=C.VERDANT_CREEPER_ART[k];
  ok(!!a, `${k} bank declared`);
  if(a) console.log(`     ${k.padEnd(7)} ${a.rows}x${a.cols} @ ${a.cellW}px · ${a.bboxes.length} rows`);
}
const A=C.VERDANT_CREEPER_ART.attack, I=C.VERDANT_CREEPER_ART.idle;
ok(!!C.VERDANT_CREEPER_ART.rowMap && C.VERDANT_CREEPER_ART.rowMap.down===3,
   'rowMap maps DOWN to row 3 — the sheet is UP/LEFT/RIGHT/DOWN, not canon order');
console.log('     Row 0 is the backs of their heads, row 3 the skull faces.');
console.log('     Confirmed twice: by rendering the sheet, then by width — rows 1');
console.log('     and 2 are widest because a profile throws one arm forward,');
console.log('     while 0 and 3 are narrow, square to camera.\n');
const cr0=C.NPCS.filter(n=>n&&n._verdantCreeper)[0];
ok(!cr0 || (cr0.rowMap && cr0.rowMap.down===3), 'and the NPC actually carries it');
ok(A.cols===5 && A.cellW===256, `the attack sheet really is 5 cols on 256px cells (${A.cols}x${A.cellW})`);
ok(I.cols===4 && I.cellW===313, `while idle stays 4 cols on 313 (${I.cols}x${I.cellW})`);
ok(A.cellW!==I.cellW, 'the two grids DIFFER — this is the first NPC in the game where that is true');
ok(/useAtk && n\.attackCellW/.test(src2),
   'drawNPC takes cellW/cellH/cols from the ATTACK bank while striking');
console.log('     Without that, the strike samples 313px windows out of a 256px');
console.log('     grid and every attack frame shows a slice of two neighbours.\n');
// bbox tables must match their own declared grid
for(const k of ['idle','walk','attack']){
  const a=C.VERDANT_CREEPER_ART[k]; if(!a) continue;
  ok(a.bboxes.length===a.rows && a.bboxes.every(r=>r.length===a.cols),
     `   ${k} bbox table is ${a.rows}x${a.cols}, matching its own grid`);
  ok(a.foot.length===a.rows && a.foot.every(r=>r.length===a.cols),
     `   ${k} foot table likewise`);
}

console.log('\n1b · ★★ EVERY BBOX LANDS INSIDE ITS OWN SHEET\n');
console.log('     The columns are packed at ~245px pitch, NOT the 313 the rows');
console.log('     use, and the whole block is inset ~200px. bx is cell-relative,');
console.log('     so it goes negative or past the cell to compensate — which is');
console.log('     fine, but only if col*cellW+bx still lands on the sheet.\n');
const SHEET={idle:[1254,1254],walk:[1254,1254],attack:[1280,1024]};
let outside=0;
for(const k of ['idle','walk','attack']){
  const a=C.VERDANT_CREEPER_ART[k], [SW,SH]=SHEET[k];
  for(let r=0;r<a.rows;r++) for(let c=0;c<a.cols;c++){
    const b=a.bboxes[r][c];
    const x0=c*a.cellW+b[0], y0=r*a.cellH+b[1];
    if(x0<0||y0<0||x0+b[2]>SW||y0+b[3]>SH){
      outside++; if(outside<=4) console.log(`     ${k} r${r}c${c} -> ${x0},${y0} ${b[2]}x${b[3]} off ${SW}x${SH}`);
    }
  }
}
ok(outside===0, `all 52 frames sample inside their sheet (${outside} off-sheet)`);
// and no two frames of the same bank may overlap — that is a merged figure
let merged=0;
for(const k of ['idle','walk','attack']){
  const a=C.VERDANT_CREEPER_ART[k]; const R=[];
  for(let r=0;r<a.rows;r++) for(let c=0;c<a.cols;c++){
    const b=a.bboxes[r][c];
    R.push([c*a.cellW+b[0], r*a.cellH+b[1], c*a.cellW+b[0]+b[2], r*a.cellH+b[1]+b[3]]);
  }
  for(let i=0;i<R.length;i++) for(let j=i+1;j<R.length;j++){
    const p=R[i],q=R[j];
    if(p[0]<q[2]&&q[0]<p[2]&&p[1]<q[3]&&q[1]<p[3]) merged++;
  }
}
ok(merged===0, `no two frames overlap (${merged}) — an overlap means two figures merged into one bbox`);
console.log('     That is what went wrong first time: component ownership merged');
console.log('     adjacent figures because their vines touch, giving bboxes 395px');
console.log('     wide in a 313px cell. Assigning figures by left-to-right ORDER');
console.log('     within each row is robust to any pitch.\n');

console.log('\n2 · ★★ HABITAT IS CANOPY · derived from the real trees\n');
const made=C.buildVerdantCreepers();
const cr=C.NPCS.filter(n=>n&&n._verdantCreeper);
console.log(`     seeded ${made} (${cr.length} live)`);
ok(cr.length>0, `creepers exist (${cr.length})`);
ok(C.buildVerdantCreepers()===0, 'a second call adds none — idempotent, so a reload cannot double the population');
const byd={};
for(const n of cr){ const d=C.worldDistrictAt(n.tileX,n.tileY); byd[d]=(byd[d]||0)+1; }
console.log('     per district (quota in brackets):');
for(const d of Object.keys(C.CREEPER_QUOTA))
  console.log(`       ${d.padEnd(11)} ${String(byd[d]||0).padStart(2)}  [${C.CREEPER_QUOTA[d]}]`);
ok((byd.malezor||0)>0, `MALEZOR has creepers (${byd.malezor||0}) — it has 190 trees but none in an`);
console.log('     8-plus cluster, so an absolute density threshold would have given it');
console.log('     zero, which is the opposite of the directive');
ok((byd.veridan||0)>0, `VERIDAN has creepers (${byd.veridan||0})`);
const top=Object.keys(byd).sort((a,b)=>byd[b]-byd[a]).slice(0,2);
ok(top.includes('malezor') && top.includes('veridan'),
   `and they are the two most populated districts (${top.join(', ')}) — "mostly in malezor veridan"`);
ok(!(byd.zarvane>0), 'zarvane has none — it is desert oasis, there is no canopy there');
let over=0;
for(const d of Object.keys(byd)) if((byd[d]||0) > (C.CREEPER_QUOTA[d]||0)) over++;
ok(over===0, `no district exceeds its quota (${over})`);

console.log('\n3 · ★ EVERY CREEPER IS ON GROUND IT CAN STAND ON\n');
function bad(x,y){
  if(!C.isWorldLandTile(x,y)) return 'water';
  if(C.isWorldBorderTile(x,y)) return 'border';
  if(C._propBlocked && C._propBlocked.has(x+','+y)) return 'inside a prop';
  return null;
}
const bads=cr.filter(n=>bad(n.tileX,n.tileY));
for(const n of bads.slice(0,5)) console.log(`     ${n.id} (${n.tileX},${n.tileY}) — ${bad(n.tileX,n.tileY)}`);
ok(bads.length===0, `all ${cr.length} on standable ground (${bads.length} bad)`);
const seen={}; let dup=0;
for(const n of cr){ const k=n.tileX+','+n.tileY; if(seen[k])dup++; seen[k]=1; }
ok(dup===0, `no two share a tile (${dup})`);
// and none landed on top of an existing NPC
let onNpc=0;
for(const n of cr)
  if(C.NPCS.some(o=>o&&o!==n&&o.scene==='overworld'&&o.tileX===n.tileX&&o.tileY===n.tileY)) onNpc++;
ok(onNpc===0, `none spawned on top of another NPC (${onNpc})`);

console.log('\n4 · ★★ HARDER THAN A MORI · and the 15% heal\n');
const c0=cr[0];
console.log(`     Mori    125 HP · drain  5`);
console.log(`     Creeper ${c0.hpMax} HP · drain ${c0.drainAmt}`);
console.log(`     Daemon  250 HP · drain 10`);
ok(c0.hpMax>125, `tankier than a Mori (${c0.hpMax} vs 125)`);
ok(c0.drainAmt>5, `hits harder than a Mori (${c0.drainAmt} vs 5)`);
ok(c0.hpMax%125===0, `HP is a multiple of 125 per aov-combat-math (${c0.hpMax})`);
// the heal, exercised through the REAL death path
C.player.hpMax=200; C.player.hp=100;
const victim=cr[0];
C.startMoriDeath(victim);
console.log(`     hp 100/200 · killed one · now ${C.player.hp}`);
ok(C.player.hp===130, `killing one returns exactly 15% of max HP (100 -> ${C.player.hp}, expected 130)`);
ok(/_verdantCreeper && !n\._creeperHealed/.test(src2), 'the heal is guarded against double-payout');
// it must not overheal
C.player.hp=C.player.hpMax;
const v2=cr[1];
if(v2){ C.startMoriDeath(v2); ok(C.player.hp===C.player.hpMax, `never exceeds max HP (${C.player.hp}/${C.player.hpMax})`); }
// and it must fire from EVERY kill route, which is why it lives in startMoriDeath
// Brace-match the function rather than guessing a character window. A fixed
// window has now failed three times this session for the same reason: the code
// IS there, just further in than the window. A test that cannot FIND the code
// is not a test that the code is wrong.
function fnBody(name){
  const i=src2.indexOf('function '+name);
  if(i<0) return null;
  let j=src2.indexOf('{',i), d=0;
  for(let k=j;k<src2.length;k++){
    if(src2[k]==='{') d++;
    else if(src2[k]==='}'){ d--; if(!d) return src2.slice(i,k+1); }
  }
  return null;
}
const smd=fnBody('startMoriDeath');
ok(!!smd, 'startMoriDeath located (brace-matched, not a character window)');
ok(!!smd && /_verdantCreeper/.test(smd),
   'the heal sits inside startMoriDeath — the one door every kill route passes');
console.log('     A heal wired per-attack would pay out on sword and not on a');
console.log('     thrown boulder, and nobody would work out why.');

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
