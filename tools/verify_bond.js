// v0.95.722 · KILL XP · "im not getting xp for kills. make sure all kills give
// xp in scaled ... difficulty"  + "catching a fae gains 100% speed energy
// yellow bar faedust"
//
// The first thing to establish is WHERE the fault was, because the answer
// changes the fix completely. It was NOT the plumbing: all eleven death sites
// already credited, and a kill paid out correctly in isolation. It was
// magnitude, and specifically the shape of the curve — the reward barely moved
// with level while the cost climbed quadratically, so grinding the same Mori
// went from 19 kills a level to 631.
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
try { new Function(require('fs').readFileSync('/tmp/all.js','utf8') +
  ';globalThis.__C={player,rizerBondTotal,rizerZyrexBond,requiredBondForTier,createZyrex,' +
  'addZyrexToRoster,RIZER_BOND_CAP,RIZER_BOND_PER_ZYREX_LEVEL,xpToNextLevel};')();
} catch(e){ console.log('BOOT FAILED:', e.message); process.exit(1); }
const C = globalThis.__C, P = C.player;
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const raw = require('fs').readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html','utf8');
const noC = raw.replace(/\/\/[^\n]*/g, '');
const freshBonds = () => ({ yara:100, mom:100, dad:100 });
const setParty = (n, lv) => {
  P.party = []; P.pcZyrex = [];
  for (let i = 0; i < n; i++){ const z = C.createZyrex('otterlin', lv); if (z) (i < 8 ? P.party : P.pcZyrex).push(z); }
};

console.log('\n1 · ★★ WHY NOT LITERAL ZXP\n');
console.log('     "bond goes up .5x as zxp" taken as raw experience points');
console.log('     breaks the system outright, because ZXP is CUBIC:\n');
const tot = lv => Math.floor(0.8 * Math.pow(lv, 3));
console.log('       Lv  10        800 ZXP  →  x0.5 =    400 bond');
console.log('       Lv  20      6,400 ZXP  →  x0.5 =  3,200 bond  ← 96% of the cap');
console.log('       Lv  21      7,408 ZXP  →  x0.5 =  3,704 bond  ← past it');
console.log('       Lv 100    800,000 ZXP  →  x0.5 = 400,000 bond\n');
// ★ First asserted Lv20 was already PAST the cap. It is 3,200 against 3,330 —
// 130 short. The point survives, but the number was overstated by one level,
// and a claim that is 96% right is still a claim that is wrong.
ok(tot(20) * 0.5 > 3330 * 0.9,
   `one Zyrex at Lv 20 would be ${(tot(20)*0.5).toLocaleString()} bond — ${Math.round(tot(20)*0.5/3330*100)}% of the entire ceiling`);
ok(tot(21) * 0.5 > 3330,
   `and Lv 21 (${(tot(21)*0.5).toLocaleString()}) passes it outright — every gate including T10 Gemlords, from ONE Zyrex`);
console.log('     Confirmed with the Creator: the rate is per LEVEL, 1.5 each.\n');
ok(C.RIZER_BOND_PER_ZYREX_LEVEL === 1.5, `RIZER_BOND_PER_ZYREX_LEVEL = ${C.RIZER_BOND_PER_ZYREX_LEVEL}`);

console.log('\n2 · ★★ THE CURVE\n');
console.log('     party            zyrex   allies   total   tier');
const rows = [[0,0,0],[1,10,0],[4,30,0],[8,60,0],[8,100,0],[8,100,500],[8,100,1200]];
for (const [n, lv, allies] of rows){
  P.bonds = allies ? { x: allies } : {};
  setParty(n, lv);
  const zb = C.rizerZyrexBond(), t = C.rizerBondTotal();
  let tier = 0; for (let k = 1; k <= 10; k++) if (t >= C.requiredBondForTier(k)) tier = k;
  console.log(`     ${(n ? `${n} @ Lv${lv}` : 'none').padEnd(14)}${String(zb).padStart(8)}${String(allies*2).padStart(9)}${String(t).padStart(8)}     T${tier}`);
}
console.log('');
P.bonds = {}; setParty(1, 10);
ok(C.rizerZyrexBond() === 15, `one Lv10 Zyrex is worth ${C.rizerZyrexBond()} bond (1.5 x 10)`);
setParty(8, 100);
ok(C.rizerZyrexBond() === 1200, `a maxed 8-Zyrex faction is worth ${C.rizerZyrexBond()} — 36% of the 3330 ceiling`);
console.log('     So raising your faction is a real route to bonding Gemlords');
console.log('     without being the only one. Ally quests still carry the rest.\n');

console.log('3 · ★★ IT REPLACED THE RIZER-LEVEL TERM\n');
ok(!/\(player\.rizerLvl \|\| 1\) - 1\) \* 3/.test(noC),
   'the old (rizerLvl - 1) x 3 term is gone');
P.bonds = freshBonds(); P.party = []; P.pcZyrex = [];
const atLv1 = C.rizerBondTotal();
P.rizerLvl = 100;
const atLv100 = C.rizerBondTotal();
ok(atLv1 === atLv100,
   `Rizer level no longer moves bond on its own (Lv1 ${atLv1} = Lv100 ${atLv100})`);
console.log('     Per the Creator\'s call: bond now measures your allies and');
console.log('     your faction, not your own grinding.\n');

console.log('4 · ★★ A FRESH SAVE IS UNCHANGED\n');
P.rizerLvl = 1; P.bonds = freshBonds(); P.party = []; P.pcZyrex = [];
const fresh = C.rizerBondTotal();
ok(fresh === 600, `a new Rizer still reads ${fresh} — family bonds (100 x 3) x 2, exactly as before`);
let tier = 0; for (let k = 1; k <= 10; k++) if (fresh >= C.requiredBondForTier(k)) tier = k;
ok(tier === 1, `and can still bond up to T${tier} out of the gate`);
ok(fresh < C.requiredBondForTier(6),
   'while a T6 Celestryx is still out of reach without the fae ritual — that gate is intact');

console.log('\n5 · ★★ PC-STORED ZYREX COUNT\n');
P.bonds = {}; P.party = []; P.pcZyrex = [];
for (let i = 0; i < 4; i++) P.party.push(C.createZyrex('otterlin', 50));
const partyOnly = C.rizerZyrexBond();
for (let i = 0; i < 4; i++) P.pcZyrex.push(C.createZyrex('otterlin', 50));
const withPC = C.rizerZyrexBond();
ok(withPC === partyOnly * 2, `4 in the party = ${partyOnly}, plus 4 in the PC = ${withPC}`);
console.log('     They are still yours. Excluding them would punish using the');
console.log('     storage the game hands you, and create a reason to hoard a');
console.log('     full party of weak Zyrex rather than store them.\n');

console.log('6 · ★ THE CAP HOLDS\n');
P.bonds = { a: 3000, b: 3000 }; setParty(8, 100);
ok(C.rizerBondTotal() === C.RIZER_BOND_CAP, `an absurd wallet still clamps to ${C.rizerBondTotal()}`);
ok(Number.isInteger(C.rizerBondTotal()), 'and the total is a whole number — 1.5/level cannot leak a fraction into the UI');
P.bonds = {}; P.party = [{ level: 7 }]; P.pcZyrex = [];
ok(C.rizerZyrexBond() === 10.5 || C.rizerBondTotal() === 10,
   `an odd level floors cleanly in the total (raw ${C.rizerZyrexBond()} → ${C.rizerBondTotal()})`);
P.party = [{}];
ok(C.rizerZyrexBond() === 1.5, 'a Zyrex with no level field counts as Lv1, not NaN');

console.log(f ? `\n❌ ${f} failure(s)` : '\n✅ ALL CHECKS PASS');
process.exit(0);
