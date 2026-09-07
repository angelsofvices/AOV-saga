#!/usr/bin/env python3
"""strip_baked_shadows.py SRC DST

★ Remove BAKED GROUND SHADOWS that a chroma key cannot reach.

The sprite prompt forbids them ("NO drop shadow, NO ground shadow · the engine
draws its own; a baked one doubles up"), but some sheets arrive with a grey
smudge under the feet anyway. Unlike Elzimir's shadows — which were GREEN and
so came out with the key — these are neutral grey-brown, the same family as the
creature's own armour, so no colour test can separate them globally.

★★ What separates them is that they are DETACHED and DULL. Per cell:
  · the largest connected component is the BODY · always kept
  · any other component is kept if it is bright or saturated — that is VFX
    (lightning arcs, sparks), which is genuinely part of the sprite and must
    survive ([[aov-sprite-cc-extractor]]: owned overflow is legal)
  · a detached component that is small AND dim AND desaturated is a shadow or
    a dust puff, and goes.
★ The test is deliberately conservative: when in doubt it KEEPS. Deleting a
lightning fork is a visible defect; leaving one shadow speck is not.
"""
import sys
from collections import deque
from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGBA')
W, H = im.size
px = im.load()
CELL = W / 4.0

def comps(x0, y0, x1, y1):
    seen = set(); out = []
    for y in range(y0, y1):
        for x in range(x0, x1):
            if (x, y) in seen or px[x, y][3] <= 8: continue
            blob = []; q = deque([(x, y)]); seen.add((x, y))
            while q:
                cx, cy = q.popleft(); blob.append((cx, cy))
                for dx, dy in ((1,0),(-1,0),(0,1),(0,-1),(1,1),(1,-1),(-1,1),(-1,-1)):
                    nx, ny = cx+dx, cy+dy
                    if x0 <= nx < x1 and y0 <= ny < y1 and (nx,ny) not in seen and px[nx,ny][3] > 8:
                        seen.add((nx,ny)); q.append((nx,ny))
            out.append(blob)
    return out

removed = kept = 0
for r in range(4):
    for c in range(4):
        x0, y0 = int(c*CELL), int(r*CELL)
        x1, y1 = int((c+1)*CELL), int((r+1)*CELL)
        cs = sorted(comps(x0, y0, x1, y1), key=len, reverse=True)
        for blob in cs[1:]:
            n = len(blob)
            # ★ NO SIZE GUARD. The first version kept anything over 400px on the
            # theory that a big component must be real — and that is exactly
            # what the biggest ground smudges are. The body is always cs[0] and
            # never reaches this loop, and real VFX is BRIGHT, so brightness
            # alone separates them at any size. A size test here only protects
            # the largest shadows, which are the most visible ones.
            mx = my = mn = 0
            for (x, y) in blob:
                R, G, B, _ = px[x, y]
                mx += max(R,G,B); mn += min(R,G,B); my += (R+G+B)/3
            n_ = float(n)
            bright = mx/n_                      # peak channel · VFX blows this out
            sat    = (mx-mn)/n_                 # colourfulness
            if bright < 165 and sat < 70:       # dim AND grey → shadow/dust
                for (x, y) in blob: px[x, y] = (0,0,0,0)
                removed += 1
            else:
                kept += 1
im.save(dst)
print(f'{dst}: {removed} dull detached component(s) removed · {kept} bright/large kept')
