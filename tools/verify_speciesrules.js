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
try{new Function(require('fs').readFileSync('/tmp/all.js','utf8')+';globalThis.__C={SPECIES,MOVE_DEX,TYPE_COLORS};')();}catch(e){console.log('BOOT FAIL',e.message);process.exit(1);}
const C=globalThis.__C;let bad=0,exempt=[];
for(const [k,s] of Object.entries(C.SPECIES)){
  const pool=s.baseHP+s.baseATK+s.baseDEF+s.baseSPD+s.baseSATK+s.baseSDEF;
  if(pool!==s.tier*333){
    // v0.95.746 · honour the declared exemption instead of re-reporting it
    if(s.poolExempt){ exempt.push(`${k} ${pool} · ${s.poolExempt}`); }
    else { console.log('  ✗ pool',k,pool,'vs',s.tier*333); bad++; }
  }
  for(const t of [s.type,s.type2]) if(t&&!C.TYPE_COLORS[t]){console.log('  ✗ type',k,t);bad++;}
  for(const m of (s.moves||[])) if(!C.MOVE_DEX[m]){console.log('  ✗ move',k,m);bad++;}
}
exempt.forEach(e=>console.log('  ◈ EXEMPT (by design):',e));
console.log(bad?'  ❌ '+bad+' problems':'  ✅ all '+Object.keys(C.SPECIES).length+' species: pool = tier x333 (or declared exempt), types canon, moves resolve');
