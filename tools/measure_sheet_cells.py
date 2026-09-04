#!/usr/bin/env python3
"""Measure any 4x4 sheet by component ownership · prints CELL-RELATIVE boxes.

The wild/NPC draw computes  sx = col*cellW + bb[0],  sy = row*cellH + bb[1],
so every declared table must be cell-relative.  This prints what the pixels
actually say, so a table's convention is settled by measurement rather than by
reading the numbers and guessing which system their author had in mind.
"""
import sys, numpy as np
from PIL import Image
from collections import deque

path = sys.argv[1]
CELL = int(sys.argv[2]) if len(sys.argv) > 2 else 313
COLS = ROWS = 4
A = np.array(Image.open(path).convert('RGBA'))[:, :, 3] > 24
H, W = A.shape

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

owner = {}
for cid, px in enumerate(comps):
    cells = (px[:, 0] // CELL) * COLS + (px[:, 1] // CELL)
    owner[cid] = np.bincount(cells).argmax()

print(f'# {path} · {W}x{H} · cell {CELL} · {len(comps)} components')
out = []
for r in range(ROWS):
    row = []
    for c in range(COLS):
        cell = r * COLS + c
        mine = sorted([i for i in range(len(comps)) if owner[i] == cell],
                      key=lambda i: -len(comps[i]))
        if not mine: row.append([0, 0, 0, 0]); continue
        body = comps[mine[0]]
        by0, by1 = body[:, 0].min(), body[:, 0].max()
        keep = [body]
        for cid in mine[1:]:
            px = comps[cid]
            if len(px) < 0.02 * len(body): continue
            y0, y1 = px[:, 0].min(), px[:, 0].max()
            if not (y1 < by0 or y0 > by1): keep.append(px)
        ap = np.concatenate(keep)
        y0, y1 = ap[:, 0].min(), ap[:, 0].max()
        x0, x1 = ap[:, 1].min(), ap[:, 1].max()
        row.append([int(x0 - c*CELL), int(y0 - r*CELL), int(x1-x0+1), int(y1-y0+1)])
    out.append(row)
for row in out:
    print('      [' + ','.join('[%4d,%4d,%4d,%4d]' % tuple(b) for b in row) + '],')
