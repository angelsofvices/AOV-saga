// Player-planted bases. Tree, cabin, room layout and guard assignments have independent persistent state.
import * as THREE from 'three';
import { inventory, saveInv } from './loot.js';
import { LAND_ROUTES, routeDistance } from './overworld-land.js';
import { worldDistrictAt } from './world-data.js';
import { storage } from './storage.js';
import { createFurnitureMover } from './home-furniture.js';
import { createPartner } from './zyrex2d.js';
export const TREEHOUSE = Object.freeze({ growth: 8, construction: 4, height: 4.6, maxHP: 240, defenderSlots: 2, guardRadius: 12, recipe: { fresh_wood: 10, scrap_metal: 10, everstone: 10 } });
const V = (x=0,y=0,z=0) => new THREE.Vector3(x,y,z);
const mat = c => new THREE.MeshStandardMaterial({color:c, roughness:.8});
const wood=mat('#87532d'), bark=mat('#604027'), green=mat('#306d39'), gold=mat('#d4ad52'), blue=mat('#136699');
function box(g,w,h,d,x,y,z,m=wood) { const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); o.position.set(x,y,z); o.castShadow=o.receiveShadow=true; g.add(o); return o; }
function pole(g,a,b,r,m=wood) { const v=b.clone().sub(a), o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,v.length(),7),m); o.position.copy(a).add(b).multiplyScalar(.5); o.quaternion.setFromUnitVectors(V(0,1,0),v.normalize()); g.add(o); return o; }
function prefab(rec) {
  const root=new THREE.Group(), tree=new THREE.Group(), cabin=new THREE.Group(); root.name=rec.id; root.add(tree,cabin); root.position.set(rec.x,rec.y,rec.z); root.rotation.y=rec.yaw;
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.65,1.25,10,9),bark); trunk.position.y=5; tree.add(trunk);
  for(let i=0;i<7;i++) { const a=i*Math.PI*2/7; pole(tree,V(0,.65,0),V(Math.sin(a)*3.1,0,Math.cos(a)*3.1),.25,bark); }
  for(let i=0;i<15;i++) { const a=i*2.4,r=2.5+(i%3)*.8,y=7.8+(i%4)*.7; pole(tree,V(0,5.5,0),V(Math.sin(a)*r,y,Math.cos(a)*r),.19,bark); const o=new THREE.Mesh(new THREE.IcosahedronGeometry(2.15,1),mat(['#346b34','#4c843b','#5a943f'][i%3])); o.scale.set(1,.65,1); o.position.set(Math.sin(a)*r,y,Math.cos(a)*r); o.userData.noCollide=true; tree.add(o); }
  const H=TREEHOUSE.height; box(cabin,6.4,.22,5.8,0,H-.11,1.7); // platform top is exactly H
  box(cabin,5,.18,3.2,0,H+.05,.65); // cabin floor
  box(cabin,.18,2.7,3.2,-2.4,H+1.4,.65); box(cabin,.18,2.7,3.2,2.4,H+1.4,.65); box(cabin,4.8,2.7,.18,0,H+1.4,-.95);
  box(cabin,1.65,2.7,.18,-1.6,H+1.4,2.25); box(cabin,1.65,2.7,.18,1.6,H+1.4,2.25); box(cabin,1.5,.45,.18,0,H+2.53,2.25);
  const hinge=new THREE.Group(); hinge.position.set(-.75,H,2.36); hinge.name=rec.id+'-door'; hinge.userData.reach=1.15; box(hinge,1.5,2.3,.12,.75,1.15,0); box(hinge,.08,.12,.1,1.3,1.15,.12,gold); cabin.add(hinge);
  for(const s of [-1,1]) { const roof=box(cabin,2.8,.15,4.1,s*1.3,H+3.1,.65,green); roof.rotation.z=s*-.4; for(let k=0;k<6;k++) { const sh=box(cabin,2.82,.06,.12,s*1.3,H+3.17,-1.25+k*.68,gold); sh.rotation.z=s*-.4; } pole(cabin,V(s*3,H,4.2),V(s*1,1,0),.17); }
  for(const s of [-1,1]) for(let z=.2;z<=4.3;z+=1.35) box(cabin,.12,.95,.12,s*3,H+.48,z);
  for(const s of [-1,1]) box(cabin,.12,.12,4.2,s*3,H+.95,2.2);
  for(const s of [-1,1]) { box(cabin,2.2,.12,.12,s*1.95,H+.95,4.3); box(cabin,.5,1,.05,s*2,H+.18,4.37,blue); box(cabin,.12,.65,.07,s*2,H+.2,4.4,gold); pole(cabin,V(s*.5,0,4.2),V(s*.5,H,4.2),.08); }
  for(let y=.25;y<H;y+=.32) pole(cabin,V(-.5,y,4.2),V(.5,y,4.2),.055);
  const glow=new THREE.MeshStandardMaterial({color:'#ffcb6a',emissive:'#ffb246',emissiveIntensity:.7});
  for(const s of [-1,1]) { pole(cabin,V(s*2.7,H+1.9,3.8),V(s*2.7,H+1.5,3.8),.03); box(cabin,.22,.35,.22,s*2.7,H+1.32,3.8,glow); box(cabin,.28,.07,.28,s*2.7,H+1.52,3.8,gold); }
  cabin.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.userData.baseColor=o.material.color.clone();}});return {root,tree,cabin,hinge};
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createTreehouses({scene,world,rizer,cam,home,blocked,occupants,toast,prompt,enter,exit,leaveDoor,saveGame,foes,seers,onAssign,onGuardHit,fx}) {
  inventory.treehouses ||= []; const live=new Map(); let motion=null, placing=false, candidate=null, panel=null, panelRec=null, activeInterior=null, panelIndex=0;
  const ghost=new THREE.Mesh(new THREE.RingGeometry(5.7,5.85,48),new THREE.MeshBasicMaterial({color:'#7ed9a1',transparent:true,opacity:.75,side:THREE.DoubleSide})); ghost.rotation.x=-Math.PI/2; ghost.visible=false; ghost.userData.noCollide=true; scene.add(ghost);
  const persist=()=>saveInv();
  function at(rec,x,z,y=0) { const c=Math.cos(rec.yaw),s=Math.sin(rec.yaw); return V(rec.x+x*c+z*s,rec.y+y,rec.z-x*s+z*c); }
  function disableCabin(L) { L.cabin.traverse(o=>{if(o.isMesh)world.mass.disableInstance(o,-1);}); L.collision=false; L.cabin.visible=false; if(L.platform)L.platform.active=false; }
  function enableCabin(L) { if(L.collision)return; L.cabin.visible=true; L.cabin.scale.setScalar(1); L.root.updateMatrixWorld(true); world.addMesh(L.cabin); const p=at(L.rec,0,1.7);if(!L.platform)L.platform=world.addSurface({shape:'box',x:p.x,z:p.z,y:L.rec.y+TREEHOUSE.height,hw:3.2,hd:2.9,rot:L.rec.yaw,active:true});else L.platform.active=true; L.collision=true; }
  function restore(rec) { if(live.has(rec.id))return live.get(rec.id); rec.furniture ||= []; rec.defenders ||= []; rec.maxHP ||= TREEHOUSE.maxHP; const L={...prefab(rec),rec,guards:new Map(),attackTimes:new Map(),collision:false}; world.structures.add(L.root); live.set(rec.id,L); L.cabin.visible=rec.cabin==='built'||rec.cabin==='building';if(rec.cabin==='building')L.cabin.scale.setScalar(Math.max(.01,(rec.buildTime||0)/TREEHOUSE.construction)); if(rec.cabin==='built'){enableCabin(L);L.cabin.traverse(o=>{if(o.isMesh&&o.userData.baseColor)o.material.color.copy(o.userData.baseColor).lerp(new THREE.Color('#332b25'),rec.hp<rec.maxHP*.3?.65:rec.hp<rec.maxHP*.65?.3:0);});} L.tree.scale.setScalar(Math.max(.015,Math.min(1,(rec.growth||0)/8))); if(rec.growth>=8)world.addMesh(L.tree); return L; }
  for(const rec of inventory.treehouses)restore(rec);
  function validate(x,z) {
    if(blocked()||rizer.seq||!rizer.onGround||Math.abs(rizer.position.y-world.heightAt(rizer.position.x,rizer.position.z))>.6)return {ok:false,why:'Stand on open ground first'};
    const y=world.heightAt(x,z), hs=[];
    for(let i=0;i<16;i++){const a=i*Math.PI/8,px=x+Math.sin(a)*5.8,pz=z+Math.cos(a)*5.8; if(!world.onLand(px,pz)||world.waterAt(px,pz)>world.heightAt(px,pz)-.1)return {ok:false,why:'Keep the whole tree on dry land'}; hs.push(world.heightAt(px,pz)); const p=V(px,y+.5,pz); if(world.resolve(p,.4))return {ok:false,why:'Leave space around existing objects'}; }
    if(Math.max(...hs)-Math.min(...hs)>.65)return {ok:false,why:'Choose flatter ground'};
    for(const route of LAND_ROUTES)if(routeDistance(x,z,route)<7)return {ok:false,why:'Keep inter-district routes clear'};
    for(const p of world.T.pads||[])if(Math.hypot(x-p.x,z-p.z)<p.r+7)return {ok:false,why:'Keep clear of buildings and landmarks'};
    const district=worldDistrictAt(x,z); if(!district)return {ok:false,why:'Choose a district wilderness location'}; for(let i=0;i<16;i++){const a=i*Math.PI/8;if(worldDistrictAt(x+Math.sin(a)*8,z+Math.cos(a)*8)!==district)return {ok:false,why:'Keep district boundaries clear'};}
    for(const o of world.obstacles){if(o.active===false||o.top<y)continue;const radius=o.type==='box'?Math.hypot(o.hw,o.hd):o.r;if(Math.hypot(o.x-x,o.z-z)<radius+5.8)return {ok:false,why:'Keep clear of existing structures and props'};}
    const rd=world.T.roads?.nearest?.(x,z,14); if(rd && rd.d<(rd.line?.width||4)/2+6)return {ok:false,why:'Keep the roads clear'};
    for(const c of world.cavePlan?.placements||[]) { const p=c.center||c.entrance||c;  if(Number.isFinite(p.x)&&Math.hypot(x-p.x,z-p.z)<(c.footprintR||12)+8)return {ok:false,why:'Keep cave entrances clear'}; }
    for(const L of live.values())if(Math.hypot(x-L.rec.x,z-L.rec.z)<13)return {ok:false,why:'Too close to another planted tree'};
    for(const p of occupants())if(Math.hypot(x-p.x,z-p.z)<7)return {ok:false,why:'Someone is standing in the build area'};
    const center=V(x,y+.5,z);if(world.resolve(center,.5))return {ok:false,why:'An object occupies this ground'};return {ok:true,x,y,z,yaw:rizer.facing,district};
  }
  function start() { if(blocked()||motion)return toast('Step into the wilderness to plant a tree'); close(); placing=true; toast('Plant tree · choose open ground · ○ / E plant · △ / Escape cancel'); }
  function cancel() { placing=false; ghost.visible=false; }
  function beginMotion(kind,rec,from,to,duration,done) {
    const slot=kind==='plant'?'plantTree':'ladderClimb', action=rizer.actor?.acts[slot];
    if((kind==='plant'||kind==='ladder')&&!action){toast('Treehouse animation is still loading · try again');return false;}
    const clip=action?.getClip(); 
    motion={kind,rec,from,to,t:0,duration:duration||clip?.duration||1,clip,done,align:true}; rizer.actor?.stopPreview(); const m=motion;const ready=()=>{if(motion!==m)return;m.align=false;if(clip)rizer.actor.startPreview(clip,{loop:true,speed:0});};if(Math.hypot(rizer.position.x-from.x,rizer.position.z-from.z)>.12){if(!rizer.walkTo(from,rec.yaw+Math.PI,ready)){motion=null;return false;}}else ready();rizer.vel.set(0,0,0); rizer.vy=0;rizer.speed=0;return true;
  }
  function plant() {
    if(candidate)candidate=validate(candidate.previewX??candidate.x,candidate.previewZ??candidate.z);
    if(!candidate?.ok)return toast(candidate?.why||'Choose open ground');
    const rec={id:'treehouse-'+(globalThis.crypto?.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2)),...candidate,growth:0,cabin:'unbuilt',hp:TREEHOUSE.maxHP,maxHP:TREEHOUSE.maxHP,furniture:[],defenders:[]}; delete rec.ok;delete rec.checkedAt;delete rec.previewX;delete rec.previewZ;
    const foot=at(rec,0,5.9);foot.y=world.groundAt(foot.x,foot.z,rizer.position.y+1);
    const a=rizer.actor?.acts.plantTree;if(!a)return toast('Planting animation is still loading');
    if(beginMotion('plant',rec,foot,foot,a.getClip().duration,()=>{inventory.treehouses.push(rec);restore(rec);persist();toast('Seed planted · magical growth begins');})){cancel();rizer.facing=rec.yaw+Math.PI;}
  }
  function build(rec) { if(rec.growth<8)return toast('Let the tree finish growing'); if(rec.cabin==='built')return;
    if(!storage.consumeResources(TREEHOUSE.recipe).ok)return toast('INSUFFICIENT BUILDING MATERIALS · 10 Fresh Wood · 10 Scrap Metal · 10 Everstone');
    close();rec.cabin='building';rec.paid={...TREEHOUSE.recipe};rec.buildTime=0;rec.hp=rec.maxHP;persist();const L=live.get(rec.id);L.cabin.visible=true;toast('Building your treehouse');
  }
  function dismantle(rec) {
    if(rec.cabin!=='built')return;
    const refunds=Object.fromEntries(Object.entries(rec.paid||{}).map(([id,n])=>[id,Math.floor(n*.5)]));
    if(!storage.refundResources(refunds).ok)return toast('Make room in your Zycube before dismantling');
    rec.cabin='dismantled';rec.paid=null;rec.defenders=[];disableCabin(live.get(rec.id));persist();close();toast('Treehouse dismantled · 50% materials recovered · planted tree kept');
  }
  function destroy(rec) { fx?.emit(rec.x,rec.y+TREEHOUSE.height,rec.z,30,{color:'#a08359',speed:3,up:1.4,size:.25,life:1});rec.cabin='destroyed';rec.hp=0;rec.defenders=[];disableCabin(live.get(rec.id));persist();toast('Treehouse destroyed · your tree, furnishings and saved progress remain');if(activeInterior?.rec===rec){exit();rizer.position.copy(at(rec,0,5.5));} }
  function ascend(rec) { close(); const from=at(rec,0,4.7),to=at(rec,0,3.8,TREEHOUSE.height);from.y=world.groundAt(from.x,from.z,rec.y+1); const duration=rizer.actor?.acts.ladderClimb?.getClip().duration; rizer.facing=rec.yaw+Math.PI;
    beginMotion('ladder',rec,from,to,duration,()=>{rizer.position.copy(at(rec,0,3.6,TREEHOUSE.height));rizer.onGround=true;toast('Platform · ○ / E at the door to enter · △ descend');});
  }
  function descend(rec) { const from=at(rec,0,3.8,TREEHOUSE.height),to=at(rec,0,4.7);to.y=world.groundAt(to.x,to.z,rec.y+1);rizer.facing=rec.yaw+Math.PI;beginMotion('ladder',rec,from,to,rizer.actor?.acts.ladderClimb?.getClip().duration,()=>{rizer.position.copy(at(rec,0,5.5));rizer.onGround=true;}); }
  function nearest() { let best=null;for(const L of live.values()){const rec=L.rec,p=at(rec,0,4.7);const d=Math.hypot(p.x-rizer.position.x,p.z-rizer.position.z);if(d<3.3&&(!best||d<best.d))best={rec,d};}return best; }
  function interact() {const n=nearest();if(!n)return false;const rec=n.rec;if(rec.cabin==='built'&&Math.abs(rizer.position.y-rec.y-TREEHOUSE.height)<.7){enter(interior(rec));return true;}open(rec);return true;}
  function assign(rec,id) { const used=inventory.treehouses.some(q=>q.id!==rec.id&&q.defenders?.includes(id));if(used)return toast('Already guarding another treehouse');
    if(rec.defenders.includes(id)){rec.defenders=rec.defenders.filter(q=>q!==id);if(rec.guardStates)rec.guardStates[id]='recalled';}else {if(rec.defenders.length>=TREEHOUSE.defenderSlots)return toast('All defender slots are occupied');if(rec.guardHP?.[id]===0)return toast('This defender was defeated · recover it before reassignment');rec.defenders.push(id);onAssign?.(id);} persist();open(rec);
  }
  function close(){if(panel)panel.remove();panel=null;panelRec=null;}
  function open(rec) {close();panelRec=rec;panelIndex=0;panel=document.createElement('section'); panel.style.cssText='position:fixed;z-index:65;left:50%;top:50%;transform:translate(-50%,-50%);width:min(560px,90vw);max-height:85vh;overflow:auto;background:#101d23;color:#eee;border:2px solid #c6a559;border-radius:12px;padding:24px;font:16px system-ui;box-shadow:0 15px 80px #000a';
    const built=rec.cabin==='built';panel.innerHTML=`<h2>Rizer’s Treehouse</h2><p>${rec.growth<8?'Growing · '+Math.round(rec.growth/8*100)+'%':built?'Integrity '+Math.ceil(rec.hp)+' / '+rec.maxHP:'Mature planted tree · ready to build'}</p><div data-actions></div><p style="font-size:12px">↑ ↓ select · ✕ / Enter choose · ○ / Escape close</p>`;
    const actions=panel.querySelector('[data-actions]');const button=(label,fn)=>{const b=document.createElement('button');b.textContent=label;b.style.cssText='display:block;width:100%;margin:8px 0;padding:12px;background:#203640;color:white;border:1px solid #b29c66;border-radius:5px;text-align:left';b.onclick=fn;actions.append(b);};
    if(!built&&rec.growth>=8&&rec.cabin!=='building')button('Build · 10 wood + 10 scrap + 10 stone',()=>build(rec));
    if(built&&!activeInterior)button('Climb ladder',()=>ascend(rec));
    if(built){if(activeInterior)button('Exit via ladder',()=>{close();leaveDoor(activeInterior);});button('Save progress here',()=>{if(!activeInterior)return toast('Enter your treehouse to save here');persist();saveGame();toast('TREEHOUSE · progress saved');});
      if(activeInterior) {for(const id of ['plant','coffee','lamp1','sofa','bed'])button('Place '+(home.furn.byId(id)?.name||id),()=>{const I=interior(rec);if(I.addFurniture(id))toast('Furniture placed · R lock · □ / J move · use management to rotate');});
        for(const p of interior(rec).furn.pieces)button('Rotate '+p.name,()=>{const old=p.yaw;p.yaw+=Math.PI/2;if(!interior(rec).furn.check(p,p.dx,p.dz).ok){p.yaw=old;return toast('Keep the exit and other furniture clear');}interior(rec).furn.apply(p,p.dx,p.dz);interior(rec).furn.save();open(rec);}); }
      for(const a of inventory.bondedZyrex||[])button((rec.defenders.includes(a.id)?'Recall ':'Assign defender · ')+a.name+(rec.guardStates?.[a.id]?' · '+rec.guardStates[a.id]:''),()=>assign(rec,a.id));
      button('Dismantle · recover 50% of construction materials',()=>{actions.replaceChildren();button('Confirm dismantle · returns 5 wood, 5 scrap, 5 stone',()=>{if(activeInterior)return toast('Exit via the ladder before dismantling your treehouse');dismantle(rec);});button('Cancel',()=>open(rec));});
    }button('Close',close);document.body.append(panel);select(0);document.exitPointerLock?.(); }
  function select(n){const bs=[...panel?.querySelectorAll('button')||[]];if(!bs.length)return;panelIndex=(n+bs.length)%bs.length;bs.forEach((b,i)=>b.style.background=i===panelIndex?'#466579':'#203640');}
  function pad(p){if(!panel)return;if(p.edge(12))select(panelIndex-1);if(p.edge(13))select(panelIndex+1);if(p.edge(0))panel.querySelectorAll('button')[panelIndex]?.click();if(p.edge(1))close();}
  addEventListener('keydown',e=>{if(!panel)return;if(e.code==='Escape'){close();e.preventDefault();}if(e.code==='ArrowUp'){select(panelIndex-1);e.preventDefault();}if(e.code==='ArrowDown'){select(panelIndex+1);e.preventDefault();}if(e.code==='Enter'){panel.querySelectorAll('button')[panelIndex]?.click();e.preventDefault();}});
  function interior(rec) {
    const L=live.get(rec.id);if(L.interior)return L.interior;
    const root=new THREE.Group();root.visible=false;scene.add(root);const hw=11.25*Math.SQRT1_2,hd=7.5*Math.SQRT1_2; // 50% of Rizer room's floor area, same player scale
    box(root,hw*2,.15,hd*2,0,-.075,0);box(root,.15,3.8,hd*2,-hw,1.9,0);box(root,.15,3.8,hd*2,hw,1.9,0);box(root,hw*2,3.8,.15,0,1.9,-hd);box(root,hw*2,.12,hd*2,0,3.8,0);
    box(root,hw-1,3.8,.15,-(hw+1)/2,1.9,hd);box(root,hw-1,3.8,.15,(hw+1)/2,1.9,hd);box(root,2,1.4,.15,0,3.1,hd);
    const door=new THREE.Group();door.position.set(-1,0,hd);door.userData.reach=1.45;box(door,2,2.4,.12,1,1.2,0);root.add(door);
    const pieces=[], outline=new THREE.Box3Helper(new THREE.Box3(),0x7fd6ff);outline.visible=false;root.add(outline);
    const ext=p=>p.yaw%Math.PI!==0?{hw:p.hd,hd:p.hw}:{hw:p.hw,hd:p.hd};
    const check=(p,dx,dz)=>{const x=p.fx+dx,z=p.fz+dz,e=ext(p);if(Math.abs(x)+e.hw>hw-.3||Math.abs(z)+e.hd>hd-.3)return {ok:false,why:'Too close to the wall'};if(Math.abs(x)<e.hw+1.25)return {ok:false,why:'Keep a clear path to the door'};for(const q of pieces)if(q!==p){const f=ext(q);if(Math.abs(x-q.cx)<e.hw+f.hw+.1&&Math.abs(z-q.cz)<e.hd+f.hd+.1)return {ok:false,why:'Furniture overlaps'};}return {ok:true};};
    const apply=(p,dx,dz)=>{p.dx=dx;p.dz=dz;p.cx=p.fx+dx;p.cz=p.fz+dz;p.group.position.set(p.cx,0,p.cz);p.group.rotation.y=p.yaw;};
    const save=()=>{rec.furniture=pieces.map(p=>({id:p.id,type:p.type,x:p.cx,z:p.cz,yaw:p.yaw}));persist();};
    function addFurniture(type,saved) {const src=home.furn.byId(type);if(!src)return false;const group=src.group.clone(true);group.position.set(0,0,0);group.rotation.set(0,0,0);group.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(group),center=bounds.getCenter(V());for(const child of group.children){child.position.x-=center.x;child.position.z-=center.z;child.position.y-=bounds.min.y;}const lights=[];group.traverse(o=>{if(o.isLight)lights.push(o);});lights.forEach(o=>o.removeFromParent());const p={id:saved?.id||rec.id+'-furn-'+(globalThis.crypto?.randomUUID?.()||Date.now()),type,name:src.name,level:1,group,hw:src.hw,hd:src.hd,fx:saved?.x||0,fz:saved?.z||0,dx:0,dz:0,cx:0,cz:0,yaw:saved?.yaw||0};
      let found=!!saved;if(!saved)outer:for(const x of [-hw+3,hw-3])for(let z=-hd+2;z<hd-2;z+=.5){p.fx=x;p.fz=z;if(check(p,0,0).ok){found=true;break outer;}}if(!found||!check(p,0,0).ok){toast('No room · rearrange furniture first');return false;}pieces.push(p);root.add(group);apply(p,0,0);if(!saved)save();return true;}
    for(const s of rec.furniture)addFurniture(s.type,s);
    const distance=(p,pos)=>{const e=ext(p);return Math.hypot(Math.max(0,Math.abs(pos.x-p.cx)-e.hw),Math.max(0,Math.abs(pos.z-p.cz)-e.hd));};
    const furn={pieces,level:1,SNAP:.25,check,apply,save,distance,focus(pos,face,reach=3.4){return pieces.filter(p=>distance(p,pos)<reach).sort((a,b)=>distance(a,pos)-distance(b,pos))[0];},setMoving(p,v){p.moving=v;},show(p,ok=true){outline.visible=!!p;if(p){outline.box.setFromObject(p.group);outline.material.color.set(ok?0x7fd6ff:0xff5a5a);}}};
    const clamp=p=>{p.x=THREE.MathUtils.clamp(p.x,-hw+.4,hw-.4);p.z=THREE.MathUtils.clamp(p.z,-hd+.4,hd-.4);};
    const roomWorld={bound:100,heightAt:()=>0,groundAt:()=>0,surfaceAt:()=>0,waterAt:()=>-Infinity,cameraMinDist:.15,keepOnLand(p){const x=p.x,z=p.z;clamp(p);return x!==p.x||z!==p.z;},resolve(p,r=.4){const old=p.clone();clamp(p);for(const q of pieces){if(q.moving)continue;const e=ext(q),px=e.hw+r-Math.abs(p.x-q.cx),pz=e.hd+r-Math.abs(p.z-q.cz);if(px>0&&pz>0){if(px<pz)p.x+=Math.sign(p.x-q.cx||1)*px;else p.z+=Math.sign(p.z-q.cz||1)*pz;}}return p.distanceToSquared(old)>1e-8;},rayClear(a,b){const d=b.clone().sub(a),len=d.length();let f=1;for(const [axis,lo,hi] of [['x',-hw+.2,hw-.2],['z',-hd+.2,hd-.2],['y',.1,3.5]]){if(d[axis]>0)f=Math.min(f,(hi-a[axis])/d[axis]);else if(d[axis]<0)f=Math.min(f,(lo-a[axis])/d[axis]);}return Math.max(.15,len*Math.max(0,f)-.1);}};
    const I={id:rec.id,name:'Rizer’s Treehouse',treehouse:true,rec,root,furn,roomWorld,level:1,frontDoor:door,exteriorDoor:rec.id+'-door',addFurniture,lights:()=>[{pos:V(0,3,0),color:new THREE.Color('#ffdca4'),intensity:2,distance:16,decay:2}],show(v){root.visible=v;if(v)activeInterior=I;else {I.mover.abort();activeInterior=null;}},start(r,c){r.position.set(0,0,hd-2);r.facing=Math.PI;r.vel.set(0,0,0);r.vy=r.speed=0;r.onGround=true;r.flying=false;c.snapBehind(r,3.4);},nearDoor(p){p=p.position||p;return Math.abs(p.x)<1.7&&p.z>hd-2;},stationAt(){return null;},update(r,c){r.flying=false;if(r.position.y>1.4){r.position.y=1.4;r.vy=0;}},manage(){open(rec);}};
    I.mover=createFurnitureMover({interior:I,rizer,toast,prompt});L.interior=I;return I;
  }
  function damage(rec,amount) { if(rec.cabin!=='built')return;rec.hp=Math.max(0,rec.hp-amount);const L=live.get(rec.id);L.cabin.traverse(o=>{if(o.isMesh&&o.userData.baseColor)o.material.color.copy(o.userData.baseColor).lerp(new THREE.Color('#332b25'),rec.hp<rec.maxHP*.3?.65:rec.hp<rec.maxHP*.65?.3:0);});persist();fx?.emit(rec.x,rec.y+3,rec.z,8,{color:'#bba17c',speed:1.8,up:.6,size:.18,life:.5});if(!rec.hp)destroy(rec); }
  function attackTarget(g,r) {
    if(!foes.alive(g)||g.held||g.stormHeld||r.position.distanceTo(g.pos)<8)return null;
    let nearest=null,dist=14;
    for(const L of live.values())if(L.rec.cabin==='built'){const d=Math.hypot(g.pos.x-L.rec.x,g.pos.z-L.rec.z);if(d<dist&&Math.abs(g.pos.y-L.rec.y)<2){dist=d;nearest=L;}}
    if(!nearest)return null;const L=nearest,rec=L.rec;
    for(const [id,q] of L.guards)if((rec.guardHP?.[id]??100)>0&&q.pos.distanceTo(g.pos)<5)return {pos:q.pos,reach:2,hit:()=>{rec.guardHP ||= {};rec.guardHP[id]=Math.max(0,(rec.guardHP[id]??100)-10);q.s?.root?.userData && (q.s.root.userData.treehouseGuard=true);rec.guardStates ||= {};if(!rec.guardHP[id]){rec.guardStates[id]='defeated';q.setVisible(false);}persist();}};
    const pos=at(rec,g.pos.x>rec.x?1.4:-1.4,.7);
    return {pos,reach:2.1,hit:()=>damage(rec,8)};
  }
  function guards(L,dt,t) { const rec=L.rec;for(const [id,g] of L.guards)if(!rec.defenders.includes(id)||rec.cabin!=='built'){scene.remove(g.b.root);L.guards.delete(id);}
    if(rec.cabin!=='built')return;
    for(const id of rec.defenders){const record=inventory.bondedZyrex?.find(q=>q.id===id);if(!record)continue;if(!L.guards.has(id)){const g=createPartner(scene,world,record,at(rec,3,5));if(g)L.guards.set(id,g);}const g=L.guards.get(id);if(!g)continue;g.setVisible(!activeInterior&&(rec.guardHP?.[id]??100)>0);if(activeInterior||(rec.guardHP?.[id]??100)<=0)continue;
      const threat=foes.grunts.filter(q=>foes.alive(q)&&!['patrol','return','wait','observe','dance'].includes(q.state)&&Math.hypot(q.pos.x-rec.x,q.pos.z-rec.z)<TREEHOUSE.guardRadius).sort((a,b)=>g.pos.distanceTo(a.pos)-g.pos.distanceTo(b.pos))[0];
      const anchor={position:at(rec,3,4),facing:rec.yaw,speed:0};const defenders={grunts:foes.grunts,alive:foes.alive,hitGrunt(q,d,dx,dz){if(g.pos.distanceTo(q.pos)>2.4)return null;return q.isScanobot?q.hit(d,dx,dz,'punch',.9):seers.hitGrunt(q,d,dx,dz,'punch',.9);}};g.update(dt,t,anchor,{seers:defenders,onHit:onGuardHit,lock:threat?{kind:'enemy',ref:threat}:null});rec.guardStates ||= {};rec.guardStates[id]=threat?'engaged':g.pos.distanceTo(anchor.position)>4?'returning':'guarding';
    }
    if(activeInterior)return;

  }
  function update(dt,t,outdoors) {
    for(const L of live.values()){const rec=L.rec;if(rec.growth<8){rec.growth=Math.min(8,rec.growth+dt);const u=Math.max(.015,rec.growth/8),s=u*u*(3-2*u);L.tree.scale.setScalar(s);if(rec.growth===8){L.tree.scale.setScalar(1);L.root.updateMatrixWorld(true);world.addMesh(L.tree);persist();toast('Tree mature · approach the ladder to build');}}
      if(rec.cabin==='building'){rec.buildTime=Math.min(TREEHOUSE.construction,(rec.buildTime||0)+dt);L.cabin.scale.setScalar(Math.max(.01,rec.buildTime/TREEHOUSE.construction));if(rec.buildTime===TREEHOUSE.construction){rec.cabin='built';enableCabin(L);persist();toast('TREEHOUSE COMPLETE · climb the ladder to enter');}}
      if(outdoors)guards(L,dt,t);
    }
    if(placing){const x=rizer.position.x+Math.sin(rizer.facing)*8,z=rizer.position.z+Math.cos(rizer.facing)*8;if(!candidate||t-(candidate.checkedAt||0)>.2||Math.hypot(x-(candidate.previewX??x),z-(candidate.previewZ??z))>.4){candidate={...validate(x,z),checkedAt:t,previewX:x,previewZ:z};}ghost.visible=true;ghost.position.set(x,world.heightAt(x,z)+.08,z);ghost.material.color.set(candidate.ok?'#7ed9a1':'#ef5962');prompt('PLANT TREE',candidate.ok?'○ / E plant · △ cancel':candidate.why);}
    if(motion){const m=motion;if(rizer.hp<=0){rizer.actor?.stopPreview();motion=null;return;}if(m.align){if(!rizer.auto){motion=null;toast('Could not reach the planting / ladder position');}return;}m.t+=dt;const u=Math.min(1,m.t/m.duration);rizer.position.copy(m.from).lerp(m.to,u);rizer.vel.set(0,0,0);rizer.vy=rizer.speed=0;if(m.clip&&rizer.actor.preview)rizer.actor.preview.t=m.kind==='ladder'&&m.to.y<m.from.y?(1-u)*(m.clip.duration-.001):u*(m.clip.duration-.001);rizer.actor?.update(0,0,false);rizer.body.root.rotation.y=rizer.facing;cam.snapBehind(rizer,3.6);if(u===1){rizer.actor?.stopPreview();motion=null;m.done();}}
    if(!placing&&!motion&&!panel&&outdoors){const n=nearest();if(n)prompt('RIZER’S TREEHOUSE',n.rec.growth<8?'Magical tree growing':n.rec.cabin==='built'?'○ / E manage or enter · △ descend from platform':'○ / E build treehouse');}
  }
  return {start,cancel,plant,interact,nearest,ascend,descend,open,close,pad,update,interior,attackTarget,damage,get placing(){return placing;},get busy(){return !!motion;},get isOpen(){return !!panel;},get activeInterior(){return activeInterior;},get live(){return live;},save:persist};
}
