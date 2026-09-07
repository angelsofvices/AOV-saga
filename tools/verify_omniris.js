#!/usr/bin/env node
/* verify_omniris.js · v0.95.990
 *
 *   Creator: "omniris puts you on 8 quests that eventually allows you to unlock
 *   the ability to meditate and recover health when you are in block animation.
 *   he will also lead you to andrannor. I also wanna make it that kelthor
 *   always updates you on what elder or master to find in each district."
 *
 * ★★★ THIS SUITE EXISTS BECAUSE I WROTE SEVEN IDENTIFIERS THAT DID NOT EXIST.
 *   In one feature: zyrexBondPct, soulphishCaught, seerHqFound, player.level,
 *   player.attacking, player._attackUntil, player.towerNet — and then, in the
 *   comment correcting them, rizerLevel(). Every one would have compiled,
 *   shipped, and silently made a trial impossible to finish. That is the exact
 *   shape of the five dead flags already in this file (malezorBroadcastDone,
 *   lostBoyReunited, kelthorSeedsFed, kelthorFirstQuestGiven/Complete): a
 *   reward written before its verifier.
 *
 * ★★ So the rule this suite enforces is: EVERY FLAG A TRIAL READS MUST BE SET
 *   SOMEWHERE, and every flag it sets must be SAVED. A quest that cannot be
 *   completed and a quest that forgets it was completed are the same bug from
 *   opposite ends.
 *
 * ★ The cheapest detector, and the one that actually found them: grep each
 *   identifier for its occurrence COUNT. A name that appears exactly once
 *   appears only where I typed it.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
// ★ comments stripped for every ABSENCE/PRESENCE test · three suites have been
// bitten by matching their own explanatory prose
const CODE = HTML.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');

let pass = 0, fail = 0;
const ok = (m) => { pass++; console.log('  ok   · ' + m); };
const no = (m) => { fail++; console.log('  FAIL · ' + m); };
const t  = (c, m) => c ? ok(m) : no(m);

console.log('\n=== OMNIRIS · the eight trials, and can they be finished? ===\n');

/* ── 1 · the ladder exists and is sequential ────────────────────────────── */
const at = CODE.indexOf("id: 'omniris'");
t(at > 0, 'Omniris NPC exists');
const blk = CODE.slice(at, at + 12000);
// ★ Trial 3 is the exception and the exception is correct: you complete The
// Unblinking by NOT interacting, so its flag is set by the stillness timer
// rather than by the dialogue. Searching only the NPC block failed it — the
// right fix was to widen the search, not to move the flag into a conversation
// the player is forbidden from having mid-trial.
for (let i = 1; i <= 8; i++){
  const where = (i === 3) ? CODE : blk;
  t(new RegExp(`OS\\.s${i} = true`).test(where),
    `  trial ${i} has a completion that SETS its flag` + (i === 3 ? ' (in the timer, correctly)' : ''));
}

/* ── 2 · ★★ EVERY VERIFIER IS A REAL, WRITTEN FIELD ─────────────────────── */
console.log('\n  ── the check that would have caught all seven ──');
const NEEDS = {
  'player.soulphishCaught':      /player\.soulphishCaught\s*=/,
  'player.seerHqFound':          /player\.seerHqFound\s*=|seerHqFound\[/,
  'player.dreamlandSeen':        /player\.dreamlandSeen\s*=/,
  'player.towerBatteries':       /player\.towerBatteries\[|player\.towerBatteries\s*=/,
  'player.rizerLvl':             /player\.rizerLvl\s*=/,
  'player.attackUntil':          /player\.attackUntil\s*=/,
  'z.bond':                      /\.bond\s*=/,
  'player.meditationUnlocked':   /player\.meditationUnlocked\s*=/,
  'player.elderLaddersDone':     /player\.elderLaddersDone\s*=|elderLaddersDone\./,
};
for (const [name, setter] of Object.entries(NEEDS))
  t(setter.test(CODE), `${name.padEnd(28)} is WRITTEN somewhere, not just read`);

// ★ and the inverse: none of the names I invented may come back
const GHOSTS = ['zyrexBondPct', 'player.towerNet', 'player.attacking', 'player._attackUntil'];
for (const g of GHOSTS)
  t(!new RegExp(g.replace('.', '\\.')).test(CODE), `★ "${g}" is gone · an invented name that would compile and never fire`);
// player.level must not reappear as a bare read (player.levelUp* is fine)
t(!/player\.level\b/.test(CODE), '★ "player.level" is gone · the field is player.rizerLvl');

/* ── 3 · persisted · a flag that is not saved is a quest you redo ───────── */
console.log('\n  ── persistence ──');
for (const f of ['omnirisStep', 'soulphishCaught', 'seerHqFound', 'dreamlandSeen',
                 'meditationUnlocked', 'elderLaddersDone', 'kelthorFallen'])
  t(new RegExp(`${f}:\\s*`).test(CODE.slice(CODE.indexOf('lostBoyReunited:'))),
    `  ${f.padEnd(20)} is in the save snapshot`);

/* ── 4 · ★★ MEDITATION · the reward, and it rides the real block system ─── */
console.log('\n  ── meditation ──');
t(/function meditationActive/.test(CODE) && /function tickMeditation/.test(CODE),
  'meditation exists as its own tick');
t(/tickMeditation\(dt\)/.test(CODE), '★ and is actually CALLED from the frame loop');
t(/player\.meditationUnlocked/.test(blk), '★★ it is gated on the ladder · trial 8 is what turns it on');
{
  const mi = CODE.indexOf('function meditationActive');
  const mf = CODE.slice(mi, CODE.indexOf('\n}', mi));
  t(/player\.blocking/.test(mf), '  · requires the guard to be up');
  t(/_blockStunUntil/.test(mf), '  · refuses during break-stun');
  t(/_blockHitFlashUntil/.test(mf),
    '★★ and ANY hit resets the warm-up · if a chipped guard still healed, the best play would be to tank in a crowd, which is the opposite of the lesson');
}

/* ── 5 · the stillness trial fails on the right things ──────────────────── */
console.log('\n  ── the Unblinking ──');
{
  const si = CODE.indexOf('function tickOmnirisStillness');
  t(si > 0, 'the stillness timer exists');
  const sf = CODE.slice(si, CODE.indexOf('\n}\n', si));
  t(/_omnirisStillX/.test(sf), '  · fails if you MOVE');
  t(/attackUntil/.test(sf), '★ fails if you SWING · the instinct to act is the trial');
  t(!/hurtPlayer|takeDamage/.test(sf),
    '★★ but NOT if you are hit · being struck while perfectly still is the trial working, not the player failing');
  t(/tickOmnirisStillness\(\)/.test(CODE), '  · and it is called from the frame loop');
}

/* ── 6 · ★★★ THE ROUTER · Kelthor reads the table, never his own list ───── */
console.log('\n  ── Kelthor the router ──');
{
  const ri = CODE.indexOf('const _elders =');
  t(ri > 0, 'the router exists in Kelthor\'s post-ladder branch');
  const rf = CODE.slice(ri, ri + 2600);
  t(/DISTRICT_ELDERS/.test(rf),
    '★★★ he READS DISTRICT_ELDERS · a district becomes routable the moment its elder is filled in, and he can never promise somebody who does not exist');
  t(/elderLaddersDone/.test(rf), '  · and skips ladders already finished');
  t(/_unbuilt/.test(rf),
    '★★ he says so OUT LOUD when a seat is empty · true for 8 of 10 today, and better than silence');
  t(/kelthorFallen/.test(rf),
    '★★★ and the death hook is NAMED · canon has him dying in the Invasion, and the router is what makes that cost real — lose him and the map goes quiet');
}
t(/omnirisStep/.test(CODE) && /ANDRANNOR/.test(blk),
  '★ trial 8 points at ANDRANNOR · the handoff DISTRICT_ELDERS still lists as TBD');

console.log(`\n★ ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
