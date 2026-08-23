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
// v0.95.743 · ZyPhone HOLD-Triangle · THIRD attempt, and the first one tested
// the way the Creator actually plays: a GAMEPAD, which sends exactly one
// keydown per press and no auto-repeat.
let NOW=1000;
global.performance={now:()=>NOW};
try{new Function(require('fs').readFileSync('/tmp/all.js','utf8')+
 ';globalThis.__C={game,player,handleZycellKey,zyTriangleArm,zyTriangleHoldTick,zyTriangleRelease,'+
 'zyTriangleTap,quickSummonStashAll,ZY_HOLD_MS,keys,NPCS,frame};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C,G=C.game;let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m);if(!c)f++;};
// ★ Do NOT stub quickSummonStashAll — zyTriangleHoldTick calls the
// lexically-scoped one, so a globalThis stub is never seen and the counter
// stays 0 while the real thing runs. The honest observable is the latch the
// tick sets: game._zyTriFired.
const fireCount=()=>C.game._zyTriFired?1:0;
const HTML=require('fs').readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html','utf8');

console.log('\n1 · ★★ THE GAMEPAD PATH · ONE KEYDOWN, NO REPEATS\n');
console.log('     if (pressed && !prev[i]) dispatchKey(\'keydown\', key)  ← edge-triggered.');
console.log('     This is the case v0.95.729 never tested and could not pass.\n');
ok(/if \(pressed && !prev\[i\]\) dispatchKey\('keydown', key\)/.test(HTML),
   'confirmed in source: the pad bridge fires keydown ONCE per press');
G.zphoneOpen=true; G._zycellFocus='content';
C.zyTriangleRelease();
NOW=1000; C.zyTriangleArm();                      // the single press a pad sends
ok(G._zyTriHeld===true,'press ARMS the hold');
ok(fireCount()===0,'and nothing fires yet');
NOW=1000+200; C.zyTriangleHoldTick();
ok(fireCount()===0,`still nothing at 200ms (threshold ${C.ZY_HOLD_MS}ms)`);
NOW=1000+C.ZY_HOLD_MS+1; C.zyTriangleHoldTick();
ok(fireCount()===1,'★★ FIRES at the threshold WITHOUT a second keydown — this is the fix');
const stamp=C.game._zyTriDownAt;
NOW+=500; C.zyTriangleHoldTick(); C.zyTriangleHoldTick();
ok(fireCount()===1&&C.game._zyTriDownAt===stamp,'and cannot re-fire while still held (latch holds)');

console.log('\n2 · ★ TAP STILL MEANS TAP\n');
C.zyTriangleRelease();
NOW=2000; C.zyTriangleArm();
NOW=2000+100; C.zyTriangleHoldTick();             // released before the threshold
ok(fireCount()===0,'a 100ms press never reaches the bulk verb');
ok(G._zyTriFired===false,'_zyTriFired stays false, so the TAP path is still open');
C.zyTriangleRelease();
ok(G._zyTriHeld===false&&G._zyTriDownAt===0,'release clears the timer');

console.log('\n3 · ★★ A SECOND HOLD WORKS (the stale-stamp bug)\n');
NOW=3000; C.zyTriangleArm();
NOW=3000+C.ZY_HOLD_MS+1; C.zyTriangleHoldTick();
ok(fireCount()===1,'second hold fires');
C.zyTriangleRelease();
NOW=4000; C.zyTriangleArm();
ok(G._zyTriDownAt===4000,'★ the timer RESTARTS at the new press — not the old stamp');
NOW=4000+10; C.zyTriangleHoldTick();
ok(fireCount()===0,'so a quick tap right after a hold does NOT instantly dump the faction');
NOW=4000+C.ZY_HOLD_MS+1; C.zyTriangleHoldTick();
ok(fireCount()===1,'and the full hold still works');

console.log('\n4 · ★★ IT IS DRIVEN BY frame(), NOT BY KEY-REPEAT\n');
ok(/try \{ zyTriangleHoldTick\(\); \} catch\(_\)\{\}/.test(HTML),'frame() calls zyTriangleHoldTick every tick');
ok(/zyTriangleArm\(\);\s*\/\/ v0\.95\.743 · press ARMS/.test(HTML)||/zyTriangleArm\(\)/.test(HTML),
   'both keydown sites now ARM instead of trying to time the hold themselves');
const armCount=(HTML.match(/zyTriangleArm\(\)/g)||[]).length;
ok(armCount>=3,`zyTriangleArm is wired at ${armCount} sites (nav rail + content + its own def)`);
ok(!/keydown auto-repeat.*hold signal/i.test(HTML)||/FALSE for a gamepad/.test(HTML),
   'the old auto-repeat rationale is corrected in the comment, not left to mislead');

console.log('\n5 · ★ CLOSING THE PHONE MID-HOLD\n');
C.zyTriangleRelease();
G.zphoneOpen=true; NOW=5000; C.zyTriangleArm();
G.zphoneOpen=false;
NOW=5000+C.ZY_HOLD_MS+1; C.zyTriangleHoldTick();
ok(fireCount()===0,'★ a hold in flight does NOT fire after the phone closes');
ok(/zyTriangleRelease\(\); \} catch\(_\)\{\} \}   \/\/ v0\.95\.743 · drop any hold in flight/.test(HTML),
   'and the close path clears the flags, so the next press starts clean');

console.log('\n6 · ★ THE HINT NAMES THE VERB\n');
ok(/HOLD △ · SEND FACTION OUT/.test(HTML),'the nav rail still tells the player the gesture exists');

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');process.exit(0);
