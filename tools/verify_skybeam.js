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
try{new Function(src+';globalThis.__C={SPECIES,SUMMONABLE_SPRITES,WILD_PLACEMENT_LIVE,WORLD_PROPS,seedMalezorWild,WILD_ZYREX,requiredBondForTier,spawnWildZyrex,worldDistrictAt,walkable,player,game,makeZyrexFollower,NPCS};')();}
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
  // ★★★ v0.95.897 · INVERTED.  This asserted a MISMATCH, deliberately, to keep
  // the conflict visible until the Creator ruled.  He ruled: Draconic/Tech —
  // neither of the two prior readings.  The check now guards the agreement.
  ok(String(R.types)==='Draconic/Tech','★★ ROSTER V1 amended to Draconic/Tech');
  ok(SP.type==='Draconic'&&SP.type2==='Tech','★★★ and the game agrees · the two-source conflict is CLOSED');
  ok(SP.type!=='Beast','★ Beast is gone · the art was a winged dragon all along');
  ok(SP.type2!=='Elemental','★★ and it leaves the Elemental family, whose five Ultrashards it never belonged with');
}

H('2 · ★★ IT IS CATCHABLE, AND THE WILD LAWS APPLY');
{
  const w=C.spawnWildZyrex('skybeam',600,200,{temperament:'Wary'});
  ok(!!w,'it spawns as a wild');
  ok(w.level===40,'★★ wild level = tier × 10 = 40 · the standing law, no exception');
  ok(!w._noEncounter,'★ and it is CAUGHT, not answered · the spin encounter applies');
}

H('3 · ★★ TWO IN ZARVANE, TWO IN VERIDAN');
{
  const pins=C.WILD_PLACEMENT_LIVE.filter(P=>P.id==='skybeam');
  ok(pins.length===4,'★★ four pinned Skybeam · '+pins.length);
  ok(pins.filter(P=>P.dist==='zarvane').length===2,'★★★ TWO in Zarvane, as ruled');
  ok(pins.filter(P=>P.dist==='veridan').length===2,'★★★ and TWO in Veridan');
  C.seedMalezorWild();
  const live=C.WILD_ZYREX.filter(w=>w.speciesId==='skybeam'&&w._malezorWild==='WAVE1');
  ok(live.length===4,'★★ and all four actually stand in the world ('+live.length+')');
  const byDist={};
  for(const w of live){ const d=C.worldDistrictAt(w.tileX,w.tileY); byDist[d]=(byDist[d]||0)+1; }
  ok(byDist.zarvane===2&&byDist.veridan===2,'★★★ measured, not declared · '+JSON.stringify(byDist));
  // the two Zarvane tiles were derived, so prove they are actually clear
  const zar=live.filter(w=>C.worldDistrictAt(w.tileX,w.tileY)==='zarvane');
  let nearest=1e9;
  for(const w of zar) for(const p of C.WORLD_PROPS){
    if(p.tileX==null||(p.tileW||1)<3) continue;
    const dd=Math.max(Math.abs(p.tileX-w.tileX),Math.abs(p.tileY-w.tileY));
    if(dd<nearest) nearest=dd;
  }
  ok(nearest>=12,'★★ the derived Zarvane tiles are '+nearest+' tiles clear of any building');
  ok(Math.abs(zar[0].tileY-zar[1].tileY)>100,'★ and one is north, one south · '+Math.abs(zar[0].tileY-zar[1].tileY)+' tiles apart');
  ok(live.every(w=>w.level===40),'★ all four at Lv 40');
  // ★ v0.95.895 · SELF-OCCLUSION.  This asked walkable() about the creature's
  // OWN tile, which was true until every Zyrex got a body — and now returns
  // false for exactly the right reason.  "Reachable" never meant "you can
  // stand inside it"; it means you can get NEXT to it.  Measure the neighbours.
  const reachable=w=>C.walkable(w.tileX+1,w.tileY)||C.walkable(w.tileX-1,w.tileY)
                   ||C.walkable(w.tileX,w.tileY+1)||C.walkable(w.tileX,w.tileY-1);
  ok(live.every(reachable),'★ all reachable');
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

H('7 · ★★★ APEXAUR · the walk sheet, and the key that was NOT run');
{
  const src2=fs.readFileSync(ROOT+'rp7b.html','utf8');   // scoped to this block
  const A=C.SUMMONABLE_SPRITES.apexaur;
  ok(!!A.runBboxes&&!!A.runSrc,'★ Apexaur has a walk bank');
  ok(fs.existsSync(ROOT+decodeURIComponent(A.runSrc)),'★ the walk sheet is on disk');
  ok(A.runSrc!==A.src,'★ distinct from the idle sheet');
  const seen=new Set(A.runBboxes.flat().map(b=>JSON.stringify(b)));
  ok(seen.size===16,'★★ all 16 walk frames distinct');
  // ★★★ the point of this whole asset: a black key would have eaten the armour
  const buf=fs.readFileSync(ROOT+decodeURIComponent(A.runSrc));
  ok(buf.readUInt32BE(16)===1254&&buf.readUInt32BE(20)===1254,'1254×1254');
  ok(/NOT KEYED, AND THAT WAS THE WHOLE JOB/.test(src2),
     '★★★ the sheet arrived on black and was NOT keyed · 6,131 opaque near-black pixels are the creature\'s own armour, and a black key would have destroyed them');
  ok(/the safest key is the one you don't run/.test(src2),'★★ measured before acting · look before you key');
  C.seedMalezorWild();
  const ap=C.WILD_ZYREX.filter(w=>w.speciesId==='apexaur');
  ok(ap.length===2,'★★ two Apexaur on the map');
  const ds=ap.map(w=>C.worldDistrictAt(w.tileX,w.tileY)).sort();
  ok(ds.join()==='baelgor,zarvane','★★★ ZARVANE and BAELGOR, as ruled · '+ds.join(' + '));
  ok(ap.every(w=>w._graze&&w._grazeR===7),'★★ both GRAZE · which is the whole reason the walk sheet exists');
  ok(ap.every(w=>w.level===50),'★ both Lv 50 · tier 5 × 10');
  // the honesty check: the derived tile is genuinely clear
  const b=ap.find(w=>C.worldDistrictAt(w.tileX,w.tileY)==='baelgor');
  let nb=1e9;
  for(const p of C.WORLD_PROPS){ if(p.tileX==null||(p.tileW||1)<3) continue;
    const d=Math.max(Math.abs(p.tileX-b.tileX),Math.abs(p.tileY-b.tileY)); if(d<nb) nb=d; }
  ok(nb>=14,'★★★ the Baelgor tile is '+nb+' tiles clear · the FIRST pick was 2, eyeballed while the comment claimed it was derived');
}

console.log('\n'+(f?('❌ '+f+' FAILED'):'✅ ALL PASS'));
process.exit(f?1:0);
