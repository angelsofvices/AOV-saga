// Verify the full 10-district Scrapjaw radio-tower interior loop.
const src = require('./lib/all_src.cjs')();
const noop = () => {};
global.setInterval = () => 0;
const pending = [];
global.setTimeout = (f, ms) => { pending.push({ f, ms: ms || 0 }); return pending.length; };
global.clearInterval = noop; global.clearTimeout = noop;
const CTX = new Proxy({}, { get: () => () => ({ addColorStop: noop, width:0, height:0, data:[] }) });
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
    'TOWER_COMPANION_GATE,TOWER_REMOTE_CHESTS,RADIO_TOWER_INTERIOR_PLAN,RADIO_TOWER_CHEST_TILE,' +
    'RADIO_TOWER_INTERIORS,WORLD_PROPS,NPCS,player,game,towerRestored,towersRestoredCount,' +
    'heldTowerRemotes,heldTowerBatteries,towerSquadCleared,recordTowerGuardKill,' +
    'syncTowerNetworkFromSave,radioTowerSceneId,radioTowerInterior,interiorConfig,' +
    'towerRemoteChestAt,towerRemoteChestHere,towerRemoteChestOpened,tryOpenTowerRemoteChest,' +
    'findNpcById,toggleContactCall,drawProp,saveGame,worldDistrictAt,contactCallBondOk};')();
} catch (e) { console.log('❌ eval', e.stack || e.message); process.exit(1); }
const C = globalThis.__C;
const flush = () => { const q = pending.splice(0); q.sort((a,b)=>a.ms-b.ms); q.forEach(t => { try { t.f(); } catch(_){} }); };
flush();
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) fails++; };
const resetTowerState = () => {
  C.player.scrapjawTowersRestored = {};
  C.player.towerBatteries = {};
  C.player.towerChestsLooted = {};
  C.player.items = {};
  C.player.radioTowerFixed = false;
  C.player.phoneBattery = false;
  C.player.scrapjawCompanion = false;
  C.player.scrapjawFullSignal = false;
  C.player.scrapjawMet = true;
  C.player.towerQuestStarted = true;
  C.player.bonds = {};
  C.player.rizerLvl = 20;
  C.player.rizerXP = 0;
  C.game.scene = 'overworld';
};

console.log('\n1 · NETWORK + EXTERIORS · ten doors, no outdoor objective chests\n');
ok(C.TOWER_NETWORK.length === 10, `${C.TOWER_NETWORK.length} districts in TOWER_NETWORK`);
ok(C.TOWER_COMPANION_GATE === 6, 'companion gate remains 6/10');
const towers = C.WORLD_PROPS.filter(p => p.id && /_radio_tower$/.test(p.id));
ok(towers.length === 10, `${towers.length} exterior radio towers`);
ok(towers.every(p => p._towerDistrict && typeof p.onInteract === 'function'), 'every exterior tower has a district-tagged entrance');
ok(!C.WORLD_PROPS.some(p => p._towerBatteryDist || p.id === 'chest_tower_scrap'), 'old outdoor objective chests removed');
ok(towers.every(p => C.worldDistrictAt(p.tileX,p.tileY) === p._towerDistrict), 'every exterior tower sits in its own district');

console.log('\n2 · INTERIORS · ten 20×20 tower scenes and ten silver chests\n');
ok(C.RADIO_TOWER_INTERIOR_PLAN.length === 20, 'shared tower plan has 20 rows');
ok(C.RADIO_TOWER_INTERIOR_PLAN.every(row => row.length === 20), 'every tower-plan row is 20 tiles wide');
ok(C.TOWER_REMOTE_CHESTS.length === 10, `${C.TOWER_REMOTE_CHESTS.length} district-specific silver chests`);
const sceneIds = new Set();
let interiorsValid = true;
for (const T of C.TOWER_NETWORK){
  const id = C.radioTowerSceneId(T.dist);
  const cfg = C.radioTowerInterior(T.dist);
  const chest = C.TOWER_REMOTE_CHESTS.find(c => c.dist === T.dist);
  sceneIds.add(id);
  if (!cfg || cfg.cols !== 20 || cfg.rows !== 20 || cfg.radioTowerDistrict !== T.dist) interiorsValid = false;
  if (C.interiorConfig(id) !== cfg) interiorsValid = false;
  if (!chest || chest.scene !== id || !C.towerRemoteChestAt(id,chest.tileX,chest.tileY)) interiorsValid = false;
  if (C.RADIO_TOWER_INTERIOR_PLAN[chest.tileY][chest.tileX] === ' ') interiorsValid = false;
  if (cfg.exit.x !== 10 || cfg.exit.y !== 19 || cfg.spawn.x !== 10 || cfg.spawn.y !== 18) interiorsValid = false;
}
ok(sceneIds.size === 10, 'each district receives a distinct interior scene');
ok(interiorsValid, 'all interiors, exits, spawns, and chest tiles are valid');

console.log('\n3 · REMOTE LOOT · the chest records its district and cannot duplicate\n');
resetTowerState();
C.game.scene = C.radioTowerSceneId('korathen');
ok(C.towerRemoteChestHere().dist === 'korathen', 'Korathen scene resolves the Korathen chest');
ok(C.tryOpenTowerRemoteChest() === true, 'silver chest interaction succeeds');
ok(C.player.towerBatteries.korathen === true, 'loot is tagged to Korathen');
ok(C.player.towerChestsLooted.korathen === true, 'opened state is persisted on the player');
ok(C.player.items.tower_battery === 1, 'one Tower Transmission Remote enters inventory');
const before = C.player.items.tower_battery;
C.tryOpenTowerRemoteChest();
ok(C.player.items.tower_battery === before, 'opening the same chest again yields no duplicate remote');
ok(C.heldTowerRemotes().join() === 'korathen' && C.heldTowerBatteries().join() === 'korathen', 'new and legacy held-item helpers agree');

console.log('\n4 · SCRAPJAW DELIVERY · the exact tower is restored\n');
const scrapjaw = C.NPCS.find(n => n.id === 'scrapjaw');
C.game.scene = 'overworld';
scrapjaw.onInteract(scrapjaw);
ok(C.towerRestored('korathen') === true, 'Korathen signal restored');
ok(C.towerRestored('zarvane') === false, 'Zarvane remains dark');
ok(!C.player.towerBatteries.korathen && C.player.items.tower_battery === 0, 'delivered remote is consumed');
ok(C.towerRemoteChestOpened('korathen') === true, 'Korathen chest stays open after delivery');

console.log('\n5 · MALEZOR QUEST · first remote enables calls and legacy saves\n');
resetTowerState();
C.game.scene = C.radioTowerSceneId('malezor');
C.tryOpenTowerRemoteChest();
C.game.scene = 'overworld';
scrapjaw.onInteract(scrapjaw);
ok(C.towerRestored('malezor') === true, 'Malezor tower restored from its interior remote');
ok(C.player.radioTowerFixed === true, 'legacy Malezor quest flag remains compatible');
ok(C.player.phoneBattery === true, 'Scrapjaw awards the Phone Battery');
ok(C.player.scrapjawCompanion === true, 'Malezor repair preserves Scrapjaw companion unlock');

console.log('\n6 · SAVE + RELOAD · opened interiors cannot be farmed\n');
C.saveGame();
const saveKey = Object.keys(STORE).find(k => { try { return !!JSON.parse(STORE[k]).player; } catch(_){ return false; } });
const snap = JSON.parse(STORE[saveKey]);
for (const k of ['towerBatteries','towerChestsLooted','scrapjawTowersRestored']){
  ok(snap.player[k] !== undefined, `${k} is in the save snapshot`);
}
C.syncTowerNetworkFromSave();
ok(C.towerRemoteChestOpened('malezor') === true, 'Malezor silver chest remains open after state sync');

console.log('\n7 · OPTIONAL PLAZA CLEAR · six Mori plus boss\n');
C.player.towerSquadKills = {}; C.player.towerBossKills = {};
const vGuards = C.NPCS.filter(n => n._towerGuardOf === 'veridan' && !n._towerBossOf);
ok(vGuards.length === 6, 'Veridan has six tower Mori');
vGuards.forEach(n => C.recordTowerGuardKill(n));
ok(C.towerSquadCleared('veridan') === false, 'six Mori alone do not complete the bonus');
C.recordTowerGuardKill(C.NPCS.find(n => n._towerBossOf === 'veridan'));
ok(C.towerSquadCleared('veridan') === true, 'six Mori plus boss complete the bonus');

console.log('\n8 · COMPANION + FULL SIGNAL · network progression remains intact\n');
resetTowerState();
C.player.scrapjawTowersRestored = { malezor:true };
C.player.radioTowerFixed = true;
C.player.phoneBattery = true;
C.player.scrapjawCompanion = false;
['zarvane','andrannor','veridan','netharion'].forEach(d => { C.player.towerBatteries[d] = true; });
C.player.items.tower_battery = 4;
scrapjaw.onInteract(scrapjaw);
ok(C.towersRestoredCount() === 5 && !C.player.scrapjawCompanion, '5/10 remains below the companion gate');
C.player.towerBatteries = { vorashil:true }; C.player.items.tower_battery = 1;
scrapjaw.onInteract(scrapjaw);
ok(C.towersRestoredCount() === 6 && C.player.scrapjawCompanion === true, '6/10 unlocks Scrapjaw');
C.player.towerBatteries = {};
['xilnar','baelgor','thardin','korathen'].forEach(d => { C.player.towerBatteries[d] = true; });
C.player.items.tower_battery = 4;
scrapjaw.onInteract(scrapjaw);
ok(C.towersRestoredCount() === 10, '10/10 towers restored');
ok(C.player.scrapjawFullSignal === true, 'full-signal finale flag set');

console.log(fails ? `\n❌ ${fails} failure(s)` : '\n✅ ALL CHECKS PASS');
process.exit(fails ? 1 : 0);
