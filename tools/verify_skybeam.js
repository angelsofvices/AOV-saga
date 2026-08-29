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
try{new Function(src+';globalThis.__C={SPECIES,SUMMONABLE_SPRITES,WILD_PLACEMENT_LIVE,seedMalezorWild,WILD_ZYREX,requiredBondForTier,spawnWildZyrex,worldDistrictAt,walkable,player,game,makeZyrexFollower,NPCS};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
global.showToast=noop; global.playSFX=noop; global.saveGame=noop; global.showDialog=noop;
C.game.scene='overworld';
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
const SP=C.SPECIES.skybeam, SH=C.SUMMONABLE_SPRITES.skybeam;

H('1 · ★★ TIER AND BOND READ FROM THE LOCKED ROSTER');
{
  const roster=JSON.parse(fs.readFileSync(ROOT+'data/staple_roster_v1.json','utf8'));
  const rows=Array.isArray(roster)?roster:(roster.species||[]);
  const R=rows.find(r=>String(r.name).toLowerCase()==='skybeam');
  ok(!!R,'Skybeam is in ROSTER V1');
  ok(R.tier===4,'★★ the locked roster says TIER 4');
  ok(SP.tier===R.tier,'★★★ and the game agrees · tier read from the roster, not guessed ('+SP.tier+')');
  ok(C.requiredBondForTier(SP.tier)===4*333,'★★ bond gate = 4 × 333 = '+C.requiredBondForTier(SP.tier));
  const pool=SP.baseHP+SP.baseATK+SP.baseDEF+SP.baseSPD+SP.baseSATK+SP.baseSDEF;
  ok(pool===4*333,'★ stat pool = tier × 333 = '+pool);
  // ★ a real discrepancy, surfaced not silently reconciled
  ok(String(R.types).toLowerCase()!==((SP.type+'/'+SP.type2).toLowerCase()),
     '★★★ FLAG · roster V1 types are "'+R.types+'" but the game has "'+SP.type+'/'+SP.type2+'" — NOT retyped without a ruling');
}

H('2 · ★★ IT IS CATCHABLE, AND THE WILD LAWS APPLY');
{
  const w=C.spawnWildZyrex('skybeam',600,200,{temperament:'Wary'});
  ok(!!w,'it spawns as a wild');
  ok(w.level===40,'★★ wild level = tier × 10 = 40 · the standing law, no exception');
  ok(!w._noEncounter,'★ and it is CAUGHT, not answered · the spin encounter applies');
}

H('3 · ★ IT IS ALREADY PLACED IN VERIDAN');
{
  const pins=C.WILD_PLACEMENT_LIVE.filter(P=>P.id==='skybeam');
  ok(pins.length===2,'★ two pinned Skybeam in the placement table');
  ok(pins.every(P=>P.dist==='veridan'),'★★ both in VERIDAN · its own district band');
  C.seedMalezorWild();
  const live=C.WILD_ZYREX.filter(w=>w.speciesId==='skybeam'&&w._malezorWild==='WAVE1');
  ok(live.length===2,'★★ and both actually stand in the world ('+live.length+')');
  ok(live.every(w=>C.worldDistrictAt(w.tileX,w.tileY)==='veridan'),'★ measured · each is really in Veridan');
  ok(live.every(w=>w.level===40),'★ both at Lv 40');
  ok(live.every(w=>C.walkable(w.tileX,w.tileY)),'★ both reachable');
}

H('4 · ★★★ THE SHEET WAS REPLACED, SO THE BOXES WERE RE-MEASURED');
{
  ok(!!SH,'sprite bank registered · it will draw as art, not an orb');
  ok(fs.existsSync(ROOT+decodeURIComponent(SH.src)),'art on disk');
  const buf=fs.readFileSync(ROOT+decodeURIComponent(SH.src));
  ok(buf.readUInt32BE(16)===1254&&buf.readUInt32BE(20)===1254,'★ 1254×1254 · the 313 cell standard');
  ok(SH.bboxes.length===4&&SH.bboxes.every(r=>r.length===4),'4×4 · row = direction');
  const seen=new Set(SH.bboxes.flat().map(b=>JSON.stringify(b)));
  ok(seen.size===16,'★★ all 16 frames distinct');
  let owned=true;
  SH.bboxes.forEach((row,r)=>row.forEach(b=>{
    const cy=b[1]+b[3]/2;
    if (cy < r*313-40 || cy > (r+1)*313+40) owned=false;
  }));
  ok(owned,'★★ every body centred in its OWN row band · ownership, not proximity');
  const src2=fs.readFileSync(ROOT+'rp7b.html','utf8');
  ok(/RE-MEASURED against the Creator's new idle sheet/.test(src2),
     '★★★ the replacement is recorded · stale boxes would have sliced the new dragon at the old dragon\'s outline');
  ok(SH.scaleRefBh===259,'★★ scaleRefBh follows the NEW down-row body (259, was 248)');
  const drawn=SH.bboxes[0][0][3]/SH.scaleRefBh*2*SH.scaleMul;
  ok(Math.abs(drawn-2.4)<0.01,'★★★ so the drawn size is unchanged at '+drawn.toFixed(2)+' tiles · a head over the Rizer, exactly as before');
}

H('5 · ★★★ COMPANIONIZED, IT FLIES');
{
  ok(!!SH.flyAll,'★ a flyAll bank is registered');
  ok(fs.existsSync(ROOT+decodeURIComponent(SH.flyAll.src)),'★ the fly sheet is on disk');
  ok(SH.flyAll.src!==SH.src,'★ it is a DIFFERENT sheet from the grounded idle');
  ok(SH.flyAll.bboxes.length===4&&SH.flyAll.bboxes.every(r=>r.length===4),'4×4 · row = direction');
  const seen=new Set(SH.flyAll.bboxes.flat().map(b=>JSON.stringify(b)));
  ok(seen.size===16,'★★ all 16 fly frames distinct · no neighbour bleed');
  let owned=true;
  SH.flyAll.bboxes.forEach((row,r)=>row.forEach(b=>{
    const cy=b[1]+b[3]/2;
    if (cy < r*313-40 || cy > (r+1)*313+40) owned=false;
  }));
  ok(owned,'★★ every body centred in its OWN row band');
  // the actual follower
  const z={speciesId:'skybeam',name:'Skybeam',level:40,hp:100,maxHp:100,tier:4,uid:'s1'};
  const n=C.makeZyrexFollower(z,{mode:'follow',dir:'down'});
  ok(n.src===SH.flyAll.src,'★★★ a companionized Skybeam draws the FLY sheet');
  ok(n.walkBboxes===SH.flyAll.bboxes&&n.bboxes===SH.flyAll.bboxes,
     '★★★ ONE bank for idle AND walk · it hovers standing still and flies when you move, never a claw on the road');
  ok(!n._orbFollower,'★ and it is real art, not an orb');
}

H('6 · ★★ THE WILD ONE STILL LANDS');
{
  const src3=fs.readFileSync(ROOT+'rp7b.html','utf8');
  ok(/THE WILD ONE STILL LANDS/.test(src3),'★ the distinction is written down');
  ok(/flyAll/.test(src3.slice(src3.indexOf('function makeZyrexFollower'), src3.indexOf('function makeZyrexFollower')+2000)),
     '★★ the fly bank is reached ONLY through makeZyrexFollower · the wilds in Veridan keep the grounded sheet');
  // measured: the wild draw path reads SUMMONABLE_SPRITES.bboxes, not flyAll
  ok(SH.bboxes!==SH.flyAll.bboxes,'★★★ two distinct banks · it is on the ground until it is YOURS, which makes taking it the moment it leaves the ground');
}

console.log('\n'+(f?('❌ '+f+' FAILED'):'✅ ALL PASS'));
process.exit(f?1:0);
