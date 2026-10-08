// Assembles Malezor from data: terrain → structures → nature → lamps,
// and owns the physical queries (ground, water, collision, camera rays).
import * as THREE from 'three';
import { createTerrain } from './terrain.js';
import { createNature } from './nature.js';
import { RECIPES, bake } from './props.js';
import { Buckets } from './util.js';
import { quarterAt } from './world-data.js';
import { createMassGrid } from './massgrid.js';
import { createExpanse } from './expanse.js';
import { createVoidSea } from './void-sea.js';
import { VOID_SEA_LEVEL } from './overworld-land.js';

const TALL = { championStadium: 17, house: 9, townHall: 20, academy: 13, shop: 8, gearShop: 8, hospital: 8, zysphereShop: 11, research: 13, barn: 12, seerHQ: 14, seerGate: 9, districtGate: 14, sealedChest: 2.2, radioTower: 30, treehouse: 24, novariusStatue: 12, ufo: 6, fanghall: 14, bloodscentLodge: 14, firstDen: 14, fountain: 1.5, fallenTitan: 9, rubyCave: 14, bridge: 1.6, lamp: 4.5 };
const BUILDING_SCALE = {
  townHall: [1.3, 1.65], research: [1.9, 2.2], gearShop: [1.65, 1.9], shop: [1.65, 1.9],
  academy: [1.2, 1.8], barn: [1.7, 2], hospital: [1.2, 1.35], seerHQ: [1.2, 1.25]
};

export function createWorld(W, scene, shared) {
  const T = createTerrain(W, shared);
  scene.add(T.mesh, T.water);
  // Connected empty district terrain answers ground queries beyond Malezor.
  const expanse = createExpanse(T.heightAt, T.colorAt);
  scene.add(expanse.group);
  // Anywhere Rizer may stand: Malezor or an empty district. (containsLand stays Malezor only: it is what places
  // loot, nature and enemies, and none of those belong in the empty districts.)
  const onLand = (x, z) => !W.containsLand || W.containsLand(x, z) || expanse.contains(x, z);
  const sea = createVoidSea(shared); scene.add(sea);
  {
    const malezorHeightAt = T.heightAt, inlandWaterAt = T.waterAt;
    T.heightAt = (x, z) => {
      const h = expanse.heightAt(x, z);
      if (h !== null) return h;
      const malezor = (!W.containsLand || W.containsLand(x, z)) && Math.abs(x) <= W.extent - 1 && Math.abs(z) <= W.extent - 1;
      return malezor ? malezorHeightAt(x, z) : -46;
    };
    T.waterAt = (x, z) => onLand(x, z) ? inlandWaterAt(x, z) : VOID_SEA_LEVEL;
  }

  const obstacles = [], surfaces = [], interactables = [], lampLights = [], spinners = [], mapShapes = [];
  let ufoVehicle = null;
  const structures = new THREE.Group(); scene.add(structures);
  let natureGroup = null;

  function removeFoundation(group) {
    let pick = null, area = 0;
    for (const child of group.children) {
      const q = child.geometry?.parameters, p = child.position;
      if (!child.isMesh || child.geometry?.type !== 'BoxGeometry' || !q || Math.abs(p.y) > 0.06 || q.height < 1 || q.height > 1.8 || q.width < 8 || q.depth < 8) continue;
      const a = q.width * q.depth;
      if (a > area) { pick = child; area = a; }
    }
    if (!pick) return 0;
    const drop = pick.geometry.parameters.height / 2;
    group.remove(pick); pick.geometry.dispose();
    return drop;
  }

  function place(site, extra = {}) {
    const recipe = RECIPES[site.recipe]; if (!recipe) return null;
    const local = new THREE.Group();
    let baseY = T.heightAt(site.x, site.z);
    if (site.recipe === 'ufo') baseY -= 2.5; // sit the saucer's landing feet on the terrain
    if (site.recipe === 'rubyCave') baseY = T.heightAt(site.x, site.z + 5) - 0.2;
    if (site.recipe === 'fallenTitan') baseY -= 0.4;
    const cos = Math.cos(site.face || 0), sin = Math.sin(site.face || 0);
    const toWorld = (lx, lz) => [site.x + lx * cos + lz * sin, site.z - lx * sin + lz * cos];
    if (site.recipe === 'bridge') {
      const [ax, az] = toWorld(0, -site.span / 2 - 0.5), [bx, bz] = toWorld(0, site.span / 2 + 0.5);
      baseY = 0; site.deckY = Math.max(T.heightAt(ax, az), T.heightAt(bx, bz)) + 0.22;
    }
    const out = recipe(local, { ...site, ...extra }, { heightAt: T.heightAt });
    // RP7B buildings meet the land at their walls and supports; large floating
    // slab foundations in the 3D recipes lifted the entire structure.
    const footingDrop = removeFoundation(local); if (footingDrop) baseY -= footingDrop;
    const [sx, sz] = BUILDING_SCALE[site.recipe] || [1, 1];
    if (sx !== 1 || sz !== 1) {
      local.scale.set(sx, 1, sz);
      for (const c of out.colliders || []) { c.x *= sx; c.z *= sz; if (c.hw !== undefined) c.hw *= sx; if (c.hd !== undefined) c.hd *= sz; if (c.r !== undefined) c.r *= Math.max(sx, sz); }
      for (const s of out.surfaces || []) { s.x *= sx; s.z *= sz; if (s.hw !== undefined) s.hw *= sx; if (s.hd !== undefined) s.hd *= sz; if (s.radius !== undefined) s.radius *= Math.max(sx, sz); if (s.span !== undefined) s.span *= sz; }
      if (out.door) { out.door.x *= sx; out.door.z *= sz; }
      for (const wv of out.water || []) wv.r *= Math.max(sx, sz);
    }
    const g = bake(local);
    g.position.set(site.x, baseY, site.z); g.rotation.y = site.face || 0;
    structures.add(g);
    if (site.recipe === 'ufo') ufoVehicle = { root: g, groundY: baseY + 2.5, site, piloted: false, setPiloted(value) { this.piloted = !!value; } };
    g.traverse(o => { if (o.userData.spin) spinners.push(o); if (o.isLight && o.userData.ruby) shared.rubyLight = o; });
    if (shared.rubyLight?.parent === g) scene.attach(shared.rubyLight); // lights live in the scene itself, so hiding the town never changes the light count
    const top = baseY + (out.colliderTop ?? TALL[site.recipe] ?? 6);
    for (const c of (site.recipe === 'ufo' ? [] : out.colliders || [])) {
      const [x, z] = toWorld(c.x, c.z);
      const colliderTop = c.top === undefined ? top : baseY + c.top;
      if (c.type === 'circle') obstacles.push({ type: 'circle', x, z, r: c.r, top: colliderTop });
      else obstacles.push({ type: 'box', x, z, hw: c.hw, hd: c.hd, rot: (site.face || 0) + (c.rot || 0), top: colliderTop });
    }
    for (const s of (site.recipe === 'ufo' ? [] : out.surfaces || [])) { const [x, z] = toWorld(s.x, s.z); surfaces.push({ ...s, x, z, y: s.localY ? baseY + s.y : s.y, rot: site.face || 0 }); }
    if (out.mapShape) mapShapes.push({ ...out.mapShape, x: site.x, z: site.z, rot: site.face || 0 });
    for (const wv of out.water || []) {
      const gm = new THREE.CircleGeometry(wv.r, 32); gm.rotateX(-Math.PI / 2);
      const m = new THREE.Mesh(gm, shared.pondMat); m.position.set(site.x, baseY + wv.y, site.z); scene.add(m);
    }
    const door = out.door ? toWorld(out.door.x, out.door.z) : [site.x, site.z];
    if (site.name) {
      const movingUfo = site.recipe === 'ufo';
      const placeRef = {
        id: site.id, name: site.name, note: site.note, kind: site.kind, canon: !!site.canon, door: !!out.door,
        get x() { if (!movingUfo || !ufoVehicle) return door[0]; const a = ufoVehicle.root.rotation.y; return ufoVehicle.root.position.x + out.door.x * Math.cos(a) + out.door.z * Math.sin(a); },
        get z() { if (!movingUfo || !ufoVehicle) return door[1]; const a = ufoVehicle.root.rotation.y; return ufoVehicle.root.position.z - out.door.x * Math.sin(a) + out.door.z * Math.cos(a); },
        get cx() { return movingUfo && ufoVehicle ? ufoVehicle.root.position.x : site.x; },
        get cz() { return movingUfo && ufoVehicle ? ufoVehicle.root.position.z : site.z; },
        reach: site.recipe === 'championStadium' ? 16 : site.recipe === 'fallenTitan' ? 17 : site.recipe === 'rubyCave' ? 8 : site.recipe === 'fountain' ? 7.5 : 5.5,
        discover: site.kind !== 'home' || site.id === 'player-home'
      };
      interactables.push(placeRef);
      if (movingUfo) ufoVehicle.interactable = placeRef;
    }
    if (out.lampAt) { const [x, z] = toWorld(out.lampAt.x, out.lampAt.z); return { x, y: baseY + out.lampAt.y, z }; }
    return g;
  }

  shared.pondMat = T.waterMats.pond;
  for (const s of W.structures) place(s);
  for (const h of T.homes) place(h);
  for (const l of W.landmarks) place(l);

  // Street lamps: plaza ring + the lanes. The four nearest the square carry real lights.
  const lampSpots = [];
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.39; lampSpots.push([W.plaza.x + Math.sin(a) * (W.plaza.r + 1.5), W.plaza.z + Math.cos(a) * (W.plaza.r + 1.5), a + Math.PI / 2]); }
  for (const rd of W.roads) {
    const line = T.roads.lines.find(l => l.id === rd.id), pts = line.pts;
    for (let i = 14; i < pts.length - 6; i += 18) {
      const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], L = Math.hypot(x1 - x0, z1 - z0) || 1, side = (i / 18) % 2 ? 1 : -1;
      const nx = -(z1 - z0) / L, nz = (x1 - x0) / L, x = x0 + nx * (rd.width + 1.4) * side, z = z0 + nz * (rd.width + 1.4) * side;
      if (Math.hypot(x - W.plaza.x, z - W.plaza.z) < W.plaza.r + 5) continue;
      if (Math.hypot(x, z - 4) > 62 || quarterAt(x, z, W) === 'highland') continue; // lamps belong to the settled belt, not the wild
      if (T.riverIdx.nearest(x, z, 4)) continue;
      if (obstacles.some(o => Math.hypot(o.x - x, o.z - z) < (o.type === 'box' ? Math.max(o.hw, o.hd) + 1 : o.r + 1))) continue;
      lampSpots.push([x, z, Math.atan2(-nx * side, -nz * side) - Math.PI / 2]);
    }
  }
  lampSpots.forEach(([x, z, face], i) => {
    const at = place({ id: 'lamp-' + i, recipe: 'lamp', x, z, face });
    if (i % 2 === 0 && i < 8) { const L = new THREE.PointLight('#ffc27a', 0, 20, 1.8); L.position.set(at.x, at.y, at.z); scene.add(L); lampLights.push(L); }
  });

  // Nature last, so it can see every pad and obstacle.
  const nature = createNature(W, T, shared, obstacles, interactables);
  natureGroup = nature; scene.add(nature);

  // The old horizon cones sat beyond supported terrain. Actual land and the
  // sea now provide the horizon, with no suspended decorative mountains.

  // ── Physical queries ────────────────────────────────────────────────
  const buckets = new Buckets(8);
  for (const o of obstacles) { o.br = o.type === 'box' ? Math.hypot(o.hw, o.hd) : o.r; buckets.add({ ...o, r: o.br, ref: o }); }

  // cam: the camera's view of the ground — every surface counts from any height (it never dips under a roof or the
  // stands), except `open` ones (a roof over a tunnel), which only count once it's above them.
  function surfaceAt(x, z, y, list = surfaces, cam = false) {
    let best = -Infinity;
    for (const s of list) {
      // Pyramid roof proxies do not match the rotated, non-square scaled mesh.
      // Their actual walkable faces are sampled from the rendered triangles below.
      if (list === surfaces && !cam && s.shape === 'pyramid') continue;
      const dx = x - s.x, dz = z - s.z, c = Math.cos(s.rot), sn = Math.sin(s.rot);
      const lx = dx * c - dz * sn, lz = dx * sn + dz * c;
      let top;
      if (s.shape === 'gable') {
        if (Math.abs(lx) > s.hw || Math.abs(lz) > s.hd) continue;
        top = s.y + s.h * (1 - Math.abs(lz) / s.hd);
      } else if (s.shape === 'pyramid') {
        const edge = Math.max(Math.abs(lx), Math.abs(lz)) / s.radius;
        if (edge > 1) continue;
        top = s.y + s.h * (1 - edge);
      } else if (s.shape === 'circle') {
        if (lx * lx + lz * lz > s.radius * s.radius) continue;
        top = s.y;
      } else if (s.shape === 'bowl') { // the stands of a stadium: a sloped ring between two ellipses, profile y(t) from arena edge (t 0) to facade (t 1)
        if (Math.abs(lx) > s.Ax || Math.abs(lz) > s.Bz || Math.abs(lx) < s.gap) continue;
        if ((lx / s.Ax) ** 2 + (lz / s.Bz) ** 2 > 1 || (lx / s.ax) ** 2 + (lz / s.bz) ** 2 < 1) continue;
        let lo = 0, hi = 1;
        for (let k = 0; k < 16; k++) { const m = (lo + hi) / 2, a = s.ax + (s.Ax - s.ax) * m, b = s.bz + (s.Bz - s.bz) * m; if ((lx / a) ** 2 + (lz / b) ** 2 > 1) lo = m; else hi = m; }
        const t = (lo + hi) / 2, P = s.prof; if (t < P[0][0] || t > P[P.length - 1][0]) continue;
        let j = 1; while (j < P.length - 1 && P[j][0] < t) j++;
        const [t0, y0] = P[j - 1], [t1, y1] = P[j]; top = s.y + y0 + (y1 - y0) * (t1 > t0 ? (t - t0) / (t1 - t0) : 1);
      } else if (s.shape === 'stairs') { // real steps rising along local +Z: each tread its own height
        if (Math.abs(lx) > s.hw || Math.abs(lz) > s.hd) continue;
        const k = Math.min(s.n - 1, Math.max(0, Math.floor((lz + s.hd) / (2 * s.hd) * s.n)));
        top = s.y + (k + 1) * s.h / s.n;
      } else if (s.shape === 'ramp') { // straight stairs rising along local +Z
        if (Math.abs(lx) > s.hw || Math.abs(lz) > s.hd) continue;
        top = s.y + s.h * (lz + s.hd) / (2 * s.hd);
      } else if (s.shape === 'sphereCap') {
        const d2 = lx * lx + lz * lz;
        if (d2 > s.radius * s.radius) continue;
        top = s.y + Math.sqrt(Math.max(0, s.radius * s.radius - d2));
      } else {
        if (Math.abs(lx) > s.hw || Math.abs(lz) > s.hd) continue;
        top = s.y + (s.arch ? Math.sin((lz / s.span + 0.5) * Math.PI) * s.arch : 0);
      }
      // Only catch a descending player just above the actual surface; this
      // avoids snapping up from below or teleport-like rooftop corrections.
      if (cam ? (!s.open || y >= top - 0.28) : (y === undefined || y >= top - 0.28)) best = Math.max(best, top);
    }
    // Mesh tops are the source of truth for props and natural objects. A small
    // footprint check avoids treating thin vertical faces as landing pads.
    if (!cam && list === surfaces && Number.isFinite(y) && mass) {
      const meshTop = mass.standableAt(x, z, y, 0.24);
      if (Number.isFinite(meshTop) && meshTop > T.heightAt(x, z) + 0.25) best = meshTop;
    }
    if (ufoVehicle && !ufoVehicle.piloted) {
      const dx = x - ufoVehicle.root.position.x, dz = z - ufoVehicle.root.position.z, d = Math.hypot(dx, dz), rootY = ufoVehicle.root.position.y;
      let deck = -Infinity;
      if (d < 7.6) deck = rootY + 5.55;
      if (d < 3.8) deck = Math.max(deck, rootY + 5.45 + Math.sqrt(3.8 * 3.8 - d * d));
      if (deck > -Infinity && (y === undefined || y >= deck - 0.28)) best = Math.max(best, deck);
    }
    return best;
  }
  function groundAt(x, z, y) { return Math.max(T.heightAt(x, z), surfaceAt(x, z, y)); }
  // Material-aware ground normal. The same query drives feet, bodies and steep-slope
  // handling, so a roof, stair or terrain face never disagrees with collision height.
  function groundNormalAt(x, z, y, span = 0.32) {
    const hL = groundAt(x - span, z, y), hR = groundAt(x + span, z, y);
    const hD = groundAt(x, z - span, y), hU = groundAt(x, z + span, y);
    return new THREE.Vector3(hL - hR, span * 2, hD - hU).normalize();
  }
  const camFloor = (x, z, y) => Math.max(T.heightAt(x, z), surfaceAt(x, z, y, surfaces, true));

  // Universal collision (massgrid.js): every visible solid mesh blocks, bushes only when not sneaking.
  for (const s of surfaces) s.br = s.radius ?? Math.hypot(s.hw || 0, s.hd || 0) + (s.span || 0);
  const mass = createMassGrid({
    floorAt: (x, z, y, list) => Math.max(T.heightAt(x, z), surfaceAt(x, z, y, list)),
    surfacesIn: (x0, z0, x1, z1) => surfaces.filter(s => s.x + s.br >= x0 && s.x - s.br <= x1 && s.z + s.br >= z0 && s.z - s.br <= z1)
  });
  if (ufoVehicle) ufoVehicle.root.userData.noCollide = true; // it flies; it keeps its own collider below
  mass.add(structures); mass.add(nature);
  nature.userData.stones?.setDisableInstance((mesh, index) => mass.disableInstance(mesh, index));
  nature.userData.trees?.setDisableInstance((mesh, index) => mass.disableInstance(mesh, index));

  // Keep movement on the RP7B coast mask. This is the single intentional
  // invisible world boundary; movement is clipped to its edge, never relocated.
  function keepOnLand(p, fromX = p.x, fromZ = p.z) {
    if (onLand(p.x, p.z)) return false;
    const dx = p.x - fromX, dz = p.z - fromZ;
    let lo = 0, hi = 1;
    for (let i = 0; i < 14; i++) {
      const m = (lo + hi) * 0.5;
      if (onLand(fromX + dx * m, fromZ + dz * m)) lo = m; else hi = m;
    }
    p.x = fromX + dx * lo; p.z = fromZ + dz * lo;
    return true;
  }

  // Push a circle of radius `rad` out of every nearby obstacle. Mutates p (Vector3).
  function resolve(p, rad, opts) {
    let hit = false;
    const support = surfaceAt(p.x, p.z, p.y + 0.46);
    const supportedTop = opts?.landedOnSurface || (Number.isFinite(support) && Math.abs(support - p.y) <= 0.32);
    const landingApproach = opts?.descending && Number.isFinite(support) && p.y >= support - 0.74 && p.y <= support + 0.2;
    for (let it = 0; it < 2; it++) for (const b of buckets.near(p.x, p.z, rad)) {
      const o = b.ref;
      if (o.active === false) continue;
      // The collider is a vertical side wall only up to its real material top.
      // At roof height the rooftop surface takes over instead of ejecting the player.
      if (o.top !== undefined && p.y >= o.top - 0.025) continue;
      // The box is still a side wall, but once a real top has caught the
      // player it must not push him sideways because its rough bound is taller.
      if ((supportedTop || landingApproach) && o.type === 'box') continue;
      if (o.type === 'circle') {
        const dx = p.x - o.x, dz = p.z - o.z, d = Math.hypot(dx, dz), m = o.r + rad;
        if (d < m && d > 1e-5) { p.x = o.x + dx / d * m; p.z = o.z + dz / d * m; hit = true; }
      } else {
        const c = Math.cos(o.rot || 0), s = Math.sin(o.rot || 0), dx = p.x - o.x, dz = p.z - o.z;
        let lx = dx * c - dz * s, lz = dx * s + dz * c;
        const qx = THREE.MathUtils.clamp(lx, -o.hw, o.hw), qz = THREE.MathUtils.clamp(lz, -o.hd, o.hd);
        let ex = lx - qx, ez = lz - qz, d = Math.hypot(ex, ez);
        if (d >= rad) continue;
        if (d < 1e-5) { // centre inside: exit through the nearest face
          const px = o.hw - Math.abs(lx), pz = o.hd - Math.abs(lz);
          if (px < pz) lx = Math.sign(lx || 1) * (o.hw + rad); else lz = Math.sign(lz || 1) * (o.hd + rad);
        } else { lx = qx + ex / d * rad; lz = qz + ez / d * rad; }
        p.x = o.x + lx * c + lz * s; p.z = o.z - lx * s + lz * c; hit = true;
      }
    }
    if (ufoVehicle && !ufoVehicle.piloted) {
      const o = ufoVehicle.root.position, dx = p.x - o.x, dz = p.z - o.z, d = Math.hypot(dx, dz), min = 8 + rad, top = o.y + 5.55;
      if (!supportedTop && !landingApproach && d < min && p.y < top - 0.025) {
        const n = d > 1e-5 ? 1 / d : 1;
        p.x = o.x + (d > 1e-5 ? dx * n : 1) * min; p.z = o.z + (d > 1e-5 ? dz * n : 0) * min; hit = true;
      }
    }
    if (!landingApproach && mass.resolve(p, rad, opts)) hit = true;
    return hit;
  }

  // Cheap camera ray: march against the heightfield and building volumes.
  function rayClear(from, to, pad = 0.35) {
    const dir = to.clone().sub(from), len = dir.length(); dir.divideScalar(len);
    const pt = new THREE.Vector3();
    for (let t = 0.6; t < len; t += 0.3) {
      pt.copy(from).addScaledVector(dir, t);
      if (pt.y < camFloor(pt.x, pt.z, pt.y) + pad) return t - 0.3;
      const c = mass.cellAt(pt.x, pt.z); // tall solid mass (walls, towers, the stadium's stands and gates): the camera stays on Rizer's side of it
      if (c && (c.f & 1) && pt.y < c.top - 0.1 && c.top - T.heightAt(pt.x, pt.z) > 2.5) return t - 0.3;
      for (const b of buckets.near(pt.x, pt.z, 0.4)) {
        const o = b.ref; if (o.active === false || o.top === undefined || pt.y > o.top || (o.type === 'circle' && o.r < 1.2)) continue;
        if (o.type === 'circle') { if (Math.hypot(pt.x - o.x, pt.z - o.z) < o.r + pad) return t - 0.3; }
        else { const c = Math.cos(o.rot || 0), s = Math.sin(o.rot || 0), dx = pt.x - o.x, dz = pt.z - o.z; if (Math.abs(dx * c - dz * s) < o.hw + pad && Math.abs(dx * s + dz * c) < o.hd + pad) return t - 0.3; }
      }
    }
    return len;
  }

  let exterior = true;
  function update(t, night) {
    if (!exterior) return; // indoors the town's lights are lighting the house
    for (const s of spinners) s.rotation.y += 0.008 * s.userData.spin * 60 / 60;
    for (const L of lampLights) L.intensity = night * 7;
    if (shared.rubyLight) shared.rubyLight.intensity = 5 + night * 16 + Math.sin(t * 1.3) * 2;
  }

  // Props added after the build (chests, loot) register their colliders here.
  function addObstacle(o) { if (o.mesh) mass.add(o.mesh); o.br = o.type === 'box' ? Math.hypot(o.hw, o.hd) : o.r; obstacles.push(o); buckets.add({ ...o, r: o.br, ref: o }); }
  function addMesh(mesh) { mass.add(mesh); }
  function setExteriorVisible(value) {
    const v = !!value; T.mesh.visible = v; T.water.visible = v; structures.visible = v;
    if (natureGroup) natureGroup.visible = v; expanse.group.visible = v; sea.visible = v;
    exterior = v; // lights stay visible (see game.js · borrowed lights)
  }
  return { T, mass, structures, nature: natureGroup, heightAt: T.heightAt, waterAt: T.waterAt, groundAt, groundNormalAt, surfaceAt, resolve, rayClear, keepOnLand, containsLand: W.containsLand || (() => true), onLand, expanse, sea, interactables, obstacles, mapShapes, camFloor, addObstacle, addMesh, update, homes: T.homes, lampLights, ufo: ufoVehicle, setExteriorVisible };
}
