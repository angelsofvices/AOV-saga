// Astragraphy: what Rizer sees through the Telescope. A view onto aethryx-data.js, never the owner of it.
//   Expanse (Aenor, 27 ordered worlds, the drift world) → zone → world inspection, all one continuous space:
//   every change of scale is a camera move, so the Expanse itself is the interface.
// The game calls open() once the eyepiece transition has gone dark, frame(dt, pad) while it is active, and gets
// onExit() back when the player backs out of the Expanse. Nothing here moves Rizer or touches the game world.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { TARGETS, TARGET, QUADRANTS, QUADRANT_ORDER, KNOWLEDGE_LABEL, PLAYABILITY_LABEL, UNKNOWN_TEXT, TELESCOPES, ASTRAGRAPHY_SETTINGS, displayLabel, displayNumber } from './aethryx-data.js';
import { R0, buildWorld, buildStar, glowSprite, ringMarkTex, dirOf } from './astro-bodies.js';

const RING_R = n => 22 + n * 8;                       // orbital spire radius (ring 1 … 7)
const FAN = [-28, 17, -15, 29, -31, 13, 25];            // degrees off the zone's spire, per ring, so the worlds read apart
const ORBIT = { cx: -6, cz: -4, a: 102, b: 72, yaw: 0.62, tilt: 0.2, at: 5.62 }; // the drift world's own path
const VIEW = { fov: 44, expanse: { dist: 244, pitch: 0.98 }, zone: { dist: 124, pitch: 0.9 } };
// One table from action to pad button and glyph (standard mapping), so nothing else names a button.
const PAD = { confirm: 0, back: 1, scan: 2, hide: 3, zonePrev: 4, zoneNext: 5, zoomOut: 6, zoomIn: 7, poiUp: 12, poiDown: 13, prev: 14, next: 15 };
const GLYPH = { confirm: '✕', back: '○', scan: '□', hide: '△', zonePrev: 'L1', zoneNext: 'R1', zoomOut: 'L2', zoomIn: 'R2', prev: 'D◀', next: 'D▶', move: 'L', look: 'R', poi: 'D▲▼' };
const KEYS = { confirm: 'Enter', back: 'Esc', scan: 'F', hide: 'H', prev: 'A', next: 'D', move: 'Arrows', look: 'Drag', zoom: 'Wheel', poi: 'W / S', zone: '1–4' };
const esc = v => String(v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ease = k => k * k * (3 - 2 * k), clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const flat = (deg, r, y = 0) => { const a = deg * Math.PI / 180; return new THREE.Vector3(Math.sin(a) * r, y, -Math.cos(a) * r); }; // 0° = north (up the screen), clockwise

export function createAstragraphy({ host, renderer, log, onExit = () => {}, toast = () => {} }) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#04030a');
  const camera = new THREE.PerspectiveCamera(VIEW.fov, innerWidth / innerHeight, 0.1, 3000); scene.add(camera);
  const composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.42, 0.6, 0.86); composer.addPass(bloom); composer.addPass(new OutputPass());
  scene.add(new THREE.AmbientLight('#8a86a8', 0.9));
  const sun = new THREE.PointLight('#fff0d0', 2.4, 0, 0); scene.add(sun);
  const key = new THREE.DirectionalLight('#ffffff', 0), keyAim = new THREE.Object3D(); key.position.set(-3, 2.6, 2); camera.add(key); scene.add(keyAim); key.target = keyAim; // lights the world being inspected

  // ── the Expanse: stars, nebula, spires, rings, zones, rock ──
  const system = new THREE.Group(); scene.add(system);
  { const n = 2200, p = new Float32Array(n * 3), c = new Float32Array(n * 3), col = new THREE.Color(); let s = 9;
    const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    for (let i = 0; i < n; i++) { const u = r() * 2 - 1, a = r() * 6.2832, q = Math.sqrt(1 - u * u), d = 700 + r() * 500; p.set([q * Math.cos(a) * d, u * d, q * Math.sin(a) * d], i * 3); col.setHSL(r() < 0.2 ? 0.75 : r() < 0.4 ? 0.1 : 0.6, 0.5, 0.6 + r() * 0.35); c.set([col.r, col.g, col.b], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 2.2, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0.9 })));
    for (const [x, y, z, colr, size, o] of [[-380, -160, -420, '#5a2ab0', 700, 0.28], [420, -120, -300, '#2a4ab8', 620, 0.22], [300, -200, 380, '#b0502a', 560, 0.16], [-420, -180, 300, '#2a8a6a', 520, 0.14], [0, -260, -80, '#c88a2a', 460, 0.2]]) { const sp = glowSprite(colr, size, o); sp.position.set(x, y, z); scene.add(sp); } }
  const dashed = (pts, color, opacity, dash = 0.5, gap = 0.9) => { const l = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({ color, transparent: true, opacity, dashSize: dash, gapSize: gap, depthWrite: false })); l.computeLineDistances(); return l; };
  for (let n = 1; n <= 7; n++) { const pts = []; for (let i = 0; i < 180; i++) pts.push(flat(i * 2, RING_R(n))); system.add(dashed(pts, '#e9c982', 0.34)); }
  for (const n of [0.55, 0.8, 1.05]) { const pts = []; for (let i = 0; i < 90; i++) pts.push(flat(i * 4, RING_R(1) * n)); system.add(dashed(pts, '#ffcf6a', 0.5, 0.25, 0.35)); } // Aenor's glyph circles
  const zoneMarks = {};
  for (const q of Object.values(QUADRANTS)) {
    system.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([flat(q.angle, 8), flat(q.angle, RING_R(7) + 6)]), new THREE.LineBasicMaterial({ color: q.color, transparent: true, opacity: 0.5 })));
    const w = new THREE.Mesh(new THREE.RingGeometry(9, RING_R(7) + 4, 40, 1, Math.PI / 2 - (q.angle + 45) * Math.PI / 180, Math.PI / 2), new THREE.MeshBasicMaterial({ color: q.color, transparent: true, opacity: 0.02, side: THREE.DoubleSide, depthWrite: false })); w.rotation.x = -Math.PI / 2; w.position.y = -0.3; system.add(w);
    zoneMarks[q.key] = { wedge: w, at: flat(q.angle, RING_R(7) + 13) };
  }
  { const n = 260, m = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: '#3a2c26', roughness: 1, flatShading: true }), n), o = new THREE.Object3D(); let s = 77;
    const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    for (let i = 0; i < n; i++) { const band = r() < 0.6 ? RING_R(7) + 10 + r() * 16 : RING_R(Math.floor(r() * 6) + 1) + 4; const a = r() * 360; o.position.copy(flat(a, band + (r() - 0.5) * 2.5, (r() - 0.5) * 3)); o.rotation.set(r() * 6, r() * 6, r() * 6); o.scale.setScalar(0.25 + r() * 0.9); o.updateMatrix(); m.setMatrixAt(i, o.matrix); }
    system.add(m); system.userData.rocks = m; }
  const driftAt = t => new THREE.Vector3(Math.cos(t) * ORBIT.a, 0, Math.sin(t) * ORBIT.b).applyAxisAngle(new THREE.Vector3(1, 0, 0), ORBIT.tilt).applyAxisAngle(new THREE.Vector3(0, 1, 0), ORBIT.yaw).add(new THREE.Vector3(ORBIT.cx, 0, ORBIT.cz));
  { const pts = []; for (let i = 0; i < 220; i++) pts.push(driftAt(i / 220 * 6.2832)); system.add(dashed(pts, '#a45cf0', 0.75, 1.6, 1.3)); } // broken, tilted, crossing every zone

  // ── bodies: a light model for the Expanse, a detailed one built only while a world is inspected ──
  const bodies = {}, order = TARGETS.map(t => t.id), picks = [];
  for (const t of TARGETS) {
    const pos = t.celestialType === 'STAR' ? new THREE.Vector3() : t.celestialType === 'DRIFT_WORLD' ? driftAt(ORBIT.at) : flat(QUADRANTS[t.quadrant].angle + FAN[t.ring - 1], RING_R(t.ring));
    const node = new THREE.Group(); node.position.copy(pos); system.add(node);
    const lite = (t.visual.star ? buildStar : buildWorld)(t, 0); node.add(lite.group);
    if (t.celestialType === 'DRIFT_WORLD') { const d = driftAt(ORBIT.at - 0.02).sub(pos); node.rotation.y = Math.atan2(-d.z, d.x); } // its trail lies back along its path
    const pick = new THREE.Mesh(new THREE.SphereGeometry(lite.r * Math.min(lite.extent, 1.7) * 1.15, 10, 8), new THREE.MeshBasicMaterial({ visible: false })); pick.userData.id = t.id; node.add(pick); picks.push(pick);
    bodies[t.id] = { t, pos, node, lite, full: null, r: lite.r, extent: lite.extent };
    if (t.currentWorld) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: ringMarkTex(), color: '#49e0d0', transparent: true, depthWrite: false, depthTest: false })); m.scale.setScalar(lite.r * lite.extent * 2.5); node.add(m); bodies[t.id].here = m; }
  }
  const selRing = new THREE.Sprite(new THREE.SpriteMaterial({ map: ringMarkTex(), color: '#ffd27a', transparent: true, depthWrite: false, depthTest: false })); scene.add(selRing);
  const model = id => bodies[id].full || bodies[id].lite;
  const tel = () => TELESCOPES[ASTRAGRAPHY_SETTINGS.telescope] || TELESCOPES.stargazer;
  const poisOf = id => TARGET[id].astragraphy.pointsOfInterest.filter(p => !tel().poiKinds || tel().poiKinds.includes(p.kind));

  // ── state ──
  let active = false, mode = 'expanse', zone = null, sel = 'zyraxis', focus = null, cameFrom = 'expanse', poiSel = null, aim = false, uiHidden = false, drawer = null;
  let scan = 0, scanHeld = false, scanDone = 0, time = 0, closing = 0, glowK = 1;
  const P = { t: new THREE.Vector3(), dist: VIEW.expanse.dist, yaw: 0, pitch: VIEW.expanse.pitch }; // where the instrument is pointed
  let fly = null; // { from, to, k, T, bump }
  const poseExpanse = () => ({ t: new THREE.Vector3(-18, 0, 15), dist: VIEW.expanse.dist, yaw: 0, pitch: VIEW.expanse.pitch });
  const poseZone = q => ({ t: flat(QUADRANTS[q].angle, 52), dist: VIEW.zone.dist, yaw: -QUADRANTS[q].angle * Math.PI / 180 * 0.18, pitch: VIEW.zone.pitch });
  const limits = id => { const b = bodies[id], base = b.r * b.extent; return { min: base * 1.75, max: base * 7, home: base * 3.6 }; };
  const posePlanet = id => { const b = bodies[id], out = b.pos.lengthSq() > 1 ? Math.atan2(b.pos.x, b.pos.z) : 0; return { t: b.pos.clone(), dist: limits(id).home, yaw: out + Math.PI + 0.42, pitch: b.t.celestialType === 'STAR' ? 0.72 : 0.16 }; }; // from the sunward side looking outward: open space behind the world, never Aenor's glare
  function flyTo(to, T = 1.7) {
    const from = { t: P.t.clone(), dist: P.dist, yaw: P.yaw, pitch: P.pitch }; let dy = to.yaw - from.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    const far = from.t.distanceTo(to.t), bump = mode === 'planet' && from.dist < 60 && to.dist < 60 ? Math.min(70, far * 0.75) : 0; // world → world: pull away, cross the Expanse, close in
    fly = { from, to: { ...to, yaw: from.yaw + dy }, k: 0, T: T + Math.min(1.1, far / 90), bump };
  }
  function setFull(id) { // one detailed world at a time
    for (const b of Object.values(bodies)) if (b.full && b.t.id !== id) { b.node.remove(b.full.group); b.full.dispose(); b.full = null; b.lite.group.visible = true; }
    if (!id) return; const b = bodies[id]; if (b.full) return;
    b.full = (b.t.visual.star ? buildStar : buildWorld)(b.t, 1); b.full.spin.rotation.y = b.lite.spin.rotation.y; b.node.add(b.full.group); b.lite.group.visible = false;
  }
  function goExpanse() { mode = 'expanse'; zone = null; focus = null; poiSel = null; flyTo(poseExpanse()); refresh(); }
  function goZone(q) { mode = 'zone'; zone = q; focus = null; poiSel = null; if (TARGET[sel]?.quadrant !== q) sel = TARGETS.find(t => t.quadrant === q).id; flyTo(poseZone(q)); refresh(); }
  function inspect(id) {
    log.observe(id); // first time: FIRST OBSERVED goes in the history. Looking again logs nothing.
    if (mode !== 'planet') cameFrom = mode;
    setFull(id); const to = posePlanet(id); sel = id; focus = id; poiSel = null; aim = false; scan = 0; flyTo(to); mode = 'planet'; refresh();
  }
  function back() {
    if (drawer) { drawer = null; return refresh(); }
    if (mode === 'planet') return cameFrom === 'zone' && zone ? goZone(zone) : goExpanse();
    if (mode === 'zone') return goExpanse();
    close();
  }
  const step = d => inspect(order[(order.indexOf(focus ?? sel) + d + order.length) % order.length]);
  function selectPoi(i) { const list = poisOf(focus); if (!list.length) return; poiSel = i == null ? null : (i + list.length) % list.length; aim = poiSel != null; scan = 0; model(focus).frozen = poiSel != null; refresh(); }

  // ── interface ──
  const root = document.createElement('div'); root.className = 'astro'; host.appendChild(root);
  const shutterEl = document.createElement('div'); shutterEl.className = 'astro-shutter'; host.appendChild(shutterEl);
  root.innerHTML = `<div class="astro-lens"></div><div class="astro-labels"></div><div class="astro-pois"></div><div class="astro-reticle"><i></i><b></b></div>
    <header class="astro-title astro-ui"><span class="astro-compass">✦</span><div><b>THE AETHRYX EXPANSE</b><small id="astro-sub"></small></div></header>
    <div class="astro-mode astro-ui">ASTRAGRAPHY MODE<small id="astro-dev"></small></div>
    <nav class="astro-nav astro-ui" id="astro-nav"></nav><section class="astro-card astro-ui" id="astro-card"></section>
    <aside class="astro-side astro-ui" id="astro-side"></aside><section class="astro-drawer astro-ui" id="astro-drawer"></section>
    <div class="astro-legend astro-ui" id="astro-legend"></div><footer class="astro-hints astro-ui" id="astro-hints"></footer><div class="astro-flash" id="astro-flash"></div>`;
  const $ = s => root.querySelector(s), labelsEl = $('.astro-labels'), poisEl = $('.astro-pois'), reticle = $('.astro-reticle');
  const labels = {};
  for (const t of TARGETS) { const el = document.createElement('button'); el.className = `astro-label ${t.celestialType === 'STAR' ? 'star' : t.celestialType === 'DRIFT_WORLD' ? 'drift' : ''}`; el.dataset.id = t.id; labelsEl.appendChild(el); labels[t.id] = el; }
  for (const q of Object.values(QUADRANTS)) { const el = document.createElement('button'); el.className = 'astro-zone'; el.dataset.zone = q.key; el.style.setProperty('--c', q.color); el.innerHTML = `<i>✥</i><span>Q ${q.numeral}<b>${q.key}</b></span>`; labelsEl.appendChild(el); zoneMarks[q.key].el = el; }
  const hint = (act, text, keyName = KEYS[act]) => `<span><kbd class="k">${esc(keyName)}</kbd><kbd class="p">${GLYPH[act]}</kbd>${text}</span>`;
  const title = t => { const known = log.can(t.id, 'name'); return known ? t.name : UNKNOWN_TEXT.object; };
  const fullLabel = t => log.can(t.id, 'name') ? displayLabel(t) : UNKNOWN_TEXT.object;
  const lines = (id, section, arr) => log.can(id, section) ? (arr.length ? arr.map(esc).join('<br>') : '—') : `<i class="astro-unk">${UNKNOWN_TEXT.data}</i>`;
  const zoneLine = t => t.celestialType === 'STAR' ? 'CENTRAL STAR' : t.celestialType === 'DRIFT_WORLD' ? 'DRIFT WORLD' : QUADRANTS[t.quadrant].name.toUpperCase();
  function refresh() {
    if (!active) return;
    const comp = log.completion(), t = TARGET[focus ?? sel];
    root.dataset.mode = mode; root.classList.toggle('hide-ui', uiHidden); root.classList.toggle('has-drawer', !!drawer);
    $('#astro-sub').textContent = mode === 'planet' ? 'ASTRAGRAPHY MODE' : '27 WORLDS · 1 DRIFT · 4 ZONES · 1 STAR';
    $('#astro-dev').textContent = log.unlocked ? 'DEV · ALL UNLOCKED' : '';
    for (const x of TARGETS) { const el = labels[x.id]; el.textContent = fullLabel(x).toUpperCase() + (x.celestialType === 'DRIFT_WORLD' ? '\nDRIFT WORLD' : x.celestialType === 'STAR' ? '\nTHE HIGHEST EYE' : ''); el.classList.toggle('sel', x.id === sel); el.classList.toggle('here', !!x.currentWorld); }
    // left rail
    $('#astro-nav').innerHTML = mode === 'planet'
      ? `<button data-act="back"><i>‹</i>BACK TO ${cameFrom === 'zone' && zone ? QUADRANTS[zone].name.toUpperCase() : 'EXPANSE'}</button>
         <button data-act="prev"><i>✥</i><span>PREVIOUS<b>${esc(fullLabel(TARGET[order[(order.indexOf(focus) - 1 + order.length) % order.length]]))}</b></span></button>
         <button data-act="next"><i>✥</i><span>NEXT<b>${esc(fullLabel(TARGET[order[(order.indexOf(focus) + 1) % order.length]]))}</b></span></button>`
      : `<button data-act="expanse" class="${mode === 'expanse' ? 'on' : ''}"><i>◎</i>COMPLETE VIEW</button>` +
        QUADRANT_ORDER.map(k => `<button data-zone="${k}" class="${zone === k ? 'on' : ''}" style="--c:${QUADRANTS[k].color}"><i>✥</i>${QUADRANTS[k].name.toUpperCase()}</button>`).join('') +
        `<hr>` + [['log', '▤', 'PLANET LOG', ''], ['astro', '✧', 'ASTRAGRAPHY', comp.pct + '%'], ['dad', '▥', "DAD'S NOTES", ''], ['space', '◭', 'SPACE STUDIES', ''], ['photos', '◉', 'PHOTOS', ''], ['mysteries', '?', 'MYSTERIES', '']]
          .map(([k, ic, name, v]) => `<button data-drawer="${k}" class="${drawer === k ? 'on' : ''}"><i>${ic}</i>${name}<em>${v}</em></button>`).join('');
    // the selected target (Expanse / zone) or the inspected world's sheet
    const num = displayNumber(t), known = log.can(t.id, 'name'), st = log.state(t.id), play = log.playability(t.id);
    const rows = [['TYPE', lines(t.id, 'classification', [t.type])], ['ASTRALITE', lines(t.id, 'astralite', t.astragraphy.astraliteInfo.slice(0, 1))], ['CIVILIZATION', lines(t.id, 'civilization', t.astragraphy.civilizationInfo)], ['ENVIRONMENT', lines(t.id, 'environment', t.astragraphy.environmentInfo)]];
    if (mode === 'planet') {
      if (t.visual.moons) rows.push(['MOONS', `${t.visual.moons.length} Known`]);
      rows.push(['STATUS', `<span class="st ${log.observed(t.id) ? 'ok' : ''}">◆ ${log.observed(t.id) ? 'Observed' : 'Unobserved'}</span>`], ['KNOWLEDGE', `<span class="st kn">◆ ${KNOWLEDGE_LABEL[st]}</span>`],
        ['PLAYABILITY', t.currentWorld ? 'Current World' : t.celestialType === 'STAR' ? '—' : esc(PLAYABILITY_LABEL[play])]);
    }
    $('#astro-card').innerHTML = `<div class="astro-card-head ${t.celestialType.toLowerCase()}">${num ? `<em>${esc(num)}</em>` : ''}<div><b>${esc(title(t).toUpperCase())}</b><span>${zoneLine(t)}</span>${t.currentWorld ? '<u>CURRENT WORLD</u>' : ''}<small>${known ? esc(t.register.toUpperCase()) : ''}</small></div></div>
      <dl>${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>${mode === 'planet' ? (t.visual.placeholder ? '<p class="astro-dev">MODEL · DEVELOPMENT PLACEHOLDER · CREATOR REFERENCE REQUIRED</p>' : '<p class="astro-dev ok">MODEL · CREATOR REFERENCE APPROVED</p>') : `<button class="astro-go" data-act="inspect"><kbd class="k">Enter</kbd><kbd class="p">${GLYPH.confirm}</kbd>VIEW DETAILS</button>`}`;
    // right column: layered, the player chooses how deep to read
    if (mode === 'planet') {
      const A = t.astragraphy, list = poisOf(t.id), dad = log.notes(t.id, 'dad'), riz = log.notes(t.id, 'rizer'), sp = log.notes(t.id, 'space');
      const note = n => `<p>${esc(typeof n === 'string' ? n : n.text || '')}</p>`;
      $('#astro-side').innerHTML = `<section><h4>${t.celestialType === 'STAR' ? 'STAR OVERVIEW' : 'PLANET OVERVIEW'}</h4><p>${lines(t.id, 'summary', [A.summary])}</p>${log.can(t.id, 'history') && A.historyInfo.length ? `<p class="dim">${A.historyInfo.map(esc).join('<br>')}</p>` : ''}</section>
        <section><h4>ASTRALITE SIGNATURE</h4><p>${A.astraliteInfo.length ? lines(t.id, 'astralite', A.astraliteInfo) : `<i class="astro-unk">${UNKNOWN_TEXT.astral}</i>`}</p></section>
        <section><h4>KEY OBSERVATIONS<em>${list.filter(p => log.poiKnown(t.id, p.id)).length} / ${list.length} LOGGED</em></h4>${list.length ? list.map((p, i) => { const got = log.poiKnown(t.id, p.id); return `<button class="astro-poi-row ${poiSel === i ? 'on' : ''} ${got ? 'got' : ''}" data-poi="${i}"><i>${got ? '✦' : '✧'}</i><span><b>${esc(p.name)}</b>${got || log.unlocked ? esc(p.note) : 'Hold focus to resolve this observation.'}</span></button>`; }).join('') : '<p class="dim">No observation targets logged.</p>'}</section>
        <details><summary>DAD'S NOTES</summary>${dad.length ? dad.map(note).join('') : `<p class="astro-unk">${UNKNOWN_TEXT.dad}</p>`}</details>
        <details><summary>RIZER'S NOTES</summary>${riz.length ? riz.map(note).join('') : '<p class="dim">Nothing written yet.</p>'}</details>
        <details><summary>SPACE STUDIES</summary>${sp.length ? sp.map(note).join('') : `<p class="astro-unk">${UNKNOWN_TEXT.space}</p>`}</details>
        <details><summary>MYSTERIES${A.mysteries.length ? `<em>${A.mysteries.length}</em>` : ''}</summary>${A.mysteries.length ? A.mysteries.map(m => `<p class="${log.mysteryKnown(t.id, m.id) ? '' : 'astro-unk'}"><b>${esc(m.title)}</b> · ${log.mysteryKnown(t.id, m.id) ? 'Resolved' : UNKNOWN_TEXT[m.state]}</p>`).join('') : '<p class="dim">None recorded.</p>'}</details>`;
    } else $('#astro-side').innerHTML = '';
    $('#astro-legend').innerHTML = [['#ffc24a', 'AENOR (STAR)'], ['#e9e2c8', 'ORDERED WORLD'], ['#a45cf0', 'DRIFT WORLD'], ['#49e0d0', 'CURRENT WORLD'], ['#ffd27a', 'SELECTED']].map(([c, n]) => `<span><i style="background:${c}"></i>${n}</span>`).join('');
    $('#astro-hints').innerHTML = mode === 'planet'
      ? hint('look', 'ROTATE') + hint('zoomIn', 'ZOOM', KEYS.zoom) + hint('prev', 'PREVIOUS') + hint('next', 'NEXT') + `<span><kbd class="k">${KEYS.poi}</kbd><kbd class="p">${GLYPH.poi}</kbd>OBSERVATIONS</span>` + hint('scan', 'HOLD · FOCUS / SCAN') + hint('hide', 'HIDE UI') + hint('back', 'BACK')
      : hint('move', 'MOVE') + `<span><kbd class="k">${KEYS.zone}</kbd><kbd class="p">${GLYPH.zonePrev} ${GLYPH.zoneNext}</kbd>ZONES</span>` + hint('confirm', 'VIEW DETAILS') + hint('hide', 'HIDE UI') + hint('back', mode === 'zone' ? 'COMPLETE VIEW' : 'LEAVE TELESCOPE');
    renderDrawer(comp);
  }
  function renderDrawer(comp) {
    const el = $('#astro-drawer'); if (!drawer) { el.innerHTML = ''; return; }
    const head = (a, b) => `<header><b>${a}</b><small>${b}</small><button data-act="closeDrawer">×</button></header>`;
    let body = '';
    if (drawer === 'log') body = head('PLANET LOG', 'Every target the Telescope can reach') + TARGETS.map(t => `<button class="astro-log-row" data-inspect="${t.id}"><em>${esc(displayNumber(t) || '✦')}</em><b>${esc(title(t))}</b><span>${zoneLine(t)}</span><i>${KNOWLEDGE_LABEL[log.state(t.id)]}</i></button>`).join('');
    else if (drawer === 'astro') { const H = log.history(), name = { FIRST_OBSERVED: 'First observed', FIRST_IDENTIFIED: 'First identified', STUDY_COMPLETED: 'Study completed', POI_DISCOVERED: 'Observation logged', MYSTERY_RESOLVED: 'Mystery resolved' };
      body = head('ASTRAGRAPHY', 'What Rizer knows about the Expanse') + `<div class="astro-meter"><i style="width:${comp.pct}%"></i></div><p class="big">${comp.pct}%<small>KNOWLEDGE · ${comp.got} of ${comp.all}</small></p><h5>OBSERVATION HISTORY</h5>` + (H.length ? H.slice(0, 40).map(h => `<p class="astro-hist"><b>${name[h.kind] || h.kind}</b> · ${esc(title(TARGET[h.id] || { id: h.id, name: h.id }))}${h.poi ? ' · ' + esc(TARGET[h.id]?.astragraphy.pointsOfInterest.find(p => p.id === h.poi)?.name || '') : ''}</p>`).join('') : '<p class="dim">No observations recorded yet. Inspect a world to begin.</p>'); }
    else if (drawer === 'dad') { const all = TARGETS.flatMap(t => log.notes(t.id, 'dad').map(n => [t, n])); body = head("DAD'S NOTES", 'His research on the Expanse') + (all.length ? all.map(([t, n]) => `<p><b>${esc(title(t))}</b> · ${esc(typeof n === 'string' ? n : n.text || '')}</p>`).join('') : `<p class="astro-unk">${UNKNOWN_TEXT.dad}</p><p class="dim">Notebook pages add his research here as they are found.</p>`); }
    else if (drawer === 'space') { const all = TARGETS.flatMap(t => log.notes(t.id, 'space').map(n => [t, n])); body = head('SPACE STUDIES', 'Coursework and classification') + (all.length ? all.map(([t, n]) => `<p><b>${esc(title(t))}</b> · ${esc(typeof n === 'string' ? n : n.text || '')}</p>`).join('') : `<p class="astro-unk">${UNKNOWN_TEXT.space}</p>`); }
    else if (drawer === 'photos') { const n = TARGETS.reduce((s, t) => s + log.photos(t.id).length, 0); body = head('PHOTOS', 'Astragraphy photographs') + `<p class="dim">${n ? n + ' photographs stored.' : 'No photographs yet. The Camera is not linked to the Telescope.'}</p>`; }
    else if (drawer === 'mysteries') { const all = TARGETS.flatMap(t => t.astragraphy.mysteries.map(m => [t, m])); body = head('MYSTERIES', 'Seen, not yet understood') + (all.length ? all.map(([t, m]) => `<button class="astro-log-row" data-inspect="${t.id}"><em>?</em><b>${esc(title(t))}</b><span>${esc(m.title)}</span><i>${log.mysteryKnown(t.id, m.id) ? 'Resolved' : UNKNOWN_TEXT[m.state]}</i></button>`).join('') : '<p class="dim">None recorded.</p>'); }
    el.innerHTML = body;
  }
  root.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || fly && fly.k < 0.2) return;
    if (b.dataset.id) return inspect(b.dataset.id);
    if (b.dataset.inspect) { drawer = null; return inspect(b.dataset.inspect); }
    if (b.dataset.zone) return goZone(b.dataset.zone);
    if (b.dataset.drawer) { drawer = drawer === b.dataset.drawer ? null : b.dataset.drawer; return refresh(); }
    if (b.dataset.poi != null) return selectPoi(poiSel === +b.dataset.poi ? null : +b.dataset.poi);
    const a = b.dataset.act;
    if (a === 'back') back(); else if (a === 'prev') step(-1); else if (a === 'next') step(1); else if (a === 'expanse') goExpanse(); else if (a === 'inspect') inspect(sel); else if (a === 'closeDrawer') { drawer = null; refresh(); }
  });

  // ── pointer, keys ──
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let drag = null, heldKeys = new Set();
  const inUi = e => !!e.target.closest?.('.astro-ui, .astro-label, .astro-zone, .astro-poi');
  const hit = e => { ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera); return ray.intersectObjects(picks, false)[0]?.object.userData.id || null; };
  const onDown = e => { if (inUi(e)) return; e.stopPropagation(); drag = { x: e.clientX, y: e.clientY, moved: 0 }; };
  const onMove = e => {
    if (drag) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY; drag.moved += Math.abs(dx) + Math.abs(dy);
      if (mode === 'planet' && !fly) { P.yaw -= dx * 0.006; P.pitch = clamp(P.pitch + dy * 0.006, -1.3, 1.3); aim = false; } }
    else if (mode !== 'planet' && !inUi(e) && !fly) { const id = hit(e); host.style.cursor = id ? 'pointer' : ''; if (id && id !== sel) { sel = id; refresh(); } }
  };
  const onUp = e => { if (!drag) return; const click = drag.moved < 6; drag = null; if (click && mode !== 'planet' && !inUi(e) && !fly) { const id = hit(e); if (id) inspect(id); } };
  const onWheel = e => { if (inUi(e)) return; e.stopPropagation(); if (mode === 'planet' && !fly) { const L = limits(focus); P.dist = clamp(P.dist * (1 + Math.sign(e.deltaY) * 0.1), L.min, L.max); } };
  function nearest(dx, dy) { // the closest target in a screen direction, for keys and the stick
    const here = labelPos(sel), pool = TARGETS.filter(t => mode !== 'zone' || t.quadrant === zone); let best = null, bs = 1e9;
    for (const t of pool) { if (t.id === sel) continue; const p = labelPos(t.id), vx = p.x - here.x, vy = p.y - here.y, d = Math.hypot(vx, vy), along = (vx * dx + vy * dy) / (d || 1); if (along < 0.35) continue; const s = d / (along * along); if (s < bs) { bs = s; best = t.id; } }
    if (best) { sel = best; refresh(); }
  }
  function act(a) {
    if (fly && fly.k < 0.5 && a !== 'hide') return;
    if (a === 'hide') { uiHidden = !uiHidden; return refresh(); }
    if (a === 'back') return back();
    if (mode === 'planet') { if (a === 'prev') step(-1); else if (a === 'next') step(1); else if (a === 'poiUp') selectPoi((poiSel ?? 0) - 1); else if (a === 'poiDown') selectPoi(poiSel == null ? 0 : poiSel + 1); return; }
    if (a === 'confirm') return inspect(sel);
    if (a === 'zoneNext' || a === 'zonePrev') { const i = zone ? QUADRANT_ORDER.indexOf(zone) : -1, n = (i + (a === 'zoneNext' ? 1 : -1) + 5) % 5; return n === 4 ? goExpanse() : goZone(QUADRANT_ORDER[n]); }
    if (a === 'left') nearest(-1, 0); else if (a === 'right') nearest(1, 0); else if (a === 'up') nearest(0, -1); else if (a === 'down') nearest(0, 1);
  }
  const KEYMAP = { Escape: 'back', Backspace: 'back', Enter: 'confirm', KeyE: 'confirm', Space: 'confirm', KeyH: 'hide', ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', KeyQ: 'zonePrev', BracketLeft: 'zonePrev', BracketRight: 'zoneNext' };
  const onKey = e => {
    if (e.metaKey || e.ctrlKey || /^F\d+$/.test(e.code)) return; // browser shortcuts stay the browser's
    e.preventDefault(); e.stopImmediatePropagation(); heldKeys.add(e.code); if (e.repeat) return;
    const c = e.code;
    if (mode === 'planet') { if (c === 'KeyA' || c === 'ArrowLeft') return act('prev'); if (c === 'KeyD' || c === 'ArrowRight') return act('next'); if (c === 'KeyW' || c === 'ArrowUp') return act('poiUp'); if (c === 'KeyS' || c === 'ArrowDown') return act('poiDown'); if (c === 'KeyF' || c === 'Space' || c === 'Enter') return; }
    else { if (c === 'KeyA') return act('left'); if (c === 'KeyD') return act('right'); if (c === 'KeyW') return act('up'); if (c === 'KeyS') return act('down'); if (/^Digit[1-4]$/.test(c)) return goZone(QUADRANT_ORDER[+c.slice(5) - 1]); if (c === 'Digit0') return goExpanse(); }
    if (KEYMAP[c]) act(KEYMAP[c]);
  };
  const onKeyUp = e => { e.stopImmediatePropagation(); heldKeys.delete(e.code); };
  const LISTEN = [['pointerdown', onDown], ['pointermove', onMove], ['pointerup', onUp], ['wheel', onWheel], ['keydown', onKey], ['keyup', onKeyUp]];
  let padStick = false;

  // ── projecting labels and markers ──
  const v3 = new THREE.Vector3(), camDir = new THREE.Vector3();
  function labelPos(id) { // screen centre of a body and its on-screen radius
    const b = bodies[id]; v3.copy(b.pos).project(camera); const d = camera.position.distanceTo(b.pos), px = b.r * Math.min(b.extent, 1.6) / (d * Math.tan(camera.fov * Math.PI / 360)) * innerHeight / 2;
    return { x: (v3.x + 1) / 2 * innerWidth, y: (1 - v3.y) / 2 * innerHeight, z: v3.z, r: px };
  }
  function poiWorld(id, p, out) { const m = model(id), anchor = m.anchors[p.id]; if (anchor) return anchor.getWorldPosition(out); return out.copy(dirOf(p.lon, p.lat)).applyQuaternion(m.spin.quaternion).multiplyScalar(m.r * 1.04).add(bodies[id].pos); }
  let poiEls = [];
  function syncPois() {
    const list = mode === 'planet' && focus && !fly ? poisOf(focus) : [];
    if (poiEls.length !== list.length) { poisEl.innerHTML = list.map((p, i) => `<button class="astro-poi" data-poi="${i}"><i></i><span>${esc(p.name)}</span></button>`).join(''); poiEls = [...poisEl.children]; }
    const c = bodies[focus]?.pos; let rx = -99, ry = -99;
    list.forEach((p, i) => { const el = poiEls[i], w = poiWorld(focus, p, v3), facing = model(focus).anchors[p.id] ? 1 : w.clone().sub(c).normalize().dot(camDir.copy(camera.position).sub(c).normalize()); const s = w.project(camera);
      const x = (s.x + 1) / 2 * innerWidth, y = (1 - s.y) / 2 * innerHeight; el.style.transform = `translate(${x}px,${y}px)`; el.classList.toggle('off', facing < 0.12); el.classList.toggle('on', i === poiSel); el.classList.toggle('got', log.poiKnown(focus, p.id)); if (i === poiSel) { rx = x; ry = y; } });
    reticle.style.transform = `translate(${rx}px,${ry}px)`; reticle.classList.toggle('on', poiSel != null && rx > 0); reticle.style.setProperty('--p', scan); reticle.lastChild.textContent = scan > 0.01 && scan < 1 ? 'ANALYSING' : '';
  }

  function frame(dt, pad, draw = true) {
    if (!active) return; time += dt;
    // pad: one edge-detected read of the action table
    if (pad) { for (const a of ['confirm', 'back', 'hide', 'zonePrev', 'zoneNext', 'prev', 'next', 'poiUp', 'poiDown']) if (pad.edge(PAD[a])) act(a);
      const mag = Math.hypot(pad.x, pad.z); if (mode !== 'planet') { if (mag > 0.6 && !padStick) { padStick = true; Math.abs(pad.x) > Math.abs(pad.z) ? nearest(Math.sign(pad.x), 0) : nearest(0, Math.sign(pad.z)); } else if (mag < 0.3) padStick = false; }
      else if (!fly) { const L = limits(focus), lx = pad.x + pad.lx, ly = pad.z + pad.ly; if (lx || ly) { P.yaw -= lx * dt * 1.8; P.pitch = clamp(P.pitch + ly * dt * 1.4, -1.3, 1.3); aim = false; } P.dist = clamp(P.dist * (1 + ((pad.btn(PAD.zoomOut) ? 1 : 0) - (pad.btn(PAD.zoomIn) ? 1 : 0)) * dt * 0.9), L.min, L.max); } }
    scanHeld = mode === 'planet' && !fly && poiSel != null && (heldKeys.has('KeyF') || heldKeys.has('Space') || heldKeys.has('Enter') || !!pad?.btn(PAD.scan));
    // camera
    if (fly) { fly.k = Math.min(1, fly.k + dt / fly.T); const e = ease(fly.k), F = fly.from, T = fly.to; P.t.lerpVectors(F.t, T.t, e); P.yaw = F.yaw + (T.yaw - F.yaw) * e; P.pitch = F.pitch + (T.pitch - F.pitch) * e; P.dist = F.dist + (T.dist - F.dist) * e + Math.sin(Math.PI * e) * fly.bump;
      if (fly.k >= 1) { fly = null; if (mode !== 'planet') setFull(null); } }
    if (mode === 'planet' && focus && !fly) {
      if (aim && poiSel != null) { const p = poisOf(focus)[poiSel], d = poiWorld(focus, p, v3).sub(bodies[focus].pos).normalize(); let dy = Math.atan2(d.x, d.z) - P.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); const k = Math.min(1, dt * 3); P.yaw += dy * k; P.pitch += (clamp(Math.asin(clamp(d.y, -1, 1)), -1.2, 1.2) - P.pitch) * k; }
      const known = poiSel != null && log.poiKnown(focus, poisOf(focus)[poiSel].id);
      if (scanHeld && !known) { scan = Math.min(1, scan + dt * tel().magnification / 2.6); if (scan >= 1) { const p = poisOf(focus)[poiSel]; log.discoverPoi(focus, p.id); scanDone = 1.6; flash(`OBSERVATION LOGGED · ${p.name.toUpperCase()}`); refresh(); } }
      else scan = known ? 1 : Math.max(0, scan - dt * 1.5);
    } else scan = 0;
    const steady = scan > 0 && scan < 1 ? (1 - scan) * 0.012 : 0; // the image settles as the instrument stabilizes
    const cp = Math.cos(P.pitch); camera.position.set(P.t.x + Math.sin(P.yaw) * cp * P.dist, P.t.y + Math.sin(P.pitch) * P.dist, P.t.z + Math.cos(P.yaw) * cp * P.dist);
    camera.lookAt(P.t.x + Math.sin(time * 31) * steady * P.dist, P.t.y + Math.cos(time * 27) * steady * P.dist, P.t.z);
    const fov = VIEW.fov - (scan > 0 && scan < 1 ? 13 * ease(scan) : 0) - scanDone * 3; if (Math.abs(camera.fov - fov) > 0.01) { camera.fov += (fov - camera.fov) * Math.min(1, dt * 6); camera.updateProjectionMatrix(); }
    scanDone = Math.max(0, scanDone - dt);
    key.intensity += ((mode === 'planet' && TARGET[focus]?.celestialType !== 'STAR' ? 1.25 : 0) - key.intensity) * Math.min(1, dt * 2); keyAim.position.copy(P.t);
    for (const b of Object.values(bodies)) { b.lite.animate(dt, time); b.full?.animate(dt, time); if (b.full) b.lite.spin.rotation.y = b.full.spin.rotation.y; }
    // markers
    const s = bodies[sel]; selRing.position.copy(s.pos); selRing.scale.setScalar(s.r * Math.min(s.extent, 1.9) * (2.9 + Math.sin(time * 3) * 0.08)); selRing.visible = mode !== 'planet'; selRing.material.rotation = time * 0.2;
    for (const b of Object.values(bodies)) if (b.here) b.here.visible = mode !== 'planet';
    system.userData.rocks.visible = mode !== 'planet' || !!fly;
    const alone = mode === 'planet' && focus && (!fly || fly.k > 0.82), fp = focus && bodies[focus].pos; // on arrival the neighbours drop away, so nothing drifts across the instrument
    for (const b of Object.values(bodies)) b.node.visible = !alone || b.t.id === focus || b.pos.distanceTo(fp) > 46;
    const dim = mode === 'planet' && focus !== 'aenor' ? 0.3 : 1; glowK += (dim - glowK) * Math.min(1, dt * 2); bodies.aenor.lite.setDim(glowK);
    const showLabels = mode !== 'planet' || !!fly;
    const taken = [];
    for (const t of TARGETS) { const el = labels[t.id], p = labelPos(t.id), on = showLabels && p.z < 1 && (mode !== 'zone' || fly || t.quadrant === zone || t.id === sel);
      const w = Math.max(...el.textContent.split('\n').map(s => s.length)) * 7.2 + 12, h = t.celestialType === 'ORDERED_WORLD' ? 16 : 30, clash = y => taken.some(q => Math.abs(q.x - p.x) < (q.w + w) / 2 && Math.abs(q.y - y) < (q.h + h) / 2);
      const up = p.y - p.r - h / 2 - 3, dn = p.y + p.r + h / 2 + 3; let y = t.celestialType === 'STAR' ? p.y + p.r * 0.75 + h : up; if (on && t.celestialType !== 'STAR' && clash(y)) y = [dn, up - h, dn + h].find(c => !clash(c)) ?? dn; // above the world, or the nearest free spot
      if (on) taken.push({ x: p.x, y, w, h }); el.style.transform = `translate(${p.x}px,${y}px)`; el.classList.toggle('off', !on); }
    for (const q of Object.values(QUADRANTS)) { const m = zoneMarks[q.key]; v3.copy(m.at).project(camera); m.el.style.transform = `translate(${(v3.x + 1) / 2 * innerWidth}px,${(1 - v3.y) / 2 * innerHeight}px)`; m.el.classList.toggle('off', !showLabels || v3.z > 1); m.wedge.material.opacity += ((mode === 'planet' ? 0 : zone === q.key ? 0.07 : 0.02) - m.wedge.material.opacity) * Math.min(1, dt * 3); }
    syncPois();
    if (closing > 0) { closing -= dt; if (closing <= 0) finishClose(); }
    if (draw) composer.render();
  }
  let flashT; function flash(text) { const el = $('#astro-flash'); el.textContent = text; el.classList.add('on'); clearTimeout(flashT); flashT = setTimeout(() => el.classList.remove('on'), 2200); }
  const shutter = on => shutterEl.classList.toggle('on', on);
  function open() {
    if (active) return; active = true; closing = 0; mode = 'expanse'; zone = null; focus = null; poiSel = null; drawer = null; uiHidden = false; sel = TARGETS.find(t => t.currentWorld)?.id || sel; fly = null; heldKeys.clear();
    Object.assign(P, poseExpanse(), { dist: VIEW.expanse.dist * 1.9 }); flyTo(poseExpanse(), 2.2); // the Expanse comes into focus
    resize(); root.classList.add('on'); host.classList.add('astro-open');
    for (const [ev, fn] of LISTEN) addEventListener(ev, fn, { capture: true, passive: false });
    refresh(); requestAnimationFrame(() => shutter(false));
  }
  function close() { if (!active || closing > 0) return; closing = 0.5; shutter(true); }
  function finishClose() {
    active = false; setFull(null); host.style.cursor = '';
    for (const [ev, fn] of LISTEN) removeEventListener(ev, fn, { capture: true });
    root.classList.remove('on'); host.classList.remove('astro-open'); onExit();
  }
  function resize() { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); composer.setSize(innerWidth, innerHeight); }
  addEventListener('resize', () => { if (active) resize(); });
  return { open, close, frame, shutter, inspect, goZone, goExpanse, back, selectPoi, get active() { return active; }, get mode() { return mode; }, get focus() { return focus; }, get selected() { return sel; }, get flying() { return !!fly; }, get scan() { return scan; }, bodies, scene, camera };
}
