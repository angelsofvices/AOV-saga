// Player-planted bases. Tree, cabin, room layout and guard assignments have independent persistent state.
import * as THREE from 'three';
import { inventory, saveInv } from './loot.js';
import { worldDistrictAt } from './world-data.js';
import { storage } from './storage.js';
import { createFurnitureMover } from './home-furniture.js';
import { createPartner } from './zyrex2d.js';
// A standard-size world tree has 14 HP (8 + 6 × scale 1). Treehouses use
// the same hit/durability scale, with the requested 1.5× durability.
const TREEHOUSE_TREE_HP = Math.round((8 + 6) * 1.5);
export const TREEHOUSE = Object.freeze({ growth: 8, height: 7.2, maxHP: TREEHOUSE_TREE_HP, cost: { fresh_wood: 10, scrap_metal: 10, everstone: 10 }, defenderSlots: 2, guardRadius: 12 });
const V = (x=0,y=0,z=0) => new THREE.Vector3(x,y,z);
const mat = c => new THREE.MeshStandardMaterial({color:c, roughness:.8});
const wood=mat('#87532d'), bark=mat('#604027'), green=mat('#306d39'), gold=mat('#d4ad52'), blue=mat('#136699');
function box(g,w,h,d,x,y,z,m=wood) { const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); o.position.set(x,y,z); o.castShadow=o.receiveShadow=true; g.add(o); return o; }
function pole(g,a,b,r,m=wood) { const v=b.clone().sub(a), o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,v.length(),7),m); o.position.copy(a).add(b).multiplyScalar(.5); o.quaternion.setFromUnitVectors(V(0,1,0),v.normalize()); g.add(o); return o; }
function prefab(rec) {
  const root=new THREE.Group(), tree=new THREE.Group(), cabin=new THREE.Group(); root.name=rec.id; root.add(tree,cabin); root.position.set(rec.x,rec.y,rec.z); root.rotation.y=rec.yaw;
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.78,1.45,14,9),bark); trunk.position.y=7; tree.add(trunk);
  for(let i=0;i<7;i++) { const a=i*Math.PI*2/7; pole(tree,V(0,.65,0),V(Math.sin(a)*3.5,0,Math.cos(a)*3.5),.3,bark); }
  for(let i=0;i<17;i++) { const a=i*2.4,r=2.8+(i%3)*.9,y=9.5+(i%4)*.8; pole(tree,V(0,7.2,0),V(Math.sin(a)*r,y,Math.cos(a)*r),.22,bark); const o=new THREE.Mesh(new THREE.IcosahedronGeometry(2.35,1),mat(['#346b34','#4c843b','#5a943f'][i%3])); o.scale.set(1,.65,1); o.position.set(Math.sin(a)*r,y,Math.cos(a)*r); o.userData.noCollide=true; tree.add(o); }
  const H=TREEHOUSE.height; box(cabin,9.2,.24,7.4,0,H-.12,1.7); // walkable platform mesh, including the ladder landing
  box(cabin,8,.2,4.4,0,H+.05,.65); // larger cabin floor
  box(cabin,.2,3,4.4,-3.9,H+1.55,.65); box(cabin,.2,3,4.4,3.9,H+1.55,.65); box(cabin,7.8,3,.2,0,H+1.55,-1.55);
  box(cabin,2.65,3,.2,-2.65,H+1.55,2.85); box(cabin,2.65,3,.2,2.65,H+1.55,2.85); box(cabin,2.5,.5,.2,0,H+2.8,2.85);
  const hinge=new THREE.Group(); hinge.position.set(-1.1,H,2.96); hinge.name=rec.id+'-door'; hinge.userData.reach=1.35; box(hinge,2.2,2.5,.14,1.1,1.25,0); box(hinge,.1,.14,.12,1.9,1.25,.14,gold); cabin.add(hinge);
  for(const s of [-1,1]) { const roof=box(cabin,4.4,.18,5.8,s*2,H+3.35,.65,green); roof.rotation.z=s*-.38; for(let k=0;k<7;k++) { const sh=box(cabin,4.42,.07,.14,s*2,H+3.43,-1.9+k*.82,gold); sh.rotation.z=s*-.38; } pole(cabin,V(s*4.3,H,5.15),V(s*1,1,0),.18); }
  for(const s of [-1,1]) for(let z=-.1;z<=4.9;z+=1.45) box(cabin,.14,1,.14,s*4.3,H+.5,z);
  for(const s of [-1,1]) box(cabin,.14,.14,5.1,s*4.3,H+1,2.4);
  for(const s of [-1,1]) { box(cabin,3.2,.14,.14,s*2.8,H+1,5.15); box(cabin,.62,1.05,.06,s*2.8,H+.2,5.22,blue); box(cabin,.14,.7,.08,s*2.8,H+.2,5.25,gold); pole(cabin,V(s*.55,0,5.1),V(s*.55,H,5.1),.09); }
  // Three-part ladder: feet align at the base, hands follow the rungs, and the last clip steps onto this platform.
  for(let y=.25;y<H;y+=.34) pole(cabin,V(-.55,y,5.1),V(.55,y,5.1),.06);
  const glow=new THREE.MeshStandardMaterial({color:'#ffcb6a',emissive:'#ffb246',emissiveIntensity:.7});
  for(const s of [-1,1]) { pole(cabin,V(s*2.7,H+1.9,3.8),V(s*2.7,H+1.5,3.8),.03); box(cabin,.22,.35,.22,s*2.7,H+1.32,3.8,glow); box(cabin,.28,.07,.28,s*2.7,H+1.52,3.8,gold); }
  for(const group of [tree,cabin])group.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.userData.baseColor=o.material.color.clone();}});return {root,tree,cabin,hinge};
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createTreehouses({scene,world,rizer,cam,home,blocked,occupants,toast,prompt,enter,exit,leaveDoor,saveGame,foes,seers,onAssign,onGuardHit,dropResource,fx}) {
  inventory.treehouses ||= []; const live=new Map(); let motion=null, placing=false, candidate=null, panel=null, panelRec=null, activeInterior=null, panelIndex=0;
  const ghost=new THREE.Mesh(new THREE.RingGeometry(5.7,5.85,48),new THREE.MeshBasicMaterial({color:'#7ed9a1',transparent:true,opacity:.75,side:THREE.DoubleSide})); ghost.rotation.x=-Math.PI/2; ghost.visible=false; ghost.userData.noCollide=true; scene.add(ghost);
  const persist=()=>saveInv();
  function at(rec,x,z,y=0) { const c=Math.cos(rec.yaw),s=Math.sin(rec.yaw); return V(rec.x+x*c+z*s,rec.y+y,rec.z-x*s+z*c); }
  function disableCabin(L) { L.cabin.traverse(o=>{if(o.isMesh)world.mass.disableInstance(o,-1);}); L.collision=false; L.cabin.visible=false; if(L.platform)L.platform.active=false; }
  function enableCabin(L) { if(L.collision)return; L.cabin.visible=true; L.cabin.scale.setScalar(1); L.root.updateMatrixWorld(true); world.addMesh(L.cabin); L.collision=true; }
  function restore(rec) { if(live.has(rec.id))return live.get(rec.id);if(rec.cabin==='falling'){rec.cabin='destroyed';rec.hp=0;}rec.furniture ||= []; rec.defenders ||= []; if(!rec.maxHP||rec.maxHP> TREEHOUSE.maxHP){const ratio=rec.maxHP?rec.hp/rec.maxHP:1;rec.maxHP=TREEHOUSE.maxHP;rec.hp=Math.max(1,Math.round(TREEHOUSE.maxHP*ratio));} const L={...prefab(rec),rec,guards:new Map(),attackTimes:new Map(),hitKeys:new Set(),collision:false,shake:0,hitSide:{x:0,z:1},lean:(1-Math.max(0,rec.hp||TREEHOUSE.maxHP)/(rec.maxHP||TREEHOUSE.maxHP))*.07}; world.structures.add(L.root); live.set(rec.id,L); const removed=rec.cabin==='destroyed'||rec.cabin==='dismantled'; L.cabin.visible=!removed&&(rec.cabin==='built'||rec.cabin==='building'||rec.cabin==='growing'); const scale=Math.max(.015,Math.min(1,(rec.growth||0)/8));L.cabin.scale.setScalar(scale); if(rec.cabin==='built'){enableCabin(L);L.root.traverse(o=>{if(o.isMesh&&o.userData.baseColor)o.material.color.copy(o.userData.baseColor).lerp(new THREE.Color('#332b25'),rec.hp<rec.maxHP*.3?.65:rec.hp<rec.maxHP*.65?.3:0);});} L.tree.scale.setScalar(scale); if(rec.growth>=8&&!removed){rec.cabin='built';L.cabin.scale.setScalar(1);world.addMesh(L.tree);enableCabin(L);}if(removed)L.root.visible=false;return L; }
  for(const rec of inventory.treehouses)restore(rec);
  function validate(x,z) {
    if(blocked()||rizer.seq||!rizer.onGround)return {ok:false,why:'Stand on grassy ground to plant'};
    const y=world.heightAt(x,z);
    if(!world.onLand(x,z)||world.waterAt(x,z)>y-.1)return {ok:false,why:'Plant on grass, away from water'};
    const road=world.T.roads?.nearest?.(x,z,3);if(road&&road.d<(road.line?.width||4)/2+.45)return {ok:false,why:'Plant beside the road, on grass'};
    for(const site of world.T.pads||[])if(Math.hypot(x-site.x,z-site.z)<site.r+.45)return {ok:false,why:'Plant on grass outside buildings and landmarks'};
    const center=V(x,y+.35,z);if(world.resolve(center,.38))return {ok:false,why:'Choose a clear patch of grass'};
    if(occupants().some(p=>Math.hypot(x-p.x,z-p.z)<1.2))return {ok:false,why:'Move clear of other characters'};
    for(const L of live.values())if(Math.hypot(x-L.rec.x,z-L.rec.z)<3.5)return {ok:false,why:'There is already a treehouse here'};
    return {ok:true,x,y,z,yaw:rizer.facing,district:worldDistrictAt(x,z)};
  }
  function start() { if(blocked()||motion)return toast('Stand on grass with a Life Seed equipped'); plantSeed(); }
  function cancel() { placing=false; ghost.visible=false; }
  function beginMotion(kind,rec,from,to,duration,done) {
    const slot=kind==='plant'?'plantTree':'ladderClimb', action=rizer.actor?.acts[slot];
    if((kind==='plant'||kind==='ladder')&&!action){toast('Treehouse animation is still loading · try again');return false;}
    const clip=action?.getClip(); 
    motion={kind,rec,from,to,t:0,duration:duration||clip?.duration||1,clip,done,align:true}; rizer.actor?.stopPreview(); const m=motion;const ready=()=>{if(motion!==m)return;m.align=false;if(clip)rizer.actor.startPreview(clip,{loop:true,speed:0});};if(Math.hypot(rizer.position.x-from.x,rizer.position.z-from.z)>.12){if(!rizer.walkTo(from,rec.yaw+Math.PI,ready)){motion=null;return false;}}else ready();rizer.vel.set(0,0,0); rizer.vy=0;rizer.speed=0;return true;
  }
  function beginLadderMotion(rec,from,to,ascending,done) {
    const actions=rizer.actor?.acts, climb=actions?.ladderClimb?.getClip?.(), start=actions?.ladderStart?.getClip?.(), top=actions?.ladderTop?.getClip?.();
    if(!start||!climb||!top){toast('Treehouse ladder animations are still loading · try again');return false;}
    const segments=ascending?[{clip:start},{clip:climb,moves:true},{clip:top}]:[{clip:top,reverse:true},{clip:climb,reverse:true,moves:true},{clip:start,reverse:true}];
    motion={kind:'ladder',rec,from,to,segments,index:0,segmentT:0,done,align:true};rizer.actor?.stopPreview();const m=motion;
    const ready=()=>{if(motion!==m)return;m.align=false;rizer.actor.startPreview(segments[0].clip,{loop:false,speed:0});};
    if(Math.hypot(rizer.position.x-from.x,rizer.position.z-from.z)>.12){if(!rizer.walkTo(from,rec.yaw+Math.PI,ready)){motion=null;return false;}}else ready();
    rizer.vel.set(0,0,0);rizer.vy=0;rizer.speed=0;return true;
  }
  function plantSeed() {
    if(rizer.weapon!=='life_seed')return toast('Equip your Life Seed from the Armory wheel first');
    if((inventory.items?.life_seed||0)<1||!inventory.owned.includes('life_seed'))return toast('Find a Life Seed when a tree falls · then equip it in the Armory');
    if(Object.entries(TREEHOUSE.cost).some(([id,n])=>storage.count('ZYCUBE',id)<n))return toast('Treehouse planting needs 10 Fresh Wood, 10 Scrap Metal and 10 Everstone');
    if(motion||blocked()||!rizer.onGround)return false;
    const x=rizer.position.x+Math.sin(rizer.facing)*1.5,z=rizer.position.z+Math.cos(rizer.facing)*1.5,valid=validate(x,z);
    if(!valid.ok){toast(valid.why);return false;}
    const rec={id:'treehouse-'+(globalThis.crypto?.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2)),...valid,growth:0,cabin:'growing',hp:TREEHOUSE.maxHP,maxHP:TREEHOUSE.maxHP,paid:{...TREEHOUSE.cost},furniture:[],defenders:[]};delete rec.ok;
    const standing=rizer.position.clone(),a=rizer.actor?.acts.plantTree;if(!a)return toast('Planting animation is still loading');
    if(beginMotion('plant',rec,standing,standing,a.getClip().duration,()=>{inventory.treehouses.push(rec);restore(rec);persist();toast('Life Seed planted · magical growth begins · 8 seconds');})){
      const spent=storage.consumeResources(TREEHOUSE.cost);if(!spent.ok){motion=null;rizer.actor?.stopPreview();return toast(spent.message);}
      inventory.items.life_seed--;
      if(inventory.items.life_seed<=0){inventory.items.life_seed=0;inventory.owned=inventory.owned.filter(k=>k!=='life_seed');inventory.wheel=inventory.wheel.map(k=>k==='life_seed'?null:k);if(inventory.equipped==='life_seed'){inventory.equipped='fists';rizer.setWeapon('fists');}}
      persist();rizer.facing=rec.yaw+Math.PI;return true;
    }
    return false;
  }
  function dismantle(rec) {
    if(rec.cabin!=='built')return;
    if(activeInterior?.rec===rec)return toast('Exit via the ladder before breaking down your treehouse');
    close();destroy(rec,null,true);
  }
  function dropHalfCost(rec,dx,dz) {
    const paid=rec.paid||TREEHOUSE.cost, offsets=[[-2.6,1.6],[2.5,1.8],[0,-2.2]]; let i=0;
    for(const [id,n] of Object.entries(paid)) { const quantity=Math.floor(n*.5); if(quantity<1)continue; const [ox,oz]=offsets[i++%offsets.length],p=at(rec,ox,oz),y=world.groundAt(p.x,p.z,rec.y+2)+0.9;
      if(dropResource)dropResource(id,quantity,p.x,y,p.z,{x:dx*.65+(Math.random()-.5)*.4,z:dz*.65+(Math.random()-.5)*.4});
      else storage.add('HOME_PC',id,quantity);
    }
    rec.paid=null;
  }
  function crumble(L) {
    const rec=L.rec, fall=rec.fall; if(!fall)return;
    fx?.emit(rec.x,rec.y+.35,rec.z,42,{color:'#a08359',speed:3.5,up:1.8,size:.48,life:1.15,g:1.5});
    fx?.emit(rec.x,rec.y+.5,rec.z,18,{color:'#6c9140',speed:2.4,up:2.4,size:.38,life:1.4,g:.8});
    dropHalfCost(rec,fall.dx,fall.dz);
    L.root.visible=false;for(const group of [L.tree,L.cabin])group.traverse(o=>{if(o.isMesh)world.mass.disableInstance(o,-1);});L.collision=false;
    rec.cabin=fall.dismantle?'dismantled':'destroyed';rec.fall=null;persist();toast('TREEHOUSE CRUMBLED · raw materials dropped nearby');
  }
  function destroy(rec,from=null,dismantleTreehouse=false) { const L=live.get(rec.id);if(!L||['falling','destroyed','dismantled'].includes(rec.cabin))return;const dx=from?rec.x-from.x:Math.sin(rec.yaw),dz=from?rec.z-from.z:Math.cos(rec.yaw),d=Math.hypot(dx,dz)||1;rec.fall={t:0,a:.06,w:.45,dx:dx/d,dz:dz/d,dismantle:dismantleTreehouse};rec.cabin='falling';rec.hp=0;rec.defenders=[];L.shake=0;if(activeInterior?.rec===rec){exit();rizer.position.copy(at(rec,0,5.8));}fx?.emit(rec.x,rec.y+TREEHOUSE.height*.7,rec.z,24,{color:'#d0ad78',speed:2.6,up:1.4,size:.24,life:.65,g:5});persist(); }
  function ascend(rec) { close(); const from=at(rec,0,5.8),to=at(rec,0,4.8,TREEHOUSE.height);from.y=world.groundAt(from.x,from.z,rec.y+1);rizer.facing=rec.yaw+Math.PI;
    beginLadderMotion(rec,from,to,true,()=>{rizer.position.copy(to);rizer.onGround=true;toast('Platform · walk to the door to enter · △ descend');});
  }
  function descend(rec) { const from=at(rec,0,4.8,TREEHOUSE.height),to=at(rec,0,5.8);to.y=world.groundAt(to.x,to.z,rec.y+1);rizer.facing=rec.yaw+Math.PI;beginLadderMotion(rec,from,to,false,()=>{rizer.position.copy(to);rizer.onGround=true;}); }
  function nearest() { let best=null;for(const L of live.values()){const rec=L.rec;if(['falling','destroyed','dismantled'].includes(rec.cabin))continue;const p=at(rec,0,5.8),d=Math.hypot(p.x-rizer.position.x,p.z-rizer.position.z);if(d<3.3&&(!best||d<best.d))best={rec,d};}return best; }
  function interact() {const n=nearest();if(!n)return false;const rec=n.rec;if(rec.cabin==='built'&&Math.abs(rizer.position.y-rec.y-TREEHOUSE.height)<.7){enter(interior(rec));return true;}open(rec);return true;}
  function assign(rec,id) { const used=inventory.treehouses.some(q=>q.id!==rec.id&&q.defenders?.includes(id));if(used)return toast('Already guarding another treehouse');
    if(rec.defenders.includes(id)){rec.defenders=rec.defenders.filter(q=>q!==id);if(rec.guardStates)rec.guardStates[id]='recalled';}else {if(rec.defenders.length>=TREEHOUSE.defenderSlots)return toast('All defender slots are occupied');if(rec.guardHP?.[id]===0)return toast('This defender was defeated · recover it before reassignment');rec.defenders.push(id);onAssign?.(id);} persist();open(rec);
  }
  function close(){if(panel)panel.remove();panel=null;panelRec=null;}
  function open(rec) {close();panelRec=rec;panelIndex=0;panel=document.createElement('section'); panel.style.cssText='position:fixed;z-index:65;left:50%;top:50%;transform:translate(-50%,-50%);width:min(560px,90vw);max-height:85vh;overflow:auto;background:#101d23;color:#eee;border:2px solid #c6a559;border-radius:12px;padding:24px;font:16px system-ui;box-shadow:0 15px 80px #000a';
    const built=rec.cabin==='built';panel.innerHTML=`<h2>Rizer’s Treehouse</h2><p>${rec.growth<8?'Growing · '+Math.round(rec.growth/8*100)+'%':built?'Integrity '+Math.ceil(rec.hp)+' / '+rec.maxHP:'Mature planted tree'}</p><div data-actions></div><p style="font-size:12px">↑ ↓ select · ✕ / Enter choose · ○ / Escape close</p>`;
    const actions=panel.querySelector('[data-actions]');const button=(label,fn)=>{const b=document.createElement('button');b.textContent=label;b.style.cssText='display:block;width:100%;margin:8px 0;padding:12px;background:#203640;color:white;border:1px solid #b29c66;border-radius:5px;text-align:left';b.onclick=fn;actions.append(b);};
    if(built&&!activeInterior)button('Climb ladder',()=>ascend(rec));
    if(built){if(activeInterior)button('Exit via ladder',()=>{close();leaveDoor(activeInterior);});button('Save progress here',()=>{if(!activeInterior)return toast('Enter your treehouse to save here');persist();saveGame();toast('TREEHOUSE · progress saved');});
      if(activeInterior) {for(const id of ['plant','coffee','lamp1','sofa','bed'])button('Place '+(home.furn.byId(id)?.name||id),()=>{const I=interior(rec);if(I.addFurniture(id))toast('Furniture placed · R lock · □ / J move · use management to rotate');});
        for(const p of interior(rec).furn.pieces)button('Rotate '+p.name,()=>{const old=p.yaw;p.yaw+=Math.PI/2;if(!interior(rec).furn.check(p,p.dx,p.dz).ok){p.yaw=old;return toast('Keep the exit and other furniture clear');}interior(rec).furn.apply(p,p.dx,p.dz);interior(rec).furn.save();open(rec);}); }
      for(const a of inventory.bondedZyrex||[])button((rec.defenders.includes(a.id)?'Recall ':'Assign defender · ')+a.name+(rec.guardStates?.[a.id]?' · '+rec.guardStates[a.id]:''),()=>assign(rec,a.id));
      button('Remove treehouse',()=>{actions.replaceChildren();button('Confirm removal',()=>{if(activeInterior)return toast('Exit via the ladder before removing your treehouse');dismantle(rec);});button('Cancel',()=>open(rec));});
    }button('Close',close);document.body.append(panel);select(0);document.exitPointerLock?.(); }
  function select(n){const bs=[...panel?.querySelectorAll('button')||[]];if(!bs.length)return;panelIndex=(n+bs.length)%bs.length;bs.forEach((b,i)=>b.style.background=i===panelIndex?'#466579':'#203640');}
  function pad(p){if(!panel)return;if(p.edge(12))select(panelIndex-1);if(p.edge(13))select(panelIndex+1);if(p.edge(0))panel.querySelectorAll('button')[panelIndex]?.click();if(p.edge(1))close();}
  addEventListener('keydown',e=>{if(!panel)return;if(e.code==='Escape'){close();e.preventDefault();}if(e.code==='ArrowUp'){select(panelIndex-1);e.preventDefault();}if(e.code==='ArrowDown'){select(panelIndex+1);e.preventDefault();}if(e.code==='Enter'){panel.querySelectorAll('button')[panelIndex]?.click();e.preventDefault();}});
  function interior(rec) {
    const L=live.get(rec.id);if(L.interior)return L.interior;
    const root=new THREE.Group();root.visible=false;scene.add(root);const hw=3.55,hd=2.65;
    box(root,hw*2,.15,hd*2,0,-.075,0);box(root,.15,4.4,hd*2,-hw,2.2,0);box(root,.15,4.4,hd*2,hw,2.2,0);box(root,hw*2,4.4,.15,0,2.2,-hd);box(root,hw*2,.12,hd*2,0,4.4,0);
    box(root,hw-1,4.4,.15,-(hw+1)/2,2.2,hd);box(root,hw-1,4.4,.15,(hw+1)/2,2.2,hd);box(root,2,1.5,.15,0,3.65,hd);
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
  function damage(rec,amount,hitKey=null,from=null) { if(rec.cabin!=='built'||!(amount>0))return false;const L=live.get(rec.id);if(hitKey&&L.hitKeys.has(hitKey))return false;if(hitKey){L.hitKeys.add(hitKey);if(L.hitKeys.size>48)L.hitKeys.clear();}rec.hp=Math.max(0,rec.hp-amount);const ratio=1-rec.hp/rec.maxHP,tint=new THREE.Color('#332b25');L.root.traverse(o=>{if(o.isMesh&&o.userData.baseColor)o.material.color.copy(o.userData.baseColor).lerp(tint,ratio<.34?0:ratio<.68?.3:.58);});const dx=from?rec.x-from.x:Math.sin(rec.yaw),dz=from?rec.z-from.z:Math.cos(rec.yaw),d=Math.hypot(dx,dz)||1;L.hitSide={x:dx/d,z:dz/d};L.lean=ratio*.07;L.shake=.24;persist();fx?.emit(rec.x,rec.y+3,rec.z,8,{color:'#bba17c',speed:1.8,up:.6,size:.18,life:.5});fx?.emit(rec.x,rec.y+1.1,rec.z,7,{color:'#d3b37e',speed:2,up:.8,size:.14,life:.42,g:5});if(!rec.hp)destroy(rec,from);return true; }
  const hitRay=new THREE.Raycaster(),hitDir=new THREE.Vector3();
  function strike(segment,amount,hitKey) { if(!segment?.a||!segment?.b)return 0;hitDir.subVectors(segment.b,segment.a);const len=hitDir.length();if(len<1e-4)return 0;hitDir.multiplyScalar(1/len);hitRay.set(segment.a,hitDir);hitRay.near=0;hitRay.far=len;for(const L of live.values()){const rec=L.rec;if(rec.cabin!=='built')continue;L.root.updateWorldMatrix(true,true);if(hitRay.intersectObjects([L.tree,L.cabin],true).length&&damage(rec,amount,hitKey,segment.pa||segment.a))return 1;}return 0; }
  function attackTarget(g,r) {
    if(!foes.alive(g)||g.held||g.stormHeld||r.position.distanceTo(g.pos)<8)return null;
    let nearest=null,dist=14;
    for(const L of live.values())if(L.rec.cabin==='built'){const d=Math.hypot(g.pos.x-L.rec.x,g.pos.z-L.rec.z);if(d<dist&&Math.abs(g.pos.y-L.rec.y)<2){dist=d;nearest=L;}}
    if(!nearest)return null;const L=nearest,rec=L.rec;
    for(const [id,q] of L.guards)if((rec.guardHP?.[id]??100)>0&&q.pos.distanceTo(g.pos)<5)return {pos:q.pos,reach:2,hit:()=>{rec.guardHP ||= {};rec.guardHP[id]=Math.max(0,(rec.guardHP[id]??100)-10);q.s?.root?.userData && (q.s.root.userData.treehouseGuard=true);rec.guardStates ||= {};if(!rec.guardHP[id]){rec.guardStates[id]='defeated';q.setVisible(false);}persist();}};
    const pos=at(rec,g.pos.x>rec.x?1.4:-1.4,.7);
    return {pos,reach:2.1,hit:()=>damage(rec,8,`enemy-${g.id||g.pos.x.toFixed(2)}-${performance.now().toFixed(0)}`,g.pos)};
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
    for(const L of live.values()){const rec=L.rec;if(rec.cabin==='falling'&&rec.fall){const f=rec.fall;f.t+=dt;f.w+=(3.4*Math.sin(Math.max(.08,f.a))+.6)*dt;f.a=Math.min(Math.PI/2,f.a+f.w*dt);const yaw=rec.yaw,localX=f.dx*Math.cos(yaw)-f.dz*Math.sin(yaw),localZ=f.dx*Math.sin(yaw)+f.dz*Math.cos(yaw);L.root.rotation.set(localZ*f.a,yaw,-localX*f.a);if(f.a>=Math.PI/2||f.t>3)crumble(L);continue;}if(L.shake>0){L.shake=Math.max(0,L.shake-dt);const k=L.shake/.24,w=(L.lean||0)+Math.sin((.24-L.shake)*48)*.028*k,side=L.hitSide,localX=side.x*Math.cos(rec.yaw)-side.z*Math.sin(rec.yaw),localZ=side.x*Math.sin(rec.yaw)+side.z*Math.cos(rec.yaw);L.root.rotation.set(localZ*w,rec.yaw,-localX*w);}else if(rec.cabin==='built'){const side=L.hitSide;L.root.rotation.set(side.z*(L.lean||0),rec.yaw,-side.x*(L.lean||0));}if(rec.growth<8){rec.growth=Math.min(8,rec.growth+dt);const u=Math.max(.015,rec.growth/8),s=u*u*(3-2*u);L.tree.scale.setScalar(s);L.cabin.visible=true;L.cabin.scale.setScalar(s);if(rec.growth===8){L.tree.scale.setScalar(1);L.cabin.scale.setScalar(1);L.root.updateMatrixWorld(true);world.addMesh(L.tree);rec.cabin='built';enableCabin(L);persist();toast('TREEHOUSE GROWN · climb the ladder to enter');}}
      if(outdoors)guards(L,dt,t);
    }
    if(motion){const m=motion;if(rizer.hp<=0){rizer.actor?.stopPreview();motion=null;return;}if(m.align){if(!rizer.auto){motion=null;toast('Could not reach the planting / ladder position');}return;}if(m.segments){const seg=m.segments[m.index];m.segmentT+=dt;const dur=Math.max(.05,seg.clip.duration||.6),u=Math.min(1,m.segmentT/dur);if(seg.moves)rizer.position.copy(m.from).lerp(m.to,u);if(rizer.actor.preview)rizer.actor.preview.t=(seg.reverse?1-u:u)*(seg.clip.duration-.001);rizer.actor?.update(0,0,false);if(u>=1){m.index++;m.segmentT=0;if(m.index>=m.segments.length){rizer.position.copy(m.to);rizer.actor?.stopPreview();motion=null;m.done();}else rizer.actor.startPreview(m.segments[m.index].clip,{loop:false,speed:0});}}
      else {m.t+=dt;const u=Math.min(1,m.t/m.duration);rizer.position.copy(m.from).lerp(m.to,u);if(m.clip&&rizer.actor.preview)rizer.actor.preview.t=u*(m.clip.duration-.001);rizer.actor?.update(0,0,false);if(u===1){rizer.actor?.stopPreview();motion=null;m.done();}}
      rizer.vel.set(0,0,0);rizer.vy=rizer.speed=0;rizer.body.root.rotation.y=rizer.facing;cam.snapBehind(rizer,3.6);}
    if(!motion&&!panel&&outdoors){const n=nearest();if(n)prompt('RIZER’S TREEHOUSE',n.rec.growth<8?'Magical growth · '+Math.round(n.rec.growth/8*100)+'%':n.rec.cabin==='built'?'○ / E manage or climb ladder · △ descend':'Planted tree');}
  }
  return {start,cancel,plantSeed,interact,nearest,ascend,descend,open,close,pad,update,interior,attackTarget,damage,strike,get placing(){return placing;},get busy(){return !!motion;},get isOpen(){return !!panel;},get activeInterior(){return activeInterior;},get live(){return live;},save:persist};
}
