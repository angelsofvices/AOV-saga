// Dependency-free interaction and public-lore checks for the Gemlord gallery.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname,'..');
const html = fs.readFileSync(path.join(root,'macrobook.html'),'utf8');
let focused;
class Element {
  constructor() {
    this.attributes = {}; this.events = {}; this.dataset = {}; this.textContent = '';
    this.classes = new Set(); this.classList = {add:c => this.classes.add(c),remove:c => this.classes.delete(c)};
  }
  setAttribute(key,value) {this.attributes[key] = String(value);}
  addEventListener(name,fn) {(this.events[name] ||= []).push(fn);}
  emit(name,event={}) {for (const fn of this.events[name] || []) fn({target:this,...event});}
  focus() {focused = this;}
  showModal() {this.open = true;}
  close() {this.open = false; this.emit('close');}
  getBoundingClientRect() {return {left:16,right:864,top:16,bottom:828};}
}
const elements = Object.fromEntries([...html.matchAll(/\bid="([^"]+)"/g)].map(m => [m[1],new Element()]));
const gallery = [...html.matchAll(/<button\b[^>]*class="gemlord-card"[^>]*data-gemlord="([^"]+)"[^>]*>[\s\S]*?<img\s+src="([^"]+)"\s+alt="([^"]+)"/g)].map(m => {
  const element = new Element(); element.dataset.gemlord = m[1];
  return {element,id:m[1],src:m[2],alt:m[3]};
});
assert.equal(gallery.length,10);
assert.equal(new Set(gallery.map(item => item.id)).size,10);
const districtTrigger = elements['district-lord']; districtTrigger.dataset.gemlord = 'rakoron';
const triggers = [...gallery.map(item => item.element),districtTrigger];
const body = new Element();
const document = {body,getElementById:id => elements[id],querySelectorAll:selector => {
  assert.equal(selector,'[data-gemlord]'); return triggers;
}};
vm.runInNewContext(fs.readFileSync(path.join(root,'macrobook-gemlords.js'),'utf8'),{document});
const names = ['Rakoron','Ivirium','Mutaryn','Emeralix','Eurakeon','Azurel','Obsidius','Ambrevon','Oathane','Oatheus'];
const forbidden = /Egnellahc|Soul Split|Ultharis|Third Dimension|World Gem|Space Gem|First Four|Final Four|Xenoxil|Ophira|Orryx|kidnapp|\bdies?\b|defeat|Empty Throne|\bmissing\b|\babsent\b/i;
const dialog = elements['gemlord-dialog'];
assert.ok(!html.includes('id="gemlord-portrait"'),'Gemlord profile overlay should not contain a portrait');
assert.ok(!html.includes('class="gemlord-portrait-wrap"'),'Gemlord profile overlay should be text-only');
for (let i=0;i<gallery.length;i++) {
  const item = gallery[i];
  assert.ok(fs.existsSync(path.join(root,decodeURIComponent(item.src))),`missing portrait: ${item.src}`);
  assert.ok(item.alt.includes(names[i]));
  item.element.emit('click');
  assert.equal(dialog.open,true); assert.ok(body.classes.has('gemlord-open'));
  assert.equal(focused,elements['gemlord-close']);
  assert.equal(elements['gemlord-title'].textContent,names[i]);
  for (const field of ['lore','presence','fieldnote']) {
    const prose = elements[`gemlord-${field}`].textContent;
    assert.ok(prose.length > 65,`${names[i]} missing ${field}`);
    assert.doesNotMatch(prose,forbidden,`${names[i]} leaks private story canon`);
  }
  assert.equal(item.element.attributes['aria-expanded'],'true');
  elements['gemlord-close'].emit('click');
  assert.equal(dialog.open,false); assert.ok(!body.classes.has('gemlord-open'));
  assert.equal(focused,item.element); assert.equal(item.element.attributes['aria-expanded'],'false');
}
districtTrigger.dataset.gemlord = 'azurel'; districtTrigger.emit('click');
assert.equal(elements['gemlord-title'].textContent,'Azurel');
elements['gemlord-close'].emit('click'); assert.equal(focused,districtTrigger);
gallery[0].element.emit('click');
elements['gemlord-prev'].emit('click'); assert.equal(elements['gemlord-title'].textContent,'Oatheus');
elements['gemlord-next'].emit('click'); assert.equal(elements['gemlord-title'].textContent,'Rakoron');
let prevented = false;
dialog.emit('keydown',{key:'ArrowRight',preventDefault(){prevented=true;}});
assert.ok(prevented); assert.equal(elements['gemlord-title'].textContent,'Ivirium');
dialog.emit('click',{clientX:200,clientY:100}); assert.equal(dialog.open,true);
dialog.emit('click',{clientX:1,clientY:1}); assert.equal(dialog.open,false);
for (const file of ['macrobook-gemlords.css','macrobook-gemlords.js']) {
  assert.ok(html.includes(`"${file}"`) && fs.existsSync(path.join(root,file)));
}
for (const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) new vm.Script(match[1]);
console.log('PASS: 10 gallery portraits and clickable names, image-free public canon profile overlays, district-overlay name routing, spoiler boundary, modal open/close, focus return, scroll lock, navigation wrapping, arrow keys, backdrop dismissal, asset references and script syntax.');
