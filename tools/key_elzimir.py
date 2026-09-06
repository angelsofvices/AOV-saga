#!/usr/bin/env python3
"""key_elzimir.py · chroma-key the Elzimir sheet.

★ THIS SHEET SHIPPED WITH BAKED GROUND SHADOWS — a dark-green ellipse under
every one of the sixteen creatures.  The pixel-sprite prompt forbids them
("NO drop shadow, NO ground shadow · the engine draws its own; a baked one
doubles up") and they are NOT the key colour, so a plain #00FF00 match would
leave sixteen dark blobs floating on the grass.

They come out anyway, because the honest test is not "is this pixel the exact
key colour" but "is this pixel GREEN-FAMILY" — G dominant, R and B both tiny.
The key reads (20,246,15) and the shadow reads (13,150,7): different values,
same family.  Nothing in Elzimir's palette is green (blue plate, silver horns,
gold wings, magenta crest), so the family test cannot touch the art — verified
against the darkest art pixels, which are neutral (3,3,8) or warm (53,12,11).
"""
import sys
from collections import deque
from PIL import Image

SRC = sys.argv[1] if len(sys.argv) > 1 else '/tmp/elzimir_raw.png'
DST = sys.argv[2] if len(sys.argv) > 2 else '/tmp/elzimir.png'

im = Image.open(SRC).convert('RGBA')
W, H = im.size
px = im.load()

def is_bg(p):
    r, g, b, a = p
    return a > 0 and g > 90 and g > r * 3 and g > b * 3

# ── border flood-fill · the canon rule, never a global colour replace ──────
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

# ── enclosed pockets · between a wing and the torso, inside a curled tail ──
pockets = 0
cleared = 0
for y in range(H):
    for x in range(W):
        if seen[y][x] or not is_bg(px[x, y]): continue
        blob, qq = [], deque([(x, y)])
        seen[y][x] = True
        while qq:
            cx, cy = qq.popleft(); blob.append((cx, cy))
            for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
                nx, ny = cx + dx, cy + dy
                if 0 <= nx < W and 0 <= ny < H and not seen[ny][nx] and is_bg(px[nx, ny]):
                    seen[ny][nx] = True; qq.append((nx, ny))
        pockets += 1; cleared += len(blob)
        for cx, cy in blob: px[cx, cy] = (0, 0, 0, 0)

# ── de-fringe · soften green bleed on the anti-aliased rim ─────────────────
fringe = 0
for y in range(H):
    for x in range(W):
        r, g, b, a = px[x, y]
        if a == 0: continue
        if g > r + 40 and g > b + 40:                 # residual green cast
            g2 = max(r, b)
            px[x, y] = (r, g2, b, a); fringe += 1

im.save(DST)
op = sum(1 for y in range(0, H, 2) for x in range(0, W, 2) if px[x, y][3] > 8) * 4
print(f'border flood {n_border:,} px · {pockets} sealed pocket(s) {cleared:,} px · '
      f'{fringe:,} fringe softened · ~{op:,} opaque ({op/(W*H)*100:.1f}%)')
