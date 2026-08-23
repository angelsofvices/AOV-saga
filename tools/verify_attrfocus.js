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
// verify_attrfocus · v0.95.807 · every stat button is its own controller stop
const FS=require('fs');
try{new Function(FS.readFileSync('/tmp/all.js','utf8')+
  ';globalThis.__C={player,game,buildRizerAttrPanel,RIZER_ATTR_KEYS,rizerAttrUnspent,renderZycellWeapons};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let fail=0;
const ok=(c,m)=>{ console.log(`  ${c?'✅':'❌'} ${m}`); if(!c) fail++; };
const H=t=>console.log('\n'+t);
const src=FS.readFileSync('/tmp/all.js','utf8');

H('1 · ★★ FIFTEEN BUTTONS, FIFTEEN STOPS');
// Creator: "allow me to edit all stat buttons in this panel. dont just
// highlight the full middle panel."
{
  const P=C.player;
  P.rizerLvl=23; P.attrs={hp:100};             // mid-game · points available
  const html=C.buildRizerAttrPanel('phone');
  const tags=[...html.matchAll(/data-zyitem="(attr_[a-z]+_[a-zA-Z0-9]+)"/g)].map(m=>m[1]);
  ok(tags.length===C.RIZER_ATTR_KEYS.length*3,
     `★ ${tags.length} tagged buttons · ${C.RIZER_ATTR_KEYS.length} stats × +1/+10/MAX`);
  ok(new Set(tags).size===tags.length,'each with a unique id — a duplicate leaves a dead stop');
  for (const k of C.RIZER_ATTR_KEYS)
    ok(tags.filter(t=>t.startsWith(`attr_${k}_`)).length===3,`  ${k} carries all three`);
}

H('2 · ★★ A DEAD BUTTON IS NOT A STOP');
{
  const P=C.player;
  // drain the pool · at 0 unspent every button goes disabled
  P.rizerLvl=1; P.attrs={hp:33};               // Lv1 pool is 33 · all spent
  ok(C.rizerAttrUnspent()===0,'pool drained for the test');
  const html=C.buildRizerAttrPanel('phone');
  ok(!/data-zyitem="attr_/.test(html),
     '★ with nothing to spend, NO button is tagged — landing on a dead control reads as the phone being broken');
  ok((html.match(/disabled/g)||[]).length>=15,'they are disabled instead');
  P.attrs={};
}

H('3 · ★★ THE WRAPPER STOPPED BEING A STOP');
{
  // ★ the actual complaint: _zySection enrolls its wrapper, and auto-enrol
  //   skips children of enrolled ancestors — so the ONLY stop was the whole
  //   panel, and X fired whichever button was first.
  const i=src.indexOf('function _zycellContentItems');
  const body=src.slice(i, i+900);
  ok(/!el\.querySelector\('\[data-zyitem\]'\)/.test(body),
     '★ a container that HOLDS focus targets is filtered out of the walk');
  ok(/el\.offsetParent !== null/.test(body),'while the visibility filter stays');
  // and the rule generalises: the weapons panel rows are tagged, so ITS
  // section wrapper stops being a stop too — same complaint, pre-fixed
  const P=C.player;
  P.items={sapphire_sword:1}; P.cosmeticSkin='normal';
  const w=C.renderZycellWeapons();
  ok(/data-zyitem="sapphire_sword"/.test(w),
     'the weapons rows carry their own tags, so the same rule un-stops that wrapper too');
  // presets reachable when fresh
  P.rizerLvl=5; P.attrs={};
  const fresh=C.buildRizerAttrPanel('phone');
  ok(/data-zyitem="preset_/.test(fresh),'archetype presets are stops as well while the sheet is fresh');
}

console.log('\n'+(fail?`❌ ${fail} CHECK(S) FAILED`:'✅ ALL CHECKS PASS'));
process.exit(fail?1:0);
