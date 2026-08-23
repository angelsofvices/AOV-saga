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

const EXPORT = ';globalThis.__C={player,game,NPCS,WORLD_PROPS,findNpcById,tryEnterTrainingFarm,sparZyrex,farmUnlocked,farmCooldownLeft,FARM_COOLDOWN_MS,FARM_SPAR_XP_MIN,FARM_SPAR_XP_MAX,createZyrex,SPECIES,INTERIOR_TRAINING_FARM};';
try {
  new Function(src + EXPORT)();
} catch(e){ console.log('boot error:', e.message.slice(0,200)); }
const fs2=require('fs'); const src2=fs2.readFileSync('/tmp/all.js','utf8');
let f=0; const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const C=globalThis.__C;
ok(!!C,'script evaluated'); if(!C){process.exit(0);}

console.log('\n1 · ★★ KAIZARI NO LONGER CARRIES YOU INSIDE\n');
console.log('     Her dialogue used to end in onDone: enterTrainingFarm(), which');
console.log('     teleported you in straight out of the conversation — the one');
console.log('     building in Zyraxis you never walked through the door of.\n');
const kai=C.findNpcById('kaizari');
ok(!!kai,'Kaizari exists');
const kaiBlock=(()=>{ const i=src2.indexOf("id: 'kaizari'"); return src2.slice(i, i+4200); })();
ok(!/onDone: \(\) => \{\s*try \{ enterTrainingFarm\(\)/.test(kaiBlock),
   'her dialogue no longer auto-enters the farm');
ok(/she UNLOCKS the farm/.test(src2), 'and the reason is recorded where the change is');
// the ONLY caller of enterTrainingFarm should now be the gate
const callers=[...src2.matchAll(/enterTrainingFarm\(\)/g)].length;
const inGate=/try \{ enterTrainingFarm\(\); \} catch\(err\)\{ console\.warn\('\[rp7b\] farm entry failed'/.test(src2);
console.log(`     enterTrainingFarm() referenced ${callers}x in the file`);
ok(inGate, 'tryEnterTrainingFarm() is what calls it now');

console.log('\n2 · ★★ THE BARN IS THE DOOR\n');
const barn=(C.WORLD_PROPS||[]).find(p=>p&&p.id==='malezor_zyrex_farm');
ok(!!barn,'the Zyrex Farm barn exists');
if(barn){
  console.log(`     barn door (${barn.tileX},${barn.tileY}) · Kaizari (${kai.tileX},${kai.tileY})`);
  const d=Math.hypot(barn.tileX-kai.tileX, barn.tileY-kai.tileY);
  ok(d<=4, `she stands ${d.toFixed(1)} tiles from the door she is telling you about`);
  ok(typeof barn.onInteract==='function','the barn has an interact handler');
  // Scope to the BARN. "Closed for now" is the shared placeholder toast on
  // eight other buildings (both town halls, the potion shop, the inn...), so a
  // whole-file search could never pass no matter what the barn does — the same
  // mistake as asserting on `const SPOTS` at v0.95.697.
  const barnBlock=(()=>{ const i=src2.indexOf("id: 'malezor_zyrex_farm'"); return src2.slice(i, i+1400); })();
  ok(!/Closed for now/.test(barnBlock), 'and the BARN no longer says "Closed for now"');
  ok(/tryEnterTrainingFarm\(\)/.test(barnBlock), '   it calls tryEnterTrainingFarm() instead');
}

console.log('\n3 · ★★ GATE ORDER · unlock, THEN cooldown\n');
console.log('     Reversed, a player with no Zyrex would be told to wait 15');
console.log('     minutes for a room they cannot open at all.\n');
C.game.scene='overworld';
C.player.party=[]; C.player.faeCollected=0; C.player.farmLastEntry=0; C.game.devMaxBond=false;
ok(C.farmUnlocked()===false,'locked with 0 fae and 0 Zyrex');
ok(C.tryEnterTrainingFarm()===false,'   and the door refuses');
ok(C.game.scene==='overworld','   without moving you anywhere');
C.player.faeCollected=10;
C.player.party=[C.createZyrex('verdanix',8), C.createZyrex('otterlin',6)];
ok(C.farmUnlocked()===true,'unlocked at 10 fae + 1 Zyrex');
const entered=C.tryEnterTrainingFarm();
ok(entered===true && C.game.scene==='interior_training_farm', `and the door opens (scene=${C.game.scene})`);

console.log('\n4 · ★★ ONE VISIT EVERY 15 MINUTES\n');
ok(C.FARM_COOLDOWN_MS===15*60*1000, `cooldown is 15 minutes (${C.FARM_COOLDOWN_MS}ms)`);
ok(C.player.farmLastEntry>0,'entry stamps the clock');
C.game.scene='overworld';
const left=C.farmCooldownLeft();
console.log(`     ${Math.round(left/1000)}s remaining immediately after entering`);
ok(left>14*60*1000, 'the full window is on the clock');
ok(C.tryEnterTrainingFarm()===false,'a second entry is refused');
ok(C.game.scene==='overworld','   and again you do not move');
// expiry
C.player.farmLastEntry = Date.now() - (C.FARM_COOLDOWN_MS + 1000);
ok(C.farmCooldownLeft()===0,'once 15 minutes pass the gate reopens');
ok(C.tryEnterTrainingFarm()===true,'   and you can walk in again');
ok(/farmLastEntry:\s*player\.farmLastEntry/.test(src2),
   'the stamp is SAVED — a cooldown that resets on reload is a loading screen');
console.log('     away from being free');

console.log('\n5 · ★★ SPARRING · two of YOURS, small XP, no casualties\n');
ok(C.game.scene==='interior_training_farm', 'we are inside the farm');
const posts=(C.NPCS||[]).filter(n=>n&&n._sparPost);
ok(posts.length===4, `four sparring posts (${posts.length})`);
ok(posts.every(p=>p.scene==='interior_training_farm'), '   all inside the barn');
const a=C.player.party[0], b=C.player.party[1];
const xp0=[a.xp||0, b.xp||0], hp0=[a.hp, b.hp];
console.log(`     before · ${a.name} xp ${xp0[0]} hp ${hp0[0]} · ${b.name} xp ${xp0[1]} hp ${hp0[1]}`);
ok(C.sparZyrex()===true,'a spar runs');
console.log(`     after  · ${a.name} xp ${a.xp} hp ${a.hp} · ${b.name} xp ${b.xp} hp ${b.hp}`);
ok((a.xp||0)>xp0[0] && (b.xp||0)>xp0[1], 'BOTH Zyrex gain XP — the loser learns too');
ok(a.hp===hp0[0] && b.hp===hp0[1], 'and neither loses HP · it is a drill, not a worse wild battle');
const gain=Math.max((a.xp||0)-xp0[0], (b.xp||0)-xp0[1]);
ok(gain<=C.FARM_SPAR_XP_MAX, `the XP really is small (${gain} <= ${C.FARM_SPAR_XP_MAX})`);
// one Zyrex cannot spar
const keep=C.player.party;
C.player.party=[C.createZyrex('verdanix',8)];
ok(C.sparZyrex()===false,'a lone Zyrex cannot spar — it takes two');
C.player.party=keep;
// outside the farm it does nothing
C.game.scene='overworld';
ok(C.sparZyrex()===false,'and sparring only works inside the barn');

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
