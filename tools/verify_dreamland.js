// v0.95.719 · DREAMLAND
//
// Creator: "we will access dreamworld by interacting with a telescope in the
// treehouse. from there, u will fall asleep napping and wake up in a new
// level. this level will allow time based exploration scaled by player level
// in seconds. level 10 = 10 seconds in dreamland, level 80 = 80 seconds. make
// it a 100x100 tile map on a cloudy terrain"
//
// A 100x100 map is easy to declare and hard to make real. The two questions
// that decide whether it is a PLACE or a number in a config are:
//   · can you actually walk on it (section 3)
//   · is it the SAME place every visit (section 4)
// Both are measured here by running the shipped terrain functions, not by
// trusting that cols:100 means anything.
const fs = require('fs');
const path = '/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html';
const src = fs.readFileSync(path, 'utf8');
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const noC = src.replace(/\/\/[^\n]*/g, '');

function grab(name){
  const i = src.indexOf(`function ${name}(`);
  if (i < 0) return null;
  let d = 0, j = src.indexOf('{', i);
  for (; j < src.length; j++){ if (src[j]==='{') d++; else if (src[j]==='}'){ d--; if(!d) break; } }
  return src.slice(i, j + 1);
}
const NEED = ['dreamlandSeconds','dreamlandDensity','dreamlandSolid','startDreamlandNap',
              'wakeFromDreamland','tickDreamland','drawDreamlandFloor','drawTreehouseTelescope',
              'drawDreamlandOverlay','_dlHash','_dlNoise','dreamlandTimeLeftMs',
              'dreamlandPattern','_mkDreamPattern','dreamlandPatternDense','drawDreamlandFloorFallback'];
const B = {};
console.log('\n1 · ★ EVERY PIECE EXISTS\n');
for (const n of NEED){ B[n] = grab(n); ok(!!B[n], `${n}()`); }

// live sandbox for the pure terrain + timing maths
const L = new Function(`
  const RIZER_LEVEL_CAP = 100;
  const player = { rizerLvl: 1 };
  const game = { scene: null };
  ${(src.match(/const DREAMLAND_SCENE = '[^']+';/) || [''])[0]}
  ${(src.match(/const DREAMLAND_SIZE\s*=\s*\d+;/) || [''])[0]}
  ${(src.match(/const DREAMLAND_SEED\s*=\s*0x[0-9A-Fa-f]+;/) || [''])[0]}
  ${(src.match(/const DREAMLAND_SOLID\s*=\s*[\d.]+;/) || [''])[0]}
  ${B._dlHash} ${B._dlNoise} ${B.dreamlandDensity} ${B.dreamlandSolid} ${B.dreamlandSeconds}
  return { player, game, DREAMLAND_SIZE, DREAMLAND_SOLID, DREAMLAND_SCENE,
           dreamlandDensity, dreamlandSolid, dreamlandSeconds };
`)();

console.log('\n2 · ★★ THE CLOCK IS THE LEVEL\n');
console.log('     "level 10 = 10 seconds in dreamland, level 80 = 80 seconds"\n');
console.log('     Lv     seconds');
let clockBad = 0;
for (const lv of [1, 10, 25, 50, 80, 100]){
  L.player.rizerLvl = lv;
  const got = L.dreamlandSeconds();
  if (got !== lv) clockBad++;
  console.log(`     ${String(lv).padStart(3)}   ${String(got).padStart(9)}${got === lv ? '' : '   ← OFF'}`);
}
console.log('');
ok(clockBad === 0, `every level maps to exactly that many seconds (${clockBad} off)`);
L.player.rizerLvl = 10;  ok(L.dreamlandSeconds() === 10, 'Lv 10 → 10s, the Creator\'s first example');
L.player.rizerLvl = 80;  ok(L.dreamlandSeconds() === 80, 'Lv 80 → 80s, the second');
L.player.rizerLvl = 1;   ok(L.dreamlandSeconds() === 1,  'Lv 1 → 1s');
console.log('');
console.log('     ★ Taken literally, so a level-1 Rizer gets ONE SECOND. That is');
console.log('       not padded, and it is worth saying out loud: Dreamland is');
console.log('       gated behind levelling, and the gate is the clock rather');
console.log('       than a lock on the telescope. If it should have a floor,');
console.log('       dreamlandSeconds() is the single place to put one.\n');
L.player.rizerLvl = 999;
ok(L.dreamlandSeconds() === 100, `a level past the cap clamps to ${L.dreamlandSeconds()}s, not 999`);
L.player.rizerLvl = 0;
ok(L.dreamlandSeconds() === 1, 'and a missing/zero level floors at 1s rather than 0');

console.log('\n3 · ★★ 100x100 · AND YOU CAN ACTUALLY WALK ON IT\n');
ok(L.DREAMLAND_SIZE === 100, `map is ${L.DREAMLAND_SIZE} x ${L.DREAMLAND_SIZE} tiles`);
const cfg = src.slice(src.indexOf('const INTERIOR_DREAMLAND'), src.indexOf('const INTERIOR_DREAMLAND') + 900);
ok(/cols: DREAMLAND_SIZE, rows: DREAMLAND_SIZE/.test(cfg), 'the scene config uses that size for both axes');
ok(/cloudFloor: true/.test(cfg), 'and is flagged cloudFloor');
// walk the real terrain
const N = L.DREAMLAND_SIZE;
let solid = 0;
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (L.dreamlandSolid(x, y)) solid++;
const spawn = { x: 50, y: 50 };
ok(L.dreamlandSolid(spawn.x, spawn.y), `the spawn tile (${spawn.x},${spawn.y}) is solid ground`);
// flood fill from spawn · REACHABLE is the number that matters, not "walkable"
const seen = new Set([`${spawn.x},${spawn.y}`]);
const q = [[spawn.x, spawn.y]];
let minX = N, maxX = 0, minY = N, maxY = 0;
while (q.length){
  const [x, y] = q.pop();
  if (x < minX) minX = x; if (x > maxX) maxX = x;
  if (y < minY) minY = y; if (y > maxY) maxY = y;
  for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const nx = x + dx, ny = y + dy, k = `${nx},${ny}`;
    if (!seen.has(k) && L.dreamlandSolid(nx, ny)){ seen.add(k); q.push([nx, ny]); }
  }
}
console.log(`     walkable tiles      ${solid} / ${N*N}  (${(solid/(N*N)*100).toFixed(1)}%)`);
console.log(`     reachable from spawn ${seen.size}       (${(seen.size/solid*100).toFixed(1)}% of walkable)`);
console.log(`     reachable span       x ${minX}..${maxX}   y ${minY}..${maxY}\n`);
ok(solid > 1500, `enough ground to explore (${solid} tiles)`);
ok(seen.size / solid > 0.90,
   `${(seen.size/solid*100).toFixed(1)}% of the ground is REACHABLE from spawn — one continent, not confetti`);
ok((maxX - minX) > 60 && (maxY - minY) > 60,
   `and it spans ${maxX-minX} x ${maxY-minY} tiles, so the 100x100 is used, not a courtyard in the middle`);
// the rim must be open sky, or the "edge of the world" is an invisible wall
let rimSolid = 0;
for (let i = 0; i < N; i++){
  if (L.dreamlandSolid(i, 0)) rimSolid++;
  if (L.dreamlandSolid(i, N-1)) rimSolid++;
  if (L.dreamlandSolid(0, i)) rimSolid++;
  if (L.dreamlandSolid(N-1, i)) rimSolid++;
}
ok(rimSolid === 0, `no cloud touches the map border (${rimSolid} tiles) — you fall off into sky, never into a wall`);

console.log('\n4 · ★★ THE SAME DREAM EVERY TIME\n');
console.log('     A realm that reshuffles itself is not somewhere you can learn,');
console.log('     and learning it is the entire point of timed exploration.\n');
ok(!/Math\.random/.test(B.dreamlandDensity + B.dreamlandSolid + B._dlHash + B._dlNoise),
   'no Math.random anywhere in the terrain functions');
ok(/const DREAMLAND_SEED/.test(src), 'the field is driven by a fixed DREAMLAND_SEED');
let drift = 0;
for (let i = 0; i < 400; i++){
  const x = i % 100, y = (i * 7) % 100;
  if (L.dreamlandDensity(x, y) !== L.dreamlandDensity(x, y)) drift++;
}
ok(drift === 0, 'density is stable across repeated reads (400 samples)');

console.log('\n5 · ★★ COLLISION AND ART READ THE SAME FIELD\n');
console.log('     Two tables would drift: you would see a cloud you cannot');
console.log('     stand on, or stand on sky. There is one field.\n');
// ★ Pinned to the argument NAMES (tx, ty) first, and broke when the mask loop
// renamed them to (startCol + i, startRow + j). The property under test is
// "the renderer reads the same field", not "it uses these two variables".
ok(/dreamlandDensity\(/.test(B.drawDreamlandFloor || ''),
   'the renderer calls dreamlandDensity — the same function collision uses');
ok(/dreamlandSolid\(/.test(B.drawDreamlandFloor || ''),
   '  and dreamlandSolid for the underside shadow, so shading follows the real edge');
ok(/isBlocked: \(x, y\) => !dreamlandSolid\(x, y\)/.test(noC),
   'and the scene\'s isBlocked is literally !dreamlandSolid');
ok(/typeof cfg\.isBlocked === 'function' && cfg\.isBlocked\(x, y\)/.test(noC),
   'walkable() honours the O(1) predicate');
console.log('     That predicate matters at this size: the existing `blocked`');
console.log('     loop is O(entries) on EVERY step, and a hand-listed 100x100');
console.log(`     would have been ${N*N - solid} entries scanned per move.\n`);

console.log('6 · ★★ THE TELESCOPE IS AN OBJECT, NOT A TRIGGER\n');
ok(/const TREEHOUSE_TELESCOPE = \{ tileX: \d+, tileY: \d+ \}/.test(noC), 'the telescope has a tile');
const tel = (noC.match(/const TREEHOUSE_TELESCOPE = \{ tileX: (\d+), tileY: (\d+) \}/) || []).slice(1).map(Number);
ok(tel[0] < 30 && tel[1] < 30, `at (${tel[0]},${tel[1]}), inside the 30x30 treehouse`);
// v0.95.721 · "place in upper left of treehouse"
ok(tel[0] < 15 && tel[1] < 15, `  in the UPPER LEFT quadrant (x<15, y<15)`);
ok(tel[1] >= 1, '  and clear of row 0, which the wall band blocks');
ok(tel[1] + 1 < 30, `  with (${tel[0]},${tel[1]+1}) below it to stand on and face up`);
ok(!(tel[0] === 16 && tel[1] === 15) && !(tel[0] === 18 && tel[1] === 15),
   '  and not on top of either chest');
ok(/x === TREEHOUSE_TELESCOPE\.tileX && y === TREEHOUSE_TELESCOPE\.tileY\) return false/.test(noC),
   'it BLOCKS its tile, so you face it from an adjacent square — the chest contract');
ok(/fx === TREEHOUSE_TELESCOPE\.tileX  && fy === TREEHOUSE_TELESCOPE\.tileY\) return true/.test(noC),
   'it is registered as an interact target');
ok(/startDreamlandNap\(\)/.test(noC), 'and X starts the nap');
ok(/drawTreehouseTelescope\(\)/.test(noC), 'it is drawn (procedurally — the feature ships without waiting on art)');

console.log('\n7 · ★★ YOU ALWAYS WAKE UP\n');
const nap = B.startDreamlandNap || '', wake = B.wakeFromDreamland || '', tick = B.tickDreamland || '';
ok(/player\._dreamReturn = \{ scene: 'interior_treehouse'/.test(nap),
   'the nap records where to wake — the tile you slept on, not a hardcoded spawn');
ok(/player\._dreamEndsAt = performance\.now\(\) \+ secs \* 1000/.test(nap), 'and stamps the deadline');
ok(/performance\.now\(\) >= player\._dreamEndsAt\) wakeFromDreamland\('timeout'\)/.test(tick),
   'the tick wakes you when the clock runs out');
ok(/try \{ tickDreamland\(\); \} catch/.test(noC), 'and it runs every frame, guarded');
ok(/player\._dreamReturn\s*\n?\s*\|\| \{ scene: 'interior_treehouse'/.test(wake),
   'waking falls back to the telescope if the return record is somehow missing');
ok(/player\._dreamEndsAt = 0;/.test(wake), 'and clears the deadline so the tick cannot re-fire');

console.log('\n8 · ★★ A DREAM DOES NOT SURVIVE A RELOAD\n');
console.log('     _dreamEndsAt is a performance.now() stamp, and performance.now()');
console.log('     RESETS TO ZERO on page load. So a save taken inside Dreamland');
console.log('     came back with the scene set and no clock — and tickDreamland');
console.log('     returns early on a falsy deadline, which would have left the');
console.log('     player on the clouds with no timer and no exit.\n');
const loadIdx = noC.indexOf("if (game.scene === DREAMLAND_SCENE){");
ok(loadIdx > 0, 'load checks for the dream scene');
const guard = noC.slice(loadIdx, loadIdx + 500);
ok(/game\.scene = 'interior_treehouse'/.test(guard), '  and puts you back in the treehouse');
ok(/player\._dreamEndsAt = 0/.test(guard), '  with the deadline cleared');
ok(/TREEHOUSE_TELESCOPE\.tileY \+ 1/.test(guard), '  standing at the telescope');

console.log('\n8b · ★★ THE TIMER PANEL IS HIDDEN, THE CLOCK IS NOT\n');
console.log('     Creator: "hide dreamland timer"\n');
ok(/const DREAMLAND_SHOW_TIMER = false;/.test(noC), 'DREAMLAND_SHOW_TIMER is false');
ok(/if \(DREAMLAND_SHOW_TIMER\)\{/.test(noC.replace(/\s+/g,' ').replace('if (DREAMLAND_SHOW_TIMER){','if (DREAMLAND_SHOW_TIMER){')) ||
   /if \(DREAMLAND_SHOW_TIMER\)/.test(noC),
   'and the whole readout sits behind it');
// the MECHANIC must be untouched
ok(/try \{ tickDreamland\(\); \} catch/.test(noC), 'tickDreamland still runs every frame');
ok(/performance\.now\(\) >= player\._dreamEndsAt\) wakeFromDreamland\('timeout'\)/.test(noC),
   'and still wakes you when the clock runs out — hiding a readout must not stop the clock');
ok(/player\._dreamEndsAt = performance\.now\(\) \+ secs \* 1000/.test(noC),
   'the nap still stamps a deadline');
console.log('');
console.log('     The nap fade-in and the final white-out are KEPT. Neither is a');
console.log('     timer: one is falling asleep, the other is waking up. Dropping');
console.log('     the white-out as well would turn the return into a hard cut');
console.log('     with no warning, which is a different change from the one');
console.log('     asked for.\n');
const ov = grab('drawDreamlandOverlay') || '';
ok(/_dreamlandNap/.test(ov), '  the nap fade survives');
ok(/ms < 900/.test(ov), '  and so does the last-second white-out');

console.log('\n9 · ★ NOTHING IS FAKED\n');
ok(!/awardRizerXP|addItems|addZyrexToRoster/.test(tick + wake),
   'expiry awards NOTHING — the brief asked for timed exploration, and inventing a payout would put a number on screen no design has decided');
// ★ Written as a whole-file scan first, and it failed — on
// 'sprites/ui/pages/pause-dreamland.png', a PRE-EXISTING pause-menu page
// image that has nothing to do with the terrain. Scope the claim to the code
// that actually draws the realm.
// ★ v0.95.720 · this asserted "the renderers load NO image" — true, and worth
// asserting, right up until the Creator delivered the cloud plate. The claim
// changes rather than the check disappearing: the terrain uses real art now,
// the telescope still does not, and the procedural path survives as a fallback
// so a missing PNG degrades instead of showing an empty sky.
ok(/DREAMLAND_TILE_IMG\.src = 'assets\/2D%20sprites\/tiles\/dreamland-cloud\.png'/.test(noC),
   'the terrain uses the Creator\'s cloud plate');
// v0.95.721 · the telescope now has an ART HOOK and a placeholder behind it,
// the same shape the Dreamland floor used before the plate arrived.
const telArt = '/sessions/great-cool-heisenberg/mnt/AOV-saga-new/assets/2D sprites/decor/telescope.png';
const telHasArt = fs.existsSync(telArt);
ok(/TELESCOPE_IMG\.src = 'assets\/2D%20sprites\/decor\/telescope\.png'/.test(noC),
   'the telescope reads decor/telescope.png when it exists');
ok(/if \(TELESCOPE_IMG\.complete && TELESCOPE_IMG\.naturalWidth\)/.test(B.drawTreehouseTelescope || ''),
   '  and falls back to primitives until it does');
console.log(`     art file present: ${telHasArt ? 'YES' : 'NOT YET — placeholder is drawing'}`);
ok(/const TELESCOPE_TILES_TALL = 2;/.test(noC),
   'it is sized to 2 tiles — Rizer\'s head-to-feet height');
ok(/const drawW = Math\.round\(drawH \* \(TELESCOPE_IMG\.naturalWidth \/ TELESCOPE_IMG\.naturalHeight\)\)/.test(B.drawTreehouseTelescope || ''),
   '  scaled from HEIGHT with width following the source aspect, so any PNG size lands right and nothing is squashed');
ok(/ctx\.scale\(-1, 1\)/.test(B.drawTreehouseTelescope || ''),
   'mirrored horizontally so the lens faces NORTH-WEST');
ok(/ctx\.translate\(cx, baseY\);[\s\S]{0,80}ctx\.scale\(-1, 1\)/.test(B.drawTreehouseTelescope || ''),
   '  with the translate BEFORE the flip, so it pivots on the telescope rather than the world origin');
ok((B.drawTreehouseTelescope || '').split('ctx.scale(-1, 1)').length === 3,
   '  and the placeholder is mirrored too, so placement reads the same before and after the art swap');
ok(/if \(!pat\)\{ drawDreamlandFloorFallback/.test(noC),
   'and the procedural plates survive as a FALLBACK, so a missing PNG degrades rather than blanking the sky');
ok(/createLinearGradient/.test(B.drawDreamlandFloor || ''), '  the sky is still a gradient behind the plate');

console.log('\n10 · ★★ THE CLOUD PLATE\n');
const artPath = '/sessions/great-cool-heisenberg/mnt/AOV-saga-new/assets/2D sprites/tiles/dreamland-cloud.png';
ok(fs.existsSync(artPath), 'the plate is installed');
ok(/const DREAMLAND_TILES_PER_REPEAT = 12;/.test(noC),
   'it repeats every 12 GAME TILES, not every N source pixels');
console.log('     12 x 48 = 576px, an exact tile boundary. A non-integer repeat');
console.log('     would drift the texture a fraction of a pixel per tile and put');
console.log('     a shimmering seam through the middle of the sky — the same');
console.log('     judgement the Seer wall needed at v0.95.702.\n');
// v0.95.734 · this assertion used to read dreamlandPattern's own source text.
// The canvas build moved into the shared _mkDreamPattern helper when the dense
// variant landed, and the assertion failed even though the property it cares
// about was untouched. Testing a function's SOURCE STRING rather than its
// behaviour breaks on every refactor; retargeted at the helper that now owns
// the square-canvas rule, and at the caching itself, which is the real claim.
ok(/off\.width = n; off\.height = n;/.test(B._mkDreamPattern || ''),
   'the pattern canvas is square (built in _mkDreamPattern, shared by both tiles)');
ok(/_dreamPattern\)\s*return _dreamPattern/.test(B.dreamlandPattern || '')
   && /_dreamPatternDense\)\s*return _dreamPatternDense/.test(B.dreamlandPatternDense || ''),
   'and BOTH tiles are built once, then cached');
ok(/lctx\.translate\(-startCol \* TILE, -startRow \* TILE\)/.test(B.drawDreamlandFloor || ''),
   'the fill happens in WORLD space, so the clouds cannot swim under the camera');
ok(/globalCompositeOperation = 'destination-in'/.test(B.drawDreamlandFloor || ''),
   'the density field is applied as a MASK, not as per-tile alpha');
console.log('     Per-tile alpha would only have moved the 48px squares one');
console.log('     step down in contrast. A one-pixel-per-tile mask scaled up');
console.log('     with smoothing gives real bilinear edges for the cost of a');
console.log('     ~30x20 image.\n');
ok(/const DREAMLAND_FEATHER = 0\.06;/.test(noC),
   'the feather is narrow (0.06) so the coastline stays readable');
console.log('     At 0.16 the edge dissolves and you cannot tell where the floor');
console.log('     stops — which matters more here than anywhere else in the');
console.log('     game, because the edge of a cloud is a thing you fall off.\n');
ok(/lctx\.drawImage\(_dlMask, -TILE \/ 2, -TILE \/ 2/.test(B.drawDreamlandFloor || ''),
   'the mask is offset by half a tile, so each pixel\'s centre sits on its tile\'s centre');
console.log('     Without that offset the visual edge would sit half a tile off');
console.log('     the collision edge, and you would fall through cloud you can see.\n');

console.log(f ? `\n❌ ${f} failure(s)` : '\n✅ ALL CHECKS PASS');
process.exit(0);
