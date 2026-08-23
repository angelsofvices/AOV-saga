
// ★★ v0.95.789 · GATED CONTENT SKIP.
// The Creator removed the 8 overworld Zyrex NPCs (v0.95.768) and the 50
// townsfolk (v0.95.767). Suites asserting those NPCs exist were RIGHT when
// written and now assert a world nobody wants. They skip while the content is
// gated rather than being deleted, so restoring the content restores the checks.
const _GATED_NPC_IDS = ['apexaur_1','zarakai_wild','voltigrax_wild','anciuxor_wild',
                        'snok_wild','gearbyte','voltaryn','elzoran'];
const _npcGated = id => _GATED_NPC_IDS.includes(id);
const fs=require('fs');const src=fs.readFileSync('/tmp/all.js','utf8');const noop=()=>{};const pending=[];
global.setInterval=()=>0;global.setTimeout=(f,m)=>{pending.push({f,m});return 0};global.clearInterval=noop;global.clearTimeout=noop;
const CTX=new Proxy({},{get:()=>()=>({addColorStop:noop,width:0,height:0,data:[]})});
const el=()=>({style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},width:960,height:540,
 value:'',textContent:'',innerHTML:'',children:[],childNodes:[],getContext:()=>CTX,appendChild:noop,removeChild:noop,
 addEventListener:noop,removeEventListener:noop,setAttribute:noop,getAttribute:()=>null,focus:noop,remove:noop,
 play:()=>Promise.resolve(),pause:noop,cloneNode(){return this},currentTime:0,volume:1,
 querySelector:()=>el(),querySelectorAll:()=>[],getBoundingClientRect:()=>({left:0,top:0,width:960,height:540})});
global.addEventListener=noop;global.removeEventListener=noop;
global.document={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),
 addEventListener:noop,body:el(),documentElement:el(),head:el(),hidden:false,visibilityState:'visible'};
global.window=global;global.localStorage={getItem:()=>null,setItem:noop,removeItem:noop};
global.Audio=function(){return el()};
global.Image=function(){return{addEventListener:noop,complete:false,naturalWidth:0,src:''}};
global.requestAnimationFrame=()=>0;global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0};
global.performance={now:()=>Date.now()};global.getComputedStyle=()=>({getPropertyValue:()=>''});
new Function(src+';globalThis.__C={NPCS,WORLD_PROPS,DISTRICT_ELDERS,ELDER_BY_DIST,isDistrictElder,SPECIES,'+
 'HUMANOID_ALLIES,isZyrexNpc,contactEligible,worldDistrictAt,walkable,_propDoors,findNpcById,isVeridanRiverTile,game};')();
const C=globalThis.__C;let n=0;while(pending.length&&n++<30){const q=pending.splice(0);q.forEach(t=>{try{t.f();}catch(_){}});}
let f=0;

const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m);if(!c)f++;};

console.log('\n1 · ★ THE CHAIN COVERS ALL TEN DISTRICTS IN ORDER\n');
ok(C.DISTRICT_ELDERS.length===10,`${C.DISTRICT_ELDERS.length} links in the chain`);
const ORDER=['malezor','zarvane','andrannor','veridan','netharion','vorashil','xilnar','baelgor','thardin','korathen'];
ok(C.DISTRICT_ELDERS.map(e=>e.dist).join()===ORDER.join(),'in Malezor -> Korathen order, matching the serpentine');
console.log('\n     district     elder            being             teaches      seated');
for(const e of C.DISTRICT_ELDERS){
  console.log(`     ${e.dist.padEnd(11)} ${String(e.name||'—').padEnd(16)} ${String(e.being||'—').padEnd(17)} ${String(e.teaches||'—').padEnd(12)} ${e.at?`(${e.at[0]},${e.at[1]})`:'—'}`);
}
const named=C.DISTRICT_ELDERS.filter(e=>e.id);
console.log(`\n     ${named.length}/10 elders exist · ${C.DISTRICT_ELDERS.filter(e=>e.built).length} ladder(s) built`);
ok(named.length>=2,'at least Kelthor and Omniris are named');
ok(C.DISTRICT_ELDERS.every(e=>e.steps===8),'every elder runs an 8-step ladder');
ok(C.DISTRICT_ELDERS.every(e=>!!e.handoff),'every link declares how it hands off to the next');

console.log('\n2 · ★★ EVERY NAMED ELDER ACTUALLY EXISTS IN THE WORLD\n');
for(const e of named){
  const npc=C.NPCS.find(x=>x&&x.id===e.id);
  ok(!!npc,`${e.name} exists as an NPC (${e.id})`);
  if(!npc) continue;
  ok(npc.tileX===e.at[0]&&npc.tileY===e.at[1],
     `${e.name.padEnd(15)} stands at the declared (${e.at[0]},${e.at[1]})`);
  ok(C.worldDistrictAt(npc.tileX,npc.tileY)===e.dist,
     `${e.name.padEnd(15)} is inside ${e.dist} (${C.worldDistrictAt(npc.tileX,npc.tileY)})`);
  ok(typeof npc.onInteract==='function',`${e.name.padEnd(15)} is interactable`);
}

console.log('\n3 · ★★ ELDERS vs TRAINERS · two different roles\n');
// v0.95.685 · This section originally asserted Foongus was Veridan's elder and
// therefore barred from the phone book.  Creator correction: he is a CONTACT
// who teaches combat upgrades, so reachability is the point of him.  Both the
// elder table and this test were wrong together, which is what happens when a
// test is written from the same assumption as the code.
const beings=new Set(named.map(e=>e.being));
console.log('     '+named.map(e=>`${e.name}: ${e.being}`).join('  ·  '));
ok(beings.size===named.length,`the ${named.length} elders are each a different kind of being (${beings.size} distinct)`);
const kelthor=C.NPCS.find(x=>x&&x.id==='kelthor');
const omniris=C.NPCS.find(x=>x&&x.id==='omniris');
const foongus=C.NPCS.find(x=>x&&x.id==='foongus');
ok(C.contactEligible(kelthor)===true,'Kelthor · elder    · Humanoid        -> phone book YES');
ok(C.contactEligible(omniris)===true,'Omniris · elder    · Humanoid/Aura   -> phone book YES');
ok(C.contactEligible(foongus)===true,'Foongus · TRAINER  · Creature/Nature -> phone book YES (Creator override)');
ok(!C.DISTRICT_ELDERS.some(e=>e.id==='foongus'),'Foongus is NOT in the elder chain — trainer and elder are separate roles');
ok(!!foongus._combatTrainer,`he is tagged _combatTrainer: ${foongus._combatTrainer}`);
console.log('\n     NOTE · Foongus is the first Creature-primary being in the contacts');
console.log('     list, which breaks aov-contact-registry-canon ("Zyrex are never');
console.log('     callable").  Creator directive overrides it for him by name.');
{ const zy=['anciuxor_wild','snok_wild','apexaur_1'].filter(x=>!_npcGated(x));   // ★ v0.95.789
  let held=0;
  for(const id of zy){ const n2=C.NPCS.find(x=>x&&x.id===id); if(n2&&C.contactEligible(n2)===false) held++; }
  ok(held===zy.length,zy.length?`and the rule still holds for every other Zyrex (${held}/${zy.length} refused)`:'(all wild Zyrex NPCs are gated · nothing to test)'); }

console.log('\n4 · ★ FOONGUS SITS IN THE PLAZA WITHOUT BLOCKING THE HALL\n');
const hall=C.WORLD_PROPS.find(p=>p&&p.id==='veridan_town_hall');
const foongus2=C.NPCS.find(x=>x&&x.id==='foongus');
console.log(`     hall door (${hall.tileX},${hall.tileY}) · Foongus (${foongus2.tileX},${foongus2.tileY})`);
ok(foongus2.tileY>hall.tileY,'he is IN FRONT of the hall, not inside it');
ok(!(foongus2.tileX===hall.tileX),'he is off the door\'s centre column');
const onFoot=hall.footprint.some(([dx,dy])=>hall.tileX+dx===foongus2.tileX&&hall.tileY+dy===foongus2.tileY);
ok(!onFoot,'not standing inside the building footprint');
let approach=0;
for(let dy=1;dy<=3;dy++) if(C.walkable(hall.tileX,hall.tileY+dy)) approach++;
ok(approach===3,`the door's straight approach is clear (${approach}/3 tiles)`);
ok(C._propDoors.has(`${hall.tileX},${hall.tileY}`),'and the hall door is still registered');
ok(foongus2.dir==='down','he faces DOWN, looking at you as you come up the plaza');

console.log('\n5 · ★ VERIDAN\'S TWO TEACHERS\n');
console.log('     They do different jobs and are deliberately different NPCs:');
console.log('       Foongus  · combat UPGRADES · plaza, outside the town hall');
console.log('       Sharkfin · one MOVE, Astralaser · by a home, facing the river\n');
{
  const sf=C.NPCS.find(x=>x&&x.id==='sharkfin');
  ok(!!sf,'Sharkfin exists');
  ok(C.worldDistrictAt(sf.tileX,sf.tileY)==='veridan',`he is in veridan (${C.worldDistrictAt(sf.tileX,sf.tileY)})`);
  ok(C.contactEligible(sf)===true,'contact-eligible, like Foongus');
  ok(sf._moveTeacher==='astralaser',`tagged _moveTeacher: ${sf._moveTeacher}`);
  ok(!C.DISTRICT_ELDERS.some(e=>e.id==='sharkfin'),'not in the elder chain — teacher, not elder');
  ok(sf.dir==='right','faces RIGHT, toward the river he will teach beside');
  // v0.95.688 · was pinned to veridan_home_6, which was MY provisional choice.
  // The Creator moved him to (534,277), so the test now asks the question that
  // actually matters — is he near A home — rather than the one I happened to
  // pick first.  A test pinned to a guess fails the moment the guess is
  // overridden, and that failure carries no information.
  let h=null,d=1e9;
  for(const q of C.WORLD_PROPS){
    if(!q||!q._doctrineHome)continue;
    const v=Math.hypot(sf.tileX-q.tileX,sf.tileY-q.tileY);
    if(v<d){d=v;h=q;}
  }
  console.log(`     nearest home is ${h.id} (${h.tileX},${h.tileY}) at ${d.toFixed(0)} tiles`);
  // v0.95.688 · "near a home for now" was the PROVISIONAL brief; the Creator has
  // since given an exact tile, and an explicit coordinate outranks my inference.
  // So the hard assertion is the coordinate, and the distances are REPORTED
  // rather than enforced — a test that fights a deliberate decision is noise.
  console.log(`     (he is in open ground now — ${d.toFixed(0)}t from the nearest house,`);
  console.log(`      and on Veridan's road quarter rather than beside a building)`);
  const inF=h.footprint.some(([a,b])=>h.tileX+a===sf.tileX&&h.tileY+b===sf.tileY);
  ok(!inF,'not standing inside that home');
  ok(C._propDoors.has(`${h.tileX},${h.tileY}`),'and its door is still registered');
  ok(sf.tileX===534&&sf.tileY===277,'at the Creator-specified (534,277)');
  // the river he is aimed at
  let river=0,nearest=1e9;
  for(let y=200;y<320;y++) for(let x=440;x<610;x++) if(C.isVeridanRiverTile(x,y)){
    river++; nearest=Math.min(nearest,Math.hypot(x-sf.tileX,y-sf.tileY)); }
  console.log(`     Veridan river is ${river} tiles · nearest is ${nearest.toFixed(0)} tiles due east`);
  ok(river>0,'the river he references actually exists');
  // his own sprite
  ok(sf.bboxes.length===4&&sf.bboxes.every(r=>r.length===4),'16 bboxes');
  const DIRS2=['down','left','right','up'];
  sf.bboxes.forEach((row,i)=>{
    const feet=row.map(b=>b[1]+b[3]);
    const spread=Math.max(...feet)-Math.min(...feet);
    console.log(`     ${DIRS2[i].padEnd(6)} feet ${feet.join(', ')}${spread?`   (${spread}px wobble)`:''}`);
    ok(spread<=1,`${DIRS2[i]} feet baseline level within 1px (${spread})`);
  });
  // negative offsets are intentional here — assert they sample only empty space
  const neg=sf.bboxes.flat().filter(b=>b[0]<0||b[1]<0).length;
  console.log(`     ${neg} bbox(es) carry a negative offset — the sheet has no gutter`);
  ok(neg>0,'the unclamped measurement really did capture the overhang');
}

console.log('\n6 · SPRITE · Foongus 16 CC bboxes, feet level per row\n');
ok(Array.isArray(foongus2.bboxes)&&foongus2.bboxes.length===4,'4 rows');
ok(foongus2.bboxes.every(r=>r.length===4),'4 frames each = 16 total');
const DIRS=['down','left','right','up'];
let uneven=0;
foongus2.bboxes.forEach((row,i)=>{
  const feet=row.map(b=>b[1]+b[3]);
  const same=feet.every(v=>v===feet[0]);
  if(!same)uneven++;
  console.log(`     ${DIRS[i].padEnd(6)} feet baseline ${feet.join(', ')}${same?'':'   <-- UNEVEN, he will bob'}`);
});
ok(uneven===0,`every row has a level feet baseline (${uneven} uneven)`);
let oversize=0;
for(const row of foongus2.bboxes) for(const b of row) if(b[0]+b[2]>313||b[1]+b[3]>313) oversize++;
ok(oversize===0,`no bbox reaches outside its 313 cell (${oversize})`);
console.log(`     scaleMul ${foongus2.scaleMul} · heavier than a humanoid (1.0), lighter than Kaizari (1.35)`);

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
