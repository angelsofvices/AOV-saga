// Wild Zyrex roster on the shared wild-behaviour base:
// every wild moves, home habitat is permanent (a square patch), it freezes
// and watches when Rizer comes near, bolts if rushed, then walks home.
import * as THREE from 'three';
import { rng, damp, dampAngle, clamp } from './util.js';
import { resolveZyrexMorphology } from './morphology.js';

const PALETTES = {
  ember: ['#a65348', '#c36f53', '#683f3c', '#dac28b'],
  moss: ['#5f7d4a', '#7f9b5c', '#3e5236', '#cfd6a0'],
  dune: ['#b08a5a', '#c9a574', '#6e5436', '#efe0b8'],
  // Elzebub: the first official wild Zyrex — a blue dragon body with golden spikes.
  elzebub: ['#3a5eff', '#2d47c9', '#1a2456', '#e8c04a']
};
// Each roster species has its own palette and silhouette treatment. These are
// intentionally simple native meshes; Elzebub below gets a dedicated full build.
const SPECIES = {
  aetherwing: { c:['#105386','#168eb8','#2b2457','#b96de9'], body:[0.83,0.68,1.08], head:[0.86,0.8,0.9], detail:'insect' },
  frosane: { c:['#89d6e6','#c8f4f4','#578db2','#eefaff'], body:[1.0,0.85,1.2], head:[0.9,1.0,0.95], detail:'ice' },
  verdanix: { c:['#578d4b','#91c567','#35552e','#d4ed69'], body:[0.9,0.88,1.2], head:[0.9,0.95,1.0], detail:'leaf' },
  otterlin: { c:['#263e67','#344f79','#192d4c','#e2d4b7'], body:[0.75,0.7,1.55], head:[0.85,0.88,0.9], detail:'otter' },
  volcanut: { c:['#503c37','#ac4b20','#30282b','#ff9c21'], body:[1.25,0.95,1.4], head:[0.85,0.85,0.95], detail:'lava' },
  zarakai: { c:['#aa815b','#c1a56a','#614932','#eed183'], body:[0.95,0.78,1.25], head:[1.05,0.9,0.9], detail:'crest' },
  voltigrax: { c:['#252e54','#5065aa','#1d2440','#f4d041'], body:[1.13,0.77,1.3], head:[0.9,0.84,0.9], detail:'lightning' },
  apexaur: { c:['#526f55','#779471','#394c44','#c5da8c'], body:[1.27,0.95,1.55], head:[1.08,0.86,1.2], detail:'saur' },
  snok: { c:['#aacde1','#e1eef5','#5d8caa','#d3fbff'], body:[0.65,0.65,1.8], head:[0.95,0.72,1.15], detail:'serpent' },
  skybeam: { c:['#72cfea','#c0f2f2','#468cb6','#ffda72'], body:[0.78,0.66,1.05], head:[0.85,0.85,0.9], detail:'bird' },
  mutamech: { c:['#586e50','#677f5c','#363d40','#e24451'], body:[0.95,0.98,0.98], head:[0.72,0.72,0.8], detail:'machine' },
  phrenetic: { c:['#544079','#997dc2','#33274a','#f2b5ff'], body:[0.86,0.8,1.0], head:[1.18,1.12,1.0], detail:'psychic' },
  zorbil: { c:['#81729c','#c68dc9','#53436c','#f4c961'], body:[1.38,1.2,0.95], head:[0.65,0.65,0.7], detail:'orb' },
  voltaryn: { c:['#2a5384','#4e93ce','#1c315c','#f3dc38'], body:[0.85,0.78,1.34], head:[0.9,0.82,0.9], detail:'spines' },
  elzoran: { c:['#2e579c','#667cc5','#30295f','#b9a4eb'], body:[1.03,0.83,1.38], head:[0.95,0.9,1.05], detail:'dragon' }
};

// Canonical species identity lives separately from the shared movement rig.
// These locks describe silhouette-critical anatomy; variation is deliberately small.
const SPECIES_MORPHOLOGY = Object.freeze({
  aetherwing:{family:'wingedBeast',canonical:{wingType:'four_energy_membranes',headShape:'needle_crest'},variation:{scale:[.96,1.04],muscle:[.94,1.05]}},
  frosane:{family:'heavyQuadruped',canonical:{dorsalCrystals:true,headShape:'ice_wedge'},variation:{scale:[.94,1.07],muscle:[.92,1.10]}},
  verdanix:{family:'grazerQuadruped',canonical:{leafWings:true,crownCount:3},variation:{scale:[.95,1.06],muscle:[.94,1.06]}},
  otterlin:{family:'lowCrawler',canonical:{tailType:'broad_paddle',bellyPlate:true},variation:{scale:[.94,1.05],muscle:[.92,1.08]}},
  volcanut:{family:'heavyQuadruped',posture:'brute',canonical:{magmaArmor:true,dorsalNodes:9},variation:{scale:[.97,1.08],muscle:[1,1.12]}},
  zarakai:{family:'predatorQuadruped',canonical:{crestCount:3,headShape:'broad_wedge'},variation:{scale:[.95,1.06],muscle:[.95,1.08]}},
  voltigrax:{family:'predatorQuadruped',canonical:{dorsalType:'lightning_blades'},variation:{scale:[.96,1.05],muscle:[.96,1.08]}},
  apexaur:{family:'heavyQuadruped',canonical:{saurCrest:true,shoulderHorns:true},variation:{scale:[.98,1.08],muscle:[1,1.12]}},
  snok:{family:'serpentine',canonical:{tailType:'extended_serpent',headShape:'narrow'},variation:{scale:[.94,1.07],muscle:[.92,1.05]}},
  skybeam:{family:'avian',canonical:{beak:true,wingType:'luminous'},variation:{scale:[.95,1.05],muscle:[.94,1.04]}},
  mutamech:{family:'construct',canonical:{torsoType:'hard_cube',tailType:'none'},variation:{scale:[.98,1.03],muscle:[1,1]}},
  phrenetic:{family:'construct',posture:'alien',canonical:{floatingOcularRing:true},variation:{scale:[.96,1.04],muscle:[.96,1.04]}},
  zorbil:{family:'construct',posture:'alien',canonical:{orbTorso:true,tailType:'none'},variation:{scale:[.97,1.05],muscle:[.98,1.04]}},
  voltaryn:{family:'predatorQuadruped',canonical:{dorsalSpines:8},variation:{scale:[.95,1.06],muscle:[.95,1.09]}},
  elzoran:{family:'wingedBeast',canonical:{wingType:'dragon',dorsalSpines:5},variation:{scale:[.97,1.05],muscle:[.97,1.07]}},
  elzebub:{family:'wingedBeast',posture:'proud',canonical:{headShape:'baby_dragon',goldSpineRow:true,tailType:'spiked_mace',wingType:'orange_dragon'},variation:{scale:[.98,1.03],muscle:[.98,1.04]}}
});

function buildZyrex(pal, species, seed = 0) {
  const spec = SPECIES[species];
  const morphology = resolveZyrexMorphology(SPECIES_MORPHOLOGY[species] || { family:'predatorQuadruped', canonical:{} }, seed);
  const [body, headC, maneC, hornC] = (spec?.c || PALETTES[pal]).map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, flatShading: true }));
  const eyeM = new THREE.MeshStandardMaterial({ color: '#f0d47e', roughness: 0.25, emissive: new THREE.Color('#f0c050'), emissiveIntensity: 0.4 });
  const root = new THREE.Group(), trunk = new THREE.Group(); trunk.position.y = 1.25; root.add(trunk);
  const cast = m => { m.castShadow = true; return m; };
  const core = cast(new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), body)); core.scale.set(1.05, 0.8, 1.45); trunk.add(core);
  const neck = new THREE.Group(); neck.position.set(0, 0.25, 1.05); trunk.add(neck);
  const head = cast(new THREE.Mesh(new THREE.SphereGeometry(0.57, 14, 10), headC)); head.position.set(0, 0.15, 0.25); neck.add(head);
  const snout = cast(new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), headC)); snout.position.set(0, 0.02, 0.72); snout.scale.set(1, 0.75, 1.1); neck.add(snout);
  for (const x of [-0.26, 0.26]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 6), eyeM); e.position.set(x, 0.3, 0.68); neck.add(e); }
  for (const x of [-0.34, 0.34]) { const ear = cast(new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.45, 5), maneC)); ear.position.set(x, 0.65, 0.05); ear.rotation.z = -x * 0.9; neck.add(ear); }
  const mane = cast(new THREE.Mesh(new THREE.ConeGeometry(0.75, 1.4, 7), maneC)); mane.position.set(0, 0.85, -0.25); mane.rotation.x = -0.35; trunk.add(mane);
  for (let i = 0; i < 3; i++) { const h = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.72, 6), hornC); h.position.set((i - 1) * 0.4, 0.9, -0.7); h.rotation.set(-0.3, 0, (i - 1) * -0.35); trunk.add(h); }
  const legs = [];
  for (const [x, z] of [[-0.55, 0.75], [0.55, 0.75], [-0.55, -0.8], [0.55, -0.8]]) {
    const pv = new THREE.Group(); pv.position.set(x, -0.35, z); trunk.add(pv);
    const l = cast(new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.55, 3, 7), maneC)); l.position.y = -0.45; pv.add(l); legs.push(pv);
  }
  const tail = new THREE.Group(); tail.position.set(0, 0.2, -1.35); trunk.add(tail);
  const tm = cast(new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.2, 6), maneC)); tm.rotation.x = -Math.PI / 2 - 0.5; tm.position.set(0, 0.25, -0.5); tail.add(tm);
  const b = { root, trunk, neck, legs, tail, core, head, mane };
  if (spec) decorateSpecies(b, spec);
  const mass = morphology.mass, individuality = morphology.individual;
  core.scale.multiply(new THREE.Vector3(mass.shoulders || 1, mass.chest || 1, (mass.hips || 1) * individuality.muscle));
  root.scale.setScalar(individuality.scale);
  if (morphology.posture === 'predatory') { trunk.rotation.x = -.08; neck.position.y -= .08; }
  else if (morphology.posture === 'proud') { neck.position.y += .16; neck.rotation.x = -.08; }
  else if (morphology.posture === 'stalker') { trunk.position.y -= .18; neck.position.y -= .12; }
  else if (morphology.posture === 'brute') { neck.position.z -= .12; neck.position.y -= .06; }
  b.morphology = morphology;
  return b;
}

function decorateSpecies(b, s) {
  const { trunk, neck, tail, core, head, mane } = b;
  core.scale.multiply(new THREE.Vector3(...s.body)); head.scale.multiply(new THREE.Vector3(...s.head)); mane.visible = ['crest','saur','dragon'].includes(s.detail);
  const mat = (c, extra={}) => new THREE.MeshStandardMaterial({ color:c, roughness:0.58, flatShading:true, side:THREE.DoubleSide, ...extra });
  const accent = mat(s.c[3]), dark = mat(s.c[2]), bright = mat(s.c[1]);
  const put = (parent, geo, m, x,y,z, sx=1,sy=1,sz=1) => { const q=new THREE.Mesh(geo,m); q.position.set(x,y,z); q.scale.set(sx,sy,sz); q.castShadow=true; parent.add(q); return q; };
  const spikes = (count, height=0.4) => { for(let i=0;i<count;i++) put(trunk,new THREE.ConeGeometry(0.1,height,5),accent,0,0.6,-0.85+i*1.65/Math.max(1,count-1)); };
  const wings = (color, size=1) => { const m=mat(color,{transparent:true,opacity:0.82}); for(const sign of [-1,1]) { const sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(sign*size*0.85,size*0.75);sh.lineTo(sign*size*1.25,size*0.25);sh.lineTo(sign*size*0.75,-size*0.16);sh.closePath();put(trunk,new THREE.ShapeGeometry(sh),m,sign*0.36,0.25,-0.3); } };
  switch(s.detail) {
    case 'insect':
      mane.visible=false; wings('#ba7bea',0.85); tail.visible=false;
      for(const x of [-0.3,0.3]) { const a=put(neck,new THREE.CylinderGeometry(0.017,0.025,0.65,5),dark,x,0.75,0.2);a.rotation.z=x<0?0.3:-0.3;put(neck,new THREE.SphereGeometry(0.075,7,5),accent,x*1.55,1.03,0.2); }
      break;
    case 'ice': spikes(5,0.45); for(const x of [-0.47,0.47]) put(trunk,new THREE.OctahedronGeometry(0.24,0),accent,x,0.28,-0.25,0.8,1.5,0.8); break;
    case 'leaf': wings('#75bf61',0.52); for(const x of [-0.25,0,0.25]) put(neck,new THREE.ConeGeometry(0.13,0.5,4),accent,x,0.85,0); break;
    case 'otter': mane.visible=false; tail.scale.set(2.1,0.34,1.5); for(const x of [-0.35,0.35]) put(neck,new THREE.SphereGeometry(0.18,8,6),dark,x,0.67,0.05);put(trunk,new THREE.SphereGeometry(0.37,8,6),mat('#dbd5c5'),0,-0.26,0.84,0.7,0.65,0.3);break;
    case 'lava': spikes(7,0.48);for(let i=0;i<9;i++) put(trunk,new THREE.IcosahedronGeometry(0.18,0),dark,(i%3-1)*0.45,0.49,-0.75+Math.floor(i/3)*0.6);break;
    case 'crest': for(const x of [-0.3,0,0.3]) put(neck,new THREE.ConeGeometry(0.11,0.58,5),accent,x,0.85,-0.1);break;
    case 'lightning': for(let i=0;i<5;i++){const q=put(trunk,new THREE.OctahedronGeometry(0.19,0),accent,0,0.67,-0.8+i*0.4);q.rotation.z=Math.PI/4;}break;
    case 'saur': spikes(5,0.3);for(const x of [-0.4,0.4]) put(neck,new THREE.ConeGeometry(0.15,0.5,5),dark,x,0.55,0.15).rotation.z=x;break;
    case 'serpent': mane.visible=false;tail.scale.set(0.55,0.5,2.25);for(const x of [-0.23,0.23]) put(neck,new THREE.ConeGeometry(0.11,0.34,5),accent,x,0.6,0);break;
    case 'bird': wings('#e1f9ff',1.0);mane.visible=false;put(neck,new THREE.ConeGeometry(0.2,0.47,5),accent,0,-0.06,0.84).rotation.x=Math.PI/2;break;
    case 'machine': mane.visible=false;tail.visible=false;put(trunk,new THREE.BoxGeometry(1.38,1.1,1.4),dark,0,0,0);put(trunk,new THREE.IcosahedronGeometry(0.46,1),accent,0,0.8,0);for(const x of [-0.92,0.92]) put(trunk,new THREE.CylinderGeometry(0.16,0.16,0.8,8),bright,x,0.22,0);break;
    case 'psychic': mane.visible=false;for(let i=0;i<5;i++){const a=i*Math.PI*2/5;put(neck,new THREE.OctahedronGeometry(0.12,0),accent,Math.sin(a)*0.58,0.5+Math.cos(a)*0.38,0);}break;
    case 'orb': mane.visible=false;tail.visible=false;for(const x of [-0.58,0.58]) put(trunk,new THREE.TorusGeometry(0.32,0.06,6,12),accent,x,0.25,0).rotation.y=Math.PI/2;break;
    case 'spines': spikes(8,0.42);for(const x of [-0.35,0.35]) put(neck,new THREE.ConeGeometry(0.11,0.5,5),accent,x,0.73,0.03).rotation.z=x;break;
    case 'dragon': wings('#aaa0df',0.75);spikes(5,0.25);break;
  }
}

// Elzebub has his own small dragon silhouette rather than the shared wild-Zyrex body.
// The same movement controller drives these pivots, with a lower resting torso.
function buildElzebub(seed = 0) {
  const mat = (c, extra = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.55, flatShading: true, ...extra });
  const blue = mat('#1979dc'), cobalt = mat('#1855b5'), light = mat('#45b7f7'), cream = mat('#f4e5c7');
  const gold = mat('#ffb827', { metalness: 0.4, roughness: 0.28 }), orange = mat('#ef792b', { side: THREE.DoubleSide }), navy = mat('#152249');
  const purple = mat('#ab49ed', { metalness: 0.25, roughness: 0.2 }), eye = mat('#f8b942', { roughness: 0.12 }), pupil = mat('#211427');
  const root = new THREE.Group(), trunk = new THREE.Group(), restY = 0.72; trunk.position.y = restY; root.add(trunk);
  const mesh = (parent, geo, material, x, y, z, sx = 1, sy = 1, sz = 1) => { const o = new THREE.Mesh(geo, material); o.position.set(x,y,z); o.scale.set(sx,sy,sz); o.castShadow = true; parent.add(o); return o; };
  mesh(trunk, new THREE.SphereGeometry(0.48, 10, 7), blue, 0,0,0, 1.12,0.85,1.55);
  mesh(trunk, new THREE.SphereGeometry(0.33, 9, 6), cream, 0,-0.14,0.31, 1.0,0.67,1.15);
  const neck = new THREE.Group(); neck.position.set(0,0.22,0.48); trunk.add(neck);
  mesh(neck, new THREE.SphereGeometry(0.4, 10, 7), blue, 0,0.19,0.18, 1.15,1.06,1);
  mesh(neck, new THREE.SphereGeometry(0.21, 9, 6), light, 0,0.02,0.51, 1.28,0.66,1.28);
  mesh(neck, new THREE.SphereGeometry(0.2, 9, 6), cream, 0,-0.13,0.44, 1.16,0.42,1.12);
  for (const s of [-1,1]) {
    mesh(neck, new THREE.SphereGeometry(0.13, 9, 6), eye, s*0.24,0.26,0.46, 1,1.12,0.52);
    mesh(neck, new THREE.SphereGeometry(0.066, 8, 6), pupil, s*0.24,0.26,0.523, 1,1,0.55);
    mesh(neck, new THREE.SphereGeometry(0.027, 6, 5), cream, s*0.225,0.29,0.562);
    mesh(neck, new THREE.SphereGeometry(0.025, 6, 5), navy, s*0.115,0.05,0.69);
    for (let i = 0; i < 4; i++) { const spike = mesh(neck, new THREE.ConeGeometry(0.09,0.23,4), gold, s*(0.23+i*0.065),0.38-i*0.11,-0.01-i*0.07); spike.rotation.z = -s*0.6; }
  }
  const crown = mesh(neck, new THREE.OctahedronGeometry(0.12,0), purple, 0,0.55,0.37, 0.8,1.3,0.45);
  crown.rotation.z = Math.PI / 4;
  for (let i = 0; i < 5; i++) mesh(trunk, new THREE.ConeGeometry(0.085,0.23,4), gold, 0,0.43,-0.36-i*0.19);
  const legs = [];
  for (const [x,z] of [[-0.34,0.44],[0.34,0.44],[-0.34,-0.44],[0.34,-0.44]]) {
    const pivot = new THREE.Group(); pivot.position.set(x,-0.22,z); trunk.add(pivot); legs.push(pivot);
    mesh(pivot, new THREE.CapsuleGeometry(0.12,0.24,2,5), blue, 0,-0.22,0);
    mesh(pivot, new THREE.SphereGeometry(0.15,7,5), cobalt, 0,-0.43,0.12, 1.25,0.6,1.35);
    for (const a of [-0.09,0,0.09]) mesh(pivot, new THREE.ConeGeometry(0.029,0.1,4), gold, a,-0.46,0.29, 1,1,1).rotation.x = Math.PI/2;
  }
  const wings = [];
  for (const s of [-1,1]) {
    const pivot = new THREE.Group(); pivot.position.set(s*0.31,0.18,-0.15); trunk.add(pivot); wings.push(pivot);
    const shape = new THREE.Shape(); shape.moveTo(0,0); shape.lineTo(s*0.58,0.4); shape.lineTo(s*1.0,0.15); shape.lineTo(s*0.83,-0.05); shape.lineTo(s*0.61,-0.02); shape.lineTo(s*0.4,-0.12); shape.closePath();
    const wing = mesh(pivot,new THREE.ShapeGeometry(shape),orange,0,0,-0.02); wing.material.side = THREE.DoubleSide;
    const rim = new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(s*0.58,0.4,0),new THREE.Vector3(s*1,0.15,0)]);
    mesh(pivot,new THREE.TubeGeometry(rim,9,0.026,5,false),cobalt,0,0,0);
  }
  const tail = new THREE.Group(); tail.position.set(0,-0.06,-0.65); trunk.add(tail);
  const curl = new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(0,-0.08,-0.35),new THREE.Vector3(0,0.08,-0.7),new THREE.Vector3(0,0.16,-0.95)]);
  mesh(tail,new THREE.TubeGeometry(curl,12,0.11,6,false),blue,0,0,0);
  mesh(tail,new THREE.IcosahedronGeometry(0.16,0),cobalt,0,0.16,-0.96);
  for (let i = 0; i < 6; i++) { const a=i*Math.PI/3, q=mesh(tail,new THREE.ConeGeometry(0.055,0.19,4),gold,Math.sin(a)*0.15,0.16+Math.cos(a)*0.15,-0.96); q.rotation.z=-a; }
  const pendant = mesh(trunk,new THREE.TorusGeometry(0.115,0.035,5,10),gold,0,-0.13,0.57);
  pendant.rotation.x = -0.08; mesh(trunk,new THREE.SphereGeometry(0.04,7,5),gold,0,-0.13,0.61);
  return { root, trunk, neck, legs, tail, wings, restY, morphology: resolveZyrexMorphology(SPECIES_MORPHOLOGY.elzebub, seed) };
}

export class WildZyrex {
  constructor(scene, def, world, patchHalf) {
    this.def = def; this.world = world; this.half = patchHalf;
    this.home = new THREE.Vector2(def.x, def.z);
    const seed = Math.floor(def.x * 97 + def.z * 13) >>> 0;
    this.b = def.species === 'elzebub' ? buildElzebub(seed) : buildZyrex(def.palette, def.species, seed);
    this.b.root.scale.multiplyScalar(def.scale || 1); scene.add(this.b.root);
    this.pos = new THREE.Vector3(def.x, world.heightAt(def.x, def.z), def.z);
    this.r = rng(Math.floor(def.x * 97 + def.z * 13) >>> 0);
    this.heading = this.r() * Math.PI * 2; this.state = 'idle'; this.timer = 1 + this.r() * 3;
    this.target = null; this.speed = 0; this.phase = 0; this.alert = 0;
  }
  inPatch(x, z, pad = 0) { return Math.abs(x - this.home.x) < this.half + pad && Math.abs(z - this.home.y) < this.half + pad; }
  pickTarget() {
    for (let i = 0; i < 12; i++) {
      const x = this.home.x + this.r.range(-this.half, this.half), z = this.home.y + this.r.range(-this.half, this.half);
      if ((this.world.containsLand && !this.world.containsLand(x, z)) || this.world.waterAt(x, z) > this.world.heightAt(x, z) - 0.1) continue;
      return new THREE.Vector2(x, z);
    }
    return this.home.clone();
  }
  update(dt, t, rizer, guards = []) {
    if (this.bondCapture || this.bonded) return;
    const p = this.pos, rp = rizer.position, dx = rp.x - p.x, dz = rp.z - p.z, dist = Math.hypot(dx, dz);
    let guard = null, guardDist = Infinity;
    for (const g of guards || []) {
      if (!g?.pos || g.state === 'down' || g.state === 'sinking') continue;
      const d = Math.hypot(g.pos.x - p.x, g.pos.z - p.z);
      if (d < guardDist) { guard = g; guardDist = d; }
    }
    const guardNear = guardDist < 16;
    // locked on for bonding, a Zyrex lets Rizer walk right up; only a sprint spooks it
    // Noise: crouched sneaking is quiet (it notices you late and lets you come close), running is loud.
    const noise = rizer.crouched ? 0.35 : rizer.speed > 5 ? 1.5 : 1, notice = 12 * noise;
    const rushed = this.bondFocus ? rizer.speed > 5 && dist < 6 && !rizer.crouched : (rizer.speed > 5 && dist < 9 * noise) || dist < 3.6 * noise;
    if (this.bondFocus && dist < 14 && this.state !== 'flee') this.state = 'watch';
    let want = 0;
    if ((rushed || guardNear) && this.state !== 'flee') { this.state = 'flee'; this.timer = guardNear ? 4 : 2.6; }
    switch (this.state) {
      case 'idle': this.timer -= dt; if (dist < notice) this.state = 'watch'; else if (this.timer <= 0) { this.state = 'wander'; this.target = this.pickTarget(); } break;
      case 'wander': {
        if (dist < notice) { this.state = 'watch'; break; }
        const tx = this.target.x - p.x, tz = this.target.y - p.z;
        if (Math.hypot(tx, tz) < 1) { this.state = 'idle'; this.timer = this.r.range(2, 6); break; }
        this.heading = dampAngle(this.heading, Math.atan2(tx, tz), 3, dt); want = 1.9; break;
      }
      case 'watch':
        this.heading = dampAngle(this.heading, Math.atan2(dx, dz), 2.5, dt);
        if (dist > notice + 3) { this.state = 'idle'; this.timer = this.r.range(1, 3); }
        break;
      case 'flee':
        this.heading = dampAngle(this.heading, guardNear ? Math.atan2(p.x - guard.pos.x, p.z - guard.pos.z) : Math.atan2(-dx, -dz), 7, dt); want = 9;
        this.timer -= dt; if (this.timer <= 0 && dist > 10 && !guardNear) { this.state = 'return'; }
        break;
      case 'return': { // the long walk home — never re-homed where it ran to
        const tx = this.home.x - p.x, tz = this.home.y - p.z;
        if (this.inPatch(p.x, p.z, -2)) { this.state = 'idle'; this.timer = 2; break; }
        if (dist < 12 && !rushed) { want = 0; this.heading = dampAngle(this.heading, Math.atan2(dx, dz), 2, dt); break; }
        this.heading = dampAngle(this.heading, Math.atan2(tx, tz), 2.5, dt); want = 2.4; break;
      }
    }
    this.speed = damp(this.speed, want, want > this.speed ? 5 : 7, dt);
    const oldX = p.x, oldZ = p.z;
    const nx = p.x + Math.sin(this.heading) * this.speed * dt, nz = p.z + Math.cos(this.heading) * this.speed * dt;
    const wet = this.world.waterAt(nx, nz) > this.world.heightAt(nx, nz) - 0.1;
    if (!wet) { p.x = nx; p.z = nz; }
    else if (this.state === 'wander') this.target = this.pickTarget();
    else this.heading += dt * 2.5; // skirt the water's edge
    if (this.world.resolve(p, 1.1) && this.state === 'wander') this.target = this.pickTarget();
    if (this.world.keepOnLand?.(p, oldX, oldZ)) { this.speed = 0; if (this.state === 'wander' || this.state === 'return') this.target = this.pickTarget(); }
    const B = this.world.bound; p.x = clamp(p.x, -B, B); p.z = clamp(p.z, -B, B);
    p.y = this.world.heightAt(p.x, p.z);
    // body
    const b = this.b; b.root.position.copy(p); b.root.rotation.y = this.heading;
    this.phase += this.speed * dt * 2.4;
    const amp = clamp(this.speed / 3, 0, 1) * (this.state === 'flee' ? 0.9 : 0.55);
    b.legs.forEach((l, i) => { l.rotation.x = Math.sin(this.phase + (i === 0 || i === 3 ? 0 : Math.PI)) * amp; });
    b.trunk.position.y = (b.restY || 1.25) + Math.abs(Math.sin(this.phase)) * 0.08 * amp + Math.sin(t * 1.8) * 0.03;
    b.trunk.rotation.z = Math.sin(this.phase) * 0.04 * amp;
    this.alert = damp(this.alert, this.state === 'watch' ? 1 : 0, 3, dt);
    const localLook = Math.atan2(dx, dz) - this.heading;
    b.neck.rotation.y = damp(b.neck.rotation.y, this.state === 'watch' ? clamp(Math.atan2(Math.sin(localLook), Math.cos(localLook)), -0.7, 0.7) : Math.sin(t * 0.7) * 0.15, 4, dt);
    b.neck.rotation.x = damp(b.neck.rotation.x, this.state === 'idle' ? 0.35 + Math.sin(t * 0.9) * 0.1 : this.alert * -0.2, 3, dt); // grazes when idle
    b.tail.rotation.y = Math.sin(t * (this.state === 'watch' ? 9 : 3)) * (0.25 + this.alert * 0.2);
    if (b.wings) for (let i = 0; i < b.wings.length; i++) b.wings[i].rotation.z = (i ? -1 : 1) * (0.08 + Math.sin(t * 2.5 + i * 0.2) * 0.09);
  }
}
