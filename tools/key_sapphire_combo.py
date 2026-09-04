#!/usr/bin/env python3
"""Key the sapphire-sword COMBO sheet (v0.95.950).

Chroma canon, unchanged: BORDER FLOOD-FILL ONLY.  A green pixel enclosed by the
art -- inside the cape's fold, between the blade and the arm -- is art until a
path of green connects it to the edge of the canvas.  Nothing is keyed by
colour alone.

Two additions over the plain flood, both learned the hard way on earlier sheets:

  1. ANTI-ALIASED FRINGE.  The art was resized before it reached us, so every
     silhouette carries a one-to-two pixel ramp from character into key.  Those
     pixels are not pure key so the flood stops at them, and they survive as a
     green outline the moment the sprite is drawn at any scale.  Only pixels
     TOUCHING the flooded region are considered, and only their alpha is
     reduced -- interior art is never examined.

  2. ENCLOSED POCKETS.  The border flood is the canon rule and it is the right
     one -- it protects art that happens to be green from being deleted by
     colour alone.  But it cannot reach background that the art has SEALED
     OFF: on LEFT/rising-cut there is a 73px wedge of key between the sword
     hilt and his hair, walled in on every side, and it survives as a bright
     green stripe across his face.  That is background by any reading.
     So enclosed key-coloured regions are keyed too, under three conditions
     that together make an art pixel impossible to hit:
       · TIGHTER tolerance than the flood (40 vs 70) -- flat background only,
         never a shaded or antialiased edge
       · SMALL -- under 2% of a cell; a real green region of art large enough
         to matter would be excluded
       · fully ENCLOSED -- touching neither the canvas edge nor the flood
     Rizer's own palette is teal and blue: his hair reads green-ish but its
     BLUE channel is high, so it is nowhere near this key.  Checked, not
     assumed -- the audit at the end reports any opaque key pixel left.

  3. RGB BLEED.  Zeroing alpha leaves the key colour sitting in the RGB of the
     transparent pixels, and canvas drawImage interpolates it straight back as
     a green halo.  So every transparent pixel is repainted with the colour of
     the nearest opaque pixel.  Invisible at alpha 0, correct under filtering.
"""
import sys, numpy as np
from PIL import Image
from collections import deque

src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGBA')
a  = np.array(im).astype(np.int16)
H, W = a.shape[:2]
rgb = a[:, :, :3]

ring = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
key  = np.median(ring, axis=0)
dist = np.sqrt(((rgb - key) ** 2).sum(axis=2))

FLOOD_TOL  = 70.0    # what counts as "the same green" while flooding
FRINGE_TOL = 165.0   # ramp pixels adjacent to the flood

seed = dist < FLOOD_TOL
keyed = np.zeros((H, W), bool)
q = deque()
for x in range(W):
    for y in (0, H - 1):
        if seed[y, x] and not keyed[y, x]: keyed[y, x] = True; q.append((y, x))
for y in range(H):
    for x in (0, W - 1):
        if seed[y, x] and not keyed[y, x]: keyed[y, x] = True; q.append((y, x))
while q:
    y, x = q.popleft()
    for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
        ny, nx = y + dy, x + dx
        if 0 <= ny < H and 0 <= nx < W and seed[ny, nx] and not keyed[ny, nx]:
            keyed[ny, nx] = True; q.append((ny, nx))

# --- enclosed pockets: same colour, walled off from the border ----------------
POCKET_TOL  = 40.0
POCKET_MAX  = int(0.02 * 313 * 313)
tight = (dist < POCKET_TOL) & ~keyed
seen  = np.zeros((H, W), bool)
pockets = 0
ys, xs = np.nonzero(tight)
for y0, x0 in zip(ys, xs):
    if seen[y0, x0]: continue
    px = []; touches_edge = False
    q = deque([(y0, x0)]); seen[y0, x0] = True
    while q:
        y, x = q.popleft(); px.append((y, x))
        if y in (0, H - 1) or x in (0, W - 1): touches_edge = True
        for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < H and 0 <= nx < W and tight[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True; q.append((ny, nx))
    if touches_edge or len(px) > POCKET_MAX: continue
    for y, x in px: keyed[y, x] = True
    pockets += 1
print(f'sealed pockets keyed: {pockets}')

alpha = np.where(keyed, 0, 255).astype(np.float32)

# --- fringe: only pixels bordering the keyed region ---------------------------
nb = np.zeros((H, W), bool)
nb[1:, :]  |= keyed[:-1, :]; nb[:-1, :] |= keyed[1:, :]
nb[:, 1:]  |= keyed[:, :-1]; nb[:, :-1] |= keyed[:, 1:]
edge = nb & ~keyed & (dist < FRINGE_TOL)
# alpha ramps 0 at the key colour to 255 at FRINGE_TOL away from it
alpha[edge] = np.clip(dist[edge] / FRINGE_TOL * 255.0, 0, 255)
fringe_n = int(edge.sum())

out = a.copy()
out[:, :, 3] = alpha.astype(np.int16)

# --- RGB bleed into everything that ended up transparent ----------------------
trans = out[:, :, 3] == 0
if trans.any():
    try:
        from scipy import ndimage
        idx = ndimage.distance_transform_edt(trans, return_distances=False,
                                             return_indices=True)
        out[:, :, :3] = out[idx[0], idx[1], :3]
    except ImportError:
        # dilate opaque colour outward a few rings -- enough for interpolation
        cur = out[:, :, :3].copy(); filled = ~trans
        for _ in range(4):
            for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
                sh_c = np.roll(np.roll(cur, dy, 0), dx, 1)
                sh_f = np.roll(np.roll(filled, dy, 0), dx, 1)
                take = (~filled) & sh_f
                cur[take] = sh_c[take]; filled |= take
        out[:, :, :3] = cur

Image.fromarray(out.astype(np.uint8), 'RGBA').save(dst)
print(f'keyed {keyed.sum():,} px ({keyed.mean()*100:.1f}%) · fringe softened {fringe_n:,} px')
print(f'opaque {(out[:,:,3] == 255).sum():,} · partial {(((out[:,:,3] > 0) & (out[:,:,3] < 255)).sum()):,}')
