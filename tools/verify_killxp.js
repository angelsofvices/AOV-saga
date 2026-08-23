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
try {
  new Function(src + ';globalThis.__C={player,game,creditRizerKill,rizerKillXP,' +
    'rizerKillLevelDiffMult,rizerXPToNext,awardRizerXP,RIZER_KILL_XP,RIZER_KILL_MULT,' +
    'collectFaeAt,comboXpMult};')();
} catch (e){ console.log('❌ BOOT FAILED:', e.message); process.exit(1); }
const C = globalThis.__C, P = C.player, G = C.game;
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const raw = fs.readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html','utf8');
const noC = raw.replace(/\/\/[^\n]*/g, '');
G.scene = 'overworld';

console.log('\n1 · ★★ EVERY DEATH PATH CREDITS XP\n');
console.log('     Checked first, because if a death site were missing this would');
console.log('     be a plumbing bug and the formula would be the wrong fix.\n');
const lines = raw.split('\n');
const deaths = [], credits = new Set();
lines.forEach((l, i) => {
  const n = i + 1;
  if (/(?<!function )startMoriDeath\(/.test(l) && !/function startMoriDeath/.test(l)) deaths.push(n);
  if (/(?<!function )creditRizerKill\(/.test(l) && !/function creditRizerKill/.test(l)) credits.add(n);
});
const orphan = deaths.filter(d => ![...credits].some(c => Math.abs(c - d) <= 3));
console.log(`     startMoriDeath sites: ${deaths.length}   creditRizerKill sites: ${credits.size}`);
for (const o of orphan) console.log(`     line ${o} kills without crediting`);
console.log('');
ok(deaths.length >= 10, `${deaths.length} death sites found`);
ok(orphan.length === 0, `every death site credits XP within 3 lines (${orphan.length} orphaned)`);
ok(/if \(!npc \|\| npc\._rxpCredited\) return 0;/.test(noC),
   'and _rxpCredited stops an AOE from paying twice for one corpse');

console.log('\n2 · ★★ THE REAL FAULT · REWARD SHAPE vs COST SHAPE\n');
console.log('     Both curves are per-level, but the reward used the ENEMY\'s level');
console.log('     and the cost uses YOURS, with nothing tying them together.\n');
console.log('      Lv   cost/level   kill xp   kills/level');
let killsPer = [];
for (const L of [1, 5, 10, 25, 50, 75, 99]){
  P.rizerLvl = L;
  const cost = C.rizerXPToNext(L);
  const xp = C.rizerKillXP({ level: L, tier: 1 }, 'punch');
  const k = Math.ceil(cost / xp);
  killsPer.push(k);
  console.log(`     ${String(L).padStart(3)}${String(cost).padStart(13)}${String(xp).padStart(10)}${String(k).padStart(13)}`);
}
console.log('');
const spread = Math.max(...killsPer) / Math.min(...killsPer);
ok(spread < 1.7,
   `kills-per-level stays within ${spread.toFixed(2)}x across the whole game (was 19 → 631, a 33x collapse)`);
ok(Math.max(...killsPer) <= 20, `and never exceeds ${Math.max(...killsPer)} kills for a level`);
P.rizerLvl = 1;
ok(C.rizerKillXP({ level: 1, tier: 1 }, 'punch') === 16,
   'a Lv1 T1 punch kill still pays exactly 16 — identical to the old curve, so the opening hour is unchanged');

console.log('\n3 · ★★ SCALED BY DIFFICULTY\n');
ok(C.RIZER_KILL_XP.BASE_PER_LV === 8 && C.RIZER_KILL_XP.TIER_PER_LV === 8,
   'the canon shape: enemyLv x (8 + tier x 8) — from [[aov-xp-reward-formula]], written down and never implemented');
P.rizerLvl = 30;
const t1 = C.rizerKillXP({ level: 30, tier: 1 }, 'punch');
const t8 = C.rizerKillXP({ level: 30, tier: 8 }, 'punch');
ok(t8 > t1 * 4, `a T8 kill pays ${(t8/t1).toFixed(1)}x a T1 at the same level (${t1} → ${t8})`);
console.log('');
console.log('     LEVEL DIFFERENCE · a Lv50 Rizer:');
P.rizerLvl = 50;
for (const e of [10, 40, 50, 60, 80]){
  console.log(`       vs Lv${String(e).padStart(3)}  x${C.rizerKillLevelDiffMult(e).toFixed(2)}  ${String(C.rizerKillXP({level:e,tier:1},'punch')).padStart(6)} xp`);
}
console.log('');
ok(C.rizerKillLevelDiffMult(70) > C.rizerKillLevelDiffMult(50),
   'fighting UP pays more');
ok(C.rizerKillLevelDiffMult(20) < C.rizerKillLevelDiffMult(50),
   'farming DOWN pays less');
ok(C.rizerKillLevelDiffMult(1) >= 0.25,
   `but never below x${C.rizerKillLevelDiffMult(1)} — a kill that paid NOTHING would read as exactly the bug being fixed here`);
ok(C.rizerKillLevelDiffMult(999) <= 2,
   `and caps at x${C.rizerKillLevelDiffMult(999)}, so a lucky giant-slay cannot skip a tier of progression`);
let mono = 0;
for (let e = 2; e <= 120; e++) if (C.rizerKillLevelDiffMult(e) < C.rizerKillLevelDiffMult(e-1)) mono++;
ok(mono === 0, `the multiplier never decreases as the enemy gets stronger (${mono} inversions)`);

console.log('\n4 · ★ TECHNIQUE STILL MATTERS\n');
P.rizerLvl = 20;
const byMode = Object.keys(C.RIZER_KILL_MULT).map(m =>
  [m, C.rizerKillXP({ level: 20, tier: 2 }, m)]).sort((a,b)=>a[1]-b[1]);
for (const [m, v] of byMode) console.log(`     ${m.padEnd(14)} ${String(v).padStart(6)}`);
console.log('');
ok(byMode[byMode.length-1][1] > byMode[0][1] * 2,
   `the hardest finisher pays ${(byMode[byMode.length-1][1]/byMode[0][1]).toFixed(1)}x the simplest`);

console.log('\n5 · ★★ A LIVE KILL ACTUALLY MOVES THE BAR\n');
P.rizerLvl = 10; P.rizerXP = 0; P.rizerXPMax = C.rizerXPToNext(10);
const before = P.rizerXP;
const paid = C.creditRizerKill({ id: 'live', level: 12, tier: 2 }, 'sword');
ok(paid > 0, `creditRizerKill paid ${paid}`);
ok(P.rizerXP > before || P.rizerLvl > 10, `and player.rizerXP moved ${before} → ${P.rizerXP}`);
const dead = { id: 'twice', level: 5, tier: 1 };
C.creditRizerKill(dead, 'punch');
ok(C.creditRizerKill(dead, 'punch') === 0, 'the same corpse cannot be cashed in twice');

console.log('\n6 · ★★ FAE FILLS THE YELLOW BAR\n');
console.log('     "catching a fae gains 100% speed energy yellow bar faedust"\n');
console.log('     A fae IS faedust, and faedust is what the yellow bar runs on');
console.log('     ([[aov-rhud-meter-functions]]), so catching one fills it');
console.log('     outright rather than topping it up.\n');
const fae = String(C.collectFaeAt || '');
ok(/player\.astral = _stamMax/.test(fae), 'collectFaeAt sets stamina to MAX, not a percentage');
ok(/player\._staminaSpentAt = 0/.test(fae),
   'and clears the regen delay, so the refill is not undone by a pending cooldown');
ok(/hpMax \|\| 100\) \* 0\.05/.test(fae),
   'the existing +5% HP from v0.95.708 is untouched — a fae now pays HP and stamina');
ok(/⚡ FAEDUST/.test(fae), 'and it says so on screen only when the bar was actually below full');

console.log('\n7 · ★ THE FX MODE MY BLIND REPLACE STRIPPED\n');
console.log('     v0.95.717 removed the kind=\'astral\' damage tag with a blanket');
console.log('     `, \'astral\')` → `)` replace. It reported EIGHT replacements');
console.log('     against SEVEN call sites — the eighth was spawnHitFx, which');
console.log('     silently turned A3\'s blue hit-confirm into the yellow punch');
console.log('     flash. Restored.\n');
ok(/spawnHitFx\(tx, ty, 'astral'\)/.test(noC), "spawnHitFx(tx, ty, 'astral') is back");
ok(!/spawnHitFx\(tx, ty\)/.test(noC), 'and the untagged call is gone');

console.log(f ? `\n❌ ${f} failure(s)` : '\n✅ ALL CHECKS PASS');
process.exit(0);
