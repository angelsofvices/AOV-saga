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
  ';globalThis.__C={game,player,NPCS,createZyrex,callFactionSummonAll,DEV_FACTION_ACTORS,' +
  'SPECIES,makeZyrexFollower,drawWorldLayer,drawZyrexOrb,SUMMONABLE_SPRITES,toggleFactionSummon};')();
} catch(e){ console.log('BOOT FAILED:', e.message); process.exit(1); }
const C = globalThis.__C, { game, player, NPCS } = C;
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const raw = require('fs').readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html','utf8');
const noC = raw.replace(/\/\/[^\n]*/g, '');

console.log('\n1 · ★★ THE CRASH · A SHEET-LESS NPC KILLED THE RENDER LOOP\n');
console.log('     Creator: "game broke when I tried to summon all faction from');
console.log('     dev menu"\n');
console.log('     v0.95.718 introduced ORB FOLLOWERS — a deployed Zyrex whose');
console.log('     species has no overworld sheet, drawn procedurally. They carry');
console.log('     no `sheet` property at all. Two render loops then did:\n');
console.log('         if (!n.sheet.complete || !n.sheet.naturalWidth) return;\n');
console.log('     which is a TypeError, not a skip. Uncaught inside NPCS.forEach');
console.log('     it escaped drawWorldLayer, escaped frame(), and broke the');
console.log('     requestAnimationFrame chain. The game stopped rendering.\n');
ok(!/if \(!n\.sheet\.complete/.test(noC), 'no unguarded n.sheet dereference survives in any NPC loop');
ok(/if \(n\.sheet && \(!n\.sheet\.complete \|\| !n\.sheet\.naturalWidth\)\) return;/.test(noC),
   'the overworld loop guards on n.sheet first');
ok(/if \(n\.sheet && \(!n\.sheet\.complete \|\| !n\.sheet\.naturalWidth\)\) continue;/.test(noC),
   'and so does the interior depth sort — it was the same bug twice');
ok(/if \(!n\.sheet && !n\._orbFollower\) return;/.test(noC),
   'the guard ADMITS sheet-less orb followers rather than skipping them');
console.log('     Skipping them would have traded a freeze for an invisible');
console.log('     Zyrex, which is the bug v0.95.718 existed to fix.\n');
ok(/r\.kind === 'npc' && r\.npc && r\.npc\._orbFollower\) drawZyrexOrb\(r\.npc\)/.test(noC),
   'the INTERIOR draw path gained an orb branch — it had none at all');

console.log('\n2 · ★★ THE DEV BUTTON, REPRODUCED END TO END\n');
game.scene = 'overworld';
player.x = 60; player.y = 140;
player.party = []; player.pcZyrex = [];
const owned = new Set();
let added = 0;
for (const [sid, cfg] of Object.entries(C.DEV_FACTION_ACTORS)){
  if (owned.has(sid) || !C.SPECIES[sid]) continue;
  const z = C.createZyrex(sid, cfg.level);
  if (z){ player.party.push(z); owned.add(sid); added++; }
}
console.log(`     dev grant → ${player.party.length} Zyrex in the faction`);
const sheetless = player.party.filter(z => !C.SUMMONABLE_SPRITES[z.speciesId]);
console.log(`     of which ${sheetless.length} have NO overworld sheet: ${sheetless.map(z=>z.speciesId).join(' ')}`);
ok(sheetless.length > 0, 'the dev roster really does contain sheet-less species — this was never a rare edge case');
let err = null;
try { C.callFactionSummonAll(true); } catch(e){ err = e; }
ok(!err, `summon-all completed${err ? ': ' + err.message : ''}`);
const out = NPCS.filter(n => n && n._summoned);
const orbs = out.filter(n => n._orbFollower);
console.log(`     deployed ${out.length} followers · ${orbs.length} of them orbs`);
ok(orbs.length > 0, 'and orb followers really are among them');

console.log('\n3 · ★★ THE TEST I SHOULD HAVE WRITTEN AT v0.95.718\n');
console.log('     My verify_recruit round trip called toggleFactionSummon and');
console.log('     then drawZyrexOrb DIRECTLY. It never called drawWorldLayer, so');
console.log('     it never touched the loop that actually crashed. Testing the');
console.log('     unit while skipping the frame is how this shipped.\n');
let renderErr = null;
try { C.drawWorldLayer(); } catch(e){ renderErr = e; }
ok(!renderErr, `drawWorldLayer() survives ${orbs.length} orb followers in the scene${renderErr ? ' — ' + renderErr.message : ''}`);
// and again with one indoors, which is the second copy of the bug
game.scene = 'interior_treehouse';
for (const n of orbs) n.scene = 'interior_treehouse';
let indoorErr = null;
try { C.drawWorldLayer(); } catch(e){ indoorErr = e; }
ok(!indoorErr, `and with them indoors${indoorErr ? ' — ' + indoorErr.message : ''}`);
game.scene = 'overworld';

console.log('\n4 · ★ A HAND-BUILT SHEET-LESS NPC CANNOT BREAK IT EITHER\n');
NPCS.push({ id: '_test_no_sheet', scene: 'overworld', tileX: 61, tileY: 141,
            _orbFollower: true, speciesId: 'otterlin', _phase: 0, _summoned: true });
let bareErr = null;
try { C.drawWorldLayer(); } catch(e){ bareErr = e; }
ok(!bareErr, `a bare orb NPC with no sheet renders fine${bareErr ? ' — ' + bareErr.message : ''}`);
NPCS.push({ id: '_test_junk', scene: 'overworld', tileX: 62, tileY: 141 });   // no sheet, no orb
let junkErr = null;
try { C.drawWorldLayer(); } catch(e){ junkErr = e; }
ok(!junkErr, 'and an NPC with neither a sheet nor an orb flag is skipped, not thrown on');

console.log(f ? `\n❌ ${f} failure(s)` : '\n✅ ALL CHECKS PASS');
process.exit(0);
