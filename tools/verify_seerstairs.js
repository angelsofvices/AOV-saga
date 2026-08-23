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
// v0.95.736 · Batch 5 · Seer-black stair set + the locked-door seal.
const FS=require('fs');
try{new Function(FS.readFileSync('/tmp/all.js','utf8')+
  ';globalThis.__C={STAIR_ART_SETS,SEER_STAIR_UP_BBOX,SEER_STAIR_DOWN_BBOX,SEER_DOOR_LOCKED_BBOX,'+
  'INTERIOR_SEER_HQ_1F,INTERIOR_SEER_HQ_B,INTERIOR_SEER_HQ_2F,INTERIOR_HOME,'+
  'drawInteriorFloor,hasSeerKey,player,game};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C;let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m);if(!c)f++;};
const A='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/assets/2D sprites/interior/';

console.log('\n1 · ★ ART ON DISK\n');
for(const n of ['seer-stairs-up','seer-stairs-down','seer-door-locked'])
  ok(FS.existsSync(A+n+'.png'), n+'.png');
for(const n of ['seer-stairs-up','seer-stairs-down','seer-door-locked'])
  ok(FS.existsSync(A+'_orig/'+n+'-delivered.png'), '  delivered original preserved · '+n);

console.log('\n2 · ★★ EVERY SEER FLOOR USES THE SEER SET\n');
for(const [n,cfg] of [['1F',C.INTERIOR_SEER_HQ_1F],['VAULT',C.INTERIOR_SEER_HQ_B],['2F',C.INTERIOR_SEER_HQ_2F]])
  ok(cfg && cfg.stairArt==='seer', `Seer HQ ${n} tagged stairArt:'seer'`);
ok(!C.INTERIOR_HOME.stairArt, "★ the player's HOME is NOT tagged — the wooden set is still the default everywhere else");
ok(!!C.STAIR_ART_SETS.seer.up.img && !!C.STAIR_ART_SETS.seer.down.img,'the seer set binds both directions');
// The stair block is inline inside drawInteriorFloor — there is no
// drawInteriorStairs function. Read the real one.
const ssrc=String(C.drawInteriorFloor);
ok(/STAIR_ART_SETS\[cfg\.stairArt\]/.test(ssrc),
   '★ art is chosen from the interior CONFIG, not from a game.scene name test');
ok(!/seer_hq/.test(ssrc),'and the generic stair renderer carries no building-specific knowledge');

console.log('\n3 · ★★ THE SEAL TRACKS THE RULE\n');
console.log('     A locked stair used to look identical to an open one; the');
console.log('     only evidence was a toast AFTER you walked into it.\n');
const up = C.INTERIOR_SEER_HQ_1F.stairsList.find(s=>s.art==='up');
const dn = C.INTERIOR_SEER_HQ_1F.stairsList.find(s=>s.art==='down');
ok(typeof up.locked==='function','the 2F stair carries a locked() predicate');
ok(!dn.locked,'the vault stair does not — it is always open');
ok(/typeof s\.locked === 'function' \? !!s\.locked\(\)/.test(ssrc),
   '★ the door is drawn from that SAME predicate, so art and rule cannot disagree');
C.player.seerKeys={};
ok(up.locked()===true,'no key -> locked() true -> the seal draws');
C.player.seerKeys={malezor:true,zarvane:true,andrannor:true,veridan:true,netharion:true,
                   vorashil:true,xilnar:true,baelgor:true,thardin:true,korathen:true};
ok(up.locked()===false,'key in hand -> locked() false -> the seal is gone');
C.player.seerKeys={};

console.log('\n4 · ★ GEOMETRY\n');
const B=[['up',C.SEER_STAIR_UP_BBOX,64,96],['down',C.SEER_STAIR_DOWN_BBOX,64,96],
         ['door',C.SEER_DOOR_LOCKED_BBOX,32,64]];
for(const [n,bb,W,H] of B)
  ok(bb[0]>=0&&bb[1]>=0&&bb[0]+bb[2]<=W&&bb[1]+bb[3]<=H,
     `${n} bbox [${bb}] fits inside its ${W}x${H} asset`);
ok(/dw = Math\.round\(dh \* \(qw \/ qh\)\)/.test(ssrc),
   'the seal width is derived from its aspect ratio — never stretched');

console.log('\n5 · ★ IT RENDERS\n');
let threw=null;
for(const [n,scene] of [['1F','interior_seer_hq_1f'],['VAULT','interior_seer_hq_b'],
                        ['2F','interior_seer_hq_2f'],['HOME','interior_home']]){
  C.game.scene=scene;
  try{ C.drawInteriorFloor(); }catch(e){ threw=n+': '+e.message; }
}
ok(!threw, 'drawInteriorFloor renders every Seer floor AND a wooden-stair interior'+(threw?' — '+threw:''));

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');process.exit(0);
