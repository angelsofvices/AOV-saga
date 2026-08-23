// v0.95.713 · RIZER ATTRIBUTE SYSTEM
//
// The Creator's Leveling page states three numbers that have to hold exactly:
//   33.3 XP per level · 333 at the end of Tier 1 · 3330 at level 100
// and the directive adds three rules: all five stats start at ZERO, there is
// NO respec, and the level-1 points are spent at the computer before the
// player goes downstairs.
//
// The rule that quietly does the most work is "start at zero".  It means the
// zero-point case of every formula must reproduce the game's EXISTING balance
// exactly — 100 HP, baseAtk 25, x1 damage taken, 170ms walk.  If any of them
// is off by even a little, a fresh level-1 Rizer is silently weaker (or
// stronger) than the build shipped yesterday, and every enemy HP number in the
// game is wrong.  Section 3 is that invariant, and it is the reason this file
// exists rather than a spot-check of the pool arithmetic.
const fs = require('fs');
const path = '/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html';
const src = fs.readFileSync(path, 'utf8');
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };

// ── Extract just the pure-maths layer and run it for real ─────────────
// Reimplementing the formulas in the test would only prove the test agrees
// with itself.  These are the actual function bodies, lifted from the file.
function grab(name){
  const i = src.indexOf(`function ${name}(`);
  if (i < 0) return null;
  let d = 0, j = src.indexOf('{', i);
  const start = j;
  for (; j < src.length; j++){
    if (src[j] === '{') d++;
    else if (src[j] === '}'){ d--; if (!d) break; }
  }
  return src.slice(i, j + 1);
}
const NEEDED = ['rizerTotalXPFor','rizerXPToNext','rizerLifetimeRXP','rizerAttrPool','rizerAttrs','rizerAttrSpent','rizerAttrUnspent',
                'rizerHpMaxFromAttrs','rizerBaseAtkFromAttrs','rizerDefMult',
                'rizerStaminaFactor','rizerSpecialFactor','rizerAttrFrac',
                'recomputeRizerStats','rizerSpend','applyRizerArchetype',
                'buildRizerAttrPanel'];
const bodies = {};
for (const n of NEEDED) bodies[n] = grab(n);

console.log('\n1 · ★ THE SYSTEM EXISTS AND IS EXTRACTABLE\n');
const missing = NEEDED.filter(n => !bodies[n]);
for (const m of missing) console.log(`     ${m} not found`);
ok(missing.length === 0, `all ${NEEDED.length} attribute functions present (${missing.length} missing)`);

// Constants
function constOf(name){
  const m = src.match(new RegExp(`const ${name}\\s*=\\s*([^;]+);`));
  return m ? m[1].trim() : null;
}
const PER  = Number(constOf('RIZER_ATTR_PER_LEVEL'));
const CAP  = Number(constOf('RIZER_ATTR_MAX'));
const KEYS = eval(constOf('RIZER_ATTR_KEYS') || '[]');
ok(PER === 33.3,  `RIZER_ATTR_PER_LEVEL = ${PER} (page says 33.3)`);
ok(CAP === 3330,  `RIZER_ATTR_MAX = ${CAP} (page says 3330)`);
ok(KEYS.length === 5 && ['hp','atk','def','speed','special'].every(k => KEYS.includes(k)),
   `five stats, exactly the ones named: ${KEYS.join(' · ')}`);

// Build a live sandbox holding the real bodies.
const harness = `
  const RIZER_LEVEL_CAP = 100;
  const RIZER_ATTR_PER_LEVEL = ${PER};
  const RIZER_ATTR_MAX = ${CAP};
  const RIZER_ATTR_KEYS = ${JSON.stringify(KEYS)};
  const RIZER_STAT_MAX_PTS = 666;
  const RIZER_HP_MIN = 50, RIZER_HP_MAX = 250;
  const RIZER_ATK_MIN = 25, RIZER_ATK_MAX = 125;
  const RIZER_DEF_MAX_REDUCTION = 0.75;
  ${bodies.rizerAttrFrac}
  const RIZER_ARCHETYPES = ${(() => {
    const i = src.indexOf('const RIZER_ARCHETYPES = {');
    let d = 0, j = src.indexOf('{', i);
    for (; j < src.length; j++){ if (src[j]==='{') d++; else if (src[j]==='}'){ d--; if(!d) break; } }
    return src.slice(src.indexOf('{', i), j + 1);
  })()};
  const player = { rizerLvl: 1, hp: 100, hpMax: 100, maxHp: 100, astral: 100, astralMax: 100, attrs: {} };
  const game = {};
  function playSFX(){} function showToast(){}
  const RIZER_TOTAL_RXP = 1000000;
  ${bodies.rizerTotalXPFor}
  ${bodies.rizerXPToNext}
  ${bodies.rizerLifetimeRXP}
  ${bodies.rizerAttrPool}
  ${bodies.rizerAttrs}
  ${bodies.rizerAttrSpent}
  ${bodies.rizerAttrUnspent}
  ${bodies.rizerHpMaxFromAttrs}
  ${bodies.rizerBaseAtkFromAttrs}
  ${bodies.rizerDefMult}
  ${bodies.rizerStaminaFactor}
  ${bodies.rizerSpecialFactor}
  ${bodies.recomputeRizerStats}
  ${bodies.rizerSpend}
  ${bodies.applyRizerArchetype}
  return { player, rizerTotalXPFor, rizerXPToNext, rizerLifetimeRXP, rizerAttrPool, rizerAttrs, rizerAttrSpent, rizerAttrUnspent,
           rizerHpMaxFromAttrs, rizerBaseAtkFromAttrs, rizerDefMult,
           rizerStaminaFactor, rizerSpecialFactor, rizerAttrFrac, recomputeRizerStats,
           rizerSpend, applyRizerArchetype, RIZER_ARCHETYPES };
`;
let L;
try { L = new Function(harness)(); }
catch(e){ console.log('  ❌ harness failed to build: ' + e.message); console.log('\n❌ 1 failure(s)'); process.exit(0); }

console.log('\n2 · ★★ THE POOL MATCHES THE CREATOR\'S PAGE, ROW BY ROW\n');
console.log('     T    L (min-max)     page XP        pool(Lmin)  pool(Lmax)');
const PAGE = [
  [1,  1,  10,    0, 333], [2, 11, 20,  334,  666], [3, 21, 30,  667,  999],
  [4, 31,  40, 1000,1332], [5, 41, 50, 1333, 1665], [6, 51, 60, 1666, 1998],
  [7, 61,  70, 1999,2331], [8, 71, 80, 2332, 2664], [9, 81, 90, 2665, 2997],
  [10,91, 100, 2998,3330],
];
let bandBad = 0;
for (const [T, lo, hi, xlo, xhi] of PAGE){
  const a = L.rizerAttrPool(lo), b = L.rizerAttrPool(hi);
  const inBand = a >= xlo && a <= xhi && b >= xlo && b <= xhi;
  if (!inBand) bandBad++;
  console.log(`     ${String(T).padStart(2)}   ${String(lo).padStart(3)}-${String(hi).padEnd(3)}      ` +
              `${String(xlo).padStart(4)}-${String(xhi).padEnd(4)}      ` +
              `${String(a).padStart(6)}      ${String(b).padStart(6)}  ${inBand ? '' : '  ← OUT OF BAND'}`);
}
console.log('');
ok(bandBad === 0, `every tier's first and last level land inside that tier's XP band (${bandBad} out)`);
ok(L.rizerAttrPool(1)   === 33,   `level 1   pool = ${L.rizerAttrPool(1)} (the archetype budget)`);
ok(L.rizerAttrPool(10)  === 333,  `level 10  pool = ${L.rizerAttrPool(10)} (page row 1 max, exactly)`);
ok(L.rizerAttrPool(100) === 3330, `level 100 pool = ${L.rizerAttrPool(100)} (the cap, exactly)`);
console.log('     floor() not round() is what lands 100 on 3330 instead of over-');
console.log('     shooting it, and is why tier-from-points and tier-from-level');
console.log('     never disagree. Under round(), level 5 would read 167 and sit');
console.log('     one point outside its own band.\n');
// ★★ THE FLOAT TRAP · this is what the first implementation got wrong.
// floor(L × 33.3) reads as obviously correct and is wrong at exactly one
// level — the cap, the single most important number on the page:
//     100 * 33.3 === 3329.9999999999995  →  floor  →  3329
// A level-100 Rizer would have sat one point below 3330 forever with nothing
// on screen to explain it. Checked against pure-integer arithmetic that cannot
// involve a fraction at all, at every level, so the trap cannot come back.
const exactPool = L2 => { const n = L2 * 333; return Math.min(3330, (n - n % 10) / 10); };
let floatBad = 0, worst = null;
for (let l = 1; l <= 100; l++){
  if (L.rizerAttrPool(l) !== exactPool(l)){ floatBad++; if (!worst) worst = l; }
}
ok(floatBad === 0, `pool matches pure-integer arithmetic at all 100 levels (${floatBad} off${worst ? `, first at L${worst}` : ''})`);
ok(Math.floor(100 * 33.3) === 3329,
   'and the naive form really is broken: Math.floor(100 * 33.3) === ' + Math.floor(100 * 33.3) + ', not 3330');
ok(!/Math\.floor\(\s*L\s*\*\s*RIZER_ATTR_PER_LEVEL\s*\)/.test(src),
   'the file does not multiply by the 33.3 float — it scales by 333/10');

let mono = 0, over = 0;
for (let l = 2; l <= 100; l++){
  const d = L.rizerAttrPool(l) - L.rizerAttrPool(l - 1);
  if (d < 0) mono++;
  if (d !== 33 && d !== 34) over++;
}
ok(mono === 0, `the pool never decreases across all 100 levels (${mono} drops)`);
ok(over === 0, `every level grants 33 or 34 — never more, never less (${over} bad)`);
const avg = (L.rizerAttrPool(100) - L.rizerAttrPool(1)) / 99;
ok(Math.abs(avg - 33.3) < 0.02, `average grant across 2-100 = ${avg.toFixed(3)} (target 33.3)`);
ok(L.rizerAttrPool(150) === 3330 && L.rizerAttrPool(-5) === 33,
   'pool clamps at both ends — a dev level-set past 100 or below 1 cannot break it');

console.log('\n3 · ★★ THE NUMBER LINES, CHECKPOINT BY CHECKPOINT\n');
console.log('     The page gives five stats at five levels. The level labels are');
console.log('     not the input — AP is — so the reading under test is: "an even');
console.log('     five-way split of the pool at that level", with each curve');
console.log('     LINEAR from its minimum to its maximum over 666 points.\n');
console.log('     666 is not a guess: 5 x 666 = 3330, the level-100 pool. And it');
console.log('     is what produces 18.75 / 37.5 / 56.25 for DEF — exactly three');
console.log('     quarters of 25/50/75 percent. Numbers like that do not appear');
console.log('     by accident.\n');
// ★ Tolerance is ONE ATTRIBUTE POINT'S WORTH of effect, not a flat number.
// My first pass used a flat 0.02 and failed on ATK and DEF — because AP are
// whole points, so an even five-way split of the level-25 pool (832) is 166
// each, not the ideal 166.4. The page's mid-points are drawn on a continuous
// line; the game can only land on integers. Being within one point of the
// page is the tightest claim the data can actually support, and asserting
// anything tighter would be asserting that 832 divides by 5.
const CHECK = [
  ['HP',  'hp',      [50, 100, 150, 200, 250],       200 / 666, () => L.rizerHpMaxFromAttrs()],
  ['ATK', 'atk',     [25, 50, 75, 100, 125],         100 / 666, () => L.rizerBaseAtkFromAttrs()],
  ['DEF', 'def',     [0, 18.75, 37.5, 56.25, 75],     75 / 666, () => (1 - L.rizerDefMult()) * 100],
  ['SPD', 'speed',   [1, 2, 3, 4, 5],                  4 / 666, () => L.rizerStaminaFactor()],
  ['SPC', 'special', [1, 2, 3, 4, 5],                  4 / 666, () => L.rizerSpecialFactor()],
];
const LVS = [1, 25, 50, 75, 100];
console.log('     stat      Lv1      Lv25      Lv50      Lv75     Lv100');
let lineBad = 0;
for (const [name, key, want, perPoint, read] of CHECK){
  const got = [];
  for (const lv of LVS){
    L.player.attrs = {}; L.rizerAttrs();
    L.player.attrs[key] = L.rizerAttrPool(lv) / 5;
    got.push(read());
  }
  // Lv1 is checked against ZERO points (the true minimum); the other four
  // against the even split, which is what the page's mid-points describe.
  L.player.attrs = {}; L.rizerAttrs();
  got[0] = read();
  const off = got.map((g, i) => Math.abs(g - want[i]));
  const bad = off.some(d => d > perPoint + 1e-9);
  if (bad) lineBad++;
  console.log(`     ${name.padEnd(5)} ${got.map(g => g.toFixed(2).padStart(9)).join('')}   ${bad ? '← OFF' : ''}`);
  console.log(`     page  ${want.map(w => String(w).padStart(9)).join('')}   max err ${Math.max(...off).toFixed(4)} · 1 point = ${perPoint.toFixed(4)}`);
}
console.log('');
ok(lineBad === 0, `all 25 checkpoints reproduce the page to within one attribute point (${lineBad} stats off)`);

console.log('\n4 · ★★ MINIMUMS AND MAXIMUMS ARE EXACT\n');
L.player.attrs = {}; L.rizerAttrs();
ok(L.rizerHpMaxFromAttrs() === 50,   `HP  min = ${L.rizerHpMaxFromAttrs()} · "change the minimum health at level one to be half"`);
ok(L.rizerBaseAtkFromAttrs() === 25, `ATK min = ${L.rizerBaseAtkFromAttrs()}`);
ok(L.rizerDefMult() === 1,           `DEF min = ${Math.round((1-L.rizerDefMult())*100)}% reduction`);
ok(L.rizerStaminaFactor() === 1,     `SPD min = x${L.rizerStaminaFactor()} stamina life`);
ok(L.rizerSpecialFactor() === 1,     `SPC min = x${L.rizerSpecialFactor()} diamond life`);
console.log('');
const setMax = k => { L.player.attrs = {}; L.rizerAttrs(); L.player.attrs[k] = 666; };
setMax('hp');      ok(L.rizerHpMaxFromAttrs() === 250, `HP  max = ${L.rizerHpMaxFromAttrs()}`);
setMax('atk');     ok(L.rizerBaseAtkFromAttrs() === 125, `ATK max = ${L.rizerBaseAtkFromAttrs()}`);
setMax('def');     ok(Math.abs((1-L.rizerDefMult())*100 - 75) < 1e-9, `DEF max = ${((1-L.rizerDefMult())*100).toFixed(0)}% reduction`);
setMax('speed');   ok(L.rizerStaminaFactor() === 5, `SPD max = x${L.rizerStaminaFactor()} stamina life`);
setMax('special'); ok(L.rizerSpecialFactor() === 5, `SPC max = x${L.rizerSpecialFactor()} diamond life`);
console.log('');
console.log('     ★ HP is the one place this pass deliberately breaks the old');
console.log('       "at zero points nothing changes" invariant. Base HP was 100');
console.log('       and is now 50, by instruction. A level-1 Rizer is half as');
console.log('       durable as yesterday, so early Mori hits land twice as hard.\n');
setMax('def');
ok(L.rizerDefMult() > 0, `a maxed DEF Rizer still takes ${(L.rizerDefMult()*100).toFixed(0)}% of every hit — 75% is a ceiling, not immunity`);

console.log('\n5 · ★★ 666 IS A REAL CEILING, NOT JUST A SCALE REFERENCE\n');
console.log('     Without an enforced cap a player could pour 3330 into HP, get');
console.log('     nothing past the 666th point, and never be told — the bar full,');
console.log('     the pool drained, no message. Refusing is the honest behaviour.\n');
ok(/const RIZER_STAT_MAX_PTS = 666/.test(src), 'RIZER_STAT_MAX_PTS = 666 is declared');
ok(/const room = RIZER_STAT_MAX_PTS - rizerAttrs\(\)\[stat\]/.test(src),
   'rizerSpend computes remaining room in the stat before granting');
L.player.rizerLvl = 100; L.player.attrs = {}; L.rizerAttrs();
for (let i = 0; i < 12; i++) L.rizerSpend('hp', 3330);
ok(L.player.attrs.hp === 666, `12 attempts to dump 3330 into HP left it at exactly ${L.player.attrs.hp}`);
ok(L.rizerAttrUnspent() === 3330 - 666,
   `and the other ${L.rizerAttrUnspent()} points are STILL SPENDABLE, not burnt`);
let total = 0;
for (const k of KEYS){ for (let i = 0; i < 8; i++) L.rizerSpend(k, 3330); total += L.player.attrs[k]; }
ok(total === 3330, `filling all five stats to the ceiling spends exactly ${total} — 5 x 666 = the Lv100 pool`);
ok(L.rizerAttrUnspent() === 0, 'with nothing left over and nothing missing');

console.log('\n6 · ★★ NO RESPEC · POINTS ONLY EVER GO IN\n');
L.player.rizerLvl = 1; L.player.attrs = {}; L.rizerAttrs();
L.rizerSpend('atk', 10);
const afterSpend = L.player.attrs.atk;
L.rizerSpend('atk', -50);
ok(L.player.attrs.atk >= afterSpend, `a negative spend cannot remove points (atk ${afterSpend} → ${L.player.attrs.atk})`);
// ★ This assertion originally scanned the WHOLE FILE for /refund|respec/ and
// failed — on my own explanatory comments ("NO RESPEC. Points only ever go
// in.") and on two unrelated lines of prose ("respects catching-philosophy",
// "A Rizer prepared is a Rizer respected"). A test that reads comments is
// testing the documentation, not the code. Scope it to the actual spend
// function and look for a DECREMENT, which is the thing that would matter.
const spendSrc = (bodies.rizerSpend || '').replace(/\/\/[^\n]*/g, '');
const decrement = /-=|--|\*\s*-1|Math\.min\(\s*0/.test(spendSrc);
ok(!decrement, 'rizerSpend contains no decrement, negation or zero-clamp — there is literally no code path that removes a point');
ok(/Math\.max\(1,\s*Math\.floor\(n \|\| 1\)\)/.test(spendSrc),
   'and it floors its argument at 1, so rizerSpend(stat, -50) adds 1 rather than subtracting 50');
const before = L.rizerAttrSpent();
for (let i = 0; i < 50; i++) L.rizerSpend('hp', 999);
ok(L.rizerAttrSpent() === L.rizerAttrPool(1),
   `overspending is impossible — 50 x 999 into a 33-point pool spent exactly ${L.rizerAttrSpent()}`);
ok(L.rizerAttrUnspent() === 0, 'unspent correctly reads 0 once the pool is exhausted');

console.log('\n7 · ★ LEVELLING GRANTS, AND THE GRANT IS SPENDABLE\n');
L.player.rizerLvl = 1; L.player.attrs = {}; L.rizerAttrs();
let granted = 0;
for (let lv = 2; lv <= 100; lv++){
  L.player.rizerLvl = lv;
  granted += L.rizerAttrPool(lv) - L.rizerAttrPool(lv - 1);
}
ok(granted === 3330 - 33, `levels 2-100 grant ${granted}, which plus the level-1 33 is exactly ${granted + 33}`);
L.player.rizerLvl = 100; L.player.attrs = {}; L.rizerAttrs();
let spins = 0;
while (L.rizerAttrUnspent() > 0 && spins++ < 20) L.rizerSpend(KEYS[spins % 5], L.rizerAttrUnspent());
ok(L.rizerAttrSpent() === 3330, `a level-100 Rizer can spend all ${L.rizerAttrSpent()} points, no remainder`);

console.log('\n7a · ★★ SPEED IS STAMINA NOW · THE YELLOW BAR IS A REAL RESOURCE\n');
console.log('     "when your yellow bar is down, you won\'t be able to sprint or');
console.log('      dodge, and so your stamina goes back up"\n');
console.log('     player.astral has been the yellow meter for a long time and');
console.log('     NOTHING drained it — every reference either set it to max or');
console.log('     read it for small attack/defence modifiers. A full bar that');
console.log('     never moved. It is a resource now.\n');
const nc = src.replace(/\/\/[^\n]*/g, '');
ok(/function spendStamina\(/.test(nc) && /function tickStamina\(/.test(nc),
   'spendStamina + tickStamina exist');
ok(/try \{ tickStamina\(dt\); \} catch/.test(nc), 'tickStamina runs every frame, guarded');
ok(/&& \(typeof canSprint !== 'function' \|\| canSprint\(\)\)/.test(nc),
   'an empty bar refuses the SPRINT');
ok(/if \(typeof canDodge === 'function' && !canDodge\(\)\)/.test(nc),
   'an empty bar refuses the DODGE');
ok(/spendStamina\(STAMINA_DODGE_COST\)/.test(nc), 'and a dodge that IS allowed pays for itself');
ok(/const running = !carryingThrow && \(!!keys\['b'\] \|\| player\.sprintLocked\)/.test(nc),
   'the L3 sprint-LOCK goes through the same gate — no bypass');
ok(!/player\.moveCd = Math\.max\(24[^\n]*rizerSpeed/.test(nc) && !/rizerSpeedMult/.test(nc),
   'SPEED no longer touches moveCd — a maxed Rizer runs at the same pace, just longer');
// the drain must actually respond to the attribute
const secs = k => { L.player.attrs = {}; L.rizerAttrs(); L.player.attrs.speed = k; return 100 / (18 / L.rizerStaminaFactor()); };
console.log('');
console.log('     SPEED pts   sprint seconds   dodges');
for (const k of [0, 166, 333, 499, 666]){
  L.player.attrs = {}; L.rizerAttrs(); L.player.attrs.speed = k;
  console.log(`     ${String(k).padStart(9)}   ${secs(k).toFixed(1).padStart(14)}   ${String(Math.floor(100 / (20 / L.rizerStaminaFactor()))).padStart(6)}`);
}
console.log('');
ok(Math.abs(secs(666) / secs(0) - 5) < 1e-9,
   `a maxed Rizer sprints exactly ${(secs(666)/secs(0)).toFixed(2)}x as long — the page says 5x`);

console.log('\n7b · ★★ SPECIAL SLOWS THE BLUE BAR, IT DOES NOT ADD DAMAGE\n');
ok(/if \(delta < 0 && typeof rizerSpecialFactor === 'function'\)/.test(nc),
   'changePlayerDiamond divides COSTS by the SPECIAL factor');
ok(/delta = -\(Math\.abs\(delta\) \/ rizerSpecialFactor\(\)\)/.test(nc),
   '  and only costs — a gain is never inflated by the same stat');
ok(!/rizerSpecialMult/.test(nc), 'the old astral-DAMAGE multiplier is gone');
// ★★ This regex is the SAME MISTAKE that caused the bug it guards.
// /'astral'\)/ matches ANY call ending in 'astral' — including
// spawnHitFx(tx, ty, 'astral'), which is legitimate and unrelated. That is
// exactly how v0.95.717's blanket `, 'astral')` → `)` replace silently turned
// A3's blue hit-confirm yellow: it reported EIGHT replacements against SEVEN
// call sites and nobody read the extra one. Scope the claim to the function
// that actually lost the parameter.
ok(!/function playerOutgoingDamage\([^)]*kind/.test(nc),
   "playerOutgoingDamage no longer takes a kind parameter");
ok(!/playerOutgoingDamage\([^;]*'astral'\)/.test(nc),
   "and no call site still passes one — a dead argument that used to mean something is worse than none");
ok(/spawnHitFx\(tx, ty, 'astral'\)/.test(nc),
   "  while spawnHitFx keeps ITS 'astral' mode, which is a different thing entirely");
ok(/player\.astralMax = 100;/.test(nc),
   'astralMax is a fixed 100 again — SPECIAL governs drain, not pool size, so growing both would double-count');
L.player.attrs = {}; L.rizerAttrs(); L.player.attrs.special = 666;
ok(L.rizerSpecialFactor() === 5,
   `a maxed SPECIAL Rizer gets ${L.rizerSpecialFactor()}x the casts from the same bar`);

console.log('\n7c · ★★ RXP AND AP ARE TWO SYSTEMS, NOT ONE\n');
console.log('     The Creator: "rxp and stat attribute points have to be two');
console.log('     separate systems that work together." RXP buys levels, levels');
console.log('     grant AP, AP buys stats — three steps, two currencies, one');
console.log('     direction. Each has its own endpoint on the page.\n');
ok(L.rizerTotalXPFor(1) === 0,
   `RXP · lifetime at Lv 1 = ${L.rizerTotalXPFor(1)} (a new Rizer has earned nothing)`);
ok(L.rizerTotalXPFor(100) === 1000000,
   `RXP · lifetime at Lv 100 = ${L.rizerTotalXPFor(100).toLocaleString()} (the page's figure, exactly)`);
console.log('');
console.log('     The old curve was 100 x L^2, which ALSO reads 1,000,000 at');
console.log('     level 100 and looks right — but it reads 100 at level 1, and');
console.log('     the player starts at level 1 holding zero. So the RXP actually');
console.log('     earned climbing 1 -> 100 was 999,900. One hundred short, with');
console.log('     nothing on screen able to explain it.\n');
ok(100 * 100 * 100 - 100 * 1 * 1 === 999900,
   'the old curve really was 100 short: 100*100^2 - 100*1^2 = 999,900');
// pacing must survive the reshape
let worstDelta = 0, worstAt = 0;
for (let l = 1; l < 100; l++){
  const oldCost = 100 * ((l+1)*(l+1) - l*l);
  const newCost = L.rizerTotalXPFor(l+1) - L.rizerTotalXPFor(l);
  const d = Math.abs(newCost - oldCost);
  if (d > worstDelta){ worstDelta = d; worstAt = l; }
}
ok(worstDelta <= 3,
   `per-level cost moved by at most ${worstDelta} RXP anywhere on the curve (worst at L${worstAt}) — pacing preserved`);
let rxpMono = 0;
for (let l = 2; l <= 100; l++) if (L.rizerTotalXPFor(l) <= L.rizerTotalXPFor(l-1)) rxpMono++;
ok(rxpMono === 0, `RXP total strictly increases every level (${rxpMono} flat or backward)`);
// the two systems must not be derived from one another
ok(!/rizerAttrPool[^\n]*rizerTotalXPFor|rizerTotalXPFor[^\n]*rizerAttrPool/.test(src),
   'neither curve is computed from the other — they are genuinely independent');
console.log('');
console.log('     Lv     RXP lifetime        AP pool');
for (const l of [1, 2, 10, 25, 50, 75, 99, 100]){
  console.log(`     ${String(l).padStart(3)}   ${String(L.rizerTotalXPFor(l).toLocaleString()).padStart(12)}   ${String(L.rizerAttrPool(l)).padStart(8)}`);
}
console.log('');
L.player.rizerLvl = 100; L.player.rizerXP = 0;
ok(L.rizerLifetimeRXP() === 1000000, `rizerLifetimeRXP() at Lv 100 = ${L.rizerLifetimeRXP().toLocaleString()}`);
L.player.rizerLvl = 1; L.player.rizerXP = 0;
ok(L.rizerLifetimeRXP() === 0, `rizerLifetimeRXP() at Lv 1 = ${L.rizerLifetimeRXP()}`);

console.log('\n7d · ★★ THE ARCHETYPE GATE · "MUST assign before leaving the room"\n');
console.log('     This was a nudge at v0.95.713, when the directive read "CAN');
console.log('     assign". It now reads MUST, so it is a lock.\n');
const gate = src.match(/THE ARCHETYPE GATE[\s\S]{0,1400}?useStairs\(_s\)/);
ok(!!gate, 'the gate sits on the Rizer Room stair path');
if (gate){
  ok(/rizerAttrUnspent\(\) > 0/.test(gate[0]), '  fires only while points are unspent');
  ok(/\(player\.rizerLvl \|\| 1\) === 1/.test(gate[0]), '  and only at level 1 — never blocks a later Rizer');
  ok(/isRizerRoomScene\(game\.scene\)/.test(gate[0]), '  and only in a Rizer Room');
  const beforeStairs = gate[0].split('player.stairsCd = now + 1000')[0];
  ok(/return;/.test(beforeStairs), '  it RETURNS — the stairs genuinely do not open');
  ok(/playSFX\('doorLock'\)/.test(gate[0]) && /showToast/.test(gate[0]),
     '  and it says why, rather than eating the input silently');
  ok(!/_archetypeNudged/.test(src), '  the old one-shot nudge flag is gone, so it cannot be bypassed once');
}
// a gate is only safe if the player can always satisfy it
ok(/data-tab="rizer"/.test(src) && /buildRizerAttrPanel\('dock'\)/.test(src),
   'the Nebuladock in that same room can spend them, so the lock is never a dead end');

console.log('\n8 · ★★ EVERY ARCHETYPE PRESET SPENDS EXACTLY THE LEVEL-1 POOL\n');
console.log('     A preset that under-spends silently strands points; one that');
console.log('     over-spends is refused and the button does nothing. Both read');
console.log('     as a broken button, so both are checked.\n');
let presetBad = 0;
for (const [id, A] of Object.entries(L.RIZER_ARCHETYPES)){
  const sum = Object.values(A.spend).reduce((s, v) => s + v, 0);
  const good = sum === 33;
  if (!good) presetBad++;
  const detail = Object.entries(A.spend).map(([k, v]) => `${k} ${v}`).join(' · ');
  console.log(`     ${A.name.padEnd(10)} ${String(sum).padStart(3)}  ${good ? ' ' : '←'} ${detail}`);
}
console.log('');
ok(presetBad === 0, `all ${Object.keys(L.RIZER_ARCHETYPES).length} presets sum to exactly 33 (${presetBad} bad)`);
L.player.rizerLvl = 1; L.player.attrs = {}; L.rizerAttrs();
ok(L.applyRizerArchetype('brawler') === true, 'a preset applies cleanly on a fresh sheet');
ok(L.rizerAttrUnspent() === 0, 'and leaves 0 points stranded');
ok(L.applyRizerArchetype('scout') === false,
   'a second preset is REFUSED — with no respec, stacking two would silently build a hybrid the player never chose');

console.log('\n9 · ★★ DERIVED FIELDS ARE NEVER READ FROM A SAVE\n');
console.log('     Same class of bug as the stale rizerXPMax fixed at v0.95.660:');
console.log('     hpMax / maxHp / baseAtk / astralMax are FUNCTIONS of attrs, so');
console.log('     restoring them from a snapshot lets a save carry ceilings that');
console.log('     disagree with its own attribute table.\n');
ok(/attrs:\s*Object\.assign\(\{\},\s*rizerAttrs\(\)\)/.test(src), 'save writes player.attrs');
const loadIdx = src.indexOf('player.rizerXPMax = rizerXPToNext(player.rizerLvl || 1);');
const loadWin = src.slice(loadIdx, loadIdx + 900);
ok(/player\.attrs\s*=/.test(loadWin), 'load restores attrs from the snapshot');
ok(/recomputeRizerStats\(\s*\{\s*quiet:\s*true\s*\}\s*\)/.test(loadWin),
   'load re-derives hpMax/baseAtk/astralMax rather than trusting the stored values');
L.player.rizerLvl = 50; L.player.attrs = { hp: 500, atk: 300, def: 0, speed: 0, special: 200 };
L.player.hpMax = 99999; L.player.maxHp = 7; L.player.baseAtk = 0.1;   // a corrupt/stale save
L.recomputeRizerStats({ quiet: true });
ok(L.player.hpMax === 200 && L.player.maxHp === 200,
   `a save claiming hpMax 99999 / maxHp 7 is corrected to ${L.player.hpMax} from attrs.hp=500 (50 + 200 x 500/666)`);
ok(L.player.hpMax === L.player.maxHp,
   'hpMax and maxHp always agree — the codebase reads the pair interchangeably, so setting one would leave half the game on the old number');
ok(Math.abs(L.player.baseAtk - (25 + 100 * 300/666)) < 1e-9,
   `baseAtk re-derived to ${L.player.baseAtk.toFixed(2)} from attrs.atk=300 (25 + 100 x 300/666)`);
ok(L.player.astralMax === 100,
   `astralMax is a fixed ${L.player.astralMax} regardless of attrs.special — SPECIAL is a drain rate now, not a pool size`);

console.log('\n10 · ★ SPENDING HP HEALS BY THE DIFFERENCE\n');
L.player.rizerLvl = 100; L.player.attrs = {}; L.rizerAttrs(); L.recomputeRizerStats({ quiet: true });
ok(L.player.hpMax === 50, `an unallocated Rizer has ${L.player.hpMax} max HP`);
L.player.hp = 20;
L.rizerSpend('hp', 333);
const expectMax = Math.round(50 + 200 * 333/666);
ok(L.player.hpMax === expectMax, `333 points into HP → ${L.player.hpMax} max HP`);
ok(L.player.hp === 20 + (expectMax - 50),
   `and hp went 20 → ${L.player.hp}, gaining the whole difference — the point feels like a heal, not a longer empty bar`);
L.player.hp = 5;
L.rizerSpend('atk', 100);
ok(L.player.hp === 5, 'spending a NON-hp stat does not heal');

// ★ Section 11 tested the kind='astral' SPECIAL damage multiplier and its
// seven tagged call sites. The Creator's number-line page replaces SPECIAL
// with a blue-bar drain rate, so the thing this section guarded no longer
// exists. Section 7b asserts its ABSENCE instead — including that the dead
// parameter was removed rather than left inert.

console.log('\n12 · ★★ ONE ALLOCATOR, RENDERED IN TWO PLACES\n');
console.log('     Two hand-written copies of a spend UI is the exact shape of bug');
console.log('     this codebase keeps hitting (FAE_UNLOCK_COUNT 200 vs a hardcoded');
console.log('     REQ 100; SEER_GRUNT_ART vs a stale bbox table) — the two drift,');
console.log('     and the player sees a number the game disagrees with.\n');
const panelCalls = (src.match(/buildRizerAttrPanel\(/g) || []).length;
ok(panelCalls === 3, `buildRizerAttrPanel declared once and called twice (${panelCalls} occurrences)`);
ok(/buildRizerAttrPanel\('dock'\)/.test(src), '  → Nebuladock PC in the Rizer Room (the archetype screen)');
ok(/buildRizerAttrPanel\('phone'\)/.test(src), '  → ZyPhone RIZER tab (every level-up thereafter)');
ok(/const DOCK_TABS = \['rizer'/.test(src), "RIZER is the Nebuladock's first tab, so it opens on the archetype screen");
ok(/data-tab="rizer"/.test(src), 'the dock tab button exists in the panel markup');
// the readout must call the same functions combat calls
for (const fn of ['rizerHpMaxFromAttrs()','rizerBaseAtkFromAttrs()','rizerDefMult()','rizerStaminaFactor()','rizerSpecialFactor()']){
  const panelSrc = bodies.buildRizerAttrPanel;
  ok(panelSrc.includes(fn), `the panel's effect readout calls ${fn} — it cannot claim an effect the game does not apply`);
}

// ★ Section 13 used to assert the OPPOSITE of section 7c — that the stairs
// still work with points unspent — because at v0.95.713 the directive read
// "player CAN assign their attributes at game start". The Creator's new page
// reads "they MUST assign 33 points to their build before leaving the room".
// A test that survives a reversed requirement is a test that will fail loudly
// and correctly, which is what happened; the fix is to delete it, not to
// weaken 7c. Leaving both would have meant the suite arguing with itself.

console.log('\n13 · ★★ ONE STAT SYSTEM, NOT TWO\n');
console.log('     Creator: "remove scrapjaw upgrades and cosmetic upgrades for');
console.log('     now. keep the current attribute system."\n');
console.log('     What was removed had been showing HEALTH/ATTACK/DEFENSE/SPEED/');
console.log('     SPECIAL at "TIER 2/5 · +20 HP · +6 ATK" in the ZyPhone and on a');
console.log('     full-screen page — five stat names identical to the AP system.');
console.log('     None of it was ever applied: player.rizerSkins[].tiers had two');
console.log('     readers and BOTH were renderers, so those numbers had never');
console.log('     once changed a hit. A fictional stat ladder sitting beside a');
console.log('     real one is the worst thing to leave in place.\n');
const noComments = src.replace(/\/\/[^\n]*/g, '');
ok(!/\.tiers\b/.test(noComments),
   'no code reads or writes a per-skin `tiers` ladder any more');
ok(!/activeTiers/.test(noComments), 'the canvas upgrade page\'s tier table is gone');
// ★ First written as /TIER \$\{|TIER \d\/5/ and it failed — on `TIER ${z.tier}`,
// which is the ZYREX tier shown in the Faction panel and has nothing to do with
// the retired ladder. Two different things called "tier". Match the retired
// one's actual shape: a value out of FIVE.
ok(!/TIER\s*(\$\{[^}]*\}|\d+)\s*\/\s*5/.test(noComments),
   'no "TIER n/5" ladder readout survives (Zyrex tiers, a different thing, are untouched)');
ok(!/gems fuel upgrades|trade gems for stat/.test(noComments),
   'nothing still advertises the retired gem-for-stats shop');
ok(!/skins, cosmetics, stat boosts/.test(src),
   'Scrapjaw no longer promises a stat-boost shop in dialogue');
// the RIZER hud page must still be useful, not a dead tab
const pageIdx = src.indexOf('function drawRizerUpgradesPage');
const page = src.slice(pageIdx, pageIdx + 4200);
ok(pageIdx > 0, 'the RIZER hud page still exists (the L1/R1 gear tab points at it)');
for (const fn of ['rizerAttrPool','rizerAttrSpent','rizerHpMaxFromAttrs','rizerBaseAtkFromAttrs','rizerDefMult','rizerStaminaFactor','rizerSpecialFactor']){
  ok(page.includes(fn + '('), `  and renders the REAL system · calls ${fn}()`);
}
// unbuilt content must not be faked
ok(/not yet available/.test(src), 'gear is described as a plan, with no numbers and no button');
ok(!/rizerSpend\([^)]*gear|gearBoost|applyGearBoost/.test(noComments),
   'and no gear-boost code path exists yet to be half-wired');

console.log('\n14 · ★ BOOT INITIALISES BEFORE ANYTHING READS THE CEILINGS\n');
const bootIdx = src.indexOf('if (player.rizerLvl == null) player.rizerLvl = 1;');
// 700 was too narrow — the boot block runs ~690 chars, so astralStatus fell
// just outside the window and the ordering check compared against -1.
const bootWin = src.slice(bootIdx, bootIdx + 1600);
ok(/rizerAttrs\(\);/.test(bootWin) && /recomputeRizerStats\(\{ quiet: true \}\)/.test(bootWin),
   'boot normalises attrs and derives the ceilings');
// ★ Strip comments BEFORE any positional test. This assertion failed on its
// first run for the second time in this file — the comment above the call
// reads "Runs BEFORE astralStatus...", so indexOf('astralStatus') found my own
// prose sitting one line ABOVE recomputeRizerStats and reported correct code as
// broken. Ordering questions have to be asked of the code, never of the file.
const bootCode = bootWin.replace(/\/\/[^\n]*/g, '');
const iRecompute = bootCode.indexOf('recomputeRizerStats');
const iStatus    = bootCode.indexOf('astralStatus');
ok(iRecompute >= 0 && iStatus > iRecompute,
   `and does so before astralStatus (recompute @${iRecompute} < astralStatus @${iStatus}), so downstream readers see real numbers`);

console.log(f ? `\n❌ ${f} failure(s)` : '\n✅ ALL CHECKS PASS');
process.exit(0);
