// Headless smoke test for rp7b.html — evaluates the whole script against a
// stubbed browser surface, then calls the combat/roster functions directly.
const fs = require('fs');
const src = fs.readFileSync('/tmp/all.js', 'utf8');

const noop = () => {};
global.setInterval=()=>0; global.setTimeout=(f,t)=>0; global.clearInterval=noop; global.clearTimeout=noop;
function makeCtx() {
  const c = {};
  const methods = ['save','restore','beginPath','closePath','moveTo','lineTo','arc','arcTo','rect',
    'fill','stroke','fillRect','strokeRect','clearRect','fillText','strokeText','drawImage','translate',
    'rotate','scale','setTransform','resetTransform','clip','createLinearGradient','createRadialGradient',
    'createPattern','putImageData','getImageData','measureText','ellipse','quadraticCurveTo','bezierCurveTo',
    'setLineDash','transform'];
  for (const m of methods) c[m] = () => ({ addColorStop: noop, data: [], width: 0, height: 0 });
  c.measureText = () => ({ width: 10 });
  c.canvas = { width: 960, height: 540 };
  return c;
}
const CTX = makeCtx();
function makeEl() {
  const el = {
    style: {}, dataset: {}, classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
    width: 960, height: 540, value: '', textContent: '', innerHTML: '', checked: false,
    children: [], childNodes: [], clientWidth: 960, clientHeight: 540,
    getContext: () => CTX, appendChild: noop, removeChild: noop, insertBefore: noop,
    addEventListener: noop, removeEventListener: noop, setAttribute: noop, getAttribute: () => null,
    removeAttribute: noop, focus: noop, blur: noop, click: noop, remove: noop, closest: () => null,
    querySelector: () => makeEl(), querySelectorAll: () => [],
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 960, height: 540, right: 960, bottom: 540 }),
    scrollIntoView: noop, scrollTo: noop, scrollTop: 0,
  };
  return el;
}
global.addEventListener = noop; global.removeEventListener = noop;
global.document = {
  getElementById: () => makeEl(), querySelector: () => makeEl(), querySelectorAll: () => [],
  createElement: () => makeEl(), createTextNode: () => ({}), addEventListener: noop,
  removeEventListener: noop, body: makeEl(), documentElement: makeEl(), head: makeEl(),
  hidden: false, visibilityState: 'visible', activeElement: null, fullscreenElement: null,
};
global.window = global;
global.localStorage = { _d: {}, getItem(k){ return this._d[k] ?? null; }, setItem(k,v){ this._d[k]=String(v); },
  removeItem(k){ delete this._d[k]; }, clear(){ this._d = {}; } };
global.Audio = function(){ return { play: () => Promise.resolve(), pause: noop, load: noop,
  addEventListener: noop, removeEventListener: noop, cloneNode(){ return this; },
  volume: 1, currentTime: 0, duration: 0, paused: true }; };
global.Image = function(){ return { addEventListener: noop, removeEventListener: noop,
  complete: false, naturalWidth: 0, naturalHeight: 0, width: 0, height: 0, src: '' }; };
global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = noop;
global.matchMedia = () => ({ matches: false, addEventListener: noop, removeEventListener: noop, addListener: noop });
global.navigator = { userAgent: 'node', getGamepads: () => [], maxTouchPoints: 0, vibrate: noop };
global.performance = { now: () => 0 };
global.alert = noop; global.confirm = () => true; global.prompt = () => null;
global.getComputedStyle = () => ({ getPropertyValue: () => '' });

const EXPORT = ';globalThis.__C={sweepRollPickups,collectPickupsAt,collectGemAt,spawnGemDrop,GEM_ENTITIES,WORLD_PROPS,PICKUP_KINDS,spillPickups,game,player,STAMINA_DODGE_COST};';

try { new Function(src + EXPORT)(); } catch(e){ console.log('boot error:', e.message.slice(0,300)); }
const src2 = require('fs').readFileSync('/tmp/all.js','utf8');
let f=0; const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
// ★ brace-matched function body.  A fixed character window is a test that rots
// on its own — it has now bitten me three times in this project (verify_notebook
// at v0.95.935, verify_hudlayout the same day, and this suite on its first run,
// where tryMove is longer than the 9000 characters I guessed at).
function fnBody(name){
  const i = src2.indexOf('function ' + name);
  if (i < 0) return '';
  let d=0, started=false;
  for (let j=i;j<src2.length;j++){
    const c=src2[j];
    if (c==='{'){ d++; started=true; }
    else if (c==='}'){ d--; if (started && d===0) return src2.slice(i, j+1); }
  }
  return src2.slice(i);
}
const C=globalThis.__C;
ok(!!C,'script evaluated');
if(!C){ console.log('\n❌ cannot continue'); process.exit(0); }
C.game.scene='overworld';
const P=C.player;
const clean = () => {
  for (let i=C.WORLD_PROPS.length-1;i>=0;i--) if (C.WORLD_PROPS[i] && C.WORLD_PROPS[i]._pickup) C.WORLD_PROPS.splice(i,1);
  C.GEM_ENTITIES.length = 0;
  P.items = {};
};
const coinAt = (x,y,amt=5) => C.WORLD_PROPS.push({
  id:`t_${x}_${y}`, tileX:x, tileY:y, footprint:[],
  _pickup:{ kind:'coins', tag:'test', amount:amt },
});

console.log('\n★★★ v0.95.939 · A ROLL SWEEPS WHAT IT ROLLS THROUGH');
console.log('  Creator: "if I dodge roll into coins or gems, I should auto collect them."\n');

console.log('1 · ★★ WHY IT DID NOT ALREADY\n');
{
  ok(/player\.x = player\.dodgeToX;/.test(src2),
     'the dodge assigns player.x DIRECTLY');
  const tm = fnBody('tryMove');
  ok(/collectPickupsAt\(nx, ny\)/.test(tm) && /collectGemAt\(game\.scene, nx, ny\)/.test(tm),
     '★ and BOTH walk-over collectors live inside tryMove');
  console.log('     So a roll went round the outside of the only code that picks anything up.');
  console.log('     It collected nothing — not the tile it crossed, and not even the tile it');
  console.log('     LANDED ON.\n');
}

console.log('2 · ★★★ THE MIDDLE TILE IS THE WHOLE POINT\n');
{
  clean();
  P.x=10; P.y=10;
  coinAt(11,10,7);              // the tile the roll passes OVER
  coinAt(12,10,3);              // the tile it lands on
  const got = C.sweepRollPickups(10,10, 12,10);
  console.log(`     rolled (10,10) -> (12,10) · swept ${got} tiles that held something`);
  ok((P.items.coins||0) === 10, `★★ picked up BOTH piles · ${P.items.coins||0} coins (7 crossed + 3 landed)`);
  ok(C.WORLD_PROPS.filter(p=>p&&p._pickup).length === 0, 'and both props left the world');
  console.log('     A dodge leaps TWO tiles when it can, so the middle one is never occupied');
  console.log('     for a single frame.  No step-based pickup could ever fire there however');
  console.log('     the landing was handled — which is why this sweeps the PATH, not the');
  console.log('     destination.');
}

console.log('\n3 · GEMS TOO, AND ALONG THE SAME PATH\n');
{
  clean();
  P.x=20; P.y=20;
  C.spawnGemDrop('overworld',20,21,'red');
  C.spawnGemDrop('overworld',20,22,'black');
  C.sweepRollPickups(20,20, 20,22);
  ok((P.items.gem_red||0)===1 && (P.items.gem_black||0)===1,
     `★ both gems collected on one downward roll (red ${P.items.gem_red||0}, black ${P.items.gem_black||0})`);
  ok(C.GEM_ENTITIES.every(g=>g.collected), 'and both entities are marked collected, not deleted');
}

console.log('\n4 · ★ IT IS NOT A MAGNET\n');
{
  clean();
  P.x=30; P.y=30;
  coinAt(31,31,9);              // ONE TILE DIAGONAL of the path · must NOT be taken
  coinAt(31,30,4);              // on the path
  C.sweepRollPickups(30,30, 32,30);
  ok((P.items.coins||0) === 4,
     `only the pile ON the path came in (${P.items.coins||0}) · the diagonal one stayed`);
  console.log('     He said roll INTO them.  Contact along the path collects; a coin one tile');
  console.log('     to the side does not.  A vacuum radius is a different feature and was');
  console.log('     not asked for.');
  ok(C.WORLD_PROPS.filter(p=>p&&p._pickup).length === 1, 'and it is still lying there');
}

console.log('\n5 · A DODGE THAT COULD NOT MOVE STILL SWEEPS ITS OWN TILE\n');
{
  clean();
  P.x=40; P.y=40;
  coinAt(40,40,6);
  C.sweepRollPickups(40,40, 40,40);   // both landing tiles blocked · dist 0
  ok((P.items.coins||0)===6,
     'i = 0 includes the ORIGIN tile · a chest spill under your feet is not stranded');
}

console.log('\n6 · ★★ ONE PICKUP PATH, NOT TWO\n');
{
  const fn = fnBody('sweepRollPickups');
  ok(/collectPickupsAt\(x, y\)/.test(fn) && /collectGemAt\(game\.scene, x, y\)/.test(fn),
     '★ it CALLS the two existing collectors');
  ok(!/WORLD_PROPS\.splice/.test(fn) && !/addItems/.test(fn) && !/playSFX/.test(fn),
     '★★ and reaches into neither WORLD_PROPS nor the item/sound code itself');
  console.log('     A second pickup path is a second place for the coin sound, the toast, the');
  console.log('     save-side _rememberPickups and the gem VO to fall out of step.');
  ok(/try \{ sweepRollPickups\(player\.dodgeFromX, player\.dodgeFromY/.test(src2),
     'the dodge calls it with its own recorded from/to · not a re-derived guess');
}

console.log('\n7 · ★★★ THE SECOND BUG, FOUND BY ASKING WHICH SCENE\n');
{
  ok(!/if \(game\.scene === 'overworld'\) collectGemAt/.test(src2),
     "★★ the walk-over gem collector was GATED to 'overworld' — it is not any more");
  console.log('     spawnChestGems is called with \'interior_treehouse\' for BOTH treehouse');
  console.log('     chests.  Those gems spawned, drew, bobbed on their little glow — and');
  console.log('     could never be picked up, because the only collector refused to run');
  console.log('     indoors.  Found because the roll sweep had to ask the same question');
  console.log('     ("which scene am I collecting in?") and got a different answer.\n');
  ok(/spawnChestGems\('interior_treehouse'/.test(src2),
     'the treehouse really does spawn gems indoors (2 chests)');
  // prove it works now
  clean();
  C.game.scene = 'interior_treehouse';
  C.spawnGemDrop('interior_treehouse', 5, 5, 'purple');
  ok(C.collectGemAt(C.game.scene, 5, 5) === true,
     '★ and an indoor gem is now collectable');
  // and prove the un-gating cannot reach across scenes
  clean();
  C.spawnGemDrop('overworld', 5, 5, 'white');
  ok(C.collectGemAt('interior_treehouse', 5, 5) === false,
     '★★ while an OVERWORLD gem at the same tile numbers is still refused indoors —');
  console.log('       the entity carries its own scene and collectGemAt already filtered on');
  console.log('       it, so the gate was never what kept scenes apart.');
  C.game.scene = 'overworld';
}

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
