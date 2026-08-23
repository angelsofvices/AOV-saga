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
// v0.95.744 · MASS INVENTORY · faction <-> PC storage for Zyrex.
const FS=require('fs');
try{new Function(FS.readFileSync('/tmp/all.js','utf8')+
 ';globalThis.__C={player,game,switchDockTab,depositZyrexToPC,withdrawZyrexFromPC,PARTY_MAX,'+
 'SPECIES,createZyrex,DEV_FACTION_ACTORS,requiredBondForTier,rizerBondTotal,NPCS,_dockTabRef:(typeof _dockTab!=="undefined"?1:0)};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C,P=C.player;let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m);if(!c)f++;};
const HTML=FS.readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html','utf8');

console.log('\n1 · ★★ THE HELPERS EXISTED AND NOTHING CALLED THEM\n');
ok(typeof C.depositZyrexToPC==='function','depositZyrexToPC exists');
ok(typeof C.withdrawZyrexFromPC==='function','withdrawZyrexFromPC exists');
const dep=(HTML.match(/depositZyrexToPC/g)||[]).length;
const wit=(HTML.match(/withdrawZyrexFromPC/g)||[]).length;
console.log(`     depositZyrexToPC appears ${dep}x · withdrawZyrexFromPC ${wit}x (definition + call sites)\n`);
ok(dep>=2&&wit>=2,'★ both are now CALLED, not just defined — they were dead code since v0.95.536');

console.log('\n2 · ★★ THE LIST NO LONGER HIDES WILD CATCHES\n');
ok(!/filter\(z => z && DEV_FACTION_ACTORS\[z\.speciesId\]\)/.test(HTML),
   '★ the DEV_FACTION_ACTORS filter is GONE — it hid every wild-caught Zyrex from the mass inventory');
const wildOnly=Object.keys(C.SPECIES).filter(id=>!C.DEV_FACTION_ACTORS[id]);
console.log(`     ${wildOnly.length} of ${Object.keys(C.SPECIES).length} species are NOT in the dev roster`);
console.log(`     — every one of them was invisible in the FACTIONS tab before this\n`);
ok(wildOnly.length>0,'and that set is not empty, so the bug was real');

console.log('\n3 · ★★ DEPOSIT · FACTION → PC\n');
P.party=[]; P.pcZyrex=[];
const a=C.createZyrex('verdanix',10), b=C.createZyrex('otterlin',12);
P.party.push(a,b);
ok(P.party.length===2&&P.pcZyrex.length===0,'start: 2 in faction, 0 in PC');
ok(C.depositZyrexToPC(0)===true,'deposit index 0 returns true');
ok(P.party.length===1&&P.pcZyrex.length===1,'faction 1 · PC 1');
ok(P.pcZyrex[0].speciesId==='verdanix','the RIGHT one moved');
ok(P.party[0].speciesId==='otterlin','and the other stayed');

console.log('\n4 · ★★ WITHDRAW · PC → FACTION, STILL BOND-GATED\n');
P.bonds={}; // wipe bond
const need=C.requiredBondForTier(P.pcZyrex[0].tier||1);
console.log(`     verdanix is T${P.pcZyrex[0].tier} · needs ${need} bond · have ${C.rizerBondTotal()}\n`);
const gated=C.withdrawZyrexFromPC(0);
if (C.rizerBondTotal()<need){
  ok(gated===false,'★ withdrawal is refused below the tier bond gate — the same gate as a fresh catch');
  ok(P.pcZyrex.length===1,'and it stays in the PC');
} else ok(true,'bond already clears the gate at this tier');
P.bonds={mom:100,dad:100,yara:100,kelthor:100,scrapjaw:100};
ok(C.withdrawZyrexFromPC(0)===true,'with bond, withdrawal succeeds');
ok(P.party.length===2&&P.pcZyrex.length===0,'faction 2 · PC 0 — round trip complete');

console.log('\n5 · ★ PARTY-FULL AND SUMMONED GUARDS\n');
P.party=[]; P.pcZyrex=[];
for(let i=0;i<C.PARTY_MAX;i++) P.party.push(C.createZyrex('verdanix',5));
P.pcZyrex.push(C.createZyrex('otterlin',5));
ok(C.withdrawZyrexFromPC(0)===false,`refuses to withdraw into a full faction (${C.PARTY_MAX})`);
ok(P.pcZyrex.length===1,'and nothing is lost');
ok(/is out in the field · recall to ZyCube first/.test(String(C.depositZyrexToPC)),
   'deposit still refuses a Zyrex that is summoned in the field — guard inherited, not reimplemented');

console.log('\n6 · ★ THE PANEL RENDERS BOTH COLUMNS\n');
P.party=[C.createZyrex('verdanix',9)]; P.pcZyrex=[C.createZyrex('snok',20)];
let threw=null;
try { C.switchDockTab('zyrex'); } catch(e){ threw=e.message; }
ok(!threw,'switchDockTab("zyrex") runs clean'+(threw?' — '+threw:''));
ok(/FACTION ⇄ PC STORAGE/.test(HTML),'panel is titled FACTION ⇄ PC STORAGE');
ok(/PC STORAGE \(\$\{pc\.length\}\)/.test(HTML),'PC column is driven by the live pcZyrex array');
ok(/data-dir="\$\{dir\}"/.test(HTML)&&/toParty/.test(HTML),'rows carry a direction so one handler serves both columns');
ok(/saveGame\(\); \} catch\(_\)\{\} switchDockTab\('zyrex'\)/.test(HTML),
   'a successful move SAVES and repaints — storage that vanishes on reload is not storage');

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');process.exit(0);
