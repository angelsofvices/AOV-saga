#!/usr/bin/env python3
"""audit_cell_bleed.py · every Zyrex sheet, every frame.

Creator: "fix all cell bleeding in any zyrex animation. all zyrex should be one
full body per frame. do the full parse of wild zyrex. clean up all frames. make
sure they are all imported correctly."

★★★ BLEED IS NOT THE SAME AS OVERFLOW, and the whole audit turns on the
difference. A body may legally leave its cell — a wingspan, a beam, a tail —
and that is OWNED overflow ([[aov-sprite-cc-extractor]]: never cell-clip).
BLEED is when a frame contains part of a DIFFERENT body. Same pixels crossing
the same line; only ownership tells them apart.

So the test is connectivity, not geometry: flood-fill the sheet, then ask of
each component how its MASS is distributed across cells.
  · nearly all in one cell        → one body with overflow · LEGAL
  · real mass in two or more      → two bodies fused, or one body bleeding into
                                    a neighbour's frame · REPORTED
"""
import sys, os, glob, json
from collections import deque
from PIL import Image

FUSE  = 0.70         # dominant cell must hold this share to count as one body
MINPX = 40           # below this a component is dust
# ★★ ALPHA THRESHOLD 40, NOT 8. At 8 the audit flagged attack_aetherwing and
# zorbil for 1,2xx-pixel components spanning three frames at 25% each — which
# turned out to be ANTI-ALIASED RIM below the visible threshold, a faint halo
# the de-fringe pass leaves behind. Both findings vanish at 40 and stay gone at
# 90. ★ A bleed nobody can see is not a bleed; counting it trains you to ignore
# the report.
ALPHA = 40
def comps(px, W, H):
    seen = [[False]*W for _ in range(H)]
    out = []
    for Y in range(H):
        for X in range(W):
            if seen[Y][X] or px[X, Y][3] <= ALPHA: continue
            blob = []; q = deque([(X, Y)]); seen[Y][X] = True
            while q:
                cx, cy = q.popleft(); blob.append((cx, cy))
                for dx, dy in ((1,0),(-1,0),(0,1),(0,-1),(1,1),(1,-1),(-1,1),(-1,-1)):
                    nx, ny = cx+dx, cy+dy
                    if 0 <= nx < W and 0 <= ny < H and not seen[ny][nx] and px[nx, ny][3] > ALPHA:
                        seen[ny][nx] = True; q.append((nx, ny))
            if len(blob) >= MINPX: out.append(blob)
    return out

# ★★ ONLY AUDIT SHEETS THE GAME ACTUALLY LOADS. auraxion-fly-green.png is 100%
# opaque with a green corner — never keyed — and it read as one 1.5-million-pixel
# component spanning all sixteen frames. It is not a bug: it is the RAW DELIVERY
# kept beside the keyed auraxion-fly.png, and rp7b.html references it zero times.
# ★ An audit that reports source material as shipped defects is an audit people
# stop reading.
HTML = open('rp7b.html', encoding='utf-8').read()
rows = []
files = sorted(glob.glob('assets/2D sprites/zyrex/**/*.png', recursive=True))
files = [f for f in files if os.path.basename(f) in HTML
                          or os.path.basename(f).replace(' ', '%20') in HTML]
for f in files:
    try: im = Image.open(f).convert('RGBA')
    except Exception: continue
    W, H = im.size
    # ★★★ MY FIRST CUT REJECTED EVERY SHEET IN THE GAME. The guard was
    # `W % 4`, and the canon sheet is 1254 — whose cell is 313.5, deliberately
    # fractional ([[aov-sprite-4x4-standard]]). 1254 % 4 == 2, so all 90 sheets
    # were "skipped" and the audit proudly reported ZERO bleed.
    # ★ An audit that parses nothing reports clean. That is the most dangerous
    # result a tool can produce, and the only reason I caught it is that the
    # skip list was longer than the findings list.
    if W != H:
        rows.append({'file': f, 'skip': f'{W}x{H} not square'}); continue
    C = W / 4.0
    px = im.load()
    bleeds = []; empty = []
    filled = set()
    for blob in comps(px, W, H):
        mass = {}
        for (x, y) in blob:
            k = (min(3, int(y // C)), min(3, int(x // C)))
            mass[k] = mass.get(k, 0) + 1
        top, topn = max(mass.items(), key=lambda kv: kv[1])
        filled.add(top)
        if len(mass) > 1 and topn / len(blob) < FUSE:
            share = sorted(((v/len(blob), k) for k, v in mass.items()), reverse=True)[:3]
            bleeds.append({'px': len(blob), 'cells': [f'r{k[0]}f{k[1]}={p:.0%}' for p, k in share]})
    for r in range(4):
        for c in range(4):
            if (r, c) not in filled: empty.append(f'r{r}f{c}')
    rows.append({'file': f, 'bleeds': bleeds, 'empty': empty})

bad = [r for r in rows if r.get('bleeds') or r.get('empty')]
print(f'\n★ {len(files)} PNG · {len([r for r in rows if "skip" not in r])} parsed as 4x4 grids\n')
for r in rows:
    if 'skip' in r: print(f'  skip  {os.path.basename(r["file"]):34s} {r["skip"]}')
print()
for r in bad:
    n = os.path.basename(r['file'])
    if r.get('bleeds'):
        print(f'  ✂ BLEED {n}')
        for b in r['bleeds'][:4]: print(f'          {b["px"]:6d}px spans {" ".join(b["cells"])}')
    if r.get('empty'):
        print(f'  ○ EMPTY {n} · {", ".join(r["empty"])}')
print(f'\n★ sheets with bleed : {len([r for r in rows if r.get("bleeds")])}')
print(f'★ sheets with an empty frame : {len([r for r in rows if r.get("empty")])}')
json.dump(rows, open('/tmp/bleed.json','w'))
