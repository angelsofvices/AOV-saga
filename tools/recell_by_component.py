#!/usr/bin/env python3
"""recell_by_component.py SRC DST [--src-cell N] [--dst-cell F]

★★★ ONE FULL BODY PER FRAME — by OWNERSHIP, not by clipping.

Creator: "fix all cell bleeding in any zyrex animation. all zyrex should be one
full body per frame."

Some sheets are drawn with the creature slightly larger than its cell, so each
body overflows the line — usually downward, feet crossing into the row below.
That single fact breaks a rigid cell copy in BOTH directions at once:
  · clipping to the cell SAWS THE FEET OFF the body that owns them
  · and drags in the sliver of the body ABOVE that is hanging into this cell,
    so the frame contains part of a second creature

★★ Neither is fixable by choosing a better rectangle, because the two bodies
genuinely overlap the same band of pixels. It is only fixable by deciding WHOSE
each pixel is. So:
  1 · flood-fill the whole sheet into connected components
  2 · assign each component to the cell containing its CENTROID — its own body's
      cell, wherever its extremities wander
  3 · paint each cell's components, WHOLE, into a fresh slot

★ This is the canon rule ([[aov-sprite-cc-extractor]]: never cell-clip, owned
overflow is legal) applied at import time instead of at measurement time. A
beam or a tail that leaves the cell still leaves it — it just leaves it as part
of the body that fired it, and never as litter in the neighbour's frame.

★ Components are kept TOGETHER and moved as one rigid group, so the pose is
untouched: no pixel changes colour, and none moves relative to its own body.
"""
import sys
from collections import deque
from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
SC = int(sys.argv[sys.argv.index('--src-cell')+1]) if '--src-cell' in sys.argv else 256
DC = float(sys.argv[sys.argv.index('--dst-cell')+1]) if '--dst-cell' in sys.argv else 313.5
MINPX = 24          # ★ below this a component is dust, not a body part

im = Image.open(src).convert('RGBA')
W, H = im.size
px = im.load()

seen = [[False]*W for _ in range(H)]
comps = []
for Y in range(H):
    for X in range(W):
        if seen[Y][X] or px[X, Y][3] <= 8: continue
        blob = []; q = deque([(X, Y)]); seen[Y][X] = True
        while q:
            cx, cy = q.popleft(); blob.append((cx, cy))
            for dx, dy in ((1,0),(-1,0),(0,1),(0,-1),(1,1),(1,-1),(-1,1),(-1,-1)):
                nx, ny = cx+dx, cy+dy
                if 0 <= nx < W and 0 <= ny < H and not seen[ny][nx] and px[nx, ny][3] > 8:
                    seen[ny][nx] = True; q.append((nx, ny))
        if len(blob) >= MINPX: comps.append(blob)

# ── assign every component to a cell · BY MASS, not by centroid ────────────
# ★★★ CENTROID ALONE IS WRONG WHEN TWO BODIES TOUCH. On the Veridrax attack
# sheet the dragons in rows 1-2 are wide enough that each one's tail reaches
# the next one's wing, so the flood-fill returns THREE DRAGONS AS ONE
# COMPONENT — and a centroid then dumps all three into whichever cell the
# middle of the pile lands in. Two rows came out as one smeared blob and two
# cells came out empty.
#
# ★★ The distinction that actually matters: a component spanning cells is
# either ONE BODY WITH OVERFLOW (nearly all its mass in one cell, a tail or a
# beam poking out) or SEVERAL BODIES FUSED (real mass in each). Mass answers
# that; position cannot.
#   · dominant cell holds >= FUSE_KEEP of the pixels → one body, moved whole,
#     overflow and all — the canon rule preserved
#   · otherwise → fused, so cut it along the cell lines and let each piece go
#     to the cell it was drawn in
# ★ Splitting is the FALLBACK, never the default: it is the only operation here
# that can cut a sprite, so it happens only where leaving it whole is provably
# wrong.
FUSE_KEEP = 0.70
buckets = {}
split_n = 0
for blob in comps:
    mass = {}
    for (x, y) in blob:
        k = (min(3, int(y // SC)), min(3, int(x // SC)))
        mass[k] = mass.get(k, 0) + 1
    top, topn = max(mass.items(), key=lambda kv: kv[1])
    if topn / len(blob) >= FUSE_KEEP or len(mass) == 1:
        buckets.setdefault(top, []).append(blob)
    else:
        split_n += 1
        parts = {}
        for (x, y) in blob:
            k = (min(3, int(y // SC)), min(3, int(x // SC)))
            parts.setdefault(k, []).append((x, y))
        for k, pts in parts.items():
            if len(pts) >= MINPX: buckets.setdefault(k, []).append(pts)

out = Image.new('RGBA', (int(DC*4), int(DC*4)), (0, 0, 0, 0))
op = out.load()
moved = 0
for r in range(4):
    for c in range(4):
        blobs = buckets.get((r, c), [])
        if not blobs: continue
        pts = [p for b in blobs for p in b]
        x0 = min(p[0] for p in pts); x1 = max(p[0] for p in pts)
        y0 = min(p[1] for p in pts); y1 = max(p[1] for p in pts)
        bw, bh = x1-x0+1, y1-y0+1
        # centre the WHOLE group in its slot · one rigid translation
        ox = int(round(c*DC + (DC-bw)/2)) - x0
        oy = int(round(r*DC + (DC-bh)/2)) - y0
        for (x, y) in pts:
            nx, ny = x+ox, y+oy
            if 0 <= nx < out.size[0] and 0 <= ny < out.size[1]:
                op[nx, ny] = px[x, y]
        moved += 1
out.save(dst)
print(f'{dst}: {len(comps)} component(s) → {moved} cell(s) · '
      f'{split_n} fused component(s) split at the cell line · nothing resampled')
if moved < 16:
    print(f'  ★ WARNING · only {moved}/16 cells received art — check the source grid')
