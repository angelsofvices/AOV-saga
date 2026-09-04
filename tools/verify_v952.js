// v0.95.952 · the collar drop + the home-screen widgets.
const fs = require('fs');
const H = fs.readFileSync('rp7b.html', 'utf8');
let pass = 0, fail = 0;
const t = (n, f) => { try { f(); console.log('  ok   ' + n); pass++; }
                      catch (e) { console.log('  FAIL ' + n + ' · ' + e.message); fail++; } };
const ok = (c, m) => { if (!c) throw new Error(m); };

console.log('\n1 · the broken Shardshare is an object, not a number');
t('the art is on disk where the code points', () => {
  ok(/items\/shardshare-broken\.png/.test(H), 'the art is not referenced');
  ok(fs.existsSync('assets/2D sprites/items/shardshare-broken.png'), 'PNG missing from the assets tree');
});
t('it spawns as a SOLID prop with an X-collect', () => {
  const at = H.indexOf('function spawnShardshareBroken');
  ok(at > 0, 'no spawner · the chest still pockets it silently');
  const f = H.slice(at, at + 2600);
  ok(/footprint: \[\[0, 0\]\]/.test(f), 'not solid · this IS the collision the ask names');
  ok(/door: \[0, 0\]/.test(f), 'no X-collect');
  ok(/registerPropCollision\(prop\)/.test(f), 'collision never registered');
  ok(/unregisterPropCollision\(prop\)/.test(f), 'collision never released on pickup · it would block forever');
});
t('the drawn size preserves the measured aspect', () => {
  const f = H.slice(H.indexOf('function spawnShardshareBroken'), H.indexOf('function spawnShardshareBroken') + 2600);
  const m = f.match(/tileW: ([\d.]+), tileH: ([\d.]+) \* bbox\[3\] \/ bbox\[2\]/);
  ok(m, 'height is not derived from the bbox aspect · the collar would be stretched');
  ok(m[1] === m[2], `tileW ${m[1]} but the height scales by ${m[2]}`);
});
t('the chest pops it out, with a fallback that cannot eat it', () => {
  const at = H.indexOf("id: 'chest_shardshare'");
  const c = H.slice(at, at + 3000);
  ok(/spawnShardshareBroken\(chest\.tileX, chest\.tileY\)/.test(c), 'the chest does not pop it');
  // ★ there is exactly ONE Shardshare in the game.  A chest wedged against
  // terrain with nowhere walkable to drop it must not swallow the questline.
  ok(/if \(popped\)/.test(c) && /player\.items\.shardshare_broken = \(player\.items\.shardshare_broken \|\| 0\) \+ 1/.test(c),
     'no direct-to-bag fallback when there is nowhere to drop it');
});
t('an uncollected drop survives a reload', () => {
  ok(/function restoreShardshareDrop/.test(H), 'no restore · the questline dead-ends at an empty chest');
  const load = H.indexOf('function loadGame');
  ok(H.indexOf('restoreShardshareDrop()', load) > load, 'not called from loadGame');
  const r = H.slice(H.indexOf('function restoreShardshareDrop'), H.indexOf('function restoreShardshareDrop') + 900);
  ok(/_shardshareDropped/.test(r) && /_shardshareDropTaken/.test(r),
     'the two states are conflated · opened and collected are different facts');
  ok(/shardshareFixed/.test(r), 'a repaired collar would respawn as broken');
  ok(/_shardshareDropped:/.test(H) && /_shardshareDropTaken:/.test(H), 'the flags are never saved');
});

console.log('\n2 · the home screen is a widget grid');
t('the wrapper exists and refuses unknown targets', () => {
  ok(/function _zyWidget\(/.test(H), 'no wrapper');
  const f = H.slice(H.indexOf('function _zyWidget('), H.indexOf('function _zyWidget(') + 900);
  ok(/ZYCELL_PANELS\.includes\(page\)/.test(f), 'a typo in a page name would render a dead card');
  ok(/return html;/.test(f), 'unknown targets must render inert, not as a broken door');
});
t('every card is wrapped, and the clock is NOT', () => {
  const at = H.indexOf("grid-template-columns: 1fr 1.3fr");
  const g = H.slice(at - 900, at + 1400);
  ['rizerLevelCard','activeCard','status','inventory','credits','liveWorld','mission','map']
    .forEach(c => ok(new RegExp(`_zyWidget\\('[a-z]+',\\s*${c}`).test(g), `${c} is not a widget`));
  ok(/\$\{dateTime\}/.test(g) && !/_zyWidget\([^)]*dateTime/.test(g),
     'the clock was made clickable · there is no panel behind it');
});
t('the side-by-side pair keeps its flex sizing', () => {
  const at = H.indexOf("grid-template-columns: 1fr 1.3fr");
  const g = H.slice(at, at + 1400);
  ok(/_zyWidget\('zycube',\s*inventory,\s*true\)/.test(g) && /_zyWidget\('zycube',\s*credits,\s*true\)/.test(g),
     'INVENTORY/CREDITS share a flex row · without flex:1 the shell collapses them');
});

console.log('\n3 · the click actually navigates (run, do not read)');
t('_zyWidgetClick sets the page and repaints', () => {
  // extract just the pieces under test and run them against a fake DOM
  const src = H.match(/const ZYCELL_PANELS = \[[^\]]*\];/)[0]
    + '\nlet zycellPage = "home";\n'
    + H.slice(H.indexOf('function _zyWidgetClick'), H.indexOf('function _zyWidget(')) 
    + H.slice(H.indexOf('function _zyWidget('), H.indexOf('function _zySectionClick'))
    + '\nreturn { click: _zyWidgetClick, wrap: _zyWidget, page: () => zycellPage, painted: () => painted };';
  let painted = 0;
  const sandbox = new Function('game', 'playSFX', 'paintZycellNav', 'painted', src);
  const game = {};
  const api = sandbox(game, () => {}, () => { painted++; }, 0);
  // a wrapped card carries the target in a data attribute
  const html = api.wrap('faction', '<div>ACTIVE ZYREX</div>');
  const m = html.match(/data-zywidget="([a-z]+)"/);
  ok(m && m[1] === 'faction', 'the target is not carried on the element');
  ok(/cursor:pointer/.test(html), 'no affordance · it does not look tappable');
  // clicking it navigates
  api.click({ dataset: { zywidget: 'faction' } }, { stopPropagation(){} });
  ok(api.page() === 'faction', `click left the page on "${api.page()}"`);
  // and a bogus target is a no-op rather than a crash or a blank screen
  api.click({ dataset: { zywidget: 'nonsense' } }, { stopPropagation(){} });
  ok(api.page() === 'faction', 'an unknown target changed the page');
  api.click({ dataset: {} }, { stopPropagation(){} });
  ok(api.page() === 'faction', 'a widget with no target changed the page');
});

console.log(`\n${fail ? '✗' : '★'} ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
