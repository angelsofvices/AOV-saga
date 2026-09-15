#!/usr/bin/env python3
# ★★★★ v0.97.7 · NYMPHYSYL · chroma, damage, boxes and scale.
#
#   Creator, 2026-09-14: "fix the nymphysyl sprite. check chromakey and sizing"
#
# ★★★ WHAT WAS ACTUALLY WRONG, because the first two things I checked were fine:
#   · The chromakey is CLEAN — zero near-pure chroma survives. The 25,000
#     "magenta" pixels a naive scan finds are her own violet body, (147,22,164)
#     through (194,7,207), nowhere near the (250,3,250) key.
#   · The bboxes were EXACT — zero art lost on idle and sprint.
#   The real faults were one layer down:
#
#   1. ★★ KEYER DAMAGE INSIDE HER. She is a violet spirit keyed on magenta, so
#      the chroma test punched 272-745 speckles per sheet out of her body, hair
#      and VFX — 11,553 px in total. Same family as the Zoryn black-key
#      disaster: a creature whose palette overlaps the key.
#      ★ Repaired by asking the MASTER, not a size threshold: an enclosed
#        transparent pixel that was ART in the master is damage; one that was
#        CHROMA is genuine see-through, like the inside of her crescent swipe.
#
#   2. ★★★ SHE WAS BEING MEASURED BY HER TAIL. drawNPC scales a creature so its
#      tallest col-0 bbox is two tiles. Her hair trails 65px BELOW her body —
#      23% of the box — so she drew at 78% of her proper size and was the
#      SMALLEST thing on screen while being the T7 miniboss.
#      ★ scaleRefBh 222 is the body height with the tail excluded. The refBh
#        law, which this codebase has now had to state four times.
#
# ★ The ownership test below is the one that matters for the boxes: a frame's
#   box must contain its OWN component. Raw cell alpha is the wrong yardstick,
#   because the measurer deliberately trims edges holding a NEIGHBOUR's art —
#   I wrote a check against raw alpha first and it reported 6-13 bad frames per
#   sheet that were all correct.
import re, os, sys
import numpy as np
from PIL import Image
from collections import deque

C = 313
ENEM = 'assets/2D sprites/enemies'
ORIG = f'{ENEM}/_orig'
MIN_COMPONENT = 40
fails = 0

def ok(c, m):
    global fails
    print(('  ✅ ' if c else '  ❌ ') + m)
    if not c: fails += 1

def H(t): print('\n' + t)

src = open('rp7b.html', encoding='utf-8').read()

def art_block(name):
    i = src.index(f'const {name} = {{'); j = src.index('{', i); d = 0
    while True:
        if src[j] == '{': d += 1
        elif src[j] == '}': d -= 1
        j += 1
        if d == 0: break
    return src[i:j]

BLK = art_block('NYMPHYSYL_ART')

def banks():
    out = []
    for m in re.finditer(r"(\w+):\s*\n?\s*\{\s*src:\s*'([^']+)',[\s\S]*?bboxes:\s*\[([\s\S]*?)\n      \]", BLK):
        rows = re.findall(r'\[\s*(-?\d+),\s*(-?\d+),\s*(-?\d+),\s*(-?\d+)\]', m.group(3))
        out.append((m.group(1), os.path.basename(m.group(2)), [[int(v) for v in r] for r in rows]))
    return out

def owner_map(alpha):
    """label each pixel with the frame that OWNS it, by connected component
       centre of mass — the same rule tools/measure_attack_boxes.py uses."""
    Hh, W = alpha.shape
    mask = alpha > 8
    seen = np.zeros((Hh, W), bool)
    own = -np.ones((Hh, W), np.int16)
    ys, xs = np.nonzero(mask)
    for sy, sx in zip(ys, xs):
        if seen[sy, sx]: continue
        dq = deque([(sy, sx)]); seen[sy, sx] = True; px = []
        while dq:
            y, x = dq.popleft(); px.append((y, x))
            for dy, dx in ((-1,0),(1,0),(0,-1),(0,1),(-1,-1),(-1,1),(1,-1),(1,1)):
                ny, nx = y+dy, x+dx
                if 0 <= ny < Hh and 0 <= nx < W and not seen[ny, nx] and mask[ny, nx]:
                    seen[ny, nx] = True; dq.append((ny, nx))
        if len(px) < MIN_COMPONENT: continue
        cy = sum(p[0] for p in px)/len(px); cx = sum(p[1] for p in px)/len(px)
        oid = min(3, max(0, int(cy//C)))*4 + min(3, max(0, int(cx//C)))
        for y, x in px: own[y, x] = oid
    return own

def border_reachable(trans):
    h, w = trans.shape
    seen = np.zeros_like(trans); dq = deque()
    for x in range(w):
        for y in (0, h-1):
            if trans[y, x] and not seen[y, x]: seen[y, x] = True; dq.append((y, x))
    for y in range(h):
        for x in (0, w-1):
            if trans[y, x] and not seen[y, x]: seen[y, x] = True; dq.append((y, x))
    while dq:
        y, x = dq.popleft()
        for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
            ny, nx = y+dy, x+dx
            if 0 <= ny < h and 0 <= nx < w and trans[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True; dq.append((ny, nx))
    return seen

BK = banks()

H('★ ALL SEVEN BANKS ARE ON DISK AND MASTERED')
ok(len(BK) == 7, f'{len(BK)} banks parsed from NYMPHYSYL_ART')
for bank, fn, bb in BK:
    p = f'{ENEM}/{fn}'
    ok(os.path.exists(p) and os.path.exists(f'{ORIG}/{fn[:-4]}_master.png'),
       f'  {bank:<8} {fn} + master')
    ok(len(bb) == 16, f'  {bank:<8} 16 bboxes')

H('★★★ THE CHROMAKEY IS CLEAN · and her violets are not the key')
for bank, fn, bb in BK:
    a = np.array(Image.open(f'{ENEM}/{fn}').convert('RGBA'))
    r, g, b = a[...,0].astype(int), a[...,1].astype(int), a[...,2].astype(int)
    op = a[...,3] > 8
    pure = int(((r > 235) & (g < 60) & (b > 235) & op).sum())
    ok(pure == 0, f'  {bank:<8} {pure} near-pure chroma pixels surviving')

H('★★★★ NO KEYER DAMAGE LEFT INSIDE HER · the fault the Creator could see')
for bank, fn, bb in BK:
    k = np.array(Image.open(f'{ENEM}/{fn}').convert('RGBA'))
    m = np.array(Image.open(f'{ORIG}/{fn[:-4]}_master.png').convert('RGBA'))
    trans = k[...,3] <= 8
    enclosed = trans & ~border_reachable(trans)
    mr, mg, mb = m[...,0].astype(int), m[...,1].astype(int), m[...,2].astype(int)
    chroma = (mr > 225) & (mb > 225) & (mg < 90)
    damaged = int((enclosed & ~chroma).sum())
    seethru = int((enclosed & chroma).sum())
    ok(damaged == 0, f'  {bank:<8} {damaged} px of eaten art · {seethru} px correctly see-through')

H('★★ EVERY FRAME\'S BOX HOLDS ITS OWN COMPONENT')
# ★ against OWNERSHIP, not raw alpha. A box may legitimately exclude a
#   neighbour's overhang; it may never clip its own creature.
for bank, fn, bb in BK:
    a = np.array(Image.open(f'{ENEM}/{fn}').convert('RGBA'))[...,3]
    own = owner_map(a)
    worst = 0.0; worstpx = 0
    for k in range(16):
        r, c = divmod(k, 4)
        gx, gy, gw, gh = bb[k]
        mine = (own == k)
        tot = int(mine.sum())
        if not tot: continue
        box = np.zeros_like(mine)
        y0, x0 = r*C + gy, c*C + gx
        box[max(0,y0):y0+gh, max(0,x0):x0+gw] = True
        lost = int((mine & ~box).sum())
        if lost/tot > worst: worst, worstpx = lost/tot, lost
    # ★★ NOT zero — the measurer's own contract is MAX_OWN_LOSS = 3%. It
    #   deliberately gives up an edge strip that holds mostly a NEIGHBOUR's art,
    #   because a rectangle that reaches into the next frame draws that art
    #   twice: once at home and once as litter. ★ My first version of this
    #   assertion demanded 0 and flagged two frames that were behaving exactly
    #   as designed.
    ok(worst <= 0.03,
       f'  {bank:<8} worst frame gives up {worstpx} px = {100*worst:.1f}% of its own '
       f'(measurer cap 3%, traded to keep a neighbour out of the box)')

H('★★★★ SIZING · measured by her BODY, not her tail')
mref = re.search(r'scaleRefBh:\s*(\d+)', BLK)
ok(bool(mref), 'NYMPHYSYL_ART declares scaleRefBh')
if mref:
    ref = int(mref.group(1))
    a = np.array(Image.open(f'{ENEM}/nymphysyl-idle.png').convert('RGBA'))[...,3]
    bodies, sils = [], []
    for r in range(4):
        cell = a[r*C:(r+1)*C, 0:C] > 8
        ys, xs = np.nonzero(cell)
        y0, y1 = ys.min(), ys.max()
        w = np.array([len(np.nonzero(cell[y])[0]) for y in range(y0, y1+1)])
        end = max(i for i in range(len(w)) if w[i] >= 0.55*w.max())
        bodies.append(end+1); sils.append(int(y1-y0+1))
    ok(ref == max(bodies),
       f'★★★ scaleRefBh {ref} == measured col-0 body max {max(bodies)} (silhouette max {max(sils)})')
    ok(ref < max(sils), f'★★ and it is SMALLER than the silhouette — '
       f'{max(sils)-ref}px of trailing tail excluded, {100*(max(sils)-ref)/max(sils):.0f}% of the box')
    ok(abs(max(sils)/ref - 1.26) < 0.06,
       f'★ she now draws {max(sils)/ref:.2f}x larger than before · 2.0 tiles of BODY, not of body+tail')
    # the template must carry it onto the spawned body
    ok('scaleRefBh: A.scaleRefBh' in src,
       '★★★ and _rosterTemplateFor copies it onto every spawned body · '
       'a template that drops it re-introduces the tail bug')

print(f'\n{"❌ %d failed" % fails if fails else "✅ chroma clean · damage repaired · boxes own their art · sized by her body"}')
sys.exit(1 if fails else 0)
