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
  'ZYCUBE_ART','ZYCUBE_ART_ROOT','zycubeArtFor','zycubeSortKeys','zycubeMoveItem'] });
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
  ok(/data-zyitem="zytab_all"/.test(h), '★★★★ there IS an ALL tab · it is the null state the canvas BAG still needs');
  ok(/data-zyrow="zycube_tabs"/.test(h),
     '★★ the rail is ONE focus row · so the cursor walks it sideways instead of treating 10 tabs as 10 list stops');
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
  // ★ bound raised 14k -> 22k at v0.99.20 when drag-and-move landed inside
  //   the panel. It is a SANITY bound on the slice, not a budget on the
  //   function — its only job is to catch a slice that ran off the end.
  ok(body.length > 4000 && body.length < 22000, `  the panel body is ${body.length} chars · one function, not half the file`);
  ok(!/zycellCyclePage/.test(body),
     '★★★ the panel does NOT rebind L/R · they still cycle phone panels, and the chips only label that');
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
  ok(/_zySection\(`◈ ZYCUBE[^`]*`, body, accent, true\)/.test(
       fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8')),
     '★★ fill mode is OPT-IN · passed only by this panel, a no-op on the other ten');
}

H('★★★★ REAL ART · 72 keyed icons, glyph still underneath as the fallback');
{
  //   Creator, 2026-09-23: "use them as their bag item icon. make a UI native
  //   background for the icon and put the image of the item chromakeyed."
  const man = G.ZYCUBE_ART;
  ok(Object.keys(man).length === 72, `ZYCUBE_ART carries ${Object.keys(man).length} entries`);
  const missing = Object.entries(man)
    .filter(([, f]) => !fs.existsSync(path.join(ROOT, 'assets/2D sprites/items/bag', f)));
  ok(!missing.length,
     `★★★★ every manifest entry resolves to a real file${missing.length ? ' · MISSING: ' + missing.slice(0,4).map(m=>m[1]).join(', ') : ''}`);
  const dir = fs.readdirSync(path.join(ROOT, 'assets/2D sprites/items/bag')).filter(f => /\.png$/.test(f));
  const named = new Set(Object.values(man));
  ok(dir.every(f => named.has(f)),
     `★★ and no imported file is orphaned · ${dir.length} on disk, all named by the manifest`);
  const h = render(null);
  ok(/<img src="assets\/2D%20sprites\/items\/bag\//.test(h), '★★★ slots render the art');
  ok(/onerror="this\.style\.display='none'"/.test(h),
     "★★★★ …with onerror hiding the img · a key whose PNG is not in yet degrades to its emoji instead of an empty slot");
  ok(/image-rendering:pixelated/.test(h), '★★ pixelated · these are pixel-art renders, not photos');
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
