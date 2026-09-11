// ★★★ v0.96.77 · THE MACROBOOK MUST NOT DESCRIBE A GAME THAT STOPPED EXISTING.
//
// Creator: "im noticing that the macrobook is mentioning outdated features of
// the RP7. can we fix it?"
//
// ★★ THE MACROBOOK IS NOT PART OF THE GAME — it lives on the website — so
//   nothing in the build breaks when it drifts, and nothing goes red.  It just
//   quietly becomes a lie about the product, in the one document written to be
//   believed ("the games are locked canon").  That is the most expensive kind
//   of staleness and the least visible.
//
// This suite pins the claims that HAVE drifted once, so they cannot drift back,
// and cross-checks the checkable ones against the live build rather than
// against my memory of it.
const fs = require('fs');
const ROOT = '/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
const mbRaw = fs.readFileSync(ROOT + 'macrobook.html', 'utf8');
// ★ v0.96.78 · STRIP <style> AND <script> FIRST.  Measuring this file without
//   doing so counts every rgba() and z-index as prose, which made an early
//   numeral metric in this session meaningless — it reported 648 'numerals in
//   the book' when most were CSS.
const mb = mbRaw.replace(/<style[\s\S]*?<\/style>/g,' ').replace(/<script[\s\S]*?<\/script>/g,' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ');
const game = fs.readFileSync('/tmp/all.js', 'utf8');
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const H  = t => console.log('\n' + t);

H("★★★ KELTHOR'S LADDER · it was 8 level-gated steps; it is 13 flag-gated rungs");
const rungs = (game.match(/const KELTHOR_LADDER = \[[\s\S]*?\n\];/) || [''])[0];
const n = (rungs.match(/key:'s\d+'/g) || []).length;
ok(n === 13, `the build has ${n} rungs`);
ok(!/eight steps/i.test(mb), 'the book no longer says "eight steps"');
ok(/thirteen rungs/i.test(mb), 'it says thirteen rungs');
ok(!/sphere tiers|sync power/i.test(mb), '★ and nothing still claims spheres have tiers');
ok(!/gates on level/i.test(mb), '★ and it no longer claims the rungs gate on LEVEL');
ok(/NOT A LEVEL GATE/i.test(mb), 'it says so explicitly — the ladder asks what you have DONE');
// ★ v0.96.78 · THE RUNG TABLE IS GONE ON PURPOSE.  The Creator: "I dont want so
//   much explanations because things can change" — and a thirteen-row step list
//   is the definition of a thing that changes.  What must survive is the SHAPE
//   (three ladders) and the five names, which are canon.
ok(!/<td class="num-c">13<\/td>/.test(mbRaw), 'no thirteen-row rung table');
for (const who of ['Scrapjaw','Kaizari','Rein','Zurelea','Orren'])
  ok(new RegExp(who, 'i').test(mb), `Ladder II still names ${who}`);
ok(/three ladders/i.test(mb), 'and the three-ladder shape is stated');
ok(!/eight bond lessons|eight steps/i.test(mb), 'no "eight" anything survives');
ok(/R\.A\.I\.D\. card/.test(mb), 'and the R.A.I.D. card is named as the trigger');
ok(/raidCardGifted/.test(game), '…which is what the build actually gates rung 1 on');

H('★★ THE PRISMSHARD · canon says it is not made, and Kelthor does not give one');
ok(!/deliberately crafted/i.test(mb), 'the book no longer calls Prismshards "deliberately crafted"');
ok(/A PRISMSHARD IS NOT MADE/i.test(mb), 'it states the canon lock outright');
ok(!/prismshardOwned = true/.test(game), 'and the build no longer grants one on the ladder');
ok(/remnant trace/i.test(mb), 'the Mealux is described as a remnant trace, which is the canon wording');

H('★★ THE ZYSPHERE · four tiers became one');
ok(!/Void Zysphere|Ultra Zysphere|Silver Zysphere/i.test(mb), 'no tiered spheres remain in the book');
ok(!/sync power/i.test(mb), 'and no "sync power" multiplier — the build has no such field');
ok(!/syncPower/.test(game), '…confirmed: syncPower does not exist in the build');
ok(/ONE KIND OF ZYSPHERE/i.test(mb), 'the book states the one-sphere lock');
ok(/merchant/i.test(mb), "and uses the game's own in-world explanation for the old names");

H('★ THE VERSION TAG still matches the build');
const mbV = (mb.match(/BETA V(\d+)\.(\d+)\.(\d+)/) || []).slice(1).join('.');
const gV = (game.match(/AOV_BUILD = \{ game: (\d+), gamedex: (\d+), codex: (\d+)/) || []).slice(1).join('.');
ok(mbV === gV, `book ${mbV} = build ${gV}`);

H('★ claims that are still TRUE and must stay that way');
ok(/[Tt]en [Dd]istricts/.test(mb), 'ten districts');
ok(/five statuses|5 statuses/i.test(mb), 'five statuses');
ok(/21st|21 types/.test(mb), '21 types incl. ULTIMATE');

H(f ? `❌ ${f} failed` : '✅ the macrobook describes the game that exists');
process.exit(f ? 1 : 0);
