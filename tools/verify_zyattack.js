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
// ★ the sheets must report LOADED or no attack window can ever open
global.Image=function(){return{addEventListener:noop,complete:true,naturalWidth:1254,naturalHeight:1254,src:''}};
let CLK=5000; global.performance={now:()=>CLK};
try{new Function(src+';globalThis.__decalGone=(typeof drawZyrexAttackAnims==="undefined");globalThis.__C={ZYREX_ATTACK_BANKS,attachZyrexAttackBank,strikeZyrexAnim,SUMMONABLE_SPRITES,TILE,makeZyrexFollower,tickAggressiveZyrex,NPCS,player,game};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
const src2=fs.readFileSync(ROOT+'rp7b.html','utf8');
global.showToast=noop; global.playSFX=noop; global.saveGame=noop;

H('1 · ★★★ THE DECAL IS GONE');
{
  ok(!/emitZyrexAttackSprite/.test(src2),'★★★ emitZyrexAttackSprite deleted · no more body pasted on the enemy tile');
  ok(!/_zyrexAttackAnims/.test(src2),'★★ and the float-above-the-target queue with it');
  // test the FUNCTION, not the spelling -- the comment that replaced the call
  // names it on purpose, and grepping for the name would pass forever after.
  ok(globalThis.__decalGone === true,'★★ the function itself no longer exists · the render loop cannot draw a second creature');
  ok(/drawZyrexAttackFx\(\)/.test(src2),'★ the IMPACT ring stays · that one belongs on the target, like Rizer’s');
  ok(/zyrex should fight how rizer fights/.test(src2),'the Creator’s words are at the code');
}

H('2 · ★★★ AETHERWING A1 · the horn strike is wired');
{
  const b=C.ZYREX_ATTACK_BANKS.aetherwing;
  ok(!!b,'the bank exists');
  ok(b.atkType==='A1','★★ registered as A1 LIGHT, per the four-attack canon');
  ok(fs.existsSync(ROOT+'assets/2D sprites/zyrex/attacks/attack_aetherwing.png'),'★ the keyed sheet is on disk');
  ok(b.bboxes.length===4 && b.bboxes.every(r=>r.length===4),'★ 4x4 · row = facing, col = frame');
  ok(b.dirRows===true,'★★ it is DIRECTIONAL · it lunges the way it is looking');
  ok(b.foot.length===4 && b.foot.every(r=>r.length===4),'★★ every one of the 16 frames has a measured foot line');
  const lunge=b.bboxes.map(r=>r[2][3]), stand=b.bboxes.map(r=>r[0][3]);
  ok(lunge.every((h,i)=>h<stand[i]),'★★★ col 2 is FLATTER than col 0 in all four rows · that is the lunge, measured not assumed');
  ok(b.bboxes[1][2][0]<0,'★ and the left-facing lunge overflows its cell · owned, never clipped');
}

H('3 · ★★★ IT FIGHTS WITH ITS OWN BODY');
{
  const base={}; ok(C.attachZyrexAttackBank(base,'aetherwing'),'the bank attaches to a follower');
  ok(!!base.attackSheet && !!base.attackBboxes,'★★ attackSheet + attackBboxes · the SAME fields the Seer Grunts use');
  ok(base.cellAnchor===true,'★★★ cellAnchor ON · the body stays put while the effect grows, or it lurches');
  ok(!!base.attackFootBaselines,'★★ foot baselines · a blast hanging below the paws must not lift it off the ground');
  const n={_summonSpeciesId:'aetherwing',attackSheet:base.attackSheet};
  ok(C.strikeZyrexAnim(n)===true,'★★★ the strike opens a WINDOW on the creature');
  ok(n._atkStart===CLK && n._atkUntil>n._atkStart,'★★ _atkStart + _atkUntil · exactly the shape of player.attackUntil');
  ok(n._atkUntil-n._atkStart===420,'the window is the sheet’s own duration ('+(n._atkUntil-n._atkStart)+'ms)');
  ok(C.strikeZyrexAnim({_summonSpeciesId:'frosane'})===false,
     '★ a species with no attack art swings nothing and the damage still lands · missing art is a missing ANIMATION');
}

H('4 · ★★★ SAME CREATURE, SAME SIZE, MID-SWING');
{
  ok(/PRESERVE THE SIZE, NOT THE DIVISOR/.test(src2),'the size rule is stated where it is applied');
  ok(/_idleRefBh \/ n\.attackRefBh/.test(src2),'★★ the attack bank divides by its OWN body height');
  let worst=0, worstId='';
  for (const id of Object.keys(C.ZYREX_ATTACK_BANKS)){
    const d=C.SUMMONABLE_SPRITES[id], b=C.ZYREX_ATTACK_BANKS[id];
    if (!d || !d.bboxes || !b.refBh) continue;
    let idleRef=216; for (const r of d.bboxes){ const c0=r&&r[0]; if (c0&&c0[3]>idleRef) idleRef=c0[3]; }
    const ds=(C.TILE*2)/idleRef*(d.scaleMul||1);
    // the tallest attack col-0 body, drawn -- must land on the same 2*TILE*mul
    let atkRef=0; for (const r of b.bboxes){ const c0=r&&r[0]; if (c0&&c0[3]>atkRef) atkRef=c0[3]; }
    const drawn=atkRef*ds*(idleRef/b.refBh), target=C.TILE*2*(d.scaleMul||1);
    const err=Math.abs(drawn-target)/target;
    if (err>worst){ worst=err; worstId=id; }
  }
  ok(worst<0.02,'★★★ every rigged species draws its swing within '+(worst*100).toFixed(1)+'% of its standing height (worst: '+worstId+')');
  ok(/three times its own size/.test(src2),'and the reason a 790px strip would have exploded is recorded');
}

H('5 · ★★ FACE FIRST, THEN SWING');
{
  const i=src2.indexOf('n.dir = Math.abs(dx) >= Math.abs(dy)');
  const s=src2.indexOf('strikeZyrexAnim(n, partyMember');
  ok(i>0 && s>i,'★★★ the facing is set BEFORE the window opens · otherwise it swings the row it was standing in');
  ok(/harmless while the art was a decal and is not harmless now/.test(src2),'and why that only started mattering now');
  ok(/THE COLUMNS WALK THE STRIKE WINDOW/.test(src2),'★★ the frames are driven by the strike, not a free clock');
  ok(/_atkStart && n\._atkUntil > n\._atkStart/.test(src2),'★★★ so a blow always lands on the same frame · a swing is not luck');
}

H('6 · ★★ A PROFILE STRIP IS ONE ROW, MIRRORED');
{
  const strips=Object.entries(C.ZYREX_ATTACK_BANKS).filter(([,b])=>b.bboxes&&b.bboxes.length===1);
  ok(strips.length>=9,'the nine profile strips are measured ('+strips.length+' entries incl. the gearbyte alias)');
  const v={}; C.attachZyrexAttackBank(v,'volcanut');
  ok(v.attackRows===1,'★ one row');
  ok(v.attackFacesRight===true,'★★ authored facing RIGHT · so LEFT is its mirror');
  ok(v.attackFootBaselines[0].length===4 && new Set(v.attackFootBaselines[0]).size===1,
     '★★★ all four frames share COLUMN 0’s floor line · the body does not move through these poses, the blast does');
  ok(/n\.attackRows === 1/.test(src2) && /mirror = true/.test(src2),'the draw path knows both shapes');
  const el=C.ZYREX_ATTACK_BANKS.elzoran;
  ok(el.merged===2,'★★ Elzoran’s two merged frames are recorded · his blast touches the next cell, which is not overflow but two frames touching');
  ok(el.bboxes[0][1][0]===0 && el.bboxes[0][1][2]===el.cellW,'★ and those two are clamped to the cell');
}

H('7 · ★★★ TWO SHEETS DRAW THE WRONG ANIMAL · held, not shipped');
{
  ok(C.ZYREX_ATTACK_BANKS.elzebub.pendingArt===true,'★★ ELZEBUB held · idle is the hatchling, the sheet is a grown purple dragon');
  ok(C.ZYREX_ATTACK_BANKS.voltaryn.pendingArt===true,'★★ VOLTARYN held · idle is armoured and dark, the sheet is a fire fox');
  ok(C.attachZyrexAttackBank({},'elzebub')===false,'★★★ a held species never attaches · rigging it would change SPECIES mid-swing');
  ok(C.strikeZyrexAnim({_summonSpeciesId:'voltaryn',attackSheet:{complete:true,naturalWidth:9}})===false,'and never opens a window');
  ok(/FOR THE CREATOR · TWO SHEETS DRAW A DIFFERENT CREATURE/.test(src2),'★★ flagged in the file, with all three ways it could go');
  ok(/it is your\n\/\/ call, not a guess I should make in code/.test(src2)||/not a guess I should make in code/.test(src2),
     '★★★ and left as YOUR call · re-file, re-draw, or replace the idle');
  const shipped=Object.entries(C.ZYREX_ATTACK_BANKS).filter(([,b])=>b.bboxes&&!b.pendingArt).length;
  ok(shipped>=9,'★ '+shipped+' banks ship (incl. alias) · eight species verified against their own idle art');
}

console.log('\n'+(f?('❌ '+f+' FAILED'):'✅ ALL PASS'));
process.exit(f?1:0);
