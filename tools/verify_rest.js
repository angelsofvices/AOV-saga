// v0.95.654 · verify every bed path restores the BLUE ◆ SPECIAL meter.
const fs = require('fs');
const src = fs.readFileSync('/tmp/all.js', 'utf8');
const noop = () => {};
global.setInterval = () => 0;
const pending = [];
global.setTimeout = (f, ms) => { pending.push({ f, ms: ms || 0 }); return pending.length; };
global.clearInterval = noop; global.clearTimeout = noop;
const CTX = new Proxy({}, { get: () => () => ({ addColorStop: noop, width: 0, height: 0, data: [] }) });
const el = () => ({ style:{}, dataset:{}, classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},
  width:960, height:540, value:'', textContent:'', innerHTML:'', children:[], childNodes:[],
  getContext:()=>CTX, appendChild:noop, removeChild:noop, addEventListener:noop, removeEventListener:noop,
  setAttribute:noop, getAttribute:()=>null, focus:noop, remove:noop,
  querySelector:()=>el(), querySelectorAll:()=>[], getBoundingClientRect:()=>({left:0,top:0,width:960,height:540}) });
global.addEventListener = noop; global.removeEventListener = noop;
// dreamVid must be ABSENT (that selects playDreamVideo's synchronous path);
// everything else must exist or the game script fails to boot.
global.document = { getElementById:(id)=> (id === 'dreamVid' ? null : el()), querySelector:()=>el(), querySelectorAll:()=>[],
  createElement:()=>el(), addEventListener:noop, body:el(), documentElement:el(), head:el(),
  hidden:false, visibilityState:'visible' };
global.window = global;
let STORE = {};
global.localStorage = { getItem:k=>STORE[k]??null, setItem:(k,v)=>{STORE[k]=String(v)}, removeItem:k=>{delete STORE[k]} };
global.Audio = function(){ return { play:()=>Promise.resolve(), pause:noop, addEventListener:noop, cloneNode(){return this} }; };
global.Image = function(){ return { addEventListener:noop, complete:false, naturalWidth:0, src:'' }; };
global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = noop;
global.matchMedia = () => ({ matches:false, addEventListener:noop, addListener:noop });
global.navigator = { userAgent:'node', getGamepads:()=>[], maxTouchPoints:0 };
global.performance = { now: () => Date.now() };
global.getComputedStyle = () => ({ getPropertyValue: () => '' });

try {
  new Function(src + ';globalThis.__C={player,game,restoreRizerOnRest,rizerHpNeedsRest,' +
    'rizerMetersNeedRest,sleepInBed,playDreamVideo,rizerStatModel,createZyrex};')();
} catch (e) { console.log('❌ eval', e.message.split('\n')[0]); process.exit(1); }
const C = globalThis.__C;
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) fails++; };
const flush = () => { let n = 0; while (pending.length && n++ < 20){ const q = pending.splice(0); q.sort((a,b)=>a.ms-b.ms); q.forEach(t => { try { t.f(); } catch(_){} }); } };
const P = C.player;
const setup = (o = {}) => {
  P.hpMax = 100; P.maxHp = 100; P.astralMax = 100; P.diamondMax = 100;
  P.hp = o.hp != null ? o.hp : 100;
  P.astral = o.astral != null ? o.astral : 100;
  P.diamond = o.diamond != null ? o.diamond : 100;
  P.party = o.party || [];
  pending.length = 0;
};
const show = (tag) => console.log(`     ${tag.padEnd(14)} HP ${String(P.hp).padStart(3)}/${P.hpMax}   ` +
  `ϟ ENERGY ${String(P.astral).padStart(3)}/${P.astralMax}   ◆ SPECIAL ${String(P.diamond).padStart(3)}/${P.diamondMax}`);

console.log('\n1 · WHICH BAR IS BLUE\n');
console.log('     The canvas RHUD comment reads "SPC at max diamond · CONSTANT blue pulse",');
console.log('     the SPECIAL readout paints #83ddff and the ZyPhone bar uses a #4fb3ff');
console.log('     gradient — so BLUE = ◆ SPECIAL = player.diamond.\n');
ok(/SPC at max diamond · CONSTANT blue pulse/.test(src), 'blue meter identified as ◆ SPECIAL (player.diamond)');

console.log('\n2 · ★ DEATH → WAKE IN BED · the reported case\n');
setup({ hp: 0, astral: 12, diamond: 0 });
show('after death');
C.playDreamVideo([], { wakeInRoom: true, fromDeath: true });   // no <video> element -> sync path
flush();
show('on waking');
ok(P.diamond === P.diamondMax, `◆ SPECIAL restored to ${P.diamond}/${P.diamondMax}  ← the fix`);
ok(P.hp === P.hpMax, 'HP restored');
ok(P.astral === P.astralMax, 'ϟ ENERGY restored');

console.log('\n3 · PARTY ZYREX still revive on the bed path\n');
setup({ hp: 0, diamond: 0, party: [{ hp: 0, maxHp: 80 }, { hp: 25, maxHp: 60 }] });
C.playDreamVideo(P.party, { wakeInRoom: true, fromDeath: true });
flush();
ok(P.party.every(z => z.hp === z.maxHp), 'KO\'d party Zyrex back to full (per the revive rule)');
ok(P.diamond === 100, '...and SPECIAL still refilled alongside them');

console.log('\n4 · SLEEPING WITH FULL HP but a drained blue bar\n');
setup({ hp: 100, astral: 100, diamond: 5 });
show('before nap');
ok(C.rizerHpNeedsRest() === false, 'HP is full — so this must NOT trigger the 7s dream video');
ok(C.rizerMetersNeedRest() === true, 'but the meters DO need rest — the quick nap should fire');
C.sleepInBed();
flush();
show('after nap');
ok(P.diamond === 100, `◆ SPECIAL refilled by a plain nap (${P.diamond}/100)`);

console.log('\n5 · REGRESSION · the hpMax/maxHp alias bug\n');
console.log('     Old test: `player.hp < (player.maxHp || player.hp)`.');
console.log('     With maxHp unset that reduces to `hp < hp` — always false — so the');
console.log('     bed silently refused to heal.\n');
setup({ hp: 30 });
delete P.maxHp;                                  // simulate the alias going missing
const legacy = (P.hp != null) && (P.hp < (P.maxHp || P.hp));
ok(legacy === false, 'legacy expression evaluates FALSE at 30/100 HP — that was the bug');
ok(C.rizerHpNeedsRest() === true, 'rizerHpNeedsRest() correctly reports TRUE at 30/100');
C.restoreRizerOnRest();
ok(P.maxHp === P.hpMax && P.hpMax === 100, 'restore re-syncs the hpMax/maxHp alias pair');

console.log('\n6 · IDEMPOTENT · resting at full changes nothing\n');
setup({});
const b = C.restoreRizerOnRest();
ok(P.hp === 100 && P.astral === 100 && P.diamond === 100, 'all three stay pinned at max');
ok(b.diamond === 100, 'the returned "before" snapshot reports it was already full');

console.log('\n7 · SINGLE PATH · every bed route calls the same restore\n');
const calls = (src.match(/restoreRizerOnRest\(\)/g) || []).length;
ok(calls >= 4, `${calls} call sites route through restoreRizerOnRest()`);
ok(!/if \(player\.hp != null && player\.maxHp\) player\.hp = player\.maxHp;/.test(src),
   'no surviving copies of the old inline HP-only restore');

console.log(fails ? `\n❌ ${fails} failure(s)` : '\n✅ ALL CHECKS PASS');
process.exit(0);
