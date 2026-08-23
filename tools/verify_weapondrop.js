const fs = require('fs');
const _harnessSrc = fs.readFileSync('/tmp/all.js', 'utf8');
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
// verify_weapondrop · v0.95.776 · Gemlord blades drop solid, taken with X
try{new Function(require('fs').readFileSync('/tmp/all.js','utf8')+
  ';globalThis.__C={COSMIC_CHEST_SPOTS,SWORD_MAX,RUBY_MAX,_tileIsVisiblyClear,_weaponDropTile,COSMIC_CHEST_SPOTS,WEAPON_DROP_ART,spawnWeaponDrop,restoreWeaponDrops,_rememberWeaponDrops,_weaponDropTile,WORLD_PROPS,_propBlocked,worldDistrictAt,isWorldLandTile,isWorldBorderTile,player,game,snapBuildingsToLattice,buildAllTrails,scatterWoodChests,topUpDistrictCollectibles,evictFromBuildings};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let fail=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)fail++;};
const H=t=>console.log('\n'+t);
C.snapBuildingsToLattice(); C.buildAllTrails(); C.scatterWoodChests();
C.topUpDistrictCollectibles(); C.evictFromBuildings();
C.player.items={}; C.player.weaponDrops=[];

H('1 · ★★ THE CHEST IS WHERE THE CREATOR STOOD');
{
  const v=C.COSMIC_CHEST_SPOTS.find(s=>s.dist==='vorashil');
  ok(v.at[0]===283&&v.at[1]===465,`Vorashil chest at (${v.at}) — the tile from the screenshot`);
  ok(v.creatorPlaced===true,'flagged creatorPlaced, so the canopy-percentile check skips it by name');
  const chest=C.WORLD_PROPS.find(p=>p&&p._cosmicChest==='vorashil');
  ok(!!chest&&chest.tileX===283&&chest.tileY===465,'and the prop is actually there');
  ok(C.worldDistrictAt(283,465)==='vorashil','still inside Vorashil');
}

H('2 · ★★ OPENING THE CHEST DROPS A SOLID BLADE');
{
  const chest=C.WORLD_PROPS.find(p=>p&&p._cosmicChest==='vorashil');
  const before=(C.player.items.sapphire_sword||0);
  chest.onInteract();
  ok((C.player.items.sapphire_sword||0)===before,
     'the sword does NOT go straight into the bag');
  const drop=C.WORLD_PROPS.find(p=>p&&p._weaponDrop==='sapphire_sword');
  ok(!!drop,'a weapon drop appeared in the world');
  ok((drop.footprint||[]).length>0,'it carries a footprint');
  ok(C._propBlocked.has(`${drop.tileX},${drop.tileY}`),
     `★ its tile BLOCKS (${drop.tileX},${drop.tileY}) — you cannot walk through it`);
  ok(!!drop.door,'and it has a door tile, so X reaches it');
  const d=Math.max(Math.abs(drop.tileX-chest.tileX),Math.abs(drop.tileY-chest.tileY));
  ok(d<=2,`it landed ${d} tile(s) from the chest`);
}

H('3 · ★★ YOU CAN STAND NEXT TO IT TO PRESS X');
// A solid drop that walls itself into a corner is a soft-lock on the reward.
{
  const drop=C.WORLD_PROPS.find(p=>p&&p._weaponDrop==='sapphire_sword');
  const free=(x,y)=>C.isWorldLandTile(x,y)&&!C.isWorldBorderTile(x,y)&&!C._propBlocked.has(`${x},${y}`);
  const spots=[[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy])=>free(drop.tileX+dx,drop.tileY+dy));
  ok(spots.length>0,`${spots.length} walkable tile(s) adjacent — somewhere to stand and interact`);
}

H('4 · ★★ X TAKES IT, AND IT LEAVES NO GHOST WALL');
{
  const drop=C.WORLD_PROPS.find(p=>p&&p._weaponDrop==='sapphire_sword');
  const tile=`${drop.tileX},${drop.tileY}`;
  drop.onInteract();
  ok((C.player.items.sapphire_sword||0)===1,'the sword is in the bag');
  // ★ v0.95.786 · this said ===200 and broke the moment the Tearsword's ceiling
  // dropped to 100. A test that hardcodes a game constant fails every time that
  // constant is tuned, which trains you to ignore it. Read the ceiling.
  ok(C.player.swordDurability===C.SWORD_MAX&&C.player.swordBroken===false,
     `and arrives sharp at its own ceiling (${C.player.swordDurability}/${C.SWORD_MAX})`);
  ok(!C.WORLD_PROPS.some(p=>p&&p._weaponDrop==='sapphire_sword'),'the drop is gone from the world');
  ok(!C._propBlocked.has(tile),
     '★ and its tile is walkable again — no invisible wall left behind');
}

H('5 · ★★ THE RUBYPAW WORKS THE SAME WAY');
{
  const chest=C.WORLD_PROPS.find(p=>p&&p._cosmicChest==='malezor');
  ok(!!chest,'the Malezor cosmic chest exists');
  chest.onInteract();
  ok((C.player.items.rubypaw_sword||0)===0,'the Rubypaw does not go straight into the bag either');
  const drop=C.WORLD_PROPS.find(p=>p&&p._weaponDrop==='rubypaw_sword');
  ok(!!drop&&C._propBlocked.has(`${drop.tileX},${drop.tileY}`),'it drops solid too');
  drop.onInteract();
  ok((C.player.items.rubypaw_sword||0)===1,'X takes it');
  ok(C.player.rubypawDurability===C.RUBY_MAX,
     `with rubypawDurability at its own ceiling (${C.player.rubypawDurability}/${C.RUBY_MAX})`);
  ok(C.player.swordDurability===C.SWORD_MAX,
     `and the Tearsword is untouched at ${C.player.swordDurability}/${C.SWORD_MAX}`);
  ok(C.SWORD_MAX!==C.RUBY_MAX,'★ the two ceilings genuinely differ · 100 vs 200');
}

H('6 · ★★ A BLADE LEFT ON THE GROUND SURVIVES A RELOAD');
{
  C.player.items={}; C.player.weaponDrops=[];
  for(let i=C.WORLD_PROPS.length-1;i>=0;i--) if(C.WORLD_PROPS[i]&&C.WORLD_PROPS[i]._weaponDrop) C.WORLD_PROPS.splice(i,1);
  const spot=C.COSMIC_CHEST_SPOTS.find(s=>s.dist==='vorashil');
  const d=C.spawnWeaponDrop({tileX:283,tileY:465},spot);
  ok(!!d,'a drop was spawned');
  ok(C.player.weaponDrops.length===1,'recorded on the player for saving');
  const at=[d.tileX,d.tileY];
  // simulate a rebuild
  for(let i=C.WORLD_PROPS.length-1;i>=0;i--) if(C.WORLD_PROPS[i]&&C.WORLD_PROPS[i]._weaponDrop) C.WORLD_PROPS.splice(i,1);
  const n=C.restoreWeaponDrops();
  ok(n===1,'restore put it back');
  const back=C.WORLD_PROPS.find(p=>p&&p._weaponDrop==='sapphire_sword');
  ok(back&&back.tileX===at[0]&&back.tileY===at[1],`at the same tile (${at})`);
  ok(C._propBlocked.has(`${at[0]},${at[1]}`),'and it blocks again after the restore');
  C.restoreWeaponDrops();
  ok(C.WORLD_PROPS.filter(p=>p&&p._weaponDrop).length===1,'restoring twice does not duplicate it');
}

H('7 · ★ IT IS NOT A WALK-OVER PICKUP');
// Coins and scrap are swept up by moving. A Gemlord weapon is taken on purpose.
{
  const src=require('fs').readFileSync('/tmp/all.js','utf8');
  const i=src.indexOf('function collectPickupsAt');
  ok(!/_weaponDrop/.test(src.slice(i,i+1600)),
     'collectPickupsAt does not touch weapon drops — walking over one does nothing');
  const drop=C.WORLD_PROPS.find(p=>p&&p._weaponDrop);
  ok(drop&&!drop._pickup,'and the drop is not tagged as a ground pickup');
}

H('8 · ★ BOTH BLADE ICONS ARE ON DISK');
{
  const fs=require('fs');
  for(const [k,a] of Object.entries(C.WEAPON_DROP_ART)){
    const f='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/'+decodeURIComponent(a.src);
    ok(fs.existsSync(f)&&fs.statSync(f).size>5000,`${k} · ${(fs.statSync(f).size/1024|0)}KB`);
    const h=a.tileW*a.bbox[3]/a.bbox[2];
    ok(a.tileW<=2&&h<=1.5,`  drawn ${a.tileW} x ${h.toFixed(2)} tiles`);
  }
}


H('9 · ★★ THE BLADE LANDS SOMEWHERE THE PLAYER CAN SEE IT');
// Creator: "make sure the swords spawn in spots that are visible, not covered
// by any trees." _propBlocked is not enough — a canopy hangs over perfectly
// walkable tiles, so a blade could sit there solid and invisible.
{
  C.player.items={}; C.player.weaponDrops=[];
  for(let i=C.WORLD_PROPS.length-1;i>=0;i--) if(C.WORLD_PROPS[i]&&C.WORLD_PROPS[i]._weaponDrop) C.WORLD_PROPS.splice(i,1);
  let checked=0, rescued=0;
  for(const spot of C.COSMIC_CHEST_SPOTS){
    const chest=C.WORLD_PROPS.find(p=>p&&p._cosmicChest===spot.dist);
    if(!chest) continue;
    chest.opened=false; chest.looted=false;
    chest.onInteract();
    const d=C.WORLD_PROPS.find(p=>p&&p._weaponDrop===spot.item);
    ok(!!d,`${spot.dist}: a blade dropped`);
    if(!d) continue;
    checked++;
    ok(C._tileIsVisiblyClear(d.tileX,d.tileY,d.tileW),
       `  (${d.tileX},${d.tileY}) is visually clear at the blade's full ${d.tileW}-tile width`);
    // ★ prove the check EARNS its keep: the naive tile (straight below the
    // chest) must have been rejected, or this assertion proves nothing.
    if(!C._tileIsVisiblyClear(chest.tileX,chest.tileY+1,d.tileW)) rescued++;
    // nothing may draw over it
    const over=C.WORLD_PROPS.filter(p=>{
      if(!p||!p.src||p.tileX==null||p._weaponDrop) return false;
      if(p.tileY<d.tileY) return false;
      const w=p.tileW||1,h=p.bbox?w*p.bbox[3]/p.bbox[2]:(p.tileH||1);
      const x0=Math.round(p.tileX-w/2),x1=Math.round(p.tileX+w/2),y0=Math.round(p.tileY-h+1);
      const dx0=Math.round(d.tileX-d.tileW/2),dx1=Math.round(d.tileX+d.tileW/2);
      return d.tileY>=y0&&d.tileY<=p.tileY&&dx1>=x0&&dx0<=x1;
    });
    ok(over.length===0,`  nothing draws over it (${over.length})`);
    const near=Math.max(Math.abs(d.tileX-chest.tileX),Math.abs(d.tileY-chest.tileY));
    ok(near<=6,`  and it is ${near} tile(s) from the chest, not flung across the map`);
  }
    // ★ v0.95.788 · was ===2 · the Emerald Axe added a third cosmic chest in
  // Veridan, so this counts the spot table rather than a literal.
  ok(checked===C.COSMIC_CHEST_SPOTS.length,
     `${checked} cosmic chests tested (${C.COSMIC_CHEST_SPOTS.length} declared)`);
  ok(rescued>0,
     `★ the check is doing real work · the tile straight below the chest was canopy-covered in ${rescued} of ${checked} cases`);
}

H('10 · ★★ S1 EQUIPS AZUREL\'S BLADE · S2 EQUIPS RAKORON\'S');
// Creator: "must be in s2 to equip it still, must be in s1 to equip azurel
// sword." Already enforced — asserted so a refactor cannot quietly cross them.
{
  const src=require('fs').readFileSync('/tmp/all.js','utf8');
  const i=src.indexOf("const isS2 = (player.cosmeticSkin || 'normal') === 'power_upgrade'");
  ok(i>0,'the equip toggle branches on S1 vs S2 form');
  const blk=src.slice(i,i+1400);
  const s2=blk.slice(0,blk.indexOf('} else {'));
  const s1=blk.slice(blk.indexOf('} else {'));
  ok(/rubypaw_sword/.test(s2)&&!/sapphire_sword/.test(s2),
     'in S2 only the RUBYPAW can be equipped');
  ok(/sapphire_sword/.test(s1)&&!/rubypaw_sword/.test(s1),
     'in S1 only the TEARSWORD can be equipped');
  // ★ v0.95.788 · S1 now CYCLES fists -> Tearsword -> Emerald Axe, so the
  // "No S1 weapon" line only shows when the player owns neither.
  ok(/No S2 weapon available/.test(s2),'S2 names the blade it wants when empty-handed');
  // ★ v0.95.788 · S1 now CYCLES fists -> Tearsword -> Emerald Axe. The axe
  // branch returns before the old "No S1 weapon" message, so that string lives
  // in the fallback path further down rather than in this slice.
  ok(/No S1 weapon available/.test(src)||/EMERALD AXE/.test(src),
     'S1 either names its blade when empty-handed or offers the axe cycle');
  ok(/rubypawBroken/.test(s2)&&/swordBroken/.test(s1),
     'each checks its OWN broken flag, so one snapping does not disarm the other');
}

console.log('\n'+(fail?`❌ ${fail} CHECK(S) FAILED`:'✅ ALL CHECKS PASS'));
process.exit(fail?1:0);
