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
from chroma_key_canon import flood_key           # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COLS, ROWS = 2, 2
LORDS = ['alphaea', 'azyrath', 'aetherion', 'aethravax', 'abyssion', 'abominalys']


def cells(im):
    w, h = im.size
    cw, ch = w // COLS, h // ROWS
    # reading order · left-to-right then top-to-bottom
    return [im.crop(((i % COLS) * cw, (i // COLS) * ch,
                     (i % COLS) * cw + cw, (i // COLS) * ch + ch)) for i in range(COLS * ROWS)]


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
    if W % COLS or H % ROWS:
        problems.append(f"does not divide evenly into {COLS}x{ROWS} ({W}x{H})")
    cw, ch = W // COLS, H // ROWS
    aspect = cw / ch
    print(f"  cell        {cw} x {ch}   aspect {aspect:.2f}:1")
    if not (1.6 <= aspect <= 2.5):
        problems.append(f"cell aspect {aspect:.2f}:1 is not the 2:1 the busts were designed at")

    # ★ key the WHOLE sheet · grid preserved, cells never cropped
    keyed = flood_key(raw)
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

        # ★★ the frames must differ, but only a little
        g = [np.array(c.convert('RGBA')).astype(float) for c in cs]
        diffs = []
        for i in range(len(g)):
            j = (i + 1) % len(g)
            d = np.abs(g[i][..., :3] - g[j][..., :3]).mean()
            diffs.append(d)
        print("  frame deltas  " + " ".join(f"{d:.2f}" for d in diffs))
        if max(diffs) < 0.15:
            problems.append("frames are effectively IDENTICAL — the animation would not read as alive")
        if max(diffs) > 26:
            problems.append(f"frame delta {max(diffs):.1f} is very large — this may read as jitter rather than breath")

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
