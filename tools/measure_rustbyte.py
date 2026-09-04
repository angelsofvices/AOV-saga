#!/usr/bin/env python3
"""CC-measure rustbyte.png for its SUMMONABLE_SPRITES entry.

The NPC beside Auraxion already carries a hand-authored bbox table for this
same sheet, and it is NOT reused here.  Those numbers predate the component
-ownership rule and every sheet re-measured under it has moved -- so they are
treated as a prior to check against, not as an answer to copy.
"""
import numpy as np
from PIL import Image
from collections import deque

SHEET = 'assets/2D sprites/zyrex/rustbyte.png'
CELL, COLS, ROWS = 313, 4, 4
A = np.array(Image.open(SHEET).convert('RGBA'))[:, :, 3] > 24
H, W = A.shape
print(f'{SHEET} · {W}x{H} · {A.mean()*100:.1f}% opaque')

lab = -np.ones((H, W), int); comps = []
for y0 in range(H):
    for x0 in range(W):
        if not A[y0, x0] or lab[y0, x0] >= 0: continue
        cid = len(comps); px = []; q = deque([(y0, x0)]); lab[y0, x0] = cid
        while q:
            y, x = q.popleft(); px.append((y, x))
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    ny, nx = y+dy, x+dx
                    if 0 <= ny < H and 0 <= nx < W and A[ny, nx] and lab[ny, nx] < 0:
                        lab[ny, nx] = cid; q.append((ny, nx))
        comps.append(np.array(px))
print(f'{len(comps)} components')

owner = {}
for cid, px in enumerate(comps):
    cells = (px[:, 0] // CELL) * COLS + (px[:, 1] // CELL)
    owner[cid] = np.bincount(cells).argmax()

bb, bodyh = [], []
for r in range(ROWS):
    rb, rh = [], []
    for c in range(COLS):
        cell = r * COLS + c
        mine = sorted([i for i in range(len(comps)) if owner[i] == cell],
                      key=lambda i: -len(comps[i]))
        if not mine: rb.append([0,0,0,0]); rh.append(0); continue
        body = comps[mine[0]]
        by0, by1 = body[:,0].min(), body[:,0].max()
        keep = [body]
        for cid in mine[1:]:
            px = comps[cid]
            if len(px) < 0.02 * len(body): continue
            y0,y1,x0,x1 = px[:,0].min(), px[:,0].max(), px[:,1].min(), px[:,1].max()
            ry0, rx0 = r*CELL, c*CELL
            flush = (y0<=ry0 or y1>=ry0+CELL-1 or x0<=rx0 or x1>=rx0+CELL-1)
            if (not (y1 < by0 or y0 > by1)) and not flush: keep.append(px)
        ap = np.concatenate(keep)
        y0,y1,x0,x1 = ap[:,0].min(), ap[:,0].max(), ap[:,1].min(), ap[:,1].max()
        rb.append([int(x0-c*CELL), int(y0-r*CELL), int(x1-x0+1), int(y1-y0+1)])
        rh.append(int(by1-by0+1))
    bb.append(rb); bodyh.append(rh)

print('    bboxes: [')
for row in bb:
    print('      [' + ','.join('[%4d,%4d,%4d,%4d]' % tuple(b) for b in row) + '],')
print('    ],')
print('    bodyBh:', [r[0] for r in bodyh])

OLD = [
 [[ 76,70,220,238],[57, 70,221,238],[37, 73,220,235],[19, 73,218,235]],
 [[100,65,146,228],[88, 65,145,228],[68, 65,146,228],[50, 65,145,228]],
 [[111,51,139,225],[100,51,141,225],[81, 51,139,225],[67, 51,138,225]],
 [[ 72,29,218,231],[56, 29,217,231],[39, 29,218,231],[24, 29,217,231]],
]
print('\n-- vs the NPC table --')
worst = 0
for r in range(4):
    for c in range(4):
        d = max(abs(a-b) for a, b in zip(bb[r][c], OLD[r][c]))
        worst = max(worst, d)
        if d: print(f'  r{r}c{c} new {bb[r][c]}  old {OLD[r][c]}  delta {d}')
print(f'worst delta: {worst}px')
