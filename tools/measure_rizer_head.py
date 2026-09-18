#!/usr/bin/env python3
"""Measure Rizer's HEAD per direction, per frame — the pose-invariant anchor.

Creator, 2026-09-18: *"make sure rizer is the same size in all frames. kick was
coming out weird ... use rizers idle head DLRU scale as the universal anchor of
his frames (kick, etc.)"*

★★★★ WHY THE HEAD AND NOT THE BODY.  bodyBh measures head-to-feet, which is a
POSE, not a size.  A kick crouches, extends and leaves the ground: his
head-to-feet ink genuinely changes, so scaling by it makes him grow and shrink
mid-swing.  A head does not deform.  If the head draws the same number of pixels
in every frame, the character IS the same size in every frame — which is the
thing the Creator can see and the thing bodyBh was only ever approximating.

★★★ THE CODEBASE ALREADY KNEW THIS AND USED IT AS A CHECK RATHER THAN A RULE.
v0.95.941, on the walk sheet: "Cross-checked by rendering all four sheets at
final scale and measuring the FACE, which is pose-invariant."  The face was good
enough to VERIFY the body measure; it is better than the body measure.

★★ HOW THE HEAD IS FOUND, and why it is not a guess.  Within the declared box
(absolute sheet coordinates — the UP rows carry a negative `by` to recover hair
drawn past the cell edge, and clipping to the cell is the v0.95.940 bug):

    1 · w[y] = opaque pixels in scanline y, from the top of the ink down.
    2 · the head's widest scanline is the max of w[] over the top 45%.
    3 · the NECK is the first scanline below it where w falls to <= NECK_FRAC of
        that maximum and keeps falling — a head sits on something much narrower
        than itself, in every pose, from every angle.
    4 · head height = neck - top.

★ The measure is taken PER ROW, not per sheet, because a head seen face-on is a
different shape from a head in profile — DOWN, LEFT, RIGHT and UP each get their
own anchor.  That is precisely what "idle head DLRU scale" means.
"""
import os, re, sys
import numpy as np
from PIL import Image

CELL = 313
DIRS = ['DOWN', 'LEFT', 'RIGHT', 'UP']
NECK_FRAC = 0.62
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, 'rp7b.html'), encoding='utf-8').read()


def bbox_table(name):
    """the declared bboxes for a bank, from BBOX_FALLBACK or the RIZER literal"""
    for blk_start, pat in ((src.index('const BBOX_FALLBACK'), name + r':\s*\[(.*?)\n  \]'),
                           (0, r'\b' + name + r':\s*\{[^}]*?bboxes:\s*\[(.*?)\n  \]')):
        blk = src[blk_start:src.index('\n};', blk_start)] if blk_start else src
        m = re.search(pat, blk, re.S)
        if m:
            rows = re.findall(r'\[((?:\s*\[[^\]]*\],?\s*)+)\]', m.group(1))
            out = [[[int(v) for v in c.split(',')] for c in re.findall(r'\[([^\]]*)\]', r)]
                   for r in rows]
            if len(out) == 4 and all(len(r) == 4 for r in out):
                return out
    return None


def head_of(mask):
    """(top, neck, height, maxw) for one frame's opaque mask, or None"""
    w = mask.sum(axis=1)
    nz = np.nonzero(w)[0]
    if len(nz) < 12:
        return None
    top, bot = nz[0], nz[-1]
    span = bot - top + 1
    window = w[top:top + max(6, int(span * 0.45))]
    if not len(window):
        return None
    peak = int(np.argmax(window))
    maxw = int(window[peak])
    if maxw <= 0:
        return None
    neck = None
    for y in range(top + peak + 1, bot + 1):
        if w[y] <= NECK_FRAC * maxw:
            neck = y
            break
    if neck is None:
        neck = top + len(window)
    return (int(top), int(neck), int(neck - top), maxw)


def measure(name, path):
    T = bbox_table(name)
    if T is None:
        return None
    p = os.path.join(ROOT, 'assets/2D sprites/rizer', path + '.png')
    if not os.path.exists(p):
        return None
    a = np.array(Image.open(p).convert('RGBA'))
    op = a[..., 3] > 20
    H, W = op.shape
    out = []
    for r in range(4):
        row = []
        for c in range(4):
            bx, by, bw, bh = T[r][c]
            x0, y0 = r * 0 + c * CELL + bx, r * CELL + by      # absolute, box-relative
            x1, y1 = x0 + bw, y0 + bh
            sub = op[max(0, y0):min(H, y1), max(0, x0):min(W, x1)]
            h = head_of(sub)
            row.append(h)
        out.append(row)
    return out


BANKS = sys.argv[1:] or ['idle', 'walk', 'run', 'kick', 'punch']
print(f'{"bank":<8}{"dir":<7}' + ''.join(f'{"c"+str(c):>9}' for c in range(4))
      + f'{"spread":>9}{"mean":>8}')
anchors = {}
for name in BANKS:
    M = measure(name, name)
    if M is None:
        print(f'{name:<8} — no bbox table or no sheet on disk')
        continue
    for r in range(4):
        hs = [f[2] for f in M[r] if f]
        if not hs:
            print(f'{name:<8}{DIRS[r]:<7} (no ink)')
            continue
        spread = max(hs) - min(hs)
        mean = sum(hs) / len(hs)
        if name == 'idle':
            anchors[DIRS[r]] = mean
        flag = '' if spread <= 4 else ('  ← varies' if spread <= 12 else '  ← VARIES A LOT')
        print(f'{name:<8}{DIRS[r]:<7}' + ''.join(f'{h:>9}' for h in hs)
              + f'{spread:>9}{mean:>8.1f}{flag}')
    print()
if anchors:
    print('IDLE HEAD ANCHORS · ' + ' · '.join(f'{d} {v:.1f}px' for d, v in anchors.items()))
