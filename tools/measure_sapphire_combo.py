#!/usr/bin/env python3
"""CC-measure the sapphire combo sheet · v0.95.950.

Cell-clipping a bbox is the one thing never to do here: the spinning slash's
arc and the overhead raise's blade both leave their cell, and a clipped
rectangle would cut the blade off mid-swing.  So ownership is by CONNECTED
COMPONENT -- a component belongs to whichever cell holds most of its pixels,
and the bbox is that component's true extent even where it overflows.

Which components count, per the sprite-CC rules already in tools/:
  · the BODY is the largest component in the cell
  · a detached component is KEPT if it overlaps the body's vertical span
    (a blade held clear of the hand, a slash arc trailing the swing)
  · it is DROPPED if it is flush to a cell edge (bleed from a neighbour that
    the ownership pass already reassigned) or under 2% of the body (specks)

footOff is measured off the BODY only -- never off a weapon -- because the
draw plants the character by the bbox bottom, and a blade sweeping below the
boots would otherwise lift him into the air on exactly the frames that should
look heaviest.
"""
import numpy as np
from PIL import Image
from collections import deque

SHEET = 'assets/2D sprites/rizer/sapphire-sword-combo.png'
CELL, COLS, ROWS = 313, 4, 4
_IM = np.array(Image.open(SHEET).convert('RGBA'))
COL   = _IM[:, :, :3]
ALPHA = _IM[:, :, 3] > 24
A = ALPHA
H, W = A.shape

# ---- global components, then assign each to the cell owning most of it ------
lab = -np.ones((H, W), int)
comps = []
for y0 in range(H):
    for x0 in range(W):
        if not A[y0, x0] or lab[y0, x0] >= 0: continue
        cid = len(comps); px = []
        q = deque([(y0, x0)]); lab[y0, x0] = cid
        while q:
            y, x = q.popleft(); px.append((y, x))
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    ny, nx = y+dy, x+dx
                    if 0 <= ny < H and 0 <= nx < W and A[ny, nx] and lab[ny, nx] < 0:
                        lab[ny, nx] = cid; q.append((ny, nx))
        comps.append(np.array(px))

owner = {}
for cid, px in enumerate(comps):
    cells = (px[:, 0] // CELL) * COLS + (px[:, 1] // CELL)
    owner[cid] = np.bincount(cells).argmax()

bboxes, footoff, bodyh = [], [], []
for r in range(ROWS):
    rowB, rowF, rowH = [], [], []
    for c in range(COLS):
        cell = r * COLS + c
        mine = [cid for cid in range(len(comps)) if owner[cid] == cell]
        if not mine:
            rowB.append([0, 0, 0, 0]); rowF.append(0); rowH.append(0); continue
        mine.sort(key=lambda cid: -len(comps[cid]))
        body = comps[mine[0]]
        by0, by1 = body[:, 0].min(), body[:, 0].max()
        keep = [body]
        for cid in mine[1:]:
            px = comps[cid]
            if len(px) < 0.02 * len(body): continue                 # speck
            y0, y1, x0, x1 = px[:,0].min(), px[:,0].max(), px[:,1].min(), px[:,1].max()
            ry0, rx0 = r*CELL, c*CELL
            flush = (y0 <= ry0 or y1 >= ry0+CELL-1 or x0 <= rx0 or x1 >= rx0+CELL-1)
            overlaps = not (y1 < by0 or y0 > by1)
            if overlaps and not flush: keep.append(px)               # blade / arc
        allpx = np.concatenate(keep)
        y0, y1 = allpx[:,0].min(), allpx[:,0].max()
        x0, x1 = allpx[:,1].min(), allpx[:,1].max()
        rowB.append([int(x0 - c*CELL), int(y0 - r*CELL), int(x1-x0+1), int(y1-y0+1)])
        rowF.append(0)   # ★ filled in by the row-baseline pass below
        # px between the FEET and the bbox floor
        rowH.append(int(by1 - by0 + 1))     # component height · see the check below
    # ★★★ FOOT LINE = THE ROW'S GROUND LINE.  Three pixel heuristics were
    # tried and each failed for its own reason -- and all three were the wrong
    # KIND of answer.  A sword sheet does not need the feet found by analysis:
    #
    #   ★ THE ARTIST DREW EVERY CELL IN A ROW STANDING ON THE SAME LINE.
    #
    # So the ground line is a property of the ROW, and any frame whose bbox
    # bottom falls below it is a blade hanging past the boots by exactly that
    # much.  On this sheet the rows are emphatic about it: UP's four cells end
    # at 189/189/189/189, RIGHT at 216/216/216/215, and DOWN at 278/278/280
    # with one outlier at 330 -- which is the downward-pointing sword, 52px of
    # it, and nothing else in the row is confused about where the floor is.
    #
    # Recorded because the failures are the argument for this:
    #   · COMPONENT · `by1` is the largest component's bottom, and Rizer HOLDS
    #     the sword, so the blade is IN that component.  Reads a confident 0.
    #   · COLOUR · masking the blade as bright-blue catches the steel but not
    #     the WHITE sparkle at its tip, which has no blue dominance.
    #   · WIDTH · this sword is 34px near the hilt, WIDER than the 27px boot
    #     mass, so thin-versus-thick does not separate them either.
    bottoms = [rowB[c][1] + rowB[c][3] for c in range(COLS)]
    ground  = int(np.median(bottoms))
    rowF    = [max(0, b - ground) for b in bottoms]

    bboxes.append(rowB); footoff.append(rowF); bodyh.append(rowH)

print('  bboxes: [')
for row in bboxes:
    print('    [' + ','.join('[%4d,%4d,%4d,%4d]' % tuple(b) for b in row) + '],')
print('  ],')
print('  footOff: [' + ','.join(str(r) for r in footoff) + '],')

# ★★★ THE FUSED-BLADE CHECK.  bodyBh is supposed to be the CHARACTER, so the
# draw can make him the same height in every pose.  It is taken from the
# largest connected component -- which works only while the weapon is a
# separate component.  The moment the artist draws the blade touching the
# hand (and on a sword sheet he always does), the blade IS the body component,
# and a frame where the blade points down past the boots or up past the hair
# reports a "body" 20-30% too tall.  Scale by that and Rizer SHRINKS on
# exactly those frames.
#
# A blade can only ever ADD to the silhouette, never subtract, so the smallest
# body height on the sheet is the closest thing to the true character -- and
# the frames to trust most are the ones where the blade is HORIZONTAL, which
# is why the side rows agree with each other and the up row does not.
flat = min(min(r) for r in bodyh)
print()
print(f'-- fused-blade check · smallest body on the sheet: {flat}px --')
bad = [(r, c, bodyh[r][c]) for r in range(ROWS) for c in range(COLS)
       if bodyh[r][c] > flat * 1.05]
for r, c, h in bad:
    print(f'   r{r}c{c} reads {h}px · {100*(h/flat-1):.0f}% over · blade leaves the silhouette')
if bad:
    print(f'   -> do NOT use per-row col-0 values.  Declare bodyBh: [{flat}, {flat}, {flat}, {flat}]')
    print('      constScale already promises one character size across all 16 cells.')
else:
    print('   clean · per-row values are safe')
print('  bodyBh:  [' + ','.join(str(r) for r in bodyh) + '],')
print()
for r, nm in enumerate(['DOWN','LEFT','RIGHT','UP']):
    print(f'{nm:>5}  widths {[b[2] for b in bboxes[r]]}  body-h {bodyh[r]}')
