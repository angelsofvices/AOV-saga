#!/usr/bin/env python3
"""Measure the nine District Elder 4x4 sheets by COMPONENT OWNERSHIP.

★★★★ WHY NOT PER-CELL. Every one of these sheets has LEFT-row art that touches
both the top and the bottom of its 313px cell — 88 to 115 opaque pixels on the
very first and last scanline. A naive per-cell bbox therefore returns y=0,
h=313 on row 1 of all eight sheets, which is not the character: it is the
character PLUS the row above bleeding down and the row below bleeding up.

★★★ "A component may overhang its cell; a RECTANGLE may not contain a
neighbour's art."  A box that swallows the neighbour draws that neighbour twice
— once at home and once as litter beside this frame. So ownership decides:
label every connected blob, give it to the cell its CENTRE OF MASS falls in, and
measure only the blobs this cell owns.

★ Tiny blobs are dropped (MIN_COMPONENT): anti-aliasing leaves specks along a
cut line, and a 12px speck from the next row would drag a box 30 pixels.

    python3 tools/measure_elder_sheets.py [name ...]
"""
import os, sys
import numpy as np
from PIL import Image
from collections import deque

CELL = 313
DIRS = ['DOWN', 'LEFT', 'RIGHT', 'UP']
MIN_COMPONENT = 120
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ELDERS = ['ivelith','mora','selis','voss','ezekar','naela','draith','yorik']


def owner_boxes(path):
    a = np.array(Image.open(path).convert('RGBA'))
    mask = a[..., 3] > 20
    H, W = mask.shape
    seen = np.zeros((H, W), bool)
    boxes = {}
    ys, xs = np.nonzero(mask)
    for sy, sx in zip(ys, xs):
        if seen[sy, sx]:
            continue
        dq = deque([(sy, sx)]); seen[sy, sx] = True
        px = []
        while dq:
            y, x = dq.popleft(); px.append((y, x))
            for dy, dx in ((-1,0),(1,0),(0,-1),(0,1),(-1,-1),(-1,1),(1,-1),(1,1)):
                ny, nx = y+dy, x+dx
                if 0 <= ny < H and 0 <= nx < W and not seen[ny, nx] and mask[ny, nx]:
                    seen[ny, nx] = True; dq.append((ny, nx))
        if len(px) < MIN_COMPONENT:
            continue
        cy = sum(p[0] for p in px) / len(px)
        cx = sum(p[1] for p in px) / len(px)
        r = min(3, max(0, int(cy // CELL))); c = min(3, max(0, int(cx // CELL)))
        # ★★★★ CLAMP THE BOX TO ITS OWN CELL.
        #   Ownership alone is not enough on these sheets: ezekar and naela have
        #   274 and 213 opaque pixels BRIDGING the seam between the LEFT and
        #   RIGHT rows, so those two rows are literally one connected blob. Give
        #   that blob to whichever cell holds its centroid and you get a 584px
        #   box reaching y=-286 into the row above, and the other row measures
        #   None. Neither number is a character.
        #   ★ So: the COMPONENT decides ownership, the CELL decides extent. A
        #     component may overhang its cell; a rectangle may not contain a
        #     neighbour's art — and on a seam this dirty, the cell edge is the
        #     only honest place to stop.
        ry0, ry1 = r*CELL, (r+1)*CELL - 1
        rows_ = [q[0] for q in px if ry0 <= q[0] <= ry1]
        cols_ = [q[1] for q in px if ry0 <= q[0] <= ry1]
        if not rows_:
            continue
        y0, y1 = min(rows_), max(rows_)
        x0, x1 = min(cols_), max(cols_)
        k = (r, c)
        if k in boxes:
            b = boxes[k]
            boxes[k] = [min(b[0], x0), min(b[1], y0), max(b[2], x1), max(b[3], y1)]
        else:
            boxes[k] = [x0, y0, x1, y1]
    out = []
    for r in range(4):
        row = []
        for c in range(4):
            b = boxes.get((r, c))
            if not b:
                row.append(None); continue
            # back to cell-relative x,y,w,h — the format the bbox tables use
            row.append([int(b[0] - c*CELL), int(b[1] - r*CELL), int(b[2]-b[0]+1), int(b[3]-b[1]+1)])
        out.append(row)
    return out


for name in (sys.argv[1:] or ELDERS):
    p = os.path.join(ROOT, 'assets/2D sprites/npcs/elders', name + '.png')
    if not os.path.exists(p):
        print(f'{name}: no sheet at {p}'); continue
    T = owner_boxes(p)
    print(f'\n  {name}.png')
    for r in range(4):
        print(f'    {DIRS[r]:6s} ' + '  '.join(str(b) for b in T[r]))
    print('    bboxes:[')
    for r in range(4):
        print('      [' + ','.join(str(b) for b in T[r]) + '],')
    print('    ],')
