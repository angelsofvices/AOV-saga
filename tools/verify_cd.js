// Verifies the A3 cooldown mechanic: fires set a3Cd=4, beginTurn ticks it
// down by exactly 1 per the card's own turn, A3 never fires while a3Cd>0.
const fs = require('fs');
const HTML = '/sessions/great-cool-heisenberg/mnt/AOV-saga-new/cardmaster.html';
let script = fs.readFileSync(HTML, 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
script = script.replace(/^\s*'use strict';\s*/, '');

// driver helpers only — drop the trailing 80-match IIFE
let driverFull = fs.readFileSync(__dirname + '/driver_v2.js', 'utf8');
const driver = driverFull.slice(0, driverFull.lastIndexOf('(function ()'));

// ---- fake DOM (same stubs as sim_v2.js) ----
function FakeEl(id) {
  this.id = id || ''; this._cls = new Set(); this.style = {}; this.children = [];
  this.hidden = false; this._text = ''; this._html = ''; this.dataset = {}; this.onclick = null;
}
Object.defineProperty(FakeEl.prototype, 'textContent', { get() { return this._text; }, set(v) { this._text = String(v); } });
Object.defineProperty(FakeEl.prototype, 'innerHTML', { get() { return this._html; }, set(v) { this._html = String(v); this.children = []; } });
FakeEl.prototype.appendChild = function (c) { this.children.push(c); return c; };
FakeEl.prototype.remove = function () {};
FakeEl.prototype.addEventListener = function () {};
FakeEl.prototype.querySelectorAll = function () { return []; };
function clsObj(el) {
  return {
    add: (...a) => a.forEach(x => el._cls.add(x)),
    remove: (...a) => a.forEach(x => el._cls.delete(x)),
    toggle: (x, on) => { if (on) el._cls.add(x); else el._cls.delete(x); },
    contains: (x) => el._cls.has(x),
  };
}
function makeEl(id) { const e = new FakeEl(id); e.classList = clsObj(e); return e; }
global.__els = {};
function getEl(id) { if (!global.__els[id]) global.__els[id] = makeEl(id); return global.__els[id]; }
global.document = { getElementById: getEl, querySelector: () => getEl('__app'), createElement: () => makeEl() };
global.window = {};
global.__queue = [];
global.setTimeout = (fn) => { global.__queue.push(fn); return 0; };

const probe = `
(function () {
  const violations = [];
  let a3Fires = 0, ticks = 0;

  const _resolve = resolveSwing;
  resolveSwing = function (kind, side, mode, stat) {
    let pre = null;
    if (kind === 'a3') { const c = activeOf(side); pre = c ? (c.a3Cd | 0) : null; }
    const out = _resolve(kind, side, mode, stat);
    if (kind === 'a3') {
      a3Fires++;
      const c = activeOf(side);
      if (pre && pre > 0) violations.push('A3 fired while a3Cd=' + pre);
      if (c && c.a3Cd !== 4) violations.push('post-fire a3Cd=' + c.a3Cd + ' (expected 4)');
    }
    return out;
  };

  const _begin = beginTurn;
  beginTurn = function (side) {
    const c = activeOf(side);
    const before = c ? (c.a3Cd | 0) : 0;
    const r = _begin(side);
    const after = c ? (c.a3Cd | 0) : 0;
    if (c) {
      if (before > 0) {
        ticks++;
        if (after !== before - 1) violations.push('tick ' + before + '->' + after);
      } else if (after !== 0) {
        violations.push('a3Cd moved 0->' + after);
      }
      if (after < 0) violations.push('a3Cd went negative: ' + after);
    }
    return r;
  };

  for (let i = 0; i < 50; i++) { try { __runMatch(); } catch (e) { violations.push('match ' + i + ': ' + e); } }

  console.log('A3 fires observed: ' + a3Fires + '   cooldown ticks observed: ' + ticks);
  if (violations.length) {
    console.log('VIOLATIONS (' + violations.length + '):');
    violations.slice(0, 15).forEach(v => console.log('  - ' + v));
  } else {
    console.log('PASS — every A3 fire set a3Cd=4, every tick decremented by exactly 1, no fire on cooldown.');
  }
})();
`;

eval(script + '\n;\n' + driver + '\n;\n' + probe);
