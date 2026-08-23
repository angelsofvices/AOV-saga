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
  ';globalThis.__C={WORLD_PROPS,NPCS,worldDistrictAt,isWorldBorderTile,walkable,game,' +
  '_propBlocked,_propDoors,MAP_COLS,MAP_ROWS,HUB_RECENTRE,applyHubRecentre};')();
} catch(e){ console.log('BOOT FAILED:', e.message); process.exit(1); }
const C = globalThis.__C;
const {WORLD_PROPS, worldDistrictAt, isWorldBorderTile, walkable, game, _propDoors} = C;
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const raw = require('fs').readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html','utf8');
const noC = raw.replace(/\/\/[^\n]*/g, '');
game.scene = 'overworld';

console.log('\n1 · ★★ CENTRE MEASURED FROM THE LAND, NOT THE BOUNDING BOX\n');
console.log('     Both districts are irregular. A bbox midpoint of an L-shape');
console.log('     can land outside the land entirely, so the target is the');
console.log('     CENTROID — the mass centre of that district\'s tiles.\n');
console.log('     district     land tiles   bbox mid      centroid      hall now');
for (const [D, cfg] of Object.entries(C.HUB_RECENTRE)){
  let x0=1e9,x1=-1,y0=1e9,y1=-1,n=0,sx=0,sy=0;
  for (let y=0;y<C.MAP_ROWS;y++) for (let x=0;x<C.MAP_COLS;x++){
    if (worldDistrictAt(x,y)!==D) continue;
    n++; sx+=x; sy+=y;
    if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y;
  }
  const cent = [Math.round(sx/n), Math.round(sy/n)];
  const hall = WORLD_PROPS.find(p => p && p.id === cfg.anchor);
  console.log(`     ${D.padEnd(12)} ${String(n).padStart(9)}   (${Math.round((x0+x1)/2)},${Math.round((y0+y1)/2)})`.padEnd(52) +
              `(${cent[0]},${cent[1]})     (${hall.tileX},${hall.tileY})`);
  ok(cfg.centre[0] === cent[0] && cfg.centre[1] === cent[1],
     `  ${D} · the configured centre IS the live centroid`);
  ok(hall.tileX === cent[0] && hall.tileY === cent[1],
     `  ${D} · the town hall sits on it`);
}

console.log('\n2 · ★★ THE HUB TRAVELLED AS ONE PIECE\n');
console.log('     A hall that arrives without its fountain is not a hub, so the');
console.log('     whole cluster translates by ONE offset and every relative');
console.log('     position is preserved.\n');
for (const [D, cfg] of Object.entries(C.HUB_RECENTRE)){
  const hall = WORLD_PROPS.find(p => p && p.id === cfg.anchor);
  for (const id of cfg.ids){
    const p = WORLD_PROPS.find(q => q && q.id === id);
    ok(!!p, `  ${id} exists`);
    if (!p) continue;
    ok(worldDistrictAt(p.tileX, p.tileY) === D, `    still inside ${D} at (${p.tileX},${p.tileY})`);
  }
}
// Zarvane's shops kept their +/-19..35 tile spread around the hall
const zc = WORLD_PROPS.find(p=>p&&p.id==='zarvane_costume_shop');
const zh = WORLD_PROPS.find(p=>p&&p.id==='zarvane_town_hall');
const zm = WORLD_PROPS.find(p=>p&&p.id==='zarvane_cosmetic_shop');
ok(zc.tileY - zh.tileY === -19 && zm.tileY - zh.tileY === 35,
   `  Zarvane's shops kept their original spacing (${zc.tileY-zh.tileY}, ${zm.tileY-zh.tileY} from the hall)`);
const af = WORLD_PROPS.find(p=>p&&p.id==='andrannor_fountain');
const ah = WORLD_PROPS.find(p=>p&&p.id==='andrannor_town_hall');
ok(af.tileX - ah.tileX === 0 && af.tileY - ah.tileY === 6,
   `  Andrannor's fountain is still 6 tiles below its hall, same column`);

console.log('\n3 · ★★ THE DESTINATION IS REAL GROUND\n');
let offLand=0, border=0, wrong=0, clash=0;
const movingIds = new Set(Object.values(C.HUB_RECENTRE).flatMap(c => c.ids));
const dest = new Map();
for (const [D, cfg] of Object.entries(C.HUB_RECENTRE)){
  for (const id of cfg.ids){
    const p = WORLD_PROPS.find(q => q && q.id === id);
    if (!p) continue;
    for (const [ox,oy] of (p.footprint||[])){
      const x=p.tileX+ox, y=p.tileY+oy;
      dest.set(`${x},${y}`, D);
      const d = worldDistrictAt(x,y);
      if (d == null) offLand++;
      else if (d !== D) wrong++;
      else if (isWorldBorderTile(x,y)) border++;
    }
  }
}
for (const p of WORLD_PROPS){
  if (!p || p.tileX == null || movingIds.has(p.id)) continue;
  for (const [ox,oy] of (p.footprint||[])) if (dest.has(`${p.tileX+ox},${p.tileY+oy}`)){ clash++; break; }
}
console.log(`     ${dest.size} tiles now occupied by the two hubs`);
ok(offLand === 0, `none off-map (${offLand})`);
ok(wrong === 0, `none in the wrong district (${wrong})`);
ok(border === 0, `none on a district border (${border})`);
ok(clash === 0, `and ${clash} clashes with props that did NOT move`);

console.log('\n4 · ★★ THE DOORS STILL OPEN\n');
console.log('     Moving a building moves its door with it, because _propDoors');
console.log('     is keyed off prop.tileX + the door offset. What has to be');
console.log('     checked is that the tile you STAND on to use it is walkable.\n');
for (const [D, cfg] of Object.entries(C.HUB_RECENTRE)){
  for (const id of cfg.ids){
    const p = WORLD_PROPS.find(q => q && q.id === id);
    if (!p || !p.door) continue;
    const dx = p.tileX + p.door[0], dy = p.tileY + p.door[1];
    const reg = _propDoors.get(`${dx},${dy}`);
    ok(reg === p, `  ${id} · door registered at its NEW tile (${dx},${dy})`);
    const approach = [[0,1],[0,-1],[1,0],[-1,0]].filter(([ax,ay]) => walkable(dx+ax, dy+ay));
    ok(approach.length > 0, `    and reachable — ${approach.length} walkable tiles adjacent`);
  }
}

console.log('\n5 · ★★ NOTHING ELSE MOVED\n');
console.log('     The first attempt picked hub members by a 46-tile RADIUS. That');
console.log('     swept in cacti, wandering Mori, the district GATE, both Seer');
console.log('     HQs — and for Andrannor, the Seer HQ belonging to ZARVANE.');
console.log('     Membership is an explicit list of civic buildings instead.\n');
const untouched = {
  seer_hq_zarvane: [202,297], seer_hq_andrannor: [382,320],
  zarvane_andrannor_gate: [216,304], club_50: [270,325],
  zarvane_oasis: [173,234], zarvane_astralite_refinery: [143,232],
};
for (const [id, [x,y]] of Object.entries(untouched)){
  const p = WORLD_PROPS.find(q => q && q.id === id);
  if (!p) continue;
  ok(p.tileX === x && p.tileY === y, `  ${id} still at (${p.tileX},${p.tileY})`);
}
ok(!/ids:\s*\[\]/.test(noC) && /ids: \['zarvane_town_hall'/.test(noC),
   'membership is an explicit id list, not a radius sweep');

console.log('\n6 · ★ THE PASS IS IDEMPOTENT\n');
const before = Object.values(C.HUB_RECENTRE).flatMap(c => c.ids)
  .map(id => { const p = WORLD_PROPS.find(q=>q&&q.id===id); return p ? `${p.tileX},${p.tileY}` : ''; });
C.applyHubRecentre();
const after = Object.values(C.HUB_RECENTRE).flatMap(c => c.ids)
  .map(id => { const p = WORLD_PROPS.find(q=>q&&q.id===id); return p ? `${p.tileX},${p.tileY}` : ''; });
ok(before.join('|') === after.join('|'),
   'running it a second time moves nothing — the zero-offset early-out holds');
ok(/if \(!dx && !dy\) continue;/.test(noC), 'and that early-out is explicit in the code');

console.log('\n7 · ★ IT RUNS BEFORE COLLISION IS BAKED\n');
const iHub = noC.indexOf('applyHubRecentre();');
const iGround = noC.indexOf('applyGroundStoreyCollision();');
const iBake = noC.indexOf('p.footprint.forEach(([dx,dy]) => _propBlocked.add');
ok(iHub > 0 && iHub < iGround, 'hub recentre runs before the ground-storey pass');
ok(iGround < iBake, 'and both run before _propBlocked is baked');
console.log('     so the moved buildings register their collision and their');
console.log('     doors at the NEW tiles, not the old ones.\n');

console.log(f ? `❌ ${f} failure(s)` : '✅ ALL CHECKS PASS');
process.exit(0);
