// Astralvision (L3 + R3 · B on keyboard): Rizer's holographic scan.
// A blue pulse sweeps out from him across the field; everything it passes that is
// registered as loot or a quest target lights up through walls as a hologram, with a
// tag (name + distance) on screen and a blip on the minimap, for a few seconds.
// 10-second cooldown. Other systems add targets with astralvision.register({...}).
import * as THREE from 'three';

export const ASTRALVISION = { cooldown: 10, range: 90, speed: 70, hold: 8 };

const holoVert = `varying vec3 vN; varying vec3 vV; varying float vY;
void main(){ vec4 wp = modelMatrix * vec4(position,1.0); vN = normalize(mat3(modelMatrix) * normal); vV = normalize(cameraPosition - wp.xyz); vY = wp.y;
  gl_Position = projectionMatrix * viewMatrix * wp; }`;
const holoFrag = `uniform float uT; uniform float uA; uniform vec3 uC; varying vec3 vN; varying vec3 vV; varying float vY;
void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 1.6);
  float scan = 0.55 + 0.45 * step(0.5, fract(vY * 9.0 - uT * 2.0));
  gl_FragColor = vec4(uC * (0.35 + 1.6 * f) * scan, (0.18 + 0.8 * f) * uA); }`;

export function createAstralvision(scene, camera, fx) {
  const root = document.querySelector('#game');
  // ── screen: holographic tint, scanlines, a sweep, and the cooldown badge ──
  const overlay = document.createElement('div'); overlay.className = 'av-overlay'; root.appendChild(overlay);
  const badge = document.createElement('div'); badge.className = 'av-badge';
  badge.innerHTML = '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" class="av-track"/><circle cx="20" cy="20" r="17" class="av-fill" id="av-fill"/></svg><span>AV</span><small><kbd class="p">L3+R3</kbd><kbd class="k">B</kbd></small>';
  root.appendChild(badge);
  const tagLayer = document.createElement('div'); tagLayer.className = 'av-tags'; root.appendChild(tagLayer);

  // ── world: an expanding wall of light that passes through everything ──
  const waveMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    uniforms: { uA: { value: 0 }, uT: { value: 0 }, uC: { value: new THREE.Color('#4d99ff') } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform float uA; uniform float uT; uniform vec3 uC; varying vec2 vUv;
      void main(){ float h = vUv.y; float band = smoothstep(0.0, 0.08, h) * (1.0 - h) * (1.0 - h);
        float lines = 0.6 + 0.4 * step(0.5, fract(h * 40.0 - uT * 3.0)); float grid = 0.75 + 0.25 * step(0.92, fract(vUv.x * 90.0));
        gl_FragColor = vec4(uC * 1.8 * lines * grid, band * uA * 0.8); }`
  });
  const wave = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 26, 96, 1, true), waveMat);
  wave.geometry.translate(0, 13 - 3, 0); wave.visible = false; wave.renderOrder = 5; scene.add(wave);

  const targets = [];   // { id, kind, label, pos(): Vector3, object?(): Object3D, active(): bool }
  const marks = new Map(); // id → { holo, tag, until, t }
  let cool = 0, scan = null; // scan = { origin, r, t }
  let lootColor = '#6fb4ff'; // follows the player's astral colour (blue, or green for the Psychosyd skin)
  function setColor(c, wave = c) { lootColor = c; waveMat.uniforms.uC.value.set(wave); }
  const tmp = new THREE.Vector3();

  function register(t) { targets.push(t); return () => { const i = targets.indexOf(t); if (i >= 0) targets.splice(i, 1); }; }

  function holoOf(obj, color) {
    const mat = new THREE.ShaderMaterial({ vertexShader: holoVert, fragmentShader: holoFrag, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uT: { value: 0 }, uA: { value: 0 }, uC: { value: new THREE.Color(color) } } });
    const g = new THREE.Group(); g.matrixAutoUpdate = false; g.renderOrder = 40;
    obj.updateMatrixWorld(true);
    const inv = obj.matrixWorld.clone().invert();
    obj.traverse(o => { if (o.isMesh && o.visible !== false) { const m = new THREE.Mesh(o.geometry, mat); m.matrixAutoUpdate = false; m.matrix.copy(inv).multiply(o.matrixWorld); m.renderOrder = 40; g.add(m); } });
    g.userData.mat = mat; g.userData.src = obj; scene.add(g); return g;
  }
  function mark(t) {
    if (marks.has(t.id)) { marks.get(t.id).until = ASTRALVISION.hold; return; }
    const color = t.kind === 'quest' ? '#ffd98a' : lootColor, obj = t.object?.();
    const holo = obj ? holoOf(obj, color) : null;
    const tag = document.createElement('div'); tag.className = 'av-tag ' + t.kind; tag.innerHTML = `<i></i><b>${t.label}</b><small></small>`; tagLayer.appendChild(tag);
    marks.set(t.id, { t, holo, tag, until: ASTRALVISION.hold, age: 0 });
    const p = t.pos(); fx?.emit(p.x, p.y + 1, p.z, 10, { color, speed: 1.5, up: 1.2, size: 0.35, life: 0.6, g: 0 });
  }
  function unmark(id) { const m = marks.get(id); if (!m) return; if (m.holo) { scene.remove(m.holo); m.holo.userData.mat.dispose(); } m.tag.remove(); marks.delete(id); }

  // Fire the scan. Returns false while it's recharging.
  function pulse(origin) {
    if (cool > 0) return false;
    cool = ASTRALVISION.cooldown; scan = { origin: origin.clone(), r: 0, t: 0, hit: new Set() };
    overlay.classList.remove('on'); void overlay.offsetWidth; overlay.classList.add('on');
    fx?.emit(origin.x, origin.y + 1.2, origin.z, 24, { color: '#7fb0ff', speed: 4, up: 0.8, size: 0.4, life: 0.5, g: 0 });
    for (const t of targets) if (t.far && t.active()) { scan.hit.add(t.id); mark(t); } // always found, however far (the dropped Zycube)
    return true;
  }

  function update(dt, time, playerPos) {
    cool = Math.max(0, cool - dt);
    const f = 1 - cool / ASTRALVISION.cooldown, C = 2 * Math.PI * 17;
    document.getElementById('av-fill').style.strokeDashoffset = `${C * (1 - f)}`;
    badge.classList.toggle('ready', cool <= 0);
    if (scan) {
      scan.t += dt; scan.r = scan.t * ASTRALVISION.speed;
      const k = scan.r / ASTRALVISION.range;
      wave.visible = k < 1; wave.position.set(scan.origin.x, scan.origin.y, scan.origin.z); wave.scale.set(Math.max(0.1, scan.r), 1, Math.max(0.1, scan.r));
      waveMat.uniforms.uA.value = Math.min(1, scan.t * 6) * (1 - k); waveMat.uniforms.uT.value = time;
      for (const t of targets) { // the wave front passes a target → it lights up
        if (scan.hit.has(t.id) || !t.active()) continue;
        const p = t.pos(); if (Math.hypot(p.x - scan.origin.x, p.z - scan.origin.z) <= scan.r) { scan.hit.add(t.id); mark(t); }
      }
      if (k >= 1) scan = null;
    }
    // live marks: holograms follow their objects; tags track them on screen
    for (const [id, m] of marks) {
      m.until -= dt; m.age += dt;
      if (m.until <= 0 || !m.t.active()) { unmark(id); continue; }
      const a = Math.min(1, m.age * 3) * Math.min(1, m.until / 1.2);
      if (m.holo) { const src = m.holo.userData.src; src.updateMatrixWorld(true); m.holo.matrix.copy(src.matrixWorld); m.holo.userData.mat.uniforms.uA.value = a * (0.75 + 0.25 * Math.sin(time * 6)); m.holo.userData.mat.uniforms.uT.value = time; }
      const p = m.t.pos(); tmp.set(p.x, p.y + (m.t.tagHeight ?? 1.6), p.z).project(camera);
      const on = tmp.z < 1 && Math.abs(tmp.x) < 1.1 && Math.abs(tmp.y) < 1.1;
      m.tag.style.opacity = on ? a : 0;
      if (on) { m.tag.style.transform = `translate(${(tmp.x * 0.5 + 0.5) * innerWidth}px, ${(-tmp.y * 0.5 + 0.5) * innerHeight}px)`; m.tag.querySelector('small').textContent = `${Math.round(Math.hypot(p.x - playerPos.x, p.y - playerPos.y, p.z - playerPos.z))} m`; }
    }
  }
  // what the minimap draws: the expanding ring and the marked targets
  const minimap = () => ({
    ring: scan ? { x: scan.origin.x, z: scan.origin.z, r: scan.r, a: 1 - scan.r / ASTRALVISION.range } : null,
    blips: [...marks.values()].map(m => { const p = m.t.pos(); return { x: p.x, z: p.z, kind: m.t.kind, a: Math.min(1, m.until / 1.2) }; })
  });
  return { register, pulse, update, minimap, setColor, get cooldown() { return cool; }, get marks() { return marks.size; } };
}
