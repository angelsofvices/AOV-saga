#!/usr/bin/env python3
"""Closed-loop head match for Rizer's WEAPON bundles, against his idle head.

★★★★ WHY THIS EXISTS. v0.99.3 anchored every unmeasured Rizer bank to idle's
head. It reached the banks in the RIZER table and MISSED the weapon bundles,
which are separate consts — RIZER_PEARLBOW, RIZER_EMERALD_AXE,
RIZER_RUBYPAW_SWORD. They fell to headScale 1.0 with nothing measured, and that
silently ENLARGED them: the pearlbow went from 76% of idle to 100%, a 32% jump,
which is the "rizer gets larger when he fires the pearlbow" the Creator saw.

★★★ Same method as tools/measure_rizer_head.py: template-match idle's head into
the target at its DRAWN scale and read the residual. 1.00 means the two heads
already match on screen. Iterate `scale x= residual` once and the side rows
converge. LEFT/RIGHT only — the front and back rows carry a systematic bias on
every bank because the head is half-hidden by its own hair.
"""
import json, sys
import numpy as np
from PIL import Image

CELL = 313
banks = json.load(open('/tmp/banks.json'))
IDLE_BODY = [181, 160, 159, 166]
TARGET = 92.92
HEAD = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}

def idle_scale(r): return TARGET / IDLE_BODY[r]

_I = {}
def img(p):
    if p not in _I: _I[p] = np.array(Image.open(p).convert('RGBA'))
    return _I[p]

def cell(b, r, c):
    a = img(b['path']); bx, by, bw, bh = b['bboxes'][r][c]
    y0 = r*CELL + by; x0 = c*CELL + bx; H, W = a.shape[:2]
    return (a[max(0,y0):min(H,y0+bh), max(0,x0):min(W,x0+bw), 3] > 20).astype(np.float32)

def crop(m):
    ys, xs = np.nonzero(m)
    return m[ys.min():ys.max()+1, xs.min():xs.max()+1] if len(ys) else m

def rs(m, s):
    h, w = m.shape
    return np.array(Image.fromarray((m*255).astype(np.uint8))
        .resize((max(4,int(round(w*s))), max(4,int(round(h*s)))), Image.BILINEAR), np.float32)/255

def score(tpl, t, s, jit=7):
    r_ = rs(t, s); th, tw = tpl.shape; bh, bw = r_.shape
    if bh < th: r_ = np.vstack([r_, np.zeros((th-bh, bw), np.float32)]); bh = th
    best = 0.0; cx = (bw - tw)//2
    for dx in range(cx-jit, cx+jit+1):
        x0 = max(0, dx); x1 = min(bw, dx+tw)
        if x1-x0 < tw*0.6: continue
        w = np.zeros_like(tpl); w[:, x0-dx:x1-dx] = r_[:th, x0:x1]
        inter = float((w*tpl).sum()); u = float(w.sum()+tpl.sum()-inter)
        if u > 0 and inter/u > best: best = inter/u
    return best

def match(tpl, t):
    best = (0.0, 1.0)
    for s in np.linspace(0.70, 1.60, 91):
        q = score(tpl, t, s)
        if q > best[0]: best = (q, float(s))
    return best

names = [n for n in banks if n != 'idle']
print(f'{"bundle":<16}{"LEFT":>14}{"RIGHT":>14}   residual (1.00 = matches idle on screen)')
for name in names:
    b = banks[name]; row = f'{name:<16}'
    vals = []
    for r in (1, 2):
        it = rs(crop(cell(banks['idle'], r, 0)), idle_scale(r))
        tpl = it[:max(8, int(it.shape[0]*0.34))]
        t = rs(crop(cell(b, r, 0)), idle_scale(r) * HEAD.get(name, 1.0))
        q, s = match(tpl, t)
        vals.append(s); row += f'{s:>9.3f}/{q:<4.2f}'
    med = float(np.median(vals))
    cur = HEAD.get(name, 1.0)
    print(row + f'   → headScale {cur*med:.3f}')
