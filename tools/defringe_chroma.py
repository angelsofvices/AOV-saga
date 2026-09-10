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

# ★★★ v0.96.65 · THE FLOOR IS HIGH ON PURPOSE, FOR A LIBRARY-WIDE RUN.
#   25 was safe on ONE hand-checked sheet whose interior p99 was 6.  Across 875
#   assets it is not: the library has pink flowers, green grass, purple gems and
#   teal water, and a floor that low shaves real art off all of them.
#   Pure chroma scores ~255.  A pixel half-blended with the key scores ~127, a
#   quarter-blended ~64.  55 is therefore "at least a quarter key" — visibly a
#   halo on a dark background, and far above any incidental tint in the art.
THRESH   = 55    # ★ how chroma-like an edge pixel must BE, in absolute terms
DEEP_PX  = 3     # how far in "deep interior" starts
EXCESS   = 45    # ★ and how far ABOVE the body's own tint it must sit
# ★★ AND A CAP.  If the tool wants to take more than this fraction of an asset,
#   it has stopped removing a halo and started removing the thing.  A pearlbow
#   ARROW is ~44% "rim" by any erosion measure because it is three pixels wide;
#   so is a chain, a wire, a spark.  Those get reported for human eyes rather
#   than silently gutted.
MAX_FRAC = 0.06   # ★ cumulative · above this it is not a halo, it is the subject
MAX_PEEL = 4      # a halo thicker than this is not a halo


def magentaness(a):
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    return np.minimum(r, b) - g


def greenness(a):
    """★ v0.96.65 · THE OTHER KEY.  Canon allows magenta OR neon green, and the
    green rim is the same defect wearing the opposite colour: G far above both
    R and B.  Warm art scores negative here, exactly as cool art does against
    magenta — but a GREEN CREATURE scores high all over, which is why the test
    below is rim-versus-body rather than an absolute cut."""
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    return g - np.maximum(r, b)


def outside(alpha):
    """★★★ v0.96.65b · THE OUTSIDE, NOT MERELY THE TRANSPARENT.

    Chroma-key canon has always said BORDER FLOOD-FILL ONLY, and this is why.
    My first true-edge peel called any pixel touching alpha==0 an edge — but a
    keyed sheet is full of INTERIOR holes: single near-key pixels the original
    key punched out of the middle of the art, plus the enclosed-pocket kill the
    bust porter ran.  Each of those holes is a seed, and the peel ate OUTWARD
    from all of them at once.  Verified on elzoran.png: a purple energy orb was
    reduced to scattered specks, and club-50's violet window glass to holes.

    A pixel belongs to "the existing previous background" only if the
    background can REACH it.  So: flood the transparency inward from the image
    border and use only that.  A hole in the middle of the art is not the
    background — it is damage, and the peel must not treat it as a beachhead.

    ★ SPEED. One-pixel-at-a-time dilation needs an iteration per pixel of the
    longest path, which on a 2508px bust sheet was 5.1 seconds — 75 minutes
    across the library. `_scan` below instead floods a whole row or column in
    one vectorised pass, so the fill converges in a handful of iterations.
    """
    t = alpha == 0
    seen = np.zeros_like(t)
    seen[0, :] = t[0, :]; seen[-1, :] = t[-1, :]
    seen[:, 0] = t[:, 0]; seen[:, -1] = t[:, -1]
    while True:
        g = seen
        for axis in (1, 0):
            for rev in (False, True):
                g = _scan(g, t, axis, rev)
        if g.sum() == seen.sum():
            return g
        seen = g


def _scan(seen, t, axis, rev):
    """Flood `seen` along one axis in one direction, blocked by ~t.

    Within a row, a cell is reached iff the nearest seed to its left is nearer
    than the nearest blocker to its left — which `maximum.accumulate` answers
    for the whole row at once.
    """
    s, m = (seen, t) if axis == 1 else (seen.T, t.T)
    if rev:
        s, m = s[:, ::-1], m[:, ::-1]
    col = np.arange(s.shape[1])[None, :]
    last_block = np.maximum.accumulate(np.where(~m, col, -1), axis=1)
    last_seed = np.maximum.accumulate(np.where(s, col, -1), axis=1)
    out = m & (last_seed > last_block)
    if rev:
        out = out[:, ::-1]
    return out if axis == 1 else out.T


def deep_mask(alpha, n=DEEP_PX):
    d = alpha > 200
    for _ in range(n):
        e = np.zeros_like(d)
        e[1:-1, 1:-1] = (d[:-2, 1:-1] & d[2:, 1:-1] & d[1:-1, :-2] & d[1:-1, 2:] & d[1:-1, 1:-1])
        d = e
    return d


def defringe(path, dry=False):
    """★★★ v0.96.65 · PEEL THE TRUE EDGE, AND ONLY WHILE IT IS STILL CHROMA.

    Creator: "just try to preserve all the actual pixels of whatever the image
    is.  Like, if you know it's natively green or purple, don't chroma key it.
    Only if it is belonging to the existing previous background."

    That sentence names the algorithm.  A pixel belongs to the previous
    background only where the key CUT — which is precisely the pixels touching
    transparency.  My first attempt eroded a 3-pixel-deep ring instead, and it
    reached inward past the cut into real art: it took 8.20% of the purple
    dream-crystal, where the true-edge rule takes 0.17%.

    So: peel one pixel at a time, and only pixels that are BOTH touching
    transparency AND strongly chroma-tinted.  This converges by construction —
    the moment the contaminated boundary is gone, the newly exposed boundary is
    clean art, fails the test, and the loop stops.  A two-pixel halo takes two
    passes; a purple creature takes none.

    ★★ And it is still relative.  A violet Dracolord's body scores magenta all
    over, so the bar is his own body plus EXCESS — the halo sits 100+ above it.
    """
    ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    im = Image.open(path)
    if im.mode not in ('RGBA', 'LA', 'P'):
        return (0, 0, 'opaque') if dry else False      # ★ no alpha · a tile, not a sprite
    a = np.array(im.convert('RGBA'))
    al = a[..., 3]
    if not (al > 0).any():
        return (0, 0, 'empty') if dry else False
    if (al > 0).all():
        return (0, 0, 'opaque') if dry else False      # ★ nothing was ever keyed out of this

    start = int((al > 0).sum())
    body = deep_mask(al, DEEP_PX + 1)
    if not body.any():
        return (0, 0, 'too thin') if dry else False
    # ★ the bar is measured ONCE, against the untouched body — recomputing it as
    #   the sprite shrinks would let it drift and chase the art inward
    bars = []
    for name, fn in (('magenta', magentaness), ('green', greenness)):
        m = fn(a)
        bars.append((name, m, max(THRESH, float(np.median(m[body])) + EXCESS)))

    removed = 0
    notes = []
    # ★ the fill runs ONCE.  Every pixel this loop kills was, by construction,
    #   adjacent to the outside — so it JOINS the outside, and unioning it in is
    #   exactly equivalent to re-flooding, at none of the cost.
    t = outside(al)                                    # ★★★ border-reachable ONLY · not every hole
    for _ in range(MAX_PEEL):
        vis = a[..., 3] > 0
        rim = np.zeros_like(vis)
        rim[1:-1, 1:-1] = (t[:-2, 1:-1] | t[2:, 1:-1] | t[1:-1, :-2] | t[1:-1, 2:])
        rim &= vis                                     # ★ THE TRUE EDGE · where the key cut
        if not rim.any():
            break
        kill = np.zeros_like(vis)
        for name, m, bar in bars:
            k = rim & (m > bar)
            if k.any() and name not in notes:
                notes.append(name)
            kill |= k
        n = int(kill.sum())
        if not n:
            break                                      # ★ converged · the edge is clean art now
        if (removed + n) / start > MAX_FRAC:
            notes.append(f'stopped at cap {int(MAX_FRAC*100)}%')
            break
        if not dry:
            a[kill] = [0, 0, 0, 0]
        else:
            a[kill, 3] = 0                             # ★ dry still peels in memory, writes nothing
        t |= kill                                      # ★ what was peeled is now the outside
        removed += n

    if dry:
        return (removed, start, ' + '.join(notes) if notes else '')
    if not removed:
        return False
    tmp = path + '.defringe.tmp'
    Image.fromarray(a, 'RGBA').save(tmp, format='PNG')  # ★ .tmp tells PIL nothing
    os.replace(tmp, path)                              # ★ breaks the hardlink to uploads/, atomic
    print(f"  ✓ {os.path.relpath(path, ROOT):<58} {removed:7,} px ({100*removed/start:5.2f}%)  {' + '.join(notes)}")
    return True


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    for p in sys.argv[1:]:
        defringe(p)
