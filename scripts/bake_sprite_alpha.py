#!/usr/bin/env python3
"""
Bake magenta chroma-key into transparency for character sprite sheets.

Usage:
  python3 scripts/bake_sprite_alpha.py assets/2D\ sprites/rizer/idle.png [...]

Rewrites each PNG in place from RGB (with magenta bg) to RGBA (with alpha=0
on magenta pixels).  Matches the canonical AOV chroma-key threshold used at
runtime in rp7b.html: r>200 & b>200 & g<50 (hard) plus a soft-edge sweep
at r>180 & b>180 & g<80 to catch anti-aliased pink halo pixels.

Ship every character sprite through this before wiring so runtime doesn't
need to chroma-key at load time (file:// origins can't run getImageData
without tainting the canvas).

See memory: aov-sprite-4x4-standard, aov-chroma-key-canon.
"""

from PIL import Image
import numpy as np
import sys
import os

def bake(path):
    im = np.array(Image.open(path).convert('RGB'))
    H, W, _ = im.shape
    r, g, b = im[..., 0], im[..., 1], im[..., 2]

    mag_hard = (r > 200) & (b > 200) & (g < 50)
    mag_soft = (r > 180) & (b > 180) & (g < 80) & ~mag_hard

    alpha = np.full((H, W), 255, dtype=np.uint8)
    alpha[mag_hard] = 0
    alpha[mag_soft] = 0

    rgba = np.dstack([im, alpha])
    Image.fromarray(rgba, 'RGBA').save(path)
    total = H * W
    n = int(mag_hard.sum() + mag_soft.sum())
    print(f'  {path}  transparent={100*n/total:.1f}%  ({n:,} px of {total:,})')


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
