// West Lake Bus · the first RP7D ground vehicle. Forward is local +Z.
import * as THREE from 'three';

const BODY = 0xf2a900, DARK = 0x111822, GLASS = 0x102a42, CYAN = 0x28bdff;
const SIZE = { halfWidth:1.64, halfLength:5.9, wheel:0.66, clearance:0.12 };
const clamp = THREE.MathUtils.clamp;
const makeMat = (color, metalness = 0.1, roughness = 0.55, emissive = 0) => new THREE.MeshStandardMaterial({ color, metalness, roughness, emissive, emissiveIntensity:emissive ? 0.7 : 0 });

function buildBus() {
  const root = new THREE.Group(); root.name = 'West Lake Bus'; root.userData.noCollide = true;
  const shell = new THREE.Group(); root.add(shell);
  const yellow = makeMat(BODY, 0.32, 0.31), black = makeMat(DARK, 0.48, 0.29), window = makeMat(GLASS, 0.25, 0.19);
  const silver = makeMat(0xc4cbd1, 0.72, 0.22), tire = makeMat(0x0b0d11, 0.07, 0.93), rim = makeMat(0x697681, 0.8, 0.24);
  const blue = new THREE.MeshStandardMaterial({ color:CYAN, emissive:CYAN, emissiveIntensity:2.6, roughness:0.2 });
  const amber = new THREE.MeshStandardMaterial({ color:0xff8c1c, emissive:0xff5700, emissiveIntensity:2.5 });
  const red = new THREE.MeshStandardMaterial({ color:0xff3030, emissive:0xff1111, emissiveIntensity:1.7 });
  const box = (parent, material, x,y,z, w,h,d, name='') => { const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), material); m.position.set(x,y,z); m.castShadow = true; m.receiveShadow = true; m.name = name; parent.add(m); return m; };
  // Yellow aerodynamic body, black lower sill, long glazed passenger cabin and faceted ends.
  box(shell, black, 0,1.02,0, 3.3,1.03,11.8,'underside');
  box(shell, yellow, 0,1.72,0, 3.24,1.15,11.65,'body');
  box(shell, yellow, 0,3.35,-0.15, 3.18,0.53,11.15,'roof');
  box(shell, black, 0,2.71,0, 3.29,1.02,11.15,'window frame');
  box(shell, window, 0,2.72,0, 3.31,0.82,10.9,'glazing');
  box(shell, yellow, 0,3.72,-0.1, 2.7,0.13,10.5,'roof spine');
  box(shell, black, 0,1.07,5.84, 3.1,0.68,0.16,'front fascia');
  box(shell, black, 0,1.76,-5.82, 3.1,1.25,0.18,'rear grille');
  for (const side of [-1,1]) {
    box(shell, yellow, side*1.61,1.87,0, 0.08,0.44,11.25,'side belt');
    box(shell, black, side*1.66,0.75,0, 0.12,0.20,11.4,'side skirt');
    box(shell, blue, side*1.68,0.53,0, 0.03,0.05,9.4,'blue running light');
    for (const z of [-3.9,-2.15,-0.4,1.35,3.1]) box(shell, black, side*1.67,2.74,z, 0.09,0.92,0.12,'window pillar');
    box(shell, black, side*1.79,2.66,4.69, 0.25,0.72,0.41,'mirror');
    box(shell, amber, side*1.76,2.74,4.83, 0.03,0.4,0.055,'mirror signal');
    box(shell, amber, side*1.67,1.54,-3.85, 0.05,0.28,0.11,'side marker');
    // The wheels spin on four axles; front two pairs visibly steer.
    for (const z of [-4.35,-2.65,2.35,4.05]) {
      const mount = new THREE.Group(); mount.position.set(side*1.57, SIZE.wheel, z); root.add(mount);
      const wheel = new THREE.Group(); mount.add(wheel);
      const t = new THREE.Mesh(new THREE.CylinderGeometry(SIZE.wheel,SIZE.wheel,0.28,14),tire); t.rotation.z = Math.PI/2; wheel.add(t);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.45,0.45,0.3,10),rim); hub.rotation.z=Math.PI/2; wheel.add(hub);
      for (let i=0;i<6;i++) { const a=i*Math.PI/3; const spoke=box(wheel,silver,side*0.16,Math.cos(a)*0.26,Math.sin(a)*0.26,0.015,0.07,0.34); spoke.rotation.x=a; }
      mount.userData.front = z>0; (root.userData.wheels ||= []).push({ mount,wheel,side });
    }
    const sideWords = textPanel('WEST LAKE BUS', 460, 62, '#0d1720', 'bold 46px Arial');
    sideWords.position.set(side*1.675,1.96,0.12); sideWords.rotation.y=side*Math.PI/2; sideWords.scale.set(5.0,0.68,1); shell.add(sideWords);
    for (const z of [-3.55,-1.4,0.75,2.9]) {
      const roofWin = box(shell,window,side*0.67,3.795,z, 0.82,0.018,1.15,'roof window'); roofWin.rotation.y=side*0.07;
    }
  }
  // Sloped windscreen and bright front/rear identity.
  const windscreen = box(shell,window,0,2.52,5.69, 2.99,1.37,0.10,'windshield'); windscreen.rotation.x=-0.13;
  box(shell,black,0,3.45,5.52,2.9,0.45,0.2,'destination frame');
  const dest=textPanel('WEST LAKE BUS',360,55,'#ffb51c','bold 38px Arial'); dest.position.set(0,3.46,5.64); dest.scale.set(2.75,0.42,1); shell.add(dest);
  for (const side of [-1,1]) {
    box(shell,blue,side*1.1,1.67,5.91,0.83,0.09,0.05,'headlight');
    box(shell,amber,side*1.45,1.23,5.91,0.3,0.14,0.06,'front signal');
    box(shell,red,side*1.44,2.45,-5.94,0.15,1.0,0.08,'rear lamp');
    box(shell,red,side*0.72,2.65,-5.95,1.0,0.08,0.06,'rear light bar');
  }
  box(shell,blue,0,0.65,-5.94,1.05,0.08,0.05,'rear blue light');
  // Visible passenger seats behind the glass.
  for (let z=-3.7;z<=3.3;z+=1.25) for (const side of [-1,1]) {
    box(shell,black,side*0.92,2.08,z,0.71,0.58,0.65,'passenger seat');
    box(shell,blue,side*0.92,2.37,z-0.30,0.68,0.04,0.05,'seat accent');
  }
  const headlamps = [];
  for (const side of [-1,1]) { const l = new THREE.SpotLight(0xdaf4ff,0,25,0.56,0.65,1); l.position.set(side*1.08,1.65,5.95); l.target.position.set(side*1.08,0.2,18); root.add(l,l.target); headlamps.push(l); }
  // Exhaust attachments and layered animated flame meshes. The FX system adds sparks/embers.
  const exhaust=[];
  for (const side of [-1,1]) {
    const g=new THREE.Group(); g.name=side<0?'Exhaust_L':'Exhaust_R'; g.position.set(side*1.38,3.12,-5.75); root.add(g);
    const pipe=new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.15,1.35,8),silver); pipe.position.y=0.5; g.add(pipe);
    const tip=new THREE.Mesh(new THREE.CylinderGeometry(0.17,0.16,0.16,8),amber.clone()); tip.position.y=1.19; g.add(tip);
    const flame=new THREE.Group(); flame.position.y=1.24; g.add(flame);
    const glowMat=new THREE.MeshBasicMaterial({ color:0xff7312,transparent:true,opacity:0.32,depthWrite:false,blending:THREE.AdditiveBlending });
    const outer=new THREE.Mesh(new THREE.ConeGeometry(0.25,0.8,7),glowMat); outer.position.y=0.38; flame.add(outer);
    const core=new THREE.Mesh(new THREE.ConeGeometry(0.11,0.54,7),new THREE.MeshBasicMaterial({color:0xfff3ac})); core.position.y=0.25; flame.add(core);
    const heat=new THREE.Mesh(new THREE.ConeGeometry(0.34,1.15,7),new THREE.MeshBasicMaterial({color:0xffb766,transparent:true,opacity:0.11,depthWrite:false,blending:THREE.AdditiveBlending})); heat.position.y=0.58; flame.add(heat);
    flame.visible=false; exhaust.push({ anchor:g,flame,tip });
  }
  // A school-bus style STOP arm on the driver's left. It rests flat against
  // the body and swings out perpendicular to the side when called.
  const stopArm=new THREE.Group(); stopArm.name='West Lake STOP arm'; stopArm.position.set(-1.76,2.18,-3.45); stopArm.rotation.y=-Math.PI/2; root.add(stopArm);
  box(root,black,-1.78,2.18,-3.45,.16,.74,.17,'STOP arm hinge');
  box(stopArm,silver,.27,0,0,.55,.055,.08,'STOP arm bracket');
  const octagon = radius => {
    const a=radius*(Math.SQRT2-1), points=[[-a,-radius],[a,-radius],[radius,-a],[radius,a],[a,radius],[-a,radius],[-radius,a],[-radius,-a]];
    const s=new THREE.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return new THREE.ShapeGeometry(s);
  };
  const signBlack=new THREE.MeshBasicMaterial({color:0x241111,side:THREE.DoubleSide}), signWhite=new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide}),signRed=new THREE.MeshBasicMaterial({color:0xd71924,side:THREE.DoubleSide});
  for(const side of [-1,1]) {
    const layers=[[.52,0,signBlack],[.49,.012,signWhite],[.43,.024,signRed]];
    for(const [radius,depth,mat] of layers){const face=new THREE.Mesh(octagon(radius),mat);face.position.set(.59,0,depth*side);face.name='STOP sign octagon';face.castShadow=true;stopArm.add(face);}
    const label=textPanel('STOP',256,90,'#ffffff','bold 86px Arial');label.position.set(.59,0,.032*side);label.rotation.y=side<0?Math.PI:0;label.scale.set(.72,.25,1);stopArm.add(label);
  }
  return { root,shell,exhaust,headlamps,stopArm };
}

function textPanel(text,w,h,color,font) {
  const canvas=document.createElement('canvas'); canvas.width=w; canvas.height=h;
  const ctx=canvas.getContext('2d'); ctx.clearRect(0,0,w,h); ctx.fillStyle=color; ctx.font=font; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(text,w/2,h/2,w-10);
  const tex=new THREE.CanvasTexture(canvas); tex.colorSpace=THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:tex,transparent:true,side:THREE.DoubleSide,depthWrite:false}));
}

export function createWestLakeBus(scene, world, fx, toast, at) {
  const visual=buildBus(), root=visual.root; scene.add(root);
  root.position.set(at.x,world.groundAt(at.x,at.z)+SIZE.clearance,at.z); root.rotation.y=at.facing||0;
  const pos=root.position, velocity=new THREE.Vector3();
  let driving=false, speed=0, heading=root.rotation.y, steer=0, boostT=0, boostCool=0, handbrake=false, lights=false, radio=0, radioWheel=false, stopOpen=false, impactClock=0, blockedT=0;
  let audioCtx=null, lastSpark=0, lastGround=pos.y;
  const impactTimes=new Map(), IMPACT_DAMAGE=8;
  const radioNames=['RADIO OFF','WEST LAKE FM','ASTRAL CURRENT'];
  const ui=document.createElement('div');ui.className='bus-hud';ui.hidden=true;
  ui.innerHTML='<b>WEST LAKE BUS</b><span data-bus-speed>0 KM/H</span><small data-bus-state>READY</small><div class="bus-radio" data-bus-radio hidden></div><p class="p-only">R2 DRIVE · L2 BRAKE · R1 HANDBRAKE · ✕ BOOST · ○ STOP ARM · △ EXIT</p><p class="k-only">W DRIVE · S BRAKE · Q HANDBRAKE · SPACE BOOST · F STOP ARM · E EXIT</p>';
  document.querySelector('#game').appendChild(ui);
  const speedEl=ui.querySelector('[data-bus-speed]'),stateEl=ui.querySelector('[data-bus-state]'),radioEl=ui.querySelector('[data-bus-radio]');
  const spot={ id:'west-lake-bus', kind:'ride', discover:false, reach:6.5, get name(){return 'Drive West Lake Bus';}, get note(){return '△ enter · R2 drive · L2 brake · ✕ boost';}, get x(){return pos.x;}, get z(){return pos.z;}, get cx(){return pos.x;}, get cz(){return pos.z;}, active:()=>root.visible&&!driving };
  world.interactables.push(spot);
  // Dynamic roof support for Rizer. The bus moves, so it cannot be baked into
  // the world's static mesh grid; these queries follow its live transform.
  function roofAt(x,z,y) {
    if(!root.visible)return -Infinity;
    const dx=x-pos.x,dz=z-pos.z,c=Math.cos(heading),s=Math.sin(heading);
    const lx=dx*c-dz*s,lz=dx*s+dz*c;
    if(Math.abs(lx)>SIZE.halfWidth-.12||Math.abs(lz)>SIZE.halfLength-.24)return -Infinity;
    root.updateMatrixWorld(true);
    const top=root.localToWorld(new THREE.Vector3(lx,3.81,lz)).y;
    return y===undefined||y>=top-.28?top:-Infinity;
  }
  const playerWorld=Object.create(world);
  playerWorld.surfaceAt=(x,z,y)=>Math.max(world.surfaceAt(x,z,y),roofAt(x,z,y));
  playerWorld.groundAt=(x,z,y)=>Math.max(world.groundAt(x,z,y),roofAt(x,z,y));
  playerWorld.groundNormalAt=(x,z,y,span)=>Number.isFinite(roofAt(x,z,y))?new THREE.Vector3(0,1,0).applyQuaternion(root.quaternion).normalize():world.groundNormalAt(x,z,y,span);
  function sound(freq=140,duration=.15,type='sawtooth',volume=.08) {
    try { audioCtx ||= new (window.AudioContext||window.webkitAudioContext)(); audioCtx.resume(); const o=audioCtx.createOscillator(),g=audioCtx.createGain(); o.type=type; o.frequency.setValueAtTime(freq,audioCtx.currentTime); g.gain.setValueAtTime(volume,audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+duration); o.connect(g).connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime+duration); } catch {}
  }
  function horn(){ sound(210,.35,'square',.11); setTimeout(()=>sound(280,.36,'square',.09),70); }
  function setLights(on){ lights=on; for(const l of visual.headlamps) l.intensity=lights?15:0; toast?.(`West Lake Bus headlights ${lights?'on':'off'}`); }
  function entry(rizer) {
    if(driving||Math.hypot(rizer.position.x-pos.x,rizer.position.z-pos.z)>7) return false;
    driving=true; speed=0; velocity.set(0,0,0); rizer.attack=null; rizer.events.length=0; rizer.inVehicle=true; rizer.vel.set(0,0,0); rizer.vy=0; rizer.flying=false; rizer.onGround=true; rizer.obj.visible=false;
    rizer.position.copy(pos); rizer.position.y=world.groundAt(pos.x,pos.z); rizer.facing=heading; rizer.speed=0;
    ui.hidden=false;sound(120,.23,'sawtooth',.075); toast?.('WEST LAKE BUS · R2 accelerate · L2 brake · ✕ boost · △ exit'); return true;
  }
  function exit(rizer) {
    if(!driving) return false;
    const right=new THREE.Vector3(Math.cos(heading),0,-Math.sin(heading));
    const candidates=[-1,1].map(side=>pos.clone().addScaledVector(right,side*3.1));
    let target=null;
    for(const p of candidates) { p.y=world.groundAt(p.x,p.z); const check=p.clone(); if(!world.resolve(check,.58)&&world.containsLand(p.x,p.z)){target=p;break;} }
    if(!target){toast?.('Stop clear of obstacles before exiting');return false;}
    driving=false; boostT=0; speed=0; velocity.set(0,0,0); rizer.position.copy(target); rizer.obj.visible=true; rizer.inVehicle=false; rizer.onGround=true; rizer.facing=heading; rizer.speed=0; rizer.vel.set(0,0,0); rizer.vy=0;ui.hidden=true;
    visual.stopArm.rotation.y=stopOpen?-Math.PI:-Math.PI/2;
    visual.exhaust.forEach(x=>x.flame.visible=false); sound(92,.17,'sine',.045); toast?.('Exited West Lake Bus');return true;
  }
  function changeRadio(step) { radio=(radio+step+radioNames.length)%radioNames.length; toast?.(`${radioNames[radio]} · station audio coming later`); }
  function toggleStopSign(){stopOpen=!stopOpen;toast?.(`West Lake Bus STOP arm ${stopOpen?'open':'folded'}`);}
  function boost() { if(!driving||boostCool>0||speed<0) return false; boostT=Math.abs(speed)<8?.55:1.65; boostCool=2.8; sound(310,.5,'sawtooth',.08);toast?.('WEST LAKE BUS · BOOST');return true; }
  function update(dt,input,rizer) {
    if(!driving)return;
    boostT=Math.max(0,boostT-dt);boostCool=Math.max(0,boostCool-dt);blockedT=Math.max(0,blockedT-dt);impactClock+=dt;
    handbrake=!!input.handbrake;radioWheel=!!input.radioWheel;
    if(input.boost)boost(); if(input.lights)setLights(!lights); if(input.horn)horn(); if(input.stopSign)toggleStopSign(); if(input.radioNext)changeRadio(1); if(input.radioPrev)changeRadio(-1);
    const stopTarget=stopOpen?-Math.PI:-Math.PI/2;
    visual.stopArm.rotation.y+=(stopTarget-visual.stopArm.rotation.y)*(1-Math.exp(-12*dt));
    const throttle=clamp(input.throttle||0,0,1), brake=clamp(input.brake||0,0,1);
    let accel=0;
    if(throttle>0)accel+=(boostT>0?31:14)*throttle;
    if(brake>0)accel-=speed>0.6?26*brake:8.5*brake;
    if(handbrake)accel-=Math.sign(speed)*Math.min(Math.abs(speed)/Math.max(dt,.001),18);
    if(!throttle&&!brake)accel-=Math.sign(speed)*Math.min(Math.abs(speed)/Math.max(dt,.001),2.3+speed*0.09);
    speed=clamp(speed+accel*dt,-9,boostT>0?55:36);
    if(boostT<=0&&speed>36)speed=Math.max(36,speed-6*dt);
    if(Math.abs(speed)<0.08)speed=0;
    const sensitivity=(handbrake?1.75:1)*clamp(1-Math.abs(speed)/80,0.38,1);
    steer+=(-clamp(input.steer||0,-1,1)*sensitivity-steer)*(1-Math.exp(-8*dt));
    const yaw=steer*speed*dt/(handbrake?5.3:8.2);
    heading+=yaw;
    const old=pos.clone(), move=new THREE.Vector3(Math.sin(heading),0,Math.cos(heading)).multiplyScalar(speed*dt);
    pos.x+=move.x;pos.z+=move.z;
    // Probe the moving body, including both side panels, against real world collision.
    const fwd=new THREE.Vector3(Math.sin(heading),0,Math.cos(heading));
    const right=new THREE.Vector3(Math.cos(heading),0,-Math.sin(heading));
    const coast=world.keepOnLand(pos,old.x,old.z);
    if (!coast && boostT > 0 && Math.abs(speed) > 2) {
      const from={ x:old.x, y:world.heightAt(old.x,old.z), z:old.z };
      const to={ x:pos.x, y:world.heightAt(pos.x,pos.z), z:pos.z };
      const smashed=world.nature?.userData?.boostImpact?.(from,to,heading,SIZE.halfWidth,SIZE.halfLength);
      if (smashed?.rocks || smashed?.trees) {
        blockedT=0;
        const count=smashed.rocks+smashed.trees;
        toast?.(`BOOST IMPACT · ${count} ${count===1?'obstacle':'obstacles'} cleared`);
        fx?.emit(pos.x,world.heightAt(pos.x,pos.z)+1,pos.z,12,{color:'#ffca69',speed:3,up:1,size:.18,life:.35,g:2});
      }
    }
    let blocked=coast;
    for (const length of [Math.sign(speed)*6.0,0,-Math.sign(speed)*5.6]) for (const side of [-1,1]) {
      if (blocked) break;
      const probe=pos.clone().addScaledVector(fwd,length).addScaledVector(right,side*1.42);
      probe.y=world.heightAt(probe.x,probe.z)+.75;
      const corrected=probe.clone();
      blocked=world.resolve(corrected,.34)||corrected.distanceTo(probe)>.35;
    }
    if(blocked) { pos.x=old.x;pos.z=old.z;speed=0;blockedT=.8; }
    const rear=pos.clone().addScaledVector(fwd,-3.5),front=pos.clone().addScaledVector(fwd,3.5);
    const backH=world.groundAt(rear.x,rear.z),frontH=world.groundAt(front.x,front.z), floor=world.groundAt(pos.x,pos.z);
    const pitch=clamp(Math.atan2(backH-frontH,7),-.13,.13);
    lastGround+=(floor+SIZE.clearance-lastGround)*(1-Math.exp(-8*dt));pos.y=lastGround;
    root.rotation.set(pitch,heading,clamp(-steer*speed/180,-.07,.07),'YXZ');
    for(const w of root.userData.wheels) {w.mount.rotation.y=w.mount.userData.front?steer*.3:0;w.wheel.rotation.x+=speed*dt/SIZE.wheel;}
    for(const [i,x] of visual.exhaust.entries()) { x.flame.visible=boostT>0; x.tip.material.emissiveIntensity=boostT>0?4:2.5; x.flame.scale.setScalar(boostT>0?1+Math.random()*.16:1);x.flame.scale.y=boostT>0?.75+Math.abs(speed)/34:1;
      if(boostT>0&&performance.now()-lastSpark>35){const p=x.anchor.getWorldPosition(new THREE.Vector3());fx?.emit(p.x,p.y+1.2,p.z,3,{color:i?'#ffae2c':'#ffde66',speed:4,up:2,size:.18,life:.38,g:1});fx?.emit(p.x,p.y+1.5,p.z,1,{color:'#85909a',speed:1.2,up:1.3,size:.28,life:.48,g:-.2}); if(i)lastSpark=performance.now();}
    }
    velocity.copy(fwd).multiplyScalar(speed);rizer.position.copy(pos);rizer.position.y=floor;rizer.facing=heading;rizer.speed=Math.abs(speed);rizer.vel.copy(velocity);rizer.vy=0;rizer.onGround=true;rizer.flying=false;
    speedEl.textContent=`${Math.round(Math.abs(speed)*3.6)} KM/H`;stateEl.textContent=blockedT>0?'BLOCKED · SOLID OBSTACLE':boostT>0?'BOOST ACTIVE':speed<-.1?'REVERSE':handbrake?'HANDBRAKE':'DRIVE';
    radioEl.hidden=!radioWheel;radioEl.textContent=radioWheel?`L1 RADIO WHEEL · ◀ ${radioNames[radio]} ▶`:'';
  }
  function cameraUpdate(dt,camera,cam,input={}){
    const rear=!!input.lookBehind, fwd=new THREE.Vector3(Math.sin(heading),0,Math.cos(heading)), up=new THREE.Vector3(0,1,0);
    const desired=pos.clone().addScaledVector(fwd,rear?10:-13).addScaledVector(up,rear?4.5:5.4);
    const target=pos.clone().addScaledVector(fwd,rear?0:2).addScaledVector(up,rear?1.8:2.0);
    const alpha=rear?1:1-Math.exp(-6*dt);camera.position.lerp(desired,alpha);camera.lookAt(target);
    camera.fov+=(cam.fov-camera.fov)*(1-Math.exp(-5*dt));camera.updateProjectionMatrix();
    cam.focus.copy(target);cam.yaw=heading+Math.PI;cam.pitch=.2;cam.idle=0;
  }
  function resolvePlayer(rizer) {
    if(driving||!root.visible)return;
    if(Number.isFinite(roofAt(rizer.position.x,rizer.position.z,rizer.position.y)))return;
    const dx=rizer.position.x-pos.x,dz=rizer.position.z-pos.z,c=Math.cos(heading),s=Math.sin(heading);
    let lx=dx*c-dz*s,lz=dx*s+dz*c;
    const hx=SIZE.halfWidth+.48,hz=SIZE.halfLength+.48;
    if(Math.abs(lx)>=hx||Math.abs(lz)>=hz||rizer.position.y>pos.y+3.9)return;
    const ax=hx-Math.abs(lx),az=hz-Math.abs(lz);
    if(ax<az)lx=Math.sign(lx||1)*hx;else lz=Math.sign(lz||1)*hz;
    rizer.position.x=pos.x+lx*c+lz*s;rizer.position.z=pos.z-lx*s+lz*c;
  }
  function resolveEnemies(seers) {
    if(!root.visible||!seers)return [];
    const hits=[],c=Math.cos(heading),s=Math.sin(heading);
    for(const g of seers.grunts) {
      if(!seers.alive(g)||g.launch||g.pos.y>pos.y+3.7)continue;
      const dx=g.pos.x-pos.x,dz=g.pos.z-pos.z;
      let lx=dx*c-dz*s,lz=dx*s+dz*c;
      const radius=g.T.radius||.55,hx=SIZE.halfWidth+radius,hz=SIZE.halfLength+radius;
      if(Math.abs(lx)>=hx||Math.abs(lz)>=hz)continue;
      const sideGap=hx-Math.abs(lx),endGap=hz-Math.abs(lz);
      if(sideGap<endGap)lx=Math.sign(lx||1)*hx;else lz=Math.sign(lz||1)*hz;
      g.pos.x=pos.x+lx*c+lz*s;g.pos.z=pos.z-lx*s+lz*c;
      g.pos.y=world.groundAt(g.pos.x,g.pos.z,g.pos.y+.5);g.root.position.copy(g.pos);
      if(!driving||Math.abs(speed)<2||impactClock<(impactTimes.get(g.id)||0))continue;
      const boosted=boostT>0, damage=IMPACT_DAMAGE*(boosted?1.5:1);
      const from=pos.clone().add(new THREE.Vector3(-Math.sin(heading)*Math.sign(speed)*SIZE.halfLength*.7,0,-Math.cos(heading)*Math.sign(speed)*SIZE.halfLength*.7));
      const hit=seers.blastBack(g,from,damage,.75);
      if(hit){impactTimes.set(g.id,impactClock+1.2);hits.push({x:g.pos.x,y:g.pos.y+1.2,z:g.pos.z,damage,boosted});}
    }
    return hits;
  }
  return { root, spot, playerWorld, entry, exit, update, cameraUpdate, resolvePlayer, resolveEnemies, boost, get driving(){return driving;}, get speedKmh(){return Math.round(Math.abs(speed)*3.6);}, get boosting(){return boostT>0;}, get stopOpen(){return stopOpen;}, get radioWheel(){return radioWheel;}, get radioName(){return radioNames[radio];}, get headlights(){return lights;} };
}
