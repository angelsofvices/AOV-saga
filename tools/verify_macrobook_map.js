// Dependency-free interaction checks for the guidebook atlas.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'macrobook.html'), 'utf8');
let focused;
class Element {
  constructor(tag = 'div') {
    this.tagName = tag; this.children = []; this.attributes = {}; this.events = {};
    this.classes = new Set(); this.textContent = ''; this.scrollTop = 0;
    this.classList = {add:c => this.classes.add(c), remove:c => this.classes.delete(c)};
  }
  setAttribute(k,v) { this.attributes[k] = String(v); }
  append(...nodes) { this.children.push(...nodes); }
  addEventListener(name,fn) { (this.events[name] ||= []).push(fn); }
  emit(name,event = {}) { for (const fn of this.events[name] || []) fn({target:this,...event}); }
  focus() { focused = this; }
  showModal() { this.open = true; }
  close() { this.open = false; this.emit('close'); }
  getBoundingClientRect() { return {left:100,right:700,top:20,bottom:700}; }
}
const elements = Object.fromEntries([...html.matchAll(/\bid="([^"]+)"/g)].map(m => [m[1],new Element()]));
const body = new Element('body');
const document = {
  body, getElementById:id => elements[id],
  createElement:tag => new Element(tag), createElementNS:(_,tag) => new Element(tag),
  createTextNode:text => ({textContent:text})
};
vm.runInNewContext(fs.readFileSync(path.join(root, 'macrobook-map.js'), 'utf8'), {document});
const expected = [...html.matchAll(/<td><strong>([^<]+)<\/strong><\/td><td>([^<]+)<\/td>/g)].map(m => [m[1],m[2]]);
assert.equal(expected.length,10);
const regions = elements['atlas-regions'].children;
const buttons = elements['atlas-key'].children;
const dialog = elements['district-dialog'];
assert.equal(regions.length,10); assert.equal(buttons.length,10);
for (let i = 0; i < 10; i++) {
  for (const trigger of [regions[i],buttons[i]]) {
    trigger.emit('click');
    assert.equal(dialog.open,true);
    assert.equal(elements['district-title'].textContent,expected[i][0]);
    assert.equal(elements['district-lord'].textContent,expected[i][1]);
    assert.ok(elements['district-description'].textContent.length > 60);
    const view = elements['district-preview'].attributes.viewBox.split(' ').map(Number);
    assert.ok(view.every(Number.isFinite) && view[2] > 0 && view[3] > 0);
    assert.equal(focused,elements['district-close']);
    assert.ok(body.classes.has('district-open'));
    elements['district-close'].emit('click');
    assert.equal(dialog.open,false); assert.equal(focused,trigger);
    assert.ok(!body.classes.has('district-open'));
    assert.equal(trigger.attributes['aria-expanded'],'false');
  }
}
let prevented = false;
regions[0].emit('keydown',{key:' ',preventDefault(){prevented = true;}});
assert.ok(prevented && dialog.open);
elements['district-prev'].emit('click'); assert.equal(elements['district-title'].textContent,'Korathen');
elements['district-next'].emit('click'); assert.equal(elements['district-title'].textContent,'Malezor');
dialog.emit('keydown',{key:'ArrowRight',preventDefault(){}});
assert.equal(elements['district-title'].textContent,'Zarvane');
dialog.emit('click',{clientX:200,clientY:100}); assert.ok(dialog.open);
dialog.emit('click',{clientX:10,clientY:10}); assert.equal(dialog.open,false);
assert.equal(focused,regions[0]);
assert.ok(!html.includes('IT HAS GONE WRONG BEFORE'));
for (const file of ['macrobook-map.css','macrobook-map.js','assets/2D sprites/decor/zyraxis-worldmap.png']) {
  assert.ok(fs.existsSync(path.join(root,file)),`Missing ${file}`);
}
// Parse every inline script as well as the separately executed atlas script.
for (const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) new vm.Script(match[1]);
console.log('PASS: all 10 map regions and list buttons, lore matches, preview bounds, open/close, focus return, scroll lock, keyboard entry, next/previous wrapping, backdrop dismissal, assets and script syntax.');
