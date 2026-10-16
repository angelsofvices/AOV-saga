import * as THREE from 'three';

// Small, local physics pass for finish fragments. Fragments are cut from the
// currently posed skinned mesh so they inherit the struck character's colors.
export function createDismemberment(scene, world) {
  const live = new Set();
  const clean = list => { for (const f of list || []) { scene.remove(f.mesh); f.mesh.geometry.dispose(); live.delete(f); } };
  const strip = n => n.replace(/^mixamorig[:_]?/, '');
  function split(actor, part, direction = new THREE.Vector3(0, 0, 1), extra = false) {
    if (!actor?.model) return [];
    actor.model.updateMatrixWorld(true);
    const p = strip(part || '');
    let boneNames;
    if (/Head|Neck/.test(p)) boneNames = ['Head', 'Neck'];
    else if (/Arm|Hand|ForeArm/.test(p)) {
      const side = p.startsWith('Left') ? 'Left' : 'Right';
      boneNames = [p.includes('Hand') ? `${side}Hand` : p.includes('ForeArm') ? `${side}ForeArm` : `${side}Arm`];
    } else if (/Leg|Foot|UpLeg/.test(p)) {
      const side = p.startsWith('Left') ? 'Left' : 'Right';
      boneNames = [p.includes('Foot') ? `${side}Foot` : p.includes('UpLeg') ? `${side}UpLeg` : `${side}Leg`];
    } else boneNames = ['Spine', 'Hips'];
    if (extra && !/Head|Neck/.test(p)) boneNames.push('Head');
    const wanted = new Set(boneNames), meshes = [];
    actor.model.traverse(o => { if (o.isSkinnedMesh) meshes.push(o); });
    const made = [];
    for (const source of meshes) {
      const g = source.geometry, pos = g.attributes.position, si = g.attributes.skinIndex, sw = g.attributes.skinWeight;
      if (!pos || !si || !sw) continue;
      const index = g.index, count = index ? index.count : pos.count, out = [], uvOut = [], uv = g.attributes.uv;
      const sourceBoneNames = source.skeleton.bones.map(b => strip(b.name));
      const dominant = vi => { let bi = -1, bw = 0; for (let k = 0; k < 4; k++) { const w = sw.getComponent(vi, k); if (w > bw) { bw = w; bi = si.getComponent(vi, k); } } return sourceBoneNames[bi]; };
      const v = new THREE.Vector3();
      for (let i = 0; i + 2 < count; i += 3) {
        const ids = [0, 1, 2].map(j => index ? index.getX(i + j) : i + j);
        const matches = ids.filter(id => wanted.has(dominant(id))).length;
        if (matches < 2) continue;
        for (const id of ids) {
          source.getVertexPosition(id, v); v.applyMatrix4(source.matrixWorld); out.push(v.x, v.y, v.z);
          if (uv) uvOut.push(uv.getX(id), uv.getY(id));
        }
      }
      if (out.length < 9) continue;
      const geom = new THREE.BufferGeometry(); geom.setAttribute('position', new THREE.Float32BufferAttribute(out, 3));
      if (uvOut.length) geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvOut, 2));
      geom.computeVertexNormals();
      const center = new THREE.Vector3(); for (let i = 0; i < out.length; i += 3) center.add(new THREE.Vector3(out[i], out[i + 1], out[i + 2])); center.multiplyScalar(3 / out.length);
      geom.translate(-center.x, -center.y, -center.z);
      const material = Array.isArray(source.material) ? source.material[0] : source.material;
      const mesh = new THREE.Mesh(geom, material); mesh.position.copy(center); mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh);
      const head = wanted.has('Head') || wanted.has('Neck'), torso = wanted.has('Hips') || wanted.has('Spine');
      const lateral = direction.clone().setY(0).normalize(); if (lateral.lengthSq() < 1e-6) lateral.set(0, 0, 1);
      const f = { mesh, kind: head ? 'head' : torso ? 'torso' : 'limb', vel: lateral.multiplyScalar(head ? 1.1 : torso ? 0.25 : 0.55).add(new THREE.Vector3(0, head ? 2.3 : torso ? 0.15 : 0.65, 0)), spin: new THREE.Vector3(head ? 5 : 2.2, head ? 7 : 1.4, head ? 3.5 : 2.4), bounce: 0, age: 0 };
      made.push(f); live.add(f);
    }
    // Collapse the source joint to leave a visible separation at the hit.
    for (const name of boneNames) {
      if (name === 'Hips') continue; // preserve the pelvis and lower-body hierarchy on a waist/torso finish
      const bone = actor.model.getObjectByName(`mixamorig${name}`) || actor.model.getObjectByName(name);
      if (bone) { (actor.dismemberScales ||= new Map()).set(bone, bone.scale.clone()); bone.scale.multiplyScalar(0.001); }
    }
    return made;
  }
  function update(dt, getGround = (x, z, y) => world.groundAt(x, z, y)) {
    for (const f of [...live]) {
      const m = f.mesh; f.age += dt; f.vel.y -= 9.8 * dt; m.position.addScaledVector(f.vel, dt);
      m.rotation.x += f.spin.x * dt; m.rotation.y += f.spin.y * dt; m.rotation.z += f.spin.z * dt;
      const floor = getGround(m.position.x, m.position.z, m.position.y + 1);
      if (m.position.y < floor + 0.04) {
        m.position.y = floor + 0.04;
        if (f.kind === 'head' && f.bounce < 2) { f.vel.y = Math.abs(f.vel.y) * 0.42; f.vel.x *= 0.72; f.vel.z *= 0.72; f.bounce++; }
        else { f.vel.y = 0; f.vel.x *= f.kind === 'torso' ? 0.48 : 0.78; f.vel.z *= f.kind === 'torso' ? 0.48 : 0.78; f.spin.multiplyScalar(f.kind === 'torso' ? 0.72 : 0.93); }
      }
    }
  }
  function sink(list, amount) { for (const f of list || []) f.mesh.position.y -= amount; }
  return { split, update, clean, sink };
}
