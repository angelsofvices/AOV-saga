#!/usr/bin/env node
/* verify_softgate.js · v0.95.994
 *
 *   Creator: "each district should lead into the next" → "soft gate works."
 *
 * ★★★ THE CHECK THIS SUITE EXISTS FOR: a gate must be OPENABLE. The first
 *   version of this feature keyed on seerCommandersBeaten(), a flag that is
 *   read and saved and NEVER SET — talkToSeerCommander() ends at "ENCOUNTER
 *   PENDING". It would have locked nine districts permanently.
 *
 * ★★ So the rule enforced here is the one the five dead flags in rp7b.html
 *   should already have taught: never ask "is the flag read?", ask "is it ever
 *   WRITTEN?" Everything a gate depends on must have a setter reachable by a
 *   player.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
const CODE = HTML.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');

let pass = 0, fail = 0;
const ok = m => { pass++; console.log('  ok   · ' + m); };
const no = m => { fail++; console.log('  FAIL · ' + m); };
const t = (c, m) => c ? ok(m) : no(m);

console.log('\n=== THE SOFT GATE · can it be opened? (v0.95.994) ===\n');

/* ── 1 · ★★★ THE GATE HAS A DOOR ────────────────────────────────────────── */
t(/function districtCleared/.test(CODE), 'districtCleared() exists');
{
  const i = CODE.indexOf('function districtCleared');
  const fn = CODE.slice(i, CODE.indexOf('\n}', i));
  t(/towerBossKills/.test(fn),
    '★★★ it accepts towerBossKills — a flag with a REAL SETTER, so the gate can '
    + 'actually be opened by a player today');
  t(/seerCommanderBeaten/.test(fn),
    '★ and seerCommandersBeaten, the canonical key · live the day the encounter ships');
}
// ★ the setter must exist. This is the assertion that would have caught it.
t(/player\.towerBossKills\[d\]\s*=\s*true/.test(CODE),
  '★★★ towerBossKills IS WRITTEN by recordTowerGuardKill() · a gate key with no '
  + 'setter is a locked door with no handle');
t(!/player\.seerCommandersBeaten\s*\[[^\]]*\]\s*=/.test(CODE),
  '  · and seerCommandersBeaten is still unset, which is why it cannot be the ONLY key');

/* ── 2 · SOFT means the road is still walkable ──────────────────────────── */
{
  const i = CODE.indexOf('function walkable');
  const fn = CODE.slice(i, i + 3000);
  t(!/districtRoadOpen|districtCleared|districtGateKeeper/.test(fn),
    '★★★ walkable() is UNTOUCHED · a hard wall would turn an open world into a '
    + 'corridor; the player can still walk anywhere and die there');
}

/* ── 3 · what it actually withholds ─────────────────────────────────────── */
{
  const i = CODE.indexOf('function portalUnlocked');
  const fn = CODE.slice(i, CODE.indexOf('\n}', i));
  t(/districtRoadOpen/.test(fn), '★ the PORTAL waits on the road');
  t(/portalDistrictsUnlocked/.test(fn),
    '  · ANDed with the chip tier, not replacing it · fast travel was already '
    + 'earned and this does not take that away');
}
t(/districtRoadOpen\('zarvane'\)/.test(CODE),
  '★★ the ELDER waits on it too · Omniris will talk to you and will not begin');

/* ── 4 · the player is TOLD ─────────────────────────────────────────────── */
t(/function districtGateReason/.test(CODE), 'districtGateReason() exists');
{
  const i = CODE.indexOf('function districtGateReason');
  const fn = CODE.slice(i, CODE.indexOf('\n}', i));
  t(/bossName|TOWER_BY_DIST/.test(fn),
    '★★ and it names the door that is OPEN TODAY · pointing a player at a '
    + 'commander who cannot yet be fought would be worse than the lock itself');
}
t(/districtGateReason\(_d\)/.test(CODE),
  '★ fired on first entry to a district · a soft gate you cannot see is a bug report');

/* ── 5 · the order is the world's order, not a second list ──────────────── */
t(/const DISTRICT_ORDER = SEER_HQ_NETWORK\.map/.test(CODE),
  '★★ DISTRICT_ORDER is DERIVED from SEER_HQ_NETWORK · one list, so the gate '
  + 'order and the HQ placement can never disagree');
t(/i > 0 \? DISTRICT_ORDER\[i - 1\] : null/.test(CODE),
  '★ Malezor has no keeper · the first district is nobody\'s reward');

/* ── 6 · persisted ──────────────────────────────────────────────────────── */
t(/towerBossKills:\s*/.test(CODE) || /towerBossKills/.test(HTML.slice(HTML.indexOf('seerCommandersBeaten:'))),
  '★ the gate keys survive a reload');

console.log(`\n★ ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
