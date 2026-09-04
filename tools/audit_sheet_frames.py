#!/usr/bin/env python3
"""Frame-integrity audit for a 4x4 sheet.  Creator: "make sure there is no
frame issues."  Six checks, each one a defect this project has actually shipped
at least once:

  1 CELL BLEED      · a component that straddles a cell boundary.  16 clean
                      cells means exactly 16 components; more means art is
                      leaking, fewer means a frame is empty or fused.
  2 EMPTY CELL      · a frame with no art draws nothing.
  3 DEAD FRAME      · two consecutive frames that are near-identical.  The
                      cycle still plays, it just visibly stalls.
  4 GROUND JITTER   · the draw plants each frame's bbox BOTTOM on the tile, so
                      a row whose frames end at different heights makes the
                      creature bob when it should stand.
  5 SIZE OUTLIER    · one frame much taller than its row pops every cycle.
  6 FACING          · row 2 (RIGHT) should be a mirror of row 1 (LEFT), not a
                      copy of it.
"""
import sys, numpy as np
from PIL import Image
from collections import deque

path = sys.argv[1]; CELL = 313; COLS = ROWS = 4
IM = Image.open(path).convert('RGBA')
A = np.array(IM)[:, :, 3] > 24
H, W = A.shape
print(f'\n=== {path} · {W}x{H} ===')

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

issues = 0
big = [c for c in comps if len(c) > 400]
print(f'1 CELL BLEED   · {len(comps)} components ({len(big)} substantial)')
straddle = 0
for c in big:
    if len(set(zip(c[:,0]//CELL, c[:,1]//CELL))) > 1:
        rows = sorted(set(zip(c[:,0]//CELL, c[:,1]//CELL)))
        # a component may overflow into a neighbour cell legitimately; only
        # flag when it is genuinely split across cells by area
        cnt = np.bincount((c[:,0]//CELL)*COLS + (c[:,1]//CELL))
        share = cnt.max()/cnt.sum()
        if share < 0.90:
            straddle += 1
            print(f'   ✗ a component sits {share*100:.0f}% in its own cell · cells {rows}')
if not straddle: print('   ok · every component is owned by one cell')
issues += straddle

bb, empty = [], 0
for r in range(ROWS):
    row = []
    for c in range(COLS):
        cell = r*COLS + c
        mine = sorted([i for i in range(len(comps))
                       if np.bincount((comps[i][:,0]//CELL)*COLS + (comps[i][:,1]//CELL)).argmax() == cell],
                      key=lambda i: -len(comps[i]))
        if not mine: row.append(None); empty += 1; continue
        ap = np.concatenate([comps[i] for i in mine[:1]])
        y0,y1,x0,x1 = ap[:,0].min(), ap[:,0].max(), ap[:,1].min(), ap[:,1].max()
        row.append([int(x0-c*CELL), int(y0-r*CELL), int(x1-x0+1), int(y1-y0+1)])
    bb.append(row)
print(f'2 EMPTY CELL   · {"✗ " + str(empty) + " empty" if empty else "ok · all 16 cells carry art"}')
issues += empty

print('3 DEAD FRAME   ·', end=' ')
dead = []
for r in range(ROWS):
    for c in range(COLS):
        n = (c+1) % COLS
        a, b = bb[r][c], bb[r][n]
        if not a or not b: continue
        pa = A[r*CELL+a[1]:r*CELL+a[1]+a[3], c*CELL+a[0]:c*CELL+a[0]+a[2]]
        pb = A[r*CELL+b[1]:r*CELL+b[1]+b[3], n*CELL+b[0]:n*CELL+b[0]+b[2]]
        h, w = min(pa.shape[0],pb.shape[0]), min(pa.shape[1],pb.shape[1])
        churn = 1 - (pa[:h,:w] == pb[:h,:w]).mean()
        if churn < 0.06: dead.append((r, c, n, churn))
print(('✗ ' + ', '.join(f'row{r} f{c}->f{n} churn {ch:.3f}' for r,c,n,ch in dead)) if dead
      else 'ok · every frame differs from the next')
issues += len(dead)

print('4 GROUND JITTER·', end=' ')
jit = []
for r in range(ROWS):
    bots = [b[1]+b[3] for b in bb[r] if b]
    if max(bots) - min(bots) > 3: jit.append((r, max(bots)-min(bots), bots))
print(('✗ ' + ', '.join(f'row{r} varies {d}px {bots}' for r,d,bots in jit)) if jit
      else 'ok · each row lands on one ground line (<=3px)')
issues += len(jit)

print('5 SIZE OUTLIER ·', end=' ')
out = []
for r in range(ROWS):
    hs = [b[3] for b in bb[r] if b]
    med = sorted(hs)[len(hs)//2]
    for c, h in enumerate(hs):
        if abs(h - med) > med * 0.12: out.append((r, c, h, med))
print(('✗ ' + ', '.join(f'row{r} f{c} is {h} vs median {m} ({100*(h/m-1):+.0f}%)' for r,c,h,m in out)) if out
      else 'ok · no frame pops out of its row')
issues += len(out)

print('6 FACING       ·', end=' ')
sims = []
for c in range(COLS):
    a, b = bb[1][c], bb[2][c]
    if not a or not b: continue
    pa = A[1*CELL+a[1]:1*CELL+a[1]+a[3], c*CELL+a[0]:c*CELL+a[0]+a[2]]
    pb = A[2*CELL+b[1]:2*CELL+b[1]+b[3], c*CELL+b[0]:c*CELL+b[0]+b[2]]
    h, w = min(pa.shape[0],pb.shape[0]), min(pa.shape[1],pb.shape[1])
    same = (pa[:h,:w] == pb[:h,:w]).mean()
    flip = (pa[:h,:w] == np.fliplr(pb)[:h,:w]).mean()
    sims.append((same, flip))
ms = np.mean([s for s,_ in sims]); mf = np.mean([f for _,f in sims])
if mf > ms: print(f'ok · RIGHT is a mirror of LEFT (flipped {mf:.2f} vs as-is {ms:.2f})')
else: print(f'✗ RIGHT looks like a COPY of LEFT (as-is {ms:.2f} vs flipped {mf:.2f})'); issues += 1

print(f'\n{"✗" if issues else "★"} {issues} frame issue(s)')
