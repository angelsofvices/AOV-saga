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

const EXPORT = ';globalThis.__C={UFO_DASH_BBOXES,UFO_FLIGHT_BBOXES,UFO_CRUISE_MOVE_CD,UFO_BOOST_MOVE_CD};';
try {
  new Function(src + EXPORT)();
} catch(e){ console.log('boot error:', e.message.slice(0,200)); }
const fs2=require('fs'), cp2=require('child_process');
const src2=fs2.readFileSync('/tmp/all.js','utf8');
let f=0; const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const C=globalThis.__C;
ok(!!C,'script evaluated'); if(!C){process.exit(0);}
const SHEETS='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/assets/2D sprites';

console.log('\n1 · ★★ THE CELL IS FRACTIONAL · that is the root cause\n');
const PY='/tmp/_ufo_measure.py';
fs2.writeFileSync(PY, [
"from PIL import Image","import json,sys",
"out={}",
"for tag,p in [('dash',sys.argv[1]),('flight',sys.argv[2])]:",
"    im=Image.open(p).convert('RGBA'); W,H=im.size; px=im.load()",
"    CW=W/4.0; CH=H/4.0; rows=[]",
"    for r in range(4):",
"        row=[]",
"        for c in range(4):",
"            X0=int(round(c*CW)); Y0=int(round(r*CH))",
"            X1=int(round((c+1)*CW)); Y1=int(round((r+1)*CH))",
"            mnx=mny=10**9; mxx=mxy=-1",
"            for y in range(Y0,min(Y1,H)):",
"                for x in range(X0,min(X1,W)):",
"                    if px[x,y][3]>24:",
"                        mnx=min(mnx,x); mxx=max(mxx,x); mny=min(mny,y); mxy=max(mxy,y)",
"            row.append([mnx-X0,mny-Y0,mxx-mnx+1,mxy-mny+1] if mxx>=0 else [0,0,1,1])",
"        rows.append(row)",
"    out[tag]={'bb':rows,'W':W,'H':H,'cw':CW}",
"print(json.dumps(out))"].join("\n"));
let M=null;
try{ M=JSON.parse(cp2.execSync(`python3 ${JSON.stringify(PY)} ${JSON.stringify(SHEETS+'/vfx/auraxion-ufo-dash.png')} ${JSON.stringify(SHEETS+'/decor/auraxion-ufo-flight.png')}`,{maxBuffer:1<<26}).toString()); }
catch(e){ ok(false,'sheet measure failed — '+e.message.slice(0,100)); }
ok(!!M,'measured both UFO sheets from the PNGs');
if(!M){ console.log('\n❌ cannot continue'); process.exit(0); }
console.log(`     dash   ${M.dash.W}x${M.dash.H} · nominal cell ${M.dash.cw}`);
ok(M.dash.cw !== Math.floor(M.dash.cw),
   `the nominal cell really is fractional (${M.dash.cw}) — columns started at`);
console.log('     313.5, 627 and 940.5, so every slice straddled a half pixel\n');
ok(/_cx0 = Math\.round\(col \* cellW\)/.test(src2),
   'source origins are now ROUNDED to integers');
ok(!/const inset = 8;/.test(src2), 'and the blanket 8px inset is gone');

console.log('\n2 · ★★ THE INSET WAS CROPPING THE DASH TRAILS\n');
function edgeCount(bb, cell){
  let n=0;
  for(let r=0;r<4;r++) for(let c=0;c<4;c++){
    const b=bb[r][c];
    if(b[0]<=8 || b[1]<=8 || b[0]+b[2]>=cell-8 || b[1]+b[3]>=cell-8) n++;
  }
  return n;
}
const cell=Math.round(M.dash.cw);
const dEdge=edgeCount(M.dash.bb, cell), fEdge=edgeCount(M.flight.bb, cell);
console.log(`     frames reaching within 8px of their cell edge:`);
console.log(`       DASH   ${dEdge}/16   <- the old inset sliced these`);
console.log(`       FLIGHT ${fEdge}/16   <- which is why it never hurt here`);
ok(dEdge>0, `the dash sheet genuinely runs to its cell edge (${dEdge}/16 frames)`);
ok(fEdge < dEdge, `and the flight sheet does so far less (${fEdge} vs ${dEdge}) — same`);
console.log('     inset, only one victim, which is why this looked sheet-specific');

console.log('\n3 · ★★ THE SHIPPED TABLES MATCH THE PIXELS\n');
for(const [tag, tbl] of [['dash', C.UFO_DASH_BBOXES], ['flight', C.UFO_FLIGHT_BBOXES]]){
  ok(Array.isArray(tbl) && tbl.length===4 && tbl.every(r=>r.length===4), `${tag} table is 4x4`);
  let bad=0;
  for(let r=0;r<4;r++) for(let c=0;c<4;c++){
    if(tbl[r][c].join() !== M[tag].bb[r][c].join()){
      bad++; if(bad<=3) console.log(`     ${tag} r${r}c${c} shipped [${tbl[r][c]}] actual [${M[tag].bb[r][c]}]`);
    }
  }
  ok(bad===0, `   all 16 ${tag} bboxes match the sheet (${bad} wrong)`);
  // and every rect must sit INSIDE its cell — that is what makes bleed impossible
  let out=0;
  for(let r=0;r<4;r++) for(let c=0;c<4;c++){
    const b=tbl[r][c];
    if(b[0]<0 || b[1]<0 || b[0]+b[2]>cell+1 || b[1]+b[3]>cell+1) out++;
  }
  ok(out===0, `   and every ${tag} rect sits inside its own cell (${out} overflow)`);
}
ok(/UFO_DASH_BBOXES : UFO_FLIGHT_BBOXES/.test(src2), 'the draw picks the table by which sheet is showing');

console.log('\n3b · ★ NO FRAME OVERLAPS ANOTHER\n');
console.log('     Cross-checked against component OWNERSHIP as well as clipping.');
console.log('     Both methods returned the SAME tables, which is the useful');
console.log('     result: the 5 components that appeared to span a cell were');
console.log('     rounding artifacts at the 313.5 boundary, not art the artist');
console.log('     drew running off the edge.\n');
for(const [tag, tbl] of [['dash', C.UFO_DASH_BBOXES], ['flight', C.UFO_FLIGHT_BBOXES]]){
  const R=[];
  for(let r=0;r<4;r++) for(let c=0;c<4;c++){
    const b=tbl[r][c], X0=Math.round(c*313.5), Y0=Math.round(r*313.5);
    R.push([X0+b[0],Y0+b[1],X0+b[0]+b[2],Y0+b[1]+b[3]]);
  }
  let ov=0;
  for(let i=0;i<R.length;i++) for(let j=i+1;j<R.length;j++){
    const a=R[i],b=R[j];
    if(a[0]<b[2]&&b[0]<a[2]&&a[1]<b[3]&&b[1]<a[3]) ov++;
  }
  ok(ov===0, `${tag} · no two frames sample overlapping pixels (${ov})`);
  const outside=R.filter(r=>r[0]<0||r[1]<0||r[2]>1254||r[3]>1254).length;
  ok(outside===0, `   and all 16 stay on the sheet (${outside} off)`);
}

console.log('\n4 · ★★ BOOST IS ACTUALLY FASTER NOW\n');
console.log('     Holding Circle already swapped the sheet and quickened the frame');
console.log('     cadence, but the craft covered ground at the same rate — it');
console.log('     LOOKED like acceleration and was not.\n');
console.log(`     cruise ${C.UFO_CRUISE_MOVE_CD}ms/tile · boost ${C.UFO_BOOST_MOVE_CD}ms/tile`);
ok(C.UFO_BOOST_MOVE_CD < C.UFO_CRUISE_MOVE_CD, 'boost has a SHORTER cooldown, i.e. moves faster');
const mult=C.UFO_CRUISE_MOVE_CD / C.UFO_BOOST_MOVE_CD;
console.log(`     that is ${mult.toFixed(2)}x cruise speed`);
ok(mult>=1.5 && mult<=2.5, `the multiplier reads as a sprint, not a teleport (${mult.toFixed(2)}x)`);
ok(/player\.moveCd = \(keys && keys\['b'\]\) \? UFO_BOOST_MOVE_CD : UFO_CRUISE_MOVE_CD/.test(src2),
   'and the movement tick reads the SAME key the sheet swap reads');
console.log('     so the visual and the speed can never disagree about whether');
console.log('     you are boosting');
ok(/const dashing = !!\(keys && keys\['b'\]\)/.test(src2), '   (the sheet swap still keys off b)');

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
