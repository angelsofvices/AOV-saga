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
//     · F7 in game (persists), or
//     · rp7b.html?hd=1   (rp7b.html?hd=0 forces it off)
//   Interiors, the title and Dreamland render classic 2D for now.
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
};

// ── state ────────────────────────────────────────────────────────────────
const HD = {
  on: false,
  cfg,
  stats: { worldMs: 0, renderMs: 0, chunks: 0, chunkBakes: 0, sprites: 0, props: 0, captures: 0, decal: false, frames: 0 },
  frameActive: false,    // this frame is an overworld frame drawn by HD
  capturing: false,      // inside the wrapped drawWorldLayer
};
W.RP7B_HD = HD;
HD._actors = () => [...actors.values()].map(r => r.kind + ':' + r.win.w + 'x' + r.win.h);

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
];
const O = {};
for (const n of NAMES){
  if (typeof W[n] !== 'function'){ console.warn('[hd] missing game function ' + n + ' · HD disabled'); HD.broken = true; }
  O[n] = W[n];
}

// ── renderer, scene, camera ───────────────────────────────────────────────
let renderer = null, scene, camera, hemi, sun, lantern, seaMesh, seaTex, seaCanvas, decal;
const glCanvas = document.createElement('canvas');
glCanvas.id = 'hd3d';
glCanvas.style.cssText = 'position:absolute; pointer-events:none; z-index:0; display:none;';

function initRenderer(){
  if (renderer) return true;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, alpha: false,
                                         powerPreference: 'high-performance' });
  } catch(err){
    console.error('[hd] WebGL unavailable · staying classic 2D', err);
    HD.broken = true; return false;
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;      // ★ the art's own colours, not a filmic regrade
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0820);
  scene.fog = new THREE.Fog(0x0b0820, cfg.fogNear, cfg.fogFar);

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
  scene.add(seaMesh);

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

  const stage = gameCanvas.parentElement;
  stage.insertBefore(glCanvas, gameCanvas);
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
let _paintOps = 0;
for (const m of ['drawImage','fillRect','fill','stroke','fillText','strokeText','strokeRect','putImageData']){
  const f = g2d[m];
  if (typeof f === 'function') g2d[m] = function(){ _paintOps++; return f.apply(this, arguments); };
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
    scene.add(rec.mesh);
    if (rec.skirt) scene.add(rec.skirt);
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
        scene.remove(rec.mesh); rec.mesh.geometry.dispose(); rec.mesh.material.dispose(); rec.tex.dispose();
        if (rec.skirt){ scene.remove(rec.skirt); rec.skirt.geometry.dispose(); }
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
function propGeometry(p, rec){
  const [bx, by, bw, bh] = p.bbox;
  const w = p.tileW, h = w * (bh / bw);
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
  const sig = (p.img && p.img.src || '') + '|' + p.bbox.join(',') + '|' + p.tileW + '|' + (p.mirrorX ? 1 : 0);
  if (rec && rec.sig !== sig){
    scene.remove(rec.mesh); rec.mesh.geometry.dispose(); rec.mesh.material.dispose();
    rec.mesh.customDepthMaterial.dispose();
    propRecs.delete(p); rec = null;
  }
  if (!rec){
    const tex = texForImage(p.img);
    const geo = propGeometry(p, null);
    const mesh = new THREE.Mesh(geo.g, spriteMaterial(tex));
    mesh.customDepthMaterial = spriteDepth(tex);
    mesh.castShadow = true;
    rec = { mesh, geo, sig, seen: 0, lastSrcX: -1 };
    scene.add(mesh);
    propRecs.set(p, rec);
  }
  let srcX = rec.geo.bx;
  if (p._animCells && p._animCells > 1 && p._animCellW)
    srcX = rec.geo.bx + (Math.floor(performance.now() / 220) % p._animCells) * p._animCellW;
  if (srcX !== rec.lastSrcX){ propUV(rec, p, srcX); rec.lastSrcX = srcX; }
  const lev = p._levitate ? Math.sin(performance.now() / 500) * 4 / T : 0;
  rec.mesh.position.set(p.tileX + 0.5, lev, p.tileY + 0.5 + (p.subY || 0));
  rec.mesh.rotation.x = -cfg.lean;
  rec.mesh.visible = true;
  rec.seen = HD.stats.frames;
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
  wrap('drawOceanUnderlayer', (orig, args) => {
    HD.frameActive = HD.on && game.scene === 'overworld' && initRenderer();
    if (!HD.frameActive) return orig.apply(null, args);
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
function captureDecal(){
  const had = _paintOps > 0;
  HD.stats.decal = had;
  decal.visible = had;
  if (!had) return;
  const dc = decal.userData.ctx;
  dc.clearRect(0, 0, dc.canvas.width, dc.canvas.height);
  dc.drawImage(gameCanvas, 0, 0);
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

  // camera · follow the Rizer's feet
  const fx = player.x + 0.5, fz = player.y + 0.5;
  if (!_focusInit || Math.hypot(_focus.x - fx, _focus.z - fz) > 12){ _focus.set(fx, 0, fz); _focusInit = true; }
  const k = 1 - Math.exp(-cfg.followRate * dt);
  _focus.x += (fx - _focus.x) * k; _focus.z += (fz - _focus.z) * k;
  const p = THREE.MathUtils.degToRad(cfg.pitchDeg);
  camera.fov = cfg.fov;
  camera.position.set(_focus.x, cfg.distance * Math.sin(p), _focus.z + cfg.distance * Math.cos(p));
  camera.lookAt(_focus.x, 0.8, _focus.z);
  camera.updateProjectionMatrix();

  // sun + shadow box ride with the focus
  sun.position.set(_focus.x + 11, 24, _focus.z + 13);   // front-right · faces lit, shadows fall back
  sun.target.position.set(_focus.x, 0, _focus.z - 4);
  sun.target.updateMatrixWorld();

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
        scene.remove(rec.mesh); rec.mesh.geometry.dispose(); rec.mesh.material.dispose();
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
  try { showToast(HD.on ? '◈ RP7B 2DHD · 3D world on (F7 for classic)' : '◈ Classic 2D view (F7 for 2DHD)', 2400); } catch(_){}
};
W.addEventListener('keydown', (ev) => {
  if (ev.code === 'F7' && !ev.repeat){ ev.preventDefault(); HD.set(!HD.on); }
});
