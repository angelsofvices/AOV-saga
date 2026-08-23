// v0.95.649 · verify Rizer kill XP · floor lift + every kill path credited.
const fs = require('fs');
const src = fs.readFileSync('/tmp/all.js', 'utf8');
const noop = () => {};
global.setInterval = () => 0;
const pending = [];
global.setTimeout = (f, ms) => { pending.push({ f, ms: ms || 0 }); return pending.length; };
global.clearInterval = noop; global.clearTimeout = noop;
const CTX = new Proxy({}, { get: () => () => ({ addColorStop: noop, width: 0, height: 0, data: [] }) });
const el = () => ({ style:{}, dataset:{}, classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},
  width:960, height:540, value:'', textContent:'', innerHTML:'', children:[], childNodes:[],
  getContext:()=>CTX, appendChild:noop, removeChild:noop, addEventListener:noop, removeEventListener:noop,
  setAttribute:noop, getAttribute:()=>null, focus:noop, remove:noop,
  querySelector:()=>el(), querySelectorAll:()=>[], getBoundingClientRect:()=>({left:0,top:0,width:960,height:540}) });
global.addEventListener = noop; global.removeEventListener = noop;
global.document = { getElementById:()=>el(), querySelector:()=>el(), querySelectorAll:()=>[],
  createElement:()=>el(), addEventListener:noop, body:el(), documentElement:el(), head:el(),
  hidden:false, visibilityState:'visible' };
global.window = global; global.localStorage = { getItem:()=>null, setItem:noop, removeItem:noop };
global.Audio = function(){ return { play:()=>Promise.resolve(), pause:noop, addEventListener:noop, cloneNode(){return this} }; };
global.Image = function(){ return { addEventListener:noop, complete:false, naturalWidth:0, src:'' }; };
global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = noop;
global.matchMedia = () => ({ matches:false, addEventListener:noop, addListener:noop });
global.navigator = { userAgent:'node', getGamepads:()=>[], maxTouchPoints:0 };
global.performance = { now: () => Date.now() };
global.getComputedStyle = () => ({ getPropertyValue: () => '' });

try {
  new Function(src + ';globalThis.__C={NPCS,player,game,WORLD_PROPS,rizerKillXP,creditRizerKill,' +
    'RIZER_KILL_MULT,awardRizerXP,rizerTotalXPFor,rizerXPToNext,detonateBoomChest,cloneMoriBase};')();
} catch (e) { console.log('❌ eval', e.message.split('\n')[0]); process.exit(1); }
const C = globalThis.__C;
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) fails++; };
const flush = () => { const q = pending.splice(0); q.sort((a,b)=>a.ms-b.ms); q.forEach(t => { try { t.f(); } catch(_){} }); };
const OLD = (lv, t) => lv * (t + 4);

console.log('\n1 · FLOOR LIFT · punch-kill RXP, old vs new\n');
console.log('     enemy      old    new    change');
const rows = [[1,1],[5,1],[10,2],[15,2],[25,1],[25,5],[45,3]];
for (const [lv, t] of rows){
  const o = OLD(lv, t), n = C.rizerKillXP({ level: lv, tier: t }, 'punch');
  console.log(`     L${String(lv).padEnd(2)} T${t}     ${String(o).padStart(4)}   ${String(n).padStart(4)}    ${(n/o).toFixed(2)}x`);
}
ok(C.rizerKillXP({level:1,tier:1},'punch') >= 15, 'the L1 T1 trash mob is no longer worth 5 RXP');
ok(C.rizerKillXP({level:1,tier:1},'punch') / OLD(1,1) >= 3, 'trash mob lifted at least 3x');
ok(C.rizerKillXP({level:25,tier:1},'punch') <= OLD(25,1) * 1.1, 'high-level enemies NOT inflated (floor lift, not blanket buff)');
ok(C.rizerKillXP({level:5,tier:2},'punch') > C.rizerKillXP({level:5,tier:1},'punch'), 'tier still multiplies');
ok(C.rizerKillXP({level:9,tier:1},'punch') > C.rizerKillXP({level:5,tier:1},'punch'), 'level still rewards fighting up');

console.log('\n2 · TECHNIQUE LADDER · L5 T1 Mori\n');
const foe = { level: 5, tier: 1 };
const order = ['punch','kick','sword','splash','astralstrike','astralslam','throw','void','astralkick','boom'];
order.forEach(m => console.log(`     ${m.padEnd(13)} x${C.RIZER_KILL_MULT[m].toFixed(2)}  =  ${C.rizerKillXP(foe, m)} RXP`));
let mono = true;
for (let i = 1; i < order.length; i++){
  if (C.RIZER_KILL_MULT[order[i]] < C.RIZER_KILL_MULT[order[i-1]]) mono = false;
}
ok(mono, 'technique multipliers ascend cleanly punch -> boom');
ok(C.RIZER_KILL_MULT.boom > C.RIZER_KILL_MULT.astralkick, 'BOOM chest is the top payout');

console.log('\n3 · EVERY KILL PATH IS CREDITED (these five paid ZERO before)\n');
for (const path of ['boom','splash','throw','astralslam','void']){
  ok(new RegExp(`creditRizerKill\\([^)]*'${path}'`).test(src), `${path} kills now call creditRizerKill`);
}
ok(!/awardRizerXP\(\(\w+\.level \|\| 1\) \* \(\(\w+\.tier \|\| 1\) \+ 4\)\)/.test(src),
   'no surviving copies of the old inline formula');
const n = (src.match(/creditRizerKill\(/g) || []).length;
ok(n >= 12, `${n} creditRizerKill call sites wired`);

console.log('\n4 · DOUBLE-CREDIT GUARD (a boom AOE must not pay twice)\n');
C.player.rizerLvl = 1; C.player.rizerXP = 0; C.player.rizerXPMax = C.rizerXPToNext(1);
const victim = { level: 5, tier: 1, id: 'test_v' };
const first  = C.creditRizerKill(victim, 'boom');
const second = C.creditRizerKill(victim, 'boom');
ok(first > 0 && second === 0, `first credit ${first} RXP, repeat credit ${second}`);
delete victim._rxpCredited;
ok(C.creditRizerKill(victim, 'boom') === first, 'clearing the flag (respawn) makes it payable again');
ok(/delete n\._rxpCredited/.test(src),  'revive paths clear the flag');
ok(/delete clone\._rxpCredited/.test(src), 'horde clones clear the flag (Object.assign copies it)');

console.log('\n5 · MALEZOR PACING · what the district is actually worth\n');
const mal = C.NPCS.filter(x => x.isEnemy && x.tileY < 200);
const sum = (fn) => mal.reduce((a, x) => a + fn(x), 0);
const oldTot = sum(x => OLD(x.level || 1, x.tier || 1));
const newTot = sum(x => C.rizerKillXP(x, 'punch'));
const lvOf = (xp) => Math.floor(Math.sqrt(xp / 100));
console.log(`     ${mal.length} enemies in Malezor`);
console.log(`     punch-clear the district:  ${oldTot} RXP (Lv ${lvOf(oldTot)})  ->  ${newTot} RXP (Lv ${lvOf(newTot)})`);
const l1 = mal.filter(x => (x.level||1) === 1 && (x.tier||1) === 1).length;
console.log(`     of which ${l1} are L1 T1 · they paid ${l1*5} total, now pay ${l1*C.rizerKillXP({level:1,tier:1},'punch')}`);
console.log(`     kills for Rizer Lv 1->2 (300 XP) on the common L1 mob:` +
            ` ${Math.ceil(300/OLD(1,1))} -> ${Math.ceil(300/C.rizerKillXP({level:1,tier:1},'punch'))} punches,` +
            ` ${Math.ceil(300/C.rizerKillXP({level:1,tier:1},'astralkick'))} astralkicks`);
ok(newTot > oldTot, 'district sweep is worth more than before');
ok(newTot < 15000, `district sweep (${newTot}) stays under the ~10k Malezor main-quest line +50% — quests still lead`);
ok(Math.ceil(300 / C.rizerKillXP({level:1,tier:1},'punch')) <= 20, 'Lv 1->2 is under 20 trash kills');

console.log(fails ? `\n❌ ${fails} failure(s)` : '\n✅ ALL CHECKS PASS');
process.exit(0);
