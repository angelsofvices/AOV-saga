import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const CLIP_ORDER = ['idle','walk','run','turn_left','turn_right','attack_01','attack_02','hit_reaction','defeat','rest'];

// Drag a rigged GLB anywhere over RP7D. The imported creature is a live world
// entity with its own AnimationMixer and a small animation switcher for playtests.
export function createZyrexImporter({ scene, world, player, toast, isHome = () => false }) {
  let entity = null, panel = null, dropDepth = 0;
  const loader = new GLTFLoader();

  function panelFor(clips) {
    panel?.remove();
    panel=document.createElement('section'); panel.className='zyrex-import-panel'; panel.setAttribute('aria-label','Imported Zyrex playtest controls');
    const top=document.createElement('header');top.innerHTML='<b>ZYREX · ELZEBUB</b><button type="button" aria-label="Remove Elzebub">×</button>';panel.appendChild(top);
    top.querySelector('button').addEventListener('click',()=>remove());
    const row=document.createElement('div');row.className='zyrex-clip-buttons';
    const names=[...CLIP_ORDER.filter(n=>clips.has(n)),...([...clips.keys()].filter(n=>!CLIP_ORDER.includes(n)))];
    for(const name of names){const b=document.createElement('button');b.type='button';b.textContent=name.replaceAll('_',' ');b.addEventListener('click',()=>play(name));row.appendChild(b);}
    panel.appendChild(row);document.getElementById('game')?.appendChild(panel);
  }
  function play(name, automatic=false) {
    if(!entity) return;
    const next=entity.actions.get(name); if(!next) return;
    if(entity.active && entity.active!==next) entity.active.fadeOut(.18);
    next.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(.18);
    const looping=['idle','walk','run','turn_left','turn_right','rest'].includes(name);
    next.setLoop(looping?THREE.LoopRepeat:THREE.LoopOnce,looping?Infinity:1); next.clampWhenFinished=!looping; next.play();
    entity.active=next; entity.clip=name;
    entity.idleFor=0;entity.walkFor=automatic&&name==='walk'?3:Infinity;
    panel?.querySelectorAll('.zyrex-clip-buttons button').forEach(b=>b.classList.toggle('active',b.textContent===name.replaceAll('_',' ')));
  }
  function remove() {
    if(!entity)return;
    scene.remove(entity.root); entity.mixer.stopAllAction();
    entity.root.traverse(o=>{if(o.isMesh){o.geometry?.dispose(); if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material?.dispose();}});
    entity=null;panel?.remove();panel=null;toast('ELZEBUB REMOVED');
  }
  async function importFile(file) {
    if(!/elzebub.*\.glb$/i.test(file.name)) {toast('ASSET REJECTED · drop the Elzebub .glb file');return;}
    try {
      const data=await file.arrayBuffer();
      if(data.byteLength<20 || new DataView(data).getUint32(0,true)!==0x46546c67 || new DataView(data).getUint32(4,true)!==2) throw new Error('File is not a GLB 2.0 asset');
      const gltf=await new Promise((resolve,reject)=>loader.parse(data,'',resolve,reject));
      let skinned=0, meshes=0;
      gltf.scene.traverse(o=>{if(o.isMesh){meshes++;if(o.isSkinnedMesh&&o.skeleton?.bones?.length)skinned++;o.castShadow=true;o.receiveShadow=true;}});
      if(!meshes)throw new Error('GLB contains no mesh geometry');
      if(!skinned)throw new Error('GLB has no skinned mesh or skeleton');
      if(!gltf.animations?.length)throw new Error('GLB contains no animation clips');
      remove();
      const root=new THREE.Group();root.name='Elzebub_NPC';root.add(gltf.scene);
      // GLB forward is -Z after Blender's +Y → glTF -Z conversion. RP7D actors face +Z.
      root.rotation.y=Math.PI;
      const f=player.facing||0,dist=4.4;
      let x=player.position.x+Math.sin(f)*dist,z=player.position.z+Math.cos(f)*dist;
      let y=isHome()?player.position.y:world.groundAt(x,z,player.position.y+1);
      if(!isHome()){
        let found=false;
        for(let i=0;i<16;i++){
          const a=i*2.39996,r=2+Math.floor(i/4)*1.8,tx=player.position.x+Math.sin(f)*dist+Math.cos(a)*r,tz=player.position.z+Math.cos(f)*dist+Math.sin(a)*r,ty=world.groundAt(tx,tz,player.position.y+1);
          if((world.containsLand&&!world.containsLand(tx,tz))||world.waterAt(tx,tz)>world.heightAt(tx,tz)-.15||world.resolve(new THREE.Vector3(tx,ty,tz),1.2))continue;
          x=tx;z=tz;y=ty;found=true;break;
        }
        if(!found)throw new Error('No clear dry terrain near the player');
      }
      root.position.set(x,y,z);root.scale.setScalar(1.0);scene.add(root);
      const mixer=new THREE.AnimationMixer(gltf.scene), actions=new Map();
      for(const clip of gltf.animations)actions.set(clip.name,mixer.clipAction(clip));
      entity={root,mixer,actions,active:null,clip:null,idleFor:0,walkFor:0};
      panelFor(actions);play(actions.has('idle')?'idle':actions.keys().next().value);
      toast(`ELZEBUB SPAWNED · ${meshes} mesh · ${skinned} rig · ${actions.size} clips`);
      console.info('[rp7d] imported Zyrex', {file:file.name,meshes,skinned,clips:[...actions.keys()]});
    } catch(error) { console.error('[rp7d] Zyrex import failed',error);toast(`ASSET ERROR · ${error.message||error}`); }
  }
  addEventListener('dragenter',e=>{if([...e.dataTransfer?.items||[]].some(i=>i.kind==='file'&&/elzebub.*\.glb$/i.test(i.getAsFile()?.name||''))){dropDepth++;document.body.classList.add('zyrex-drop');}},true);
  addEventListener('dragover',e=>{if(document.body.classList.contains('zyrex-drop')){e.preventDefault();e.dataTransfer.dropEffect='copy';}},true);
  addEventListener('dragleave',e=>{if(document.body.classList.contains('zyrex-drop')&&--dropDepth<=0){dropDepth=0;document.body.classList.remove('zyrex-drop');}},true);
  addEventListener('drop',e=>{
    document.body.classList.remove('zyrex-drop');dropDepth=0;
    const file=[...(e.dataTransfer?.files||[])].find(f=>/elzebub.*\.glb$/i.test(f.name));
    if(!file)return;
    e.preventDefault();e.stopImmediatePropagation();document.body.classList.remove('lab-drop');importFile(file);
  },true);
  return {
    update(dt,time){if(!entity)return;entity.mixer.update(dt);
      // Gentle local wandering demonstrates movement without taking over player control.
      if(entity.clip==='idle'){entity.idleFor+=dt;if(entity.idleFor>5)play('walk',true);}
      if(entity.clip==='walk'||entity.clip==='run'){
        const pace=entity.clip==='run'?.72:.32;
        entity.root.position.x+=Math.sin(time*.33)*dt*pace;entity.root.position.z+=Math.cos(time*.33)*dt*pace;entity.walkFor-=dt;
        if(entity.walkFor<=0)play('idle',true);
      }
    },
    dispose:remove,
    get current(){return entity;}
  };
}
