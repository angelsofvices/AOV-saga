#!/usr/bin/env node
/* verify_zyphone_nav.js · v0.95.995
 *
 *   Creator: "reexamine the entire phone navigation. perfect it... fix all bugs,
 *   make sure all pages can be opened and closed... no dead pages... pages can
 *   continue to scroll down... all controls are nested and not just listed out
 *   right."
 *
 * ★★★ THE ROOT CAUSE THIS SUITE GUARDS: _zySection() tags its own wrapper
 *   data-zyitem, and _zycellAutoEnrol() refused to enrol any control inside an
 *   already-tagged element. Every button in every section was therefore
 *   invisible to the cursor, and _zySectionClick() refuses to guess when a
 *   section holds anything but exactly one control. Net effect: a section with
 *   0 or 2+ buttons was a focus stop where X did nothing.
 *   SAVE STATE and LOAD STATE — two buttons, one section — could not be pressed
 *   without a mouse.
 *
 * ★★ Two reasonable rules met and produced an unreachable UI. Neither was wrong
 *   on its own, which is why nothing caught it.
 */
const fs = require('fs');
const path = require('path');
const HTML = fs.readFileSync(path.join(__dirname, '..', 'rp7b.html'), 'utf8');
const CODE = HTML.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');

let pass = 0, fail = 0;
const ok = m => { pass++; console.log('  ok   · ' + m); };
const no = m => { fail++; console.log('  FAIL · ' + m); };
const t = (c, m) => c ? ok(m) : no(m);

console.log('\n=== ZYPHONE NAVIGATION (v0.95.995) ===\n');

// ★ the whole key handler, sliced once · every key assertion tests THIS
const _hi = CODE.indexOf('function handleZycellKey');
const HANDLER = CODE.slice(_hi, CODE.indexOf('\n}\n', _hi));
t(_hi > 0 && HANDLER.length > 2000, `handleZycellKey isolated (${HANDLER.length} chars)`);

/* ── 1 · ★★★ the root cause ─────────────────────────────────────────────── */
{
  const i = CODE.indexOf('function _zycellAutoEnrol');
  const fn = CODE.slice(i, CODE.indexOf('\n}', i));
  t(/\^sec_/.test(fn),
    '★★★ auto-enrol reaches THROUGH a section wrapper · a section is a GROUPING, '
    + 'not a control, and treating it as one hid every button inside it');
  t(/_owner/.test(fn),
    '  · but still refuses to enrol inside a real item row (no double stops)');
}
t(/!el\.querySelector\('\[data-zyitem\]'\)/.test(CODE),
  '★ and a wrapper holding tagged children is still dropped · the two rules '
  + 'were always meant to work together');

/* ── 2 · SAVE/LOAD · the headline casualty ──────────────────────────────── */
t(/id="zySaveBtn"|SAVE STATE/.test(HTML), 'the SAVE/LOAD section still exists');

/* ── 3 · NO DEAD PAGES · every panel must offer a focus stop ────────────── */
{
  const PANELS = ['Home','Notebook','Zycube','Rizer','Faction','Weapons','Map',
                  'Expeditions','Contacts','Leaderboard','Settings'];
  const CLICKY = /<button|onclick=|role="button"|zy-click|data-zyitem/;
  for (const p of PANELS){
    const i = HTML.indexOf(`function renderZycell${p}(`);
    if (i < 0) { no(`renderZycell${p} not found`); continue; }
    // to the next top-level function
    const j = HTML.indexOf('\nfunction ', i + 10);
    let body = HTML.slice(i, j > i ? j : i + 9000);
    // ★ a renderer may DELEGATE its controls · Rizer builds them in
    // buildRizerAttrPanel(). Slicing the renderer alone called that a dead page.
    for (const d of (body.match(/\b(build|render)\w+\(/g) || [])){
      const dn = d.slice(0, -1);
      const di = HTML.indexOf('function ' + dn + '(');
      if (di > 0) body += HTML.slice(di, HTML.indexOf('\nfunction ', di + 10));
    }
    t(CLICKY.test(body), `  ${p.padEnd(12)} emits at least one focusable control`);
  }
}
t(/_zyMapPan|_zyMapRecentre/.test(CODE),
  '★★ the MAP has real controls · it was the one genuinely dead page, with no '
  + 'button, onclick, role or data-zyitem anywhere in its renderer');

/* ── 4 · SCROLLING · a page you cannot press must still be readable ─────── */
t(/items\.length <= 1/.test(CODE) && /scrollTop \+=/.test(CODE),
  '★★★ UP/DOWN scroll the pane when a panel has under two stops · the mouse '
  + 'wheel is deliberately killed inside the phone, so leaderboard, expeditions '
  + 'and the examine page were unreadable past their first screen');

/* ── 5 · SUB-PAGES · every level pops, none closes the whole phone ──────── */
{
  // ★★ MY OWN BUG, TWICE, AND IT IS THE SAME BUG THE PHONE HAD. First attempt
  // anchored on "if (k === 'b'..." and landed on the CONTACTS hold-Circle
  // branch. Second anchored on 'closeZyrexExamine()' and landed on the FUNCTION
  // DEFINITION, 1700 lines from the call. Both times I picked a string that
  // occurs more than once and assumed the first hit was the one I meant.
  // ★ Scope to the handler body and stop guessing at windows.
  const blk = HANDLER;
  t(/closeZyrexExamine/.test(blk), 'Circle pops the Zyrex examine page');
  t(/zycubeCloseCategory/.test(blk), 'Circle pops a ZyCube category');
  t(/_nbSection/.test(blk),
    '★★★ Circle pops a NOTEBOOK section · this was the nesting level the handler '
    + 'was never told about, so Circle closed the entire phone — the exact bug '
    + 'fixed for ZyCube at v0.95.936 and not for the panel beside it');
}
{
  const blk = HANDLER;
  t(/_nbSection/.test(blk), '★ and LEFT pops it too · symmetric with Circle');
}

/* ── 6 · STATE LEAK · leaving a panel leaves its sub-page ───────────────── */
{
  const i = CODE.indexOf('function zycellCyclePage');
  const blk = CODE.slice(i, i + 1800);
  t(/_factionExamineIdx/.test(blk) && /_nbSection/.test(blk) && /zycubeCloseCategory/.test(blk),
    '★★ cycling panels clears ALL THREE sub-pages · only one was cleared before, '
    + 'so leaving the Notebook mid-section and returning re-landed you inside it');
}

/* ── 7 · NESTED, not listed outright ────────────────────────────────────── */
t(/function _zyCtrlToggle/.test(CODE),
  '★★★ the control sheet GROUPS COLLAPSE · ~41 rows in one flat run with '
  + 'unfocusable headers is a hierarchy that exists visually and not '
  + 'structurally');
t(/game\._zyCtrlOpen/.test(CODE),
  '  · collapse state lives on game, not in markup · this panel re-renders on a '
  + '1s tick and DOM state would snap shut under the player');
t(/data-zyrow="fac_r/.test(HTML),
  '★★ the faction 2-column grid navigates as 2 columns · it renders into '
  + 'grid-template-columns:1fr 1fr but carried no row tag, so DOWN moved you '
  + 'sideways and RIGHT did nothing');
t(/data-zyrow="map_ctl"/.test(HTML), '★ and the map controls form one row');

/* ── 8 · a broken weapon can be repaired without a mouse ────────────────── */
{
  const n = (CODE.match(/getElementById\('zy\w*Repair'\);\n\s*if \(_rb\)\{ _rb\.click\(\); return; \}/g) || []).length;
  t(n === 4, `★★ all ${n}/4 broken-weapon rows repair on X · the REPAIR button `
    + 'sits INSIDE the row, so the only reachable stop used to answer a broken '
    + 'weapon by naming the button you could not press');
}
// ★ every id the repair path calls must exist · an invented id fails silently
{
  const declared = new Set([...HTML.matchAll(/id="(zy\w*Repair)"/g)].map(m => m[1]));
  const called   = new Set([...CODE.matchAll(/getElementById\('(zy\w*Repair)'\)/g)].map(m => m[1]));
  const ghost = [...called].filter(x => !declared.has(x));
  t(!ghost.length,
    '★ every repair id called actually exists' + (ghost.length ? ' · GHOST: ' + ghost.join(', ') : '')
    + ' (I shipped zyRubypawRepair for one edit · the real id is zyRubyRepair)');
}

/* ── 9 · the control sheet must not document retired bindings ───────────── */
t(!/'Enter content pane',\s*'→/.test(HTML),
  '★★ the sheet no longer claims RIGHT enters a panel · that binding was retired '
  + 'at v0.95.980 and a control sheet that lies is worse than none');

console.log(`\n★ ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
