import * as THREE from 'three';

// Small, local physics pass for finish fragments. Fragments are cut from the
// currently posed skinned mesh so they inherit the struck character's colors.
export function createDismemberment(scene, world) {
  const live = new Set();
  const clean = list => { for (const f of list || []) { scene.remove(f.mesh); f.mesh.geometry?.dispose(); live.delete(f); } };
  function restore(actor) {
    for (const [mesh, original] of actor?.dismemberGeometries || []) {
      if (mesh.geometry !== original) mesh.geometry.dispose();
      mesh.geometry = original;
    }
    actor?.dismemberGeometries?.clear();
    for (const [object, visible] of actor?.dismemberVisibility || []) object.visible = visible;
    actor?.dismemberVisibility?.clear();
  }
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
    const skellorHead = actor.obliterationHead?.kind === 'skellor' && wanted.has('Head');
    actor.model.traverse(o => { if (o.isSkinnedMesh) meshes.push(o); });
    const made = [];
    for (const source of meshes) {
      const original = source.geometry, pos = original.attributes.position, si = original.attributes.skinIndex, sw = original.attributes.skinWeight;
      if (!pos || !si || !sw) continue;
      // Keep unindexed rigs supported by giving their vertices a sequential index.
      const g = original.index ? original : original.clone().setIndex(Array.from({ length: pos.count }, (_, i) => i));
      const index = g.index, count = index.count, uv = original.attributes.uv;
      const sourceBoneNames = source.skeleton.bones.map(b => strip(b.name));
      const affected = vi => { let sum = 0; for (let k = 0; k < 4; k++) if (wanted.has(sourceBoneNames[si.getComponent(vi, k)])) sum += sw.getComponent(vi, k); return sum; };
      const v = new THREE.Vector3();
      const materialGroups = g.groups.length ? g.groups : [{ start: 0, count, materialIndex: 0 }];
      const kept = [], nextGroups = [], fragmentsByMaterial = new Map();
      let removedTriangles = 0;
      for (const group of materialGroups) {
        const groupStart = kept.length, end = Math.min(count, group.start + group.count), materialIndex = group.materialIndex || 0;
        let bucket = fragmentsByMaterial.get(materialIndex);
        for (let i = group.start; i + 2 < end; i += 3) {
          const ids = [index.getX(i), index.getX(i + 1), index.getX(i + 2)];
          // Blend weights matter more than a single dominant vertex: this also
          // works on the stylized Seer/Mori meshes, whose cuts straddle joints.
          const cut = affected(ids[0]) + affected(ids[1]) + affected(ids[2]) >= 0.82;
          if (!cut) { kept.push(...ids); continue; }
          removedTriangles++;
          // Skellor's shared base rig has Mori face geometry. Remove that head
          // from the body, but use its own authored ivory skull as the fragment.
          if (skellorHead) continue;
          if (!bucket) { bucket = { positions: [], uvs: [] }; fragmentsByMaterial.set(materialIndex, bucket); }
          for (const id of ids) {
            source.getVertexPosition(id, v); v.applyMatrix4(source.matrixWorld); bucket.positions.push(v.x, v.y, v.z);
            if (uv) bucket.uvs.push(uv.getX(id), uv.getY(id));
          }
        }
        if (kept.length > groupStart) nextGroups.push({ start: groupStart, count: kept.length - groupStart, materialIndex });
      }
      if (!removedTriangles) { if (!original.index) g.dispose(); continue; }
      for (const [materialIndex, bucket] of fragmentsByMaterial) {
        if (bucket.positions.length < 9) continue;
        const geom = new THREE.BufferGeometry(); geom.setAttribute('position', new THREE.Float32BufferAttribute(bucket.positions, 3));
        if (bucket.uvs.length) geom.setAttribute('uv', new THREE.Float32BufferAttribute(bucket.uvs, 2));
        geom.computeVertexNormals();
        const center = new THREE.Vector3(); for (let i = 0; i < bucket.positions.length; i += 3) center.add(new THREE.Vector3(bucket.positions[i], bucket.positions[i + 1], bucket.positions[i + 2])); center.multiplyScalar(3 / bucket.positions.length);
        geom.translate(-center.x, -center.y, -center.z);
        const material = Array.isArray(source.material) ? source.material[materialIndex] : source.material;
        const mesh = new THREE.Mesh(geom, material); mesh.position.copy(center); mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh);
        const head = wanted.has('Head') || wanted.has('Neck'), torso = wanted.has('Hips') || wanted.has('Spine');
        const lateral = direction.clone().setY(0).normalize(); if (lateral.lengthSq() < 1e-6) lateral.set(0, 0, 1);
        const f = { mesh, kind: head ? 'head' : torso ? 'torso' : 'limb', vel: lateral.multiplyScalar(head ? 1.1 : torso ? 0.25 : 0.55).add(new THREE.Vector3(0, head ? 2.3 : torso ? 0.15 : 0.65, 0)), spin: new THREE.Vector3(head ? 5 : 2.2, head ? 7 : 1.4, head ? 3.5 : 2.4), bounce: 0, age: 0 };
        made.push(f); live.add(f);
      }
      const replacement = g.clone(); replacement.setIndex(kept); replacement.clearGroups();
      for (const group of nextGroups) replacement.addGroup(group.start, group.count, group.materialIndex);
      if (!actor.dismemberGeometries) actor.dismemberGeometries = new Map();
      if (!actor.dismemberGeometries.has(source)) actor.dismemberGeometries.set(source, original);
      if (source.geometry !== original) source.geometry.dispose();
      source.geometry = replacement;
      if (!original.index) g.dispose();
    }
    if (skellorHead) {
      const source = actor.obliterationHead.object;
      if (source?.visible) {
        source.updateWorldMatrix(true, true);
        const fragment = source.clone(true);
        source.matrixWorld.decompose(fragment.position, fragment.quaternion, fragment.scale);
        fragment.name = 'Skellor_Obliteration_Skull_Fragment'; fragment.visible = true;
        fragment.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
        scene.add(fragment);
        actor.dismemberVisibility ||= new Map();
        if (!actor.dismemberVisibility.has(source)) actor.dismemberVisibility.set(source, source.visible);
        source.visible = false;
        const lateral = direction.clone().setY(0).normalize(); if (lateral.lengthSq() < 1e-6) lateral.set(0, 0, 1);
        const f = { mesh: fragment, kind: 'head', vel: lateral.multiplyScalar(1.1).add(new THREE.Vector3(0, 2.3, 0)), spin: new THREE.Vector3(5, 7, 3.5), bounce: 0, age: 0 };
        made.push(f); live.add(f);
      }
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
  return { split, update, clean, restore, sink };
}
