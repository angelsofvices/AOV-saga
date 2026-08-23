// v0.95.665 · verify the desk group, the purchased-home layout, and the
// rewritten house-purchase blocking rules.
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
global.localStorage = { getItem:()=>null, setItem:noop, removeItem:noop };
global.Audio = function(){ return { play:()=>Promise.resolve(), pause:noop, addEventListener:noop, cloneNode(){return this} }; };
global.Image = function(){ return { addEventListener:noop, complete:false, naturalWidth:0, src:'' }; };
global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = noop;
global.matchMedia = () => ({ matches:false, addEventListener:noop, addListener:noop });
global.navigator = { userAgent:'node', getGamepads:()=>[], maxTouchPoints:0 };
global.performance = { now: () => Date.now() };
global.getComputedStyle = () => ({ getPropertyValue: () => '' });

try {
  new Function(src + ';globalThis.__C={player,game,NPCS,RIZER_ROOM_ITEMS,ROOM_ITEM_GROUPS,' +
    'PURCHASED_HOME_LAYOUT,roomItemGroupOf,applyHomeLayout,storeHomeLayout,isRizerRoomScene,' +
    'homeOwnedByNpc,isPurchasableHomeId,_npcIsResident,makeMalezorHomeInterior,' +
    'MALEZOR_HOME_INTERIORS,roomItemAtTile,startRoomEdit,moveRoomEdit,finishRoomEdit,' +
    'roomItemCanOccupy,interiorConfig,getEdit:()=>_roomEdit};')();
} catch (e) { console.log('❌ BOOT FAILED:', e.message); process.exit(1); }
const C = globalThis.__C;
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) fails++; };
const P = C.player, IT = C.RIZER_ROOM_ITEMS;
let n0=0; while (pending.length && n0++<30){ const q=pending.splice(0); q.forEach(t=>{try{t.f();}catch(_){}}); }

// make a purchased home scene exist
const BOUGHT = 'interior_rizer_room_redroof_3';
const cfg = C.makeMalezorHomeInterior(BOUGHT); cfg.rizerRoom = true;

console.log('\n1 · ★ DESK + PHONE + CHAIR ARE ONE PIECE\n');
const grp = C.roomItemGroupOf('pc');
console.log(`     group: ${grp.join(' + ')}`);
ok(grp.includes('pc') && grp.includes('chair'), 'desk and chair are grouped');
ok(grp.includes('zphone'), 'the ZyPhone on the desk comes along too');
ok(C.roomItemGroupOf('chair').join() === grp.join(), 'grabbing the CHAIR selects the same group');
ok(C.roomItemGroupOf('bed').join() === 'bed', 'ungrouped furniture still moves alone');

console.log('\n2 · ★ PURCHASED HOMES SEAT THE DESK AT (3,3)\n');
P.homeLayouts = {};
C.game.scene = BOUGHT;
C.applyHomeLayout(BOUGHT);
console.log(`     pc (${IT.pc.x},${IT.pc.y})  ·  zphone (${IT.zphone.x},${IT.zphone.y})  ·  chair (${IT.chair.x},${IT.chair.y})`);
// ★ v0.95.764 moved the desk one tile EAST. At x=2 its five-tile base row hit
// the west wall and sealed five floor tiles into a pocket, and left the ZyPhone
// with one approach. Read the layout rather than a literal.
ok(IT.pc.x === 3 && IT.pc.y === 3, `desk sits at (${IT.pc.x},${IT.pc.y})`);
ok(IT.chair.x === 3 && IT.chair.y === 4, 'chair tucked directly below it');
ok(IT.zphone.x === 2 && IT.zphone.y === 3, 'phone on the desk edge');
ok(IT.bed.x === IT.bed.homeX && IT.bed.y === IT.bed.homeY, 'everything else keeps its stock spot');

console.log('\n3 · ★ THE MAT NO LONGER TOUCHES THE CHAIR WHEELS\n');
const rug = cfg.rug;
const rugTiles = [];
for (let i = 0; i < rug.w; i++) rugTiles.push(`${rug.x + i},${rug.y}`);
console.log(`     doormat covers ${rugTiles.join(' ')}`);
const deskTiles = [];
for (const id of grp){
  const it = IT[id];
  it.footprint.forEach(([dx, dy]) => deskTiles.push(`${it.x + dx},${it.y + dy}`));
}
console.log(`     desk unit covers ${[...new Set(deskTiles)].sort().join(' ')}`);
const clash = deskTiles.filter(t => rugTiles.includes(t));
ok(clash.length === 0, `zero overlap between the mat and the desk unit${clash.length ? ' — ' + clash.join(' ') : ''}`);
// and prove the OLD centre-front position DID overlap
const oldChair = `7,8`, oldPc = ['6,7','7,7','8,7','9,7','7,6'];
console.log(`     (stock layout put the chair at ${oldChair} and the desk across ${oldPc.join(' ')})`);

console.log('\n4 · THE ORIGINAL RIZER ROOM IS UNCHANGED\n');
C.game.scene = 'interior_home_2f';
P.chairX = 7; P.chairY = 8;
C.applyHomeLayout('interior_home_2f');
ok(IT.pc.x === 7 && IT.pc.y === 7, `stock desk still at (${IT.pc.x},${IT.pc.y})`);
ok(IT.chair.x === 7 && IT.chair.y === 8, 'stock chair unmoved');

console.log('\n5 · MOVING THE GROUP MOVES ALL THREE\n');
C.game.scene = BOUGHT; P.homeLayouts = {}; C.applyHomeLayout(BOUGHT);
P.ridingChair = false; P.items = {};
// ★ v0.95.764 moved the desk group one tile east, so the chair is at (3,4) and
// the tile to stand on is (3,5). At (2,5) the player faces empty floor and
// startRoomEdit correctly refuses — a stale coordinate, not a broken guard.
P.x = 3; P.y = 5; P.dir = 'up';            // stand below the chair, facing it
const started = C.startRoomEdit();
ok(started === true, 'edit starts in a PURCHASED home (was locked to the 2F only)');
const e = C.getEdit();
ok(e && e.ids && e.ids.length === 3, `the whole group is grabbed (${e && e.ids && e.ids.join('+')})`);
const b4 = grp.map(id => `${IT[id].x},${IT[id].y}`);
const moved = C.moveRoomEdit(1, 0, 'right');
const af = grp.map(id => `${IT[id].x},${IT[id].y}`);
ok(moved === true, 'the group moved one tile right');
ok(grp.every((id, i) => {
  const [bx, by] = b4[i].split(',').map(Number);
  const [ax, ay] = af[i].split(',').map(Number);
  return ax === bx + 1 && ay === by;
}), 'all three shifted together, none left behind');
C.finishRoomEdit(false);
ok(!C.getEdit(), 'edit committed');
ok(P.homeLayouts[BOUGHT] && P.homeLayouts[BOUGHT].pc.x === 4, 'the new arrangement is saved to THIS home');   // ★ default 3 + one right

console.log('\n6 · EACH HOME REMEMBERS ITS OWN ARRANGEMENT\n');
const OTHER = 'interior_rizer_room_zarvane_home_1';
const c2 = C.makeMalezorHomeInterior(OTHER); c2.rizerRoom = true;
C.game.scene = OTHER; C.applyHomeLayout(OTHER);
ok(IT.pc.x === 3 && IT.pc.y === 3, 'a different purchased home opens at the (3,3) default');
C.game.scene = BOUGHT; C.applyHomeLayout(BOUGHT);
ok(IT.pc.x === 4, 'returning to the first home restores ITS moved desk');

console.log('\n7 · ★ WANDERERS NO LONGER BLOCK A PURCHASE\n');
// Put an enemy, a wild Zyrex and a summon right on the doorstep.
const DOOR = { x: 200, y: 200 };
const intruders = [
  { id:'mori_test',   name:'Mori',    scene:'overworld', isEnemy:true,  mode:'wander', wanderRadius:3, tileX:DOOR.x, tileY:DOOR.y+1, homeX:DOOR.x, homeY:DOOR.y+1 },
  // Was Omniris.  v0.95.681 made him Humanoid-primary, which took him out of
  // SPECIES and therefore out of isZyrexNpc() — so this row stopped being a
  // wild-Zyrex case and started being an ally case that legitimately blocks.
  // Voltigrax is an actual roster Zyrex and restores what the row meant.
  { id:'voltigrax',   name:'Voltigrax', scene:'overworld', mode:'stationary', tileX:DOOR.x, tileY:DOOR.y+1, homeX:DOOR.x, homeY:DOOR.y+1 },
  { id:'_summon_x',   name:'Elzebub', scene:'overworld', _summoned:true, tileX:DOOR.x, tileY:DOOR.y+1, homeX:DOOR.x, homeY:DOOR.y+1 },
  { id:'mom',         name:'Mom',     scene:'overworld', _phoneSpawned:true, mode:'stationary', tileX:DOOR.x, tileY:DOOR.y+1, homeX:DOOR.x, homeY:DOOR.y+1 },
  { id:'tower_g',     name:'Mori',    scene:'overworld', _towerGuardOf:'malezor', mode:'wander', tileX:DOOR.x, tileY:DOOR.y+1, homeX:DOOR.x, homeY:DOOR.y+1 },
];
for (const nn of intruders){
  C.NPCS.push(nn);
  const owner = C.homeOwnedByNpc(DOOR.x, DOOR.y);
  ok(owner === null, `${String(nn.name).padEnd(8)} (${nn.isEnemy?'enemy':nn._summoned?'summon':nn._phoneSpawned?'phone-spawn':nn._towerGuardOf?'tower guard':'wild Zyrex'}) on the doorstep does NOT block`);
  C.NPCS.pop();
}

console.log('\n8 · ★ A QUEST NPC WHO LIVES THERE STILL DOES\n');
const resident = { id:'villager_a', name:'Orren', scene:'overworld', mode:'stationary',
  tileX:DOOR.x, tileY:DOOR.y+1, homeX:DOOR.x, homeY:DOOR.y+1 };
C.NPCS.push(resident);
const owner = C.homeOwnedByNpc(DOOR.x, DOOR.y);
ok(owner && owner.id === 'villager_a', 'an idle named NPC at the door owns the house');
console.log('     ...and ownership uses their AUTHORED home tile, not where they stand now:');
resident.tileX = DOOR.x + 9; resident.tileY = DOOR.y + 9;      // walked off
ok(C.homeOwnedByNpc(DOOR.x, DOOR.y) !== null, 'still owned after they step away — no flicker');
resident.homeX = DOOR.x + 40;                                   // genuinely lives elsewhere
ok(C.homeOwnedByNpc(DOOR.x, DOOR.y) === null, 'a resident of a DIFFERENT house does not block this one');
C.NPCS.pop();

console.log('\n9 · ★ STORES / QUEST BUILDINGS / LANDMARKS ARE NEVER FOR SALE\n');
const never = ['malezor_gear_shop','malezor_potion_shop','beastwardens_hall','rizer_academy',
  'malezor_hospital','research_lab','seer_hq','korathen_radio_tower','zarvane_oasis',
  'zarvane_astralite_refinery','club_50','broadcast_tower','training_farm'];
for (const id of never) ok(C.isPurchasableHomeId(id) === false, `${id.padEnd(28)} not purchasable`);
const homes = ['redroof_3','zarvane_home_1','andrannor_home_cottage','andrannor_home_balcony','villager_house_2'];
for (const id of homes) ok(C.isPurchasableHomeId(id) === true, `${id.padEnd(28)} IS purchasable`);

console.log('\n10 · NO PLAYER-COORDINATE DEPENDENCE\n');
ok(!/homeOwnedByNpc[\s\S]{0,600}?player\.(x|y)\b/.test(src),
   'homeOwnedByNpc never reads player.x / player.y');
ok(/const hx = \(n\.homeX != null\) \? n\.homeX : n\.tileX;/.test(src),
   'it reads the authored home tile, not the live one');

console.log(fails ? `\n❌ ${fails} failure(s)` : '\n✅ ALL CHECKS PASS');
process.exit(0);
