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
new Function(src+';globalThis.__C={SPECIES,HUMANOID_ALLIES,HUMANOID_ALLY_IDS,isHumanoidAlly,isValidZyrexTyping,'+
 'NPCS,isZyrexNpc,contactEligible,DEV_FACTION_ACTORS,astraliteStatPool,canonType,worldDistrictAt};')();
const C=globalThis.__C;let n=0;while(pending.length&&n++<30){const q=pending.splice(0);q.forEach(t=>{try{t.f();}catch(_){}});}
let f=0;const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m);if(!c)f++;};

console.log('\n1 · ★ OFF THE ZYREX ROSTER\n');
ok(!C.SPECIES.omniris,'omniris is no longer in SPECIES');
ok(!!C.HUMANOID_ALLIES.omniris,'omniris IS in HUMANOID_ALLIES');
const O=C.HUMANOID_ALLIES.omniris;
console.log(`     ${O.name} · T${O.tier} · ${O.type}/${O.type2} · ${O.classification} ${O.tierName}`);
ok(O.type==='Humanoid'&&O.type2==='Aura','typing is Humanoid-primary / Aura-secondary');
ok(C.isHumanoidAlly('omniris'),'isHumanoidAlly("omniris") is true');
ok(!C.DEV_FACTION_ACTORS.omniris,'removed from DEV_FACTION_ACTORS, same as auraxion');

console.log('\n2 · ★ HE SITS BESIDE AURAXION, NOT BESIDE A ZYREX\n');
const A=C.HUMANOID_ALLIES.auraxion;
console.log(`     auraxion  T${A.tier} ${A.type}/${A.type2}`);
console.log(`     omniris   T${O.tier} ${O.type}/${O.type2}`);
ok(A.type===O.type&&A.type2===O.type2,'identical typing to Auraxion, the existing precedent');
ok(Object.keys(C.HUMANOID_ALLIES).length===2,`HUMANOID_ALLIES now holds ${Object.keys(C.HUMANOID_ALLIES).length}`);

console.log('\n3 · ★ THE TYPING RULE AGREES\n');
ok(C.isValidZyrexTyping(O)===false,'isValidZyrexTyping(omniris) is now FALSE — correctly not a Zyrex');
ok(C.isValidZyrexTyping(C.SPECIES.elzebub)===true,'and a real Zyrex still passes (elzebub)');
let bad=0; for(const k of Object.keys(C.SPECIES)) if(!C.isValidZyrexTyping(C.SPECIES[k])) bad++;
ok(bad===0,`no remaining SPECIES row is Humanoid-primary (${bad})`);

console.log('\n4 · ★★ HE CAN NOW BE A CONTACT · which is the whole point\n');
const npc=C.NPCS.find(x=>x&&x.id==='omniris');
ok(!!npc,'the oasis NPC still exists');
console.log(`     stands at (${npc.tileX},${npc.tileY}) in ${C.worldDistrictAt(npc.tileX,npc.tileY)}`);
ok(C.isZyrexNpc(npc)===false,'isZyrexNpc(omniris) is FALSE — he left the SPECIES table, so detection follows');
ok(C.contactEligible(npc)===true,'contactEligible is TRUE · he can enter the phone book like Kelthor');
const kel=C.NPCS.find(x=>x&&x.id==='kelthor');
ok(!!kel&&C.contactEligible(kel)===true,'and Kelthor still is too — same track, same rules');

console.log('\n5 · STATS UNTOUCHED · T6 x 333 still holds\n');
console.log(`     canonical ${JSON.stringify(O.canonicalStats)} total ${O.canonicalTotal}`);
ok(O.canonicalTotal===1998,'1998 = tier 6 x 333');
ok(C.astraliteStatPool(6)===1998,'and astraliteStatPool(6) agrees');
ok(O.moves.length===4,`his 4 canonical moves survive: ${O.moves.join(', ')}`);
console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
