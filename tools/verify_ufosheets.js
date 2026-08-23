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
// verify_ufosheets · v0.95.806 · dash recomposition + melt crop
const FS=require('fs');
try{new Function(FS.readFileSync('/tmp/all.js','utf8')+
  ';globalThis.__C={UFO_DASH_BBOXES,UFO_FLIGHT_BBOXES,UFO_MELT_CROP};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let fail=0;
const ok=(c,m)=>{ console.log(`  ${c?'✅':'❌'} ${m}`); if(!c) fail++; };
const H=t=>console.log('\n'+t);
const src=FS.readFileSync('/tmp/all.js','utf8');
const {execFileSync}=require('child_process');
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';

H('1 · ★★ THE FLOATING NOSES ARE GONE FROM THE PNG');
// Creator: "putting the nose on the left right animation on boost as floating
// pixels" — every L frame carried ~1,750px of the down-ship's nose, every R
// frame ~980px of the up-ship's.  Re-scan the shipped file for them.
{
  const out=execFileSync('python3',['-c',`
from PIL import Image
import numpy as np, collections
from collections import deque
A=np.array(Image.open('${ROOT}assets/2D sprites/vfx/auraxion-ufo-dash.png').convert('RGBA'))[:,:,3]>16
H,W=A.shape; lab=np.zeros((H,W),np.int32); comps=[]
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
    comps.append(px)
CW=W/4
cells=collections.defaultdict(list)
for px in comps:
    cnt=collections.Counter()
    for y,x in px: cnt[(min(3,int(y//CW)),min(3,int(x//CW)))]+=1
    cells[cnt.most_common(1)[0][0]].append(px)
# a lateral frame with a SECOND component >300px is a foreign chunk
bad=0
for r in (1,2):
    for c in range(4):
        big=[len(p) for p in cells[(r,c)] if len(p)>300]
        if len(big)>1: bad+=1
print(bad, len(comps))`],{encoding:'utf8'}).trim().split(/\s+/).map(Number);
  ok(out[0]===0,`★ no lateral frame carries a second big component (${out[0]} offenders · was 8)`);
  // ★ a raw component COUNT is not the property — the graft leaves a 1px seam
  //   between ship and nose (the cell-boundary gap travelled with them), so
  //   several frames legitimately split into ship+nose+flame.  What matters is
  //   that no chunk sits in a frame it does not belong to, which is line 1.
  ok(out[1]>0,`${out[1]} components on the sheet — count is reported, not asserted`);
}

H('2 · ★★ THE VERTICAL NOSES ARE WHOLE');
// "cropping the nose when I go up and down" — a whole nose ENDS IN A POINT:
// the art's last rows narrow to a tip instead of stopping at a wide flat cut.
{
  const widths=execFileSync('python3',['-c',`
from PIL import Image
import numpy as np
A=np.array(Image.open('${ROOT}assets/2D sprites/vfx/auraxion-ufo-dash.png').convert('RGBA'))[:,:,3]>16
CW=1254/4
out=[]
for r,edge in ((0,'bottom'),(3,'top')):
    for c in range(4):
        y0,y1=round(r*CW),round((r+1)*CW); x0,x1=round(c*CW),round((c+1)*CW)
        cell=A[y0:y1,x0:x1]
        w=cell.sum(1)
        ys=[y for y,v in enumerate(w) if v>0]
        tip = w[max(ys)] if edge=='bottom' else w[min(ys)]
        out.append(int(tip))
print(' '.join(map(str,out)))`],{encoding:'utf8'}).trim().split(/\s+/).map(Number);
  ok(widths.every(w=>w<=30),
     `★ every vertical frame now ends in a POINT · tip widths [${widths.join(', ')}]px — a cropped nose ends in a flat cut`);
}

H('3 · ★★ THE BBOXES MATCH THE RECOMPOSED FILE');
{
  const got=execFileSync('python3',['-c',`
from PIL import Image
import numpy as np
A=np.array(Image.open('${ROOT}assets/2D sprites/vfx/auraxion-ufo-dash.png').convert('RGBA'))[:,:,3]>16
CW=1254/4
for r in range(4):
    for c in range(4):
        # half-UP like Math.round · python round() is banker s and disagrees at 940.5
        y0,y1=int(r*CW+0.5),int((r+1)*CW+0.5); x0,x1=int(c*CW+0.5),int((c+1)*CW+0.5)
        ys,xs=np.nonzero(A[y0:y1,x0:x1])
        print(xs.min(),ys.min(),xs.max()-xs.min()+1,ys.max()-ys.min()+1)`],{encoding:'utf8'})
    .trim().split('\n').map(l=>l.split(/\s+/).map(Number));
  let off=0;
  for (let r=0;r<4;r++) for (let c=0;c<4;c++){
    const a=got[r*4+c], b=C.UFO_DASH_BBOXES[r][c];
    if (a.some((v,i)=>Math.abs(v-b[i])>2)) off++;
  }
  ok(off===0,`★ all 16 bboxes re-measure to what the code declares (${off} off)`);
  // ★ the tell of the old fault: row 1/2 bboxes spanned 281/229 rows because
  //   they were measuring the foreign chunks.  The real lateral art is 119.
  ok(C.UFO_DASH_BBOXES[1].every(b=>b[3]===119)&&C.UFO_DASH_BBOXES[2].every(b=>b[3]===119),
     '★ lateral frames measure their REAL 119px height — the 281/229 was the foreign nose inflating the box');
}

H('4 · ★★ ONE UFO PER ATTACK');
// Creator: "the ufo attack animation produces a second ufo ... there should
// only be one ufo regardless."
{
  ok(!!C.UFO_MELT_CROP&&!!C.UFO_MELT_CROP.mori&&!!C.UFO_MELT_CROP.daemon,'per-sheet crop tables exist');
  ok(!/const cropY=cell\*\.43,/.test(src),'★ the blanket 0.43 crop is gone');
  ok(/UFO_MELT_CROP\[_meltKey\]\[mr\]/.test(src),'the draw crops per ROW, per sheet');
  // ★ measure the baked hull in both sheets and prove every crop clears it
  for (const [key,file] of [['mori','ufo-beam-mori.png'],['daemon','ufo-beam-daemon.png']]){
    const fr=execFileSync('python3',['-c',`
from PIL import Image
import numpy as np
A=np.array(Image.open('${ROOT}assets/2D sprites/decor/${file}').convert('RGBA'))[:,:,3]>16
H,W=A.shape; CW=W/4
for r in range(4):
    worst=0
    for c in range(4):
        y0,y1=round(r*CW),round((r+1)*CW); x0,x1=round(c*CW),round((c+1)*CW)
        cell=A[y0:y1,x0:x1]; wd=cell.sum(1)
        hull=[y for y,v in enumerate(wd) if v>(x1-x0)*0.55]
        if hull: worst=max(worst,(max(hull)+1)/(y1-y0))
    print(round(worst,4))`],{encoding:'utf8'}).trim().split('\n').map(Number);
    for (let r=0;r<4;r++)
      ok(C.UFO_MELT_CROP[key][r] > fr[r],
         `  ${key} row ${r} · hull ends ${fr[r]} · crop ${C.UFO_MELT_CROP[key][r]} clears it`);
  }
  // the live hull still draws — the ONE ufo
  ok(/const _ufoBB = \(dashing \? UFO_DASH_BBOXES : UFO_FLIGHT_BBOXES\)/.test(src),
     'and the live hull render (the ONE ufo, still bobbing) is untouched');
}

console.log('\n'+(fail?`❌ ${fail} CHECK(S) FAILED`:'✅ ALL CHECKS PASS'));
process.exit(fail?1:0);
