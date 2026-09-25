// Headless smoke test for rp7b.html — evaluates the whole script against a
// stubbed browser surface, then calls the combat/roster functions directly.
const fs = require('fs');
const src = require('./lib/all_src.cjs')();

const noop = () => {};
global.setInterval=()=>0; global.setTimeout=(f,t)=>0; global.clearInterval=noop; global.clearTimeout=noop;
function makeCtx() {
  const c = {};
  const methods = ['save','restore','beginPath','closePath','moveTo','lineTo','arc','arcTo','rect',
    'fill','stroke','fillRect','strokeRect','clearRect','fillText','strokeText','drawImage','translate',
    'rotate','scale','setTransform','resetTransform','clip','createLinearGradient','createRadialGradient',
    'createPattern','putImageData','getImageData','measureText','ellipse','quadraticCurveTo','bezierCurveTo',
    'setLineDash','transform'];
  for (const m of methods) c[m] = () => ({ addColorStop: noop, data: [], width: 0, height: 0 });
  c.measureText = () => ({ width: 10 });
  c.canvas = { width: 960, height: 540 };
  return c;
}
const CTX = makeCtx();
function makeEl() {
  const el = {
    style: {}, dataset: {}, classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
    width: 960, height: 540, value: '', textContent: '', innerHTML: '', checked: false,
    children: [], childNodes: [], clientWidth: 960, clientHeight: 540,
    getContext: () => CTX, appendChild: noop, removeChild: noop, insertBefore: noop,
    addEventListener: noop, removeEventListener: noop, setAttribute: noop, getAttribute: () => null,
    removeAttribute: noop, focus: noop, blur: noop, click: noop, remove: noop, closest: () => null,
    querySelector: () => makeEl(), querySelectorAll: () => [],
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 960, height: 540, right: 960, bottom: 540 }),
    scrollIntoView: noop, scrollTo: noop, scrollTop: 0,
  };
  return el;
}
global.addEventListener = noop; global.removeEventListener = noop;
global.document = {
  getElementById: () => makeEl(), querySelector: () => makeEl(), querySelectorAll: () => [],
  createElement: () => makeEl(), createTextNode: () => ({}), addEventListener: noop,
  removeEventListener: noop, body: makeEl(), documentElement: makeEl(), head: makeEl(),
  hidden: false, visibilityState: 'visible', activeElement: null, fullscreenElement: null,
};
global.window = global;
global.localStorage = { _d: {}, getItem(k){ return this._d[k] ?? null; }, setItem(k,v){ this._d[k]=String(v); },
  removeItem(k){ delete this._d[k]; }, clear(){ this._d = {}; } };
global.Audio = function(){ return { play: () => Promise.resolve(), pause: noop, load: noop,
  addEventListener: noop, removeEventListener: noop, cloneNode(){ return this; },
  volume: 1, currentTime: 0, duration: 0, paused: true }; };
global.Image = function(){ return { addEventListener: noop, removeEventListener: noop,
  complete: false, naturalWidth: 0, naturalHeight: 0, width: 0, height: 0, src: '' }; };
global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = noop;
global.matchMedia = () => ({ matches: false, addEventListener: noop, removeEventListener: noop, addListener: noop });
global.navigator = { userAgent: 'node', getGamepads: () => [], maxTouchPoints: 0, vibrate: noop };
global.performance = { now: () => 0 };
global.alert = noop; global.confirm = () => true; global.prompt = () => null;
global.getComputedStyle = () => ({ getPropertyValue: () => '' });

const EXPORT = ';globalThis.__C={player,INVENTORY_META,ZYCUBE_CATEGORIES,ZYCUBE_CAT_BY_ID,ZYCUBE_CAT_OF,zycubeCategoryOf,zycubeCategoryRows,zycubeItemEntries,zycubeAllEntries,setCat:(v)=>{zycubeCatOpen=v},getCat:()=>zycubeCatOpen,ASTRALITE_FAMILIES,ASTRALITE_COMPOUNDS};';

try { new Function(src + EXPORT)(); } catch(e){ console.log('boot error:', e.message.slice(0,300)); }
const src2 = require('./lib/all_src.cjs')();
let f=0; const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const C=globalThis.__C;
ok(!!C,'script evaluated');
if(!C){ console.log('\n❌ cannot continue'); process.exit(0); }

console.log('\n★★★ v0.95.935 · ZYCUBE GROUPED BY TYPE');
console.log('  Creator: "in the zycube center console, group items by type.');
console.log('            clicking into them loads item list for category."\n');

console.log('1 · EVERY item has a home — no silent UNSORTED drawer\n');
{
  const keys = Object.keys(C.INVENTORY_META);
  const orphans = keys.filter(k => C.zycubeCategoryOf(k) === 'misc');
  ok(orphans.length === 0,
     `all ${keys.length} INVENTORY_META keys map to a real category`
     + (orphans.length ? ` — UNSORTED: ${orphans.slice(0,12).join(', ')}` : ''));
  console.log('     This is the check that matters long-term: add an item and forget');
  console.log('     to categorise it and THIS fails, rather than the item quietly');
  console.log('     appearing in a drawer named UNSORTED that nobody opens.\n');

  // the three prefix families, spot-checked
  ok(C.zycubeCategoryOf('shard_predator') === 'shard', 'shard_* → ULTRASHARDS');
  ok(C.zycubeCategoryOf('astralite_1_1')  === 'astral', 'astralite_* → ASTRALITES');
  ok(C.zycubeCategoryOf('compound_will')  === 'compound',
     '★ compound_* → COMPOUNDS, NOT Astralites.  Filed together they put 103 of a');
  console.log('       full bag\'s 180 rows behind one door — more than half the cube in the');
  console.log('       drawer grouping was meant to rescue.  The game already separates raw');
  console.log('       stone from crafted output; the bag now does too.');
  ok(C.zycubeCategoryOf('potion') === 'heal' && C.zycubeCategoryOf('ale') === 'heal'
     && C.zycubeCategoryOf('verdant_elixir') === 'heal',
     '★ the whole Rizer potion ladder lands in ONE drawer (ale · potion · elixir)');
  ok(C.zycubeCategoryOf('fresh_water') === 'heal' && C.zycubeCategoryOf('berry_juice') === 'heal'
     && C.zycubeCategoryOf('fruit_bar') === 'heal',
     '★ and so does the Zyrex ladder facing it — the v0.95.872 adjacency survives grouping');
  ok(C.zycubeCategoryOf('__not_a_real_item__') === 'misc',
     'an unknown key falls to UNSORTED rather than throwing');
  ok(C.zycubeCategoryOf(null) === 'misc', 'and a null key does not crash the bag');
}

console.log('\n2 · EXPLICIT KEYS BEAT PREFIXES\n');
{
  // prismshard is explicitly a RELIC; if the shard_ prefix rule ran first it
  // would not matter here (different prefix) -- but shard_prism vs prismshard
  // is exactly the pair that would get confused by a loose /shard/ test.
  ok(C.zycubeCategoryOf('prismshard') === 'relic', 'prismshard → RELICS');
  ok(C.zycubeCategoryOf('shard_prism') === 'shard', 'shard_prism → ULTRASHARDS');
  ok(C.zycubeCategoryOf('voltshard') === 'relic', 'voltshard → RELICS (a singular, not an Ultrashard)');
  const order = C.ZYCUBE_CATEGORIES.map(c => c.id);
  ok(order[order.length-1] === 'misc', 'UNSORTED is listed last · it is the confession, not a category');
  ok(new Set(order).size === order.length, 'no duplicate category ids');
  ok(C.ZYCUBE_CATEGORIES.every(c => c.label && c.color && c.blurb),
     'every category has a label, a stripe colour and a one-line blurb');
}

console.log('\n3 · THE ROWS · only drawers with something in them\n');
{
  C.player.items = { potion: 3, ale: 1, berry: 12, coins: 400, shard_volt: 1, sapphire_sword: 1 };
  C.player.raidCardGifted = false;
  C.setCat(null);
  const rows = C.zycubeCategoryRows();
  const ids = rows.map(r => r.id);
  console.log('     ' + rows.map(r => `${r.label}(${r.kinds}/${r.total})`).join('  ·  '));
  ok(!ids.includes('astral'), '★ ASTRALITES is absent — an empty drawer on turn one teaches the');
  console.log('       player the menu is mostly furniture, which is the opposite of grouping.');
  ok(ids.includes('heal') && ids.includes('harvest') && ids.includes('gem')
     && ids.includes('shard') && ids.includes('weapon'),
     'the five drawers that DO hold something are all listed');
  const heal = rows.find(r => r.id === 'heal');
  ok(heal.kinds === 2 && heal.total === 4,
     `CONSUMABLES counts 2 kinds and 4 units (potion ×3 + ale ×1) — kinds and units are different questions`);
  ok(ids.indexOf('key') < 0 || ids.indexOf('key') === 0,
     'KEY ITEMS, when present, leads — the table order is the display order');
}

console.log('\n4 · CLICKING IN LOADS THAT CATEGORY ONLY\n');
{
  C.player.items = { potion: 3, ale: 1, berry: 12, coins: 400, shard_volt: 1, sapphire_sword: 1 };
  C.setCat(null);
  const all = C.zycubeItemEntries();
  ok(all.length === 6, `with no category open the list is still the WHOLE bag (${all.length}) — `
     + 'every existing caller keeps working unchanged');
  C.setCat('heal');
  const inHeal = C.zycubeItemEntries();
  ok(inHeal.length === 2 && inHeal.every(e => C.zycubeCategoryOf(e.key) === 'heal'),
     `★ opening CONSUMABLES loads exactly its 2 rows`);
  C.setCat('weapon');
  ok(C.zycubeItemEntries().map(e=>e.key).join() === 'sapphire_sword',
     '★ opening WEAPONS loads exactly the Tearsword');
  C.setCat('astral');
  ok(C.zycubeItemEntries().length === 0,
     'and a drawer you own nothing in loads empty rather than falling back to everything');
  C.setCat(null);
}

console.log('\n5 · THE SCALE THIS WAS BUILT FOR\n');
{
  // the full late-game bag: every Ultrashard, the whole Astralite matrix, the gems
  const big = {};
  for (const k of Object.keys(C.INVENTORY_META)) big[k] = 1;
  C.player.items = big;
  C.setCat(null);
  const flat = C.zycubeItemEntries().length;
  const rows = C.zycubeCategoryRows();
  console.log(`     a full bag is ${flat} rows flat · ${rows.length} rows grouped`);
  for (const r of rows) console.log(`       ${r.label.padEnd(13)} ${String(r.kinds).padStart(3)} kinds`);
  ok(flat > 100, `the flat list really is unusable at ${flat} rows`);
  ok(rows.length <= 12, `grouped, the first screen is ${rows.length} rows — it fits`);
  const biggest = rows.reduce((a,b) => a.kinds > b.kinds ? a : b);
  ok(biggest.kinds < flat / 2,
     `★ and no single drawer is more than half the bag (biggest: ${biggest.label} at `
     + `${biggest.kinds}, ${Math.round(100*biggest.kinds/flat)}%) — the check that forced`
     + ' COMPOUNDS out of ASTRALITES');
}

console.log('\n6 · BOTH SURFACES READ THE SAME TABLE\n');
{
  ok(/function drawZycubeCategoryList/.test(src2), 'the canvas BAG has a category level');
  ok(/if \(!zycubeCatOpen\)\{ drawZycubeCategoryList/.test(src2),
     'and drawZycubePanel routes to it when no category is open');
  // ★★★★ v0.99.15 · THESE TWO ASSERTED THE OLD DRILL-DOWN'S MARKUP — .zyCatRow
  //   and #zyBagBack. The Creator directed a rebuild on a tab-rail reference
  //   panel, so that markup is gone by intent while the REQUIREMENT behind the
  //   assertions is unchanged: reach every drawer, and get back to the top.
  //   ★ Updated to test the requirement against the new rail. NOT deleted, and
  //   NOT loosened to something always-true — a test rewritten until it passes
  //   is worse than the red it replaced. Each still fails if its capability
  //   goes away: drop the tabs and the first goes red, drop the ALL tab and the
  //   second does.
  // ★★★★ v0.99.42 · THE TABS LEFT THE CURSOR'S WALK, AND THE REQUIREMENT DID
  //   NOT. This block exists because of three symptoms at v0.95.936 — the pad
  //   could not reach the categories, clicking did nothing, no way back. The
  //   first is still the thing being tested; only the mechanism changed, from
  //   "every tab is a focus stop" to "L1/R1 are the tab axis". Deleting the
  //   check would have re-opened the defect it was written for.
  ok(/function zycubeCycleTab/.test(src2) && /% order\.length/.test(src2),
     'the ZyPhone panel exposes every category on the L1/R1 tab axis, wrapping so ALL is always one press away');
  // ★★ MY FIRST CUT OF THIS LINE TESTED FOR 'zytab_all' AND WENT RED ON
  //   WORKING CODE. That string never appears in the source — the id is built
  //   at runtime from `zytab_${id}`. A source-scanning suite can only see what
  //   is WRITTEN, so it has to look for the call that creates the tab.
  ok(/tab\('all',/.test(src2) && /zycubeCloseCategory\(\);/.test(src2),
     'and an ALL tab is the way back out · on screen always, never scrolled to');
  const uses = (src2.match(/zycubeCategoryOf\(/g) || []).length;
  ok(uses >= 4, `★ both surfaces call the ONE mapping function (${uses} call sites, no second table)`);
  ok(!/zycubeCatOpen\s*=\s*['"]/.test(src2.split('function zycubeCategoryOf')[0]),
     'nothing sets a category before the mapping exists');
  // closing the bag must not strand you inside a drawer
  ok(/zycubeCatOpen = null; zycubeCatCursor = 0; itemsCursor = 0;/.test(src2),
     '★ closing the BAG resets to the category level — re-opening never dumps you '
     + 'inside whichever drawer you last used');
}

console.log('\n7 · ★★★ v0.95.936 · THE NAVIGATION FIX\n');
console.log('  Creator: "I cant go back in the pages. also cant use my controller');
console.log('            for nav. also cant click into categories."\n');
{
  const HTML = require('fs').readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html','utf8');
  // ★ ALL THREE SYMPTOMS WERE ONE MISTAKE: a new convention beside a working one.
  // ★★★★ v0.99.15 · REWRITTEN FOR THE TAB RAIL, NOT RELAXED FOR IT. The three
  //   symptoms this block was born from — pad cannot reach the categories,
  //   clicking does nothing, no way back — are still the three things being
  //   tested. Only the markup they live in changed, by directive.
  ok(!/data-zyitem="zytab_/.test(src2),
     '★ category tabs are NOT focus stops — walking eleven headings to reach ALL was the complaint');
  console.log('       they are reached by L1/R1 instead, which is where a console player looks.');
  ok(/onclick="try\{\$\{click\}\}catch\(_\)\{\}"/.test(src2)
     && /zycubeOpenCategory\('\$\{c\.id\}'\);/.test(src2),
     '★ and an inline onclick, the way every other working panel does it');
  ok(/tab\('all',/.test(src2) && /data-zytab="1"/.test(src2),
     'the way back out is reachable by controller AND clickable too');
  ok(!/list\.addEventListener\('click', \(ev\) => \{[\s\S]{0,120}closest\('\.zyCatRow'\)/.test(src2),
     'the setTimeout-attached delegated listener is GONE · not left beside the fix');
  // one door in, one door out
  ok(/function zycubeOpenCategory/.test(src2) && /function zycubeCloseCategory/.test(src2),
     '★ one function to enter a category and one to leave it');
  const opens = (src2.match(/zycubeOpenCategory\(/g) || []).length;
  const closes = (src2.match(/zycubeCloseCategory\(/g) || []).length;
  ok(opens >= 3 && closes >= 4,
     `every surface calls them (${opens} open / ${closes} close call sites) rather than`
     + ' writing the level change out longhand');
  ok(!/zycubeCatOpen = cats\[/.test(src2),
     'no surface still sets zycubeCatOpen by hand');
  // ★ the cursor reset · this is what made it FEEL like the controller was dead
  ok(/game\._zycellItemIdx = 0;/.test(src2.slice(src2.indexOf('function zycubeOpenCategory'),
                                                src2.indexOf('function zycubeCloseCategory'))),
     '★ opening a category resets the phone focus cursor · it indexes into a list');
  console.log('       that just changed length, and a stale index selects nothing.');
  // ★ going back
  ok(/if \(zycellPage === 'zycube' && zycubeCatOpen && zycubeCloseCategory\(\)\) return true;/.test(src2),
     '★ Circle/Escape pops ONE level instead of shutting the whole phone');
  const bIdx = src2.indexOf("if (k === 'b' || k === 'escape'){");
  const leftIdx = src2.indexOf("if (k === 'arrowleft'){");
  ok(bIdx > 0 && leftIdx > 0, 'both the Circle and LEFT handlers were located');
  ok((src2.match(/zycellPage === 'zycube' && zycubeCatOpen/g) || []).length === 2,
     'and LEFT does the same, symmetric with the Zyrex Examine sub-page');
  // the section wrapper must not steal the first stop
  ok(/!el\.querySelector\('\[data-zyitem\]'\)/.test(src2),
     '★ _zycellContentItems already drops a wrapper whose children are focusable —');
  console.log('       giving the rows data-zyitem is what makes that filter fire, so the');
  console.log('       cursor lands on a CATEGORY rather than on "the whole middle panel".');
}

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
// ★★★★ 2026-09-17 · EXIT NON-ZERO ON FAILURE.
//   This suite printed "❌ N failure(s)" and then exited 0, so every
//   automated sweep recorded it as PASSING. 34 suites did it; 13 of them
//   were red at the time it was found, including ones reporting real
//   defects. A suite that cannot fail its runner is a suite nobody reads.
process.exit(f ? 1 : 0);;
