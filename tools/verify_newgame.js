// v0.95.662 · verify New Game cannot destroy a save without confirmation.
const fs = require('fs');
const src = fs.readFileSync('/tmp/all.js', 'utf8');
const noop = () => {};
const pending = [];
global.setInterval = () => 0;
global.setTimeout = (f, ms) => { pending.push({ f, ms: ms || 0 }); return pending.length; };
global.clearInterval = noop; global.clearTimeout = noop;
const CTX = new Proxy({}, { get: () => () => ({ addColorStop: noop, width: 0, height: 0, data: [] }) });
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
  new Function(src + ';globalThis.__C={player,game,saveGame,loadGame,startNewGame,requestNewGame,' +
    'handleNewGameConfirmKey,drawNewGameConfirm,savedRunSummary,SAVE_KEY,' +
    'getConfirm:()=>newGameConfirm,setConfirm:(v)=>{newGameConfirm=v;}};')();
} catch (e) { console.log('❌ BOOT FAILED:', e.message); process.exit(1); }
const C = globalThis.__C;
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) fails++; };
const P = C.player;
const flushT = () => { let n=0; while (pending.length && n++ < 30){ const q = pending.splice(0); q.forEach(t=>{try{t.f();}catch(_){}}); } };
flushT();
const slot = () => { const k = Object.keys(STORE).find(k => { try { return !!JSON.parse(STORE[k]).player; } catch(_){ return false; } }); return k ? JSON.parse(STORE[k]) : null; };
const buildRun = (lvl) => {
  C.game.scene = 'overworld';
  P.rizerLvl = lvl; P.rizerXP = 500; P.rxpUnlocked = true; P.hasBackpack = true;
  P.party = [{ speciesId:'elzebub', level:30 }, { speciesId:'volcanut', level:12 }];
  P.pcZyrex = [{ speciesId:'aurarat', level:8 }];
  P.scrapjawTowersRestored = { malezor:true, zarvane:true, korathen:true };
  STORE = {}; C.saveGame();
};

console.log('\n1 · ★ A SAVED RUN IS NEVER DESTROYED WITHOUT ASKING\n');
buildRun(41);
ok(slot().player.rizerLvl === 41, 'an established run sits in the slot (Lv41)');
C.requestNewGame();
ok(!!C.getConfirm(), 'New Game opens the confirm prompt instead of wiping');
ok(slot().player.rizerLvl === 41, '...and the save is still untouched while it waits');
ok(C.getConfirm().idx === 0, 'the cursor defaults to the SAFE option, never to destroy');

console.log('\n2 · ★ CANCELLING KEEPS THE RUN\n');
C.handleNewGameConfirmKey('b');                       // Circle / Escape
ok(!C.getConfirm(), 'B / Escape closes the prompt');
ok(slot().player.rizerLvl === 41, 'save intact after cancel');
C.requestNewGame();
C.handleNewGameConfirmKey('enter');                   // confirm on the DEFAULT option
ok(!C.getConfirm(), 'prompt closed');
ok(slot().player.rizerLvl === 41, 'confirming the default choice KEEPS the save — mashing X is safe');

console.log('\n3 · ★ CONFIRMING ERASES IT\n');
C.requestNewGame();
C.handleNewGameConfirmKey('arrowdown');               // move to ERASE
ok(C.getConfirm().idx === 1, 'arrow moves to ERASE AND START OVER');
C.handleNewGameConfirmKey('x');
flushT();
ok(!C.getConfirm(), 'prompt closed');
ok(slot().player.rizerLvl === 1, `save overwritten by the new run (Lv41 -> Lv${slot().player.rizerLvl})`);
ok(!slot().player.hasBackpack, 'and it really is a fresh run, not the old one relabelled');

console.log('\n4 · NOTHING TO LOSE · no prompt at all\n');
STORE = {};                                           // no save on disk
C.setConfirm(null);
C.requestNewGame(); flushT();
ok(!C.getConfirm(), 'with an empty slot the prompt is skipped entirely');
ok(!!slot(), 'the new game starts and claims the slot immediately');
console.log('     (confirming a destructive action that destroys nothing is just friction)');

console.log('\n5 · EVERY ROUTE IS GATED\n');
// Count only CALLS, excluding the declaration and comment mentions.
const calls = src.split('\n')
  .map((l, i) => ({ l: l.trim(), i: i + 1 }))
  .filter(o => /(?:^|[^\w.])startNewGame\(\);/.test(o.l) && !/^\/\//.test(o.l));
console.log(`     raw startNewGame() call sites:`);
calls.forEach(o => console.log(`       line ${o.i}: ${o.l.slice(0, 78)}`));
const direct = calls.length;
ok(!/if \(titleSelectedIdx === 0\) startNewGame\(\)/.test(src), 'keyboard/gamepad title select routes through the gate');
ok(!/if \(el\.dataset\.idx === '0'\) startNewGame\(\)/.test(src), 'the DOM title button routes through the gate');
ok(!/if \(game\.scene === 'title'\)\{\s*\n\s*startNewGame\(\);/.test(src), 'the intro-video-ended path routes through the gate');
// Two raw calls are correct and safe:
//   · inside handleNewGameConfirmKey — the player just said ERASE
//   · inside requestNewGame / loadSavedGame when the slot is EMPTY — nothing to lose
const unsafe = calls.filter(o => !/if \(go\)/.test(o.l) && !/if \(!run\)/.test(o.l)
  && !/No save found/.test(src.split('\n')[o.i - 2] || ''));
ok(unsafe.length === 0,
   `every raw call is either "player confirmed ERASE" or "slot is empty"${unsafe.length ? ' — unsafe: ' + unsafe.map(u=>'line '+u.i).join(', ') : ''}`);

console.log('\n6 · INPUT · works on controller, not just mouse\n');
ok(/if \(handleNewGameConfirmKey\(k\)\)\{ e\.preventDefault\(\); return; \}/.test(src),
   'the title key handler consults the prompt FIRST, so gamepad and keyboard both reach it');
C.requestNewGame();
for (const k of ['arrowup','arrowdown','arrowleft','j','k','1','3']){
  ok(C.handleNewGameConfirmKey(k) === true, `'${k}' is swallowed while the prompt is up`);
}
C.handleNewGameConfirmKey('b');
ok(C.handleNewGameConfirmKey('x') === false, 'and it stops swallowing once closed');

console.log('\n7 · THE PROMPT TELLS YOU WHAT YOU WOULD LOSE\n');
buildRun(27);
const run = C.savedRunSummary();
console.log(`     summary: Lv ${run.lvl} · ${run.zyrex} Zyrex · ${run.towers}/10 towers · saved ${run.when}`);
ok(run.lvl === 27, 'reads the level from the slot');
ok(run.zyrex === 3, 'counts party + PC Zyrex (2 + 1)');
ok(run.towers === 3, 'counts restored towers');
ok(typeof run.when === 'string' && run.when.length > 4, 'shows when it was last saved');
C.setConfirm({ idx: 0 });
let threw = null;
try { C.drawNewGameConfirm(); } catch (e){ threw = e.message; }
ok(!threw, `the prompt renders without throwing${threw ? ' — ' + threw : ''}`);
C.setConfirm(null);

console.log('\n8 · ★ THE PROMPT IS ACTUALLY VISIBLE\n');
// v0.95.662 drew it on the CANVAS. The title screen is an intro <video> at
// z-index 20 with DOM buttons at z-index 25 painted OVER the canvas, so the
// prompt rendered underneath both and the player saw nothing happen.
const html = fs.readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html', 'utf8');
const zOf = (id) => {
  const m = new RegExp(`id="${id}"[^>]*z-index:(\\d+)`).exec(html);
  return m ? Number(m[1]) : null;
};
const zVid = zOf('introVid'), zBtn = zOf('titleBtns'), zNgc = zOf('newGameConfirm');
console.log(`     introVid z-index ${zVid}  ·  titleBtns z-index ${zBtn}  ·  newGameConfirm z-index ${zNgc}`);
ok(zNgc != null, 'the prompt exists as a DOM element');
ok(zNgc > zVid, `it sits above the intro video (${zNgc} > ${zVid})`);
ok(zNgc > zBtn, `and above the title buttons (${zNgc} > ${zBtn})`);
ok(/id="ngcSummary"/.test(html), 'it has a summary slot for the run being destroyed');
ok((html.match(/class="ngcOpt"/g) || []).length === 2, 'two clickable options for mouse/touch');
ok(!/ctx\.fillText\('OVERWRITE YOUR SAVED RUN\?'/.test(src), 'the invisible canvas version is gone');
ok(/el\.style\.display = 'flex'/.test(src), 'opening the prompt shows the overlay');
ok(/if \(key === _ngcShown\) return;/.test(src),
   'the overlay only touches the DOM when state changes (same discipline as the ZyPhone repaint fix)');

console.log(fails ? `\n❌ ${fails} failure(s)` : '\n✅ ALL CHECKS PASS');
process.exit(0);
