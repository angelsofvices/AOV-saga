// Daemon anatomy follows the Mori Mixamo bones: the added plates, claws and
// fissures move with the same joints as the combat hit rig.
import * as THREE from 'three';

const mats = {
  black: {
    hide: new THREE.MeshStandardMaterial({ color: '#25272d', metalness: 0.42, roughness: 0.52, flatShading: true }),
    shade: new THREE.MeshStandardMaterial({ color: '#101015', metalness: 0.25, roughness: 0.75, flatShading: true }),
    vein: new THREE.MeshStandardMaterial({ color: '#8b1720', emissive: '#e31325', emissiveIntensity: 1.15, roughness: 0.35 }),
    eye: new THREE.MeshStandardMaterial({ color: '#ff3036', emissive: '#ff111c', emissiveIntensity: 2.8, roughness: 0.18 }),
    bone: new THREE.MeshStandardMaterial({ color: '#d8c8ab', roughness: 0.72 })
  },
  red: {
    hide: new THREE.MeshStandardMaterial({ color: '#52151d', metalness: 0.3, roughness: 0.54, flatShading: true }),
    shade: new THREE.MeshStandardMaterial({ color: '#210d14', metalness: 0.22, roughness: 0.7, flatShading: true }),
    vein: new THREE.MeshStandardMaterial({ color: '#c8252a', emissive: '#ff2934', emissiveIntensity: 2.2, roughness: 0.3 }),
    eye: new THREE.MeshStandardMaterial({ color: '#ff8e32', emissive: '#ff3610', emissiveIntensity: 3.1, roughness: 0.18 }),
    bone: new THREE.MeshStandardMaterial({ color: '#ead6ae', roughness: 0.72 })
  }
};
const add = (parent, geometry, material, x, y, z, sx = 1, sy = 1, sz = 1) => {
  if (!parent) return null;
  const o = new THREE.Mesh(geometry, material); o.position.set(x, y, z); o.scale.set(sx, sy, sz);
  o.castShadow = true; parent.add(o); return o;
};
const rod = (parent, material, a, b, radius = 0.012) => {
  const v = new THREE.Vector3(...b).sub(new THREE.Vector3(...a)), mid = new THREE.Vector3(...a).add(new THREE.Vector3(...b)).multiplyScalar(0.5);
  const o = add(parent, new THREE.CylinderGeometry(radius * 0.55, radius, v.length(), 5), material, mid.x, mid.y, mid.z);
  o?.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.normalize()); return o;
};
const bone = (model, name) => model.getObjectByName(`mixamorig${name}`) || model.getObjectByName(`mixamorig:${name}`);

export function dressDaemon(actor, variant) {
  const M = mats[variant]; if (!M) return;
  // Reuse the skinned body and its authored animation, replacing every visible
  // surface with a restrained Daemon palette before adding rigged anatomy.
  actor.model.traverse(o => {
    if (!o.isMesh || !o.material) return;
    const colorize = original => {
      const m = original.clone(), label = (m.name || '').toLowerCase();
      m.color?.copy(/cloth|rag|mouth|socket/.test(label) ? M.shade.color : /nail|teeth/.test(label) ? M.bone.color : M.hide.color);
      if (/wound|eye/.test(label)) { m.color?.copy(M.vein.color); m.emissive?.copy(M.vein.emissive); m.emissiveIntensity = M.vein.emissiveIntensity; }
      m.roughness = /cloth|rag/.test(label) ? 0.74 : 0.52; m.metalness = /cloth|rag/.test(label) ? 0.1 : 0.35;
      return m;
    };
    o.material = Array.isArray(o.material) ? o.material.map(colorize) : colorize(o.material);
  });
  const head = bone(actor.model, 'Head'), torso = bone(actor.model, 'Spine2');
  if (!head || !torso) return;
  const lArm = bone(actor.model, 'LeftArm'), rArm = bone(actor.model, 'RightArm');
  const lHand = bone(actor.model, 'LeftHand'), rHand = bone(actor.model, 'RightHand');
  const lLeg = bone(actor.model, 'LeftUpLeg'), rLeg = bone(actor.model, 'RightUpLeg');
  const plate = new THREE.IcosahedronGeometry(0.15, 1);
  add(head, plate, M.hide, 0, 0.09, 0.035, 1.05, 1.12, 1.02);
  add(head, new THREE.BoxGeometry(0.14, 0.1, 0.095), M.shade, 0, -0.065, 0.145);
  // Bright eyes sit inside deep sockets; teeth stay pale enough to read at night.
  for (const side of [-1, 1]) {
    add(head, new THREE.SphereGeometry(0.062, 8, 6), M.shade, side * 0.079, 0.068, 0.168, 1, 0.92, 0.42);
    add(head, new THREE.SphereGeometry(0.029, 8, 6), M.eye, side * 0.079, 0.07, 0.195);
    for (let i = 0; i < 3; i++) add(head, new THREE.ConeGeometry(0.013, 0.065, 5), M.bone, side * (0.022 + i * 0.026), -0.095, 0.198).rotation.z = Math.PI;
    add(torso, plate, M.hide, side * 0.16, 0.07, 0.12, 0.95, 1.05, 0.52);
    for (let i = 0; i < 3; i++) rod(torso, M.vein, [side * (0.06 + i * 0.024), 0.14 - i * 0.07, 0.203], [side * (0.17 + i * 0.017), 0.075 - i * 0.06, 0.173], 0.009);
  }
  for (const arm of [lArm, rArm]) {
    add(arm, plate, M.hide, 0, -0.075, 0.015, 0.9, 1.35, 0.9);
    rod(arm, M.vein, [-0.06, 0.02, 0.105], [0.04, -0.22, 0.1], 0.011);
  }
  for (const hand of [lHand, rHand]) for (let i = 0; i < 4; i++) {
    const claw = add(hand, new THREE.ConeGeometry(0.019, 0.16 + i * 0.012, 6), M.shade, (i - 1.5) * 0.052, -0.115, 0.095);
    if (claw) claw.rotation.x = -0.28;
  }
  for (const leg of [lLeg, rLeg]) {
    add(leg, plate, M.hide, 0, -0.16, 0.035, 1, 1.5, 0.85);
    rod(leg, M.vein, [-0.045, -0.03, 0.135], [0.055, -0.28, 0.115], 0.01);
  }
  // Exposed ridge down the back is the silhouette from the reference sheet.
  for (let i = 0; i < 4; i++) {
    const spike = add(torso, new THREE.ConeGeometry(0.044, 0.115, 5), M.shade, 0, 0.19 - i * 0.105, -0.18);
    if (spike) spike.rotation.x = -Math.PI / 2;
  }
}
