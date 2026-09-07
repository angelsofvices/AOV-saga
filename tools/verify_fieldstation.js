#!/usr/bin/env node
/* verify_fieldstation.js · v0.96.12 · THE PORTABLE FIELD WORKSTATION
 *
 *   Creator: "rizer can craft a workstation from 20 scrapmetal parts at his home
 *   science tab. this will allow him to deploy a science table with him in the
 *   wild during expedition and set up mini camps in each district. these metal
 *   portable stations can be destroyed by enemies and are weak. must be stored
 *   away in briefcase and put back into zycube to be safe. rizer deploys it and
 *   it opens up all the way to be interacted with and able to craft on the go.
 *   breaks back down into briefcase to store for travel to new district or new
 *   camp set up. use the right images for the field crafting event."
 *
 *   "The orientation is now locked across the full sequence: latch and operator
 *   edge stay at the bottom, hinges and lid stay at the top, and the equipment
 *   never swaps sides."
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync('/tmp/all.js', 'utf8');
const H = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
let pass = 0, fail = 0;
const ok = m => { pass++; console.log('  ok   · ' + m); };
const no = m => { fail++; console.log('  FAIL · ' + m); };
const t = (c, m) => c ? ok(m) : no(m);

console.log('\n=== FIELD WORKSTATION · v0.96.12 ===\n');

const FRAMES = ['case', 'unlatch', 'half', 'deployed', 'rear', 'scanning', 'crafting', 'packing'];

/* ── 1 · ★★ THE ART IS ON DISK AND MATCHES THE DECLARED BBOXES ──────────── */
{
  const dims = {};
  const missing = [];
  for (const k of FRAMES){
    const p = path.join(ROOT, `assets/2D sprites/decor/fieldstation/station-${k}.png`);
    if (!fs.existsSync(p)){ missing.push(k); continue; }
    const b = fs.readFileSync(p);
    dims[k] = [b.readUInt32BE(16), b.readUInt32BE(20)];
  }
  t(missing.length === 0,
    `★ all 8 frames on disk${missing.length ? ' · MISSING: ' + missing.join(', ') : ''}`);
  // ★★★ the declared bbox must equal the REAL png · a bbox one pixel wrong
  //     samples a neighbouring frame's edge, and nothing throws
  const decl = {};
  const blk = H.slice(H.indexOf('const FS_BBOX = {'), H.indexOf('};', H.indexOf('const FS_BBOX = {')));
  for (const m of blk.matchAll(/(\w+):\[(\d+),(\d+)\]/g)) decl[m[1]] = [ +m[2], +m[3] ];
  const wrong = FRAMES.filter(k => dims[k] && decl[k] &&
    (dims[k][0] !== decl[k][0] || dims[k][1] !== decl[k][1]));
  t(wrong.length === 0,
    `★★★ every declared bbox equals the REAL PNG (${FRAMES.length} checked)`
    + (wrong.length ? ` · WRONG: ${wrong.map(k => `${k} ${decl[k]}≠${dims[k]}`).join(', ')}` : '')
    + ' · a bbox measured by eye samples a neighbouring frame and never throws');
}

/* ── 2 · ★★★ THE ORIENTATION LOCK THE CREATOR SHIPPED ───────────────────── */
{
  // "latch and operator edge stay at the bottom... the equipment never swaps
  //  sides." Verified by reading the PIXELS, because that claim is about the
  //  art and only the art can answer it.
  let zlib;
  try { zlib = require('zlib'); } catch (_) {}
  function readPng(p){
    const buf = fs.readFileSync(p);
    const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
    const depth = buf[24], ctype = buf[25];
    if (depth !== 8 || ctype !== 6) return null;      // RGBA8 only
    let idat = [];
    let off = 8;
    while (off < buf.length){
      const len = buf.readUInt32BE(off);
      const typ = buf.toString('ascii', off + 4, off + 8);
      if (typ === 'IDAT') idat.push(buf.slice(off + 8, off + 8 + len));
      off += 12 + len;
    }
    const raw = zlib.inflateSync(Buffer.concat(idat));
    const bpp = 4, stride = w * bpp;
    const out = Buffer.alloc(h * stride);
    let pos = 0;
    for (let y = 0; y < h; y++){
      const ft = raw[pos++];
      const line = raw.slice(pos, pos + stride); pos += stride;
      const prev = y > 0 ? out.slice((y - 1) * stride, y * stride) : Buffer.alloc(stride);
      const cur = out.slice(y * stride, (y + 1) * stride);
      for (let x = 0; x < stride; x++){
        const a = x >= bpp ? cur[x - bpp] : 0, b = prev[x], c = x >= bpp ? prev[x - bpp] : 0;
        let v = line[x];
        if (ft === 1) v += a; else if (ft === 2) v += b;
        else if (ft === 3) v += (a + b) >> 1;
        else if (ft === 4){
          const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c);
          v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
        }
        cur[x] = v & 255;
      }
    }
    return { w, h, data: out };
  }
  const stats = {};
  let readable = 0;
  for (const k of FRAMES){
    const img = readPng(path.join(ROOT, `assets/2D sprites/decor/fieldstation/station-${k}.png`));
    if (!img) continue;
    readable++;
    const { w, h, data } = img;
    let latchMaxY = -1, cryXs = [], cryN = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++){
      const i = (y * w + x) * 4;
      if (data[i + 3] < 40) continue;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (r > 150 && g > 120 && b < 110) latchMaxY = Math.max(latchMaxY, y);   // brass
      if (b > 150 && b - g > 50){ cryXs.push(x); cryN++; }                      // crystal glow
    }
    stats[k] = { latch: latchMaxY / h, cry: cryN > 80 ? (cryXs.reduce((a, c) => a + c, 0) / cryN) / w : null };
  }
  t(readable === 8, `★ all 8 frames decoded for pixel inspection (${readable}/8)`);
  const badLatch = FRAMES.filter(k => stats[k] && stats[k].latch < 0.85);
  t(badLatch.length === 0,
    `★★★ the brass latch reaches the BOTTOM edge in every frame `
    + `(min ${Math.min(...FRAMES.map(k => stats[k] ? stats[k].latch : 1)).toFixed(2)} of frame height)`
    + (badLatch.length ? ` · HIGH: ${badLatch.join(', ')}` : '')
    + ' · "latch and operator edge stay at the bottom" — measured, not taken on trust');
  // equipment side · the four fully-open working frames
  const OPEN = ['half', 'deployed', 'scanning', 'crafting'];
  const xs = OPEN.map(k => stats[k] && stats[k].cry).filter(v => v != null);
  const spread = xs.length ? Math.max(...xs) - Math.min(...xs) : 9;
  t(xs.length === 4 && spread < 0.12 && Math.max(...xs) < 0.45,
    `★★★ the crystal sits on the SAME side in all four open frames `
    + `(x ${xs.map(v => v.toFixed(2)).join(', ')} · spread ${spread.toFixed(2)}) · "the equipment `
    + 'never swaps sides". A mirrored frame mid-sequence reads as the bench '
    + 'flipping over as it opens, which is why this set was re-cut');
}

/* ── the headless shell ─────────────────────────────────────────────────── */
const noop = () => {};
const _Q = [];
global.setInterval = () => 0; global.setTimeout = fn => { _Q.push(fn); return 0; };
global.clearInterval = noop; global.clearTimeout = noop;
const CTX = new Proxy({}, { get: (_, k) => {
  if (k === 'measureText') return () => ({ width: 10 });
  if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => ({ addColorStop: noop });
  if (k === 'getImageData') return () => ({ data: [], width: 0, height: 0 });
  if (k === 'canvas') return { width: 960, height: 540 };
  return () => {};
} });
const _els = new Map();
const mk = () => ({ style: {}, dataset: {}, classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
  width: 960, height: 540, value: '', textContent: '', innerHTML: '', children: [], childNodes: [],
  getContext: () => CTX, appendChild: noop, removeChild: noop, addEventListener: noop, removeEventListener: noop,
  setAttribute: noop, getAttribute: () => null, focus: noop, remove: noop, replaceChildren: noop,
  cloneNode(){ return mk(); }, querySelector: () => mk(), querySelectorAll: () => [],
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 960, height: 540 }) });
global.addEventListener = noop; global.removeEventListener = noop;
global.document = { getElementById: id => { if (!_els.has(id)) _els.set(id, mk()); return _els.get(id); },
  querySelector: () => mk(), querySelectorAll: () => [], createElement: () => mk(),
  addEventListener: noop, body: mk(), documentElement: mk(), head: mk(), hidden: false,
  visibilityState: 'visible', hasFocus: () => true };
global.window = global;
global.localStorage = { getItem: () => null, setItem: noop, removeItem: noop };
global.Audio = function () { return { play: () => Promise.resolve(), pause: noop, addEventListener: noop, volume: 1, cloneNode(){ return this; } }; };
global.Image = function () { const o = { addEventListener: noop, complete: true, naturalWidth: 256, naturalHeight: 145,
  set src(v){ this._src = v; }, get src(){ return this._src; } }; return o; };
global.requestAnimationFrame = () => 1; global.cancelAnimationFrame = noop;
global.matchMedia = () => ({ matches: false, addEventListener: noop, addListener: noop });
global.navigator = { userAgent: 'node', getGamepads: () => [], maxTouchPoints: 0 };
let T = 100000;
global.performance = { now: () => T };
global.getComputedStyle = () => ({ getPropertyValue: () => '' });
const LOG = console.log;
console.log = () => {}; console.warn = noop; console.error = noop;
new Function(src + `;globalThis.__C={ player, game, WORLD_PROPS, NPCS, FS_FRAMES, FS_BBOX,
  FS_DEPLOY_SEQ, FS_PACK_SEQ, FS_STEP_MS, FS_MAX_HP, FIELD_STATION_SCRAP,
  deployFieldStation, deployedFieldStation, tickFieldStation, fieldStationReady,
  fieldStationUse, packFieldStation, damageFieldStation, tickFieldStationRaid,
  useZycubeItem, walkable, districtAt };`)();
let n = 0; while (_Q.length && n < 80) { const f = _Q.shift(); n++; try { f(); } catch (_) {} }
console.log = LOG;
const C = globalThis.__C;

/* ── 3 · the recipe ─────────────────────────────────────────────────────── */
{
  const r = (C.player.knownRecipes || []).find(x => x.id === 'field_station');
  t(!!r, 'the workstation is a recipe at the bench');
  t(r && r.costOptions[0].scrap_metal === 20 && C.FIELD_STATION_SCRAP === 20,
    `★ 20 scrap metal, exactly as asked (${r && r.costOptions[0].scrap_metal})`);
  t(r && r.output.field_station === 1, '  · and it yields one case');
  t(/field_station:    \{ label: 'Field Workstation'/.test(H),
    '★ the case is a real inventory item · an output the bag cannot name is a '
    + 'craft that vanishes');
}

/* ── 4 · ★★★ DEPLOY · THE UNFOLD IS REAL ────────────────────────────────── */
{
  C.game.scene = 'overworld';
  C.player.x = 42; C.player.y = 49; C.player.dir = 'down';
  C.player.items = C.player.items || {};
  C.player.items.field_station = 0;
  t(C.deployFieldStation() === null, '★ nothing to deploy with no case in the bag');

  C.player.items.field_station = 1;
  const prop = C.deployFieldStation();
  t(!!prop, 'deploying puts a station in the world');
  t(C.player.items.field_station === 0, '  · and spends the case');
  t(prop && (prop.tileX !== C.player.x || prop.tileY !== C.player.y),
    '★ never under your own feet · the bench is solid, and a solid prop on your '
    + 'tile is a wall you are standing inside');
  t(prop._fsFrame === 'case',
    '★★ it starts CLOSED · the unfold has to be watchable to exist');
  t(!C.fieldStationReady(prop), '  · and it is not usable yet');

  // drive the sequence
  const seen = [prop._fsFrame];
  for (let i = 0; i < 6; i++){ T += C.FS_STEP_MS + 5; C.tickFieldStation(); seen.push(prop._fsFrame); }
  t(seen.join('>').startsWith('case>unlatch>half>deployed'),   // ★ no repeated first frame
    `★★★ it plays case → unlatch → half → deployed (${[...new Set(seen)].join(' → ')}) · `
    + 'the Creator shipped EIGHT frames and re-cut them once to lock the '
    + 'orientation; art held to that standard should not be reduced to two states');
  t(C.fieldStationReady(prop), '★ and now it is ready to use');
  // ★ the bbox follows the frame
  t(prop.bbox[2] === C.FS_BBOX.deployed[0] && prop.bbox[3] === C.FS_BBOX.deployed[1],
    '★★ the bbox follows the frame · each state is its own silhouette and a '
    + 'fixed box would clip the lid off the open bench');
  t(Math.abs(prop.tileH - prop.tileW * prop.bbox[3] / prop.bbox[2]) < 1e-6,
    '★★ and height is DERIVED from the art, never assumed · [[image-never-stretch]]');

  // camp recorded
  const d = C.districtAt(prop.tileX, prop.tileY);
  t(!!(C.player.camps && C.player.camps[d]),
    `★ the camp site is remembered for ${String(d).toUpperCase()} · "set up mini camps in each district"`);

  // one at a time
  C.player.items.field_station = 1;
  t(C.deployFieldStation() === null,
    '★★ a second deploy is refused while one is standing · otherwise the world '
    + 'fills with benches and "pack it to move camp" means nothing');
  C.player.items.field_station = 0;
}

/* ── 5 · ★★ USE IT · the same bench panel ───────────────────────────────── */
{
  const prop = C.deployedFieldStation();
  C.fieldStationUse(prop);
  t(prop._fsFrame === 'crafting',
    '★★ using it swaps to the CRAFTING pose · the art has a frame for exactly '
    + 'this and it costs one assignment to use');
  t(/openExperimentPanel\(\)/.test(H.slice(H.indexOf('function fieldStationUse'), H.indexOf('function fieldStationUse') + 700)),
    '★★★ and it opens the SAME bench panel as home · "able to craft on the go" '
    + 'means the same recipes, not a second crafting system to keep in sync');
}

/* ── 6 · ★★★ PACK IT BACK INTO THE CASE ─────────────────────────────────── */
{
  const prop = C.deployedFieldStation();
  prop._fsFrame = 'deployed';
  t(C.packFieldStation(prop) === true, 'packing starts');
  const seen = [];
  for (let i = 0; i < 5; i++){ T += C.FS_STEP_MS + 5; C.tickFieldStation(); seen.push(prop._fsFrame); }
  t(seen.includes('packing'),
    `★★ it plays the PACKING frame on the way down (${[...new Set(seen)].join(' → ')}) · putting `
    + 'it away should read as an action, not a disappearance');
  t(C.deployedFieldStation() === null, '★ the station leaves the world');
  t(C.player.items.field_station === 1,
    '★★★ and the case comes back to the bag · "breaks back down into briefcase to '
    + 'store for travel to new district or new camp set up"');
}

/* ── 7 · ★★★ WEAK · AND SAFE ONLY WHEN STOWED ───────────────────────────── */
{
  C.player.x = 42; C.player.y = 49; C.player.dir = 'down';
  const prop = C.deployFieldStation();
  for (let i = 0; i < 6; i++){ T += C.FS_STEP_MS + 5; C.tickFieldStation(); }
  t(prop._fsHpMax === C.FS_MAX_HP && C.FS_MAX_HP <= 60,
    `★★ it is WEAK by design (${C.FS_MAX_HP} hp) · "these metal portable stations can be `
    + 'destroyed by enemies and are weak"');
  C.damageFieldStation(5);
  t(prop._fsHp === C.FS_MAX_HP - 5, '  · and it takes damage');

  // ★★ an enemy standing next to it wrecks it
  const foe = C.NPCS.find(x => x && x.isEnemy);
  foe.scene = C.game.scene; foe.tileX = prop.tileX + 1; foe.tileY = prop.tileY;
  foe._dying = false; foe._fsSwingAt = 0;
  const hpBefore = prop._fsHp;
  C.tickFieldStationRaid();
  t(prop._fsHp < hpBefore,
    `★★★ an adjacent enemy wrecks it (${hpBefore} → ${prop._fsHp}) · they do not need to `
    + 'path to it or know what it is, only to be hostile and beside it');
  const afterOne = prop._fsHp;
  C.tickFieldStationRaid();
  t(prop._fsHp === afterOne,
    '  · but only on its swing cooldown · without that a single Mori deletes the '
    + 'bench in one frame');

  // destroy it
  for (let i = 0; i < 20 && C.deployedFieldStation(); i++){ T += 2000; C.damageFieldStation(10); }
  t(C.deployedFieldStation() === null, '★ enough hits destroy it');
  t((C.player.items.field_station || 0) === 0,
    '★★★ and the CASE IS GONE WITH IT · that is the whole risk. Safety is not a '
    + 'flag, it is the STATE: a packed station is an item and items cannot be '
    + 'attacked, so "put back into zycube to be safe" is literally true rather '
    + 'than a rule somebody has to remember to enforce');
  const d = C.districtAt(42, 49);
  t(!(C.player.camps && C.player.camps[d]), '  · and the camp site is struck off');
}

/* ── 8 · the wiring ─────────────────────────────────────────────────────── */
{
  t(/case 'field_station': \{/.test(H) && /deployFieldStation\(\)/.test(H),
    '★ selecting the case in the ZyCube sets it down · a briefcase becomes a '
    + 'bench by being put down, which is the only verb it has');
  t(/try \{ tickFieldStation\(\); \} catch\(_\)\{\}/.test(H)
    && /try \{ tickFieldStationRaid\(\); \} catch\(_\)\{\}/.test(H),
    '★★ both ticks run in the frame loop · an animation nobody drives is a prop '
    + 'frozen in its closed frame forever');
  t(/_pressOnlyDoor: true,\s*\/\/ ★ and a footstep must not fold your bench up/.test(H),
    '★★ the bench is a press-only door too · it uses the same door-tile rig as '
    + 'every building (X to craft, SQUARE to pack), so walking into it cannot '
    + 'fold it up by accident');
  t(/camps:         Object\.assign\(\{\}, player\.camps        \|\| \{\}\)/.test(H),
    '★ camps are saved · a camp the reload forgets was never a camp');
}

console.log(`\n★ ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
