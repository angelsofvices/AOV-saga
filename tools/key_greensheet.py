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
# ★ v0.95.988 · MAGENTA SHEETS EXIST TOO. The chroma canon has always named
# both keys ("magenta/neon-green") but every sheet so far arrived green, so
# this tool only knew one of them. Veridrax's attack sheet came in on magenta
# and a green-only keyer leaves it completely untouched — which fails LOUDLY
# (a solid magenta background) rather than subtly, and that is the only reason
# it was cheap to find.
KEY = 'magenta' if '--magenta' in sys.argv else 'green'

# ★★★ v0.95.988 · SAMPLE THE ACTUAL CORNER, do not assume the shade.
# Talenko's attack sheet came in on a LIGHTER LIME (124,224,39) than every
# previous sheet's near-pure green (3,249,2). The family test — G dominant with
# R and B "tiny" — is written for the pure key and reads 224 > 124*3 as FALSE,
# so it matched NOTHING. ★ And that is the dangerous failure: with nothing
# flood-filled, the de-fringe pass still ran and rewrote 683,563 pixels of
# untouched artwork. A keyer that silently mangles is far worse than one that
# refuses.
# ★ So the key colour is now READ FROM THE CORNER and matched by distance, with
# the family test kept as a second net for anti-aliased fringe. And an abort
# below refuses to write anything if the flood-fill found essentially nothing.
im = Image.open(SRC).convert('RGBA')
W, H = im.size
px = im.load()
KR, KG, KB = px[0, 0][:3]          # ★ the sheet's own key colour
TOL = 60                            # generous: the flood-fill bounds the damage

def is_bg(p):
    r, g, b, a = p
    if a == 0: return False
    if abs(r-KR) <= TOL and abs(g-KG) <= TOL and abs(b-KB) <= TOL:
        return True                 # ★ within tolerance of THIS sheet's corner
    if KEY == 'magenta':
        # ★ R and B both dominant, G suppressed. Checked against this sprite's
        # own palette first: its RED beams have low B, its BLUE wings have low
        # R, and its pink glow never gets B above 2x G — so no art pixel is
        # magenta-family and the test cannot bite the creature.
        return r > 90 and b > 90 and r > g * 2 and b > g * 2
    return g > 90 and g > r * 3 and g > b * 3

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
        if KEY == 'magenta':
            if r > g + 40 and b > g + 40:          # residual magenta cast
                px[x, y] = (max(g, b) if r > b else r, g,
                            max(r, g) if b > r else b, a); fringe += 1
        elif g > r + 40 and g > b + 40:
            px[x, y] = (r, max(r, b), b, a); fringe += 1

# ★★ REFUSE TO WRITE A SHEET WE FAILED TO KEY. Below ~2% of the image the
# flood-fill plainly did not find a background, and every downstream step —
# de-fringe, re-cell, measure — would then operate on unkeyed art and produce
# confident, wrong numbers.
if n_border < W * H * 0.02:
    sys.exit(f'ABORT · border flood-fill matched only {n_border} px · '
             f'the key colour at (0,0) is {(KR,KG,KB)} and it did not spread. '
             f'Nothing written.')
im.save(DST)
op = sum(1 for y in range(0, H, 2) for x in range(0, W, 2) if px[x, y][3] > 8) * 4
print(f'{DST}: border {n_border:,} · {pockets} pocket(s) {cleared:,} · '
      f'{fringe:,} fringe · ~{op:,} opaque ({op/(W*H)*100:.1f}%)')
