"""★★★ Re-measure the Seer grunt sheets by CONNECTED COMPONENT, not alpha bbox.

Creator, 2026-09-03: "make sure no cell bleed on any grunt animation. female
and male must keep respective size on all animations. no bleed, no clipping."

WHAT WAS WRONG.  Every bbox/foot in SEER_GRUNT_ART was taken from the raw alpha
bounding box of each 313.5px cell.  Two artefacts poison that:

  1 · A DETACHED SLIVER at the bottom of the UP row (row 2) on A-walk and on all
      three B locomotion sheets.  ~20px wide, separated from the body by a clean
      gap, sitting on the cell floor.  It inflated row 2's height (B-idle read
      294 when the body is 253) and pinned foot=312 -- so the up-facing sprite
      was scaled and anchored off a stray fragment.

  2 · A/B ROW 0 -> ROW 1 FUSION on A's idle, walk and run: row 0's ink reaches
      y=312 and row 1's starts at y=0, so the two cells' art is contiguous and
      row 1 measured 267-271 tall when the character is ~200.

Both vanish under the house rule ([[aov-sprite-cc-extractor]]): OWNERSHIP IS THE
LARGEST CONNECTED COMPONENT, and a component may legally overflow its cell --
what it must not do is get measured as if the overflow were the character.

    python3 tools/measure_seer_grunts.py [--emit]
"""
import sys, numpy as np
from PIL import Image
from collections import deque

CELL = 313.5
VARIANTS = {'A': 'a', 'B': 'b'}
KINDS = ['idle', 'walk', 'run', 'attack']

def components(mask):
    """4-connected components, largest first."""
    H, W = mask.shape
    seen = np.zeros((H, W), bool)
    out = []
    for sy in range(H):
        for sx in range(W):
            if not mask[sy, sx] or seen[sy, sx]:
                continue
            dq = deque([(sy, sx)]); seen[sy, sx] = True
            pix = []
            while dq:
                y, x = dq.popleft(); pix.append((y, x))
                for dy, dx in ((-1,0),(1,0),(0,-1),(0,1)):
                    ny, nx = y+dy, x+dx
                    if 0 <= ny < H and 0 <= nx < W and mask[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True; dq.append((ny, nx))
            out.append(pix)
    out.sort(key=len, reverse=True)
    return out

def measure(path):
    """Per cell: the largest component's rect, measured in FULL-SHEET space so a
    component that overflows its cell keeps its real extent."""
    al = np.array(Image.open(path).convert('RGBA'))[..., 3] > 16
    bboxes, feet, notes = [], [], []
    for r in range(4):
        rowb, rowf, rown = [], [], []
        for c in range(4):
            y0, y1 = int(r*CELL), int((r+1)*CELL)
            x0, x1 = int(c*CELL), int((c+1)*CELL)
            sub = al[y0:y1, x0:x1]
            comps = components(sub)
            if not comps:
                rowb.append([0,0,1,1]); rowf.append(0); rown.append('EMPTY'); continue
            big = comps[0]
            ys = [p[0] for p in big]; xs = [p[1] for p in big]
            btop, bbot = min(ys), max(ys)
            lft, rgt = min(xs), max(xs)
            top, bot = btop, bbot
            # ★★★ NOT ALL STRAYS ARE DEBRIS.  A component detached from the body
            # is either BLEED (the neighbouring cell's art crossing the seam) or
            # a HELD/SWUNG OBJECT the character legitimately owns.  Measured on
            # these sheets, the two are cleanly separable:
            #   · B-attack r0c2 · 2103px at y134..221, INSIDE the body's y75..301
            #     -> a blade swung out to the right.  Dropping it amputates it.
            #   · B-run r2c0    ·  1111px at y287..311, 52px BELOW the body and
            #     flush to the cell floor  -> bleed/debris.
            # So: keep what overlaps the body vertically, drop what sits against
            # a cell edge or is a speck.
            H = sub.shape[0]
            kept, dropped = 0, 0
            for st in comps[1:]:
                sy = [q[0] for q in st]; sx = [q[1] for q in st]
                stop, sbot = min(sy), max(sy)
                touches_edge = (stop == 0) or (sbot >= H - 1)
                overlaps_body = not (sbot < btop or stop > bbot)
                speck = len(st) < 0.02 * len(big)
                if overlaps_body and not touches_edge and not speck:
                    top = min(top, stop); bot = max(bot, sbot)
                    lft = min(lft, min(sx)); rgt = max(rgt, max(sx))
                    kept += len(st)
                else:
                    dropped += len(st)
            n = ''
            if dropped: n += f'dropped {dropped}px'
            if kept:    n += (' · ' if n else '') + f'★ KEPT {kept}px (held object)'
            rowb.append([x0 + lft, y0 + top, rgt-lft+1, bot-top+1])
            rowf.append(bbot + 1)                      # ★ baseline is the BODY's, never a weapon's
            rown.append(n)
        bboxes.append(rowb); feet.append(rowf); notes.append(rown)
    return bboxes, feet, notes

def main():
    emit = '--emit' in sys.argv
    stand = {}
    for V, v in VARIANTS.items():
        print(f'\n{"="*66}\n{V} ({"female" if V=="A" else "male"})')
        for k in KINDS:
            p = f'assets/2D sprites/enemies/seer-grunt-{v}-{k}.png'
            bb, ft, nt = measure(p)
            hs = [[b[3] for b in row] for row in bb]
            print(f'  {k:6} body heights  ' + ' | '.join(str(r) for r in hs))
            for r in range(4):
                for c in range(4):
                    if nt[r][c]: print(f'        r{r}c{c}: {nt[r][c]}')
            if k == 'idle':
                stand[V] = max(max(r) for r in hs)
            if emit:
                print(f'    bboxes: {bb}')
                print(f'    foot:   {ft}')
    print('\nIDLE standing height (the one scale per character):', stand)

if __name__ == '__main__':
    main()
