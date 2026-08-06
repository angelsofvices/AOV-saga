#!/usr/bin/env python3
"""
Bake magenta/neon-green chroma-key into transparency for character sprite sheets,
then run a close-cleanup edge pass that kills the pink halo.

Usage:
  python3 scripts/bake_sprite_alpha.py assets/2D\ sprites/rizer/idle.png [...]

Pipeline (in order · per sheet):
  1) Hard threshold — obvious background magenta/neon-green → alpha=0.
  2) Soft threshold — near-background pixels → alpha=0.
  3) Ratio-based halo sweep — R>>G AND B>>G (any luminance) → alpha=0.
     Catches darker magenta shadow halos threshold misses.
  4) One-pixel dilation of the alpha=0 mask — eats the last row of
     anti-aliased fringe pixels adjacent to the killed zone.
  5) Edge desaturation — any surviving opaque pixel that is still visibly
     pinkish (R>G and B>G and both R-G, B-G > 25) AND touches a transparent
     pixel is desaturated by clamping R and B to G.  Kills lingering pink
     rim without touching interior character pixels.

Preserves character skin/outfit pixels — the ratio + adjacency guards mean
we only recolor pixels that are BOTH pinkish AND on the outline itself.

See memory: aov-sprite-4x4-standard, aov-chroma-key-canon.
"""

from PIL import Image
import numpy as np
import sys
import os


def bake(path):
    src = Image.open(path)
    had_alpha = src.mode in ('RGBA', 'LA') or 'transparency' in src.info
    if had_alpha:
        arr = np.array(src.convert('RGBA'))
        pre_alpha = arr[..., 3] < 128
        im = arr[..., :3].astype(np.int16)
    else:
        im = np.array(src.convert('RGB')).astype(np.int16)
        pre_alpha = np.zeros(im.shape[:2], dtype=bool)
    H, W, _ = im.shape
    r, g, b = im[..., 0], im[..., 1], im[..., 2]

    # 1) Hard thresholds
    mag_hard = (r > 200) & (b > 200) & (g < 50)
    grn_hard = (g > 200) & (r < 100) & (b < 100)

    # 2) Soft thresholds
    mag_soft = (r > 180) & (b > 180) & (g < 80) & ~mag_hard
    grn_soft = (g > 180) & (r < 120) & (b < 120) & ~grn_hard

    # 3) Ratio-based halo sweep (dark-magenta / rose fringe pixels)
    mag_ratio = ((r - g) > 55) & ((b - g) > 55) & (r > g) & (b > g)
    grn_ratio = ((g - r) > 55) & ((g - b) > 55) & (g > r) & (g > b)

    kill = pre_alpha | mag_hard | mag_soft | mag_ratio | grn_hard | grn_soft | grn_ratio

    # 4) 1-pixel dilation of the kill mask (8-connectivity)
    padded = np.zeros((H + 2, W + 2), dtype=bool)
    padded[1:-1, 1:-1] = kill
    dilated = np.zeros_like(kill)
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            dilated |= padded[1 + dy:H + 1 + dy, 1 + dx:W + 1 + dx]
    kill = dilated

    alpha = np.where(kill, 0, 255).astype(np.uint8)

    # 5) Edge desaturation — kill pink cast on surviving outline pixels
    # Any opaque pixel whose 8-neighbors include a transparent pixel AND
    # which is visibly pinkish → clamp R and B down to G.
    op = alpha > 0
    tp = ~op
    edge_pad = np.zeros((H + 2, W + 2), dtype=bool)
    edge_pad[1:-1, 1:-1] = tp
    touches_transparent = np.zeros_like(op)
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            if dy == 0 and dx == 0:
                continue
            touches_transparent |= edge_pad[1 + dy:H + 1 + dy, 1 + dx:W + 1 + dx]

    pinkish = ((r - g) > 25) & ((b - g) > 25) & (r > g) & (b > g)
    edge_pink = op & touches_transparent & pinkish

    # Clamp R and B to G (kills magenta cast, preserves lightness via G)
    im[..., 0] = np.where(edge_pink, np.minimum(r, g), r)
    im[..., 2] = np.where(edge_pink, np.minimum(b, g), b)

    # Zero the RGB of every transparent pixel so no magenta bleeds through
    # pre-multiplied-alpha compositors, mipmap downsamples, or halo tests.
    im[kill] = 0

    rgba = np.dstack([im.astype(np.uint8), alpha])
    Image.fromarray(rgba, 'RGBA').save(path)

    total = H * W
    n_kill = int(kill.sum())
    n_desat = int(edge_pink.sum())
    print(f'  {path}  transparent={100*n_kill/total:.1f}% ({n_kill:,}) '
          f'edge_desat={n_desat:,}')


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(1)
    for path in args:
        if not os.path.isfile(path):
            print(f'  SKIP (not found): {path}')
            continue
        bake(path)


if __name__ == '__main__':
    main()
