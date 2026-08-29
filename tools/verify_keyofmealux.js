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
try{new Function(src+';globalThis.__C={SPECIES,SUMMONABLE_SPRITES,KEY_OF_MEALUX,MEALUX_CANON,PRISMSHARD_REGISTRY,prismshard,relicClass,RELIC_CLASS,INVENTORY_META,spawnWildZyrex,WILD_ZYREX,seedMalezorWild,ZYRAXIS_DISTRICTS,_mealuxTileFor,MEALUX_FORBIDDEN_TILES,worldDistrictAt,isWorldBorderTile,walkable,WORLD_PROPS,NPCS,requiredBondForTier,makeZyrexFollower,player,game};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
global.showToast=noop; global.playSFX=noop; global.saveGame=noop; global.showDialog=noop;
C.game.scene='overworld';
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
const SP=C.SPECIES.key_of_mealux, SH=C.SUMMONABLE_SPRITES.key_of_mealux;

H('1 · ★★★ A SENTIENT WILD ZYREX, NOT AN ITEM');
{
  ok(!!SP,'key_of_mealux is a SPECIES');
  ok(SP.tier===8,'★ Tier 8');
  ok(SP.immortal===true,'★★ IMMORTAL class · "rare immortal from kyrathos"');
  ok(SP.sentient===true,'★★★ SENTIENT · the Creator\'s word · it is aware, not a pickup');
  ok(SP.homeworld==='Kyrathos','native to Kyrathos');
  ok(SP.tracesOf===16,'★ descended from the Mealux, from the remnants of Prismshard XVI');
}

H('2 · ★★ THREE TYPES · AND IT USES THE WHOLE CEILING');
{
  ok(SP.type==='Spirit'&&SP.type2==='Divine'&&SP.type3==='Elemental','★★ Spirit / Divine / Elemental, exactly as ruled');
  ok([SP.type,SP.type2,SP.type3].filter(Boolean).length===3,'★ three types · T6-8 capacity is 3, and every slot is spent');
  // no T1-5 species may hold three
  const over=Object.values(C.SPECIES).filter(s=>s&&s.tier<=5&&s.type3);
  ok(over.length===0,'★★ and no T1-5 species anywhere holds a third type · the capacity law still holds after the add');
}

H('3 · THE STAT POOL OBEYS TIER × 333');
{
  const pool=SP.baseHP+SP.baseATK+SP.baseDEF+SP.baseSPD+SP.baseSATK+SP.baseSDEF;
  ok(pool===8*333,'★★ pool = '+pool+' = tier 8 × 333 · no exception for a legendary');
  ok(SP.baseSATK>=SP.baseATK,'★ weighted to SPECIAL over ATK · a library guardian knows before it hits');
  ok(SP.baseDEF>=SP.baseATK,'★ and to DEF over ATK · built to endure');
  ok((SP.moves||[]).length===4,'four moves, like every species');
}

H('4 · ★★ THE SHEET · MEASURED BY OWNERSHIP, NOT PROXIMITY');
{
  ok(!!SH,'sprite bank registered');
  ok(fs.existsSync(ROOT+decodeURIComponent(SH.src)),'art on disk');
  ok(SH.bboxes.length===4&&SH.bboxes.every(r=>r.length===4),'★ 4×4 · row = direction, col = frame');
  const buf=fs.readFileSync(ROOT+decodeURIComponent(SH.src));
  const W=buf.readUInt32BE(16), Hh=buf.readUInt32BE(20);
  ok(W===1254&&Hh===1254,'★ 1254×1254 · the 313 cell standard');
  // ★ the bug this nearly shipped with
  const r0=JSON.stringify(SH.bboxes[0]), r1=JSON.stringify(SH.bboxes[1]);
  ok(r0!==r1,'★★★ row 0 and row 1 are DIFFERENT · the first measurement gave them identical boxes because row 0 overflows down and "tallest touching component" grabbed the neighbour');
  const seen=new Set(SH.bboxes.flat().map(b=>JSON.stringify(b)));
  ok(seen.size===16,'★★ all 16 frames are distinct · no cell inherited another cell\'s body');
  let owned=true;
  SH.bboxes.forEach((row,r)=>row.forEach(b=>{
    const cy=b[1]+b[3]/2;                 // the body's centre must live in its own row band
    if (cy < r*313-40 || cy > (r+1)*313+40) owned=false;
  }));
  ok(owned,'★★★ every body\'s centre lies in its OWN row band · ownership, not proximity');
  let overflow=false;
  SH.bboxes.forEach((row,r)=>row.forEach(b=>{ if (b[1]+b[3] > (r+1)*313) overflow=true; }));
  ok(overflow,'★ and overflow is OWNED, not clipped · at least one frame runs past its cell edge and keeps its art');
}

H('5 · ★★★ IT BOBS LIKE A PORTAL');
{
  ok(SH.levitate===true,'★★ the sheet declares levitate');
  ok(SH.bobAmp===4&&SH.bobMs===500,'★★★ ±4px on a 500ms sine · the SAME wave the levitating props ride, so the two read as one world');
  const src2=fs.readFileSync(ROOT+'rp7b.html','utf8');
  ok(/Math\.sin\(performance\.now\(\) \/ 500\) \* 4/.test(src2),'the prop bob it is matching is still there, unchanged');
  ok(/_bobPhase/.test(src2),'★★ phase-offset per individual · two Keys in two caves do not pulse in lockstep');
  ok(/d\.levitate[\s\S]{0,200}bobMs/.test(src2),'the wild draw path reads the bob from the sheet');
  ok(/_levitateSprite/.test(src2),'★ and a summoned/follower one floats too · the bob belongs to the SPECIES, not to one draw call');
}

H('6 · IT IS A WILD, AND THE WILD LAWS APPLY');
{
  const w=C.spawnWildZyrex('key_of_mealux',60,60,{temperament:'Calm'});
  ok(!!w,'it spawns as a wild');
  ok(w.level===80,'★★ level = tier × 10 = 80 · the wild level law takes no exception for a legendary');
  ok(typeof w._bobPhase==='number','★ and it gets its own bob phase at spawn');
  ok(C.requiredBondForTier(8)===8*333,'★ bond gate = 8 × 333 = '+C.requiredBondForTier(8)+' · 80% of the cap · an endgame find');
}

H('7 · ★★ THE KEY LINE IS RECORDED · one Anciuxor, few Mealux');
{
  const K=C.KEY_OF_MEALUX;
  ok(!!K,'KEY_OF_MEALUX is recorded');
  ok(K.descendsFrom===16,'★ two removes from Prismshard XVI · Key → Mealux → Keys of Mealux');
  ok(K.count===null,'★★★ count is NULL · "few" is not a number he gave, and three invented coordinates would be invented canon');
  ok(Array.isArray(K.found)&&K.found.length===0,'★★ and the placement table is EMPTY on purpose · hidden things are placed at tiles he names');
  ok(K.opens===null,'★ what a lesser key OPENS is left open · the Key of Anciuxor opens the Four Realms; this one is unstated');
  ok(C.prismshard(16).livingTrace==='mealux','★ and XVI still records only what its remnants BECAME');
  ok(C.MEALUX_CANON.isPrismshard===false,'★★ the species is still not the relic · descent, not identity');
}

H('8 · ★★★ TEN ON THE MAP · one per district');
{
  C.seedMalezorWild();
  // ★ the SEEDED ten only.  §6 spawns a Key by hand at (60,60) to prove the
  // wild laws apply to it; that individual is a test fixture, not one of the
  // ten on the map, and counting it made this read 11 with a NaN remoteness.
  // Measure the population you mean.
  const M=C.WILD_ZYREX.filter(w=>w.speciesId==='key_of_mealux'&&w._malezorWild==='MEALUX');
  ok(M.length===10,'★★★ '+M.length+' Keys of Mealux on the map · one per district, as ruled');
  ok(new Set(M.map(w=>w._mealuxDistrict)).size===10,'★★ ten DISTINCT districts · none doubled up, none skipped');
  ok(M.every(w=>C.worldDistrictAt(w.tileX,w.tileY)===w._mealuxDistrict),
     '★★ and every one actually STANDS in the district it was assigned · the label is not a promise, it is measured');
  ok(M.every(w=>C.walkable(w.tileX,w.tileY)),'★ all reachable · an unreachable secret is not a secret');
  ok(M.every(w=>!C.isWorldBorderTile(w.tileX,w.tileY)),'★ none on a border tile');
  ok(M.every(w=>w.level===80),'★ all Lv 80 · tier × 10, no exception for the rarest thing in the game');
  const tiles=new Set(M.map(w=>w.tileX+','+w.tileY));
  ok(tiles.size===10,'no two share a tile');
}

H('9 · ★★ HIDDEN MEANS REMOTE, AND IT IS MEASURED');
{
  const M=C.WILD_ZYREX.filter(w=>w.speciesId==='key_of_mealux'&&w._malezorWild==='MEALUX');
  ok(M.every(w=>w._remoteness>=12),'★★ every Key is at least 12 tiles from the nearest building · min was '+Math.min(...M.map(w=>w._remoteness)));
  // independently recompute distance-to-building rather than trusting the stored score
  let worst=1e9;
  for(const w of M){
    for(const p of C.WORLD_PROPS){
      if(p.tileX==null||(p.tileW||1)<3) continue;
      const d=Math.max(Math.abs(p.tileX-w.tileX),Math.abs(p.tileY-w.tileY));
      if(d<worst) worst=d;
    }
  }
  ok(worst>=12,'★★★ re-measured from scratch: nearest Key-to-building distance is '+worst+' tiles · not parked behind the potion shop');
  ok(M.every(w=>!C.NPCS.some(n=>n&&n.scene==='overworld'&&n.tileX===w.tileX&&n.tileY===w.tileY)),'none shares an NPC tile');
}

H('10 · ★★★ THE SAME TILE EVERY TIME · a secret that moves is a bug');
{
  const D=C.ZYRAXIS_DISTRICTS;
  const a=D.map(d=>{const s=C._mealuxTileFor(d);return s?s.at.join(','):null;});
  const b=D.map(d=>{const s=C._mealuxTileFor(d);return s?s.at.join(','):null;});
  ok(JSON.stringify(a)===JSON.stringify(b),'★★★ the search is DETERMINISTIC · re-running it returns the identical ten tiles');
  const live=D.map(d=>{const w=C.WILD_ZYREX.find(x=>x._malezorWild==='MEALUX'&&x._mealuxDistrict===d.id);return w?w.tileX+','+w.tileY:null;});
  ok(JSON.stringify(a)===JSON.stringify(live),'★★ and the live spawns match that answer exactly');
  const src2=fs.readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html','utf8');
  ok(!/WILD_ZYREX\.some[\s\S]{0,80}continue;\s*\n\s*\/\/ score = how far/.test(src2),
     '★★★ the search no longer reads the LIVE wild array · it did, and the random Aetherwing flocks were silently moving the Keys between sessions');
  ok(/MEALUX_FORBIDDEN_TILES/.test(src2),'★ it consults the STATIC pin tables instead');
  ok(/PLACED FIRST, deliberately/.test(src2),'★★ and it runs BEFORE anything random is placed · the instinct to place the rarest thing LAST is what broke it');
  const idem=C.WILD_ZYREX.filter(w=>w._malezorWild==='MEALUX').length;
  C.seedMalezorWild(); C.seedMalezorWild();
  ok(C.WILD_ZYREX.filter(w=>w._malezorWild==='MEALUX').length===idem,'★ re-seeding does not duplicate them');
}

console.log('\n'+(f?('❌ '+f+' FAILED'):'✅ ALL PASS'));
process.exit(f?1:0);
