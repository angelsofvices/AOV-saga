#!/usr/bin/env node
/* verify_wilds_have_art.js · v0.95.982
 *
 * ★★★ THE GUARD FOR A FAILURE THAT CANNOT THROW.
 *
 * At v0.95.979 I wrote Volcaxor's sprite bank and then, an hour later in the
 * same session, deleted it myself: the Vengrizz rewire replaced a block by
 * slicing "from its own comment TO the next `  aetherwing: {`", and Volcaxor's
 * bank had been inserted into exactly that gap. The slice ate it.
 *
 * ★ It shipped absent through THREE versions. Nothing errored, because every
 *   piece except the lookup was fine: the species existed, four wild pins
 *   existed, the PNG was on disk. A missing SUMMONABLE_SPRITES entry draws
 *   nothing rather than throwing — the same shape as the Rustbyte bug at
 *   v0.95.951, which also survived by being an absence.
 *
 * ★★ So: every species that is PINNED INTO THE WORLD must have a bank and a
 *   file on disk. This is cheap, it is static, and it closes the whole class.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');

let pass = 0, fail = 0;
const ok = (m) => { pass++; console.log('  ok   · ' + m); };
const no = (m) => { fail++; console.log('  FAIL · ' + m); };
const t  = (c, m) => c ? ok(m) : no(m);

console.log('\n=== EVERY PINNED WILD HAS A BODY TO DRAW (v0.95.982) ===\n');

// the banks, from the declaration (not the first mention of the name)
const start = HTML.search(/const\s+SUMMONABLE_SPRITES\s*=/);
t(start > 0, 'SUMMONABLE_SPRITES located');
let i = HTML.indexOf('{', start), d = 0, end = -1;
for (let j = i; j < HTML.length; j++){
  const c = HTML[j];
  if (c === '{') d++; else if (c === '}'){ d--; if (!d){ end = j; break; } }
}
const bankSrc = HTML.slice(i, end);
const banks = {};
for (const m of bankSrc.matchAll(/\n  (\w+): \{/g)){
  const at = m.index;
  const blk = bankSrc.slice(at, bankSrc.indexOf('\n  },', at)).replace(/\/\/[^\n]*/g, '');
  const src = (blk.match(/\n\s*src:\s*'([^']+)'/) || [])[1];
  if (src) banks[m[1]] = decodeURIComponent(src);
}
t(Object.keys(banks).length > 25, `${Object.keys(banks).length} banks with a src`);

// every species pinned as a wild anywhere in the world
const pinned = [...new Set([...HTML.matchAll(/\{\s*id:\s*'(\w+)',\s*at:\s*\[/g)].map(m => m[1]))];
// ★ DISTINCT SPECIES, not pins — most species carry two to four pins each, so
// this number is much smaller than the wild table is long. My first threshold
// was 20 and failed on the true count of 18, which is the test being wrong
// about the world rather than the world being wrong.
t(pinned.length >= 15, `${pinned.length} distinct species pinned as wilds`);

const noBank = pinned.filter(id => !banks[id]);
const noFile = pinned.filter(id => banks[id] && !fs.existsSync(path.join(ROOT, banks[id])));
if (noBank.length) noBank.forEach(id => console.log(`         ✂ ${id} · PINNED but has NO sprite bank`));
if (noFile.length) noFile.forEach(id => console.log(`         ✂ ${id} · bank points at a missing file · ${banks[id]}`));

t(noBank.length === 0,
  `★★★ every pinned wild has a sprite bank (${noBank.length} without) — ` +
  'this is the check that would have caught Volcaxor three versions earlier');
t(noFile.length === 0,
  `★★ and every bank's PNG is actually on disk (${noFile.length} missing)`);

// ...and the reverse is deliberately NOT asserted: a bank with no pins is fine
// (Vengrizz is quest-only, Elzoran is dev-spawn), so this checks one direction.
ok('a bank with no pins is allowed · quest-only and dev-spawn species are legal');

console.log(`\n★ ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
