// v0.95.660 · verify RXP does not accrue until Rizer first reaches the overworld.
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
  setAttribute:noop, getAttribute:()=>null, focus:noop, remove:noop,
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
  new Function(src + ';globalThis.__C={player,game,awardRizerXP,rizerXpUnlocked,rizerXPToNext,' +
    'NPCS,registerContact,setActiveContact,clearActiveContact,creditRizerKill,rizerKillXP,' +
    'saveGame,loadGame,useZycubeItem,readDadsBookshelf,rizerTotalXPFor};')();
} catch (e) { console.log('❌ BOOT FAILED:', e.message); process.exit(1); }
const C = globalThis.__C;
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) fails++; };
const P = C.player;
const fresh = (scene) => {
  P.rizerLvl = 1; P.rizerXP = 0; P.rizerXPMax = C.rizerXPToNext(1);
  P.rxpUnlocked = false; P.bonds = {}; P.metNpcs = {};
  C.game.scene = scene;
};

console.log('\n1 · ★ THE OPENING · nothing indoors pays\n');
fresh('interior_home_2f');
ok(C.rizerXpUnlocked() === false, 'a brand-new game starts LOCKED in the Rizer Room');
const grants = [
  ['grab the backpack',     25],
  ['grab the skateboard',   25],
  ['grab the ZyPhone',      25],
  ['talk to Mom · Zycube',  100],
  ['Mom quest turn-in',     500],
];
for (const [what, xp] of grants){
  const before = P.rizerXP;
  C.awardRizerXP(xp);
  ok(P.rizerXP === before, `${what.padEnd(24)} +${String(xp).padStart(3)} RXP -> swallowed (still ${P.rizerXP})`);
}
ok(P.rizerLvl === 1, 'Rizer is still Level 1 after the whole opening');

console.log('\n2 · ★ STEPPING OUTSIDE ARMS IT\n');
C.game.scene = 'overworld';
ok(C.rizerXpUnlocked() === true, 'first frame in the overworld unlocks RXP');
ok(P.rxpUnlocked === true, '...and the flag is set on the player, so it persists');
C.awardRizerXP(250);
ok(P.rizerXP === 250, `an overworld grant now lands (${P.rizerXP} RXP)`);

console.log('\n3 · ★ NOT A PERMANENT INDOOR BAN · interior quests still pay\n');
console.log('     Dad\'s starter turn-in, all 8 Kelthor steps, Nurse Rein, Prof Elarion');
console.log('     and the Academy are ALL interior quests. A blanket indoor ban would');
console.log('     silently kill every one of them.\n');
// Measure TOTAL xp, not the per-level remainder — 800 RXP at low level crosses
// level-ups and resets rizerXP, which is correct behaviour, not a failure.
const totalXp = () => C.rizerTotalXPFor(P.rizerLvl) + (P.rizerXP || 0);
for (const scene of ['interior_research_lab','interior_home','interior_malezor_school','interior_treehouse']){
  C.game.scene = scene;
  const before = totalXp();
  C.awardRizerXP(800);
  ok(totalXp() === before + 800, `${scene.padEnd(24)} pays normally once unlocked (+800 total)`);
}

console.log('\n4 · KILLS ARE GATED THE SAME WAY\n');
fresh('interior_home_2f');
const foe = { level: 5, tier: 1, id: 'gate_test' };
const worth = C.rizerKillXP(foe, 'punch');
C.creditRizerKill(foe, 'punch');
ok(P.rizerXP === 0, `an indoor kill worth ${worth} RXP pays nothing pre-overworld`);
C.game.scene = 'overworld';
const foe2 = { level: 5, tier: 1, id: 'gate_test2' };
C.creditRizerKill(foe2, 'punch');
ok(P.rizerXP === worth, `the same kill outdoors pays ${P.rizerXP}`);

console.log('\n5 · QUEST BOND RIDES THE SAME GATE\n');
fresh('interior_home_2f');
const mom = C.NPCS.find(n => n.id === 'mom');
C.registerContact(mom); C.setActiveContact(mom);
C.awardRizerXP(500);
ok((P.bonds.mom || 0) === 0, 'Mom gains no quest-bond from a pre-overworld grant either');
console.log('     (harmless: Mom/Dad/Yara bonds are force-set to 100 on load regardless)');
C.game.scene = 'overworld';
C.setActiveContact(mom);
C.awardRizerXP(500);
ok((P.bonds.mom || 0) > 0, '...and it resumes the moment RXP is live');

console.log('\n6 · ★ BACK-COMPAT · an existing save must NOT re-lock\n');
P.rizerLvl = 12; P.rizerXP = 400; P.rxpUnlocked = true;
C.game.scene = 'overworld';
C.saveGame();
const key = Object.keys(STORE).find(k => { try { return !!JSON.parse(STORE[k]).player; } catch(_){ return false; } });
const snap = JSON.parse(STORE[key]);
ok(snap.player.rxpUnlocked === true, 'rxpUnlocked is written into the save');
// simulate a PRE-patch save: strip the flag entirely
delete snap.player.rxpUnlocked;
snap.player.rizerLvl = 12;
STORE[key] = JSON.stringify(snap);
P.rxpUnlocked = false;
C.game.scene = 'interior_home_2f';
C.loadGame();
let n = 0; while (pending.length && n++ < 20){ const q = pending.splice(0); q.forEach(t => { try { t.f(); } catch(_){} }); }
ok(P.rxpUnlocked === true, 'a pre-patch save (no flag) loads as UNLOCKED — no lost earning');
console.log(`     after load: scene=${C.game.scene} lvl=${P.rizerLvl} xp=${P.rizerXP} max=${P.rizerXPMax} unlocked=${P.rxpUnlocked}`);
const b = C.rizerTotalXPFor(P.rizerLvl) + (P.rizerXP || 0);
C.awardRizerXP(300);
const after = C.rizerTotalXPFor(P.rizerLvl) + (P.rizerXP || 0);
console.log(`     total ${b} -> ${after}  (delta ${after - b}, expected 300)`);
ok(after === b + 300, '...and earns immediately, even standing indoors');

console.log('\n7 · ONE CHOKEPOINT\n');
ok(/function awardRizerXP\(amount\)\{?[\s\S]{0,400}?if \(!rizerXpUnlocked\(\)\) return;/.test(src),
   'the gate sits inside awardRizerXP itself — every grant path in the game funnels through it');
const paths = (src.match(/awardRizerXP\(/g) || []).length;
console.log(`     ${paths} awardRizerXP call sites across the file, all covered by one check`);
ok(paths > 40, 'a per-site gate would have meant editing every one of them');

console.log(fails ? `\n❌ ${fails} failure(s)` : '\n✅ ALL CHECKS PASS');
process.exit(0);
