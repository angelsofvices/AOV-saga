// v0.95.653 · verify the ZyPhone panel no longer resets scroll on its 1s tick.
//
// No jsdom in the sandbox, so this uses a DOM shim that models the ONE
// behaviour that matters: assigning innerHTML destroys and rebuilds the
// children, and a rebuilt element has scrollTop 0.  That is precisely the
// mechanism that was throwing the player back to the top of the list.
const fs = require('fs');
const src = fs.readFileSync('/tmp/all.js', 'utf8');
const noop = () => {};

// ── minimal DOM shim ─────────────────────────────────────────────────────
class El {
  constructor(tag, styleAttr, id){
    this.tagName = (tag || 'div').toUpperCase();
    this._styleAttr = styleAttr || '';
    this.id = id || '';
    this.scrollTop = 0;
    this._kids = [];
    this._html = '';
    this.style = {};
    this.dataset = {};
    this.offsetParent = this;
  }
  getAttribute(n){ return n === 'style' ? this._styleAttr : null; }
  setAttribute(){}
  addEventListener(){}
  removeEventListener(){}
  get innerHTML(){ return this._html; }
  set innerHTML(h){
    this._html = String(h);
    this._kids = El.parse(this._html);   // fresh nodes...
    this.scrollTop = 0;                  // ...and the browser resets this
  }
  // Pull out every element carrying an inline style, in document order.
  static parse(html){
    const out = [];
    const re = /<(div|ul|ol|section|table)\b([^>]*)>/gi;
    let m;
    while ((m = re.exec(html))){
      const attrs = m[2] || '';
      const st = /style\s*=\s*"([^"]*)"/i.exec(attrs);
      const id = /\bid\s*=\s*"([^"]*)"/i.exec(attrs);
      out.push(new El(m[1], st ? st[1] : '', id ? id[1] : ''));
    }
    return out;
  }
  querySelectorAll(sel){
    if (/^\[id="/.test(sel)){
      const want = sel.slice(5, -2);
      return this._kids.filter(k => k.id === want);
    }
    if (sel === '[data-zyitem]') return [];
    const tags = sel.split(',').map(t => t.trim().toUpperCase());
    const hits = this._kids.filter(k => tags.includes(k.tagName));
    hits.forEach = Array.prototype.forEach.bind(hits);
    return hits;
  }
  querySelector(sel){ return this.querySelectorAll(sel)[0] || null; }
}
const PANEL = new El('div', '', 'zycellContent');

const CTX = new Proxy({}, { get: () => () => ({ addColorStop: noop, width: 0, height: 0, data: [] }) });
const stub = () => ({ style:{}, dataset:{}, classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},
  width:960, height:540, value:'', textContent:'', innerHTML:'', children:[], childNodes:[],
  getContext:()=>CTX, appendChild:noop, removeChild:noop, addEventListener:noop, removeEventListener:noop,
  setAttribute:noop, getAttribute:()=>null, focus:noop, remove:noop,
  querySelector:()=>null, querySelectorAll:()=>[], getBoundingClientRect:()=>({left:0,top:0,width:960,height:540}) });
global.setInterval = () => 0; global.setTimeout = () => 0;
global.clearInterval = noop; global.clearTimeout = noop;
global.addEventListener = noop; global.removeEventListener = noop;
global.document = {
  getElementById: (id) => (id === 'zycellContent' ? PANEL : stub()),
  querySelector: () => stub(), querySelectorAll: () => [],
  createElement: () => stub(), addEventListener: noop,
  body: stub(), documentElement: stub(), head: stub(), hidden:false, visibilityState:'visible' };
global.window = global;
global.localStorage = { getItem:()=>null, setItem:noop, removeItem:noop };
global.Audio = function(){ return { play:()=>Promise.resolve(), pause:noop, addEventListener:noop, cloneNode(){return this} }; };
global.Image = function(){ return { addEventListener:noop, complete:false, naturalWidth:0, src:'' }; };
global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = noop;
global.matchMedia = () => ({ matches:false, addEventListener:noop, addListener:noop });
global.navigator = { userAgent:'node', getGamepads:()=>[], maxTouchPoints:0 };
global.performance = { now: () => Date.now() };
global.getComputedStyle = () => ({ getPropertyValue: () => '', display:'block' });

try {
  new Function(src + ';globalThis.__C={paintZycellContent,_zyScrollers,_zySnapshotScroll,' +
    '_zyRestoreScroll,player,game,NPCS,registerContact,contactEligible,' +
    'setPage:(p)=>{zycellPage=p;},getPage:()=>zycellPage,' +
    'renderZycellContacts,renderZycellZycube,renderZycellLeaderboard};')();
} catch (e) { console.log('❌ eval', e.message.split('\n')[0]); process.exit(1); }
const C = globalThis.__C;
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) fails++; };

// Give the contacts panel a long list so scrolling is meaningful.
C.player.metNpcs = {}; C.player.bonds = {};
const elig = C.NPCS.filter(n => n && C.contactEligible(n));
elig.forEach(n => C.registerContact(n));
C.player.phoneBattery = true;

console.log(`\n  (${elig.length} contacts registered — a genuinely long list)\n`);
console.log('1 · REPRODUCE THE BUG · what the old code did every second\n');
C.setPage('contacts');
PANEL.innerHTML = C.renderZycellContacts();     // legacy: unconditional swap
PANEL.scrollTop = 640;                          // player scrolls toward the bottom
PANEL.innerHTML = C.renderZycellContacts();     // the 1s tick fires
ok(PANEL.scrollTop === 0, `legacy unconditional innerHTML swap resets scrollTop to ${PANEL.scrollTop} — this was the bug`);

console.log('\n2 · ★ THE FIX · identical content is not re-rendered at all\n');
PANEL._zyHtmlCache = undefined; PANEL._zyPageCache = undefined;
C.paintZycellContent();                          // first paint
const firstHtml = PANEL.innerHTML;
ok(firstHtml.length > 0, `panel painted (${firstHtml.length} chars)`);
PANEL.scrollTop = 640;                           // player scrolls down
for (let tick = 0; tick < 10; tick++) C.paintZycellContent();   // 10 seconds of ticks
ok(PANEL.scrollTop === 640, `scrollTop held at ${PANEL.scrollTop} across 10 refresh ticks`);
ok(PANEL.innerHTML === firstHtml, 'DOM untouched — the identical-HTML guard short-circuited');

console.log('\n3 · CONTENT ACTUALLY CHANGES · scroll is carried across the rebuild\n');
PANEL.scrollTop = 512;
C.player.bonds[elig[0].id] = 77;                 // a bond ticks up -> HTML differs
C.paintZycellContent();
ok(PANEL.innerHTML !== firstHtml, 'panel did re-render (content genuinely changed)');
ok(PANEL.scrollTop === 512, `scrollTop restored to ${PANEL.scrollTop} after the rebuild`);

console.log('\n4 · INNER SCROLL REGIONS · they were resetting independently\n');
C.setPage('zycube');
C.player.items = C.player.items || {};
for (let i = 0; i < 40; i++) C.player.items['potion_' + i] = 3;   // long bag list
C.paintZycellContent();
let inners = C._zyScrollers(PANEL);
console.log(`     ${inners.length} inner scroll region(s) found in the Zycube panel`);
ok(inners.length > 0, 'panel has its own inner overflow region (the bag list)');
inners[0].scrollTop = 300;
const innerId = inners[0].id;
for (let tick = 0; tick < 5; tick++) C.paintZycellContent();
ok(C._zyScrollers(PANEL)[0].scrollTop === 300, 'inner region holds its scroll across ticks');
C.player.items.potion_0 = 9;                     // force a real change
C.paintZycellContent();
const after = innerId ? PANEL.querySelector('[id="' + innerId + '"]') : C._zyScrollers(PANEL)[0];
ok(after && after.scrollTop === 300, `inner region scroll restored across a real rebuild (id="${innerId}")`);

console.log('\n5 · SWITCHING PAGES OPENS AT THE TOP · not the last panel\'s offset\n');
PANEL.scrollTop = 700;
C.setPage('leaderboard');
C.paintZycellContent();
ok(PANEL.scrollTop === 0, `new panel opens at the top (scrollTop ${PANEL.scrollTop})`);
PANEL.scrollTop = 250;
C.paintZycellContent();
ok(PANEL.scrollTop === 250, '...and then holds position on that panel too');

console.log('\n6 · GOING BACK AND FORTH DOES NOT LEAK STATE\n');
C.setPage('contacts'); C.paintZycellContent();
ok(PANEL.scrollTop === 0, 'returning to contacts starts at the top');
PANEL.scrollTop = 400;
C.setPage('contacts'); C.paintZycellContent();
ok(PANEL.scrollTop === 400, 'repainting the SAME page keeps position');

console.log(fails ? `\n❌ ${fails} failure(s)` : '\n✅ ALL CHECKS PASS');
process.exit(0);
