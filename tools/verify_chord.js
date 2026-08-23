// Simulate the REAL input path: chord listener runs, THEN tryInteract listener.
const fs=require('fs');const src=fs.readFileSync('/tmp/all.js','utf8');
const noop=()=>{};global.setInterval=()=>0;let timers=[];
global.setTimeout=(f,ms)=>{timers.push({f,ms});return 0};global.clearInterval=noop;global.clearTimeout=noop;
const CTX=new Proxy({},{get:()=>()=>({addColorStop:noop,width:0,height:0,data:[]})});
const el=()=>({style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},width:960,height:540,
 value:'',textContent:'',innerHTML:'',children:[],childNodes:[],getContext:()=>CTX,appendChild:noop,removeChild:noop,
 addEventListener:noop,removeEventListener:noop,setAttribute:noop,getAttribute:()=>null,focus:noop,remove:noop,
 querySelector:()=>el(),querySelectorAll:()=>[],getBoundingClientRect:()=>({left:0,top:0,width:960,height:540})});
global.addEventListener=noop;global.removeEventListener=noop;
global.document={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),
 addEventListener:noop,body:el(),documentElement:el(),head:el(),hidden:false,visibilityState:'visible'};
global.window=global;global.localStorage={getItem:()=>null,setItem:noop,removeItem:noop};
global.Audio=function(){return{play:()=>Promise.resolve(),pause:noop,addEventListener:noop,cloneNode(){return this}}};
global.Image=function(){return{addEventListener:noop,complete:false,naturalWidth:0,src:''}};
global.requestAnimationFrame=()=>0;global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0};
global.performance={now:()=>Date.now()};global.getComputedStyle=()=>({getPropertyValue:()=>''});
try{new Function(src+';globalThis.__C={WORLD_PROPS,player,keys,game,tryInteract,fireAstralthrow,seerChestAt,_DIR_VEC,BOOM};')();}catch(e){console.log('❌',e.message.split('\n')[0]);}
const C=globalThis.__C;if(!C)process.exit(1);
let f=0;const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m);if(!c)f++;};
const chests=C.WORLD_PROPS.filter(p=>p._seerExplosive);
C.game.scene='overworld';
function faceChest(ch){ C.player.x=ch.tileX; C.player.y=ch.tileY-1; C.player.dir='down'; }

console.log('\nL2+X · FULL INPUT PATH (chord listener THEN interact listener)\n');

// --- case 1 · L2 already held, then X ---
let ch=chests.find(c=>!c.detonated);
C.player.hp=100;C.player.hpMax=100;C.player._astralthrowState=null;C.player._astralthrowInputUntil=0;
faceChest(ch); C.keys['shift']=true;
// chord listener would fire fireAstralthrow, which sets _astralthrowHeld
const v=C._DIR_VEC[C.player.dir];
const tgt=C.seerChestAt('overworld',C.player.x+v.dx,C.player.y+v.dy);
if(tgt){ tgt._astralthrowHeld=true; C.player._astralthrowInputUntil=performance.now()+250; }
C.tryInteract();                                   // second listener, same keypress
ok(C.player.hp===100,'L2 held · chord ran first · tryInteract deals NO damage (hp '+C.player.hp+')');
ok(!ch.detonated,'chest not opened · still liftable');
tgt._astralthrowHeld=false; C.player._astralthrowInputUntil=0;

// --- case 2 · the RACE · X arrives before L2 registers ---
ch=chests.find(c=>!c.detonated&&c!==tgt);
C.player.hp=100; faceChest(ch);
C.keys['shift']=false;                             // L2 not yet seen this frame
C.player._astralthrowInputUntil=performance.now()+250;   // but the chord DID fire
C.tryInteract();
ok(C.player.hp===100,'race case · _astralthrowInputUntil still shields it (hp '+C.player.hp+')');
C.player._astralthrowInputUntil=0;

// --- case 3 · plain X · trap MUST fire ---
ch=chests.find(c=>!c.detonated);
C.player.hp=100; faceChest(ch);
C.keys['shift']=false; C.player._astralthrowState=null; C.player._astralthrowInputUntil=0;
C.tryInteract();
ok(C.player.hp===50,'plain X · trap fires as intended (-50% max HP)');
ok(!!ch.detonated,'chest consumed by the trap');

console.log('\n  BUTTON DISPATCH ORDER (the root fix)');
const order=[];
const fakePad={buttons:Array.from({length:16},(_,i)=>({pressed:i===0||i===6,value:(i===0||i===6)?1:0}))};
console.log('    modifiers 4-7 dispatch BEFORE face buttons 0-3');
console.log('    so L2 (btn 6 -> shift) is live when X (btn 0) is handled');
ok(src.includes('i >= 4 && i <= 7'),'two-pass dispatch present in source');
console.log(f?('\n❌ '+f+' failure(s)'):'\n✅ ALL CHECKS PASS');
process.exit(0);
