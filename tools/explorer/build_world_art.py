#!/usr/bin/env python3
"""Build the native world art for Aethryx Adventures: 1936 into explorer/world_art.js.

Every environment (the 27 worlds and the ten districts of Zyraxis) gets its own
pixel art in the game's existing style (16-pixel tiles, a dark outline, light
from the upper left, soft ramps):
  * tiles: two ground textures, a path, a cliff wall, a two-frame liquid and a
    special ground, each drawn from that world's Codex terrain;
  * props: every prop the environment names, drawn as its own shape (not a
    recolour), plus an extra prop of its own;
  * a mineral outcrop and a record-stone style.
Shared sprites: landmark kinds (region stones, sites, shrines, Gemlord caves,
prisms, temples, monuments) and item icons for the inventory.

Colours come from each environment's palette (explorer/environments.js) so every
world keeps its identity. Everything is pixel data, nothing is a PNG.
Run: python3 tools/explorer/build_world_art.py   (writes a preview sheet with --preview)
"""
import colorsys, json, math, os, random, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P = lambda *a: os.path.join(ROOT, *a)

envjs = open(P('explorer/environments.js'), encoding='utf-8').read()
arr = envjs[envjs.index('window.AOV_ENV = ') + 17:]; arr = arr[:arr.index('\n];') + 2]
ENVS = {e['id']: e for e in json.loads(arr)}
OUTLINE = '#1c1626'

# ── colour ──
def hx(c): c = c.lstrip('#'); return tuple(int(c[i:i + 2], 16) / 255 for i in (0, 2, 4))
def tohex(t): return '#' + ''.join('%02x' % max(0, min(255, round(v * 255))) for v in t)
def mix(a, b, k): a, b = hx(a), hx(b); return tohex(tuple(a[i] + (b[i] - a[i]) * k for i in range(3)))
def shift(c, dl=0.0, ds=0.0, dh=0.0):
    h, l, s = colorsys.rgb_to_hls(*hx(c))
    return tohex(colorsys.hls_to_rgb((h + dh) % 1, max(0, min(1, l + dl)), max(0, min(1, s + ds))))
def ramp(base, warm=True):
    """five steps, dark to light; shadows lean cool, highlights lean warm (the pixel-art way).
    A very pale or very dark base is pulled into the readable middle so the ramp keeps its contrast."""
    d = -0.02 if warm else 0.02
    h, l, sat = colorsys.rgb_to_hls(*hx(base))
    if l > .8: base = shift(base, .8 - l)
    elif l < .2: base = shift(base, .2 - l, .04)
    return [shift(base, -0.2, 0.05, -d * 2), shift(base, -0.1, 0.03, -d), base, shift(base, 0.09, -0.02, d), shift(base, 0.18, -0.06, d * 2)]
def lum(c): r, g, b = hx(c); return 0.3 * r + 0.59 * g + 0.11 * b

# ── a pixel grid ──
class G:
    def __init__(s, w=16, h=16, fill='.'): s.w, s.h = w, h; s.g = [[fill] * w for _ in range(h)]
    def px(s, x, y, c, wrap=False):
        if wrap: x %= s.w; y %= s.h
        if 0 <= x < s.w and 0 <= y < s.h: s.g[y][x] = c
    def get(s, x, y, wrap=False):
        if wrap: x %= s.w; y %= s.h
        return s.g[y][x] if 0 <= x < s.w and 0 <= y < s.h else '.'
    def rect(s, x, y, w, h, c):
        for j in range(y, y + h):
            for i in range(x, x + w): s.px(i, j, c)
    def line(s, x0, y0, x1, y1, c, wrap=False):
        n = max(abs(x1 - x0), abs(y1 - y0), 1)
        for t in range(n + 1): s.px(round(x0 + (x1 - x0) * t / n), round(y0 + (y1 - y0) * t / n), c, wrap)
    def ell(s, cx, cy, rx, ry, c):
        for y in range(s.h):
            for x in range(s.w):
                if ((x - cx) / max(rx, .5)) ** 2 + ((y - cy) / max(ry, .5)) ** 2 <= 1: s.g[y][x] = c
    def poly(s, pts, c):
        ys = [p[1] for p in pts]
        for y in range(max(0, int(min(ys))), min(s.h, int(max(ys)) + 1)):
            xs = []
            for i in range(len(pts)):
                (x0, y0), (x1, y1) = pts[i], pts[(i + 1) % len(pts)]
                if (y0 <= y + .5 < y1) or (y1 <= y + .5 < y0): xs.append(x0 + (y + .5 - y0) * (x1 - x0) / (y1 - y0))
            xs.sort()
            for a, b in zip(xs[::2], xs[1::2]):
                for x in range(int(math.ceil(a - .5)), int(math.floor(b - .5)) + 1): s.px(x, y, c)
    def outline(s, c='k'):
        o = [r[:] for r in s.g]
        for y in range(s.h):
            for x in range(s.w):
                if s.g[y][x] == '.' and any(s.get(x + dx, y + dy) not in ('.', c) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))): o[y][x] = c
        s.g = o
    def light(s, base, lit, dark, deep=None):
        """light from the upper left: cells of `base` at the top/left of a shape go `lit`, bottom/right go `dark`"""
        o = [r[:] for r in s.g]
        for y in range(s.h):
            for x in range(s.w):
                if s.g[y][x] != base: continue
                up, lf, dn, rt = s.get(x, y - 1), s.get(x - 1, y), s.get(x, y + 1), s.get(x + 1, y)
                if up in ('.', 'k') or lf in ('.', 'k'): o[y][x] = lit
                elif dn in ('.', 'k') or rt in ('.', 'k'): o[y][x] = dark
                elif deep and (s.get(x + 1, y + 1) in ('.', 'k')): o[y][x] = deep
        s.g = o
    def rows(s): return [''.join(r) for r in s.g]

def sprite(g, pal): return {'rows': g.rows(), 'pal': dict(pal, k=OUTLINE)}

# ── tile textures (16 × 16, seamless: features wrap) ──
def tex_base(r, pal_c='c'): g = G(fill=pal_c); return g
def dither(g, r, ch, n):
    for _ in range(n): g.px(r.randrange(16), r.randrange(16), ch)

def t_meadow(r, flowers=True):
    g = tex_base(r)
    for _ in range(14):
        x, y = r.randrange(16), r.randrange(16)
        g.px(x, y, 'b', True); g.px(x, y - 1, 'd', True)
        if r.random() < .5: g.px(x + 1, y, 'b', True)
    for _ in range(10): g.px(r.randrange(16), r.randrange(16), 'd')
    for _ in range(4): g.px(r.randrange(16), r.randrange(16), 'a')
    if flowers and r.random() < .7:
        x, y = r.randrange(16), r.randrange(16)
        for dx, dy in ((0, -1), (-1, 0), (1, 0), (0, 1)): g.px(x + dx, y + dy, 'f', True)
        g.px(x, y, 'e', True)
    return g
def t_crystal(r):
    g = tex_base(r)
    for k in range(-16, 32, 6 + r.randrange(3)):
        for i in range(16): g.px(i, (k + i) % 16, 'b'); g.px(i, (k + i + 1) % 16, 'd') if r.random() < .5 else None
    for k in range(0, 32, 9):
        for i in range(16): g.px(i, (k - i) % 16, 'b') if r.random() < .8 else None
    for _ in range(5): x, y = r.randrange(16), r.randrange(16); g.px(x, y, 'e'); g.px(x + 1, y, 'd', True)
    return g
def t_sand(r):
    g = tex_base(r); ph = r.random() * 6
    for band in range(0, 16, 4):
        for x in range(16):
            y = band + round(1.2 * math.sin((x + ph) / 16 * 2 * math.pi * 2))
            g.px(x, y, 'b', True); g.px(x, y - 1, 'd', True)
    dither(g, r, 'e', 4); dither(g, r, 'a', 3)
    return g
def t_ash(r):
    g = tex_base(r); dither(g, r, 'b', 30); dither(g, r, 'a', 10); dither(g, r, 'd', 8)
    for _ in range(3): x, y = r.randrange(16), r.randrange(16); g.px(x, y, 'f'); g.px(x + 1, y, 'g', True)
    return g
def t_plates(r, seam='b', glow=None):
    g = tex_base(r)
    # irregular cracked plates: a few wobbling seams across and down
    for _ in range(2):
        y = r.randrange(16)
        for x in range(16): y += r.choice((-1, 0, 0, 1)); g.px(x, y, seam, True); g.px(x, y + 1, 'd', True) if r.random() < .4 else None
    for _ in range(2):
        x = r.randrange(16)
        for y in range(16): x += r.choice((-1, 0, 0, 1)); g.px(x, y, seam, True)
    if glow:
        for y in range(16):
            for x in range(16):
                if g.g[y][x] == seam and r.random() < .5: g.g[y][x] = glow
    dither(g, r, 'd', 6); dither(g, r, 'a', 4)
    return g
def t_ice(r):
    g = tex_base(r)
    for y in range(16):
        for x in range(16):
            if (x + y) % 11 in (0, 1) and r.random() < .7: g.g[y][x] = 'd'
    x, y = r.randrange(16), r.randrange(16)
    for _ in range(10): g.px(x, y, 'b', True); x += r.choice((1, 1, 0)); y += r.choice((1, 0, -1))
    dither(g, r, 'e', 5)
    return g
def t_roots(r):
    g = tex_base(r)
    for _ in range(3):
        x, y = r.randrange(16), r.randrange(16)
        for _ in range(14):
            g.px(x, y, 'b', True); g.px(x, y - 1, 'd', True) if r.random() < .3 else None
            x += r.choice((1, 1, 0)); y += r.choice((-1, 0, 0, 1))
    dither(g, r, 'a', 6); dither(g, r, 'f', 2)
    return g
def t_grid(r, cell=8):
    g = tex_base(r)
    for i in range(16):
        g.px(i, 0, 'b'); g.px(0, i, 'b'); g.px(i, cell, 'b'); g.px(cell, i, 'b')
        g.px(i, 1, 'd'); g.px(1, i, 'd')
    for x, y in ((0, 0), (cell, 0), (0, cell), (cell, cell)): g.px(x, y, 'e')
    dither(g, r, 'a', 3)
    return g
def t_paving(r, size=8, vein=True):
    g = tex_base(r)
    for y in range(16):
        off = (size // 2) if (y // size) % 2 else 0
        for x in range(16):
            if y % size == 0: g.g[y][x] = 'b'
            elif (x + off) % size == 0: g.g[y][x] = 'b'
            elif y % size == 1 or (x + off) % size == 1: g.g[y][x] = 'd'
    if vein:
        x, y = r.randrange(16), r.randrange(16)
        for _ in range(7): g.px(x, y, 'e' if r.random() < .5 else 'd', True); x += 1; y += r.choice((0, 1))
    dither(g, r, 'a', 2)
    return g
def t_mud(r):
    g = tex_base(r)
    for _ in range(6):
        cx, cy, rr = r.randrange(16), r.randrange(16), r.randrange(1, 3)
        for y in range(-rr, rr + 1):
            for x in range(-rr - 1, rr + 2):
                if x * x / 2 + y * y <= rr * rr: g.px(cx + x, cy + y, 'b', True)
        g.px(cx - 1, cy - rr, 'd', True)
    dither(g, r, 'a', 6)
    return g
def t_snow(r):
    g = tex_base(r); dither(g, r, 'd', 14); dither(g, r, 'e', 8); dither(g, r, 'b', 5)
    for _ in range(2):
        x, y = r.randrange(16), r.randrange(16)
        g.px(x, y, 'b', True); g.px(x + 1, y, 'b', True); g.px(x, y + 1, 'a', True)
    return g
def t_shadow(r):
    g = tex_base(r)
    for y in range(16):
        for x in range(16):
            if (x * 3 + y * 5) % 7 == 0 and r.random() < .6: g.g[y][x] = 'b'
    dither(g, r, 'd', 4); dither(g, r, 'a', 8)
    return g
def t_flag(r):
    g = tex_base(r)
    for y in range(16):
        for x in range(16):
            if y in (0, 7) or (x == (3 if y < 7 else 10)) or (x == (12 if y < 7 else 1)): g.g[y][x] = 'b'
    for _ in range(2):
        x, y = r.randrange(16), r.randrange(16)
        for _ in range(5): g.px(x, y, 'a', True); x += 1; y += r.choice((0, 1, -1))
    dither(g, r, 'd', 8)
    return g
def t_strata(r):
    g = tex_base(r); order = ['b', 'c', 'd', 'c', 'a', 'c', 'd', 'b']
    y = 0
    for i, c in enumerate(order):
        h = 2
        for yy in range(y, y + h):
            for x in range(16): g.px(x, yy, c if (x + i) % 9 else 'e', True)
        y += h
    return g
def t_litter(r):
    g = tex_base(r)
    for _ in range(12):
        x, y, c = r.randrange(16), r.randrange(16), r.choice(('b', 'd', 'f', 'g'))
        g.px(x, y, c, True); g.px(x + 1, y, c, True); g.px(x, y + 1, 'a', True)
    return g
def t_flesh(r):
    g = tex_base(r)
    for _ in range(3):
        x, y = r.randrange(16), r.randrange(16)
        for _ in range(16): g.px(x, y, 'f', True); x += r.choice((1, 1, 0, -1)); y += r.choice((1, 0, 0, -1))
    for _ in range(5):
        cx, cy = r.randrange(16), r.randrange(16); g.px(cx, cy, 'b', True); g.px(cx + 1, cy, 'b', True); g.px(cx, cy - 1, 'd', True)
    return g
def t_soft(r):
    g = tex_base(r)
    for y in range(16):
        for x in range(16):
            v = math.sin(x / 2.5) + math.cos(y / 3.1)
            if v > 1.2: g.g[y][x] = 'd'
            elif v < -1.3 and (x + y) % 2: g.g[y][x] = 'b'
    dither(g, r, 'e', 3)
    return g
def t_reefsand(r):
    g = t_sand(r)
    for _ in range(3):
        x, y = r.randrange(16), r.randrange(16); g.px(x, y, 'f', True); g.px(x + 1, y, 'g', True); g.px(x, y + 1, 'a', True)
    return g
def t_rings(r):
    g = tex_base(r); cx, cy = r.randrange(16), r.randrange(16)
    for y in range(16):
        for x in range(16):
            dx, dy = min(abs(x - cx), 16 - abs(x - cx)), min(abs(y - cy), 16 - abs(y - cy))
            d = math.hypot(dx, dy)
            if abs(d - 4) < .5 or abs(d - 8) < .5: g.g[y][x] = 'b'
            elif abs(d - 4.9) < .45 or abs(d - 8.9) < .45: g.g[y][x] = 'd'
    return g
def t_metal(r):
    g = tex_base(r)
    for i in range(16): g.px(i, 0, 'a'); g.px(0, i, 'a'); g.px(i, 1, 'd'); g.px(1, i, 'd'); g.px(i, 8, 'b'); g.px(8, i, 'b')
    for x, y in ((3, 3), (12, 3), (3, 12), (12, 12)): g.px(x, y, 'e'); g.px(x + 1, y + 1, 'a')
    for _ in range(4): x, y = r.randrange(16), r.randrange(16); g.px(x, y, 'f')
    return g
def t_cloud(r):
    g = tex_base(r)
    for _ in range(5):
        cx, cy, rr = r.randrange(16), r.randrange(16), r.randrange(2, 4)
        for y in range(-rr, rr + 1):
            for x in range(-rr, rr + 1):
                if x * x + y * y <= rr * rr: g.px(cx + x, cy + y, 'd' if y < 0 else 'c', True)
        g.px(cx - 1, cy - rr, 'e', True)
    dither(g, r, 'b', 4)
    return g
def t_gravel(r):
    g = tex_base(r)
    for _ in range(18):
        x, y = r.randrange(16), r.randrange(16); g.px(x, y, 'd', True); g.px(x + 1, y + 1, 'a', True)
    return g
TEX = {'meadow': t_meadow, 'meadow0': lambda r: t_meadow(r, False), 'crystal': t_crystal, 'sand': t_sand, 'ash': t_ash,
       'basalt': lambda r: t_plates(r), 'lava': lambda r: t_plates(r, 'b', 'f'), 'ice': t_ice, 'roots': t_roots, 'grid': t_grid,
       'grid4': lambda r: t_grid(r, 4), 'paving': t_paving, 'cobble': lambda r: t_paving(r, 4, False), 'mud': t_mud, 'snow': t_snow,
       'shadow': t_shadow, 'flag': t_flag, 'strata': t_strata, 'litter': t_litter, 'flesh': t_flesh, 'soft': t_soft,
       'reefsand': t_reefsand, 'rings': t_rings, 'metal': t_metal, 'cloud': t_cloud, 'gravel': t_gravel}

# paths
def p_dirt(r):
    g = tex_base(r); dither(g, r, 'b', 14); dither(g, r, 'd', 10); dither(g, r, 'a', 4)
    for _ in range(2): x, y = r.randrange(16), r.randrange(16); g.px(x, y, 'e'); g.px(x + 1, y + 1, 'b', True)
    return g
def p_planks(r):
    g = tex_base(r)
    for y in range(16):
        for x in range(16):
            if y % 4 == 0: g.g[y][x] = 'a'
            elif y % 4 == 1: g.g[y][x] = 'd'
            elif (x + (y // 4) * 5) % 8 == 0: g.g[y][x] = 'b'
    for y in range(2, 16, 4): g.px(3 + (y * 3) % 9, y, 'e')
    return g
def p_rail(r):
    g = p_dirt(r)
    for y in range(0, 16, 4):
        for x in range(1, 15): g.px(x, y, 'b'); g.px(x, y + 1, 'a')
    for y in range(16): g.px(4, y, 'e'); g.px(11, y, 'e'); g.px(5, y, 'a'); g.px(12, y, 'a')
    return g
def p_glow(r):
    g = t_paving(r, 8, False)
    for i in range(16): g.px(i, 4, 'f') if i % 2 else None; g.px(i, 12, 'f') if i % 2 == 0 else None
    return g
PATH = {'dirt': p_dirt, 'planks': p_planks, 'rail': p_rail, 'glow': p_glow, 'flag': t_flag, 'cobble': lambda r: t_paving(r, 4, False),
        'paving': t_paving, 'grid': t_grid, 'sand': t_sand, 'ice': t_ice, 'metal': t_metal}

# walls: a cliff face with ledges, lit from the top
def w_cliff(r, style='rock'):
    g = tex_base(r)
    for y in range(16):
        for x in range(16):
            if style == 'columns':
                g.g[y][x] = 'd' if x % 4 == 0 else 'a' if x % 4 == 3 else 'c'
            elif style == 'crystal':
                g.g[y][x] = 'e' if (x + y) % 7 == 0 else 'd' if (x - y) % 7 == 0 else 'b' if (x * 2 + y) % 9 == 0 else 'c'
            elif style == 'blocks':
                off = 4 if (y // 4) % 2 else 0
                g.g[y][x] = 'a' if y % 4 == 3 or (x + off) % 8 == 7 else 'd' if y % 4 == 0 else 'c'
    if style == 'rock':
        for _ in range(3):
            y = r.randrange(16)
            for x in range(16): y2 = y + (1 if r.random() < .2 else 0); g.px(x, y2, 'a', True); g.px(x, y2 - 1, 'd', True)
        for _ in range(4): x, y = r.randrange(16), r.randrange(16); g.px(x, y, 'b'); g.px(x, y + 1, 'a', True)
    if style in ('roots', 'flesh', 'coral'):
        for _ in range(4):
            x, y = r.randrange(16), 0
            for _ in range(18): g.px(x, y, 'f' if style == 'flesh' else 'b', True); g.px(x + 1, y, 'd', True); x += r.choice((-1, 0, 1)); y += 1
    if style == 'hive':
        for y in range(16):
            for x in range(16):
                if (y % 6 == 0 and (x // 4) % 2 == 0) or (y % 6 == 3 and (x // 4) % 2 == 1) or (x % 4 == 0 and ((y // 3) % 2 == (x // 4) % 2)): g.g[y][x] = 'a'
    for x in range(16): g.px(x, 0, 'e') if r.random() < .6 else None
    return g
WALL = {k: (lambda s: (lambda r: w_cliff(r, s)))(k) for k in ('rock', 'columns', 'crystal', 'blocks', 'roots', 'flesh', 'coral', 'hive')}

# liquids, two frames
def l_water(r, frame, glow=False):
    g = tex_base(r); rr = random.Random(r.random())
    for k in range(5):
        x, y = rr.randrange(16), rr.randrange(16)
        x = (x + frame * 3) % 16
        for i in range(3): g.px(x + i, y, 'e' if i == 1 else 'd', True)
    for y in range(16):
        for x in range(16):
            if (x + y * 2 + frame * 2) % 13 == 0: g.g[y][x] = 'b'
    if glow: dither(g, rr, 'f', 3)
    return g
def l_lava(r, frame):
    g = tex_base(r); rr = random.Random(r.random())
    for y in range(16):
        for x in range(16):
            v = math.sin((x + frame * 2) / 2.3) + math.cos((y - frame) / 2.7)
            g.g[y][x] = 'e' if v > 1.4 else 'd' if v > .7 else 'b' if v < -1 else 'c'
    for _ in range(2): x, y = rr.randrange(16), rr.randrange(16); g.px(x, y, 'a'); g.px(x + 1, y, 'a', True)
    return g
def l_cloud(r, frame):
    g = t_cloud(random.Random(r.random() + frame))
    return g
def l_void(r, frame):
    g = tex_base(r); rr = random.Random(r.random())
    for _ in range(6): x, y = rr.randrange(16), rr.randrange(16); g.px((x + frame) % 16, y, 'e')
    for y in range(16):
        for x in range(16):
            if (x * y + frame) % 17 == 0: g.g[y][x] = 'b'
    return g
LIQ = {'water': l_water, 'glow': lambda r, f: l_water(r, f, True), 'lava': l_lava, 'cloud': l_cloud, 'void': l_void}

# ── props (bottom-centred) ──
def outlined(g, base_ramp_letters=None): g.outline(); return g
def pr_tree(r, kind='round'):
    g = G(16, 24)
    g.rect(7, 15, 2, 8, 'b'); g.px(6, 22, 'b'); g.px(9, 22, 'b'); g.px(7, 15, 'a')
    if kind == 'round':
        g.ell(7.5, 8, 7, 6.5, 'c'); g.ell(6, 6, 4, 3.5, 'd'); g.ell(5, 5, 1.5, 1.2, 'e')
        for _ in range(6): g.px(r.randrange(3, 13), r.randrange(4, 14), 'f')
        g.ell(10, 11, 3, 2.5, 'a') if r.random() < .8 else None
    elif kind == 'pine':
        for i, w in enumerate((1, 2, 3, 4, 3, 4, 5, 6, 5, 6, 7, 7)):
            g.hl = None
            for x in range(8 - w, 8 + w): g.px(x, 3 + i, 'c' if x < 8 else 'a')
        g.px(7, 2, 'd'); g.px(8, 2, 'c')
    elif kind == 'mushroom':
        g.rect(6, 12, 4, 11, 'e'); g.px(9, 13, 'd'); g.ell(7.5, 9, 7, 4, 'f'); g.ell(6, 8, 3, 1.5, 'g')
        for x in (4, 8, 11): g.px(x, 9, 'e')
    elif kind == 'giant':
        g.rect(5, 12, 6, 11, 'b'); g.rect(5, 12, 2, 11, 'd'); g.px(4, 22, 'b'); g.px(11, 22, 'b'); g.px(3, 23, 'b'); g.px(12, 23, 'b')
        g.ell(7.5, 6, 7.5, 6, 'c'); g.ell(5.5, 4, 3.5, 2.5, 'd'); g.ell(11, 9, 3, 2, 'a')
    elif kind == 'palm':
        for i in range(10): g.px(8 + (i // 4), 22 - i, 'b'); g.px(7 + (i // 4), 22 - i, 'd')
        for dx in (-6, -3, 3, 6):
            for i in range(4): g.px(10 + dx // 2 + (i if dx > 0 else -i), 11 + i // 2 + abs(dx) // 3, 'c')
        g.ell(10, 11, 2, 1, 'f')
    elif kind == 'willow':
        g.ell(7.5, 8, 7, 6, 'c'); g.ell(6, 6, 3, 2, 'd')
        for x in range(2, 14, 2): g.line(x, 9, x + 1, 15, 'a')
    g.outline(); return g
def pr_shrub(r, kind='bush'):
    g = G(16, 16)
    if kind == 'bush':
        g.ell(7.5, 10, 6.5, 4.5, 'c'); g.ell(5, 9, 3, 2, 'd'); g.px(4, 8, 'e')
        for _ in range(4): g.px(r.randrange(3, 13), r.randrange(8, 14), 'f')
    elif kind == 'fern':
        for dx in range(-6, 7, 3):
            g.line(8, 14, 8 + dx, 7 + abs(dx) // 2, 'c'); g.line(8, 14, 8 + dx + (1 if dx >= 0 else -1), 8 + abs(dx) // 2, 'd')
    elif kind == 'kelp':
        for k, x0 in enumerate((5, 8, 11)):
            for y in range(4 + k, 15): g.px(x0 + round(math.sin(y / 2 + k)), y, 'c'); g.px(x0 + 1 + round(math.sin(y / 2 + k)), y, 'a')
            g.px(x0, 4 + k, 'f')
    elif kind == 'coral':
        g.line(8, 14, 8, 6, 'f'); g.line(8, 10, 4, 6, 'f'); g.line(8, 9, 12, 5, 'f'); g.line(4, 6, 3, 4, 'g'); g.line(12, 5, 13, 3, 'g')
        g.line(9, 14, 9, 7, 'c'); g.px(8, 5, 'g')
    elif kind == 'crystals':
        g.poly([(4, 15), (5, 7), (7, 15)], 'c'); g.poly([(7, 15), (9, 3), (11, 15)], 'd'); g.poly([(10, 15), (12, 8), (13, 15)], 'c')
        g.line(9, 4, 9, 13, 'e'); g.px(5, 8, 'e')
    elif kind == 'thorn':
        for dx in (-5, -2, 2, 5): g.line(8, 15, 8 + dx, 6 + abs(dx) // 2, 'b')
        for _ in range(6): g.px(r.randrange(3, 13), r.randrange(6, 14), 'f')
    elif kind == 'reeds':
        for x in range(3, 14, 2): h = r.randrange(5, 10); g.line(x, 15, x + (1 if x % 4 == 1 else 0), 15 - h, 'c'); g.px(x, 15 - h, 'f')
    g.outline(); return g
def pr_spire(r, kind='crystal'):
    g = G(16, 24)
    if kind == 'crystal':
        g.poly([(4, 23), (8, 2), (12, 23)], 'c'); g.poly([(8, 2), (12, 23), (9, 23)], 'a'); g.line(7, 6, 6, 20, 'e'); g.poly([(1, 23), (3, 14), (5, 23)], 'd'); g.poly([(11, 23), (13, 16), (15, 23)], 'b')
    elif kind == 'needle':
        g.poly([(5, 23), (8, 1), (11, 23)], 'c'); g.line(8, 3, 7, 22, 'd'); g.line(9, 6, 10, 22, 'a')
        for y in (8, 14, 19): g.line(6, y, 10, y - 1, 'b')
    elif kind == 'shard':
        g.poly([(3, 23), (6, 6), (10, 2), (12, 12), (13, 23)], 'c'); g.line(6, 7, 9, 3, 'e'); g.poly([(9, 23), (12, 12), (13, 23)], 'a'); g.px(8, 12, 'f'); g.px(9, 13, 'f')
    elif kind == 'ice':
        g.poly([(5, 23), (7, 4), (9, 23)], 'd'); g.poly([(8, 23), (11, 9), (13, 23)], 'c'); g.poly([(2, 23), (4, 15), (6, 23)], 'c'); g.line(7, 6, 7, 20, 'e')
    elif kind == 'eye':
        g.rect(7, 10, 2, 13, 'b'); g.ell(7.5, 6, 5, 4, 'e'); g.ell(7.5, 6, 2.5, 2.5, 'f'); g.ell(7.5, 6, 1, 1, 'k'); g.px(6, 5, 'e')
    elif kind == 'hourglass':
        g.rect(4, 2, 8, 2, 'b'); g.rect(4, 21, 8, 2, 'b'); g.poly([(5, 4), (11, 4), (8, 12)], 'c'); g.poly([(8, 12), (5, 21), (11, 21)], 'c')
        g.poly([(7, 16), (9, 16), (10, 20), (6, 20)], 'f'); g.line(8, 12, 8, 16, 'f'); g.line(4, 4, 4, 21, 'a'); g.line(11, 4, 11, 21, 'a')
    elif kind == 'note':
        g.rect(9, 4, 2, 15, 'c'); g.ell(7, 19, 3, 2.5, 'c'); g.poly([(10, 4), (14, 7), (14, 9), (10, 7)], 'c'); g.ell(6, 18.5, 1, .8, 'e')
    g.outline(); return g
def pr_pillar(r, kind='column'):
    g = G(16, 24)
    if kind == 'column':
        g.rect(5, 3, 6, 18, 'c'); g.rect(4, 2, 8, 2, 'd'); g.rect(4, 21, 8, 2, 'b')
        for x in (6, 8): g.line(x, 4, x, 20, 'd')
        g.line(10, 4, 10, 20, 'a')
        if r.random() < .6: g.rect(5, 2, 3, 2, '.'); g.px(9, 9, 'a'); g.px(8, 10, 'a')
    elif kind == 'obelisk':
        g.poly([(5, 22), (6, 4), (8, 1), (10, 4), (11, 22)], 'c'); g.line(7, 4, 6, 21, 'd'); g.line(10, 5, 10, 21, 'a')
        for y in (8, 12, 16): g.px(8, y, 'f'); g.px(8, y + 1, 'g')
        g.rect(4, 22, 8, 1, 'b')
    elif kind == 'statue':
        g.rect(4, 19, 8, 4, 'b'); g.ell(7.5, 5, 2, 2, 'c'); g.rect(6, 7, 4, 7, 'c'); g.rect(5, 8, 1, 5, 'c'); g.rect(10, 8, 1, 5, 'c'); g.rect(6, 14, 1, 5, 'c'); g.rect(9, 14, 1, 5, 'c')
        g.line(6, 7, 6, 18, 'd'); g.line(9, 8, 9, 18, 'a')
    elif kind == 'banner':
        g.line(4, 1, 4, 22, 'b'); g.poly([(5, 2), (13, 2), (13, 12), (9, 10), (5, 12)], 'f'); g.line(5, 3, 12, 3, 'g'); g.ell(9, 6, 1.5, 1.5, 'e')
        g.rect(3, 22, 3, 1, 'a')
    elif kind == 'palisade':
        for x in (2, 5, 8, 11):
            g.rect(x, 6 + (x % 3), 3, 17 - (x % 3), 'b'); g.poly([(x, 6 + (x % 3)), (x + 1, 3 + (x % 3)), (x + 3, 6 + (x % 3))], 'b'); g.line(x, 7, x, 22, 'd')
        g.line(1, 12, 14, 12, 'a')
    elif kind == 'strata':
        for i, y in enumerate(range(5, 23, 3)): g.rect(4 - (i % 2), y, 9 + (i % 3), 3, 'cdbca'[i % 5])
    elif kind == 'tuning':
        g.rect(6, 4, 4, 18, 'c'); g.rect(4, 3, 2, 10, 'd'); g.rect(10, 3, 2, 10, 'a'); g.rect(4, 21, 8, 2, 'b')
        for y in (5, 9): g.px(3, y, 'f'); g.px(12, y, 'f')
    elif kind == 'basalt':
        for x, h in ((3, 12), (6, 17), (9, 14), (12, 9)): g.rect(x, 23 - h, 3, h, 'c'); g.line(x, 23 - h, x + 2, 23 - h, 'd'); g.line(x + 2, 24 - h, x + 2, 22, 'a')
    elif kind == 'arch':
        g.rect(2, 8, 3, 15, 'c'); g.rect(11, 8, 3, 15, 'c'); g.ell(7.5, 8, 6, 5, 'c'); g.ell(7.5, 9, 3, 3.5, '.'); g.rect(5, 9, 6, 14, '.')
        g.line(2, 9, 2, 22, 'd'); g.line(13, 9, 13, 22, 'a')
    g.outline(); return g
def pr_deadtree(r, kind='bare'):
    g = G(16, 24)
    g.line(8, 23, 8, 6, 'b'); g.line(7, 23, 7, 9, 'd')
    if kind == 'bare':
        g.line(8, 12, 3, 6, 'b'); g.line(8, 9, 13, 4, 'b'); g.line(4, 7, 2, 3, 'b'); g.line(12, 5, 14, 2, 'b'); g.line(8, 6, 9, 2, 'b')
    elif kind == 'bone':
        g.g = G(16, 24).g
        for i, y in enumerate(range(8, 20, 3)): g.line(4, y, 12, y, 'e'); g.px(3, y + 1, 'd'); g.px(12, y + 1, 'd')
        g.line(8, 6, 8, 22, 'e'); g.ell(8, 5, 2, 2, 'e'); g.px(7, 5, 'k'); g.px(9, 5, 'k')
    elif kind == 'wind':
        g.line(8, 12, 14, 9, 'b'); g.line(8, 9, 15, 6, 'b'); g.line(8, 15, 13, 13, 'b'); g.line(8, 6, 12, 3, 'b')
    elif kind == 'frost':
        g.line(8, 12, 3, 6, 'b'); g.line(8, 9, 13, 4, 'b')
        for x, y in ((3, 6), (13, 4), (8, 6), (5, 9)): g.px(x, y - 1, 'e'); g.px(x + 1, y - 1, 'e')
    elif kind == 'spirit':
        g.line(8, 12, 3, 6, 'b'); g.line(8, 9, 13, 4, 'b')
        for x, y in ((3, 5), (13, 3)): g.ell(x, y, 1.5, 1.5, 'f'); g.px(x, y, 'g')
    g.outline(); return g
def pr_rock(r, kind='boulder'):
    g = G(16, 16)
    if kind == 'boulder':
        g.ell(7.5, 10, 6.5, 4.5, 'c'); g.ell(9.5, 12, 4.5, 2, 'b'); g.ell(6, 8.5, 3.5, 2, 'd'); g.px(4, 8, 'e'); g.px(5, 8, 'e')
    elif kind == 'crag':
        g.poly([(1, 15), (4, 6), (7, 9), (10, 3), (14, 15)], 'c'); g.line(4, 7, 3, 14, 'd'); g.line(10, 4, 8, 14, 'd'); g.poly([(11, 15), (12, 8), (14, 15)], 'a')
    elif kind == 'dome':
        g.ell(7.5, 13, 7, 4, 'c'); g.ell(9, 14.5, 5, 1.5, 'b'); g.ell(6, 11.5, 4, 1.5, 'd')
    elif kind == 'reef':
        g.ell(7.5, 11, 6, 4, 'c')
        for _ in range(7): g.px(r.randrange(3, 13), r.randrange(8, 14), 'f')
        g.ell(5, 9, 2, 1, 'd')
    elif kind == 'gem':
        g.ell(7.5, 11, 6, 4, 'c'); g.poly([(6, 9), (8, 3), (10, 9)], 'f'); g.line(8, 4, 8, 8, 'g'); g.ell(5, 10, 2, 1, 'd')
    elif kind == 'gears':
        g.ell(6, 10, 4, 4, 'c'); g.ell(6, 10, 1.5, 1.5, 'b'); g.ell(11.5, 12, 3, 3, 'd'); g.ell(11.5, 12, 1, 1, 'b')
        for a in range(0, 360, 45): g.px(6 + round(5 * math.cos(math.radians(a))), 10 + round(5 * math.sin(math.radians(a))), 'c')
    elif kind == 'eggs':
        for x, y in ((5, 11), (10, 10), (8, 13)): g.ell(x, y, 2.5, 3, 'e'); g.px(x - 1, y - 2, 'f')
    g.outline(); return g
def pr_vent(r, kind='vent'):
    g = G(16, 16)
    g.ell(7.5, 12, 6, 3, 'c'); g.ell(7.5, 11.5, 3, 1.5, 'k'); g.ell(7.5, 11.5, 2, 1, 'f')
    for i, (x, y) in enumerate(((7, 8), (8, 5), (6, 2))): g.px(x, y, 'e'); g.px(x + 1, y, 'd')
    if kind == 'smoke':
        for x, y in ((6, 7), (8, 4), (7, 1)): g.ell(x, y, 1.5, 1, 'd')
    g.outline(); return g
def pr_pylon(r, kind='pylon'):
    g = G(16, 24)
    if kind == 'pylon':
        g.rect(6, 6, 4, 16, 'c'); g.rect(5, 21, 6, 2, 'b'); g.rect(3, 5, 10, 2, 'd'); g.line(9, 7, 9, 20, 'a')
        g.ell(7.5, 3, 2, 2, 'f'); g.px(7, 2, 'g')
    elif kind == 'node':
        g.poly([(4, 22), (8, 6), (12, 22)], 'c'); g.ell(7.5, 5, 3, 3, 'f'); g.ell(7, 4, 1, 1, 'g'); g.line(8, 9, 8, 21, 'd')
    elif kind == 'chimney':
        g.rect(5, 6, 6, 17, 'c'); g.rect(4, 5, 8, 2, 'b'); g.line(10, 7, 10, 22, 'a'); g.ell(8, 2, 2, 1.5, 'd'); g.ell(10, 0.5, 1.5, 1, 'd')
        for y in (9, 14, 19): g.line(5, y, 10, y, 'b')
    elif kind == 'hive':
        g.ell(7.5, 13, 6, 9, 'c'); g.ell(6, 10, 3, 5, 'd')
        for y in range(7, 22, 3): g.line(3, y, 12, y, 'b')
        g.ell(7.5, 16, 1.5, 2, 'k')
    g.outline(); return g
def pr_mineral(r, kind='cluster'):
    g = G(16, 16)
    if kind == 'cluster':
        g.poly([(3, 14), (5, 6), (7, 14)], 'c'); g.poly([(6, 14), (8, 2), (10, 14)], 'd'); g.poly([(9, 14), (12, 7), (13, 14)], 'c')
        g.line(8, 3, 8, 12, 'e'); g.ell(8, 14, 6, 1.5, 'b')
    elif kind == 'geode':
        g.ell(7.5, 10, 6, 4.5, 'b'); g.ell(7.5, 10, 3.5, 2.5, 'c'); g.poly([(6, 11), (7, 7), (8, 11)], 'e'); g.poly([(8, 11), (9, 8), (10, 11)], 'd')
    elif kind == 'vein':
        g.ell(7.5, 10, 6.5, 4.5, 'b'); g.line(3, 12, 12, 7, 'e'); g.line(4, 13, 12, 8, 'c'); g.px(6, 9, 'e')
    g.outline(); return g
def pr_stone(r, kind='stele'):
    g = G(16, 16)
    if kind == 'stele':
        g.rect(4, 3, 8, 11, 'c'); g.rect(3, 13, 10, 2, 'b'); g.line(4, 3, 4, 12, 'd'); g.line(11, 4, 11, 12, 'a')
    elif kind == 'tablet':
        g.ell(7.5, 5, 4, 3, 'c'); g.rect(4, 5, 8, 9, 'c'); g.rect(3, 13, 10, 2, 'b'); g.line(4, 4, 4, 12, 'd')
    elif kind == 'slab':
        g.poly([(2, 14), (4, 6), (12, 5), (14, 14)], 'c'); g.line(4, 7, 3, 13, 'd'); g.line(12, 6, 13, 13, 'a')
    for y in range(6, 12, 2):
        for x in range(5, 11):
            if r.random() < .55: g.px(x, y, 'f')
    g.outline(); return g

SHAPES = {'tree': pr_tree, 'shrub': pr_shrub, 'spire': pr_spire, 'pillar': pr_pillar, 'deadtree': pr_deadtree, 'boulder': pr_rock,
          'vent': pr_vent, 'pylon': pr_pylon}

# ── recipes: one per environment, from its Codex terrain ──
# ground/ground2/special: texture · path · wall · liquid · props: {prop key: shape kind} · extra: [key, kind] · mineral · stone
R = {
 'origon':    dict(ground='crystal', ground2='ash', special='plates_gold', path='paving', wall='columns', liquid='glow', props={'spire': 'shard', 'boulder': 'crag'}, extra=('pillar', 'obelisk'), mineral='cluster', stone='slab'),
 'lumeria':   dict(ground='soft', ground2='crystal', special='rings', path='glow', wall='crystal', liquid='glow', props={'spire': 'crystal'}, extra=('pillar', 'arch'), mineral='cluster', stone='tablet'),
 'draevos':   dict(ground='gravel', ground2='basalt', special='ash', path='dirt', wall='rock', liquid='lava', props={'boulder': 'crag', 'deadtree': 'bare'}, extra=('pillar', 'basalt'), mineral='vein', stone='slab'),
 'arborynth': dict(ground='roots', ground2='litter', special='meadow', path='planks', wall='roots', liquid='glow', props={'tree': 'giant', 'shrub': 'fern'}, extra=('shrub', 'bush'), mineral='geode', stone='tablet'),
 'thallassar':dict(ground='reefsand', ground2='sand', special='rings', path='sand', wall='coral', liquid='water', props={'shrub': 'kelp', 'boulder': 'reef'}, extra=('shrub', 'coral'), mineral='geode', stone='slab'),
 'pyrauna':   dict(ground='lava', ground2='basalt', special='ash', path='dirt', wall='columns', liquid='lava', props={'vent': 'vent', 'boulder': 'boulder'}, extra=('pillar', 'basalt'), mineral='vein', stone='slab'),
 'quorauna':  dict(ground='strata', ground2='gravel', special='rings', path='cobble', wall='blocks', liquid='void', props={'boulder': 'dome', 'pillar': 'strata'}, extra=('boulder', 'crag'), mineral='geode', stone='slab'),
 'cytherion': dict(ground='grid', ground2='grid4', special='flesh_hive', path='metal', wall='hive', liquid='glow', props={'pylon': 'node', 'spire': 'needle'}, extra=('pylon', 'hive'), mineral='cluster', stone='stele'),
 'myraclese': dict(ground='paving', ground2='meadow', special='flag', path='paving', wall='blocks', liquid='water', props={'pillar': 'column', 'shrub': 'bush'}, extra=('pillar', 'statue'), mineral='vein', stone='tablet'),
 'bellatora': dict(ground='mud', ground2='ash', special='gravel', path='planks', wall='rock', liquid='water', props={'deadtree': 'bare', 'pillar': 'palisade'}, extra=('pillar', 'banner'), mineral='vein', stone='stele'),
 'yvoris':    dict(ground='snow', ground2='ice', special='ice', path='ice', wall='crystal', liquid='water', props={'spire': 'ice', 'deadtree': 'frost'}, extra=('pillar', 'statue'), mineral='cluster', stone='tablet'),
 'kyrathos':  dict(ground='shadow', ground2='gravel', special='soft', path='flag', wall='columns', liquid='void', props={'pillar': 'obelisk'}, extra=('spire', 'eye'), mineral='geode', stone='slab'),
 'nexyros':   dict(ground='flag', ground2='ash', special='rings', path='cobble', wall='blocks', liquid='void', props={'pillar': 'column', 'deadtree': 'bare'}, extra=('pillar', 'arch'), mineral='vein', stone='stele'),
 'jynaera':   dict(ground='strata', ground2='meadow0', special='soft', path='flag', wall='blocks', liquid='glow', props={'pillar': 'strata', 'spire': 'hourglass'}, extra=('pillar', 'arch'), mineral='geode', stone='tablet'),
 'sylvanir':  dict(ground='litter', ground2='meadow', special='roots', path='dirt', wall='roots', liquid='water', props={'tree': 'giant', 'shrub': 'fern'}, extra=('tree', 'willow'), mineral='geode', stone='tablet'),
 'velkryn':   dict(ground='flesh', ground2='gravel', special='lava', path='dirt', wall='flesh', liquid='lava', props={'deadtree': 'bone', 'boulder': 'crag'}, extra=('spire', 'eye'), mineral='vein', stone='slab'),
 'ignara':    dict(ground='lava', ground2='ash', special='basalt', path='dirt', wall='columns', liquid='lava', props={'vent': 'vent', 'spire': 'shard'}, extra=('pillar', 'basalt'), mineral='vein', stone='slab'),
 'uralyx':    dict(ground='soft', ground2='meadow0', special='rings', path='glow', wall='crystal', liquid='glow', props={'spire': 'eye'}, extra=('pillar', 'obelisk'), mineral='cluster', stone='stele'),
 'halcyra':   dict(ground='reefsand', ground2='sand', special='rings', path='planks', wall='coral', liquid='water', props={'spire': 'needle', 'shrub': 'coral'}, extra=('shrub', 'reeds'), mineral='geode', stone='tablet'),
 'wyvera':    dict(ground='meadow', ground2='gravel', special='cloud', path='dirt', wall='rock', liquid='cloud', props={'spire': 'needle', 'deadtree': 'wind'}, extra=('boulder', 'crag'), mineral='cluster', stone='stele'),
 'rhyzor':    dict(ground='rings', ground2='paving', special='rings', path='flag', wall='blocks', liquid='water', props={'pillar': 'tuning', 'spire': 'note'}, extra=('pillar', 'arch'), mineral='vein', stone='stele'),
 'elythera':  dict(ground='meadow', ground2='cloud', special='meadow', path='planks', wall='rock', liquid='cloud', props={'tree': 'willow', 'shrub': 'bush'}, extra=('pillar', 'arch'), mineral='cluster', stone='tablet'),
 'xylos':     dict(ground='crystal', ground2='grid4', special='rings', path='glow', wall='crystal', liquid='glow', props={'spire': 'crystal'}, extra=('shrub', 'crystals'), mineral='cluster', stone='slab'),
 'gravaron':  dict(ground='gravel', ground2='strata', special='rings', path='cobble', wall='blocks', liquid='void', props={'boulder': 'dome'}, extra=('pillar', 'basalt'), mineral='geode', stone='slab'),
 'ferros':    dict(ground='metal', ground2='ash', special='gravel', path='cobble', wall='blocks', liquid='lava', props={'pylon': 'chimney', 'vent': 'smoke'}, extra=('boulder', 'gears'), mineral='vein', stone='stele'),
 'viridia':   dict(ground='meadow', ground2='meadow', special='meadow', path='dirt', wall='rock', liquid='water', props={'tree': 'round', 'shrub': 'bush'}, extra=('tree', 'pine'), mineral='cluster', stone='stele'),
 # Zyraxis's districts (the Mothergem's ten lands)
 'zarvane':   dict(ground='sand', ground2='reefsand', special='rings', path='sand', wall='crystal', liquid='glow', props={'spire': 'shard', 'shrub': 'reeds'}, extra=('tree', 'palm'), mineral='geode', stone='tablet'),
 'andrannor': dict(ground='meadow0', ground2='sand', special='meadow', path='dirt', wall='rock', liquid='water', props={'tree': 'round', 'shrub': 'thorn'}, extra=('boulder', 'gem'), mineral='cluster', stone='stele'),
 'veridan':   dict(ground='litter', ground2='roots', special='meadow', path='planks', wall='roots', liquid='water', props={'tree': 'giant', 'shrub': 'fern'}, extra=('shrub', 'bush'), mineral='cluster', stone='tablet'),
 'netharion': dict(ground='crystal', ground2='shadow', special='rings', path='flag', wall='crystal', liquid='void', props={'spire': 'shard', 'pillar': 'obelisk'}, extra=('boulder', 'gem'), mineral='geode', stone='slab'),
 'vorashil':  dict(ground='paving', ground2='cloud', special='rings', path='glow', wall='blocks', liquid='cloud', props={'pylon': 'node', 'spire': 'needle'}, extra=('pillar', 'arch'), mineral='cluster', stone='stele'),
 'xilnar':    dict(ground='shadow', ground2='gravel', special='soft', path='flag', wall='columns', liquid='void', props={'pillar': 'obelisk', 'deadtree': 'spirit'}, extra=('pylon', 'node'), mineral='geode', stone='slab'),
 'baelgor':   dict(ground='paving', ground2='ash', special='lava', path='cobble', wall='blocks', liquid='lava', props={'pillar': 'column', 'shrub': 'thorn'}, extra=('pylon', 'chimney'), mineral='vein', stone='tablet'),
 'thardin':   dict(ground='metal', ground2='grid', special='gravel', path='cobble', wall='blocks', liquid='water', props={'pylon': 'pylon', 'vent': 'smoke'}, extra=('boulder', 'gears'), mineral='vein', stone='stele'),
 'korathen':  dict(ground='paving', ground2='meadow0', special='flag', path='paving', wall='blocks', liquid='glow', props={'pillar': 'column', 'spire': 'crystal'}, extra=('pillar', 'statue'), mineral='cluster', stone='tablet'),
}
SPECIAL = {'plates_gold': lambda r: t_plates(r, 'b', 'f'), 'flesh_hive': t_flesh}

def env_cols(e):
    p = e.get('palette') or {}
    def pick(slot, keys, fallback):
        d = p.get(slot) or {}
        for k in keys:
            if d.get(k): return d[k]
        return fallback
    ground = pick('ground', ('g', 'c', 'p', 'n'), '#5fa845')
    path = pick('path', ('p', 'c', 'n', 'g'), mix(ground, '#c9a46a', .6))
    liquid = pick('liquid', ('a', 'c', 'n'), '#3a74d8')
    wall = pick('wall', ('n', 'L', 'c'), mix(ground, '#6e6450', .6))
    pp = e.get('prop_palette') or {}
    acc = None
    for v in pp.values():
        for k in ('c', 'C', 'g', 'n'):
            if v.get(k): acc = v[k]; break
        if acc: break
    special = pick('special', ('n', 'c', 'W'), shift(ground, .1))
    return ground, path, liquid, wall, acc or shift(ground, .25, .2, .1), special

def accent_pair(acc, base):
    # an accent that stands out against the ground: push it bright and saturated
    a = acc if abs(lum(acc) - lum(base)) > .18 else shift(acc, .25 if lum(base) < .5 else -.25, .2)
    return {'f': a, 'g': shift(a, .18, -.05)}

def tile_pal(base, acc_base):
    rp = ramp(base); d = dict(zip('abcde', rp)); d.update(accent_pair(acc_base, base)); return d

def build():
    out, env_map = {}, {}
    for eid, rec in R.items():
        e = ENVS.get(eid)
        if not e: continue
        r = random.Random('aov-' + eid)
        ground, path, liquid, wall, acc, special = env_cols(e)
        if eid in ('lumeria',): ground = mix(ground, '#e8d8a0', .25)
        m = {'ground': [], 'props': {}, 'extra': None}
        def put(name, g, pal): out[name] = sprite(g, pal); return name
        gp = tile_pal(ground, acc)
        m['ground'].append(put('wa_%s_g0' % eid, TEX[rec['ground']](r), gp))
        m['ground'].append(put('wa_%s_g1' % eid, TEX[rec['ground2']](r), tile_pal(shift(ground, .03, -.03), acc)))
        sp = SPECIAL.get(rec['special']) or TEX[rec['special']]
        m['special'] = put('wa_%s_sp' % eid, sp(r), tile_pal(special if special else shift(ground, .08), acc))
        # roads must read against the ground: keep their lightness apart
        if abs(lum(path) - lum(ground)) < .12: path = shift(path, .16 if lum(ground) < .5 else -.16)
        m['path'] = put('wa_%s_path' % eid, PATH[rec['path']](r), tile_pal(path, acc))
        m['wall'] = put('wa_%s_wall' % eid, WALL[rec['wall']](r), tile_pal(wall, acc))
        if rec['liquid'] == 'lava': liquid = mix(liquid, '#e85a20', .75)
        if rec['liquid'] == 'cloud': liquid = mix(liquid, '#e8eef8', .5)
        lq = [put('wa_%s_liq%d' % (eid, f), LIQ[rec['liquid']](random.Random('liq' + eid), f), tile_pal(liquid, '#fff4c8' if rec['liquid'] in ('glow',) else '#ffb347' if rec['liquid'] == 'lava' else '#e8f4ff')) for f in (0, 1)]
        m['liquid'] = lq
        # props: drawn from the world's own colours. Plants in the ground's hue, stone in the wall's, crystal in the accent
        plant = shift(ground, -.02, .05) if lum(ground) < .75 else shift(acc, -.1)
        stone = wall
        for key, kind in list(rec['props'].items()) + [rec['extra']]:
            fn = SHAPES[key]
            base = plant if key in ('tree', 'shrub') else acc if key in ('spire',) and kind in ('crystal', 'shard', 'ice', 'needle') else stone
            pal = dict(zip('abcde', ramp(base))); pal['a'] = mix(pal['a'], pal['b'], .5); pal.update(accent_pair(acc, base))
            if key in ('tree', 'deadtree'): pal['b'] = shift(mix(wall, '#6a4428', .5), -.05)
            name = put('wa_%s_%s_%s' % (eid, key, kind), fn(r, kind), pal)
            if (key, kind) == tuple(rec['extra']): m['extra'] = {'key': key, 'sprite': name}
            else: m['props'][key] = name
        mpal = dict(zip('abcde', ramp(acc))); mpal.update(accent_pair(shift(acc, .2), acc))
        m['mineral'] = put('wa_%s_mineral' % eid, pr_mineral(r, rec['mineral']), mpal)
        spal = dict(zip('abcde', ramp(stone))); spal.update(accent_pair(acc, stone))
        m['stone'] = put('wa_%s_stone' % eid, pr_stone(r, rec['stone']), spal)
        bpal = dict(zip('abcde', ramp(wall))); bpal['a'] = mix(bpal['a'], bpal['b'], .5); bpal.update(accent_pair(acc, wall))
        m['boulder'] = put('wa_%s_boulder' % eid, pr_rock(r, 'boulder'), bpal)
        shpal = dict(zip('abcde', ramp(plant))); shpal.update(accent_pair(acc, plant))
        m['shrub'] = put('wa_%s_bush' % eid, pr_shrub(r, rec['props'].get('shrub', 'bush') if 'shrub' in rec['props'] else 'bush'), shpal)
        env_map[eid] = m
    return out, env_map

# ── landmarks (shared, by kind) ──
def lm_sprites():
    out = {}
    gold = dict(zip('abcde', ramp('#c8963a'))); gold.update({'f': '#ffe08a', 'g': '#fff6d0'})
    stone = dict(zip('abcde', ramp('#8a8478'))); stone.update({'f': '#e8c860', 'g': '#fff0b0'})
    dark = dict(zip('abcde', ramp('#4a4258'))); dark.update({'f': '#b88ae8', 'g': '#e8d0ff'})
    cryst = dict(zip('abcde', ramp('#5fb8e0'))); cryst.update({'f': '#ffffff', 'g': '#e8f8ff'})
    r = random.Random('landmarks')
    # region marker: a standing stone with a carved band and a gold glyph
    g = G(16, 24); g.poly([(4, 23), (5, 6), (8, 3), (11, 6), (12, 23)], 'c'); g.line(5, 7, 5, 22, 'd'); g.line(11, 7, 11, 22, 'a')
    for y in (9, 10): g.line(5, y, 11, y, 'b')
    g.ell(8, 14, 2, 2.5, 'f'); g.px(8, 13, 'g'); g.rect(3, 23, 10, 1, 'b'); g.outline(); out['lm_region'] = sprite(g, stone)
    # site: a ruined monument (two columns and a lintel, one fallen block)
    g = G(24, 24); g.rect(3, 6, 4, 16, 'c'); g.rect(15, 9, 4, 13, 'c'); g.rect(2, 4, 14, 3, 'd'); g.line(3, 7, 3, 21, 'd'); g.line(6, 7, 6, 21, 'a'); g.line(18, 10, 18, 21, 'a')
    g.rect(17, 19, 5, 3, 'b'); g.rect(2, 22, 20, 2, 'b'); g.px(9, 5, 'f'); g.px(10, 5, 'f'); g.outline(); out['lm_site'] = sprite(g, stone)
    # shrine (Zyraxis district shrine): a pillar holding a glowing gem
    g = G(16, 24); g.rect(5, 10, 6, 12, 'c'); g.rect(4, 9, 8, 2, 'd'); g.rect(3, 21, 10, 2, 'b'); g.line(10, 11, 10, 20, 'a')
    g.poly([(5, 8), (8, 1), (11, 8)], 'f'); g.line(8, 2, 8, 7, 'g'); g.px(6, 7, 'g'); g.outline(); out['lm_shrine'] = sprite(g, gold)
    # Gemlord cave: a dark mouth in a crystal-studded mound
    g = G(24, 20); g.ell(11.5, 15, 11, 9, 'c'); g.ell(11.5, 17, 5, 6, 'k'); g.ell(8, 9, 4, 3, 'd')
    for x, y in ((4, 10), (18, 9), (15, 5)): g.poly([(x - 1, y + 2), (x, y - 2), (x + 1, y + 2)], 'f')
    g.rect(0, 19, 24, 1, 'b'); g.outline(); out['lm_cave'] = sprite(g, dark)
    # prism / cosmic site: a floating crystal over a ring
    g = G(16, 24); g.ell(8, 21, 6, 2, 'b'); g.ell(8, 21, 4, 1, 'a'); g.poly([(5, 10), (8, 2), (11, 10), (8, 17)], 'c'); g.poly([(8, 2), (11, 10), (8, 17)], 'a'); g.line(7, 4, 6, 10, 'f')
    g.outline(); out['lm_prism'] = sprite(g, cryst)
    # temple: stepped gold-roofed shrine
    g = G(32, 24); g.rect(4, 12, 24, 10, 'c'); g.poly([(2, 12), (16, 3), (30, 12)], 'f'); g.line(3, 11, 16, 4, 'g'); g.rect(2, 22, 28, 2, 'b')
    for x in (7, 12, 19, 24): g.rect(x, 13, 2, 9, 'd')
    g.rect(14, 15, 4, 7, 'k'); g.outline(); out['lm_temple'] = sprite(g, stone)
    # codex monument: obelisk with gold cap (index landmarks)
    g = G(16, 24); g.poly([(5, 22), (6, 5), (10, 5), (11, 22)], 'c'); g.poly([(6, 5), (8, 1), (10, 5)], 'f'); g.line(6, 6, 6, 21, 'd'); g.line(10, 6, 10, 21, 'a')
    for y in (9, 13, 17): g.line(7, y, 9, y, 'b')
    g.rect(4, 22, 8, 2, 'b'); g.outline(); out['lm_monument'] = sprite(g, stone)
    # a presence (axis-beings): a ring of standing stones around a glow
    g = G(24, 20); g.ell(12, 15, 9, 3, 'b'); g.ell(12, 14, 3, 2, 'f'); g.ell(12, 13.5, 1.5, 1, 'g')
    for x, h in ((3, 9), (8, 12), (16, 12), (21, 9)): g.rect(x - 1, 17 - h, 3, h, 'c'); g.px(x - 1, 17 - h, 'd')
    g.outline(); out['lm_presence'] = sprite(g, dark)
    # the throne
    g = G(16, 24); g.rect(3, 8, 10, 14, 'c'); g.rect(5, 2, 6, 8, 'f'); g.rect(6, 3, 4, 6, 'c'); g.rect(2, 14, 12, 3, 'd'); g.rect(1, 21, 14, 3, 'b'); g.px(8, 1, 'g')
    g.outline(); out['lm_throne'] = sprite(g, gold)
    return out

# ── item icons (16 × 16) ──
def icon_sprites():
    out = {}
    def P(base, f='#ffe08a', g='#ffffff'): d = dict(zip('abcde', ramp(base))); d.update({'f': f, 'g': g}); return d
    def put(n, g, pal): g.outline(); out['it_' + n] = sprite(g, pal)
    g = G(); g.poly([(2, 12), (5, 5), (9, 7), (13, 4), (14, 12)], 'c'); g.line(5, 6, 3, 11, 'd'); g.rect(6, 9, 3, 2, 'a'); g.px(11, 6, 'e'); g.px(12, 9, 'b'); g.px(4, 11, 'b')
    put('scrap', g, P('#8a8f96'))
    # Terra: a block of ground, grass on top (the inventory-block look)
    g = G(); g.poly([(1, 11.5), (1, 4.5), (8, 8), (8, 15)], 'c'); g.poly([(8, 8), (15, 4.5), (15, 11.5), (8, 15)], 'b'); g.poly([(1, 4.5), (8, 1), (15, 4.5), (8, 8)], 'f')
    g.poly([(1, 4.5), (8, 8), (8, 10), (1, 6.5)], 'g'); g.poly([(8, 8), (15, 4.5), (15, 6.5), (8, 10)], 'f')
    for x, y in ((3, 9), (5, 12), (11, 10), (13, 8), (10, 13)): g.px(x, y, 'a')
    put('terra', g, P('#8a6a44', '#5fa845', '#86c95a'))
    g = G(); g.poly([(4, 14), (6, 5), (8, 14)], 'c'); g.poly([(7, 14), (9, 1), (11, 14)], 'd'); g.poly([(10, 14), (12, 7), (13, 14)], 'c'); g.line(9, 2, 9, 12, 'e'); g.ell(8, 14, 6, 1, 'b')
    put('crystal', g, P('#5fb8e0'))
    g = G()
    for i, x in enumerate((4, 7, 10)): g.line(x, 14, x + 2, 2 + i, 'c'); g.line(x + 1, 14, x + 3, 3 + i, 'd')
    g.rect(3, 9, 11, 2, 'b'); g.px(4, 9, 'f')
    put('fibre', g, P('#7aa83a', '#d8c060'))
    g = G(); g.ell(7.5, 8, 5, 6, 'c'); g.ell(7.5, 8, 3, 4, 'b'); g.poly([(6, 9), (7.5, 4), (9, 9), (7.5, 12)], 'f'); g.px(7, 6, 'g'); g.ell(6, 4, 1.5, 1, 'e')
    put('relic', g, P('#c8963a', '#b88ae8', '#e8d0ff'))
    g = G(); g.rect(3, 3, 10, 11, 'c'); g.rect(3, 3, 10, 2, 'b'); g.rect(4, 6, 8, 7, 'k')
    for y in (7, 9, 11): g.line(5, y, 5 + (y * 3) % 6 + 2, y, 'f')
    g.px(11, 4, 'f')
    put('data', g, P('#4a6a5a', '#7cf08a', '#c8ffd0'))
    g = G(); g.rect(5, 4, 6, 10, 'c'); g.rect(6, 2, 4, 2, 'b'); g.line(6, 5, 6, 12, 'd'); g.line(10, 5, 10, 12, 'a'); g.rect(5, 8, 6, 2, 'f')
    put('oil', g, P('#3a3440', '#e8b830'))
    g = G(); g.rect(6, 5, 4, 9, 'c'); g.line(7, 5, 7, 13, 'd'); g.rect(6, 4, 4, 1, 'b'); g.poly([(7, 4), (8, 0), (9, 4)], 'f'); g.px(8, 1, 'g'); g.rect(6, 9, 4, 1, 'b')
    put('flare', g, P('#c8402c', '#ff8a3a', '#ffe08a'))
    g = G(); g.rect(5, 3, 6, 11, 'c'); g.ell(8, 3, 3, 1.5, 'c'); g.rect(7, 1, 2, 2, 'b'); g.line(6, 4, 6, 12, 'd'); g.line(10, 4, 10, 12, 'a'); g.rect(5, 7, 6, 2, 'f')
    put('air', g, P('#5fa0c8', '#ffffff', '#e8f4ff'))
    # ship parts
    g = G(); g.rect(2, 4, 12, 9, 'c'); g.rect(2, 4, 12, 2, 'd'); g.line(13, 5, 13, 12, 'a')
    for x, y in ((4, 7), (11, 7), (4, 11), (11, 11)): g.px(x, y, 'e')
    put('part_hull', g, P('#9aa2a8'))
    g = G(); g.rect(3, 3, 10, 10, 'c'); g.ell(8, 8, 3.5, 3.5, 'b')
    for a in range(0, 180, 45): g.line(8 + round(3 * math.cos(math.radians(a))), 8 + round(3 * math.sin(math.radians(a))), 8 - round(3 * math.cos(math.radians(a))), 8 - round(3 * math.sin(math.radians(a))), 'e')
    put('part_life', g, P('#6a8a9a', '#c8ffd0'))
    g = G(); g.rect(4, 3, 8, 11, 'c'); g.rect(6, 1, 4, 2, 'b'); g.rect(5, 5, 6, 7, 'k'); g.rect(5, 9, 6, 3, 'f'); g.rect(5, 7, 6, 2, 'g')
    put('part_power', g, P('#c8843c', '#7cf08a', '#c8ffd0'))
    g = G(); g.poly([(4, 8), (8, 1), (12, 8), (8, 15)], 'c'); g.poly([(8, 1), (12, 8), (8, 15)], 'a'); g.line(7, 3, 5, 8, 'e'); g.px(8, 8, 'f')
    put('part_core', g, P('#7a4bb0', '#ffffff'))
    g = G(); g.ell(8, 8, 6, 6, 'b'); g.ell(8, 8, 4, 4, 'c'); g.ell(7, 7, 2, 2, 'e'); g.px(6, 6, 'g'); g.rect(13, 11, 2, 4, 'b')
    put('part_nav', g, P('#3a74d8', '#ffe08a'))
    g = G(); g.poly([(3, 3), (13, 3), (13, 9), (8, 14), (3, 9)], 'c'); g.poly([(8, 3), (13, 3), (13, 9), (8, 14)], 'a'); g.line(4, 4, 4, 9, 'e'); g.px(8, 7, 'f')
    put('part_shield', g, P('#4a8a8a', '#a8e8ff'))
    g = G(); g.rect(4, 2, 8, 12, 'b')
    for y in range(3, 14, 2): g.line(3, y, 12, y, 'f'); g.line(3, y + 1, 12, y + 1, 'c')
    put('part_coil', g, P('#6a4428', '#e8843c', '#ffc890'))
    # Codex finds
    g = G(); g.poly([(3, 6), (6, 3), (10, 3), (13, 6), (8, 14)], 'c'); g.poly([(8, 3), (10, 3), (13, 6), (8, 14)], 'a'); g.line(3, 6, 13, 6, 'd'); g.px(6, 4, 'e')
    put('gem', g, P('#c8402c', '#ffffff'))
    g = G(); g.poly([(5, 13), (8, 1), (11, 13)], 'c'); g.poly([(8, 1), (11, 13), (8, 13)], 'a'); g.line(7, 3, 6, 12, 'e'); g.ell(8, 14, 4, 1, 'b')
    put('prism', g, P('#5fb8e0', '#ffffff'))
    g = G(); g.rect(3, 8, 10, 5, 'c'); g.poly([(3, 8), (4, 3), (6, 7), (8, 2), (10, 7), (12, 3), (13, 8)], 'c'); g.line(3, 11, 12, 11, 'b')
    for x in (4, 8, 12): g.px(x, 3 if x != 8 else 2, 'f')
    g.px(8, 9, 'f')
    put('crown', g, P('#e8b830', '#c8402c'))
    g = G(); g.ell(5, 5, 3, 3, 'c'); g.ell(5, 5, 1, 1, 'k'); g.line(7, 7, 13, 13, 'c'); g.line(8, 7, 14, 13, 'd'); g.line(11, 11, 12, 10, 'c'); g.line(13, 13, 14, 12, 'c')
    put('key', g, P('#c8963a'))
    g = G(); g.ell(7.5, 8, 6, 6, 'c'); g.ell(6, 6, 3, 3, 'd'); g.ell(5, 5, 1, 1, 'e'); g.ell(10, 11, 2, 2, 'a')
    put('orb', g, P('#7a4bb0'))
    g = G(); g.rect(4, 3, 8, 10, 'c'); g.ell(4, 8, 1.5, 5, 'b'); g.ell(12, 8, 1.5, 5, 'b')
    for y in (5, 7, 9, 11): g.line(6, y, 10, y, 'a')
    put('scroll', g, P('#d8c890'))
    g = G(); g.rect(6, 2, 4, 3, 'b'); g.ell(8, 10, 4, 4.5, 'c'); g.ell(8, 11, 3, 3, 'f'); g.px(6, 8, 'g')
    put('vial', g, P('#9fd2e6', '#b88ae8'))
    g = G(); g.line(3, 13, 12, 4, 'c'); g.line(4, 13, 13, 4, 'd'); g.line(2, 12, 2, 12, 'b'); g.line(3, 10, 6, 13, 'b'); g.px(13, 3, 'e')
    put('blade', g, P('#c8d0d8', '#e8b830'))
    g = G(); g.poly([(7, 2), (10, 6), (9, 13), (6, 13), (5, 6)], 'c'); g.line(7, 3, 6, 12, 'e'); g.px(8, 8, 'f')
    put('shard', g, P('#b88ae8', '#ffffff'))
    g = G(); g.ell(8, 9, 5, 5, 'c'); g.ell(8, 9, 2.5, 2.5, 'f'); g.ell(7, 8, 1, 1, 'g'); g.ell(6, 6, 1.5, 1, 'e')
    put('core', g, P('#c8402c', '#ffb347', '#ffffff'))
    g = G(); g.ell(8, 9, 4, 5, 'c'); g.line(8, 4, 8, 1, 'b'); g.ell(10, 2, 2, 1, 'f'); g.ell(6, 7, 1.5, 2, 'e')
    put('seed', g, P('#8a6a3a', '#7cf08a'))
    g = G(); g.rect(3, 2, 10, 12, 'c'); g.rect(4, 3, 8, 6, 'f'); g.rect(4, 10, 8, 1, 'b'); g.rect(4, 12, 6, 1, 'b')
    put('card', g, P('#f4efe0', '#3a74d8', '#a8e8ff'))
    return out

def write(preview=False):
    sprites, env_map = build()
    lms = lm_sprites(); icons = icon_sprites()
    allsp = dict(sprites); allsp.update(lms); allsp.update(icons)
    data = {'env': env_map,
            'landmarks': {k[3:]: k for k in lms},
            'items': {k[3:]: k for k in icons}}
    hdr = ('// ★ GENERATED by tools/explorer/build_world_art.py · do not hand-edit (change the recipes and re-run).\n'
           '// Native pixel art for every world: tiles, props, minerals, record stones, landmarks and item icons.\n')
    js = hdr + '(function(){\n  var S = ' + json.dumps(allsp, separators=(',', ':')) + ';\n' \
         '  var A = window.AOV_ART; if (A && A.SPRITES) Object.keys(S).forEach(function(k){ A.SPRITES[k] = S[k]; });\n' \
         '  window.AOV_WORLD_ART = ' + json.dumps(data, separators=(',', ':')) + ';\n})();\n'
    open(P('explorer/world_art.js'), 'w', encoding='utf-8').write(js)
    print('sprites', len(allsp), 'envs', len(env_map), 'bytes', len(js))
    if preview: render_preview(allsp, env_map)

def render_preview(allsp, env_map, path=None):
    from PIL import Image
    def img(name, scale=3):
        sp = allsp[name]; rows = sp['rows']; pal = sp['pal']
        im = Image.new('RGBA', (len(rows[0]), len(rows)), (0, 0, 0, 0))
        for y, row in enumerate(rows):
            for x, ch in enumerate(row):
                if ch != '.': im.putpixel((x, y), tuple(int(pal[ch][i:i + 2], 16) for i in (1, 3, 5)) + (255,))
        return im.resize((im.width * scale, im.height * scale), Image.NEAREST)
    envs = list(env_map)
    W, rowh = 1700, 110
    sheet = Image.new('RGB', (W, rowh * len(envs) + 240), (24, 20, 30))
    for i, eid in enumerate(envs):
        m = env_map[eid]; x = 4; y = i * rowh + 4
        # a 3 × 2 tiled patch of each ground so seams show
        for nm in m['ground'] + [m['special'], m['path'], m['wall'], m['liquid'][0]]:
            t = img(nm, 2)
            for a in range(3):
                for b in range(3): sheet.paste(t, (x + a * 32, y + b * 32))
            x += 100
        for nm in list(m['props'].values()) + [m['extra']['sprite'], m['mineral'], m['stone'], m['boulder'], m['shrub']]:
            t = img(nm, 3); bg = Image.new('RGB', t.size, tuple(int(allsp[m['ground'][0]]['pal']['c'][j:j + 2], 16) for j in (1, 3, 5)))
            bg.paste(t, (0, 0), t); sheet.paste(bg, (x, y + rowh - 8 - t.height)); x += t.width + 6
    x, y = 4, rowh * len(envs) + 10
    for nm in [k for k in allsp if k.startswith('lm_')] + [k for k in allsp if k.startswith('it_')]:
        t = img(nm, 3 if nm.startswith('lm_') else 4); bg = Image.new('RGB', t.size, (60, 56, 70)); bg.paste(t, (0, 0), t)
        if x + t.width > W: x = 4; y += 110
        sheet.paste(bg, (x, y)); x += t.width + 8
    path = path or os.environ.get('ART_PREVIEW', '/tmp/world_art_preview.png')
    sheet.save(path); print('preview', path)

if __name__ == '__main__':
    write('--preview' in sys.argv)
