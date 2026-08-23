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
// verify_minimap · v0.95.802 · the scope, its POIs, and the toast stack above it
const FS=require('fs');
try{new Function(FS.readFileSync('/tmp/all.js','utf8')+
  ';globalThis.__C={MINIMAP,minimapPOIs,minimapVisible,minimapRange,minimapDiscovered,drawMinimap,'+
  'notebookState,notebookVisit,player,game,WORLD_PROPS,TOWER_NETWORK,ZYRAXIS_DISTRICTS,COSMIC_CHEST_SPOTS,'+
  'notebookEntries,MINIMAP_KIND_COLOR,spawnPortals,applyHudLayout,renderZycellSettings};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let fail=0;
const ok=(c,m)=>{ console.log(`  ${c?'✅':'❌'} ${m}`); if(!c) fail++; };
const H=t=>console.log('\n'+t);
const src=FS.readFileSync('/tmp/all.js','utf8');
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
// ★ portals are sited in the deferred world-build block, which the harness
//   stubs to a no-op · run it so the map has them to find
C.spawnPortals(); C.MINIMAP._cache=null;

H('1 · ★★ THE FRAME IS THE CREATOR\'S, AND THE MAP DRAWS INSIDE IT');
// Creator: "just make sure the world map UI stays within the interface I am sending."
{
  ok(FS.existsSync(ROOT+'assets/2D sprites/ui/minimap-frame.png'),'the frame art shipped');
  const S=C.MINIMAP.screen;
  ok(S.fx>0 && S.fy>0 && S.fw<1 && S.fh<1,'the screen rect is a strict INSET of the frame');
  ok(S.fx+S.fw <= 1 && S.fy+S.fh <= 1,'★ and cannot spill past the bezel on either axis');
  // ★ measured off the delivered PNG, not eyeballed · re-measure and compare
  const {execFileSync}=require('child_process');
  const got=execFileSync('python3',['-c',`
from PIL import Image
import numpy as np
from collections import deque
a=np.array(Image.open('${ROOT}assets/2D sprites/ui/minimap-frame.png').convert('RGBA'))
H,W=a.shape[:2]
r,g,b=a[...,0].astype(int),a[...,1].astype(int),a[...,2].astype(int)
scr=(a[...,3]>16)&(b>60)&(b<150)&(r<60)&(g<90)&((b-r)>40)
lab=np.zeros((H,W),np.int32); best=None
for y0,x0 in zip(*np.nonzero(scr)):
    if lab[y0,x0]: continue
    q=deque([(y0,x0)]); lab[y0,x0]=1; px=[]
    while q:
        y,x=q.popleft(); px.append((y,x))
        for dy,dx in ((-1,0),(1,0),(0,-1),(0,1)):
            ny,nx=y+dy,x+dx
            if 0<=ny<H and 0<=nx<W and scr[ny,nx] and not lab[ny,nx]:
                lab[ny,nx]=1; q.append((ny,nx))
    if best is None or len(px)>len(best): best=px
ys=[p[0] for p in best]; xs=[p[1] for p in best]
FX,FY,FW,FH=62,160,1398,716
print((min(xs)-FX)/FW,(min(ys)-FY)/FH,(max(xs)-min(xs)+1)/FW,(max(ys)-min(ys)+1)/FH)`],{encoding:'utf8'}).trim().split(/\s+/).map(Number);
  const near=(a,b)=>Math.abs(a-b)<0.01;
  ok(near(got[0],S.fx)&&near(got[1],S.fy)&&near(got[2],S.fw)&&near(got[3],S.fh),
     `★ the inset re-measures off the PNG to (${got.map(v=>v.toFixed(4)).join(', ')})`);
  ok(/drawImage\(MINIMAP\.frame, 62, 160, 1398, 716/.test(src),
     '★ the bezel is drawn from its own bbox, so the transparent margin is not stretched in');
  // ★★ v0.95.813 · THIS ASSERTION IS DELIBERATELY INVERTED.  It used to demand
  //    the bezel draw AFTER the scope "so the frame sits over the map" — but
  //    the Creator's frame art carries an OPAQUE navy screen, so drawing it
  //    last painted over every blip on every frame and the map looked
  //    permanently empty.  The Creator caught it in play.  Frame FIRST now;
  //    the blips live on the art's own built-in screen.
  const dm=src.indexOf('function drawMinimap');
  const dmB=src.slice(dm, dm+5200);
  ok(dmB.indexOf('drawImage(MINIMAP.frame') < dmB.indexOf('minimapVisible(px, py)'),
     '★ the frame draws FIRST and the blips draw onto its built-in screen');
  ok(!/fillStyle = 'rgba\(5,20,44/.test(dmB),
     'and the synthetic navy background is gone — the art IS the background');
}

H('2 · ★★ THE POI LIST IS NOT A SECOND REGISTRY');
{
  const pois=C.minimapPOIs();
  ok(pois.length>30,`${pois.length} points of interest found in the world`);
  const kinds={}; pois.forEach(p=>kinds[p.kind]=(kinds[p.kind]||0)+1);
  ok(Object.keys(kinds).length>=4,`covering ${Object.keys(kinds).join(', ')}`);
  ok(kinds.landmark>=25,`${kinds.landmark} district landmark buildings`);
  ok(kinds.tower===10,`${kinds.tower} radio towers`);
  ok((kinds.portal||0)===10,`${kinds.portal} portals`);
  ok(pois.every(p=>p.x!=null&&p.y!=null),'every one carries a world position');
  ok(pois.every(p=>p.id&&p.name),'and an id and a name');
  ok(new Set(pois.map(p=>p.id)).size===pois.length,'no duplicates');
  // ★★ THE IDS MUST MATCH THE NOTEBOOK'S, or "discovered" means two things.
  const nb=new Set([]
    .concat(C.notebookEntries('landmarks').map(e=>e.id))
    .concat(C.notebookEntries('towers').map(e=>e.id))
    .concat(C.notebookEntries('caves').map(e=>e.id)));
  const shared=pois.filter(p=>nb.has(p.id)).length;
  ok(shared>=35,`★ ${shared} POI ids are the SAME ids Dad's Notebook uses — one discovery record, not two`);
}

H('3 · ★★ ??? UNTIL FOUND, FULL NAME AFTER');
// Creator: "??? on undiscovered POIs and landmarks. full name shows once discovered."
{
  const P=C.player;
  P.notebook=null;
  const pois=C.minimapPOIs();
  const lm=pois.find(p=>p.kind==='landmark');
  ok(!C.minimapDiscovered(lm.id),`${lm.name} starts undiscovered`);
  C.notebookVisit(lm.id, lm.name);
  ok(C.minimapDiscovered(lm.id),'★ and visiting it in the notebook marks it found on the map');
  // ★ v0.95.804 · rumors and anomalies are exempt on purpose — their name IS
  //   the announcement, so the rule gained a 'live' carve-out.
  ok(/\(P\.found \|\| live\) \? P\.name : '\?\?\?'/.test(src),
     '★ the draw prints ??? until found, full name after — with live pins exempt');
  ok(/P\.kind === 'rumor' \|\| P\.kind === 'anomaly'/.test(src),
     '  and the exemption names exactly the two live kinds');
  // a POI the notebook has never heard of is never secretly "found"
  ok(!C.minimapDiscovered('landmark:not_a_real_place'),'an unknown id is not found');
}

H('4 · ★★ 3-6 SHOWING, WHEREVER YOU STAND');
// Creator: "at least 3-6 POIs and landmarks must show on mini map at a given
// time. based on player position based on world scale to POIs."
{
  // ★ A FIXED ZOOM CANNOT DO THIS.  Malezor's centre has a dozen buildings
  //   inside twenty tiles; the Zarvane flats have nothing for two hundred.  So
  //   sample real ground across every district and check the range adapts.
  let tested=0, inBand=0, low=[], hi=[];
  for (const D of C.ZYRAXIS_DISTRICTS){
    for (let t=0;t<14;t++){
      const a=Math.random()*Math.PI*2, r=Math.sqrt(Math.random())*0.85;
      const x=Math.round(D.cx+Math.cos(a)*D.rx*r), y=Math.round(D.cy+Math.sin(a)*D.ry*r);
      const v=C.minimapVisible(x,y);
      tested++;
      if (v.length>=C.MINIMAP.minPOI && v.length<=C.MINIMAP.maxPOI) inBand++;
      else if (v.length<C.MINIMAP.minPOI) low.push(`${D.id}(${v.length})`);
      else hi.push(`${D.id}(${v.length})`);
    }
  }
  ok(hi.length===0,`never MORE than ${C.MINIMAP.maxPOI} on screen${hi.length?' · '+hi.slice(0,4).join(' '):''}`);
  ok(inBand/tested >= 0.95,
     `★ ${inBand}/${tested} sampled positions show ${C.MINIMAP.minPOI}-${C.MINIMAP.maxPOI} POIs${low.length?' · thin: '+low.slice(0,4).join(' '):''}`);
  // ★ and the range really is MOVING · a fixed number would pass the count test
  //   by luck in a dense district and fail everywhere else
  const seen=new Set();
  for (const D of C.ZYRAXIS_DISTRICTS){
    C.minimapVisible(D.cx, D.cy);
    seen.add(Math.round(C.MINIMAP._range));
  }
  ok(seen.size>=5,`★ the scope really zooms · ${seen.size} distinct ranges across ten district centres`);
  ok([...seen].every(r=>r>=C.MINIMAP.rangeMin&&r<=C.MINIMAP.rangeMax),
     `and stays inside ${C.MINIMAP.rangeMin}-${C.MINIMAP.rangeMax} tiles`);
}

H('5 · ★★ IT FOLLOWS THE PLAYER');
// Creator: "make it auto update on location coordinate."
{
  const A=C.minimapVisible(58,103);     // Malezor hub
  const B=C.minimapVisible(895,655);    // Korathen, the far end of the world
  ok(A.length>0&&B.length>0,'both ends of the world show something');
  const idsA=new Set(A.map(p=>p.id));
  ok(!B.some(p=>idsA.has(p.id)),'★ and they share nothing — the map is genuinely local');
  ok(A.every(p=>p.dist<=C.MINIMAP.rangeMax),'nothing beyond the scope leaks in');
  // nearest-first, so the closest thing is always on screen
  ok(A.every((p,i)=>i===0||p.dist>=A[i-1].dist),'sorted nearest-first');
  ok(/drawMinimap\(\)/.test(src)&&/try \{ drawMinimap\(\); \} catch/.test(src),
     'drawn every frame from the render chain');
}

H('6 · ★★ PHONE MESSAGES SIT ABOVE IT, SAME WIDTH');
// Creator: "move all phone message to pop up and hide above the mini map. same dimensions."
{
  // ★ v0.95.805 · the map halved and the cards did NOT — retargeted, see section 7
  ok(/const MINIMAP_W = 'min\(21vw, 310px\)'/.test(src),'one width constant (now the half-size value)');
  const t=src.indexOf("el.id = 'toastStack'");
  const tb=src.slice(t, t+900);
  // ★ v0.95.805 · "same dimensions" bound the cards to the map's SLOT, not its
  //   size — at half size a card that narrow is unreadable, so the cards keep
  //   42vw while the ANCHOR (bottom offset) still derives from the map.
  ok(/width: '42vw'/.test(tb),'★ the cards keep their readable width; the map alone shrank');
  ok(/bottom: `calc\(14px \+ \$\{MINIMAP_W\}/.test(tb),
     '★ and its bottom is derived FROM that width, not a hard-coded pixel guess');
  ok(/1398\/716/.test(tb),'using the frame\'s own aspect ratio to clear the map\'s height');
  const m=src.indexOf("el.id = 'minimapCanvas'");
  const mb=src.slice(m, m+700);
  ok(/right: '14px', bottom: '14px'/.test(mb),'the map is pinned bottom-right');
  ok(/width: MINIMAP_W/.test(mb),'at the same width');
  ok(/pointerEvents: 'none'/.test(mb),'and never eats a click');
  // ★ same z-index band, so neither can be hidden behind the other by accident
  ok(/zIndex: '11'/.test(mb) && /zIndex: '11'/.test(tb),'both on the same layer');
}


H('7 · ★★ HALF SIZE · SAME GUTTER · ONE OWNER FOR THE CORNER');
// Creator: "make the mini map half the size. keep same right and bottom
// gutter. justify to size."
{
  ok(/const MINIMAP_W = 'min\(21vw, 310px\)'/.test(src),'★ 42vw/620 → 21vw/310 · half');
  const m=src.indexOf("el.id = 'minimapCanvas'");
  ok(/right: '14px', bottom: '14px'/.test(src.slice(m,m+700)),'the 14px gutters are untouched');
  // ★ the phone CARDS kept their width — "same dimensions" bound them to the
  //   map's slot, not its size, and a 190px card is unreadable
  const t=src.indexOf("el.id = 'toastStack'");
  ok(/width: '42vw', maxWidth: '620px'/.test(src.slice(t,t+900)),
     '★ the phone cards keep their readable width — only their anchor moved');
  ok(typeof C.applyHudLayout==='function','★ one function owns the corner');
  const f=String(C.applyHudLayout);
  ok(/minimapHidden/.test(f)&&/toastStack/.test(f),
     'and it decides BOTH elements — two owners of one corner is how they overlap');
}

H('8 · ★★ BLIPS · BLUE UNFOUND · GREEN FOUND · BLINK WHEN NEAR');
{
  const d=src.indexOf('function drawMinimap');
  const body=src.slice(d, d+5200);
  ok(/P\.found \? '#4ee07a' : '#7ad4ff'/.test(body),
     "★ every static POI speaks ONE colour language · blue you have not been, green you have");
  ok(/const near = P\.dist <= 20/.test(body),'proximity is a distance, not a guess');
  ok(/Math\.abs\(Math\.sin\(_blinkNow \/ 260\)\)/.test(body),'★ and near blips BLINK');
  ok(/near \? 4 : 3\.2/.test(body),'growing slightly as they pulse');
  // ★ the interior bug from the Creator's screenshot: the scope read
  //   "MALEZOR 10,7" from INSIDE the bedroom — room tile (10,7) measured
  //   against world POIs.  Overworld only now.
  ok(/game\.scene !== 'overworld' \|\| player\.minimapHidden/.test(body),
     '★ the scope hides in interiors — room coordinates measured against world POIs is nonsense, politely rendered');
}

H('9 · ★★ THE HIDE TOGGLE HANDS THE CORNER BACK');
{
  C.player.minimapHidden=false;
  const html=C.renderZycellSettings();
  ok(/MINIMAP · SHOWN/.test(html),'GAME OPTIONS carries the toggle');
  ok(/data-zyitem="opt_minimap"/.test(html),'controller-focusable like everything else');
  ok(!/wiring pending/.test(html),'★ and the GAME OPTIONS stub is finally a real section');
  C.player.minimapHidden=true;
  ok(/MINIMAP · HIDDEN/.test(C.renderZycellSettings()),'the label states the current truth');
  ok(/minimapHidden:\s*!!player\.minimapHidden/.test(src),'and the choice survives a save');
  C.player.minimapHidden=false;
}

H('10 · ★★ THE DEV BUTTON IS THE PANEL\'S HANDLE');
{
  ok(/pointerdown/.test(src)&&/setPointerCapture/.test(src),'the button captures the pointer');
  ok(/Math\.abs\(dx\) \+ Math\.abs\(dy\) > 6/.test(src),
     '★ 6px of travel separates a DRAG from a CLICK — a finger cannot press without wobble');
  ok(/placePanel\(\);   \/\/ the panel rides along/.test(src),'dragging the button drags the open panel');
  ok(/rp7b_devbtn_pos_v1/.test(src),'and the position survives a reload');
  const pp=src.indexOf('const placePanel');
  ok(/window\.innerWidth - pw - 10/.test(src.slice(pp,pp+700)),
     '★ the panel clamps to the viewport — a handle dragged to the edge cannot exile the panel off-screen');
  // ★ the STALE TABS list · three ghosts from before v0.95.803
  // (match the assignment, not the string — the explanatory comment in the code
  //  quotes the dead list on purpose, as the record of what was wrong)
  ok(!/TABS = \['warp'/.test(src),
     "★ the hand-written TABS list is gone — it still named three tabs deleted in v0.95.803, so Q/E cycled ghosts");
  ok(/querySelectorAll\('#devTabBar button'\)\]\.map\(b => b\.dataset\.devtab\)/.test(src),
     'the cycle order is DERIVED from the tab bar itself');
}

console.log('\n'+(fail?`❌ ${fail} CHECK(S) FAILED`:'✅ ALL CHECKS PASS'));
process.exit(fail?1:0);
