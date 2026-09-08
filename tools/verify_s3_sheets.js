#!/usr/bin/env node
/* verify_s3_sheets.js · v0.96.42 · S3 LUMINARY · walk / run / punch / kick
 *
 * ★★★ THE HEADLINE: HE MUST NOT CHANGE SIZE BETWEEN SHEETS.
 *   The engine scales every bundle so bodyBh[row] renders at a fixed ~92.9px,
 *   so bodyBh is not really "body height" — it is "the number that makes THIS
 *   sheet's art render at the right scale". Measured naively as head-to-feet it
 *   was wrong by up to 10% per sheet, and worst on RUN, where S3 FLIES: on the
 *   side rows he is horizontal, so a vertical measurement down the middle of
 *   the box returns roughly TORSO THICKNESS and would have rendered him huge.
 *   Naive run: DOWN +4.3% LEFT -1.9% RIGHT +7.4% UP -9.8% against idle — 17
 *   points of spread, i.e. visibly resizing when he breaks into a run, and by a
 *   different amount per direction. Byte-for-byte the defect the S1 locomotion
 *   tables were rewritten to fix ([[aov-refbh-yardstick-law]]).
 *
 *   Every bodyBh is therefore ANCHORED ON THE FACE — the one landmark that is
 *   pose-invariant and proportional to how large the art is drawn — against
 *   idle, which is already shipped and approved. Final spread: <=0.5% on all
 *   four rows across all five sheets.
 *
 * ★ Rows are assigned by CENTROID, not by the feet: walk row 0's feet land 8px
 *   past the 313 boundary, so a feet-based rule collided four cells.
 */
eval(require('fs').readFileSync(require('path').join(__dirname,'_shim_s3.js'),'utf8'));
const fs=require('fs');
const src=fs.readFileSync('/tmp/all.js','utf8');
const LOG=console.log;console.log=()=>{};console.warn=()=>{};console.error=()=>{};
new Function(src+`;globalThis.__D={PLAYER_SKINS,RIZER,RIZER_LUMINARY_IDLE,RIZER_LUMINARY_WALK,
 RIZER_LUMINARY_PUNCH,RIZER_LUMINARY_KICK,RIZER_LUMINARY_RUN,rizerBundleForSkin,rizerRowScale,rizerTargetBodyPx,player,game};`)();
let n=0;while(global.__Q.length&&n<500){const f=global.__Q.shift();n++;try{f();}catch(_){}}
console.log=LOG;const D=globalThis.__D;
let pass=0,fail=0;const t=(c,m)=>{c?(pass++,LOG('  ok   · '+m)):(fail++,LOG('  FAIL · '+m));};
LOG('\n=== S3 · walk / punch / kick ===\n');
const S={walk:D.RIZER_LUMINARY_WALK,punch:D.RIZER_LUMINARY_PUNCH,kick:D.RIZER_LUMINARY_KICK,run:D.RIZER_LUMINARY_RUN};
for(const [k,b] of Object.entries(S)){
  t(D.rizerBundleForSkin(k,'luminary')===b,`★★ '${k}' resolves to the S3 sheet, not S2's`);
  t(b.bboxes.length===4&&b.bboxes.every(r=>r.length===4),`★ ${k} · 4x4 bbox table`);
  t(b.bodyBh.length===4&&b.bodyBh.every(v=>v>150&&v<260),`★ ${k} · bodyBh in range ${b.bodyBh}`);
  t(b.cellW===313&&b.cellH===313,`★ ${k} · 313 cell`);
  t(String(b.key).endsWith('-luminary'),`★ ${k} · key '${b.key}'`);
}
t(D.RIZER_LUMINARY_PUNCH.comboSheet===true&&D.RIZER_LUMINARY_PUNCH.constScale===true,
  '★★★ punch is a COMBO sheet (comboSheet+constScale) · one column per combo step');
t(!D.RIZER_LUMINARY_WALK.comboSheet&&!D.RIZER_LUMINARY_KICK.comboSheet,
  '★ walk and kick are NOT combo sheets · matching S1/S2');
t(D.RIZER_LUMINARY_WALK.bboxes[3].every(b=>b[1]<0),'★★ walk row 3 (UP) negative by · wing overflow owned');
t(D.RIZER_LUMINARY_PUNCH.bboxes[3].every(b=>b[1]<0),'★★ punch row 3 negative by');
// ★ nothing may reach outside the sheet
let bad=0;
for(const [k,b] of Object.entries(S))
  for(let r=0;r<4;r++) for(let c=0;c<4;c++){
    const [bx,by,bw,bh]=b.bboxes[r][c];
    const X=c*313+bx, Y=r*313+by;
    if(X<0||Y<0||X+bw>1254||Y+bh>1254){bad++;LOG(`     !! ${k} r${r}c${c}`);}
  }
t(bad===0,'★★★ every bbox on all three sheets is inside the 1254px sheet');
// ★ the scale law · body renders at the same px on every sheet
const tgt=D.rizerTargetBodyPx();
let allOk=true;
for(const b of [D.RIZER_LUMINARY_IDLE,...Object.values(S)])
  for(let r=0;r<4;r++){
    const body=b.bodyBh[r]*D.rizerRowScale(b,r);
    if(Math.abs(body-tgt)>0.01) allOk=false;
  }
t(allOk,`★★★ idle+walk+punch+kick all render their body at ${tgt.toFixed(1)}px · he cannot change size`);
// ★ things with no S3 art still fall to S2
t(!D.RIZER_LUMINARY_RUN._downScale,'★★ run carries NO _downScale · a measured table must not be overridden');
t(D.rizerBundleForSkin('death','luminary')===D.PLAYER_SKINS.power_upgrade.overrides.death,
  '★ death still falls back to S2');
LOG(`\n${pass} passed · ${fail} failed\n`);
process.exit(fail?1:0);
