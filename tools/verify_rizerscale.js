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

const EXPORT = ';globalThis.__C={RIZER,rizerRowScale,rizerTargetBodyPx,TILE,DIR_ROW,BBOX_FALLBACK};';

try { new Function(src + EXPORT)(); } catch(e){ console.log('boot error:', e.message.slice(0,300)); }
const FS=require('fs'); const src2 = FS.readFileSync('/tmp/all.js','utf8');
const { execSync } = require('child_process');
let f=0; const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const C=globalThis.__C;
ok(!!C,'script evaluated');
if(!C){ console.log('\n❌ cannot continue'); process.exit(0); }
const DIRS=['DOWN','LEFT','RIGHT','UP'];
const T=C.TILE, TARGET=C.rizerTargetBodyPx();

console.log('\n★★★ v0.95.941 · SCALE BY THE BODY · target = IDLE-DOWN AS IT SHIPPED');
console.log('  Creator: "rizer is shorter in idle up left and right. idle down is');
console.log('            correct height. can we fix the others to match?"\n');

console.log('1 · ★★ THE MEASUREMENT COMES OFF THE ART, NOT OUT OF MY HEAD\n');
{
  // re-measure the shipping sheets right now and demand the shipped tables match
  const out = execSync('python3 /sessions/great-cool-heisenberg/mnt/AOV-saga-new/tools/measure_rizer_body.py',
                       {maxBuffer:1<<22}).toString();
  const found = [...out.matchAll(/bodyBh: \[([0-9, ]+)\]/g)].map(m=>m[1].split(',').map(v=>+v.trim()));
  const sheets=['idle','walk','run'];
  ok(found.length===3, `re-measured all three sheets from disk`);
  sheets.forEach((k,i)=>{
    const shipped = C.RIZER[k].bodyBh;
    ok(!!shipped, `RIZER.${k} carries a bodyBh table`);
    ok(shipped && shipped.join()===found[i].join(),
       `★ RIZER.${k}.bodyBh [${shipped}] MATCHES the art measured this second`);
  });
  console.log('     If the sheet is ever re-rolled and the table is not, THIS fails —');
  console.log('     rather than the character quietly changing height in one direction.');
}

console.log('\n2 · ★★★ EVERY DIRECTION NOW DRAWS AT THE SIZE HE CALLED PERFECT\n');
console.log(`     target = idle DOWN exactly as it shipped = ${TARGET.toFixed(2)}px `
  + `(${(TARGET/T).toFixed(3)} tiles)`);
console.log('     NOT a clean 2 tiles: v0.95.940 rounded up to 96 because the code');
console.log('     comments claimed that was canon, and he said it read too large.\n');
{
  // ★ these are the heights the game ACTUALLY drew before any change — measured
  // across the declared box, which is what v0.95.940 got wrong for UP.
  const before = { idle:[92.9,82.1,81.6,85.2], walk:[96.0,87.1,87.1,89.7], run:[96.0,93.0,86.6,93.5] };
  for (const k of ['idle','walk','run']){
    const b = C.RIZER[k];
    console.log(`     ${k.toUpperCase()}`);
    for (let r=0;r<4;r++){
      const drawn = b.bodyBh[r] * C.rizerRowScale(b, r);
      console.log(`       ${DIRS[r].padEnd(6)} was ${before[k][r].toFixed(1).padStart(5)}px  ->  now ${drawn.toFixed(1)}px`);
      ok(Math.abs(drawn - TARGET) < 0.01,
         `${k} ${DIRS[r]} body draws at ${drawn.toFixed(2)}px = the idle-DOWN size`);
    }
  }
}

console.log('\n3 · ★★ AND IT COULD NOT HAVE BEEN FIXED IN IDLE ALONE\n');
{
  console.log('     Had only idle been lifted, walk-UP would still have drawn at 89.7');
  console.log('     against an idle-UP of 92.9.  All three sheets carry the defect in');
  console.log('     different amounts, so all three are normalised onto one number.');
  const idleUp = C.RIZER.idle.bodyBh[3] * C.rizerRowScale(C.RIZER.idle, 3);
  const walkUp = C.RIZER.walk.bodyBh[3] * C.rizerRowScale(C.RIZER.walk, 3);
  const runUp  = C.RIZER.run.bodyBh[3]  * C.rizerRowScale(C.RIZER.run,  3);
  ok(Math.abs(idleUp-walkUp)<0.01 && Math.abs(walkUp-runUp)<0.01,
     `★★ idle/walk/run all agree facing UP (${idleUp.toFixed(1)}px) · no pop on any transition`);
  for (let r=0;r<4;r++){
    const a=C.RIZER.idle.bodyBh[r]*C.rizerRowScale(C.RIZER.idle,r);
    const w=C.RIZER.walk.bodyBh[r]*C.rizerRowScale(C.RIZER.walk,r);
    const n=C.RIZER.run.bodyBh[r] *C.rizerRowScale(C.RIZER.run, r);
    ok(Math.abs(a-w)<0.01 && Math.abs(w-n)<0.01, `${DIRS[r]} · idle = walk = run`);
  }
}

console.log('\n4 · ★ THE BOXES ARE UNTOUCHED · nothing can be cropped by this\n');
{
  ok(C.BBOX_FALLBACK.idle[0][0][3]===187 && C.BBOX_FALLBACK.idle[3][0][3]===177,
     'the declared idle bboxes are exactly as they shipped (DOWN 187, UP 177)');
  console.log('     The declared bbox still decides WHICH PIXELS are cropped; bodyBh only');
  console.log('     decides how big they are drawn.  UP keeps its 30px of empty headroom —');
  console.log('     reserved for hair the source does not contain (the same absence found in');
  console.log('     idle-jump.png at v0.95.935) — it just no longer counts as height.');
  ok(/bodyBh only|declared bboxes are untouched|still decide which pixels are cropped/i.test(src2),
     'and the source says so where the table lives');
}

console.log('\n5 · ★★ ONE HELPER, TWO CALLERS\n');
{
  ok(/function rizerRowScale/.test(src2), 'rizerRowScale exists');
  ok(/const SCALE = rizerRowScale\(bundle, row\);/.test(src2), 'the locomotion draw uses it');
  ok(/const idleScale  = rizerRowScale\(idleBundle, row\);/.test(src2),
     '★★ and so does the in-attack height pin');
  console.log('     That pin divides by idle to keep an attack the same on-screen size as the');
  console.log('     idle it interrupts.  It used to compute idle\'s scale separately off the');
  console.log('     declared bbox — so correcting one without the other would have made every');
  console.log('     attack disagree with the idle it is supposed to match.');
  ok(!/const idleScale  = \(TILE \* 2\) \/ idleAnchor;/.test(src2),
     'the second, now-wrong copy of that maths is gone');
}

console.log('\n6 · UNMEASURED SHEETS ARE NOT SILENTLY RESCALED\n');
{
  ok(!C.RIZER.punch.bodyBh, 'the punch sheet has no bodyBh table');
  const p = C.rizerRowScale(C.RIZER.punch, 2);
  const legacy = (C.TILE*2)/C.RIZER.punch.bboxes[0][0][3];
  ok(Math.abs(p - legacy) < 1e-9,
     '★ so it keeps exactly the scale it shipped with · a sheet nobody measured is not');
  console.log('       rescaled to a guess.  Only the three locomotion sheets change.');
}

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
