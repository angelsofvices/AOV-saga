#!/usr/bin/env node
/* RP7 · ASCII-map -> data-driven map extractor
 * Reads rp7b.html, pulls every hand-authored ASCII map + the MAPS/HALL_MAPS
 * registries, and emits:
 *   data/maps/<id>.json        · RP7-native map (layers + events + encounters)
 *   data/maps/<id>.tmj         · Tiled map, opens directly in Tiled
 *   data/tilesets/rp7.json     · char -> tile table (walkable, class, gid)
 * No game code is modified.  Re-runnable; safe to run on every change.
 */
const fs = require('fs'), path = require('path');
const SRC = process.argv[2] || 'rp7b.html';
const OUT = process.argv[3] || 'data';
const src = fs.readFileSync(SRC, 'utf8');

/* ---------- 1 · pull every ASCII map literal ---------- */
const maps = {};
const declRe = /^const\s+([A-Z][A-Z0-9_]*)\s*=\s*\[[ \t]*$([\s\S]*?)^\];/gm;
let m;
while ((m = declRe.exec(src))) {
  const rows = [];
  const rowRe = /'((?:[^'\\]|\\.)*)'/g; let r;
  for (const line of m[2].split('\n')) {
    rowRe.lastIndex = 0; r = rowRe.exec(line);
    if (r) rows.push(r[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\'));
  }
  if (rows.length < 3) continue;
  const w = rows[0].length;
  if (w < 5 || !rows.every(x => x.length === w)) continue;   // not a grid
  maps[m[1]] = rows;
}

/* ---------- 2 · registries ---------- */
const registry = {};
for (const name of ['MAPS', 'HALL_MAPS']) {
  const re = new RegExp('const ' + name + '\\s*=\\s*\\{([\\s\\S]*?)\\n\\};');
  const blk = re.exec(src); if (!blk) continue;
  const entRe = /(\w+)\s*:\s*\{\s*data:\s*(\w+),\s*cols:\s*(\d+),\s*rows:\s*(\d+),\s*label:\s*(['"])([\s\S]*?)\5/g;
  let e;
  while ((e = entRe.exec(blk[1]))) {
    registry[e[1]] = { varName: e[2], cols: +e[3], rows: +e[4], label: e[6], group: name };
  }
}

/* ---------- 3 · tile semantics harvested from the game's own logic ---------- */
const blockers = new Set((/if \('([^']+)'\.includes\(t\)\) return false;/.exec(src) || [,''])[1].split(''));
const trainerChars = new Set(
  ((/const NPC_TRAINERS = \{([\s\S]*?)\n\};/.exec(src) || [,''])[1].match(/^\s*'(.)'\s*:/gm) || [])
    .map(s => s.replace(/[^']*'(.)'.*/s, '$1'))
);
const CLASS = {
  '.': 'floor', '#': 'wall', '=': 'wall', ',': 'bridge',
  'x': 'warp', 'H': 'warp', 'p': 'warp', 'q': 'warp', '<': 'warp', '>': 'warp',
  'w': 'warp', 'U': 'warp', 'K': 'chest', '!': 'questitem', 'G': 'encounter',
};

/* ---------- 4 · build the tile table ---------- */
const freq = new Map();
for (const rows of Object.values(maps)) for (const row of rows) for (const ch of row) freq.set(ch, (freq.get(ch) || 0) + 1);
const chars = [...freq.keys()].sort((a, b) => freq.get(b) - freq.get(a));
const tiles = chars.map((ch, i) => ({
  gid: i + 1, char: ch,
  class: CLASS[ch] || (trainerChars.has(ch) ? 'npc' : blockers.has(ch) ? 'obstacle' : 'floor'),
  walkable: !blockers.has(ch),
  isEvent: trainerChars.has(ch) || ['x','H','p','q','<','>','w','U','K','!'].includes(ch),
  uses: freq.get(ch),
}));
const gidOf = Object.fromEntries(tiles.map(t => [t.char, t.gid]));

/* ---------- 5 · emit ---------- */
fs.mkdirSync(path.join(OUT, 'maps'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'tilesets'), { recursive: true });
const COLUMNS = 15, TILE = 32;
fs.writeFileSync(path.join(OUT, 'tilesets', 'rp7.json'), JSON.stringify({
  name: 'rp7-overworld', tilewidth: TILE, tileheight: TILE, columns: COLUMNS,
  image: 'rp7-overworld.png',
  imagewidth: COLUMNS * TILE, imageheight: Math.ceil(tiles.length / COLUMNS) * TILE,
  tilecount: tiles.length, tiles,
}, null, 2));

let made = 0, skipped = [];
for (const [id, meta] of Object.entries(registry)) {
  const rows = maps[meta.varName];
  if (!rows) { skipped.push(id + ' (' + meta.varName + ' not a literal — procedural)'); continue; }
  const w = rows[0].length, h = rows.length;
  const ground = [], collision = [], events = [];
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    ground.push(gidOf[ch] || 0);
    collision.push(blockers.has(ch) ? 1 : 0);
    const t = tiles.find(t => t.char === ch);
    if (t && t.isEvent) events.push({ type: t.class, x, y, char: ch, id: `${id}_${t.class}_${x}_${y}`, script: null });
  }));
  const native = {
    id, label: meta.label, group: meta.group,
    width: w, height: h, tilewidth: TILE, tileheight: TILE,
    declaredCols: meta.cols, declaredRows: meta.rows,
    sizeMatchesRegistry: meta.cols === w && meta.rows === h,
    tileset: '../tilesets/rp7.json',
    layers: { ground, collision },
    events, warps: [], encounters: null,
    legacyAscii: rows,                        // round-trip safety net
  };
  fs.writeFileSync(path.join(OUT, 'maps', id + '.json'), JSON.stringify(native, null, 2));
  fs.writeFileSync(path.join(OUT, 'maps', id + '.tmj'), JSON.stringify({
    type: 'map', version: '1.10', orientation: 'orthogonal', renderorder: 'right-down',
    width: w, height: h, tilewidth: TILE, tileheight: TILE, infinite: false,
    tilesets: [{ firstgid: 1, source: '../tilesets/rp7.json' }],
    layers: [
      { type: 'tilelayer', name: 'ground', width: w, height: h, data: ground, opacity: 1, visible: true, x: 0, y: 0 },
      { type: 'tilelayer', name: 'collision', width: w, height: h, data: collision.map(c => c ? 1 : 0), opacity: 0.4, visible: false, x: 0, y: 0 },
      { type: 'objectgroup', name: 'events', objects: events.map((e, i) => ({
          id: i + 1, name: e.id, type: e.type, x: e.x * TILE, y: e.y * TILE,
          width: TILE, height: TILE, visible: true, rotation: 0,
          properties: [{ name: 'char', type: 'string', value: e.char }],
        })), opacity: 1, visible: true, x: 0, y: 0 },
    ],
  }, null, 2));
  made++;
}
console.log(`ascii map literals found : ${Object.keys(maps).length}`);
console.log(`registry entries         : ${Object.keys(registry).length}`);
console.log(`maps written             : ${made}`);
console.log(`distinct tile chars      : ${tiles.length}`);
console.log(`blockers parsed          : ${blockers.size}   trainers: ${[...trainerChars].join('')}`);
if (skipped.length) console.log('skipped (procedural):\n  ' + skipped.join('\n  '));
