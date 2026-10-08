import * as THREE from 'three';
import { createN3000Prop } from './n3000-prop.js';
import { buildGuitar } from './loot.js';
import { Actor, loadGLB } from './actor.js';

// RP7B's 15x10 room grid and furniture anchors, rebuilt with RP7D low-poly props.
const COLS = 15, ROWS = 10, TILE = 1.5, HALF_W = COLS * TILE / 2, HALF_D = ROWS * TILE / 2;
const cell = (x, row, floorY) => new THREE.Vector3((x - 7) * TILE, floorY, (row - 4.5) * TILE);
const STAIR_COL = 0.5, STAIR_ROW = 1.8;
const CONSOLE_SCALE = 0.45; // the N3000 and its pad at real console size beside the furniture

export function createHomeInterior(scene) {
  const root = new THREE.Group(); root.name = 'RizerHomeInterior'; scene.add(root);
  const mat = (color, roughness = 0.82, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, flatShading: true, ...extra });
  const wood = mat('#755039'), darkWood = mat('#422d26'), cream = mat('#e6d4b2'), trim = mat('#b18a55'), floorMat = mat('#8b6241'), floorAlt = mat('#795538'), rug = mat('#743d38'), gold = mat('#c9a34d', 0.45, { metalness: 0.3 }), glass = mat('#9bcde2', 0.38, { emissive: '#315c70', emissiveIntensity: 0.38 }), ceilingMat = mat('#c7b590');
  const box = (parent, w, h, d, material, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material); m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; };
  const cyl = (parent, rt, rb, h, material, x, y, z, seg = 8) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), material); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m; };
  const orb = (parent, r, material, x, y, z) => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), material); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m; };
  const blockers = { 1: [], 2: [] };
  let consoleRoot = null, n3000Screen = null, floorGuitar = null;
  let frontDoor = null; // the front door's hinge group (inside view)
  const residents = [];
  const NPCS_ON_HOLD = true;
  const residentModel = NPCS_ON_HOLD ? Promise.resolve(null) : loadGLB('./assets/rizer/rizer.glb').catch(error => { console.warn('[rp7d] family NPC model unavailable', error); return null; });

  function sideWindow(room, floorY, x) {
    const wallH = 3.9, winW = 2.8, winBottom = 1.35, winTop = 2.85, side = Math.sign(x);
    const sideLen = HALF_D * 2, segment = (sideLen - winW) / 2;
    for (const sign of [-1, 1]) box(room, 0.34, wallH, segment, cream, x, floorY + wallH / 2, sign * (winW / 2 + segment / 2));
    box(room, 0.34, winBottom, winW, cream, x, floorY + winBottom / 2, 0);
    box(room, 0.34, wallH - winTop, winW, cream, x, floorY + (wallH + winTop) / 2, 0);
    const frameX = x - side * 0.2;
    for (const z of [-winW / 2, 0, winW / 2]) box(room, 0.12, winTop - winBottom + 0.16, 0.12, trim, frameX, floorY + (winBottom + winTop) / 2, z);
    box(room, 0.14, 0.14, winW + 0.12, trim, frameX, floorY + winBottom, 0);
    box(room, 0.14, 0.14, winW + 0.12, trim, frameX, floorY + winTop, 0);
    const pane = winW / 2 - 0.11;
    for (const z of [-winW / 4, winW / 4]) box(room, 0.055, winTop - winBottom - 0.16, pane, glass, x - side * 0.1, floorY + (winBottom + winTop) / 2, z);
    const daylight = new THREE.PointLight('#c9e8ff', 6.5, 15, 1.8); daylight.position.set(x - side * 0.75, floorY + 2.1, 0); room.add(daylight);
  }

  function addCeiling(floorY, openStairwell, openingOnly = false) {
    const ceiling = new THREE.Group(); ceiling.name = `InteriorCeiling-${floorY}`; root.add(ceiling);
    const y = floorY + 3.9 - 0.1;
    for (let row = 0; row < ROWS; row++) for (let col = 0; col < COLS; col++) {
      const opening = col <= 2 && row <= 3;
      if (openStairwell && opening || openingOnly && !opening) continue;
      const p = cell(col, row, floorY);
      box(ceiling, TILE + 0.015, 0.18, TILE + 0.015, ceilingMat, p.x, y, p.z);
    }
    return ceiling;
  }

  function standingLamp(room, floorY, x, z) {
    cyl(room, 0.34, 0.38, 0.14, darkWood, x, floorY + 0.07, z);
    cyl(room, 0.07, 0.09, 1.75, gold, x, floorY + 0.98, z, 6);
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.55, 8), cream); shade.position.set(x, floorY + 1.98, z); shade.rotation.x = Math.PI; shade.castShadow = true; room.add(shade);
    const glow = new THREE.PointLight('#ffe0a2', 7, 10, 1.8); glow.position.set(x, floorY + 1.8, z); room.add(glow);
  }

  function addRoom(level, label) {
    const floorY = level === 1 ? 0 : 4.25, room = new THREE.Group(); room.name = label; root.add(room);
    // RP7B's shared 15 x 10 wood-floor footprint. The upper stairwell is a real opening.
    if (level === 1) box(room, HALF_W * 2, 0.3, HALF_D * 2, darkWood, 0, floorY - 0.18, 0);
    for (let row = 0; row < ROWS; row++) for (let col = 0; col < COLS; col++) {
      if (level === 2 && col <= 2 && row <= 3) continue;
      const p = cell(col, row, floorY);
      if (level === 2) box(room, TILE - 0.035, 0.3, TILE - 0.035, darkWood, p.x, floorY - 0.18, p.z);
      box(room, TILE - 0.035, 0.045, TILE - 0.035, (row + col) % 2 ? floorMat : floorAlt, p.x, floorY - 0.012, p.z);
    }
    const wallH = 3.9, wallY = floorY + wallH / 2;
    // Rear and side walls; the front wall has the same centered door as the RP7B floor plan.
    box(room, HALF_W * 2, wallH, 0.34, cream, 0, wallY, -HALF_D);
    sideWindow(room, floorY, -HALF_W);
    sideWindow(room, floorY, HALF_W);
    const doorW = 2.4;
    box(room, (HALF_W * 2 - doorW) / 2, wallH, 0.34, cream, -(doorW + HALF_W * 2) / 4, wallY, HALF_D);
    box(room, (HALF_W * 2 - doorW) / 2, wallH, 0.34, cream, (doorW + HALF_W * 2) / 4, wallY, HALF_D);
    box(room, doorW, 1.2, 0.34, cream, 0, floorY + wallH - 0.6, HALF_D);
    if (level === 1) { // the front door, seen from inside: a live leaf hinged at the doorway's west edge, and a fixed side panel
      const leafW = 1.6, leafH = wallH - 1.2;
      box(room, doorW - leafW, leafH, 0.2, darkWood, -doorW / 2 + leafW + (doorW - leafW) / 2, floorY + leafH / 2, HALF_D);
      frontDoor = new THREE.Group(); frontDoor.name = 'homeDoorInside'; frontDoor.position.set(-doorW / 2, floorY, HALF_D); room.add(frontDoor);
      box(frontDoor, leafW, leafH, 0.14, darkWood, leafW / 2, leafH / 2, 0);
      box(frontDoor, 0.08, 0.08, 0.3, gold, leafW - 0.15, 1.1, 0);
    }
    // timber posts and crown rail sit directly on the floor / wall tops
    for (const x of [-HALF_W + 0.22, HALF_W - 0.22]) for (const z of [-HALF_D + 0.22, HALF_D - 0.22]) box(room, 0.42, wallH, 0.42, darkWood, x, wallY, z);
    box(room, HALF_W * 2, 0.22, 0.28, trim, 0, floorY + wallH - 0.12, -HALF_D + 0.12);
    const light = new THREE.PointLight('#ffe0aa', level === 1 ? 32 : 28, 30, 1.6); light.position.set(0, floorY + 3.0, 0); room.add(light);
    const fill = new THREE.PointLight('#93c9ff', 8, 19, 1.8); fill.position.set(5, floorY + 2.5, -4); room.add(fill);
    return { room, floorY };
  }
  const first = addRoom(1, 'RizerHomeLivingRoom'), second = addRoom(2, 'RizerHomeBedroom');
  for (const r of [first.room, second.room]) r.children.forEach(o => { o.userData.structure = true; }); // floor, walls, windows, room lights: never part of a piece of furniture
  // The upstairs room is a separate visibility layer. Hide it from the living
  // room so a high camera angle cannot reveal the bedroom through the ceiling.
  second.room.visible = false;
  addCeiling(first.floorY, true);
  const stairwellCover = addCeiling(first.floorY, false, true); stairwellCover.visible = false;
  // Keep the upper roof visible even while the bedroom itself is hidden; the
  // open stairwell therefore looks into the house, never out into the sky.
  addCeiling(second.floorY, false);
  function stair(level, floorY, flipped = false) {
    const p = cell(STAIR_COL, STAIR_ROW, floorY), group = new THREE.Group(); group.position.set(p.x, floorY, p.z); root.add(group);
    // Real steps at the scale of the stair clips (one step: 0.30 up, 0.36 along): 14 risers over the flight. Treads 1..13 are boxes;
    // tread 0 is the floor itself and the last riser meets the upstairs floor. stairGround() below follows the same risers.
    const count = 14, width = TILE * 2.2, depth = TILE * 3.4, rise = 4.25 / count, run = depth / count;
    for (let i = 1; i < count; i++) {
      const h = rise * i, z = (flipped ? 1 : -1) * (depth / 2 - (i + 0.5) * run);
      box(group, width, h, run, i % 2 ? floorMat : darkWood, 0, h / 2, z);
      box(group, width, 0.03, 0.05, trim, 0, h + 0.015, z + (flipped ? 1 : -1) * (run / 2 - 0.025)); // the nosing
    }
    for (const side of [-1, 1]) {
      const rail = box(group, 0.12, 0.12, depth + 0.3, trim, side * (width / 2 + 0.08), 2.1, 0);
      rail.rotation.x = flipped ? 0.695 : -0.695;
    }
    // The tiled trigger zone at the foot stays walkable, as in RP7B.
  }
  // One continuous flight connects the two actual floors, rising toward the
  // northwest opening so the lower landing stays clear in the living room.
  stair(1, first.floorY, true);

  // RP7B living room: stairwell upper-left, plant moved away from the flipped stair landing.
  {
    const p = cell(8, 5, first.floorY);
    box(first.room, 7.2, 0.08, 2.4, rug, p.x, first.floorY + 0.035, p.z);
    box(first.room, 5.1, 0.72, 1.55, mat('#5d453e'), p.x, first.floorY + 0.58, p.z + 0.15);
    box(first.room, 5.1, 1.35, 0.48, mat('#725447'), p.x, first.floorY + 1.0, p.z - 0.62);
    for (const dx of [-2.2, 2.2]) box(first.room, 0.55, 1.1, 1.7, mat('#806052'), p.x + dx, first.floorY + 0.75, p.z + 0.08);
    for (const dx of [-1.3, 0, 1.3]) box(first.room, 1.18, 0.2, 1.0, mat('#9a7560'), p.x + dx, first.floorY + 1.02, p.z + 0.06);
    const tv = cell(14, 5, first.floorY); box(first.room, 0.55, 2.2, 0.65, darkWood, tv.x, first.floorY + 1.1, tv.z);
    box(first.room, 0.12, 1.45, 0.82, glass, tv.x - 0.34, first.floorY + 1.55, tv.z);
    box(first.room, 0.8, 0.18, 0.92, trim, tv.x - 0.28, first.floorY + 0.2, tv.z);
    const plant = cell(4, 1, first.floorY); cyl(first.room, 0.48, 0.62, 0.8, mat('#865e42'), plant.x, first.floorY + 0.4, plant.z);
    for (let i = 0; i < 5; i++) { const leaf = orb(first.room, 0.4, mat('#527746'), plant.x + Math.sin(i * 1.25) * 0.45, first.floorY + 1.15 + (i % 2) * 0.25, plant.z + Math.cos(i * 1.25) * 0.45); leaf.scale.set(0.7, 1.8, 0.6); }
    const coffee = cell(8, 7, first.floorY);
    box(first.room, 2.25, 0.16, 1.15, darkWood, coffee.x, first.floorY + 0.52, coffee.z);
    for (const dx of [-0.92, 0.92]) for (const dz of [-0.4, 0.4]) box(first.room, 0.12, 0.48, 0.12, trim, coffee.x + dx, first.floorY + 0.24, coffee.z + dz);
    standingLamp(first.room, first.floorY, -4.8, 2.7);
    blockers[1].push({ x: p.x, z: p.z, hw: 2.7, hd: 1.05 }, { x: tv.x, z: tv.z, hw: 0.75, hd: 0.65, top: first.floorY + 2.25 }, { x: plant.x, z: plant.z, hw: 0.65, hd: 0.65, top: first.floorY + 2 }, { x: coffee.x, z: coffee.z, hw: 1.2, hd: 0.65, top: first.floorY + 0.65 }, { x: -4.8, z: 2.7, hw: 0.42, hd: 0.42, top: first.floorY + 2.4 });
  }

  // RP7B household anchors. Mom and Yara use the same detailed rigged character
  // build as Rizer and the Seers; their canonical hair, skin and clothing palettes
  // are carried over from the stored NPC references.
  function resident(name, col, row, look, lines) {
    const p = cell(col, row, first.floorY), g = new THREE.Group(); g.position.set(p.x, first.floorY, p.z); first.room.add(g);
    residents.push({ name, position: p, lines, lineIndex: 0, root: g, look, phase: name === 'Mom' ? 0.7 : 2.1, talk: 0, homeY: first.floorY, baseYaw: 0, actor: null });
    blockers[1].push({ x: p.x, z: p.z, hw: 0.43, hd: 0.43 });
  }
  // NPCs on hold: Mom and Yara reused Rizer's mesh. They return on their own canon-styled meshes.
  if (!NPCS_ON_HOLD) resident('Mom', 7, 3, { height: 0.95, skin: '#d6a984', hair: '#513a2d', cloth: '#547344', navy: '#e6d4b2', leather: '#765039', boot: '#49362b', eye: '#688a42' }, [
    'Oh honey — before you go…',
    '*hands you a smooth cube of woven starlight* This is my Zycube. It stores anything you find on the road.',
    '*tucks two potions inside* And take these — heal a scrape before it becomes a scar.',
    'Go see your father at the Research Facility. He has been holding something for me all morning.'
  ]);
  if (!NPCS_ON_HOLD) resident('Yara', 9, 3, { height: 0.75, skin: '#9a6443', hair: '#1c9b43', cloth: '#182d62', navy: '#182d62', leather: '#6f452e', boot: '#49362b', eye: '#6c8c42' }, [
    '*grins* Lucky you got your own room upstairs. I’m still sharing a wall with Mom’s snoring.',
    'When you catch a really cool Zyrex, bring it back to show me, okay??'
  ]);
  residentModel.then(gltf => {
    if (!gltf) return;
    for (const n of residents) {
      const actor = new Actor(gltf, n.look.height, null); n.actor = actor; n.root.add(actor.pivot);
      actor.model.traverse(o => {
        if (!o.isMesh || !o.material) return;
        const recolor = source => {
          const m = source.clone(), name = source.name || '';
          if (name === 'R_skin') m.color.set(n.look.skin);
          else if (name === 'R_hair') m.color.set(n.look.hair);
          else if (name === 'R_cloth') m.color.set(n.look.cloth);
          else if (name === 'R_navy') m.color.set(n.look.navy);
          else if (name === 'R_leather') m.color.set(n.look.leather);
          else if (name === 'R_boot') m.color.set(n.look.boot);
          else if (name === 'R_eye') m.color.set(n.look.eye);
          return m;
        };
        o.material = Array.isArray(o.material) ? o.material.map(recolor) : recolor(o.material);
      });
      const hairMat = new THREE.MeshStandardMaterial({ color: n.look.hair, roughness: 0.72, flatShading: true });
      if (n.name === 'Mom') {
        const bob = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), hairMat); bob.scale.set(1.1, 0.8, 0.95); bob.position.set(0, 1.82, -0.06); actor.model.add(bob);
        box(actor.model, 0.27, 0.4, 0.025, mat('#e6d4b2'), 0, 1.0, 0.13);
      } else {
        for (const side of [-1, 1]) {
          const lock = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.46, 3, 6), hairMat); lock.position.set(side * 0.17, 1.49, -0.04); actor.model.add(lock);
          const clip = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.035, 0.04), new THREE.MeshStandardMaterial({ color: '#c9a34d', metalness: 0.45, roughness: 0.42 })); clip.position.set(side * 0.18, 1.91, 0.025); actor.model.add(clip);
        }
      }
      actor.update(0, 0, true);
    }
  });

  function updateResidents(dt, rizer) {
    for (const n of residents) {
      n.phase += dt;
      const dx = rizer.position.x - n.position.x, dz = rizer.position.z - n.position.z;
      const distance = Math.hypot(dx, dz), wantedYaw = distance < 6 ? Math.atan2(dx, dz) : n.baseYaw;
      const turn = Math.atan2(Math.sin(wantedYaw - n.root.rotation.y), Math.cos(wantedYaw - n.root.rotation.y));
      n.root.rotation.y += turn * Math.min(1, dt * (distance < 6 ? 3.5 : 1.4));
      n.actor?.update(dt, 0, true);
    }
  }


  // Nebuladock 3000: Rizer's Home PC. Monitor, tower, keyboard, mouse and speakers on the desk. All direct meshes of the
  // room, so the desk piece gathers them and the whole station moves together. Glow is emissive only (no extra lights).
  const nebula = { screen: null, t: 0, fans: [], screenMat: null, coreMat: null, ledMat: null, keyMat: null };
  function buildNebuladock(room, cx, dz, fy) {
    const T = fy + 0.80, mz = dz + 0.15, navy = mat('#0f1830', 0.5, { metalness: 0.35 }), navy2 = mat('#16224a', 0.55, { metalness: 0.3 });
    const glow = (c, e) => new THREE.MeshStandardMaterial({ color: '#0b1226', emissive: c, emissiveIntensity: e, roughness: 0.4, flatShading: true });
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 288; const g = cv.getContext('2d');
    const bg = g.createRadialGradient(256, 150, 10, 256, 150, 300); bg.addColorStop(0, '#7a4bd6'); bg.addColorStop(0.4, '#243b8f'); bg.addColorStop(1, '#070d24');
    g.fillStyle = bg; g.fillRect(0, 0, 512, 288);
    for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(255,255,255,${0.2 + ((i * 37) % 70) / 100})`; g.fillRect((i * 97) % 512, (i * 53) % 288, 1.6, 1.6); }
    g.strokeStyle = '#d9b45c'; g.lineWidth = 3; g.strokeRect(10, 10, 492, 268);
    g.fillStyle = '#f5df9f'; g.font = '600 38px serif'; g.textAlign = 'center'; g.fillText('NEBULADOCK 3000', 256, 150);
    g.fillStyle = '#7fd6ff'; g.font = '16px sans-serif'; g.fillText('ZYLINK READY', 256, 184);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    nebula.screenMat = new THREE.MeshStandardMaterial({ color: '#ffffff', map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.8, roughness: 0.4 });
    nebula.coreMat = glow('#9a6bff', 1.0); nebula.ledMat = glow('#46e0ff', 1.2); nebula.keyMat = glow('#2fb4e6', 0.35);
    // monitor
    box(room, 2.1, 1.2, 0.1, navy, cx, T + 0.88, mz);
    nebula.screen = box(room, 1.9, 1.0, 0.03, nebula.screenMat, cx, T + 0.88, mz + 0.065);
    box(room, 2.14, 0.05, 0.12, gold, cx, T + 1.5, mz); box(room, 2.14, 0.05, 0.12, gold, cx, T + 0.26, mz);
    box(room, 0.16, 0.3, 0.1, navy, cx, T + 0.15, mz); box(room, 0.7, 0.04, 0.4, navy, cx, T + 0.02, mz + 0.05);
    // tower
    const tx = cx + 2.2, tzc = dz - 0.15, tf = tzc + 0.33;
    box(room, 0.55, 1.2, 0.65, navy2, tx, T + 0.6, tzc);
    box(room, 0.05, 1.0, 0.02, gold, tx - 0.2, T + 0.62, tf + 0.005);
    box(room, 0.3, 0.45, 0.02, nebula.coreMat, tx + 0.04, T + 0.78, tf + 0.012);
    box(room, 0.07, 0.07, 0.02, nebula.ledMat, tx + 0.18, T + 1.08, tf + 0.012);
    for (const a of [0, Math.PI / 2]) { const b = box(room, 0.34, 0.04, 0.02, gold, tx + 0.04, T + 0.3, tf + 0.02); b.rotation.z = a; nebula.fans.push(b); }
    // keyboard, mouse, speakers
    box(room, 1.0, 0.045, 0.32, navy, cx, T + 0.025, dz + 0.765); box(room, 0.92, 0.012, 0.24, nebula.keyMat, cx, T + 0.055, dz + 0.765); nebula.keys = { x: cx, z: dz + 0.765 };
    box(room, 0.11, 0.04, 0.17, navy, cx + 0.75, T + 0.02, dz + 0.78);
    for (const sx of [-1.5, 1.45]) { box(room, 0.3, 0.55, 0.3, navy2, cx + sx, T + 0.275, mz + 0.05); box(room, 0.14, 0.14, 0.02, nebula.ledMat, cx + sx, T + 0.3, mz + 0.21); }
  }


  // Nebuladock 3000 chair: a standalone asset (own group, own anchors), separate from the desk and the PC. Origin = floor under the
  // seat's centre; it faces -Z (toward the desk). Seat top 0.60, armrests 0.89. It rolls along one authored line (seating.js).
  const seatCfg = { cx: 0, z0: 0, z1: 0 }, chairRoot = new THREE.Group(); chairRoot.name = 'NebuladockChair';
  function buildChair(parent, cx, z0, fy) {
    const navy = mat('#18276b', 0.7), navy2 = mat('#223693', 0.65), dark = mat('#0e121c', 0.55, { metalness: 0.3 });
    const cyanM = new THREE.MeshStandardMaterial({ color: '#0b1a26', emissive: '#35d8ff', emissiveIntensity: 0.85, roughness: 0.4, flatShading: true });
    const blueM = new THREE.MeshStandardMaterial({ color: '#0b1226', emissive: '#3b6bff', emissiveIntensity: 1.1, roughness: 0.4, flatShading: true });
    const draw = emissive => { // backrest face: quilted navy, cyan emblem up high, purple nebula at the lumbar
      const c = document.createElement('canvas'); c.width = 256; c.height = 512; const g = c.getContext('2d');
      g.fillStyle = emissive ? '#000' : '#16256a'; g.fillRect(0, 0, 256, 512);
      if (!emissive) { g.strokeStyle = '#2b409c'; g.lineWidth = 2; for (let i = -512; i < 512; i += 40) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 512, 512); g.stroke(); g.beginPath(); g.moveTo(i + 512, 0); g.lineTo(i, 512); g.stroke(); } }
      g.strokeStyle = '#35d8ff'; g.lineWidth = 5; g.strokeRect(8, 8, 240, 496);
      g.fillStyle = emissive ? '#35d8ff' : '#2fc3da'; g.beginPath(); g.arc(128, 120, 36, 0, 7); g.fill();
      g.fillStyle = emissive ? '#0a1c28' : '#0c2a3a'; g.beginPath(); g.arc(128, 120, 29, 0, 7); g.fill();
      g.fillStyle = '#8ff3ff'; g.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 9 : 22, a = -Math.PI / 2 + i * Math.PI / 5; g.lineTo(128 + Math.cos(a) * r, 120 + Math.sin(a) * r); } g.closePath(); g.fill();
      g.fillStyle = emissive ? '#000' : '#0b0f1c'; g.fillRect(40, 330, 176, 130);
      const rg = g.createRadialGradient(128, 395, 4, 128, 395, 78); rg.addColorStop(0, '#e6b0ff'); rg.addColorStop(0.35, '#8a3df0'); rg.addColorStop(1, 'rgba(60,20,120,0)');
      g.fillStyle = rg; g.fillRect(40, 330, 176, 130); g.strokeStyle = '#c58cff'; g.lineWidth = 2;
      for (let k = 0; k < 3; k++) { g.beginPath(); g.ellipse(128, 395, 30 + k * 18, 12 + k * 7, -0.35, 0, 7); g.stroke(); }
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
    };
    const faceMat = new THREE.MeshStandardMaterial({ map: draw(false), emissiveMap: draw(true), emissive: '#ffffff', emissiveIntensity: 0.55, roughness: 0.75 });
    const R = chairRoot; R.position.set(cx, fy, z0);
    // seat
    box(R, 0.54, 0.06, 0.54, dark, 0, 0.49, 0); box(R, 0.60, 0.09, 0.60, navy, 0, 0.555, 0);
    for (const s of [-1, 1]) { box(R, 0.08, 0.11, 0.52, navy2, s * 0.285, 0.585, 0); box(R, 0.01, 0.012, 0.5, cyanM, s * 0.24, 0.602, 0); }
    box(R, 0.54, 0.012, 0.012, cyanM, 0, 0.602, -0.295);
    // column and five-point base with rolling wheels
    cyl(R, 0.035, 0.045, 0.30, dark, 0, 0.33, 0); cyl(R, 0.06, 0.06, 0.04, gold, 0, 0.19, 0, 10);
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 2 / 5 + 0.3, sx = Math.sin(a), sz = Math.cos(a);
      box(R, 0.07, 0.035, 0.36, dark, sx * 0.18, 0.13, sz * 0.18, a); box(R, 0.022, 0.012, 0.3, gold, sx * 0.18, 0.152, sz * 0.18, a);
      orb(R, 0.05, dark, sx * 0.355, 0.06, sz * 0.355); orb(R, 0.022, blueM, sx * 0.375, 0.062, sz * 0.375);
    }
    // backrest: leans back a little; quilted face toward the desk, vented back
    const back = new THREE.Group(); back.position.set(0, 0.62, 0.27); back.rotation.x = 0.11; R.add(back);
    box(back, 0.56, 0.86, 0.12, navy, 0, 0.43, 0.04);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.8), faceMat); face.position.set(0, 0.43, -0.0215); face.rotation.y = Math.PI; back.add(face);
    box(back, 0.34, 0.2, 0.1, navy2, 0, 0.97, 0.05); box(back, 0.3, 0.012, 0.012, cyanM, 0, 0.88, -0.005);
    for (const s of [-1, 1]) {
      box(back, 0.035, 0.84, 0.14, gold, s * 0.275, 0.43, 0.04); box(back, 0.03, 0.2, 0.11, gold, s * 0.19, 0.97, 0.05);
      box(back, 0.07, 0.7, 0.16, navy2, s * 0.30, 0.42, -0.04); box(back, 0.008, 0.66, 0.012, cyanM, s * 0.262, 0.42, -0.125);
      box(back, 0.03, 0.62, 0.012, gold, s * 0.12, 0.43, 0.108);
    }
    for (let i = 0; i < 5; i++) box(back, 0.2, 0.014, 0.012, dark, 0, 0.5 + i * 0.07, 0.108);
    // armrests: gold post with a small cyan window, black pad
    for (const s of [-1, 1]) {
      box(R, 0.05, 0.30, 0.05, gold, s * 0.37, 0.72, -0.03); box(R, 0.1, 0.05, 0.38, dark, s * 0.37, 0.89, -0.06); box(R, 0.03, 0.045, 0.012, cyanM, s * 0.37, 0.74, -0.062);
    }
    parent.add(R); // (the desk piece takes it into its group below)
    seatCfg.cx = cx; return R;
  }

  // RP7B upstairs Rizer Room furniture positions preserved on its 15 x 10 grid.
  {
    const get = (col, row) => cell(col, row, second.floorY);
    const bed = get(13, 8.5); box(second.room, 4.25, 0.52, 2.75, darkWood, bed.x, second.floorY + 0.28, bed.z);
    box(second.room, 4.0, 0.62, 2.48, mat('#e0d2b7'), bed.x, second.floorY + 0.82, bed.z);
    box(second.room, 3.9, 0.22, 0.72, rug, bed.x, second.floorY + 1.16, bed.z - 0.68);
    box(second.room, 1.75, 0.27, 0.7, cream, bed.x - 0.95, second.floorY + 1.16, bed.z + 0.68);
    const desk = get(7, 7); box(second.room, 5.8, 0.12, 1.65, darkWood, desk.x + 0.75, second.floorY + 0.74, desk.z); // a desk for sitting at: its top is 0.80 high
    for (const dx of [-1.6, 0.4, 2.4]) box(second.room, 0.22, 0.68, 0.22, trim, desk.x + 0.75 + dx, second.floorY + 0.34, desk.z);
    buildNebuladock(second.room, desk.x + 0.75, desk.z, second.floorY);
    seatCfg.z1 = desk.z + 1.245; seatCfg.z0 = desk.z + 2.0; // seat point at the keyboard, and rolled back along the same line
    buildChair(second.room, desk.x + 0.75, seatCfg.z0, second.floorY);
    blockers[2].push({ x: desk.x + 0.75, z: seatCfg.z0, hw: 0.4, hd: 0.3 });
    const tv = get(6, 1); box(second.room, 2.4, 1.55, 0.42, darkWood, tv.x, second.floorY + 0.8, tv.z); n3000Screen = box(second.room, 1.95, 1.08, 0.12, glass, tv.x, second.floorY + 1.2, tv.z + 0.26);
    const science = get(13, 1); box(second.room, 4.2, 0.3, 1.35, darkWood, science.x, second.floorY + 0.95, science.z);
    for (const dx of [-1.6, 1.6]) box(second.room, 0.2, 0.9, 0.2, trim, science.x + dx, second.floorY + 0.45, science.z);
    for (const x of [-0.95, 0, 0.95]) { const vial = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 0.68, 6), x ? glass : mat('#87aa66', 0.4, { emissive: '#3b7733', emissiveIntensity: 0.35 })); vial.position.set(science.x + x, second.floorY + 1.42, science.z); second.room.add(vial); }
    // Psychosyd's guitar lies on the floor where a new game starts; ○ / E picks it up (game.js · takeFloorGuitar).
    const guitarAt = get(10, 1); floorGuitar = buildGuitar(); floorGuitar.rotation.set(-Math.PI / 2, 0, 0.6); floorGuitar.position.set(guitarAt.x, second.floorY + 0.06, guitarAt.z + 0.6); floorGuitar.userData.structure = true; second.room.add(floorGuitar);
    (root.userData.stations ||= []).push({ id: 'floor-guitar', name: "Psychosyd's Signed Red Guitar", x: guitarAt.x, z: guitarAt.z + 0.6, level: 2, r: 1.6 });
    const console = get(8, 3); consoleRoot = createN3000Prop(); consoleRoot.scale.setScalar(CONSOLE_SCALE); consoleRoot.position.set(console.x, second.floorY, console.z); second.room.add(consoleRoot); // console-sized: about 0.8 wide, a hand-sized pad
    (root.userData.stations ||= []).push({ id: 'n3000', name: 'N3000', x: console.x, z: console.z + 0.9, level: 2, r: 1.5 });
    const punching = get(1, 8); cyl(second.room, 0.48, 0.55, 2.1, mat('#7a292b'), punching.x, second.floorY + 1.2, punching.z); cyl(second.room, 0.75, 0.75, 0.24, darkWood, punching.x, second.floorY + 0.12, punching.z);
    const board = get(3, 1); box(second.room, 2.2, 0.15, 0.62, mat('#a75542'), board.x, second.floorY + 0.16, board.z, -0.38);
    const ball = get(11, 9); orb(second.room, 0.42, mat('#df873f'), ball.x, second.floorY + 0.43, ball.z);
    // Astralite Station: a lit pedestal ringed by the nine family gems, where Astralites are fused into Gemshards.
    const ast = get(3, 4.5), glow = (c, e = 1) => mat(c, 0.35, { emissive: c, emissiveIntensity: e });
    cyl(second.room, 0.95, 1.1, 0.35, darkWood, ast.x, second.floorY + 0.18, ast.z, 10);
    cyl(second.room, 0.5, 0.7, 0.9, mat('#3b4452'), ast.x, second.floorY + 0.8, ast.z, 8);
    cyl(second.room, 0.95, 0.95, 0.14, trim, ast.x, second.floorY + 1.3, ast.z, 10);
    orb(second.room, 0.32, glow('#b98cff', 1.2), ast.x, second.floorY + 1.85, ast.z);
    ['#ffd66b', '#bc83ff', '#ff6848', '#65e3ff', '#68ef91', '#ffc85c', '#ff79ae', '#72bfff', '#d796ff'].forEach((c, i) => { const a = i / 9 * Math.PI * 2; orb(second.room, 0.1, glow(c, 1.1), ast.x + Math.cos(a) * 0.72, second.floorY + 1.45, ast.z + Math.sin(a) * 0.72); });
    blockers[2].push({ x: ast.x, z: ast.z, hw: 1.0, hd: 1.0 });
    box(second.room, 1.35, 0.3, 5.25, darkWood, -7.425, second.floorY - 0.18, -4.125); // upstairs floor over the old gap beside the flight: the landing
    (root.userData.stations ||= []).push({ id: 'astralite', name: 'Astralite Station', x: ast.x, z: ast.z + 1.55, level: 2, r: 2.6 });
    (root.userData.stations ||= []).push({ id: 'experiment', name: 'Experiment Table', x: science.x, z: science.z + 1.45, level: 2, r: 2.7 }, { id: 'homepc', name: 'Nebuladock 3000', x: desk.x + 0.75, z: desk.z + 1.42, level: 2, r: 2.2 });
    const rug2 = get(13, 2); box(second.room, 2.6, 0.045, 1.35, rug, rug2.x, second.floorY + 0.035, rug2.z);
    standingLamp(second.room, second.floorY, 4.7, 5.0);
    // Furniture collision footprints follow RP7B's solid tiles, leaving approach lanes open.
    blockers[2].push(
      { x: bed.x, z: bed.z, hw: 2.3, hd: 1.55 }, { x: desk.x + 0.75, z: desk.z, hw: 3.05, hd: 0.85 },
      { x: tv.x, z: tv.z, hw: 1.3, hd: 0.36 }, { x: science.x, z: science.z, hw: 2.25, hd: 0.8 },
      { x: console.x, z: console.z + 0.1, hw: 0.45, hd: 0.3 }, { x: punching.x, z: punching.z, hw: 0.65, hd: 0.65 }, { x: 4.7, z: 5.0, hw: 0.42, hd: 0.42, top: second.floorY + 2.4 }
    );
  }


  // ── Movable furniture ─────────────────────────────────────────────────────────────────────────────
  // Every piece is gathered into its own group (meshes, lights, collision boxes, stations) so the whole thing moves as one.
  // Layouts persist across plays (localStorage), per home. Placement is checked against the walls, the other pieces, the
  // stairs and the front door, so a rearranged room can never lock Rizer in.
  const LAYOUT_KEY = 'rp7d.homeLayout.v1', SNAP = 0.25;
  const pieces = [];
  const zones = {
    1: [{ x0: -11.4, x1: -7.9, z0: -6.9, z1: -0.2 }, { x0: -2.4, x1: 2.8, z0: 4.6, z1: 7.6 }], // the stair flight and its foot · the front door
    2: [{ x0: -11.4, x1: -7.0, z0: -7.6, z1: 0.9 }]                                         // the stair opening, its landing and the way to it
  };
  {
    const defs = [
      // level 1 · living room                          gather rect (center, half extents)   footprint (center, half extents)
      { id: 'sofa', name: 'Sofa & rug', level: 1, x: 1.5, z: 0.75, gw: 3.7, gd: 1.35, fx: 1.5, fz: 0.75, hw: 2.7, hd: 1.05 },
      { id: 'tv1', name: 'Television', level: 1, x: 10.5, z: 0.75, gw: 1.0, gd: 1.0, fx: 10.5, fz: 0.75, hw: 0.75, hd: 0.65 },
      { id: 'plant', name: 'Plant', level: 1, x: -4.5, z: -5.25, gw: 0.95, gd: 0.95, fx: -4.5, fz: -5.25, hw: 0.65, hd: 0.65 },
      { id: 'coffee', name: 'Coffee table', level: 1, x: 1.5, z: 3.75, gw: 1.4, gd: 0.85, fx: 1.5, fz: 3.75, hw: 1.2, hd: 0.65 },
      { id: 'lamp1', name: 'Standing lamp', level: 1, x: -4.8, z: 2.7, gw: 0.6, gd: 0.6, fx: -4.8, fz: 2.7, hw: 0.42, hd: 0.42 },
      // level 2 · Rizer's room
      { id: 'bed', name: 'Bed', level: 2, x: 9, z: 6, gw: 2.3, gd: 1.5, fx: 9, fz: 6, hw: 2.3, hd: 1.55 },
      { id: 'desk', name: 'Desk, chair & Nebuladock 3000', level: 2, x: 0.75, z: 4.35, gw: 3.5, gd: 1.55, fx: 0.75, fz: 4.5, hw: 3.05, hd: 1.75, stations: ['homepc'] },
      { id: 'tv2', name: 'Television', level: 2, x: -1.5, z: -5.25, gw: 1.4, gd: 0.55, fx: -1.5, fz: -5.25, hw: 1.3, hd: 0.36 },
      { id: 'science', name: 'Experiment Table', level: 2, x: 9, z: -4.5, gw: 2.3, gd: 1.5, fx: 9, fz: -5.25, hw: 2.25, hd: 0.8, stations: ['experiment'] },
      { id: 'console', name: 'N3000 game system', stations: ['n3000'], level: 2, x: 1.5, z: -2.25, gw: 0.6, gd: 0.5, fx: 1.5, fz: -2.15, hw: 0.45, hd: 0.3 },
      { id: 'punching', name: 'Punching bag', level: 2, x: -9, z: 5.25, gw: 0.85, gd: 0.85, fx: -9, fz: 5.25, hw: 0.65, hd: 0.65 },
      { id: 'skate', name: 'Skateboard', level: 2, x: -6, z: -5.25, gw: 1.25, gd: 0.8, fx: -6, fz: -5.25, hw: 0.9, hd: 0.5 },
      { id: 'ball', name: 'Basketball', level: 2, x: 6, z: 6.75, gw: 0.55, gd: 0.55, fx: 6, fz: 6.75, hw: 0.45, hd: 0.45 },
      { id: 'astral', name: 'Astralite Station', level: 2, x: -6, z: 0, gw: 1.15, gd: 1.15, fx: -6, fz: 0, hw: 0.95, hd: 0.95, stations: ['astralite'] },
      { id: 'lamp2', name: 'Standing lamp', level: 2, x: 4.7, z: 5.0, gw: 0.6, gd: 0.6, fx: 4.7, fz: 5.0, hw: 0.42, hd: 0.42 }
    ];
    for (const d of defs) {
      const room = d.level === 1 ? first.room : second.room, fy = d.level === 1 ? first.floorY : second.floorY;
      const kids = room.children.filter(o => (o.isMesh || o.isLight) && !o.userData.piece && !o.userData.structure && Math.abs(o.position.x - d.x) <= d.gw && Math.abs(o.position.z - d.z) <= d.gd && o.position.y >= fy - 0.05 && o.position.y <= fy + 2.55);
      const group = new THREE.Group(); group.name = 'Piece-' + d.id; room.add(group);
      if (d.id === 'console') group.add(consoleRoot);
      if (d.id === 'desk') group.add(chairRoot); // the chair is its own object but travels with the desk it belongs to
      for (const k of kids) { k.userData.piece = d.id; group.add(k); }
      const own = blockers[d.level].filter(b => !b.piece && Math.abs(b.x - d.x) <= d.gw && Math.abs(b.z - d.z) <= d.gd).map(b => { b.piece = d.id; return { b, ox: b.x, oz: b.z }; });
      const sts = (root.userData.stations || []).filter(st => d.stations?.includes(st.id)).map(st => ({ st, ox: st.x, oz: st.z }));
      pieces.push({ ...d, group, own, sts, dx: 0, dz: 0, cx: d.fx, cz: d.fz, moving: false });
    }
  }
  const pieceById = id => pieces.find(p => p.id === id);
  function applyOffset(p, dx, dz) {
    p.dx = dx; p.dz = dz; p.cx = p.fx + dx; p.cz = p.fz + dz; p.group.position.set(dx, 0, dz);
    for (const o of p.own) { o.b.x = o.ox + dx; o.b.z = o.oz + dz; }
    for (const o of p.sts) { o.st.x = o.ox + dx; o.st.z = o.oz + dz; }
  }
  function placeCheck(p, dx, dz) {
    const x = p.fx + dx, z = p.fz + dz, m = 0.12;
    if (Math.abs(x) + p.hw > HALF_W + 0.1 || Math.abs(z) + p.hd > HALF_D + 0.1) return { ok: false, why: 'Too close to the wall' };
    for (const q of zones[p.level]) if (x + p.hw > q.x0 && x - p.hw < q.x1 && z + p.hd > q.z0 && z - p.hd < q.z1) return { ok: false, why: 'That space has to stay clear (stairs / door)' };
    for (const q of pieces) {
      if (q === p || q.level !== p.level) continue;
      if (Math.abs(x - q.cx) < p.hw + q.hw - m && Math.abs(z - q.cz) < p.hd + q.hd - m) return { ok: false, why: `Blocked by the ${q.name.toLowerCase()}` };
    }
    return { ok: true };
  }
  const outline = new THREE.Box3Helper(new THREE.Box3(), 0x7fd6ff); outline.visible = false; root.add(outline);
  const saveLayout = () => { try { const o = {}; for (const p of pieces) if (p.dx || p.dz) o[p.id] = { dx: p.dx, dz: p.dz }; localStorage.setItem(LAYOUT_KEY, JSON.stringify(o)); } catch (e) {} };
  const loadLayout = () => {
    try {
      const o = JSON.parse(localStorage.getItem(LAYOUT_KEY) || '{}');
      for (const p of pieces) { const s = o[p.id]; if (s && Number.isFinite(s.dx) && Number.isFinite(s.dz) && placeCheck(p, s.dx, s.dz).ok) applyOffset(p, s.dx, s.dz); }
    } catch (e) {}
  };
  loadLayout();
  const furn = {
    pieces, byId: pieceById, check: placeCheck, apply: applyOffset, save: saveLayout, SNAP,
    // Nearest piece on Rizer's floor within reach, preferring what he is facing.
    focus(pos, facing, maxD = 3.4) {
      let best = null, bs = Infinity;
      for (const p of pieces) {
        if (p.level !== level) continue;
        const ex = Math.max(0, Math.abs(pos.x - p.cx) - p.hw), ez = Math.max(0, Math.abs(pos.z - p.cz) - p.hd), d = Math.hypot(ex, ez);
        if (d > maxD) continue;
        const off = Math.abs(Math.atan2(Math.sin(Math.atan2(p.cx - pos.x, p.cz - pos.z) - facing), Math.cos(Math.atan2(p.cx - pos.x, p.cz - pos.z) - facing)));
        const score = d + (off > 1.2 && d > 0.6 ? 2.5 : 0);
        if (score < bs) { bs = score; best = p; }
      }
      return best;
    },
    distance(p, pos) { return Math.hypot(Math.max(0, Math.abs(pos.x - p.cx) - p.hw), Math.max(0, Math.abs(pos.z - p.cz) - p.hd)); },
    setMoving(p, on) { p.moving = on; for (const o of p.own) o.b.off = on; },
    // Outline around a piece (valid = cyan, blocked = red), or hidden with null.
    show(p, ok = true) {
      outline.visible = !!p; if (!p) return;
      outline.material.color.set(ok ? 0x7fd6ff : 0xff5a5a); outline.box.setFromObject(p.group); outline.box.expandByScalar(0.04);
    },
    reset() { for (const p of pieces) applyOffset(p, 0, 0); saveLayout(); },
    get level() { return level; }
  };

  let level = 2;
  const rails = []; // thin walls with a height window: { x, z, hw, hd, minY, maxY }
  const roomWorld = {
    bound: 100, heightAt: (_x, _z) => floorY(), groundAt: (_x, _z) => floorY(), surfaceAt: (_x, _z) => floorY(), waterAt: () => -Infinity,
    // Keep the third-person camera inside the room instead of allowing the
    // exterior camera ray to pass through the interior walls.
    cameraMinDist: 0.15,
    rayClear(a, b) {
      const ray = b.clone().sub(a), total = ray.length();
      if (total < 1e-4) return total;
      const horizontal = Math.hypot(ray.x, ray.z);
      const onStairs = Math.abs(a.x - upStair.x) < TILE * 1.1 && a.z >= stairMinZ - 0.4 && a.z <= stairMaxZ + 0.4;
      const ceilingY = (level === 2 || onStairs ? second.floorY : first.floorY) + 3.68;
      let clear = total;
      if (ray.y > 1e-5 && b.y > ceilingY && a.y < ceilingY) clear = Math.min(clear, Math.max(0.15, (ceilingY - a.y) / ray.y * total - 0.12));
      if (horizontal < 1e-4) return clear;
      const dx = ray.x / horizontal, dz = ray.z / horizontal;
      const margin = 0.32;
      let edge = horizontal;
      if (dx > 1e-5) edge = Math.min(edge, (HALF_W - margin - a.x) / dx);
      else if (dx < -1e-5) edge = Math.min(edge, (-HALF_W + margin - a.x) / dx);
      if (dz > 1e-5) edge = Math.min(edge, (HALF_D - margin - a.z) / dz);
      else if (dz < -1e-5) edge = Math.min(edge, (-HALF_D + margin - a.z) / dz);
      return Math.min(clear, Math.max(0.15, edge - 0.12) * total / horizontal);
    },
    keepOnLand(p) { const ox = p.x, oz = p.z; p.x = THREE.MathUtils.clamp(p.x, -HALF_W + 0.8, HALF_W - 0.8); p.z = THREE.MathUtils.clamp(p.z, -HALF_D + 0.8, HALF_D - 0.8); return ox !== p.x || oz !== p.z; },
    resolve(p, radius) {
      let hit = false;
      const ox = p.x, oz = p.z; p.x = THREE.MathUtils.clamp(p.x, -HALF_W + radius, HALF_W - radius); p.z = THREE.MathUtils.clamp(p.z, -HALF_D + radius, HALF_D - radius); hit ||= ox !== p.x || oz !== p.z;
      for (const b of blockers[level]) {
        if (b.off || p.y > (b.top ?? Infinity) + 0.1) continue;
        const dx = p.x - b.x, dz = p.z - b.z, px = b.hw + radius - Math.abs(dx), pz = b.hd + radius - Math.abs(dz);
        if (px > 0 && pz > 0) { if (px < pz) p.x += Math.sign(dx || 1) * px; else p.z += Math.sign(dz || 1) * pz; hit = true; }
      }
      for (const r of rails) {
        if (p.y < (r.minY ?? -Infinity) || p.y > (r.maxY ?? Infinity)) continue;
        const dx = p.x - r.x, dz = p.z - r.z, px = r.hw + radius - Math.abs(dx), pz = r.hd + radius - Math.abs(dz);
        if (px > 0 && pz > 0) { if (px < pz) p.x += Math.sign(dx || 1) * px; else p.z += Math.sign(dz || 1) * pz; hit = true; }
      }
      return hit;
    }
  };
  function floorY() { return level === 1 ? first.floorY : second.floorY; }
  function snap(rizer, cam, nextLevel, at) {
    level = nextLevel; second.room.visible = level === 2; stairwellCover.visible = level === 1; rizer.position.set(at.x, floorY(), at.z); rizer.vel.set(0, 0, 0); rizer.vy = 0; rizer.speed = 0; rizer.flying = false; rizer.onGround = true; rizer.attack = null;
    rizer.facing = at.facing ?? (nextLevel === 1 ? Math.PI : 0); cam.yaw = rizer.facing + Math.PI; cam.focus.set(rizer.position.x, floorY() + 1.7, rizer.position.z);
  }
  const downStair = cell(STAIR_COL, STAIR_ROW, 0), upStair = cell(STAIR_COL, STAIR_ROW, 0), entryDoor = cell(7, 9, 0);
  const stairDepth = TILE * 3.4, stairHalf = stairDepth / 2;
  const stairMinZ = upStair.z - stairHalf, stairMaxZ = upStair.z + stairHalf;
  // The flight: a rectangle against the west wall rising toward -Z. Its east side is railed (open only at the top, onto the
  // upstairs floor, which is filled across the old gap), its upper-floor south rim is railed, and the foot is open.
  const FX0 = -HALF_W - 0.2, FX1 = upStair.x + TILE * 1.1;
  const inFlight = (x, z, m = 0) => x >= FX0 && x <= FX1 + m && z >= stairMinZ - m && z <= stairMaxZ + m;
  // Stepped ground, not a ramp: each of the 14 risers is eased over a short run-up, so his pelvis climbs a step at a time with the clip
  // and the feet meet the visible treads. (u: distance up the flight from its foot.)
  const STEPS = 14, RUN = (stairMaxZ - stairMinZ) / STEPS, RISE = (second.floorY - first.floorY) / STEPS, EASE = 0.22;
  const stairGround = (x, z) => {
    if (!inFlight(x, z)) return null;
    const u = THREE.MathUtils.clamp(stairMaxZ - z, 0, stairMaxZ - stairMinZ); let h = 0;
    for (let i = 1; i <= STEPS; i++) { const r = i * RUN; if (u > r - EASE) h += RISE * THREE.MathUtils.smoothstep(u, r - EASE, r + 0.02); }
    return first.floorY + h;
  };
  // the stair clips' own pace (two steps per cycle): the actor plays them at this speed and Rizer is held to it, so feet land on steps
  roomWorld.stairPace = { stairWalkUp: 2 * RUN / 1.37, stairRunUp: 2 * RUN / 0.60, stairWalkDown: 2 * RUN / 0.93, stairRunDown: 2 * RUN / 0.40 };
  const TOP_OPEN = 1.1; // the last stretch of the east rail that stays open once he is high enough to step onto the landing
  rails.push(
    { x: FX1, z: (stairMinZ + TOP_OPEN + stairMaxZ) / 2, hw: 0.06, hd: (stairMaxZ - stairMinZ - TOP_OPEN) / 2 },
    { x: FX1, z: stairMinZ + TOP_OPEN / 2, hw: 0.06, hd: TOP_OPEN / 2, maxY: second.floorY - 1.05 },
    { x: (FX0 + FX1) / 2, z: stairMaxZ, hw: (FX1 - FX0) / 2, hd: 0.06, minY: (first.floorY + second.floorY) / 2 }
  );
  const roomGround = (x, z) => stairGround(x, z) ?? floorY();
  roomWorld.heightAt = roomGround; roomWorld.groundAt = roomGround; roomWorld.surfaceAt = roomGround;
  roomWorld.stairMotion = (p, vel, running) => {
    if (!inFlight(p.x, p.z, 0.2)) return null;
    if (vel.z < -0.15) return running ? 'stairRunUp' : 'stairWalkUp';
    if (vel.z > 0.15) return running ? 'stairRunDown' : 'stairWalkDown';
    return null;
  };
  // Anything standing between the camera and Rizer (a lamp, a shelf, a wall corner) turns
  // see-through while it's in the way, so the room never hides the player.
  const _ray = new THREE.Raycaster(), _from = new THREE.Vector3(), _to = new THREE.Vector3(), faded = new Set();
  function fadeOccluders(cam, rizer) {
    const camera = cam?.cam; if (!camera || !root.visible) return;
    camera.getWorldPosition(_from);
    const hits = new Set(), side = new THREE.Vector3().subVectors(rizer.position, _from).setY(0).normalize();
    side.set(-side.z, 0, side.x);
    // sight lines: head, chest, hips, both shoulders and both hips
    for (const [up, off] of [[1.85, 0], [1.3, 0], [0.8, 0], [1.4, 0.45], [1.4, -0.45], [0.7, 0.4], [0.7, -0.4]]) {
      _to.copy(rizer.position).addScaledVector(side, off); _to.y += up;
      const d = _from.distanceTo(_to); if (d < 0.05) continue;
      _ray.set(_from, _to.clone().sub(_from).normalize()); _ray.far = d - 0.45; _ray.camera = camera; // sprites need the camera to raycast
      for (const h of _ray.intersectObject(root, true)) {
        const m = h.object; if (!m.isMesh || m.isSkinnedMesh || m.userData.noFade) continue;
        if (residents.some(r => { let o = m; while (o) { if (o === r.root) return true; o = o.parent; } return false; })) continue;
        hits.add(m);
      }
    }
    for (const m of hits) {
      if (!m.userData.fadeMat) { m.userData.baseMat = m.material; m.userData.fadeMat = m.material.clone(); m.userData.fadeMat.transparent = true; m.userData.fadeMat.depthWrite = false; m.userData.fadeMat.opacity = 0.18; }
      m.material = m.userData.fadeMat; m.castShadow = false; faded.add(m);
    }
    for (const m of faded) if (!hits.has(m)) { m.material = m.userData.baseMat; m.castShadow = true; faded.delete(m); }
  }
  // The rooms' lights are not kept as real lights: adding or hiding lights changes the scene's light count,
  // and every material then recompiles (the hitch on the way in). They become a list the game lights with
  // the same few lights the town uses (game.js · borrowed lights), so the count never changes.
  const lightSpecs = [];
  root.updateMatrixWorld(true);
  root.traverse(o => { if (o.isPointLight) lightSpecs.push({ level: o.getWorldPosition(new THREE.Vector3()).y > 4 ? 2 : 1, pos: o.getWorldPosition(new THREE.Vector3()), color: o.color.clone(), intensity: o.intensity, distance: o.distance, decay: o.decay, o }); });
  for (const s of lightSpecs) { s.o.removeFromParent(); delete s.o; }
  lightSpecs.sort((a, b) => b.intensity - a.intensity);
  return {
    // the lights for what's on screen: the current floor's first, brightest first
    lights: () => level === 2 ? [...lightSpecs.filter(s => s.level === 2), ...lightSpecs.filter(s => s.level === 1)] : lightSpecs.filter(s => s.level === 1),
    root, roomWorld, get level() { return level; },
    // both floors and every cover on screen at once (the load-time warm-up draws the whole house once)
    showAll(on) { if (on) { this._was = [second.room.visible, stairwellCover.visible]; second.room.visible = stairwellCover.visible = true; } else if (this._was) { [second.room.visible, stairwellCover.visible] = this._was; this._was = null; } },
    start: (rizer, cam, startingLevel = 2) => snap(rizer, cam, startingLevel,
      startingLevel === 2 ? { ...cell(10, 7, second.floorY), facing: Math.PI } : { ...cell(7, 8.5, first.floorY), facing: Math.PI }),
    show: value => { root.visible = !!value; },
    update(rizer, cam, onExit, toast, dt = 1 / 60) {
      updateResidents(dt, rizer);
      fadeOccluders(cam, rizer);
      // One rule set, driven by where he IS (never by how fast he moves): no flight indoors, solid floors, a hard ceiling,
      // and the active floor follows his height. The flight itself is a plain ramp (roomGround) with a few rails (resolve).
      {
        const P = rizer.position, onFlight = inFlight(P.x, P.z, 0.35);
        rizer.flying = false;
        const want = P.y > (first.floorY + second.floorY) / 2 ? 2 : 1;
        if (want !== level) { level = want; toast(level === 1 ? 'Rizer’s Living Room · downstairs' : 'Rizer’s Room · upstairs'); }
        const ground = roomGround(P.x, P.z);
        if (P.y < ground) { P.y = ground; if (rizer.vy < 0) rizer.vy = 0; rizer.onGround = true; }
        const ceil = (onFlight || level === 2 ? second.floorY : first.floorY) + 3.35;
        if (P.y > ceil) { P.y = ceil; if (rizer.vy > 0) rizer.vy = 0; }
        second.room.visible = level === 2 || (onFlight && P.y > first.floorY + 0.6);
        stairwellCover.visible = level === 1 && !onFlight;
      }
      // Leaving: walk up to the front door (moving toward it) and he opens it and walks out.
    },
    furn,
    // Monitor of the Nebuladock (world position of the screen centre), for the PC-use camera.
    // Seat anchors in world coordinates (the desk piece may have been moved), and the authored roll of the chair along its line.
    seat: {
      anchors() { const p = pieceById('desk'), dx = p?.dx || 0, dz = p?.dz || 0; return { x: seatCfg.cx + dx, z0: seatCfg.z0 + dz, z1: seatCfg.z1 + dz, y: second.floorY, face: Math.PI }; },
      setRoll(t) { chairRoot.position.z = seatCfg.z0 + (seatCfg.z1 - seatCfg.z0) * Math.min(1, Math.max(0, t)); },
      get chair() { return chairRoot; }
    },
    n3000() { root.updateMatrixWorld(true); const screen = n3000Screen.getWorldPosition(new THREE.Vector3()); return { screen, eye: screen.clone().add(new THREE.Vector3(0, 0.05, 3.2)) }; },
    nebuladock() { if (!nebula.screen) return null; root.updateMatrixWorld(true); const v = new THREE.Vector3(); nebula.screen.getWorldPosition(v); return { screen: v }; },
    // Idle life of the machine: screen breathing, core glow, tower light, fan. Runs even while its screen is open.
    nebulaTick(dt) {
      if (!nebula.screen || level !== 2) return; const t = (nebula.t += dt);
      nebula.screenMat.emissiveIntensity = 0.78 + 0.1 * Math.sin(t * 1.7); nebula.coreMat.emissiveIntensity = 0.9 + 0.45 * Math.sin(t * 2.3);
      nebula.ledMat.emissiveIntensity = Math.sin(t * 3) > 0.2 ? 1.5 : 0.5; nebula.keyMat.emissiveIntensity = 0.3 + 0.1 * Math.sin(t * 0.9);
      for (const f of nebula.fans) f.rotation.z += dt * 7;
    },
    // Standing at the front door (ground floor): X / Space opens it and walks him out, the same way entering works.
    nearDoor(p) { p = p.position || p; return level === 1 && p.z > HALF_D - 2.6 && Math.abs(p.x - (frontDoor ? frontDoor.position.x + 0.8 : 0)) < 1.7; },
    // The floor guitar is there until Rizer owns the guitar (taken here, or carried over from an older save).
    setGuitarTaken(taken) { if (floorGuitar) floorGuitar.visible = !taken; },
    get floorGuitar() { return floorGuitar; },
    stationAt(p) { p = p.position || p; let best = null; for (const s of root.userData.stations || []) { if (s.level !== level || (s.id === 'floor-guitar' && !floorGuitar?.visible)) continue; const d = Math.hypot(p.x - s.x, p.z - s.z); if (d <= s.r && (!best || d < best.d)) best = { ...s, d }; } return best; },
    get entry() { return entryDoor.clone(); },
    get frontDoor() { return frontDoor; },
    interact(rizer) {
      if (level !== 1) return null;
      const p = residents.find(n => Math.hypot(rizer.position.x - n.position.x, rizer.position.z - n.position.z) < 2.5);
      if (p) p.talk = 1.1;
      if (!p) return null;
      const line = p.lines[p.lineIndex % p.lines.length]; p.lineIndex++;
      return line;
    },
  };
}
