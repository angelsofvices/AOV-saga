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
try{new Function(src+';globalThis.__C={SPECIES,SUMMONABLE_SPRITES,MEALUX_CANON,PRISMSHARD_REGISTRY,prismshard,relicClass,RELIC_CLASS,INVENTORY_META,spawnWildZyrex,WILD_ZYREX,gemlordCavesOpen,tryEnterGemlordCave,GEMLORD_CAVE_INTERIORS,addZyrexToRoster,WORLD_PROPS,rizerBondTotal,seedMalezorWild,ZYRAXIS_DISTRICTS,_mealuxTileFor,MEALUX_DISTRICTS,MEALUX_FORBIDDEN_TILES,worldDistrictAt,isWorldBorderTile,walkable,WORLD_PROPS,NPCS,requiredBondForTier,makeZyrexFollower,player,game};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
global.showToast=noop; global.playSFX=noop; global.saveGame=noop; global.showDialog=noop;
C.game.scene='overworld';
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
const src2=fs.readFileSync(ROOT+'rp7b.html','utf8');
const SP=C.SPECIES.mealux, SH=C.SUMMONABLE_SPRITES.mealux;

H('1 · ★★★ A SENTIENT WILD ZYREX, NOT AN ITEM');
{
  ok(!!SP,'mealux is a SPECIES');
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
  ok(/Math\.sin\(performance\.now\(\) \/ 500\) \* 4/.test(src2),'the prop bob it is matching is still there, unchanged');
  ok(/_bobPhase/.test(src2),'★★ phase-offset per individual · two Keys in two caves do not pulse in lockstep');
  ok(/d\.levitate[\s\S]{0,200}bobMs/.test(src2),'the wild draw path reads the bob from the sheet');
  ok(/_levitateSprite/.test(src2),'★ and a summoned/follower one floats too · the bob belongs to the SPECIES, not to one draw call');
}

H('6 · IT IS A WILD, AND THE WILD LAWS APPLY');
{
  const w=C.spawnWildZyrex('mealux',60,60,{temperament:'Calm'});
  ok(!!w,'it spawns as a wild');
  ok(w.level===80,'★★ level = tier × 10 = 80 · the wild level law takes no exception for a legendary');
  ok(typeof w._bobPhase==='number','★ and it gets its own bob phase at spawn');
  ok(C.requiredBondForTier(8)===8*333,'★ bond gate = 8 × 333 = '+C.requiredBondForTier(8)+' · 80% of the cap · an endgame find');
}

H('7 · ★★★ IT WAS NEVER A RELIC · the retired reading must stay retired');
{
  // ★★★ v0.96.49 · THIS SUITE HAD BEEN DEAD SINCE v0.95.959.
  // It named KEY_OF_MEALUX in its boot export list.  b2c46df deleted that
  // const on purpose — "a Mealux in every district ... and it was never a
  // relic" — so every run since has died at BOOT FAILED and all 88 assertions,
  // the whole Mealux feature, have been silently unchecked for 30+ commits.
  // ★★ A suite that cannot boot reports nothing, and reporting nothing looks
  // exactly like passing in a sweep that greps for the word FAILED.
  // The six assertions here defended the OLD canon (a lesser key descending
  // from the Key of Anciuxor).  Rewritten to defend the CORRECTION instead,
  // so the retyping can never quietly come back.
  ok(!('KEY_OF_MEALUX' in C) || C.KEY_OF_MEALUX===undefined,
     '★★★ there is no KEY_OF_MEALUX · a Mealux is a SPECIES, not a lesser key, and the relic reading is retired');
  const M=C.MEALUX_CANON;
  ok(!!M,'MEALUX_CANON is recorded');
  ok(M.isPrismshard===false,'★★ the species is not the relic · descent, not identity');
  ok(M.tracesOf===16,'★ its progenitor is still Prismshard XVI · '+M.origin);
  ok(M.relicClass==='DERIVATIVE','★★ DERIVATIVE · the living branch of §3 descent, which is a lineage and not a relic class it belongs to');
  ok(M.tier===8&&M.immortalClass===true,'★ T8 Immortal of Kyrathos · the Creator retyped it from the codex T3');
  ok(M.types===null&&M.family===null,'★★★ typing is STILL NULL · unanswered is recorded as unanswered, never guessed');
  ok(C.prismshard(16).livingTrace==='mealux','★ and XVI records only what its remnants BECAME');
  ok(/\['key_of_mealux', *'mealux'\]/.test(src2),
     '★★ and an old save that stored the relic id migrates to the species · the rename cannot orphan an inventory');
}

H('8 · ★★★ ONE PER DISTRICT · all ten, re-rolled each playthrough');
{
  C.seedMalezorWild();
  // ★ the SEEDED ten only.  §6 spawns a Key by hand at (60,60) to prove the
  // wild laws apply to it; that individual is a test fixture, not one of the
  // ten on the map, and counting it made this read 11 with a NaN remoteness.
  // Measure the population you mean.
  const M=C.WILD_ZYREX.filter(w=>w.speciesId==='mealux'&&w._malezorWild==='MEALUX');
  // ★★★ v0.96.49 · REWRITTEN FROM THE FIVE-DISTRICT STRIDE.
  // v0.95.883 ruled five, on every other district, Zarvane to Korathen, and
  // this section defended that stride down to "MALEZOR gets none".  v0.95.959
  // superseded it — Creator: "place one key of mealux in a random spawn point
  // in EACH district.  randomized each game play."  The game has done exactly
  // that ever since; only the test still argued for the old rule, and because
  // the suite could not boot, it never got to lose the argument.
  // ★★ The header still read FIVE while the first assertion had been hand-
  // patched to 10 — a test disagreeing with itself, which is what a suite
  // nobody can run decays into.
  const all=C.ZYRAXIS_DISTRICTS.map(d=>d.id);
  ok(M.length===all.length,'★★★ '+M.length+' Mealux on the map · ONE PER DISTRICT, all '+all.length+', as ruled');
  const D=C.MEALUX_DISTRICTS().map(d=>d.id);
  ok(new Set(M.map(w=>w._mealuxDistrict)).size===all.length,'★★ '+all.length+' DISTINCT districts · none doubled up, none skipped');
  ok(D.join()===all.join(),
     '★★★ the district list IS the district list · derived from ZYRAXIS_DISTRICTS, not a typed stride that has to be re-edited when a district is added');
  ok(D.includes('malezor'),
     '★★ and MALEZOR gets one · the old rule spared the tutorial town, the Creator\'s "each district" does not');
  ok(D.includes('korathen'),'★ through to Korathen · both ends of the world covered');
  ok(M.every(w=>C.worldDistrictAt(w.tileX,w.tileY)===w._mealuxDistrict),
     '★★ and every one actually STANDS in the district it was assigned · the label is not a promise, it is measured');
  // ★ v0.95.895 · SELF-OCCLUSION.  This asked walkable() about the creature's
  // OWN tile, which was true until every Zyrex got a body — and now returns
  // false for exactly the right reason.  "Reachable" never meant "you can
  // stand inside it"; it means you can get NEXT to it.  Measure the neighbours.
  const reachable=w=>C.walkable(w.tileX+1,w.tileY)||C.walkable(w.tileX-1,w.tileY)
                   ||C.walkable(w.tileX,w.tileY+1)||C.walkable(w.tileX,w.tileY-1);
  ok(M.every(reachable),'★ all reachable · an unreachable secret is not a secret');
  ok(M.every(w=>!C.isWorldBorderTile(w.tileX,w.tileY)),'★ none on a border tile');
  ok(M.every(w=>w.level===80),'★ all Lv 80 · tier × 10, no exception for the rarest thing in the game');
  const tiles=new Set(M.map(w=>w.tileX+','+w.tileY));
  ok(tiles.size===M.length,'no two share a tile ('+tiles.size+' tiles for '+M.length+' Keys)');
}

H('9 · ★★ HIDDEN MEANS REMOTE, AND IT IS MEASURED');
{
  const M=C.WILD_ZYREX.filter(w=>w.speciesId==='mealux'&&w._malezorWild==='MEALUX');
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
  // ★ compare over the STRIDE districts, not all ten · v0.95.883 cut the
  // population to five and this was still walking the full list, so the
  // computed side carried five extra tiles the live side never had.
  const D=C.MEALUX_DISTRICTS();
  const a=D.map(d=>{const s=C._mealuxTileFor(d);return s?s.at.join(','):null;});
  const b=D.map(d=>{const s=C._mealuxTileFor(d);return s?s.at.join(','):null;});
  ok(JSON.stringify(a)===JSON.stringify(b),'★★★ the search is DETERMINISTIC · re-running it returns the identical '+D.length+' tiles');
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

H('11 · ★★★ THE KEY OPENS THE GEMLORD DOORS');
{
  const p=C.player;
  p.party=[]; p.pcZyrex=[]; p.sanctuary=[]; p.gemlordCavesOpen=false;
  ok(C.gemlordCavesOpen()===false,'★ with no Key, every Gemlord door is shut');
  const before=C.game.scene;
  C.game.scene='overworld';
  ok(C.tryEnterGemlordCave('rakoron_cave','Rakoron')===false,'★★ and the door REFUSES · it does not know you');
  ok(C.game.scene==='overworld','★ nothing moved · a refusal leaves you outside, not half-inside');
}

H('12 · ★★ ONE CATCH, ALL TEN DOORS');
{
  const p=C.player;
  p.party=[]; p.pcZyrex=[]; p.sanctuary=[]; p.gemlordCavesOpen=false;
  p.bondLedger={zyrex:1665,rizer:1665,_migrated:true};        // enough for a T8
  const z={speciesId:'mealux',name:'Key of Mealux',level:80,hp:400,maxHp:400,tier:8,uid:'k1'};
  C.addZyrexToRoster(z);
  ok(p.gemlordCavesOpen===true,'★★★ catching ONE grants access · the flag is set at the roster door');
  const doors=C.WORLD_PROPS.filter(x=>/_cave$/.test(x.id||'')&&typeof x.onSquare==='function');
  ok(doors.length===10,'★★ all TEN Gemlord doors carry the gate ('+doors.length+') · not one hand-written entry among them');
  C.game.scene='overworld';
  ok(C.tryEnterGemlordCave('rakoron_cave','Rakoron')===true,'★★ Rakoron\'s cave opens');
  ok(C.game.scene==='interior_cave','★ and you are actually inside');
  C.game.scene='overworld';
  ok(C.tryEnterGemlordCave('azurel_cave','Azurel')===false,'★ a door with no carved sanctum yet does not teleport you');
  ok(C.game.scene==='overworld','…and leaves you standing outside it');
  ok(Object.keys(C.GEMLORD_CAVE_INTERIORS).length===1,'★★ one interior exists today · the other nine share the SAME gate and open the day they are carved');
}

H('13 · ★★★ ACCESS SURVIVES GIVING THE KEY AWAY');
{
  const p=C.player;
  p.party=[]; p.pcZyrex=[]; p.sanctuary=[]; p.gemlordCavesOpen=false;
  p.bondLedger={zyrex:1665,rizer:1665,_migrated:true};
  const z={speciesId:'mealux',name:'Key of Mealux',level:80,hp:400,maxHp:400,tier:8,uid:'k2'};
  C.addZyrexToRoster(z);
  const idx=(p.party||[]).findIndex(q=>q&&q.speciesId==='mealux');
  if (idx>=0 && typeof donateZyrexToSanctuary==='function') donateZyrexToSanctuary(idx);
  else { p.party=[]; p.sanctuary=[{speciesId:'mealux',name:'Key of Mealux',level:80,tier:8}]; }
  ok(!(p.party||[]).some(q=>q&&q.speciesId==='mealux'),'the Key is out of the party');
  ok(C.gemlordCavesOpen()===true,
     '★★★ and the doors STILL know you · access is granted on the CATCH, not derived from what you currently hold');
  const src2=fs.readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html','utf8');
  ok(/player\.gemlordCavesOpen = true/.test(src2),'it is a flag, banked at the moment of catching');
  ok(/without the doors forgetting him/.test(src2),
     '★★ and the reason is written down · deriving it from the party would have punished the one act the sanctuary exists to reward');
}

H('14 · ★ GRANTED BEFORE THE BOND GATE CAN DIVERT IT');
{
  const p=C.player;
  p.party=[]; p.pcZyrex=[]; p.sanctuary=[]; p.gemlordCavesOpen=false;
  p.bondLedger={zyrex:0,rizer:0,_migrated:true};              // far below a T8 gate
  const z={speciesId:'mealux',name:'Key of Mealux',level:80,hp:400,maxHp:400,tier:8,uid:'k3'};
  const res=C.addZyrexToRoster(z);
  ok(res.location==='pc','★ a low-bond Rizer has the Key bounced to the PC, as the tier gate demands');
  ok(p.gemlordCavesOpen===true,
     '★★★ but the CAVES STILL OPENED · the Creator said CATCHING grants it, and a Key diverted to storage was still caught');
}

H('18 · ★★★ TRAVERSAL · it does not run, it HOVERS somewhere');
{
  const SH=C.SUMMONABLE_SPRITES.mealux;
  const ROOT3='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
  ok(!!SH.runSrc,'★ a traversal sheet is registered');
  ok(fs.existsSync(ROOT3+decodeURIComponent(SH.runSrc)),'★ and it is on disk');
  ok(SH.runSrc!==SH.src,'★ it is a DIFFERENT sheet from the idle');
  ok(SH.runBboxes.length===4&&SH.runBboxes.every(r=>r.length===4),'★ 4×4 · row = direction, col = frame');
  const seen=new Set(SH.runBboxes.flat().map(b=>JSON.stringify(b)));
  ok(seen.size===16,'★★ all 16 traversal frames distinct · no cell inherited a neighbour');
  let owned=true;
  SH.runBboxes.forEach((row,r)=>row.forEach(b=>{
    const cy=b[1]+b[3]/2;
    if (cy < r*313-40 || cy > (r+1)*313+40) owned=false;
  }));
  ok(owned,'★★ every traversal body sits in its OWN row band · ownership, not proximity');
  ok(SH.levitate===true&&SH.runBobSame===true,
     '★★★ the BOB CARRIES THROUGH the run · Creator: "hover and bob like idle"');
  const src2=fs.readFileSync(ROOT3+'rp7b.html','utf8');
  ok(/IT DOES NOT RUN/.test(src2),'★★ and the reason is written down: it has no legs, so traversal is a moving hover');
  // ★ match the CONDITION, not the whole expression.  v0.95.903 put a flee
  // check in front of it (`!_useFlee && w.moving && ...`) and this failed while
  // the rule — motion picks the traversal bank — held exactly.  Third literal-pin
  // break in this file; assert the smallest thing that IS the rule.
  ok(/w\.moving && d\.runBboxes/.test(src2),'★ the bank is chosen by MOTION');
  // ★★★ v0.95.890 · INVERTED.  The .888 rule ("keep the idle divisor") was
  // backwards: the float body is ~240px against the idle's ~300px, so dividing
  // run boxes by the idle max drew the hovering Key a fifth SMALLER the moment
  // it moved — the exact shrink the rule claimed to prevent.  Preserve the
  // SIZE, not the divisor.
  // ★ v0.95.899 · this pinned the literal `_useRun ? d.runBboxes : d.bboxes`.
  // A THIRD bank (idleSrc) arrived and the expression became `_boxes`, so the
  // check failed while the property it cares about held perfectly.  Assert the
  // PROPERTY — the scale loop reads whichever bank is being drawn — not the
  // shape the expression happened to have on the day it was written.
  ok(/for \(const r of _boxes\)\{ if \(r\[0\]\[3\] > maxBh\)/.test(src2),
     '★★★ each bank normalises by ITS OWN tallest body · the float draws at idle size');
  ok(/Preserve the SIZE, not the divisor/.test(src2),'★★ and the reason is recorded as a correction, not a tweak');
  // measure it
  const SHm=C.SUMMONABLE_SPRITES.mealux;
  const idleMax=Math.max(216,SHm.bboxes[0][0][3]), runMax=Math.max(216,SHm.runBboxes[0][0][3]);
  const idleH=SHm.bboxes[0][0][3]/idleMax, runH=SHm.runBboxes[0][0][3]/runMax;
  ok(Math.abs(idleH-runH)<0.02,
     '★★★ measured: idle and float frame 0 now draw the same height ('+idleH.toFixed(2)+' vs '+runH.toFixed(2)+' of two tiles)');
  ok(/_runImg && _runImg\.complete && _runImg\.naturalWidth/.test(src2),
     '★ and it falls back to idle until the run art has actually loaded · never a blank frame');
}

console.log('\n'+(f?('❌ '+f+' FAILED'):'✅ ALL PASS'));
process.exit(f?1:0);
