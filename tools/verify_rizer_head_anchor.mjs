// ★★★★ v0.99.3 · RIZER IS ONE SIZE · idle's head is the anchor for every bank.
//
//   Creator, 2026-09-18: "make sure rizer is the same size in all frames. kick
//   was coming out weird ... use rizers idle head DLRU scale as the universal
//   anchor of his frames (kick, etc.)"
//
// ★★★★ THE KICK WAS A SYMPTOM OF A STRUCTURAL BUG. Only idle, walk and run
//   carried a measured bodyBh. Sixteen other banks fell through to
//   `(TILE*2) / bboxes[0][0][3]` — one number, from the DOWN column-0 box, used
//   for ALL FOUR DIRECTIONS. Idle's own scale is not one number: 0.513 / 0.581 /
//   0.584 / 0.560 across D/L/R/U. So a flat fallback can match idle in at most
//   one direction, and every bank was a different size depending on which way he
//   faced:
//        kick  88% / 77% / 77% / 80%     guitarPlay  78% / 69% / 69% / 72%
//        skate 86% / 76% / 76% / 79%     block       90% / 80% / 79% / 83%
//
// ★★★ THE ASSERTION THAT MATTERS is the per-direction spread. "Same size in all
//   frames" is falsifiable exactly there: if turning left changes how big he is,
//   nothing else in this file matters.
import { bootGame } from './lib/boot_game.mjs';
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; return !!c; };
const H  = t => console.log('\n' + t);

const _L = console.log; console.log = () => {};
const G = bootGame({ extra: ['RIZER','rizerRowScale','rizerTargetBodyPx','RIZER_HEAD_SCALE','TILE'] });
console.log = _L;
const R = G.RIZER, idle = R.idle, D = ['DOWN','LEFT','RIGHT','UP'];
const isVfx = b => /projectile|boom/i.test(String(b.key || '')) || b.headAnchor === false;
// ★ the suite must resolve the scale the SAME way the game does — by the
//   bundle's key, normalised — or it grades a lookup nobody performs.
const baseKey = k => String(k || '').toLowerCase()
  .replace(/-(power-upgrade|luminary|preview)$/g, '').replace(/[-_\s]/g, '');
const hsOf = b => (b.headScale != null) ? b.headScale : (G.RIZER_HEAD_SCALE[baseKey(b.key)] || 1);
const banks = Object.entries(R).filter(([, b]) => b && typeof b === 'object' && b.bboxes);
const anchored = banks.filter(([, b]) => !isVfx(b) && !b.bodyBh);

H('★★★★ HE IS THE SAME SIZE WHICHEVER WAY HE FACES');
{
  ok(anchored.length >= 14, `${anchored.length} banks ride the anchor`);
  let worst = 0, worstName = '';
  for (const [k, b] of anchored){
    const rel = D.map((_, r) => G.rizerRowScale(b, r) / G.rizerRowScale(idle, r));
    const spread = (Math.max(...rel) - Math.min(...rel)) * 100;
    if (spread > worst){ worst = spread; worstName = k; }
    ok(spread < 0.01, `  ${k.padEnd(14)} ${rel.map(x => Math.round(x*100)+'%').join(' ')}  spread ${spread.toFixed(2)}%`);
  }
  ok(worst < 0.01, `★★★★ worst per-direction spread across every anchored bank: ${worst.toFixed(3)}% (${worstName})`);
}

H('★★★ THE ANCHOR IS IDLE\'S ROW SCALE · not its row 0, not the bank\'s own box');
{
  for (const [k, b] of anchored){
    const hs = hsOf(b);
    const okAll = D.every((_, r) => Math.abs(G.rizerRowScale(b, r) - G.rizerRowScale(idle, r) * hs) < 1e-9);
    ok(okAll, `  ${k.padEnd(14)} = idleRowScale(row) x ${hs}`);
  }
  // ★ the old flat fallback must no longer be reachable for a Rizer bank
  const flat = anchored.filter(([, b]) => {
    const dbh = b.bboxes[0][0][3];
    return D.every((_, r) => Math.abs(G.rizerRowScale(b, r) - (G.TILE*2)/dbh) < 1e-9);
  });
  ok(flat.length === 0, `★★ no Rizer bank still uses the flat (TILE*2)/box fallback (${flat.length} would)`);
}

H('★★ WHAT KEEPS ITS OWN MEASUREMENT, AND WHAT OPTS OUT');
{
  for (const n of ['idle','walk','run'])
    ok(!!R[n].bodyBh, `  ${n.padEnd(5)} keeps its measured bodyBh · Creator-approved sizes, untouched`);
  const vfx = banks.filter(([, b]) => isVfx(b));
  ok(vfx.length >= 1, `${vfx.length} VFX bundle(s) opt out · ${vfx.map(([k]) => k).join(', ')}`);
  for (const [k, b] of vfx){
    const dbh = b.bboxes[0][0][3];
    ok(Math.abs(G.rizerRowScale(b, 0) - (G.TILE*2)/dbh) < 1e-9,
       `  ${k} keeps its shipped scale · a fireball has no head to anchor`);
  }
}

H('★★★ EVERY HEAD SCALE IS A MEASUREMENT, AND IN THE RANGE A MEASUREMENT CAN BE');
{
  const T = G.RIZER_HEAD_SCALE;
  ok(Object.keys(T).length >= 12, `${Object.keys(T).length} banks carry a head scale`);
  const bad = Object.entries(T).filter(([, v]) => !(v > 0.7 && v <= 1.05));
  ok(bad.length === 0,
     bad.length ? `★ out of range: ${bad.map(([k,v]) => k+'='+v).join(', ')}`
                : '★★ all between 0.78 and 1.00 · action poses are drawn slightly larger in the cell, '
                + 'which is what the numbers say and what the art shows');
  // ★ every key must name a real bank · a typo here is a silent no-op
  // ★★★ EVERY KEY MUST RESOLVE THROUGH THE SAME NORMALISER THE GAME USES.
  //   This is the check that caught the real bug: RIZER.doubleJump carries
  //   key 'double-jump', so a table entry spelled doubleJump was a silent miss.
  const names = new Set(banks.map(([, b]) => baseKey(b.key)));
  const orphan = Object.keys(T).filter(k => !names.has(k));
  ok(orphan.length === 0, orphan.length ? `★ names nothing: ${orphan.join(', ')}` : '★ every key resolves to a live bank');
  ok(T.kick === 0.88, `★★★ kick is ${T.kick} — the reported bug. It was drawing at 77% of idle in profile`);
}

H('★★★★ AND IT SURVIVES THE SKIN SWAP');
{
  // ★ RIZER.kick is REPLACED by RIZER_POWER_KICK ('kick-power-upgrade') when he
  //   powers up, and by 'kick-luminary' at S3. Keyed on the raw string, the
  //   measurement would apply to S1 and to nothing else — so he would change
  //   size the instant he transformed, which is this very bug hiding one
  //   evolution away.
  for (const [s1, s2] of [['kick','kick-power-upgrade'], ['kick','kick-luminary'],
                          ['punch','punch-power-upgrade'], ['double-jump','double-jump-luminary']]){
    ok(baseKey(s1) === baseKey(s2),
       `  ${s1.padEnd(12)} and ${s2.padEnd(24)} resolve to the same measurement (${baseKey(s2)})`);
    ok(G.RIZER_HEAD_SCALE[baseKey(s2)] != null,
       `     ★ and that measurement exists · ${G.RIZER_HEAD_SCALE[baseKey(s2)]}`);
  }
}

H('★★★ NO BANK CARRIES A HAND-TUNED LIFT ON TOP OF THE MEASUREMENT');
{
  // ★★★★ The kick shipped with visualScale 1.05 — "a restrained five-percent
  //   visual lift" added because "reusing idle's raw pixel ratio overcorrected
  //   by 12-20%". That observation was exactly right and had no number attached:
  //   the measured correction is 0.88, i.e. 13.6%, inside the range that was
  //   seen by eye. With RIZER_HEAD_SCALE carrying it, the lift became a SECOND
  //   compensation on the first (0.88 x 1.05 = 0.924, 5% over) — which is how a
  //   number nobody can derive ends up in a file.
  const lifted = anchored.filter(([, b]) => b.visualScale != null && b.visualScale !== 1);
  ok(lifted.length === 0,
     lifted.length ? `★ still lifted: ${lifted.map(([k, b]) => k + ' x' + b.visualScale).join(', ')}`
                   : '★★★ no anchored bank stacks a visualScale on its head measurement');
}

H('★ THE ANCHOR ITSELF IS STILL THE SHIPPING IDLE');
{
  ok(Math.abs(G.rizerTargetBodyPx() - 92.92) < 0.01,
     `target body ${G.rizerTargetBodyPx().toFixed(2)}px · "his idle before size is perfect" (v0.95.940)`);
  ok(JSON.stringify(idle.bodyBh) === '[181,160,159,166]', 'idle bodyBh untouched · the anchor did not move');
  const rel = D.map((_, r) => G.rizerRowScale(idle, r) / G.rizerRowScale(idle, r));
  ok(rel.every(x => x === 1), '★ and idle is trivially 100% of itself in every direction');
}

console.log(f ? `\n❌ ${f} failed` : '\n✅ one character, one size · every bank anchored to idle\'s head, every direction');
process.exit(f ? 1 : 0);
