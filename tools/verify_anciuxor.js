// ★★★ v0.96.63 · ANCIUXOR · THE GOD WHO WILL NOT BE APPROACHED
//
//   Creator: "when u approach an anciuxor under level 100, It flies away and
//   spawns else where in the district.  it follows you during your expedition
//   but you cannot interact with it until level 100 ... the first anciuxor
//   sighting is the treehouse, then it goes away."
//
// ★★ WHAT THIS SUITE IS REALLY FOR: he is ONE object in the save, lifted off
//   the ground by his own departure animation.  Every failure mode here ends
//   with the Ultimate T10 God quietly not existing any more, and none of them
//   would throw — you would simply never see him again and never know why.
const fs = require('fs');
const src = fs.readFileSync('/tmp/all.js', 'utf8');
const noop = () => {};
const _Q = [];
let CLK = 100000;
global.setInterval = () => 0; global.setTimeout = (f) => { _Q.push(f); return 0; };
global.clearInterval = noop; global.clearTimeout = noop;
const CTX = new Proxy({}, { get: () => () => ({ addColorStop: noop, width: 0, height: 0, data: [] }) });
const el = () => ({ style:{}, dataset:{}, classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},
  width:960, height:528, value:'', textContent:'', innerHTML:'', children:[], childNodes:[],
  getContext:()=>CTX, appendChild:noop, removeChild:noop, addEventListener:noop, removeEventListener:noop,
  setAttribute:noop, getAttribute:()=>null, focus:noop, remove:noop, play:()=>Promise.resolve(), pause:noop,
  querySelector:()=>el(), querySelectorAll:()=>[], getBoundingClientRect:()=>({left:0,top:0,width:960,height:528}) });
global.addEventListener = noop; global.removeEventListener = noop;
global.document = { getElementById:()=>el(), querySelector:()=>el(), querySelectorAll:()=>[],
  createElement:()=>el(), addEventListener:noop, body:el(), documentElement:el(), head:el(),
  hidden:false, visibilityState:'visible' };
global.window = global;
global.localStorage = { getItem:()=>null, setItem:noop, removeItem:noop };
global.Audio = function(){ return { play:()=>Promise.resolve(), pause:noop, addEventListener:noop, cloneNode(){return this;} }; };
global.Image = function(){ return { addEventListener:noop, complete:true, naturalWidth:1254, naturalHeight:1254, src:'' }; };
global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = noop;
global.matchMedia = () => ({ matches:false, addEventListener:noop, addListener:noop });
global.navigator = { userAgent:'node', getGamepads:()=>[], maxTouchPoints:0 };
global.performance = { now: () => CLK };
global.getComputedStyle = () => ({ getPropertyValue: () => '' });
try {
  new Function(src + ';globalThis.__C={WILD_ZYREX,anciuxorWild,anciuxorWillStay,tickAnciuxor,' +
    'beginAnciuxorFlight,relocateAnciuxor,anciuxorFlightScale,drawAnciuxorFlight,seedMalezorWild,' +
    'worldDistrictAt,walkable,isWorldBorderTile,isWorldLandTile,wildBodyFootprint,wildBodyCovers,' +
    'SPECIES_RECRUIT_GATES,ANCIUXOR_TAME_LV,ANCIUXOR_FLEE_TILES,ANCIUXOR_FLIGHT_MS,' +
    'ANCIUXOR_FLIGHT_HOLD,ANCIUXOR_FLEE_BB,game,player};')();
} catch (e) { console.log('❌ BOOT FAILED:', e.message); process.exit(1); }
const C = globalThis.__C; let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const H = t => console.log('\n' + t);
global.showToast = noop; global.playSFX = noop; global.saveGame = noop;
{ let n = 0; while (_Q.length && n < 600) { const fn = _Q.shift(); n++; try { fn(); } catch (_) {} } }
const P = C.player;
C.game.scene = 'overworld'; C.seedMalezorWild();

H('1 · ★★ THE FIRST SIGHTING IS THE TREEHOUSE');
{
  const w = C.anciuxorWild();
  ok(!!w, 'he is in the world');
  ok(w && Math.abs(w.tileX - 20) <= 4 && Math.abs(w.tileY + 20) <= 4,
     `★★ standing at (${w&&w.tileX},${w&&w.tileY}) · the treehouse is (20,-20)`);
  ok(C.ANCIUXOR_TAME_LV === 100, `★ the bar is Rizer ${C.ANCIUXOR_TAME_LV}`);
  ok(!/RIZER_LEVEL_CAP/.test(String(C.anciuxorWillStay)),
     '★★★ and it is a LOCAL const · reading RIZER_LEVEL_CAP up here is the TDZ boot-killer that cost v0.96.40 an evening');
}

H('2 · ★★★ THE GROWTH IS OURS, AND IT HOLDS FIRST');
{
  const sc = i => C.anciuxorFlightScale(i);
  ok(sc(0) === 1 && sc(C.ANCIUXOR_FLIGHT_HOLD) === 1,
     `★★ frames 0..${C.ANCIUXOR_FLIGHT_HOLD} stay at true size · "the first few frames keep its regular size"`);
  let rising = true;
  for (let i = C.ANCIUXOR_FLIGHT_HOLD + 1; i <= 15; i++) if (sc(i) <= sc(i - 1)) rising = false;
  ok(rising, '★★★ and every frame after that is BIGGER than the last · the 3D rush at the lens');
  ok(sc(15) > 3.5, `★ ending at ${sc(15).toFixed(2)}x`);
  // ★ ease-in · the back half must cover more ground than the front half
  const mid = sc(9) - sc(C.ANCIUXOR_FLIGHT_HOLD), end = sc(15) - sc(9);
  ok(end > mid, `★★ and it ACCELERATES (${mid.toFixed(2)} then ${end.toFixed(2)}) · a linear ramp reads as a balloon inflating, not as approach`);
  ok(C.ANCIUXOR_FLEE_BB.length === 4 && C.ANCIUXOR_FLEE_BB.every(r => r.length === 4),
     '★ 16 frames measured, 4x4, read left-to-right then top-to-bottom');
  const flat = C.ANCIUXOR_FLEE_BB.flat();
  ok(flat.some(b => b[0] < 0 || b[1] < 0 || b[0]+b[2] > 313 || b[1]+b[3] > 313),
     '★★ and the overflow is OWNED · a full wing-spread is wider than the cell it was drawn in, and cell-clipping would amputate it');
}

H('3 · ★★★ UNDER THE BAR HE GOES · and lands somewhere you can reach');
{
  P.rizerLvl = 12; P.anciuxorSeen = 0;
  const w = C.anciuxorWild();
  P.x = w.tileX + 20; P.y = w.tileY;
  C.tickAnciuxor();
  ok(!!C.anciuxorWild(), `★ twenty tiles off he does not move · the ring is ${C.ANCIUXOR_FLEE_TILES}`);
  P.x = w.tileX + 4; P.y = w.tileY;
  C.tickAnciuxor();
  ok(!C.anciuxorWild(), '★★★ walk inside the ring and he LAUNCHES · off the ground before you are ever adjacent');
  ok(P.anciuxorSeen === 1, '★ and the sighting is counted');
  try { C.drawAnciuxorFlight(); ok(true, '★ the departure draws without throwing'); }
  catch (e) { ok(false, 'the departure THREW: ' + e.message); }
  CLK += C.ANCIUXOR_FLIGHT_MS + 50;
  C.tickAnciuxor();
  const w2 = C.anciuxorWild();
  ok(!!w2, '★★★ and he comes back somewhere else · a God who leaves and never returns is a deleted feature');
  const B = C.wildBodyFootprint('anciuxor');
  let reach = false;
  for (let x = w2.tileX-B.left-1; x <= w2.tileX+B.right+1 && !reach; x++)
    for (let y = w2.tileY-B.depth-1; y <= w2.tileY+1; y++)
      if (!C.wildBodyCovers(w2, x, y) && C.walkable(x, y)) { reach = true; break; }
  ok(reach, '★★ standing on ground you can walk up to · he blocks 10 tiles, so his own body must not seal him in');
  ok(!C.isWorldBorderTile(w2.tileX, w2.tileY), '★ and not inside the impassable border buffer');
}

H('4 · ★★★ HE KEEPS DOING IT · "it follows you during your expedition"');
{
  let landed = 0, stranded = 0;
  for (const [px, py] of [[22,-19],[120,60],[300,300],[500,250],[600,600],[760,640],[900,650],[210,500],[430,180],[-10,120]]){
    P.x = px; P.y = py;
    const d0 = C.worldDistrictAt(px, py);
    for (let i = 0; i < 12; i++){
      const w = C.WILD_ZYREX.find(q => q && q.speciesId === 'anciuxor');
      if (!C.relocateAnciuxor(w)) { stranded++; continue; }
      landed++;
      const same = d0 === null ? true : C.worldDistrictAt(w.tileX, w.tileY) === d0;
      const far  = Math.hypot(w.tileX - px, w.tileY - py);
      if (!same || C.isWorldBorderTile(w.tileX,w.tileY) || !C.isWorldLandTile(w.tileX,w.tileY) || far < 20) stranded++;
    }
  }
  ok(stranded === 0, `★★★ ${landed} relocations across ten districts, ${stranded} bad · always in your district, always on land, never on top of you`);
  console.log('     ★ (430,180) is INTERSTITIAL — worldDistrictAt returns null out there,');
  console.log('       and demanding a match against null rejected every real tile on the');
  console.log('       map. He could not land in 400 tries, twelve times running.\n');
}

H('5 · ★★★ AT LEVEL 100 HE STOPS RUNNING');
{
  P.rizerLvl = 100;
  const w = C.anciuxorWild();
  P.x = w.tileX + 1; P.y = w.tileY;
  C.tickAnciuxor(); CLK += 100; C.tickAnciuxor();
  const after = C.anciuxorWild();
  ok(!!after && after.tileX === w.tileX && after.tileY === w.tileY,
     '★★★ stand right beside him at Lv100 and he HOLDS · the whole chase is the approach to this');
  ok(C.SPECIES_RECRUIT_GATES.anciuxor.test() === true, '★★ and the recruit gate opens');
  P.rizerLvl = 99;
  ok(C.SPECIES_RECRUIT_GATES.anciuxor.test() === false,
     '★★★ one level short and it does NOT · he flees at six tiles so you should never reach the gate, but "should never" is how a hole gets found');
  ok(/level 100/.test(C.SPECIES_RECRUIT_GATES.anciuxor.why()),
     `★ and it tells you the number · "${C.SPECIES_RECRUIT_GATES.anciuxor.why()}"`);
}

console.log(f ? `\n❌ ${f} FAILED` : '\n✅ ALL PASS');
process.exit(0);
