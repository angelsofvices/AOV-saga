const fs=require('fs');const src=fs.readFileSync('/tmp/all.js','utf8');const noop=()=>{};const pending=[];
global.setInterval=()=>0;global.setTimeout=(f,m)=>{pending.push({f,m});return 0};global.clearInterval=noop;global.clearTimeout=noop;
const CTX=new Proxy({},{get:()=>()=>({addColorStop:noop,width:0,height:0,data:[]})});
const el=()=>({style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},width:960,height:540,
 value:'',textContent:'',innerHTML:'',children:[],childNodes:[],getContext:()=>CTX,appendChild:noop,removeChild:noop,
 addEventListener:noop,removeEventListener:noop,setAttribute:noop,getAttribute:()=>null,focus:noop,remove:noop,
 querySelector:()=>el(),querySelectorAll:()=>[],getBoundingClientRect:()=>({left:0,top:0,width:960,height:540})});
global.addEventListener=noop;global.removeEventListener=noop;
global.document={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),
 addEventListener:noop,body:el(),documentElement:el(),head:el(),hidden:false,visibilityState:'visible'};
global.window=global;global.localStorage={getItem:()=>null,setItem:noop,removeItem:noop};
global.Audio=function(){return{play:()=>Promise.resolve(),pause:noop,addEventListener:noop,cloneNode(){return this}}};
global.Image=function(){return{addEventListener:noop,complete:false,naturalWidth:0,src:''}};
global.requestAnimationFrame=()=>0;global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0};
global.performance={now:()=>Date.now()};global.getComputedStyle=()=>({getPropertyValue:()=>''});
new Function(src+';globalThis.__C={WORLD_PROPS,NPCS,_propBlocked,_propDoors,toggleContactCall,addContactToFaction,isFactionContact,CONTACT_CALL_BOND,contactCallBondOk,addZyrexToRoster,createZyrex,findNpcById,isFriendlyNpc,PARTY_MAX,player,isWorldLandTile,isWorldBorderTile,isVeridanRiverTile,wheelQuarterAt,ZYRAXIS_DISTRICT_BY_ID,worldDistrictAt,walkable,game};')();
const C=globalThis.__C;let n=0;while(pending.length&&n++<30){const q=pending.splice(0);q.forEach(t=>{try{t.f();}catch(_){}});}
let f=0;const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m);if(!c)f++;};
const P=C.player;
P.phoneBattery=true;
P.scrapjawTowersRestored={malezor:true,zarvane:true,andrannor:true,veridan:true};
C.game.scene='overworld'; P.x=520; P.y=260; P.dir='down';
P.bonds=P.bonds||{}; P.factionContacts=[];
const kel=C.findNpcById('kelthor');

console.log('\n1 · ★★ A CONTACT WILL NOT COME UNTIL BOND IS FULL\n');
console.log(`     CONTACT_CALL_BOND = ${C.CONTACT_CALL_BOND}\n`);
P.bonds.kelthor=40;
ok(C.contactCallBondOk('kelthor')===false,'bond 40  · will not pick up');
C.toggleContactCall('kelthor','Kelthor');
ok(!kel._phoneSpawned,'...and dialling really does nothing');
P.bonds.kelthor=99;
ok(C.contactCallBondOk('kelthor')===false,'bond 99  · still will not pick up — FULL means full');
C.toggleContactCall('kelthor','Kelthor');
ok(!kel._phoneSpawned,'...still nothing');
P.bonds.kelthor=100;
ok(C.contactCallBondOk('kelthor')===true,'bond 100 · now they answer');

console.log('\n2 · ★★ CALLED CONTACTS FOLLOW YOU\n');
const homeWas={x:kel.tileX,y:kel.tileY,scene:kel.scene,mode:kel.mode};
C.toggleContactCall('kelthor','Kelthor');
ok(kel._phoneSpawned===true,'Kelthor answered and travelled to you');
console.log(`     he was at (${homeWas.x},${homeWas.y}) mode '${homeWas.mode}' · now (${kel.tileX},${kel.tileY}) mode '${kel.mode}'`);
ok(kel.mode==='follow',"his mode is 'follow' — he walks with you, he does not just stand there");
ok(Math.hypot(kel.tileX-P.x,kel.tileY-P.y)<=2,'and he arrived beside you');
ok(kel._phoneHomeMode===homeWas.mode,`his old mode was remembered ('${kel._phoneHomeMode}') for the trip home`);

console.log('\n3 · ★★ SQUARE ADDS A CALLED CONTACT TO THE FACTION\n');
ok(!C.isFactionContact('kelthor'),'not in the faction yet — being called is not the same as joining');
const added=C.addContactToFaction(kel);
ok(added===true,'Square promotes him');
ok(C.isFactionContact('kelthor'),'he is now in player.factionContacts');
ok(P.factionContacts.includes('kelthor'),`roster: [${P.factionContacts.join(', ')}]`);
ok(C.addContactToFaction(kel)===false,'pressing Square again does not double-add him');

console.log('\n4 · ★★ RE-DIAL SENDS HIM HOME, VIA THE ZYPHONE\n');
C.toggleContactCall('kelthor','Kelthor');
ok(kel._phoneSpawned===false,'he is no longer at your side');
ok(kel.tileX===homeWas.x&&kel.tileY===homeWas.y,`back at (${kel.tileX},${kel.tileY}) — exactly where he was`);
ok(kel.mode===homeWas.mode,`and back to mode '${kel.mode}' — not left stranded as a follower`);
ok(C.isFactionContact('kelthor'),'faction membership SURVIVES going home · joining is permanent');
console.log('     (this is the bit that would break if mode were not restored:');
console.log('      a "follow" NPC standing in his own doorway forever)');

console.log('\n5 · ★★ ZYREX TAKE THE OTHER PATH ENTIRELY\n');
console.log('     They live in the ZyPhone already — Zysphere -> Zycube -> phone —');
console.log('     so they go STRAIGHT to the faction tab, no call required.\n');
P.party=[]; P.pcZyrex=[]; C.game.devMaxBond=true;
const z1=C.createZyrex('volcanut',5);
const r1=C.addZyrexToRoster(z1);
console.log(`     caught ${z1.name} -> ${r1.location}`);
ok(r1.location==='party','a caught Zyrex lands in the faction tab immediately');
ok(P.party.length===1,'party now holds him');
ok(!C.isFactionContact('volcanut'),'and he is NOT a phone contact — different system entirely');
// fill the party
while(P.party.length < C.PARTY_MAX) P.party.push(C.createZyrex('otterlin',5));
const z2=C.createZyrex('verdanix',5);
const r2=C.addZyrexToRoster(z2);
console.log(`     party full (${C.PARTY_MAX}) · caught ${z2.name} -> ${r2.location} (${r2.reason})`);
ok(r2.location==='pc'&&r2.reason==='partyFull','when the phone is full the next one goes to the PC');
ok(P.pcZyrex.length===1,'PC now holds the overflow');

console.log('\n6 · ★ THE TWO PATHS NEVER CROSS\n');
ok(P.factionContacts.every(id=>!P.party.some(z=>z&&z.speciesId===id)),
   'nobody is in both the contact faction and the Zyrex party');
C.toggleContactCall('volcanut','Volcanut');
const vn=C.findNpcById('volcanut');
ok(!vn||!vn._phoneSpawned,'a Zyrex still cannot be dialled at all');
console.log('     zyrex   · caught -> faction tab · PC if full · never dialled');
console.log('     contact · bond 100 -> call -> follows -> Square -> faction · re-dial sends home');

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
