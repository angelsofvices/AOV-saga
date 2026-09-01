/* ★★★ WORLD EXPORT · everything the overworld draws, as data
 *
 * Creator, 2026-09-01: "can you send me a full current tile map screenshot of
 * the game? full assets and everything wired. birds eye view 2d map full scale
 * tile. overworld blueprint 16:9 AR"
 *
 * WHY THIS EXISTS INSTEAD OF A SCREENSHOT
 * The world is 1020x800 tiles at TILE=48 — 48,960 x 38,400 px. No canvas can
 * hold that, and this sandbox has no headless browser to stitch one from
 * (the npm registry is blocked, so playwright is not installable).
 *
 * So instead of photographing the game, this DUMPS what the game would draw —
 * the land mask, the district per tile, every prop's sheet + crop + tile
 * position, every overworld NPC's sprite bank — and tools/render_worldmap.py
 * composites it from the same PNG files the engine loads. Same assets, same
 * placement, arbitrary scale.
 *
 * ★ It boots rp7b.html's real script against a stubbed DOM (the same harness
 * every tools/verify_*.js uses), so the numbers come out of the game's own
 * world generation rather than a second copy of it that would drift.
 *
 *     node tools/export_worldmap.js            # writes /tmp/worldmap.json
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

// ── extract the page's script blocks ────────────────────────────────────────
const html = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
const blocks = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const src = blocks.join('\n;\n');

// ── the standard verify-suite DOM stub ──────────────────────────────────────
const noop = () => {};
global.setInterval = () => 0; global.setTimeout = () => 0;
global.clearInterval = noop; global.clearTimeout = noop;
function makeCtx(){
  const c = {};
  for (const m of ['save','restore','beginPath','closePath','moveTo','lineTo','arc','arcTo','rect',
    'fill','stroke','fillRect','strokeRect','clearRect','fillText','strokeText','drawImage','translate',
    'rotate','scale','setTransform','resetTransform','clip','createLinearGradient','createRadialGradient',
    'createPattern','putImageData','getImageData','measureText','ellipse','quadraticCurveTo','bezierCurveTo',
    'setLineDash','transform']) c[m] = () => ({ addColorStop: noop, data: [], width: 0, height: 0 });
  c.measureText = () => ({ width: 10 });
  c.canvas = { width: 960, height: 528 };
  return c;
}
const CTX = makeCtx();
function makeEl(){
  return { style:{}, dataset:{}, classList:{ add:noop, remove:noop, toggle:noop, contains:()=>false },
    width:960, height:528, value:'', textContent:'', innerHTML:'', checked:false,
    children:[], childNodes:[], clientWidth:960, clientHeight:528,
    getContext:()=>CTX, appendChild:noop, removeChild:noop, insertBefore:noop,
    addEventListener:noop, removeEventListener:noop, setAttribute:noop, getAttribute:()=>null,
    removeAttribute:noop, focus:noop, blur:noop, click:noop, remove:noop, closest:()=>null,
    querySelector:()=>makeEl(), querySelectorAll:()=>[],
    getBoundingClientRect:()=>({left:0,top:0,width:960,height:528,right:960,bottom:528}),
    scrollIntoView:noop, scrollTo:noop, scrollTop:0 };
}
global.addEventListener = noop; global.removeEventListener = noop;
global.document = { getElementById:()=>makeEl(), querySelector:()=>makeEl(), querySelectorAll:()=>[],
  createElement:()=>makeEl(), createTextNode:()=>({}), addEventListener:noop, removeEventListener:noop,
  body:makeEl(), documentElement:makeEl(), head:makeEl(), hidden:false, visibilityState:'visible',
  activeElement:null, fullscreenElement:null, readyState:'complete' };
global.window = global;
global.localStorage = { _d:{}, getItem(k){return this._d[k]??null;}, setItem(k,v){this._d[k]=String(v);},
  removeItem(k){delete this._d[k];}, clear(){this._d={};} };
global.Audio = function(){ return { play:()=>Promise.resolve(), pause:noop, load:noop,
  addEventListener:noop, removeEventListener:noop, cloneNode(){return this;},
  volume:1, currentTime:0, duration:0, paused:true }; };
// ★ the Image stub keeps `src`, which is the whole point — every prop and every
// sprite bank is identified by the file it loaded, and that is what the Python
// compositor opens off disk.
global.Image = function(){ return { addEventListener:noop, removeEventListener:noop,
  complete:false, naturalWidth:0, naturalHeight:0, width:0, height:0, src:'' }; };
global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = noop;
global.matchMedia = () => ({ matches:false, addEventListener:noop, removeEventListener:noop, addListener:noop });
global.navigator = { userAgent:'node', getGamepads:()=>[], maxTouchPoints:0, vibrate:noop };
global.performance = { now: () => 0 };
global.alert = noop; global.confirm = () => true; global.prompt = () => null;
global.getComputedStyle = () => ({ getPropertyValue: () => '' });

const EXPORT = ';globalThis.__W={WORLD_PROPS,NPCS,BOULDERS,MAP_COLS,MAP_ROWS,'
  + 'WORLD_MIN_COL,WORLD_MIN_ROW,TILE,FUTURE_DISTRICT_TILES,GRASS,SAND_TILE,ANDRANNOR_TILE,'
  + 'worldDistrictAt,isWorldLandTile,isWorldBorderTile,terrainAtTile,districtBlendTargets,'
  + 'isVeridanRiverTile,player,game};';
const _log = console.log; console.log = () => {};          // hush the boot chatter
try { new Function(src + EXPORT)(); } catch(e){ console.log = _log; console.log('boot error:', e.message); }
console.log = _log;
const W = globalThis.__W;
if (!W) { console.error('world did not boot'); process.exit(1); }

// ── 1 · the tile grid ───────────────────────────────────────────────────────
// One character per tile.  '.' is not land (Void Sea); anything else indexes
// DISTRICTS below.  A whole 1020x800 grid is 816,000 characters — under a
// megabyte, so it ships as plain text rather than a packed binary nobody can
// read six months from now.
const DISTRICTS = [];
const distIdx = d => {
  if (d == null) return -1;
  let i = DISTRICTS.indexOf(d);
  if (i < 0) { i = DISTRICTS.length; DISTRICTS.push(d); }
  return i;
};
const CH = i => String.fromCharCode(97 + i);               // a, b, c, ...
const rows = [];
const river = [];
const border = [];
const blends = [];
for (let y = 0; y < W.MAP_ROWS; y++){
  let line = '';
  for (let x = 0; x < W.MAP_COLS; x++){
    let land = false;
    try { land = !!W.isWorldLandTile(x, y); } catch(_){}
    if (!land) { line += '.'; continue; }
    let d = null;
    try { d = W.worldDistrictAt(x, y); } catch(_){}
    line += CH(distIdx(d));
    // the two overlays that are NOT a function of the district alone
    try { if (W.isVeridanRiverTile(x, y)) river.push([x, y]); } catch(_){}
    try { if (W.isWorldBorderTile(x, y)) border.push([x, y]); } catch(_){}
    // ★ district seams cross-fade.  Sparse on purpose: it is a handful of
    // tiles per boundary, so a full second grid would be 816k mostly-empty
    // entries to record a few thousand real ones.
    try {
      const bl = W.districtBlendTargets(x, y, d) || [];
      for (const b of bl) blends.push([x, y, distIdx(b.dist), Math.round(b.alpha * 100) / 100]);
    } catch(_){}
  }
  rows.push(line);
}

// ── 2 · terrain art per district ────────────────────────────────────────────
const srcOf = im => (im && im.src) ? im.src : null;
const terrain = {};
for (const d of DISTRICTS){
  const sheet = W.FUTURE_DISTRICT_TILES && W.FUTURE_DISTRICT_TILES[d];
  let base = null;
  try { base = srcOf(W.terrainAtTile(...(function(){
    // find one tile actually in this district so terrainAtTile answers for it
    for (let y = 0; y < W.MAP_ROWS; y += 7)
      for (let x = 0; x < W.MAP_COLS; x += 7)
        if (W.isWorldLandTile(x,y) && W.worldDistrictAt(x,y) === d) return [x,y];
    return [0,0];
  })())); } catch(_){}
  terrain[d] = { sheet: srcOf(sheet), base };
}

// ── 3 · props ───────────────────────────────────────────────────────────────
// Everything drawWorldLayer would push, minus the runtime-only states (a prop
// mid-throw, a used pickup) that only exist during play.
const props = W.WORLD_PROPS
  .filter(p => p && !p._hidden && p.img && p.img.src && p.bbox)
  .map(p => ({
    id: p.id, src: p.img.src, bbox: p.bbox,
    x: p.tileX, y: p.tileY, w: p.tileW, h: p.tileH,
    subY: p.subY || 0, mirror: !!p.mirrorX,
    depth: p.depthOffset || 0, tree: !!p._districtTree,
    animCells: p._animCells || 0, animCellW: p._animCellW || 0,
  }));

// ── 4 · overworld NPCs ──────────────────────────────────────────────────────
// The full sprite bank travels with each one so the compositor can reproduce
// drawNPC's own arithmetic (scaleRefBh -> _downScale -> foot baseline) rather
// than guessing at a size.  See tools/render_worldmap.py.
const npcs = W.NPCS
  .filter(n => n && n.scene === 'overworld' && n.sheet && n.sheet.src && n.bboxes)
  .filter(n => !(n.id && n.id.startsWith('_summon_')))
  .filter(n => n.id !== 'verdanix_follower')
  .map(n => ({
    id: n.id, name: n.name, src: n.sheet.src,
    bboxes: n.bboxes, foot: n.footBaselines || null,
    cellW: n.cellW, cellH: n.cellH, cols: n.cols, rows: n.rows,
    rowMap: n.rowMap || null, cellAnchor: !!n.cellAnchor,
    mirrorRight: !!n.mirrorRightAsLeft,
    scaleRefBh: n.scaleRefBh || null, scaleMul: n.scaleMul || 1,
    perRowScale: !!n.perRowScale,
    x: n.tileX, y: n.tileY, dir: n.dir || 'down',
    enemy: !!n.isEnemy,
  }));

const boulders = (W.BOULDERS || [])
  .filter(b => b && b.scene === 'overworld' && !b.gone && b.img && b.img.src)
  .map(b => ({ src: b.img.src, bbox: b.bbox || null, x: b.tileX, y: b.tileY,
               w: b.tileW || 1, h: b.tileH || 1 }));

const out = {
  meta: {
    mapCols: W.MAP_COLS, mapRows: W.MAP_ROWS,
    minCol: W.WORLD_MIN_COL, minRow: W.WORLD_MIN_ROW,
    tile: W.TILE, districts: DISTRICTS,
    player: { x: W.player && W.player.x, y: W.player && W.player.y },
  },
  rows, terrain, blends, river, border, props, npcs, boulders,
};
const dest = process.argv[2] || '/tmp/worldmap.json';
fs.writeFileSync(dest, JSON.stringify(out));
const land = rows.reduce((s, r) => s + (r.length - (r.split('.').length - 1)), 0);
console.log(`  grid       ${W.MAP_COLS} x ${W.MAP_ROWS} tiles · ${land.toLocaleString()} land`);
console.log(`  districts  ${DISTRICTS.length} · ${DISTRICTS.join(', ')}`);
console.log(`  props      ${props.length}`);
console.log(`  npcs       ${npcs.length} overworld`);
console.log(`  boulders   ${boulders.length}`);
console.log(`  river      ${river.length} tiles · border ${border.length} · blends ${blends.length}`);
console.log(`  wrote      ${dest} (${(fs.statSync(dest).size/1e6).toFixed(1)} MB)`);
