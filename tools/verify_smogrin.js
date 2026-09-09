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
try{new Function(src+';globalThis.__C={SPECIES,SUMMONABLE_SPRITES,WILD_PLACEMENT_LIVE,seedMalezorWild,WILD_ZYREX,requiredBondForTier,worldDistrictAt,walkable,pingNextObjective,dialogCloseVox,game,player};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
global.showToast=noop; global.saveGame=noop;
let PLAYED=[]; global.playSFX=(k)=>PLAYED.push(k);
C.game.scene='overworld';
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
const src2=fs.readFileSync(ROOT+'rp7b.html','utf8');
const SP=C.SPECIES.smogrin, SH=C.SUMMONABLE_SPRITES.smogrin;

H('1 · ★★ SMOGRIN · TIER AND TYPES FROM THE LOCKED ROSTER');
{
  const roster=JSON.parse(fs.readFileSync(ROOT+'data/staple_roster_v1.json','utf8'));
  const rows=Array.isArray(roster)?roster:(roster.species||[]);
  const R=rows.find(r=>String(r.name).toLowerCase()==='smogrin');
  ok(!!SP,'Smogrin is a SPECIES · it did not exist before');
  ok(R.tier===3&&SP.tier===3,'★★ ROSTER V1 says TIER 3 and the game agrees · read, not guessed');
  ok(String(R.types)==='Aura/Spirit'&&SP.type==='Aura'&&SP.type2==='Spirit',
     '★★★ and the TYPES match the roster too (Aura/Spirit) · no repeat of the Skybeam mismatch');
  const pool=SP.baseHP+SP.baseATK+SP.baseDEF+SP.baseSPD+SP.baseSATK+SP.baseSDEF;
  ok(pool===999,'★★ pool = tier × 333 = '+pool);
  ok(C.requiredBondForTier(3)===999,'★ bond gate = 999');
  ok(SP.baseSATK>SP.baseATK&&SP.baseSPD>SP.baseATK,'★ weighted SPECIAL + SPEED · Aura/Spirit gets away and hits from elsewhere');
}

H('2 · ★ GEARBYTE SIZE');
{
  ok(!!SH,'sprite bank registered · draws as art, not an orb');
  ok(fs.existsSync(ROOT+decodeURIComponent(SH.src)),'art on disk');
  ok(SH.scaleMul===0.55,'★★ scaleMul 0.55 · the standing GEARBYTE BASELINE, as specified');
  const others=Object.values(C.SUMMONABLE_SPRITES).filter(d=>d&&d.scaleMul===0.55).length;
  ok(others>=2,'★ and it shares that baseline with '+others+' other small Zyrex · a size CLASS, not a number invented for one creature');
  const seen=new Set(SH.bboxes.flat().map(b=>JSON.stringify(b)));
  ok(seen.size===16,'★★ all 16 frames distinct');
  let owned=true;
  SH.bboxes.forEach((row,r)=>row.forEach(b=>{
    // ★★★ v0.96.49 · bboxes are CELL-RELATIVE · the draw path is
    // sy = row*cellH + by, so adding r*313 here applies the row offset TWICE.
    // Rows 1-3 could only fail and row 0 could only pass: arithmetic dressed
    // up as a measurement.  Same line, same mistake, in verify_keyofmealux.
    const cy=b[1]+b[3]/2;
    if (cy < -40 || cy > 313+40) owned=false;
  }));
  ok(owned,'★★ every body centred in its OWN row band');
}

H('3 · ★★ PLACED IN A SLOT THE MASTER ALREADY RESERVED');
{
  const pin=C.WILD_PLACEMENT_LIVE.find(P=>P.id==='smogrin');
  ok(!!pin,'★ Smogrin is in the live placement table');
  const master=JSON.parse(fs.readFileSync(ROOT+'data/wild_placement.json','utf8'));
  const slots=Array.isArray(master)?master:(master.slots||[]);
  const slot=slots.find(s=>s.tile&&s.tile[0]===pin.at[0]&&s.tile[1]===pin.at[1]);
  ok(!!slot,'★★★ its tile is a slot the WILD PLACEMENT MASTER already dimensioned');
  ok(slot.tier===SP.tier,'★★★ and that slot was reserved for a TIER '+slot.tier+' wild · the band, the level curve and the neighbours still add up');
  C.seedMalezorWild();
  const live=C.WILD_ZYREX.filter(w=>w.speciesId==='smogrin');
  ok(live.length===1,'★ one Smogrin stands in the world');
  ok(C.worldDistrictAt(live[0].tileX,live[0].tileY)===pin.dist,'★ measured · it really is in '+pin.dist);
  ok(live[0].level===30,'★★ Lv 30 · tier × 10, no exception');
  const w=live[0];
  ok(!C.walkable(w.tileX,w.tileY),'★ and it has a body, like every Zyrex since v0.95.895');
}

H('4 · ★★★ "I\'M ON IT" REPLACES "SEE YA" — ONLY ON A NEW TASK');
{
  ok(fs.existsSync(ROOT+'audio/sfx-im-on-it.mp3'),'★ the RVOX is on disk');
  ok(/imOnIt:\s+new Audio/.test(src2),'★ registered in the SFX bank');
  ok(/imOnIt: 52/.test(src2),'★ mixed a shade over see-ya · accepting a job should land');
  ok(/game\._newTaskAt = \(typeof performance/.test(src2),'★★ the flag is set inside pingNextObjective');
  ok(/This is the ONE place in the game where the objective actually\s*\n\s*\/\/ CHANGES/.test(src2),
     '★★★ tagged at the ONE place the objective changes · the hint changing IS the assignment, so no quest has to be hand-labelled');
  // ★ the decision is a NAMED function now, so the test asks it directly
  // instead of trying to overhear the game's own playSFX from outside.
  C.game._newTaskAt = 0;
  ok(C.dialogCloseVox()==='seeYaLater','★★ an ordinary chat still ends in "see ya"');
  C.game._newTaskAt = performance.now();
  ok(C.dialogCloseVox()==='imOnIt','★★★ a talk that HANDED him a task ends in "I\'m on it" instead');
  ok(C.dialogCloseVox()==='seeYaLater','★★★ and it is CONSUMED · one assignment colours exactly one goodbye, never the next conversation');
  C.game._newTaskAt = performance.now() - 60000;
  ok(C.dialogCloseVox()==='seeYaLater','★★ a task from a minute ago has gone stale · the window closes');
  ok(/playSFX\(dialogCloseVox\(\)\)/.test(src2),'★ and the dialog closer just asks it · one decision, one home');
  ok(/now - t < 20000/.test(src2),'★ with a 20s window · the toast fires during onInteract and the player still has to read');
}

console.log('\n'+(f?('❌ '+f+' FAILED'):'✅ ALL PASS'));
process.exit(f?1:0);
