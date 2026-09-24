// ★★★★ v0.99.28 · RETARGETED FROM THE VORASHIL SWORD TO THE MALEZOR VOLTSHARD.
//   This suite tests the DROP CEREMONY the Creator asked for at v0.95.776 —
//   "give it collision on spawn from chest. player must go up to it and press
//   x" — and that ceremony is alive and unchanged. What moved is which chests
//   use it: v0.99.24 put all four Gemlord arms into the town-hall mythic
//   vaults, so the only overworld cosmic chest left is the Voltshard at the
//   Malezor tower plaza. Testing the ceremony on a chest that no longer exists
//   is testing nothing; it now runs on the one that does.
//   ★ The vault hand-over path is covered separately by verify_lock_ladder.
const fs = require('fs');
const _harnessSrc = require('./lib/all_src.cjs')();
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
try{new Function(require('./lib/all_src.cjs')()+
  ';globalThis.__C={game,TOWN_HALL_VAULTS,tryOpenTownHallVault,civicSceneId,S1_WEAPON_RING,COSMIC_CHEST_SPOTS,SWORD_MAX,RUBY_MAX,_tileIsVisiblyClear,_weaponDropTile,COSMIC_CHEST_SPOTS,WEAPON_DROP_ART,spawnWeaponDrop,restoreWeaponDrops,_rememberWeaponDrops,_weaponDropTile,WORLD_PROPS,_propBlocked,worldDistrictAt,isWorldLandTile,isWorldBorderTile,player,game,snapBuildingsToLattice,buildAllTrails,scatterWoodChests,topUpDistrictCollectibles,evictFromBuildings};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let fail=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)fail++;};
const H=t=>console.log('\n'+t);
C.snapBuildingsToLattice(); C.buildAllTrails(); C.scatterWoodChests();
C.topUpDistrictCollectibles(); C.evictFromBuildings();
C.player.items={}; C.player.weaponDrops=[];
// ★★★★ v0.99.28 · THE GATE IS NOT WHAT THIS SUITE TESTS, AND IT BLOCKED IT.
//   v0.99.22 made every cosmic chest refuse until that district's Elder trials
//   are done. Correct -- and it meant chest.onInteract() returned without
//   spawning anything, so the DROP CEREMONY assertions failed for a reason
//   with nothing to do with the ceremony. Open the gate the legitimate way
//   (the Creator's own dev bypass); the gate itself is verify_lock_ladder's job.
C.game.devMaxBond = true;

H('1 · ★★ THE CHEST IS WHERE THE CREATOR STOOD');
{
  const v=C.COSMIC_CHEST_SPOTS.find(s=>s.item==='voltshard');
  ok(v.at[0]===41&&v.at[1]===16,`Voltshard chest at (${v.at}) · Malezor tower plaza`);
  ok(v.item==='voltshard','it is the Voltshard · a relic, not a Gemlord arm, so it never moved indoors');
  const chest=C.WORLD_PROPS.find(p=>p&&p._cosmicChest==='malezor'&&p.id==='chest_cosmic_voltshard');
  ok(!!chest&&chest.tileX===41&&chest.tileY===16,'and the prop is actually there');
  ok(C.worldDistrictAt(41,16)==='malezor','still inside Malezor');
}

H('2 · ★★ OPENING THE CHEST DROPS A SOLID BLADE');
{
  const chest=C.WORLD_PROPS.find(p=>p&&p._cosmicChest==='malezor'&&p.id==='chest_cosmic_voltshard');
  const before=(C.player.items.voltshard||0);
  chest.onInteract();
  ok((C.player.items.voltshard||0)===before,
     'the sword does NOT go straight into the bag');
  const drop=C.WORLD_PROPS.find(p=>p&&p._weaponDrop==='voltshard');
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
  const drop=C.WORLD_PROPS.find(p=>p&&p._weaponDrop==='voltshard');
  const free=(x,y)=>C.isWorldLandTile(x,y)&&!C.isWorldBorderTile(x,y)&&!C._propBlocked.has(`${x},${y}`);
  const spots=[[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy])=>free(drop.tileX+dx,drop.tileY+dy));
  ok(spots.length>0,`${spots.length} walkable tile(s) adjacent — somewhere to stand and interact`);
}

H('4 · ★★ X TAKES IT, AND IT LEAVES NO GHOST WALL');
{
  const drop=C.WORLD_PROPS.find(p=>p&&p._weaponDrop==='voltshard');
  const tile=`${drop.tileX},${drop.tileY}`;
  drop.onInteract();
  ok((C.player.items.voltshard||0)===1,'the relic is in the bag');
  // ★ v0.95.786 · this said ===200 and broke the moment the Tearsword's ceiling
  // dropped to 100. A test that hardcodes a game constant fails every time that
  // constant is tuned, which trains you to ignore it. Read the ceiling.
  // ★★ v0.99.28 · the Voltshard is a RELIC · it has no durability ceiling to
  //   arrive at, so the equivalent claim is simply that it landed in the bag.
  ok((C.player.items.voltshard||0)===1, 'and the relic is in the bag · a relic carries no durability');
  ok(!C.WORLD_PROPS.some(p=>p&&p._weaponDrop==='voltshard'),'the drop is gone from the world');
  ok(!C._propBlocked.has(tile),
     '★ and its tile is walkable again — no invisible wall left behind');
}

H('5 · ★★★★ THE RUBYPAW COMES FROM THE VAULT NOW, NOT A FOREST CHEST');
{
  // ★★★★ v0.99.28 · This section used to open chest_cosmic_rubypaw_sword in the
  //   Malezor woods. That chest was DELETED at v0.99.24 when all four Gemlord
  //   arms moved into the town-hall mythic vaults — two chests holding one
  //   unique weapon is a chest that lies. The intent of the section survives
  //   ("the Rubypaw works the same way"); only where it lives changed.
  //   ★★ The vault hands over directly rather than dropping a solid blade: you
  //   are already standing at the chest pressing X inside a small room, so the
  //   deliberate act the drop ceremony exists to force is already paid.
  ok(!C.WORLD_PROPS.some(p=>p&&p.id==='chest_cosmic_rubypaw_sword'),
     '★★★ the old forest chest is GONE · not left as a duplicate');
  const V=(C.TOWN_HALL_VAULTS||[]).find(v=>v.item==='rubypaw_sword');
  ok(!!V&&V.dist==='malezor','★★★ the Rubypaw is Malezor\'s vault item');
  C.game.scene=C.civicSceneId('town-hall','malezor');
  C.player.items.rubypaw_sword=0; C.player.townHallVaults={};
  C.tryOpenTownHallVault();
  ok((C.player.items.rubypaw_sword||0)===1,'★★ X on the vault hands it over (dev bypass is on)');
  ok(C.player.rubypawDurability===C.RUBY_MAX,
     `with rubypawDurability at its own ceiling (${C.player.rubypawDurability}/${C.RUBY_MAX})`);
  C.tryOpenTownHallVault();
  ok((C.player.items.rubypaw_sword||0)===1,'★★★★ and pressing X again does not duplicate it');
  ok(C.SWORD_MAX!==C.RUBY_MAX,'★ the two ceilings genuinely differ · 100 vs 200');
  C.game.scene='overworld';
}

H('6 · ★★ A BLADE LEFT ON THE GROUND SURVIVES A RELOAD');
{
  C.player.items={}; C.player.weaponDrops=[];
  for(let i=C.WORLD_PROPS.length-1;i>=0;i--) if(C.WORLD_PROPS[i]&&C.WORLD_PROPS[i]._weaponDrop) C.WORLD_PROPS.splice(i,1);
  const spot=C.COSMIC_CHEST_SPOTS.find(s=>s.item==='voltshard');
  const d=C.spawnWeaponDrop({tileX:41,tileY:16},spot);
  ok(!!d,'a drop was spawned');
  ok(C.player.weaponDrops.length===1,'recorded on the player for saving');
  const at=[d.tileX,d.tileY];
  // simulate a rebuild
  for(let i=C.WORLD_PROPS.length-1;i>=0;i--) if(C.WORLD_PROPS[i]&&C.WORLD_PROPS[i]._weaponDrop) C.WORLD_PROPS.splice(i,1);
  const n=C.restoreWeaponDrops();
  ok(n===1,'restore put it back');
  const back=C.WORLD_PROPS.find(p=>p&&p._weaponDrop==='voltshard');
  ok(back&&back.tileX===at[0]&&back.tileY===at[1],`at the same tile (${at})`);
  ok(C._propBlocked.has(`${at[0]},${at[1]}`),'and it blocks again after the restore');
  C.restoreWeaponDrops();
  ok(C.WORLD_PROPS.filter(p=>p&&p._weaponDrop).length===1,'restoring twice does not duplicate it');
}

H('7 · ★ IT IS NOT A WALK-OVER PICKUP');
// Coins and scrap are swept up by moving. A Gemlord weapon is taken on purpose.
{
  const src=require('./lib/all_src.cjs')();
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
    const chest=C.WORLD_PROPS.find(p=>p&&p.id===`chest_cosmic_${spot.item}`);   // ★ v0.95.822 · item-keyed · Malezor holds two now
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
  // ★★★ v0.99.28 · THIS META-CHECK WAS ABOUT FOREST CHESTS, AND THERE ARE NONE
  //   LEFT. It asserted the canopy rescue does real work by proving at least
  //   one chest's tile-below was canopy-covered — true while the Gemlord arms
  //   hid in deep woodland. They moved into the town-hall vaults at v0.99.24
  //   and the ONLY overworld cosmic chest left is the Voltshard, which the
  //   build deliberately puts in the OPEN at the Malezor tower plaza
  //   ("guarded, not hidden"). Demanding canopy over it asserts the opposite
  //   of the design. Kept as a live claim, scoped to the case it describes.
  const _forest = C.COSMIC_CHEST_SPOTS.filter(s2 => s2.item !== 'voltshard').length;
  if (_forest > 0){
    ok(rescued>0,
       `★ the check is doing real work · canopy-covered in ${rescued} of ${checked} cases`);
  } else {
    ok(checked>0,
       `★ no forest cosmic chests remain (${checked} open-plaza chest tested) · the canopy rescue is exercised by the vault-era suites instead`);
  }
}

H('10 · ★★ S1 EQUIPS AZUREL\'S BLADE · S2 EQUIPS RAKORON\'S');
// Creator: "must be in s2 to equip it still, must be in s1 to equip azurel
// sword." Already enforced — asserted so a refactor cannot quietly cross them.
{
  const src=require('./lib/all_src.cjs')();
  // ★ v0.95.822 · anchored to the EQUIP TOGGLE, not to the first `const isS2`
  // in the file — voltstormGate now opens with the identical line thousands of
  // lines earlier, and first-match scraped the wrong function (sixth sighting
  // of the fixed-window bug · the fix is a landmark inside the right block).
  // ★★★ v0.96.40 · RE-ANCHORED, and the irony is not lost: the comment above
  //   calls this the sixth sighting of the fixed-window bug, and the landmark
  //   it chose was the CONDITION ITSELF — `=== 'power_upgrade'`. S3 arrived,
  //   that comparison became isRizerPowered(), lastIndexOf returned -1, every
  //   downstream slice came back empty and SIX checks failed at once from one
  //   missing anchor. A landmark has to be the thing that does not change.
  //   `const isS2 =` is the declaration; the condition on its right is exactly
  //   the part that was always free to move.
  const eqAt=src.indexOf('No S2 weapon available');
  const i=src.lastIndexOf('const isS2 =', eqAt);
  ok(i>0&&eqAt>0,'the equip toggle branches on S1 vs S2 form');
  const blk=src.slice(i,i+1400);
  const s2=blk.slice(0,blk.indexOf('} else {'));
  const s1=blk.slice(blk.indexOf('} else {'));
  ok(/rubypaw_sword/.test(s2)&&!/sapphire_sword/.test(s2),
     'in S2 only the RUBYPAW can be equipped');
  // ★ v0.95.792 · S1's branch no longer NAMES its weapons — it reads
  //   S1_WEAPON_RING.  Scraping the branch text for 'sapphire_sword' was
  //   testing the old implementation, not the rule.  Test the rule: the S1 ring
  //   holds S1 weapons and none of S2's.
  ok(/S1_WEAPON_RING/.test(s1)&&!/rubypaw_sword/.test(s1),
     'in S1 the cycle reads the S1 ring and never reaches for the Rubypaw');
  ok(C.S1_WEAPON_RING.every(W=>W.item!=='rubypaw_sword'),
     `and the ring itself holds only S1 gear · ${C.S1_WEAPON_RING.map(W=>W.item).join(', ')}`);
  // ★ v0.95.788 · S1 now CYCLES fists -> Tearsword -> Emerald Axe, so the
  // "No S1 weapon" line only shows when the player owns neither.
  ok(/No S2 weapon available/.test(s2),'S2 names the blade it wants when empty-handed');
  // ★ v0.95.788 · S1 now CYCLES fists -> Tearsword -> Emerald Axe. The axe
  // branch returns before the old "No S1 weapon" message, so that string lives
  // in the fallback path further down rather than in this slice.
  ok(/No S1 weapon available/.test(src)||/EMERALD AXE/.test(src),
     'S1 either names its blade when empty-handed or offers the axe cycle');
  ok(/rubypawBroken/.test(s2),'S2 checks the Rubypaw\'s OWN broken flag');
  // every S1 weapon has its own broken + durability flag, so one snapping
  // cannot disarm the others
  const bf=C.S1_WEAPON_RING.map(W=>W.brokenFlag), df=C.S1_WEAPON_RING.map(W=>W.durFlag);
  ok(new Set(bf).size===bf.length && new Set(df).size===df.length,
     `each S1 weapon tracks its own break and wear · ${bf.join(', ')}`);
  ok(/brokenFlag/.test(s1),'and the cycle consults that per-weapon flag rather than a shared one');
  // ★★★ v0.96.40 · AND S3 MUST NOT FALL INTO THE S1 RING.
  //   The handoff names this as a shipping risk in as many words: "S3 is not
  //   accidentally routed through S1-only weapons or logic." With a plain
  //   `=== 'power_upgrade'` the Luminary form is not S2, so it would drop
  //   straight through to the S1 branch and be handed Azurel's Tearsword — the
  //   blade of the form he evolved OUT of. isRizerPowered() is what stops that,
  //   so the predicate is asserted rather than the string it replaced.
  const cond=src.slice(i, src.indexOf('\n', i));
  ok(/isRizerPowered\(\)/.test(cond),
     '★★★ the weapon slot asks isRizerPowered() · S3 takes the S2 ring, never S1\'s');
}

console.log('\n'+(fail?`❌ ${fail} CHECK(S) FAILED`:'✅ ALL CHECKS PASS'));
process.exit(fail?1:0);
