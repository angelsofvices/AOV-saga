// v0.95.661 · verify all progress persists, and ONLY a New Game overwrites.
const fs = require('fs');
const src = fs.readFileSync('/tmp/all.js', 'utf8');
const noop = () => {};
const pending = [];
const timers = [];        // setInterval callbacks so we can pump the autosave
global.setInterval = (f, ms) => { timers.push({ f, ms }); return timers.length; };
global.setTimeout = (f, ms) => { pending.push({ f, ms: ms || 0 }); return pending.length; };
global.clearInterval = noop; global.clearTimeout = noop;
const CTX = new Proxy({}, { get: () => () => ({ addColorStop: noop, width: 0, height: 0, data: [] }) });
const el = () => ({ style:{}, dataset:{}, classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},
  width:960, height:540, value:'', textContent:'', innerHTML:'', children:[], childNodes:[],
  getContext:()=>CTX, appendChild:noop, removeChild:noop, addEventListener:noop, removeEventListener:noop,
  setAttribute:noop, getAttribute:()=>null, focus:noop, remove:noop, play:()=>Promise.resolve(), pause:noop,
  querySelector:()=>el(), querySelectorAll:()=>[], getBoundingClientRect:()=>({left:0,top:0,width:960,height:540}) });
// capture window/document listeners so we can fire pagehide / visibilitychange
const WIN = {}, DOC = {};
global.addEventListener = (t, f) => { (WIN[t] ||= []).push(f); };
global.removeEventListener = noop;
global.document = { getElementById:()=>el(), querySelector:()=>el(), querySelectorAll:()=>[],
  createElement:()=>el(), addEventListener:(t,f)=>{ (DOC[t] ||= []).push(f); },
  body:el(), documentElement:el(), head:el(), hidden:false, visibilityState:'visible' };
global.window = global;
let STORE = {};
global.localStorage = { getItem:k=>STORE[k]??null, setItem:(k,v)=>{STORE[k]=String(v)}, removeItem:k=>{delete STORE[k]} };
global.Audio = function(){ return { play:()=>Promise.resolve(), pause:noop, addEventListener:noop, cloneNode(){return this} }; };
global.Image = function(){ return { addEventListener:noop, complete:false, naturalWidth:0, src:'' }; };
global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = noop;
global.matchMedia = () => ({ matches:false, addEventListener:noop, addListener:noop });
global.navigator = { userAgent:'node', getGamepads:()=>[], maxTouchPoints:0 };
global.performance = { now: () => Date.now() };
global.getComputedStyle = () => ({ getPropertyValue: () => '' });

try {
  new Function(src + ';globalThis.__C={player,game,saveGame,loadGame,saveOnExit,startNewGame,' +
    'resetPlayerToPristine,_PRISTINE_PLAYER,SAVE_KEY,rizerXPToNext,createZyrex};')();
} catch (e) { console.log('❌ BOOT FAILED:', e.message); process.exit(1); }
const C = globalThis.__C;
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) fails++; };
const P = C.player;
const flushT = () => { let n=0; while (pending.length && n++ < 30){ const q = pending.splice(0); q.forEach(t=>{try{t.f();}catch(_){}}); } };
flushT();
const autosave = () => timers.filter(t => t.ms === 5000).forEach(t => { try { t.f(); } catch(_){} });
const slot = () => { const k = Object.keys(STORE).find(k => { try { return !!JSON.parse(STORE[k]).player; } catch(_){ return false; } }); return k ? JSON.parse(STORE[k]) : null; };

console.log('\n1 · ★ AUTOSAVE IS NEVER SUPPRESSED\n');
ok(!/if \(game\.newGameUnsaved\) return;\s*\n\s*saveGame\(\);/.test(src),
   'the v0.95.609 "skip autosave for a whole NEW GAME session" exception is gone');
STORE = {};
C.game.scene = 'interior_home_2f';
P.rizerLvl = 7; P.rizerXP = 111; P.rxpUnlocked = true;
C.game.newGameUnsaved = true;          // even with the legacy flag set...
autosave();
ok(!!slot(), '...an autosave still writes (the flag no longer blocks it)');
ok(slot().player.rizerLvl === 7, `progress landed in the slot (Lv${slot().player.rizerLvl})`);

console.log('\n2 · SAVES EVERYWHERE, NOT JUST THE OVERWORLD\n');
for (const scene of ['overworld','interior_home','interior_research_lab','interior_treehouse','interior_seer_hq_1f']){
  STORE = {}; C.game.scene = scene;
  P.rizerXP = 100 + scene.length;
  autosave();
  ok(!!slot() && slot().player.rizerXP === P.rizerXP, `${scene.padEnd(24)} autosaves`);
}

console.log('\n3 · DELIBERATE SKIPS · title and mid-battle\n');
STORE = {}; C.game.scene = 'title'; autosave();
ok(!slot(), 'title screen writes nothing — there is no run to save');
console.log('     (mid-battle is also skipped: battleState is not part of the snapshot,');
console.log('      so saving there would restore a player inside a fight that no longer');
console.log('      exists. The tick 5s after the battle captures every reward.)');
ok(/if \(game\.scene === 'title' \|\| battleState \|\| wildBattleState\) return;/.test(src),
   'both skips are still explicit in the autosave tick');

console.log('\n4 · ★ SAVE ON EXIT · the up-to-5s hole is closed\n');
ok(typeof C.saveOnExit === 'function', 'saveOnExit() exists');
ok((WIN['pagehide'] || []).length > 0, 'pagehide listener registered');
ok((WIN['beforeunload'] || []).length > 0, 'beforeunload listener registered');
ok((DOC['visibilitychange'] || []).length > 0, 'visibilitychange listener registered');
STORE = {}; C.game.scene = 'overworld'; P.rizerXP = 4242;
(WIN['pagehide'] || []).forEach(f => f());
ok(!!slot() && slot().player.rizerXP === 4242, 'closing the tab commits progress immediately');
STORE = {}; P.rizerXP = 5151;
global.document.visibilityState = 'hidden';
(DOC['visibilitychange'] || []).forEach(f => f());
ok(!!slot() && slot().player.rizerXP === 5151, 'backgrounding the tab commits too (mobile Safari path)');
global.document.visibilityState = 'visible';
STORE = {}; C.game.scene = 'title';
(WIN['pagehide'] || []).forEach(f => f());
ok(!slot(), 'quitting from the title still writes nothing');

console.log('\n5 · ★ A NEW GAME IS THE ONLY THING THAT OVERWRITES\n');
// build a real run and save it
C.game.scene = 'overworld';
P.rizerLvl = 33; P.rizerXP = 900; P.items = { potion: 9, tower_battery: 2 };
P.metNpcs = { mom:{name:'Mom'} }; P.scrapjawTowersRestored = { malezor:true, korathen:true };
P.hasBackpack = true; P.rxpUnlocked = true;
STORE = {}; C.saveGame();
const before = slot().player;
ok(before.rizerLvl === 33, `an established run is in the slot (Lv${before.rizerLvl}, ${Object.keys(before.items).length} item types)`);
// now start a New Game
C.startNewGame(); flushT();
const after = slot().player;
ok(after.rizerLvl === 1, `New Game OVERWROTE the slot (Lv${before.rizerLvl} -> Lv${after.rizerLvl})`);
ok(!after.hasBackpack, 'the backpack flag is gone');
ok(!after.metNpcs || Object.keys(after.metNpcs).length === 0, 'contacts wiped');
ok(!after.scrapjawTowersRestored || Object.keys(after.scrapjawTowersRestored).length === 0, 'tower network wiped');
ok(after.rxpUnlocked === false, 'RXP re-locked for the new opening (v0.95.660 rule)');

console.log('\n6 · ★ THE RESET IS COMPLETE · nothing leaks into a "fresh" run\n');
console.log('     The title is reachable mid-session (restartToTitleScreen), so a New');
console.log('     Game started after playing MUST NOT inherit the old run — otherwise');
console.log('     it would write that old progress into the slot as a fresh game.\n');
ok(!!C._PRISTINE_PLAYER, 'a pristine boot snapshot was captured');
// dirty every progression field we can think of, then reset
Object.assign(P, { rizerLvl: 88, rizerXP: 7777, hasBackpack: true, phoneBattery: true,
  starterChosen: 'volcanut', scrapjawCompanion: true, bookshelfTaken: { x:true },
  towerBatteries: { veridan:true }, bonds: { kelthor: 90 }, party: [C.createZyrex('elzebub', 40)] });
C.resetPlayerToPristine();
const leaks = [];
for (const k of ['rizerLvl','rizerXP','hasBackpack','phoneBattery','starterChosen',
                 'scrapjawCompanion','bookshelfTaken','towerBatteries','bonds','party']){
  const now = JSON.stringify(P[k]);
  const pure = JSON.stringify(C._PRISTINE_PLAYER[k]);
  if (now !== pure) leaks.push(`${k}: ${now} != ${pure}`);
}
ok(leaks.length === 0, `no progression field survived the reset${leaks.length ? ' — ' + leaks.join(' · ') : ''}`);
ok(P.rizerLvl === 1, 'level back to 1');
ok(!/Object\.keys\(player\)\.forEach\(k *=> *player\[k\] *= *undefined\)/.test(src),
   'reset deletes keys rather than setting undefined (so `k in player` is honest)');

console.log('\n7 · ROUND TRIP AFTER A NEW GAME\n');
C.game.scene = 'overworld';
P.rizerLvl = 4; P.rizerXP = 55; P.rxpUnlocked = true;
C.saveGame();
P.rizerLvl = 1; P.rizerXP = 0;
C.loadGame(); flushT();
ok(P.rizerLvl === 4 && P.rizerXP === 55, 'save -> load still round-trips after the reset path');

console.log(fails ? `\n❌ ${fails} failure(s)` : '\n✅ ALL CHECKS PASS');
process.exit(0);
