#!/usr/bin/env python3
# ★★★ v0.96.86 · A PROP'S BBOX IS A KNIFE, NOT A HINT.
#
# Creator: "the meteor is cropped on the overworld."
#
# drawProp does this:
#     const [bx, by, bw, bh] = p.bbox;
#     ctx.drawImage(p.img, bx, by, bw, bh, dx, dy, drawW, drawH);
# — the bbox IS the source rect.  Every pixel of the art outside it is not
# dimmed, not scaled, not warned about: it is never drawn.  And because the
# draw still fills its full tile width, a too-small bbox does not look like a
# crop of a sprite.  It looks like the ARTIST delivered a cut-off sprite.
# That is why this survived from v0.95.498 to now in plain sight.
#
# ★★ WHY A TEST AND NOT A FIX.  Three separate props were cut (crater 32%,
#   club 24%, and the raygun deliberately).  A bbox can only ever be tightened
#   by eye — you cannot see the pixels you are cutting off, because cutting
#   them off is what makes them invisible.  So the measurement has to be done
#   by something that reads alpha, and it has to be done every time, not once.
#
# ★ Run:  python3 tools/verify_prop_bbox_crop.py
import re, os, bisect, sys, urllib.parse
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, 'rp7b.html'), encoding='utf-8').read()

# ── props whose bbox is legitimately SMALLER than the art ────────────────────
# Every entry needs a reason.  "It looks fine" is not one.
EXEMPT = {
    # a 4-frame strip; frame 0 is the still the design calls for, and the
    # comment at its declaration says so outright.
    'broken-raygun.png':     'multi-frame strip · frame 0 is intentional',
    # animated multi-cell props cycle srcX across the sheet; the bbox is one cell
    'andrannor-fountain.png': 'animated · bbox is one cell of N',
    'korathen-town-hall.png': 'animated · bbox is one cell of N',
    # ★ OPEN RULING · 143px of stair bottom is outside the box.  The comment
    #   there documents 1050 as deliberate geometry (10.5 tiles) and the prop's
    #   FOOTPRINT is real collision, so widening it moves a solid mass.  Left
    #   for the Creator rather than changed underneath them.
    'rakoron-cave-full.png': 'OPEN · see data/RULING_NEEDED_RAKORON_CAVE_BBOX.md',
}
# antialiasing specks, not art.  Below this a "crop" is a stray dim pixel.
NOISE_PX = 2000

# ── pair every bbox with the src IN ITS OWN OBJECT LITERAL ──────────────────
# ★★ TWO WRONG ANSWERS BEFORE THIS ONE, both of which invented failures:
#      1. "the next src within 3 lines"  — walked into the next entry.
#      2. "the nearest src by distance"  — in a one-line table like
#           { src:'a.png', bbox:[A], msg:'…a long string…' },
#           { src:'b.png', bbox:[B] },
#         box A is physically CLOSER to src b than to src a whenever the msg is
#         long.  Proximity is not ownership.
#   The boundary that actually matters is the brace.  A bbox belongs to the
#   nearest src it can reach WITHOUT CROSSING A `{` OR `}` — which is exactly
#   the definition of "the same object literal", and needs no distance ceiling.
srcs = [(m.start(), m.end(), urllib.parse.unquote(m.group(2)))
        for m in re.finditer(r"\b(?:src|file)\s*:\s*'([^']*?([^'/]+\.png))'", src)]
spos = [s for s, _, _ in srcs]
boxes = [(m.start(), m.end(), tuple(int(x) for x in m.group(1).replace(' ', '').split(',')))
         for m in re.finditer(r"\bbbox\s*:\s*\[\s*([\-0-9]+\s*,\s*[\-0-9]+\s*,"
                              r"\s*[\-0-9]+\s*,\s*[\-0-9]+)\s*\]", src)]

def reaches(a, b):
    """True if the span between two declarations stays inside one literal."""
    gap = src[a:b]
    return '{' not in gap and '}' not in gap

pairs, orphans = [], 0
for bs, be, bb in boxes:
    i = bisect.bisect_left(spos, bs)
    hit = None
    if i - 1 >= 0 and reaches(srcs[i - 1][1], bs):          # src declared above it
        hit = srcs[i - 1][2]
    elif i < len(srcs) and reaches(be, srcs[i][0]):          # or below it
        hit = srcs[i][2]
    if hit: pairs.append((os.path.basename(hit), bb))
    else:   orphans += 1

BASES = ['assets/2D sprites/decor/', 'assets/2D sprites/buildings/', 'assets/2D sprites/',
         'assets/rp7/', 'assets/rp8/', 'assets/']
def resolve(name):
    for b in BASES:
        p = os.path.join(ROOT, b, name)
        if os.path.exists(p): return p
    return None

bounds = {}
def content(path):
    if path not in bounds:
        a = np.array(Image.open(path).convert('RGBA'))[..., 3]
        ys, xs = np.nonzero(a > 8)
        bounds[path] = (a, (int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max()))) \
                       if len(xs) else (a, None)
    return bounds[path]

fails, checked, skipped = [], 0, 0
for name, bb in sorted(set(pairs)):
    if name in EXEMPT: continue
    path = resolve(name)
    if not path: skipped += 1; continue
    alpha, c = content(path)
    if not c: continue
    checked += 1
    bx, by, bw, bh = bb
    cx0, cy0, cx1, cy1 = c
    cut = (max(0, bx - cx0), max(0, by - cy0),
           max(0, cx1 - (bx + bw - 1)), max(0, cy1 - (by + bh - 1)))
    if not max(cut): continue
    total = int((alpha > 8).sum())
    inside = int((alpha[by:by + bh, bx:bx + bw] > 8).sum())
    lost = total - inside
    if lost < NOISE_PX: continue
    fails.append((lost, name, bb, (cx0, cy0, cx1 - cx0 + 1, cy1 - cy0 + 1), cut,
                  100.0 * inside / total))

print(f'\n★ {checked} prop bboxes measured against their own alpha '
      f'({len(EXEMPT)} exempt, {skipped} art files not on disk, '
      f'{orphans} boxes with no src in their literal)')
if fails:
    print('\n❌ ART CUT OFF BY ITS OWN BBOX — these render as broken sprites:')
    for lost, name, bb, cb, cut, pct in sorted(fails, reverse=True):
        print(f'   {name}')
        print(f'      bbox      {list(bb)}')
        print(f'      art is at {list(cb)}   ← what it should be')
        print(f'      cut L/T/R/B {cut} · {lost:,} px lost · only {pct:.1f}% drawn')
    print(f'\n❌ {len(fails)} cropped')
    sys.exit(1)
print('✅ every prop draws all of its own art')
