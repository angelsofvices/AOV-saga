#!/usr/bin/env node
/* verify_impact_sfx.js · v0.96.39
 *
 *   Creator: "play this sound whenever a new message pops up on game · tied to
 *   the 'you have a new message rizer' vox · like the phone notification sound."
 *   Creator: "play this sfx when rizer takes small damage. all enemies."
 *   ...then medium, then heavy. And: "these are IMPACT sounds. not what rizer
 *   says when hurt. we already have those."
 *
 * ★★★ THE BAND IS A FRACTION OF MAX HP, NOT A DAMAGE NUMBER.
 *   Measured off the live build: Lv 1 hpMax is 50, a Mori drains 4-5, a Daemon
 *   10. Band on raw damage and a Mori is a HEAVY hit at level 1 and STILL a
 *   heavy hit at level 80 — the tier would encode the enemy's stat line rather
 *   than what the player felt. As a fraction it does what the fiction does: the
 *   Daemon that nearly killed you at Lv 1 becomes a tap once hpMax is 500.
 *   That transition is the headline assertion in this file.
 *
 * ★★ AND THE LEVELS ARE METERED, NOT CHOSEN.
 *   The three source files are mastered 9 dB apart (heavy peaks at 0.0 dBFS —
 *   clipping). Left at the 0.55 default that gap is an accident of mastering,
 *   not a design. They are staged at +2 dB per weight, which makes hurtHeavy
 *   carry the SMALLEST volume number while being the loudest in the ear.
 *   That looks backwards on the page, so it is asserted here on purpose.
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
global.Image=function(){return{addEventListener:noop,complete:true,naturalWidth:64,naturalHeight:64,set src(v){this._src=v;},get src(){return this._src;}};};
global.requestAnimationFrame=()=>1;global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0,platform:'MacIntel'};
global.performance={now:()=>CLOCK};
global.URL={createObjectURL:()=>'x',revokeObjectURL:noop};global.Blob=function(){};
global.getComputedStyle=()=>({getPropertyValue:()=>'',display:'block',visibility:'visible'});
const LOG=console.log;console.log=()=>{};console.warn=noop;console.error=noop;
// ★ recording audio nodes · a shim that returns a singleton would make
//   "which of three sounds played" unanswerable
let PLAYED=[];
global.Audio=function(s){return{_src:String(s),volume:1,currentTime:0,ended:false,_l:{},
  addEventListener(e,f){(this._l[e]=this._l[e]||[]).push(f);},removeEventListener:noop,
  pause(){this.ended=true;},load:noop,
  play(){PLAYED.push({src:String(this._src),volume:this.volume});return Promise.resolve();},
  cloneNode(){return global.Audio(this._src);}};};
new Function(src+`;globalThis.__D={player,game,hurtPlayer,playRizerHurtImpact,AUDIO,
 HURT_SFX_MEDIUM_FRAC,HURT_SFX_HEAVY_FRAC,startNewGame,rizerIncomingDamage,
 _UI_SFX,_firePhoneChime,_fireCorsunCue,playSFX,
 setDialog:(v)=>{dialogState=v;}};`)();
let n=0;while(_Q.length&&n<500){const f=_Q.shift();n++;try{f();}catch(_){}}
console.log=LOG;const D=globalThis.__D;
console.log('\n=== IMPACT SFX · the phone chime and the three hits ===\n');

/* ── 1 · THE NOTIFICATION TONE ─────────────────────────────────────── */
const has=s=>PLAYED.some(p=>p.src.includes(s));
t(!!D.AUDIO.sfx.newMessage,'★ newMessage registered');
t(D.AUDIO.sfx.newMessage._src.includes('sfx-new-message.mp3'),'★ points at the shipped file');
t(Math.abs(D.AUDIO.sfx.newMessage.volume-0.42)<1e-9,
  `★ mixed to 0.42 · the measured match to the level-up chime (${D.AUDIO.sfx.newMessage.volume})`);
t(D._UI_SFX.has('newMessage'),'★★ in _UI_SFX · a message arriving with the phone open still chimes');
PLAYED=[];D._firePhoneChime();
t(has('sfx-new-message'),'★★ _firePhoneChime plays the tone');
// ★★★ the tone is NOT gated on the vox
CLOCK+=9000;PLAYED=[];
D.setDialog({speaker:'x',lines:['y'],idx:0,at:0});
D._firePhoneChime();D._fireCorsunCue();
t(has('sfx-new-message'),'★★★ the CHIME fires while an NPC is mid-sentence');
t(!has('sfx-corsun-new-msg'),'★★★ and the VOX still yields · tone yes, voice no');
D.setDialog(null);
CLOCK+=9000;PLAYED=[];D.game.zphoneOpen=true;D._firePhoneChime();
t(has('sfx-new-message'),'★★★ chimes with the PHONE OPEN (worldFrozen)');
D.game.zphoneOpen=false;
CLOCK+=9000;PLAYED=[];
D._firePhoneChime();D._firePhoneChime();D._firePhoneChime();
t(PLAYED.filter(p=>p.src.includes('sfx-new-message')).length===1,
  '★★ three chimes on one frame collapse to one · no machine-gun');
CLOCK+=1000;D._firePhoneChime();
t(PLAYED.filter(p=>p.src.includes('sfx-new-message')).length===2,
  '★ but a genuine later notification chimes again');

/* ── 2 · THE THREE IMPACTS · registration + the metered ladder ──────── */
for(const k of ['hurtLight','hurtMedium','hurtHeavy']) t(!!D.AUDIO.sfx[k],`★ ${k} registered`);
t(D.AUDIO.sfx.hurtLight._src.includes('sfx-hurt-light.mp3')
 &&D.AUDIO.sfx.hurtMedium._src.includes('sfx-hurt-medium.mp3')
 &&D.AUDIO.sfx.hurtHeavy._src.includes('sfx-hurt-heavy.mp3'),'★ all three point at shipped files');
// ★★ measured RMS of the shipped files · if the art is replaced, re-meter
const RMS={hurtLight:-19.1,hurtMedium:-20.0,hurtHeavy:-10.0};
const eff=k=>RMS[k]+20*Math.log10(D.AUDIO.sfx[k].volume);
t(eff('hurtLight')<eff('hurtMedium')&&eff('hurtMedium')<eff('hurtHeavy'),
  `★★★ heavier is LOUDER in the ear (${eff('hurtLight').toFixed(1)} < `
  +`${eff('hurtMedium').toFixed(1)} < ${eff('hurtHeavy').toFixed(1)} dBFS)`);
t(D.AUDIO.sfx.hurtHeavy.volume < D.AUDIO.sfx.hurtLight.volume,
  '★★ ...even though hurtHeavy carries the SMALLEST volume number · the file is hot');
t(eff('hurtHeavy')-eff('hurtLight') < 6,
  `★★ and the spread is a staged ${(eff('hurtHeavy')-eff('hurtLight')).toFixed(1)} dB, not the raw 9 dB of the masters`);

/* ── 3 · ★★★ THE BAND TRACKS HP, NOT THE ENEMY ─────────────────────── */
D.startNewGame();
let q=0;while(_Q.length&&q<500){const f=_Q.shift();q++;try{f();}catch(_){}}
D.game.devNoDefeat=true;
const which=()=>{const p=PLAYED.map(x=>x.src).join('|');
  return /hurt-heavy/.test(p)?'heavy':/hurt-medium/.test(p)?'medium':/hurt-light/.test(p)?'light':'none';};
const hit=a=>{PLAYED=[];D.player._invulnUntil=0;D.player.blocking=false;
  D.player.hp=D.player.hpMax;D.hurtPlayer(a,'t');return which();};
// Lv 1 · hpMax 50 · the measured early game
D.player.hpMax=50;D.player.hp=50;
t(hit(2)==='light',   '★ Lv 1 · a 4% scratch is LIGHT');
t(hit(5)==='medium',  '★★ Lv 1 · a MORI (5 of 50 = 10%) is MEDIUM');
t(hit(10)==='heavy',  '★★★ Lv 1 · a DAEMON (10 of 50 = 20%) is HEAVY');
t(hit(30)==='heavy',  '★ Lv 1 · a 60% blow is HEAVY');
// late game · hpMax 500 · THE SAME ENEMIES
D.player.hpMax=500;D.player.hp=500;
t(hit(5)==='light',   '★★★ late · the SAME Mori is now LIGHT · the band follows YOUR HP');
t(hit(10)==='light',  '★★★ late · the same Daemon is a tap');
t(hit(120)==='heavy', '★ late · but a real threat still lands HEAVY');
// the thresholds are the documented ones
t(Math.abs(D.HURT_SFX_MEDIUM_FRAC-0.08)<1e-9&&Math.abs(D.HURT_SFX_HEAVY_FRAC-0.20)<1e-9,
  '★ the bands are the documented 8% / 20%');

/* ── 4 · edges ─────────────────────────────────────────────────────── */
PLAYED=[];D.playRizerHurtImpact(0);   t(PLAYED.length===0,'★ zero damage is silent');
PLAYED=[];D.playRizerHurtImpact(-5);  t(PLAYED.length===0,'★ negative damage is silent');
PLAYED=[];D.player._invulnUntil=0;D.player.hp=D.player.hpMax;D.hurtPlayer(10,'a');
const firstN=PLAYED.length;D.hurtPlayer(10,'b');
t(PLAYED.length===firstN,'★★ a hit inside the i-frame window is silent · no double thump');
// ★★★ IMPACT ≠ VOX · the Creator was explicit
const body=src.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
const fn=body.slice(body.indexOf('function playRizerHurtImpact'),
                    body.indexOf('function playRizerHurtImpact')+900);
t(!/damageTick|halfHp|threeQuarterHp|ughGyat/.test(fn),
  '★★★ the impact function plays NO Rizer voice line · "these are impact sounds"');
t(/hurtLight|hurtMedium|hurtHeavy/.test(fn),'★ it plays the three impacts');
t(/_checkRizerLowHpWarn/.test(body),'★★ and the existing hurt VO path is still there, untouched');

console.log(`\n${pass} passed · ${fail} failed\n`);
process.exit(fail?1:0);
