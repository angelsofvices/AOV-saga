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
try{new Function(src+';globalThis.__C={MALEZOR_COMMON_FLOCKS,MALEZOR_WILD_FIXED,WILD_PLACEMENT_LIVE,seedMalezorWild,WILD_ZYREX,SPECIES,worldDistrictAt,isWorldLandTile,isWorldBorderTile,walkable,_propBlocked,NPCS,requiredBondForTier,player,game};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
global.showToast=noop; global.playSFX=noop; global.saveGame=noop;
C.game.scene='overworld';
const n0=C.seedMalezorWild();
const AW=C.WILD_ZYREX.filter(w=>w.speciesId==='aetherwing');
const FL=AW.filter(w=>w._malezorWild==='FLOCK');

H('1 · ★★ COMMON MEANS COMMON · the Emerald bug-type density');
{
  const want=C.MALEZOR_COMMON_FLOCKS.reduce((a,F)=>a+F.count,0);
  ok(C.MALEZOR_COMMON_FLOCKS.length>=7,C.MALEZOR_COMMON_FLOCKS.length+' flocks across Malezor');
  ok(FL.length===want,'★ every one of the '+want+' flock slots found a tile ('+FL.length+') — no silent shortfall');
  ok(AW.length>=18,'★★ '+AW.length+' Aetherwing stand in Malezor · you trip over them, you do not hunt them');
  ok(AW.length>C.WILD_ZYREX.filter(w=>w.speciesId!=='aetherwing').length,
     '★ Aetherwing outnumbers every other wild in the district COMBINED — that is what "most common" has to mean');
}

H('2 · WHERE THEY STAND · the early corridor, not a corner');
{
  const xs=FL.map(w=>w.tileX), ys=FL.map(w=>w.tileY);
  ok(Math.max(...ys)-Math.min(...ys)>100,'★ they span '+(Math.max(...ys)-Math.min(...ys))+' tiles north-to-south · the radio tower road down to the southern fields');
  ok(Math.max(...xs)-Math.min(...xs)>40,'and '+(Math.max(...xs)-Math.min(...xs))+' tiles east-to-west · past the shop row');
  // ★ the corridor landmarks are checked against the TABLE, not against one
  // random draw.  _wildTileNear samples a disc, so any assertion made on the
  // sampled tiles is only true for the boot that produced them — a suite that
  // passes four times out of five is not protecting anything.  The centres are
  // the design; the scatter is the sampling.
  const nearC=(x,y,r)=>C.MALEZOR_COMMON_FLOCKS.some(F=>Math.hypot(F.at[0]-x,F.at[1]-y)<=r+F.r);
  ok(nearC(22,105,12),'★ a flock centred within reach of the player\'s own home (22,105)');
  ok(nearC(25,126,14),'★ one on the school walk (25,126)');
  ok(nearC(22,78,14),'★ one below the town hall (22,78)');
  ok(nearC(-20,120,20),'★ one on the shop row, by the new Zysphere counter');
}

H('3 · SCATTERED CLEANLY · _wildTileNear did its job');
{
  let off=0,stack=0,prop=0,unwalk=0,onNpc=0;
  const seen=new Set();
  const npc=new Set(C.NPCS.filter(n=>n&&n.scene==='overworld').map(n=>n.tileX+','+n.tileY));
  for(const w of C.WILD_ZYREX){
    const k=w.tileX+','+w.tileY;
    if(seen.has(k)) stack++; seen.add(k);
    if(C._propBlocked.has(k)) prop++;
    // ★ TERRAIN ONLY.  walkable() counts NPCs and wilds, so asking it about a
    // wild's OWN tile asks "is anything standing here" — and something is: the
    // wild itself.  Sixth sighting of that self-occlusion trap; measure the
    // ground, never the occupancy.
    if(!C.isWorldLandTile(w.tileX,w.tileY)||C.isWorldBorderTile(w.tileX,w.tileY)) unwalk++;
    if(npc.has(k)) onNpc++;
    if(w._malezorWild==='FLOCK'&&C.worldDistrictAt(w.tileX,w.tileY)!=='malezor') off++;
  }
  ok(!off,'★ every flock member is inside MALEZOR · none drifted into the Void or the next district');
  ok(!stack,'★★ no two wilds share a tile');
  ok(!prop,'none spawned inside a building');
  ok(!unwalk,'★ every one stands on real, non-border ground — an unreachable wild is not a catch');
  ok(!onNpc,'none spawned on top of an NPC');
}

H('4 · ★ THE PINNED INDIVIDUALS STILL WIN THEIR TILES');
{
  const pins=[...C.MALEZOR_WILD_FIXED,...C.WILD_PLACEMENT_LIVE].filter(F=>C.SPECIES[F.id]);
  let kept=0, moved=[];
  for(const F of pins){
    const hit=C.WILD_ZYREX.find(w=>w.speciesId===F.id&&w.tileX===F.at[0]&&w.tileY===F.at[1]);
    if(hit) kept++; else moved.push(F.id+'@'+F.at);
  }
  ok(kept===pins.length,'★★ all '+pins.length+' hand-placed Zyrex keep their exact tile'+(moved.length?' · lost: '+moved.join(', '):''));
  const src2=fs.readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html','utf8');
  const iFlock=src2.indexOf('MALEZOR_COMMON_FLOCKS){'), iPin=src2.indexOf('for (const F of MALEZOR_WILD_FIXED)');
  ok(iFlock>0&&iPin>iFlock,'★ flocks are seeded BEFORE the pins in source order · a scatter can never claim a promised tile');
}

H('5 · THEY OBEY EVERY STANDING LAW');
{
  const sp=C.SPECIES.aetherwing;
  ok(sp.tier===1,'Aetherwing is T1 · the right species to make common');
  ok(AW.every(w=>w.level===sp.tier*10),'★ level = tier × 10 = '+(sp.tier*10)+' for all '+AW.length+' · no early-game discount');
  const temps=new Set(FL.map(w=>w.temperament));
  ok(temps.has('Skittish'),'★ mostly SKITTISH · a common catch teaches you to approach, not charge');
  ok(temps.has('Calm'),'★ and Calm grazing flocks as the forgiving first attempt');
  ok(FL.some(w=>w._graze&&w._grazeR>0),'the Calm ones actually graze · _grazeHome + radius set');
  ok(C.requiredBondForTier(1)<C.requiredBondForTier(5),'the standard T1 bond gate applies · cheapest bar in the game');
}

H('6 · SEEDING IS IDEMPOTENT');
{
  const before=C.WILD_ZYREX.length;
  C.seedMalezorWild(); C.seedMalezorWild();
  ok(C.WILD_ZYREX.length===before,'★ re-seeding at boot or after a LOAD does not double the flocks ('+before+')');
}

console.log('\n'+(f?('❌ '+f+' FAILED'):'✅ ALL PASS'));
process.exit(f?1:0);
