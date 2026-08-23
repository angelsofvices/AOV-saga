// v0.95.664 · verify Zyrex levels / XP / stats survive a save -> load round trip.
const fs = require('fs');
const src = fs.readFileSync('/tmp/all.js', 'utf8');
const noop = () => {};
const pending = [];
global.setInterval = () => 0;
global.setTimeout = (f, ms) => { pending.push({ f, ms: ms || 0 }); return pending.length; };
global.clearInterval = noop; global.clearTimeout = noop;
const CTX = new Proxy({}, { get: () => () => ({ addColorStop: noop, width: 0, height: 0, data: [] }) });
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
let STORE = {};
global.localStorage = { getItem:k=>STORE[k]??null, setItem:(k,v)=>{STORE[k]=String(v)}, removeItem:k=>{delete STORE[k]} };
global.Audio = function(){ return { play:()=>Promise.resolve(), pause:noop, addEventListener:noop, cloneNode(){return this} }; };
global.Image = function(){ return { addEventListener:noop, complete:false, naturalWidth:0, src:'' }; };
global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = noop;
global.matchMedia = () => ({ matches:false, addEventListener:noop, addListener:noop });
global.navigator = { userAgent:'node', getGamepads:()=>[], maxTouchPoints:0 };
global.performance = { now: () => Date.now() };
global.getComputedStyle = () => ({ getPropertyValue: () => '' });

try {
  new Function(src + ';globalThis.__C={player,game,saveGame,loadGame,createZyrex,SPECIES,' +
    'migrateSavedZyrex,applyLevelStats,grantZyrexXp,xpToNextLevel,TRANSIENT_PLAYER_KEYS,' +
    'refreshZyrexMoves,addZyrexToRoster};')();
} catch (e) { console.log('❌ BOOT FAILED:', e.message); process.exit(1); }
const C = globalThis.__C;
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) fails++; };
const P = C.player;
const flushT = () => { let n=0; while (pending.length && n++ < 30){ const q = pending.splice(0); q.forEach(t=>{try{t.f();}catch(_){}}); } };
flushT();
const snap = (z) => z ? { id:z.speciesId, lv:z.level, xp:z.xp, hp:z.hp, maxHp:z.maxHp,
  atk:z.atk, def:z.def, spd:z.spd, satk:z.satk, sdef:z.sdef, tier:z.tier,
  moves:(z.moves||[]).map(m=>m&&(m.name||m)).join('|') } : null;

console.log('\n1 · ROUND TRIP · a party at mixed levels\n');
C.game.scene = 'overworld';
P.rxpUnlocked = true;
const built = [
  C.createZyrex('elzebub', 1),
  C.createZyrex('volcanut', 17),
  C.createZyrex('aurarat', 42),
  C.createZyrex('gravvik', 78),
  C.createZyrex('anciuxor', 100),
];
built.forEach((z, i) => { if (z) z.xp = i * 37; });          // partial progress too
P.party = built.filter(Boolean).slice(0, 3);
P.pcZyrex = built.filter(Boolean).slice(3);
const before = [...P.party, ...P.pcZyrex].map(snap);
console.log('     saved:  ' + before.map(b => `${b.id} Lv${b.lv}`).join(' · '));
STORE = {}; C.saveGame();
P.party = []; P.pcZyrex = [];                                 // wipe live state
const okLoad = C.loadGame(); flushT();
ok(okLoad === true, 'loadGame() succeeded');
const after = [...(P.party||[]), ...(P.pcZyrex||[])].map(snap);
console.log('     loaded: ' + after.map(b => `${b.id} Lv${b.lv}`).join(' · '));
ok(after.length === before.length, `${after.length}/${before.length} Zyrex came back`);
let lvlLoss = [];
for (let i = 0; i < before.length; i++){
  const a = before[i], b = after[i];
  if (!b){ lvlLoss.push(`${a.id} MISSING`); continue; }
  if (a.id !== b.id) lvlLoss.push(`slot ${i}: ${a.id} -> ${b.id}`);
  else if (a.lv !== b.lv) lvlLoss.push(`${a.id} Lv${a.lv} -> Lv${b.lv}`);
}
ok(lvlLoss.length === 0, `★ every LEVEL survived${lvlLoss.length ? ' — ' + lvlLoss.join(' · ') : ''}`);
const xpLoss = before.map((a,i) => after[i] && a.xp !== after[i].xp ? `${a.id} xp ${a.xp}->${after[i].xp}` : null).filter(Boolean);
ok(xpLoss.length === 0, `★ partial XP toward the next level survived${xpLoss.length ? ' — ' + xpLoss.join(' · ') : ''}`);

console.log('\n2 · STATS MATCH THE LEVEL AFTER LOAD\n');
const statLoss = [];
for (let i = 0; i < before.length; i++){
  const a = before[i], b = after[i];
  if (!b) continue;
  for (const k of ['maxHp','atk','def','spd','satk','sdef','tier']){
    if (a[k] !== b[k]) statLoss.push(`${a.id}.${k} ${a[k]}->${b[k]}`);
  }
}
ok(statLoss.length === 0, `stats re-derive identically${statLoss.length ? ' — ' + statLoss.slice(0,6).join(' · ') : ''}`);
const hpLoss = before.map((a,i) => after[i] && a.hp !== after[i].hp ? `${a.id} hp ${a.hp}->${after[i].hp}` : null).filter(Boolean);
ok(hpLoss.length === 0, `current HP preserved${hpLoss.length ? ' — ' + hpLoss.join(' · ') : ''}`);
const mvLoss = before.map((a,i) => after[i] && a.moves !== after[i].moves ? `${a.id}: ${a.moves} -> ${after[i].moves}` : null).filter(Boolean);
ok(mvLoss.length === 0, `movesets preserved${mvLoss.length ? ' — ' + mvLoss.slice(0,3).join(' · ') : ''}`);

console.log('\n3 · A WOUNDED ZYREX STAYS WOUNDED\n');
const hurt = C.createZyrex('volcanut', 30);
hurt.hp = Math.floor(hurt.maxHp * 0.4);
P.party = [hurt]; P.pcZyrex = [];
const hurtBefore = { lv: hurt.level, hp: hurt.hp, max: hurt.maxHp };
STORE = {}; C.saveGame(); P.party = []; C.loadGame(); flushT();
const back = P.party[0];
ok(back && back.level === hurtBefore.lv, `level held at ${hurtBefore.lv}`);
ok(back && back.hp === hurtBefore.hp, `HP held at ${hurtBefore.hp}/${hurtBefore.max}`);
ok(back && back.hp < back.maxHp, 'still wounded — load did not silently full-heal it');

console.log('\n4 · LEVELS EARNED THIS SESSION PERSIST\n');
const grower = C.createZyrex('aurarat', 5);
P.party = [grower]; P.pcZyrex = [];
for (let i = 0; i < 12; i++) C.grantZyrexXp(grower, C.xpToNextLevel(grower.level));
const grown = { id: grower.speciesId, lv: grower.level };
console.log(`     levelled Lv5 -> Lv${grown.lv}${grown.id !== 'aurarat' ? ` and evolved into ${grown.id}` : ''}`);
ok(grown.lv > 5, 'it actually levelled');
STORE = {}; C.saveGame(); P.party = []; C.loadGame(); flushT();
ok(P.party[0] && P.party[0].level === grown.lv, `the earned level ${grown.lv} survived the save`);
ok(P.party[0] && P.party[0].speciesId === grown.id, 'and its evolved form survived too');

console.log('\n5 · MIGRATION DOES NOT TOUCH LEVELS\n');
// migrateSavedZyrex re-syncs to current canon on every load; make sure that
// re-sync only rewrites tier/type/stats, never the level the player earned.
const pre = [C.createZyrex('gravvik', 63), C.createZyrex('elzebub', 9)];
P.party = pre; P.pcZyrex = [];
const preLv = pre.map(z => z.level);
C.migrateSavedZyrex();
ok(P.party.map(z => z.level).join() === preLv.join(),
   `levels unchanged by migration (${preLv.join(', ')})`);
ok(P.party.length === pre.length, 'nobody evicted');

console.log('\n6 · THE SNAPSHOT ACTUALLY CARRIES THEM\n');
P.party = [C.createZyrex('elzebub', 55)]; P.pcZyrex = [C.createZyrex('volcanut', 23)];
STORE = {}; C.saveGame();
const raw = JSON.parse(STORE[Object.keys(STORE).find(k => { try { return !!JSON.parse(STORE[k]).player; } catch(_){ return false; } })]);
ok(Array.isArray(raw.player.party) && raw.player.party.length === 1, 'party is in the save snapshot');
ok(Array.isArray(raw.player.pcZyrex) && raw.player.pcZyrex.length === 1, 'pcZyrex is in the save snapshot');
ok(raw.player.party[0].level === 55, `and the level is written verbatim (${raw.player.party[0].level})`);
ok(raw.player.pcZyrex[0].level === 23, `PC box too (${raw.player.pcZyrex[0].level})`);
ok(!C.TRANSIENT_PLAYER_KEYS.has('party') && !C.TRANSIENT_PLAYER_KEYS.has('pcZyrex'),
   'neither list is on the transient deny-list');

console.log('\n7 · SURVIVES REPEATED SAVE/LOAD CYCLES\n');
P.party = [C.createZyrex('aurarat', 31)]; P.pcZyrex = [];
const startLv = P.party[0].level, startXp = P.party[0].xp;
for (let i = 0; i < 6; i++){ C.saveGame(); C.loadGame(); flushT(); }
ok(P.party[0] && P.party[0].level === startLv, `Lv${startLv} stable across 6 cycles (now Lv${P.party[0] && P.party[0].level})`);
ok(P.party[0] && P.party[0].xp === startXp, 'XP does not drift either');

console.log(fails ? `\n❌ ${fails} failure(s)` : '\n✅ ALL CHECKS PASS');
process.exit(0);
