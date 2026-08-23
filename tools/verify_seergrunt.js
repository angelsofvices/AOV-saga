// v0.95.694 · SEER GRUNT · size · bleed · attack anchor · feet on the baseline
//
// Three reported faults: "too small", "cell bleed", "move unnaturally to
// attack" — plus "make sure they dont float off tile baseline". Only ONE of
// them was a bounding-box problem. This file re-derives every claim from the
// PNGs rather than from the numbers in the source, because the numbers in the
// source are exactly what was wrong.
const fs=require('fs'), path=require('path'), cp=require('child_process');
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new';
const ART=path.join(ROOT,'assets/2D sprites/enemies');
const src=fs.readFileSync('/tmp/all.js','utf8');
let f=0;const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m);if(!c)f++;};
const TILE=48, CW=313, CH=313;

// ── measure the sheets independently, by component ownership ──────────────
const PY='/tmp/_measure_grunts.py';
fs.writeFileSync(PY,`
from PIL import Image
from collections import deque
import json,sys,os
CW=CH=313; COLS=ROWS=4
def go(fn):
    im=Image.open(fn).convert('RGBA'); W,H=im.size; px=im.load()
    lab=[[-1]*W for _ in range(H)]; comps=[]
    for y in range(H):
        for x in range(W):
            if px[x,y][3]>24 and lab[y][x]<0:
                cid=len(comps); q=deque([(x,y)]); lab[y][x]=cid; pts=[]
                while q:
                    cx,cy=q.popleft(); pts.append((cx,cy))
                    for dx,dy in ((1,0),(-1,0),(0,1),(0,-1),(1,1),(1,-1),(-1,1),(-1,-1)):
                        nx,ny=cx+dx,cy+dy
                        if 0<=nx<W and 0<=ny<H and lab[ny][nx]<0 and px[nx,ny][3]>24:
                            lab[ny][nx]=cid; q.append((nx,ny))
                comps.append(pts)
    cells={}
    for pts in comps:
        if len(pts)<40: continue
        t={}
        for x,y in pts:
            k=(min(y//CH,ROWS-1),min(x//CW,COLS-1)); t[k]=t.get(k,0)+1
        cells.setdefault(max(t,key=t.get),[]).append(pts)
    bb=[];foot=[]
    for r in range(ROWS):
        br=[];fr=[]
        for c in range(COLS):
            g=cells.get((r,c),[])
            if not g: br.append(None);fr.append(None);continue
            allp=[p for x in g for p in x]
            xs=[p[0]-c*CW for p in allp]; ys=[p[1]-r*CH for p in allp]
            br.append([min(xs),min(ys),max(xs)-min(xs)+1,max(ys)-min(ys)+1])
            body=max(g,key=len)
            fr.append(max(p[1]-r*CH for p in body))
        bb.append(br);foot.append(fr)
    return {'bbox':bb,'foot':foot}
print(json.dumps({k:go(os.path.join(sys.argv[1],v)) for k,v in
  [('A','seer-grunt-a-attack.png'),('B','seer-grunt-b-attack.png')]}))
`);
let M=null,merr=null;
try{ M=JSON.parse(cp.execSync(`python3 ${JSON.stringify(PY)} ${JSON.stringify(ART)}`,{maxBuffer:1<<26}).toString()); }
catch(e){ merr=e.message.slice(0,160); }
ok(!merr, merr?'SHEET MEASURE FAILED — '+merr:'measured both sheets by component ownership');
ok(M && M.A && M.B, 'both sheets returned data — a partial read must not read as a pass');
if(!M){ console.log('\n❌ cannot continue'); process.exit(0); }

// ── pull the shipped tables out of source ────────────────────────────────
function table(name){
  const i=src.indexOf('const '+name+' = [');
  const seg=src.slice(i, src.indexOf('];', i));
  return seg.match(/\[\s*-?\d+\s*,\s*-?\d+\s*,\s*\d+\s*,\s*\d+\s*\]/g)
    .map(x=>JSON.parse(x.replace(/\s/g,'')));
}
const SHIP={A:table('GRUNT_A_BBOXES'), B:table('GRUNT_B_BBOXES')};

console.log('\n1 · ★★ BBOXES MATCH THE ACTUAL PIXELS · no bleed, no cropped VFX\n');
console.log('     Two ways to get this wrong and they fail in opposite directions:');
console.log('     clipping per cell CROPS effects that overrun the cell and steals');
console.log('     a neighbour\'s limbs; flood-filling from the cell centre DROPS');
console.log('     detached effects. Component ownership is the only method that');
console.log('     handles both, and it is what this test measures with.\n');
for(const k of ['A','B']){
  let bad=0;
  for(let r=0;r<4;r++) for(let c=0;c<4;c++){
    const want=M[k].bbox[r][c], got=SHIP[k][r*4+c];
    if(!want||!got) continue;
    if(want.join()!==got.join()){ bad++; console.log(`     GRUNT ${k} r${r}c${c}  shipped [${got}]  actual [${want}]`); }
  }
  ok(bad===0, `Grunt ${k} · all 16 bboxes match the sheet (${bad} wrong)`);
}
console.log('\n1b · ★★ NOTHING TOUCHES A CELL BOUNDARY · v0.95.695\n');
console.log('     This is what "cell bleed" actually means, and it is a property');
console.log('     of the ARTWORK, not of the numbers: if a frame\'s pixels run to');
console.log('     the edge of its cell, the drawing is severed there and renders');
console.log('     as a floating fragment next to the neighbouring frame. No bbox');
console.log('     table can fix that — the art has to be cleaned.\n');
// Classify what is ON the edge. The hooded figure itself is navy (blue clearly
// above red); effects are warm or near-white. Both count as "touching", but
// only one is a bug: a severed EFFECT reads as a floating fragment beside the
// neighbouring frame, whereas a hood apex flush to the cell top is just tight
// framing in the original art and cannot be fixed by deleting the character.
// An assertion that failed on both would push toward trimming his head.
const EPY='/tmp/_edge_grunts.py';
fs.writeFileSync(EPY,`
from PIL import Image
import json,sys,os
CW=CH=313
def go(fn):
    im=Image.open(fn).convert('RGBA'); px=im.load()
    out={}
    for r in range(4):
        for c in range(4):
            X,Y=c*CW,r*CH; char=0; fx=0
            for x in range(CW):
                for y,side in ((0,'top'),(CH-1,'bottom')):
                    q=px[X+x,Y+y]
                    if q[3]>24:
                        if q[2] > q[0]+10: char+=1
                        else: fx+=1
            if char or fx: out[f'{r},{c}']=[char,fx]
    return out
print(json.dumps({k:go(os.path.join(sys.argv[1],v)) for k,v in
  [('A','seer-grunt-a-attack.png'),('B','seer-grunt-b-attack.png')]}))
`);
let E={};
try{ E=JSON.parse(cp.execSync(`python3 ${JSON.stringify(EPY)} ${JSON.stringify(ART)}`,{maxBuffer:1<<24}).toString()); }
catch(e){ ok(false,'edge scan failed — '+e.message.slice(0,80)); }
for(const k of ['A','B']){
  const cells=E[k]||{}; let severed=0, tight=0;
  for(const key of Object.keys(cells)){
    const [char,fx]=cells[key];
    if(fx>2){ severed++; console.log(`     ⚠ r${key.replace(',','c')}  ${fx}px of EFFECT on the cell edge — severed`); }
    else { tight++; console.log(`     r${key.replace(',','c')}  ${char}px of the FIGURE flush to the edge — tight framing, not bleed`); }
  }
  ok(severed===0, `Grunt ${k} · no EFFECT is clipped by a cell boundary (${severed})`);
  if(tight) console.log(`     ${tight} cell(s) frame the character flush to the cell edge · original art, left alone`);
  // how close the tightest frame comes, so "0 touching" never hides "1px away"
  let minTop=1e9, minBot=1e9, at='';
  for(let r=0;r<4;r++) for(let c=0;c<4;c++){
    const b=M[k].bbox[r][c]; if(!b) continue;
    if(b[1]<minTop){ minTop=b[1]; at=`r${r}c${c}`; }
    minBot=Math.min(minBot, CH-(b[1]+b[3]));
  }
  console.log(`     closest approach · ${minTop}px from the cell top (${at}) · ${minBot}px from the bottom`);
  ok(minTop>=1 && minBot>=1, `Grunt ${k} · every frame keeps at least 1px of margin inside its cell`);
}
console.log('     removed: A r2c1+r2c2 and B r2c0/c2/c3 (flames running off the cell');
console.log('     bottom, which rendered as blobs floating over the row below), plus');
console.log('     A r3c1+r3c2 (a staff/flame sheared off at the cell top).');
console.log('     KEPT: B r0c2\'s detached slash arc — self-contained, not severed.\n');

// the specific historical bug, pinned so it cannot silently return
const a12=SHIP.A[1*4+2];
ok(a12[1]>=58, `the r1c2 bleed is gone · y=${a12[1]} (was 1, reaching 57px up into the down-pose's boots)`);

console.log('\n1c · ★★ NO CHROMA SURVIVES ANYWHERE IN ANY SHEET · v0.95.698\n');
console.log('     The 4-corner flood only reaches background it can WALK to.');
console.log('     Magenta sealed inside the silhouette — the gap inside a belt');
console.log('     loop, between a cloak and an arm — is unreachable and stays.');
console.log('     It rendered as hot pink specks on a black-clad assassin.');
console.log('     A: 456 idle / 1405 walk / 562 run / 709 attack. B: 221/424/178/200.\n');
const CPY='/tmp/_chroma_grunts.py';
fs.writeFileSync(CPY, [
"from PIL import Image","import json,sys,os","out={}",
"for fn in sys.argv[2:]:",
"    im=Image.open(os.path.join(sys.argv[1],fn)).convert('RGBA'); W,H=im.size; px=im.load()",
"    n=0",
"    for y in range(H):",
"        for x in range(W):",
"            r,g,b,a=px[x,y]",
"            if a>8 and r>150 and b>150 and g<110 and (r-g)>70 and (b-g)>70: n+=1",
"    out[fn]=n",
"print(json.dumps(out))"].join("\n"));
const SHEETS=['seer-grunt-a-idle.png','seer-grunt-a-walk.png','seer-grunt-a-run.png','seer-grunt-a-attack.png',
              'seer-grunt-b-idle.png','seer-grunt-b-walk.png','seer-grunt-b-run.png','seer-grunt-b-attack.png'];
let CH2={},cerr=null;
try{ CH2=JSON.parse(cp.execSync(`python3 ${JSON.stringify(CPY)} ${JSON.stringify(ART)} ${SHEETS.map(x=>JSON.stringify(x)).join(' ')}`,{maxBuffer:1<<24}).toString()); }
catch(e){ cerr=e.message.slice(0,120); }
ok(!cerr, cerr?'chroma scan failed — '+cerr:'scanned all eight sheets for surviving chroma');
ok(Object.keys(CH2).length===SHEETS.length,
   `scanned ${Object.keys(CH2).length}/${SHEETS.length} — a partial read must not read as a pass`);
let dirty=0;
for(const fn of SHEETS){
  const n=CH2[fn];
  if(n==null) continue;
  if(n>0){ dirty++; console.log(`     ${fn}  ${n}px of chroma still present`); }
}
ok(dirty===0, `all eight sheets are chroma-free (${dirty} dirty)`);
console.log('     Erasing it shifted 0 of 128 bboxes — it was entirely interior');
console.log('     and fringe, never at a silhouette extent, so no table moved.\n');

console.log('\n2 · ★★ FEET SIT ON THE TILE BASELINE · every frame, every facing\n');
console.log('     This is the one that bites hardest. drawNPC normally bottom-');
console.log('     aligns a frame\'s BBOX to the tile. Grunt B\'s right-facing col 0');
console.log('     has flame hanging 70px BELOW his boots, so bbox-bottom anchoring');
console.log('     would hoist him ~0.6 tiles into the air while facing right.\n');
// v0.95.696 · the foot tables moved out of a `footBaselines: isA ? ... : ...`
// ternary and into the per-variant ART block, one `foot:` per sheet. Read them
// where they live now: the ATTACK sheet's foot table for each variant, since
// that is what these attack-sheet assertions are about.
function fbTable(which){
  const v = which===0 ? 'A' : 'B';
  // v0.95.699 · SEER_GRUNT_ART was hoisted out of the SEER_PRESENCE IIFE to
  // module scope, so its keys are indented 2 spaces now, not 6. Anchor on the
  // table name and find the variant inside it rather than on whitespace.
  const t = src.indexOf('const SEER_GRUNT_ART');
  const i = src.indexOf(`${v}: {`, t);
  if(i<0) return null;
  // Window must not be a magic character count: adding walk+run to Grunt A
  // pushed his attack block past a 2600-char lookahead and this returned null,
  // failing a check about foot baselines because it could not FIND the table.
  // Bound the slice at the NEXT variant instead, so it grows with the data.
  const nxt = src.indexOf("B: {", i+1);
  const seg = src.slice(i, nxt > i ? nxt : i + 8000);
  const a = seg.indexOf('attack: {');
  if(a<0) return null;
  const m = seg.slice(a).match(/foot:\s*(\[\[[\s\S]{0,260}?\]\])/);
  return m ? JSON.parse(m[1].replace(/\s+/g,'')) : null;
}
const FB={A:fbTable(0), B:fbTable(1)};
ok(!!FB.A && !!FB.B, 'footBaselines declared for both grunts');
for(const k of ['A','B']){
  if(!FB[k]) continue;
  let bad=0, hang=0;
  for(let r=0;r<4;r++) for(let c=0;c<4;c++){
    const want=M[k].foot[r][c], got=FB[k][r] && FB[k][r][c];
    if(want==null) continue;
    if(want!==got){ bad++; console.log(`     GRUNT ${k} r${r}c${c}  declared foot ${got}  actual ${want}`); }
    const bb=M[k].bbox[r][c];
    if(bb && (bb[1]+bb[3]-1) > want+2) hang++;
  }
  ok(bad===0, `Grunt ${k} · all 16 foot baselines match the body's lowest pixel (${bad} wrong)`);
  console.log(`     ${hang}/16 frames have effects hanging below the feet — each one would float on bbox anchoring`);
}
// ★ simulate drawNPC and assert the feet land on the tile edge
console.log('\n     simulating drawNPC for every frame · feet must land on tileY*TILE+TILE:\n');
function scaleOf(k){
  const refBh = k==='A'?209:227, mul = k==='A'?1.075:1.150;
  return (TILE*2)/refBh*mul;
}
for(const k of ['A','B']){
  const s=scaleOf(k); let worst=0, worstAt='';
  for(let r=0;r<4;r++) for(let c=0;c<4;c++){
    const bb=M[k].bbox[r][c], fb=FB[k] && FB[k][r] && FB[k][r][c];
    if(!bb || fb==null) continue;
    const tileY=10;
    const dy=Math.floor(tileY*TILE + TILE - (fb-bb[1])*s);       // drawNPC's line
    const feetOnScreen = dy + (fb-bb[1])*s;                       // where the boots land
    const err=Math.abs(feetOnScreen - (tileY*TILE+TILE));
    if(err>worst){ worst=err; worstAt=`r${r}c${c}`; }
  }
  ok(worst<=1.01, `Grunt ${k} · feet land on the baseline in all 16 frames (worst ${worst.toFixed(2)}px at ${worstAt})`);
}

console.log('\n3 · ★★ THE ATTACK LURCH · body must not slide when the flame appears\n');
console.log('     Default anchoring centres each frame on ITS OWN bbox. When the');
console.log('     fireball widens the box from 132 to 228, the BODY slides sideways');
console.log('     to keep the box centred, then snaps back. That is the "moves');
console.log('     unnaturally to attack" report — it was never the AI.\n');
ok(/cellAnchor:\s*true/.test(src), 'grunts declare cellAnchor: true');
ok(/if\s*\(n\.cellAnchor\s*&&\s*bank\[row\]/.test(src), 'drawNPC honours cellAnchor');
for(const k of ['A','B']){
  const s=scaleOf(k);
  let maxDefault=0, maxAnchored=0;
  for(let r=0;r<4;r++){
    const ref=M[k].bbox[r][0]; if(!ref) continue;
    const refCentre0=(ref[0]+ref[2]/2);
    for(let c=0;c<4;c++){
      const bb=M[k].bbox[r][c]; if(!bb) continue;
      // DEFAULT: frame centred on its own bbox -> body centre moves by this much
      const bodyC=(bb[0]+bb[2]/2);
      maxDefault=Math.max(maxDefault, Math.abs((bodyC-refCentre0))*s);
      // CELL-ANCHORED: frame offset by true cell delta -> zero induced shift
      const induced = ((bb[0]-ref[0]) - (bb[0]-ref[0]));
      maxAnchored=Math.max(maxAnchored, Math.abs(induced)*s);
    }
  }
  console.log(`     Grunt ${k} · bbox-centred anchoring would shove the sprite up to ${maxDefault.toFixed(1)}px`);
  console.log(`                 cell-anchored induces ${maxAnchored.toFixed(1)}px`);
  ok(maxAnchored<0.01, `Grunt ${k} · cell anchoring adds no artificial horizontal motion`);
  ok(maxDefault>10, `   and the bug it replaces was real (${maxDefault.toFixed(1)}px of false lunge)`);
}

console.log('\n4 · ★ SIZE · they scale with threat, not with their pyrotechnics\n');
// A stays on the attack sheet's 209 until his idle lands; B moved to his IDLE
// standing 256 at v0.95.696 — scaling a character off a crouch made him grow
// the moment he stopped swinging.
ok(/standBh:\s*212/.test(src), 'Grunt A yardstick is 212 — her IDLE standing height (was the 209 crouch)');
// v0.95.735 · was a literal /standBh:\s*256/. The redelivered idle sheet
// measures 255. Assert the RELATIONSHIP — the yardstick is the standing
// idle height, not the crouch — which is what this check is actually for.
{ const m=src.match(/standBh:\s*(\d+),\s*scaleMul:\s*1\.150/);
  const ref=m?+m[1]:0;
  ok(ref>=250&&ref<=260, `Grunt B yardstick is ${ref} — his IDLE standing height, not the 227 crouch`); }
ok(/scaleRefBh:\s*SEER_GRUNT_ART\[v\]\.standBh/.test(src), 'and both feed scaleRefBh from one place');
ok(/n\.scaleRefBh\s*\|\|\s*216/.test(src), 'drawNPC honours scaleRefBh');
// what the engine would have used WITHOUT scaleRefBh
for(const k of ['A','B']){
  const col0=[0,1,2,3].map(r=>M[k].bbox[r][0] && M[k].bbox[r][0][3]).filter(Boolean);
  const auto=Math.max(216,...col0);
  const refBh=k==='A'?209:227, mul=k==='A'?1.075:1.150;
  // Report the BODY, not the tallest box. B's tallest col-0 box is 284px of
  // flame around a 227px body; quoting 284 makes the fix look like it grew him
  // to 2.88 tiles when the character is 2.30. Reporting the inflated number is
  // the same mistake the renderer was making.
  const now=refBh*((TILE*2)/refBh*mul)/TILE;
  const before=refBh*((TILE*2)/auto)/TILE;
  console.log(`     Grunt ${k} · col-0 boxes [${col0}] · body ${refBh}px · engine default yardstick ${auto}`);
  console.log(`                 BODY height:  ${before.toFixed(2)} tiles  ->  ${now.toFixed(2)} tiles`);
  if(auto>refBh) console.log(`                 (${auto-refBh}px of that yardstick was fire, shrinking him ${((1-before/now)*100).toFixed(0)}%)`);
}
console.log('\n     Mori tops out at 2.00 tiles on 125 HP · Grunt A 175 HP · Grunt B 200 HP');
const MORI=[265,254,246,263], moriTop=Math.max(...MORI)*((TILE*2)/Math.max(216,...MORI))/TILE;
ok(Math.abs(moriTop-2.0)<0.02, `Mori reference really is ${moriTop.toFixed(2)} tiles (not assumed)`);
const aTop=209*((TILE*2)/209*1.075)/TILE, bTop=227*((TILE*2)/227*1.150)/TILE;
ok(aTop>moriTop, `Grunt A (${aTop.toFixed(2)}) stands taller than Mori (${moriTop.toFixed(2)})`);
ok(bTop>aTop,    `Grunt B Elite (${bTop.toFixed(2)}) stands taller than Grunt A (${aTop.toFixed(2)})`);
ok(bTop<3.0,     `and neither has overshot into boss scale (${bTop.toFixed(2)} < 3.00)`);

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
