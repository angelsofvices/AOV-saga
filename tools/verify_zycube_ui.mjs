// ★★★★ v0.99.15 · ZYCUBE REBUILT ON THE CREATOR'S REFERENCE PANEL.
//
//   Creator, 2026-09-21: "remake the zycube UI based on this panel inspo"
//   (Echoes of Wisdom · Key Items), then: "use native UI icons for the item
//   art until we make real ones."
//
// ★★★★ THE REFERENCE IS A TAB RAIL OVER A SLOT GRID OVER A DETAIL PANE. The
//   old ZyCube was a drill-down: categories on one screen, rows on another, so
//   you could never see a drawer and its contents at once.
//
// ★★★★ AND THE "ALL" TAB IS WHY THIS DID NOT BREAK THE CANVAS BAG.
//   `zycubeCatOpen` is SHARED STATE — the canvas BAG reads the same variable
//   and its null case IS its category list. A pure tab rail means a category
//   is always open, which silently deletes the BAG's top level and changes
//   what Circle does over there. Null stays meaningful and renders as ALL.
import { bootGame } from './lib/boot_game.mjs';
import { parse, makeDocument } from './lib/mini_dom.mjs';
import fs from 'fs';
import path from 'path';

let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; return !!c; };
const H  = t => console.log('\n' + t);
const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');

const _L = console.log; console.log = () => {};
const G = bootGame({ extra: ['renderZycellZycube','player','game','zycubeOpenCategory',
  'zycubeCloseCategory','ZYCUBE_CATEGORIES','ZYCUBE_CAT_ICON','ZYCUBE_ICON','zycubeIconFor',
  'zycubeCategoryOf','INVENTORY_META','ASTRALITE_FAMILIES','zycubeCategoryRows',
  'ZYCUBE_ART','ZYCUBE_ART_ROOT','zycubeArtFor','zycubeSortKeys','zycubeMoveItem',
  'ZYCUBE_ART_ELSEWHERE','zyAttrHilite','zycubeAstraliteCrop','ASTRALITE_GEM_SHEETS',
  'ASTRALITE_FAMILIES','renderZycellRaidCard','useZycubeItem','zycellCyclePage',
  'migrateFairies','ZYCUBE_ICON','DISTRICT_ORDER','zycubeCycleTab','zycubeTabOrder'] });
console.log = _L;

G.player.items = { potion:5, ale:2, coins:1200, gem:14, zysphere:9, sapphire_sword:1, pearlbow:1,
  berry:23, fruit:8, scrap_metal:40, backpack:1, zycube:1, zphone:1, faenet:1, skateboard:1,
  astralite_1_1:3, astralite_2_4:1, moon_gem:2, life_seed:4, prismshard:1, tower_battery:2 };
G.player.favoriteItem = 'potion';
const n = (h, re) => (h.match(re) || []).length;
const render = cat => { if (cat) G.zycubeOpenCategory(cat); else G.zycubeCloseCategory(); return G.renderZycellZycube(); };

H('★★★ THE RAIL · every drawer one stop away, ALL included');
{
  const h = render(null);
  const live = G.zycubeCategoryRows().length;
  ok(n(h, /data-zytab="1"/g) === live + 1,
     `★★★ ${n(h, /data-zytab="1"/g)} tabs = ${live} stocked drawers + ALL · empty drawers are not rendered`);
  ok(G.zycubeTabOrder()[0] === null,
     '★★★★ the first tab is ALL · it is the null state the canvas BAG still needs');
  // ★★★★ v0.99.42 · THE RAIL LEFT THE CURSOR'S WALK. Making it a focus row at
  //   v0.99.15 was right in isolation — the cursor could reach every tab — and
  //   wrong in use: reaching ALL from the far end was eleven presses through
  //   eleven headings, every time. Creator: "still making me scroll through all
  //   horizontal tab headings just to get to all items panel."
  ok(!/data-zyitem="zytab_/.test(h),
     '★★★★ no tab is a focus stop · a row of tabs is an axis you flick, not a list you walk');
  ok((h.match(/data-zytab="1"/g) || []).length >= 3,
     '★★★ they are still there and still clickable for a mouse · leaving the cursor walk is not leaving the UI');
  // ★★ l/q and r/i already cycle PHONE PANELS in two phone-wide handlers.
  //   Binding them to tabs inside one panel is the local override that makes a
  //   control scheme feel broken everywhere else.
  const src = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
  // ★★ SLICE TO THE END OF THE FUNCTION, NOT TO SOME LATER LANDMARK. The first
  //   cut ran to zyAttrHilite(), thousands of lines downstream, and swept the
  //   phone-wide L/R handlers into "the panel" — a false RED that blamed the
  //   code for the test's reach.
  const _s = src.indexOf('function renderZycellZycube(){');
  const body = src.slice(_s, src.indexOf('\n// ── RIZER · attribute allocation', _s));
  // ★★ v0.99.52 · THE CHAR BOUND STOPPED BEING THE CHECK. It went 14k → 22k at
  //   v0.99.20 when drag-and-move landed in the panel, and 22k → red again
  //   today when the drag repair documented itself. A number that has to be
  //   raised every time the function is legitimately edited is not guarding
  //   anything — it is a tripwire on maintenance.
  //   ★ Its ACTUAL job was to catch a slice that ran off the end of the
  //   function (the v0.99.15 miss, where the cut ran thousands of lines
  //   downstream and swept the phone-wide L/R handlers into "the panel"). So
  //   check THAT, by name: the slice must not have swallowed a later panel.
  ok(body.length > 4000, `  the panel body is ${body.length} chars · not an empty slice`);
  const swallowed = ['function renderZycellRizer', 'function renderZycellFaction',
                     'function renderZycellWeapons', 'function renderZycellMap']
    .filter(n => body.includes(n));
  ok(!swallowed.length,
     `★★★ and it stops before the next panel (${swallowed.join(', ') || 'none swallowed'}) · `
   + 'the slice running off the end is the failure this guards, and a char count only noticed it by accident');
  ok(!/zycellCyclePage/.test(body),
     '★★★ the panel does NOT rebind L/R · they still cycle phone panels, and the chips only label that');
}

H('★★★★ L1/R1 REACH EVERY TAB · the pad did not lose them, it stopped walking them');
{
  // ★★★★ The requirement this guards has not changed since v0.95.936: a
  //   controller must be able to reach every category. What changed is HOW.
  //   Deleting the old data-zyitem check without proving the new path would
  //   have quietly re-opened the exact defect that check was written for.
  G.player.items = { potion:5, ale:2, coins:900, gem:14, zysphere:9, berry:23,
    scrap_metal:40, sapphire_sword:1, shard_ember:1, prismshard:1, moon_gem:2 };
  G.zycubeCloseCategory();
  const order = G.zycubeTabOrder();
  ok(order.length >= 5, `${order.length} tabs in the rail`);
  const seen = new Set();
  for (let i = 0; i < order.length; i++){
    seen.add(String(G.zycubeCatOpenNow ? G.zycubeCatOpenNow() : order[i]));
    G.zycubeCycleTab(+1);
  }
  // walk the whole ring with R1 and confirm every tab is visited
  G.zycubeCloseCategory();
  const visited = [];
  for (let i = 0; i < order.length; i++){
    const h2 = G.renderZycellZycube();
    const m = /white-space:nowrap;">([^<]+)</.exec(h2);
    visited.push(m ? m[1] : '?');
    G.zycubeCycleTab(+1);
  }
  ok(new Set(visited).size === order.length,
     `★★★★ R1 alone visits all ${order.length} tabs · ${visited.join(' → ')}`);
  ok(visited[0] === 'ALL', '★★★ and one more press from the last tab lands back on ALL · the wrap is what makes ALL one press away instead of eleven');
  // ★★★ the tab axis wraps ON PURPOSE, unlike the grid cursor
  const src = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
  const cyc = src.slice(src.indexOf('function zycubeCycleTab'), src.indexOf('function zycubeOpenCategory'));
  ok(/% order\.length/.test(cyc),
     '★★★ the TAB axis wraps · "no dpad wrapping" was about the grid cursor, where a wrap reads as the cursor vanishing; a bumper flick is the opposite');
  ok(/zycellPage === 'zycube' && \(k === 'l' \|\| k === 'q'\)/.test(src)
     && /zycellPage === 'zycube' && k === 'r'/.test(src),
     "★★★★ L1/R1 are bound to the TABS inside the ZyCube · and only inside it, so every other panel keeps them as the panel axis");
  ok(/k === 'shift'\)\{ zycellCyclePage\(-1\)/.test(src) && /k === 'i'\)\{ zycellCyclePage\(\+1\)/.test(src),
     '★★★ while L2/R2 keep the panels · which is what freed the bumpers in the first place');
  // ★★★ THIRD TIME. Restore the fixture and the tab, or the sections below
  //   render a smaller bag on a different drawer and go red on working code.
  //   A suite that fails because an earlier block tidied up is a suite that
  //   trains you to ignore it.
  G.zycubeCloseCategory();
  G.player.items = { potion:5, ale:2, coins:1200, gem:14, zysphere:9, sapphire_sword:1, pearlbow:1,
    berry:23, fruit:8, scrap_metal:40, backpack:1, zycube:1, zphone:1, faenet:1, skateboard:1,
    astralite_1_1:3, astralite_2_4:1, moon_gem:2, life_seed:4, prismshard:1, tower_battery:2 };
}

H('★★★★ THE GRID · slots, counts, favourites, and holes that are not focus stops');
{
  for (const [cat, want] of [[null, 21], ['key', 5], ['heal', 3], ['weapon', 2]]){
    const h = render(cat);
    const slots = n(h, /class="zyBagRow zyCubeSlot"/g);
    ok(slots === want, `  ${String(cat || 'ALL').padEnd(7)} ${slots} slots (expected ${want})`);
    const holes = n(h, /◆<\/div>/g);
    ok((slots + holes) % 5 === 0 || slots === 0,
       `  ${String(cat || 'ALL').padEnd(7)} ${holes} filler hole(s) → ${slots + holes} cells, a whole number of 5-wide rows`);
  }
  const h = render(null);
  // ★★★★ A hole the cursor can land on is a dead focus stop — the exact defect
  //   class that made SAVE/LOAD unpressable at v0.95.995.
  const holeBlock = /aspect-ratio:1\/1; border-radius:7px; background:rgba\(255,255,255,0\.02\)/;
  ok(holeBlock.test(h) && !/data-zyitem="[^"]*"[^>]*rgba\(255,255,255,0\.02\)/.test(h),
     '★★★★ empty slots carry NO data-zyitem · the controller never stops on a hole');
  ok(/>23<\/span>/.test(h), '★★ a count badge renders for a stack (berry ×23)');
  ok(!/>1<\/span>/.test(h), '★ and a single item shows no badge · "×1" on every slot is noise');
  ok(/★<\/span>/.test(h) && /☆<\/span>/.test(h), '★ the favourite star renders filled and empty');
}

H('★★★★ ONE ROW PER GRID ROW · a grid navigated flat is a list wearing a grid');
{
  const h = render(null);
  const rows = [...h.matchAll(/data-zyrow="zycube_r(\d+)"/g)].map(m => +m[1]);
  ok(rows.length === 5 && rows.join() === '0,1,2,3,4',
     `★★★ 21 items → ${rows.length} grid rows tagged r0..r${rows.length - 1} · LEFT/RIGHT crosses a row, UP/DOWN crosses rows`);
}

H('★★★★ THE DETAIL PANE RIDES THE EXISTING HOOK · and that hook was broken for it');
{
  const h = render(null);
  const attrs = [...h.matchAll(/data-zyattr="([^"]+)"/g)].map(m => m[1]);
  const dets  = [...h.matchAll(/data-zydetail="([^"]+)"/g)].map(m => m[1]);
  ok(attrs.length === 21 && dets.length === 21,
     `★★★ every slot names a display it owns · ${attrs.length} data-zyattr, ${dets.length} data-zydetail (v0.98.1 hook, no new painter code)`);
  ok(attrs.every(a => dets.includes(a)),
     '★★★★ and every slot\'s key has a MATCHING detail block · a slot naming a pane that does not exist shows the previous item\'s text');
  // ★★★★ zyAttrHilite opened with `if (!bars.length) return`, which assumed
  //   bars and details always ship together. They did, on the one panel it was
  //   written for. The ZyCube has no bars at all, so the pane would never have
  //   swapped: cursor moves, slot lights, description underneath stays put.
  const src = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
  const fn = src.slice(src.indexOf('function zyAttrHilite('), src.indexOf('function zyAttrHilite(') + 1400);
  ok(/!bars\.length && !document\.querySelector\('\[data-zydetail\]'\)/.test(fn),
     '★★★★ zyAttrHilite no longer returns early on a panel that has details but no bars');
  ok(!/^\s*if \(!bars\.length\) return;/m.test(fn), '★★ the unguarded early return is gone');
}

H('★★★★ FULL HEIGHT · rail and pane pinned, grid takes every leftover pixel');
{
  //   Creator, 2026-09-21: "make panel full screen vertically in the ui."
  // ★★★★ #zycellContent was ALREADY `flex:1; min-height:0` — the phone body's
  //   full height belonged to it all along. What did not fill was the SECTION
  //   inside it: every _zySection is content-sized and stacks from the top, so
  //   a short drawer left two thirds of the screen empty and a long one grew
  //   past the fold. The fix is one opt-in flag on the shared helper, not a
  //   taller magic number.
  const h = render(null);
  ok(!/max-height:236px/.test(h),
     '★★★★ the old 236px clamp is GONE · a fixed cap inside a pane that owns the full height is what left the screen empty');
  ok(/height:100%; display:flex; flex-direction:column/.test(h),
     '★★★ the section fills the content box and lays out as a column');
  ok(/box-sizing:border-box/.test(h),
     '★★ border-box · at 100% height its own border and 12px padding would otherwise overflow the parent and force a scrollbar');
  ok(/id="zyBagList" style="flex:1 1 auto; min-height:0; overflow:auto/.test(h),
     '★★★★ the grid is the ONLY row that grows · flex:1 1 auto, and it scrolls internally when a drawer is deep');
  ok(/flex:1 1 auto; min-height:0/.test(h),
     '★★★ min-height:0 is load-bearing · a flex child defaults to min-height:auto and refuses to shrink below its '
   + 'content, which makes an inner scroller overflow its parent instead of scrolling');
  for (const [what, re] of [['rail', /data-zyrow="zycube_tabs" style="flex:0 0 auto/],
                            ['detail pane', /<div style="flex:0 0 auto; min-height:74px/],
                            ['hint line', /flex:0 0 auto; text-align:center/]]){
    ok(re.test(h), `  ${what.padEnd(12)} is pinned (flex:0 0 auto) · it must not be pushed off by a full drawer`);
  }
  // ★★★ The pane describes whatever the cursor is on, so it has to be visible
  //   AT THE SAME TIME as the slot. Let it flow after an unbounded grid and you
  //   scroll away from the thing you are reading about.
  ok(h.indexOf('id="zyBagList"') < h.indexOf('min-height:74px'),
     '★★★ and the pane sits BELOW the grid · pinned to the bottom edge, on screen with the slot it describes');
  // ★ pinned to a backtick template until v0.99.30, when the header stopped
  //   interpolating the category and became a plain string. Match the CALL
  //   (fill mode on, from this panel), not the quoting style of its title.
  const _src = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
  ok(/_zySection\(['"`]◈ ZYCUBE['"`], body, accent, true\)/.test(_src),
     '★★ fill mode is OPT-IN · passed only by this panel, a no-op on the other ten');
  // ★★★★ v0.99.48 · was "NO other panel asks for it". True when written — the
  //   ZyCube was the only fill-mode caller — and stranded by two deliberate
  //   rebuilds since: the ARMORY (v0.99.45) and the FACTION roster (v0.99.47)
  //   both own the full height of the phone on purpose. A count of one was
  //   never the property; the property is that fill mode is OPT-IN and every
  //   caller is a panel that means to claim the whole content box. So the
  //   check is now a named allowlist — an unlisted panel turning it on is
  //   still the silent relayout this assertion exists to catch.
  // ★ 'title' is the FACTION roster, whose header is a variable (the view
//   name changes with the tab); the R.A.I.D. card is the ZyCube's own
//   full-height sub-view and has claimed the box since v0.99.34.
  const FILL_OK = ['◈ ZYCUBE', '⚔ ARMORY', 'title', '◈ R.A.I.D. CARD'];
  const fillCalls = [..._src.matchAll(/_zySection\(\s*([^,]+),/g)]
    .filter(m => {
      const i = m.index;
      const call = _src.slice(i, _src.indexOf(');', i) + 2);
      return /,\s*true\s*\)/.test(call);
    })
    .map(m => m[1].trim().replace(/^['"`]|['"`]$/g, ''));
  const stray = fillCalls.filter(t => !FILL_OK.includes(t));
  ok(!stray.length,
     `★★★ fill mode has ${fillCalls.length} callers and all are on the list (${fillCalls.join(', ')})`
   + (stray.length ? ` · STRAY: ${stray.join(', ')}` : ''));
}

H('★★★★ REAL ART · 72 keyed icons, glyph still underneath as the fallback');
{
  //   Creator, 2026-09-23: "use them as their bag item icon. make a UI native
  //   background for the icon and put the image of the item chromakeyed."
  const man = G.ZYCUBE_ART;
  // ★★★ BACK TO 72 · zysphere returned on its SECOND art (2026-09-23). The
  //   first was pulled for being a Poké Ball; the replacement drops the
  //   two-tone hemisphere split — the recognisable part — for a uniformly dark
  //   faceted orb with slat bands and a Z lens.
  // ★★★ 72 -> 71 at v0.99.35 · `fairy` was retired into `fae` on the Creator's
  //   canon ("we dont need fairy items. they are fae"), so the manifest lost an
  //   entry on purpose and its art file was deleted rather than left orphaned.
  // ★★ 71 -> 81 at v0.99.38 · the ten Elder keys were delivered and wired.
  //   They had been drawing a 🔑 glyph since v0.99.22 — correct as a fallback,
  //   wrong as a final state for the item the whole lock ladder turns on.
  ok(Object.keys(man).length === 81, `ZYCUBE_ART carries ${Object.keys(man).length} entries`);
  const keyMiss = (G.DISTRICT_ORDER || []).filter(d => !G.zycubeArtFor('key_' + d));
  ok(!keyMiss.length,
     `★★★★ all ten district keys have art${keyMiss.length ? ' · MISSING: ' + keyMiss.join(', ') : ''}`);
  ok(!man.fairy && !G.INVENTORY_META.fairy,
     '★★★★ `fairy` is gone from BOTH the art manifest and INVENTORY_META · a retired item left in meta still shows in the bag');
  ok(!!man.zysphere && !!G.zycubeArtFor('zysphere'),
     '★★★ zysphere has art again · it spent two builds on its glyph fallback rather than as an empty box');
  ok(fs.existsSync(path.join(ROOT, 'assets/2D sprites/items/bag/zysphere-drop.png')),
     '★★ and the live file is there');
  ok(!fs.existsSync(path.join(ROOT, 'assets/2D sprites/items/bag/_rejected/zysphere-drop.png')),
     '★★★★ while the REJECTED one is deleted · a parked duplicate of a filename that now exists live is a trap for the next import pass');
  ok(fs.existsSync(path.join(ROOT, 'assets/2D sprites/items/bag/_rejected/README.md')),
     '★★ the README stays as the record · it carries the rule a replacement had to satisfy, which is the reusable part');
  const missing = Object.entries(man)
    .filter(([, f]) => !fs.existsSync(path.join(ROOT, 'assets/2D sprites/items/bag', f)));
  ok(!missing.length,
     `★★★★ every manifest entry resolves to a real file${missing.length ? ' · MISSING: ' + missing.slice(0,4).map(m=>m[1]).join(', ') : ''}`);
  const dir = fs.readdirSync(path.join(ROOT, 'assets/2D sprites/items/bag'))
    .filter(f => /\.png$/.test(f));   // _rejected/ is a subdir · not listed here
  const named = new Set(Object.values(man));
  // ★★★ v0.99.48 · A DELIVERY IS NOT AN ORPHAN, and the difference has to be
  //   written down somewhere the suite can read. _PENDING.md lists icons that
  //   are on disk on purpose and not yet wired — so a new drop shows up as
  //   either LIVE or PENDING, and never as silently ignored. An unlisted,
  //   unwired file is still a failure, which is the whole value of the check.
  const pendingDoc = path.join(ROOT, 'assets/2D sprites/items/bag/_PENDING.md');
  const pendingTxt = fs.existsSync(pendingDoc) ? fs.readFileSync(pendingDoc, 'utf8') : '';
  const pending = new Set([...pendingTxt.matchAll(/`([^`]+\.png)`/g)].map(m => m[1]));
  const orphans = dir.filter(f => !named.has(f) && !pending.has(f));
  ok(!orphans.length,
     `★★ no imported file is orphaned · ${dir.length} on disk, ${named.size} wired, ${pending.size} parked in _PENDING.md`
   + (orphans.length ? ` · UNACCOUNTED: ${orphans.join(', ')}` : ''));
  for (const f of pending)
    ok(fs.existsSync(path.join(ROOT, 'assets/2D sprites/items/bag', f)),
       `  _PENDING names ${f} and it is really there · a stale parking slip would hide the next orphan`);
  const h = render(null);
  ok(/<img src="assets\/2D%20sprites\/items\/bag\//.test(h), '★★★ slots render the art');
  ok(/onerror="this\.style\.display='none'"/.test(h),
     "★★★★ …with onerror hiding the img · a key whose PNG is not in yet degrades to its emoji instead of an empty slot");
  ok(/image-rendering:pixelated/.test(h), '★★ pixelated · these are pixel-art renders, not photos');
}

H('★★★★ NOT ONE BAG-VISIBLE ITEM FALLS BACK TO AN EMOJI');
{
  // ★★★★ Found by smoke-testing the real loop before a playtest: ten items
  //   were drawing a GLYPH in a bag otherwise full of art — including all four
  //   Gemlord weapons, the rarest objects in the game. They were the ten I had
  //   called "already covered" in the drop-art handoff, and that reasoning was
  //   wrong in one word: they had WORLD-DROP art, which is not a BAG ICON.
  //   ★★★ The fallback layer meant nothing looked BROKEN — it looked
  //   INCONSISTENT, which is worse, because mixed art-and-emoji reads as
  //   unfinished rather than as a bug, so nobody files it.
  const skip = k => /^astralite_\d+_\d+$/.test(k) || /^compound_/.test(k) || /^key_/.test(k);
  const bare = Object.keys(G.INVENTORY_META).filter(k => !skip(k) && !G.zycubeArtFor(k));
  ok(!bare.length,
     `★★★★ every bag-visible item resolves to a real image${bare.length ? ' · GLYPH-ONLY: ' + bare.join(', ') : ''}`);
  // ★★ and the ten that live outside items/bag/ still point at files that exist
  for (const [k, p2] of Object.entries(G.ZYCUBE_ART_ELSEWHERE)){
    const real = decodeURIComponent(p2);
    ok(fs.existsSync(path.join(ROOT, real)), `  ${k.padEnd(18)} → ${real.split('/').pop()}`);
  }
  ok(Object.keys(G.ZYCUBE_ART_ELSEWHERE).length === 10,
     '★★ ten items are wired to art that already existed elsewhere · no new art was generated for this');
}

H('★★★★ THE BAG CAN BE SCROLLED · the wheel block no longer speaks for children');
{
  //   Creator, 2026-09-24: "I cant scroll down in the zycube menu."
  // ★★★★ v0.95.533 put a wheel listener on #zycellContent that cancels EVERY
  //   wheel event in the pane. It predates inner scrollers by four builds, and
  //   the ZyCube grid is one: the browser was about to scroll the grid and this
  //   handler said no. The panel going full-height at v0.99.17 is what made it
  //   matter — a bag that now fills the screen is a bag with something below
  //   the fold.
  const src = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
  const i = src.indexOf("content.addEventListener('wheel'");
  const fn = src.slice(i, i + 1800);
  ok(i > 0, 'the wheel handler was found');
  ok(/scrollHeight - el\.clientHeight > 1/.test(fn),
     '★★★★ it looks for an ancestor that can ACTUALLY scroll · a box with overflow:auto and nothing to '
   + 'scroll must not swallow the event, or the page-scroll block silently stops working wherever one exists');
  ok(/overflowY/.test(fn) && /auto|scroll/.test(fn),
     '★★★ …and that the ancestor is genuinely a scroller, not just overflowing');
  ok(/atTop|atBot/.test(fn),
     '★★★ at either END it falls through to the block · so the pane still cannot be dragged past its own content');
  ok(/content\.scrollHeight - content\.clientHeight > 1/.test(fn),
     '★★ and the pane itself takes the wheel when IT overflows · refusing then is not tidiness, it is the bug');
  ok(/ev\.preventDefault\(\); ev\.stopPropagation\(\);/.test(fn),
     '★ the original block survives for the case it was written for · nothing to scroll, nothing moves');
}

H('★★★ THE ACTIVE TAB CARRIES THE CATEGORY WORD');
{
  //   Creator: "make the navigation tab labels the actual word of the item
  //   category at the top in between L R of zycube."
  // ★★★ All thirteen cannot carry their word at once — ALL plus twelve at
  //   ~92px is ~1,200px of rail inside a ~440px phone. The rail scrolls, so it
  //   would "fit", but the set you are navigating would be mostly off-screen
  //   and the tabs would stop being a map of the bag.
  const word = h => [...h.matchAll(/white-space:nowrap;">([^<]+)</g)].map(m => m[1]);
  for (const [cat, want] of [[null, 'ALL'], ['weapon', 'WEAPONS'], ['heal', 'CONSUMABLES']]){
    const h = render(cat);
    const w = word(h);
    ok(w.length === 1 && w[0] === want,
       `  ${String(cat || 'ALL').padEnd(7)} rail shows exactly one word: ${JSON.stringify(w)}`);
  }
  const h = render('weapon');
  ok(h.indexOf('WEAPONS') < h.indexOf('id="zyBagList"'),
     '★★ the word is ABOVE the grid · at the top, between the L and R chips, where the Creator asked for it');
  // ★★★ Count VISIBLE text, not every occurrence: each inactive tab carries
  //   its word in a title="" tooltip, which is not on screen. A blunt
  //   /WEAPONS/g count reads those and reports a duplicate that no player can
  //   see — my first cut did exactly that.
  const visible = (h.match(/white-space:nowrap;">WEAPONS</g) || []).length;
  ok(visible === 1, `★★★ the word is on screen ONCE (${visible})`);
  ok(!/◈ ZYCUBE · WEAPONS/.test(h),
     '★★★ and the section header no longer repeats it · it reads just "◈ ZYCUBE", so the panel title also stops flickering as you tab');
}

H('★★★★ THE DESCRIPTION FOLLOWS THE CURSOR · driven against a parsed DOM');
{
  //   Creator, 2026-09-24: "hovering over an item with either dpad or mouse
  //   should show its description at the bottom."
  // ★★★★ TWO THINGS WERE WRONG AND ONLY ONE WAS THE HOVER. Every detail block
  //   was emitted display:none, and zyAttrHilite is what reveals one — so
  //   until the cursor landed on a slot NOTHING had called it and the pane sat
  //   empty. Opening your bag to a blank description reads as broken before
  //   you have touched anything.
  // ★★★ This section RUNS the swap rather than grepping for it: render the
  //   panel, parse it, call the hook, read which block is visible. A source
  //   scan would have happily confirmed the markup was present while the pane
  //   stayed blank.
  const P2 = G.player;
  P2.items = { potion:5, ale:2, berry:9, zysphere:3 };
  G.zycubeCloseCategory();
  const html = G.renderZycellZycube();
  const c = parse(`<div id="zycellContent">${html}</div>`).children[0];
  const doc = makeDocument({ zycellContent: c });
  doc.querySelector = sel => doc.querySelectorAll(sel)[0] || null;
  const realDoc = globalThis.document;
  globalThis.document = doc;
  const shown = () => doc.querySelectorAll('[data-zydetail]')
    .filter(n => { const inline = n.style && n.style.display;
      return inline ? inline !== 'none' : !/display:\s*none/.test(n.getAttribute('style') || ''); })
    .map(n => n.getAttribute('data-zydetail'));
  try {
    const first = shown();
    ok(first.length === 1,
       `★★★★ ONE description is visible before anything is touched (${JSON.stringify(first)}) · the pane never opens blank`);
    G.zyAttrHilite('zysphere', 0);
    ok(shown().join() === 'zysphere', `★★★★ pointing at zysphere shows zysphere (${JSON.stringify(shown())})`);
    G.zyAttrHilite('berry', 0);
    ok(shown().join() === 'berry', '★★★ and moving to berry swaps it · exactly one at a time');
    G.zyAttrHilite(null, 0);
    ok(shown().length === 1,
       '★★★ off an item it falls back to the first rather than blanking · zyAttrHilite already had that instinct, the markup just never gave it a first state');
  } finally { globalThis.document = realDoc; }
}

H('★★★ MOUSE HOVER FEEDS THE SAME HOOK THE D-PAD DOES');
{
  const h = render(null);
  const mo = [...h.matchAll(/onmouseover="([^"]*)"/g)].map(m => m[1]).filter(x => /zyAttrHilite/.test(x));
  ok(mo.length >= 3,
     `★★★★ ${mo.length} slots call zyAttrHilite on hover · the D-pad path went through the focus painter and the mouse had NO path at all`);
  ok(mo.every(x => /borderColor/.test(x)),
     '★★ and they still light their own border · hover does both jobs, not one instead of the other');
  const src = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
  ok(/zyAttrHilite\(fe && fe\.getAttribute \? fe\.getAttribute\('data-zyattr'\) : null/.test(src),
     '★★★ the D-pad still drives it through the SAME function · one hook, two inputs, so they cannot disagree about what is described');
}

H('★★★★ THE 63 ASTRALITES DRAW THEIR REAL GEMS');
{
  //   Creator, 2026-09-24: "we already have astralite images. use them for the
  //   item image in the zycube astralite menu."
  // ★★★★ And the build already knew where every one of them is.
  //   ASTRALITE_GEM_SHEETS has carried seven tier sheets since the matrix
  //   shipped, and its own comment states the addressing: "cells[family-1] on
  //   sheet[energy] IS the rolled item". The overworld gem drop has been
  //   drawing from it the whole time; the bag was showing a two-character
  //   monogram beside it.
  const S = G.ASTRALITE_GEM_SHEETS;
  ok(Object.keys(S).length === 7, `${Object.keys(S).length} tier sheets`);
  ok(Object.values(S).every(t => t.cells.length === 9),
     '★★ nine cells each · a 3x3 of the nine families, row-major');
  let missing = [];
  for (const fam of G.ASTRALITE_FAMILIES)
    for (let e = 1; e <= 7; e++)
      if (!G.zycubeAstraliteCrop(`astralite_${fam.id}_${e}`)) missing.push(`${fam.id}_${e}`);
  ok(!missing.length,
     `★★★★ all ${G.ASTRALITE_FAMILIES.length * 7} astralites resolve to a crop${missing.length ? ' · MISSING: ' + missing.slice(0,5).join(', ') : ''}`);
  // ★★★ the crop must address the cell the GAME uses, not a parallel table
  for (const [fam, e] of [[1,1],[5,7],[9,4]]){
    const c = G.zycubeAstraliteCrop(`astralite_${fam}_${e}`);
    const [bx, by, bw, bh] = S[e].cells[fam - 1];
    const expW = bw >= bh ? 82 : 82 * (bw / bh);
    ok(Math.abs(c.w - expW) < 0.01 && c.src === S[e].src,
       `  fam${fam} e${e} → sheet ${e}, cell ${fam - 1} · the same address the overworld drop uses`);
  }
  // ★★★★ A SHEET CELL IS NOT AN <img src>, which is why these were skipped.
  //   The percentage maths only comes out right if the box carries the CELL's
  //   aspect ratio — background-size and background-position percentages
  //   resolve per-axis against the container, so a square box stretches a
  //   non-square cell.
  const sq = G.zycubeAstraliteCrop('astralite_1_1');
  const [ , , w1, h1 ] = S[1].cells[0];
  ok(Math.abs((sq.w / sq.h) - (w1 / h1)) < 0.01,
     `★★★★ the crop box carries the CELL's aspect (${(sq.w/sq.h).toFixed(3)} vs ${(w1/h1).toFixed(3)}) · a square box would stretch it`);
  G.player.items = { astralite_1_1: 2, potion: 1 };
  G.zycubeCloseCategory();
  const h = G.renderZycellZycube();
  ok(/background-image:url\('assets\/2D%20sprites\/items\/astralites\//.test(h),
     '★★★ the slot renders a background crop for an astralite');
  ok(/<img src="assets/.test(h), '★★ …and a plain <img> for the single-file items beside it');
}

H('★★★★ THE DESCRIPTION STICKS · the 1s tick used to walk it back');
{
  //   Creator, 2026-09-24: "when I hover over a item it goes back to the first
  //   item after a few secs."
  // ★★★★ _zycellPaintFocus runs on the phone's periodic repaint and passes the
  //   FOCUSED element's key — but a mouse user has no content focus
  //   (game._zycellFocus is 'nav'), so it passed NULL, and null fell through to
  //   "show rows[0]". The hover was never the fragile part; the repaint was.
  const P3 = G.player;
  P3.items = { potion:5, ale:2, berry:9, zysphere:3 };
  G.zycubeCloseCategory(); G.game._zyDetailKey = null;
  const mk = () => { const c = parse(`<div id="zycellContent">${G.renderZycellZycube()}</div>`).children[0];
    const d = makeDocument({ zycellContent: c }); d.querySelector = s2 => d.querySelectorAll(s2)[0] || null; return d; };
  let doc = mk(); const realDoc = globalThis.document; globalThis.document = doc;
  const shown = () => doc.querySelectorAll('[data-zydetail]')
    .filter(n => { const i = n.style && n.style.display;
      return i ? i !== 'none' : !/display:\s*none/.test(n.getAttribute('style') || ''); })
    .map(n => n.getAttribute('data-zydetail'));
  try {
    G.zyAttrHilite('zysphere', 0);
    ok(shown().join() === 'zysphere', 'hovering zysphere shows zysphere');
    G.game._zycellFocus = 'nav';
    G.zyAttrHilite(null, 0);                    // ← exactly what the tick does
    ok(shown().join() === 'zysphere',
       '★★★★ …and it SURVIVES the 1s tick · null now asks the remembered key before defaulting to the first');
    G.zyAttrHilite(null, 0); G.zyAttrHilite(null, 0);
    ok(shown().join() === 'zysphere', '★★★ three ticks later it is still there');
    globalThis.document = doc = mk();
    ok(shown().join() === 'zysphere',
       '★★★ and a FULL re-render opens on the remembered row · otherwise a count ticking down would reset it');
  } finally { globalThis.document = realDoc; }
  const src = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
  ok(/game\._zyDetailKey/.test(src),
     '★★ the pointed-at item lives on `game`, not in the DOM · the same rule this file already applies to '
   + 'the control sheet ("collapse state lives on game._zyCtrlOpen ... this panel re-renders on a 1s tick")');
}

H('★★★★ THE R.A.I.D. CARD LIVES IN THE PHONE NOW');
{
  //   Creator, 2026-09-24: "raid card not closing. also, it opens weird. it
  //   should open inside the zyphone UI, not a standalone poster... toggle
  //   open on clicking RAID item... leave it as blank placeholder for now."
  //
  // ★★★★ THE CLOSE BUG WAS STRUCTURAL. closeRaidCard() sits inside
  //   `if (game.posterViewOpen)` in the key handler, but openRaidCard() only
  //   ever set game.raidCardOpen — never posterViewOpen. The card was bolted
  //   onto the POSTER's close chain while opening through its own door, so
  //   B/Esc/Circle could not reach the close branch at all. Adding a key would
  //   have patched the symptom; living inside the phone means the phone's own
  //   back-out closes it and there is no second door to keep in step.
  const P4 = G.player;
  P4.items = { raidcard:1, potion:3 }; P4.raidCardGifted = true;
  G.game._zyRaidOpen = false; G.zycubeCloseCategory();
  const isCard = h => /R\.A\.I\.D\. CARD/.test(h);
  ok(!isCard(G.renderZycellZycube()), 'the bag opens on the grid');
  G.useZycubeItem('raidcard');
  ok(isCard(G.renderZycellZycube()) && G.game._zyRaidOpen === true,
     '★★★★ clicking the R.A.I.D. item opens the card INSIDE the panel');
  G.useZycubeItem('raidcard');
  ok(!isCard(G.renderZycellZycube()) && G.game._zyRaidOpen === false,
     '★★★★ …and clicking it again closes it · it TOGGLES, as asked');
  G.useZycubeItem('raidcard');
  G.zycellCyclePage(1);
  ok(G.game._zyRaidOpen === false,
     '★★★ leaving the bag leaves the sub-view · same reset the category and notebook section get, so returning never lands you somewhere you did not choose');
  // ★★★ it pops on Circle and LEFT like every other sub-view
  const src = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
  ok((src.match(/game\._zyRaidOpen = false; game\._zycellItemIdx = 0;/g) || []).length >= 2,
     '★★★ Circle AND Left both pop it · the innermost thing open is the thing they should close');
  // ★★★★ and the old poster can no longer open at all
  // ★★ COUNT CALL SITES, NOT OCCURRENCES. My first cut matched the string
  //   anywhere and counted the COMMENT that explains why the poster is dead —
  //   a check that fails because somebody documented the fix.
  const codeOnly = src.split('\n').filter(L => !/^\s*(\/\/|\*|\/\*)/.test(L)).join('\n');
  const callers = (codeOnly.match(/(?<!function )openRaidCard\(\)/g) || []).length;
  ok(callers === 0,
     `★★★★ openRaidCard has ${callers} call site(s) · the standalone poster is unreachable, so the doubled-text overlay cannot come back`);
}

H('★★★ THE CARD IS AN HONEST PLACEHOLDER');
{
  // ★★★ Creator: "leave it as blank placeholder for now." Filling it with the
  //   numbers the old poster showed would look finished and quietly become the
  //   spec. A placeholder that lies about being a placeholder is worse than an
  //   empty box.
  G.game._zyRaidOpen = true;
  const h = G.renderZycellRaidCard();
  ok((h.match(/border-bottom:1px dashed/g) || []).length === 10,
     '★★ ten labelled but EMPTY slots · the frame the live stats will fill');
  ok(!/PROF\. ELARION|YEAR 5|CADET|BONDED/.test(h),
     '★★★★ and not one invented value in them · nothing here can be mistaken for real data');
  ok(/data-zyitem="raid_back"/.test(h),
     '★★★ it has a reachable back control · a sub-view you can only leave with a key is a dead end on a mouse');
  ok(/Placeholder · this card will live-track your stats/.test(h),
     '★ and it SAYS it is a placeholder · so it is not mistaken for finished at a glance');
  G.game._zyRaidOpen = false;
}

H('★★★★ A FAIRY IS A FAE · one creature, one key');
{
  //   Creator, 2026-09-24: "we dont need fairy items. they are fae. I want the
  //   single blue fae to be the item icon for faes. 5 basic yellow faes can
  //   turn into a single blue faery that is why the icon looks different from
  //   the overworld asset bundle"
  // ★★★★ TWO KEYS FOR ONE CREATURE SPLIT ITS COUNT ACROSS TWO BAG SLOTS, which
  //   makes the 5:1 ladder unreadable — you could hold four fae and a fairy and
  //   be nowhere near a faery.
  ok(!G.INVENTORY_META.fairy, '★★★ `fairy` is out of INVENTORY_META');
  ok(!G.ZYCUBE_ART.fairy && !G.ZYCUBE_ICON.fairy, '★★ and out of the art and glyph tables');
  ok(!fs.existsSync(path.join(ROOT, 'assets/2D sprites/items/bag/fairy-drop.png')),
     '★★ its art file is deleted, not orphaned');
  ok(/fae-drop\.png/.test(G.zycubeArtFor('fae') || ''),
     '★★★ `fae` shows the BLUE faery · the overworld drop is a yellow fae and the bag icon shows what five of them become');
  // ★★★★ the stone-shatter drop must hand over a fae, not a retired key
  const src = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
  ok(!/player\.items\.fairy = \(player\.items\.fairy \|\| 0\) \+ 1/.test(src),
     '★★★★ the astralite-shatter drop no longer grants a retired item · it would have been uncollectable and invisible in the bag');
  // ★★★ and an existing save keeps what it collected
  const P5 = G.player;
  P5.items = { fae:2, fairy:3, potion:1 };
  const moved = G.migrateFairies();
  ok(moved === 3 && P5.items.fae === 5 && !('fairy' in P5.items),
     `★★★★ migrateFairies folds the old count in (${moved} moved → ${P5.items.fae} fae) · deleting the key without folding would confiscate what the player collected`);
  ok(G.migrateFairies() === 0, '★★ and re-running is a no-op · it cannot double-credit on a second load');
  // ★★★ RESTORE THE FIXTURE, DO NOT EMPTY IT. Second time this suite has been
  //   bitten by exactly this: an empty bag renders no slots, so the plate and
  //   cursor assertions below went red on working code — a test failing
  //   because an earlier test tidied up after itself.
  P5.items = { potion:5, ale:2, coins:1200, gem:14, zysphere:9, sapphire_sword:1, pearlbow:1,
    berry:23, fruit:8, scrap_metal:40, backpack:1, zycube:1, zphone:1, faenet:1, skateboard:1,
    astralite_1_1:3, astralite_2_4:1, moon_gem:2, life_seed:4, prismshard:1, tower_battery:2 };
}

H('★★★★ D-PAD NAV · no wrap, no sideways drift, L2/R2 switch panels');
{
  //   Creator, 2026-09-24: "fix the controller navigation of the items menu. no
  //   dpad wrapping. also, no horizontal scrolling when pressing down from the
  //   top bar. it should just go down. R2 L2 on the zycube panel switches the
  //   panel"
  const src = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
  const step = src.slice(src.indexOf('const _stepRow = (dir) =>'), src.indexOf('if (k === \'arrowup\')  { _stepRow(-1)'));
  // ★★★★ The list used to close the loop with `% units.length`, so DOWN on the
  //   last row teleported you to the top — on a grid that reads as the cursor
  //   vanishing, not as wrapping.
  // ★★ STRIP COMMENTS FIRST. The fix's own comment explains what it removed by
  //   naming it, so a raw scan finds `% units.length` in the explanation and
  //   reports the wrap as still present — second time a check of mine has read
  //   its own documentation as code.
  const stepCode = step.split('\n').filter(L => !/^\s*(\/\/|\*)/.test(L)).join('\n');
  ok(!/%\s*units\.length/.test(stepCode),
     '★★★★ the wrap is GONE · no `% units.length` closing the loop');
  ok(/uNext < 0 \|\| uNext >= units\.length/.test(step),
     '★★★ the edge answers and stops · the same rule LEFT/RIGHT have had inside a row since v0.95.980');
  // ★★★★ column must not carry from a 10-tab rail into a 5-wide grid
  // ★★ ASSERT THE COMPARISON, NOT THE NAME. My first cut matched the identifier
  //   `sameFamily`, which survives `const sameFamily = true` — the exact way
  //   this could be broken while reading as fixed.
  ok(/_fam\(_curRow\) === _fam\(U\.row\)/.test(stepCode),
     '★★★★ the column only carries between rows of the SAME family · rail-to-grid resets to 0, so DOWN from the top bar goes straight down instead of landing mid-row and dragging the view sideways');
  ok(/const col = \(sameFamily/.test(stepCode), '★★★ …and the column is chosen by that comparison');
  // ★★★ and the rail really is a different family from the grid rows
  const h = render(null);
  ok(/data-zyrow="zycube_tabs"/.test(h) && /data-zyrow="zycube_r0"/.test(h),
     '★★★ the rail is `zycube_tabs` and the grid is `zycube_r0..` · different families by name, which is what the reset keys on');
  // ★★ L2/R2
  ok(/k === 'l' \|\| k === 'q' \|\| k === 'shift'/.test(src),
     "★★★ L2 (BTN[6]='shift') now cycles the panel back · R2 (BTN[7]='i') already went forward, so the pair was half-wired and only one direction worked on a pad");
  ok((src.match(/k === 'shift'\)\{ zycellCyclePage\(-1\)/g) || []).length >= 2,
     '★★ wired at BOTH call sites · the phone has two, and fixing one leaves the other stale');
}

H('★★★ THE SLOT IS A UI-NATIVE PLATE, NOT A BARE BOX');
{
  const h = render(null);
  ok(/radial-gradient\(120% 90% at 50% 0%/.test(h), '★★ category-tinted top glow');
  ok(/inset 0 1px 0 rgba\(255,255,255,0\.14\)/.test(h), '★★ inset top highlight · the plate reads as recessed');
  ok(/cursor:grab/.test(h), '★ and the cursor advertises that it can be dragged');
}

H('★★★★ DRAG AND MOVE · order is global, the view is filtered');
{
  const P = G.player;
  P.items = { potion: 5, ale: 2, coins: 1200, berry: 9, zysphere: 3 };
  P.bagOrder = null;
  const base = G.zycubeSortKeys(Object.keys(P.items));
  ok(base.length === 5, `default order is alphabetical by label: ${base.join(' ')}`);
  // ★★★★ Dropping A on B must place A immediately BEFORE B. Reading both
  //   indices up front and splicing at the stale one is the classic
  //   move-in-array off-by-one: on a FORWARD drag every index past `from` has
  //   shifted left by one, so the item lands one slot PAST its target. This
  //   suite caught exactly that — [ale, berry, coins] dropping ale on coins
  //   gave [berry, coins, ale], the item jumping over the thing it was
  //   dropped on.
  const first = base[0], third = base[2];
  G.zycubeMoveItem(first, third);
  const after = G.zycubeSortKeys(Object.keys(P.items));
  ok(after.indexOf(first) === after.indexOf(third) - 1,
     `★★★★ ${first} landed immediately BEFORE ${third}, not after it · ${after.join(' ')}`);
  // ★★★ a move made in one drawer has to survive a trip through another
  G.zycubeOpenCategory('heal');
  const inTab = [...new Set([...G.renderZycellZycube().matchAll(/data-item="([a-z0-9_]+)"/g)].map(m => m[1]))];
  G.zycubeCloseCategory();
  const back = G.zycubeSortKeys(Object.keys(P.items)).filter(k => inTab.includes(k));
  ok(inTab.join() === back.join(),
     `★★★ the CONSUMABLES tab shows the same relative order as ALL (${inTab.join(' ')}) · bagOrder is global, not per-tab`);
  // ★★ a fresh pickup must not jump the queue
  P.items.fairy = 1;
  const withNew = G.zycubeSortKeys(Object.keys(P.items));
  ok(withNew[withNew.length - 1] === 'fairy',
     '★★ a newly picked-up item lands at the END · it must not barge into an order the player arranged');
  ok(/pointerdown/.test(fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8')),
     '★★★ drag uses POINTER events · native HTML5 drag does not fire on touch and fights the phone shell');
  const src = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
  ok(/Math\.hypot\(dx, dy\) < DEAD/.test(src),
     '★★★★ a 6px dead zone guards the tap · without it every press is a zero-distance drag and USING an item stops working');
  ok(/_zySwallow/.test(src),
     '★★★ and the click the browser fires after a drop is swallowed · otherwise dropping an item also USES it');
  ok(/bagOrder: player\.bagOrder \|\| null/.test(src),
     '★★ bagOrder is in the save · loadGame Object.assigns the snapshot, so the arrangement survives a reload');
  // ★★★ RESTORE THE FIXTURE, DO NOT JUST EMPTY IT. Clearing player.items here
  //   left the later sections rendering an empty bag, and the Astralite
  //   monogram check went red on working code — a test failing because an
  //   earlier test tidied up after itself.
  P.bagOrder = null;
  P.items = { potion:5, ale:2, coins:1200, gem:14, zysphere:9, sapphire_sword:1, pearlbow:1,
    berry:23, fruit:8, scrap_metal:40, backpack:1, zycube:1, zphone:1, faenet:1, skateboard:1,
    astralite_1_1:3, astralite_2_4:1, moon_gem:2, life_seed:4, prismshard:1, tower_battery:2 };
}

H('★★★ NATIVE ICONS NOW, ONE SEAM TO SWAP LATER');
{
  ok(G.zycubeIconFor('potion') === '🧪' && G.zycubeIconFor('coins') === '🪙', 'named items get their own glyph');
  ok(G.zycubeIconFor('totally_made_up_key') === '📦',
     '★★ an unknown key falls back to its CATEGORY icon · an item added tomorrow needs no edit here');
  // ★★★★ Astralites carry the game's own 2-4 character codes, not emoji.
  //   'Ax-1' at 23px is wider than the slot. The render detects a TEXT mark by
  //   the one thing no emoji has — a latin letter — rather than by length:
  //   '🗡️' is TWO code points (glyph + variation selector) and a length test
  //   would have shrunk half the weapons to monogram size.
  ok(G.zycubeIconFor('astralite_1_1') === 'Ax-1',
     '★★★ an Astralite reuses its own `symbol` · 63 of them covered by one branch, not 63 rows');
  const src = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
  ok(/const mono = \/\[A-Za-z\]\/\.test\(g\);/.test(src),
     '★★★★ text marks are detected by LATIN LETTER, not string length · variation selectors make length a lie');
  const withAstral = render('astral');
  ok(/Courier New/.test(withAstral) && /font-size:11px/.test(withAstral),
     '★★ and a 4-char code renders as a monogram at 11px, not an emoji at 23px');
}

H('★★★ THE CANVAS BAG STILL AGREES ABOUT WHERE YOU ARE');
{
  G.zycubeOpenCategory('heal');
  ok(G.zycubeCategoryRows().length > 0, 'category rows still build · the BAG reads these');
  ok(G.zycubeCloseCategory() === true, '★★★ closing a category still returns true · Circle/LEFT keep popping to ALL');
  ok(G.zycubeCloseCategory() === false,
     '★★★★ and returns FALSE at ALL · so Circle falls through to back out of the panel instead of trapping you');
  const src = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
  ok(/zycubeCatOpen && !_zycellOnZycubeTab\(\)/.test(src),
     '★★★ LEFT does not pop the drawer while the cursor is ON the rail · that guard fires before row nav, '
   + 'so the rail would have been walkable one way only');
  ok(/function _zycellOnZycubeTab/.test(src) && /_zycellContentItems\(\)\[game\._zycellItemIdx/.test(src),
     '★★ and it reads the SAME list the focus painter walks · "what is focused" gets one answer');
}

console.log(f ? `\n❌ ${f} failed` : '\n✅ rail + grid + detail pane · native glyphs · nothing on the rail is a dead stop · BAG untouched');
process.exit(f ? 1 : 0);
