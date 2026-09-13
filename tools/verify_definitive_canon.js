// ★★★ 2026-09-13 · THE DO-NOT-RETCON LIST, MADE EXECUTABLE.
//
// Creator: "merge this into canon" — data/AOV_SAGA_DEFINITIVE_CANON_HANDOFF.md
//
// ★★ WHY THIS EXISTS AND NOT JUST THE DOCUMENT.  §24 of the handoff is a list
//   of 24 things nobody may quietly undo.  A list of prohibitions in a markdown
//   file protects nothing — the whole reason those 24 items are ON the list is
//   that each one ALREADY drifted once.  "45 discovered / 200+ theorized" was
//   live on aethryx.html the whole time the repo's own docs said 63.  Nobody
//   was careless; the site and the docs simply had no way to disagree out loud.
//   This is that way.
//
// ★ Scope note: a prohibition is only testable where it has a WORDING that can
//   be searched.  "Do not invent the surviving Planetelles" cannot be a regex —
//   it is enforced by absence, and absence of a thing nobody has written yet is
//   not a test.  Those items are listed at the bottom as UNTESTABLE rather than
//   faked, because a suite that pretends to cover them is worse than one that
//   says it doesn't.
const fs = require('fs'), path = require('path');
const ROOT = '/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
let f = 0, checks = 0;
const ok = (c, m) => { checks++; console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const H  = t => console.log('\n' + t);

// ── the surfaces a player or reader can actually reach ──────────────────────
// backups/ and _archive/ are dated snapshots: history, not live copy.
const SKIP = /(^|\/)(backups|_archive|node_modules|\.git)\//;
function walk(dir, out = []){
  for (const e of fs.readdirSync(dir, { withFileTypes: true })){
    const p = path.join(dir, e.name);
    if (SKIP.test(p.replace(ROOT, '/') )) continue;
    if (e.isDirectory()) walk(p, out);
    else if (/\.(html|json|md)$/.test(e.name)) out.push(p);
  }
  return out;
}
const FILES = walk(ROOT).filter(p => !p.includes('/AOV_SAGA_DEFINITIVE_CANON_HANDOFF.md')
                                  && !p.includes('/tools/'));
const TEXT = new Map(FILES.map(p => [p.replace(ROOT, ''), fs.readFileSync(p, 'utf8')]));
H(`★ ${TEXT.size} live files scanned (backups/ and _archive/ excluded — a dated ` +
  `snapshot is history, and "fixing" it would be the actual retcon)`);

// A rule may be quoted in order to be RETIRED.  Anything inside these markers is
// the word being discussed, not used.
// ★ "overloaded" and friends matter: STORY_MASTER_RECALL keeps a table of known
//   continuity problems, and a line that NAMES a defect is not the defect. A
//   suite that cannot tell a bug report from a bug will get every bug report
//   deleted, which is the worst outcome available.
const EXEMPT_LINE = /RETIRED|obsolete|superseded|do not|don't|must not|never|was "|formerly|legacy|★|handoff §|violat|overloaded|unreconciled|ambiguous|CONTINUITY_REVIEW|UNRESOLVED|queue/i;

// ★★ A DOCUMENT THAT DECLARES ITSELF RETIRED IS ALLOWED TO CONTAIN RETIRED TEXT.
//   EGNELLAHC_SPLIT_PROPOSAL.md now carries a SUPERSEDED banner and still quotes
//   the thesis it got wrong — deliberately, so the Creator can see what was
//   claimed and on what basis. Deleting the record of a mistake to make a test
//   pass is how the mistake comes back.
const RETIRED_DOC = /PARTIALLY SUPERSEDED|★★★ RETIRED|Not canon until the Creator rules/i;
const retired = new Set([...TEXT].filter(([, b]) => RETIRED_DOC.test(b.slice(0, 4000))).map(([p]) => p));
if (retired.size) console.log(`★ ${retired.size} file(s) self-declare as retired/proposal and are exempt: ` +
                              [...retired].join(', '));

function forbid(id, re, why, only){
  const hits = [];
  for (const [file, body] of TEXT){
    if (only && !only.test(file)) continue;
    if (retired.has(file)) continue;
    // ★★★ EXEMPTION IS A BLOCK PROPERTY, NOT A LINE PROPERTY — and the block is
    //   bigger than I twice assumed.
    //     1st try · the line itself   → broke on a quote that WRAPS.
    //     2nd try · a 2-line window   → broke on a `| was | now |` table, where
    //                                   the marker is in the header three, ten,
    //                                   or forty rows up.
    //   The unit markdown actually gives you is the SECTION: the nearest
    //   preceding heading, and the nearest preceding table header. A
    //   correction log is a document whose headings say so — "what changed",
    //   "was / now", "retired" — and every row under such a heading is a record
    //   of a fix, not a fresh violation. Getting this wrong deletes the very
    //   documents that track the drift.
    const lines = body.split('\n');
    const HEADING = /^#{1,6}\s|^\s*\|[\s\-:|]+\|\s*$/;     // heading, or a |---| rule
    const SECTION_OK = /was\b|\bnow\b|chang|correct|retired|supersed|applied|violat|\bfix/i;
    let ctx = '';                       // the governing heading / table header
    for (let i = 0; i < lines.length; i++){
      if (/^#{1,6}\s/.test(lines[i])) ctx = lines[i];
      else if (/^\s*\|[\s\-:|]+\|\s*$/.test(lines[i])) ctx += ' ' + (lines[i - 1] || '');
      if (!re.test(lines[i])) continue;
      if (lines.slice(Math.max(0, i - 2), i + 1).some(l => EXEMPT_LINE.test(l))) continue;
      if (SECTION_OK.test(ctx)) continue;
      hits.push(`${file} · ${lines[i].trim().slice(0, 110)}`);
    }
  }
  ok(hits.length === 0,
     hits.length ? `§24.${id} ${why}\n       · ${hits.slice(0, 4).join('\n       · ')}`
                 : `§24.${id}`.padEnd(8) + why);
}

H('★★★ §24 · THE TWENTY-FOUR PROHIBITIONS');
forbid(1,  /\b(45)\s*(discovered|astralites)|200\+\s*(theorized|theorised)/i,
       'Astralite count is 63 — never 45 discovered / 200+ theorized');
forbid(2,  /(THE )?FIRST WAR[^A-Za-z].{0,40}Dracolords vs Astrums/i,
       'Dracolords vs Astrums is a FRONT, not the start of the Eternal War');
forbid(6,  /Egnellahc[^.\n]{0,60}\b(is|as|became|future)\s+(an?\s+)?Elder Prime/i,
       'Egnellahc is Humanoid Prime, never an Elder Prime');
forbid(9,  /(Born|born) from Egnellahc|Egnellahc'?s (son|daughter|child)[^\n]{0,30}Oath/i,
       'Oathane/Oatheus are not ordinary biological children');
// ★ NOT "sundered". My first pass forbade the word, and it flagged Egnellahc's
//   own attack line — "for one moment his sundered mind is whole again" — which
//   is not only legal but load-bearing: the split IS real, and reuniting it is
//   the thing §5 forbids. §24.10 is about WHO performed it, not about whether
//   the result may be described. Test the agent, not the vocabulary.
forbid(10, /Egnellahc\s+(irreversibly\s+)?divided his own|divide[sd]?\s+(himself|into OATH)/i,
       'Obsidius PERSONALLY performs the Soul Split — Egnellahc does not split himself');
forbid(12, /humanoids?[^\n]{0,40}first (beings?|race)[^\n]{0,20}(on |of )Viridia/i,
       'Immortals held Viridia before humanoids');
forbid(15, /Andre[^\n]{0,30}(descendant|son|father|ancestor) of Auraxion|Auraxion[^\n]{0,30}(descendant|son) of Andre/i,
       'Andre Hart and Auraxion are one person');
forbid(17, /Earth[^\n]{0,25}Planet\s*#?\s*28|Planet\s*#?\s*28[^\n]{0,20}Earth/i,
       'Earth is not AE Planet #28');
// ★ TIGHTENED. The loose version — "Ultharis within 20 chars of 'Planet 19'" —
//   flagged the line *"Planet 19 | Uralyx — Ultharis is the Highest One only"*,
//   which is the rule being stated CORRECTLY. Proximity is not assertion; test
//   for the equation, not the co-occurrence.
forbid(18, /Ultharis\b[^\n]{0,12}\b(is|=|:)\s*(AE\s*)?(Planet|World|#)\s*#?\s*19|(Planet|World)\s*#?\s*19\s*(is|=|:|,|·|—|-)?\s*(the\s+)?Ultharis/i,
       'Planet 19 is Uralyx — Ultharis is reserved for the Highest One');
forbid(21, /(two|second|another|many) Highest Ones?|Highest Ones\b/i,
       'the Highest One is singular — the Mirror multiplies interpretations, not God');

H('★★ THE COUNTS THE HANDOFF FIXES');
{
  // §3.1 — 63, as 9 x 7.  Assert the POSITIVE, not just the absence of 45.
  const say63 = [...TEXT].filter(([, b]) => /\b63\b[^\n]{0,40}Astralite|Astralite[^\n]{0,40}\b63\b/i.test(b));
  ok(say63.length >= 3, `${say63.length} files state the 63-Astralite count`);
  ok(/\b7\b[\s\S]{0,80}Tiers[\s\S]{0,200}\b63\b[\s\S]{0,60}Astralites/i.test(TEXT.get('aethryx.html') || ''),
     '★ aethryx.html publishes 9 families · 7 tiers · 63 — it was the last surface still selling "45 / 200+"');
}
{
  // §10.2 — eight natural types.  The public pages may say "ten Gemlords";
  // what they may not say is that ten types are natural or that all ten are
  // Mothergem fragments.
  forbid('10.2', /shattered into ten|ten (equivalent )?fragments|ten shards become|Ten Gemlords rise from its shards|ten fundamental|ten natural gem/i,
         'the Mothergem revealed EIGHT principles — IX and X are composites');
}

H('★★ §21.2 · THE TERMINOLOGY LOCK · Rizer, never trainer');
{
  // ★ Only PLAYER-FACING strings count.  startTrainerBattle() is an identifier;
  //   no player ever reads it.  Scope to quoted prose in the mainline game and
  //   every website page.
  const LORE = [...TEXT].filter(([p]) => /^(rp7b\.html|[a-z0-9_]+\.html)$/.test(p) && p !== 'rp8.html');
  const bad = [];
  for (const [file, body] of LORE)
    for (const m of body.matchAll(/['"`>][^'"`<>\n]{0,120}\btrainers?\b[^'"`<>\n]{0,120}['"`<]/gi)){
      const s = m[0];
      if (/Trainer(Battle|Id|Data|Key)|_trainer|startTrainer|combatTrainer|never uses that word|is not a trainer/i.test(s)) continue;
      // ★ A BARE TOKEN IS AN IDENTIFIER, NOT PROSE. rp7b uses 'trainer' as a
      //   battle-kind key (xpType === 'trainer'); no player ever reads it, and
      //   renaming it would be a refactor dressed up as a canon fix. Lore is
      //   the thing with spaces in it.
      if (!/\s/.test(s.replace(/^['"`>]|['"`<]$/g, '').trim())) continue;
      bad.push(`${file} · ${s.trim().slice(0, 100)}`);
    }
  ok(bad.length === 0,
     bad.length ? `player-facing "trainer" in mainline copy\n       · ${bad.slice(0,4).join('\n       · ')}`
                : 'no player-facing "trainer" in rp7b or any website page');
  ok(/A Rizer is not a trainer/i.test(TEXT.get('macrobook.html') || ''),
     '★ and the macrobook says so out loud');
}

H('★★ §8 SPOILER BOUNDARY · the split is deeper canon than the public copy');
{
  const PUBLIC = ['macrobook.html', 'zyraxis.html', 'index.html'];
  const LEAK = /Soul Split|Obsidius[^\n]{0,60}(split|patterned)|patterned from Obsidius|Egnellahc[^\n]{0,40}(split|divide)/i;
  for (const p of PUBLIC){
    const body = TEXT.get(p); if (!body) continue;
    const hits = body.split('\n').filter(l => LEAK.test(l) && !/<!--/.test(l));
    ok(hits.length === 0,
       hits.length ? `★★★ ${p} LEAKS the Soul Split · ${hits[0].trim().slice(0,90)}`
                   : `${p.padEnd(15)} keeps the Ninth/Tenth origin guarded`);
  }
  // and the approved public wording is what's actually on the page
  ok(/eight (fundamental )?[Gg]em [Tt]ypes|eight fundamental principles/.test(TEXT.get('macrobook.html') || ''),
     'the macrobook still uses the approved "eight fundamental" wording');
}

H('★ §25 · THE CLEANUP QUEUE MUST STAY OPEN, NOT GET SOLVED QUIETLY');
{
  // ★ These are the inverse of the tests above: the handoff forbids RESOLVING
  //   them.  A silent resolution is as much a retcon as a contradiction.
  const RE = /\(formerly Ferros\)|Ferros is (now|obsolete)|renamed to Ferralis/i;
  const ferros = [...TEXT].filter(([p, b]) =>
      b.split('\n').some(l => RE.test(l) && !EXEMPT_LINE.test(l)))
    .map(([p]) => p);
  ok(ferros.length === 0,
     ferros.length ? `§24.19 Ferros/Ferralis silently resolved in: ${ferros.join(', ')}`
                   : '§24.19  Ferros/Ferralis left unreconciled, as required');
}

H('★ WHAT THIS SUITE CANNOT TEST');
for (const s of [
  '§24.3/4/5 · inventing Planetelles or Fae sister-race names — enforced by absence',
  '§24.7/8   · the Transplacement motive and failure mechanism — no fixed wording',
  '§24.16    · the 2031→1945 chronology — needs a mechanism, not a regex',
  '§24.23/24 · filling the 63 or promoting a hypothesis — a human has to notice',
]) console.log('  ·  ' + s);

console.log(`\n★ ${checks} assertions`);
H(f ? `❌ ${f} failed` : '✅ the live repo conforms to the Definitive Canon Handoff');
process.exit(f ? 1 : 0);
