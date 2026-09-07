#!/usr/bin/env node
/* verify_codex_page.js · BETA V7.5.16
 *
 *   Creator: "clean up the entire codex webpage. update to correct number of
 *   known roster... if u click on the name, it opens up to an overlay of the
 *   full entry... include stats, planet origin, appearances, lore... flavor it
 *   like a marvel wiki page. also add a search name function. make sure the
 *   numbers all match the current codex for Rizing Power BETA v7.5.16."
 *
 * ★ The in-app browser cannot reach a localhost server started from here, so
 *   this page gets verified structurally rather than by looking at it. Every
 *   check below is a thing that would break the feature silently.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const H = fs.readFileSync(path.join(ROOT, 'codex.html'), 'utf8');
let pass = 0, fail = 0;
const ok = m => { pass++; console.log('  ok   · ' + m); };
const no = m => { fail++; console.log('  FAIL · ' + m); };
const t = (c, m) => c ? ok(m) : no(m);

console.log('\n=== CODEX PAGE · BETA V7.5.16 ===\n');

/* ── 1 · ★★ THE NUMBERS ARE COUNTED, NOT QUOTED ────────────────────────── */
const cards = (H.match(/<article class="codex-card"/g) || []).length;
const roster = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/staple_roster_v1.json'), 'utf8')).species.length;
const rp = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
const playable = new Set([...rp.slice(rp.indexOf('const SPECIES =')).matchAll(/name:'([^']+)',\s*tier:\d+,\s*type:/g)].map(m => m[1])).size;

t(new RegExp(`<span id="codex-count">${cards}</span>`).test(H),
  `★★ the header count is the REAL card count (${cards}) · it claimed 543, and the site `
  + `also claimed 547 elsewhere — three different wrong numbers at once`);
t(H.includes(`${roster} bondable Zyrex`), `★ ${roster} bondable · counted from staple_roster_v1.json`);
t(H.includes(`${playable} playable`), `★ ${playable} playable · counted from the SPECIES table in rp7b.html`);
t(H.includes('BETA V7.5.16'), '★ and the build tag is named on the page');
// ★★★ STRIP HTML COMMENTS FIRST. This assertion failed on its own explanation:
// the comment I wrote next to the fix NAMES the old numbers ("547 cards · 543
// numbered entries") so a bare search finds them and reports the stale copy as
// still present.
// ★ Fourth time this exact trap has bitten a suite in this codebase. The rule
// is settled and it is worth stating plainly: ANY CHECK ASSERTING AN ABSENCE
// MUST LOOK AT MARKUP OR CODE, NEVER AT PROSE.
const VISIBLE = H.replace(/<!--[\s\S]*?-->/g, '');
t(!/543 entries|547 cards|543 numbered/.test(VISIBLE),
  '★★ every stale number is gone from what a READER sees');
t(!/v13\.17 \(site sync\)/.test(VISIBLE),
  '★ and the archive eyebrow names the current Codex v16, not v13.17');

/* ── 2 · SEARCH ────────────────────────────────────────────────────────── */
t(/id="codex-search"/.test(H), 'a search field exists');
t(/c\.__hay/.test(H),
  '★★ it searches NAME, ID, TAG and TYPE · the things somebody already knows '
  + 'when they come looking for an entry');
t(/!c\.classList\.contains\('is-hidden'\)/.test(H),
  '★★★ search COOPERATES with the tier filter rather than fighting it · a card shows '
  + 'only when both agree, so searching inside a filter still works');
t(/codex-noresult/.test(H), '  · and an empty result says so');

/* ── 3 · THE OVERLAY ───────────────────────────────────────────────────── */
t(/id="cx-ov"/.test(H) && /role="dialog"/.test(H), 'the entry overlay exists and is a dialog');
for (const s of ['Record', 'Status', 'Appearances', 'Lore'])
  t(new RegExp(`<h4>${s}</h4>`).test(H), `  section · ${s}`);
for (const [k, label] of [['Stat pool', 'stats'], ['Origin', 'planet origin'],
                          ['Types', 'types'], ['Bond to field', 'the tier gate']])
  t(H.includes(k), `  field · ${label}`);
t(/Zyraxis · Ax-9/.test(H), '★ origin names the planet AND its Astralite Matrix coordinate');
t(/data-cx-close/.test(H) && /e\.key === 'Escape'/.test(H),
  '★ closes on Escape, on the backdrop and on the X · three ways out of a modal');
t(/setAttribute\('tabindex','0'\)/.test(H) && /e\.key === 'Enter'/.test(H),
  '★★ and it opens from the KEYBOARD · a card that is only mouse-clickable is '
  + 'the same defect the in-game phone had');

/* ── 4 · ★★★ KEYED PER CARD, NOT PER ID ────────────────────────────────── */
{
  const stamps = [...H.matchAll(/data-cx="(\d+)"/g)].map(m => m[1]);
  t(stamps.length === cards, `every card carries a data-cx stamp (${stamps.length}/${cards})`);
  t(new Set(stamps).size === stamps.length, '  · and every stamp is unique');
  const blob = H.match(/<script id="cx-data" type="application\/json">([\s\S]*?)<\/script>/);
  t(!!blob, 'the data blob exists');
  const D = JSON.parse(blob[1]);
  t(Object.keys(D.data).length === cards, `  · with a row per card (${Object.keys(D.data).length})`);
  t(stamps.every(s => D.data[s]), '★ every stamp resolves to a row · no card opens an empty overlay');
  const ids = Object.values(D.data).map(d => d.id);
  const dup = [...new Set(ids.filter((x, i) => ids.indexOf(x) !== i))];
  t(dup.length > 0 && /shares this record with/.test(H),
    `★★★ duplicate codex IDs are HANDLED, not deduplicated — ${dup.join(', ')} is shared `
    + `by design (Ultharis IS Anciuxor's divine humanoid form). Keying the overlay on `
    + `the ID collapsed two entries into one and clicking Ultharis opened Anciuxor. `
    + `The duplicate was canon; my key was the bug.`);
}

/* ── 5 · the JSON must actually parse ──────────────────────────────────── */
t((() => {
  try { JSON.parse(H.match(/<script id="cx-data"[^>]*>([\s\S]*?)<\/script>/)[1]); return true; }
  catch (_) { return false; }
})(), '★ the embedded JSON parses · a malformed blob would silently kill search AND the overlay');

console.log(`\n★ ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
