"""CANON RP7 chroma-key.  Strips ONLY true magenta or neon-green
background via 4-corner flood-fill.  Never touches character colors.

Usage:
    from tools.chroma_key_canon import flood_key, tight_crop
    im = Image.open('some_studio_render.png')
    clean = tight_crop(flood_key(im))
    clean.save('clean.png')

Rule (user 2026-07-31): "if I import something in a neon green or magenta
background it is for chromakey to preserve the actual sprite.  do not
remove any other color than the magenta.  this is the same for all
npcs and assets."
"""
import numpy as np
from PIL import Image
from collections import deque

def is_chroma(r, g, b):
    r = r.astype(int); g = g.astype(int); b = b.astype(int)
    mag_core = (r > 200) & (g < 80)  & (b > 200)
    mag_halo = (r > 200) & (g < 110) & (b > 200) & ((r - g) > 90) & ((b - g) > 90)
    neon     = (r < 80)  & (g > 200) & (b < 80)
    return mag_core | mag_halo | neon

def flood_key(pil):
    im = pil.convert('RGBA'); arr = np.array(im)
    H, W = arr.shape[:2]
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    chroma = is_chroma(r, g, b)
    visited = np.zeros((H, W), dtype=bool)
    dq = deque()
    for (sy, sx) in [(0,0),(0,W-1),(H-1,0),(H-1,W-1)]:
        if chroma[sy, sx] and not visited[sy, sx]:
            visited[sy, sx] = True; dq.append((sy, sx))
    while dq:
        y, x = dq.popleft()
        for dy, dx in ((-1,0),(1,0),(0,-1),(0,1)):
            ny, nx = y+dy, x+dx
            if 0 <= ny < H and 0 <= nx < W and not visited[ny, nx] and chroma[ny, nx]:
                visited[ny, nx] = True; dq.append((ny, nx))
    arr[..., 3] = np.where(visited, 0, arr[..., 3])
    return Image.fromarray(arr, 'RGBA')

def tight_crop(im):
    arr = np.array(im); a = arr[..., 3] > 20
    ys, xs = np.where(a)
    if not len(ys): return im
    y0,y1,x0,x1 = ys.min(), ys.max()+1, xs.min(), xs.max()+1
    return Image.fromarray(arr[y0:y1, x0:x1], 'RGBA')

def resize_and_key(pil, target, chroma_rgb=(255, 0, 255)):
    """Chroma-safe downscale.

    LANCZOS on an already-keyed RGBA image lets the underlying transparent
    magenta pixels bleed BACK into the visible sprite as pink-purple ghosts
    (Pillow does not premultiply alpha).  The safe pipeline is:
      1) pre-key + tight-crop the original
      2) composite the sprite onto the SOLID chroma color
      3) downscale that solid RGB image (no alpha bleed possible)
      4) re-key the downscaled image against the same chroma
      5) direct-kill any enclosed magenta pocket the flood couldn't reach

    Use this any time an art asset needs to be resized before it ships.
    """
    prekey = tight_crop(flood_key(pil.convert('RGB')))
    w0, h0 = prekey.size
    bg = Image.new('RGB', (w0, h0), chroma_rgb)
    bg.paste(prekey, mask=prekey.split()[-1])
    small = bg.resize(target, Image.LANCZOS)
    final = flood_key(small)
    arr = np.array(final)
    r, g, b, al = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]
    core = is_chroma(r, g, b) & (al > 0)
    arr[core] = [0, 0, 0, 0]
    return Image.fromarray(arr, 'RGBA')


def kill_enclosed_chroma(pil, min_blob=4):
    """★★★ Remove TRUE chroma that the border flood could not reach.

    flood_key() walks in from the four corners, which is the canon rule and the
    right default: it is what guarantees the keyer can never wander into the
    art.  But it has one blind spot, and a fire dragon found it.

    Volcaxor's attack sweeps a crescent of flame that CLOSES INTO A RING.  The
    studio background inside that ring touches no corner, so the flood never
    arrives, and 9,762 pixels of pure magenta shipped inside the sprite — a
    bright pink hole in the middle of the effect.

    ★ This is not the interior-hole case that erased the Dracolords
      ([[aov-defringe-border-reachable]]).  That rule is about ALPHA holes after
      keying, where transparency means damage.  This is about COLOUR: pixels
      that still test as studio chroma.  The two are opposites and must not be
      confused — one says "do not seed from a hole", this one says "a hole that
      is still bright magenta was never art".

    ★ Safe because is_chroma is strict.  On Volcaxor the survivors averaged
      RGB (238, 28, 236) against an art mean of (117, 68, 56); not one art
      pixel passed the test.  `min_blob` is belt and braces for single-pixel
      speckle that might be a highlight.

    resize_and_key() has always done this as its step 5.  It was never callable
    on its own, so every sheet that did not need resizing went without it.
    """
    arr = np.array(pil.convert('RGBA'))
    r, g, b, al = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]
    hit = is_chroma(r, g, b) & (al > 0)
    if min_blob > 1:
        H, W = hit.shape
        seen = np.zeros((H, W), bool)
        ys, xs = np.nonzero(hit)
        for sy, sx in zip(ys, xs):
            if seen[sy, sx]:
                continue
            dq = deque([(sy, sx)]); seen[sy, sx] = True; px = []
            while dq:
                y, x = dq.popleft(); px.append((y, x))
                for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < H and 0 <= nx < W and not seen[ny, nx] and hit[ny, nx]:
                        seen[ny, nx] = True; dq.append((ny, nx))
            if len(px) < min_blob:
                for y, x in px:
                    hit[y, x] = False
    arr[hit] = [0, 0, 0, 0]
    return Image.fromarray(arr, 'RGBA'), int(hit.sum())
