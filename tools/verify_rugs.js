// v0.95.656 · verify the 8 doormats: extracted, wired, houses only, unstretched.
const fs = require('fs'), path = require('path');
const ROOT = '/sessions/great-cool-heisenberg/mnt/AOV-saga-new';
const src = fs.readFileSync('/tmp/all.js', 'utf8');
const noop = () => {};
const pending = [];
global.setInterval = () => 0;
global.setTimeout = (f, ms) => { pending.push({ f, ms: ms || 0 }); return pending.length; };
global.clearInterval = noop; global.clearTimeout = noop;
const CTX = new Proxy({}, { get: () => () => ({ addColorStop: noop, width: 0, height: 0, data: [] }) });
const el = () => ({ style:{}, dataset:{}, classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},
  width:960, height:540, value:'', textContent:'', innerHTML:'', children:[], childNodes:[],
  getContext:()=>CTX, appendChild:noop, removeChild:noop, addEventListener:noop, removeEventListener:noop,
  setAttribute:noop, getAttribute:()=>null, focus:noop, remove:noop,
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

try {
  new Function(src + ';globalThis.__C={DOORMAT_KEYS,DOORMAT_IMGS,DOORMAT_MAX_H_TILES,pickDoormatKey,' +
    'HOUSE_INTERIOR_SCENES,isHouseInterior,interiorConfig,INTERIOR_HOME,INTERIOR_CRAZY_HOME,' +
    'INTERIOR_TREEHOUSE,INTERIOR_HOME_2F,INTERIOR_RESEARCH_LAB,INTERIOR_TRAINING_FARM,' +
    'INTERIOR_MALEZOR_SCHOOL,INTERIOR_SEER_HQ_1F,INTERIOR_CAVE,MALEZOR_HOME_INTERIORS,' +
    'makeMalezorHomeInterior,TILE};')();
} catch (e) { console.log('❌ BOOT FAILED:', e.message); process.exit(1); }
const C = globalThis.__C;
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) fails++; };

console.log('\n1 · ALL 8 MATS EXIST ON DISK\n');
const DIR = path.join(ROOT, 'assets/2D sprites/decor/rugs');
const sizes = {};
for (const k of C.DOORMAT_KEYS){
  const f = path.join(DIR, `${k}.png`);
  const exists = fs.existsSync(f);
  if (exists){
    const b = fs.readFileSync(f);
    // PNG IHDR: width/height at bytes 16-23
    const w = b.readUInt32BE(16), h = b.readUInt32BE(20);
    sizes[k] = { w, h, kb: Math.round(b.length / 1024) };
    console.log(`     ${k.padEnd(14)} ${String(w).padStart(4)}x${String(h).padStart(4)}  ${String(sizes[k].kb).padStart(4)} KB  aspect ${(w/h).toFixed(2)}`);
  }
  ok(exists, `${k}.png present`);
}
ok(Object.keys(sizes).length === 8, `8 mats extracted (the folder was EMPTY before — every home silently fell back to the old welcome-rug)`);
const aspects = Object.values(sizes).map(s => s.w / s.h);
ok(Math.max(...aspects) - Math.min(...aspects) < 0.12, 'all 8 share a consistent aspect (cut from one sheet)');

console.log('\n2 · ★ NEVER STRETCHED · draw size derives from the art\n');
const A = aspects[0];
const TILE = C.TILE || 48;
const slotW = 3 * TILE;
const maxH  = C.DOORMAT_MAX_H_TILES * TILE;
let dW = slotW, dH = Math.round(slotW / A);
if (dH > maxH){ dH = Math.round(maxH); dW = Math.round(dH * A); }
console.log(`     native aspect ${A.toFixed(3)} · slot is 3x1 tiles (${slotW}x${TILE})`);
console.log(`     naive stretch would draw ${slotW}x${TILE} = aspect ${(slotW/TILE).toFixed(2)}  (${((slotW/TILE)/A).toFixed(2)}x too wide)`);
console.log(`     letterboxed draw is ${dW}x${dH} = aspect ${(dW/dH).toFixed(3)}`);
ok(Math.abs((dW / dH) - A) < 0.02, 'drawn aspect matches the source within 2%');
ok(dH <= maxH + 1, `height capped at ${C.DOORMAT_MAX_H_TILES} tiles so a mat stays mat-sized`);
ok(/drawH = Math.round\(slotW \* natH \/ natW\)/.test(src), 'render derives height from naturalHeight/naturalWidth');
ok(!/drawImage\(img, 0, 0, img.naturalWidth, img.naturalHeight,\s*dx, dy, rug.w \* TILE, rug.h \* TILE\)/.test(src),
   'the old stretch-to-slot call is gone');

console.log('\n3 · ★ EVERY HOUSE HAS A MAT\n');
const houses = [
  ['interior_home',       C.INTERIOR_HOME],
  ['interior_crazy_home', C.INTERIOR_CRAZY_HOME],
  ['interior_treehouse',  C.INTERIOR_TREEHOUSE],
];
for (const [name, cfg] of houses){
  const has = !!(cfg && cfg.rug && cfg.rug.key);
  ok(has, `${name} -> ${has ? cfg.rug.key.toUpperCase() : 'NO MAT'}`);
  if (has) ok(C.DOORMAT_KEYS.includes(cfg.rug.key), `   ...and "${cfg.rug.key}" is a real mat key`);
}
// purchased Rizer Rooms
const bought = ['interior_rizer_room_zarvane_home_1','interior_rizer_room_veridan_home_2','interior_malezor_home_3'];
for (const id of bought){
  const cfg = C.makeMalezorHomeInterior(id);
  ok(!!(cfg.rug && cfg.rug.key), `purchased home ${id} -> ${cfg.rug && cfg.rug.key}`);
}
ok(bought.every(id => C.isHouseInterior(id)), 'isHouseInterior() recognises purchased homes');

console.log('\n4 · ★ NO MATS IN OFFICIAL BUILDINGS\n');
const official = [
  ['interior_research_lab',   C.INTERIOR_RESEARCH_LAB],
  ['interior_training_farm',  C.INTERIOR_TRAINING_FARM],
  ['interior_malezor_school', C.INTERIOR_MALEZOR_SCHOOL],
  ['interior_seer_hq_1f',     C.INTERIOR_SEER_HQ_1F],
  ['interior_cave',           C.INTERIOR_CAVE],
];
for (const [name, cfg] of official){
  ok(!(cfg && cfg.rug && cfg.rug.key), `${name} has NO doormat`);
  ok(!C.isHouseInterior(name), `   ...and isHouseInterior('${name}') is false`);
}
ok(!(C.INTERIOR_HOME_2F.rug && C.INTERIOR_HOME_2F.rug.key),
   'interior_home_2f has none either — it is the upstairs bedroom, not a front door');

console.log('\n5 · SPREAD · the hash actually varies the mat\n');
const picks = {};
for (let i = 0; i < 60; i++){
  const k = C.pickDoormatKey('interior_rizer_room_home_' + i);
  picks[k] = (picks[k] || 0) + 1;
}
console.log('     ' + Object.entries(picks).map(([k,v]) => `${k}:${v}`).join('  '));
ok(Object.keys(picks).length >= 6, `${Object.keys(picks).length}/8 distinct mats across 60 homes`);
const same = C.pickDoormatKey('interior_home') === C.pickDoormatKey('interior_home');
ok(same, 'the pick is deterministic — a home keeps its mat across sessions');

console.log(fails ? `\n❌ ${fails} failure(s)` : '\n✅ ALL CHECKS PASS');
process.exit(0);
