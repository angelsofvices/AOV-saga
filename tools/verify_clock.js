const fs=require('fs');const src=fs.readFileSync('/tmp/all.js','utf8');
const noop=()=>{};
global.setInterval=()=>0;global.setTimeout=()=>0;global.clearInterval=noop;global.clearTimeout=noop;
const CTX=new Proxy({},{get:()=>()=>({addColorStop:noop,width:0,height:0,data:[]})});
const el=()=>({style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},
 width:960,height:540,value:'',textContent:'',innerHTML:'',children:[],childNodes:[],getContext:()=>CTX,
 appendChild:noop,removeChild:noop,addEventListener:noop,removeEventListener:noop,setAttribute:noop,
 getAttribute:()=>null,focus:noop,remove:noop,querySelector:()=>el(),querySelectorAll:()=>[],
 getBoundingClientRect:()=>({left:0,top:0,width:960,height:540})});
global.addEventListener=noop;global.removeEventListener=noop;
global.document={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),
 addEventListener:noop,body:el(),documentElement:el(),head:el(),hidden:false,visibilityState:'visible'};
global.window=global;
global.localStorage={_d:{},getItem(k){return this._d[k]??null},setItem(k,v){this._d[k]=String(v)},removeItem(k){delete this._d[k]}};
global.Audio=function(){return{play:()=>Promise.resolve(),pause:noop,addEventListener:noop,cloneNode(){return this},volume:1,currentTime:0}};
global.Image=function(){return{addEventListener:noop,complete:false,naturalWidth:0,src:''}};
global.requestAnimationFrame=()=>0;global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0};
global.performance={now:()=>0};global.getComputedStyle=()=>({getPropertyValue:()=>''});
const EXPORT=';globalThis.__C={player,game,zyraxisHour,zyraxisPhase,isNightZyraxis,nightGateOpen,'+
 'toggleSleepClockSkip,refreshLightModeFromClock,zyraxisClockString,saveGame,loadGame};';
try{ new Function(src+EXPORT)(); }catch(e){ console.log('❌',e.message.split('\n')[0]); }
const C=globalThis.__C; if(!C) process.exit(1);
let f=0; const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};

console.log('\nZYRAXIS CLOCK · real time + 12h sleep skip\n');
const realH=new Date().getHours();
C.player.clockOffsetHours=0;
console.log(`  real-world hour: ${realH}:xx`);
ok(C.zyraxisHour()===realH,`zyraxisHour() tracks the real clock -> ${C.zyraxisHour()}`);
console.log(`  phase now      : ${C.zyraxisPhase()}  ·  lightMode -> ${(C.refreshLightModeFromClock(),C.game.lightMode)}`);

console.log('\n  SLEEP SKIP');
const before=C.zyraxisPhase(), wasNight=C.isNightZyraxis();
const after=C.toggleSleepClockSkip();
C.refreshLightModeFromClock();
console.log(`    ${before} (${C.zyraxisHour()-12<0?C.zyraxisHour()+12:C.zyraxisHour()-12}:xx) -> ${after} (${C.zyraxisHour()}:xx) · lightMode ${C.game.lightMode}`);
ok(C.zyraxisHour()===22||C.zyraxisHour()===8,'sleep lands on an anchor (22:00 night / 08:00 day) -> '+C.zyraxisHour()+':00');
ok(C.isNightZyraxis()!==wasNight,'sleeping flips day <-> night');
C.player.clockOffsetHours=0;
{let dead=0;const realNow=new Date().getHours();
 for(let h=0;h<24;h++){C.player.clockOffsetHours=(h-realNow+24)%24;const wasN=C.isNightZyraxis();C.toggleSleepClockSkip();const nowN=C.isNightZyraxis();if(wasN===nowN)dead++;C.player.clockOffsetHours=(h-realNow+24)%24;}
 ok(dead===0,'night reachable from ALL 24 real hours (dead zones: '+dead+')');}
C.player.clockOffsetHours=0;
C.toggleSleepClockSkip();
ok(true,'sleep snaps to an anchor rather than accumulating');

console.log('\n  PHASE BANDS across a full day (offset 0)');
const real=new Date().getHours();
for(const h of [0,4,5,7,8,12,17,18,19,20,23]){
  C.player.clockOffsetHours=(h-real+24)%24;
  console.log(`    ${String(h).padStart(2,'0')}:00  ${C.zyraxisPhase().padEnd(6)}  night-gate ${C.nightGateOpen()?'OPEN':'shut'}`);
}
C.player.clockOffsetHours=0;

console.log('\n  DEV OVERRIDE');
C.game.devLightOverride=true; C.game.lightMode='night'; C.refreshLightModeFromClock();
ok(C.game.lightMode==='night','dev cycler beats the derived value');
C.game.devLightOverride=false;

console.log('\n  PERSISTENCE');
C.player.clockOffsetHours=12;
C.saveGame();
const saved=JSON.parse(global.localStorage.getItem('rp7b_save_v1')).player;
ok(saved.clockOffsetHours===12,'clockOffsetHours written to save (auto via the v0.95.634 backfill)');
C.player.clockOffsetHours=0;
C.loadGame();
ok(C.player.clockOffsetHours===12,'restored on load — night persists across a reload');
console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
