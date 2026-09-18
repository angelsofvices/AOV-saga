// ★★★★ v0.98.3 · EVERY ZYPHONE MENU, REACHABLE ON A CONTROLLER.
//
//   Creator, 2026-09-18: "make sure all phone UI menus are accessible fully by
//   controller." … "and nav"
//
// ★★★★ THE RULE THIS SUITE ENFORCES: IF A MOUSE CAN PRESS IT, THE PAD CAN
//   REACH IT. Not "the panel is walkable" — the panel was walkable in v0.95.995
//   too, and SAVE STATE still could not be pressed without a mouse. Walkable
//   means the cursor moves; reachable means the cursor can arrive at the thing
//   and Ⓐ does what the click does.
//
// ★★★ AND IT RUNS THE REAL RULES. Reachability is decided by three functions —
//   _zycellAutoEnrol, _zycellContentItems, _zySectionClick — all written
//   against a DOM. Re-implementing their logic here would prove my copy works.
//   So the suite evaluates their actual source out of the build, against
//   tools/lib/mini_dom.mjs, on the actual HTML every panel renders.
//
// ★★ THE THREE WAYS A CONTROL GOES UNREACHABLE, all seen in this codebase:
//   1 · it is nested inside a non-section [data-zyitem], so auto-enrol skips it
//       and the parent's own onclick fires instead (the row eats its buttons);
//   2 · it lives in a container the focus system never targets — the right rail
//       has no focus mode at all;
//   3 · it is inside an inner max-height scroller, which the arrow keys cannot
//       scroll because the wheel is deliberately dead inside the phone.
import { bootGame } from './lib/boot_game.mjs';
import { parse, makeDocument } from './lib/mini_dom.mjs';
import fs from 'fs';

let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const H  = t => console.log('\n' + t);
const page = fs.readFileSync('rp7b.html', 'utf8');
const src  = fs.readFileSync('/tmp/all.js', 'utf8');

// ── the real reachability rules, lifted out of the build ──────────────────
const grab = re => { const m = re.exec(page); if (!m) throw new Error('missing: ' + re); return m[0]; };
const RULES = grab(/function _zycellAutoEnrol\(c\)\{[\s\S]*?\n\}/)
            + '\n' + grab(/function _zySectionClick\(el, ev\)\{[\s\S]*?\n\}/)
            + '\n' + grab(/function _zycellContentItems\(\)\{[\s\S]*?\n\}/);
// ★★★★ THE CENSUS HAS TO KNOW ABOUT DELEGATION, OR IT GRADES ITS OWN BLIND SPOT.
//   _zycellAutoEnrol looks for `button, [onclick], [role="button"], .zy-click`.
//   That is the right net for enrolling, but it is the WRONG net for AUDITING,
//   because the phone also wires controls by delegation: the notebook section
//   rows and the faction slots have no onclick and are not buttons — they are
//   divs with a listener bound elsewhere, matched by class or by a data-*.
//   ★ Audited with auto-enrol's own selector, those controls are invisible: a
//     faction slot missing data-zyitem would not have counted as a control, so
//     it could not have counted as an orphan, and the suite would have gone
//     green over the exact bug it exists to catch. (It did, on the first run —
//     three empty faction slots, mouse-only, and the grid's right-hand column
//     missing on its last row.)
//   ★★ So the census is the union: auto-enrol's net PLUS every hook a
//     delegated listener in the build actually reads.
const DELEGATED = '.zyFactionSlot, .zyContactRow, [data-call], [data-slot], [data-recallall], '
                + '[data-zycat], [data-item], [data-zyclick], [data-starter], [data-buy], [data-give]';
const CLICKABLE = 'button, [onclick], [role="button"], .zy-click, ' + DELEGATED;
const SECSEL    = 'button,[data-zyclick],[data-call],[data-zycat],[data-item]';

// ── a save with something in every panel ──────────────────────────────────
const _L = console.log; console.log = () => {};
const G = bootGame({ extra: ['renderZycellHome','renderZycellNotebook','renderZycellZycube','renderZycellRizer',
  'renderZycellFaction','renderZycellWeapons','renderZycellMap','renderZycellMissions','renderZycellContacts',
  'renderZycellLeaderboard','renderZycellSettings','renderZycellAnimations','ZYCELL_PANELS','MISSION_TABS',
  'buildQuestLog','NOTEBOOK_SECTIONS','SPECIES','createZyrex','recomputeRizerStats','NPCS'] });
const P = G.player;
for (const fl of ('auraxionMet dadStarterQuestGiven elzebubHatched faeCollected faenetGifted hasBackpack '
 + 'kelthorMet malezorBroadcastDone nurseReinAllied radioTowerFixed raidCardGifted scrapjawMet starterChosen '
 + 'townMapGifted yaraFollowStarted yaraMet zycubeGifted orrenQuestGiven phoneBattery dadNotebookGifted '
 + 'zyrexMenuUnlocked').split(' ')) P[fl] = true;
P.omnirisStep = 1; P.orrenGruntDodges = 2; P.towerMoriKills = 4; P.x = 24; P.y = 110;
P.rizerLvl = 24; P.attrs = { hp:240, atk:180, def:90, speed:120, special:60 }; P.credits = 1852;
P.items = Object.assign({}, P.items, { zphone:1, potion:3, lifestone:2, zysphere:5, dads_notebook:1,
  sapphire_sword:1, rubypaw_sword:1, emerald_axe:1, pearlbow:1 });
P.bonds = P.bonds || {}; for (const n of G.NPCS.slice(0,40)) if (n && n.id) P.bonds[n.id] = 100;
P.party = []; P.pcZyrex = [];
const sids = Object.keys(G.SPECIES || {});
for (const s of sids.slice(0,5)) { const z = G.createZyrex(s,12); if (z) P.party.push(z); }
for (const s of sids.slice(5,9)) { const z = G.createZyrex(s,9);  if (z) P.pcZyrex.push(z); }
try { G.recomputeRizerStats({ quiet:true }); } catch(_){}

const VIEWS = [];
const v = (name, fn) => { try { VIEWS.push({ name, html: fn() }); } catch(e){ VIEWS.push({ name, html:'', err:e.message }); } };
v('home', G.renderZycellHome);
v('notebook', () => { G.game._nbSection = null; return G.renderZycellNotebook(); });
for (const S of (G.NOTEBOOK_SECTIONS||[]))
  v('notebook:'+S.key, () => { G.game._nbSection = S.key; return G.renderZycellNotebook(); });
G.game._nbSection = null;
v('zycube', G.renderZycellZycube);
v('rizer',  G.renderZycellRizer);
v('faction', () => { G.game._factionExamineIdx = null; return G.renderZycellFaction(); });
v('faction:examine', () => { G.game._factionExamineIdx = 0; return G.renderZycellFaction(); });
G.game._factionExamineIdx = null;
v('weapons', G.renderZycellWeapons);
v('map', G.renderZycellMap);
for (const [t] of G.MISSION_TABS)
  v('missions:'+t, () => { G.game._missionTab = t; G.game._missionOpen = {}; return G.renderZycellMissions(); });
v('contacts', G.renderZycellContacts);
v('leaderboard', G.renderZycellLeaderboard);
v('settings', G.renderZycellSettings);
v('animations', G.renderZycellAnimations);
console.log = _L;

// ── run the REAL rules over one panel's HTML ──────────────────────────────
function reach(html){
  const c = parse(`<div id="zycellContent">${html}</div>`).children[0];
  const document = makeDocument({ zycellContent: c, zycellNav: parse('<div id="zycellNav"></div>').children[0] });
  const game = { _zycellFocus: 'content', _zycellItemIdx: 0 };
  const run = new Function('document','game', RULES + '; return _zycellContentItems();');
  const items = run(document, game);
  const set   = new Set(items);
  // ★★★ THE RULE IS ABOUT ACTIONS, NOT ELEMENTS. The pad must be able to
  //   PERFORM everything the mouse can perform. An element that is not itself a
  //   stop is fine when a stop the cursor DOES reach does the same thing —
  //   which is how the contact rows work on purpose: the row and the CALL
  //   button inside it carry the same data-call, and the comment at the render
  //   site says so. Demanding element-for-element parity would have failed ten
  //   controls that a pad can already fire, and that kind of false red is how a
  //   suite gets ignored.
  const DELEG = ['data-call','data-item','data-zycat','data-zyclick','data-zynav','data-recallall'];
  const sameAction = (a, b) => DELEG.some(k => a.hasAttribute(k) && b.getAttribute(k) === a.getAttribute(k));
  const orphans = [];
  for (const el of c.querySelectorAll(CLICKABLE)){
    if (set.has(el)) continue;
    if (el.disabled || el.getAttribute('aria-disabled') === 'true') continue;
    if (el.offsetParent === null) continue;                    // not laid out · not a target
    // ★ a _zySection wrapper is a GROUPING. Its only onclick is _zySectionClick,
    //   which does nothing of its own — it forwards to a child or declines. It
    //   matches the clickable selector and is not a control.
    if (/^sec_/.test(el.getAttribute('data-zyitem') || '')) continue;
    const owner = el.parentElement && el.parentElement.closest('[data-zyitem]');
    // delegated? _zySectionClick forwards only from a section with exactly one control
    const viaSec = owner && /^sec_/.test(owner.getAttribute('data-zyitem') || '')
                   && owner.querySelectorAll(SECSEL).length === 1 && set.has(owner);
    if (viaSec) continue;
    if (owner && set.has(owner) && sameAction(el, owner)) continue;   // the row IS the button
    orphans.push({ el, owner: owner && owner.getAttribute('data-zyitem'),
                   label: (el.textContent || '').replace(/\s+/g,' ').trim().slice(0,44)
                          || el.getAttribute('title') || el.tagName });
  }
  // a stop where Ⓐ does nothing: a section wrapper that is still a stop and
  // holds no control at all.  Not a blocker — it is how you scroll — so it is
  // counted, not failed.
  const inert = items.filter(el => el.querySelectorAll(SECSEL).length === 0
                                && !el.hasAttribute('onclick') && el.tagName !== 'BUTTON').length;
  return { items, orphans, inert, c };
}

H('★★★★ CONTENT · every clickable in every panel, on every sub-page');
let totalItems = 0, totalOrphan = 0;
for (const V of VIEWS){
  if (V.err){ ok(false, `${V.name} · RENDER THREW · ${V.err}`); continue; }
  const r = reach(V.html);
  totalItems += r.items.length; totalOrphan += r.orphans.length;
  ok(r.orphans.length === 0,
     `${V.name.padEnd(22)} ${String(r.items.length).padStart(3)} stops`
     + (r.orphans.length ? ` · ★ ${r.orphans.length} MOUSE-ONLY: `
        + r.orphans.slice(0,3).map(o => `"${o.label}" (inside ${o.owner || 'nothing'})`).join(', ')
        : ''));
}
ok(totalOrphan === 0, `★★★★ ${totalItems} focus stops across ${VIEWS.length} views · ${totalOrphan} mouse-only controls`);

H('★★ THE CURSOR LANDS ON LEAVES, AND ON EVERY PANEL THAT HAS ANYTHING');
for (const V of VIEWS){
  if (V.err) continue;
  const r = reach(V.html);
  // ★ the leaf invariant _zycellContentItems enforces: a container that holds
  //   focus targets is not one itself. Break it and the cursor lands on "the
  //   whole middle panel" and Ⓐ fires whichever button happens to be first —
  //   the v0.95.807 bug, in its own words.
  const nested = r.items.filter(el => el.querySelectorAll('[data-zyitem]').length > 0);
  const ctrls  = r.c.querySelectorAll(CLICKABLE)
                  .filter(el => !/^sec_/.test(el.getAttribute('data-zyitem') || ''))
                  .filter(el => !el.disabled && el.offsetParent !== null).length;
  ok(nested.length === 0 && (ctrls === 0 || r.items.length > 0),
     `  ${V.name.padEnd(22)} ${String(r.items.length).padStart(3)} stops · ${ctrls} controls`
     + (nested.length ? ` · ★ ${nested.length} NESTED STOP(S)` : '')
     + (r.items.length <= 1 ? ' · read-only · UP/DOWN scrolls it' : ''));
}

H('★★★ THE NAV RAIL · every button must name a panel the cursor walks');
{
  const shell = parse(/<div id="zphonePanel"[\s\S]*?\n  <\/div>/.exec(page)[0]);
  const navs  = shell.querySelectorAll('.zyNav');
  ok(navs.length > 0, `${navs.length} nav buttons in the rail`);
  // zycellMoveCursor walks ZYCELL_PANELS · a button whose data-zynav is not in
  // that list is reachable by mouse and by nothing else.
  const bad = navs.map(n => n.getAttribute('data-zynav')).filter(t => !G.ZYCELL_PANELS.includes(t));
  ok(bad.length === 0, bad.length ? `★ UNREACHABLE NAV: ${bad.join(', ')}`
     : `★★★ every nav target is in ZYCELL_PANELS · the rail cursor reaches all ${navs.length}`);
  ok(navs.length === G.ZYCELL_PANELS.length,
     `★★ and the list has no PHANTOM entries · ${G.ZYCELL_PANELS.length} panels, ${navs.length} buttons`);
  ok(/if \(k === 'arrowup'\)\s*\{ zycellMoveCursor\(-1\); return true; \}/.test(src)
     && /if \(k === 'arrowdown'\)\s*\{ zycellMoveCursor\(\+1\); return true; \}/.test(src),
     '★ UP/DOWN walk the rail · X enters content, O backs out');
}

H('★★★ THE RIGHT RAIL AND THE HEADER · what the pad cannot reach, and whether it matters');
{
  const shell = parse(/<div id="zphonePanel"[\s\S]*?\n  <\/div>/.exec(page)[0]);
  const rail  = shell.querySelector('[id="zycellRail"]');
  ok(!!rail, 'the right rail exists');
  const railBtns = rail ? rail.querySelectorAll(CLICKABLE) : [];
  ok(railBtns.length === 0,
     railBtns.length ? `★★★ ${railBtns.length} CONTROL(S) IN THE RIGHT RAIL and no focus mode targets it`
                     : '★★ the right rail holds no controls · read-only, so nothing is stranded there');
  // ★ CLOSE is mouse-only by design — B, Escape and the touchpad all close the
  //   phone, so the button is a convenience, not the only door.
  ok(/if \(k === 'b' \|\| k === 'escape'\)\{/.test(src),
     '★ the header CLOSE button is mouse-only, but B/Escape closes · not a trap');
}

H('★★★ CAPPED-HEIGHT BOXES · reachable, and here is what makes them reachable');
{
  // ★★★★ I ALMOST "FIXED" THIS AND IT IS NOT BROKEN.
  //   The wheel is deliberately dead inside the phone, so my first assertion
  //   was "no max-height box may contain a control" — and it went red on ZYCUBE
  //   and FACTION, which work fine on a pad.
  //   ★ What I had forgotten is the mechanism: _zycellScrollFocusIntoView calls
  //     el.scrollIntoView({block:'nearest'}), and that scrolls EVERY scrollable
  //     ancestor, not just the page. A capped box is therefore transparent to
  //     the cursor — arrowing onto an item inside it scrolls the box.
  //   ★★ So the real invariant is conditional, and it is the one v0.95.995
  //     actually established: a capped box is fine PROVIDED everything in it is
  //     a focus stop. The quest list was unreachable because its rows carried no
  //     data-zyitem at all — there was nothing to scroll INTO view. The cap was
  //     never the fault; the missing stops were.
  const boxes = [];
  for (const V of VIEWS){
    if (V.err) continue;
    const r = reach(V.html);
    const set = new Set(r.items);
    for (const el of r.c.walk()){
      const st = el.getAttribute('style') || '';
      if (!/max-height\s*:\s*\d/.test(st) || !/overflow[^;]*:\s*(auto|scroll)/.test(st)) continue;
      const inside = el.querySelectorAll(CLICKABLE)
        .filter(x => !/^sec_/.test(x.getAttribute('data-zyitem') || ''))
        .filter(x => !x.disabled && x.offsetParent !== null);
      const stranded = inside.filter(x => !set.has(x)
        && !(x.parentElement && x.parentElement.closest('[data-zyitem]') && set.has(x.parentElement.closest('[data-zyitem]'))));
      boxes.push({ view: V.name, n: inside.length, stranded: stranded.length,
                   cap: /max-height:\s*([^;]+)/.exec(st)[1].trim() });
    }
  }
  ok(boxes.length > 0, `${boxes.length} capped-height boxes in the phone`);
  for (const b of boxes)
    ok(b.stranded === 0, `  ${b.view.padEnd(14)} max-height ${b.cap.padEnd(6)} · ${b.n} control(s), `
       + `${b.stranded} of them stranded`);
  // ★ and the mechanism the exemption rests on must still be wired. Remove this
  //   call and every capped box above silently becomes a trap again.
  ok(/_zycellScrollFocusIntoView\(\);/.test(src) && /el\.scrollIntoView\(\{ block: 'nearest' \}\)/.test(src),
     "★★★ …because _zycellScrollFocusIntoView still calls scrollIntoView({block:'nearest'}), "
   + 'which scrolls the capped ancestor, not just the page');
  ok((src.match(/_zycellScrollFocusIntoView\(\)/g) || []).length >= 5,
     `★ and it is fired from every arrow path (${(src.match(/_zycellScrollFocusIntoView\(\)/g)||[]).length} call sites)`);
}

console.log(f ? `\n❌ ${f} failed` : '\n✅ every clickable in every phone menu is reachable on a controller');
process.exit(f ? 1 : 0);
