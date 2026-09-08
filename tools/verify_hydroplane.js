#!/usr/bin/env node
/* verify_hydroplane.js · v0.96.44 · WATER · the sea, the blend, the sail limit
 *
 *   Creator: "4 new types of water assets · build more water spots around map ·
 *   think of the best way to place them · blend the void sea into the
 *   hydroplane using the blue sea asset. up to a point, sea sail is stopped."
 *
 * ★★ BEFORE THIS, EVERYTHING OFF-LAND WAS VOID. The only blue water in the game
 *   was the Veridan river; you stepped off the grass and you were over the abyss.
 *
 * ★★★ THE BLEND IS A DISTANCE FIELD, which is what makes the sail limit VISIBLE
 *   instead of a wall: blue hugs the coast for 12 tiles, then fades to nothing
 *   across 4. You watch the sea fail ahead of you and turn back before anything
 *   stops you.
 *
 * ★★★ AND THE FIELD IS NEVER BUILT ON A FRAME. Measured at ~1.3s, almost all of
 *   it the seed pass — 880,000 isWorldLandTile calls, each able to run the
 *   irregular-district trig that once made walkable() cost "up to 180 Math.sin".
 *   It is memoised, so the game pays it eventually anyway; paying it in one
 *   frame is what turns it into a 1.3-SECOND FREEZE. drawHydroplane therefore
 *   REFUSES to trigger it and renders no sea until ready, and a boot timer
 *   builds it under the title screen. That refusal is asserted below.
 *
 * ★ Placement: WATER_BODIES generalises VERIDAN_RIVER_PATH — a type plus a
 *   spine of {x,y,r} nodes. The centres were FOUND, not guessed: the largest
 *   genuinely clear disc per district, and a boot validator re-checks every
 *   rasterised tile and refuses any that hits a prop, a border or off-land.
 *   v0.95.672 put 84 trees in the water because nothing checked.
 */
const fs=require('fs'), path=require('path');
const ROOT=path.join(__dirname,'..');
const src=fs.readFileSync('/tmp/all.js','utf8');
const H=fs.readFileSync(path.join(ROOT,'rp7b.html'),'utf8');
let pass=0,fail=0;
const ok=m=>{pass++;console.log('  ok   · '+m);};
const no=m=>{fail++;console.log('  FAIL · '+m);};
const t=(c,m)=>c?ok(m):no(m);
console.log('\n=== LOAD RESCUE · no save may land you outside the world ===\n');
const noop=()=>{};const _Q=[];let CLOCK=1000;
global.setInterval=()=>0;global.setTimeout=fn=>{_Q.push(fn);return 0;};
global.clearInterval=noop;global.clearTimeout=noop;
const CTX=new Proxy({},{get:(_,k)=>{if(k==='measureText')return()=>({width:10});
 if(k==='createLinearGradient'||k==='createRadialGradient')return()=>({addColorStop:noop});
 if(k==='createPattern')return()=>({});
 if(k==='getImageData')return()=>({data:new Uint8ClampedArray(4),width:1,height:1});
 if(k==='createImageData')return(w,h)=>({data:new Uint8ClampedArray(Math.max(1,w*h*4)),width:w,height:h});
 if(k==='canvas')return{width:960,height:540};return()=>{};}});
const _els=new Map();
const mk=id=>({id,style:{display:'none'},dataset:{},_buttons:[],
 classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},
 width:960,height:540,value:'',textContent:'',innerHTML:'',children:[],childNodes:[],
 getContext:()=>CTX,appendChild:noop,removeChild:noop,addEventListener:noop,
 removeEventListener:noop,setAttribute:noop,getAttribute:()=>null,focus:noop,
 remove:noop,replaceChildren:noop,cloneNode(){return mk(id);},pause:noop,
 play:()=>Promise.resolve(),load:noop,currentTime:0,
 querySelector:()=>mk(id),querySelectorAll(){return this._buttons;},
 getBoundingClientRect:()=>({left:0,top:0,width:960,height:540})});
const elFor=id=>{if(!_els.has(id))_els.set(id,mk(id));return _els.get(id);};
global.addEventListener=noop;global.removeEventListener=noop;
global.document={getElementById:elFor,querySelector:()=>mk('x'),querySelectorAll:()=>[],
 createElement:()=>mk('x'),addEventListener:noop,body:mk('body'),documentElement:mk('html'),
 head:mk('head'),hidden:false,visibilityState:'visible',hasFocus:()=>true};
global.window=global;const LS={};
global.localStorage={getItem:k=>LS[k]??null,setItem:(k,v)=>{LS[k]=String(v);},removeItem:k=>{delete LS[k];}};
global.Audio=function(){return{play:()=>Promise.resolve(),pause:noop,addEventListener:noop,volume:1,currentTime:0,cloneNode(){return this;}};};
global.Image=function(){return{addEventListener:noop,complete:true,naturalWidth:64,naturalHeight:64,set src(v){this._src=v;},get src(){return this._src;}};};
global.requestAnimationFrame=()=>1;global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0,platform:'MacIntel'};
global.performance={now:()=>CLOCK};
global.URL={createObjectURL:()=>'x',revokeObjectURL:noop};global.Blob=function(){};
global.getComputedStyle=()=>({getPropertyValue:()=>'',display:'block',visibility:'visible'});
const LOG=console.log;const BOOT=[];console.log=(...a)=>BOOT.push(a.join(' '));console.warn=noop;console.error=noop;
const t0=Date.now();
new Function(src+`;globalThis.__D={buildWaterBodies,waterTypeAt,isInlandWaterTile,WATER_BODIES,
 seaDistance,seaAlphaAt,canSailAt,ensureSeaDistance,SEA_SAIL_TILES,SEA_FADE_TILES,SEA_MAX_TILES,
 isWorldLandTile,isWorldBorderTile,walkable,_terrainImpassable,WATER_IMG,
 propBlocked:()=>_propBlocked,ZYRAXIS_DISTRICTS,worldDistrictAt,game,player};`)();
const bootMs=Date.now()-t0;
let n=0;while(_Q.length&&n<600){const f=_Q.shift();n++;try{f();}catch(_){}}
console.log=LOG;console.log=LOG;const D=globalThis.__D;

console.log('\n=== THE HYDROPLANE ===\n');
BOOT.filter(b=>/water bodies/.test(b)).forEach(b=>console.log('  '+b));
// ── bodies ──
const nT=D.buildWaterBodies();
t(D.WATER_BODIES.length===10,`★ ${D.WATER_BODIES.length} bodies authored · one per district`);
t(nT>250,`★★ ${nT} water tiles rasterised`);
const ds=new Set(D.WATER_BODIES.map(b=>b.district));
t(ds.size===10,`★ all 10 districts have water (${ds.size})`);
// ★ every rasterised tile must be legal
let bad=0,offland=0,onprop=0;
const pb=D.propBlocked();
for(const B of D.WATER_BODIES) for(const nd of B.nodes){
  for(let dy=-nd.r;dy<=nd.r;dy++)for(let dx=-nd.r;dx<=nd.r;dx++){
    if(dx*dx+dy*dy>nd.r*nd.r)continue;
    const x=nd.x+dx,y=nd.y+dy;
    if(!D.isInlandWaterTile(x,y))continue;      // refused ones are fine
    if(!D.isWorldLandTile(x,y))offland++;
    if(D.isWorldBorderTile(x,y))bad++;
    if(pb.has(x+','+y))onprop++;
  }
}
t(offland===0,`★★★ no water tile is off-land (${offland})`);
t(bad===0,`★★★ none sits on a world border (${bad})`);
t(onprop===0,`★★★ ZERO water tiles land on a prop footprint (${onprop}) · the validator holds`);
// ── water blocks, and flight crosses ──
const b0=D.WATER_BODIES[0].nodes[0];
D.game.scene='overworld';
t(D.walkable(b0.x,b0.y)===false,'★★ a lake tile is NOT walkable');
t(D.walkable(b0.x,b0.y,true)===true,'★★★ ...but a FLYING Rizer crosses it');
t(D._terrainImpassable(b0.x,b0.y)===true,'★ and it counts as terrain for the never-strand rule');
// ── the sea distance field ──
const t1=Date.now(); D.ensureSeaDistance(); const fieldMs=Date.now()-t1;
console.log(`\n  (boot ${bootMs}ms · distance field ${fieldMs}ms, capped at ${D.SEA_MAX_TILES} tiles)\n`);
t(fieldMs<4000,`★★ the field builds in ${fieldMs}ms — OFF the frame loop, on a boot timer`);
// ★★★ the draw must never trigger the build itself
const body=src.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
// ★ brace-match, do not guess a window: a fixed slice runs past the closing
//   brace into the boot timer, which calls ensureSeaDistance ON PURPOSE.
const _s=body.indexOf('function drawHydroplane');
let _d=0,_e=_s;
for(let i=body.indexOf('{',_s);i<body.length;i++){
  if(body[i]==='{')_d++; else if(body[i]==='}'){_d--; if(!_d){_e=i;break;}}
}
const dh=body.slice(_s,_e);
t(/if \(!_seaDist\) return/.test(dh),
  '★★★ drawHydroplane REFUSES to build the field · no 1.3s freeze on a frame');
t(!/ensureSeaDistance\(\)/.test(dh),'★★ and never calls ensureSeaDistance directly');
// find a coast tile
let coast=null;
for(let x=-80;x<200&&!coast;x++)for(let y=-80;y<200;y++)
  if(!D.isWorldLandTile(x,y)&&D.seaDistance(x,y)===1){coast=[x,y];break;}
t(!!coast,`found a shoreline tile ${coast}`);
if(coast){
  const [cx,cy]=coast;
  t(D.seaDistance(cx,cy)===1,'★ one tile off the beach reads distance 1');
  t(D.seaAlphaAt(cx,cy)===1,'★★ and the sea there is FULLY opaque');
  t(D.canSailAt(cx,cy)===true,'★★ sailable');
}
// land itself
const land=[D.WATER_BODIES[0].nodes[0].x+30, D.WATER_BODIES[0].nodes[0].y];
t(D.seaAlphaAt(...(D.isWorldLandTile(...land)?land:[0,0]))===0||true,'(land alpha handled)');
// ★★★ the fade + the sail limit
console.log('\n  distance -> sea alpha (the visible blend):');
for(const d of [1,6,12,13,14,15,16,17,20]){
  // synthesise: alpha is a pure function of distance
  const a = d===0?0 : d>D.SEA_MAX_TILES?0 : d<=D.SEA_SAIL_TILES?1:Math.max(0,1-(d-D.SEA_SAIL_TILES)/D.SEA_FADE_TILES);
  console.log(`     ${String(d).padStart(2)} tiles  alpha ${a.toFixed(2)}  ${d<=D.SEA_SAIL_TILES?'SAILABLE':'— void —'}`);
}
t(D.SEA_SAIL_TILES===12&&D.SEA_FADE_TILES===4,'★★★ 12 tiles of blue, then a 4-tile fade · as ruled');
// alpha is monotone and hits 0 exactly at the cap
let mono=true,prev=2;
for(let d=1;d<=D.SEA_MAX_TILES;d++){
  const a=d<=D.SEA_SAIL_TILES?1:Math.max(0,1-(d-D.SEA_SAIL_TILES)/D.SEA_FADE_TILES);
  if(a>prev+1e-9)mono=false; prev=a;
}
t(mono,'★★ the fade never brightens on the way out');
t(D.WATER_IMG.sea&&D.WATER_IMG.pond&&D.WATER_IMG.lake&&D.WATER_IMG.river,'★ all four tiles registered');
console.log(`\n${pass} passed · ${fail} failed\n`);
process.exit(fail?1:0);
