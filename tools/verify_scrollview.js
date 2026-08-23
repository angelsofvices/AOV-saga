const fs = require('fs');
const _harnessSrc = fs.readFileSync('/tmp/all.js', 'utf8');
const noop = () => {};
global.setInterval = () => 0; global.setTimeout = () => 0;
global.clearInterval = noop; global.clearTimeout = noop;
const CTX = new Proxy({}, { get: () => () => ({ addColorStop: noop, width:0, height:0, data:[] }) });
const el = () => ({ style:{}, dataset:{}, classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},
  width:960, height:540, value:'', textContent:'', innerHTML:'', children:[], childNodes:[],
  getContext:()=>CTX, appendChild:noop, removeChild:noop, addEventListener:noop, removeEventListener:noop,
  setAttribute:noop, getAttribute:()=>null, focus:noop, remove:noop, play:()=>Promise.resolve(), pause:noop,
  querySelector:()=>el(), querySelectorAll:()=>[], getBoundingClientRect:()=>({left:0,top:0,width:960,height:540}) });
global.addEventListener = noop; global.removeEventListener = noop;
global.document = { getElementById:()=>el(), querySelector:()=>el(), querySelectorAll:()=>[],
  createElement:()=>el(), addEventListener:noop, body:el(), documentElement:el(), head:el(),
  hidden:false, visibilityState:'visible' };
global.window = global;
global.localStorage = { getItem:()=>null, setItem:noop, removeItem:noop };
global.Audio = function(){ return { play:()=>Promise.resolve(), pause:noop, addEventListener:noop, cloneNode(){return this} }; };
global.Image = function(){ return { addEventListener:noop, complete:false, naturalWidth:0, src:'' }; };
global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = noop;
global.matchMedia = () => ({ matches:false, addEventListener:noop, addListener:noop });
global.navigator = { userAgent:'node', getGamepads:()=>[], maxTouchPoints:0 };
global.performance = { now: () => Date.now() };
global.getComputedStyle = () => ({ getPropertyValue: () => '' });
// verify_whud · v0.95.784 · the weapon wheel shows what is in hand
// verify_scrollview · v0.95.816 · parchment overlay + scanobot text box + paper sfx
const FS=require('fs');
try{new Function(FS.readFileSync('/tmp/all.js','utf8')+
  ';globalThis.__C={player,game,SCROLL_FRAME_META,SCROLL_FRAME_CELL,SCROLL_THEMES,SCROLL_DISTRICT_ORDER,'+
  'openScrollView,closeScrollView,openScrollTheme,notebookState,scrollId,readScroll,DIALOG_FRAMES,scanobotTalk,NPCS,'+
  'buildScanobotNet,applyScanobotState,AUDIO,WORLD_PROPS,_propBlocked,spawnArrowBundle,addBowArrows,maybeSpillChestArrows,CHEST_ARROW_ODDS,ARROW_BUNDLE_ARROWS,ARROW_BUNDLE_PRICE,BOW_MAX,walkable,dialogState:()=>dialogState};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let fail=0;
const ok=(c,m)=>{ console.log(`  ${c?'✅':'❌'} ${m}`); if(!c) fail++; };
const H=t=>console.log('\n'+t);
const src=FS.readFileSync('/tmp/all.js','utf8');
const html=FS.readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html','utf8');
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';

H('1 · ★★ EIGHTEEN FRAMES, MEASURED, LABELS STRIPPED');
// Creator: "each of the 18 match the 18 overworld ground scrolls. 1-18."
{
  ok(C.SCROLL_FRAME_META.length===18,'18 frame entries');
  ok(C.SCROLL_THEMES.length===18,'matching the 18 scroll themes 1:1 by index');
  for (let i=1;i<=18;i++)
    if (!FS.existsSync(ROOT+`assets/2D sprites/ui/scrolls/frame_${String(i).padStart(2,'0')}.png`))
      ok(false,`frame_${i} missing`);
  ok(true,'all 18 frame files on disk');
  // ★ the yellow index labels were separate components on the magenta and are
  //   GONE — a "7" floating beside the bone scroll would read as art
  const {execFileSync}=require('child_process');
  // ★ MY FIRST TEST HERE WAS WRONG: it counted raw "yellow" pixels, and warm
  //   parchment tan satisfies the same predicate — 225k matches on a sheet with
  //   zero labels.  The labels were separate small floating components; count
  //   THOSE (label-sized comps that are majority label-yellow), expect none.
  const labels=+execFileSync('python3',['-c',`
from PIL import Image
import numpy as np
from collections import deque
a=np.array(Image.open('${ROOT}assets/2D sprites/ui/scrolls/scroll-frames.png').convert('RGBA'))
A=a[...,3]>16
H,W=A.shape; lab=np.zeros((H,W),np.int32); found=0
for y0,x0 in zip(*np.nonzero(A)):
    if lab[y0,x0]: continue
    q=deque([(y0,x0)]); lab[y0,x0]=1; px=[]
    while q:
        y,x=q.popleft(); px.append((y,x))
        for dy in(-1,0,1):
            for dx in(-1,0,1):
                ny,nx=y+dy,x+dx
                if 0<=ny<H and 0<=nx<W and A[ny,nx] and not lab[ny,nx]:
                    lab[ny,nx]=1; q.append((ny,nx))
    if len(px)>4000: continue
    rr=np.array([a[y,x,0] for y,x in px],int); gg=np.array([a[y,x,1] for y,x in px],int); bb=np.array([a[y,x,2] for y,x in px],int)
    if ((rr>190)&(gg>150)&(bb<120)).mean()>0.5: found+=1
print(found)`],{encoding:'utf8'}).trim();
  ok(labels===0,`★ zero label-sized yellow components survive — the digits are gone, the parchment is not`);
  // ★ every inner rect sits INSIDE its bbox · the writable area cannot leak
  //   off the parchment
  for (const [i,M] of C.SCROLL_FRAME_META.entries()){
    const [bx,by,bw,bh]=M.bbox,[ix,iy,iw,ih]=M.inner;
    if (!(ix>=bx&&iy>=by&&ix+iw<=bx+bw&&iy+ih<=by+bh))
      ok(false,`frame ${i+1} inner rect leaks off its parchment`);
  }
  ok(true,'★ every inner writing rect sits inside its own parchment — margins come from the ART');
}

H('2 · ★★ THE OVERLAY IS BUILT LIKE THE POSTER ZOOM');
{
  ok(/id="scrollView"/.test(html),'the fullscreen overlay exists');
  ok(/rgba\(0,0,0,0\.78\)/.test(html.slice(html.indexOf('id="scrollView"')-300, html.indexOf('id="scrollView"')+300)),
     'over a dimmed world');
  ok(/text-align:justify; text-align-last:center/.test(html),
     '★ justified paragraphs with centred last lines — the asked-for typography, in CSS where it is free');
  const ov=src.indexOf('function openScrollView');
  const body=src.slice(ov, ov+2600);
  ok(/game\.posterViewOpen = true/.test(body),
     '★ it rides the poster gate — every modal check in the game already knows that flag');
  ok(/while \(size > 7 && txt\.scrollHeight > txt\.clientHeight/.test(body),
     '★ FIT BY MEASUREMENT · the font shrinks only until the text stops overflowing');
  ok(/playSFX\('scrollOpen'\)/.test(body),'and the paper unrolls audibly');
  ok(FS.existsSync(ROOT+'audio/sfx-scroll-open.mp3'),'with the Creator\'s clip on disk');
  // close routing · B/ESC closes the scroll view, not the poster under the shared flag
  ok(/if \(game\.scrollViewOpen\) closeScrollView\(\); else closePosterView\(\)/.test(src),
     'B/ESC closes whichever of the two shared-flag views is open');
}

H('3 · ★★ BOTH DOORS OPEN THE SAME PARCHMENT');
{
  // ── the WORLD door · picking a scroll up ──────────────────────────
  const rs=src.indexOf('function readScroll');
  const rb=src.slice(rs, rs+1800);
  ok(/openScrollView\(_ti/.test(rb),'★ picking up a ground scroll opens its parchment');
  ok(/findIndex\(t => t\.key === themeKey\)/.test(rb),'in the frame matching ITS theme, 1-18');
  ok(/catch\(_\)\{\s*showDialog/.test(rb),'with the old dialog kept as the fallback');
  // ── the PHONE door ────────────────────────────────────────────────
  ok(/onclick="try\{openScrollTheme\('\$\{t\.key\}'\)/.test(src),'★ a theme row in the phone opens the same view');
  const P=C.player; P.notebook=null;
  const t0=C.SCROLL_THEMES[0];
  const n=C.notebookState();
  n.scrolls[C.scrollId(t0.key,'malezor')]=1;
  n.scrolls[C.scrollId(t0.key,'zarvane')]=1;
  C.openScrollTheme(t0.key);
  ok(C.game.scrollViewOpen===true,'and it actually opens with pages recovered');
  C.closeScrollView();
  ok(C.game.scrollViewOpen===false&&C.game.posterViewOpen===false,'and closes clean, releasing the shared gate');
  P.notebook=null;
  C.openScrollTheme(t0.key);
  ok(!C.game.scrollViewOpen,'a theme with NO pages refuses politely instead of showing a blank parchment');
}

H('4 · ★★ THE SCANOBOT SPEAKS THROUGH ITS OWN BOX');
// Creator: "scanobot text box for jailbreak toast success or failure"
{
  ok(!!C.DIALOG_FRAMES.SCANOBOT,'★ the SCANOBOT frame is registered');
  ok(C.DIALOG_FRAMES.SCANOBOT.hasName===false,'name plate is baked into the art, so the renderer does not double it');
  ok(FS.existsSync(ROOT+'assets/2D sprites/ui/dialog-scanobot.png'),'the keyed art is on disk');
  const jt=src.indexOf('function scanobotTalk');
  const jb=src.slice(jt, jt+3200);
  ok((jb.match(/speaker: 'SCANOBOT'/g)||[]).length===2,
     '★ BOTH verdicts — clean extraction and tamper protocol — speak through it');
  ok(!/showToast\('★ JAILBREAK/.test(jb)&&!/showToast\('◈ JAILBREAK FAILED/.test(jb),
     'and the plain toasts they replace are gone');
}


H('5 · ★★ ARROW BUNDLES · SOLID, TAKEN WITH X, ELEVEN A BUNDLE');
// Creator: "bundle of arrows chest drop item ... walk over and interact for
// pick up add temp item collision"
{
  const P=C.player; C.game.scene='overworld';
  P.items=P.items||{}; P.items.pearlbow=1;
  P.bowDurability=5; P.bowBroken=false;
  const prop=C.spawnArrowBundle(58, 103, 2, 'test');
  ok(!!prop,'a bundle spawns beside the chest');
  ok(prop.footprint&&prop.footprint.length===1,'★ it is SOLID — temp item collision, as asked');
  ok(C._propBlocked.has(`${prop.tileX},${prop.tileY}`),'and really registered in the collision table');
  ok(prop.door&&prop.door[0]===0,'X reaches it from any adjacent tile');
  prop.onInteract();
  ok(P.bowDurability===5+2*C.ARROW_BUNDLE_ARROWS,`★ two bundles = +${2*C.ARROW_BUNDLE_ARROWS} arrows (${P.bowDurability})`);
  ok(!C.WORLD_PROPS.includes(prop),'the bundle leaves the world when taken');
  ok(!C._propBlocked.has(`${prop.tileX},${prop.tileY}`),'★ and its collision leaves with it — no ghost walls');
  // ── the cap, and the un-break ─────────────────────────────────────
  P.bowDurability=C.BOW_MAX-3;
  const got=C.addBowArrows(C.ARROW_BUNDLE_ARROWS);
  ok(P.bowDurability===C.BOW_MAX&&got===3,`the quiver caps at ${C.BOW_MAX} — a bundle tops up, never overflows`);
  P.bowDurability=0; P.bowBroken=true;
  C.addBowArrows(C.ARROW_BUNDLE_ARROWS);
  ok(P.bowBroken===false,'★ arrows UN-BREAK a dry bow — broken never meant snapped, it meant empty');
  // no bow · the bundle refuses and stays
  const p2=C.spawnArrowBundle(60, 103, 1, 'test2');
  delete P.items.pearlbow;
  p2.onInteract();
  ok(C.WORLD_PROPS.includes(p2),'with no bow the bundle stays where it is');
  P.items.pearlbow=1; p2.onInteract();
  ok(!C.WORLD_PROPS.includes(p2),'and hands over the moment you own one');
}

H('6 · ★★ THE CHEST ODDS LADDER · 25/50/75 · COSMIC NONE');
{
  const O=C.CHEST_ARROW_ODDS;
  ok(O.wood.p===0.25&&O.wood.n===1,'wood · 25% at 1 bundle');
  ok(O.silver.p===0.50&&O.silver.n===2,'silver · 50% at 2');
  ok(O.gold.p===0.75&&O.gold.n===3,'gold · 75% at 3');
  ok(O.cosmic.p===0&&O.cosmic.n===0,'★ cosmic none — the top chest carries relics, not consumables');
  // the roll is HOOKED where every chest already pays
  ok(/maybeSpillChestArrows\(chest, tier\)/.test(src),'the roll rides spillChestCoins — no per-chest wiring');
  // 3 = the definition's own signature + the two call sites
  ok((src.match(/maybeSpillChestArrows\(chest, tier\)/g)||[]).length===3,'on BOTH the overworld and the indoor path');
  // rig the dice both ways
  const P=C.player; P.items.pearlbow=1;
  const before=C.WORLD_PROPS.length;
  const real=Math.random;
  Math.random=()=>0.99;
  ok(C.maybeSpillChestArrows({tileX:58,tileY:103,id:'t'},'gold')===0,'a 0.99 roll against 75% spawns nothing');
  Math.random=()=>0.01;
  ok(C.maybeSpillChestArrows({tileX:58,tileY:103,id:'t'},'gold')===3,'a 0.01 roll pays the full 3 bundles');
  ok(C.maybeSpillChestArrows({tileX:58,tileY:103,id:'t'},'cosmic')===0,'and cosmic never pays at ANY roll');
  Math.random=real;
  // ★ gated on owning the bow · ammo for a weapon you do not own is noise
  delete P.items.pearlbow;
  Math.random=()=>0.01;
  ok(C.maybeSpillChestArrows({tileX:58,tileY:103,id:'t'},'gold')===0,'★ no bow, no bundles — the chest keeps its dignity');
  Math.random=real; P.items.pearlbow=1;
  // clean up spawned test props
  for (let i=C.WORLD_PROPS.length-1;i>=before;i--){
    const p=C.WORLD_PROPS[i];
    if (p&&p._arrowBundle){ C.WORLD_PROPS.splice(i,1); }
  }
}

H('7 · ★ SCRAPJAW SELLS THEM · 300 COINS · ROOM REQUIRED');
{
  ok(C.ARROW_BUNDLE_PRICE===300,'300 coins a bundle');
  const i=src.indexOf('ARROW BUNDLES · 300 coins each');
  ok(i>0,'the purchase branch exists in his talk chain');
  const b=src.slice(i-800,i+900);
  ok(/coins \|\| 0\) >= ARROW_BUNDLE_PRICE/.test(b),'gated on affording it');
  ok(/<= BOW_MAX - ARROW_BUNDLE_ARROWS/.test(b),
     '★ and on the quiver having room for a FULL bundle — he never sells arrows he would have to shave');
  ok(/coins -= ARROW_BUNDLE_PRICE/.test(b),'and he actually charges');
}

console.log('\n'+(fail?`❌ ${fail} CHECK(S) FAILED`:'✅ ALL CHECKS PASS'));
process.exit(fail?1:0);
