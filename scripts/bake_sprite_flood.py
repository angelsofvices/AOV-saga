#!/usr/bin/env python3
"""
Bake magenta/neon-green chroma using PURE 4-CORNER FLOOD-FILL.
Preserves interior purples/pinks that the ratio-based bake_sprite_alpha.py
would wrongly kill (see aov-chroma-key-canon memory).

Usage: python3 scripts/bake_sprite_flood.py <input.png> [more...]

Algorithm:
  1) Sample the 4 image corners → build a "background reference" color set.
  2) Flood-fill (8-connected) from every edge pixel that matches any
     reference within a tight tolerance (Euclidean RGB distance ≤ 60).
  3) That flood-filled mask → alpha=0.  Everything else keeps original RGB.
  4) 1-pixel outline dilation of the mask (kills anti-aliased halo pixels
     that touch the transparent region) — but ONLY dilates into pixels that
     are themselves closeish to background (dist ≤ 90).  Interior colors
     like true purple/rose stay untouched.
"""
from PIL import Image
import numpy as np
from collections import deque
import sys, os


def flood_bg_mask(rgb, refs, tol=60):
    H, W = rgb.shape[:2]
    # per-pixel min distance to any ref color
    r, g, b = rgb[..., 0].astype(np.int32), rgb[..., 1].astype(np.int32), rgb[..., 2].astype(np.int32)
    match = np.zeros((H, W), dtype=bool)
    for (rr, gg, bb) in refs:
        d2 = (r-rr)**2 + (g-gg)**2 + (b-bb)**2
        match |= (d2 <= tol*tol)
    # BFS flood from every edge pixel that matches
    visited = np.zeros((H, W), dtype=bool)
    q = deque()
    for x in range(W):
        for y in (0, H-1):
            if match[y, x] and not visited[y, x]:
                visited[y, x] = True; q.append((y, x))
    for y in range(H):
        for x in (0, W-1):
            if match[y, x] and not visited[y, x]:
                visited[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                if dy == 0 and dx == 0: continue
                ny, nx = y+dy, x+dx
                if 0 <= ny < H and 0 <= nx < W and not visited[ny, nx] and match[ny, nx]:
                    visited[ny, nx] = True; q.append((ny, nx))
    return visited


def bake(path):
    src = Image.open(path).convert('RGBA')
    rgba = np.array(src)
    H, W = rgba.shape[:2]
    rgb = rgba[..., :3]
    # Sample 4 corners as reference colors
    corners = [rgb[0, 0], rgb[0, W-1], rgb[H-1, 0], rgb[H-1, W-1]]
    refs = [tuple(int(x) for x in c) for c in corners]
    # Dedupe near-duplicate refs
    uniq = []
    for c in refs:
        if all(sum((c[i]-u[i])**2 for i in range(3)) > 30*30 for u in uniq):
            uniq.append(c)
    kill = flood_bg_mask(rgb, uniq, tol=60)
    # Enclosed-pocket sweep: any remaining pixel that closely matches a
    # corner ref color (tol=60) is background too, even if the flood couldn't
    # reach it (e.g., magenta trapped inside desk legs).  True interior
    # pinks (lava lamp, cheeks, etc.) survive because they're > tol from
    # the pure background magenta.
    r, g, b = rgb[..., 0].astype(np.int32), rgb[..., 1].astype(np.int32), rgb[..., 2].astype(np.int32)
    pocket = np.zeros_like(kill)
    for (rr, gg, bb) in uniq:
        d2 = (r-rr)**2 + (g-gg)**2 + (b-bb)**2
        pocket |= (d2 <= 70*70)   # v0.95.13 · sweet spot · catches enclosed bg / spares lava-lamp pink
    kill = kill | pocket
    # 1-pixel dilation into pixels that are still near-background (tol 90)
    r, g, b = rgb[..., 0].astype(np.int32), rgb[..., 1].astype(np.int32), rgb[..., 2].astype(np.int32)
    near = np.zeros_like(kill)
    for (rr, gg, bb) in uniq:
        d2 = (r-rr)**2 + (g-gg)**2 + (b-bb)**2
        near |= (d2 <= 90*90)
    pad = np.zeros((H+2, W+2), dtype=bool)
    pad[1:-1, 1:-1] = kill
    dilated = np.zeros_like(kill)
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            dilated |= pad[1+dy:H+1+dy, 1+dx:W+1+dx]
    kill = kill | (dilated & near)
    alpha = np.where(kill, 0, 255).astype(np.uint8)
    # zero-out RGB of killed pixels so no bleed
    out = rgba.copy()
    out[..., 3] = alpha
    out[kill] = 0
    Image.fromarray(out, 'RGBA').save(path)
    total = H * W
    print(f'  {path}  transparent={100*kill.sum()/total:.1f}%  refs={uniq}')


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__); sys.exit(1)
    for p in args:
        if not os.path.isfile(p):
            print(f'  SKIP: {p}'); continue
        bake(p)


if __name__ == '__main__':
    main()
