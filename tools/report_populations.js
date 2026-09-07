#!/usr/bin/env node
/* report_populations.js · the Zyraxis wild census, generated from the BOOTED
 * world rather than from the pin table — so it reports what a player would
 * actually walk into, including anything the placement sanitizer moved.
 * ★ Mealux is DELIBERATELY OMITTED ([[aov-no-easter-egg-spoilers]]): it is one
 *   per district, re-rolled every playthrough, so a coordinate for it is both a
 *   spoiler and a lie. */
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
const src = fs.readFileSync('/tmp/all.js', 'utf8');
const noop = () => {}; const _Q = [];
global.setInterval = () => 0; global.setTimeout = fn => { _Q.push(fn); return 0; };
global.clearInterval = noop; global.clearTimeout = noop;
const CTX = new Proxy({}, { get: () => () => ({ addColorStop: noop, width: 0, height: 0, data: [] }) });
const el = () => ({ style:{}, dataset:{}, classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},
  width:960, height:540, value:'', textContent:'', innerHTML:'', children:[], childNodes:[],
  getContext:()=>CTX, appendChild:noop, removeChild:noop, addEventListener:noop, removeEventListener:noop,
  setAttribute:noop, getAttribute:()=>null, focus:noop, remove:noop, play:()=>Promise.resolve(),
  pause:noop, querySelector:()=>el(), querySelectorAll:()=>[], getBoundingClientRect:()=>({left:0,top:0,width:960,height:540}) });
global.addEventListener = noop; global.removeEventListener = noop;
global.document = { getElementById:()=>el(), querySelector:()=>el(), querySelectorAll:()=>[],
  createElement:()=>el(), addEventListener:noop, body:el(), documentElement:el(), head:el(),
  hidden:false, visibilityState:'visible' };
global.window = global; global.localStorage = { getItem:()=>null, setItem:noop, removeItem:noop };
global.Audio = function(){ return { play:()=>Promise.resolve(), pause:noop, addEventListener:noop, cloneNode(){return this} }; };
global.Image = function(){ return { addEventListener:noop, complete:true, naturalWidth:1254, src:'' }; };
global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = noop;
global.matchMedia = () => ({ matches:false, addEventListener:noop, addListener:noop });
global.navigator = { userAgent:'node', getGamepads:()=>[], maxTouchPoints:0 };
global.performance = { now: () => 1000 }; global.getComputedStyle = () => ({ getPropertyValue: () => '' });
const LOG = console.log; console.log = () => {};
new Function(src + ';globalThis.__C={WILD_ZYREX,SPECIES,worldDistrictAt,ZYRAXIS_DISTRICTS,DISTRICT_ANCHORS};')();
let n = 0; while (_Q.length && n < 50) { const f = _Q.shift(); n++; try { f(); } catch (_) {} }
console.log = LOG;
const C = globalThis.__C;

const OMIT = new Set(['mealux']);
const DIST = C.ZYRAXIS_DISTRICTS.map(d => d.id);
const by = {};
for (const w of C.WILD_ZYREX) {
  if (!w || w.tileX == null || w._gone) continue;
  const d = C.worldDistrictAt(w.tileX, w.tileY) || '(outside)';
  (by[d] = by[d] || []).push(w);
}
const L = [];
L.push('# ZYREX POPULATIONS · ZYRAXIS OVERWORLD');
L.push('');
L.push('Generated from the booted world at BETA V7.5.16 — this is what is actually');
L.push('standing there, not what the pin table says. Coordinates are overworld tiles.');
L.push('');
L.push('★ One species is omitted on purpose: MEALUX is a hidden remnant trace, one per');
L.push('district, re-rolled every playthrough. A coordinate for it would be both a');
L.push('spoiler and a lie.');
L.push('');
L.push('---');
L.push('');
L.push('## THE ANCHOR LAW');
L.push('');
L.push('Every district names one NATIVE species that is guaranteed to be there. A bonded');
L.push('wild is marked gone forever, so without this every district is a depleting');
L.push('resource — catch Baelgor\'s four Veridrax and Baelgor has none again, permanently.');
L.push('If an anchor drops below its floor the ground grows it back, one head per 8 real');
L.push('minutes, scattered near its native tile. Anchors are all T3 or lower so there is');
L.push('always something present you can actually bond with at the band you arrive in.');
L.push('');
L.push('| District | Anchor | Tier | Native tile | Floor | Why this one |');
L.push('|---|---|:-:|:-:|:-:|---|');
for (const d of DIST) {
  const A = C.DISTRICT_ANCHORS[d]; if (!A) continue;
  const S = C.SPECIES[A.sp] || {};
  L.push(`| ${d} | **${S.name || A.sp}** | T${S.tier || '?'} | \`(${A.at[0]}, ${A.at[1]})\` | ${A.floor} | ${A.why} |`);
}
L.push('');
L.push('---');
L.push('');
L.push('## FULL CENSUS');
let tot = 0;
for (const d of DIST) {
  const a = (by[d] || []).filter(w => !OMIT.has(w.speciesId));
  tot += a.length;
  const sp = {};
  a.forEach(w => (sp[w.speciesId] = sp[w.speciesId] || []).push(w));
  const A = C.DISTRICT_ANCHORS[d];
  L.push('');
  L.push(`### ${d.toUpperCase()} — ${a.length} wilds · ${Object.keys(sp).length} species`);
  L.push('');
  L.push('| Species | Tier | # | Coordinates |');
  L.push('|---|:-:|:-:|---|');
  for (const [s, ws] of Object.entries(sp).sort((x, y) => y[1].length - x[1].length)) {
    const S = C.SPECIES[s] || {};
    const star = (A && A.sp === s) ? ' ⚓' : '';
    L.push(`| ${S.name || s}${star} | T${S.tier || '?'} | ${ws.length} | ${ws.map(w => `(${w.tileX},${w.tileY})`).join(' ')} |`);
  }
}
L.push('');
L.push('---');
L.push('');
L.push(`**${tot} wilds across ten districts** (Mealux excluded). ⚓ marks the district anchor.`);
fs.writeFileSync(path.join(ROOT, 'data/ZYREX_POPULATIONS.md'), L.join('\n') + '\n');
LOG('wrote data/ZYREX_POPULATIONS.md · ' + tot + ' wilds');
