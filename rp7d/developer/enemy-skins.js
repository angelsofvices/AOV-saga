// Distinct low-poly surfaces and rig-following details for the corrupted humanoids.
// Both characters keep Mori's skeleton and clips; only their visible form changes.
import * as THREE from 'three';

const material = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.76, ...extra });
const add = (parent, geo, mat, p, scale = [1,1,1]) => {
  const mesh = new THREE.Mesh(geo, mat); mesh.position.set(...p); mesh.scale.set(...scale);
  mesh.castShadow = true; parent.add(mesh); return mesh;
};

export function dressCorrupted(actor, kind) {
  if (kind !== 'crept' && kind !== 'skellor') return;
  const crept = kind === 'crept';
  const colors = crept ? {
    M_skin:'#a4a77c', M_shade:'#4f6230', M_cloth:'#373035', M_rag:'#594638', M_socket:'#202b17',
    M_eye:'#78ff31', M_mouth:'#1e2117', M_wound:'#743592', M_nail:'#c8bd82'
  } : {
    M_skin:'#e1d2af', M_shade:'#ac9878', M_cloth:'#323034', M_rag:'#62422c', M_socket:'#100d0d',
    M_eye:'#120d10', M_mouth:'#1a1111', M_wound:'#564132', M_nail:'#ebe0c1'
  };
  actor.model.traverse(o => {
    if (!o.isMesh || !o.material) return;
    const recolor = m => { const q = m.clone(); if (colors[q.name]) q.color.set(colors[q.name]); return q; };
    o.material = Array.isArray(o.material) ? o.material.map(recolor) : recolor(o.material);
  });
  const head = actor.model.getObjectByName('mixamorigHead');
  const torso = actor.model.getObjectByName('mixamorigSpine2');
  const leftArm = actor.model.getObjectByName('mixamorigLeftArm');
  const rightArm = actor.model.getObjectByName('mixamorigRightArm');
  if (!head || !torso) return;
  const bone = material(crept ? '#b9b188' : '#e9d9ba');
  const shade = material(crept ? '#56672d' : '#a99373');
  const dark = material('#1a1415');
  const glow = material('#82fa37', { emissive:'#55d920', emissiveIntensity:1.3, roughness:0.22 });
  if (crept) {
    // Cracked mossy skull, strong green eyes, vine crown and purple mushroom caps.
    add(head,new THREE.IcosahedronGeometry(0.165,0),bone,[0,0.09,0.025],[1.08,1.04,0.96]);
    add(head,new THREE.BoxGeometry(0.12,0.105,0.075),dark,[0,-0.035,0.115]);
    for (const s of [-1,1]) {
      add(head,new THREE.IcosahedronGeometry(0.061,0),shade,[s*0.08,0.13,0.13]);
      add(head,new THREE.SphereGeometry(0.046,7,5),dark,[s*0.074,0.073,0.173]);
      add(head,new THREE.SphereGeometry(0.029,7,5),glow,[s*0.074,0.073,0.206]);
      for (let i = 0; i < 3; i++) { const thorn = add(head,new THREE.ConeGeometry(0.027,0.11,4),shade,[s*(0.11+i*0.03),0.21-i*0.04,-0.01]); thorn.rotation.z = -s*0.5; }
    }
    const leaf = material('#6b8c32'), cap = material('#a64ad3',{emissive:'#50167d',emissiveIntensity:0.35});
    for (const [parent,x,y,z] of [[head,-0.15,0.17,-0.08],[torso,0.17,0.06,-0.11],[leftArm,0.1,0.05,0],[rightArm,-0.09,0.01,0]]) {
      add(parent,new THREE.CylinderGeometry(0.018,0.022,0.12,5),bone,[x,y,z]);
      add(parent,new THREE.ConeGeometry(0.085,0.07,6),cap,[x,y+0.09,z]);
    }
    for (const s of [-1,1]) {
      for (let i = 0; i < 3; i++) { const v = add(torso,new THREE.ConeGeometry(0.042,0.16,4),leaf,[s*(0.12+i*0.04),0.06-i*0.07,0.11]); v.rotation.z = s*0.72; }
    }
  } else {
    // Full ivory skull with open sockets, teeth, prominent ribs and a travel pack.
    add(head,new THREE.IcosahedronGeometry(0.17,1),bone,[0,0.085,0.03],[1,1.1,0.92]);
    add(head,new THREE.BoxGeometry(0.12,0.085,0.085),bone,[0,-0.052,0.13]);
    for (const s of [-1,1]) {
      add(head,new THREE.SphereGeometry(0.063,7,5),dark,[s*0.077,0.07,0.17],[1,1.12,0.34]);
      for (let i = 0; i < 3; i++) add(head,new THREE.BoxGeometry(0.022,0.033,0.018),shade,[s*(0.015+i*0.031),-0.086,0.18]);
    }
    add(head,new THREE.ConeGeometry(0.032,0.07,4),dark,[0,0.0,0.19]).rotation.x = Math.PI;
    for (let i = 0; i < 4; i++) for (const s of [-1,1]) {
      const rib = add(torso,new THREE.CapsuleGeometry(0.017,0.13,2,5),bone,[s*0.12,0.02-i*0.055,0.16]); rib.rotation.z = s*(0.5+i*0.08);
    }
    const leather = material('#634329');
    add(torso,new THREE.BoxGeometry(0.38,0.42,0.2),leather,[0,0.02,-0.23]);
    for (const s of [-1,1]) add(torso,new THREE.BoxGeometry(0.065,0.39,0.05),shade,[s*0.17,0.02,0.07]);
    add(torso,new THREE.BoxGeometry(0.19,0.12,0.035),shade,[0,0.0,-0.34]);
  }
}
