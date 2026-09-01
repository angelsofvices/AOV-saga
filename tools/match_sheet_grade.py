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
    python3 tools/match_sheet_grade.py --survey <dir> <reference.png>       # whole character

SURVEYING A WHOLE CHARACTER (and what it found)
-----------------------------------------------
Run across all 16 S1 Rizer body sheets, the ARMOUR and HAIR bands come back
between x0.30 and x1.43 -- which is not grade drift, it is the bands catching
different things per pose. The blue band holds his armour AND his cape AND any
blue VFX, and how much cape is on screen changes with every pose. Correcting on
that number would "fix" a cape into a lighting change.

The WARM band is the only one stable enough to lock across poses, and even it
has to be read with the pixel COUNT beside it:

  · guitar-play reports x1.169 -- but 24% of its body is "warm", because the
    wooden GUITAR lands in the same band as skin. Different material, not drift.
  · idle2 (4% skin) and hurt (8%, face hidden) have too little skin to mean much.

With those excluded, the character is ALREADY consistent: walk, run, kick,
death, skate, fae-catch, double-jump and block all sit within 3.5% of the idle,
which is below what anyone can see. Only `interact` is meaningfully off.

So a blanket palette-lock is the wrong instrument -- it would introduce more
error than it removes. The tool reports, guards, and corrects only what it can
defend.
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


# ★★★ SHEETS THAT CARRY A WARM PROP OR EFFECT.  The %-of-body guard catches
# guitar-play (a wooden guitar filling a quarter of the frame) but NOT these:
# their bodies are large, so the prop hides inside a normal-looking percentage.
# The Emerald Axe has a wooden haft, the Pearlbow is wood and shell, the
# astral kick and slam throw orange fire, and the sword sheets carry a gold
# hilt through every frame.  All of that lands in the same hue window as skin.
#
# Measuring these properly needs a BODY MASK -- exclude the prop, then compare.
# Until that exists the tool refuses to correct them, because a number it cannot
# defend is worse than no number: it looks like an answer.
WARM_PROP_SHEETS = {
    'guitar-play', 'emerald-axe-sheet', 'pearlbow', 'pearlbow-arrow',
    'sapphire-sword', 'rubypaw-sword', 'astralkick', 'astralstrike',
    'astralslam-s1-mori', 'astralslam-s1-daemon',
    'astralslam-s2-mori', 'astralslam-s2-daemon',
    'astralthrow', 'astralthrow-boulder',
}
MIN_SKIN_PX  = 20000   # below this the warm band is too small to trust
MAX_SKIN_PCT = 0.23    # above this it is catching something that is not skin
DRIFT        = 0.05    # what counts as worth correcting


def survey(folder, refpath):
    import numpy as np
    from PIL import Image as _I
    ref = band_means(refpath)
    names = sorted(f for f in os.listdir(folder)
                   if f.endswith('.png') and 'power-upgrade' not in f
                   and 'green' not in f and not f.startswith('_'))
    print(f'  {"sheet":24s} {"warm px":>8s} {"%body":>6s} {"factor":>7s}  verdict')
    todo = []
    for f in names:
        p = os.path.join(folder, f)
        a = np.array(_I.open(p).convert('RGBA'))
        rgb = a[..., :3].astype(np.float64) / 255.0
        op = a[..., 3] > 200
        h, sa, v = hsv_parts(rgb)
        sel = op & (h >= 0.05) & (h < 0.13) & (sa > SAT_FLOOR)
        px = int(sel.sum()); body = max(1, int(op.sum()))
        if px < 200:
            continue
        pct = px / body
        fac = ref['skin+gold'] / float(v[sel].mean())
        # ★ the guards ARE the tool.  A factor without a confidence check is how
        # you "correct" a guitar into a suntan.
        stem = f[:-4]
        # ★ the CAPTURE sheets all hold a lit Zysphere in frame -- a warm glow
        # the size of his head, in the same band as his face.
        # ★★ and a `-s2-` sheet is a DIFFERENT CHARACTER (Rakoron), so comparing
        # it to the S1 idle is not a drift measurement at all.  It produced
        # confident-looking factors of x0.86 for ten sheets, every one of them
        # meaningless.  Wrong reference is the failure that looks most like a
        # result.
        if stem in WARM_PROP_SHEETS:
                                  verdict = 'skip · carries a warm prop/effect · needs a body mask'
        elif stem.startswith('capture-'):
                                  verdict = 'skip · Zysphere glow sits in the warm band'
        elif '-s2-' in stem or stem.endswith('-s2'):
                                  verdict = 'skip · S2 sheet · wrong reference for an S1 idle'
        elif px < MIN_SKIN_PX:    verdict = 'skip · too little skin to trust'
        elif pct > MAX_SKIN_PCT:  verdict = 'skip · warm band is catching another material'
        elif abs(fac - 1) < DRIFT: verdict = 'ok'
        else:
            verdict = f'CORRECT x{fac:.3f}'
            todo.append((f, fac))
        print(f'  {f[:-4]:24s} {px:8d} {100*pct:5.1f}% {fac:7.3f}  {verdict}')
    print()
    if todo:
        print('  correctable:', ', '.join(n for n, _ in todo))
        print('  re-run on each with --apply')
    else:
        print('  nothing to correct · the character is already consistent')
    return todo


def main():
    if '--survey' in sys.argv:
        i = sys.argv.index('--survey')
        return survey(sys.argv[i + 1], sys.argv[i + 2])
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
