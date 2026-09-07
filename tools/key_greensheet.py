#!/usr/bin/env python3
"""key_greensheet.py · the Elzimir keyer, generalised.  key_greensheet.py SRC DST

★ Same canon as tools/key_elzimir.py: BORDER FLOOD-FILL ONLY, then sealed
pockets, then fringe softening — never a global colour replace, which would
punch holes anywhere the art happens to share the key's value.

★ And the same GREEN-FAMILY test rather than an exact match, so baked ground
shadows (a darker green of the same family) come out with the key.  Verify per
sheet that nothing in the ART is green-family before using it — for Nimbuscrown
the crown's leaf-spikes are dark OLIVE (G never 3x both R and B) and survive.
"""
import sys
from collections import deque
from PIL import Image

SRC, DST = sys.argv[1], sys.argv[2]
im = Image.open(SRC).convert('RGBA')
W, H = im.size
px = im.load()

def is_bg(p):
    r, g, b, a = p
    return a > 0 and g > 90 and g > r * 3 and g > b * 3

seen = [[False] * W for _ in range(H)]
q = deque()
for x in range(W):
    for y in (0, H - 1):
        if is_bg(px[x, y]) and not seen[y][x]: seen[y][x] = True; q.append((x, y))
for y in range(H):
    for x in (0, W - 1):
        if is_bg(px[x, y]) and not seen[y][x]: seen[y][x] = True; q.append((x, y))
n_border = 0
while q:
    x, y = q.popleft(); n_border += 1
    px[x, y] = (0, 0, 0, 0)
    for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
        nx, ny = x + dx, y + dy
        if 0 <= nx < W and 0 <= ny < H and not seen[ny][nx] and is_bg(px[nx, ny]):
            seen[ny][nx] = True; q.append((nx, ny))

pockets = cleared = 0
for y in range(H):
    for x in range(W):
        if seen[y][x] or not is_bg(px[x, y]): continue
        blob, qq = [], deque([(x, y)]); seen[y][x] = True
        while qq:
            cx, cy = qq.popleft(); blob.append((cx, cy))
            for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
                nx, ny = cx + dx, cy + dy
                if 0 <= nx < W and 0 <= ny < H and not seen[ny][nx] and is_bg(px[nx, ny]):
                    seen[ny][nx] = True; qq.append((nx, ny))
        pockets += 1; cleared += len(blob)
        for cx, cy in blob: px[cx, cy] = (0, 0, 0, 0)

fringe = 0
for y in range(H):
    for x in range(W):
        r, g, b, a = px[x, y]
        if a == 0: continue
        if g > r + 40 and g > b + 40:
            px[x, y] = (r, max(r, b), b, a); fringe += 1

im.save(DST)
op = sum(1 for y in range(0, H, 2) for x in range(0, W, 2) if px[x, y][3] > 8) * 4
print(f'{DST}: border {n_border:,} · {pockets} pocket(s) {cleared:,} · '
      f'{fringe:,} fringe · ~{op:,} opaque ({op/(W*H)*100:.1f}%)')
