#!/usr/bin/env node
/* verify_s3_flight.js · v0.96.43 · S3 FLIES, MECHANICALLY
 *
 *   Creator: "s3 flies on his run animation" -> "flight is mechanical."
 *   Ruled: crosses WATER AND GAPS ONLY (buildings, props and NPCs still block),
 *   active WHILE SPRINTING, at no extra ◆ cost.
 *
 * ★★★ THE TWO THINGS THIS FILE EXISTS TO CATCH.
 *
 *   1 · NPCs MUST NOT INHERIT FLIGHT. walkable() has 77 callers and most are
 *       pathfinding — npcPathDir alone calls it up to 700 times for ONE step.
 *       Making it terrain-permissive whenever Rizer is airborne would send
 *       every Mori in the district walking onto the Void Sea. `flying` is an
 *       opt-in third parameter, defaulted false, passed by exactly one call
 *       site: the player's own move gate. The last check below proves a bare
 *       walkable() still refuses water WHILE Rizer is flying.
 *
 *   2 · HE MUST NEVER BE STRANDED. If flight were only `running`, releasing
 *       sprint halfway across an ocean drops him on a tile he cannot stand on,
 *       with impassable terrain in every direction and no input that could save
 *       him — a soft-lock. So he stays airborne over any tile that could not
 *       hold him, whatever the sprint key is doing.
 */
const fs=require('fs'), path=require('path');
const ROOT=path.join(__dirname,'..');
const src=fs.readFileSync('/tmp/all.js','utf8');
const H=fs.readFileSync(path.join(ROOT,'rp7b.html'),'utf8');
let pass=0,fail=0;
const ok=m=>{pass++;console.log('  ok   · '+m);};
const no=m=>{fail++;console.log('  FAIL · '+m);};
const t=(c,m)=>c?ok(m):no(m);
console.log('\n=== LOAD RESCUE · no save may land you outside the world ===\n');
const noop=()=>{};const _Q=[];let CLOCK=1000;
global.setInterval=()=>0;global.setTimeout=fn=>{_Q.push(fn);return 0;};
global.clearInterval=noop;global.clearTimeout=noop;
const CTX=new Proxy({},{get:(_,k)=>{if(k==='measureText')return()=>({width:10});
 if(k==='createLinearGradient'||k==='createRadialGradient')return()=>({addColorStop:noop});
 if(k==='createPattern')return()=>({});
 if(k==='getImageData')return()=>({data:new Uint8ClampedArray(4),width:1,height:1});
 if(k==='createImageData')return(w,h)=>({data:new Uint8ClampedArray(Math.max(1,w*h*4)),width:w,height:h});
 if(k==='canvas')return{width:960,height:540};return()=>{};}});
const _els=new Map();
const mk=id=>({id,style:{display:'none'},dataset:{},_buttons:[],
 classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},
 width:960,height:540,value:'',textContent:'',innerHTML:'',children:[],childNodes:[],
 getContext:()=>CTX,appendChild:noop,removeChild:noop,addEventListener:noop,
 removeEventListener:noop,setAttribute:noop,getAttribute:()=>null,focus:noop,
 remove:noop,replaceChildren:noop,cloneNode(){return mk(id);},pause:noop,
 play:()=>Promise.resolve(),load:noop,currentTime:0,
 querySelector:()=>mk(id),querySelectorAll(){return this._buttons;},
 getBoundingClientRect:()=>({left:0,top:0,width:960,height:540})});
const elFor=id=>{if(!_els.has(id))_els.set(id,mk(id));return _els.get(id);};
global.addEventListener=noop;global.removeEventListener=noop;
global.document={getElementById:elFor,querySelector:()=>mk('x'),querySelectorAll:()=>[],
 createElement:()=>mk('x'),addEventListener:noop,body:mk('body'),documentElement:mk('html'),
 head:mk('head'),hidden:false,visibilityState:'visible',hasFocus:()=>true};
global.window=global;const LS={};
global.localStorage={getItem:k=>LS[k]??null,setItem:(k,v)=>{LS[k]=String(v);},removeItem:k=>{delete LS[k];}};
global.Audio=function(){return{play:()=>Promise.resolve(),pause:noop,addEventListener:noop,volume:1,currentTime:0,cloneNode(){return this;}};};
global.Image=function(){return{addEventListener:noop,complete:true,naturalWidth:64,naturalHeight:64,set src(v){this._src=v;},get src(){return this._src;}};};
global.requestAnimationFrame=()=>1;global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0,platform:'MacIntel'};
global.performance={now:()=>CLOCK};
global.URL={createObjectURL:()=>'x',revokeObjectURL:noop};global.Blob=function(){};
global.getComputedStyle=()=>({getPropertyValue:()=>'',display:'block',visibility:'visible'});
const LOG=console.log;console.log=()=>{};console.warn=noop;console.error=noop;
new Function(src+`;globalThis.__D={player,game,walkable,rizerFlying,_terrainImpassable,
 isWorldLandTile,isWorldBorderTile,isVeridanRiverTile,setPlayerSkin,isRizerS3,
 startNewGame,NPCS,propBlocked:()=>_propBlocked,PLAYER_SKINS};`)();
let n=0;while(_Q.length&&n<500){const f=_Q.shift();n++;try{f();}catch(_){}}
console.log=LOG;console.log=LOG;const D=globalThis.__D;

D.startNewGame();let q=0;while(_Q.length&&q<400){const f=_Q.shift();q++;try{f();}catch(_){}}
D.game.scene='overworld'; D.player.activeActor='rizer'; D.player.ufoFlying=false;
console.log('\n=== S3 FLIGHT ===\n');
// find a water tile and a land tile
let water=null, land=null;
for(let x=-40;x<200&&(!water||!land);x+=1)
  for(let y=-40;y<200;y+=1){
    if(!water && !D.isWorldLandTile(x,y)) water=[x,y];
    if(!land && D.isWorldLandTile(x,y) && !D.isWorldBorderTile(x,y) && D.walkable(x,y)) land=[x,y];
    if(water&&land) break;
  }
console.log(`     land ${land} · water ${water}\n`);
t(!!water&&!!land,'found a land tile and a water tile to test with');
// ── S1 cannot cross ──
D.setPlayerSkin('normal',false);
t(D.walkable(water[0],water[1])===false,'★★ water is NOT walkable on foot');
t(D.rizerFlying()===false,'★ S1 never flies');
// ── S3 not sprinting ──
D.player.luminaryUnlocked=true; D.player.rizerLvl=100; D.player.diamond=100;
D.setPlayerSkin('luminary',false);
D.player.x=land[0]; D.player.y=land[1]; D.player.running=false;
t(D.isRizerS3(),'in S3');
t(D.rizerFlying()===false,'★★★ S3 standing on land, NOT sprinting → not flying');
t(D.walkable(water[0],water[1],D.rizerFlying())===false,'   · so water still blocks him');
// ── S3 sprinting ──
D.player.running=true;
t(D.rizerFlying()===true,'★★★ S3 + sprint → FLYING');
t(D.walkable(water[0],water[1],true)===true,'★★★ and water becomes crossable');
// ── ★ props/NPCs still block while flying ──
const pb=D.propBlocked(); let prop=null;
for(const k of pb){ const [a,b]=k.split(',').map(Number); prop=[a,b]; break; }
if(prop) t(D.walkable(prop[0],prop[1],true)===false,`★★★ a BUILDING at ${prop} still blocks a flying Rizer`);
else t(true,'(no prop tiles to test)');
let npcT=null;
for(const nn of D.NPCS){ if(nn.scene==='overworld'&&nn.tileX!=null){npcT=[nn.tileX,nn.tileY];break;} }
if(npcT) t(D.walkable(npcT[0],npcT[1],true)===false,`★★★ an NPC at ${npcT} still blocks a flying Rizer`);
// ── ★★★ NEVER STRANDED ──
D.player.x=water[0]; D.player.y=water[1]; D.player.running=false;
t(D.rizerFlying()===true,'★★★ released sprint over OPEN WATER → still airborne · cannot be stranded');
D.player.x=land[0]; D.player.y=land[1];
t(D.rizerFlying()===false,'★★★ back over ground → he lands');
// ── other forms / scenes ──
D.player.running=true;
D.setPlayerSkin('power_upgrade',false);
t(D.rizerFlying()===false,'★★ S2 sprinting does NOT fly');
D.setPlayerSkin('luminary',false);
D.game.scene='interior_home';
t(D.rizerFlying()===false,'★★ no flight indoors');
D.game.scene='overworld'; D.player.ufoFlying=true;
t(D.rizerFlying()===false,'★ the UFO owns movement · no double-flight');
D.player.ufoFlying=false;
// ── ★★★ NPCs MUST NOT INHERIT FLIGHT ──
D.player.running=true; D.player.x=land[0]; D.player.y=land[1];
t(D.rizerFlying()===true,'Rizer is airborne...');
t(D.walkable(water[0],water[1])===false,
  '★★★ ...and a bare walkable() STILL refuses water · NPC pathfinding cannot inherit flight');
console.log(`\n${pass} passed · ${fail} failed\n`);
process.exit(fail?1:0);
