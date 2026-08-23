const fs = require('fs');
const src = fs.readFileSync('/tmp/all.js', 'utf8');
const noop = () => {};
global.setInterval = () => 0; global.setTimeout = () => 0;
global.clearInterval = noop; global.clearTimeout = noop;
const CTX = new Proxy({}, { get: () => () => ({ addColorStop: noop, width:0, height:0, data:[] }) });
const el = () => ({ style:{}, dataset:{}, classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},
  width:960, height:540, value:'', textContent:'', innerHTML:'', children:[], childNodes:[],
  getContext:()=>CTX, appendChild:noop, removeChild:noop, addEventListener:noop, removeEventListener:noop,
  setAttribute:noop, getAttribute:()=>null, focus:noop, remove:noop, play:()=>Promise.resolve(), pause:noop,
  querySelector:()=>el(), querySelectorAll:()=>[], getBoundingClientRect:()=>({left:0,top:0,width:960,height:540}) });
global.addEventListener = noop; global.removeEventListener = noop;
global.document = { getElementById:()=>el(), querySelector:()=>el(), querySelectorAll:()=>[],
  createElement:()=>el(), addEventListener:noop, body:el(), documentElement:el(), head:el(),
  hidden:false, visibilityState:'visible' };
global.window = global;
global.localStorage = { getItem:()=>null, setItem:noop, removeItem:noop };
global.Audio = function(){ return { play:()=>Promise.resolve(), pause:noop, addEventListener:noop, cloneNode(){return this} }; };
global.Image = function(){ return { addEventListener:noop, complete:false, naturalWidth:0, src:'' }; };
global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = noop;
global.matchMedia = () => ({ matches:false, addEventListener:noop, addListener:noop });
global.navigator = { userAgent:'node', getGamepads:()=>[], maxTouchPoints:0 };
global.performance = { now: () => Date.now() };
global.getComputedStyle = () => ({ getPropertyValue: () => '' });
// v0.95.745 · Voltaryn T5 · Elzoran's proof-of-raising gate · both sprites live.
const FS=require('fs');
try{new Function(FS.readFileSync('/tmp/all.js','utf8')+
 ';globalThis.__C={SPECIES,SUMMONABLE_SPRITES,SPECIES_RECRUIT_GATES,tryRecruitWildZyrex,'+
 'requiredBondForTier,rizerBondTotal,player,MALEZOR_WILD_ROSTER,createZyrex,spawnWildZyrex,WILD_ZYREX,seedMalezorWild};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C,P=C.player;let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m);if(!c)f++;};

console.log('\n1 · ★ VOLTARYN IS NOW TIER 5\n');
const v=C.SPECIES.voltaryn;
ok(v.tier===5,`tier ${v.tier} (was 4)`);
const pool=v.baseHP+v.baseATK+v.baseDEF+v.baseSPD+v.baseSATK+v.baseSDEF;
ok(pool===1665,`pool ${pool} = 5 x 333 — the pool MOVED with the tier`);
ok(v.baseDEF>v.baseATK&&v.baseSPD<v.baseHP,'and the spread survived the rescale (tanky bruiser, DEF highest)');
ok(C.requiredBondForTier(5)===1665,`bond gate ${C.requiredBondForTier(5)} = 50%`);

console.log('\n2 · ★ BOTH SPRITES REGISTERED · they were on disk all along\n');
for(const id of ['voltaryn','elzoran']){
  const S=C.SUMMONABLE_SPRITES[id];
  ok(!!S,`${id} in SUMMONABLE_SPRITES`);
  ok(S && S.bboxes.length===4 && S.bboxes.every(r=>r.length===4),`${id} full 4x4 bbox table`);
  ok(S && S.bboxes.every(r=>r[0][0]>=0),`${id} no COLUMN-0 negative x (that would sample off the sheet)`);
  ok(FS.existsSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/assets/2D sprites/zyrex/'+id+'.png'),`${id}.png on disk`);
}

console.log('\n3 · ★★ ELZORAN · PROOF-OF-RAISING, NOT BOND\n');
const g=C.SPECIES_RECRUIT_GATES.elzoran;
ok(!!g,'elzoran has a species gate');
P.party=[]; P.pcZyrex=[];
ok(g.test()===false,'no Elzebub at all -> gate CLOSED');
console.log('     refusal reads: "'+g.why()+'"');
P.party=[C.createZyrex('elzebub',49)];
ok(g.test()===false,'Elzebub at Lv49 -> still closed');
console.log('     refusal reads: "'+g.why()+'"');
P.party=[C.createZyrex('elzebub',50)];
ok(g.test()===true,'★ Elzebub at Lv50 -> gate OPEN');
P.party=[]; P.pcZyrex=[C.createZyrex('elzebub',60)];
ok(g.test()===true,'and an Elzebub in PC STORAGE counts too — storing it is not a punishment');

console.log('\n4 · ★★ THE GATE RUNS BEFORE THE BOND GATE\n');
console.log('     Elzoran\'s condition is not "more bond". Reporting a bond');
console.log('     shortfall would send the player to grind the wrong axis.\n');
const rsrc=String(C.tryRecruitWildZyrex);
const gi=rsrc.indexOf('SPECIES_RECRUIT_GATES'), bi=rsrc.indexOf('requiredBondForTier');
ok(gi>0&&bi>0&&gi<bi,'★ species gate is checked BEFORE requiredBondForTier in the source');
ok(/does NOT flee/.test(rsrc)||/return;\s*\/\/ ★ does NOT flee/.test(rsrc),
   'and a gated Elzoran does not flee — it is waiting on you, not refusing you');
// live: gate closed, huge bond -> still refused, still present
P.party=[]; P.pcZyrex=[];
P.bonds={mom:100,dad:100,yara:100,kelthor:100,scrapjaw:100,a:100,b:100,c:100,d:100,e:100,f:100,g:100};
C.WILD_ZYREX.length=0;
const w=C.spawnWildZyrex('elzoran',500,500,{level:12});
const before=C.WILD_ZYREX.length;
C.tryRecruitWildZyrex(w);
ok((P.party||[]).every(z=>z.speciesId!=='elzoran'),'★ with max bond but no Lv50 Elzebub, Elzoran does NOT join');
ok(!w._gone&&C.WILD_ZYREX.length===before,'and it is still standing there to come back to');
// now satisfy the gate
P.party=[C.createZyrex('elzebub',50)];
C.tryRecruitWildZyrex(w);
ok((P.party||[]).some(z=>z&&z.speciesId==='elzoran'),'★★ raise the Elzebub to 50 and it joins');

console.log('\n5 · ★ ROSTERED FOR THE PLAYTEST\n');
for(const id of ['voltaryn','elzoran','apexaur'])
  ok(C.MALEZOR_WILD_ROSTER.includes(id),`${id} is in MALEZOR_WILD_ROSTER`);
console.log('     apexaur T'+C.SPECIES.apexaur.tier+' gate '+C.requiredBondForTier(C.SPECIES.apexaur.tier)+' (30%) · '+
            'voltaryn T5 gate '+C.requiredBondForTier(5)+' (50%) · elzoran T'+C.SPECIES.elzoran.tier+
            ' gate '+C.requiredBondForTier(C.SPECIES.elzoran.tier)+' + Elzebub Lv50');

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');process.exit(0);
