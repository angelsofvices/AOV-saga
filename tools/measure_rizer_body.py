"""Measure Rizer's head-to-feet ink per direction, for the bodyBh tables.

Creator, 2026-09-01: *"rizer is shorter in idle up left and right"*, then after
seeing the first attempt: *"the afters are all way too big... his idle before
size is perfect."*

★★★ MEASURE ACROSS THE DECLARED BOX, NOT INSIDE THE CELL.
The first version of this tool clipped to the 313px cell and got UP wrong on two
sheets.  The UP box carries a NEGATIVE `by` -- idle -30, walk -23 -- because the
artist drew his hair past the top of the cell and the box reaches up into the
row above to recover it.  Clipping threw that hair away: idle-UP measured 144
against a real 166, and a scale built on 144 drew him 15% too tall.

So the window is the DECLARED BOX in absolute sheet coordinates, clamped only to
the image itself.  Within that window every opaque pixel is his -- the box was
authored to contain exactly one character.

★ Why not connected components any more.  Ownership is the right tool when a
cell holds a character plus a neighbour's overflow; it is the WRONG tool here,
because his hair can legitimately be a separate island from his body (it is, in
several UP frames), and "largest component" would then measure the body alone.
The declared box already solves the neighbour problem by being hand-drawn around
one character, so the simpler measurement is also the safer one.

    python3 tools/measure_rizer_body.py [sheet ...]
"""
import os, re, sys
import numpy as np
from PIL import Image

CELL = 313
DIRS = ['DOWN', 'LEFT', 'RIGHT', 'UP']
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHEETS = sys.argv[1:] or ['idle', 'walk', 'run']

src = open(os.path.join(ROOT, 'rp7b.html'), encoding='utf-8').read()
i = src.index('const BBOX_FALLBACK'); blk = src[i:src.index('\n};', i)]


def declared(name):
    m = re.search(name + r':\s*\[(.*?)\n  \]', blk, re.S)
    return [[[int(v) for v in c.split(',')] for c in re.findall(r'\[([^\]]*)\]', r)]
            for r in re.findall(r'\[((?:\s*\[[^\]]*\],?)+)\s*\]', m.group(1))]


for name in SHEETS:
    D = declared(name)
    a = np.array(Image.open(os.path.join(ROOT, 'assets/2D sprites/rizer', name + '.png'))
                 .convert('RGBA'))
    op = a[..., 3] > 20
    H, W = op.shape
    table, notes = [], []
    print(f'\n  {name}.png')
    for r in range(4):
        bx, by, bw, bh = D[r][0]
        y0, y1 = max(0, r * CELL + by), min(H, r * CELL + by + bh)
        x0, x1 = max(0, bx), min(W, bx + bw)
        ys, _ = np.where(op[y0:y1, x0:x1])
        body = int(ys.max() - ys.min() + 1) if len(ys) else 0
        table.append(body)
        over = ' ← box reaches OUTSIDE the cell' if by < 0 or by + bh > CELL else ''
        print(f'    {DIRS[r]:6s} box by={by:<5d} bh={bh:<4d}  head-to-feet {body:3d}{over}')
    print(f'    bodyBh: {table}')
