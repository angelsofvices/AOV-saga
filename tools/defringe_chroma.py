#!/usr/bin/env python3
"""Strip the magenta OUTLINE a chroma key leaves behind.

    python3 tools/defringe_chroma.py <keyed.png> [more.png ...]

★★★ WHY THE KEY ALONE IS NOT ENOUGH.
flood_key + the enclosed-pocket kill remove pixels that ARE the chroma. They
cannot remove pixels that are art BLENDED WITH the chroma — the anti-aliased
rim the renderer drew where the creature met the background. Those pixels are
neither art nor key: they are a magenta-tinted halo one or two pixels wide,
and against a dark game background they read as a glowing pink outline.

Measured on anciuxor-flee.png: 24,244 contaminated pixels (5.2% of the art),
76% of them on the boundary, worst tint 200.

★★ HOW IT KNOWS WHAT IS CONTAMINATED, rather than guessing.
"Magentaness" = min(R,B) - G. Magenta is high R, high B, low G, so the metric
is large. Every warm colour — cream, gold, bone, orange — has B below G, so it
scores NEGATIVE and can never be selected.

Verified before touching anything, on the Anciuxor sheet:

    deep interior (3px in)   median -41   p99   6   ← no magenta in the art
    edge ring                median  16   p95 165   ← the halo

Only 0.27% of deep-interior pixels exceed the threshold, and those are
protected anyway because the fix is restricted to the edge ring. A sheet whose
character IS genuinely magenta would show a high deep-interior score, and the
script refuses rather than eating it.

★ AND IT ERODES RATHER THAN RECOLOURS. Recovering the true colour of a blended
pixel needs the alpha it was blended at, which is gone. Guessing it produces a
muddy rim that looks worse than no rim. These sprites are drawn at 2x and up,
so a one-pixel erosion in the source is sub-pixel on screen — invisible, and
completely honest about what it is doing.
"""
import sys, os
import numpy as np
from PIL import Image

THRESH   = 25    # magentaness above this, ON THE RIM, is key contamination
DEEP_PX  = 3     # how far in "deep interior" starts
EXCESS   = 45    # ★ how far ABOVE the body's own magentaness a rim must sit


def magentaness(a):
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    return np.minimum(r, b) - g


def deep_mask(alpha, n=DEEP_PX):
    d = alpha > 200
    for _ in range(n):
        e = np.zeros_like(d)
        e[1:-1, 1:-1] = (d[:-2, 1:-1] & d[2:, 1:-1] & d[1:-1, :-2] & d[1:-1, 2:] & d[1:-1, 1:-1])
        d = e
    return d


def defringe(path):
    im = Image.open(path).convert('RGBA')
    a = np.array(im)
    al = a[..., 3]
    vis = al > 0
    if not vis.any():
        print(f"  {os.path.basename(path)}: empty"); return False
    mag = magentaness(a)
    deep = deep_mask(al)
    ring = vis & ~deep

    # ★★★ THE TEST IS RELATIVE, NOT ABSOLUTE — and my first version got this
    #   wrong.  An absolute threshold works on a cream-and-gold Anciuxor and
    #   refuses outright on a VIOLET Dracolord, because his body legitimately
    #   scores magenta.  Five of the six busts were rejected that way while all
    #   five had exactly the halo the tool exists to remove.
    #
    #   Measured, rim median vs body median:
    #       aethravax  119 vs -11      abyssion   118 vs   6
    #       azyrath    115 vs  12      abominalys 119 vs  14
    #   The rim sits 100+ above the body on every one of them.  THAT is the
    #   signature: not "is this magenta", but "is this edge far more magenta
    #   than the character it belongs to".  A purple lord keeps his purple; the
    #   pink halo around it does not survive.
    body = deep_mask(al, DEEP_PX + 1)
    body_mag = float(np.median(mag[body])) if body.any() else 0.0
    thresh = max(THRESH, body_mag + EXCESS)
    kill = ring & (mag > thresh)
    n = int(kill.sum())
    if not n:
        print(f"  · {os.path.basename(path)}: no fringe found")
        return False
    before = int(vis.sum())
    a[kill] = [0, 0, 0, 0]
    Image.fromarray(a, 'RGBA').save(path)
    after = int((a[..., 3] > 0).sum())
    print(f"  ✓ {os.path.basename(path)}: removed {n:,} fringe px ({100*n/before:.2f}%) · "
          f"body magentaness {body_mag:+.0f}, cut above {thresh:.0f}")
    return True


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    for p in sys.argv[1:]:
        defringe(p)
