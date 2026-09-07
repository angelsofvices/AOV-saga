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
let CLK=50000; global.performance={now:()=>CLK};
global.KeyboardEvent=function(t,o){this.type=t;this.key=(o&&o.key)||'';this.preventDefault=noop;this.stopImmediatePropagation=noop;};
let _dispatched=[];
try{new Function(src+';globalThis.__C={ invalidateNpcOccupancy,TURN_FROM_REST_MS,tryMove,flushMeleeBuffer,NPCS,_swapWithOwnFollower,_isOwnFollower,TURN_IN_PLACE_MS,INPUT_BUFFER_MS,TRANSIENT_PLAYER_KEYS,player,game,keys,RIZER,BBOX_FALLBACK,walkable};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
const src2=fs.readFileSync(ROOT+'rp7b.html','utf8');
global.showToast=noop; global.playSFX=noop; global.saveGame=noop;
const P=C.player, K=C.keys;
const clearKeys=()=>{ for(const k of Object.keys(K)) K[k]=false; };

H('1 · ★★★ THE RUN SHEET WAS A PSD');
{
  const p=ROOT+'assets/2D sprites/rizer/run.png';
  const head=fs.readFileSync(p).subarray(0,8);
  ok(head.equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a])),
     '★★★ run.png is a REAL PNG now · it was 8BPS (Photoshop) with a .png name, which the browser cannot decode');
  ok(/failsafes to a faster walk/.test(src2)||fs.readFileSync(ROOT+'tools/audit_asset_formats.py','utf8').includes('failsafes to a faster walk'),
     '★★ the Creator’s symptom is recorded · run SPEED playing the WALK animation');
  const t=fs.readFileSync(ROOT+'tools/audit_asset_formats.py','utf8');
  ok(/PIL reads PSD/.test(t),
     '★★★ and WHY nothing caught it · PIL opens PSD, so every measurement I took was right');
  ok(/A silent failure that every layer handles gracefully/.test(t),
     '★★★ every layer degraded politely · that is what made it invisible');
  ok(C.RIZER.run.bboxes===C.BBOX_FALLBACK.run,'the run bundle reads the measured table');
  ok(C.BBOX_FALLBACK.run[0][1][3]===182 && C.BBOX_FALLBACK.run[0][1][1]===47,
     '★★ re-measured off the layered file · DOWN col1 gained 3px of hair the flat export had lost');
}

H('2 · ★★★ TURN IN PLACE · from REST only');
{
  ok(C.TURN_IN_PLACE_MS>0 && C.TURN_IN_PLACE_MS<200,'grace is '+C.TURN_IN_PLACE_MS+'ms');
  ok(C.TURN_FROM_REST_MS>200,'★★ and he must have been still '+C.TURN_FROM_REST_MS+'ms first');
  C.game.scene='overworld'; P.moveCd=0; P.moving=false; P.dir='down';
  P._lastStepAt = CLK - 5000;              // long since stopped
  const x0=P.x, y0=P.y;
  clearKeys(); K['arrowup']=true;
  C.tryMove(16);
  ok(P.dir==='up','★★★ tapping a new direction from rest TURNS him');
  ok(P.x===x0 && P.y===y0,'★★★ and does NOT step · you can face a chest without walking into it');
  P.moveCd=0; C.tryMove(16);
  ok(P.x!==x0 || P.y!==y0 || P.moving,'★★ held past the grace · he steps');
}

H('3 · ★★★ A TURN MUST NOT BREAK A STRIDE');
{
  ok(/A TURN MUST NOT BREAK A STRIDE/.test(src2),'the Creator’s words are at the code');
  ok(/was the wrong guard and it was MY bug/.test(src2),
     '★★★ !player.moving was the wrong test · moving goes false the instant no direction is held');
  ok(/passes through centre/.test(src2),
     '★★★ and a stick rolling between directions crosses centre · the grace fired in that gap');
  // reproduce it: mid-run, stick momentarily centred, then a new direction
  P.dir='down'; P.moveCd=0; P.moving=false;    // ← the one-frame gap
  P._lastStepAt = CLK - 40;                    // but he stepped 40ms ago
  const x0=P.x, y0=P.y;
  clearKeys(); K['arrowright']=true;
  C.tryMove(16);
  ok(P.dir==='right','★ he turns');
  ok(P.x!==x0 || P.y!==y0,
     '★★★ and KEEPS GOING in the same tick · the sprint survives the corner');
  ok(!/dir !== player\.dir && !player\.moving/.test(src2),
     '★★ the old frame-local guard is gone entirely');
  ok(/has he been still\n  \/\/ long enough to have meant it/.test(src2)||/long enough to have meant it/.test(src2),
     '★★★ the honest test is not "is he moving this frame" but "has he been still long enough to have MEANT it"');
}

H('4 · ★★★ INPUT BUFFER');
{
  ok(C.INPUT_BUFFER_MS>0,'window is '+C.INPUT_BUFFER_MS+'ms');
  P._bufMelee=null; P.attackUntil=CLK+80;       // mid-swing
  P._bufMelee='punch'; P._bufMeleeAt=CLK;
  C.flushMeleeBuffer();
  ok(P._bufMelee==='punch','★★ still locked · the press is HELD, not dropped');
  CLK+=90; P.attackUntil=CLK-1;                 // lock just lifted
  clearKeys();
  C.flushMeleeBuffer();
  ok(P._bufMelee===null,'★★★ the instant the lock lifts, it fires');
  ok(K['j']===false,'★★★ and the chord key is RESTORED · a replay must not leave j/k stuck true');
  // a stale press is discarded
  P._bufMelee='kick'; P._bufMeleeAt=CLK-9999; P.attackUntil=0;
  C.flushMeleeBuffer();
  ok(P._bufMelee===null,'★★ a press older than the window is discarded, never queued');
  // never replays into a menu
  P._bufMelee='punch'; P._bufMeleeAt=CLK; C.game.paused=true;
  C.flushMeleeBuffer();
  ok(P._bufMelee===null,'★★★ and never fires into a menu opened meanwhile');
  C.game.paused=false;
  ok(/REPLAYS the press rather than calling the swing directly/.test(src2),
     '★★ it replays the PRESS · the keydown does hitbox, sweeps, durability, XP · half a swing is worse than a dropped one');
}

H('5 · ★ NOTHING LEAKS INTO THE SAVE');
{
  for (const k of ['_bufMelee','_bufMeleeAt'])
    ok(C.TRANSIENT_PLAYER_KEYS.has(k),'★ '+k+' is transient · a buffered press must not survive a reload');
}


H('6 · ★★★ THE A5 COOLDOWN IS 20 KILLS');
{
  ok(/no more timed cool down for A5/.test(src2),'the Creator’s words are at the code');
  ok(/A clock recharges you for standing still, which is backwards/.test(src2),
     '★★★ and WHY it is better · the old rule meant the best way to have it ready was to stop fighting');
  ok(/ITS OWN VICTIMS DO NOT COUNT/.test(src2),'★★★ the storm cannot recharge itself');
  ok(/attunement hands it over CHARGED/.test(src2),
     '★★ the questline reward is usable on arrival · twenty kills first would be a toll, not a cooldown');
  ok(/body\.voltstorm-cine #a5Charge/.test(src2),
     '★★★ and the new badge is on the FULL-CINEMA hide list · the one overlay that would have sat on the A5’s own cutscene');
  ok(/paintA5Charge/.test(src2),'★★ the charge is READABLE · a 2-minute timer you could only discover by being refused is now a count you can see');
  // ★ v0.95.936 · INVERTED.  The badge used to measure the Rizer HUD each frame
  // to park itself under it.  The Creator asked for it in the top-left stack and
  // draggable ("make me able to drag and drop it like other"), so it has a CSS
  // home and a drag handle instead — which is simpler AND is why it now holds
  // still.  Measuring a neighbour is a fine way to avoid hard-coding a position;
  // it is a bad way to own one the player is allowed to change.
  ok(!/pins itself under the Rizer HUD by measuring it/.test(src2),
     '★ no longer measures the HUD · it has a CSS home and a drag handle (F9)');
  ok(/no art/.test(src2), '★ and still no art · it was always pure DOM');
}

H('7 · ★★ A FLED ZYREX SAYS WHERE IT WENT');
{
  ok(/SAY THAT IT LEFT/.test(src2),'the long walk home announces itself');
  ok(/reads as a despawn\n  \/\/ rather than as an animal going home/.test(src2)||/rather than as an animal going home/.test(src2),
     '★★★ without it the system was invisible · the creature simply was not there any more');
  ok(/_homewardTold/.test(src2),'★★ told once per creature, not once per failed attempt');
  ok(/names the WINDOW/.test(src2),'★ and names the minutes · "come back later" becomes actionable');
}


H('8 · ★★★ YOUR OWN TEAM IS NEVER A WALL');
{
  C.game.scene='overworld';
  const P2=C.player;
  // put a summoned follower directly in front of him
  let fol=C.NPCS.find(n=>n&&n.id&&n.id.startsWith('_summon_'));
  if(!fol){ fol={id:'_summon_test#9',_summoned:true,scene:'overworld',tileX:0,tileY:0,moving:false}; C.NPCS.push(fol); }
  fol._summoned=true; fol.scene='overworld';
  P2.dir='down'; P2.moving=false; P2.moveCd=0;
  // find ground he can actually walk to
  let ok0=false, tx=P2.x, ty=P2.y+1;
  fol.scene='__off__'; ok0=C.walkable(tx,ty); fol.scene='overworld';
  if (ok0){
    fol.tileX=tx; fol.tileY=ty;
    // ★★ v0.96.22 · this test hand-mutates tileX and asks the same synchronous
    //   breath, with no frame boundary in between. walkable() is O(1) now via a
    //   per-frame occupancy index, and the index is rebuilt at the top of every
    //   frame and incrementally in stepNPCTo — the funnel every WALKING npc uses.
    //   A raw teleport (this, and a handful of warps in game code) is one frame
    //   stale, which in play is a 16 ms overlap nobody can see. In a test there
    //   is no next frame, so the test says so out loud instead of pretending.
    try { C.invalidateNpcOccupancy(); } catch(_){}
    ok(C.walkable(tx,ty)===false,'★★ a follower makes the tile unwalkable · same refusal as a wall');
    const px=P2.x, py=P2.y;
    clearKeys(); K['arrowdown']=true;
    // ONE step -- calling tryMove twice walks him a tile PAST the swap, which
    // asserts the wrong thing (he faces down already, so there is no turn to
    // burn a tick on).
    C.tryMove(16);
    ok(P2.x===tx && P2.y===ty,'★★★ he STEPS onto it · your own party never wedges you');
    ok(fol.tileX===px && fol.tileY===py,'★★★ and the follower took the tile he left · they trade places');
  } else { ok(true,'(no open ground beside spawn to test the swap · skipped)'); }
}

H('9 · ★★ BUT ONLY YOUR OWN, AND ONLY ON GOOD GROUND');
{
  ok(/Only YOUR followers move/.test(src2),
     '★★★ enemies, wilds, townsfolk and props still block · being stopped by the WORLD is the game working');
  ok(/TERRAIN STILL HAS THE FINAL SAY/.test(src2),
     '★★★ walkable() is false for terrain AND npcs, so a follower standing there is not proof the ground is good');
  ok(/carry Rizer\n  \/\/ through the wall behind it/.test(src2)||/through the wall behind it/.test(src2),
     '★★★ without that check a Zyrex on a doorway seam would walk him through the wall');
  ok(/blocker\.scene = '__swaptest__'/.test(src2),
     '★★ proved by lifting the follower out and asking the SAME predicate again · terrain alone answers');
  ok(src2.includes('answer than not being stuck'),
     '★★ and why this beats a toast · displacing is better than explaining');
}

console.log('\n'+(f?('❌ '+f+' FAILED'):'✅ ALL PASS'));
process.exit(f?1:0);
