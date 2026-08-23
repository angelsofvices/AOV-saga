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
// verify_scrap · v0.95.772 · scrap spills from every tower chest, collected on foot
try{new Function(require('fs').readFileSync('/tmp/all.js','utf8')+
  ';globalThis.__C={PICKUP_KINDS,CHEST_COIN_TIERS,spillChestCoins,collectPickupsAt,spillPickups,addItems,game,WORLD_PROPS,TOWER_NETWORK,spillScrap,collectScrapAt,restoreScrapDrops,_rememberPickups,SCRAP_PER_CHEST, player,isWorldLandTile,isWorldBorderTile,_propBlocked,snapBuildingsToLattice,buildAllTrails,worldDistrictAt};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let fail=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)fail++;};
const H=t=>console.log('\n'+t);
C.snapBuildingsToLattice(); C.buildAllTrails();
C.player.items=C.player.items||{}; C.player.items.scrap_metal=0; C.player.groundPickups=[];

H('1 · ★★ EVERY TOWER CHEST EXISTS AND CAN SPILL');
{
  ok(C.TOWER_NETWORK.length===10,`${C.TOWER_NETWORK.length} radio towers`);
  const chests=C.WORLD_PROPS.filter(p=>p&&/^chest_tower_/.test(p.id||''));
  ok(chests.length===10,`${chests.length} silver chests placed at tower bases`);
  const dists=new Set(C.TOWER_NETWORK.map(t=>t.dist));
  const covered=new Set(chests.map(c=>C.worldDistrictAt(c.tileX,c.tileY)));
  const missing=[...dists].filter(d=>!covered.has(d));
  ok(missing.length===0,`one per district${missing.length?' — missing: '+missing.join(', '):''}`);
}

H('2 · ★★ A SPILL LANDS ON WALKABLE GROUND');
{
  const t=C.TOWER_NETWORK[0];
  const n=C.spillScrap(t.chest[0],t.chest[1],C.SCRAP_PER_CHEST,'test');
  ok(n===C.SCRAP_PER_CHEST,`${n} piles spilled (asked for ${C.SCRAP_PER_CHEST})`);
  const drops=C.WORLD_PROPS.filter(p=>p&&p._pickup&&p._pickup.tag==='test');
  ok(drops.length===n,`all ${drops.length} of them are in the world`);
  // ★ v0.95.818 · SELF-OCCLUSION, third sighting of the bug class: a SOLID
  //   pile registers its own tile, so _propBlocked.has() now condemns every
  //   legally-placed pile.  Legality means the tile was clear BEFORE the pile
  //   stood on it — terrain checks stay, the pile's own shadow does not count.
  const bad=drops.filter(d=>!C.isWorldLandTile(d.tileX,d.tileY)||C.isWorldBorderTile(d.tileX,d.tileY));
  ok(bad.length===0,`none landed in water or on a border (${bad.length})`);
  const keys=drops.map(d=>`${d.tileX},${d.tileY}`);
  ok(new Set(keys).size===keys.length,'no two piles share a tile');
  const far=drops.map(d=>Math.max(Math.abs(d.tileX-t.chest[0]),Math.abs(d.tileY-t.chest[1])));
  ok(Math.max(...far)<=4,`all within ${Math.max(...far)} tiles of the chest — a pile, not a scatter across the district`);
}

H('3 · ★★ THE PILE IS SOLID NOW · X IS THE DOOR');
// ★★ INVERTED from v0.95.772 by the Creator's own ruling: "add collision to
//    all pick up items besides coins and gems. everything else u must walk to
//    and interact with."  The walk-over mechanic this section used to protect
//    now belongs to coins alone.
{
  const d=C.WORLD_PROPS.find(p=>p&&p._pickup&&p._pickup.tag==='test');
  ok((d.footprint||[]).length===1,'a scrap pile is SOLID');
  ok(typeof d.onInteract==='function','and taken with X');
}

H('4 · ★★ X COLLECTS IT · WALKING CANNOT');
// ★★ INVERTED · v0.95.772 built walk-over collection and section 5 defended it
//    ("one walk, not five X presses").  The Creator has since ruled the other
//    way — "everything else u must walk to and interact with" — so the very
//    behaviour these sections once required is now the bug they must forbid.
{
  const before=C.player.items.scrap_metal||0;
  const d=C.WORLD_PROPS.find(p=>p&&p._pickup&&p._pickup.tag==='test');
  ok(C.collectScrapAt(d.tileX,d.tileY)===false,
     '★ stepping on a solid pile collects NOTHING — X is the only door');
  ok((C.player.items.scrap_metal||0)===before,'the bag is untouched by walking');
  d.onInteract();
  ok((C.player.items.scrap_metal||0)===before+1,`X pays · ${before} -> ${C.player.items.scrap_metal}`);
  ok(!C.WORLD_PROPS.includes(d),'and the pile is gone');
}

H('5 · ★ COINS ALONE KEEP THE RUN-THROUGH');
{
  const src=require('fs').readFileSync('/tmp/all.js','utf8');
  const i=src.indexOf('player.x = nx; player.y = ny;');
  ok(/collect(Pickups|Scrap)At\(nx, ny\)/.test(src.slice(i,i+500)),
     'the movement step still calls the collector — for the coins');
  ok(/const _solid = kind !== 'coins'/.test(src),
     "and the solidity rule names coins as the ONE walk-over kind");
}

H('6 · ★★ AN UNSWEPT PILE SURVIVES A RELOAD');
// A player who opens a chest and logs out must not lose the spill.
{
  C.spillScrap(300,300,3,'save_test');
  const before=C.WORLD_PROPS.filter(p=>p&&p._pickup).length;
  ok(Array.isArray(C.player.groundPickups)&&C.player.groundPickups.length===before,
     `${C.player.groundPickups.length} piles recorded on the player for saving`);
  // simulate a fresh world: wipe the props, restore from the save list
  for(let i=C.WORLD_PROPS.length-1;i>=0;i--) if(C.WORLD_PROPS[i]&&C.WORLD_PROPS[i]._pickup) C.WORLD_PROPS.splice(i,1);
  ok(C.WORLD_PROPS.filter(p=>p&&p._pickup).length===0,'world rebuilt with no piles');
  const n=C.restoreScrapDrops();
  ok(n===before,`restore put all ${n} back`);
  const keys=C.WORLD_PROPS.filter(p=>p&&p._pickup).map(p=>`${p.tileX},${p.tileY}`);
  ok(new Set(keys).size===keys.length,'and did not duplicate any');
  C.restoreScrapDrops();
  ok(C.WORLD_PROPS.filter(p=>p&&p._pickup).length===n,'restoring twice does not double them');
}

H('7 · THE ART IS REAL AND SITS IN ONE TILE');
{
  const fs=require('fs');
  const f='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/assets/2D sprites/decor/scrap-metal.png';
  ok(fs.existsSync(f),'scrap-metal.png is on disk');
  ok(fs.statSync(f).size>10000,`${(fs.statSync(f).size/1024|0)}KB · not a stub`);
  const drawH=C.PICKUP_KINDS.scrap.tileW*C.PICKUP_KINDS.scrap.bbox[3]/C.PICKUP_KINDS.scrap.bbox[2];
  ok(C.PICKUP_KINDS.scrap.tileW<=1.3&&drawH<=1.1,
     `drawn ${C.PICKUP_KINDS.scrap.tileW} x ${drawH.toFixed(2)} tiles — a pile on the ground, not a monument`);
}


H('8 · ★★ COIN PILES · one wooden, two silver, three gold, four cosmic');
{
  const T=C.CHEST_COIN_TIERS;
  ok(T.wood.piles===1&&T.silver.piles===2&&T.gold.piles===3&&T.cosmic.piles===4,
     `pile counts ${T.wood.piles}/${T.silver.piles}/${T.gold.piles}/${T.cosmic.piles}`);
  // value must actually climb with rarity, not just the pile count
  const mid=t=>(T[t].coins[0]+T[t].coins[1])/2;
  const ladder=['wood','silver','gold','cosmic'].map(mid);
  let rising=true; for(let i=1;i<ladder.length;i++) if(ladder[i]<=ladder[i-1]) rising=false;
  ok(rising,`coin value climbs every rung · ${ladder.join(' -> ')}`);
  ok(mid('cosmic')/mid('wood')>5,`cosmic pays ${(mid('cosmic')/mid('wood')).toFixed(1)}x a wooden chest`);
}

H('9 · ★★ A SPILL PAYS ITS TIER, SPLIT ACROSS ITS PILES');
{
  C.game.scene='overworld';
  for(const [tier,want] of [['wood',1],['silver',2],['gold',3],['cosmic',4]]){
    // clear the ground first so the count is this tier's alone
    for(let i=C.WORLD_PROPS.length-1;i>=0;i--) if(C.WORLD_PROPS[i]&&C.WORLD_PROPS[i]._pickup) C.WORLD_PROPS.splice(i,1);
    const chest={tileX:40,tileY:100,id:'t_'+tier};
    const n=C.spillChestCoins(chest,tier,1);
    const piles=C.WORLD_PROPS.filter(p=>p&&p._pickup&&p._pickup.kind==='coins');
    const total=piles.reduce((a,p)=>a+p._pickup.amount,0);
    const [lo,hi]=C.CHEST_COIN_TIERS[tier].coins;
    ok(n===want&&piles.length===want,`${tier}: ${n} pile(s)`);
    ok(total>=lo&&total<=hi,`  and they sum to ${total}, inside the tier's ${lo}-${hi} range`);
    ok(piles.every(p=>p._pickup.amount>=1),'  no pile is worth zero');
  }
}

H('10 · ★ ONE WALK TAKES WHATEVER IS ON THE TILE');
{
  for(let i=C.WORLD_PROPS.length-1;i>=0;i--) if(C.WORLD_PROPS[i]&&C.WORLD_PROPS[i]._pickup) C.WORLD_PROPS.splice(i,1);
  C.player.items.coins=0; C.player.items.scrap_metal=0;
  C.spillPickups('coins',40,100,[77],'mix');
  const coin=C.WORLD_PROPS.find(p=>p&&p._pickup&&p._pickup.kind==='coins');
  C.spillPickups('scrap',coin.tileX,coin.tileY,[1],'mix2');
  const both=C.WORLD_PROPS.filter(p=>p&&p._pickup&&p.tileX===coin.tileX&&p.tileY===coin.tileY);
  ok(both.length>=1,`${both.length} pickup(s) on the test tile`);
  C.collectPickupsAt(coin.tileX,coin.tileY);
  ok(C.player.items.coins===77,`coins banked at face value (${C.player.items.coins}, not 1)`);
  ok(!C.WORLD_PROPS.some(p=>p&&p._pickup&&p.tileX===coin.tileX&&p.tileY===coin.tileY),
     'the tile is clear afterwards');
}

H('11 · ★★ AN INDOOR CHEST STILL PAYS ITS TIER');
// Ground pickups are overworld props. The GOLD tier lives only in the treehouse
// interior, so without a fallback that whole rung would pay nothing.
{
  C.game.scene='interior_treehouse';
  const before=C.player.items.coins||0;
  const n=C.spillChestCoins({tileX:18,tileY:15,id:'gold_test'},'gold',1);
  const gained=(C.player.items.coins||0)-before;
  ok(n===0,'no piles are spawned indoors (they would not render)');
  const [lo,hi]=C.CHEST_COIN_TIERS.gold.coins;
  ok(gained>=lo&&gained<=hi,`the coins are handed over instead · +${gained}, inside ${lo}-${hi}`);
  C.game.scene='overworld';
}

H('12 · ★ THE COIN ART IS REAL');
{
  const fs=require('fs');
  const f='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/assets/2D sprites/decor/coins-pile.png';
  ok(fs.existsSync(f)&&fs.statSync(f).size>10000,`coins-pile.png on disk (${(fs.statSync(f).size/1024|0)}KB)`);
  const K=C.PICKUP_KINDS.coins;
  const h=K.tileW*K.bbox[3]/K.bbox[2];
  ok(K.tileW<=1.2&&h<=1.0,`drawn ${K.tileW} x ${h.toFixed(2)} tiles · a pile, not a monument`);
  ok(K.item==='coins','it banks into the coins wallet');
}

console.log('\n'+(fail?`❌ ${fail} CHECK(S) FAILED`:'✅ ALL CHECKS PASS'));
process.exit(fail?1:0);
