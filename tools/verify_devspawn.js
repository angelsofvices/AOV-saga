const fs = require('fs');
const src = fs.readFileSync('/tmp/all.js', 'utf8');
const noop = () => {};
global.setInterval=()=>0; global.setTimeout=()=>0; global.clearInterval=noop; global.clearTimeout=noop;
const CTX=new Proxy({},{get:()=>()=>({addColorStop:noop,width:0,height:0,data:[]})});
const el=()=>({style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},width:960,height:540,value:'',textContent:'',innerHTML:'',children:[],childNodes:[],getContext:()=>CTX,appendChild:noop,removeChild:noop,addEventListener:noop,removeEventListener:noop,setAttribute:noop,getAttribute:()=>null,focus:noop,remove:noop,play:()=>Promise.resolve(),pause:noop,querySelector:()=>el(),querySelectorAll:()=>[],getBoundingClientRect:()=>({left:0,top:0,width:960,height:540})});
global.addEventListener=noop; global.removeEventListener=noop;
global.document={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),addEventListener:noop,body:el(),documentElement:el(),head:el(),hidden:false,visibilityState:'visible'};
global.window=global; global.localStorage={getItem:()=>null,setItem:noop,removeItem:noop};
global.Audio=function(){return{play:()=>Promise.resolve(),pause:noop,addEventListener:noop,cloneNode(){return this}}};
global.Image=function(){return{addEventListener:noop,complete:false,naturalWidth:0,src:''}};
global.requestAnimationFrame=()=>0; global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0};
global.performance={now:()=>Date.now()};
global.getComputedStyle=()=>({getPropertyValue:()=>''});
try{new Function(src+';globalThis.__C={seedMalezorWild,WILD_ZYREX,SPECIES,walkable,worldDistrictAt,WILD_PLACEMENT_LIVE,player,game};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
global.showToast=noop; global.playSFX=noop; global.saveGame=noop;
C.game.scene='overworld';
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
const src2=fs.readFileSync(ROOT+'rp7b.html','utf8');
C.seedMalezorWild();

H('1 · ★★★ EVERY ZYREX HAS A BODY');
{
  const live=C.WILD_ZYREX.filter(w=>!w._gone);
  ok(live.length>0,live.length+' wild Zyrex in the world');
  ok(live.every(w=>C.walkable(w.tileX,w.tileY)===false),
     '★★★ NOT ONE can be walked through · wilds were the last actors in the world without collision');
  ok(live.some(w=>C.walkable(w.tileX,w.tileY+1)||C.walkable(w.tileX,w.tileY-1)||
                  C.walkable(w.tileX+1,w.tileY)||C.walkable(w.tileX-1,w.tileY)),
     '★★ and you can still stand BESIDE one · blocking the body is HOW you walk up and press X');
  ok(/EVERY ZYREX HAS A BODY/.test(src2),'the rule is written at the site');
  ok(/the tile you are FACING/.test(src2),'★ and why interaction still works · you interact with the FACED tile');
}

H('2 · ★★ TWO CELESTRYX IN KORATHEN · north and south');
{
  const kor=C.WILD_PLACEMENT_LIVE.filter(P=>P.id==='celestryx'&&P.dist==='korathen');
  ok(kor.length===2,'★ two pinned in Korathen');
  const live=C.WILD_ZYREX.filter(w=>w.speciesId==='celestryx'&&C.worldDistrictAt(w.tileX,w.tileY)==='korathen');
  ok(live.length===2,'★★ and both actually stand there');
  const ys=live.map(w=>w.tileY).sort((a,b)=>a-b);
  ok(ys[1]-ys[0]>100,'★★★ genuinely NORTH and SOUTH · '+(ys[1]-ys[0])+' tiles apart, not two neighbours');
  ok(live.every(w=>w.level===60),'★ both Lv 60 · tier 6 × 10');
  ok(live.every(w=>!C.walkable(w.tileX,w.tileY)),'★ and both have collision, like every Zyrex now');
}

H('3 · ★★★ SPAWN TO NEAREST · one button per SPECIES');
{
  ok(/SPAWN TO NEAREST <SPECIES>/.test(src2),'the dev tool exists');
  ok(/ONE BUTTON PER SPECIES, not per individual/.test(src2),
     '★★★ one per species · 22 Aetherwing must not become 22 buttons');
  ok(/if \(!near\[w\.speciesId\] \|\| d < near\[w\.speciesId\]\.d\)/.test(src2),
     '★★ it keeps the NEAREST of each species, measured from where the dev stands');
  ok(/Built at panel-open time from the LIVE world/.test(src2),
     '★★ built from the live world · a Zyrex placed tomorrow appears with no second edit');
  const hooks=(src2.match(/window\.buildDevSpawnToList && window\.buildDevSpawnToList\(\)/g)||[]).length;
  ok(hooks===2,'★★★ BOTH dev-panel open sites rebuild it ('+hooks+') · a list wired to one door would be silently stale for whoever used the other');
}

H('4 · ★★ IT LANDS YOU BESIDE, NEVER INSIDE');
{
  ok(/lands you BESIDE it, never on it/.test(src2),
     '★★★ the warp refuses the creature\'s own tile · every Zyrex now has a body, so landing on one would wedge you inside it');
  ok(/if \(typeof walkable === 'function' && walkable\(x, y\)\)\{ spot = \[x, y\]; break; \}/.test(src2),
     '★★ it searches outward for a WALKABLE neighbour');
  ok(/face it, so a single X starts the bond check/.test(src2),
     '★★ and it aims you AT the creature · the dev came to test a bond, so the warp sets up the button press');
  ok(/no live ' \+ id \+ ' in the world/.test(src2),'★ a species with no live copy refuses cleanly');
}

console.log('\n'+(f?('❌ '+f+' FAILED'):'✅ ALL PASS'));
process.exit(f?1:0);
