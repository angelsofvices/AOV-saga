// ══════════════════════════════════════════════════════════════════════════
// ★★★★ RP7B-HD · THE 2DHD PRESENTATION LAYER · Phase 2 foundation
//
//   Creator handoff (2026-10-07), the commandment this file exists under:
//     "RP7B-HD IS NOT A REBUILD OF RP7B. ... Take RP7B. Give it depth. Give it
//      HD presentation. Preserve RP7B."
//
// ★★★ HOW THAT RULE IS ENFORCED IN CODE, NOT JUST IN A COMMENT.
//   This file owns NO game logic. It never moves an actor, never decides a
//   collision, never starts a battle, never touches a save. rp7b.html keeps
//   doing all of that exactly as before. What this file does is RE-ROUTE THE
//   PAINT: the same draw functions the 2D game already calls are wrapped, and
//   when HD is on their output lands in a three-dimensional scene instead of
//   on the flat top-down canvas.
//
//     GROUND   drawGrass / drawVeridanFreshwaterRiver / drawDistrictWorldBorders
//              are run into 16x8-tile chunks and laid on 3D ground meshes, with
//              rock skirts dropping to the Void Sea at every coastline.
//     SPRITES  drawPlayer / drawNPC / drawZyrexOrb / drawBoulder / ... are run
//              one actor at a time into a capture window and stood up as
//              camera-facing billboards at the actor's foot tile. Every frame,
//              direction, attack bank and flash is the game's own — nothing is
//              re-implemented, so nothing can drift from the 2D build.
//     PROPS    trees, houses, the Fanghall: their own image + bbox, stood up as
//              billboards (the vertical-slice phase replaces Malezor's buildings
//              with modelled geometry, one by one).
//     EFFECTS  fae, gems, hit rings, projectiles: the game draws them in world
//              space after the world layer; that layer is laid on the ground as
//              a decal so it stays where the game put it.
//     UI       menus, dialogue, battle overlays, HUD: untouched, on the 2D
//              canvas, which now sits transparent ON TOP of the 3D view.
//
// ★★ OFF BY DEFAULT. The classic build stays the authoritative game until the
//   Malezor slice validates (handoff §16, Phase 4). Turn HD on with:
//     · Cmd+F in game (Ctrl+F on Windows/Linux · persists), or
//     · rp7b.html?hd=1   (rp7b.html?hd=0 forces it off)
//   Interiors are 3D too (v0.99.56). The title, Dreamland and the realms stay classic.
//
//   Tuning lives on window.RP7B_HD.cfg; window.RP7B_HD.stats shows the cost.
// ══════════════════════════════════════════════════════════════════════════
import * as THREE from './vendor/three/three.module.min.js';

const W = window;
const LS_KEY = 'rp7b_hd_v1';

// ── config ───────────────────────────────────────────────────────────────
const cfg = {
  fov: 38,               // moderate lens · keeps the RPG read, little fish-eye
  pitchDeg: 32,          // elevated third person · not top-down, not over-shoulder
  distance: 20,          // world units (1 unit = 1 tile)
  followRate: 9,         // camera follow · 1/sec
  lean: 0.30,            // billboard lean back toward the camera (radians)
  pixelRatioMax: 2,
  shadowMap: 2048,
  shadowExtent: 26,      // half-size of the sun's shadow box, in tiles
  skirtDepth: 2.4,       // coastline cliff height down to the Void Sea
  seaY: -2.2,
  fogNear: 26, fogFar: 62,
  viewAhead: 34,         // tiles drawn north of the player (the far side of the view)
  viewBehind: 12,        // tiles drawn south of the player
  viewSide: 30,          // tiles drawn east and west
  roomPitchDeg: 46,      // indoors · higher, so the far wall and the whole floor read
  roomDistance: 15,
};

// ── state ────────────────────────────────────────────────────────────────
const HD = {
  on: false,
  cfg,
  stats: { worldMs: 0, renderMs: 0, chunks: 0, chunkBakes: 0, sprites: 0, props: 0, captures: 0, decal: false, frames: 0 },
  frameActive: false,    // this frame is drawn by HD (overworld or interior)
  mode: 'overworld',     // 'overworld' | 'interior'
  capturing: false,      // actors are being captured (world layer / room pass)
};
W.RP7B_HD = HD;
HD._actors = () => [...actors.values()].map(r => r.kind + ':' + r.win.w + 'x' + r.win.h);
HD._roomWalls = () => room ? room.owned.length - 1 : 0;
HD._fx = () => [...fxRecs.values()].filter(m => m.visible).map(m => +m.position.y.toFixed(2));
HD._flatProps = () => [...propRecs.entries()].filter(([p, r]) => r.mesh.visible && r.geo.flat).map(([p]) => p.id);
HD._fae = () => [...faeRecs.values()].filter(m => m.visible).map(m => m.position.y);

(function readPref(){
  let on = false;
  try { on = localStorage.getItem(LS_KEY) === '1'; } catch(_){}
  try {
    const q = new URLSearchParams(location.search).get('hd');
    if (q === '1' || q === 'on') on = true;
    if (q === '0' || q === 'off') on = false;
  } catch(_){}
  HD.on = on;
})();

// ── the game's globals we read (all declared by rp7b.html) ────────────────
const T = TILE;                         // 48 px per tile in the 2D build
const gameCanvas = canvas;
const g2d = ctx;

// Originals, captured once, before anything is wrapped.
const NAMES = [
  'drawOceanUnderlayer','drawGrass','drawVeridanFreshwaterRiver','drawDistrictWorldBorders',
  'drawFootprints','drawWorldLayer','_propCullBounds','drawProp','drawTreeCanopy','drawPropShadow',
  'drawNPC','drawZyrexOrb','drawSkellorHurtFrame','drawBoulder','drawRizerSoulShell','drawPlayer',
  'applyDepthCamera','drawLevelUpBanner','drawHpFlash','drawLightMode','drawNpcInfoOverlay',
  'drawInteriorFloor','drawAoeImpactBursts','drawFae',
  'drawGems','drawElzebubEgg','drawProjectiles','drawArrows','drawAuraxionUfoFlight','drawAnciuxorFlight',
];
const O = {};
for (const n of NAMES){
  if (typeof W[n] !== 'function'){ console.warn('[hd] missing game function ' + n + ' · HD disabled'); HD.broken = true; }
  O[n] = W[n];
}

// ── renderer, scene, camera ───────────────────────────────────────────────
let renderer = null, scene, camera, hemi, sun, lantern, seaMesh, seaTex, seaCanvas, decal;
let worldGroup, roomGroup;   // overworld-only things · the current interior
const glCanvas = document.createElement('canvas');
glCanvas.id = 'hd3d';
glCanvas.style.cssText = 'position:absolute; pointer-events:none; z-index:0; display:none;';

function initRenderer(){
  if (renderer) return true;
  if (HD.broken) return false;       // tried once and the browser said no · do not retry every frame
  try {
    renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, alpha: false,
                                         powerPreference: 'high-performance' });
  } catch(err){
    console.error('[hd] WebGL unavailable · staying classic 2D', err);
    HD.broken = true;
    // ★ v0.99.60 · never fail silently · the player asked for 2DHD and must hear why it is not there
    try { showToast('\u26a0 2DHD needs WebGL and the browser refused it \u00b7 relaunch Chrome (pending update?) \u00b7 classic view for now', 9000); } catch(_){}
    return false;
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;      // ★ the art's own colours, not a filmic regrade
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0820);
  scene.fog = new THREE.Fog(0x0b0820, cfg.fogNear, cfg.fogFar);

  worldGroup = new THREE.Group(); roomGroup = new THREE.Group();
  scene.add(worldGroup, roomGroup);

  camera = new THREE.PerspectiveCamera(cfg.fov, gameCanvas.width / gameCanvas.height, 0.5, 220);

  hemi = new THREE.HemisphereLight(0xe8f1ff, 0x55603f, 0.62);
  scene.add(hemi);
  // Sun from the east-north-east, high · shadows fall west like the 2D shadow pass.
  sun = new THREE.DirectionalLight(0xfff0d8, 0.62);
  sun.castShadow = true;
  sun.shadow.mapSize.set(cfg.shadowMap, cfg.shadowMap);
  const e = cfg.shadowExtent;
  Object.assign(sun.shadow.camera, { left: -e, right: e, top: e, bottom: -e, near: 1, far: 120 });
  sun.shadow.bias = -0.0008;
  sun.shadow.normalBias = 0.02;
  scene.add(sun, sun.target);

  lantern = new THREE.PointLight(0xffc982, 0, 9, 1.6);
  scene.add(lantern);

  // The Void Sea · the game's own VOID_OCEAN_FLOW frames, tiled under the land.
  seaCanvas = document.createElement('canvas');
  seaCanvas.width = seaCanvas.height = 128;
  seaTex = new THREE.CanvasTexture(seaCanvas);
  seaTex.colorSpace = THREE.SRGBColorSpace;
  seaTex.wrapS = seaTex.wrapT = THREE.RepeatWrapping;
  seaTex.repeat.set(160, 160);
  seaMesh = new THREE.Mesh(new THREE.PlaneGeometry(320, 320).rotateX(-Math.PI / 2),
                           new THREE.MeshBasicMaterial({ map: seaTex, color: 0xb8b0ff }));
  seaMesh.position.y = cfg.seaY;
  worldGroup.add(seaMesh);

  // World-space effects decal (fae, gems, hit rings, projectiles ...).
  const dc = document.createElement('canvas');
  dc.width = gameCanvas.width; dc.height = gameCanvas.height;
  const dt = new THREE.CanvasTexture(dc);
  dt.colorSpace = THREE.SRGBColorSpace;
  decal = new THREE.Mesh(
    new THREE.PlaneGeometry(gameCanvas.width / T, gameCanvas.height / T).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ map: dt, transparent: true, depthWrite: false,
                                  polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
  decal.userData.canvas = dc; decal.userData.ctx = dc.getContext('2d');
  decal.renderOrder = 5;
  decal.visible = false;
  scene.add(decal);

  // ★ v0.99.60 · a GPU reset (driver hiccup, a browser update waiting to
  //   relaunch) LOSES the WebGL context. Without this the 3D view would freeze
  //   on its last frame under a transparent game canvas. Step aside to classic
  //   while it is gone, say so, and come back when the browser restores it.
  glCanvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    HD.contextLost = true;
    setLayered(false);
    console.error('[hd] WebGL context lost · classic view until it is restored');
    try { showToast('\u26a0 2DHD lost the GPU \u00b7 classic view until it comes back', 6000); } catch(_){}
  });
  glCanvas.addEventListener('webglcontextrestored', () => {
    HD.contextLost = false;
    try { showToast('\u25c8 2DHD restored', 2400); } catch(_){}
  });

  const stage = gameCanvas.parentElement;
  stage.insertBefore(glCanvas, gameCanvas);
  try { showToast('\u25c8 RP7B 2DHD on \u00b7 \u2318F for classic', 2600); } catch(_){}
  return true;
}

// ── layering: the 2D canvas becomes a transparent UI sheet over the 3D view ──
let _layered = false;
function setLayered(on){
  if (on === _layered) return;
  _layered = on;
  glCanvas.style.display = on ? 'block' : 'none';
  if (on){
    gameCanvas.style.position = 'relative';
    gameCanvas.style.zIndex = '1';
    gameCanvas.style.background = 'transparent';
  } else {
    gameCanvas.style.position = '';
    gameCanvas.style.zIndex = '';
    gameCanvas.style.background = '';
  }
}
let _lastBox = '';
function syncSize(){
  const r = gameCanvas.getBoundingClientRect();
  const pr = gameCanvas.parentElement.getBoundingClientRect();
  const box = `${r.left - pr.left}|${r.top - pr.top}|${r.width}|${r.height}|${W.devicePixelRatio}`;
  if (box === _lastBox) return;
  _lastBox = box;
  Object.assign(glCanvas.style, { left: (r.left - pr.left) + 'px', top: (r.top - pr.top) + 'px',
                                  width: r.width + 'px', height: r.height + 'px' });
  renderer.setPixelRatio(Math.min(W.devicePixelRatio || 1, cfg.pixelRatioMax));
  renderer.setSize(Math.max(1, Math.round(r.width)), Math.max(1, Math.round(r.height)), false);
  camera.aspect = r.width / Math.max(1, r.height);
  camera.updateProjectionMatrix();
}

// ── helpers ──────────────────────────────────────────────────────────────
function clear2d(w, h){
  g2d.save();
  g2d.setTransform(1, 0, 0, 1, 0, 0);
  g2d.globalAlpha = 1;
  g2d.globalCompositeOperation = 'source-over';
  g2d.clearRect(0, 0, w ?? gameCanvas.width, h ?? gameCanvas.height);
  g2d.restore();
}
function withCam(x, y, fn){
  const sx = _cam.x, sy = _cam.y;
  _cam.x = x; _cam.y = y;
  try { fn(); } finally { _cam.x = sx; _cam.y = sy; }
}
function makeTex(src){
  const t = (src instanceof HTMLCanvasElement) ? new THREE.CanvasTexture(src) : new THREE.Texture(src);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer ? Math.min(8, renderer.capabilities.getMaxAnisotropy()) : 1;
  t.needsUpdate = true;
  return t;
}
function spriteMaterial(tex){
  const m = new THREE.MeshLambertMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide });
  m.alphaToCoverage = true;
  return m;
}
function spriteDepth(tex){
  return new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5 });
}

// Count paint calls on the 2D context so an empty effects layer costs nothing.
// ★ The same seam carries _drawHook: while an interior is being read, every
//   paint call goes to the hook first, which can record it (furniture) or
//   swallow it (wall art that is rebuilt as real walls) instead of painting.
let _paintOps = 0;
let _drawHook = null;
for (const m of ['drawImage','fillRect','fill','stroke','fillText','strokeText','strokeRect','putImageData']){
  const f = g2d[m];
  if (typeof f === 'function') g2d[m] = function(){
    if (_drawHook && _drawHook(m, this, arguments)) return;
    _paintOps++;
    return f.apply(this, arguments);
  };
}

// ══════════════════════════════════════════════════════════════════════════
// GROUND · 16x8-tile chunks baked by the game's own terrain painters
// ══════════════════════════════════════════════════════════════════════════
const CH_W = 16, CH_H = 8;
const chunks = new Map();           // "cx,cy" → record
let _skirtMat = null;

function chunkHasLand(cx, cy){
  const x0 = cx * CH_W, y0 = cy * CH_H;
  for (let y = y0; y < y0 + CH_H; y++)
    for (let x = x0; x < x0 + CH_W; x++)
      if (isWorldLandTile(x, y)) return true;
  return false;
}
function buildSkirt(cx, cy){
  // A vertical quad on every land-tile edge that faces open void · the land
  // stops being a painted shape and becomes a raised landmass.
  const pos = [], col = [];
  const x0 = cx * CH_W, y0 = cy * CH_H, d = cfg.skirtDepth;
  const top = [0.42, 0.37, 0.50], bot = [0.06, 0.05, 0.12];
  const quad = (ax, az, bx, bz) => {
    pos.push(ax,0,az, bx,0,bz, bx,-d,bz,  ax,0,az, bx,-d,bz, ax,-d,az);
    col.push(...top, ...top, ...bot, ...top, ...bot, ...bot);
  };
  for (let y = y0; y < y0 + CH_H; y++)
    for (let x = x0; x < x0 + CH_W; x++){
      if (!isWorldLandTile(x, y)) continue;
      if (!isWorldLandTile(x, y + 1)) quad(x, y + 1, x + 1, y + 1);   // south face
      if (!isWorldLandTile(x, y - 1)) quad(x + 1, y, x, y);           // north face
      if (!isWorldLandTile(x - 1, y)) quad(x, y, x, y + 1);           // west face
      if (!isWorldLandTile(x + 1, y)) quad(x + 1, y + 1, x + 1, y);   // east face
    }
  if (!pos.length) return null;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  if (!_skirtMat) _skirtMat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
  const m = new THREE.Mesh(g, _skirtMat);
  m.receiveShadow = true;
  return m;
}
function bakeChunk(rec){
  const wpx = CH_W * T, hpx = CH_H * T;
  withCam(rec.cx * wpx, rec.cy * hpx, () => {
    clear2d();
    // ★ the game's own painters, in the game's own order
    try { O.drawGrass(); } catch(e){ console.warn('[hd] bake grass', e); }
    try { O.drawVeridanFreshwaterRiver(); } catch(_){}
    try { O.drawDistrictWorldBorders(); } catch(_){}
  });
  rec.ctx.clearRect(0, 0, wpx, hpx);
  rec.ctx.drawImage(gameCanvas, 0, 0, wpx, hpx, 0, 0, wpx, hpx);
  clear2d();        // ★ the bake used the game canvas as scratch · leave it transparent
  rec.tex.needsUpdate = true;
  rec.bakedAt = performance.now();
  rec.bakes++;
  // A grass sheet still loading paints a flat fallback · bake again soon.
  rec.provisional = !(typeof GRASS !== 'undefined' && GRASS.complete && GRASS.naturalWidth);
  HD.stats.chunkBakes++;
}
function getChunk(cx, cy){
  const key = cx + ',' + cy;
  let rec = chunks.get(key);
  if (rec) return rec;
  rec = { key, cx, cy, empty: !chunkHasLand(cx, cy), bakes: 0, bakedAt: 0, seen: 0 };
  if (!rec.empty){
    const c = document.createElement('canvas');
    c.width = CH_W * T; c.height = CH_H * T;
    rec.canvas = c; rec.ctx = c.getContext('2d');
    rec.tex = makeTex(c);
    const mat = new THREE.MeshLambertMaterial({ map: rec.tex, alphaTest: 0.5 });
    rec.mesh = new THREE.Mesh(new THREE.PlaneGeometry(CH_W, CH_H).rotateX(-Math.PI / 2), mat);
    rec.mesh.position.set(cx * CH_W + CH_W / 2, 0, cy * CH_H + CH_H / 2);
    rec.mesh.receiveShadow = true;
    rec.mesh.visible = false;
    rec.skirt = buildSkirt(cx, cy);
    worldGroup.add(rec.mesh);
    if (rec.skirt) worldGroup.add(rec.skirt);
  }
  chunks.set(key, rec);
  return rec;
}
function updateGround(fx, fz){
  const cx0 = Math.floor((fx - cfg.viewSide) / CH_W), cx1 = Math.floor((fx + cfg.viewSide) / CH_W);
  const cy0 = Math.floor((fz - cfg.viewAhead) / CH_H), cy1 = Math.floor((fz + cfg.viewBehind) / CH_H);
  const frame = HD.stats.frames;
  let newBudget = 3, refresh = null, visible = 0;
  for (let cy = cy0; cy <= cy1; cy++)
    for (let cx = cx0; cx <= cx1; cx++){
      const rec = getChunk(cx, cy);
      rec.seen = frame;
      if (rec.empty) continue;
      if (!rec.bakes){
        if (newBudget-- > 0) bakeChunk(rec); else continue;
      } else {
        const age = performance.now() - rec.bakedAt;
        // Refresh the stalest visible chunk · picks up late-loading tile sheets
        // and keeps river frames from freezing for good.
        const due = rec.provisional ? 400 : (rec.bakes < 3 ? 2500 : 9000);
        if (age > due && (!refresh || rec.bakedAt < refresh.bakedAt)) refresh = rec;
      }
      rec.mesh.visible = true;
      if (rec.skirt) rec.skirt.visible = true;
      visible++;
    }
  if (refresh) bakeChunk(refresh);
  // hide what fell out of view, evict what has been gone a while
  for (const rec of chunks.values()){
    if (rec.seen === frame) continue;
    if (rec.mesh){ rec.mesh.visible = false; if (rec.skirt) rec.skirt.visible = false; }
    if (frame - rec.seen > 900){
      if (rec.mesh){
        worldGroup.remove(rec.mesh); rec.mesh.geometry.dispose(); rec.mesh.material.dispose(); rec.tex.dispose();
        if (rec.skirt){ worldGroup.remove(rec.skirt); rec.skirt.geometry.dispose(); }
      }
      chunks.delete(rec.key);
    }
  }
  HD.stats.chunks = visible;
}

// ══════════════════════════════════════════════════════════════════════════
// SPRITES · each actor captured from its own draw call, stood up in 3D
// ══════════════════════════════════════════════════════════════════════════
// Capture windows, in tiles. The foot point sits FOOT tiles above the window's
// bottom edge so feet, hems and stomp dust are never clipped.
const FOOT = 0.75;
const WIN = {
  ufo:     { w: 9, h: 10 },      // Rizer in the Auraxion UFO · the flight draw, captured whole
  god:     { w: 16, h: 11 },     // Anciuxor's departure
  player:  { w: 5, h: 6 },
  npc:     { w: 7, h: 9 },
  orb:     { w: 7, h: 9 },
  boulder: { w: 4, h: 5 },
  shell:   { w: 4, h: 5 },
};
const actors = new Map();       // key object/string → record

function actorRecord(key, kind, grow){
  let rec = actors.get(key);
  if (rec && rec.kind === kind && !grow) return rec;
  const base = rec && rec.kind === kind ? rec.win : WIN[kind];
  // ★ the window can only be as large as the game canvas it is drawn on
  const maxW = Math.floor(gameCanvas.width / T), maxH = Math.floor(gameCanvas.height / T);
  const win = grow ? { w: Math.min(maxW, base.w + 4), h: Math.min(maxH, base.h + 3) } : { ...base };
  if (rec) disposeActor(key, rec);
  const c = document.createElement('canvas');
  c.width = win.w * T; c.height = win.h * T;
  const tex = makeTex(c);
  const geo = new THREE.PlaneGeometry(win.w, win.h).translate(0, win.h / 2 - FOOT, 0);
  const mesh = new THREE.Mesh(geo, spriteMaterial(tex));
  mesh.customDepthMaterial = spriteDepth(tex);
  mesh.castShadow = true;
  mesh.rotation.x = -cfg.lean;
  scene.add(mesh);
  rec = { kind, win, canvas: c, ctx: c.getContext('2d'), tex, mesh, seen: 0, captured: -99, checks: 0 };
  actors.set(key, rec);
  return rec;
}
function disposeActor(key, rec){
  scene.remove(rec.mesh);
  rec.mesh.geometry.dispose(); rec.mesh.material.dispose();
  rec.mesh.customDepthMaterial.dispose(); rec.tex.dispose();
  actors.delete(key);
}
// Does the drawn sprite touch the top or side of its window? Then it is being
// clipped (a Gemlord, a house-sized Apexaur) and the window has to grow.
// ★ Read through a small CPU-side probe canvas, never getImageData on the game
//   canvas itself · repeated reads there make Chrome drop GPU acceleration for
//   the whole 2D game. It runs on an actor's first captures and then rarely.
const _probe = document.createElement('canvas');
const _probeCtx = _probe.getContext('2d', { willReadFrequently: true });
function touchesEdge(wpx, hpx){
  // one quarter-scale readback of the whole window · its border ring is the test
  const w = Math.ceil(wpx / 4), h = Math.ceil(hpx / 4);
  if (_probe.width !== w || _probe.height !== h){ _probe.width = w; _probe.height = h; }
  _probeCtx.clearRect(0, 0, w, h);
  _probeCtx.drawImage(gameCanvas, 0, 0, wpx, hpx, 0, 0, w, h);
  const d = _probeCtx.getImageData(0, 0, w, h).data;
  const a = (x, y) => d[(y * w + x) * 4 + 3] > 8;
  for (let x = 0; x < w; x++) if (a(x, 0)) return true;              // top
  for (let y = 0; y < h; y++) if (a(0, y) || a(w - 1, y)) return true; // sides
  return false;
}
// (tx, ty) is the actor's tile in the game's own coordinates · the 2D build
// anchors feet to the bottom edge of that tile, so that is the pixel we align.
function captureActor(key, kind, tx, ty, draw){
  // after the world layer the canvas holds this frame's ground effects · bank them first
  if (!HD.capturing && decal) flushToDecal();
  // an actor is painted for real even while a room is being recorded
  const hook = _drawHook;
  _drawHook = null;
  try { _captureActor(key, kind, tx, ty, draw); } finally { _drawHook = hook; }
}
function _captureActor(key, kind, tx, ty, draw){
  let rec = actorRecord(key, kind);
  const frame = HD.stats.frames;
  HD.kinds[kind] = (HD.kinds[kind] || 0) + 1;
  // Far actors refresh every third frame · the player and anyone near, every frame.
  const far = Math.abs(tx - player.x) + Math.abs(ty - player.y) > 16;
  if (!(far && frame - rec.captured < 3)){
    for (let attempt = 0; attempt < 3; attempt++){
      const wpx = rec.win.w * T, hpx = rec.win.h * T;
      const footX = Math.floor((tx + 0.5) * T), footY = Math.floor((ty + 1) * T);
      withCam(footX - wpx / 2, footY - (hpx - FOOT * T), () => {
        clear2d(wpx, hpx);
        draw();
      });
      const check = rec.checks < 1 || (frame + rec.win.w * 7) % 300 === 0;
      if (check){
        rec.checks++;
        const maxed = rec.win.w * T >= gameCanvas.width - T && rec.win.h * T >= gameCanvas.height - T;
        if (!maxed && touchesEdge(wpx, hpx)){ rec = actorRecord(key, kind, true); continue; }
      }
      rec.ctx.clearRect(0, 0, wpx, hpx);
      rec.ctx.drawImage(gameCanvas, 0, 0, wpx, hpx, 0, 0, wpx, hpx);
      // ★ v0.99.59 · leave nothing behind. A capture made AFTER the world layer
      //   (the UFO flight) used to stay on the canvas and get banked into the
      //   ground decal · a second, flattened UFO lying on the grass.
      clear2d();
      rec.tex.needsUpdate = true;
      rec.captured = frame;
      HD.stats.captures++;
      break;
    }
  }
  rec.seen = frame;
  rec.mesh.visible = true;
  // 3D placement · feet on the tile centre, a hair toward the camera so an
  // actor standing on a prop's row wins the tie exactly as it does in 2D.
  rec.mesh.position.set(tx + 0.5, 0, ty + 0.5 + 0.06);
  rec.mesh.rotation.x = -cfg.lean;
}

// ── props: their own image, no capture needed ─────────────────────────────
const propRecs = new Map();     // prop object → record
const imgTex = new Map();       // image → THREE.Texture (shared upload)
function texForImage(img){
  let t = imgTex.get(img);
  if (!t){ t = makeTex(img); imgTex.set(img, t); }
  return t;
}
// ★ v0.99.58 · GROUND ART LIES DOWN. Creator: "the meteor crash is an aoe on
//   the ground surface near the ufo." A prop with NO footprint (you walk on it)
//   that the 2D build sorts BEHIND its own row (negative depthOffset) is a
//   picture of the ground, not a thing standing on it · the meteor crater the
//   Astralcore chest sits in. It lies flat over exactly the tiles 2D paints.
//   p._hdFlat can force either way for any future prop.
const propIsFlat = p => p._hdFlat != null ? !!p._hdFlat
  : (!p.footprint || p.footprint.length === 0) && (p.depthOffset || 0) < 0;
function propGeometry(p, rec){
  const [bx, by, bw, bh] = p.bbox;
  const w = p.tileW, h = w * (bh / bw);
  if (propIsFlat(p)){
    const g = rec && rec.mesh ? rec.mesh.geometry : new THREE.PlaneGeometry(1, 1);
    const pos = g.attributes.position;
    // TL, TR, BL, BR · the picture's top edge is north (−z)
    pos.setXYZ(0, -w/2, 0, -h/2); pos.setXYZ(1, w/2, 0, -h/2); pos.setXYZ(2, -w/2, 0, h/2); pos.setXYZ(3, w/2, 0, h/2);
    pos.needsUpdate = true; g.computeBoundingSphere();
    return { g, iw: p.img.naturalWidth || p.img.width, ih: p.img.naturalHeight || p.img.height,
             bx, by, bw, bh, flat: true, h };
  }
  const iw = p.img.naturalWidth || p.img.width, ih = p.img.naturalHeight || p.img.height;
  const g = rec && rec.mesh ? rec.mesh.geometry : new THREE.PlaneGeometry(1, 1);
  const pos = g.attributes.position;
  // PlaneGeometry(1,1) vertex order: TL, TR, BL, BR
  const xs = [-w/2, w/2, -w/2, w/2], ys = [h, h, 0, 0];
  for (let i = 0; i < 4; i++) pos.setXYZ(i, xs[i], ys[i], 0);
  pos.needsUpdate = true;
  g.computeBoundingSphere();
  return { g, iw, ih, bx, by, bw, bh };
}
function propUV(rec, p, srcX){
  const { iw, ih, by, bw, bh } = rec.geo;
  let u0 = srcX / iw, u1 = (srcX + bw) / iw;
  if (p.mirrorX){ const t = u0; u0 = u1; u1 = t; }
  const v1 = 1 - by / ih, v0 = 1 - (by + bh) / ih;
  const uv = rec.mesh.geometry.attributes.uv;
  uv.setXY(0, u0, v1); uv.setXY(1, u1, v1); uv.setXY(2, u0, v0); uv.setXY(3, u1, v0);
  uv.needsUpdate = true;
}
function showProp(p){
  // the tower swap and any other img/bbox change rebuilds the record
  let rec = propRecs.get(p);
  const sig = (p.img && p.img.src || '') + '|' + p.bbox.join(',') + '|' + p.tileW + '|' + (p.mirrorX ? 1 : 0) + '|' + (propIsFlat(p) ? 'f' : 's');
  if (rec && rec.sig !== sig){
    worldGroup.remove(rec.mesh); rec.mesh.geometry.dispose(); rec.mesh.material.dispose();
    rec.mesh.customDepthMaterial.dispose();
    propRecs.delete(p); rec = null;
  }
  if (!rec){
    const tex = texForImage(p.img);
    const geo = propGeometry(p, null);
    const mesh = new THREE.Mesh(geo.g, spriteMaterial(tex));
    mesh.customDepthMaterial = spriteDepth(tex);
    mesh.castShadow = !geo.flat;
    mesh.receiveShadow = !!geo.flat;
    rec = { mesh, geo, sig, seen: 0, lastSrcX: -1 };
    worldGroup.add(mesh);
    propRecs.set(p, rec);
  }
  let srcX = rec.geo.bx;
  if (p._animCells && p._animCells > 1 && p._animCellW)
    srcX = rec.geo.bx + (Math.floor(performance.now() / 220) % p._animCells) * p._animCellW;
  if (srcX !== rec.lastSrcX){ propUV(rec, p, srcX); rec.lastSrcX = srcX; }
  const lev = p._levitate ? Math.sin(performance.now() / 500) * 4 / T : 0;
  if (rec.geo.flat){
    // bottom edge on the same row line the 2D build anchors to
    rec.mesh.position.set(p.tileX + 0.5, 0.015, p.tileY + 1 + (p.subY || 0) - rec.geo.h / 2);
    rec.mesh.rotation.x = 0;
  } else {
    rec.mesh.position.set(p.tileX + 0.5, lev, p.tileY + 0.5 + (p.subY || 0));
    rec.mesh.rotation.x = -cfg.lean;
  }
  rec.mesh.visible = true;
  rec.seen = HD.stats.frames;
}

// ══════════════════════════════════════════════════════════════════════════
// SHARED · one material pair per source image, UVs from a source rect
// ══════════════════════════════════════════════════════════════════════════
const imgMats = new Map();      // image → { mat, depth }
function matsFor(img){
  let m = imgMats.get(img);
  if (!m){ const t = texForImage(img); m = { mat: spriteMaterial(t), depth: spriteDepth(t) }; imgMats.set(img, m); }
  return m;
}
function quadUV(geo, img, sx, sy, sw, sh, mirror){
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  let u0 = sx / iw, u1 = (sx + sw) / iw;
  if (mirror){ const t = u0; u0 = u1; u1 = t; }
  const v1 = 1 - sy / ih, v0 = 1 - (sy + sh) / ih;
  const uv = geo.attributes.uv;
  uv.setXY(0, u0, v1); uv.setXY(1, u1, v1); uv.setXY(2, u0, v0); uv.setXY(3, u1, v0);
  uv.needsUpdate = true;
}
function quadUpright(geo, w, h){         // feet at y=0, centred on x
  const pos = geo.attributes.position;
  pos.setXYZ(0, -w/2, h, 0); pos.setXYZ(1, w/2, h, 0); pos.setXYZ(2, -w/2, 0, 0); pos.setXYZ(3, w/2, 0, 0);
  pos.needsUpdate = true; geo.computeBoundingSphere();
}

// ══════════════════════════════════════════════════════════════════════════
// FAE · they float. Same sheet, same frame clock, same bob as the 2D build,
// now a hand's height off the grass with a real shadow under them.
// ══════════════════════════════════════════════════════════════════════════
const faeRecs = new Map();      // fae object → mesh
let _faeMat = null, _faeDepth = null;
function drawFaeHD(){
  if (!FAE_IMG.complete || !FAE_IMG.naturalWidth) return;
  if (!_faeMat){
    const t = texForImage(FAE_IMG);
    // unlit · a fae is a light source, it should not go dark in a shadow
    _faeMat = new THREE.MeshBasicMaterial({ map: t, alphaTest: 0.5, side: THREE.DoubleSide });
    _faeDepth = spriteDepth(t);
  }
  const fw = FAE_IMG.naturalWidth / FAE_FRAMES, fh = FAE_IMG.naturalHeight;
  const now = performance.now(), frame = HD.stats.frames;
  for (const f of _fae){
    if (f.collected) continue;
    const dx = f.x - player.x, dy = f.y - player.y;
    if (dx < -cfg.viewSide || dx > cfg.viewSide || dy < -cfg.viewAhead || dy > cfg.viewBehind) continue;
    let m = faeRecs.get(f);
    if (!m){
      const g = new THREE.PlaneGeometry(1, 1);
      quadUpright(g, 1, 1);
      m = new THREE.Mesh(g, _faeMat);
      m.customDepthMaterial = _faeDepth;
      m.castShadow = true;
      m.userData.frame = -1;
      worldGroup.add(m);
      faeRecs.set(f, m);
    }
    const fi = Math.floor(now / FAE_FRAME_MS + f.phase * 4) % FAE_FRAMES;
    if (fi !== m.userData.frame){ quadUV(m.geometry, FAE_IMG, fi * fw, 0, fw, fh, false); m.userData.frame = fi; }
    // the 2D bob is ±3px on a 48px tile · here it is a slow drift in the air
    const bob = Math.sin(now / 400 + f.phase) * 0.14;
    m.position.set(f.x + 0.5, 0.85 + bob, f.y + 0.5);
    m.rotation.set(-cfg.lean, 0, 0);
    m.visible = true;
    m.userData.seen = frame;
  }
  for (const [f, m] of faeRecs){
    if (m.userData.seen === frame) continue;
    m.visible = false;
    if (f.collected){ worldGroup.remove(m); m.geometry.dispose(); faeRecs.delete(f); }
  }
}

// ══════════════════════════════════════════════════════════════════════════
// INTERIORS · the room the game draws, read and rebuilt in 3D
//
//   drawInteriorFloor() paints the floor, the walls AND every piece of
//   furniture, room by room, in ~500 lines of hand-placed draws. None of that
//   is re-implemented. While it runs, _drawHook reads its paint calls:
//     · the floor tile        → baked onto a 3D floor (once per room)
//     · the wall art          → swallowed · the room gets REAL walls built
//                               from that same art (back + sides, or every
//                               '#' of a floor plan as a block of masonry)
//     · everything else       → stood up as a billboard at the exact
//                               rectangle the game drew it, feet on its row
//     · rugs and doormats     → laid flat on the floor where the game put them
//   Collision, doors, chests, NPCs: all still the game's, untouched.
// ══════════════════════════════════════════════════════════════════════════
const ROOM_WALL_H = 2.6;        // tiles · a room taller than its people
let room = null;
const roomObjs = new Map();     // key → { mesh, flat }
let _roomRecord = null;         // objects recorded this frame
let _imgIds = new WeakMap(), _imgSeq = 0;
const imgId = img => { let i = _imgIds.get(img); if (!i){ i = ++_imgSeq; _imgIds.set(img, i); } return i; };

function hdInteriorOk(cfg){
  if (!cfg || cfg.cloudFloor) return false;
  const sc = String(game.scene || '');
  if (sc.startsWith('dreamland')) return false;
  try { if (typeof DREAMLAND_SCENE !== 'undefined' && sc === DREAMLAND_SCENE) return false; } catch(_){}
  try { if (currentDracolordRealm()) return false; } catch(_){}
  return true;
}
function flatImages(){
  const set = new Set();
  try { set.add(RUG_IMG); } catch(_){}
  try { set.add(RIZER_RUG_IMG); } catch(_){}
  try { for (const k in DOORMAT_IMGS) set.add(DOORMAT_IMGS[k]); } catch(_){}
  return set;
}
// Wall art is authored as ONE tile-tall band: crown, field, skirting. A real
// wall is taller, so the band is stretched through its FIELD only and the crown
// and skirting keep their drawn proportions.
function composeWall(img, tilesTall){
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const c = document.createElement('canvas');
  const pxPerTile = 128;
  c.width = pxPerTile; c.height = Math.round(pxPerTile * tilesTall);
  const x = c.getContext('2d');
  const band = Math.round(pxPerTile * 0.24), sb = Math.round(ih * 0.24);
  x.drawImage(img, 0, 0, iw, sb, 0, 0, c.width, band);                                   // crown
  x.drawImage(img, 0, sb, iw, ih - 2 * sb, 0, band, c.width, c.height - 2 * band);        // field
  x.drawImage(img, 0, ih - sb, iw, sb, 0, c.height - band, c.width, band);                // skirting
  const t = makeTex(c);
  t.wrapS = THREE.RepeatWrapping;
  return t;
}
function disposeRoom(){
  if (!room) return;
  for (const o of room.owned){ roomGroup.remove(o); o.geometry && o.geometry.dispose(); o.material && o.material.dispose && o.material.dispose(); }
  for (const t of room.textures) t.dispose();
  for (const [, r] of roomObjs){ roomGroup.remove(r.mesh); r.mesh.geometry.dispose(); }
  roomObjs.clear();
  room = null;
}
function ensureRoom(cfg){
  if (room && room.cfg === cfg && room.scene === game.scene) return room;
  disposeRoom();
  const plan = floorPlan(cfg);
  const C = plan ? plan.cols : cfg.cols, R = plan ? plan.rows : cfg.rows;
  const c = document.createElement('canvas');
  c.width = C * T; c.height = R * T;
  const tex = makeTex(c);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(C, R).rotateX(-Math.PI / 2),
                               new THREE.MeshLambertMaterial({ map: tex, alphaTest: 0.5 }));
  floor.position.set(C / 2, 0, R / 2);
  floor.receiveShadow = true;
  roomGroup.add(floor);
  room = { cfg, scene: game.scene, plan, C, R, canvas: c, ctx: c.getContext('2d'), tex, floor,
           owned: [floor], textures: [tex], bakes: 0, bakedAt: 0, wallsBuilt: false,
           wallImg: wallImageFor(cfg.wallImg), flat: flatImages() };
  return room;
}
function buildWalls(){
  const r = room, img = r.wallImg;
  if (r.wallsBuilt) return;
  if (img && !(img.complete && img.naturalWidth)) return;      // wait for the art
  r.wallsBuilt = true;
  const H = ROOM_WALL_H;
  const tex = img ? composeWall(img, H) : null;
  if (tex) r.textures.push(tex);
  const mat = tex ? new THREE.MeshLambertMaterial({ map: tex })
                  : new THREE.MeshLambertMaterial({ color: 0x3a2c22 });
  if (r.plan){
    // ★ v0.99.57 · Seer HQ · the band the 2D build now paints on the void north
    //   of the floor stands up here as a real wall, and the room's west and east
    //   edges get the same wall. The south edge stays open: that is the camera's side.
    if (r.cfg.wallImg === 'seer-hq' && !SEER_HQ_WALLS_ON){
      const P = r.plan, voids = new Set(P.voids.map(v => v.x + ',' + v.y));
      const isVoid = (x, y) => x < 0 || y < 0 || x >= P.cols || y >= P.rows || voids.has(x + ',' + y);
      const pos = [], uv = [], nrm = [];
      const quad = (ax, az, bx, bz, nx, nz) => {
        pos.push(ax,H,az, bx,H,bz, ax,0,az,  bx,H,bz, bx,0,bz, ax,0,az);
        uv.push(0,1, 1,1, 0,0,  1,1, 1,0, 0,0);
        for (let i = 0; i < 6; i++) nrm.push(nx, 0, nz);
      };
      for (let y = 0; y < P.rows; y++) for (let x = 0; x < P.cols; x++){
        if (P.blocked.has(x + ',' + y)) continue;                 // floor tiles only
        if (isVoid(x, y - 1)) quad(x, y, x + 1, y, 0, 1);          // north · faces into the room
        if (isVoid(x - 1, y)) quad(x, y + 1, x, y, 1, 0);          // west
        if (isVoid(x + 1, y)) quad(x + 1, y, x + 1, y + 1, -1, 0); // east
      }
      if (pos.length){
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
        g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
        const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }));
        m.receiveShadow = true;
        roomGroup.add(m); r.owned.push(m);
      }
      return;
    }
    // every masonry tile of the floor plan is a block of real wall
    const walls = r.plan.walls.filter(w => w.ch !== 'D');
    if (!walls.length) return;
    const box = new THREE.BoxGeometry(1, H, 1);
    const inst = new THREE.InstancedMesh(box, mat, walls.length);
    const m4 = new THREE.Matrix4();
    walls.forEach((w, i) => { m4.makeTranslation(w.x + 0.5, H / 2, w.y + 0.5); inst.setMatrixAt(i, m4); });
    inst.castShadow = inst.receiveShadow = true;
    roomGroup.add(inst); r.owned.push(inst);
    return;
  }
  // classic rooms: the row-0 band becomes a back wall, with side walls framing the floor
  const add = (w, x, z, rotY, repeat) => {
    const t = tex ? tex.clone() : null;
    if (t){ t.needsUpdate = true; t.repeat.set(repeat, 1); r.textures.push(t); }
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, H),
      t ? new THREE.MeshLambertMaterial({ map: t }) : mat);
    m.position.set(x, H / 2, z); m.rotation.y = rotY;
    m.receiveShadow = true;
    roomGroup.add(m); r.owned.push(m);
  };
  add(r.C, r.C / 2, 1.0, 0, r.C);                                  // back wall, on row 0's edge
  add(r.R - 1, 0, (r.R + 1) / 2, Math.PI / 2, r.R - 1);           // west
  add(r.R - 1, r.C, (r.R + 1) / 2, -Math.PI / 2, r.R - 1);        // east
}
// The floor · the game's own floor pass, every paint but the floor tile swallowed.
function bakeRoomFloor(){
  const r = room, cw = Math.floor(gameCanvas.width / T), ch = Math.floor(gameCanvas.height / T);
  const tileImg = r.cfg.tileImg;
  const hook = (m, c, a) => {
    if (m === 'drawImage') return a[0] !== tileImg;
    // only the "floor art still loading" fallback fill · painted light is live, never baked
    if (m === 'fillRect'){ const fs = c.fillStyle; return !(typeof fs === 'string' && /^#7a4a1e$/i.test(fs)); }
    return true;
  };
  r.ctx.clearRect(0, 0, r.canvas.width, r.canvas.height);
  for (let wy = 0; wy < r.R; wy += ch)
    for (let wx = 0; wx < r.C; wx += cw){
      withCam(wx * T, wy * T, () => {
        clear2d();
        _drawHook = hook;
        try { O.drawInteriorFloor(); } catch(e){ console.warn('[hd] room bake', e); }
        finally { _drawHook = null; }
      });
      const w = Math.min(cw, r.C - wx) * T, h = Math.min(ch, r.R - wy) * T;
      r.ctx.drawImage(gameCanvas, 0, 0, w, h, wx * T, wy * T, w, h);
    }
  clear2d();
  r.tex.needsUpdate = true;
  r.bakes++; r.bakedAt = performance.now();
  r.provisional = !(tileImg && tileImg.complete && tileImg.naturalWidth);
}
// Record one drawImage of the room pass as a world-space rectangle, in tiles.
function recordRoomDraw(c, a){
  const img = a[0];
  const r = room;
  if (!img || img === r.cfg.tileImg || img === r.wallImg) return;
  if (!(img.naturalWidth || img.width)) return;
  let sx = 0, sy = 0, sw = img.naturalWidth || img.width, sh = img.naturalHeight || img.height, dx, dy, dw, dh;
  if (a.length >= 9){ [, sx, sy, sw, sh, dx, dy, dw, dh] = a; }
  else if (a.length >= 5){ [, dx, dy, dw, dh] = a; }
  else { [, dx, dy] = a; dw = sw; dh = sh; }
  const m = c.getTransform();
  let x0 = m.a * dx + m.c * dy + m.e, x1 = m.a * (dx + dw) + m.c * (dy + dh) + m.e;
  let y0 = m.b * dx + m.d * dy + m.f, y1 = m.b * (dx + dw) + m.d * (dy + dh) + m.f;
  const mirror = x1 < x0;
  if (mirror){ const t = x0; x0 = x1; x1 = t; }
  if (y1 < y0){ const t = y0; y0 = y1; y1 = t; }
  if (x1 - x0 < 2 || y1 - y0 < 2) return;
  const L = (x0 + _cam.x) / T, Rr = (x1 + _cam.x) / T, Tp = (y0 + _cam.y) / T, B = (y1 + _cam.y) / T;
  // ★ the 2D build re-draws the top slice of a desk/bag over Rizer when he
  //   stands behind it · fake depth. Same image, same top-left = that overlay.
  const key = imgId(img) + '|' + Math.round(L * 8) + '|' + Math.round(Tp * 8);
  if (_roomRecord.has(key)) return;
  // ★ an image drawn with a shadowBlur glow keeps its glow · as real light
  const glow = c.shadowBlur > 0 && c.shadowColor && !/rgba\([^)]*,\s*0(\.0+)?\)$/.test(c.shadowColor)
    ? { color: c.shadowColor, blur: c.shadowBlur } : null;
  _roomRecord.set(key, { img, sx, sy, sw, sh, L, R: Rr, T: Tp, B, mirror, flat: r.flat.has(img), glow });
}
function applyRoomObjects(){
  const frame = HD.stats.frames, r = room;
  for (const [key, o] of _roomRecord){
    let rec = roomObjs.get(key);
    if (!rec || rec.img !== o.img){
      if (rec){ roomGroup.remove(rec.mesh); rec.mesh.geometry.dispose(); }
      const { mat, depth } = matsFor(o.img);
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
      mesh.customDepthMaterial = depth;
      mesh.castShadow = !o.flat;
      mesh.receiveShadow = o.flat;
      roomGroup.add(mesh);
      rec = { mesh, img: o.img, uvSig: '' };
      roomObjs.set(key, rec);
    }
    const g = rec.mesh.geometry, w = o.R - o.L, h = o.B - o.T;
    const uvSig = o.sx + ',' + o.sy + ',' + o.sw + ',' + o.sh + ',' + (o.mirror ? 1 : 0);
    if (uvSig !== rec.uvSig){ quadUV(g, o.img, o.sx, o.sy, o.sw, o.sh, o.mirror); rec.uvSig = uvSig; }
    if (o.flat){
      // lie it on the floor over exactly the tiles it covered
      const pos = g.attributes.position;
      pos.setXYZ(0, o.L, 0, o.T); pos.setXYZ(1, o.R, 0, o.T); pos.setXYZ(2, o.L, 0, o.B); pos.setXYZ(3, o.R, 0, o.B);
      pos.needsUpdate = true; g.computeBoundingSphere();
      rec.mesh.position.set(0, 0.012, 0); rec.mesh.rotation.set(0, 0, 0);
    } else {
      quadUpright(g, w, h);
      // feet on the row the game anchored it to · in a classic room, anything
      // whose foot sits in the row-0 band hangs on the back wall instead
      const onWall = !r.plan && o.B <= 1.1;
      rec.mesh.position.set((o.L + o.R) / 2, onWall ? 0.95 : 0, onWall ? 1.04 : o.B - 0.5 + 0.03);
      rec.mesh.rotation.set(onWall ? 0 : -cfg.lean, 0, 0);
    }
    rec.mesh.visible = true;
    rec.seen = frame;
  }
  for (const [key, rec] of roomObjs){
    if (rec.seen === frame) continue;
    rec.mesh.visible = false;
    if (frame - rec.seen > 600){ roomGroup.remove(rec.mesh); rec.mesh.geometry.dispose(); roomObjs.delete(key); }
  }
  HD.stats.roomObjects = _roomRecord.size;
}
// ══════════════════════════════════════════════════════════════════════════
// INDOOR GLOWS · v0.99.57
//   Two kinds, both the game's own:
//   · PAINTED light · shapes the room pass draws instead of images (the radio
//     tower's consoles, pulsing lamps and hologram pad). They paint for real
//     onto the game canvas, which is then laid on the floor as an UNLIT layer,
//     so their light and their shadowBlur halo keep full brightness in 3D.
//   · IMAGE glows · an image drawn with shadowBlur (Rizer's backpack) gets a
//     soft additive halo and a coloured point light that lights the room.
// ══════════════════════════════════════════════════════════════════════════
let roomPaint = null;           // the painted-light floor layer
let _roomPaintOps = 0;
const glowRecs = new Map();     // object key → halo mesh
const GLOW_LIGHTS = [];         // fixed pool · a stable light count never recompiles shaders
let _haloTex = null;
function haloTexture(){
  if (_haloTex) return _haloTex;
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,0.45)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  _haloTex = new THREE.CanvasTexture(c);
  return _haloTex;
}
function parseCss(col){
  const m = String(col).match(/rgba?\(([^)]+)\)/);
  if (m){
    const p = m[1].split(',').map(v => parseFloat(v));
    return { c: new THREE.Color(p[0] / 255, p[1] / 255, p[2] / 255), a: p.length > 3 ? p[3] : 1 };
  }
  try { return { c: new THREE.Color(col), a: 1 }; } catch(_){ return { c: new THREE.Color(1, 1, 1), a: 1 }; }
}
function ensureGlowLights(){
  if (GLOW_LIGHTS.length) return;
  for (let i = 0; i < 4; i++){
    const l = new THREE.PointLight(0xffffff, 0, 5, 1.8);
    roomGroup.add(l);       // lives in the room group · off on the overworld
    GLOW_LIGHTS.push(l);
  }
}
function captureRoomPaint(){
  if (!roomPaint){
    const c = document.createElement('canvas');
    c.width = gameCanvas.width; c.height = gameCanvas.height;
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(c.width / T, c.height / T).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false,
                                    polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }));
    m.renderOrder = 4;
    roomPaint = { canvas: c, ctx: c.getContext('2d'), tex: t, mesh: m };
    roomGroup.add(m);
  }
  const had = _roomPaintOps > 0;
  roomPaint.mesh.visible = had;
  HD.stats.roomPaint = _roomPaintOps;
  if (!had) return;
  roomPaint.ctx.clearRect(0, 0, roomPaint.canvas.width, roomPaint.canvas.height);
  roomPaint.ctx.drawImage(gameCanvas, 0, 0);
  roomPaint.tex.needsUpdate = true;
  roomPaint.mesh.position.set(_cam.x / T + roomPaint.canvas.width / T / 2, 0.02,
                              _cam.y / T + roomPaint.canvas.height / T / 2);
}
function applyGlows(){
  ensureGlowLights();
  const frame = HD.stats.frames, found = [];
  for (const [key, o] of _roomRecord){
    if (!o.glow) continue;
    const { c, a } = parseCss(o.glow.color);
    const strength = Math.min(1.4, (o.glow.blur / 14) * a * 1.4);
    let h = glowRecs.get(key);
    if (!h){
      h = new THREE.Mesh(new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({ map: haloTexture(), transparent: true, depthWrite: false,
                                      blending: THREE.AdditiveBlending }));
      h.renderOrder = 6;
      roomGroup.add(h); glowRecs.set(key, h);
    }
    const w = (o.R - o.L) + 1.1, ht = (o.B - o.T) + 1.1;
    const onWall = !room.plan && o.B <= 1.1;
    const cx = (o.L + o.R) / 2, cy = (onWall ? 0.95 : 0) + (o.B - o.T) / 2, cz = onWall ? 1.1 : o.B - 0.5 + 0.12;
    h.scale.set(w, ht, 1);
    h.position.set(cx, cy, cz);
    h.rotation.set(-cfg.lean, 0, 0);
    h.material.color.copy(c);
    h.material.opacity = Math.min(1, strength);
    h.visible = true; h.userData.seen = frame;
    found.push({ x: cx, y: cy + 0.3, z: cz + 0.4, c, s: strength });
  }
  for (const [key, h] of glowRecs){
    if (h.userData.seen === frame) continue;
    h.visible = false;
    if (frame - h.userData.seen > 600){ roomGroup.remove(h); h.geometry.dispose(); h.material.dispose(); glowRecs.delete(key); }
  }
  // the strongest glows near Rizer get the lights
  found.sort((p, q) => q.s - p.s);
  GLOW_LIGHTS.forEach((l, i) => {
    const g = found[i];
    if (!g){ l.intensity = 0; return; }
    l.color.copy(g.c); l.intensity = 2.2 * g.s; l.position.set(g.x, g.y, g.z);
  });
  HD.stats.glows = found.length;
}

function endRoomPass(){
  if (!_roomRecord) return;
  _drawHook = null;
  HD.capturing = false;
  try { applyRoomObjects(); } catch(e){ console.warn('[hd] room objects', e); }
  try { applyGlows(); } catch(e){ console.warn('[hd] glows', e); }
  _roomRecord = null;
  clear2d();
  _paintOps = 0;            // what paints from here to the cut is world-space effects
}

// ══════════════════════════════════════════════════════════════════════════
// STANDING THINGS · v0.99.58 · "if I say make an object stand I mean put its
// 2D pic in 3D space (2DHD)." Gems from chests, the Elzebub egg, Astralstrike
// shots flying from Rizer's hand, Pearlbow arrows in flight. Each is the
// game's own image and frame, read from the game's own entity, stood up at its
// tile. Area effects (rings, blasts, debris) stay on the ground as the decal.
// ══════════════════════════════════════════════════════════════════════════
const HAND_Y = 1.0;             // Rizer's hand height, tiles · where shots fly
const fxRecs = new Map();       // key → mesh
function fxSprite(key, img, sx, sy, sw, sh, w, h, x, y, z, o = {}){
  let m = fxRecs.get(key);
  if (!m || m.userData.img !== img || m.userData.additive !== !!o.additive){
    if (m){ scene.remove(m); m.geometry.dispose(); m.material.dispose(); }
    const tex = texForImage(img);
    const mat = o.additive
      ? new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false,
                                      blending: THREE.AdditiveBlending, side: THREE.DoubleSide })
      : new THREE.MeshBasicMaterial({ map: tex, alphaTest: 0.35, transparent: true, side: THREE.DoubleSide });
    m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
    if (!o.additive){ m.customDepthMaterial = spriteDepth(tex); m.castShadow = true; }
    m.userData = { img, additive: !!o.additive, uv: '' };
    scene.add(m); fxRecs.set(key, m);
  }
  const uv = sx + ',' + sy + ',' + sw + ',' + sh + ',' + (o.mirror ? 1 : 0);
  if (uv !== m.userData.uv){ quadUV(m.geometry, img, sx, sy, sw, sh, !!o.mirror); m.userData.uv = uv; }
  if (o.flat){
    // lying in the air (an arrow in flight) · centred, pointing along its path
    const pos = m.geometry.attributes.position;
    pos.setXYZ(0, -w/2, h/2, 0); pos.setXYZ(1, w/2, h/2, 0); pos.setXYZ(2, -w/2, -h/2, 0); pos.setXYZ(3, w/2, -h/2, 0);
    pos.needsUpdate = true; m.geometry.computeBoundingSphere();
    m.rotation.set(-Math.PI / 2, -(o.angle || 0), 0, 'YXZ');
  } else {
    quadUpright(m.geometry, w, h);
    m.rotation.set(-cfg.lean, 0, 0);
  }
  m.position.set(x, y, z);
  m.material.opacity = o.opacity == null ? 1 : o.opacity;
  m.visible = true;
  m.userData.seen = HD.stats.frames;
  return m;
}
function sweepFx(){
  const frame = HD.stats.frames;
  for (const [key, m] of fxRecs){
    if (m.userData.seen === frame) continue;
    m.visible = false;
    if (frame - m.userData.seen > 300){ scene.remove(m); m.geometry.dispose(); m.material.dispose(); fxRecs.delete(key); }
  }
}
// ── gems from chests ──
function standGems(){
  const now = performance.now();
  for (const g of GEM_ENTITIES){
    if (g.collected || g.scene !== game.scene) continue;
    const img = GEM_IMG[g.color];
    if (!img || !img.complete || !img.naturalWidth) continue;
    const w = VOLTSHARD_TILE_W * 0.5, h = w * img.naturalHeight / Math.max(1, img.naturalWidth);
    const bob = Math.sin(now / 500 + g.phase) * 0.06;
    const pulse = 0.75 + 0.25 * (0.5 + 0.5 * Math.sin(now / 320 + g.phase));
    fxSprite(g, img, 0, 0, img.naturalWidth, img.naturalHeight, w, h,
             g.x + 0.5, 0.12 + bob, g.y + 0.55, { opacity: pulse });
  }
}
// ── the Elzebub egg ──
function standEgg(){
  if (!_elzebubEgg || !ELZEBUB_EGG_IMG.complete || !ELZEBUB_EGG_IMG.naturalWidth) return;
  const [bx, by, bw, bh] = ELZEBUB_EGG_BBOX;
  const w = 0.7, h = w * bh / bw;
  const bob = Math.sin(performance.now() / 700 + _elzebubEgg.phase) * 0.03;
  fxSprite(_elzebubEgg, ELZEBUB_EGG_IMG, bx, by, bw, bh, w, h,
           _elzebubEgg.x + 0.5, 0.02 + bob, _elzebubEgg.y + 0.55);
  // its warm glow, as a halo behind it
  const halo = haloTexture();
  fxSprite('egg-halo', halo.image, 0, 0, 128, 128, w * 2.2, h * 1.8,
           _elzebubEgg.x + 0.5, 0, _elzebubEgg.y + 0.5, { additive: true, opacity: 0.55 })
    .material.color.setRGB(1, 0.62, 0.25);
}
// ★ v0.99.59 · Creator: "make the ufo fly over all props including building.
//   no phase through. should fly over all layers." In 2D the flight is the
//   absolute top of the world; here it is drawn after everything and never
//   depth-tested, so no roof or canopy can slice through it. Lifted, so its
//   real shadow still lands on the ground under it.
function flyOverEverything(mesh, lift){
  mesh.position.y = lift;
  mesh.renderOrder = 20;
  if (mesh.material.depthTest){ mesh.material.depthTest = false; mesh.material.needsUpdate = true; }
}
// ── Astralstrike · flies from Rizer's hand at hand height ──
function standProjectiles(){
  if (!PROJECTILES.length) return;
  const dirRow = { down: 0, left: 1, right: 2, up: 3 };
  const now = performance.now();
  for (const p of PROJECTILES){
    if (p.scene !== game.scene) continue;
    const bundle = rizerBundleForSkin('astralProj', p.skin || 'normal');
    if (!bundle || !bundle.loaded) continue;
    if (p.state === 'flight' && now - p.t0 < 250) continue;     // same wind-up gap as 2D
    if (p.state === 'kickboom') continue;
    if (p.state === 'explode'){
      const boom = rizerBundleForSkin('astralBoom', p.skin || 'normal');
      if (!boom || !boom.loaded) continue;
      const t = Math.min(1, (now - p.explodeT0) / ASTRAL_STRIKE.EXPLODE_MS);
      const sc = 1.1 + t * 1.4, alpha = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
      const [bx, by, bw, bh] = boom.bbox;
      const w = Math.max(1, sc), h = Math.max(1, sc * bh / bw);
      fxSprite(p, boom.img, bx, by, bw, bh, w, h,
               p.tileX + 0.5, Math.max(0, HAND_Y - h / 2), p.tileY + 0.55, { opacity: Math.max(0, alpha) });
      continue;
    }
    let row = dirRow[p.dir] || 0, mirror = false;
    if (p.dir === 'right' && bundle === RIZER.astralProj){ row = dirRow.left; mirror = true; }
    const col = Math.min(2, Math.floor((now - p.t0) / 80) % 3);
    const [bx, by, bw, bh] = bundle.bboxes[row][col];
    const w = Math.max(24, Math.round(bw * 0.35)) / T, h = Math.max(24, Math.round(bh * 0.35)) / T;
    fxSprite(p, bundle.img, bx, by, bw, bh, w, h,
             p.tileX + 0.5, HAND_Y - h / 2, p.tileY + 0.55, { mirror });
  }
}
// ── Pearlbow arrows · in flight they ride at hand height along their path ──
function standArrows(){
  if (!PEARLBOW_ARROW.loaded || !ARROWS.length) return [];
  const now = performance.now(), S = PEARLBOW_ARROW, blown = [];
  for (const a of ARROWS){
    if (a.blown){ blown.push(a); continue; }                    // the blast is AOE · it stays on the ground
    const pr = Math.min(1, (now - a.t0) / a.flyMs);
    const frame = Math.min(PEARLBOW_FLY_FRAMES - 1, Math.floor(pr * PEARLBOW_FLY_FRAMES));
    const px = a.x + a.dv[0] * a.tiles * pr, py = a.y + a.dv[1] * a.tiles * pr;
    const r = Math.floor(frame / S.cols), c = frame % S.cols, bb = S.bboxes[r][c];
    const scale = 1.6 / Math.max(bb[2], bb[3]);
    const ang = a.dv[0] === 1 ? 0 : a.dv[0] === -1 ? Math.PI : a.dv[1] === 1 ? Math.PI / 2 : -Math.PI / 2;
    fxSprite(a, S.img, c * S.cellW + bb[0], r * S.cellH + bb[1], bb[2], bb[3], bb[2] * scale, bb[3] * scale,
             px + 0.5, HAND_Y, py + 0.5, { additive: true, flat: true, angle: ang });
  }
  return blown;
}

// ══════════════════════════════════════════════════════════════════════════
// THE WRAPS · every one is a pass-through unless this is an HD overworld frame
// ══════════════════════════════════════════════════════════════════════════
function wrap(name, hd){
  const orig = O[name];
  W[name] = function(){
    return hd.apply(this, [orig, arguments]);
  };
}

if (!HD.broken){
  // ── ground passes ──
  // ★ a frame that threw mid-room must not leave the recorder swallowing paint
  if (typeof W.frame === 'function'){
    const origFrame = W.frame;
    W.frame = function(){
      if (_drawHook || _roomRecord){ _drawHook = null; _roomRecord = null; HD.capturing = false; }
      return origFrame.apply(this, arguments);
    };
  }
  wrap('drawOceanUnderlayer', (orig, args) => {
    HD.frameActive = HD.on && !HD.contextLost && game.scene === 'overworld' && initRenderer();
    if (!HD.frameActive) return orig.apply(null, args);
    HD.mode = 'overworld';
    resetDecal();
    clear2d();        // ★ the 2D canvas becomes transparent · the 3D sea shows through
  });
  for (const n of ['drawGrass','drawVeridanFreshwaterRiver','drawDistrictWorldBorders','drawFootprints']){
    wrap(n, (orig, args) => { if (!HD.frameActive) return orig.apply(null, args); });
  }

  // ── the world layer · props, actors, and the game logic that lives inside it ──
  wrap('drawWorldLayer', (orig, args) => {
    if (!HD.frameActive) return orig.apply(null, args);
    HD.stats.frames++;                     // ★ one HD frame · every record seen now carries this stamp
    HD.kinds = {};
    HD.capturing = true;
    const t0 = performance.now();
    try { orig.apply(null, args); }       // ★ runs in full · grazing, fleeing, culling all still happen
    finally {
      HD.capturing = false;
      HD.stats.worldMs = Math.round((performance.now() - t0) * 10) / 10;
      clear2d();
      _paintOps = 0;                       // what paints from here to the cut is world-space effects
    }
  });
  // ── fae float ──
  wrap('drawFae', (orig, args) => {
    if (!(HD.frameActive && HD.mode === 'overworld')) return orig.apply(null, args);
    try { drawFaeHD(); } catch(e){ console.warn('[hd] fae', e); }
  });

  // ── standing things ──
  const standWrap = (name, fn) => wrap(name, (orig, args) => {
    if (!HD.frameActive) return orig.apply(null, args);
    try { fn(); } catch(e){ console.warn('[hd] ' + name, e); }
  });
  standWrap('drawGems', standGems);
  standWrap('drawElzebubEgg', standEgg);
  standWrap('drawProjectiles', standProjectiles);
  // arrows · in flight they stand · their blast is AOE and stays a ground decal
  wrap('drawArrows', (orig, args) => {
    if (!HD.frameActive) return orig.apply(null, args);
    let blown = [];
    try { blown = standArrows(); } catch(e){ console.warn('[hd] arrows', e); }
    if (!blown.length) return;
    const all = ARROWS.slice();
    ARROWS.length = 0; ARROWS.push(...blown);
    try { orig.apply(null, args); } finally { ARROWS.length = 0; ARROWS.push(...all); }
  });
  // Rizer flying the UFO, and the God's departure · captured whole, lifted into the air
  // ★ v0.99.59 · ONE call, at the real camera. Everything the flight paints on
  //   the ground (the C.O.R.S.U.N. field, the laser, the high-altitude shadow)
  //   paints for real and lands in the ground decal where the game put it;
  //   only the HULL is lifted out and flown above every layer.
  wrap('drawAuraxionUfoFlight', (orig, args) => {
    if (!(HD.frameActive && HD.mode === 'overworld' && player.ufoFlying)) return orig.apply(null, args);
    let hull = null;
    const prev = _drawHook;
    _drawHook = (m, c, a) => {
      if (m !== 'drawImage' || (a[0] !== AURAXION_UFO_FLIGHT && a[0] !== AURAXION_UFO_DASH)) return false;
      const mt = c.getTransform();
      hull = { img: a[0], sx: a[1], sy: a[2], sw: a[3], sh: a[4],
               dx: mt.a * a[5] + mt.e, dy: mt.d * a[6] + mt.f, dw: a[7] * Math.abs(mt.a), dh: a[8] * Math.abs(mt.d) };
      return true;
    };
    try { orig.apply(null, args); } finally { _drawHook = prev; }
    if (!hull) return;
    const w = hull.dw / T, h = hull.dh / T;
    const cx = (hull.dx + hull.dw / 2 + _cam.x) / T;
    // the 2D build floats the hull 0.45 tiles up plus its bob · keep both, on top of real altitude
    const rise = (player.y + 0.5) - (hull.dy + hull.dh / 2 + _cam.y) / T;
    const m = fxSprite('ufo-hull', hull.img, hull.sx, hull.sy, hull.sw, hull.sh, w, h,
                       cx, 2.2 + rise, player.y + 0.5);
    m.rotation.set(0, 0, 0);
    flyOverEverything(m, m.position.y);
  });
  wrap('drawAnciuxorFlight', (orig, args) => {
    if (!(HD.frameActive && HD.mode === 'overworld' && _anciuxorFlight)) return orig.apply(null, args);
    captureActor('anciuxor', 'god', _anciuxorFlight.x, _anciuxorFlight.y + 3, () => orig.apply(null, args));
    const r = actors.get('anciuxor'); if (r) flyOverEverything(r.mesh, 4);
  });

  // ── interiors ──
  wrap('drawInteriorFloor', (orig, args) => {
    let cfgI = null;
    try { cfgI = interiorConfig(game.scene); } catch(_){}
    if (!(HD.on && !HD.contextLost && hdInteriorOk(cfgI) && initRenderer())){
      HD.frameActive = false;
      return orig.apply(null, args);
    }
    HD.frameActive = true;
    HD.mode = 'interior';
    resetDecal();
    HD.stats.frames++;
    HD.kinds = {};
    clear2d();
    ensureRoom(cfgI);
    try { buildWalls(); } catch(e){ console.warn('[hd] walls', e); }
    const age = performance.now() - room.bakedAt;
    if (!room.bakes || (room.provisional && age > 400) || (room.bakes < 4 && age > 1500) || age > 10000)
      bakeRoomFloor();
    _roomRecord = new Map();
    _roomPaintOps = 0;
    // floor pass · images are recorded, painted light (shapes) paints for real
    _drawHook = (m, c, a) => {
      if (m === 'drawImage'){ recordRoomDraw(c, a); return true; }
      if (m === 'fillRect'){
        const fs = c.fillStyle;
        if (typeof fs === 'string' && /^#0{3}(0{3})?$/i.test(fs)) return true;   // void · stays black, stays out
      }
      if (m === 'putImageData') return true;
      _roomPaintOps++;
      return false;
    };
    HD.capturing = true;
    try { orig.apply(null, args); }
    catch(e){ endRoomPass(); throw e; }
    try { captureRoomPaint(); } catch(e){ console.warn('[hd] room paint', e); }
    clear2d();
    // rest of the room pass (chests, desks, gates sorted with the NPCs) · images only
    _drawHook = (m, c, a) => { if (m === 'drawImage') recordRoomDraw(c, a); return true; };
    // ★ still recording on purpose · the room pass then sorts its chests, desks
    //   and gates in with the NPCs, and those are furniture too. The pass ends
    //   at drawAoeImpactBursts, the first thing the frame draws after the room.
  });
  wrap('drawAoeImpactBursts', (orig, args) => {
    if (_roomRecord) endRoomPass();
    return orig.apply(null, args);
  });

  // The 3D view sees much further than the 2D 20x11 window · widen the cull
  // while (and only while) the world layer is being captured.
  wrap('_propCullBounds', (orig, args) => {
    if (!HD.capturing) return orig.apply(null, args);
    const px = Math.floor(player.x), py = Math.floor(player.y);
    return { x0: px - cfg.viewSide, x1: px + cfg.viewSide,
             y0: py - cfg.viewAhead, y1: py + cfg.viewBehind };
  });
  wrap('drawProp', (orig, args) => {
    if (!HD.capturing) return orig.apply(null, args);
    try { showProp(args[0]); } catch(e){ console.warn('[hd] prop', args[0] && args[0].id, e); }
  });
  // Real depth makes the fake-Z canopy pass and the painted prop shadows redundant.
  wrap('drawTreeCanopy', (orig, args) => { if (!HD.capturing) return orig.apply(null, args); });
  wrap('drawPropShadow', (orig, args) => { if (!HD.capturing) return orig.apply(null, args); });

  const actorWrap = (name, kind, keyOf, posOf) => wrap(name, (orig, args) => {
    if (!HD.capturing) return orig.apply(null, args);
    const a = args[0];
    const [tx, ty] = posOf(a);
    // drawWorldLayer hands over EVERY boulder and wild Zyrex and lets the 2D
    // draw cull itself against the screen · the 3D view needs its own cull.
    const dx = tx - player.x, dy = ty - player.y;
    if (dx < -cfg.viewSide || dx > cfg.viewSide || dy < -cfg.viewAhead || dy > cfg.viewBehind) return;
    captureActor(keyOf(a), kind, tx, ty, () => orig.apply(null, args));
  });
  actorWrap('drawPlayer',           'player',  () => 'player',  () => [player.x, player.y]);
  actorWrap('drawNPC',              'npc',     n => n,          n => [n.tileX, n.tileY]);
  actorWrap('drawSkellorHurtFrame', 'npc',     n => n,          n => [n.tileX, n.tileY]);
  actorWrap('drawZyrexOrb',         'orb',     w => w,          w => [w.tileX, w.tileY]);
  actorWrap('drawBoulder',          'boulder', b => b,          b => [b.tileX, b.tileY]);
  actorWrap('drawRizerSoulShell',   'shell',   () => 'shell',
            () => [_factionSoulSwitch.shell.x, _factionSoulSwitch.shell.y]);

  // ── screen-space passes that sit between the world and the cut ──
  // The 3D renderer replaces the depth-camera blend and the 2D night tint;
  // the level-up banner and HP flash are UI, so they wait until after the cut.
  const deferred = [];
  wrap('applyDepthCamera',  (orig, args) => { if (!HD.frameActive) return orig.apply(null, args); });
  wrap('drawLightMode',     (orig, args) => { if (!HD.frameActive) return orig.apply(null, args); });
  for (const n of ['drawLevelUpBanner','drawHpFlash']){
    wrap(n, (orig, args) => {
      if (!HD.frameActive) return orig.apply(null, args);
      deferred.push(() => orig.apply(null, args));
    });
  }
  // Diegetic UI that the game anchors to Rizer through _cam (the bond ring
  // orbits the Zysphere in his hands) · drawn after the 3D render with _cam
  // shifted so his tile lands where the 3D camera actually shows him.
  for (const n of ['drawWildBondOverlay']){
    if (typeof W[n] !== 'function') continue;
    O[n] = W[n];
    wrap(n, (orig, args) => {
      if (!HD.frameActive) return orig.apply(null, args);
      deferred.push(() => { const c = rizerScreenCam(); withCam(c.x, c.y, () => orig.apply(null, args)); });
    });
  }

  // ── THE CUT · world effects become a decal, UI resumes, the 3D frame renders ──
  wrap('drawNpcInfoOverlay', (orig, args) => {
    if (!HD.frameActive){
      if (_layered) setLayered(false);
      deferred.length = 0;
      return orig.apply(null, args);
    }
    if (_roomRecord) endRoomPass();
    try { captureDecal(); } catch(e){ console.warn('[hd] decal', e); }
    clear2d();
    const t0 = performance.now();
    try { renderFrame(); } catch(e){ console.error('[hd] render', e); }
    HD.stats.renderMs = Math.round((performance.now() - t0) * 10) / 10;
    // UI that waited for the cut · after the render, so it can use the 3D camera
    while (deferred.length){ try { deferred.shift()(); } catch(_){} }
    HD.frameActive = false;
    return orig.apply(null, args);
  });
}

// The _cam that puts Rizer's tile centre where the 3D camera draws his feet.
const _proj = new THREE.Vector3();
function rizerScreenCam(){
  _proj.set(player.x + 0.5, 0, player.y + 0.5).project(camera);
  const sx = (_proj.x + 1) / 2 * gameCanvas.width, sy = (1 - _proj.y) / 2 * gameCanvas.height;
  return { x: Math.round(player.x * T + T / 2 - sx), y: Math.round(player.y * T + T / 2 - sy) };
}
// The ground decal ACCUMULATES through the frame: anything that has to use the
// game canvas as scratch after the world layer (a mid-frame capture) first
// flushes what is already painted, so no AOE ring is ever wiped by it.
let _decalDirty = false;
function resetDecal(){
  _decalDirty = false;
  if (decal) decal.userData.ctx.clearRect(0, 0, decal.userData.canvas.width, decal.userData.canvas.height);
}
function flushToDecal(){
  if (_paintOps > 0){
    decal.userData.ctx.drawImage(gameCanvas, 0, 0);
    _decalDirty = true;
  }
  clear2d();
  _paintOps = 0;
}
function captureDecal(){
  flushToDecal();
  HD.stats.decal = _decalDirty;
  decal.visible = _decalDirty;
  if (!_decalDirty) return;
  const dc = decal.userData.ctx;
  decal.material.map.needsUpdate = true;
  decal.position.set(_cam.x / T + dc.canvas.width / T / 2, 0.04, _cam.y / T + dc.canvas.height / T / 2);
}

// ══════════════════════════════════════════════════════════════════════════
// FRAME · camera, light, sea, cleanup, render
// ══════════════════════════════════════════════════════════════════════════
const DISTRICT_AIR = {        // sky/fog per district · the place's own weather
  malezor:   0x9cc6e8, zarvane:  0xf0cf9a, andrannor: 0xb7a7e0, veridan:  0x9fd6b4,
  netharion: 0x6d6a9c, vorashil: 0x8e7fb8, xilnar:    0x5f6f86, baelgor:  0xc9b48e,
  thardin:   0xa59b8f, korathen: 0x7c5f8f,
};
const _focus = new THREE.Vector3();
let _lastT = 0, _focusInit = false;
const _air = new THREE.Color(), _airTarget = new THREE.Color();

function renderFrame(){
  setLayered(true);
  syncSize();
  const now = performance.now();
  const dt = Math.min(0.1, (now - (_lastT || now)) / 1000);
  _lastT = now;

  const inRoom = HD.mode === 'interior' && room;
  worldGroup.visible = !inRoom;
  roomGroup.visible = !!inRoom;

  // camera · follow the Rizer's feet (inside, held so the room stays framed)
  let fx = player.x + 0.5, fz = player.y + 0.5;
  if (inRoom){
    // hold the room's front edge at the bottom of the screen · how far below the
    // focus the frame reaches follows from the camera's own pitch, distance and lens
    const cl = (v, lo, hi) => lo > hi ? (lo + hi) / 2 : Math.max(lo, Math.min(hi, v));
    const pr = THREE.MathUtils.degToRad(cfg.roomPitchDeg), half = THREE.MathUtils.degToRad(cfg.fov / 2);
    const reach = cfg.roomDistance * Math.cos(pr) - cfg.roomDistance * Math.sin(pr) / Math.tan(pr + half);
    fx = cl(fx, 5, room.C - 5);
    fz = cl(fz, 3, room.R - reach + 1.3);   // + a margin so Rizer on the last row keeps his feet in frame
  }
  const camPitch = inRoom ? cfg.roomPitchDeg : cfg.pitchDeg;
  const camDist  = inRoom ? cfg.roomDistance : cfg.distance;
  if (!_focusInit || Math.hypot(_focus.x - fx, _focus.z - fz) > 12){ _focus.set(fx, 0, fz); _focusInit = true; }
  const k = 1 - Math.exp(-cfg.followRate * dt);
  _focus.x += (fx - _focus.x) * k; _focus.z += (fz - _focus.z) * k;
  const p = THREE.MathUtils.degToRad(camPitch);
  camera.fov = cfg.fov;
  camera.position.set(_focus.x, camDist * Math.sin(p), _focus.z + camDist * Math.cos(p));
  camera.lookAt(_focus.x, 0.8, _focus.z);
  camera.updateProjectionMatrix();

  // sun + shadow box ride with the focus
  sun.position.set(_focus.x + 11, 24, _focus.z + 13);   // front-right · faces lit, shadows fall back
  sun.target.position.set(_focus.x, 0, _focus.z - 4);
  sun.target.updateMatrixWorld();

  if (inRoom){
    // indoors · warm room light from the front, soft shadows, darkness past the walls
    scene.background.setHex(0x07060c);
    scene.fog.near = 400; scene.fog.far = 500;
    hemi.intensity = 0.86; hemi.color.setHex(0xfff2df); hemi.groundColor.setHex(0x3a2a1c);
    sun.intensity = 0.4; sun.color.setHex(0xffe6c4);
    sun.position.set(_focus.x + 4, 14, _focus.z + 10);
    lantern.intensity = 0;
    finishFrame();
    return;
  }
  hemi.groundColor.setHex(0x55603f);

  // district air and night
  let dist = 'malezor';
  try { dist = districtAt(Math.floor(player.x), Math.floor(player.y)) || dist; } catch(_){}
  _airTarget.setHex(DISTRICT_AIR[dist] || DISTRICT_AIR.malezor);
  const night = game.lightMode === 'night';
  if (night) _airTarget.multiplyScalar(0.18);
  _air.lerp(_airTarget, 1 - Math.exp(-2 * dt));
  scene.background.copy(_air);
  scene.fog.color.copy(_air);
  scene.fog.near = cfg.fogNear; scene.fog.far = cfg.fogFar;
  hemi.intensity = night ? 0.2 : 0.82;
  hemi.color.setHex(night ? 0x7088d0 : 0xffffff);
  sun.intensity = night ? 0.12 : 0.52;
  sun.color.setHex(night ? 0x9fb4ff : 0xfff0d8);
  lantern.intensity = night ? 2.6 : 0;
  lantern.position.set(fx, 1.3, fz + 0.2);

  // sea · the game's VOID_OCEAN_FLOW frames
  seaMesh.position.x = Math.round(_focus.x); seaMesh.position.z = Math.round(_focus.z);
  seaTex.offset.set(seaMesh.position.x / 2, -seaMesh.position.z / 2);
  try {
    const img = VOID_OCEAN_FLOW;
    if (img.complete && img.naturalWidth){
      const f = Math.floor(now / 190) % 16, cw = img.naturalWidth / 4, ch = img.naturalHeight / 4;
      if (f !== seaTex.userData.f){
        seaTex.userData.f = f;
        const sc = seaCanvas.getContext('2d');
        sc.drawImage(img, (f % 4) * cw + 1.5, Math.floor(f / 4) * ch + 1.5, cw - 3, ch - 3, 0, 0, 128, 128);
        seaTex.needsUpdate = true;
      }
    }
  } catch(_){}

  updateGround(fx, fz);
  finishFrame();
}
function finishFrame(){
  sweepFx();
  // sprites and props not drawn this frame go dark · long-gone ones are freed
  const frame = HD.stats.frames;
  let nA = 0, nP = 0;
  for (const [key, rec] of actors){
    if (rec.seen !== frame){ rec.mesh.visible = false; if (frame - rec.seen > 600) disposeActor(key, rec); }
    else nA++;
  }
  for (const [p, rec] of propRecs){
    if (rec.seen !== frame){
      rec.mesh.visible = false;
      if (frame - rec.seen > 1800){
        worldGroup.remove(rec.mesh); rec.mesh.geometry.dispose(); rec.mesh.material.dispose();
        rec.mesh.customDepthMaterial.dispose(); propRecs.delete(p);
      }
    } else nP++;
  }
  HD.stats.sprites = nA; HD.stats.props = nP;

  renderer.render(scene, camera);
}

// ── toggle ───────────────────────────────────────────────────────────────
HD.set = function(on){
  if (HD.broken){ try { showToast('◈ 2DHD unavailable on this device · classic view', 2600); } catch(_){} return; }
  HD.on = !!on;
  try { localStorage.setItem(LS_KEY, HD.on ? '1' : '0'); } catch(_){}
  if (!HD.on) setLayered(false);
  try { showToast(HD.on ? '◈ RP7B 2DHD · 3D world on (\u2318F for classic)' : '◈ Classic 2D view (\u2318F for 2DHD)', 2400); } catch(_){}
};
// ★ Cmd+F (Ctrl+F off the Mac) · Creator's binding. Captured on window in the
//   capture phase so it beats the game's own keydown listeners and the
//   browser's Find bar: the game never sees a stray 'f', and Find never opens.
W.addEventListener('keydown', (ev) => {
  if (ev.code !== 'KeyF' || !(ev.metaKey || ev.ctrlKey) || ev.altKey || ev.shiftKey) return;
  ev.preventDefault();
  ev.stopImmediatePropagation();
  if (!ev.repeat) HD.set(!HD.on);
}, true);
