// Malezor's named cast: shared Rizer-quality low-poly rig, retained character
// palettes, authored lore dialogue, and canon RP7B placements.
import * as THREE from 'three';
import { Actor, loadGLB } from './actor.js';
import { fromRP7B } from './world-data.js';
import { applyHumanoidMorphology } from './morphology.js';

// Persistent identity data is separate from palette, culture and current home.
// Rizer's body is the 1:1 standard; named NPCs stay deterministic between loads.
const NPC_MORPHOLOGY = Object.freeze({
  dad:{body:'powerful',posture:'guard'}, kelthor:{body:'elder',posture:'elder'}, elarion:{body:'heavy',posture:'scholar'},
  vireta:{body:'lanky',posture:'scholar'}, scrapjaw:{body:'athletic',posture:'hunter'}, zurelea:{body:'lean',posture:'scholar'},
  rein:{body:'lean',posture:'scholar'}, kaizari:{body:'athletic',posture:'hunter'}, albert:{body:'heavy',posture:'rizer'},
  zoryn:{body:'athletic',posture:'rizer'}, noot:{body:'youth',posture:'rizer'}, corvan:{body:'lean',posture:'scholar'},
  serel:{body:'standard',posture:'scholar'}, kaelith:{body:'lean',posture:'hunter'}, yuma:{body:'standard',posture:'hunter'},
  adventurer:{body:'athletic',posture:'hunter'}, barmaid:{body:'standard',posture:'rizer'}, ranger:{body:'athletic',posture:'hunter'},
  maid:{body:'lean',posture:'rizer'}, knight:{body:'powerful',posture:'guard'}, auraxion:{body:'athletic',posture:'guard'},
  rustbyte:{body:'compact',posture:'guard'}, elzoran:{body:'powerful',posture:'elder'}
});

const cast = [
  ['dad','Dad',22,41,1.05,'#68442f','#201812','#e7e2d7','#27252a','#63452f','human',[
    '*leans over the scope without looking up* Busy morning, kid.',
    'Go see your mother before you do anything else. She has been holding something for me all morning.',
    'Your mother sent you all this way to hand me a book I left behind on purpose.',
    'Keep it. I have walked every field in that book twice. It is finished. I am not.'
  ]],
  ['kelthor','Warden Kelthor',22,82,1.05,'#d0a47d','#e6e2d7','#183d72','#183d72','#513a2d','elder',[
    '*looks you over once, not unkindly* Beastmaster path, is it. Your father’s road.',
    'I take students, not visitors. The Academy registers a Rizer before I can enrol one.',
    'Get your R.A.I.D. from Professor Elarion. Bring it back, and we begin.',
    'First thing a beastmaster learns is that the animal eats before he does.'
  ]],
  ['elarion','Elarion',27,128,1.1,'#858783','#2e2928','#315b3c','#5c432e','#554033','elephant',[
    '*peers over his spectacles* Come back with your sister, Rizer.',
    'A Rizer’s first ID is a family occasion. Bring Yara from your home · then we can begin.',
    '*produces a shimmering silver card* Your R.A.I.D. — Rizer Academy Identification. Every student carries one.',
    'The Academy holds the oldest bond-lore in Zyraxis · come by when the doors open.'
  ]],
  ['vireta','Assistant Professor Vireta',29,129,1.25,'#d0a17a','#5a352b','#70518a','#eee5dc','#9b7541','giraffe',[
    '*looks up, and keeps looking up — she is a good deal taller than the desk*',
    'A sphere does not catch anything, Rizer. It holds the moment a Zyrex decides. Your bond makes the moment; the sphere only remembers it.',
    'Kaizari sat where you are standing. She still writes.'
  ]],
  ['scrapjaw','Scrapjaw',16,58,1,'#ad8059','#382819','#49513b','#5b442c','#443323','hyena',[
    'My crew spent nine years failing at what you did in one run.',
    'Bring back the tower remotes and I’ll bring each district online. I can slot a Phone Battery into your ZyCellite, too.',
    'Whatever you need, wherever you stand — you call, I answer.'
  ]],
  ['zurelea','Zurelea',11,140,1,'#8751a5','#532564','#512c77','#f1e5e6','#b58a4b','octopus',[
    'Welcome to the Malezor Potion Shop. I would love to sell you something. I can’t.',
    'Tempered glass. Nothing else holds a volatile brew without cracking halfway through the boil.',
    'You found the Ruby Vial — my mother’s, before the Seers took the shop apart.'
  ]],
  ['rein','Nurse Rein',22,158,0.95,'#c99a76','#593f32','#315e45','#eee5d6','#5e4938','deer',[
    'Welcome, dear Rizer! Come here — let me look at those wounds.',
    'There. Every hit patched, every Zyrex ready.',
    'Dial me anywhere — once every ten minutes I can bring a full heal to your tile.'
  ]],
  ['kaizari','Kaizari',35,140,1,'#d29b45','#d4a24e','#304c38','#27332b','#6f4d31','cheetah',[
    '*tail flicks, claws out* A Rizer with no net? That is not hunting — that is asking.',
    'Take mine. Feet quiet, breath quieter. That’s how you catch a fae.',
    '*unlocks the wooden gate* You’ve earned this, hunter.'
  ]],
  ['albert','Albert Orren',11,82,1.15,'#83593d','#39291e','#28533d','#19314a','#513a2d','bear',[
    '*grumbles* Ah, the Rizer kid. Been meaning to say hello.',
    'Watch yourself past the town hall — Seer Grunts move fast for boots that big.',
    '*belly laugh* Ten clean dodges under a Grunt’s nose. That’s the old rhythm right there.'
  ]],
  ['zoryn','Zoryn',22,14,1,'#925c43','#a01f26','#261d24','#8b2028','#42302c','rival',[
    '*folds his arms, half a grin* What’d you — forget your map again?',
    'It’s day one, Rizer. DAY ONE.',
    '*eyes the cave mouth* You feel that? Ancient Astralite hums out here.'
  ]],
  ['noot','Noot',32,98,0.8,'#9b6443','#332518','#bd392d','#315d95','#49362b','kid',[
    '*spins a wrench on one finger and misses the catch* Okay, okay, okay — check it.',
    '*quiet* I lost my raygun. My GOOD one. Somewhere out by your treehouse.',
    '*a beat* ...you really do not remember that day either, do you?'
  ]],
  ['corvan','Corvan',29,74,1.05,'#b28062','#252126','#59585c','#563b55','#403631','beard',[
    'We are waiting for our boy. He was last seen far from Malezor.',
    'The road to Andrannor is long. If you find him, please bring him home to Serel and me.'
  ]],
  ['serel','Serel',30,74,0.95,'#d5ad91','#282128','#554355','#72616c','#473c37','human',[
    'Every day I listen for his footsteps.',
    'Our son is in Andrannor. Please tell him we are still waiting.'
  ]],
  ['kaelith','Kaelith',58,103,0.95,'#d09a76','#69442e','#416b6d','#354a64','#583f30','human',[
    '*startles, then laughs* Rizer! I thought you were a Mori.',
    'My Aetherwing maps better than I do — we’re charting the wild arm, tile by tile.'
  ]],
  ['yuma','Yuma',93,103,0.95,'#ba8866','#4b352a','#465653','#34454d','#504236','human',[
    'I’ve been looking at this road for about an hour. It just keeps going.',
    'Don’t tell Kaelith how long it took me.'
  ]],
  ['adventurer','Adventurer',22,39,1,'#d2a27d','#493324','#8f342b','#733a2b','#42312a','human',[
    'Every road out of here goes somewhere worse. I keep walking anyway.'
  ]],
  ['barmaid','Barmaid',21,79,0.95,'#e0b08c','#75432b','#a13b39','#f0e2d2','#634432','human',[
    'You look like you have been sleeping in grass. Sit down, I will fetch something.'
  ]],
  ['ranger','Ranger',23,157,1,'#bd8a67','#272124','#465d3c','#4a3829','#3a3027','human',[
    'The wild ones moved their trails again this season. Something is pushing them.'
  ]],
  ['maid','Maid',6,91,0.95,'#e3bd9c','#d8bd92','#243449','#ede5d8','#49372e','human',[
    'Mind the step. I have only just done that floor.'
  ]],
  ['knight','Knight',32,99,1.05,'#d1a27f','#2b2927','#33465e','#a8b4bd','#4a392f','knight',[
    'I swore an oath to this district. Nobody has released me from it yet.'
  ]],
  ['auraxion','Auraxion',15,180,1.1,'#c7a47e','#16171a','#e8e4d9','#e4c14e','#e2c157','helmet',[
    'I read the astral currents. You walk a bright path, Rizer.',
    '*gestures at his silent craft* My Aetherstride is cold. Its flight matrix drained its last core cycles ago.',
    'Bring the Astralcore back. She will lift you above every district.'
  ]],
  ['rustbyte','Rustbyte',17,180,0.7,'#6a655c','#554b3a','#62584b','#9b8873','#78634b','robot',[
    '*whirrr* ...system nominal. Bleep.'
  ]],
  ['elzoran','Elzoran',5,28,1.25,'#41779d','#d7dce1','#2f7697','#2f4c69','#c29b55','dragon',[
    '*a low growl softens; smoke drifts from his nostrils* Greetings, young one. How nice of you to visit.',
    'Few climb this far to sit with an old fire in his mourning.',
    'Novarius fell, but the line survived. You carry it back to me — after all these cycles at the statue.'
  ]]
];

const makeMat = color => new THREE.MeshStandardMaterial({ color, roughness: 0.72, flatShading: true });
const RIZER_PALETTE_KEYS = ['R_skin','R_hair','R_cloth','R_navy','R_gold','R_leather','R_boot','R_gem','R_eye','R_lip'];

function adorn(actor, type, palette) {
  const model = actor.model, head = model.getObjectByName('mixamorigHead') || model;
  const add = (g, parent = model) => { g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); parent.add(g); return g; };
  const sphere = (parent, color, x, y, z, sx, sy, sz, r = 0.12) => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), makeMat(color)); m.position.set(x,y,z); m.scale.set(sx,sy,sz); parent.add(m); return m; };
  if (type === 'elephant') {
    for (const side of [-1,1]) { sphere(head,'#777b78',side*0.23,0.03,0,1.3,1.45,0.38,0.23); const tusk=new THREE.Mesh(new THREE.ConeGeometry(0.055,0.34,6),makeMat('#eadfc7')); tusk.position.set(side*0.11,-0.13,0.15); tusk.rotation.x=Math.PI; head.add(tusk); }
    const trunk=new THREE.Mesh(new THREE.CapsuleGeometry(0.075,0.42,4,8),makeMat('#777b78')); trunk.position.set(0,-0.2,0.2); trunk.rotation.x=-0.28; head.add(trunk);
  } else if (type === 'giraffe') {
    for(const side of [-1,1]) { const horn=new THREE.Mesh(new THREE.CylinderGeometry(0.045,0.07,0.24,6),makeMat('#b98942')); horn.position.set(side*0.13,0.21,0); head.add(horn); sphere(head,'#d9ae58',side*0.13,0.34,0,0.65,0.65,0.65,0.075); sphere(head,'#d9ae58',side*0.24,0.04,0,1.5,1,0.35,0.18); }
  } else if (['deer','cheetah','hyena','bear'].includes(type)) {
    const hue=type==='bear'?'#765438':type==='deer'?'#a9774f':type==='cheetah'?'#bd8c3e':'#8b6543';
    for(const side of [-1,1]) { const ear=new THREE.Mesh(new THREE.ConeGeometry(0.13,0.33,6),makeMat(hue)); ear.position.set(side*0.2,0.17,0); ear.rotation.z=side*-0.32; head.add(ear); }
    if(type==='deer') for(const side of [-1,1]) { const ant=new THREE.Group(); ant.position.set(side*0.12,0.27,0); const stem=new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.03,0.42,5),makeMat('#6c4931')); stem.position.y=0.2; ant.add(stem); for(const x of [-1,1]) { const twig=new THREE.Mesh(new THREE.CylinderGeometry(0.013,0.022,0.22,5),makeMat('#6c4931')); twig.position.set(x*0.08,0.31,0); twig.rotation.z=x*0.45; ant.add(twig); } head.add(ant); }
    if(type==='hyena'||type==='cheetah') sphere(head,hue,0,-0.1,0.16,1.2,0.82,1.0,0.17);
  } else if (type==='octopus') {
    for(let i=0;i<8;i++){const a=i*Math.PI/4, x=Math.cos(a)*0.25, z=Math.sin(a)*0.25; const tent=new THREE.Mesh(new THREE.CapsuleGeometry(0.065,0.48,3,6),makeMat('#70428b')); tent.position.set(x,0.14,z); tent.rotation.z=Math.cos(a)*0.42; tent.rotation.x=Math.sin(a)*0.32; model.add(tent);}
  } else if (type==='helmet') {
    const visor=new THREE.Mesh(new THREE.SphereGeometry(0.28,12,8,0,Math.PI*2,0,Math.PI*0.55),new THREE.MeshStandardMaterial({color:'#111722',metalness:0.7,roughness:0.19,emissive:'#291b12',emissiveIntensity:0.5})); visor.position.set(0,0.02,0.14); head.add(visor); sphere(model,'#e2c157',0,1.42,0.13,1.5,1.5,0.6,0.22);
  } else if(type==='robot') {
    const body=new THREE.Mesh(new THREE.BoxGeometry(0.58,0.55,0.42),makeMat('#706353')); body.position.set(0,1.15,0); model.add(body);
    const eye=new THREE.Mesh(new THREE.SphereGeometry(0.11,10,8),new THREE.MeshStandardMaterial({color:'#ff9a38',emissive:'#ff621c',emissiveIntensity:2})); eye.position.set(0,1.2,0.23); model.add(eye);
  } else if(type==='dragon') {
    for(const side of [-1,1]) {const horn=new THREE.Mesh(new THREE.ConeGeometry(0.085,0.48,5),makeMat('#d1c8b8')); horn.position.set(side*0.18,0.25,-0.02); horn.rotation.z=side*0.35; head.add(horn);}
  } else if(type==='rival') {
    // Zoryn's narrow crimson crest and white chest stone distinguish his silhouette
    // while the shared humanoid skeleton keeps every Rizer-compatible clip usable.
    sphere(head,'#301b1f',0,0.17,-0.02,1.65,0.58,1.2,0.16);
    for(let k=-2;k<=2;k++){
      const spike=new THREE.Mesh(new THREE.ConeGeometry(0.095,0.34+0.065*(2-Math.abs(k)),5),makeMat(k%2?'#a81324':'#d51e2d'));
      spike.position.set(0,0.42+0.025*(2-Math.abs(k)),k*0.095); spike.rotation.x=-0.14; head.add(spike);
    }
    const chest=model.getObjectByName('mixamorigSpine2')||model;
    sphere(chest,'#f7f5ff',0,0.07,0.2,0.75,1,0.38,0.12);
  }
  if (type==='elder') { sphere(head,'#e7e2d7',0,0.02,-0.15,1.2,1.4,1,0.23); }
}

export async function createNPCs(scene, world, { ids = ['zoryn'], progress = {}, loot = null, commonChests = null, fx = null, onDown = null } = {}) {
  const gltf = await loadGLB('./assets/rizer/rizer.glb');
  const npcs = [];
  for (const [id,name,tx,ty,height,skin,hair,cloth,navy,leather,feature,lines] of cast) {
    if (!ids.includes(id)) continue;
    const {x,z}=fromRP7B(tx,ty), pos=new THREE.Vector3(x,world.groundAt(x,z),z), root=new THREE.Group();
    root.position.copy(pos); scene.add(root);
    const actor=new Actor(gltf,id==='zoryn'?1.04:height,'rizer');
    await actor.ready;
    applyHumanoidMorphology(actor,{ id, quality:'persistent', biology:feature, culture:'malezor', occupation:name, ...(NPC_MORPHOLOGY[id] || {body:'standard',posture:'rizer'}) });
    actor.model.traverse(o=>{
      if(!o.isMesh||!o.material) return;
      const paint=m=>{const q=m.clone(); const n=m.name||''; if(n==='R_skin')q.color.set(skin); else if(n==='R_hair'){q.color.set(hair);if(id==='zoryn')q.visible=false;} else if(n==='R_cloth')q.color.set(cloth); else if(n==='R_navy')q.color.set(navy); else if(n==='R_leather')q.color.set(leather); else if(id==='zoryn'&&n==='R_gem'){q.color.set('#fff8e8');q.emissive.set('#fff3d2');q.emissiveIntensity=0.65;} else if(id==='zoryn'&&n==='R_eye')q.color.set('#9b0e1b'); return q;};
      o.material=Array.isArray(o.material)?o.material.map(paint):paint(o.material);
    });
    root.add(actor.pivot); adorn(actor,feature,{skin,hair,cloth,navy,leather});
    actor.update(0,0,true);
    const npc={id:'npc-'+id,name,kind:'npc',role:id==='zoryn'?'hero':'civilian',x,z,cx:x,cz:z,reach:4.8,discover:false,note:lines[0],lines,index:0,root,actor,homeY:pos.y,face:Math.PI,
      maxHealth:id==='zoryn'?115:100,health:id==='zoryn'?(progress.health ?? 115):100,met:id==='zoryn'&&!!progress.met,recruited:id==='zoryn'&&!!progress.recruited,
      downed:id==='zoryn'&&!!progress.downed,wasRecruited:!!progress.recruited,aiState:'idle',attackCooldown:0,lootCooldown:0,
      astralProfile:{color:'#f7f6ff'},seenAttacks:new WeakSet(),lootTarget:null};
    if (npc.downed) { npc.health=0; actor.play('knockdown',1,{hold:true}); }
    root.rotation.y=npc.face; npcs.push(npc); world.interactables.push(npc);
  }
  return {
    npcs,
    update(dt,rizer,seers){
      for(const n of npcs){
        if(n.downed){n.actor.update(dt,0,true);continue;}
        let destination=null, running=false, enemyTarget=null;
        if(n.recruited){
          const threats=(seers?.grunts||[]).filter(g=>seers.alive(g)&&!['patrol','return','wait','observe','dance'].includes(g.state)&&Math.hypot(g.pos.x-n.x,g.pos.z-n.z)<16);
          for(const g of threats) if(g.state==='attack'&&g.atk&&!n.seenAttacks.has(g.atk)&&g.atk.t>0.15&&Math.hypot(g.pos.x-n.x,g.pos.z-n.z)<2.25&&Math.abs(g.pos.y-n.root.position.y)<1.8){
            n.seenAttacks.add(g.atk); const damage=g.T[g.atk.kind]?.damage||4;
            n.health=Math.max(0,n.health-damage);
            if(n.health<=0){n.wasRecruited=n.recruited;n.downed=true;n.recruited=false;n.aiState='downed';n.actor.play('knockdown',1,{hold:true});onDown?.(n);break;}
            n.actor.play('hurt',1);
          }
          if(n.downed){n.actor.update(dt,0,true);continue;}
          enemyTarget=threats.sort((a,b)=>Math.hypot(a.pos.x-n.x,a.pos.z-n.z)-Math.hypot(b.pos.x-n.x,b.pos.z-n.z))[0];
          if(enemyTarget){n.aiState='combat';destination=enemyTarget.pos;running=true;}
          else {
            n.aiState='follow'; const d=Math.hypot(rizer.position.x-n.x,rizer.position.z-n.z);
            if(d>3.1){destination=rizer.position;running=d>7;}
            else n.aiState='idle';
            // Zoryn notices nearby silver chests when there is no immediate threat.
            if(n.lootTarget?.state==='waiting'&&Math.hypot(n.lootTarget.chest.position.x-n.x,n.lootTarget.chest.position.z-n.z)<3){n.lootTarget.take();n.lootTarget=null;n.lootCooldown=18;}
            if(n.lootTarget?.state==='empty') n.lootTarget=null;
            if(n.lootTarget){n.aiState='loot';destination=n.lootTarget.chest.position;}
            if(!n.lootTarget&&d<7&&n.lootCooldown<=0){
              const c=(loot?.all||[]).find(q=>!q.ride&&q.state==='closed'&&Math.hypot(q.chest.position.x-n.x,q.chest.position.z-n.z)<7);
              if(c){n.aiState='loot';destination=c.chest.position;if(Math.hypot(c.chest.position.x-n.x,c.chest.position.z-n.z)<2.2){c.open();n.lootTarget=c;destination=null;n.aiState='follow';}}
              const ch=!c&&(commonChests?.chests||[]).find(q=>q.state==='closed'&&Math.hypot(q.C.root.position.x-n.x,q.C.root.position.z-n.z)<7);
              if(ch){n.aiState='loot';destination=ch.C.root.position;if(Math.hypot(ch.C.root.position.x-n.x,ch.C.root.position.z-n.z)<2.2){commonChests.open(ch);n.lootCooldown=18;destination=null;n.aiState='follow';}}
            }
          }
        } else n.aiState='idle';
        n.attackCooldown=Math.max(0,n.attackCooldown-dt); n.lootCooldown=Math.max(0,n.lootCooldown-dt);
        let speed=0;
        if(destination){const dx=destination.x-n.x,dz=destination.z-n.z,d=Math.hypot(dx,dz),reach=n.aiState==='combat'?2.05:n.aiState==='loot'?1.7:2.7;
          if(d>reach){speed=Math.min(running?7:3.3,d*1.25);n.x+=dx/d*speed*dt;n.z+=dz/d*speed*dt;n.root.position.set(n.x,world.groundAt(n.x,n.z),n.z);}
          const yaw=Math.atan2(dx,dz),diff=Math.atan2(Math.sin(yaw-n.root.rotation.y),Math.cos(yaw-n.root.rotation.y));n.root.rotation.y+=diff*Math.min(1,dt*5);
          if(n.aiState==='combat'&&d<=reach&&n.attackCooldown<=0){
            const astral=Math.random()<0.28, damage=astral?8:7;
            n.actor.play(astral?'blast':'punch',1);
            seers?.hitGrunt(enemyTarget,damage,dx/(d||1),dz/(d||1),astral?'blast':'punch',1);
            if(astral) fx?.emit(enemyTarget.pos.x,enemyTarget.pos.y+1.1,enemyTarget.pos.z,12,{color:n.astralProfile.color,speed:2.3,up:0.5,size:0.2,life:0.3,g:0});
            n.attackCooldown=1.15;
          }
        } else {const dx=rizer.position.x-n.x,dz=rizer.position.z-n.z,d=Math.hypot(dx,dz);if(d<6){const yaw=Math.atan2(dx,dz),diff=Math.atan2(Math.sin(yaw-n.root.rotation.y),Math.cos(yaw-n.root.rotation.y));n.root.rotation.y+=diff*Math.min(1,dt*2.5);}}
    n.actor.update(dt,speed,true);
      }
    },
    talk(npc){const n=npcs.find(v=>v.id===npc.id);if(!n)return npc.note;const line=n.lines[n.index%n.lines.length];n.index++;return line;},
    lockTargets(){return npcs.filter(n=>n.met);},
    meet(npc){const n=npcs.find(v=>v.id===npc.id);if(!n||n.met)return false;n.met=true;return true;},
    recruit(npc){const n=npcs.find(v=>v.id===npc.id);if(!n||!n.met||n.downed)return false;n.recruited=true;n.aiState='follow';return true;},
    hurt(npc,damage){const n=npcs.find(v=>v.id===npc.id);if(!n||n.downed)return false;n.health=Math.max(0,n.health-damage);if(n.health===0){n.wasRecruited=n.recruited;n.downed=true;n.recruited=false;n.aiState='downed';n.actor.play('knockdown',1,{hold:true});}return true;},
    revive(npc){const n=npcs.find(v=>v.id===npc.id);if(!n||!n.downed)return false;n.downed=false;n.health=n.maxHealth;n.recruited=n.wasRecruited;n.actor.play('standup',1);n.aiState=n.recruited?'follow':'idle';return true;}
  };
}
