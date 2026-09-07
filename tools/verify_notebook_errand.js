#!/usr/bin/env node
/* verify_notebook_errand.js · v0.95.972
 *
 *   Creator: "rizer should receive dads notebook from mom after rizer brings
 *   sister to school. she tells rizer to bring it to dad but he tells u to keep
 *   it and begin ur own journey"
 *
 * The notebook stops being a gift and becomes an errand that fails on purpose.
 * Three actors, one object, and a strict order:
 *
 *     school walk  →  MOM hands over the paper book  →  DAD refuses it
 *     raidCardGifted   momNotebookGiven                 dadNotebookGifted
 *
 * ★ This suite EXECUTES the two interact handlers against fakes rather than
 *   grepping for their dialogue, because the thing that can break is the ORDER
 *   of the branches, and an order is not visible in a string match.
 *
 * ★ And it drives the load-time migration, which is where this patch could
 *   quietly eat the whole scene: `_migrateNotebook` predates the errand and
 *   used to read "notebook in the bag" as "the install already happened".
 *   Mid-errand that reading is wrong, and being wrong there deletes Dad's
 *   refusal without an error — the v0.95.950 filed-scroll failure exactly.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');

let pass = 0, fail = 0;
const ok = (m) => { pass++; console.log('  ok   · ' + m); };
const no = (m) => { fail++; console.log('  FAIL · ' + m); };
const t  = (c, m) => c ? ok(m) : no(m);

console.log('\n=== DAD\'S NOTEBOOK · the errand that fails (v0.95.972) ===\n');

/* ─────────────────────────────────────────────────────────────────────────
 * Lift the two onInteract bodies out and run them for real.
 * Sliced to STRUCTURAL boundaries — fixed byte windows have silently
 * truncated three suites in this project.
 * ──────────────────────────────────────────────────────────────────────── */
function liftInteract(npcId){
  const idAt = HTML.indexOf(`id: '${npcId}',`);
  if (idAt < 0) return null;
  const fnAt = HTML.indexOf('onInteract: (n) => {', idAt);
  if (fnAt < 0) return null;
  // walk braces from the opening { of the arrow body
  let i = HTML.indexOf('{', HTML.indexOf('=>', fnAt));
  let depth = 0, end = -1;
  let inStr = null, esc = false, inLine = false, inBlock = false;
  for (let j = i; j < HTML.length; j++){
    const c = HTML[j], n2 = HTML[j+1];
    if (inLine){ if (c === '\n') inLine = false; continue; }
    if (inBlock){ if (c === '*' && n2 === '/'){ inBlock = false; j++; } continue; }
    if (inStr){
      if (esc){ esc = false; continue; }
      if (c === '\\'){ esc = true; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '/' && n2 === '/'){ inLine = true; j++; continue; }
    if (c === '/' && n2 === '*'){ inBlock = true; j++; continue; }
    if (c === "'" || c === '"' || c === '`'){ inStr = c; continue; }
    if (c === '{') depth++;
    else if (c === '}'){ depth--; if (!depth){ end = j + 1; break; } }
  }
  return end > 0 ? HTML.slice(i, end) : null;
}

const momBody = liftInteract('mom');
const dadBody = liftInteract('dad');
t(!!momBody, 'Mom onInteract body lifted');
t(!!dadBody, 'Dad onInteract body lifted');

/* a sandbox with just enough world for the two handlers ------------------- */
function makeWorld(){
  const log = { dialogs: [], toasts: [] };
  const sandbox = {
    player: { items: {} },
    console,
    playSFX(){}, playItemGain(){}, awardRizerXP(){}, pingNextObjective(){},
    showToast(msg){ log.toasts.push(String(msg)); },
    showDialog(d){ log.dialogs.push(d); },
    createZyrex(){ return null; }, addZyrexToRoster(){},
    notebookState(){ return { seen:{}, done:{}, scrolls:{}, notes:{} }; },
    notebookVisit(){}, notebookFindScroll(){},
    openZycellAt(){ return true; }, openDadsNotebook(){},
    hookQuestProgress(){}, refreshMoves(){}, saveGame(){},
    SWORD_MAX: 100, RUBY_MAX: 100, AXE_MAX: 100, BOW_MAX: 100,
  };
  vm.createContext(sandbox);
  vm.runInContext(`var talkMom = (n) => ${momBody}; var talkDad = (n) => ${dadBody};`, sandbox);
  return { s: sandbox, log };
}
const lastDialog = (log) => log.dialogs[log.dialogs.length - 1] || { lines: [] };
const said = (log, re) => lastDialog(log).lines.some(l => re.test(l));

/* ── 1 · BEFORE the school walk, Mom does not have the notebook ──────────── */
{
  const { s, log } = makeWorld();
  s.player.zycubeGifted = true;            // her first gift already done
  s.player.raidCardGifted = false;         // ★ sister NOT walked to school
  vm.runInContext('talkMom({})', s);
  t(!s.player.momNotebookGiven, 'before the school walk · Mom does NOT hand over the notebook');
  t(!(s.player.items.dads_notebook > 0), '  · and no book lands in the bag');
}

/* ── 2 · the Zycube can never collide with the notebook in one talk ──────── */
{
  const { s, log } = makeWorld();
  s.player.raidCardGifted = true;          // school walk already done
  vm.runInContext('talkMom({})', s);       // but she has never been spoken to
  t(s.player.zycubeGifted === true, 'first talk still gives the ZyCube even if the walk is done');
  t(!s.player.momNotebookGiven, '  · and NOT the notebook in the same breath');
  vm.runInContext('talkMom({})', s);       // second talk
  t(s.player.momNotebookGiven === true, 'second talk then hands over the notebook');
}

/* ── 3 · Mom hands it over after the walk ───────────────────────────────── */
function afterMom(){
  const { s, log } = makeWorld();
  s.player.zycubeGifted = true;
  s.player.raidCardGifted = true;
  vm.runInContext('talkMom({})', s);
  return { s, log };
}
{
  const { s, log } = afterMom();
  t(s.player.momNotebookGiven === true, 'after the school walk · Mom hands over Dad\'s notebook');
  t(s.player.items.dads_notebook === 1, '  · exactly one paper notebook in the bag');
  t(said(log, /Research Facility/), '  · she says to take it to Dad at the Research Facility');
  t(!s.player.dadNotebookGifted, '  · the ZyPhone app is NOT installed yet — that is Dad\'s to give');
  // and she is idempotent
  vm.runInContext('talkMom({})', s);
  t(s.player.items.dads_notebook === 1, '  · talking to her again does not duplicate the book');
}

/* ── 4 · Dad before the errand · a holding line, not the gift ───────────── */
{
  const { s, log } = makeWorld();
  s.player.raidCardGifted = true;
  s.player.momNotebookGiven = false;
  vm.runInContext('talkDad({})', s);
  t(!s.player.dadStarterQuestGiven,
    'Dad WITHOUT the notebook does not open his scene');
  t(!s.player.dadNotebookGifted, '  · nothing is installed');
  t(said(log, /mother/i), '  · he points you back at Mom');
}

/* ── 5 · Dad refuses it · the whole point ───────────────────────────────── */
{
  const { s, log } = afterMom();
  vm.runInContext('talkDad({})', s);
  t(s.player.dadStarterQuestGiven === true, 'Dad WITH the notebook opens his scene');
  t(s.player.dadNotebookGifted === true, '  · and installs the ZyPhone copy');
  t(said(log, /Keep it\.|I said keep it/),
    '  ★ HE REFUSES IT — "keep it" is in the scene');
  t(s.player.items.dads_notebook === 1,
    '  ★ and Rizer still HAS the paper book afterwards — refusing means keeping');
  t(said(log, /10 Fae|10 Fruits/), '  · the gather quest still issues');
}

/* ─────────────────────────────────────────────────────────────────────────
 * 6 · THE LOAD-TIME TRAP.  Run the real _migrateNotebook against a save
 *     frozen mid-errand.
 * ──────────────────────────────────────────────────────────────────────── */
{
  const mAt = HTML.indexOf('function _migrateNotebook()');
  t(mAt > 0, '_migrateNotebook located');
  const mEnd = HTML.indexOf('\n}', mAt) + 2;
  const src = HTML.slice(mAt, mEnd);
  const box = { console };
  vm.createContext(box);
  vm.runInContext(src, box);

  // (a) mid-errand save: book in hand, Dad not yet visited
  box.player = { items: { dads_notebook: 1 }, momNotebookGiven: true, dadNotebookGifted: false };
  vm.runInContext('_migrateNotebook()', box);
  t(box.player.dadNotebookGifted !== true,
    '★ mid-errand save survives the load sweep — Dad\'s refusal is NOT skipped');
  t(box.player.items.dads_notebook === 1,
    '  · and the book is not confiscated on load');

  // (b) genuine pre-v0.95.780 save: the item WAS the install
  box.player = { items: { dads_notebook: 1 } };
  vm.runInContext('_migrateNotebook()', box);
  t(box.player.dadNotebookGifted === true,
    'legacy pre-780 save still migrates to an installed notebook');

  // (c) post-refusal save reloads clean
  box.player = { items: { dads_notebook: 1 }, momNotebookGiven: true, dadNotebookGifted: true };
  vm.runInContext('_migrateNotebook()', box);
  t(box.player.dadNotebookGifted === true && box.player.items.dads_notebook === 1,
    'post-refusal save reloads with BOTH halves intact');
}

/* ── 7 · persistence · the flags have to be in the snapshot ─────────────── */
{
  // ★ v0.95.990 · was a fixed 2000-char window from raidCardGifted. Eight new
  // fields were added to the save snapshot for the Omniris ladder and that
  // pushed dadStarterQuestGiven off the end of the slice — the suite went red
  // reporting a field that was still very much being saved.
  // ★★ A window measured in CHARACTERS is a window that shrinks every time
  // somebody adds a line above what it is looking for. Bound it to the end of
  // the snapshot object instead, so it grows with the thing it is inspecting.
  const snapAt = HTML.indexOf('raidCardGifted:             !!player.raidCardGifted');
  const snapEnd = HTML.indexOf('\n      };', snapAt);
  const snap = HTML.slice(snapAt, snapEnd > snapAt ? snapEnd : snapAt + 8000);
  t(/momNotebookGiven:\s*!!player\.momNotebookGiven/.test(snap),
    'momNotebookGiven is written to the save');
  t(/dadNotebookGifted:\s*!!player\.dadNotebookGifted/.test(snap),
    'dadNotebookGifted is written to the save');
  t(/dadStarterQuestGiven:\s*!!player\.dadStarterQuestGiven/.test(snap),
    '★ dadStarterQuestGiven is written to the save (pre-existing gap, fixed here)');
}

/* ── 8 · the objective hint names the new step ──────────────────────────── */
{
  const hAt = HTML.indexOf('function nextObjectiveHint()');
  const hint = HTML.slice(hAt, HTML.indexOf('\n}', hAt));
  const iWalk = hint.indexOf('raidCardGifted');
  const iMom  = hint.indexOf('momNotebookGiven');
  const iDad  = hint.indexOf('dadNotebookGifted');
  t(iMom > iWalk && iDad > iMom,
    'objective hints run in story order · school walk → Mom → Dad');
}

/* ── 9 · the bag shows the book, and clicking it is a signpost ──────────── */
{
  t(!/k !== 'dads_notebook'/.test(HTML),
    'the ZyCube no longer filters dads_notebook out of the bag');
  const cAt = HTML.indexOf("case 'dads_notebook': {");
  const cs = HTML.slice(cAt, cAt + 1200);
  t(/if \(!player\.dadNotebookGifted\)/.test(cs),
    'clicking the paper book before the install shows a signpost, not an empty app');
}

/* ── 10 · dev shortcuts clear the WHOLE errand ──────────────────────────── */
{
  const gAt = HTML.indexOf('player.dadStarterQuestGiven= true;');
  const g = HTML.slice(gAt, gAt + 500);
  t(/player\.momNotebookGiven\s*=\s*true/.test(g) && /player\.dadNotebookGifted\s*=\s*true/.test(g),
    'GIVE ALL clears the errand end to end · no half-state');
}

console.log(`\n★ ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
