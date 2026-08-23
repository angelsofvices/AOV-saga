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
  ';globalThis.__C={player,game,NPCS,countGems,spendGems,gemSpendOrder,GEM_VALUES,' +
  'ZURELEA_VIAL_GEMS,INVENTORY_META};')();
} catch(e){ console.log('BOOT FAILED:', e.message); process.exit(1); }
const C = globalThis.__C, P = C.player;
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const raw = require('fs').readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html','utf8');
const noC = raw.replace(/\/\/[^\n]*/g, '');
const zur = C.NPCS.find(n => n && n.id === 'zurelea');

console.log('\n1 · ★★ 300 GEMS BUYS THE VIAL, AND THE VIAL OPENS THE SHOP\n');
console.log('     Creator: "zurelea give u the rubyvial when u find her 300 gems');
console.log('     at first. this unlocks potion shop"\n');
console.log('     This INVERTS v0.95.632, where she sent you into the Seer HQ to');
console.log('     fetch it. Now she already knows where it is and what it costs.\n');
ok(!!zur, 'Zurelea exists in Malezor');
ok(C.ZURELEA_VIAL_GEMS === 300, `the price is ${C.ZURELEA_VIAL_GEMS} gems`);
ok(/countGems\(\) >= ZURELEA_VIAL_GEMS/.test(noC),
   'the gate reads countGems() — the same weighted total the HUD gem pill shows,');
console.log('     so "300" on screen means 300 to her, with no arithmetic asked');
console.log('     of the player.\n');
ok(/player\.items\.ruby_vial = \(player\.items\.ruby_vial \|\| 0\) \+ 1;[\s\S]{0,120}player\.zureleaShopOpen = true/.test(noC),
   'paying hands over the Ruby Vial AND opens the shop in one beat');

console.log('\n2 · ★★ LIVE TRANSACTION\n');
P.items = { gem_red: 15 };                        // 15 x 20 = exactly 300
console.log(`     wallet 15 red (20 each) = ${C.countGems()}`);
let paid = C.spendGems(300);
ok(paid === 300, `an exact-change wallet pays exactly ${paid}`);
ok(C.countGems() === 0, 'and is emptied to 0, with no 0-count clutter left behind');
ok(!('gem_red' in P.items), '  the exhausted key is deleted, not left at zero');

P.items = { gem_black: 2, gem_red: 5 };           // 320 + 100 = 420, no exact 300
console.log(`\n     wallet 2 black(160) + 5 red(20) = ${C.countGems()}`);
paid = C.spendGems(300);
console.log(`     spendGems(300) actually took ${paid}`);
ok(paid === 420, 'a wallet with no small change overshoots — and SAYS 420, not 300');
console.log('     There is no combination of {20,20,20,20,20,160,160} equal to');
console.log('     300, so 420 is genuinely unavoidable here. What matters is');
console.log('     that the number reported is the number taken: a shop that');
console.log('     quietly charges 420 and prints "300" is lying to the player.\n');
ok(/const _paid = spendGems\(ZURELEA_VIAL_GEMS\)/.test(noC) && /paid \$\{_paid\} gems/.test(raw),
   'Zurelea\'s toast reports the ACTUAL amount taken');

P.items = { gem_red: 1 };
const before = C.countGems();
paid = C.spendGems(300);
ok(paid === 0, `an unaffordable purchase returns ${paid}`);
ok(C.countGems() === before, `and takes NOTHING — wallet still ${C.countGems()}, never partially charged`);

console.log('\n3 · ★★ ONE GEM-SPENDING PATH · AND IT WAS WRONG TWICE\n');
console.log('     spendGems did not exist. The logic was hand-inlined in the');
console.log('     sword and Rubypaw repair handlers, and BOTH copies shared two');
console.log('     bugs — with different variable names, which is why nobody');
console.log('     noticed they were the same code:\n');
console.log('       1 · spendOrder ran yellow,green,blue,red under a comment');
console.log('           saying "cheapest first". In GEM_VALUES yellow is 80 and');
console.log('           red is 20 — that order is DESCENDING. It burned your');
console.log('           best gems first and kept the junk.');
console.log('       2 · `const have = player.items[k] || 0` was captured once');
console.log('           and never decremented, so the loop condition never');
console.log('           changed. It terminated only on the inner break.\n');
ok(/function spendGems\(/.test(noC), 'spendGems() exists');
const sites = (noC.match(/spendGems\(/g) || []).length - 1;   // minus the declaration
ok(sites >= 3, `${sites} call sites share it (sword repair, Rubypaw repair, Zurelea)`);
ok(!/const spendOrder = \[/.test(noC) && !/const order = \['gem_yellow'/.test(noC),
   'neither inline copy survives');
ok(!/const have = player\.items\[k\] \|\| 0;/.test(noC), 'and the frozen-loop-variable bug is gone');
const orderNow = C.gemSpendOrder();
const vals = orderNow.map(k => C.GEM_VALUES[k]);
console.log('     spend order now: ' + orderNow.map((k,i) => `${k.replace('gem_','')}(${vals[i]})`).join(' '));
let asc = 0;
for (let i = 1; i < vals.length; i++) if (vals[i] < vals[i-1]) asc++;
console.log('');
ok(asc === 0, 'genuinely ascending by value now — cheapest really is first');
console.log('     This matters beyond tidiness: gems are also the ◆ diamond');
console.log('     source (GEM_DIAMOND_VALUES, a separate table for a separate');
console.log('     purpose), so paying a 20-gem debt with a black gem threw away');
console.log('     1,280 diamond.\n');

console.log('4 · ★ THE SEER HQ ROUTE STILL WORKS\n');
ok(/player\.items\.ruby_vial \|\| 0\) > 0/.test(noC),
   'carrying a Ruby Vial to her still opens the shop, free');
console.log('     Kept deliberately: anyone who raided the Seer HQ before ever');
console.log('     speaking to Zurelea already has one, and deleting that path');
console.log('     would strand them. The 300-gem redemption is the primary');
console.log('     route; the chest is the alternate.\n');
ok(/ZURELEA_VIAL_GEMS/.test(raw.slice(raw.indexOf("ruby_vial:        { label"), raw.indexOf("ruby_vial:        { label") + 700)) ||
   /Zurelea REDEEMS this for 300 gems/.test(raw),
   'and the item note documents both routes rather than the retired one');

console.log(f ? `\n❌ ${f} failure(s)` : '\n✅ ALL CHECKS PASS');
process.exit(0);
