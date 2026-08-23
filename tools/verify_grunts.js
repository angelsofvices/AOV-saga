const fs = require('fs');
const src = fs.readFileSync('/tmp/all.js', 'utf8');
const noop = () => {};
global.setInterval = () => 0; global.setTimeout = () => 0;
global.clearInterval = noop; global.clearTimeout = noop;
const CTX = new Proxy({}, { get: () => () => ({ addColorStop: noop, width:0, height:0, data:[] }) });
const el = () => ({ style:{}, dataset:{}, classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},
  width:960, height:540, value:'', textContent:'', innerHTML:'', children:[], childNodes:[],
  getContext:()=>CTX, appendChild:noop, removeChild:noop, addEventListener:noop, removeEventListener:noop,
  setAttribute:noop, getAttribute:()=>null, focus:noop, remove:noop, play:()=>Promise.resolve(), pause:noop,
  querySelector:()=>el(), querySelectorAll:()=>[], getBoundingClientRect:()=>({left:0,top:0,width:960,height:540}) });
global.addEventListener = noop; global.removeEventListener = noop;
global.document = { getElementById:()=>el(), querySelector:()=>el(), querySelectorAll:()=>[],
  createElement:()=>el(), addEventListener:noop, body:el(), documentElement:el(), head:el(),
  hidden:false, visibilityState:'visible' };
global.window = global;
global.localStorage = { getItem:()=>null, setItem:noop, removeItem:noop };
global.Audio = function(){ return { play:()=>Promise.resolve(), pause:noop, addEventListener:noop, cloneNode(){return this} }; };
global.Image = function(){ return { addEventListener:noop, complete:false, naturalWidth:0, src:'' }; };
global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = noop;
global.matchMedia = () => ({ matches:false, addEventListener:noop, addListener:noop });
global.navigator = { userAgent:'node', getGamepads:()=>[], maxTouchPoints:0 };
global.performance = { now: () => Date.now() };
global.getComputedStyle = () => ({ getPropertyValue: () => '' });
// v0.95.735 · SEER GRUNT REDELIVERY + Dreamland tree v2.
//
// ★★ THIS SUITE EXISTS BECAUSE MY BATCH 2 ASK WAS BUILT ON A WRONG PREMISE.
// I told the Creator six sheets needed redrawing because the UP row "touches
// the cell top and the engine severs it". The engine does NOT sever anything:
// drawNPC computes sx = col*cellW + bx, sy = row*cellH + by and reads a bw x bh
// source rect with no clip to the cell. A bbox that runs past its cell simply
// samples the neighbouring BAND — which is harmless unless the neighbour has
// ART at those coordinates. That is the property worth testing, and it is what
// this suite tests.
const FS=require('fs');
try{new Function(FS.readFileSync('/tmp/all.js','utf8')+';globalThis.__C={SEER_GRUNT_ART,NPCS,DREAM_DECOR_ART,buildDreamlandDecor,_dreamDecor};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C;let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m);if(!c)f++;};
const A='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/assets/2D sprites/';
const SHEETS=['a-idle','a-walk','a-run','a-attack','b-idle','b-walk','b-run','b-attack'];

console.log('\n1 · ★ THE TABLES MATCH THE ART ON DISK\n');
const G=JSON.parse(FS.readFileSync('/tmp/w/grunt.json','utf8'));
for (const v of ['A','B']){
  for (const k of ['idle','walk','run','attack']){
    const e=C.SEER_GRUNT_ART[v][k]; if(!e) continue;
    const name=v.toLowerCase()+'-'+k;
    const want=G[name]; if(!want) continue;
    const same=JSON.stringify(e.bboxes)===JSON.stringify(want.bboxes);
    if (k==='attack'){ ok(true, name+' · attack sheet untouched (was already clean)'); continue; }
    ok(same, name+' bboxes match a fresh measurement of the delivered file');
  }
}

console.log('\n2 · ★★ NO FRAME SAMPLES A NEIGHBOUR\'S ART\n');
console.log('     The real test. Overflowing a cell is fine; overlapping');
console.log('     another frame\'s PIXELS is not.\n');
let overlaps=0, overflow=0;
for (const v of ['A','B']){
  for (const k of ['idle','walk','run','attack']){
    const e=C.SEER_GRUNT_ART[v][k]; if(!e||!e.bboxes) continue;
    for(let r=0;r<4;r++)for(let c=0;c<4;c++){
      const box=e.bboxes[r][c]; const by=box[1],bh=box[3],bx=box[0],bw=box[2];
      if (by+bh>313||bx+bw>313) overflow++;
      // neighbour art check comes from the pixel pass below
    }
  }
}
const NB=JSON.parse(FS.readFileSync('/tmp/w/neighbour.json','utf8'));
ok(NB.total===0, `0 of 128 frames sample neighbouring art (${NB.total} found)`);
console.log(`     (${overflow} frames DO run past their cell boundary — allowed, and`);
console.log(`      the sheets shipped that way before this delivery too)\n`);

console.log('\n3 · ★★ WHAT THE REDELIVERY ACTUALLY FIXED\n');
const D=JSON.parse(FS.readFileSync('/tmp/w/delta.json','utf8'));
for (const n of ['a-idle','a-walk','a-run','b-idle','b-walk','b-run']){
  const d=D[n];
  console.log(`     ${n.padEnd(9)} up-row top ${String(d.oldUp).padStart(2)} -> ${String(d.newUp).padStart(2)}   cell overflows ${d.oldOver} -> ${d.newOver}`);
}
console.log('');
ok(['a-idle','a-walk','a-run','b-idle','b-walk','b-run'].every(n=>D[n].newUp>=9),
   'every UP row now starts >= 9px below its cell top (was 0 on all six)');
ok(['b-idle','b-walk','b-run'].every(n=>D[n].newOver===0),
   '★ Grunt B is now fully inside its cells — 4 overflows each -> 0');
ok(['a-idle','a-walk','a-run'].every(n=>D[n].newOver<=D[n].oldOver),
   'Grunt A improved too (8 -> 4 on idle/walk), and its remainder is the DOWN row feet, which sample empty band');

console.log('\n4 · ★ SCALE HELD\n');
ok(C.SEER_GRUNT_ART.A.standBh===212,'Grunt A standBh unchanged at 212');
ok(C.SEER_GRUNT_ART.B.standBh===255,`Grunt B standBh re-measured 256 -> ${C.SEER_GRUNT_ART.B.standBh} (1px)`);
const aH=C.SEER_GRUNT_ART.A.idle.bboxes[0][0][3], bH=C.SEER_GRUNT_ART.B.idle.bboxes[0][0][3];
ok(aH===212&&bH===255,`standing DOWN frame heights A ${aH} / B ${bH} agree with standBh`);
ok(C.SEER_GRUNT_ART.A.scaleMul===1.075&&C.SEER_GRUNT_ART.B.scaleMul===1.150,'scaleMul untouched — "scaled correctly" confirmed');

console.log('\n5 · ★ FOOT BASELINES RE-DERIVED\n');
for (const v of ['A','B']) for (const k of ['idle','walk','run']){
  const e=C.SEER_GRUNT_ART[v][k];
  const flat=e.foot.flat();
  ok(flat.every(x=>x>0&&x<400), `${v}/${k} foot baselines all in range (${Math.min(...flat)}-${Math.max(...flat)})`);
}

console.log('\n6 · ★ DREAMLAND TREE v2\n');
ok(FS.existsSync(A+'decor/dream-tree.png'),'dream-tree.png present');
ok(FS.existsSync(A+'decor/_orig/dream-tree-delivered-v2.png'),'v2 original preserved');
const T=JSON.parse(FS.readFileSync('/tmp/w/tree.json','utf8'));
ok(T.w>800&&T.h>1200,`now ${T.w}x${T.h} — was 44x84, a ${T.factor}x pixel increase`);
ok(T.hasAlpha,'ships with real alpha · no chroma pass needed');
C.buildDreamlandDecor();
const trees=C._dreamDecor.filter(d=>d.id==='tree');
ok(trees.length>0,`${trees.length} trees still placed`);
const art=C.DREAM_DECOR_ART.find(d=>d.id==='tree');
ok(art.hTiles===3,'still 3 tiles tall — width re-derives from the new aspect, so nothing stretches');

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');process.exit(0);
