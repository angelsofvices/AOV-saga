#!/usr/bin/env python3
"""Port a Dracolord bust sheet into RP7.

    python3 tools/port_dracolord_bust.py <sheet.png> <lord-id>

The Creator's spec: a 2:1 bust turned into a four-frame 2x2 sheet, read
LEFT-TO-RIGHT then TOP-TO-BOTTOM, every frame keeping the same scale, anchor
and intact silhouette, on a magenta key, with subtle breathing / blinking /
glow motion.

★★★ THE ONE THING THIS SCRIPT REFUSES TO DO IS CROP THE CELLS.
Tight-cropping each frame to its own ink is the normal import step for a
character sheet and it would wreck this one.  Four frames whose ink differs by
a few pixels of breath would each land on a different anchor, and a nine-tile
head would visibly judder once a second.  The sheet is keyed WHOLE and the
2x2 grid is preserved, so all four frames share one origin — which is what
"same scale, anchor, intact silhouette" means in practice.

So the checks below are about REGISTRATION, not about beauty:
  · the sheet divides evenly into 2x2
  · each cell is close to 2:1, as designed
  · the four frames actually DIFFER (a duplicated frame is a dead animation)
  · but differ SUBTLY — a frame that moves half the head is the "jittery" the
    Creator is designing against
  · the silhouette stays put: per-frame ink bounding boxes must agree within a
    couple of percent, or the bust will swim
"""
import sys, os
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from chroma_key_canon import flood_key, is_chroma  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COLS, ROWS = 2, 2
LORDS = ['alphaea', 'azyrath', 'aetherion', 'aethravax', 'abyssion', 'abominalys']


def gutters(im):
    """★ v0.96.62 · FIND THE GRID, DO NOT ASSUME IT.

    The delivered sheets are 1774x887 — an ODD height, so an even 2x2 split
    lands on a half pixel and my first pass rejected all six for "does not
    divide evenly".  It was a false alarm: the frames are separated by real
    MAGENTA GUTTERS (measured rows 436-450, cols 874-900) and the half pixel
    falls harmlessly inside one.  Cutting on the gutter centres is exact at
    any sheet size and does not care whether the dimensions are even.
    """
    a = np.array(im.convert('RGB')).astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mag = (r > 200) & (g < 110) & (b > 200) & ((r - g) > 90) & ((b - g) > 90)

    def bands(mask):
        out, st = [], None
        for i, v in enumerate(mask):
            if v and st is None:
                st = i
            if not v and st is not None:
                out.append((st, i - 1)); st = None
        if st is not None:
            out.append((st, len(mask) - 1))
        return [x for x in out if x[1] - x[0] >= 1]

    H, W = mag.shape

    # ★★ AND PICK THE ONE NEAREST THE MIDDLE.  My first version took every
    #    interior magenta band as a gutter, and on a lord with headroom above
    #    the crown the empty sky ABOVE the subject spans the full width and
    #    reads as one — so the cut landed inside the art.  A 2x2 sheet has
    #    exactly one gutter per axis and it is near the midpoint; anything else
    #    is negative space.  Nothing plausible near the middle means no gutter
    #    at all, and an even split is the honest fallback.
    # ★★★ v0.96.62 · SNAP TO THE MIDPOINT, do not trust the band centre.
    #   These sheets are laid out by machine on a uniform 2x2, so the true cut
    #   is exactly half.  The GUTTER only confirms one is there — and its
    #   centre is not the cut, because a lord whose art runs closer to the edge
    #   on one side has a narrower, off-centre band.  Abyssion's row gutter
    #   measured 444-448 against Alphaea's 436-450: taking the centre moved his
    #   cut 4px, which shifted every cell, inflated his silhouette delta to
    #   12% and got him rejected as "jittery".  The art was fine; my ruler
    #   moved.  Confirm near the middle, then cut at the middle.
    def nearest_mid(cands, size):
        mid = size / 2
        if any(abs(c - mid) <= max(10, size * 0.02) for c in cands):
            return [round(mid)]
        good = [c for c in cands if abs(c - mid) < size * 0.10]
        return [min(good, key=lambda c: abs(c - mid))] if good else []

    vc = [ (s + e) // 2 for s, e in bands(mag.all(axis=1)) if s > H * 0.10 and e < H * 0.90 ]
    hc = [ (s + e) // 2 for s, e in bands(mag.all(axis=0)) if s > W * 0.10 and e < W * 0.90 ]
    return nearest_mid(hc, W), nearest_mid(vc, H)


def cells(im):
    w, h = im.size
    hcuts, vcuts = gutters(im)
    xs = [0] + hcuts[:COLS - 1] + [w]
    ys = [0] + vcuts[:ROWS - 1] + [h]
    if len(xs) != COLS + 1 or len(ys) != ROWS + 1:      # no gutters · fall back to an even split
        xs = [round(w * i / COLS) for i in range(COLS + 1)]
        ys = [round(h * i / ROWS) for i in range(ROWS + 1)]
    # ★★ EVERY CELL THE SAME SIZE.  Gutters are rarely dead-centre, so cutting
    #    straight on them yields cells that differ by a pixel or two — and then
    #    the frames cannot even be COMPARED, let alone drawn from one origin.
    #    Take the smallest span and anchor each cell at its own cut.
    cw = min(xs[i + 1] - xs[i] for i in range(COLS))
    ch = min(ys[i + 1] - ys[i] for i in range(ROWS))
    # reading order · left-to-right then top-to-bottom
    return [im.crop((xs[i % COLS], ys[i // COLS], xs[i % COLS] + cw, ys[i // COLS] + ch))
            for i in range(COLS * ROWS)]


def ink_box(cell):
    a = np.array(cell.convert('RGBA'))
    m = a[..., 3] > 24
    if not m.any():
        return None
    ys, xs = np.where(m)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    src, lord = sys.argv[1], sys.argv[2].lower()
    if lord not in LORDS:
        print(f"! '{lord}' is not one of the six: {', '.join(LORDS)}")
        sys.exit(1)

    raw = Image.open(src)
    W, H = raw.size
    print(f"  source      {W} x {H}")
    problems = []
    hc, vc = gutters(raw)
    print(f"  gutters     cols at {hc or '(none)'}  rows at {vc or '(none)'}")
    _probe = cells(raw)
    cw, ch = _probe[0].size
    aspect = cw / ch
    print(f"  cell        {cw} x {ch}   aspect {aspect:.2f}:1")
    if not (1.6 <= aspect <= 2.5):
        problems.append(f"cell aspect {aspect:.2f}:1 is not the 2:1 the busts were designed at")

    # ★ key the WHOLE sheet · grid preserved, cells never cropped
    keyed = flood_key(raw)
    # ★★★ v0.96.62 · AND KILL THE POCKETS THE FLOOD COULD NOT REACH.
    #   flood_key works inward from the border, so any magenta ENCLOSED by art
    #   survives — and these lords are all spread wings and splayed claws, so
    #   they enclose a great deal of it.  The first port left magenta blazing
    #   between Alphaea's wings and burning through Aethravax's mane, which is
    #   obvious the moment you look at the render and invisible in the numbers.
    #   is_chroma() is strict (r>200, g<110, b>200) so this can only take true
    #   chroma, never a purple that belongs to the character.
    _a = np.array(keyed)
    _core = is_chroma(_a[..., 0], _a[..., 1], _a[..., 2]) & (_a[..., 3] > 0)
    _a[_core] = [0, 0, 0, 0]
    keyed = Image.fromarray(_a, 'RGBA')
    print(f"  pockets     {int(_core.sum()):,} enclosed magenta pixels killed after the flood")
    a = np.array(keyed)
    kept = float((a[..., 3] > 24).mean())
    print(f"  keyed       {kept*100:.1f}% of the sheet is art (the rest was magenta)")
    if kept < 0.04:
        problems.append("almost nothing survived the key — is the background really magenta?")
    if kept > 0.97:
        problems.append("almost nothing was keyed — the background may not be a flat chroma")

    cs = cells(keyed)
    boxes = [ink_box(c) for c in cs]
    if any(b is None for b in boxes):
        problems.append("a frame is EMPTY after keying")
    else:
        # ★★ registration · every frame must sit on the same anchor
        xs0 = [b[0] for b in boxes]; ys0 = [b[1] for b in boxes]
        xs1 = [b[2] for b in boxes]; ys1 = [b[3] for b in boxes]
        dx = max(xs0) - min(xs0); dy = max(ys0) - min(ys0)
        dw = max(xs1) - min(xs1); dh = max(ys1) - min(ys1)
        tol = max(6, int(0.02 * max(cw, ch)))
        print(f"  registration  left ±{dx}px  top ±{dy}px  right ±{dw}px  bottom ±{dh}px   (tolerance {tol}px)")
        if max(dx, dy, dw, dh) > tol:
            problems.append(f"frames are NOT registered — the bust will swim by up to {max(dx,dy,dw,dh)}px")

        # ★★★ v0.96.62 · JITTER IS THE SHAPE MOVING, NOT THE LIGHT CHANGING.
        # My first version compared raw RGB and rejected five of six sheets for
        # "very large frame delta".  Wrong measure: these lords are built out
        # of pulsing starbursts and travelling sparkle, so a frame can differ
        # enormously in COLOUR while the silhouette does not move at all —
        # which is precisely the "character-specific glow motion" asked for.
        # Measured on Alphaea: silhouette moves 1.7-3.2% of the cell while
        # brightness inside the SAME pixels changes by 26-34.  So the two are
        # separated: the alpha mask answers "does it move", the luminance
        # answers "is it alive".
        g = [np.array(c.convert('RGBA')) for c in cs]
        silh, glow = [], []
        for i in range(len(g)):
            j = (i + 1) % len(g)
            A = g[i][..., 3] > 24
            B = g[j][..., 3] > 24
            silh.append((A ^ B).mean() * 100)
            both = A & B
            if both.any():
                glow.append(float(np.abs(g[i][..., :3][both].astype(float).mean(1)
                                       - g[j][..., :3][both].astype(float).mean(1)).mean()))
            else:
                glow.append(0.0)
        print("  silhouette Δ  " + " ".join(f"{d:.2f}%" for d in silh)
              + "   (how much the SHAPE moves)")
        print("  glow Δ        " + " ".join(f"{d:.1f}" for d in glow)
              + "   (light changing inside the same pixels)")
        # ★★ COUNT THE STATIC TRANSITIONS, do not just ask whether ANY frame
        #    moved.  A loop where two of the four steps are frozen is half
        #    dead and reads as a stutter, but a single lively pair elsewhere
        #    was enough to satisfy a max() test.  Real art shows movement on
        #    every step (Alphaea: 1.7-3.2% silhouette, 26-34 glow, no zeroes).
        frozen = sum(1 for k in range(len(silh)) if silh[k] < 0.15 and glow[k] < 1.0)
        if frozen >= 2:
            problems.append(f"{frozen} of {len(silh)} steps in the loop are FROZEN — "
                            "that reads as a stutter, not as breathing")
        # ★★ REGISTRATION IS THE REAL GUARD, not this.  Sparkle and travelling
        #   glints appear and vanish far from the body, and every one of them
        #   changes the alpha mask without moving the bust an inch — so a lord
        #   built out of drifting light scores high here while sitting
        #   perfectly still.  Kept as a gross-error net only; the ±px boxes
        #   above are what actually answer "does it swim".
        if max(silh) > 25:
            problems.append(f"the silhouette moves {max(silh):.1f}% between frames — that is a redraw, not breath")

    if problems:
        print("\n  ✗ NOT INSTALLED:")
        for p in problems:
            print(f"      · {p}")
        sys.exit(2)

    out = os.path.join(ROOT, 'assets', '2D sprites', 'dracolord', f'bust-{lord}.png')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    keyed.save(out)
    orig = os.path.join(ROOT, 'assets', '2D sprites', 'dracolord', '_orig', f'bust-{lord}-delivered.png')
    os.makedirs(os.path.dirname(orig), exist_ok=True)
    raw.save(orig)
    drawH = 9 * 48
    print(f"\n  ✓ installed  {out}")
    print(f"    delivered original preserved at _orig/")
    print(f"    renders {drawH}px tall x {round(drawH*aspect)}px wide "
          f"({9} x {9*aspect:.1f} tiles) in a 41-tile domain")


if __name__ == '__main__':
    main()
