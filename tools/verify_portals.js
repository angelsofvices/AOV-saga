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
// verify_whud · v0.95.784 · the weapon wheel shows what is in hand
// verify_portals · v0.95.800 · the portal network
const FS=require('fs');
try{new Function(FS.readFileSync('/tmp/all.js','utf8')+
  ';globalThis.__C={PORTAL_TIERS,PORTAL_NETWORK,ZYRAXIS_DISTRICTS,WORLD_PROPS,NPCS,player,game,'+
  'portalPiecesSpent,portalDistrictsUnlocked,portalUnlocked,portalNextTier,portalDistrictIndex,'+
  'sitePortals,spawnPortals,usePortal,portalTravel,SCANOBOT_PER_DIST,PICKUP_KINDS,_propBlocked,'+
  'summonUfoNearPlayer,useZycubeItem,'+
  'INVENTORY_META,isWorldLandTile,isWorldBorderTile};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let fail=0;
const ok=(c,m)=>{ console.log(`  ${c?'✅':'❌'} ${m}`); if(!c) fail++; };
const H=t=>console.log('\n'+t);
const src=FS.readFileSync('/tmp/all.js','utf8');

// ★ The boot call lives inside a setTimeout(...,0) so it runs after the world
//   finishes populating — and the harness stubs setTimeout to a no-op, so
//   nothing has sited them yet.  Run it here, then assert boot does too.
C.spawnPortals();
H('0 · ★ BOOT SITES THEM, AND LAST');
{
  ok(/spawnPortals\(\)/.test(src),'boot calls spawnPortals');
  const i=src.indexOf('const np = spawnPortals()');
  ok(i>0,'inside the deferred world-build block');
  // ★ AFTER everything else · siting reads the density of the finished world
  ok(i > src.indexOf('buildScanobotNet()'),'  after the Scanobot net');
  ok(i > src.indexOf('seedMalezorWild()'),'  after the wild Zyrex');
  ok(/portals · quietest tiles/.test(src),'and logs where they landed');
}

H('1 · ★★ ONE PORTAL IN EACH DISTRICT');
// Creator: "put 1 portal in each district."
{
  ok(C.PORTAL_NETWORK.length===10,`${C.PORTAL_NETWORK.length} portals sited`);
  const ids=new Set(C.PORTAL_NETWORK.map(P=>P.dist));
  ok(ids.size===10,'one each · no district doubled up, none missed');
  for (const D of C.ZYRAXIS_DISTRICTS)
    ok(ids.has(D.id),`  ${D.id}`);
  const props=C.WORLD_PROPS.filter(p=>p&&p._portal);
  ok(props.length===10,`${props.length} portal props stand in the world`);
  // ★ the old hand-placed pair is gone
  ok(!C.WORLD_PROPS.some(p=>p&&(p.id==='portal_closed'||p.id==='zarvane_portal_closed')),
     '★ the two hand-placed sealed portals are retired');
}

H('2 · ★★ SITED IN THE QUIETEST PART OF ITS DISTRICT');
// Creator: "they are always in the most unpopulated area of a district."
{
  // ★ MY FIRST CUT OF THIS CHECK WAS WRONG and is worth recording.  It counted
  //   only LANDMARKS (buildings, chests, props that are not flora) within 10
  //   tiles and asked what percentage of random tiles were BUSIER.  Every
  //   portal scored 0 landmarks — the floor — but so did most random tiles, so
  //   ties dominated and a perfectly-sited portal "failed" at 18%.
  //
  //   Measuring against a distribution that is mostly zeros cannot rank
  //   anything.  The right question is not "how many are busier" but "is
  //   ANYTHING quieter" — and the tie-breaker the siter actually uses is
  //   flora, which the first measure threw away.
  const dens=(x,y)=>{
    let d=0;
    for (const p of C.WORLD_PROPS){
      if (!p||p.tileX==null||p._portal) continue;
      if (Math.abs(p.tileX-x)+Math.abs(p.tileY-y)>10) continue;
      d += /decor\/(?:[a-z]+\/)?[a-z0-9-]*(?:grass|grassblade|bush)/.test(p.src||'') ? 0.15 : 1;
    }
    for (const n of C.NPCS){
      if (!n||n.tileX==null||n.scene!=='overworld') continue;
      if (Math.abs(n.tileX-x)+Math.abs(n.tileY-y)<=10) d += 2;
    }
    return d;
  };
  let clean=0;
  for (const P of C.PORTAL_NETWORK){
    const D=C.ZYRAXIS_DISTRICTS.find(d=>d.id===P.dist);
    const mine=dens(P.x,P.y);
    let quieter=0, samples=0, best=Infinity;
    for (let t=0;t<200;t++){
      const a=Math.random()*Math.PI*2, r=Math.sqrt(Math.random())*0.85;
      const x=Math.round(D.cx+Math.cos(a)*D.rx*r), y=Math.round(D.cy+Math.sin(a)*D.ry*r);
      if (!C.isWorldLandTile(x,y)||C.isWorldBorderTile(x,y)) continue;
      if (C._propBlocked.has(`${x},${y}`)) continue;
      samples++;
      const d=dens(x,y);
      if (d<best) best=d;
      if (d < mine - 0.001) quieter++;
    }
    const pct = samples ? 100*quieter/samples : 0;
    if (quieter===0) clean++;
    ok(pct < 5,
       `  ${P.dist.padEnd(10)} (${P.x},${P.y}) · weight ${mine.toFixed(2)} · only ${pct.toFixed(1)}% of ${samples} sampled tiles are quieter (best found ${best.toFixed(2)})`);
  }
  ok(clean >= 8, `★ ${clean}/10 are the outright quietest tile found in their district`);
  // ★ and not stranded somewhere illegal
  for (const P of C.PORTAL_NETWORK)
    ok(C.isWorldLandTile(P.x,P.y) && !C.isWorldBorderTile(P.x,P.y), `  ${P.dist} is on real land`);
  // ★ nor parked on the town square
  for (const P of C.PORTAL_NETWORK){
    const D=C.ZYRAXIS_DISTRICTS.find(d=>d.id===P.dist);
    const fromHub=Math.abs(P.x-D.cx)+Math.abs(P.y-D.cy);
    ok(fromHub>=18,`  ${P.dist} is ${fromHub} tiles off the district centre`);
  }
}

H('3 · ★★ YOU CAN REACH IT · AND YOU CANNOT WALK THROUGH IT');
{
  for (const P of C.PORTAL_NETWORK){
    ok(C._propBlocked.has(`${P.x},${P.y}`), `  ${P.dist} portal tile is solid — you face it, you do not stand in it`);
  }
  // ★ THE EXIT TILE.  portalTravel drops the player one tile SOUTH; if that
  //   tile is solid the player lands wedged in scenery.
  let bad=[];
  for (const P of C.PORTAL_NETWORK)
    if (C._propBlocked.has(`${P.x},${P.y+1}`)) bad.push(P.dist);
  ok(bad.length===0, `★ every exit tile (one south) is clear${bad.length?' · '+bad.join(', '):''}`);
  ok(/player\.y = dest\.y \+ 1/.test(src), 'and portalTravel is the code that steps there');
}

H('4 · ★★ THE UNLOCK LADDER');
// Creator: 20 -> 2 districts, 40 -> 4, 60 -> 6, 80 -> 8, 100 -> all 10.
{
  const P=C.player;
  const T=C.PORTAL_TIERS;
  ok(T.length===5,'five bands');
  ok(T.every((t,i)=>t.pieces===(i+1)*20 && t.districts===(i+1)*2),
     '★ 20/2 · 40/4 · 60/6 · 80/8 · 100/10 exactly as specified');
  const at=n=>{ P.portalPieces=n; return C.portalDistrictsUnlocked(); };
  ok(at(0)===0,'  0 chips · nothing lit');
  ok(at(19)===0,'  19 chips · still nothing — a band is all-or-nothing');
  ok(at(20)===2,'★ 20 chips · two districts');
  ok(at(39)===2,'  39 · still two');
  ok(at(40)===4,'  40 · four');
  ok(at(60)===6,'  60 · six');
  ok(at(80)===8,'  80 · eight');
  ok(at(100)===10,'★ 100 · the whole planet');
  ok(at(500)===10,'and it cannot exceed ten');
  // ★ THE BANDS GROW FROM HOME OUTWARD
  P.portalPieces=20;
  ok(C.portalUnlocked('malezor') && C.portalUnlocked('zarvane'),
     '★ the first two are MALEZOR and ZARVANE, as the Creator named them');
  ok(!C.portalUnlocked('andrannor'),'  and the third is still dark');
  ok(C.portalDistrictIndex('malezor')===0 && C.portalDistrictIndex('zarvane')===1,
     'because a band lights the first N in canon order · you can always get home');
  P.portalPieces=0;
}

H('5 · ★★ THE MATHS ACTUALLY CLOSES');
{
  // ★ Creator: "by 100 scanobot kills you can portal travel all [10] districts."
  //   At one chip per kill that needs 100 Scanobots.  There were fifty.
  // ★ v0.95.801 · the Creator tripled the drone count after this was written.
  //   The network still costs 100 chips, so the tight "clear everything and it
  //   completes exactly" relationship is gone on purpose — you finish the
  //   network about a third of the way through and the rest are scrap and gems.
  //   What still has to hold is that the network is REACHABLE.
  const total = C.SCANOBOT_PER_DIST * C.ZYRAXIS_DISTRICTS.length;
  const last=C.PORTAL_TIERS[C.PORTAL_TIERS.length-1];
  ok(total >= last.pieces,
     `★ ${total} drones in the world against a ${last.pieces}-chip network · it can actually be finished`);
  ok(total <= last.pieces * 4,
     `  and not so many that the chips are meaningless (${(total/last.pieces).toFixed(1)}x)`);
  // ★ and every district can contribute · a band you cannot fund is a dead end
  ok(C.SCANOBOT_PER_DIST * 2 >= C.PORTAL_TIERS[0].pieces,
     `★ two districts alone yield ${C.SCANOBOT_PER_DIST*2} chips — enough for the first band without leaving home`);
  // one chip per kill, so the number in the bag IS the kill count
  const d=src.indexOf('function scanobotDrop');
  const body=src.slice(d,d+1400);
  ok(/spillPickups\('chip'/.test(body),'the chip spills on the ground like scrap and coins');
  ok(/\[1\]/.test(body),'one per kill · the count in the bag IS the kill count');
  ok(!!C.PICKUP_KINDS.chip,'registered as a walk-over pickup');
  ok(C.PICKUP_KINDS.chip.item==='portal_chip','which grants the portal_chip item');
  ok(!!C.INVENTORY_META.portal_chip,`and the bag names it "${C.INVENTORY_META.portal_chip.label}"`);
  ok(FS.existsSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/assets/2D sprites/decor/portal-chip.png'),
     'the art is on disk');
}

H('6 · ★★ A DARK PORTAL SAYS WHAT IT WANTS');
{
  const P=C.player;
  P.portalPieces=0; P.items=P.items||{}; P.items.portal_chip=7;
  C.usePortal('malezor');
  ok(true,'a sealed portal does not throw');
  ok(!C.portalUnlocked('malezor'),'and stays sealed');
  const t=C.portalNextTier();
  ok(t && t.pieces===20,`next band wants ${t.pieces}`);
  ok(/more Portal Chips \(you carry/.test(src),
     '★ the refusal names how many MORE are needed and how many you hold');

  // ── travel ────────────────────────────────────────────────────────
  P.portalPieces=40;
  P.x=1; P.y=1; C.game.scene='overworld';
  C.usePortal('malezor');
  ok(!!globalThis.portalMenu || /portalMenu = \{ list/.test(src),'stepping into a lit portal opens the chooser');
  // the chooser must never offer the portal you are standing in
  const listSrc=src.slice(src.indexOf('function usePortal'), src.indexOf('function portalTravel'));
  ok(/P\.i !== here/.test(listSrc),'★ and never offers the one you are standing in');
  ok(/P\.i < portalDistrictsUnlocked\(\)/.test(listSrc),'nor any district still dark');
  P.portalPieces=0;
}

H('7 · ★★ IT SURVIVES A SAVE');
{
  ok(/portalPieces:\s*player\.portalPieces/.test(src),
     '★ pieces handed to Dad persist — the whole network is derived from that one number');
  // ★ ONE source of truth: unlocked districts are DERIVED, never stored.
  ok(!/portalUnlockedDistricts\s*[:=]/.test(src),
     '★ and the unlocked count is derived, not stored — two flags for one fact is how saves rot');
  ok(/player\.portalPieces = \(player\.portalPieces \|\| 0\) \+ need/.test(src),
     'Dad takes them in band-sized lots, so a partial hand-over cannot desync the ladder');
}


H('8 · ★★ DAD ONBOARDS BEFORE HE TALKS SHOP');
// Creator: "dads notebook and first quest should fire first, even before the
// chip thing."
{
  const src=FS.readFileSync('/tmp/all.js','utf8');
  const i=src.indexOf("playSFX('dad')");
  const body=src.slice(i, i+12000);
  const nb=body.indexOf('if (!player.dadStarterQuestGiven){');
  const sh=body.indexOf('shardshare_broken');
  const ch=body.indexOf('PORTAL NETWORK');
  ok(nb>0&&sh>0&&ch>0,'all three branches found in the interact chain');
  ok(nb<sh,'★ the notebook gift comes before the Shardshare repair');
  ok(nb<ch,'★ and before the Portal Chip turn-in');
  // ★ WHY IT MATTERED: since v0.95.801 the chips are farmable from the first
  //   minute, so a player could reach Dad holding a full band and get a
  //   business meeting instead of an introduction.
  const gift=body.slice(nb, nb+400);
  ok(/dadStarterQuestGiven = true/.test(gift)&&/dadNotebookGifted/.test(gift),
     'and the first-talk branch is the real gift, not a stub');
}

console.log('\n'+(fail?`❌ ${fail} CHECK(S) FAILED`:'✅ ALL CHECKS PASS'));
process.exit(fail?1:0);
