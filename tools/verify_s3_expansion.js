#!/usr/bin/env node
/* verify_s3_expansion.js · v0.96.47 · S3 · 9 more sheets + the RHUD
 *
 * ★★ ON bodyBh HERE: measured the same way as every other S3 sheet — the
 *   central 40% band, hair-wings excluded — because ONE consistent method beats
 *   a cleverer one applied unevenly. I tried to face-anchor these the way the
 *   locomotion sheets are and it got WORSE: the skin detector spans two regions
 *   when a hand is visible (death read a 290px "face" from 4,032 pixels split
 *   between head and hand), and it fails outright on hurt. Three attempts in it
 *   was degrading rather than converging, so it is not used here.
 *
 * ★★★ AND IT MATTERS LESS THAN IT LOOKS, which is what made stopping correct:
 *   the draw path already PINS in-attack frames to the IDLE row's height unless
 *   a bundle sets constScale. For astralstrike/kick/throw and both slams the
 *   engine normalises them anyway. bodyBh really decides scale only for the
 *   non-attack sheets — hurt, death, block.
 *
 * ★ death row 2 is the one hand-corrected number: measured 291 because that
 *   frame's component includes a long HAIR TRAIN, not a taller body.
 *
 * ★★ THE THREE-WAY SELECTORS ARE THE REGRESSION RISK. block, astralslam and
 *   both RHUD lookups were two-branch, and isRizerPowered() is TRUE for
 *   Luminary — so each would have silently handed S3 the S2 asset. Each now
 *   checks isRizerS3() FIRST, and that ordering is asserted below.
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
const LOG=console.log;console.log=()=>{};console.warn=noop;console.error=noop;
new Function(src+`;globalThis.__D={PLAYER_SKINS,RIZER,rizerBundleForSkin,rizerHudAsset,
 rizerRowScale,rizerTargetBodyPx,player,game,setPlayerSkin,isRizerS3,
 RIZER_LUMINARY_HURT,RIZER_LUMINARY_DEATH,RIZER_LUMINARY_BLOCK,RIZER_LUMINARY_ASTRALSTRIKE,
 RIZER_LUMINARY_ASTRALKICK,RIZER_LUMINARY_ASTRALTHROW,RIZER_LUMINARY_SLAM_MORI,
 RIZER_LUMINARY_SLAM_DAEMON,RIZER_LUMINARY_ASTRAL_PROJ,RIZER_S2_BLOCK,RIZER_S1_BLOCK};`)();
let n=0;while(_Q.length&&n<600){const f=_Q.shift();n++;try{f();}catch(_){}}
console.log=LOG;console.log=LOG;const D=globalThis.__D;

console.log('\n=== S3 ANIMATION EXPANSION ===\n');
const B={hurt:D.RIZER_LUMINARY_HURT,death:D.RIZER_LUMINARY_DEATH,block:D.RIZER_LUMINARY_BLOCK,
 astralstrike:D.RIZER_LUMINARY_ASTRALSTRIKE,astralkick:D.RIZER_LUMINARY_ASTRALKICK,
 astralthrow:D.RIZER_LUMINARY_ASTRALTHROW,slamMori:D.RIZER_LUMINARY_SLAM_MORI,
 slamDaemon:D.RIZER_LUMINARY_SLAM_DAEMON};
for(const [k,b] of Object.entries(B)){
  t(!!b&&b.bboxes&&b.bboxes.length===4,`★ ${k} · 4x4 table`);
}
t(Object.values(B).every(b=>b.cellW===313&&b.cellH===313),'★ all 313 cells');
t(Object.values(B).every(b=>b.bodyBh.length===4&&b.bodyBh.every(v=>v>150&&v<270)),
  '★★ every bodyBh in a sane band · no runaway scale');
// ★ death row 2 · the hand-corrected number
t(D.RIZER_LUMINARY_DEATH.bodyBh[2]===205,
  `★★★ death row 2 corrected to 205 (measured 291 — a HAIR TRAIN, not a taller body)`);
t(Math.abs(D.RIZER_LUMINARY_DEATH.bodyBh[2]-D.RIZER_LUMINARY_DEATH.bodyBh[1])<30,
  '   · and now in line with its own neighbours');
// ★★ the overrides resolve
for(const k of ['hurt','death','astralstrike','astralkick','astralthrow'])
  t(D.rizerBundleForSkin(k,'luminary')===B[k==='astralstrike'?'astralstrike':k],
    `★★ '${k}' resolves to the S3 sheet`);
// ★★★ bboxes inside the sheet
let bad=0;
for(const [k,b] of Object.entries(B))
  for(let r=0;r<4;r++)for(let c=0;c<4;c++){
    const [bx,by,bw,bh]=b.bboxes[r][c];
    const X=c*313+bx,Y=r*313+by;
    if(X<0||Y<0||X+bw>1254||Y+bh>1254){bad++;console.log(`     !! ${k} r${r}c${c}`);}
  }
t(bad===0,`★★★ every bbox on all 8 sheets is inside the 1254 sheet (${bad} out of range)`);
// ★★ RHUD three-way
t(D.rizerHudAsset('luminary').includes('rizer-hud-luminary'),'★★★ RHUD · luminary gets its OWN portrait');
t(D.rizerHudAsset('luminary',true).includes('expression-luminary'),'★★★ and its own expression portrait');
t(D.rizerHudAsset('power_upgrade').includes('power-upgrade'),'★ S2 RHUD unchanged');
t(D.rizerHudAsset('normal').includes('rizer-hud.png'),'★ S1 RHUD unchanged');
// ★★ block is a 3-way now
const body=src.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
t(/isRizerS3\(\)\s*\?\s*RIZER_LUMINARY_BLOCK/.test(body),
  '★★★ the block selector checks S3 BEFORE isRizerPowered() · else Luminary would block in S2 art');
t(/isRizerS3\(\)[\s\S]{0,120}RIZER_LUMINARY_SLAM_DAEMON/.test(body),
  '★★★ and so does astralslam · both enemy shapes');
t(!!D.RIZER_LUMINARY_ASTRAL_PROJ,'★ the projectile VFX bundle exists');
t(D.RIZER_LUMINARY_ASTRAL_PROJ.bodyBh===undefined,
  '★★★ and carries NO bodyBh · it is a bolt, not a body · keeps the declared-bbox path');
t(D.rizerBundleForSkin('astralProj','luminary')===D.RIZER_LUMINARY_ASTRAL_PROJ,
  '★★ astralProj resolves to the S3 bolt');
console.log(`\n${pass} passed · ${fail} failed\n`);
process.exit(fail?1:0);
