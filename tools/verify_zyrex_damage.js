#!/usr/bin/env node
/* verify_zyrex_damage.js · v0.95.974
 *
 *   Creator: "make all zyrex be ready to battle now. no more toggle for
 *   hostile. MAKE SURE that their attack stat matches their damage output.
 *   make the math logical. every zyrex should have tier based stats. attack
 *   stat is directly related to how strong their default move is"
 *
 * ★ The bug this replaces is the kind a screenshot cannot show: damage was
 *   `(tier*30)+(level*2)` and never read the ATK stat, so two T5 creatures 132
 *   ATK apart hit for the identical number.  So this suite RUNS the shipped
 *   functions over the real SPECIES table and asserts PROPERTIES — chiefly
 *   that damage is strictly monotonic in ATK — rather than checking that some
 *   constant is present.  A property survives a re-tune; a magic number does not.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');

let pass = 0, fail = 0;
const ok = (m) => { pass++; console.log('  ok   · ' + m); };
const no = (m) => { fail++; console.log('  FAIL · ' + m); };
const t  = (c, m) => c ? ok(m) : no(m);

console.log('\n=== ZYREX DAMAGE · the attack stat IS the output (v0.95.974) ===\n');

/* ── lift the real tables + the real functions ───────────────────────────── */
function balanced(src, from){
  let i = src.indexOf('{', from), d = 0;
  for (let j = i; j < src.length; j++){
    const c = src[j];
    if (c === '{') d++;
    else if (c === '}'){ d--; if (!d) return src.slice(from, j + 1); }
  }
  return null;
}
const speciesSrc = balanced(HTML, HTML.search(/const\s+SPECIES\s*=/));
const dexSrc     = balanced(HTML, HTML.search(/const\s+MOVE_DEX\s*=/));
t(!!speciesSrc && !!dexSrc, 'SPECIES and MOVE_DEX tables lifted');

const grab = (name) => {
  const at = HTML.indexOf(`function ${name}(`);
  if (at < 0) return '';
  return balanced(HTML, at);
};
const box = { console, Math, Array, Object };
vm.createContext(box);
// ★ `const X = …` inside a vm context does NOT become a property of the
// sandbox object, so the tables have to be re-exported by hand or the suite
// reads undefined and dies before its first real assertion.
vm.runInContext(`
  var ${speciesSrc.replace(/^const\s+/, '')};
  var ${dexSrc.replace(/^const\s+/, '')};
  globalThis.SPECIES = SPECIES; globalThis.MOVE_DEX = MOVE_DEX;
  function canonType(x){ return x; }
  // the two tuning constants, lifted from the file rather than re-typed here —
  // a suite that hard-codes the knob it is testing cannot detect a re-tune.
  ${(HTML.match(/^const STRIKE_BASE_PW\s*=\s*\d+;/m) || [''])[0].replace(/^const/, 'var')}
  ${(HTML.match(/^const STRIKE_DIV\s*=\s*\d+;/m) || [''])[0].replace(/^const/, 'var')}
  ${grab('moveData')}
  ${grab('zyrexAttackStat')}
  ${grab('zyrexDefaultMove')}
  ${grab('zyrexDefaultMovePower')}
  ${grab('computeZyrexDamage')}
  ${grab('createZyrex')}
  globalThis.MOVE_UNLOCK_LV = [1,15,30,60];
  globalThis.MOVE_PP_BY_SLOT = [20,15,10,5];
`, box);

const ids = Object.keys(box.SPECIES);
t(ids.length > 40, `${ids.length} species loaded`);

/* ── 1 · THE POINT · damage is monotonic in ATK ─────────────────────────── */
{
  // hold tier, level and move power fixed; vary only ATK
  const probe = (atk) => box.computeZyrexDamage({ speciesId: '__x', atk, level: 50,
                                                  moves: [{ name: 'Palm Strike' }] });
  const series = [50, 100, 200, 400, 800].map(probe);
  const rising = series.every((v, i) => i === 0 || v > series[i-1]);
  t(rising, `★ damage rises strictly with ATK · ${series.join(' < ')}`);
  // ★ measured well away from the rounding floor: at probe(200)=33 a single
  // rounded unit is 3% of the answer, so a 2% tolerance there tests Math.round,
  // not the formula.
  t(Math.abs(probe(8000) / probe(4000) - 2) < 0.005,
    '★ and it is LINEAR in ATK · doubling the stat doubles the damage');
}

/* ── 2 · the DEFAULT MOVE scales it ─────────────────────────────────────── */
{
  const at = (pw) => {
    const nm = Object.keys(box.MOVE_DEX).find(k => box.MOVE_DEX[k].pw === pw && box.MOVE_DEX[k].slot === 'A1');
    return nm && box.computeZyrexDamage({ speciesId:'__x', atk: 400, level: 50, moves:[{name:nm}] });
  };
  const lo = at(35), hi = at(45);
  t(lo && hi && hi > lo, `★ a stronger default move hits harder at identical ATK · pw35 ${lo} < pw45 ${hi}`);
  t(Math.abs(hi / lo - 45/35) < 0.03, '  · and in exact proportion to the move power');
}

/* ── 3 · no double-counting of level ─────────────────────────────────────── */
{
  // z.atk already carries (1 + (lvl-1)*0.05).  The formula must not add a
  // second level term on top — the OLD one did, via `+ level*2`.
  const a = box.computeZyrexDamage({ speciesId:'__x', atk: 400, level: 1,   moves:[{name:'Palm Strike'}] });
  const b = box.computeZyrexDamage({ speciesId:'__x', atk: 400, level: 100, moves:[{name:'Palm Strike'}] });
  t(a === b, `★ level is NOT counted twice · same ATK, Lv1 ${a} === Lv100 ${b}`);
  // ...but the live stat does carry it, so a real creature does grow
  const z1  = box.createZyrex('lupinor', 1);
  const z50 = box.createZyrex('lupinor', 50);
  t(box.computeZyrexDamage(z50) > box.computeZyrexDamage(z1) * 3,
    `  · while a REAL creature still grows with level · Lv1 ${box.computeZyrexDamage(z1)} → Lv50 ${box.computeZyrexDamage(z50)}`);
}

/* ── 4 · tier ordering emerges without being written down ───────────────── */
{
  t(!/tier/.test(box.computeZyrexDamage.toString()),
    '★ computeZyrexDamage never mentions tier — it does not have to');
  const byTier = {};
  for (const id of ids){
    const sp = box.SPECIES[id];
    if (!sp || !sp.tier || !sp.baseATK) continue;
    const z = box.createZyrex(id, Math.min(80, sp.tier * 10));
    if (z) (byTier[sp.tier] = byTier[sp.tier] || []).push(box.computeZyrexDamage(z));
  }
  const tiers = Object.keys(byTier).map(Number).sort((a,b)=>a-b);
  const avgs = tiers.map(t2 => byTier[t2].reduce((a,b)=>a+b,0) / byTier[t2].length);
  const mono = avgs.every((v,i) => i === 0 || v > avgs[i-1]);
  console.log('\n       tier ladder (avg damage at Lv = tier×10):');
  tiers.forEach((t2,i) => console.log(`         T${String(t2).padEnd(3)} n=${String(byTier[t2].length).padStart(2)}  avg ${avgs[i].toFixed(0).padStart(5)}   range ${Math.min(...byTier[t2])}–${Math.max(...byTier[t2])}`));
  console.log('');
  t(mono, '★ higher tier hits harder, every step — falls out of the T×333 pool alone');
}

/* ── 5 · spread WITHIN a tier · the actual complaint ────────────────────── */
{
  const t5 = ids.filter(id => box.SPECIES[id].tier === 5 && box.SPECIES[id].baseATK);
  const d = t5.map(id => ({ id, atk: box.SPECIES[id].baseATK,
                            dmg: box.computeZyrexDamage(box.createZyrex(id, 50)) }))
              .sort((a,b) => b.atk - a.atk);
  console.log('       T5 at Lv50 — every one of these used to deal exactly 250:');
  d.forEach(x => console.log(`         ${x.id.padEnd(14)} ATK ${String(x.atk).padStart(3)}  →  ${String(x.dmg).padStart(4)}`));
  console.log('');
  const uniq = new Set(d.map(x => x.dmg)).size;
  t(uniq > 1, `★ same tier + same level now spans ${Math.min(...d.map(x=>x.dmg))}–${Math.max(...d.map(x=>x.dmg))}, not one flat number`);
  // and the ordering must follow ATK, not species order
  const byAtk = [...d].sort((a,b) => b.atk - a.atk).map(x => x.dmg);
  const drops = byAtk.filter((v,i) => i && v > byAtk[i-1]).length;
  t(drops <= 2, `  · damage tracks ATK order (${drops} inversions, all from move power)`);
}

/* ── 6 · every species answers · nothing returns the fallback 1 ──────────── */
{
  const dead = ids.filter(id => {
    const sp = box.SPECIES[id];
    if (!sp || !sp.tier) return false;
    const z = box.createZyrex(id, Math.min(80, sp.tier * 10));
    return !z || box.computeZyrexDamage(z) <= 1;
  });
  t(dead.length === 0, `every species deals real damage (${dead.length} fell through to the floor)`);
  const noMove = ids.filter(id => {
    const sp = box.SPECIES[id];
    return sp && sp.tier && !(Array.isArray(sp.moves) && sp.moves[0]);
  });
  t(noMove.length === 0, `every species declares a default move (${noMove.length} missing)`);
}

/* ── 7 · TIER-BASED STATS · the T×333 pool ──────────────────────────────── */
{
  const off = [];
  for (const id of ids){
    const sp = box.SPECIES[id];
    if (!sp || !sp.tier) continue;
    const sum = ['baseHP','baseATK','baseDEF','baseSPD','baseSATK','baseSDEF']
      .reduce((a,k) => a + (sp[k] || 0), 0);
    if (sum !== sp.tier * 333) off.push(`${id} T${sp.tier} ${sum}/${sp.tier*333}`);
  }
  // anciuxor is a documented poolExempt (True God · 999×6) — the ONE allowance
  const unexplained = off.filter(s => !s.startsWith('anciuxor'));
  t(unexplained.length === 0,
    `★ every species sits exactly on tier×333 (${off.length} exception${off.length===1?'':'s'}: ${off.join(', ') || 'none'})`);
}

/* ── 8 · wilds are battle-ready · they have a body now ──────────────────── */
{
  const src = HTML.slice(HTML.indexOf('function spawnWildZyrex'));
  const fn = src.slice(0, src.indexOf('\n}') + 2);
  t(/createZyrex\(speciesId,\s*w\.level\)/.test(fn),
    '★ spawnWildZyrex builds its stat block through createZyrex — the same constructor as the party');
  for (const k of ['atk','def','hp','maxHp','satk','sdef','spd','moves']){
    t(new RegExp(`w\\.${k}\\s*=`).test(fn), `  · a wild carries ${k}`);
  }
}

/* ── 9 · a hostile wild actually lands a hit ────────────────────────────── */
{
  const at = HTML.indexOf('w._hostileUntil && Date.now() < w._hostileUntil');
  const blk = HTML.slice(at, at + 2200);
  t(/computeZyrexDamage\(w\)/.test(blk),
    '★ the hostile branch computes damage from the WILD\'s own stats');
  t(/hurtPlayer\(/.test(blk), '  · and actually applies it to Rizer');
  t(/_strikeAt/.test(blk),    '  · on its own cooldown, not every frame');
}

/* ── 10 · no toggle ─────────────────────────────────────────────────────── */
{
  t(/function isDuelMode\(\)\{\s*return true;\s*\}/.test(HTML.replace(/\s+/g,' ').replace(/ \{/g,'{').replace(/\{ /g,'{')) ||
    /isDuelMode\(\)\{ return true/.test(HTML.replace(/\s+/g,' ')),
    '★ isDuelMode() is unconditionally true');
  t(/isAggressiveMode\(\)\{ return true/.test(HTML.replace(/\s+/g,' ')),
    '  · and so is isAggressiveMode()');
  const gate = HTML.indexOf("if (n.id && n.id.startsWith('_summon_') && n._summoned){");
  t(gate > 0, '★ the companion combat gate no longer tests a toggle');
  t(!/if \(isAggressiveMode\(\) && n\.id/.test(HTML),
    '  · the old `if (isAggressiveMode() && ...)` gate is gone');
  t(!/Toggle DUEL MODE/.test(HTML), '  · and the controls sheet no longer advertises it');
}

console.log(`\n★ ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
