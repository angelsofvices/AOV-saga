import * as THREE from 'three';
import { frostContact, frostStep } from './frost-state.js';

export const PLASMABEAM = Object.freeze({ damage: 3, cooldown: 0.48, speed: 35, range: 45, radius: 0.045 });
export function distributePlasmaTargets(primary, candidates, origin) {
  if (!primary) return [null, null, null];
  const other = [...new Set(candidates)].filter(g => g !== primary).sort((a,b) => a.pos.distanceToSquared(origin) - b.pos.distanceToSquared(origin) || String(a.id).localeCompare(String(b.id)));
  return other.length > 1 ? [primary, other[0], other[1]] : other.length === 1 ? [primary, primary, other[0]] : [primary, primary, primary];
}
// The approved reference, expressed in the game's native low-poly mesh style.
// Grip at origin, +Z along the barrel; no external texture/model dependency.
export function buildPlasmabeam() {
  const root = new THREE.Group(); root.name = 'Plasmabeam';
  const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, metalness: 0.65, roughness: 0.35, ...extra });
  const orange = mat('#d66b15'), brass = mat('#cba047'), dark = mat('#252b30'), grip = mat('#171c20', { roughness: 0.85 });
  const green = mat('#52ff65', { emissive:'#22df45', emissiveIntensity:1.8, metalness:0.2 });
  function box(w,h,d,m,x,y,z,rx=0) { const o = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); o.position.set(x,y,z); o.rotation.x=rx; root.add(o); return o; }
  function tube(r,len,m,x,y,z) { const o = new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,10),m); o.rotation.x=Math.PI/2; o.position.set(x,y,z); root.add(o); return o; }
  box(.07,.09,.23,dark,0,.035,.065); box(.082,.054,.17,orange,0,.074,.065);
  tube(.027,.15,green,0,.034,.10);
  for (const x of [-.036,.036]) { box(.012,.022,.16,brass,x,.02,.10); box(.012,.025,.11,orange,x,-.01,.09); }
  tube(.048,.055,dark,0,.034,.197); tube(.049,.012,brass,0,.034,.225); tube(.032,.014,green,0,.034,.233);
  box(.064,.055,.052,orange,0,.03,-.065); tube(.024,.025,green,0,.035,-.105);
  box(.047,.125,.049,grip,0,-.073,-.035,-.27); box(.059,.021,.06,orange,0,-.139,-.017);
  for (let i=0;i<4;i++) box(.052,.006,.047,dark,0,-.04-i*.024,-.045+i*.006);
  box(.056,.012,.07,brass,0,-.074,.028); box(.012,.075,.013,brass,.026,-.038,.06);
  for (const side of [-1,1]) {
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(.041,.041,.009,12),brass); rim.rotation.z=Math.PI/2; rim.position.set(side*.046,.025,-.004); root.add(rim);
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(.026),green); core.scale.set(.2,1,1); core.position.set(side*.053,.025,-.004); root.add(core);
    // Rizer's four-point chest emblem, built in metal over the side panel.
    const emblem = new THREE.Mesh(new THREE.OctahedronGeometry(.018),brass); emblem.scale.set(.16,1.2,.7); emblem.position.set(side*.045,.062,-.062); root.add(emblem);
  }
  root.userData.muzzle = new THREE.Vector3(0,.034,.25);
  root.userData.base = new THREE.Vector3(0,0,-.08); root.userData.tip = root.userData.muzzle.clone(); root.userData.hitR = .035; root.userData.trail = [.3,1,.4];
  root.userData.mode = mode => { green.color.set(mode === 'frost' ? '#79d6ff' : '#52ff65'); green.emissive.set(mode === 'frost' ? '#218de8' : '#22df45'); };
  root.traverse(o => { if(o.isMesh) o.castShadow=true; }); return root;
}
export function createPlasmabeamSystem({ scene, world, foes, hit, fx, onHit = () => {} }) {
  const shots = [], frosted = new Map(), ray = new THREE.Raycaster(), direction = new THREE.Vector3(), endpoint = new THREE.Vector3();
  let round = 0, cooldown = 0;
  function alive(g) { return foes.alive(g); }
  function aim(g) { return (g.center || g.pos).clone().add(new THREE.Vector3(0,g.center ? 0 : 1.2,0)); }
  function fire(from, forward, primary, mode) {
    if (cooldown > 0) return false;
    const valid = foes.grunts.filter(g => alive(g) && g.pos.distanceTo(from) <= PLASMABEAM.range);
    if (!valid.includes(primary)) primary = null;
    const targets = distributePlasmaTargets(primary, valid, from); cooldown = PLASMABEAM.cooldown; round++;
    for (let i=0;i<3;i++) {
      const material = new THREE.MeshBasicMaterial({ color:mode==='frost'?'#76d8ff':'#55ff72' });
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(.018,.034,.55,6),material); scene.add(mesh);
      const dir = targets[i] ? aim(targets[i]).sub(from).normalize() : forward.clone();
      if (primary) dir.applyAxisAngle(new THREE.Vector3(0,1,0),(i-1)*.045);
      const shot={mesh,dir,pos:from.clone(),target:targets[i],mode,round,age:0}; shots.push(shot); mesh.position.copy(from);
    }
    return true;
  }
  function disposeShot(s) { scene.remove(s.mesh); s.mesh.geometry.dispose(); s.mesh.material.dispose(); }
  function shells(g) {
    const source=g.actor?.model || g.root, list=[]; source?.updateMatrixWorld(true);
    const meshes=[]; source?.traverse(o => { if (o.isMesh && !o.userData.frostShell && !o.userData.noCollide && !(Array.isArray(o.material)?o.material:[o.material]).every(m=>m.transparent)) meshes.push(o); });
    for (const o of meshes) {
      const shell=o.clone(false); shell.material=new THREE.MeshStandardMaterial({color:'#a2ddff',emissive:'#2271ae',emissiveIntensity:.25,transparent:true,opacity:.08,depthWrite:false,roughness:.13,metalness:.15});
      shell.userData={noCollide:true,frostShell:true}; shell.scale.multiplyScalar(1.015); o.parent.add(shell); list.push(shell);
    }
    return list;
  }
  function removeFrost(g, shatter=false) {
    const status=frosted.get(g); if(!status)return;
    for(const s of status.shells){s.removeFromParent();s.material.dispose();}
    if(shatter) {const p=aim(g);fx?.emit(p.x,p.y,p.z,28,{color:'#a9e7ff',speed:4,up:2,size:.18,life:.7,g:6});}
    if (g.frost===status) delete g.frost; frosted.delete(g);
  }
  function frostHit(g, id) {
    let s=frosted.get(g); if(!s){s={progress:0,rate:0,remaining:0,frozen:false,slow:1,shells:shells(g)};frosted.set(g,s);g.frost=s;}
    frostContact(s,id);
  }
  function update(dt) {
    cooldown=Math.max(0,cooldown-dt);
    for(const [g,s] of frosted){
      if(!alive(g)){removeFrost(g,s.frozen);continue;}
      const state=frostStep(s,dt); for(const shell of s.shells)shell.material.opacity=.1+s.progress*.55;
      if(state==='thaw') removeFrost(g,true);
    }
    const valid=foes.grunts.filter(alive);
    for(let i=shots.length-1;i>=0;i--){
      const s=shots[i];s.age+=dt;
      if(s.target&&alive(s.target)){direction.copy(aim(s.target)).sub(s.pos).normalize();s.dir.lerp(direction,Math.min(1,dt*12)).normalize();}
      const distance=PLASMABEAM.speed*dt; endpoint.copy(s.pos).addScaledVector(s.dir,distance);
      const clear=world.rayClear(s.pos,endpoint,PLASMABEAM.radius); ray.set(s.pos,s.dir);ray.near=0;ray.far=Math.min(distance,clear);
      let target=null,at=null,best=ray.far;
      for(const g of valid){
        if(!alive(g))continue;
        const root=g.actor?.model||g.root;if(!root)continue;root.updateMatrixWorld(true);
        const contacts=ray.intersectObject(root,true).filter(c=>!c.object.userData.noCollide&&!c.object.userData.frostShell&&c.object.visible);
        const contact=contacts[0];if(contact&&contact.distance<=best){best=contact.distance;target=g;at=contact.point.clone();}
      }
      if(target){
        if(s.mode==='frost')frostHit(target,s.round);else onHit(hit(target,PLASMABEAM.damage,s.dir),target);
        fx?.emit(at.x,at.y,at.z,7,{color:s.mode==='frost'?'#8fdcff':'#6aff78',speed:1.6,up:.5,size:.12,life:.3,g:0});
      }
      if(target||clear<distance-.01||s.age>PLASMABEAM.range/PLASMABEAM.speed){disposeShot(s);shots.splice(i,1);continue;}
      s.pos.copy(endpoint);s.mesh.position.copy(s.pos);s.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),s.dir);
    }
  }
  function clear(){for(const s of shots)disposeShot(s);shots.length=0;for(const g of [...frosted.keys()])removeFrost(g);}
  return { fire, update, clear, shots, frosted };
}
