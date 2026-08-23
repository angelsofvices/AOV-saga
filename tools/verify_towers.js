// v0.95.650 · verify the full 10-district Scrapjaw tower loop.
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
  new Function(src + ';globalThis.__C={TOWER_NETWORK,TOWER_BY_DIST,TOWER_ORDER,TOWER_TOTAL,' +
    'TOWER_COMPANION_GATE,WORLD_PROPS,NPCS,player,game,towerRestored,towersRestoredCount,' +
    'heldTowerBatteries,towerSquadCleared,buildTowerGuardPacks,recordTowerGuardKill,' +
    'syncTowerNetworkFromSave,findNpcById,toggleContactCall,drawProp,saveGame,loadGame,' +
    'worldDistrictAt,recordMoriKill};')();
} catch (e) { console.log('❌ eval', e.message.split('\n')[0]); process.exit(1); }
const C = globalThis.__C;
const flush = () => { const q = pending.splice(0); q.sort((a,b)=>a.ms-b.ms); q.forEach(t => { try { t.f(); } catch(_){} }); };
flush();   // run the deferred guard build
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) fails++; };

console.log('\n1 · TABLE · one source of truth for all 10 districts\n');
ok(C.TOWER_NETWORK.length === 10, `${C.TOWER_NETWORK.length} districts in TOWER_NETWORK`);
ok(C.TOWER_COMPANION_GATE === 6, 'companion gate at 6/10 per canon');
const towers = C.WORLD_PROPS.filter(p => p.id && /_radio_tower$/.test(p.id));
const chests = C.WORLD_PROPS.filter(p => p._towerBatteryDist);
ok(towers.length === 10, `${towers.length} tower props in the world`);
ok(chests.length === 9,  `${chests.length} silver battery chests (Malezor uses its scrap chest)`);
let placed = true;
for (const T of C.TOWER_NETWORK){
  if (T.dist === 'malezor') continue;
  const ch = chests.find(c => c._towerBatteryDist === T.dist);
  const tw = towers.find(t => t._towerDistrict === T.dist);
  if (!ch || !tw) { placed = false; continue; }
  if (C.worldDistrictAt(ch.tileX, ch.tileY) !== T.dist) { placed = false; console.log(`      ! ${T.dist} chest sits in ${C.worldDistrictAt(ch.tileX,ch.tileY)}`); }
}
ok(placed, 'every tower + chest actually sits inside its own district');

console.log('\n2 · GUARD PACKS · 6 Mori + 1 band-scaled boss per tower\n');
console.log('     district     boss                    bossLv  guards');
for (const T of C.TOWER_NETWORK){
  if (T.dist === 'malezor') continue;
  const g = C.NPCS.filter(n => n._towerGuardOf === T.dist);
  const b = C.NPCS.find(n => n._towerBossOf === T.dist);
  console.log(`     ${T.label.padEnd(12)} ${(b ? b.name : '—').padEnd(22)} ${String(T.bossLv).padStart(5)}  ${g.length}`);
  if (g.length !== 7 || !b) fails++;
}
ok(C.NPCS.filter(n => n._towerGuardOf).length === 63, '63 guards deployed (9 x [6 Mori + 1 boss])');
ok(!C.NPCS.some(n => n._towerGuardOf && n._extraSpawn), 'no guard is tagged _extraSpawn (Horde toggle would delete them)');
const lvls = C.TOWER_NETWORK.filter(t=>t.dist!=='malezor').map(t=>t.bossLv);
ok(lvls.every((v,i)=> i===0 || v>lvls[i-1]), 'boss levels ascend across the district band ladder');

console.log('\n3 · ★ THE CORE FIX · a battery restores the district it CAME FROM\n');
C.player.scrapjawTowersRestored = {}; C.player.towerBatteries = {}; C.player.items = {};
C.player.radioTowerFixed = false; C.player.bonds = {}; C.player.rizerLvl = 20; C.player.rizerXP = 0;
const korathenChest = chests.find(c => c._towerBatteryDist === 'korathen');
korathenChest.onInteract();
ok(C.player.towerBatteries.korathen === true, 'looting the Korathen chest yields a KORATHEN-tagged battery');
ok(C.heldTowerBatteries().join() === 'korathen', 'heldTowerBatteries() reports korathen only');
const scrapjaw = C.NPCS.find(n => n.id === 'scrapjaw');
C.player.scrapjawMet = true; C.player.towerQuestStarted = true;
scrapjaw.onInteract(scrapjaw);
ok(C.towerRestored('korathen') === true, 'KORATHEN signal restored');
ok(C.towerRestored('zarvane') === false, 'ZARVANE untouched — the old code would have lit this one instead');
ok(!C.player.towerBatteries.korathen, 'battery consumed');

console.log('\n4 · SIGNAL GATE · calls work only in restored districts\n');
const kT = C.TOWER_BY_DIST.korathen, zT = C.TOWER_BY_DIST.zarvane;
// Observe the EFFECT, not the toast: the in-scope showToast can't be stubbed
// from out here, but a refused call never spawns the contact.
C.player.phoneBattery = true;
const mom = C.findNpcById('mom');
mom._phoneSpawned = false;
// v0.95.688 put a BOND gate in front of the signal gate: a contact must be at
// 100% before they'll take your call at all.  This suite is about the SIGNAL
// gate, so bond has to be satisfied first or every case below refuses for the
// wrong reason — which is exactly how this test failed when the gate landed.
C.player.bonds = C.player.bonds || {};
C.player.bonds.mom = 100;
ok(C.contactCallBondOk('mom'), 'precondition · Mom is at full bond, so bond is not what is under test here');
C.player.x = zT.tower[0]; C.player.y = zT.tower[1];
C.toggleContactCall('mom', 'Mom');
ok(mom._phoneSpawned !== true, 'call in un-restored Zarvane is REFUSED (no spawn)');
C.player.x = kT.tower[0]; C.player.y = kT.tower[1];
C.toggleContactCall('mom', 'Mom');
ok(mom._phoneSpawned === true, 'call in restored Korathen goes through (Mom spawns)');
mom._phoneSpawned = false;

console.log('\n5 · SPRITE SWAP · all 10 towers, not just Malezor\n');
const kTower = towers.find(t => t._towerDistrict === 'korathen');
const zTower = towers.find(t => t._towerDistrict === 'zarvane');
global.ctx = CTX; global._cam = { x:0, y:0 }; global.TILE = 48;
try { C.drawProp(kTower); C.drawProp(zTower); } catch(_){}
ok(kTower.img === kTower._towerFixedImg,  'restored Korathen tower paints the FIXED sprite');
ok(zTower.img === zTower._towerBrokenImg, 'dark Zarvane tower still paints BROKEN');

console.log('\n6 · PERSISTENCE · no infinite batteries across a reload\n');
ok(C.player.towerChestsLooted.korathen === true, 'chest loot recorded on the player (goes into the save)');
korathenChest.opened = false; korathenChest.looted = false;   // simulate a fresh page load
C.syncTowerNetworkFromSave();
ok(korathenChest.opened === true && korathenChest.looted === true, 'syncTowerNetworkFromSave re-closes the loop');
const before = C.player.items.tower_battery || 0;
korathenChest.onInteract();
ok((C.player.items.tower_battery || 0) === before, 're-interacting yields NO second battery');
C.saveGame();
const saveKey = Object.keys(STORE).find(k => { try { return !!JSON.parse(STORE[k]).player; } catch(_){ return false; } });
const snap = JSON.parse(STORE[saveKey]);
for (const k of ['towerBatteries','towerChestsLooted','scrapjawTowersRestored']){
  ok(snap.player[k] !== undefined, `${k} is in the save snapshot`);
}

console.log('\n7 · BONUS CLEAR TRACK · mirrors Malezor\'s optional plaza wipe\n');
C.player.towerSquadKills = {}; C.player.towerBossKills = {};
const vGuards = C.NPCS.filter(n => n._towerGuardOf === 'veridan' && !n._towerBossOf);
ok(C.towerSquadCleared('veridan') === false, 'veridan starts uncleared');
vGuards.forEach(n => C.recordTowerGuardKill(n));
ok(C.towerSquadCleared('veridan') === false, '6 Mori alone is not a clear — boss still up');
C.recordTowerGuardKill(C.NPCS.find(n => n._towerBossOf === 'veridan'));
ok(C.towerSquadCleared('veridan') === true, '6 Mori + boss = plaza CLEAR');
const vChest = chests.find(c => c._towerBatteryDist === 'veridan');
ok(vChest.opened === false, 'chest was openable the whole time — anti-softlock, same as Malezor');

console.log('\n8 · COMPANION GATE at 6/10 · and full signal at 10/10\n');
C.player.scrapjawCompanion = false;
C.player.scrapjawTowersRestored = { korathen:true };
C.player.towerBatteries = {};
['zarvane','andrannor','veridan','netharion'].forEach(d => { C.player.towerBatteries[d] = true; });
C.player.items.tower_battery = 4;
scrapjaw.onInteract(scrapjaw);
ok(C.towersRestoredCount() === 5, `5/10 restored — still below the gate`);
ok(!C.player.scrapjawCompanion, 'Scrapjaw has NOT joined at 5/10');
C.player.towerBatteries = { vorashil:true }; C.player.items.tower_battery = 1;
scrapjaw.onInteract(scrapjaw);
ok(C.towersRestoredCount() === 6 && C.player.scrapjawCompanion === true, '6/10 → COMPANION UNLOCKED');
C.player.towerBatteries = {};
['xilnar','baelgor','thardin'].forEach(d => { C.player.towerBatteries[d] = true; });
C.player.radioTowerFixed = true;   // Malezor via its own scrap-metal quest
C.player.items.tower_battery = 3;
scrapjaw.onInteract(scrapjaw);
ok(C.towersRestoredCount() === 10, `10/10 · full Zyraxis grid live`);
ok(C.player.scrapjawFullSignal === true, 'full-signal finale flag set');

console.log(fails ? `\n❌ ${fails} failure(s)` : '\n✅ ALL CHECKS PASS');
process.exit(0);
