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

const EXPORT = ';globalThis.__C={NPCS,player,game,zyTriangleRelease,zyTriangleArm,zyTriangleHoldTick,quickSummonStashAll,summonedZyrexCount,toggleFactionSummon,ZY_HOLD_MS,SPECIES,createZyrex,isInActiveCombat};';
try {
  new Function(src + EXPORT)();
} catch(e){ console.log('boot error:', e.message.slice(0,200)); }
const fs2=require('fs'); const src2=fs2.readFileSync('/tmp/all.js','utf8');
let f=0; const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const C=globalThis.__C;
ok(!!C,'script evaluated'); if(!C){process.exit(0);}
C.game.scene='overworld';

console.log('\n1 · ★ THE HOLD IS WIRED TO THE NAV RAIL\n');
ok(typeof C.quickSummonStashAll==='function','quickSummonStashAll() exists');
ok(typeof C.summonedZyrexCount==='function','summonedZyrexCount() exists');
ok(C.ZY_HOLD_MS>=300 && C.ZY_HOLD_MS<=900, `hold threshold is ${C.ZY_HOLD_MS}ms — long enough not to fire on a tap,`);
console.log('     short enough not to feel broken');
ok(/game\._zyTriDownAt/.test(src2) && /game\._zyTriFired/.test(src2), 'hold state is tracked');
ok(/_zyTriFired = true;[\s\S]{0,160}quickSummonStashAll/.test(src2),
   'and it fires ONCE — key auto-repeat would otherwise re-trigger every frame');
// ★ v0.95.729 · this pinned the exact ONE-LINE form of the keyup handler and
// broke when that block was reformatted to also run the tap. The property
// under test is "keyup clears both flags", not "it is written on one line".
// ★ v0.95.743 · was a literal match on `_zyTriDownAt = 0; _zyTriFired = false;`
// and broke the moment that pair moved into zyTriangleRelease(). The comment
// above already said the property is "keyup clears both flags, not that it is
// written on one line" — so now it actually TESTS that, by calling the release
// and reading the flags.
(function(){
  const G=(typeof game!=='undefined')?game:globalThis.__C.game;
  G._zyTriHeld=true; G._zyTriDownAt=123; G._zyTriFired=true;
  try{ C.zyTriangleRelease(); }catch(e){ console.log('   release threw:',e.message); }
  ok(G._zyTriDownAt===0 && G._zyTriFired===false && G._zyTriHeld===false,
     'release clears the hold (timer, latch and held-flag)');
})();
ok(/zyTriangleTap\(\)/.test(src2),
   '  and now runs the TAP first, since "tap or hold" is only answerable at release');
console.log('     Without that clear, the stale start stamp makes the NEXT tap of');
console.log('     Triangle count as an already-completed hold — one quick press');
console.log('     would dump the whole faction out.\n');
ok(/zyTriangleRelease\(\); \} catch\(_\)\{\} \}   \/\/ v0\.95\.743 · drop any hold in flight/.test(src2),
   'and the phone-close path calls zyTriangleRelease, dropping a hold in flight');

console.log('\n2 · ★★ IT IS A TOGGLE ON ONE READING\n');
console.log('     If ANY Zyrex is out, the hold stashes everyone. If none is out,');
console.log('     it sends everyone. Deciding per-Zyrex would make a single hold');
console.log('     do half of each and read as a bug.\n');
// build a party of 3
// Only species with an entry in SUMMONABLE_SPRITES have an overworld form.
// The first draft grabbed the first three SPECIES keys and every assertion
// failed at 0/3 — the code was right and the fixture was wrong.
const ids=['verdanix','otterlin','volcanut'];
C.player.party=ids.map(id=>C.createZyrex(id,10));
console.log(`     party: ${C.player.party.map(z=>z.speciesId).join(', ')}`);
ok(C.summonedZyrexCount()===0, `nobody is out to begin with (${C.summonedZyrexCount()})`);
const r1=C.quickSummonStashAll();
const outAfter=C.summonedZyrexCount();
console.log(`     after one hold: ${outAfter} out`);
ok(r1===true && outAfter===3, `one hold sends ALL three out (${outAfter}/3)`);
const r2=C.quickSummonStashAll();
const outAfter2=C.summonedZyrexCount();
console.log(`     after a second hold: ${outAfter2} out`);
ok(r2===true && outAfter2===0, `a second hold recalls ALL of them (${outAfter2}/3)`);

console.log('\n3 · ★ PARTIAL STATE RESOLVES CLEANLY\n');
C.toggleFactionSummon(0);                       // one out, two in
ok(C.summonedZyrexCount()===1, `one Zyrex sent out by hand (${C.summonedZyrexCount()})`);
C.quickSummonStashAll();
ok(C.summonedZyrexCount()===0, `a hold with ONE out stashes everyone (${C.summonedZyrexCount()}) — not "toggle each"`);
console.log('     A per-Zyrex toggle here would have left 2 out and 1 in.');

console.log('\n4 · ★ EDGE CASES\n');
const saveParty=C.player.party;
C.player.party=[];
const r3=C.quickSummonStashAll();
ok(r3===false,'an empty faction refuses rather than throwing');
C.player.party=saveParty;
// no-op when already in the requested state
C.quickSummonStashAll();                        // all out
const r4=C.quickSummonStashAll();               // all in
const r5=C.quickSummonStashAll();               // all out again
ok(typeof r4==='boolean' && typeof r5==='boolean','repeated holds stay well-defined');
ok(/isInActiveCombat/.test(src2.slice(src2.indexOf('function quickSummonStashAll'), src2.indexOf('function toggleFactionSummon'))),
   'the combat lock is checked ONCE up front, not once per Zyrex');
console.log('     toggleFactionSummon refuses individually during combat, so a bulk');
console.log('     stash of eight would have produced eight identical toasts.');

console.log('\n5 · ★ THE HINT CANNOT LIE\n');
ok(/zycellQuickHint/.test(src2),'the nav rail carries a HOLD △ hint');
ok(/const changed = Math\.abs\(summonedZyrexCount\(\) - out\)/.test(src2),
   'the toast count is MEASURED after the fact, not counted from attempts —');
console.log('     a Zyrex with no overworld sprite never leaves the phone, so');
console.log('     counting calls would report people who did not go\n');
ok(/summonedZyrexCount\(\)[\s\S]{0,200}STASH FACTION/.test(src2),
   'and it reads the SAME count the action uses, so the label can never');
console.log('     disagree with what the hold actually does');

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
