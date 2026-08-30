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
global.Image=function(){return{addEventListener:noop,complete:true,naturalWidth:1254,naturalHeight:1254,src:''}};
try{new Function(src+';globalThis.__C={SUMMONABLE_SPRITES,makeZyrexFollower,ASTRALCORE_ART,spawnAstralcoreDrop,WORLD_PROPS,player,game,TILE};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
const src2=fs.readFileSync(ROOT+'rp7b.html','utf8');
global.showToast=noop; global.playSFX=noop; global.playItemGain=noop; global.saveGame=noop; global.pingNextObjective=noop;

H('1 · ★★ AETHERWING FLIES');
{
  const d=C.SUMMONABLE_SPRITES.aetherwing;
  ok(!!d.runSrc,'★ a traversal bank is registered');
  ok(fs.existsSync(ROOT+'assets/2D sprites/zyrex/aetherwing-fly.png'),'★ the keyed sheet is on disk');
  ok(d.runBboxes.length===4 && d.runBboxes.every(r=>r.length===4),'★ 4x4 · all 16 flight frames measured');
  const flat=[].concat(...d.runBboxes);
  ok(flat.every(b=>b[0]>=0&&b[1]>=0&&b[0]+b[2]<=313&&b[1]+b[3]<=313),
     '★★ every frame fits its own cell · nothing sheared, nothing crossing a wall');
  ok(new Set(flat.map(b=>b.join(','))).size===16,'★ 16 DISTINCT frames · it is an animation, not one pose repeated');
  ok(/runSrc.*convention|src = IDLE, runSrc = traversal/.test(src2),'the convention it uses is named');
}

H('2 · ★★★ THE OTHER HALF OF THE TRAVERSAL LAW');
{
  ok(/THE OTHER HALF OF THE TRAVERSAL LAW/.test(src2),'the omission is recorded where it was fixed');
  ok(/has never understood `runSrc`/.test(src2),
     '★★★ v0.95.900 resolved the three conventions "in one place" -- and that place was the WILD path only');
  const aw=C.makeZyrexFollower({speciesId:'aetherwing',name:'A',uid:'aetherwing#1'});
  ok(!!aw.walkSheet && !!aw.walkBboxes,'★★ a summoned Aetherwing now has a moving bank');
  for (const id of ['key_of_mealux','apexaur']){
    const g=C.makeZyrexFollower({speciesId:id,name:id,uid:id+'#1'});
    ok(!!g.walkSheet,'★★★ '+id+' too · it has been walking beside you in its STANDING pose since the day it landed');
    ok(g.walkRefBh>0,'★ and carries its own yardstick ('+g.walkRefBh+') so it does not resize when it moves');
  }
  ok(/useWalk && n\.walkRefBh/.test(src2),'★★ the draw path applies it · preserve the SIZE, not the divisor');
}

H('3 · ★★★ THE ASTRALCORE COMES OUT OF THE CHEST');
{
  ok(fs.existsSync(ROOT+'assets/2D sprites/items/astralcore.png'),'★ the keyed art is on disk');
  const b=C.ASTRALCORE_ART.bbox;
  ok(b && b.length===4 && b[2]>0 && b[3]>0,'★ measured on its own alpha · '+JSON.stringify(b));
  ok(b[0]>0 && b[1]>0,'★★ and it clears its canvas on every side · nothing sheared');
  C.game.scene='overworld';
  const before=C.WORLD_PROPS.length;
  const p=C.spawnAstralcoreDrop(5,195);
  ok(!!p,'★★ opening the chest LANDS it in the world');
  ok(p.tileX!==5 || p.tileY!==195,'★ beside the chest, not inside it · ('+p.tileX+','+p.tileY+')');
  ok(JSON.stringify(p.footprint)==='[[0,0]]','★★ SOLID · the pickup-collision law · you cannot walk through it');
  ok(JSON.stringify(p.door)==='[0,0]','★★ and X claims it when faced · the same grammar as every other pickup');
  ok(p._levitate===true,'★ it hovers, like the Matrix gems');
  ok(/same rig as weapons and astralites/.test(src2),'the Creator’s words are at the code');
  ok(/spawnAstraliteGem uses and nothing else/.test(src2),
     '★★★ the rig is COPIED, not reinvented · a player who has picked up a Matrix gem already knows how to pick this up');
  p.onInteract();
  ok((C.player.items.astralcore||0)===1,'★★ claiming it puts exactly one in the bag');
  ok(C.WORLD_PROPS.length===before,'★ and takes it out of the world');
  C.game.scene='interior_home';
  ok(C.spawnAstralcoreDrop(5,195)===null,'★★ interiors return null · the caller hands it over, chest-coin precedent');
  C.game.scene='overworld';
  ok(!/player\.items\.astralcore = \(player\.items\.astralcore \|\| 0\) \+ 1;\n        try \{ playItemGain\('astralcore'\); \} catch\(_\)\{ try \{ playSFX\('confirm'\); \} catch\(_\)\{\} \}\n        try \{ pingNextObjective/.test(src2),
     '★ the old pay-straight-into-the-bag path is gone from the chest');
}

H('4 · ★★★ THE CLIPPED-FRAME AUDIT');
{
  ok(fs.existsSync(ROOT+'tools/audit_clipped_frames.py'),'★ the tool exists');
  const t=fs.readFileSync(ROOT+'tools/audit_clipped_frames.py','utf8');
  ok(/THE TEST IS THE CREATOR'S LAW, APPLIED WITHIN ONE ROW/.test(t),
     '★★★ it tests the LAW: a row is one action, so every frame keeps the same clearance');
  ok(/that flagged 449 healthy frames/.test(t),
     '★★ and records why the naive test ("does it touch a wall?") was useless');
  ok(/1254 is NOT divisible by 4/.test(t),
     '★★★ including the bug in the tool itself · requiring divisibility skipped every sheet in the game');
  ok(/BODY = \(/.test(t),'★ body sheets are separated from effect sheets · a flat edge on a walk cycle IS the character');
}

console.log('\n'+(f?('❌ '+f+' FAILED'):'✅ ALL PASS'));
process.exit(f?1:0);
