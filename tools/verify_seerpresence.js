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

const EXPORT = ';globalThis.__C={SEER_GRUNT_ART,NPCS,SEER_HQ_NETWORK,ZYRAXIS_DISTRICT_BY_ID,game,isWorldLandTile,isWorldBorderTile,_propBlocked,worldDistrictAt,settleSeerPatrols,buildSeerHqGuardPacks};';
try {
  new Function(src + EXPORT)();
} catch(e){ console.log('boot error:', e.message.slice(0,200)); }
const fs2=require('fs');
const src2=fs2.readFileSync('/tmp/all.js','utf8');
let f=0; const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const C=globalThis.__C;
// v0.95.735 · these used to hardcode 256 for Grunt B. The redelivered idle
// sheet measures 255, so the suite failed on a 1px art change while the
// property it cares about — scale comes from the STANDING pose — was fine.
// Read the yardstick from the live table instead of restating it.
const A_REF=C.SEER_GRUNT_ART.A.standBh, B_REF=C.SEER_GRUNT_ART.B.standBh;
ok(!!C,'script evaluated and exported probes');
if(!C){ console.log('\n❌ cannot continue'); process.exit(0); }
C.game.scene='overworld';

console.log('\n1 · ★ FORMATION · 4 posted + 4 patrolling in every district\n');
const posted=C.NPCS.filter(n=>n&&n._seerPosted), patrol=C.NPCS.filter(n=>n&&n._seerPatrol);
ok(posted.length===40, `40 posted grunts · 4 at each of the 10 HQ doors (${posted.length})`);
ok(patrol.length===40, `40 patrolling grunts · 4 per district (${patrol.length})`);
let short=[];
for(const H of C.SEER_HQ_NETWORK){
  const p=posted.filter(n=>n._seerPosted===H.dist).length;
  const r=patrol.filter(n=>n._seerPatrol===H.dist).length;
  if(p!==4||r!==4) short.push(`${H.dist} ${p}/${r}`);
}
for(const s of short) console.log('     '+s);
ok(short.length===0, `every district has exactly 4 and 4 (${short.length} wrong)`);
// `const SPOTS` is a generic name used by six unrelated blocks (seer chest,
// Mori, Daemon...). Asserting on it could never pass and was not testing what
// it claimed. The thing that actually had to go is the hand-placed GRUNT list,
// whose entries looked like { x: 89, y: 157, v:'A' } and produced ids of the
// form seer_grunt_a_N.
ok(!/\{ x:\s*\d+, y:\s*\d+, v:'[AB]' \}/.test(src2),
   'the hand-placed grunt spot list is gone — one generated system, not two');
ok(!C.NPCS.some(n=>n&&/^seer_grunt_[ab]_/.test(n.id||'')),
   '   and no NPC still carries an old seer_grunt_a_/b_ id');
ok(/function buildSeerHqGuardPacks\(\)\{ return 0; \}/.test(src2),
   'the old 5-wide guard ring is retired to a no-op, with its call site left intact');
ok(C.buildSeerHqGuardPacks()===0, '   and calling it really is harmless');

// ★ The harness stubs setTimeout to a no-op, so rp7b's DEFERRED boot tick —
// where the flora prune and the patrol settle both live — never executes here.
// Two assertions below failed for that reason alone and would have pushed me
// to "fix" placement code that was already correct. Prove the wiring exists in
// source, then run the pass by hand so the terrain check means something.
ok(/try \{ settleSeerPatrols\(\); \} catch/.test(src2),
   'settleSeerPatrols() is wired into the deferred boot tick (static check —');
console.log('     the harness cannot run it: setTimeout is stubbed dead)');
const nudged = C.settleSeerPatrols();
console.log(`     ran it by hand · ${nudged} post(s) nudged off blocked ground\n`);

console.log('\n2 · ★★ EVERY GRUNT STANDS ON GROUND HE CAN STAND ON\n');
console.log('     NOTE: walkable() scans NPCS, so a grunt makes his OWN tile');
console.log('     unwalkable — asking walkable(grunt.x,grunt.y) can never return');
console.log('     true and reports a flat 100% failure. The question has to be');
console.log('     about the TERRAIN.\n');
function bad(x,y){
  if(!C.isWorldLandTile(x,y)) return 'water';
  if(C.isWorldBorderTile(x,y)) return 'border';
  if(C._propBlocked && C._propBlocked.has(x+','+y)) return 'inside a prop';
  return null;
}
for(const [label,list] of [['posted',posted],['patrol',patrol]]){
  const bads=list.filter(n=>bad(n.tileX,n.tileY));
  for(const n of bads) console.log(`     ${n.id} at (${n.tileX},${n.tileY}) — ${bad(n.tileX,n.tileY)}`);
  ok(bads.length===0, `${list.length} ${label} grunts all on standable ground (${bads.length} bad)`);
}
const off=patrol.filter(n=>C.worldDistrictAt(n.tileX,n.tileY)!==n._seerPatrol);
ok(off.length===0, `no patroller has drifted outside its own district (${off.length})`);
const seen={}; let dup=0;
for(const n of posted.concat(patrol)){ const k=n.tileX+','+n.tileY; if(seen[k])dup++; seen[k]=1; }
ok(dup===0, `no two grunts share a tile (${dup})`);
// idempotence: a second pass must move nobody, or the nudge is oscillating
const again=C.settleSeerPatrols();
ok(again===0, `the settle is idempotent — a second pass moves nobody (${again})`);

console.log('\n3 · ★★ POSTED HOLD · PATROLS HUNT\n');
const P=posted[0], R=patrol[0];
ok(P.wanderRadius===0, `posted are planted · wanderRadius ${P.wanderRadius}`);
ok(P._leashR<=6, `posted keep a short leash so the door is never left open · ${P._leashR}`);
ok(P._chaseSpeed===1.0, `posted do not sprint · ${P._chaseSpeed}x`);
ok(R.wanderRadius>=6, `patrols roam · wanderRadius ${R.wanderRadius}`);
ok(R.detectR>=12, `patrols see far · ${R.detectR} tiles`);
ok(R._chaseSpeed>=1.4, `patrols sprint faster than a walking player · ${R._chaseSpeed}x`);
ok(R._leashR>=25, `and follow well past their post · ${R._leashR} tiles`);
ok(R.detectR>P.detectR, `a patroller notices you sooner than a doorman (${R.detectR} vs ${P.detectR})`);
ok(/_chaseSpeed \|\| 1/.test(src2), 'drawNPC/tick honours _chaseSpeed');
ok(/if \(n\._leashR != null\)/.test(src2), 'and honours _leashR');
ok(/stepNPCTo\(n, n\.tileX \+ v\.dx, n\.tileY \+ v\.dy, dir\);\n        n\.moveCd = stepCd;\n        return;/.test(src2),
   'a leashed grunt walks BACK to his post rather than freezing mid-field');

console.log('\n4 · ★★ FOUR SHEETS · idle / walk / run / attack\n');
ok(/const useAtk/.test(src2), 'drawNPC has an attack bank');
ok(/const useRun/.test(src2), 'drawNPC has a RUN bank · played when moving AND hunting');
ok(/n\._chasing = \(manh <= detectR\)/.test(src2),
   '_chasing is set from the same test that decides to close — so walking always');
console.log('     means patrolling and running always means you have been seen');
ok(/kind === 'run' \? SEER_GRUNT_ART\[v\]\.walk/.test(src2),
   'a missing RUN falls back to WALK, not to the attack pose');
ok(/const footBank/.test(src2), 'and picks foot baselines PER SHEET');
console.log('     A crouched attack pose plants at a different cell-y than a');
console.log('     standing idle, so one foot table cannot serve all four.\n');
let missing=[];
for(const n of posted.concat(patrol)){
  for(const [k,sh] of [['idle',n.sheet],['walk',n.walkSheet],['run',n.runSheet],['attack',n.attackSheet]])
    if(!sh || !sh.src) missing.push(n.id+' '+k);
}
for(const m of missing.slice(0,6)) console.log('     '+m);
ok(missing.length===0, `all 80 grunts have all FOUR banks bound (${missing.length} unbound)`);
ok(/if \(n\.src\) n\.sheet\.src = n\.src;/.test(src2),
   'the NPCS loader no longer blanks sheet.src for NPCs that carry a pre-built Image');
console.log('     (that unguarded line silently wiped the idle sheet the moment');
console.log('      it was wired — walk and attack survived, so it looked fine)');
for(const [vlabel,vref] of [['A',A_REF],['B',B_REF]]){
  const Bx=(posted.concat(patrol)).find(n=>n.scaleRefBh===vref);
  if(!Bx) continue;
  const srcs=[Bx.sheet.src,Bx.walkSheet.src,Bx.runSheet.src,Bx.attackSheet.src];
  console.log(`     Grunt ${vlabel} banks:`);
  for(const [k,v] of [['idle',srcs[0]],['walk',srcs[1]],['run',srcs[2]],['attack',srcs[3]]])
    console.log(`       ${k.padEnd(7)} ${String(v).split('/').pop()}`);
  ok(new Set(srcs).size===4, `Grunt ${vlabel} has four DISTINCT sheets (${new Set(srcs).size}/4)`);
  const fb=[Bx.footBaselines,Bx.walkFootBaselines,Bx.runFootBaselines,Bx.attackFootBaselines];
  ok(fb.every(t=>Array.isArray(t)&&t.length===4), '   and a foot table for each');
  ok(new Set(fb.map(t=>JSON.stringify(t))).size===4,
     '   all four foot tables DIFFER — a shared table would float or sink a pose');
  // every bank must carry the variant's own name — a fallback would show the
  // wrong file here and otherwise look completely fine in game
  ok(srcs.every(x=>new RegExp('grunt-'+vlabel.toLowerCase()+'-').test(String(x))),
     `   and every bank is a Grunt ${vlabel} sheet, not a fallback`);
}
const B=posted.find(n=>n.scaleRefBh===B_REF);
ok(!!B && /b-idle/.test(B.sheet.src), 'Grunt B really is showing the IDLE sheet, not the attack sheet');
ok(!!B && JSON.stringify(B.bboxes)===JSON.stringify(C.SEER_GRUNT_ART.B.idle.bboxes),
   '   and the bound bbox table IS the idle table (compared to the source of truth, not to a magic y value)');
// which sheets are still pending
// Derive PENDING from the sheets actually bound on the live NPCs, not from
// regexes over source text. The regex version kept reporting "A walk, A run"
// as pending for several minutes after both had been wired and were passing
// their own assertions two lines above — a status line that contradicts the
// tests beside it is worse than no status line.
const pend=[];
for(const [vlabel,vref] of [['A',A_REF],['B',B_REF]]){
  const g=(posted.concat(patrol)).find(n=>n.scaleRefBh===vref);
  if(!g) continue;
  for(const [k,sh] of [['idle',g.sheet],['walk',g.walkSheet],['run',g.runSheet],['attack',g.attackSheet]]){
    const want='grunt-'+vlabel.toLowerCase()+'-'+k;
    if(!new RegExp(want).test(String(sh && sh.src))) pend.push(vlabel+' '+k);
  }
}
console.log(`\n     PENDING sheets (falling back): ${pend.join(', ')||'none — all 8 delivered'}`);
ok(pend.length===0, `every bank on both variants is its own sheet (${pend.length} still falling back)`);

console.log('\n5 · ★ SCALE IS TAKEN FROM THE STANDING POSE\n');
console.log(`     B's idle stands ${B_REF}px; his attack pose is a 227px crouch.`);
console.log('     Scaling off the attack sheet made him GROW the instant he');
console.log('     stopped swinging. One scale per character, from the pose he');
console.log('     actually stands in.\n');
ok(B && B.scaleRefBh===B_REF, `Grunt B scaleRefBh is the idle standing ${B_REF} (${B&&B.scaleRefBh})`);
const A=patrol.find(n=>n.scaleRefBh===A_REF);
ok(!!A, `Grunt A on ${A_REF} — her idle standing height`);
const bTiles=B_REF*((48*2)/B_REF*1.15)/48, aTiles=A_REF*((48*2)/A_REF*1.075)/48;
console.log(`     standing height · A ${aTiles.toFixed(2)} tiles · B ${bTiles.toFixed(2)} tiles · Mori 2.00`);
ok(bTiles>aTiles, `the Elite stands taller than the regular (${bTiles.toFixed(2)} vs ${aTiles.toFixed(2)})`);

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
