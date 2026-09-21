// ★★★ v0.96.92 · ATTACK SHEETS · SKYBEAM + VOLCAXOR, AND THE CLASS AROUND THEM.
//
// Creator: "skybeam and volcaxor attack animation sheets."
//
// ★★ THREE WAYS AN ATTACK SHEET SHIPS BROKEN, ALL OF THEM SILENT:
//   1. A MOVE THAT ISN'T HIS. The bank names an atkType and a move; nothing
//      checks the creature actually knows it. A Skybeam swinging someone else's
//      A4 throws no error and looks fine.
//   2. A SIZE THAT ISN'T HIS. The draw computes _idleRefBh / attackRefBh, so a
//      refBh measured differently from the idle's resizes the creature the
//      instant it attacks. Vengrizz's comment warns about this; nothing tested it.
//   3. A FRAME THAT HOLDS ITS NEIGHBOUR. The draw blits RECTANGLES. A component
//      may legally overhang its cell — Skybeam's up-beam starts 72px above its
//      row — but the moment one frame's BOX covers art another frame owns, that
//      art draws twice. It shipped on Skybeam as a floating beam shard under the
//      right-facing dragon and I only caught it by rendering the sheet.
//
// ★ So this suite measures the PNGs, not the table. A table can agree with
//   itself perfectly and still describe the wrong picture.
const fs = require('fs'), vm = require('vm');
const { execSync } = require('child_process');
const ROOT = '/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
const src = require('./lib/all_src.cjs')();
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const H  = t => console.log('\n' + t);

function grab(decl){
  const i = src.indexOf(decl); let j = src.indexOf('{', i), d = 0;
  do { if (src[j] === '{') d++; else if (src[j] === '}') d--; j++; } while (d);
  return src.slice(i, j) + ';';
}
const ctx = vm.createContext({ Object, Array, Math, console });
vm.runInContext(grab('const ZYREX_ATTACK_BANKS = {'), ctx);
vm.runInContext(grab('const MOVE_DEX = {'), ctx);
vm.runInContext(grab('const SPECIES = {'), ctx);
const R = e => vm.runInContext(e, ctx);

const NEW = ['skybeam', 'volcaxor'];

H('★ THE SHEETS ARE ON DISK, KEYED, AND MASTERED');
for (const n of NEW){
  const live = `assets/2D sprites/zyrex/attacks/attack_${n}.png`;
  const orig = `assets/2D sprites/zyrex/attacks/_orig/attack_${n}_master.png`;
  ok(fs.existsSync(ROOT + live), `${n}: keyed sheet shipped`);
  ok(fs.existsSync(ROOT + orig), `★ ${n}: untouched master kept in _orig/`);
}

H('★★★ NO STUDIO CHROMA SURVIVED — INCLUDING WHAT THE FLOOD CANNOT REACH');
{
  // ★ Volcaxor's flame arc CLOSES INTO A RING. The background inside it touches
  //   no corner, so the canon border flood never arrives and 9,762 px of pure
  //   magenta shipped inside the sprite. kill_enclosed_chroma() is the second
  //   pass; this asserts it ran.
  const out = execSync(`cd ${JSON.stringify(ROOT)} && python3 - <<'PY'
import sys; sys.path.insert(0,'tools')
from PIL import Image
import numpy as np
from chroma_key_canon import is_chroma
for n in ['skybeam','volcaxor']:
    a=np.array(Image.open(f'assets/2D sprites/zyrex/attacks/attack_{n}.png').convert('RGBA'))
    r,g,b,al=a[...,0],a[...,1],a[...,2],a[...,3]
    print(n, int((is_chroma(r,g,b)&(al>8)).sum()), a.shape[0], a.shape[1])
PY`).toString().trim().split('\n');
  for (const line of out){
    const [n, left, h, w] = line.split(/\s+/);
    ok(+w === 1254 && +h === 1254, `${n}: 1254x1254`);
    ok(+left < 1200, `${n}: ${left} chroma px left (speckle only — was 9,762 on volcaxor)`);
  }
}

H('★★★ THE MOVE IS ACTUALLY HIS');
for (const n of NEW){
  const b = R(`ZYREX_ATTACK_BANKS[${JSON.stringify(n)}]`);
  ok(!!b, `${n}: bank declared`);
  const moves = R(`SPECIES[${JSON.stringify(n)}].moves`);
  ok(moves.includes(b.move), `${n}: "${b.move}" is in his own move list [${moves.join(', ')}]`);
  const dex = R(`MOVE_DEX[${JSON.stringify(b.move)}]`);
  ok(!!dex, `${n}: "${b.move}" exists in MOVE_DEX`);
  ok(dex.slot === b.atkType,
     `★ ${n}: the bank says ${b.atkType} and the move dex says ${dex.slot} — they agree`);
}

H('★★★ THE SIZE IS HIS TOO · attack body vs idle body');
{
  // Reproduce the draw: rowScale = (2*TILE)/refBh * scaleMul, for both sheets,
  // and compare the TORSO band — not the silhouette, because wings move.
  const out = execSync(`cd ${JSON.stringify(ROOT)} && python3 - <<'PY'
import sys; sys.path.insert(0,'tools')
sys.argv=['x']
import numpy as np
from PIL import Image
C=313; TILE=48
def torso(p,r,c,b,frac=0.26):
    a=np.array(Image.open(p).convert('RGBA'))[...,3]
    bx,by,bw,bh=b; x0,y0=c*C+bx, r*C+by
    sub=a[max(0,y0):y0+bh, max(0,x0):x0+bw]
    w=sub.shape[1]; k=max(1,int(w*frac/2))
    mid=sub[:, max(0,w//2-k):w//2+k]
    ys=np.nonzero((mid>8).any(axis=1))[0]
    return int(ys.max()-ys.min()+1) if len(ys) else 0
J={'skybeam':('assets/2D sprites/zyrex/skybeam.png',
   [[32,59,276,215],[45,27,254,232],[40,13,260,232],[29,-4,279,237]],215,1.20,
   'assets/2D sprites/zyrex/attacks/attack_skybeam.png',
   [[9,38,293,239],[27,45,267,215],[15,20,266,207],[9,-11,293,253]],216),
   'volcaxor':('assets/2D sprites/zyrex/volcaxor-run.png',
   [[36,24,303,311],[30,71,292,218],[16,42,290,208],[66,-9,217,277]],311,1.40,
   'assets/2D sprites/zyrex/attacks/attack_volcaxor.png',
   [[38,24,285,297],[23,38,302,229],[21,-5,285,230],[54,-36,227,303]],315)}
for n,(ip,ibb,iref,mul,ap,abb,aref) in J.items():
    errs=[]
    for r in range(4):
        ih=torso(ip,r,0,ibb[r])*(TILE*2)/iref*mul
        ah=torso(ap,r,0,abb[r])*(TILE*2)/aref*mul
        errs.append(abs(ah-ih)/ih*100)
    print(n, round(max(errs),1), round(sum(errs)/4,1))
PY`).toString().trim().split('\n');
  for (const line of out){
    const [n, worst, mean] = line.split(/\s+/);
    ok(+worst <= 16, `${n}: worst-row torso diff ${worst}% (mean ${mean}%) — same animal mid-swing`);
  }
}

H('★★★ NO FRAME BOX HOLDS ITS NEIGHBOUR\'S ART');
{
  const out = execSync(`cd ${JSON.stringify(ROOT)} && python3 tools/measure_attack_boxes.py skybeam volcaxor 2>&1`).toString();
  // the measurer trims; compare its OUTPUT table against what shipped
  for (const n of NEW){
    const fresh = JSON.parse(fs.readFileSync(`/tmp/${n}_tbl.json`, 'utf8'));
    const live = R(`ZYREX_ATTACK_BANKS[${JSON.stringify(n)}].bboxes`);
    const same = JSON.stringify(fresh) === JSON.stringify(live);
    ok(same, same ? `${n}: shipped table is byte-equal to a fresh measurement of the PNG`
                  : `★ ${n}: the table and the art DISAGREE — re-run tools/measure_attack_boxes.py`);
  }
}

H('★ EVERY FRAME HAS ART IN IT');
for (const n of NEW){
  const bb = R(`ZYREX_ATTACK_BANKS[${JSON.stringify(n)}].bboxes`);
  ok(bb.length === 4 && bb.every(r => r.length === 4), `${n}: 4x4`);
  const empty = [];
  bb.forEach((r, ri) => r.forEach((c, ci) => { if (c[2] < 20 || c[3] < 20) empty.push(`r${ri}c${ci}`); }));
  ok(empty.length === 0, empty.length ? `${n}: empty frame(s) ${empty.join(' ')}` : `${n}: no empty frames`);
  const b = R(`ZYREX_ATTACK_BANKS[${JSON.stringify(n)}]`);
  ok(b.dirRows === true && b.cols === 4 && b.cellW === 313 && b.cellH === 313,
     `${n}: declared dirRows 4x4 on 313px cells`);
  ok(!b.pendingArt, `${n}: not marked pendingArt — the art is here`);
}

H('★ AND THE RIG PICKS THEM UP');
ok(/function attachZyrexAttackBank/.test(src), 'attachZyrexAttackBank exists');
for (const n of NEW)
  ok(R(`!!(ZYREX_ATTACK_BANKS[${JSON.stringify(n)}] && ZYREX_ATTACK_BANKS[${JSON.stringify(n)}].bboxes)`),
     `${n}: has bboxes, so attachZyrexAttackBank will rig it`);

H(f ? `❌ ${f} failed` : '✅ two sheets keyed, measured, matched to their own moves and their own size');
process.exit(f ? 1 : 0);
