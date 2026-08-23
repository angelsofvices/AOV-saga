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
try{new Function(src+';globalThis.__V={WORLD_PROPS,BOOM,BOOM_BLASTS,BOOM_DEBRIS,player,NPCS,keys,seerChestAt,astralthrowBreakAOE,tryInteract,game};')();}catch(e){console.log('❌',e.message.split('\n')[0]);}
const V=globalThis.__V;if(!V)process.exit(1);
let f=0;const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m);if(!c)f++;};
const chests=V.WORLD_PROPS.filter(p=>p._seerExplosive);
console.log('\nBLAST RADIUS '+V.BOOM.RADIUS+'  ->  '+V.BOOM.AOE_TILES+'x'+V.BOOM.AOE_TILES+' footprint\n');
const mult=d=>d===0?V.BOOM.DMG_CENTER:V.BOOM.DMG_RING*(1-((d-1)/V.BOOM.RADIUS)*0.6);
console.log('  DAMAGE FALLOFF (x baseAtk)');
for(let d=0;d<=V.BOOM.RADIUS;d++) console.log('    distance '+d+'  ->  x'+mult(d).toFixed(2));
console.log('\n  X ALONE = TRAP');
V.player.hp=100;V.player.hpMax=100;V.keys['shift']=false;
const c=chests[0]; c.onInteract();
ok(V.player.hp===50,'plain X opens it · -50% max HP · trap restored (hp '+V.player.hp+')');
ok(!!c.detonated,'chest consumed by the trap');
ok(V.BOOM_BLASTS.length>0,'trap shows the real explosion sheet too');
console.log('\n  L2 HELD = tryInteract must NOT open it');
V.player.hp=100; V.BOOM_BLASTS.length=0;
const c2=chests[1];
V.game.scene='overworld'; V.player.x=c2.tileX; V.player.y=c2.tileY-1; V.player.dir='down';
V.keys['shift']=true;
V.tryInteract();
ok(V.player.hp===100,'L2 held · tryInteract took no damage (guard works across the two listeners)');
ok(!c2.detonated,'chest NOT consumed while L2 is held · still liftable');
V.keys['shift']=false;
console.log('\n  RADIUS REACH · thrown blast at (50,50)');
const c3=chests[2]; c3.tileX=50; c3.tileY=50;
V.player.hp=100; V.player.x=99; V.player.y=99;
timers=[]; V.astralthrowBreakAOE(c3,'normal'); timers[0].f();
ok(V.BOOM_DEBRIS.length===V.BOOM.AOE_TILES*V.BOOM.AOE_TILES,
   'debris covers all '+(V.BOOM.AOE_TILES*V.BOOM.AOE_TILES)+' tiles');
console.log('\n  SELF-DAMAGE BY DISTANCE');
for(const dist of [0,1,3,4]){
  const cc=chests.find(x=>!x.detonated&&!x._detonatedOnce);
  if(!cc){console.log('    (out of chests)');break;}
  cc.tileX=200;cc.tileY=200;
  V.player.hp=100; V.player.x=200+dist; V.player.y=200;
  timers=[]; V.astralthrowBreakAOE(cc,'normal'); if(timers[0])timers[0].f();
  const taken=100-V.player.hp;
  console.log('    '+dist+' tiles away -> '+(taken?('-'+taken+' HP'):'safe'));
}
console.log('\n  THROW SAFETY');
console.log('    S1 range '+V.BOOM.RANGE_S1+' vs radius '+V.BOOM.RADIUS+' -> '+(V.BOOM.RANGE_S1>V.BOOM.RADIUS?'✅ clear by '+(V.BOOM.RANGE_S1-V.BOOM.RADIUS)+' tile':'⚠ SELF-HIT at max range'));
console.log('    S2 range '+V.BOOM.RANGE_S2+' vs radius '+V.BOOM.RADIUS+' -> '+(V.BOOM.RANGE_S2>V.BOOM.RADIUS?'✅ clear by '+(V.BOOM.RANGE_S2-V.BOOM.RADIUS)+' tiles':'⚠ SELF-HIT'));
console.log(f?('\n❌ '+f+' failure(s)'):'\n✅ ALL CHECKS PASS');
process.exit(0);
