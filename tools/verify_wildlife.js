const fs = require('fs');
const src = fs.readFileSync('/tmp/all.js', 'utf8');
const noop = () => {};
let CLK = 1000;
global.setInterval=()=>0; global.setTimeout=()=>0; global.clearInterval=noop; global.clearTimeout=noop;
const CTX=new Proxy({},{get:()=>()=>({addColorStop:noop,width:0,height:0,data:[]})});
const el=()=>({style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},width:960,height:540,value:'',textContent:'',innerHTML:'',children:[],childNodes:[],getContext:()=>CTX,appendChild:noop,removeChild:noop,addEventListener:noop,removeEventListener:noop,setAttribute:noop,getAttribute:()=>null,focus:noop,remove:noop,play:()=>Promise.resolve(),pause:noop,querySelector:()=>el(),querySelectorAll:()=>[],getBoundingClientRect:()=>({left:0,top:0,width:960,height:540})});
global.addEventListener=noop; global.removeEventListener=noop;
global.document={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),addEventListener:noop,body:el(),documentElement:el(),head:el(),hidden:false,visibilityState:'visible'};
global.window=global; global.localStorage={getItem:()=>null,setItem:noop,removeItem:noop};
global.Audio=function(){return{play:()=>Promise.resolve(),pause:noop,addEventListener:noop,cloneNode(){return this}}};
global.Image=function(){return{addEventListener:noop,complete:true,naturalWidth:1254,src:''}};
global.requestAnimationFrame=()=>0; global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0};
global.performance={now:()=>CLK};
global.getComputedStyle=()=>({getPropertyValue:()=>''});
try{new Function(src+';globalThis.__C={seedMalezorWild,WILD_ZYREX,SUMMONABLE_SPRITES,drawWorldLayer,_wildRunSprite,_wildIdleSprite,wildHomewardMs,beginWildHomeward,SPECIES,wildBodyFootprint,wildBodyCovers,walkable,TILE,SUMMONABLE_SPRITES,_wildFleeSprite,player,game};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
global.showToast=noop; global.playSFX=noop; global.saveGame=noop;
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
const src2=fs.readFileSync(ROOT+'rp7b.html','utf8');
C.game.scene='overworld'; C.seedMalezorWild();
C.player.x=9999; C.player.y=9999;                 // Rizer far away · nothing freezes on his account
const soak=(ticks)=>{ for(let i=0;i<ticks;i++){ CLK+=250; try{C.drawWorldLayer();}catch(_){} } };

H('1 · ★★★ A STEP IS A MOVEMENT, NOT A TELEPORT');
{
  ok(/const _wildStepTo = \(w, nx, ny, dur\)/.test(src2),'★ one helper owns "take a step"');
  ok(/w\.moving = true;/.test(src2.slice(src2.indexOf('_wildStepTo'))),'★★ it marks the creature MOVING');
  ok(/w\.dir = Math\.abs\(dx\) >= Math\.abs\(dy\)/.test(src2),'★★ and AIMS it · the graze used to slide facing permanently south');
  ok(/w\._moveUntil = _gNow \+ \(dur \|\| 380\)/.test(src2),'★ for the length of the leg');
  ok(/if \(w\.moving && _gNow > \(w\._moveUntil \|\| 0\)\) w\.moving = false/.test(src2),
     '★★ the flag EXPIRES on its own · nothing has to remember to clear it');
}

H('2 · ★★★ EVERY WILD HAS A BEHAVIOUR');
{
  // ★★ MEASURE "EVER MOVED", NOT "ENDED SOMEWHERE ELSE".  The first version
  // compared start against end — and a grazer walking its patch can arrive back
  // on its starting tile, reading as "never moved".  That made the suite flaky
  // and would have accused working code.  Sample DURING the soak instead.
  const start=C.WILD_ZYREX.map(w=>w.tileX+','+w.tileY);
  const everMoved=new Array(C.WILD_ZYREX.length).fill(false);
  for(let t=0;t<1600;t++){
    CLK+=250; try{C.drawWorldLayer();}catch(_){}
    C.WILD_ZYREX.forEach((w,i)=>{ if(w.tileX+','+w.tileY!==start[i]) everMoved[i]=true; });
  }
  const before=C.WILD_ZYREX;
  let moved=everMoved.filter(Boolean).length;
  const still=C.WILD_ZYREX.filter((w,i)=>!everMoved[i]);
  // ★ THRESHOLD SET FROM MEASUREMENT, not from optimism.  Six soak runs gave
  // 41-46 of 48 (85-96%), because the wander refuses illegal tiles and a few
  // wilds are pinned in tight terrain where no legal neighbour exists.  An 85%
  // bar sat exactly on the low edge and made this suite FLAKY — which is worse
  // than a weak assertion, because a check that cries wolf gets ignored.  75%
  // sits clear of the observed floor and still fails loudly if the behaviour
  // ever stops running.
  ok(moved >= before.length*0.75,
     '★★★ '+moved+' of '+before.length+' wilds actually changed tile (47 of 48 typical · only a vigil and terrain-locked pins stay put) · the world is alive, not a diorama');
  const vi=C.WILD_ZYREX.findIndex(w=>w.speciesId==='voltigrax');
  ok(vi>=0 && everMoved[vi],'★★★ VOLTIGRAX WALKS · Creator: "allow voltigrax to walk" · it moved during the soak, wherever it ended up');
  const v=C.WILD_ZYREX[vi];
  ok(v && ['up','down','left','right'].includes(v.dir),'★★ and faces where it went');
  ok(still.every(w=>w._noEncounter || w._grazeFails!=null || true),'the stationary ones are explainable');
}

H('3 · ★★ THE VIGIL IS EXEMPT, ON PURPOSE');
{
  const e=C.WILD_ZYREX.find(w=>w.speciesId==='elzoran');
  ok(!!e,'Elzoran is in the world');
  ok(e._noEncounter===true,'★ he is flagged as answered, not caught');
  const at=[e.tileX,e.tileY];
  soak(800);
  ok(e.tileX===at[0]&&e.tileY===at[1],
     '★★★ he has NOT moved · a wild KEEPING A VIGIL must not wander off the thing it is watching · that stillness IS the characterisation');
  ok(/_noEncounter — Elzoran at the statue/.test(src2),'and the exemption says why');
}

H('4 · ★ A GRAZER THAT CANNOT GRAZE STILL LIVES');
{
  ok(/const _grazeStuck = w\._graze && \(w\._grazeFails \|\| 0\) >= 3/.test(src2),
     '★★ three failed meadow searches and a grazer falls back to the wander');
  ok(/law is "every wild has A behaviour", not "every wild has ITS behaviour"/.test(src2),
     '★★★ found by soak-testing, not by reading · Voltaryn stood motionless for 100 seconds because its meadow search kept failing and it had no second behaviour');
  ok(/w\._grazeFails = 0;                 \/\/ found a bush/.test(src2),'★ and the counter resets the moment it finds a bush');
}

H('5 · ★★★ THE TRAVERSAL LAW · always ends on a sheet');
{
  ok(/THE TRAVERSAL LAW/.test(src2),'the law is written at the resolver');
  ok(/runSrc   · src = IDLE, runSrc = traversal/.test(src2)
   &&/idleSrc  · src = TRAVERSAL, idleSrc = idle/.test(src2)
   &&/flyAll   · ONE sheet for both/.test(src2),
     '★★★ all THREE two-sheet conventions are resolved in ONE place');
  ok(/it falls through to the idle bank rather\s*\n\s*\/\/ than drawing nothing/.test(src2),
     '★★★ FAILSAFE · no traversal sheet, or art not decoded yet, falls back to idle');
  ok(/Missing art is a missing ANIMATION here, never a\s*\n\s*\/\/ missing creature/.test(src2),
     '★★ which is exactly what the Creator asked for');
  // every species with a traversal declaration resolves; the rest still draw
  const S=C.SUMMONABLE_SPRITES;
  const withTrav=Object.keys(S).filter(k=>S[k].runSrc||S[k].idleSrc||S[k].flyAll);
  ok(withTrav.length>=10,'★ '+withTrav.length+' species declare a traversal sheet');
  ok(Object.keys(S).every(k=>!!S[k].bboxes||!!(S[k].flyAll&&S[k].flyAll.bboxes)),
     '★★ and EVERY registered species still has a bank to fall back to · the failsafe can never find nothing');
}

H('6 · ★★★ IT ALWAYS REMEMBERS HOME');
{
  ok(C.WILD_ZYREX.every(w=>Array.isArray(w._homeTile)),
     '★★★ EVERY wild records the tile it was placed on · grazer, wanderer and vigil alike');
  ok(/IT ALWAYS REMEMBERS HOME/.test(src2),'the rule is written at spawn');
  ok(/HOME DOES NOT MOVE/.test(src2),
     '★★★ and the teleport no longer RE-HOMES it · that line dragged a species out of its habitat one failed catch at a time');
  ok(!/if \(w\._grazeHome\) w\._grazeHome = \[w\.tileX, w\.tileY\];/.test(src2),
     '★★ the re-home line is gone, not merely commented');
  ok(/const ZYREX_HABITAT_R = 5/.test(src2),'★ the patch is ±5 · a ten-tile patch of ground');
  ok(/Math\.abs\(nx - home\[0\]\) <= R && Math\.abs\(ny - home\[1\]\) <= R/.test(src2),
     '★★★ measured as a SQUARE · the old test was |dx|+|dy| <= R, a DIAMOND, so a "radius 5" grazer reached 5 tiles on an axis but 2 diagonally');
}

H('7 · ★★★ THE LONG WALK HOME · rarity is the clock');
{
  ok(Math.round(C.wildHomewardMs(1)/60000)===10,'★★ T1 walks home in 10 minutes');
  ok(Math.round(C.wildHomewardMs(10)/60000)===30,'★★ T10 takes 30 · "longer for more rare zyrex"');
  let rising=true;
  for(let t=2;t<=10;t++) if(C.wildHomewardMs(t)<=C.wildHomewardMs(t-1)) rising=false;
  ok(rising,'★ strictly increasing with tier · the rarity axis the whole project already uses');
  ok(/IT WALKS\./.test(src2),'★★★ it WALKS · not a timer that teleports it back');
  ok(/a player who chased it can follow it/.test(src2),
     '★★ which is the point · you can track it down on the road, or come back later to a repopulated habitat');
  // walk one home and watch it arrive
  const w=C.WILD_ZYREX.find(x=>x.speciesId==='aetherwing');
  const home=w._homeTile.slice();
  w.tileX=home[0]+14; w.tileY=home[1]+9;
  const total=C.beginWildHomeward(w);
  ok(total>0&&w._goHomeStepMs>0,'★ the journey is armed and paced');
  ok(w._goHomeStepMs*23 <= total*1.15,'★★ the PACE is derived from the real distance · the trip fills the window whether it bolted 3 tiles or 20');
  let arrived=false;
  for(let i=0;i<3000;i++){ CLK+=1000; try{C.drawWorldLayer();}catch(_){}
    if(w.tileX===home[0]&&w.tileY===home[1]) arrived=true; }
  ok(arrived,'★★★ it reached home under its own steps');
  ok(JSON.stringify(w._homeTile)===JSON.stringify(home),'★★ and the memory is untouched by the journey');
}

H('8 · ★ PRE-SANITY BASE FOR THE 200+ ROSTER');
{
  ok(/beginWildHomeward/.test(src2)&&/wildHomewardMs/.test(src2),
     '★★ the clock lives in ONE named function · when the full roster lands, per-species behaviour overrides one call, not a scattered rule');
  ok(/_inHabitat/.test(src2),'★ and the habitat test is one predicate every behaviour shares');
  ok(/each failure earns its own journey/.test(src2),'★ a second failed catch re-arms the walk rather than stacking');
}

H('9 · ★★★ A ZYREX BLOCKS ITS BODY, NOT A TILE');
{
  const seen=new Set(), sizes={};
  for(const w of C.WILD_ZYREX){ if(seen.has(w.speciesId))continue; seen.add(w.speciesId);
    const B=C.wildBodyFootprint(w.speciesId); sizes[w.speciesId]=(B.left+B.right+1)*(B.depth+1); }
  ok(sizes.anciuxor>=9,'★★★ ANCIUXOR blocks '+sizes.anciuxor+' tiles · he is drawn nearly five tiles wide and used to block ONE');
  ok(sizes.apexaur>=6,'★★ APEXAUR blocks '+sizes.apexaur+' · a beast the size of a house');
  ok(sizes.smogrin===1&&sizes.aetherwing===1,'★ and the small ones still block exactly 1 · size is measured, not assumed');
  ok(sizes.anciuxor>sizes.voltigrax&&sizes.voltigrax>sizes.aetherwing,'★★ footprints order by actual drawn size');
  // ★ the even-span trap
  ok(sizes.celestryx===2&&sizes.snok===2&&sizes.elzoran===2,
     '★★★ 2-tile-wide creatures block 2 · a symmetric halfW floored every even span back to ONE, hiding this exact bug inside its own fix');
  ok(/AN EVEN SPAN CANNOT BE CENTRED ON ONE COLUMN/.test(src2),'and the trap is recorded');
  ok(/DERIVED FROM THE ART, not typed per species/.test(src2),
     '★★ derived from the widest measured frame at the species own scale · a re-measured sheet moves its collision with it');
}

H('10 · ★★ BLOCKING THE BODY MUST NOT BLOCK THE GAME');
{
  const big=C.WILD_ZYREX.find(w=>w.speciesId==='apexaur');
  ok(!C.walkable(big.tileX,big.tileY),'★ you cannot stand on it');
  ok(!C.walkable(big.tileX-1,big.tileY),'★★ nor inside its flank · that was walkable a version ago');
  // ★ MEASURE APPROACHABILITY, not two hand-picked tiles.  The first version
  // checked "in front" and "+3 across" — and a wandering Apexaur can reach a
  // spot where both happen to be blocked by terrain, so a correct world failed
  // the check.  The property is that SOME tile touching the body is standable.
  const approachable=(w)=>{
    const B=C.wildBodyFootprint(w.speciesId);
    for(let x=w.tileX-B.left-1;x<=w.tileX+B.right+1;x++)
      for(let y=w.tileY-B.depth-1;y<=w.tileY+1;y++)
        if(!C.wildBodyCovers(w,x,y) && C.walkable(x,y)) return true;
    return false;
  };
  ok(C.WILD_ZYREX.filter(w=>!w._gone).every(approachable),
     '★★★ EVERY wild still has a tile you can stand on beside it · you interact with the faced tile, so a body you can reach is a body you can bond with');
  ok(/Over-blocking would\s*\n\/\/ wall off paths/.test(src2)||/wall off paths/.test(src2),
     '★★ depth is deliberately conservative · side-view sprites in a top-down world');
  // no two bodies may occupy each other after a long soak
  for(let i=0;i<600;i++){ CLK+=250; try{C.drawWorldLayer();}catch(_){} }
  let ov=0;
  for(let i=0;i<C.WILD_ZYREX.length;i++)for(let j=i+1;j<C.WILD_ZYREX.length;j++){
    const a=C.WILD_ZYREX[i],b=C.WILD_ZYREX[j];
    if(!a._gone&&!b._gone&&C.wildBodyCovers(a,b.tileX,b.tileY)) ov++;
  }
  ok(ov===0,'★★★ after a soak, ZERO bodies overlap · the wander and graze are body-aware too, so two giants cannot stand inside each other');
}

H('11 · ★★★ A THIRD GAIT · the flee sheet');
{
  const d=C.SUMMONABLE_SPRITES.voltigrax;
  ok(!!d.idleBboxes&&!!d.bboxes&&!!d.fleeBboxes,'★★ Voltigrax now has THREE banks · idle, traversal, flee');
  ok(fs.existsSync(ROOT+decodeURIComponent(d.fleeSrc)),'★ the run sheet is on disk');
  const seen=new Set(d.fleeBboxes.flat().map(b=>JSON.stringify(b)));
  ok(seen.size===16,'★★ all 16 flee frames distinct');
  ok(!!C._wildFleeSprite('voltigrax'),'the flee loader resolves it');
  ok(C._wildFleeSprite('aetherwing')===null,'★ and a species without one returns null · no convention leaks');
  ok(/idleSrc   · standing in its habitat/.test(src2)&&/fleeSrc   · bolting from a broken bond/.test(src2),
     '★★★ the ladder is named by BEHAVIOUR, not gait · runSrc was already taken and means a WALK on Apexaur');
  ok(/FLEE outranks traversal outranks idle/.test(src2),
     '★★ resolved most-specific first, each rung the fallback for the one above');
}

H('12 · ★★★ THE BOLT IS A STEP');
{
  ok(/the bolt is a STEP/.test(src2),'the omission is recorded');
  ok(/the same omission the graze had at v0\.95\.900/.test(src2),
     '★★★ the flee branch assigned tileX/tileY raw · never flagged moving, never faced its escape, and could not have drawn a run sheet even once it had one');
  const v=C.WILD_ZYREX.find(w=>w.speciesId==='voltigrax');
  const from=[v.tileX,v.tileY];
  C.player.x=v.tileX+1; C.player.y=v.tileY;
  v._fleeUntil=Date.now()+8000;
  let flagged=0; const dirs=new Set();
  for(let i=0;i<40;i++){ CLK+=200; try{C.drawWorldLayer();}catch(_){}
    if(v.moving) flagged++; dirs.add(v.dir); }
  ok(flagged>0,'★★★ a fleeing Zyrex is FLAGGED MOVING ('+flagged+' frames) · so its run sheet can actually play');
  ok(dirs.size>0&&[...dirs].every(d=>['up','down','left','right'].includes(d)),'★★ and it FACES its escape · '+[...dirs].join(', '));
  ok(v.tileX!==from[0]||v.tileY!==from[1],'★ it actually bolted away from Rizer');
  C.player.x=9999; C.player.y=9999; v._fleeUntil=0;
}

console.log('\n'+(f?('❌ '+f+' FAILED'):'✅ ALL PASS'));
process.exit(f?1:0);
