#!/usr/bin/env node
/* verify_anchors.js · v0.96.0 · DISTRICT ANCHORS
 *
 *   Creator: "include native coordinates for at least one species that will
 *   always be around. lets create some good logic on species populations."
 *
 * ★★ THE PROBLEM THIS SOLVES: a bonded wild is marked `_gone` and never comes
 *   back, so every district is a DEPLETING resource. Catch Baelgor's four
 *   Veridrax and Baelgor has none again, forever — while Korathen ships 7 wilds
 *   and Thardin 9 against Malezor's 31.
 */
const fs = require('fs'); const path = require('path');
const H = fs.readFileSync(path.join(__dirname, '..', 'rp7b.html'), 'utf8');
const CODE = H.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
let pass = 0, fail = 0;
const ok = m => { pass++; console.log('  ok   · ' + m); };
const no = m => { fail++; console.log('  FAIL · ' + m); };
const t = (c, m) => c ? ok(m) : no(m);
console.log('\n=== DISTRICT ANCHORS (v0.96.0) ===\n');

const DIST = ['malezor','zarvane','andrannor','veridan','netharion',
              'vorashil','xilnar','baelgor','thardin','korathen'];
const blk = CODE.slice(CODE.indexOf('const DISTRICT_ANCHORS'), CODE.indexOf('\n};', CODE.indexOf('const DISTRICT_ANCHORS')));
const rows = {};
for (const m of blk.matchAll(/(\w+):\s*\{ sp:'(\w+)',\s*at:\[\s*(-?\d+),\s*(-?\d+)\],\s*floor:(\d+)/g))
  rows[m[1]] = { sp: m[2], at: [+m[3], +m[4]], floor: +m[5] };

t(DIST.every(d => rows[d]), `★★ ALL TEN districts declare an anchor (${Object.keys(rows).length}/10) · ` +
  'a district without one is a district a thorough player can empty');
t(Object.values(rows).every(r => r.floor >= 3), '★ every floor is at least 3 · one survivor is not a population');

/* ★ the anchors must be LOW TIER · an anchor you cannot field is scenery */
{
  const SP = H.slice(H.indexOf('const SPECIES ='));
  const tierOf = n => { const m = SP.match(new RegExp(`id:'${n}',[^\\n]*tier:(\\d+)`)); return m ? +m[1] : 99; };
  const high = Object.entries(rows).filter(([, r]) => tierOf(r.sp) > 3).map(([d, r]) => `${d}:${r.sp}`);
  t(!high.length, '★★ every anchor is T3 or lower · the point is that there is always something ' +
    'here you can actually BOND with at the band you arrive in' + (high.length ? ' · ' + high.join(', ') : ''));
}

/* ★★ respawn must be SLOW and one at a time */
t(/ANCHOR_RESPAWN_MS = 8 \* 60 \* 1000/.test(CODE),
  '★★ 8 real minutes per head · a population that refills the moment you turn ' +
  'around is not a population, it is a vending machine');
t(/anchorLiveCount\(dist\) >= A\.floor/.test(CODE), '  · and it only grows back when actually short');

/* ★★★ the placement bug this suite exists to keep fixed */
{
  const i = CODE.indexOf('function tickDistrictAnchors');
  const fn = CODE.slice(i, CODE.indexOf('\n}\n', i));
  t(!/x = A\.at\[0\]; y = A\.at\[1\]/.test(fn),
    '★★★ the NATIVE TILE is not used as a placement fallback · walkable() returns ' +
    'false on a tile something already stands on, and the native tile is exactly ' +
    'where the surviving anchor usually is — falling back to it drops a second ' +
    'body on the first');
  t(/worldDistrictAt\(x, y\) !== dist/.test(fn),
    '★★ a respawn can never land outside its own district · that would silently ' +
    'migrate a species across a border');
  t(/if \(!placed\)/.test(fn),
    '★ and a full neighbourhood is a NO-OP with a retry, not a forced spawn');
}
t(/anchorNextAt:\s*Object\.assign/.test(CODE), '★ respawn timers persist · otherwise every reload resets the clock');
t(/tickDistrictAnchors\(\)/.test(CODE), '★ and the tick actually runs · anchored on the CALL, '
  + 'not on the try/catch that wrapped it · v0.96.26 moved every frame tick into a named, '
  + 'timed _step() and three suites went red over the wrapper while the behaviour was identical');

console.log(`\n★ ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
