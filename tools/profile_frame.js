#!/usr/bin/env node
/* profile_frame.js · where does a frame actually go?
 *
 *   Creator: "why is my game freezing randomly at some gameplay points?"
 *
 * ★ Wraps the functions frame() calls and accumulates real time in each, so
 *   the answer is measured rather than reasoned about. Run after regenerating
 *   /tmp/all.js from rp7b.html.
 */
const fs = require('fs');
const src = fs.readFileSync('/tmp/all.js', 'utf8');

const NAMES = ['tryMove', 'tickProjectiles', 'updateCamera', 'tickFootprints', 'tickNPC',
  'tickStamina', 'tickDreamland', 'tickYaraRegen', 'tickMeditation', 'tickFieldStudy',
  'tickHomecoming', 'tickDistrictAnchors', 'tickOmnirisStillness', 'tickZorynRest',
  'flushMeleeBuffer', 'zyTriangleHoldTick',
  // ★ the draw pipeline · in this harness canvas ops are no-ops, so what these
  // report is the JS ITERATION AND SORTING cost alone — real machines pay this
  // PLUS the actual pixel work.
  'drawOceanUnderlayer', 'drawGrass', 'drawVeridanFreshwaterRiver',
  'drawDistrictWorldBorders', 'drawFootprints', 'drawWorldLayer', 'drawFae',
  'drawElzebubEgg', 'drawGems', 'drawAoeImpactBursts', 'drawHitFx',
  'drawZyrexAttackFx', 'drawProjectiles', 'drawLightMode', 'drawNpcInfoOverlay',
  'drawZyrexMenu', 'drawSettingsMenu', 'drawBattleOverlay', 'drawRizerHud'];

const noop = () => {};
const _Q = [];
global.setInterval = () => 0;
global.setTimeout = fn => { _Q.push(fn); return 0; };
global.clearInterval = noop; global.clearTimeout = noop;
const CTX = new Proxy({}, { get: () => () => ({ addColorStop: noop, width: 0, height: 0, data: [], measureText: () => ({ width: 10 }) }) });
const el = () => ({ style: {}, dataset: {}, classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
  width: 960, height: 540, value: '', textContent: '', innerHTML: '', children: [], childNodes: [],
  getContext: () => CTX, appendChild: noop, removeChild: noop, addEventListener: noop,
  removeEventListener: noop, setAttribute: noop, getAttribute: () => null, focus: noop, remove: noop,
  play: () => Promise.resolve(), pause: noop, querySelector: () => el(), querySelectorAll: () => [],
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 960, height: 540 }) });
global.addEventListener = noop; global.removeEventListener = noop;
global.document = { getElementById: () => el(), querySelector: () => el(), querySelectorAll: () => [],
  createElement: () => el(), addEventListener: noop, body: el(), documentElement: el(), head: el(),
  hidden: false, visibilityState: 'visible' };
global.window = global;
global.localStorage = { getItem: () => null, setItem: noop, removeItem: noop };
global.Audio = function () { return { play: () => Promise.resolve(), pause: noop, addEventListener: noop, cloneNode() { return this; } }; };
global.Image = function () { return { addEventListener: noop, complete: true, naturalWidth: 1254, src: '' }; };
global.requestAnimationFrame = () => 1; global.cancelAnimationFrame = noop;
global.matchMedia = () => ({ matches: false, addEventListener: noop, addListener: noop });
global.navigator = { userAgent: 'node', getGamepads: () => [], maxTouchPoints: 0 };
let T = 1000;
global.performance = { now: () => T };
global.getComputedStyle = () => ({ getPropertyValue: () => '' });
global.__P = {};

let wrap = '';
for (const nm of NAMES) {
  wrap += `;try{ if(typeof ${nm}==='function'){ const _o=${nm}; ${nm}=function(...a){`
       +  ` const _t=process.hrtime.bigint(); try{ return _o.apply(this,a) }`
       +  ` finally{ __P['${nm}']=(__P['${nm}']||0)+Number(process.hrtime.bigint()-_t)/1e6 } } } }catch(e){}`;
}

const LOG = console.log;
console.log = () => {};
new Function(src + wrap + ';globalThis.__C={frame,game,player,NPCS};')();
let n = 0;
while (_Q.length && n < 50) { const f = _Q.shift(); n++; try { f(); } catch (_) {} }
console.log = LOG;
const C = globalThis.__C;
C.game.scene = 'overworld'; C.player.x = 42; C.player.y = 49;

for (let i = 0; i < 20; i++) { T += 16; try { C.frame(T); } catch (_) {} }
global.__P = {};
const N = 200;
const t0 = process.hrtime.bigint();
for (let i = 0; i < N; i++) { T += 16; try { C.frame(T); } catch (_) {} }
const total = Number(process.hrtime.bigint() - t0) / 1e6 / N;

LOG(`\n★ FRAME BREAKDOWN · ${total.toFixed(2)} ms/frame (logic only · no real canvas)\n`);
const rows = Object.entries(global.__P).map(([k, v]) => [k, v / N]).sort((a, b) => b[1] - a[1]);
let acct = 0;
for (const [k, v] of rows) {
  if (v < 0.005) continue;
  acct += v;
  LOG('  ' + k.padEnd(22) + v.toFixed(3).padStart(7) + ' ms  ' + (100 * v / total).toFixed(0).padStart(3) + '%');
}
LOG('  ' + 'UNACCOUNTED'.padEnd(22) + (total - acct).toFixed(3).padStart(7) + ' ms  ' + (100 * (total - acct) / total).toFixed(0).padStart(3) + '%');
LOG(`\n  NPCs in scene: ${C.NPCS.filter(x => x && x.scene === 'overworld').length}`);
