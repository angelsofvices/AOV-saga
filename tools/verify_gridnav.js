const fs = require('fs');
const _harnessSrc = fs.readFileSync('/tmp/all.js', 'utf8');
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
// verify_whud · v0.95.784 · the weapon wheel shows what is in hand
// verify_gridnav · v0.95.809 · grid rows in the phone · no inner-cell wrapping
const FS=require('fs');
try{new Function(FS.readFileSync('/tmp/all.js','utf8')+
  ';globalThis.__C={player,game,buildRizerAttrPanel,RIZER_ATTR_KEYS};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let fail=0;
const ok=(c,m)=>{ console.log(`  ${c?'✅':'❌'} ${m}`); if(!c) fail++; };
const H=t=>console.log('\n'+t);
const src=FS.readFileSync('/tmp/all.js','utf8');
const h=src.indexOf("if (game._zycellFocus === 'content')");
const body=src.slice(h, h+6000);

H('1 · ★★ THE STAT BUTTONS DECLARE THEIR ROWS');
{
  const P=C.player;
  P.rizerLvl=23; P.attrs={hp:50};
  const html=C.buildRizerAttrPanel('phone');
  for (const k of C.RIZER_ATTR_KEYS)
    ok((html.match(new RegExp(`data-zyrow="attr_${k}"`,'g'))||[]).length===3,
       `  ${k} · three buttons share one row tag`);
  P.rizerLvl=5; P.attrs={};
  ok(/data-zyrow="presets"/.test(C.buildRizerAttrPanel('phone')),'the preset strip is a row too');
}

H('2 · ★★ RIGHT STOPS DEAD AT THE ROW END');
// Creator: "no inner cell wrapping"
{
  const i=body.indexOf("k === 'arrowright' && _curRow");
  ok(i>0,'RIGHT has a dedicated grid branch');
  const b=body.slice(i, i+600);
  ok(/if \(c < R\.length-1\)/.test(b),'it moves only while a column remains');
  ok(!/% R\.length|%R\.length/.test(b),'★ NO modulo — the row cannot wrap');
  ok(/playSFX\('doorLock'\)/.test(b),'★ the edge ANSWERS (doorLock) instead of teleporting the cursor');
}

H('3 · ★★ LEFT WALKS THE ROW · EXITS ONLY FROM COLUMN 0');
{
  const i=body.indexOf("if (k === 'arrowleft')");
  const b=body.slice(i, i+900);
  ok(/if \(c > 0\)/.test(b),'left steps within the row while columns remain');
  ok(/zycellExitContent\(\)/.test(b),'and from column 0 it still backs out to the nav rail — the old gesture survives');
}

H('4 · ★★ UP/DOWN MOVE A ROW AT A TIME · ONLY THE LIST WRAPS');
// Creator: "besides returning to the top or bottom of the list if you pass
// the end or beginning"
{
  ok(/const _stepRow = \(dir\)/.test(body),'row-stepping is one function for both directions');
  const i=body.indexOf('const _stepRow');
  const b=body.slice(i, i+1100);
  ok(/a run of same-row items is one unit/i.test(b)||/units/.test(b),'consecutive same-row items collapse into one unit');
  ok(/\(uNow \+ dir \+ units\.length\) % units\.length/.test(b),
     '★ the modulo lives at the UNIT-LIST level — top wraps to bottom, a stat row never wraps into itself');
  ok(/Math\.min\(col, U\.idxs\.length-1\)/.test(b),
     '★ your COLUMN survives the row change — down from +10 lands on the next stat\'s +10');
}

H('5 · ★ EVERYTHING ELSE IS UNTOUCHED');
{
  // RIGHT still activates on non-grid items · the v0.95.576 convenience lives
  const i=body.indexOf("k === 'arrowright' || k === 'a'");
  ok(i>0,'the activation branch survives for non-grid items');
  ok(body.indexOf("k === 'arrowright' && _curRow") < i,
     '★ and the grid branch is checked FIRST, so a grid RIGHT is movement, not a click');
  // no other panel grew row tags by accident
  const tags=[...src.matchAll(/data-zyrow="([a-z_]+)"/g)].map(m=>m[1]);
  ok(tags.every(t=>t.startsWith('attr_')||t==='presets'),
     `only the attribute grid declares rows (${[...new Set(tags)].join(', ')}) — every list panel keeps flat nav`);
}

console.log('\n'+(fail?`❌ ${fail} CHECK(S) FAILED`:'✅ ALL CHECKS PASS'));
process.exit(fail?1:0);
