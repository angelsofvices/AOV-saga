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
