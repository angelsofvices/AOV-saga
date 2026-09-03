// ★ v0.95.943 · Seer grunt sprites + behaviour
// Two classes of guarantee: the ART must be measured by connected component
// (no bleed, no clipping, one size per character), and the BEHAVIOUR must be
// hold-until-contact with a one-tile strike.
const fs=require('fs'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(ROOT,'rp7b.html'),'utf8');
let fail=0; const ok=m=>console.log('  ok   '+m); const bad=m=>{console.log('  FAIL '+m);fail++;};

// ── 1 · ART · re-measure from the PNGs and compare to what shipped ───────
const out = cp.execSync('python3 tools/measure_seer_grunts.py', {cwd:ROOT}).toString();
const heights = {};
for (const m of out.matchAll(/^\s+(idle|walk|run|attack)\s+body heights\s+(.+)$/gm)){
  const rows = m[2].split('|').map(r => JSON.parse(r.trim()));
  (heights[m[1]] = heights[m[1]] || []).push(rows);
}
// A then B for each kind
const A = {}, B = {};
for (const k of Object.keys(heights)){ A[k]=heights[k][0]; B[k]=heights[k][1]; }

// ★ NO BLEED: every measured body height must be plausible for that character.
// Bleed and stray-sliver contamination showed up as 275/294/307 against bodies
// of ~195/~250 — so a band check catches exactly the failure that shipped.
function band(who, tables, lo, hi, exceptions){
  let worst = null;
  for (const k of Object.keys(tables)){
    for (let r=0;r<4;r++) for (let c=0;c<4;c++){
      const v = tables[k][r][c];
      const isCrouch = exceptions.some(e => e.k===k && e.r===r);
      if (isCrouch) continue;
      if (v < lo || v > hi) worst = `${k} r${r}c${c} = ${v}`;
    }
  }
  if (worst) bad(`${who} body height out of band ${lo}-${hi}: ${worst}`);
  else ok(`${who} every locomotion height inside ${lo}-${hi} · no bleed`);
}
band('A (female)', A, 185, 215, [{k:'attack',r:1},{k:'attack',r:2}]);
band('B (male)',   B, 200, 270, []);

// ★ ONE SIZE PER CHARACTER: standBh must equal the measured IDLE max.
const idleMaxA = Math.max(...A.idle.flat()), idleMaxB = Math.max(...B.idle.flat());
const mA = html.match(/standBh: (\d+), scaleMul: 1\.075/);
const mB = html.match(/standBh: (\d+), scaleMul: 1\.150/);
if (!mA||!mB) bad('standBh lines not found');
else {
  if (+mA[1]!==idleMaxA) bad(`A standBh ${mA[1]} != measured idle max ${idleMaxA}`);
  else ok(`A standBh ${idleMaxA} == measured idle max`);
  if (+mB[1]!==idleMaxB) bad(`B standBh ${mB[1]} != measured idle max ${idleMaxB}`);
  else ok(`B standBh ${idleMaxB} == measured idle max`);
}
// ★ the two characters must stay DIFFERENT sizes
if (idleMaxA === idleMaxB) bad('A and B measure identical — they are different characters');
else ok(`A ${idleMaxA} vs B ${idleMaxB} · respective sizes preserved`);

// ── 2 · BEHAVIOUR ────────────────────────────────────────────────────────
const checks = [
  [/_contactAggro: true/, 'garrison holds until contact'],
  [/n\._contactAggro && !\(\(n\._aggroUntil \|\| 0\) > performance\.now\(\)\)/, 'contact-aggro gate in the AI'],
  [/cdx \+ cdy <= 1/, 'contact radius is ONE tile'],
  [/function seerPatrolStep/, 'deterministic patrol exists'],
  [/wanderRadius: 0,/, 'random wander disabled for the garrison'],
  [/if \(manh === 1 && inPlay\)/, 'strike is one tile and works in interiors'],
  [/if \(n\.attackSheet && manh <= 1 && inPlay\)/, 'attack anim is one tile and works in interiors'],
  [/const inPlay = \(game\.scene === 'overworld'\)/, 'inPlay replaces the overworld-only gate'],
];
for (const [re,label] of checks){ re.test(html) ? ok(label) : bad(label); }
// ★ the old overworld-only gates must be gone from the combat branch
if (/manh === 1 && game\.scene === 'overworld'/.test(html)) bad('an overworld-only strike gate survives');
else ok('no overworld-only combat gates remain');

console.log(fail ? `\n${fail} FAILURE(S)` : '\nall grunt checks passed');
process.exit(fail?1:0);
