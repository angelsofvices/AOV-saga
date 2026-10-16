import * as THREE from 'three';
import { frostContact, frostStep } from './frost-state.js';

export const PLASMABEAM = Object.freeze({ damage: 3, cooldown: 0.82, speed: 35, range: 45, radius: 0.045 });
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
  // Attachment landmarks keep the actual handle in the palm and the shot at
  // the barrel, independent of the weapon's model origin.
  root.userData.grip = new THREE.Vector3(0,-.073,-.035);
  root.userData.muzzle = new THREE.Vector3(0,.034,.25);
  root.userData.base = new THREE.Vector3(0,0,-.08); root.userData.tip = root.userData.muzzle.clone(); root.userData.hitR = .035; root.userData.trail = [.3,1,.4];
  root.userData.mode = mode => { green.color.set(mode === 'frost' ? '#79d6ff' : '#52ff65'); green.emissive.set(mode === 'frost' ? '#218de8' : '#22df45'); };
  root.traverse(o => { if(o.isMesh) o.castShadow=true; }); return root;
}
export function createPlasmabeamSystem({ scene, world, foes, hit, fx, onHit = () => {} }) {
  const shots = [], frosted = new Map(), iceDebris = [], ray = new THREE.Raycaster(), direction = new THREE.Vector3(), endpoint = new THREE.Vector3();
  const iceSpikeGeo=new THREE.ConeGeometry(.055,.5,6), iceVeinGeo=new THREE.CylinderGeometry(.009,.006,1,5), iceCrystalMat=new THREE.MeshStandardMaterial({color:'#c9f0ff',emissive:'#58bdeb',emissiveIntensity:.42,roughness:.2,metalness:.08,transparent:true,opacity:.92}), iceVeinMat=new THREE.MeshStandardMaterial({color:'#a9e8ff',emissive:'#4daee8',emissiveIntensity:.28,roughness:.28,metalness:.04,transparent:true,opacity:.84});
  let round = 0, cooldown = 0;
  function alive(g) { return foes.alive(g); }
  function frostSource(g) { return g.actor?.model || g.body || g.root; }
  function aim(g) { return (g.center || g.pos).clone().add(new THREE.Vector3(0,g.center ? 0 : 1.2,0)); }
  function fire(from, forward, primary, mode, precision = null, resolvePrecision = null) {
    if (cooldown > 0) return false;
    const valid = foes.grunts.filter(g => alive(g) && g.pos.distanceTo(from) <= PLASMABEAM.range);
    if (!valid.includes(primary)) primary = null;
    // Keep the trigger to one authored shot for this playtest; the multi-target
    // burst can return when its timing and distribution are ready.
    cooldown = PLASMABEAM.cooldown; round++;
    const material = new THREE.MeshBasicMaterial({ color:mode==='frost'?'#76d8ff':'#55ff72' });
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(.018,.034,.55,6),material); scene.add(mesh);
    // Lock-on selects one point at trigger time. The projectile keeps this
    // normalized direction for its whole flight: no homing or in-flight curve.
    const dir = (primary ? aim(primary).sub(from) : forward.clone()).normalize();
    const shot={mesh,dir,pos:from.clone(),mode,round,age:0,precision,resolvePrecision,precisionResolved:false}; shots.push(shot); mesh.position.copy(from);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir);
    return true;
  }
  function disposeShot(s) { scene.remove(s.mesh); s.mesh.geometry.dispose(); s.mesh.material.dispose(); }
  function shells(g) {
    const source=frostSource(g), list=[]; source?.updateMatrixWorld(true);
    const meshes=[]; source?.traverse(o => { if (o.isMesh && !o.userData.frostShell && !o.userData.noCollide && !(Array.isArray(o.material)?o.material:[o.material]).every(m=>m.transparent)) meshes.push(o); });
    for (const o of meshes) {
      const shell=o.clone(false); shell.material=new THREE.MeshStandardMaterial({color:'#a2ddff',emissive:'#2271ae',emissiveIntensity:.25,transparent:true,opacity:.08,depthWrite:false,roughness:.13,metalness:.15});
      shell.userData={noCollide:true,frostShell:true}; shell.scale.multiplyScalar(1.015); o.parent.add(shell); list.push(shell);
    }
    return list;
  }
  function iceFormation(g) {
    const source=frostSource(g);if(!source)return null;
    source.updateWorldMatrix(true,true);
    const worldBox=new THREE.Box3().setFromObject(source),inv=source.matrixWorld.clone().invert(),box=new THREE.Box3().makeEmpty(),corner=new THREE.Vector3();
    if(!worldBox.isEmpty())for(let i=0;i<8;i++)box.expandByPoint(corner.set(i&1?worldBox.max.x:worldBox.min.x,i&2?worldBox.max.y:worldBox.min.y,i&4?worldBox.max.z:worldBox.min.z).applyMatrix4(inv));
    if(box.isEmpty())box.set(new THREE.Vector3(-.4,0,-.25),new THREE.Vector3(.4,1.8,.25));
    const size=box.getSize(new THREE.Vector3()),mid=box.getCenter(new THREE.Vector3()),w=Math.max(.3,size.x),h=Math.max(.35,size.y),depth=Math.max(.16,size.z),front=box.max.z+depth*.055;
    const group=new THREE.Group();group.name='Frost Crystal Growth';source.add(group);
    const spike=(x,y,z,len,dir=new THREE.Vector3(0,-1,0),width=.8)=>{const d=dir.clone().normalize(),m=new THREE.Mesh(iceSpikeGeo,iceCrystalMat);m.position.set(x,y,z).addScaledVector(d,len*.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d);m.scale.set(width*len*.8,len/.5,width*len*.8);m.castShadow=true;group.add(m);};
    // Icicles hang from the frozen silhouette; smaller angled spurs and crown
    // crystals make it read as natural growth instead of a smooth blue shell.
    for(const sx of [-1,1]){
      for(const f of [.72,.61,.49])spike(mid.x+sx*w*.31,box.min.y+h*f,front,.16+h*(.12+Math.random()*.09),new THREE.Vector3(sx*.12,-1,.06),.66);
      spike(mid.x+sx*w*.48,box.min.y+h*.58,mid.z+depth*.28,.2+h*.15,new THREE.Vector3(sx*.65,-.72,.18),.72);
      spike(mid.x+sx*w*.25,box.max.y-h*.07,front,.12+h*.13,new THREE.Vector3(sx*.18,1,.05),.68);
    }
    for(const fx of [-.15,0,.15])spike(mid.x+w*fx,box.max.y-h*.02,front,.13+h*(.08+Math.random()*.08),new THREE.Vector3(fx*.6,1,.16),.72);
    const vein=(a,b)=>{const d=b.clone().sub(a),m=new THREE.Mesh(iceVeinGeo,iceVeinMat);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());m.scale.y=d.length();group.add(m);};
    const y0=box.min.y+h*.39,y1=box.min.y+h*.69,z=front+depth*.035,cx=mid.x;
    // Branching frost veins spread across the front of the frozen block.
    vein(new THREE.Vector3(cx,y0,z),new THREE.Vector3(cx-w*.025,y0+h*.14,z));
    vein(new THREE.Vector3(cx-w*.025,y0+h*.14,z),new THREE.Vector3(cx+w*.025,y0+h*.3,z));
    vein(new THREE.Vector3(cx-w*.025,y0+h*.14,z),new THREE.Vector3(cx-w*.2,y0+h*.22,z));
    vein(new THREE.Vector3(cx-w*.2,y0+h*.22,z),new THREE.Vector3(cx-w*.28,y0+h*.34,z));
    vein(new THREE.Vector3(cx-w*.2,y0+h*.22,z),new THREE.Vector3(cx-w*.32,y0+h*.17,z));
    vein(new THREE.Vector3(cx+w*.025,y0+h*.3,z),new THREE.Vector3(cx+w*.18,y0+h*.38,z));
    vein(new THREE.Vector3(cx+w*.18,y0+h*.38,z),new THREE.Vector3(cx+w*.29,y0+h*.5,z));
    vein(new THREE.Vector3(cx+w*.18,y0+h*.38,z),new THREE.Vector3(cx+w*.34,y0+h*.34,z));
    vein(new THREE.Vector3(cx+w*.025,y0+h*.3,z),new THREE.Vector3(cx+w*.04,y1,z));
    return group;
  }
  function removeFrost(g, shatter=false) {
    const status=frosted.get(g); if(!status)return;
    for(const s of status.shells){s.removeFromParent();s.material.dispose();}
    status.formation?.removeFromParent();
    if(shatter) {const p=aim(g);fx?.emit(p.x,p.y,p.z,28,{color:'#a9e7ff',speed:4,up:2,size:.18,life:.7,g:6});}
    if (g.frost===status) delete g.frost; frosted.delete(g);
  }
  function shatterFrozen(g) {
    const p = g.center || g.pos;
    if (!p) return;
    fx?.emit(p.x,p.y,p.z,30,{color:'#a9e7ff',speed:4.5,up:2.2,size:.2,life:.75,g:7});
    for(let i=0;i<12;i++){
      const size=.09+Math.random()*.14, material=new THREE.MeshStandardMaterial({color:i%3?'#bfeaff':'#e8f8ff',emissive:'#64b9f2',emissiveIntensity:.32,roughness:.25,metalness:.08,transparent:true,opacity:1});
      const mesh=new THREE.Mesh(new THREE.BoxGeometry(size,size*(.8+Math.random()*.8),size),material);
      mesh.position.set(p.x+(Math.random()-.5)*.65,p.y+(Math.random()-.15)*.7,p.z+(Math.random()-.5)*.65);
      mesh.rotation.set(Math.random()*6,Math.random()*6,Math.random()*6);mesh.castShadow=true;scene.add(mesh);
      iceDebris.push({mesh,vel:new THREE.Vector3((Math.random()-.5)*4,1.2+Math.random()*4,(Math.random()-.5)*4),spin:new THREE.Vector3((Math.random()-.5)*12,(Math.random()-.5)*12,(Math.random()-.5)*12),age:0,life:1.45+Math.random()*.45});
    }
  }
  function frostHit(g, id) {
    let s=frosted.get(g); if(!s){s={progress:0,rate:0,remaining:0,frozen:false,slow:1,shells:shells(g)};frosted.set(g,s);g.frost=s;}
    frostContact(s,id);
  }
  function update(dt) {
    cooldown=Math.max(0,cooldown-dt);
    for(const [g,s] of frosted){
      if(!alive(g)){if(s.frozen){const body=frostSource(g);if(body)body.visible=false;shatterFrozen(g);}removeFrost(g,false);continue;}
      const state=frostStep(s,dt); for(const shell of s.shells)shell.material.opacity=.1+s.progress*.55;
      if(state==='freeze')s.formation=iceFormation(g);
      if(state==='thaw') removeFrost(g,true);
    }
    const valid=foes.grunts.filter(alive);
    for(let i=iceDebris.length-1;i>=0;i--){
      const d=iceDebris[i],m=d.mesh;d.age+=dt;d.vel.y-=9.8*dt;m.position.addScaledVector(d.vel,dt);m.rotation.x+=d.spin.x*dt;m.rotation.y+=d.spin.y*dt;m.rotation.z+=d.spin.z*dt;
      const floor=world.groundAt(m.position.x,m.position.z,m.position.y+.2);
      if(Number.isFinite(floor)&&m.position.y<floor+.045){m.position.y=floor+.045;if(d.vel.y<0)d.vel.y=Math.abs(d.vel.y)*.22;d.vel.x*=.72;d.vel.z*=.72;d.spin.multiplyScalar(.78);}
      m.material.opacity=Math.max(0,1-d.age/d.life);
      if(d.age>=d.life){scene.remove(m);m.geometry.dispose();m.material.dispose();iceDebris.splice(i,1);}
    }
    for(let i=shots.length-1;i>=0;i--){
      const s=shots[i];s.age+=dt;
      const distance=PLASMABEAM.speed*dt; endpoint.copy(s.pos).addScaledVector(s.dir,distance);
      const clear=world.rayClear(s.pos,endpoint,PLASMABEAM.radius); ray.set(s.pos,s.dir);ray.near=0;ray.far=Math.min(distance,clear);
      let target=null,at=null,best=ray.far;
      for(const g of valid){
        if(!alive(g))continue;
        const root=g.actor?.model||g.root;if(!root?.matrixWorld)continue;root.updateMatrixWorld(true);
        // Some streamed/rebuilt actors contain detached mesh nodes for one frame.
        // Raycaster's recursive path still calls Mesh.raycast on those nodes, where
        // matrixWorld can be null and crash the whole game update (KillDOM). Build
        // a flat list of live, world-ready meshes and raycast it non-recursively.
        const meshes=[];
        root.traverse(o=>{
          if(!o.isMesh||!o.geometry||!o.matrixWorld||!o.visible||o.userData.noCollide||o.userData.frostShell)return;
          const materials=Array.isArray(o.material)?o.material:[o.material];
          if(materials.length&&materials.every(m=>m?.transparent))return;
          meshes.push(o);
        });
        const contacts=ray.intersectObjects(meshes,false);
        const contact=contacts[0];if(contact&&contact.distance<=best){best=contact.distance;target=g;at=contact.point.clone();}
      }
      if(target){
        if(s.mode==='frost')frostHit(target,s.round);else { const precision=target.isScanobot&&!target.isNova?{}:(s.resolvePrecision?.(s.precision,true)||{}); s.precisionResolved=true; onHit(hit(target,PLASMABEAM.damage,s.dir,precision),target); }
        fx?.emit(at.x,at.y,at.z,7,{color:s.mode==='frost'?'#8fdcff':'#6aff78',speed:1.6,up:.5,size:.12,life:.3,g:0});
      }
      if(target||clear<distance-.01||s.age>PLASMABEAM.range/PLASMABEAM.speed){if(!s.precisionResolved&&s.mode!=='frost')s.resolvePrecision?.(s.precision,false);disposeShot(s);shots.splice(i,1);continue;}
      s.pos.copy(endpoint);s.mesh.position.copy(s.pos);s.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),s.dir);
    }
  }
  function clear(){for(const s of shots)disposeShot(s);shots.length=0;for(const g of [...frosted.keys()])removeFrost(g);for(const d of iceDebris){scene.remove(d.mesh);d.mesh.geometry.dispose();d.mesh.material.dispose();}iceDebris.length=0;}
  return { fire, update, clear, shots, frosted, ready:()=>cooldown<=0 };
}
