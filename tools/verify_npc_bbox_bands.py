#!/usr/bin/env python3
# ★★★ v0.96.91 · A SPRITE ROW IS A CONTENT BAND, NOT A CELL.
#
# Creator: "viretta is too small."
#
# She was not authored small. drawNPC normalises every character so that its
# TALLEST col-0 bbox is 2 tiles. Prof. Vireta's LEFT and RIGHT rows were
# declared [_, 0, _, 313] — the full cell height — so the yardstick became 313
# and every other row shrank to fit it. Her DOWN pose, the one you stand in
# front of, drew at 264/313 = 1.69 tiles.
#
# ★★ AND THE 313s WERE NOT A TYPO. Her four poses sit at y 50-314, 339-599,
#   619-879, 898-1173 — steps of 289, 280, 279. They do not sit on the 313
#   grid at all. A per-cell scan of row 1 therefore sees the tail of the pose
#   above, the real pose, and the head of the pose below, clips all three at
#   the cell edges, and reports one blob 313 tall. The number is a measurement
#   of the GRID, not of the character.
#
# ★ THE SMELL IS CHEAP TO TEST FOR: a declared bh equal to the cell height.
#   Real art almost never exactly fills its cell; clipped art always does.
#   This sweeps every 4x4 NPC sheet in the build for it, and where it finds
#   one, measures the true content bands so the fix is already in the output.
#
# Run: python3 tools/verify_npc_bbox_bands.py
import re, os, sys, urllib.parse
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, 'rp7b.html'), encoding='utf-8').read()

# sheets whose rows genuinely run edge to edge, with a reason
EXEMPT = {}

# ── pair each `bboxes: [...]` block with the src png in its own object ───────
def owner_src(pos):
    """nearest src:'...png' reachable without crossing a brace."""
    best = None
    for m in re.finditer(r"\bsrc\s*:\s*'([^']*?([^'/]+\.png))'", src):
        if m.start() > pos:
            if best is None and '{' not in src[m.end():pos] and '}' not in src[m.end():pos]:
                pass
            break
        gap = src[m.end():pos]
        if '{' in gap or '}' in gap: continue
        best = urllib.parse.unquote(m.group(2))
    return best

def resolve(name):
    for base in ('assets/2D sprites/npcs/', 'assets/2D sprites/npcs/townsfolk/',
                 'assets/2D sprites/', 'assets/rp7/', 'assets/'):
        p = os.path.join(ROOT, base, name)
        if os.path.exists(p): return p
    return None

def bands(alpha):
    rows = (alpha > 8).any(axis=1)
    out, s = [], None
    for y, v in enumerate(rows):
        if v and s is None: s = y
        if not v and s is not None: out.append((s, y - 1)); s = None
    if s is not None: out.append((s, len(rows) - 1))
    return out

checked = suspect = skipped = 0
findings = []
# ★ BRACKET-MATCH, don't regex. These blocks are multi-line and carry trailing
#   comments; my first pattern matched ZERO of them and the suite reported a
#   confident green over nothing at all. A test that cannot find its subject
#   passes for the same reason a broken one does.
def bbox_blocks():
    for m in re.finditer(r"bboxes:\s*\[", src):
        i = m.end() - 1; d = 0; j = i
        while True:
            if src[j] == '[': d += 1
            elif src[j] == ']': d -= 1
            j += 1
            if d == 0: break
        yield m.start(), src[i:j]

for start, block in bbox_blocks():
    class _M:  # keep the rest of the loop unchanged
        pass
    m = _M(); m.start = lambda s=start: s; m.end = lambda s=start, b=block: s + len(b)
    # strip comments, then pull the four rows
    clean = re.sub(r"//[^\n]*", "", block)
    rows = re.findall(r"\[\s*((?:\[\s*-?\d+\s*,\s*-?\d+\s*,\s*-?\d+\s*,\s*-?\d+\s*\]\s*,?\s*)+)\]", clean)
    if len(rows) != 4: continue
    grid = []
    for r in rows:
        grid.append([[int(x) for x in c.split(',')] for c in re.findall(r"\[([^\]]*)\]", r)])
    if any(len(r) == 0 for r in grid): continue
    name = owner_src(start)
    if not name: continue
    # cell height for this object
    ch = re.search(r"cellH:\s*(\d+)", src[start + len(block):start + len(block) + 600])
    cellH = int(ch.group(1)) if ch else 313
    path = resolve(name)
    if not path: skipped += 1; continue
    checked += 1
    if name in EXEMPT: continue
    # ★ THE SMELL: any declared bh that equals the cell height exactly
    full = [(ri, ci) for ri, r in enumerate(grid) for ci, c in enumerate(r)
            if len(c) == 4 and c[3] == cellH]
    if not full: continue
    alpha = np.array(Image.open(path).convert('RGBA'))[..., 3]
    B = bands(alpha)
    if len(B) != 4:
        findings.append((name, f'{len(full)} bbox(es) declared the full {cellH}px cell height, '
                               f'and the sheet has {len(B)} content bands (expected 4) — measure by hand'))
        suspect += 1
        continue
    heights = [b[1] - b[0] + 1 for b in B]
    if max(heights) >= cellH: continue          # genuinely fills the cell
    suspect += 1
    fix = []
    C = alpha.shape[1] // 4
    for ri, (y0, y1) in enumerate(B):
        cells = []
        for ci in range(4):
            sub = alpha[y0:y1 + 1, ci * C:(ci + 1) * C]
            ys, xs = np.nonzero(sub > 8)
            cells.append([int(xs.min()), y0 - ri * cellH,
                          int(xs.max() - xs.min() + 1), y1 - y0 + 1])
        fix.append(cells)
    findings.append((name,
        f'{len(full)} bbox(es) claim the full {cellH}px cell, but the art bands are '
        f'{heights} — the yardstick is {cellH} when it should be {max(h for h in [f[0][3] for f in fix])}',
        fix))

print(f'\n★ {checked} four-row NPC sheets measured ({skipped} art files not on disk)')
if findings:
    print('\n❌ MEASURED AGAINST THE GRID, NOT THE ART:')
    for f in findings:
        print(f'\n   {f[0]}\n      {f[1]}')
        if len(f) > 2:
            print('      measured content bands, cell-relative (negative by is correct):')
            for ri, cells in enumerate(f[2]):
                print('        [' + ','.join(f'[{c[0]:4d},{c[1]:4d},{c[2]:4d},{c[3]:4d}]' for c in cells) + '],')
    print(f'\n❌ {suspect} sheet(s) normalised against a cell edge')
    sys.exit(1)
print('✅ every NPC row is measured from its art, not from the cell grid')
