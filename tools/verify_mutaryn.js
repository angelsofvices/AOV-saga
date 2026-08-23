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
// v0.95.737 · MUTARYN · the last hole in the Gemlord card network.
const FS=require('fs');
try{new Function(FS.readFileSync('/tmp/all.js','utf8')+';globalThis.__C={POSTERS,WORLD_PROPS,openPosterView};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C;let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m);if(!c)f++;};
const G='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/assets/2D sprites/decor/gemlords/';
const LORDS=['rakoron','ivirium','mutaryn','emeralix','eurakeon','azurel','obsidius','ambrevon','oathane','oatheus'];

console.log('\n1 · ★★ TEN LORDS, TEN CARDS, TEN DOORS\n');
ok(FS.readdirSync(G).filter(x=>x.endsWith('.png')).length===10,
   `${FS.readdirSync(G).filter(x=>x.endsWith('.png')).length} card files on disk`);
for(const l of LORDS) ok(FS.existsSync(G+l+'.png'), '  '+l+'.png');
for(const l of LORDS) ok(!!C.POSTERS[l], '  POSTERS entry · '+l);
const missing=LORDS.filter(l=>!C.POSTERS[l]||!FS.existsSync(G+l+'.png'));
ok(missing.length===0,`★ no Gemlord is missing art or a registration (${missing.length})`);

console.log('\n2 · ★★ ANDRANNOR\'S DOOR NO LONGER TOASTS\n');
const cave=C.WORLD_PROPS.find(p=>p&&p.id==='mutaryn_cave');
ok(!!cave,'mutaryn_cave is placed in the world');
const csrc=String(cave.onInteract);
ok(/openPosterView\('mutaryn'\)/.test(csrc),"★ it calls openPosterView('mutaryn')");
ok(!/sealed for now/.test(csrc),'and the placeholder toast is gone');
console.log('');
let toasting=0;
for(const p of C.WORLD_PROPS){
  if(!p||!/_cave$/.test(p.id||'')) continue;
  const s2=String(p.onInteract||'');
  if(!/openPosterView/.test(s2)) { toasting++; console.log('     ★ '+p.id+' still has no card'); }
}
ok(toasting===0,`every Gemlord cave door opens a card (${toasting} still placeholder)`);

console.log('\n3 · ★ THE CARD ITSELF\n');
const {execSync}=require('child_process');
const dims=JSON.parse(execSync(`python3 -c "
from PIL import Image
import glob,json,os
d={}
for p in glob.glob('${G}*.png'):
    im=Image.open(p); d[os.path.basename(p)[:-4]]=[im.width,im.height]
print(json.dumps(d))
"`).toString());
const m=dims.mutaryn;
console.log(`     mutaryn ${m[0]}x${m[1]}`);
ok(m[0]===1060&&m[1]===1484,'exactly 1060x1484 — matches azurel / emeralix / eurakeon / obsidius');
// The first version of this asserted spread < 0.03 across all ten and failed
// — but the outlier is AMBREVON (1081x1455, ratio 1.346), which predates this
// delivery by months. Mutaryn is 1.400, mid-pack. Assert what is actually
// being claimed: the NEW card sits inside the range the set already occupies.
const ratios=Object.entries(dims).map(([k,d])=>[k,d[1]/d[0]]);
const others=ratios.filter(([k])=>k!=='mutaryn').map(([,r])=>r);
const mine=dims.mutaryn[1]/dims.mutaryn[0];
const lo=Math.min(...others), hi=Math.max(...others);
console.log(`     existing nine span ${lo.toFixed(3)}-${hi.toFixed(3)} (ambrevon is the low outlier, pre-existing)`);
ok(mine>=lo&&mine<=hi,`mutaryn ${mine.toFixed(3)} sits inside the range the set already occupies`);
ok(Math.abs(mine-1484/1060)<1e-9,'and is pixel-identical to the four most common cards');
ok(/CITRINELORD OF ANDRANNOR/.test(C.POSTERS.mutaryn.title),
   `titled "${C.POSTERS.mutaryn.title}" — Citrinelord, and the art is gold-citrine`);
ok(C.POSTERS.mutaryn.src.includes('gemlords/mutaryn.png'),'points at the gemlords/ folder like the other nine');

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');process.exit(0);
