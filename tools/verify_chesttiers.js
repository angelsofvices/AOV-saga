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
// verify_chesttiers · v0.95.774 · the four-tier loot ladder
try{new Function(require('fs').readFileSync('/tmp/all.js','utf8')+
  ';globalThis.__C={CHEST_LOOT_LADDER,CHEST_COIN_TIERS,COSMIC_CHEST_SPOTS,GOLD_CHEST_TILE_POSITIONS,GEMSHARD_TABLE,rollGemshard,rollMythicShard,WORLD_PROPS,worldDistrictAt,isFloraProp,player,game,spillChestCoins,collectPickupsAt,spillPickups,PICKUP_KINDS,snapBuildingsToLattice,buildAllTrails,scatterWoodChests,topUpDistrictCollectibles,evictFromBuildings};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let fail=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)fail++;};
const H=t=>console.log('\n'+t);
C.snapBuildingsToLattice(); C.buildAllTrails(); C.scatterWoodChests();
C.topUpDistrictCollectibles(); C.evictFromBuildings();

H('1 · ★★ FOUR TIERS, EACH WITH A STATED PURPOSE');
{
  const L=C.CHEST_LOOT_LADDER;
  ok(['wood','silver','gold','cosmic'].every(k=>L[k]&&L[k].holds),'all four rungs are written down');
  ok(/gemshard/i.test(L.gold.holds),'GOLD holds gemshards');
  ok(/gemlord/i.test(L.cosmic.holds),'COSMIC holds Gemlord weapons');
  ok(/quest/i.test(L.silver.holds),'SILVER holds quest items');
  ok(/coin/i.test(L.wood.holds),'WOODEN holds coins and gems');
}

H('2 · ★★ GEMSHARDS DROPPED DOWN TO GOLD — AND GOLD IS NOT RARE');
// The trap: gold had exactly ONE chest in the game (the treehouse). Moving
// gemshards there without retiering would have made them near-unobtainable.
{
  const gold=C.WORLD_PROPS.filter(p=>p&&p._goldChest);
  ok(gold.length>=13,`${gold.length} gold chests in the world (before the retier: 1)`);
  const d=new Set(gold.map(g=>C.worldDistrictAt(g.tileX,g.tileY)));
  ok(d.size>=9,`spread over ${d.size} districts`);
  ok(gold.every(g=>/gold-chest/.test(g.src)),'all carry the gold sprite');
  ok(typeof C.rollGemshard==='function','rollGemshard exists');
  ok(C.rollMythicShard===C.rollGemshard,'and the old name still resolves — no dangling call site');
  const keys=new Set(); for(let i=0;i<400;i++) keys.add(C.rollGemshard());
  ok(keys.size>1,`the roll is weighted across ${keys.size} shard types`);
}

H('3 · ★★ EACH GEMLORD WEAPON SITS IN ITS OWN GEMLORD\'S DEEP FOREST');
// Azurel is Vorashil's Gemlord and the Tearsword is his crystallised tear.
// Rakoron is Malezor's and the Rubypaw is his iron. Cosmic = Gemlord weapons,
// so the district is not decoration — it is the rule.
{
  const spots=C.COSMIC_CHEST_SPOTS;
  ok(spots.length>=2,`${spots.length} cosmic chest spots declared`);
  const want={ vorashil:'sapphire_sword', malezor:'rubypaw_sword' };
  for(const [dist,item] of Object.entries(want)){
    const spot=spots.find(s=>s.dist===dist);
    ok(!!spot&&spot.item===item,`${dist} holds ${item}`);
    const chest=C.WORLD_PROPS.find(p=>p&&p._cosmicChest===dist);
    ok(!!chest,`  its chest prop exists in the world`);
    if(!chest) continue;
    ok(C.worldDistrictAt(chest.tileX,chest.tileY)===dist,
       `  standing in ${dist} at (${chest.tileX},${chest.tileY})`);
    // ★ "deep forest" is a claim · measure it against the rest of the district
    const trees=C.WORLD_PROPS.filter(p=>p&&p.src&&/(tree|cactus)/.test(p.src)
      &&C.worldDistrictAt(p.tileX,p.tileY)===dist);
    const near=trees.filter(t=>Math.abs(t.tileX-chest.tileX)<=12&&Math.abs(t.tileY-chest.tileY)<=12).length;
    let beaten=0,tried=0;
    for(let k=0;k<300;k++){
      const t=trees[(k*7)%trees.length];
      const n=trees.filter(q=>Math.abs(q.tileX-t.tileX)<=12&&Math.abs(q.tileY-t.tileY)<=12).length;
      tried++; if(n>near) beaten++;
    }
    // ★ v0.95.776 · A CREATOR-PLACED SPOT IS EXEMPT FROM THE DENSITY BAR.
    // The Vorashil chest was placed by hand from inside the game at a tile with
    // 7 trees within 12; my measured pick had 43. A density score is not what a
    // place looks like from inside it. The check is skipped BY NAME for spots
    // flagged creatorPlaced rather than the bar being lowered for everyone —
    // so any spot I choose still has to earn the 95th percentile.
    if (spot.creatorPlaced){
      ok(true,`  ${near} trees within 12 · creator-placed, density bar waived by design`);
    } else {
      ok(near>=25,`  ${near} trees within 12 tiles`);
      ok(beaten/tried<0.05,`  denser than ${(100-100*beaten/tried).toFixed(0)}% of sampled ${dist} spots`);
    }
  }
  // the two must not be the same chest, and must be far apart
  const a=C.WORLD_PROPS.find(p=>p&&p._cosmicChest==='vorashil');
  const b=C.WORLD_PROPS.find(p=>p&&p._cosmicChest==='malezor');
  if(a&&b) ok(Math.hypot(a.tileX-b.tileX,a.tileY-b.tileY)>200,
    `the two cosmic chests are ${Math.round(Math.hypot(a.tileX-b.tileX,a.tileY-b.tileY))} tiles apart`);
  // ★ The Rubypaw must not reappear beside the treehouse it was taken out of.
  // The highest-scoring canopy tile in Malezor was 19 tiles from it, which
  // would have read as a shuffle rather than a relocation.
  if(b) ok(Math.hypot(b.tileX-20,b.tileY-(-20))>40,
    `the Rubypaw chest is ${Math.round(Math.hypot(b.tileX-20,b.tileY+20))} tiles from the treehouse, not next door`);
}

H('4 · ★★ EACH SWORD HAS EXACTLY ONE FREE SOURCE');
// Both used to come from treehouse chests. Two free sources would mean two
// swords, and durability is tracked per weapon.
{
  const src=require('fs').readFileSync('/tmp/all.js','utf8');
  // ★ The first cut of this asserted ZERO direct grants and failed on correct
  // code: _grantSapphireSword / _grantRubypawSword are the ZARVANE WEAPON SHOP,
  // which sells them for 10k and 20k. Buying is a legitimate second route.
  // What must not exist is a second CHEST handing one out for free.
  const ti=src.indexOf('function tryOpenTreehouseChest');
  ok(ti>0&&!/sapphire_sword/.test(src.slice(ti,ti+1400)),
     'the treehouse SILVER chest no longer holds the Tearsword');
  const gi=src.indexOf('function tryOpenTreehouseGoldChest');
  ok(gi>0&&!/rubypaw_sword/.test(src.slice(gi,gi+1400)),
     'the treehouse GOLD chest no longer holds the Rubypaw');
  ok(/rollGemshard\(\)/.test(src.slice(gi,gi+1400)),
     '  and pays a gemshard instead — gold tier, not an empty box');
  ok(/player\.items\[spot\.item\]/.test(src),'both swords are granted through the cosmic spot table');
  ok(/_grantSapphireSword/.test(src)&&/_grantRubypawSword/.test(src),
     'the Zarvane shop still sells both · players are not locked out');
  // ★ v0.95.776 · This grepped for an inline `spot.item === 'rubypaw_sword'`
  // followed by rubypawDurability. That logic now lives in _armWeapon(), so the
  // pattern stopped matching while the behaviour was unchanged — a source-shape
  // check breaking on a refactor. It now asserts the single chokepoint exists
  // and handles both blades; verify_weapondrop proves the behaviour by running
  // it.
  const ai=src.indexOf('function _armWeapon');
  const arm=src.slice(ai,ai+400);
  ok(ai>0,'_armWeapon is the one place a blade is armed');
  ok(/swordDurability/.test(arm)&&/rubypawDurability/.test(arm),
     'and it arms each blade on its OWN durability counter');
}

H('5 · ★★ COINS RING WHEN YOU WALK OVER THEM');
// Creator, mid-task. playItemGain fires a generic cue, so the coin sound was
// only reached if that THREW — which it does not.
{
  const src=require('fs').readFileSync('/tmp/all.js','utf8');
  const i=src.indexOf('function collectPickupsAt');
  const body=src.slice(i,i+1600);
  ok(/if \(got\.coins\)\{[^}]*playSFX\('coins'\)/.test(body),
     "coins play playSFX('coins') unconditionally, not from a catch block");
  const catchOnly=/catch\(_\)\{[^}]*playSFX\(kinds\[0\] === 'coins'/.test(body);
  ok(!catchOnly,'the old catch-block-only coin sound is gone');
}

H('6 · ★ EVERY TIER STILL PAYS ITS COINS');
{
  C.game.scene='overworld'; C.player.items=C.player.items||{};
  for(const [tier,piles] of [['wood',1],['silver',2],['gold',3],['cosmic',4]]){
    for(let i=C.WORLD_PROPS.length-1;i>=0;i--) if(C.WORLD_PROPS[i]&&C.WORLD_PROPS[i]._pickup) C.WORLD_PROPS.splice(i,1);
    const n=C.spillChestCoins({tileX:340,tileY:480,id:'t'+tier},tier,1);
    ok(n===piles,`${tier} spills ${n} pile(s)`);
  }
}

H('7 · ★ THE SWORD ICON IS ON DISK');
{
  const fs=require('fs');
  const f='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/assets/2D sprites/decor/sapphire-sword-icon.png';
  ok(fs.existsSync(f)&&fs.statSync(f).size>5000,`sapphire-sword-icon.png (${(fs.statSync(f).size/1024|0)}KB)`);
}

console.log('\n'+(fail?`❌ ${fail} CHECK(S) FAILED`:'✅ ALL CHECKS PASS'));
process.exit(fail?1:0);
