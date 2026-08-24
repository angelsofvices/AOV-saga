const fs = require('fs');
const src = fs.readFileSync('/tmp/all.js', 'utf8');
const noop = () => {};
global.setInterval=()=>0; global.setTimeout=()=>0; global.clearInterval=noop; global.clearTimeout=noop;
const CTX=new Proxy({},{get:()=>()=>({addColorStop:noop,width:0,height:0,data:[]})});
const el=()=>({style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},width:960,height:540,value:'',textContent:'',innerHTML:'',children:[],childNodes:[],getContext:()=>CTX,appendChild:noop,removeChild:noop,addEventListener:noop,removeEventListener:noop,setAttribute:noop,getAttribute:()=>null,focus:noop,remove:noop,play:()=>Promise.resolve(),pause:noop,querySelector:()=>el(),querySelectorAll:()=>[],getBoundingClientRect:()=>({left:0,top:0,width:960,height:540})});
global.addEventListener=noop; global.removeEventListener=noop;
global.document={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),addEventListener:noop,body:el(),documentElement:el(),head:el(),hidden:false,visibilityState:'visible'};
global.window=global; global.localStorage={getItem:()=>null,setItem:noop,removeItem:noop};
global.Audio=function(){return{play:()=>Promise.resolve(),pause:noop,addEventListener:noop,cloneNode(){return this}}};
global.Image=function(){return{addEventListener:noop,complete:false,naturalWidth:0,src:''}};
global.requestAnimationFrame=()=>0; global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0};
global.performance={now:()=>Date.now()};
global.getComputedStyle=()=>({getPropertyValue:()=>''});
try{new Function(src+';globalThis.__C={voltstormGate,voltstormAdjacentEnemy,fireSapphireVoltstorm,_voltstormKO,VOLTSTORM_CD_MS,COSMIC_CHEST_SPOTS,WEAPON_DROP_ART,INVENTORY_META,WEAPON_MAX_DUR,_armWeapon,NPCS,player,game,_cam,TILE,markChestLooted,restoreLootedChests,WORLD_PROPS};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';

H('1 · ★ THE CUTSCENE SHIPS');
{
  ok(fs.existsSync(ROOT+'video/sapphire-voltstorm.mp4'),'video/sapphire-voltstorm.mp4 on disk');
  ok(fs.statSync(ROOT+'video/sapphire-voltstorm.mp4').size>5e6,'full render, not a stub');
  ok(/id="voltstormVid"[^>]*object-fit:contain/.test(fs.readFileSync(ROOT+'rp7b.html','utf8')),'★ element letterboxes (object-fit:contain · never stretch canon)');
  ok(/_voltstormPlaying\)\s+freezeReasons\.push\('voltstormVideo'\)/.test(src),'★ the world FREEZES while the storm plays');
}

H('2 · ★★ THE VOLTSHARD · chest → bag → ZyCube attunement');
{
  const spot=C.COSMIC_CHEST_SPOTS.find(s=>s.item==='voltshard');
  ok(!!spot,'a cosmic chest holds it');
  ok(spot && spot.dist==='malezor' && spot.at[0]===41 && spot.at[1]===16,'★ Malezor tower plaza (41,16) · inside the boss guard ring');
  const ids=C.WORLD_PROPS.filter(p=>p&&p._cosmicChest).map(p=>p.id);
  ok(new Set(ids).size===ids.length && ids.length===C.COSMIC_CHEST_SPOTS.length,`★ ${ids.length} cosmic chests · every id unique (item-keyed, two now share Malezor)`);
  ok(C.WEAPON_DROP_ART.voltshard && /gem-yellow/.test(C.WEAPON_DROP_ART.voltshard.src),'drop art wired (yellow gem placeholder until the real render)');
  ok(C.INVENTORY_META.voltshard && C.INVENTORY_META.voltshard.label==='Voltshard','named in the bag');
  // _armWeapon must not arm a relic
  const snap=JSON.stringify([C.player.swordBroken,C.player.axeBroken,C.player.bowBroken,C.player.rubypawBroken]);
  C._armWeapon('voltshard');
  ok(snap===JSON.stringify([C.player.swordBroken,C.player.axeBroken,C.player.bowBroken,C.player.rubypawBroken]),'_armWeapon is a no-op for the shard');
  ok(/case 'voltshard':[\s\S]{0,700}voltstormUnlocked = true/.test(src),'★ ZyCube CONSUME sets the permanent unlock');
  ok(/case 'voltshard':[\s\S]{0,400}Already attuned/.test(src),'a second shard is refused, not wasted');
  ok(/voltstormUnlocked: !!player\.voltstormUnlocked/.test(src),'★ attunement survives save/load');
  ok(/markChestLooted\(chest\.id\)/.test(src) && /_woodChest \|\| p\._cosmicChest/.test(src),'★ cosmic loot persists now (closed the reopen-on-reload gap)');
}

H('3 · ★★ FIVE GATES · in the order the player can fix them');
{
  const P=C.player, G=C.game;
  G.scene='overworld';
  P.cosmeticSkin='power_upgrade'; P.voltstormUnlocked=true;
  let g=C.voltstormGate();
  ok(!g.ok && g.why==null,'S2 → silent refusal (Rakoron\'s A5 is not forged yet)');
  P.cosmeticSkin='normal'; P.voltstormUnlocked=false;
  g=C.voltstormGate();
  ok(!g.ok && g.why==null,'unattuned → silent (you cannot miss what you never met)');
  P.voltstormUnlocked=true;
  // park far from every enemy
  P.x=-200; P.y=-200;
  g=C.voltstormGate();
  ok(!g.ok && /1 tile/.test(g.why||''),'no adjacent enemy → says so');
  // stand a fake enemy next to Rizer
  const foe={id:'__vs_test_foe',isEnemy:true,scene:'overworld',mode:'wander',name:'Testfoe',tileX:-199,tileY:-200,hp:10,hpMax:10,dir:'down',sheet:{},bboxes:null};
  C.NPCS.push(foe);
  P.diamond=40; P.diamondMax=100;
  g=C.voltstormGate();
  ok(!g.ok && /FULL ◆ SPECIAL/.test(g.why||''),'meter not full → says so with the count');
  P.diamond=100;
  P._voltstormCdUntil=Date.now()+60000;
  g=C.voltstormGate();
  ok(!g.ok && /gathering/.test(g.why||''),'on cooldown → says the seconds left');
  P._voltstormCdUntil=0;
  g=C.voltstormGate();
  ok(g.ok===true,'★ all five gates open → GO');
}

H('4 · ★★ THE PRICE IS PAID UP FRONT');
{
  const P=C.player;
  P.diamond=100; P._voltstormCdUntil=0;
  const fired=C.fireSapphireVoltstorm();
  ok(fired===true,'the storm fires');
  ok(P.diamond===0,'★ ◆ SPECIAL empties the moment it is called');
  ok(P._voltstormCdUntil>Date.now()+110000,'★ 2-minute cooldown starts NOW');
  ok(C.VOLTSTORM_CD_MS===120000,'cooldown constant = the Creator\'s 2 minutes');
}

H('5 · ★★ FULL-SCREEN KO · non-bosses fall · bosses stand · one death door');
{
  const P=C.player;
  // aim the camera at Rizer
  C._cam.x=P.x*C.TILE-480; C._cam.y=P.y*C.TILE-264;
  const mkFoe=(id,dx,dy,extra)=>{const n=Object.assign({id,isEnemy:true,scene:'overworld',mode:'wander',name:id,tileX:P.x+dx,tileY:P.y+dy,hp:10,hpMax:10,dir:'down',sheet:{}},extra||{});C.NPCS.push(n);return n;};
  const near=mkFoe('__vs_near',2,0);
  const edge=mkFoe('__vs_edge',9,0);              // still on the 960px screen
  const far =mkFoe('__vs_far',40,0);              // way off screen
  const boss=mkFoe('__vs_boss',3,0,{_towerBossOf:'malezor'});
  C._voltstormKO();
  const dead=n=>n._dying||n.scene==='__dead__'||(n.hp!=null&&n.hp<=0);
  ok(dead(near),'adjacent grunt struck down');
  ok(dead(edge),'enemy at the screen edge struck down (full screen is literal)');
  ok(!dead(far),'★ off-screen enemy untouched · the storm is what you SEE');
  ok(!dead(boss),'★ the tower boss stands · A5 clears the field, not the fight');
  ok(near._rxpCredited===true,'kills route through creditRizerKill (XP + log + journal)');
  ok(/startMoriDeath\(n\)/.test(src.slice(src.indexOf('function _voltstormKO'),src.indexOf('function _voltstormKO')+1600)),'★ deaths go through startMoriDeath — Skellor bags, creeper seeds and Scanobot salvage all behave');
}

H('6 · ★★ THE CHORD · three keys outrank two · never steals from the unarmed');
{
  const slamAt=src.indexOf("Astralslam · R2 + Square chord");
  const voltAt=src.indexOf("A5 · SAPPHIRE VOLTSTORM · L2+R2+Square");
  ok(voltAt>0 && slamAt>0 && voltAt<slamAt,'★ voltstorm chord checked BEFORE Astralslam');
  const chord=src.slice(voltAt,voltAt+2200);
  ok(/k === 'j' && keys\['shift'\] && keys\['i'\]/.test(chord),'fires on Square with both triggers held');
  ok(/k === 'i' && keys\['shift'\] && keys\['j'\]/.test(chord) && /k === 'shift' && keys\['i'\] && keys\['j'\]/.test(chord),'…and in every key order');
  ok(/if \(armed\) return;/.test(chord),'★ swallows ONLY once attuned+S1 — before that, Astralslam/Astralstrike behave exactly as before');
}


H('7 · ★★ v0.95.824 · FULL CINEMA · the movie owns the screen AND the speakers');
{
  ok(/if \(typeof _voltstormPlaying !== 'undefined' && _voltstormPlaying\) return;/.test(src),
     '★ playSFX gates on the movie FIRST — even the UI whitelist cannot talk over it');
  const fire=src.slice(src.indexOf('function fireSapphireVoltstorm'),src.indexOf('function _voltstormKO'));
  ok(/AUDIO\.bgm.+pause/.test(fire)&&/_currentBGM = null/.test(fire),'BGM hard-stops on the way in');
  ok(/_rvoxLive/.test(fire)&&/_stopCorsunIfLive/.test(fire),'live Rizer VO + CORSUN cut');
  ok(/voltstorm-cine/.test(fire),'★ body.voltstorm-cine hides every HUD');
  ok(/classList\.remove\('voltstorm-cine'\)/.test(fire)&&/playBGM\(game\.scene === 'overworld' \? 'town' : 'home'\)/.test(fire),
     'and the way out restores the HUDs + the right BGM');
  const html=require('fs').readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html','utf8');
  ok(/body\.voltstorm-cine #hud[\s\S]{0,300}#minimapCanvas/.test(html),'the CSS rule covers hud/pad/rizer/weapon/minimap/dev');
  ok(/id="voltstormVid"[^>]*z-index:10000/.test(html),'★ the video rides ABOVE every fixed overlay (z 10000)');
  ok(/vid\.muted = false/.test(fire),'full movie SOUND · unmuted first try');
}

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
