#!/usr/bin/env python3
"""Build the NASARUS headquarters sprites into explorer/art.js.

Carl's 1936 camp (riveted steel, canvas, brass, copper) and the ancient ruins of
NASARUS, each ruin in a RUINED and a RESTORED state drawn from the same shape so
restoration visibly rebuilds what was there. The ancient architecture is kept
neutral (plain worked stone, simple geometric bands): its true style is not yet
approved canon. Re-running replaces the previous HQ block.
Run: python3 tools/explorer/build_hq_art.py
"""
import json, os, random, re
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class G:
    def __init__(s, w, h): s.w, s.h = w, h; s.g = [['.'] * w for _ in range(h)]
    def px(s, x, y, c):
        if 0 <= x < s.w and 0 <= y < s.h: s.g[y][x] = c
    def get(s, x, y): return s.g[y][x] if 0 <= x < s.w and 0 <= y < s.h else '.'
    def rect(s, x, y, w, h, c):
        for j in range(y, y + h):
            for i in range(x, x + w): s.px(i, j, c)
    def hl(s, x0, x1, y, c):
        for i in range(x0, x1 + 1): s.px(i, y, c)
    def vl(s, x, y0, y1, c):
        for j in range(y0, y1 + 1): s.px(x, j, c)
    def shade(s, base='n', lit='W', dark='N'):
        # light from the left: the first pixels of each run are lit, the last are shaded
        for y in range(s.h):
            row = s.g[y]; x = 0
            while x < s.w:
                if row[x] == base:
                    e = x
                    while e + 1 < s.w and row[e + 1] == base: e += 1
                    if e - x >= 3: row[x] = lit; row[e] = dark
                    if e - x >= 6: row[e - 1] = dark
                    x = e + 1
                else: x += 1
    def outline(s):
        out = [r[:] for r in s.g]
        for y in range(s.h):
            for x in range(s.w):
                if s.g[y][x] != '.': continue
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    c = s.get(x + dx, y + dy)
                    if c not in ('.', 'k'): out[y][x] = 'k'; break
        s.g = out
    def damage(s, seed, keep=.45, holes=10, rubble=12, top=0):
        r = random.Random(seed); base = s.h - 3
        cut = []
        lo, hi = int(s.h * .18), int(s.h * (1 - keep))
        h = r.randint(lo, hi)
        for x in range(s.w):
            h = max(lo, min(hi, h + r.choice((-3, -2, -1, 0, 1, 2, 3))))
            cut.append(top + h + (r.randint(0, 3) if r.random() < .3 else 0))
        for x in range(s.w):
            for y in range(0, min(cut[x], base)): s.g[y][x] = '.'
        for _ in range(holes):
            x, y = r.randrange(s.w), r.randrange(s.h // 3, base)
            if s.g[y][x] not in ('.', 'k'): s.g[y][x] = r.choice('Nk')
        for _ in range(rubble):
            x = r.randrange(1, s.w - 1); y = s.h - 2 - r.randint(0, 1)
            if s.g[y][x] == '.': s.g[y][x] = r.choice('nNW')
        # strip stray outline so it is redrawn around what is left
        for y in range(s.h):
            for x in range(s.w):
                if s.g[y][x] == 'k':
                    if all(s.get(x + dx, y + dy) in ('.', 'k') for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))): s.g[y][x] = '.'
    def rows(s): return [''.join(r) for r in s.g]

S = {}
def done(name, g, note, pal=None):
    g.outline(); S[name] = (g.rows(), note, pal)

# ── Carl's camp ──────────────────────────────────────────────────────────
def tent():
    g = G(32, 24)
    for y in range(5, 21):
        hw = int((y - 5) * .95) + 1
        for x in range(16 - hw, 16 + hw): g.px(x, y, 'S' if x < 16 else 's')
    for y in range(13, 21):
        hw = (y - 13) // 2 + 1
        for x in range(16 - hw, 16 + hw): g.px(x, y, 'u')
    g.vl(16, 2, 5, 'b'); g.rect(17, 2, 4, 2, 'r'); g.hl(17, 20, 3, 'w')
    g.hl(2, 29, 21, 'd'); g.px(1, 20, 'b'); g.px(30, 20, 'b')
    g.rect(24, 17, 6, 4, 'B'); g.hl(24, 29, 18, 'u')
    return g
def crate():
    g = G(16, 16); g.rect(2, 4, 12, 10, 'B'); g.hl(2, 13, 4, 'P'); g.hl(2, 13, 8, 'u'); g.vl(7, 4, 13, 'u')
    for x, y in ((2, 4), (13, 4), (2, 13), (13, 13)): g.px(x, y, 'm')
    g.rect(5, 1, 6, 3, 'b'); g.hl(5, 10, 1, 'P'); return g
def lab():
    g = G(32, 24); g.rect(2, 12, 28, 3, 'B'); g.hl(2, 29, 12, 'P')
    for x in (3, 4, 27, 28): g.vl(x, 15, 21, 'u')
    g.rect(6, 6, 3, 6, 'M'); g.rect(5, 4, 5, 2, 'm'); g.px(7, 3, 'k'); g.rect(10, 9, 3, 3, 'm')
    g.rect(15, 8, 8, 4, 'w'); g.hl(16, 21, 9, 'W'); g.hl(16, 20, 10, 'W')
    g.vl(25, 3, 11, 'k'); g.rect(24, 2, 4, 2, 'y'); g.px(25, 4, 'Y')
    return g
def navc():
    g = G(32, 40); g.rect(3, 26, 26, 12, 'm'); g.hl(3, 28, 26, 'W'); g.rect(13, 30, 6, 8, 'i')
    for x in range(5, 28, 4): g.px(x, 28, 'M'); g.px(x, 35, 'M')
    for y in range(4, 26):
        hw = 1 + (y - 4) // 7
        g.px(16 - hw, y, 'M'); g.px(16 + hw, y, 'M')
        if y % 3 == 0: g.hl(16 - hw, 16 + hw, y, 'M')
    g.rect(10, 4, 12, 2, 'm'); g.hl(11, 20, 3, 'w'); g.px(16, 1, 'r'); g.px(16, 2, 'R')
    g.rect(21, 28, 5, 4, 'x'); g.px(22, 29, 'Q'); g.px(24, 30, 'Q')
    return g
def depot():
    g = G(32, 24); g.rect(2, 6, 28, 15, 'M')
    for x in range(3, 30, 3): g.vl(x, 6, 20, 'm')
    g.hl(1, 30, 5, 'W'); g.hl(2, 29, 4, 'm'); g.rect(10, 11, 12, 10, 'n'); g.hl(10, 21, 14, 'N'); g.hl(10, 21, 17, 'N')
    g.rect(24, 16, 6, 5, 'B'); g.hl(24, 29, 18, 'u'); return g
def workshop():
    g = G(32, 24); g.rect(3, 8, 22, 13, 'O'); g.hl(2, 25, 7, 'o'); g.hl(3, 24, 8, 'o')
    for x in range(5, 24, 4):
        for y in range(10, 20, 3): g.px(x, y, 'u')
    g.rect(10, 13, 7, 8, 'u'); g.rect(26, 2, 4, 19, 'r'); g.hl(26, 29, 2, 'R'); g.px(27, 0, 'n'); g.px(28, 1, 'W')
    return g
def archive():
    g = G(32, 24); g.rect(3, 8, 26, 13, 'p'); g.hl(2, 29, 7, 'P'); g.hl(4, 27, 6, 'P'); g.hl(6, 25, 5, 'b')
    g.rect(13, 13, 6, 8, 'u'); g.rect(6, 11, 5, 5, 'w'); g.rect(7, 12, 3, 3, 'y'); g.rect(21, 11, 5, 5, 'w'); g.rect(22, 12, 3, 3, 'y')
    return g
def terminal():
    g = G(16, 24); g.rect(3, 6, 10, 15, 'M'); g.hl(3, 12, 6, 'W'); g.rect(4, 8, 8, 6, 'x'); g.hl(5, 10, 10, 'Q'); g.px(6, 9, 'Q')
    g.px(5, 16, 'y'); g.px(8, 16, 'y'); g.px(11, 16, 'r'); g.hl(4, 11, 18, 'm'); return g
def history():
    g = G(32, 24); g.rect(4, 15, 24, 6, 'n'); g.hl(4, 27, 15, 'W'); g.shade()
    for y in range(4, 12):
        hw = (y - 4) * 2 + 2
        for x in range(16 - hw, 16 + hw): g.px(x, y, 'S' if x < 16 else 's')
    g.vl(5, 11, 14, 'b'); g.vl(26, 11, 14, 'b'); g.rect(13, 11, 6, 4, 'v'); g.px(15, 11, 'V')
    return g
def plot():
    g = G(16, 16)
    for x, y in ((2, 4), (13, 4), (2, 13), (13, 13)): g.vl(x, y - 3, y, 'b')
    for x in range(3, 13, 2): g.px(x, 2, 'p'); g.px(x, 11, 'p')
    g.rect(6, 6, 4, 3, 'P'); g.vl(7, 9, 12, 'b'); return g
def lamp():
    g = G(16, 24); g.vl(7, 6, 21, 'k'); g.vl(8, 6, 21, 'n'); g.rect(5, 2, 6, 5, 'Y'); g.rect(6, 3, 4, 3, 'F'); g.hl(5, 10, 1, 'k'); g.hl(5, 10, 21, 'N'); return g
def scrap():
    g = G(16, 16); g.rect(3, 9, 6, 3, 'm'); g.rect(7, 7, 4, 3, 'M'); g.px(9, 8, 'k'); g.rect(10, 10, 4, 2, 'o'); g.hl(2, 6, 12, 'M'); return g
def rubble():
    g = G(16, 16); r = random.Random(3)
    for _ in range(40):
        x, y = r.randrange(1, 15), r.randrange(4, 15); g.rect(x, y, r.randint(1, 3), r.randint(1, 2), r.choice('nNNW'))
    return g

done('hq_tent', tent(), 'Camp shelter: canvas, a flag, a crate of supplies.')
done('hq_crate', crate(), 'The initial stores: one stout crate.')
done('hq_lab', lab(), 'Research Station: field table, microscope, papers, lamp.')
done('hq_nav', navc(), 'Navigation Center: riveted hut and lattice mast with a dish.')
done('hq_depot', depot(), 'Resource Depot: corrugated shed and crates.')
done('hq_workshop', workshop(), 'Workshop: riveted copper hut, brick chimney.')
done('hq_archive', archive(), 'Card Archive: a timber cabinet-house.')
done('hq_terminal', terminal(), 'Restoration Terminal: console with a green screen.')
done('hq_history', history(), 'Historical Archive: canvas pavilion over a stone plinth.')
done('hq_plot', plot(), 'A staked plot, waiting to be built.')
done('hq_lamp', lamp(), 'A camp lamp post.')
done('hq_scrap', scrap(), 'Wreckage from the crash.')
done('hq_rubble', rubble(), 'Rockfall.')

# ── the ancient ruins: one shape, two states ──
def house():
    g = G(32, 24); g.rect(3, 6, 26, 15, 'n'); g.hl(2, 29, 5, 'W'); g.hl(2, 29, 4, 'N')
    g.rect(13, 12, 6, 9, 'u'); g.rect(5, 9, 4, 4, 'k'); g.rect(23, 9, 4, 4, 'k'); g.hl(3, 28, 18, 'P'); g.shade(); return g
def hall():
    g = G(48, 28)
    for y in range(3, 9):
        hw = (y - 3) * 4 + 3
        for x in range(24 - hw, 24 + hw): g.px(x, y, 'W' if y == 8 else 'n')
    g.hl(2, 45, 9, 'N'); g.rect(4, 10, 40, 2, 'n')
    for x in range(5, 44, 6): g.rect(x, 12, 3, 12, 'W'); g.vl(x + 2, 12, 23, 'N')
    g.rect(2, 24, 44, 2, 'N'); g.hl(2, 45, 24, 'n'); g.rect(21, 4, 6, 3, 'y'); return g
def obelisk():
    g = G(16, 40)
    for y in range(3, 36):
        hw = 2 + (y - 3) // 9
        for x in range(8 - hw, 8 + hw): g.px(x, y, 'n')
    g.px(7, 2, 'n'); g.px(8, 2, 'n'); g.hl(5, 10, 14, 'y'); g.hl(5, 10, 16, 'y'); g.rect(3, 36, 10, 3, 'N'); g.shade(); return g
def vault(excavated):
    g = G(32, 16)
    if excavated:
        g.rect(3, 4, 26, 10, 'n'); g.hl(3, 28, 4, 'W'); g.rect(11, 6, 10, 8, 'k')
        for i in range(4): g.hl(12 + i, 19 - i, 7 + i * 2, 'N')
        g.shade()
    else:
        for y in range(6, 15):
            hw = min(14, (y - 6) * 3 + 4)
            for x in range(16 - hw, 16 + hw): g.px(x, y, 'P' if (x + y) % 5 else 'p')
        for x, y in ((9, 9), (20, 10), (14, 8)): g.rect(x, y, 3, 2, 'n')
    return g
def plaza():
    g = G(32, 24)
    for y in range(12, 23):
        for x in range(2, 30):
            if ((x - 16) / 14) ** 2 + ((y - 17.5) / 5.5) ** 2 <= 1: g.px(x, y, 'P')
    for cx in (5, 11, 21, 27, 16):
        top = 4 if cx != 16 else 2
        g.rect(cx - 1, top, 3, 16 - top, 'n')
    g.shade(); return g
def wall():
    g = G(32, 20); g.rect(1, 3, 30, 15, 'n'); g.hl(1, 30, 3, 'W'); g.hl(1, 30, 17, 'N')
    for x in range(6, 26, 4):
        g.vl(x, 7, 13, 'y'); g.hl(x - 1, x + 1, 10, 'y')
    g.shade(); return g
def spire_old():
    g = G(32, 40)
    for y in range(6, 36):
        hw = 2 + (y - 6) // 6
        for x in range(16 - hw, 16 + hw): g.px(x, y, 'n')
    for y in range(14, 19):
        for x in range(3, 29):
            if ((x - 16) / 12) ** 2 + ((y - 16) / 2) ** 2 <= 1 and not (13 <= x <= 18): g.px(x, y, 'c')
    g.rect(14, 2, 4, 4, 'C'); g.rect(8, 36, 16, 3, 'N'); g.shade(); return g

RUINS = [('house', house), ('hall', hall), ('obelisk', obelisk), ('plaza', plaza), ('wall', wall), ('spire_old', spire_old)]
for i, (nm, fn) in enumerate(RUINS):
    done('rest_' + nm, fn(), 'NASARUS · restored. Ancient style not yet approved canon: neutral worked stone.')
    gr = fn(); gr.damage(100 + i * 7, keep=.42, holes=24, rubble=18)
    for row in gr.g:
        for x, ch in enumerate(row):
            if ch in 'cC': row[x] = 'N'
    done('ruin_' + nm, gr, 'NASARUS · ruined state.')
done('ruin_vault', vault(False), 'NASARUS · a buried structure under a mound.')
done('rest_vault', vault(True), 'NASARUS · the buried structure, excavated.')

PAL_HQ = {"n": "#9a948a", "N": "#5e5a52", "W": "#cfc8b8", "P": "#a89670", "p": "#8a7a58", "y": "#c8a860", "c": "#7fb8c8", "C": "#c8f0ff"}
p = os.path.join(ROOT, 'explorer/art.js'); s = open(p, encoding='utf-8').read()
s = re.sub(r'\n    // ── NASARUS HQ \(generated\) ──.*?// ── end NASARUS HQ ──\n', '\n', s, flags=re.S)
block = '\n    // ── NASARUS HQ (generated by tools/explorer/build_hq_art.py) ──\n'
for name, (rows, note, pal) in S.items():
    pp = dict(PAL_HQ) if (name.startswith('ruin_') or name.startswith('rest_') or name in ('hq_rubble', 'hq_history')) else {}
    block += '    %s: { group:"hq", note:%s,%s\n      rows:[%s] },\n' % (name, json.dumps(note), (' pal:' + json.dumps(pp) + ',') if pp else '', ',\n      '.join(json.dumps(r) for r in rows))
block += '    // ── end NASARUS HQ ──\n'
block = block.replace('(generated by tools/explorer/build_hq_art.py)', '(generated)')
anchor = '    face_m: {'
assert anchor in s
s = s.replace(anchor, block.lstrip('\n') + anchor, 1)
open(p, 'w', encoding='utf-8').write(s)
print(len(S), 'sprites')
