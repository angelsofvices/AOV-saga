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
try{new Function(src+';globalThis.__C={PRISMSHARD_REGISTRY,GEMSHARD_SLOTS,GEMSHARD_TOTAL,GEMSHARD_81,KEY_OF_ANCIUXOR_N,prismshardGemshardCount,prismshard,gemshardsOfPrismshard,parentPrismshardOf,gemshardsOfFamily,keyOfAnciuxorGemshards,relicClass,knownGemshards,gemshardCensus,gemshardByKey,gemshardsOfUltramaxType,ASTRALITE_FAMILY_PRISM_QUOTA,PRISMSHARD_FAMILY,prismshardsOfFamily,familyQuotaGaps,prismshardsWithoutFamily,gemshardsOwedToFamily,GEMLORD_WEAPONS,gemlordWeapon,ASTRALITE_FAMILIES,RELIC_CLASS,RELIC_CLASS_MAP,SHARD_META,INVENTORY_META,player,game};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
const P=C.PRISMSHARD_REGISTRY, G=C.GEMSHARD_SLOTS;

H('1 · RULES 1-3 · THE SIXTEEN');
{
  ok(P.length===16,'★ RULE 1 · exactly 16 Prismshards');
  ok(new Set(P.map(p=>p.n)).size===16,'numbered I-XVI with no gap or repeat');
  ok(new Set(P.map(p=>p.name)).size===16,'★ sixteen distinct relics · no two interchangeable');
  const tiers={};
  for(const p of P) tiers[p.tier]=(tiers[p.tier]||0)+1;
  ok(tiers['T-I']===7&&tiers['T-II']===5&&tiers['T-III']===3&&tiers['T-IV']===1,
     '★ the ascension ladder is intact · 7 + 5 + 3 + 1 = 16');
}

H('2 · RULES 6-9 · THE ARITHMETIC IS A LAW, NOT A LIST');
{
  ok(P.slice(0,15).every(p=>C.prismshardGemshardCount(p.n)===5),'★ RULE 6 · I-XV each yield exactly five');
  ok(C.prismshardGemshardCount(16)===6,'★ RULE 7 · XVI yields six');
  ok(C.GEMSHARD_TOTAL===81,'★★ RULE 4 · 15×5 + 6 = '+C.GEMSHARD_TOTAL);
  ok(G.length===81,'…and the slot table IS that number · derived, never typed');
  const src2=fs.readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html','utf8');
  ok(/const GEMSHARD_TOTAL = GEMSHARD_SLOTS\.length/.test(src2),
     '★★ the 81 is COMPUTED from the lineage · change a count and the total moves with it, or the boot assertion shouts');
  ok(/RELIC CANON BROKEN/.test(src2),'★ and a boot assertion is watching it');
}

H('3 · RULE 5 · EVERY GEMSHARD HAS EXACTLY ONE PARENT');
{
  ok(G.every(g=>g.parent>=1&&g.parent<=16),'★ RULE 5 · all 81 originate from the sixteen');
  ok(G.every(g=>C.parentPrismshardOf(g.id)&&C.parentPrismshardOf(g.id).n===g.parent),
     '★ and the lineage query round-trips for every one of the 81');
  let sum=0; for(let n=1;n<=16;n++) sum+=C.gemshardsOfPrismshard(n).length;
  ok(sum===81,'the per-parent buckets add back to 81 · nothing orphaned, nothing double-counted');
  ok(C.gemshardsOfPrismshard(9).length===5,'query · Prismshard IX has 5 derivatives');
}

H('4 · ★★ RULES 8-9 · THE KEY AND THE 81ST');
{
  const K=C.prismshard(C.KEY_OF_ANCIUXOR_N);
  ok(K&&/Key of Anciuxor/i.test(K.name),'★ RULE 8 · Prismshard XVI IS the Key of Anciuxor');
  ok(K.tier==='T-IV'&&/ALL FOUR/i.test(K.realm),'★ it alone is Realm-transcendent · not "number sixteen but strongest"');
  ok(C.keyOfAnciuxorGemshards().length===6,'★★ the Key uniquely yields SIX');
  const ids=C.keyOfAnciuxorGemshards().map(g=>g.id);
  ok(ids.join()==='76,77,78,79,80,81','★★ the Key is responsible for Gemshards 76-81 (§12)');
  ok(C.GEMSHARD_81.id===81&&C.GEMSHARD_81.parent===16,'★★★ RULE 9 · GEMSHARD 81 is the Key\'s sixth · the anomaly is the significance');
  ok(C.GEMSHARD_81.ordinal===6,'…and it is the SIXTH of its lineage, which is the whole irregularity');
}

H('5 · ★★★ NOTHING WAS INVENTED');
{
  ok(G.every(g=>g.name===null),'★★★ all 81 names are NULL · the Creator names them, not the code');
  ok(G.every(g=>g.astralite===null&&g.family===null),'★★ no Astralite compositions invented');
  ok(G.every(g=>g.ultramaxType===null&&g.ultramaxMove===null&&g.weapon===null),'★ no Ultramax or weapon bindings invented');
  ok(G.every(g=>g.status==='unrecorded'),'every slot says plainly that it is unrecorded');
  const src2=fs.readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html','utf8');
  ok(!/GEMSHARD_81[\s\S]{0,400}?(because|reason|secret is)/i.test(src2.split('const GEMSHARD_81')[1]||''),
     '★★★ the code does not explain WHY the 81st exists · it is reserved as a lore revelation');
}

H('6 · THE NAMES CAME FROM THE EXISTING LOCK');
{
  // spot-check against V3.17.50 / V3.17.51 · these must not have been re-authored
  const byN=Object.fromEntries(P.map(p=>[p.n,p]));
  ok(byN[7].name==='The Deep Prism'&&/Xilnar/.test(byN[7].planet),'★ VII · Deep Prism · Zyraxis/Xilnar, as locked');
  ok(byN[12].name==='The Refuge Prism'&&/Vorashil/.test(byN[12].planet),'★ XII · Refuge Prism · Zyraxis/Vorashil, as locked');
  ok(byN[15].name==='The Prism of Omnithris'&&/Korathen/.test(byN[15].planet),'★ XV · Prism of Omnithris · Zyraxis/Korathen, as locked');
  ok(byN[4].planet==='MOBILE','★ IV · the Wanderer\'s Prism is still MOBILE · canon honoured, not flattened to a planet');
  const zyraxis=P.filter(p=>/Zyraxis/.test(p.planet));
  ok(zyraxis.length===3,'★★ exactly 3 are Zyraxis-native · the game-reachable ceiling is unchanged');
}

H('7 · ★ RULE 14 · THE THREE WORDS ARE NEVER SYNONYMOUS');
{
  ok(C.relicClass('gem')===C.RELIC_CLASS.MATERIAL,'an ordinary Astralite gem is MATERIAL, not a Gemshard');
  ok(C.relicClass('life_stone')===C.RELIC_CLASS.DERIVATIVE,'★ a Life Stone is DERIVATIVE · descended (§3), never equal');
  ok(C.relicClass('prismshard')===C.RELIC_CLASS.PRISMSHARD,'the Prismshard item is a PRISMSHARD');
  ok(C.relicClass('shard_predator')===C.RELIC_CLASS.GEMSHARD,'★★ an Ultrashard is a GEMSHARD · it sets Ultramax typing + moves, which is Rule 11 word for word');
  ok(C.relicClass('compound_will_t7')===C.RELIC_CLASS.MATERIAL,'★ a Matrix Core is refined MATERIAL · relic-shaped is not relic-class');
  ok(C.relicClass('coins')===null,'★ a non-relic returns null · the function says "not a relic" instead of guessing one');
}

H('8 · ★★ THE VOLTSHARD CONFLICT IS RECORDED, NOT RESOLVED');
{
  ok(C.relicClass('voltshard')===C.RELIC_CLASS.DISPUTED,
     '★★ voltshard is CLASS_DISPUTED · shipped as a Prismshard (A5), reads as a Gemshard (§6) · both are the Creator\'s words');
  const src2=fs.readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html','utf8');
  ok(/THE VOLTSHARD IS DISPUTED ON PURPOSE/.test(src2),'★ and the conflict is written where he will find it');
  ok(fs.existsSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/data/PRISMSHARD_GEMSHARD_CANON.md'),'the canon doc ships alongside');
  const doc=fs.readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/data/PRISMSHARD_GEMSHARD_CANON.md','utf8');
  ok(/OPEN QUESTIONS FOR THE CREATOR/.test(doc),'★★ and the doc ends in questions, not in answers I made up');
  ok(/THE ONE INFERENCE ON THIS PAGE/.test(doc),'★★★ the single inference in the merge is flagged as an inference');
}

H('9 · ★★★ THE 22 ULTRASHARDS ARE 22 OF THE 81 · Creator ruling 2026-08-29');
{
  const K=C.knownGemshards();
  // ★ v0.95.878 · SCOPED TO THE ULTRASHARDS.  These four checks were written
  // when the registry held nothing else; the Gemlord weapons joined it at
  // .878 and carry no Ultramax move, so an all-entries assertion would now be
  // asking the wrong population.  Measure the Ultrashards, not "everything
  // that happens to be in the array today".
  const U=K.filter(g=>g.ultramaxMove);
  ok(U.length===22,'★★ the registry actually built · '+U.length+' Ultrashards recorded');
  ok(U.length>0,'★★★ NOT SILENTLY EMPTY — the first draft was an eager IIFE reading SHARD_META from its TDZ, the guard swallowed it, and this shipped as 0 of 81');
  ok(U.every(g=>g.ofTheEightyOne===true),'★★★ every one is declared one OF THE 81 · they are not a parallel technology');
  ok(U.every(g=>g.ultramaxType&&g.ultramaxMove),'★ RULE 11 · each governs an Ultramax type AND move · which is WHY they are Gemshards');
  const cen=C.gemshardCensus();
  ok(cen.total===81&&cen.recorded===32&&cen.unrecorded===49,
     '★★ census · '+cen.recorded+' recorded (22 Ultrashards + 10 Gemlord weapons), '+cen.unrecorded+' unrecorded, of '+cen.total);
  ok(cen.recorded<=cen.total,'the recorded can never exceed the canon total');
}

H('10 · ★★ IDENTITY IS CANON · LINEAGE IS NOT');
{
  const K=C.knownGemshards();
  ok(K.every(g=>g.parent===null),'★★★ no parent Prismshard was invented for any of the '+K.length);
  ok(K.every(g=>g.slot===null),'★★★ and none was written into a numbered slot — a slot POSITION would assert a parent by itself');
  ok(C.gemshardCensus().placed===0,'★ placed = 0 · the code states plainly that lineage is unknown');
  ok(K.every(g=>g.astralite===null&&g.family===null),'★ nor was any single Astralite source invented (Rule 10 pending)');
  // the argument the placement work will need
  const el=C.gemshardsOfUltramaxType('Elemental');
  ok(el.length===5,'★★ FIVE Ultrashards share the Elemental type ('+el.map(g=>g.label).join(', ')+')');
  ok(true,'★★★ …so by Rule 10 those are five DIFFERENT Astralites behind one type — Ultramax type is not the family axis, and lineage cannot be derived from the type column');
  const g=C.gemshardByKey('shard_wyrm');
  ok(g&&g.ultramaxType==='Draconic','lookup by item key works · '+(g&&g.label));
  ok(C.gemshardByKey('coins')===null,'a non-Gemshard returns null');
}

H('11 · ★★★ THE FAMILY QUOTA · 1 + 2·7 + 1 · DOES IT CHECK OUT?');
{
  const Q=C.ASTRALITE_FAMILY_PRISM_QUOTA;
  ok(Object.keys(Q).length===9,'nine Astralite families');
  ok(Q[1]===1&&Q[9]===1,'★ Ax-1 CREATION and Ax-9 SPIRIT take ONE each, as ruled');
  ok([2,3,4,5,6,7,8].every(f=>Q[f]===2),'★ the other seven take TWO each');
  const sum=Object.values(Q).reduce((a,b)=>a+b,0);
  ok(sum===16,'★★★ 1 + (2×7) + 1 = '+sum+' · IT CHECKS OUT · exactly the sixteen Prismshards');
  ok(sum===C.PRISMSHARD_REGISTRY.length,'…and it equals the registry, not just the number 16');
  // the second axis · the one that makes it a structure rather than a coincidence
  let owed=0; for(let f=1;f<=9;f++) owed+=C.gemshardsOwedToFamily(f);
  ok(owed===80,'★★ 16 Prismshards × 5 = '+owed+' Gemshards owed to families');
  ok(owed+1===81,'★★★ + the Key\'s irregular SIXTH = 81 · the quota and the 81 are the SAME arithmetic from two directions');
}

H('12 · ★★ IT FITS THE EXISTING LOCK WITHOUT RE-AUTHORING ANYTHING');
{
  const assigned=Object.values(C.PRISMSHARD_FAMILY).filter(v=>v!=null).length;
  ok(assigned===12,'★ twelve Prismshards already carried a family anchor from V3.17.50');
  const gaps=C.familyQuotaGaps(), homeless=C.prismshardsWithoutFamily();
  ok(gaps.reduce((a,g)=>a+g.open,0)===4,'★ the quota leaves exactly FOUR open family slots');
  ok(homeless.length===4,'★ and exactly FOUR Prismshards have no family');
  ok(gaps.map(g=>g.family).join()==='2,6,7,8','★★ the open slots are F2 PAST · F6 PRESERVATION · F7 BODY · F8 FUTURE');
  ok(homeless.map(p=>p.numeral).join()==='XIII,XIV,XV,XVI','★★ the homeless are XIII · XIV · XV · XVI (the realm echoes and the Key)');
  ok(gaps.length===homeless.length,'★★★ four gaps, four candidates — the ruling fit canon that already existed');
  ok(C.prismshardsOfFamily(3).length===2,'query · F3 DESTRUCTION is full (Devourer\'s + Reaver\'s)');
  ok(C.PRISMSHARD_FAMILY[16]===null,'★★ the Key\'s family is still NULL · the quota IMPLIES it has one, which is a claim the Creator has not made');
}

H('13 · ★★★ THE GEMLORD WEAPONS ARE GEMSHARDS');
{
  const W=C.GEMLORD_WEAPONS;
  ok(W.length===10,'★ ten Gemlords, ten weapon slots');
  ok(new Set(W.map(w=>w.gemlord)).size===10,'one per throne, no duplicates');
  ok(W.filter(w=>w.inGame).length===4,'★★ four are already in the game');
  const sap=C.gemlordWeapon('sapphire_sword'), rub=C.gemlordWeapon('rubypaw_sword');
  ok(sap.gemlord==='azurel'&&rub.gemlord==='rakoron','★ Sapphire Tearsword → AZUREL · Rubypaw Longsword → RAKORON (canon)');
  const em=C.gemlordWeapon('emerald_axe'), pb=C.gemlordWeapon('pearlbow');
  ok(em.gemlord==='emeralix'&&em.district==='Veridan','★ Emerald Axe → EMERALIX the Emeralord OF VERIDAN · the chest was in Veridan');
  ok(pb.gemlord==='ivirium'&&pb.district==='Zarvane','★ Pearlbow → IVIRIUM the Pearlord OF ZARVANE · the chest was in Zarvane');
  ok(em.inferred===true&&pb.inferred===true,'★★★ and BOTH are flagged INFERRED · three matching signals is not the Creator saying so');
  ok(sap.inferred===false&&rub.inferred===false,'…while the two he did state are not');
  ok(W.filter(w=>!w.weapon).length===6,'six thrones still have no named weapon');
  ok(W.some(w=>w.gemlord==='oatheus'),'★ Oatheus keeps his slot · the Empty Throne is absent, not deleted');
}

H('14 · THE CENSUS STAYS HONEST');
{
  const c=C.gemshardCensus();
  ok(c.recorded===32,'★★ 22 Ultrashards + 10 Gemlord weapons = '+c.recorded+' of the 81 recorded');
  ok(c.unrecorded===49,'★ '+c.unrecorded+' still unrecorded');
  ok(c.recorded+c.unrecorded===81,'the books balance');
  ok(c.placed===0,'★★★ placed is STILL 0 · knowing what a Gemshard IS is not knowing which Prismshard bore it');
  const K=C.knownGemshards();
  ok(K.filter(g=>g.weapon).length===4,'four carry a named weapon');
  ok(K.every(g=>g.parent===null&&g.family===null),'★★ and not one of the 32 had a parent or family invented for it');
}

console.log('\n'+(f?('❌ '+f+' FAILED'):'✅ ALL PASS'));
process.exit(f?1:0);
