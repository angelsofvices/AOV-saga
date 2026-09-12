// ★★★ v0.96.79 · THE MACROBOOK IS A TEASER, AND IT MUST NOT SPOIL.
//
// Creator: "I really just want u to focus on these things but DONT spoil them:
// zyraxis, gemlords, zyrex, rizers, the seers, the novarian challenge, the 63
// astralites, the 21 types, the 10 gems colors, and then how the story builds up
// for the game. dont spoil anything. these are the basic parts of the game that
// will not change, so they can be included. the macrobook should read like
// 'wow this is cool I wanna play the game now to learn more!'"
//
// ★★ THAT IS TWO RULES AT ONCE, and they pull against each other:
//   1 · the ten subjects must be PRESENT and inviting
//   2 · nothing past them may leak
// A book can satisfy either one alone by being empty or by being a wiki.  This
// suite holds both, because the failure mode of a teaser is always the same —
// somebody adds "just one more detail" and it is the ending.
//
// ★ It also guards the OTHER direction the old book failed in: mechanics rot.
//   Anything with a price, a percentage or a formula is a promise that goes
//   stale, and none of it belongs here.
const fs = require('fs');
const ROOT = '/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
const raw = fs.readFileSync(ROOT + 'macrobook.html', 'utf8');
// ★ strip style/script FIRST · counting rgba() as prose made an earlier metric
//   in this session meaningless
const text = raw.replace(/<style[\s\S]*?<\/style>/g, ' ')
                .replace(/<script[\s\S]*?<\/script>/g, ' ')
                .replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ');
const game = fs.readFileSync('/tmp/all.js', 'utf8');
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const H  = t => console.log('\n' + t);

H('★ THE TEN SUBJECTS · each one present, each one its own part');
const WANT = [
  ['Zyraxis',              /Zyraxis/i,                      'world'],
  ['the Gemlords',         /Gemlord/i,                      'gemlords'],
  ['the ten gem colours',  /\bRuby\b[\s\S]{0,120}\bAmber\b/i, 'gems'],
  ['Zyrex',                /Zyrex/i,                        'zyrex'],
  ['Rizers',               /Rizer/i,                        'rizer'],
  ['the Seers',            /Seers/i,                        'seers'],
  ['the 63 Astralites',    /sixty-three|63/i,               'astralites'],
  ['the 21 types',         /twenty-one|21 [Tt]ypes|ULTIMATE/, 'types'],
  ['the Novarian Challenge', /Novarian|Novarius/i,          'novarian'],
  ['how the story begins', /HOW IT BEGINS/i,                'story'],
];
for (const [label, re_, id] of WANT){
  ok(re_.test(text), `${label} is covered`);
  ok(new RegExp(`<section id="${id}"`).test(raw), `  …as <section id="${id}">`);
}

H('★★★ SPOILER SWEEP · none of this may appear, at any depth');
// Names, twists and endgame content.  Each entry is something a reader should
// meet inside the game, in the order the game chose.
const SPOIL = {
  // ★ v0.96.80 · 'Rakoron' and 'Oatheus' were BLOCKED here and should not have
  //   been: a Gemlord's NAME is setting — the ten seats have been public on the
  //   site for years and the Creator lists gemlords as a required subject.  What
  //   is a spoiler is the LABEL the build gives one of them, below.
  'Empty Throne': "the build's own label for one of the ten seats — THE twist",
  // ★★★ v0.96.81 · THE NINTH/TENTH COSMOLOGY RULING.  Its own §8 lists exactly
  //   what may never appear publicly, and this is that list, enforced.
  'Egnellahc': 'who made the Ninth and Tenth formations',
  'Ultharis': 'who he was brought before',
  'Third Dimension': 'where he was taken',
  'World Gem': 'spoiler-locked · Oatheus is sworn to conceal it',
  'Space Gem': 'spoiler-locked · Oatheus is sworn to conceal it',
  'First Four': 'what the Ninth Formation converges',
  'Final Four': 'what the Tenth Formation converges',
  'divided his essence': 'how Oathane and Oatheus came to exist',
  'convergence': 'the mechanism, and why reality could not hold it',
  'Key of Anciuxor': 'the Tier IV Prism',
  'Bridge of Hope': 'where the two paths converge',
  'Xenoxil': 'what the Seers are actually for',
  'Mothergem': 'the shape of the catastrophe',
  'Prismshard': 'the endgame relic class',
  'Kelthor': 'the tutorial mentor by name',
  'Elarion': 'an NPC by name',
  'Scrapjaw': 'an NPC by name',
  'Zurelea': 'an NPC by name',
  'Mealux': 'a hidden species',
  'Dracolord': 'endgame beings',
  'Luminary': 'a late-game form',
  'Zoryn': 'the rival',
  'Omniris': 'a district elder',
  'Vorugath': 'a miniboss',
  'Rubypaw': 'a weapon line',
};
let leaks = 0;
for (const [k, why] of Object.entries(SPOIL))
  if (new RegExp(k, 'i').test(text)){ ok(false, `${k} appears — ${why}`); leaks++; }
ok(leaks === 0, leaks ? `${leaks} spoiler(s) leaked` : 'nothing from the blocklist appears');

H('★ THE THREE VISUALS · tied to their sections');
ok(/<table class="mapt"/.test(raw), 'the district map table is in PART 01');
ok((raw.match(/<tr>/g)||[]).length >= 10, 'and it carries all ten districts');
ok(/class="gemgrid"/.test(raw), 'the gem swatches are in PART 03');
// ★★★ v0.96.83 · I HAD THIS BACKWARDS.  The suite used to assert the last two
//   were shown as blank/withheld, because I had INFERRED they carried no colour
//   of their own.  The Creator's reference image shows each is a BLEND.  The
//   order is fixed in code (GEM_COLORS: red, blue, green, yellow / white,
//   orange, purple, black), so IX mixes the first four and X the last four.
//   ★ The blend may be SHOWN; what is in it stays spoiler-locked, which is why
//   the two cards carry no label beyond "composite".
ok((raw.match(/class="gem comp"/g)||[]).length === 2, 'the Ninth and Tenth are shown as two BLENDED gems');
ok(/\.gs9\s*\{background:conic-gradient/.test(raw) && /\.gs10\s*\{background:conic-gradient/.test(raw),
   'each blend is a real multi-hue swatch, not a placeholder');
ok(!/no colour of their own/i.test(text), '★ and the retracted "no colour of their own" line is gone');
// ★★ v0.96.81 · the gem section must use the RULING'S OWN approved wording —
//   eight fundamental types plus two composites, origins guarded.
ok(/eight Gem Types/i.test(text) && /two exceptional composite formations/i.test(text),
   '★ it states eight fundamental types + two composite formations');
ok(/do not share the same origin as the first eight/i.test(text),
   '★ and that the final two differ in origin — the one hint the ruling allows');
ok(!/ten fundamental|ten natural|shattered into ten/i.test(text),
   'and never claims ten natural types');
ok(/class="chipwrap"/.test(raw), 'the type chips are in PART 08');
ok((raw.match(/class="tchip/g)||[]).length === 21, '21 chips exactly');
// ★★ the chips must use the LOCKED canon swatches, not colours I liked
{
  const TC = JSON.parse(fs.readFileSync(ROOT+'data/TYPE_COLORS_V1.json','utf8')).types;
  const used = [...raw.matchAll(/--c:(#[0-9A-Fa-f]{6})"><i><\/i>([A-Z]+)</g)]
                 .map(m => [m[2], m[1].toUpperCase()]);
  const wrong = used.filter(([t,c]) => {
    const k = Object.keys(TC).find(x => x.toUpperCase() === t);
    return !k || TC[k].toUpperCase() !== c;
  });
  ok(used.length === 21, `${used.length} chips read back with a colour`);
  ok(wrong.length === 0, wrong.length ? `off-canon colours: ${wrong.map(w=>w[0]).join(', ')}`
                                      : 'every chip matches data/TYPE_COLORS_V1.json exactly');
}

H('★★ NO MECHANICS · a price or a percentage is a promise that goes stale');
ok(!/<th>Cost<\/th>|<th>R\.Lv|¢/.test(raw), 'no cost or level-gate columns');
ok(!/¢\d/.test(text), 'no currency figures');
ok(!/\b\d+%/.test(text), 'no percentages');
ok(!/Lv ?\d+|R\.Lv/.test(text), 'no level gates');
ok(!/floor\(|clamp\(|×\s?\d|baseAtk/.test(text), 'no formulas');
ok(!/durability|multiplier|sync power|sphere tier/i.test(text), 'no tuning vocabulary');

H('★ IT SHOULD READ LIKE AN INVITATION');
const words = text.trim().split(/\s+/).length;
ok(words > 900 && words < 3000, `${words} words — long enough to seduce, short enough to finish`);
ok(/Go and find out/i.test(text), 'it ends by pointing at the game');
ok(/WHAT WE ARE NOT GOING TO TELL YOU/i.test(text), '★ and it says out loud that it is withholding — which is the hook');

H('★ THE SHELL STILL WORKS');
const ids = [...raw.matchAll(/<section id="([^"]+)"/g)].map(m => m[1]);
const navs = [...raw.matchAll(/<a href="#([^"]+)"/g)].map(m => m[1]);
ok(navs.every(n => ids.includes(n)), 'every nav link points at a real section');
ok(ids.every(i => navs.includes(i)), 'every section has a nav entry');
const styles = (raw.match(/<style[\s\S]*?<\/style>/g) || []).join('\n');
const cls = new Set([...raw.matchAll(/class="([^"]+)"/g)].flatMap(m => m[1].split(/\s+/)));
const unstyled = [...cls].filter(c => c && !new RegExp('\\.' + c + '\\b').test(styles));
ok(unstyled.length === 0, unstyled.length ? `classes with no CSS: ${unstyled.join(', ')}` : 'every class used has a rule');
ok(!/PATCH 0\.\d+\.\d+/.test(text), 'no patch number — it moves every build');
const mbV = (text.match(/BETA V(\d+\.\d+\.\d+)/) || [])[1];
const gV = (game.match(/game: (\d+), gamedex: (\d+), codex: (\d+)/) || []).slice(1).join('.');
ok(mbV === gV, `version tag ${mbV} matches the build ${gV}`);

H(f ? `❌ ${f} failed` : '✅ ten subjects in, everything past them out');
process.exit(f ? 1 : 0);
