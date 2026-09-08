#!/usr/bin/env node
/* verify_sfx_proximity.js · v0.96.38
 *
 *   Creator: "add proximity volume to all zyrex attack sfx. u only hear the
 *   attack sfx from your rizer by ONE FACTOR. distance to the attack
 *   coordinate." and "make skellor proximity sound. all enemies sound should
 *   be a proximity dB proximity volume gain."
 *
 * ★★★ THE SKELLOR REPORT WAS NOT A WIRING BUG, AND I CHECKED BEFORE REWIRING.
 *   All 30 enemy-sound call sites already passed a position; skellor's own
 *   proximity loop already handed it the NPC; the gain already reached all
 *   three branches of playSFX. The v0.96.2 CURVE was simply too flat — (1-t)^2
 *   over a 3..26 band leaves a Skellor SIX TILES AWAY, off the edge of the
 *   viewport, at 76% volume. It was not reading as proximity because for every
 *   distance a player actually experiences, it barely was.
 *
 *   So this suite pins the LAW, not the plumbing: −6 dB per doubling of
 *   distance, which is what sound does and therefore not a taste I can drift.
 *
 * ★★ And it pins the thing that made the old code fragile: the distance cull
 *   was gated on a SET OF NAMES that every new positional sound had to be
 *   remembered into. It is gated on `at` now. A test that only checked the
 *   five names in that set would have passed while the set rotted.
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
// ★ RECORDING audio nodes · the crowd tests need real play/ended semantics.
//   The usual shim returns a singleton that swallows everything, which would
//   make "six voices" and "one voice" look identical — exactly the harness
//   blind spot that hid a whole class of fault before.
let LIVE=[],ALL=[];
global.__audio={live:()=>LIVE,all:()=>ALL,
  reset(){for(const n of ALL.slice()){n.ended=true;(n._l.ended||[]).forEach(f=>f());}LIVE=[];ALL=[];}};
global.Audio=function(src){
  return {_src:src,volume:1,currentTime:0,ended:false,_l:{},
    addEventListener(e,f){(this._l[e]=this._l[e]||[]).push(f);},
    removeEventListener:noop,load:noop,
    pause(){this.ended=true;LIVE=LIVE.filter(n=>n!==this);},
    play(){LIVE.push(this);ALL.push(this);return Promise.resolve();},
    cloneNode(){return global.Audio(this._src);}};};
global.Image=function(){return{addEventListener:noop,complete:true,naturalWidth:64,naturalHeight:64,set src(v){this._src=v;},get src(){return this._src;}};};
global.requestAnimationFrame=()=>1;global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0,platform:'MacIntel'};
global.performance={now:()=>CLOCK};
global.URL={createObjectURL:()=>'x',revokeObjectURL:noop};global.Blob=function(){};
global.getComputedStyle=()=>({getPropertyValue:()=>'',display:'block',visibility:'visible'});
const LOG=console.log;console.log=()=>{};console.warn=noop;console.error=noop;
new Function(src+`;globalThis.__D={player,game,sfxProximityGain,sfxGainToDb,
 SFX_NEAR_TILES,SFX_FAR_TILES,SFX_MIN_GAIN,ENEMY_VOX,ZYREX_ATTACK_SFX,
 playZyrexAttackSFX,playSFX,AUDIO,_sfxGainFor};`)();
let n=0;while(_Q.length&&n<400){const f=_Q.shift();n++;try{f();}catch(_){}}
console.log=LOG;const D=globalThis.__D;
console.log('\n=== SFX PROXIMITY · a dB law, not a curve ===\n');
D.player.x=0;D.player.y=0;
const g=d=>D.sfxProximityGain(d,0);
const dbOf=d=>D.sfxGainToDb(g(d));

/* ── 1 · the shape of the law ──────────────────────────────────────── */
t(g(0)===1,'★ full volume at the player’s feet');
t(g(D.SFX_NEAR_TILES)===1,`★ full volume out to the near band (${D.SFX_NEAR_TILES} tiles)`);
t(g(D.SFX_FAR_TILES)===0,`★ EXACTLY silent at the far band (${D.SFX_FAR_TILES} tiles) · no pop`);
t(g(D.SFX_FAR_TILES+50)===0,'★ and beyond it');
let mono=true,prev=2;
for(let d=0;d<=60;d+=0.05){const v=g(d);if(v>prev+1e-9){mono=false;break;}prev=v;}
t(mono,'★★ monotonically decreasing · closer is NEVER quieter');
let ranged=true;
for(let d=0;d<=60;d+=0.05){const v=g(d);if(v<0||v>1){ranged=false;break;}}
t(ranged,'★ gain never leaves 0..1 · no clipping, no silence-by-overflow');

/* ── 2 · ★★★ −6 dB PER DOUBLING · the actual ask ───────────────────── */
// Inverse distance law. The window term that folds the tail to zero makes the
// far end steeper than −6, never shallower — so this is asserted as a floor.
let okDouble=true, worst=0;
for(const d of [4,5,6,7,8]){
  const drop=dbOf(d)-dbOf(d*2);
  if(drop<5.5){okDouble=false;}
  worst=Math.max(worst,Math.abs(drop-6));
}
t(okDouble,'★★★ at least −6 dB per doubling of distance · the inverse distance law');
t(dbOf(6)<-5&&dbOf(6)>-8,`★★★ 6 tiles is about −6 dB (${dbOf(6).toFixed(1)}) · was −2.4 at v0.96.2`);
t(dbOf(12)<-12,`★★ 12 tiles is well down (${dbOf(12).toFixed(1)} dB)`);
t(dbOf(20)<-20,`★★ 20 tiles is nearly gone (${dbOf(20).toFixed(1)} dB)`);
// ★ THE REGRESSION THAT PROMPTED THIS: the old curve at 6 tiles
const oldAt6=Math.pow(1-(6-D.SFX_NEAR_TILES)/(D.SFX_FAR_TILES-D.SFX_NEAR_TILES),2);
t(g(6)<oldAt6*0.75,
  `★★★ 6 tiles is MUCH quieter than v0.96.2 (${(g(6)*100).toFixed(0)}% vs ${(oldAt6*100).toFixed(0)}%)`);
t(g(10)<0.35,`★★★ a Skellor at 10 tiles — its own detector radius — is ${(g(10)*100).toFixed(0)}%, not half the room`);

/* ── 3 · no position means no attenuation ──────────────────────────── */
t(D.sfxProximityGain(null,null)===1,'★ a sound with no coordinate plays at full volume');
t(D._sfxGainFor('confirm',null)===1,'★ UI sounds are never attenuated');
t(D._sfxGainFor('skellor',{tileX:0,tileY:0})===1,'★ an NPC on top of you is full volume');
t(D._sfxGainFor('skellor',{tileX:40,tileY:0})===0,'★ an NPC 40 tiles away is silent');
t(D._sfxGainFor('skellor',{x:6,y:0})===D._sfxGainFor('skellor',{tileX:6,tileY:0}),
  '★ {x,y} points and {tileX,tileY} NPCs resolve identically');

/* ── 4 · ★ EVERY enemy sound is positioned at EVERY call site ──────── */
// ★ read the CODE, never the prose — comments in this file quote sound names
const body=H.replace(/<!--[\s\S]*?-->/g,'')
           .replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
let bare=[];
for(const name of [...D.ENEMY_VOX]){
  const re=new RegExp("playSFX\\(\\s*'"+name+"'\\s*\\)","g");
  const hits=body.match(re);
  if(hits) bare.push(`${name} x${hits.length}`);
}
t(bare.length===0,
  `★★★ NO enemy sound is played without a position${bare.length?' · '+bare.join(', '):''}`);
// and they are actually called somewhere · a set of names nothing plays is not a feature
let played=0;
for(const name of [...D.ENEMY_VOX]){
  if(new RegExp("playSFX\\(\\s*'"+name+"'\\s*,").test(body)) played++;
}
t(played===D.ENEMY_VOX.size,`★ all ${D.ENEMY_VOX.size} enemy sounds have a positioned call site (${played})`);
t(D.ENEMY_VOX.has('skellor'),'★ skellor is in the enemy set');
// ★ these two asserted `playSFX('x', n)` — the pre-v0.96.38 loop shape. The
//   detector picks the NEAREST now, so the variable is bestMori/bestSkel; the
//   property worth pinning is that the emitter is passed AT ALL, whatever it is
//   called. (The skellor form still matched by accident via the separate
//   on-hit vocal site, which is exactly how a stale regex hides a rewrite.)
t(/playSFX\('skellor',\s*[A-Za-z_$][\w$]*\)/.test(body),'★★ every skellor play passes an emitter');
t(/playSFX\('moriNearby',\s*[A-Za-z_$][\w$]*\)/.test(body),'★ and so does the mori detector');

/* ── 5 · ★★★ ZYREX ATTACK SFX · positioned at the ATTACK COORDINATE ── */
t(typeof D.playZyrexAttackSFX==='function','★ playZyrexAttackSFX exists');
t(/playZyrexAttackSFX\('astralstrike',\s*best\)/.test(body),
  '★★★ the Zyrex swing is positioned at the TARGET tile · "the attack coordinate"');
t(/playZyrexAttackSFX\('astralKill',\s*best\)/.test(body),
  '★★★ the Zyrex kill is positioned at the target too');
// ★ the site must no longer play bare · that was the whole bug
const tick=body.slice(body.indexOf('function tickAggressiveZyrex'),
                      body.indexOf('function tickAggressiveZyrex')+9000);
t(tick.length>100,'tickAggressiveZyrex located');
t(!/playSFX\('astralstrike'\)/.test(tick)&&!/playSFX\('astralKill'\)/.test(tick),
  '★★★ no BARE attack sfx left in the Zyrex combat tick');
// ★★ and Rizer's own attacks are NOT attenuated · they share the sound name
t(/playSFX\('astralstrike'\)/.test(body),
  '★★★ Rizer’s own astralstrike is still played bare · he is never far from himself');
let warned=false;
const OW=console.warn;console.warn=()=>{warned=true;};
try{D.playZyrexAttackSFX('astralstrike');}catch(_){}
console.warn=OW;
t(warned,'★★ a Zyrex attack with NO coordinate warns · a missed call site cannot hide');

/* ── 6 · ★★ the cull is gated on the POSITION, not on a name list ──── */
t(/if\s*\(\s*at\s*&&\s*_gain\s*<\s*SFX_MIN_GAIN\s*\)\s*return/.test(body),
  '★★★ distant sounds are culled by `at`, not by a set that can go stale');
t(!/_gain\s*<\s*SFX_MIN_GAIN\s*&&\s*ENEMY_VOX\.has/.test(body),
  '★ the old name-gated cull is gone');


/* ── 7 · ★★★ CROWD NORMALIZATION · many enemies must not get LOUDER ─── */
//   Creator: "normalize the volume output of skellor and all other enemies.
//   they should not get louder if there are many. they should just play the
//   sound."
//
// ★ Amplitude ADDS. Six groans together is six copies summed into one output,
//   which clips — and attenuating each by distance does not fix it, because
//   six half-volume groans are still three groans loud. The cap is on
//   CONCURRENCY, one live instance per placed sound.
const A=global.__audio;
const sum=()=>A.live().reduce((a,b)=>a+b.volume,0);

A.reset();
for(let i=0;i<6;i++) D.playSFX('skellor',{tileX:4+i,tileY:0});
t(A.live().length===1,`★★★ SIX skellors in range produce ONE live voice (${A.live().length}), not six`);
t(sum()<=1.0001,`★★★ summed amplitude cannot exceed one sound (${sum().toFixed(2)}) · no stacking, no clipping`);

// ★★ LOUDEST WINS · a far groan must never lock out the one at your shoulder
A.reset();
D.playSFX('skellor',{tileX:16,tileY:0});
const farVol=A.live()[0].volume;
D.playSFX('skellor',{tileX:1,tileY:0});
t(A.live().length===1,'★ still one voice after a nearer groan arrives');
t(A.live()[0].volume>farVol,
  `★★★ the NEAR groan CUTS the far one (${farVol.toFixed(3)} → ${A.live()[0].volume.toFixed(3)})`);

A.reset();
D.playSFX('skellor',{tileX:1,tileY:0});
const nearVol=A.live()[0].volume;
D.playSFX('skellor',{tileX:16,tileY:0});
t(A.live().length===1&&Math.abs(A.live()[0].volume-nearVol)<1e-9,
  '★★★ and a FAR groan does NOT interrupt the near one · the informative sound survives');

// ★ a per-name cap, not a mute
A.reset();
D.playSFX('skellor',{tileX:4,tileY:0});
D.playSFX('moriDeath',{tileX:4,tileY:0});
D.playSFX('moriGrunt',{tileX:4,tileY:0});
t(A.live().length===3,`★ three DIFFERENT enemy sounds still play together (${A.live().length})`);

// ★★★ and the player is never capped · he is not "placed"
A.reset();
for(let i=0;i<4;i++) D.playSFX('astralstrike');
t(A.live().length===4,
  `★★★ Rizer's own attack still overlaps freely (${A.live().length}/4) · bare calls are not placed`);

// the slot frees when a clip finishes
A.reset();
D.playSFX('skellor',{tileX:4,tileY:0});
const nd=A.live()[0]; nd.ended=true; (nd._l.ended||[]).forEach(f=>f());
D.playSFX('skellor',{tileX:14,tileY:0});
t(A.all().length===2,'★ once a groan ends the next may play · the cap is not a one-shot');

/* ── 8 · ★★★ THE DETECTOR LOOP · the actual stacking bug ───────────── */
// `moriReady`/`skellorReady` were read ONCE above the loop and never re-checked
// inside it, so setting the cooldown did not stop the current pass and EVERY
// Mori in range played its own clone on the same tick.
t(!/const\s+moriReady[\s\S]{0,900}?for\s*\(const n of NPCS\)[\s\S]{0,700}?playSFX\('moriNearby',\s*n\)/.test(body),
  '★★★ the detector no longer plays inside the NPCS loop');
t(/bestMori/.test(body)&&/bestSkel/.test(body),
  '★★★ it picks the NEAREST Mori and the NEAREST Skellor, then plays once');
t(/playSFX\('moriNearby',\s*bestMori\)/.test(body)&&/playSFX\('skellor',\s*bestSkel\)/.test(body),
  '★★ and both plays are outside the loop · one groan per cooldown, whatever the crowd size');


console.log(`\n${pass} passed · ${fail} failed\n`);
process.exit(fail?1:0);
