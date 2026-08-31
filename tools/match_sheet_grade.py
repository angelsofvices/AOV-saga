"""★★★ SHEET GRADE MATCH · RP7

Compare a sprite sheet's COLOUR GRADE against a reference sheet (normally the
idle), material by material, and optionally correct it.

WHY THIS EXISTS
---------------
Creator, 2026-08-31: *"can we match the contrast of rizer punch animation to
his idle animation? he seems to get more intense colors on punching."*

He was right, and the naive check said he wasn't. Comparing the two sheets
whole, the punch is LESS saturated and slightly darker than the idle -- which
looks like nothing is wrong. The defect only appears when you compare the SAME
MATERIAL in both sheets:

    armour  x0.927   hair  x0.979   highlights  x0.955   SKIN/GOLD  x0.821

Everything is within a few percent except the warm band, which is 22% too
bright. A whole-sheet average hid it because the poses differ -- the punch
frames show more skin and cape than the idle does, so the material mix is not
the same picture twice.

WHY BANDS AND NOT A HISTOGRAM
-----------------------------
A global luminance histogram match is the usual tool and it is wrong here, for
the same reason: it assumes both images contain the same stuff in the same
proportions. Hue bands compare a material to ITSELF across the two sheets, so
the pose cannot skew it.

WHY NOT A TONE CURVE
--------------------
Fitting one curve through those four anchors is not even monotone-friendly --
it dips at 0.73 and climbs again by 0.95, which is a tone reversal and lands as
banding on the gradients. The defect lives in one band, so the correction lives
in one band.

HOW THE CORRECTION WORKS
------------------------
RGB is scaled by a single factor inside a soft hue window. Scaling all three
channels preserves HUE and SATURATION exactly -- both are ratios within the
pixel -- so only the brightness of that material moves. Greys are excluded by a
saturation floor, and the window edges ramp so there is no seam.

    python3 tools/match_sheet_grade.py <sheet.png> <reference.png>          # report
    python3 tools/match_sheet_grade.py <sheet.png> <reference.png> --apply  # correct
"""
import sys, os, shutil
import numpy as np
from PIL import Image

BANDS = [('armour/blue', 0.58, 0.72),
         ('hair/teal',   0.42, 0.58),
         ('skin+gold',   0.05, 0.13),
         ('violet',      0.72, 0.85)]
SAT_FLOOR = 0.15
WARM = (0.02, 0.05, 0.13, 0.16)     # ramp-in, full, full, ramp-out


def hsv_parts(rgb):
    mx = rgb.max(2); mn = rgb.min(2); d = mx - mn
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    h = np.zeros_like(mx)
    with np.errstate(divide='ignore', invalid='ignore'):
        h = np.where((mx == r) & (d > 0), ((g - b) / np.maximum(d, 1e-9)) % 6, h)
        h = np.where((mx == g) & (d > 0), ((b - r) / np.maximum(d, 1e-9)) + 2, h)
        h = np.where((mx == b) & (d > 0), ((r - g) / np.maximum(d, 1e-9)) + 4, h)
    s = np.where(mx > 0, d / np.maximum(mx, 1e-9), 0)
    return h / 6.0, s, mx


def band_means(path):
    a = np.array(Image.open(path).convert('RGBA'))
    rgb = a[..., :3].astype(np.float64) / 255.0
    opaque = a[..., 3] > 200
    h, s, v = hsv_parts(rgb)
    out = {}
    for name, lo, hi in BANDS:
        m = opaque & (h >= lo) & (h < hi) & (s > SAT_FLOOR)
        mean = float(v[m].mean()) if m.sum() > 200 else None
        # ★ A band sitting at V<0.08 is SHADOW wearing a hue, not a material.
        # Ratios there are enormous and meaningless -- S1's violet reads x0.82
        # off means of 0.051 vs 0.042, which is two nearly-black pixels
        # disagreeing.  Reporting it as a defect would train you to ignore the
        # tool, which is worse than the tool being quiet.
        out[name] = mean if (mean is not None and mean >= 0.08) else None
    return out


def warm_weight(h):
    a, b, c, d = WARM
    w = np.zeros_like(h)
    w = np.where((h >= b) & (h <= c), 1.0, w)
    w = np.where((h >= a) & (h < b), (h - a) / (b - a), w)
    w = np.where((h > c) & (h <= d), 1.0 - (h - c) / (d - c), w)
    return w


def apply_warm(src, factor):
    a = np.array(Image.open(src).convert('RGBA'))
    rgb = a[..., :3].astype(np.float64) / 255.0
    h, s, _ = hsv_parts(rgb)
    w = warm_weight(h) * (s > SAT_FLOOR)
    k = 1.0 - w * (1.0 - factor)
    out = np.clip(rgb * k[..., None], 0, 1)
    a2 = a.copy()
    a2[..., :3] = np.round(out * 255).astype(np.uint8)   # alpha untouched
    d = os.path.join(os.path.dirname(src), '_orig')
    os.makedirs(d, exist_ok=True)
    bak = os.path.join(d, os.path.basename(src).replace('.png', '-ungraded.png'))
    if not os.path.exists(bak):
        shutil.copy(src, bak)
        print(f'  original kept at {os.path.relpath(bak)}')
    Image.fromarray(a2, 'RGBA').save(src)
    return int((w > 0).sum())


def main():
    if len(sys.argv) < 3:
        raise SystemExit(__doc__)
    sheet, ref = sys.argv[1], sys.argv[2]
    S, Rf = band_means(sheet), band_means(ref)
    print(f'  {"material":14s} {"sheet":>7s} {"ref":>7s} {"factor":>8s}')
    warm = None
    for name, _lo, _hi in BANDS:
        a, b = S.get(name), Rf.get(name)
        if a is None or b is None:
            print(f'  {name:14s} {"--":>7s} {"--":>7s}   (too few pixels)')
            continue
        fac = b / a
        flag = '  ← OFF' if abs(fac - 1) > 0.10 else ''
        print(f'  {name:14s} {a:7.3f} {b:7.3f} {fac:8.3f}{flag}')
        if name == 'skin+gold':
            warm = fac
    if '--apply' in sys.argv:
        if warm is None:
            raise SystemExit('no warm-band measurement · nothing to apply')
        n = apply_warm(sheet, warm)
        print(f'\n  applied x{warm:.3f} to {n} warm pixels · hue and saturation unchanged')
    elif warm is not None and abs(warm - 1) > 0.10:
        print(f'\n  run again with --apply to correct the warm band (x{warm:.3f})')


if __name__ == '__main__':
    main()
