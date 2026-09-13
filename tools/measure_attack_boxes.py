#!/usr/bin/env python3
# ★★★ MEASURE AN ATTACK SHEET'S BBOX TABLE · components in, rectangles out.
#
#   python3 tools/measure_attack_boxes.py skybeam volcaxor
#
# ★ THE TWO RULES THIS EXISTS TO HOLD AT ONCE, which pull against each other:
#
#   1. A COMPONENT MAY OVERHANG ITS CELL, and must. Skybeam's up-beam starts
#      72px above its own row; Vampella's spear reaches x -4 w 324. Clipping
#      those at the cell line is the bug the CC canon was written to stop
#      ([[aov-sprite-cc-extractor]]).
#
#   2. A RECTANGLE MAY NOT CONTAIN A NEIGHBOUR'S ART. The draw path blits
#      rectangles, not components — so the instant one frame's box reaches into
#      a region another frame owns, that art is drawn twice: once in its own
#      frame and once as litter in someone else's. Voltigrax hit this at
#      v0.95.997; Skybeam hits it here, with the up-beam appearing as a floating
#      shard under the right-facing dragon.
#
# ★★ The resolution is not "clip everything" or "keep everything". It is:
#   own the overhang, then TRIM any edge strip that is mostly somebody else's,
#   and stop as soon as the trimming would cost this frame real art. On Skybeam
#   that threshold falls in exactly the right place — the colliding band holds
#   0.8% of the right-facing frame and 100% of the up-beam shard.
import sys, json
import numpy as np
from PIL import Image
from collections import deque

C = 313
MIN_COMPONENT = 40     # below this it is chroma dust, not art
MOSTLY_THEIRS  = 1.0   # trim a strip while foreign pixels outnumber own
MAX_OWN_LOSS   = 0.03  # ...but never give away more than 3% of the frame

def owner_map(alpha):
    """label every pixel with the (row,col) frame that OWNS it, by component."""
    H, W = alpha.shape
    mask = alpha > 8
    seen = np.zeros((H, W), bool)
    own  = -np.ones((H, W), np.int16)
    ys, xs = np.nonzero(mask)
    for sy, sx in zip(ys, xs):
        if seen[sy, sx]: continue
        dq = deque([(sy, sx)]); seen[sy, sx] = True; px = []
        while dq:
            y, x = dq.popleft(); px.append((y, x))
            for dy, dx in ((-1,0),(1,0),(0,-1),(0,1),(-1,-1),(-1,1),(1,-1),(1,1)):
                ny, nx = y + dy, x + dx
                if 0 <= ny < H and 0 <= nx < W and not seen[ny, nx] and mask[ny, nx]:
                    seen[ny, nx] = True; dq.append((ny, nx))
        if len(px) < MIN_COMPONENT: continue
        # ★ a component belongs to the cell holding its CENTRE OF MASS — which
        #   is the body, because the body is where the pixels are. A beam three
        #   times longer than the dragon still weighs less than the dragon.
        cy = sum(p[0] for p in px) / len(px)
        cx = sum(p[1] for p in px) / len(px)
        oid = min(3, max(0, int(cy // C))) * 4 + min(3, max(0, int(cx // C)))
        for y, x in px: own[y, x] = oid
    return own

def body_height(alpha, r, c, box, frac=0.26):
    """torso+head height: the opaque run in the central band of the frame, with
       wings and sideways VFX excluded. This is what `refBh` is supposed to be —
       a BODY height — and it is why the col-0 silhouette max is the wrong
       yardstick for anything with wings."""
    bx, by, bw, bh = box
    x0, y0 = c * C + bx, r * C + by
    sub = alpha[max(0, y0):y0 + bh, max(0, x0):x0 + bw]
    if sub.size == 0: return 0
    w = sub.shape[1]; k = max(1, int(w * frac / 2))
    mid = sub[:, max(0, w // 2 - k): w // 2 + k]
    ys = np.nonzero((mid > 8).any(axis=1))[0]
    return int(ys.max() - ys.min() + 1) if len(ys) else 0

def measure(name):
    path = f'assets/2D sprites/zyrex/attacks/attack_{name}.png'
    alpha = np.array(Image.open(path).convert('RGBA'))[..., 3]
    own = owner_map(alpha)
    H, W = alpha.shape
    table, trims = [], []
    for r in range(4):
        row = []
        for c in range(4):
            oid = r * 4 + c
            ys, xs = np.nonzero(own == oid)
            if not len(ys): row.append([0, 0, 1, 1]); continue
            total = len(ys)
            y0, y1, x0, x1 = int(ys.min()), int(ys.max()), int(xs.min()), int(xs.max())
            lost = 0
            def strip(sl):
                s = own[sl]
                return ((s >= 0) & (s != oid)).sum(), (s == oid).sum()
            moved = True
            while moved and y1 > y0 + 1 and x1 > x0 + 1:
                moved = False
                for edge in ('bottom', 'top', 'right', 'left'):
                    sl = {'bottom': (slice(y1, y1+1), slice(x0, x1+1)),
                          'top':    (slice(y0, y0+1), slice(x0, x1+1)),
                          'right':  (slice(y0, y1+1), slice(x1, x1+1)),
                          'left':   (slice(y0, y1+1), slice(x0, x0+1))}[edge]
                    foreign, mine = strip(sl)
                    if foreign == 0: continue
                    if foreign > mine * MOSTLY_THEIRS and (lost + mine) <= total * MAX_OWN_LOSS:
                        lost += mine
                        if   edge == 'bottom': y1 -= 1
                        elif edge == 'top':    y0 += 1
                        elif edge == 'right':  x1 -= 1
                        else:                  x0 += 1
                        moved = True
                        break
            if lost: trims.append((r, c, lost, total))
            row.append([x0 - c * C, y0 - r * C, x1 - x0 + 1, y1 - y0 + 1])
        table.append(row)
    return alpha, table, trims

for name in sys.argv[1:]:
    alpha, table, trims = measure(name)
    print(f'\n// ── {name} ' + '─' * 40)
    for row in table:
        print('      [' + ','.join(f'[{v[0]:4d},{v[1]:4d},{v[2]:4d},{v[3]:4d}]' for v in row) + '],')
    bodies = [body_height(alpha, r, 0, table[r][0]) for r in range(4)]
    print(f'   col-0 BODY heights (torso band): {bodies}')
    print(f'   col-0 silhouette heights       : {[table[r][0][3] for r in range(4)]}')
    if trims:
        print('   ★ trimmed off a neighbour\'s art:')
        for r, c, lost, total in trims:
            print(f'       r{r}c{c}  gave up {lost} px ({100*lost/total:.1f}% of its own)')
    json.dump(table, open(f'/tmp/{name}_tbl.json', 'w'))
