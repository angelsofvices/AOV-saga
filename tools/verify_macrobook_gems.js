// Run with node tools/verify_macrobook_gems.js. Checks the real event handlers
// with a minimal DOM; native browser rendering/focus trapping are not simulated.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'macrobook.html'), 'utf8');
let focused;
class Element {
  constructor() {
    this.attributes = {}; this.events = {}; this.dataset = {}; this.textContent = '';
    this.style = {setProperty(key,value){this[key] = value;}};
    this.classes = new Set();
    this.classList = {add:c => this.classes.add(c),remove:c => this.classes.delete(c)};
  }
  setAttribute(key,value) {this.attributes[key] = value;}
  addEventListener(name,fn) {(this.events[name] ||= []).push(fn);}
  emit(name,event = {}) {for (const fn of this.events[name] || []) fn({target:this,...event});}
  focus() {focused = this;}
  showModal() {this.open = true;}
  close() {this.open = false; this.emit('close');}
  getBoundingClientRect() {return {left:16,right:374,top:16,bottom:828};}
}
const elements = Object.fromEntries([...html.matchAll(/\bid="([^"]+)"/g)].map(m => [m[1],new Element()]));
const cards = [...html.matchAll(/<button\b[^>]*data-gem="([^"]+)"[^>]*>/g)].map(m => {
  assert.match(m[0],/type="button"/); assert.match(m[0],/aria-haspopup="dialog"/);
  const el = new Element(); el.dataset.gem = m[1]; return el;
});
assert.equal(cards.length,10); assert.equal(new Set(cards.map(c => c.dataset.gem)).size,10);
const body = new Element();
const document = {body,getElementById:id => elements[id],querySelectorAll:selector => {
  assert.equal(selector,'[data-gem]'); return cards;
}};
vm.runInNewContext(fs.readFileSync(path.join(root,'macrobook-gems.js'),'utf8'),{document});
const dialog = elements['gem-dialog'];
const names = ['Ruby','Pearl','Citrine','Emerald','Amethyst','Sapphire','Onyx','Amber','Ninth Formation','Tenth Formation'];
const principles = ['Body','Balance','Adaptation','Growth','Spirit','Mind','Absorption','Evolution','Composite IX','Composite X'];
const spoilers = /Egnellahc|Ultharis|Soul Split|World Gem|Space Gem|First Four|Final Four|Luminary|Prismshard|Xenoxil|Zoryn|Mothergem/i;
for (let i = 0; i < cards.length; i++) {
  cards[i].emit('click');
  assert.equal(dialog.open,true); assert.ok(body.classes.has('gem-open'));
  assert.equal(focused,elements['gem-close']);
  assert.equal(elements['gem-title'].textContent,names[i]);
  assert.ok(elements['gem-principle'].textContent.includes(principles[i]));
  assert.equal(elements['gem-kind'].textContent,i < 8 ? 'Natural gem principle' : 'Exceptional composite formation');
  for (const field of ['world','zyrex','rizers']) {
    const prose = elements[`gem-${field}`].textContent;
    assert.ok(prose.length > 70,`${names[i]} missing ${field}`);
    assert.doesNotMatch(prose,spoilers,`${names[i]} leaks a spoiler`);
    assert.doesNotMatch(prose,/\d+%|Lv\.?\s?\d|multiplier|baseAtk/i);
  }
  assert.equal(cards[i].attributes['aria-expanded'],'true');
  if (i >= 8) assert.match(elements['gem-emblem'].style.background,/^conic-gradient/);
  elements['gem-close'].emit('click');
  assert.equal(dialog.open,false); assert.ok(!body.classes.has('gem-open'));
  assert.equal(focused,cards[i]); assert.equal(cards[i].attributes['aria-expanded'],'false');
}
cards[0].emit('click');
elements['gem-prev'].emit('click'); assert.equal(elements['gem-title'].textContent,'Tenth Formation');
elements['gem-next'].emit('click'); assert.equal(elements['gem-title'].textContent,'Ruby');
let prevented = false;
dialog.emit('keydown',{key:'ArrowRight',preventDefault(){prevented = true;}});
assert.ok(prevented); assert.equal(elements['gem-title'].textContent,'Pearl');
dialog.emit('click',{clientX:200,clientY:100}); assert.equal(dialog.open,true);
dialog.emit('click',{clientX:1,clientY:1}); assert.equal(dialog.open,false);
assert.equal(focused,cards[0]);
for (const file of ['macrobook-gems.css','macrobook-gems.js','macrobook-map.css']) {
  assert.ok(html.includes(`"${file}"`) && fs.existsSync(path.join(root,file)));
}
for (const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) new vm.Script(m[1]);
console.log('PASS: 10 accessible gem buttons; distinct world/Zyrex/Rizer entries; canon principles; composite swatches; spoiler boundary; modal open/close, focus return, scroll lock, navigation wrapping, arrow keys and backdrop dismissal; asset references and inline script syntax.');
