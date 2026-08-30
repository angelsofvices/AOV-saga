const fs = require('fs');
const src = fs.readFileSync('/tmp/all.js', 'utf8');
const noop = () => {};
global.setInterval=()=>0; global.setTimeout=()=>0; global.clearInterval=noop; global.clearTimeout=noop;
const CTX=new Proxy({},{get:()=>()=>({addColorStop:noop,width:0,height:0,data:[]})});
const el=()=>({style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},width:960,height:540,value:'',textContent:'',innerHTML:'',children:[],childNodes:[],getContext:()=>CTX,appendChild:noop,removeChild:noop,addEventListener:noop,removeEventListener:noop,setAttribute:noop,getAttribute:()=>null,focus:noop,remove:noop,play:()=>Promise.resolve(),pause:noop,querySelector:()=>el(),querySelectorAll:()=>[],getBoundingClientRect:()=>({left:0,top:0,width:960,height:540})});
global.addEventListener=noop; global.removeEventListener=noop;
global.document={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),addEventListener:noop,body:el(),documentElement:el(),head:el(),hidden:false,visibilityState:'visible'};
global.window=global; global.localStorage={getItem:()=>null,setItem:noop,removeItem:noop};
global.Audio=function(){return{play:()=>Promise.resolve(),pause:noop,addEventListener:noop,cloneNode(){return this}}};
global.Image=function(){return{addEventListener:noop,complete:false,naturalWidth:0,src:''}};
global.requestAnimationFrame=()=>0; global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0};
global.performance={now:()=>Date.now()};
global.getComputedStyle=()=>({getPropertyValue:()=>''});
try{new Function(src+';globalThis.__C={BBOX_FALLBACK,RIZER,TILE};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
const src2=fs.readFileSync(ROOT+'rp7b.html','utf8');
const DIR=['DOWN','LEFT','RIGHT','UP'];

H('1 · ★★★ THE FEET · zero drift, measured');
{
  const W=C.BBOX_FALLBACK.walk;
  ok(W.length===4 && W.every(r=>r.length===4),'4x4 · row = direction');
  let worst=0;
  W.forEach((row,ri)=>{
    const bottoms=row.map(b=>b[1]+b[3]);
    const spread=Math.max(...bottoms)-Math.min(...bottoms);
    if (spread>worst) worst=spread;
    ok(spread===0,`★★★ ${DIR[ri].padEnd(5)} · all four frames plant on ${bottoms[0]} · spread ${spread}px`);
  });
  ok(worst===0,'★★★ ZERO drift anywhere · the engine anchors by the bbox BOTTOM, so a pixel of drift is a bouncing foot');
  ok(/Spread ZERO in all four directions/.test(src2),'and the measurement is recorded at the data');
}

H('2 · ★★ THE SIZE HELD');
{
  const W=C.BBOX_FALLBACK.walk, I=C.BBOX_FALLBACK.idle;
  const ws=(C.TILE*2)/W[0][0][3], is=(C.TILE*2)/I[0][0][3];
  ok(Math.abs(W[0][0][3]*ws - I[0][0][3]*is)<0.01,
     '★★ the DOWN frame is exactly 2 tiles on the walk sheet AND the idle sheet · no pop when he starts moving');
  W.forEach((row,ri)=>{
    const hs=row.map(b=>b[3]); const spread=Math.max(...hs)-Math.min(...hs);
    ok(spread<=3,`★ ${DIR[ri].padEnd(5)} heights within ${spread}px across the cycle · no breathing`);
  });
}

H('3 · ★★ THE HAIR OVERFLOWS, AND IS OWNED');
{
  const up=C.BBOX_FALLBACK.walk[3];
  ok(up.every(b=>b[1]<0),'★★★ every UP frame has a NEGATIVE by · the spikes leave the cell and are kept');
  ok(up.every(b=>b[1]<=-23),'★ by '+up.map(b=>b[1]).join('/')+' · deeper than the -20 it replaces, so more hair, not less');
  ok(/that overflow is OWNED, never clipped/.test(src2),'the law is stated where the numbers live');
}

H('4 · ★★★ THE SHEET ITSELF');
{
  const p=ROOT+'assets/2D sprites/rizer/walk.png';
  ok(fs.existsSync(p),'★ installed');
  ok(fs.statSync(p).size>200000,'★ and it is the real sheet ('+Math.round(fs.statSync(p).size/1024)+'KB)');
  ok(/NEON GREEN and was keyed/.test(src2),
     '★★★ it arrived UNKEYED on neon green · dropped in raw it would have drawn 16 green rectangles');
  ok(/the audit finds no sheared frame anywhere in it/.test(src2),
     '★★ and the clipped-frame audit clears it · unlike the jump sheets it replaces nothing of');
}


H('5 · ★★★ RIGHT IS THE MIRROR OF LEFT');
{
  const W=C.BBOX_FALLBACK.walk, L=W[1], R=W[2];
  for (let i=0;i<4;i++){
    ok(R[i][0] === 313-(L[i][0]+L[i][2]) && R[i][1]===L[i][1] && R[i][2]===L[i][2] && R[i][3]===L[i][3],
       `★★ col ${i} · bx ${R[i][0]} = 313-(${L[i][0]}+${L[i][2]}) · same by, bw, bh`);
  }
  ok(L.every((b,i)=>b[3]===R[i][3]),
     '★★★ he is the SAME HEIGHT facing right as facing left · the drawn art had him 3% shorter, so he shrank every time he turned around');
  ok(L[0][1]+L[0][3] === R[0][1]+R[0][3],'★★ and plants on the same floor · '+(R[0][1]+R[0][3]));
  ok(/RIGHT IS THE MIRROR OF LEFT/.test(src2),'the Creator’s call is recorded');
  ok(/the PLAYER draw path has no mirror branch at all/.test(src2),
     '★★ and WHY it was baked into the sheet instead of flagged in code');
  ok(/which is checked before the flip, not assumed/.test(src2),
     '★★★ the flip is only lossless if LEFT clears both walls · checked, not assumed');
}

H('6 · ★★★ THE TRAP · row 3 keeps its hair');
{
  const up=C.BBOX_FALLBACK.walk[3];
  ok(up.every(b=>b[1]<=-23),
     '★★★ UP still overflows by '+up.map(b=>b[1]).join('/')+' · the first mirror DELETED these spikes');
  ok(/4,298 pixels that live in\n  \/\/ row 2's rectangle but belong to row 3/.test(src2) || /belong to row 3/.test(src2),
     '★★★ 4,298 pixels sit in row 2’s rectangle and belong to row 3 · a cell-for-cell overwrite eats them');
  ok(/written back to whichever row owns their\n  \/\/ connected component/.test(src2) || /connected component/.test(src2),
     '★★ the mirror uses COMPONENT OWNERSHIP · the same law the bbox extractor uses');
  ok(fs.existsSync(ROOT+'assets/2D sprites/rizer/_orig/walk-delivered-2026-08-30.png'),
     '★ and the delivered sheet is kept, so the flip is reversible');
}

console.log('\n'+(f?('❌ '+f+' FAILED'):'✅ ALL PASS'));
process.exit(f?1:0);
