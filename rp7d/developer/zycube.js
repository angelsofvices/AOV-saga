// The Zycube: Rizer's internal inventory (items, coins, gems). When he's knocked out it drops where he fell,
// a floating holographic cube, and everything in it stays with it until he walks back and takes it (○ / E).
// Astralvision (AV) always finds it: every pulse marks it on screen and on the minimap, however far away.
// Its state is saved with the inventory (inventory.zycube = { x, y, z, items, coins, gems }).
import * as THREE from 'three';

// The cube's face: glowing ice-blue glass with a white circuit sigil (after the reference art).
function faceTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  const grad = g.createRadialGradient(128, 128, 20, 128, 128, 180); grad.addColorStop(0, '#9fe6ff'); grad.addColorStop(0.6, '#3fb4ec'); grad.addColorStop(1, '#1b7fc4');
  g.fillStyle = grad; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = '#f2fdff'; g.lineWidth = 5; g.lineCap = 'square';
  const diamond = (r) => { g.beginPath(); g.moveTo(128, 128 - r); g.lineTo(128 + r, 128); g.lineTo(128, 128 + r); g.lineTo(128 - r, 128); g.closePath(); g.stroke(); };
  diamond(78); diamond(40);
  g.beginPath(); g.moveTo(128, 50); g.lineTo(128, 20); g.moveTo(128, 206); g.lineTo(128, 236); g.moveTo(50, 128); g.lineTo(20, 128); g.moveTo(206, 128); g.lineTo(236, 128); g.stroke();
  g.fillStyle = '#f2fdff';
  for (const [x, y] of [[128, 128], [60, 60], [196, 60], [60, 196], [196, 196]]) g.fillRect(x - 7, y - 7, 14, 14);
  g.fillStyle = '#bff2ff'; g.beginPath(); g.moveTo(128, 104); g.lineTo(152, 128); g.lineTo(128, 152); g.lineTo(104, 128); g.closePath(); g.fill();
  g.strokeStyle = '#e6fbff'; g.lineWidth = 14; g.strokeRect(0, 0, 256, 256); // bright bevelled rim
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function createZycube(scene, world, fx) {
  const root = new THREE.Group(); root.name = 'zycube'; root.visible = false; scene.add(root);
  const spin = new THREE.Group(); root.add(spin);
  const S = 0.62, tex = faceTexture();
  const shell = new THREE.Mesh(new THREE.BoxGeometry(S, S, S), new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(0.85, 0.95, 1.05), transparent: true, opacity: 0.9, depthWrite: false }));
  const core = new THREE.Mesh(new THREE.BoxGeometry(S * 0.55, S * 0.55, S * 0.55), new THREE.MeshBasicMaterial({ color: new THREE.Color('#9fe6ff').multiplyScalar(1.3), transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(S * 1.02, S * 1.02, S * 1.02)), new THREE.LineBasicMaterial({ color: new THREE.Color('#e8fcff').multiplyScalar(1.5) }));
  spin.add(core, shell, edges);
  spin.rotation.set(Math.atan(1 / Math.SQRT2), 0, Math.PI / 4); // stood on a corner, like the reference
  // a faint beam of light straight up, so it can be spotted from across a field
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.1, 9, 10, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color('#6fd0ff').multiplyScalar(1.2), transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  beam.position.y = 1.6 + 4.5; root.add(beam); // rises from just above the cube
  const halo = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.6, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color('#6fd0ff').multiplyScalar(1.6), transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  halo.rotation.x = -Math.PI / 2; root.add(halo);

  let state = null, base = 0; // state: { x, y, z, items, coins, gems }
  function show(s) {
    state = s; if (!s) { root.visible = false; return; }
    base = world.groundAt(s.x, s.z, s.y + 1);
    root.position.set(s.x, base, s.z); root.visible = true; halo.position.y = 0.04;
  }
  return {
    root, get dropped() { return !!state; }, get state() { return state; },
    pos: () => new THREE.Vector3(root.position.x, root.position.y + 1.05, root.position.z),
    show,
    update(dt, t) {
      if (!state || !root.visible) return;
      spin.position.y = 1.05 + Math.sin(t * 1.6) * 0.09; spin.rotation.y = t * 0.6;
      core.material.opacity = 0.3 + Math.sin(t * 3.1) * 0.1; halo.material.opacity = 0.3 + Math.sin(t * 1.6 + 1) * 0.15; halo.scale.setScalar(1 + Math.sin(t * 1.6) * 0.08);
      if (Math.random() < dt * 5) fx?.emit(root.position.x + (Math.random() - 0.5) * 0.6, root.position.y + 0.9 + Math.random() * 0.4, root.position.z + (Math.random() - 0.5) * 0.6, 1, { color: '#bff2ff', speed: 0.4, up: 0.8, size: 0.14, life: 0.7, g: -0.4 });
    }
  };
}
