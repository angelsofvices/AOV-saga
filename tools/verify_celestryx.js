// v0.95.722 · KILL XP · "im not getting xp for kills. make sure all kills give
// xp in scaled ... difficulty"  + "catching a fae gains 100% speed energy
// yellow bar faedust"
//
// The first thing to establish is WHERE the fault was, because the answer
// changes the fix completely. It was NOT the plumbing: all eleven death sites
// already credited, and a kill paid out correctly in isolation. It was
// magnitude, and specifically the shape of the curve — the reward barely moved
// with level while the cost climbed quadratically, so grinding the same Mori
// went from 19 kills a level to 631.
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
try { new Function(require('fs').readFileSync('/tmp/all.js','utf8') +
  ';globalThis.__C={player,game,WORLD_PROPS,createZyrex,addZyrexToRoster,rizerBondTotal,' +
  'requiredBondForTier,FAE_UNLOCK_COUNT,PARTY_MAX,SPECIES};')();
} catch(e){ console.log('BOOT FAILED:', e.message); process.exit(1); }
const C = globalThis.__C, P = C.player;
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const raw = require('fs').readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html','utf8');
const noC = raw.replace(/\/\/[^\n]*/g, '');

console.log('\n1 · ★★ WHY IT NEVER REACHED THE PHONE\n');
console.log('     The altar DID call addZyrexToRoster. The problem was what that');
console.log('     function did with a TIER 6 creature.\n');
console.log(`     fresh Rizer bond total      ${C.rizerBondTotal()}`);
console.log(`     Celestryx is tier 6, needs  ${C.requiredBondForTier(6)}`);
console.log('');
ok(C.requiredBondForTier(6) > C.rizerBondTotal(),
   'a fresh Rizer cannot clear the T6 gate — so it was filed in PC storage');
console.log('     and the FACTION tab reads player.party, which never saw it.');
console.log('     The dialogue still said "has joined your party", which is');
console.log('     exactly why this went unnoticed.\n');

console.log('2 · ★★ THE RITUAL NOW LANDS IN THE FACTION\n');
ok(/bypassBondGate/.test(noC), 'addZyrexToRoster takes an opts.bypassBondGate');
ok(/if \(!_bypass && have < need\)/.test(noC), 'and the tier gate honours it');
ok(/addZyrexToRoster\(z, \{ bypassBondGate: true \}\)/.test(noC),
   'the altar passes it — the 60 fae WERE the gate');
P.party = []; P.pcZyrex = []; P.bonds = {};
const z = C.createZyrex('celestryx', 60);
z.bond = 50;
const res = C.addZyrexToRoster(z, { bypassBondGate: true });
ok(res.location === 'party', `a fresh Rizer's ritual Celestryx lands in the ${res.location}`);
ok(P.party.length === 1 && P.party[0].speciesId === 'celestryx',
   'player.party holds it — which is the array the FACTION tab renders');
ok(P.pcZyrex.length === 0, 'and nothing went to PC storage');

console.log('\n3 · ★★ 50% BONDED\n');
console.log('     z.bond was UNDEFINED. createZyrex has never set it, so every');
console.log('     Zyrex reads 0/100 in the FACTION panel via `z.bond || 0`.\n');
const fresh = C.createZyrex('celestryx', 60);
ok(fresh.bond === undefined, `createZyrex still leaves bond ${fresh.bond} — unchanged, this is a wider gap`);
ok(/z\.bond = 50;/.test(noC), 'the ritual sets bond to 50 explicitly');
ok(P.party[0].bond === 50, `the granted Celestryx reads ${P.party[0].bond}/100 bond`);
console.log('     Set at the ritual rather than in createZyrex on purpose: you');
console.log('     did not catch this creature, you called it and it came. A');
console.log('     wild capture starting half-bonded would be a different, much');
console.log('     larger balance decision.\n');

console.log('4 · ★★ A FULL FACTION STILL DIVERTS, AND SAYS SO\n');
P.party = []; P.pcZyrex = [];
for (let i = 0; i < C.PARTY_MAX; i++) P.party.push(C.createZyrex('otterlin', 5));
const z2 = C.createZyrex('celestryx', 60); z2.bond = 50;
const res2 = C.addZyrexToRoster(z2, { bypassBondGate: true });
ok(res2.location === 'pc', `with ${C.PARTY_MAX} in the faction it goes to the ${res2.location} — a real limit, not a silent one`);
ok(/faction FULL, sent to the PC/.test(raw), 'and the toast says exactly that');
ok(/Your faction is full — Celestryx is waiting at the Nebuladock/.test(raw),
   'as does the dialogue');
ok(!/★ Celestryx has joined your party\.'/.test(raw),
   'the old unconditional "joined your party" line is gone');
ok(/const landed = res && res\.location === 'party'/.test(noC),
   'both messages branch on where it ACTUALLY landed');

console.log('\n5 · ★ THE GATE STILL GUARDS EVERYTHING ELSE\n');
P.party = []; P.pcZyrex = []; P.bonds = {};
const wild = C.createZyrex('celestryx', 60);
const res3 = C.addZyrexToRoster(wild);          // no bypass
ok(res3.location === 'pc' && res3.reason === 'bondLow',
   'a NON-ritual T6 still hits the bond gate — the bypass is opt-in, not a hole');
const bypassSites = (noC.match(/bypassBondGate: true/g) || []).length;
ok(bypassSites === 1, `and exactly ${bypassSites} caller uses it`);

console.log(f ? `\n❌ ${f} failure(s)` : '\n✅ ALL CHECKS PASS');
process.exit(0);
