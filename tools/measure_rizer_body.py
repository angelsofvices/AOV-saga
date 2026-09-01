"""Measure Rizer's TRUE body height per direction, for the bodyBh tables.

Creator, 2026-09-01: *"rizer is shorter in idle up left and right. idle down is
correct height. can we fix the others to match?"*

★ THE DISTINCTION THIS TOOL EXISTS TO MAKE.  A declared bbox is what gets
CROPPED; the true body is what the player SEES.  They are not the same number,
and on the idle sheet's UP row they differ by 33px — the box reserves 30px above
his head for hair the source does not contain.  Dividing by the box therefore
shrank exactly the rows whose box was most overstated.

Body height = the largest connected component in the cell, so a stray keyed
speck or a neighbouring cell's overflow cannot inflate it.  Column 0 is the row
reference, matching the engine's own convention — which keeps the run bounce
(RUN varies 12-15px within a row on purpose; IDLE and WALK vary 0-2).

    python3 tools/measure_rizer_body.py [sheet.png ...]
"""
import os, sys
import numpy as np
from PIL import Image
from collections import deque

CELL = 313
DIRS = ['DOWN', 'LEFT', 'RIGHT', 'UP']
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT = [os.path.join(ROOT, 'assets/2D sprites/rizer', f)
           for f in ('idle.png', 'walk.png', 'run.png')]


def own_component(op, r, c):
    y0, x0 = r * CELL, c * CELL
    sub = op[y0:y0 + CELL, x0:x0 + CELL]
    if not sub.any():
        return None
    lab = np.zeros(sub.shape, np.int32); best = None; n = 0
    for sy in range(CELL):
        for sx in np.where(sub[sy] & (lab[sy] == 0))[0]:
            n += 1; lab[sy, sx] = n; dq = deque([(sy, sx)]); ys = []
            while dq:
                y, x = dq.popleft(); ys.append(y)
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        ny, nx = y + dy, x + dx
                        if 0 <= ny < CELL and 0 <= nx < CELL and sub[ny, nx] and not lab[ny, nx]:
                            lab[ny, nx] = n; dq.append((ny, nx))
            if best is None or len(ys) > best[0]:
                best = (len(ys), min(ys), max(ys))
    return best


for path in (sys.argv[1:] or DEFAULT):
    a = np.array(Image.open(path).convert('RGBA'))
    op = a[..., 3] > 20
    print(f'\n  {os.path.basename(path)}')
    table = []
    for r in range(4):
        hs = []
        for c in range(4):
            b = own_component(op, r, c)
            hs.append(b[2] - b[1] + 1 if b else 0)
        table.append(hs[0])
        print(f'    {DIRS[r]:6s} col-0 {hs[0]:3d}   row {hs}   spread {max(hs)-min(hs)}')
    print(f'    bodyBh: {table}')
