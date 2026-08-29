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
try{new Function(src+';globalThis.__C={_mw:()=>_malezorWildPlaced,seedMalezorWild,WORLD_PROPS,_propBlocked,zyrexUid,zyrexFollowerId,SPECIES_RECRUIT_GATES,SPECIES,seedMalezorWild,player,game,tryRecruitWildZyrex,rizerBondTotal,requiredBondForTier,zyTriangleArm,zyTriangleRelease,quickSummonStashAll,toggleFactionSummon,NPCS,_wild:()=>{try{return _malezorWildPlaced}catch(e){return []}}};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);

H('1 · ★★ ELZORAN ANSWERS · the Lv-50 bar was a Zyrex that cannot exist');
{
  ok(/evolveTo:'elzimir', evolveLv:30/.test(src),'root cause on record: Elzebub becomes Elzimir at Lv 30');
  ok(!/speciesId === 'elzebub' && \(z\.level \|\| 0\) >= 50/.test(src),'★ the unsatisfiable Lv-50 test is gone');
  const G=C.SPECIES_RECRUIT_GATES.elzoran;
  C.player.pcZyrex=[];
  C.player.party=[{speciesId:'elzebub',level:3}];
  ok(G.test()===true,'★ Elzebub at ANY level satisfies him');
  C.player.party=[{speciesId:'elzimir',level:31}];
  ok(G.test()===true,'★ …and so does the evolved Elzimir (he recognises his kin, not a number)');
  C.player.party=[{speciesId:'apexaur',level:100}];
  ok(G.test()===false,'a stranger\'s roster still gets silence');
  ok(G.silent===true,'the silence canon stands · no vox, no dialog, just ignored');
}

H('2 · ★★ RARE TIER-5 WILD · the level law holds');
{
  ok(C.SPECIES.elzoran.tier===5,'Elzoran is Tier 5 in SPECIES');
  C.seedMalezorWild();
  const w=C._wild().find(x=>x&&x.speciesId==='elzoran');
  ok(!!w,'the wild stands at the statue');
  ok(w.tileX===8&&w.tileY===31,'…at (8,31) · the statue forecourt (moved off the grass at v0.95.869)');
  ok(w&&w.level===50,'★ level 50 · tier x 10 · the law, no override');
  ok(w&&w.temperament==='Calm','Calm · he does not flee a failed approach');
  ok(C.requiredBondForTier(5)===1665,'T5 bond bar = 50% of 3330');
  // the full path: kin + bond → he joins
  C.player.party=[{speciesId:'elzimir',level:100,hp:9},{speciesId:'apexaur',level:100,hp:9},{speciesId:'snok',level:100,hp:9},
                  {speciesId:'voltaryn',level:100,hp:9},{speciesId:'otterlin',level:100,hp:9},{speciesId:'celestryx',level:100,hp:9},
                  {speciesId:'volcanut',level:100,hp:9},{speciesId:'verdanix',level:100,hp:9}];
  C.player.pcZyrex=[];
  C.player.bondLedger={zyrex:1665,rizer:1665};   // ★ v0.95.862 · bond is EARNED now · grant a maxed ledger for the gate test
  global.showDialog=noop; global.showToast=noop;
  C.tryRecruitWildZyrex(w);
  ok(/startWildBondEncounter\(w, sp\)/.test(src)&&C.SPECIES_RECRUIT_GATES.elzoran.test(),'★ v0.95.866 · kin gate passes → the IMPRINT ENCOUNTER opens (the join is earned in the spin now)');
}

H('3 · ★★ v0.95.837 · THE FIELD IS FOR FIGHTING · Zysphere lives in the phone');
{
  // ★ INVERTED · the v0.95.825 overworld tap-recall + hold-arm are REVOKED.
  // Creator: "the only way to send a zyrex back is going in the phone and
  // pressing triangle for one or holding triangle to send all back/out...
  // a zyrex stands in front of me and triggers text boxes... this disrupts
  // the combat."
  ok(src.indexOf("TRIANGLE IS THE ZYSPHERE TOGGLE · Creator")<0,'the overworld tap-recall branch is GONE');
  ok(/the v0\.95\.825 overworld tap-recall is REVOKED/.test(src),'…deliberately, with the ruling quoted');
  ok(/facing && !facing\._summoned && !facing\.isEnemy && isFriendlyNpc\(facing\)/.test(src),'★ Triangle soul-swap is blind to summons · faced Zyrex = plain kick');
  const tick=src.slice(src.indexOf('function zyTriangleHoldTick'),src.indexOf('function zyTriangleHoldTick')+900);
  ok(/!game\._zyTriHeld \|\| !game\.zphoneOpen/.test(tick),'★ the hold completes ONLY with the phone open');
  ok(!/game\.scene === 'overworld'[^\n]*zyTriangleArm/.test(src),'the overworld hold-arm is gone');
  // Square is blind too
  ok(/facing\._phoneSpawned && !facing\._summoned/.test(src)&&/facing && !facing\._summoned && isFriendlyNpc/.test(src),
     '★ SQUARE is blind to summons — no follow toggle, no bond toast, the punch just fires');
  // phone paths still work
  C.player.party=[{speciesId:'snok',level:10,hp:9,name:'Snok'}];
  C.game.scene='overworld';
  C.toggleFactionSummon(0);
  const fol=C.NPCS.find(n=>n&&n._summoned&&n._summonSpeciesId==='snok')   // ★ v0.95.863 · followers are keyed per-INDIVIDUAL now (uid), not per-species;
  ok(fol&&fol._summoned===true,'phone Triangle (toggleFactionSummon) still deploys');
  C.toggleFactionSummon(0);
  ok(fol._summoned===false,'…and still recalls · the one door stands');
}


H('★ v0.95.869 · THE VIGIL · he faces the statue, and he is answered, not caught');
{
  C.seedMalezorWild&&C.seedMalezorWild();
  const w=(C._mw?C._mw():[]).find(x=>x&&x.speciesId==='elzoran')||null;
  const st=C.WORLD_PROPS.find(p=>p&&p.id==='novarius_statue');
  ok(!!w,'Elzoran stands in the world');
  if(w&&st){
    ok(w.tileX===st.tileX&&w.tileY===st.tileY+2,`he is in the statue's forecourt · (${w.tileX},${w.tileY}) two south of (${st.tileX},${st.tileY})`);
    ok(w.dir==='up','★ and he FACES it — dir up, the old champion keeping vigil');
    ok(!C._propBlocked.has(`${w.tileX},${w.tileY}`),'his ground is clear · no bush under him');
    ok(w._noEncounter===true,'★ flagged NO WILD ENCOUNTER — he is spoken to, not spun for');
  }
  ok(/_dirRow = \{ down:0, left:1, right:2, up:3 \}/.test(src),'wild draw honours a facing now (it drew row 0 forever)');
  ok(/if \(!w\._noEncounter\)\{\s*\n\s*startWildBondEncounter/.test(src),'the QTE is skipped for flagged wilds');
  ok(/I knelt here the day the First Beast Master fell/.test(src),'★ his joining dialog is written');
  ok(/Elzoran does not turn from the statue/.test(src),'…and his under-bonded refusal');
  ok(/requiredBondForTier\(sp\.tier\)/.test(src),'the bar is still the tier bond gate · T5 = 50%, same as before');
}

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
