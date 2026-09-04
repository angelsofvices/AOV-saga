// ★ v0.95.949 · companion abilities
// Two things must hold: the ability is reachable WITHOUT soul-switch (which is
// parked), and taking R2 for it must not cost Rizer his block.
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(ROOT,'rp7b.html'),'utf8');
let fail=0; const ok=m=>console.log('  ok   '+m); const bad=m=>{console.log('  FAIL '+m);fail++;};

for (const [re,l] of [
  [/const COMPANION_ABILITIES = \{/,          'ability table exists'],
  [/auraxion: \{[\s\S]{0,240}?fire: \(\) => toggleAuraxionPhaseFlight\(\)/, 'Auraxion entry wired to the phase toggle'],
  [/function activeCompanionAbility\(\)/,      'resolver exists'],
  [/const COMPANION_ABILITY_RANGE = 6;/,       'range gate (6 tiles)'],
  [/const R2_HOLD_MS = 180;/,                  'hold threshold'],
]) re.test(html) ? ok(l) : bad(l);

// ★ the resolver must be source-agnostic: proximity + scene, not a hardcoded list
const res = (html.match(/function activeCompanionAbility\(\)\{[\s\S]*?\n\}/)||[''])[0];
if (!/COMPANION_ABILITIES\[n\.id\]/.test(res)) bad('resolver does not look allies up in the table');
else ok('resolver is table-driven, not hardcoded');
if (!/\(n\.scene \|\| 'overworld'\) !== game\.scene/.test(res)) bad('resolver ignores scene');
else ok('resolver requires the ally be in your scene');

// ★ THE REGRESSION THAT MATTERS: block must still be instant with no companion
const press = (html.match(/const _ab = \(typeof activeCompanionAbility[\s\S]*?\n  \}/)||[''])[0];
if (!/\} else \{[\s\S]*?player\.blocking = true;/.test(press))
  bad('no-companion path does not block instantly');
else ok('with no companion, R2 still blocks INSTANTLY');
if (!/player\._r2HoldStart = performance\.now\(\)/.test(press))
  bad('companion path does not start a hold timer');
else ok('with a companion, R2 starts a tap/hold decision');

// ★ hold must promote to block — otherwise the ability silently ate the guard
if (!/performance\.now\(\) - player\._r2HoldStart >= R2_HOLD_MS[\s\S]{0,240}?player\.blocking = true;/.test(html))
  bad('holding R2 does not promote into a block');
else ok('holding R2 past the threshold still blocks');

// ★ release under the threshold fires the ability, read from the PRESS
const rel = (html.match(/if \(k === 'i' && player && player\._r2HoldStart\)\{[\s\S]*?\n  \}/)||[''])[0];
if (!/const ab   = player\._r2Ability;/.test(rel)) bad('release re-resolves the ability instead of using the press');
else ok('release uses the ability captured at press time');
if (!/held < R2_HOLD_MS/.test(rel)) bad('release does not check the threshold');
else ok('release fires only under the threshold');

// ★ phase must no longer require being Auraxion
if (/return player\.activeActor==='auraxion' && game\.scene==='overworld'/.test(html))
  bad('auraxionPhaseFlightActive still requires BEING Auraxion');
else ok('phase no longer requires soul-switch');
if (!/const lent = player\.activeActor === 'rizer'/.test(html)) bad('no borrowed-phase path');
else ok('Rizer can phase while Auraxion accompanies him');

console.log(fail?`\n${fail} FAILURE(S)`:'\nall companion-ability checks passed');
process.exit(fail?1:0);
