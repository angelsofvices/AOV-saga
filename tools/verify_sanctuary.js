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
try{new Function(src+';globalThis.__C={sanctuaryList,sanctuaryHasSpecies,sanctuaryBondValue,donateZyrexToSanctuary,openSanctuaryPanel,closeSanctuaryPanel,populateSanctuaryResidents,SANCTUARY_VISIBLE,SANCTUARY_DUPLICATE_RATE,BOND_EVENTS,BOND_PATH_CAP,bondLedger,bumpRizerBond,rizerBondTotal,speciesJournalStage,journalCounts,depositZyrexToPC,SPECIES,NPCS,ATHRENOLOGY_INDEX,INTERIOR_TRAINING_FARM,player,game};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
global.showToast=noop; global.showDialog=noop; global.playSFX=noop; global.saveGame=noop; global.playItemGain=noop;
C.game.scene='overworld';
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
const mk=(id,lv)=>({speciesId:id,name:(C.SPECIES[id]||{}).name||id,level:lv||10,hp:50,maxHp:50,tier:(C.SPECIES[id]||{}).tier||1,uid:'u'+Math.random()});
const reset=()=>{const p=C.player; p.party=[]; p.sanctuary=[]; p.pcZyrex=[]; p.bondLedger={zyrex:0,rizer:0,_migrated:true}; C.NPCS.length=0;};

H('1 · ★★ THE LEDGER PAYS FOR THE RESCUE');
{
  const E=C.BOND_EVENTS.zyrexSanctuary;
  ok(!!E,'zyrexSanctuary is a registered bond event');
  ok(E.path==='zyrex','★ it sits on the ZYREX path · saving is something you do WITH a Zyrex');
  ok(E.pts===1,'base 1 point · the TIER is the multiplier, so the rescue is priced by what it cost');
}

H('2 · ★★★ FIRST OF A KIND IS WHAT PAYS');
{
  reset();
  const p=C.player;
  const t5=Object.keys(C.SPECIES).find(k=>C.SPECIES[k].tier===5);
  const t1=Object.keys(C.SPECIES).find(k=>C.SPECIES[k].tier===1);
  ok(C.sanctuaryBondValue(mk(t1))===1&&C.sanctuaryBondValue(mk(t5))===5,
     '★ a donation is worth its TIER · T1 = 1, T5 = 5');
  p.party=[mk(t1)];
  const first=C.donateZyrexToSanctuary(0);
  p.party=[mk(t1)];
  const dupe=C.donateZyrexToSanctuary(0);
  ok(first===1,'first of its kind pays full');
  ok(dupe===1*C.SANCTUARY_DUPLICATE_RATE,'★★ the SECOND of the same species pays a quarter ('+dupe+')');
  // the farm-able case the Creator's own world creates
  reset();
  let total=0;
  for(let i=0;i<22;i++){ C.player.party=[mk('aetherwing')]; total+=C.donateZyrexToSanctuary(0); }
  ok(total<7,'★★★ the 22 Aetherwing standing in Malezor are worth '+total+' bond TOTAL — not a farm');
  ok(C.sanctuaryList().length===22,'…and all 22 are still taken in · she never turns one away');
}

H('3 · CALIBRATION · a complete sanctuary is a route, not the only one');
{
  const byTier={};
  for(const e of C.ATHRENOLOGY_INDEX) byTier[e.t]=(byTier[e.t]||0)+1;
  const sum=Object.entries(byTier).reduce((a,[t,n])=>a+ +t*n,0);
  ok(sum>400&&sum<900,'★ donating one of all '+C.ATHRENOLOGY_INDEX.length+' species pays '+sum+' bond');
  const pct=sum/C.BOND_PATH_CAP;
  ok(pct>0.25&&pct<0.55,'★★ that is '+Math.round(pct*100)+'% of the 1665 Zyrex path · meaningful, never sufficient');
}

H('4 · ★★★ IT IS PERMANENT · THERE IS NO WAY BACK');
{
  reset();
  const p=C.player;
  p.party=[mk('aetherwing',33)];
  const before=p.party.length;
  C.donateZyrexToSanctuary(0);
  ok(p.party.length===before-1,'★ it leaves the party');
  ok(C.sanctuaryList().length===1,'★ and it is on the sanctuary roll');
  ok(!(p.pcZyrex||[]).length,'it did NOT go to the PC · this is not storage');
  const src2=fs.readFileSync(ROOT+'rp7b.html','utf8');
  // ★ target the RECORD ARRAY, not the word "sanctuary" — the first draft of
  // this check matched _clearSanctuaryResidents' NPCS.splice and read a
  // cosmetic cleanup as a withdraw.  Measure the thing, not a word near it.
  const takeOut=/(player\.sanctuary|sanctuaryList\(\))\s*\.\s*(splice|pop|shift)\s*\(/g;
  ok(!takeOut.test(src2),
     '★★★ NO WITHDRAW EXISTS · nothing splices, pops or shifts a resident OFF the roll');
  ok(!/withdrawSanctuary|reclaimSanctuary|releaseFromSanctuary|takeBackZyrex/i.test(src2),
     '★★ and no function is even NAMED for it · not a disabled button, not a gated one — it is not written');
  const takes=(src2.match(/sanctuaryList\(\)\.push/g)||[]).length;
  ok(takes===1,'★★ exactly ONE line adds a resident · one door in, no door out');
}

H('5 · ★★ THE INDEX REMEMBERS · donating must not erase the record');
{
  reset();
  const p=C.player;
  p.party=[mk('aetherwing',20)];
  const staged=C.speciesJournalStage('aetherwing');
  C.donateZyrexToSanctuary(0);
  const after=C.speciesJournalStage('aetherwing');
  ok(staged>=2,'holding one reads as BONDED in the Athrenology index');
  ok(after>=2,'★★★ after donating it STILL reads as bonded — the feature does not delete its own reward');
  const c=C.journalCounts();
  ok(c.bonded+c.mastered>=1,'★ journalCounts sees the sanctuary too · the page you filled stays filled');
}

H('6 · A ZYREX IN THE FIELD CANNOT BE SIGNED AWAY');
{
  reset();
  const p=C.player;
  const z=mk('aetherwing'); p.party=[z];
  C.NPCS.push({id:'_summon_x',_summoned:true,_summonUid:z.uid,_summonSpeciesId:z.speciesId,scene:'overworld'});
  ok(C.donateZyrexToSanctuary(0)===-1,'★ refuses while it is standing in the world');
  ok(p.party.length===1&&!C.sanctuaryList().length,'★★ and NOTHING moved · a refusal is total, never half-done');
}

H('7 · ❦ YOU CAN VISIT THEM');
{
  reset();
  const p=C.player;
  for(let i=0;i<30;i++){ p.party=[mk('aetherwing',i+1)]; C.donateZyrexToSanctuary(0); }
  const n=C.populateSanctuaryResidents();
  ok(n===C.SANCTUARY_VISIBLE,'★ '+n+' residents walk the barn · the rest are in the far pasture ('+(30-n)+')');
  const res=C.NPCS.filter(x=>x._sanctuaryResident);
  ok(res.every(x=>x.scene==='interior_training_farm'),'all of them live in the farm interior');
  ok(res.every(x=>x._summoned===false),'★★ a resident is NOT a summon · it is out of the party plumbing entirely');
  ok(res.every(x=>!/^_summon_/.test(x.id)),'★ and its id cannot be swept by the recall-all');
  const tiles=new Set(res.map(x=>x.tileX+','+x.tileY));
  ok(tiles.size===res.length,'★ no two residents share a tile');
  const cfg=C.INTERIOR_TRAINING_FARM;
  ok(res.every(x=>x.tileX>0&&x.tileX<cfg.cols-1&&x.tileY>0&&x.tileY<cfg.rows-3),'★ none is inside a wall or blocking the door lane');
  ok(!res.some(x=>x.tileX===cfg.spawn.x&&x.tileY===cfg.spawn.y),'★ and none stands on the tile Rizer walks in on');
  const n2=C.populateSanctuaryResidents();
  ok(C.NPCS.filter(x=>x._sanctuaryResident).length===n2,'★★ re-entering the barn does not double the herd');
}

H('8 · IT SURVIVES THE SAVE');
{
  const src2=fs.readFileSync(ROOT+'rp7b.html','utf8');
  ok(/sanctuary: \(player\.sanctuary \|\| \[\]\)\.map/.test(src2),
     '★★ written EXPLICITLY, not left to the catch-all backfill · a donation the save forgot is a Zyrex destroyed');
  ok(/if \(!Array\.isArray\(player\.sanctuary\)\) player\.sanctuary = \[\]/.test(src2),'old saves load with an empty sanctuary, not undefined');
  ok(!/player\.sanctuary = fix\(/.test(src2),
     '★★★ NOT run through migrateSavedZyrex · that pass EVICTS off-canon species, which here would destroy a permanent gift');
}

console.log('\n'+(f?('❌ '+f+' FAILED'):'✅ ALL PASS'));
process.exit(f?1:0);
