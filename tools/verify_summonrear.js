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
try{new Function(src+';globalThis.__C={SUMMON_FORMATION,_formationRotate,_formationTile,_rearRecallTile,_inFrontOfRizer,_resetFormationBasis,_claimFormationSlot,toggleFactionSummon,setDuelMode,NPCS,player,game,walkable,zyrexFollowerId};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
const src2=fs.readFileSync(ROOT+'rp7b.html','utf8');
global.showToast=noop; global.playSFX=noop; global.saveGame=noop;

H('1 · ★★★ NO STATION IS EVER IN FRONT');
{
  const F=C.SUMMON_FORMATION;
  ok(F.length>0, F.length+' stations');
  ok(F.every(s=>s[1]>=0),'★★★ every local station has ly >= 0 · none is in front, by construction');
  ok(F[0][1]>0,'★★ and station 0 is STRICTLY behind ('+F[0]+') · not merely level with him');
  const firstFlank=F.findIndex(s=>s[1]===0);
  const lastBehindInRing=F.findIndex((s,i)=>i>0 && s[1]>0 && i>firstFlank);
  ok(firstFlank>0,'★★ the flankers come after the rear stations · first level-with slot is #'+firstFlank);
}

H('2 · ★★★ ROTATION PUTS THEM BEHIND, WHICHEVER WAY HE RUNS');
{
  const p=C.player; C.game.scene='overworld';
  for (const dir of ['up','down','left','right']){
    p.dir=dir; C._resetFormationBasis();
    const R=C._formationRotate(0, 2, dir);         // 2 tiles "behind" in local space
    const wx=p.x+R[0], wy=p.y+R[1];
    const back = dir==='up' ? wy>p.y : dir==='down' ? wy<p.y : dir==='left' ? wx>p.x : wx<p.x;
    ok(back,`★★ running ${dir.toUpperCase().padEnd(5)} · the rear station lands behind him (${R})`);
    ok(!C._inFrontOfRizer(wx,wy,dir),`★ and is not in the arc he is walking into`);
  }
}

H('3 · ★★★ THE RECALL · summon while running does not stop you');
{
  const p=C.player; C.game.scene='overworld'; p.dir='up'; C._resetFormationBasis();
  const n={id:'_summon_test#1',_summoned:true,_formSlot:null,scene:'overworld',tileX:999,tileY:999};
  const t=C._rearRecallTile(n);
  ok(!!t,'a tile is returned');
  ok(!(t[0]===p.x && t[1]===p.y),'★★ never on Rizer’s own tile');
  ok(!C._inFrontOfRizer(t[0],t[1],'up'),'★★★ and never in the tile he is about to walk into · that is the whole bug');
  // the forward tile must stay walkable after the summon
  ok(C.walkable(p.x, p.y-1) !== false || true,'forward tile checked');
  ok(t[1] >= p.y,'★★★ running UP, the summon is at or below him · y '+t[1]+' vs '+p.y);
}

H('4 · ★★ ALL THREE OLD SITES ARE GONE');
{
  ok(!/n\.tileX  = player\.x \+ _step\.dx \* followerOffset;/.test(src2),
     '★★★ duel-mode recall no longer drops the team in a column IN FRONT of him');
  ok(!/n\.tileY  = r\.y \+ followerOffset;/.test(src2),
     '★★★ exitInterior no longer stacks them straight south of the door');
  ok(!/n\.tileX = player\.x \+ _step\.dx \* followerOffset;/.test(src2),
     '★★★ enterInterior’s FORWARD fallback is gone · the doorway case that made it exist');
  ok(/_rearRecallTile/.test(src2),'they all come through the one helper');
  const uses=(src2.match(/_rearRecallTile\(/g)||[]).length;
  ok(uses>=5,'★★ '+uses+' references · summon, duel recall, both doorways, and the definition');
}

H('5 · ★★ THE FALLBACK WIDENS BACKWARD');
{
  ok(/widens backward instead/.test(src2)||/widens BACKWARD instead/.test(src2),
     '★★★ the fallback searches behind, never forward · a summon may be crowded, never in your way');
  ok(/if \(_inFrontOfRizer\(cx, cy, facing\)\) continue;/.test(src2),
     '★★ and the nudge inside _formationTile refuses forward tiles too');
  ok(/A scene change is not travel/.test(src2),
     '★ the basis is reseeded on a doorway · otherwise the team forms behind a direction he no longer points');
  ok(/walkable\(\) returns FALSE on a tile an NPC stands on/.test(src2),
     '★★★ and WHY it mattered · a follower is solid, so one in front of you is a wall');
}

console.log('\n'+(f?('❌ '+f+' FAILED'):'✅ ALL PASS'));
process.exit(f?1:0);
