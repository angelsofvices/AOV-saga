#!/usr/bin/env python3
# ★★★★ REPAIR KEYER DAMAGE INSIDE A SPRITE · ask the master, not a threshold.
#
#   python3 tools/repair_enclosed_holes.py nymphysyl
#
# ★★★ THE PROBLEM THIS SOLVES. Nymphysyl is a VIOLET spirit keyed on MAGENTA.
#   Her own colour sits close enough to the key that the chroma test punched
#   speckles out of her body, her hair and her VFX — 272 to 745 enclosed holes
#   per sheet, 1,348 to 4,499 pixels. Same family as the Zoryn disaster
#   ([[aov-zoryn-black-key-damage]]): a creature whose palette overlaps the key.
#
# ★★ AND THE OBVIOUS FIX IS WRONG. "Fill every enclosed hole" would also fill
#   the inside of her crescent swipe — a 2,268px region that is SUPPOSED to be
#   see-through, because you look through the inside of an arc. A size cutoff
#   guesses at where that line falls, and the guess is different for every
#   sheet.
#
# ★★★★ SO ASK THE MASTER. For every enclosed transparent pixel, look at the
#   untouched original:
#       master pixel is CHROMA      → genuine background · stay transparent
#       master pixel is ART COLOUR  → the keyer ate it   · restore it
#   That is exact rather than heuristic, it needs no threshold, and it cannot
#   be wrong about the arc because the arc's interior really is magenta in the
#   master.
#
# ★ Only ENCLOSED holes are considered. Border-reachable transparency is the
#   background and is never touched — that is the de-fringe canon
#   ([[aov-defringe-border-reachable]]) and this tool does not weaken it.
import sys, os
import numpy as np
from PIL import Image
from collections import deque

ENEM = 'assets/2D sprites/enemies'
ORIG = f'{ENEM}/_orig'

def border_reachable(trans):
    """transparent pixels connected to the image border · the real background"""
    h, w = trans.shape
    seen = np.zeros_like(trans)
    dq = deque()
    for x in range(w):
        for y in (0, h - 1):
            if trans[y, x] and not seen[y, x]:
                seen[y, x] = True; dq.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if trans[y, x] and not seen[y, x]:
                seen[y, x] = True; dq.append((y, x))
    while dq:
        y, x = dq.popleft()
        for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and trans[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True; dq.append((ny, nx))
    return seen

def is_chroma(m):
    """near-magenta in the master · the key this art was shot against"""
    r = m[..., 0].astype(int); g = m[..., 1].astype(int); b = m[..., 2].astype(int)
    # ★ generous on the key, strict on the green channel — her violets run
    #   (147,22,164) to (194,7,207), the key runs (250,3,250). The separator is
    #   how BRIGHT the red and blue are, not how low the green is.
    return (r > 225) & (b > 225) & (g < 90)

def repair(species):
    total_fixed = total_kept = 0
    for fn in sorted(os.listdir(ENEM)):
        if not fn.startswith(species + '-') or not fn.endswith('.png'):
            continue
        kp = f'{ENEM}/{fn}'
        mp = f'{ORIG}/{fn[:-4]}_master.png'
        if not os.path.exists(mp):
            print(f'  ⚠ {fn}: no master — skipped'); continue
        k = np.array(Image.open(kp).convert('RGBA'))
        m = np.array(Image.open(mp).convert('RGBA'))
        if k.shape[:2] != m.shape[:2]:
            print(f'  ⚠ {fn}: master is {m.shape[:2]}, keyed is {k.shape[:2]} — skipped'); continue

        trans = k[..., 3] <= 8
        outside = border_reachable(trans)
        enclosed = trans & ~outside
        chroma = is_chroma(m)

        # ★ enclosed AND the master says it was art → the keyer ate it
        damaged = enclosed & ~chroma
        kept    = enclosed & chroma

        if damaged.any():
            k[..., 0][damaged] = m[..., 0][damaged]
            k[..., 1][damaged] = m[..., 1][damaged]
            k[..., 2][damaged] = m[..., 2][damaged]
            k[..., 3][damaged] = 255
            Image.fromarray(k).save(kp)

        total_fixed += int(damaged.sum()); total_kept += int(kept.sum())
        print(f'  {fn:<28} restored {int(damaged.sum()):6d} px · '
              f'left {int(kept.sum()):6d} px see-through (master says chroma)')
    print(f'\n★ {species}: {total_fixed} px of keyer damage repaired · '
          f'{total_kept} px correctly left transparent')

if __name__ == '__main__':
    for s in sys.argv[1:] or ['nymphysyl']:
        print(f'=== {s} ===')
        repair(s)
