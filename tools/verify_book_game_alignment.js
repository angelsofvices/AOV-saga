// ★★★ v0.96.84 · THE GAME IS AN EXPANSION OF THE BOOK, NOT A SECOND OPINION.
//
// Creator: "make sure that al game dialogue beats matches the current format of
// the guidebook. game should be a direct expansion of the promotional/
// educational book."
//
// ★★ THE ASYMMETRY THAT MAKES THIS WORK.  The book is the small surface and the
//   game is the large one, so alignment cannot mean "they say the same things."
//   It means:
//     · the game may say MUCH more            (expansion is the point)
//     · the game may never say something the book DENIES   (contradiction)
//     · the two must use the SAME WORDS for the same things (vocabulary)
//   Only the second and third are testable, and those are what this suite holds.
//
// ★ Why it matters more than it looks: the book is the promotional artefact.  A
//   player who reads it and then hears a different vocabulary in the first hour
//   does not conclude "the book is out of date" — they conclude the world is
//   sloppy.  The cost of drift lands on the fiction, not on the docs.
const fs = require('fs');
const ROOT = '/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
const game = require('./lib/all_src.cjs')();
const bookRaw = fs.readFileSync(ROOT + 'macrobook.html', 'utf8');
const book = bookRaw.replace(/<style[\s\S]*?<\/style>/g, ' ')
                    .replace(/<script[\s\S]*?<\/script>/g, ' ')
                    .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const H  = t => console.log('\n' + t);

// ── every string that actually reaches a player ─────────────────────────
const lines = [];
for (const m of game.matchAll(/showDialog\(\{[\s\S]{0,3000}?\}\)/g))
  lines.push(...[...m[0].matchAll(/['"`]([^'"`\n]{12,})['"`]/g)].map(x => x[1]));
lines.push(...[...game.matchAll(/showToast\(\s*[`'"]([^`'"\n]{12,})/g)].map(x => x[1]));
lines.push(...[...game.matchAll(/say\(\s*'([^'\n]{12,})/g)].map(x => x[1]));
const said = lines.join('\n');
H(`★ ${lines.length.toLocaleString()} player-facing strings in the build`);
ok(lines.length > 800, 'the extractor is finding dialogue (guards against a silent regex break)');

H('★★★ NO GAME LINE MAY CONTRADICT THE BOOK');
// Each entry is a claim the guidebook makes or retires.  A hit is a line the
// player could read that disagrees with what they were sold.
const DENY = [
  ['trainer',            /\btrainers?\b/i,                     'terminology lock — Rizer, never trainer'],
  ['Oathare',            /Oathare/i,                           'obsolete name; Oathane is canonical'],
  ['ten gem types',      /ten gem types|10 gem types|ten fundamental/i, 'canon: EIGHT fundamental Gem Types'],
  ['ten fragments',      /shattered into ten|fragments rose ten|ten equivalent fragments/i, 'retired Mothergem origin'],
  ['sphere tiers',       /Void Zysphere|Ultra Zysphere|Silver Zysphere|sync power/i, 'there is one Zysphere'],
  ['eight-step ladder',  /eight steps|8-step ladder|eight bond lessons/i, 'the ladder is 13 rungs in 3 ladders'],
  ['Kelthor Prismshard', /Prismshard in your palm|place a Prismshard/i, 'Rakoron pays that rung now, with a Fang'],
  ['wild grass battles', /wild grass (encounter|battle)/i,      'grass encounters retired in v0.95.310'],
  ['level-gated bond',   /bond lessons? (are )?gate/i,          'no rung gates on Rizer Level'],
];
for (const [name, re_, why] of DENY){
  const hits = lines.filter(l => re_.test(l));
  ok(hits.length === 0, hits.length ? `${name} — ${why}\n       · ${hits.slice(0,3).join('\n       · ')}`
                                    : `${name.padEnd(20)} no line contradicts the book`);
}

H('★★ SHARED VOCABULARY · a term the book teaches must exist in the game');
for (const t of ['Zyraxis','Gemlord','Zyrex','Rizer','Seer','Novarian','Astralite','Warden'])
  ok(new RegExp(t, 'i').test(book) && new RegExp(t, 'i').test(game),
     `"${t}" is used by both`);

H('★★★ THE BOOK\'S FACTS MUST BE THE BUILD\'S FACTS');
// ── the eight gem colours the book implies, against the build's own array
{
  const m = game.match(/GEM_COLORS\s*=\s*\[([^\]]*)\]/);
  const cols = m ? [...m[1].matchAll(/'([a-z]+)'/g)].map(x => x[1]) : [];
  ok(cols.length === 8, `the build declares ${cols.length} gem colours — the book says eight are fundamental`);
  // ★ the two composites blend first-four and last-four, which is only
  //   meaningful if the array HAS a fixed order.  Pin it.
  ok(cols.join(',') === 'red,blue,green,yellow,white,orange,purple,black',
     'and in the locked order the Ninth/Tenth blends are defined against');
}
// ── the 21 types
{
  const chips = [...bookRaw.matchAll(/<i><\/i>([A-Z]+)</g)].map(x => x[1].toLowerCase());
  const inGame = chips.filter(t => new RegExp(`type2?:'${t}'`, 'i').test(game));
  ok(chips.length === 21, `the book shows ${chips.length} types`);
  ok(inGame.length >= 18, `${inGame.length}/21 appear on live species in the build`);
}
// ── the ten districts
{
  const rows = [...bookRaw.matchAll(/<tr><td class="num-c">[IVX]+<\/td><td><strong>([A-Za-z]+)</g)].map(x => x[1]);
  const dm = game.match(/const ZYRAXIS_DISTRICTS = \[([\s\S]*?)\n\];/);
  const ids = dm ? [...dm[1].matchAll(/id:'([a-z]+)'/g)].map(x => x[1]) : [];
  ok(rows.length === 10, `the book's map lists ${rows.length} districts`);
  const missing = rows.filter(d => !ids.includes(d.toLowerCase()));
  ok(missing.length === 0, missing.length ? `★ named in the book but NOT in the build: ${missing.join(', ')}`
                                          : 'every district the book names exists in the build');
  const unlisted = ids.filter(d => !rows.map(r => r.toLowerCase()).includes(d));
  ok(unlisted.length === 0, unlisted.length ? `★ in the build but missing from the book: ${unlisted.join(', ')}`
                                            : 'and the build adds none the book omits');
}
// ── the ten Gemlords
{
  const lords = [...bookRaw.matchAll(/<tr><td class="num-c">[IVX]+<\/td><td><strong>[A-Za-z]+<\/strong><\/td><td>([A-Za-z]+)</g)].map(x => x[1]);
  ok(lords.length === 10, `the book names ${lords.length} Gemlords`);
  const unknown = lords.filter(l => !new RegExp(l, 'i').test(game));
  ok(unknown.length === 0, unknown.length ? `not found in the build: ${unknown.join(', ')}`
                                          : 'every Gemlord the book names is known to the build');
}

H('★ AND THE BOOK STAYS THE SMALLER SURFACE');
// ★ My first version compared the book's WORDS to the game's LINE COUNT and
//   failed — apples to oranges.  Compare like with like.
const bookWords = book.trim().split(/\s+/).length;
const gameWords = said.trim().split(/\s+/).length;
ok(bookWords < 2500, `the book stays a teaser: ${bookWords} words`);
ok(gameWords > bookWords * 5,
   `the game says ${gameWords.toLocaleString()} words of dialogue to the book's ${bookWords} ` +
   `— ${(gameWords/bookWords).toFixed(1)}x, which is what "expansion" has to look like`);

H(f ? `❌ ${f} failed` : '✅ the game says more than the book, and never something else');
process.exit(f ? 1 : 0);
