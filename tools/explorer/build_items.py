#!/usr/bin/env python3
"""Build the AOV Saga item catalog into Aethryx Adventures: 1936.

Source: data/catalog/items_catalog_1963.xlsx (the Creator's official item catalog so far)
  ITEM CATALOG     81 core items: 27 materials, 27 machines, 27 modifications
  PLANETARY ITEMS  840 world items: 28 planets x (10 materials, 10 machines, 10 modifications)
Outputs:
  game_roster/items_catalog.json   every item, every column, as the catalog has it
  explorer/items.js                the game table (window.AOV_ITEMS) with a native pixel icon for every item,
                                   and a field node for every material (where it is gathered)

Design status (from the catalog): proposed game content. The game shows every item in the AstraNav ITEM
CATALOG. Materials can be gathered now: each planet's ten are its unique resources, as the AA:1936 handoff
confirms. Machines and modifications wait for Build Mode. Ovauron's thirty items stay sealed (AEP-28 is not
landable or described).

Icons follow the 2D block-game references the Creator sent: ores, ingots, crystals, piles, bottles, bundles,
bones and leaves for materials; isometric machine blocks for machines; potions, capsules, keys, wards and
markers for modifications. The planet's colours tint each item, and a per-item seed varies the details, so
no two icons are the same.
Run: python3 tools/explorer/build_items.py [--preview]
"""
import json, math, os, random, re, sys, hashlib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import openpyxl
from build_world_art import G, ramp, shift, mix, lum, sprite, ENVS, env_cols, OUTLINE, P

WB = openpyxl.load_workbook(P('data/catalog/items_catalog_1963.xlsx'), read_only=True)
def norm(s): return re.sub(r'[^a-z0-9]', '', str(s or '').lower())
PLANET_ENV = {'quorana': 'quorauna'}
SEALED = {'ovauron'}

items = []
for r in list(WB['ITEM CATALOG'].iter_rows(values_only=True))[6:]:
    if not r[0]: continue
    items.append({'id': r[0], 'name': r[1], 'cat': r[2], 'register': r[3], 'anchor': r[4], 'function': r[5], 'role': r[6], 'rarity': r[7], 'acquire': r[8], 'note': r[9], 'planet': None})
for r in list(WB['PLANETARY ITEMS'].iter_rows(values_only=True))[6:]:
    if not r[0]: continue
    items.append({'id': r[0], 'planet': r[1], 'cat': r[2], 'name': r[3], 'register': r[4], 'anchor': r[5], 'function': r[6], 'role': r[7], 'rarity': r[8], 'acquire': r[9], 'note': r[10]})

# ── icon families ──
MAT_FAM = [
    (r'salt|sugar', 'pile_cryst'), (r'ore|vein|iron\b|gold|nugget', 'ore'), (r'fib(re|er)|thread|silk|wire|filament|reed|vine|knot|chain|chord', 'bundle'),
    (r'glass|foil|mirror|pane', 'glass'), (r'ink|wax|resin|sap|blood|water|memory|greenblood', 'bottle'), (r'pearl|eye\b|seed|pollen|bead', 'orb'),
    (r'dust|ash|cinder|coal|clay|soil|terra', 'heap'), (r'alloy|steel|metal|ingot|plate|queenmetal|bloodmetal', 'ingot'),
    (r'stone|basalt|block|brick', 'block'), (r'crystal|shard|prism|gem|fragment|chip|matrix', 'crystal'),
    (r'bone|fang|claw|tooth', 'bone'), (r'chitin|shell|scale|hide', 'scale'), (r'feather|wing|wisp', 'feather'),
    (r'bark|root|moss|bloom|petal|leaf|vine|wood', 'leaf'), (r'core|heart|ember|voice|silence|corelet|sun', 'core'),
    (r'cog|clockwork|gear', 'gear'), (r'crown', 'crown'), (r'scrap', 'scrap'), (r'data', 'data'), (r'relic', 'relic'), (r'ice|frost', 'crystal')]
MAC_FAM = [(r'gate|bridge|arch|door', 'gate'), (r'lift|elevator', 'lift'), (r'scanner|console|calculator', 'screen'), (r'relay|tower|antenna', 'antenna'),
    (r'beacon|lamp|light', 'beacon'), (r'archive|library|record', 'shelf'), (r'press|piston|drill|pump', 'press'), (r'forge|furnace|foundry|refinery|kiln', 'furnace'),
    (r'loom|spindle|weave', 'loom'), (r'shrine|throne|altar', 'shrine'), (r'vat|pod|reactor|tank|well|cell', 'tank'), (r'engine|turbine|generator|wheel|clock', 'engine'),
    (r'printer|fabricator|workstation|bench', 'bench'), (r'vault|lock|cage|seal', 'vault'), (r'shield|interdictor|ward|brace', 'shieldblock'),
    (r'array|lens|mirror|projector|amplifier|resonator', 'dish'), (r'choir|bell', 'bell'), (r'nursery|nest|roost|orchard|habitat|garden|bioforge', 'nursery'),
    (r'anchor|rail|hub|node|core|heart', 'core_block'), (r'rocketship|jetpack|astranav', 'rocket')]
MOD_FAM = [(r'mend|salve|cure|dose|patch|stitch|cleanser|breath|thaw|growth|bloom', 'potion'), (r'ward|guard|shield|skin|brace|coat|cloak|mantle|veil|screen', 'ward'),
    (r'charge|surge|pulse|burst|overload|fuse|cell|capsule|cartridge|overdrive|coil', 'capsule'), (r'recall|return|route|marker|mark|tag|beacon|flare|signal|ping|call|rally', 'marker'),
    (r'dash|step|rush|lift|shift|skip|wake|pull', 'boot'), (r'key|pass|lock|break|hack|override|token|sigil|seal|overprint', 'key'),
    (r'lens|focus|eye|scan|trace|prism', 'lens'), (r'seed', 'seedpack'), (r'decoy|trap|hook|clamp', 'trap'), (r'sync|link|lattice|thread|swarm|mod', 'link'),
    (r'anchor|soulanchor', 'anchor'), (r'frost|silence|pause|reset|resolve|adapt|form|voice|roar|ink|cog|wavecall|fangburst', 'rune')]
def family(it):
    n = it['name'].lower(); table = MAT_FAM if it['cat'] == 'MATERIAL' else MAC_FAM if it['cat'] == 'MACHINE' else MOD_FAM
    last = n.split()[-1]
    for rx, f in table:
        if re.search(rx, last): return f
    for rx, f in table:
        if re.search(rx, n): return f
    return {'MATERIAL': 'crystal', 'MACHINE': 'core_block', 'MODIFICATION': 'rune'}[it['cat']]

RARITY = {'Common': 0, 'Uncommon': 1, 'Rare': 2, 'Very rare': 3, 'Mythic': 4}
REG_COL = {'creation': '#ffd27a', 'past': '#c8a46a', 'memory': '#9fd2e6', 'destruction': '#e85a2c', 'mind': '#7a9ae0', 'present': '#7cc85a', 'balance': '#7cc85a',
           'preservation': '#8a9aa8', 'body': '#c86a6a', 'future': '#5fe6d8', 'systems': '#5fe6d8', 'spirit': '#b88ae8', 'tech': '#9aa2a8', 'crystal': '#5fb8e0',
           'unknown': '#6a5a8a', 'corrupted': '#8a2a5a', 'astral': '#3d365b'}
def colours(it):
    pl = (it['planet'] or '').lower(); e = ENVS.get(PLANET_ENV.get(pl, pl))
    reg = (it['register'] or '').lower(); rc = next((c for k, c in REG_COL.items() if k in reg), '#c8a46a')
    h = int(hashlib.md5(it['id'].encode()).hexdigest()[:6], 16)
    if e:
        ground, path, liquid, wall, acc, special = env_cols(e)
        base = [acc, ground, wall, liquid, rc][h % 5]
    else: base, wall = rc, '#8a8478'
    if abs(lum(base) - .5) > .33: base = shift(base, .5 - lum(base))
    base = shift(base, 0, 0, ((h >> 8) % 7 - 3) * .012)   # each item a slightly different hue
    return base, rc, (wall if e else '#8a8478'), h

def pal_of(base, acc):
    d = dict(zip('abcde', ramp(base))); d['a'] = mix(d['a'], d['b'], .4)
    d['f'] = acc if abs(lum(acc) - lum(base)) > .15 else shift(acc, .25 if lum(base) < .5 else -.25, .15); d['g'] = shift(d['f'], .2, -.05)
    return d

# ── drawing (16 × 16), each with the item's own seed ──
def iso_cube(g, top='e', left='c', right='b'):
    # an isometric block: a top rhombus and two side faces (the 3/4 inventory-block look)
    g.poly([(1, 11.5), (1, 4.5), (8, 8), (8, 15)], left)
    g.poly([(8, 8), (15, 4.5), (15, 11.5), (8, 15)], right)
    g.poly([(1, 4.5), (8, 1), (15, 4.5), (8, 8)], top)
def draw(it, fam, r):
    g = G()
    if fam == 'ore':
        g.ell(7.5, 8.5, 6.5, 6, 'b'); g.ell(6.5, 7, 4.5, 3.5, 'c'); g.px(4, 5, 'd')
        for _ in range(5 + r.randrange(3)): x, y = r.randrange(4, 12), r.randrange(4, 13); g.px(x, y, 'f'); g.px(x + 1, y, 'g') if r.random() < .5 else None
    elif fam == 'pile_cryst':
        g.poly([(1, 14), (8, 6 + r.randrange(2)), (15, 14)], 'c'); g.line(3, 13, 8, 7, 'd')
        for _ in range(7): x, y = r.randrange(4, 12), r.randrange(9, 14); g.px(x, y, 'e')
        g.poly([(7, 7), (8, 3), (9, 7)], 'f')
    elif fam == 'heap':
        g.ell(7.5, 12, 7, 3.5, 'c'); g.ell(7.5, 10, 4.5, 3, 'c'); g.ell(6, 9, 2.5, 1.5, 'd')
        for _ in range(8): g.px(r.randrange(2, 14), r.randrange(9, 15), r.choice('bdf'))
    elif fam == 'bundle':
        n = 3 + r.randrange(2)
        for i in range(n): g.line(3 + i, 14, 10 + i, 2 + r.randrange(3), 'c' if i % 2 else 'd')
        g.rect(4, 8, 8, 2, 'f'); g.px(5, 8, 'g')
    elif fam == 'glass':
        g.poly([(3, 14), (4, 3), (12, 2), (13, 13)], 'c'); g.line(5, 4, 4, 12, 'e'); g.line(7, 4, 6, 8, 'e'); g.poly([(10, 13), (13, 13), (12, 6)], 'b')
    elif fam == 'bottle':
        g.rect(6, 1, 4, 2, 'b'); g.rect(7, 3, 2, 2, 'e'); g.ell(7.5, 10, 5, 4.5, 'e'); g.ell(7.5, 11, 4, 3, 'f'); g.px(5, 8, 'g'); g.px(5, 9, 'g')
    elif fam == 'orb':
        g.ell(7.5, 8, 5.5, 5.5, 'c'); g.ell(6, 6.5, 2.5, 2.5, 'd'); g.ell(5.5, 5.5, 1, 1, 'e'); g.ell(10, 11, 2, 1.5, 'b')
        if r.random() < .5: g.ell(7.5, 8, 1.5, 1.5, 'f')
    elif fam == 'ingot':
        g.poly([(1, 11), (5, 6), (15, 6), (11, 11)], 'd'); g.poly([(1, 11), (11, 11), (11, 14), (1, 14)], 'c'); g.poly([(11, 11), (15, 6), (15, 9), (11, 14)], 'b')
        g.line(4, 8, 9, 8, 'e')
    elif fam == 'block':
        iso_cube(g, 'd', 'c', 'b')
        for _ in range(6): x, y = r.randrange(2, 14), r.randrange(6, 13); g.px(x, y, 'a')
    elif fam == 'crystal':
        k = r.randrange(2, 4)
        g.poly([(5, 14), (8, 1 + r.randrange(2)), (11, 14)], 'c'); g.poly([(8, 2), (11, 14), (9, 14)], 'b'); g.line(7, 3, 6, 12, 'e')
        if k > 2: g.poly([(2, 14), (4, 7), (6, 14)], 'd')
        g.poly([(10, 14), (12, 8), (14, 14)], 'c')
    elif fam == 'bone':
        g.line(3, 12, 12, 3, 'e'); g.line(4, 12, 13, 3, 'd'); g.ell(3, 12.5, 1.5, 1.5, 'e'); g.ell(12.5, 3, 1.5, 1.5, 'e'); g.ell(2, 11, 1, 1, 'd'); g.ell(13.5, 4.5, 1, 1, 'd')
    elif fam == 'scale':
        for y in range(3, 14, 3):
            for x in range(2 + (y % 2) * 2, 14, 4): g.ell(x, y, 2, 1.6, 'c'); g.px(x - 1, y - 1, 'e')
    elif fam == 'feather':
        g.line(4, 14, 11, 2, 'b'); g.poly([(5, 12), (8, 4), (12, 2), (10, 8)], 'c'); g.line(6, 11, 10, 4, 'e')
    elif fam == 'leaf':
        g.ell(7.5, 7.5, 5, 6, 'c'); g.line(4, 13, 11, 2, 'b'); g.ell(6, 6, 2, 2.5, 'd'); g.px(9, 9, 'f')
    elif fam == 'core':
        g.ell(7.5, 8, 6, 6, 'b'); g.ell(7.5, 8, 4, 4, 'f'); g.ell(7.5, 8, 2, 2, 'g'); g.px(6, 6, 'e')
        for a in range(0, 360, 90): g.px(7 + round(7 * math.cos(math.radians(a + 45))), 8 + round(7 * math.sin(math.radians(a + 45))), 'f')
    elif fam == 'gear':
        g.ell(7.5, 8, 5, 5, 'c'); g.ell(7.5, 8, 2, 2, '.')
        for a in range(0, 360, 45): g.rect(7 + round(6 * math.cos(math.radians(a))), 7 + round(6 * math.sin(math.radians(a))), 2, 2, 'c')
        g.ell(6, 6, 1.5, 1, 'e')
    elif fam == 'crown':
        g.rect(3, 9, 10, 4, 'c'); g.poly([(3, 9), (4, 4), (6, 8), (8, 3), (10, 8), (12, 4), (13, 9)], 'c'); g.px(8, 10, 'f'); g.px(5, 10, 'f'); g.px(11, 10, 'f')
    elif fam in ('scrap', 'data', 'relic'):
        g.ell(7.5, 8, 6, 6, 'c'); g.ell(6, 6, 2, 2, 'e')
    # machines: isometric blocks with a face that says what they do
    elif fam in ('gate', 'lift', 'screen', 'antenna', 'beacon', 'shelf', 'press', 'furnace', 'loom', 'shrine', 'tank', 'engine', 'bench', 'vault', 'shieldblock', 'dish', 'bell', 'nursery', 'core_block', 'rocket'):
        iso_cube(g, 'd', 'c', 'b')
        fx, fy = 2, 7   # front-left face area
        if fam == 'gate': g.ell(4, 11, 2, 3, 'k'); g.rect(2, 11, 5, 3, 'k'); g.px(4, 9, 'f')
        elif fam == 'lift': g.line(4, 8, 4, 13, 'f'); g.line(3, 9, 4, 8, 'f'); g.line(5, 9, 4, 8, 'f'); g.line(11, 8, 11, 13, 'f'); g.line(10, 12, 11, 13, 'f'); g.line(12, 12, 11, 13, 'f')
        elif fam == 'screen': g.rect(2, 8, 5, 4, 'k'); g.rect(3, 9, 3, 2, 'f'); g.px(4, 9, 'g')
        elif fam == 'antenna': g.line(8, 0, 8, 4, 'b'); g.px(8, 0, 'f'); g.line(6, 1, 10, 1, 'b'); g.rect(3, 9, 3, 2, 'f')
        elif fam == 'beacon': g.ell(8, 4, 2.5, 2, 'f'); g.ell(8, 4, 1, 1, 'g'); g.rect(3, 9, 3, 3, 'e')
        elif fam == 'shelf':
            for y in (8, 11): g.line(2, y, 6, y, 'a')
            for x in (2, 4, 6): g.line(x, 9, x, 10, 'f'); g.line(x, 12, x, 13, 'g')
        elif fam == 'press': g.rect(3, 7, 3, 2, 'a'); g.line(4, 9, 4, 11, 'e'); g.rect(2, 12, 5, 1, 'a'); g.rect(10, 9, 3, 3, 'f')
        elif fam == 'furnace': g.rect(2, 10, 5, 3, 'k'); g.rect(3, 11, 3, 2, 'f'); g.px(4, 11, 'g'); g.line(2, 8, 6, 8, 'a')
        elif fam == 'loom':
            for x in (2, 4, 6): g.line(x, 8, x, 13, 'f')
            g.line(2, 10, 6, 10, 'e')
        elif fam == 'shrine': g.poly([(6, 6), (8, 0), (10, 6)], 'f'); g.line(8, 1, 8, 5, 'g')
        elif fam == 'tank': g.ell(3.5, 10.5, 1.5, 2.5, 'f'); g.ell(11.5, 10.5, 1.5, 2.5, 'f'); g.px(3, 9, 'g')
        elif fam == 'engine':
            g.ell(4, 10.5, 2.5, 2.5, 'a'); g.ell(4, 10.5, 1, 1, 'f'); g.rect(10, 9, 3, 1, 'f'); g.rect(10, 11, 3, 1, 'f')
        elif fam == 'bench': g.rect(2, 9, 5, 1, 'a'); g.rect(3, 10, 1, 3, 'a'); g.rect(10, 8, 3, 2, 'f')
        elif fam == 'vault': g.rect(2, 8, 5, 5, 'a'); g.ell(4, 10.5, 1.5, 1.5, 'f'); g.px(4, 10, 'g')
        elif fam == 'shieldblock': g.poly([(2, 8), (6, 8), (6, 11), (4, 13), (2, 11)], 'f'); g.px(3, 9, 'g')
        elif fam == 'dish': g.ell(8, 3, 4, 2, 'e'); g.ell(8, 3, 1, 1, 'f'); g.line(8, 4, 8, 6, 'a')
        elif fam == 'bell': g.poly([(6, 6), (7, 1), (9, 1), (10, 6)], 'f'); g.px(8, 6, 'a')
        elif fam == 'nursery': g.ell(8, 3, 3.5, 2.5, 'f'); g.ell(7, 2, 1.5, 1, 'g'); g.line(8, 4, 8, 6, 'a')
        elif fam == 'core_block': g.ell(4, 10, 2, 2, 'f'); g.px(4, 9, 'g'); g.ell(11.5, 10, 2, 2, 'f')
        elif fam == 'rocket': g.poly([(6, 7), (8, 0), (10, 7)], 'e'); g.px(8, 3, 'f')
        for _ in range(3): g.px(r.randrange(9, 14), r.randrange(8, 13), 'a')
    # modifications: things you carry and use
    elif fam == 'potion':
        g.rect(6, 1, 4, 2, 'b'); g.rect(7, 3, 2, 2, 'e'); g.poly([(4, 13), (5, 6), (11, 6), (12, 13)], 'e'); g.poly([(5, 13), (5, 9), (11, 9), (11, 13)], 'f'); g.px(6, 7, 'g')
    elif fam == 'ward':
        g.poly([(2, 3), (14, 3), (14, 9), (8, 15), (2, 9)], 'c'); g.poly([(8, 3), (14, 3), (14, 9), (8, 15)], 'b'); g.line(3, 4, 3, 9, 'e'); g.ell(8, 8, 2, 2, 'f')
    elif fam == 'capsule':
        g.rect(5, 2, 6, 12, 'c'); g.rect(5, 2, 6, 2, 'b'); g.rect(5, 12, 6, 2, 'b'); g.poly([(9, 4), (6, 9), (8, 9), (7, 12), (10, 7), (8, 7)], 'f')
    elif fam == 'marker':
        g.line(5, 2, 5, 15, 'b'); g.poly([(6, 2), (13, 4), (6, 8)], 'f'); g.px(7, 4, 'g'); g.ell(5, 15, 2, .8, 'a')
    elif fam == 'boot':
        g.rect(5, 3, 5, 8, 'c'); g.rect(5, 10, 9, 4, 'c'); g.rect(5, 13, 9, 1, 'b'); g.line(2, 6, 4, 6, 'f'); g.line(1, 9, 4, 9, 'f'); g.line(2, 12, 4, 12, 'f')
    elif fam == 'key':
        g.ell(5, 5, 3.5, 3.5, 'c'); g.ell(5, 5, 1.5, 1.5, '.'); g.line(7, 7, 14, 14, 'c'); g.line(8, 7, 14, 13, 'd'); g.line(11, 11, 12, 10, 'c'); g.line(13, 13, 14, 12, 'c'); g.px(4, 3, 'f')
    elif fam == 'lens':
        g.ell(6.5, 6.5, 5, 5, 'b'); g.ell(6.5, 6.5, 3.5, 3.5, 'e'); g.ell(5.5, 5.5, 1.5, 1.5, 'g'); g.line(10, 10, 14, 14, 'a'); g.line(11, 10, 14, 13, 'c')
    elif fam == 'seedpack':
        g.rect(3, 2, 10, 12, 'e'); g.rect(3, 2, 10, 2, 'b'); g.ell(8, 9, 2.5, 3, 'f'); g.line(8, 6, 8, 4, 'c')
    elif fam == 'trap':
        g.ell(7.5, 11, 6, 3, 'b'); g.ell(7.5, 11, 3, 1.5, 'k')
        for x in range(3, 13, 2): g.line(x, 9, x, 6, 'e')
    elif fam == 'link':
        g.ell(5.5, 8, 3.5, 3.5, 'c'); g.ell(5.5, 8, 2, 2, '.'); g.ell(10.5, 8, 3.5, 3.5, 'f'); g.ell(10.5, 8, 2, 2, '.')
    elif fam == 'anchor':
        g.line(8, 2, 8, 13, 'c'); g.line(5, 5, 11, 5, 'c'); g.ell(8, 2, 1.5, 1.5, 'c'); g.line(3, 10, 8, 14, 'c'); g.line(13, 10, 8, 14, 'c'); g.px(8, 8, 'f')
    else:   # rune: a carved token with the item's sigil
        g.ell(7.5, 8, 6, 6, 'c'); g.ell(7.5, 8, 4.5, 4.5, 'b')
        pts = [(r.randrange(5, 11), r.randrange(5, 11)) for _ in range(3)]
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]): g.line(x0, y0, x1, y1, 'f')
        g.px(5, 4, 'e')
    g.outline()
    return g

# ── field nodes: where a material is gathered (16 × 16, drawn over the ground) ──
def node(it, fam, r):
    g = G()
    if fam in ('bundle', 'leaf', 'feather', 'orb') and re.search(r'reed|vine|root|moss|bloom|petal|leaf|fib|seed|pollen|thread|silk|bark|wood|sap|resin', it['name'], re.I):
        for _ in range(5): x = r.randrange(3, 13); g.line(x, 14, x + r.choice((-1, 0, 1)), 6 + r.randrange(4), 'c')
        for _ in range(3): g.px(r.randrange(3, 13), r.randrange(5, 10), 'f')
        g.ell(7.5, 14, 6, 1, 'b')
    elif fam in ('bottle',) or re.search(r'water|ink|blood|wax', it['name'], re.I):
        g.ell(7.5, 11, 6.5, 3, 'b'); g.ell(7.5, 11, 5, 2, 'f'); g.ell(5.5, 10.5, 1.5, .8, 'g')
    elif fam in ('crystal', 'pile_cryst', 'glass'):
        g.ell(7.5, 13, 6.5, 2, 'a')
        for x0 in (4, 8, 11):
            h = 5 + r.randrange(5); g.poly([(x0 - 2, 14), (x0, 14 - h), (x0 + 2, 14)], 'f'); g.line(x0, 15 - h, x0, 13, 'g')
    elif fam in ('bone', 'scale'):
        g.ell(7.5, 12, 6, 2.5, 'a'); g.line(3, 11, 12, 8, 'e'); g.line(4, 12, 13, 9, 'd'); g.ell(6, 10, 1.5, 1, 'e')
    else:   # an ore lump in the world's own stone, the material showing through
        g.ell(7.5, 10, 6.5, 4.5, 'b'); g.ell(6.5, 9, 4.5, 3, 'c'); g.px(4, 7, 'd')
        for _ in range(6): x, y = r.randrange(3, 13), r.randrange(7, 14); g.px(x, y, 'f'); g.px(x + 1, y, 'g') if r.random() < .4 else None
    g.outline()
    return g

def build(preview=False):
    sprites, table = {}, []
    fams = {}
    for it in items:
        sealed = norm(it['planet']) in SEALED
        fam = family(it); base, acc, wall, h = colours(it)
        r = random.Random(it['id'])
        icon = 'ic_' + norm(it['id'])
        if not sealed: sprites[icon] = sprite(draw(it, fam, r), pal_of(base, acc))
        rec = {'id': it['id'], 'n': it['name'], 'c': it['cat'][:3].lower(), 'p': it['planet'], 'r': RARITY.get(it['rarity'], 0), 'fam': fam,
               'reg': it['register'], 'fn': it['function'], 'role': it['role'], 'acq': it['acquire'], 'note': it['note'], 'anchor': it['anchor'], 'icon': icon if not sealed else None}
        if sealed: rec.update({'sealed': True, 'fn': None, 'role': None, 'acq': None, 'note': None})
        if it['cat'] == 'MATERIAL' and not sealed:
            nb = 'nd_' + norm(it['id']); npal = pal_of(base, acc)
            for k, v in zip('abcd', ramp(wall)[:4]): npal[k] = v
            sprites[nb] = sprite(node(it, fam, random.Random('n' + it['id'])), npal); rec['node'] = nb
        fams[fam] = fams.get(fam, 0) + 1
        table.append(rec)
    json.dump({'title': 'AOV Saga · item catalog (game roster)', 'source': 'data/catalog/items_catalog_1963.xlsx', 'items': items},
              open(P('game_roster/items_catalog.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    hdr = '// ★ GENERATED by tools/explorer/build_items.py from data/catalog/items_catalog_1963.xlsx · do not hand-edit.\n'
    js = hdr + '(function(){\n  var S = ' + json.dumps(sprites, separators=(',', ':')) + ';\n' \
         '  var A = window.AOV_ART; if (A && A.SPRITES) Object.keys(S).forEach(function(k){ A.SPRITES[k] = S[k]; });\n' \
         '  window.AOV_ITEMS = ' + json.dumps({'items': table}, ensure_ascii=False, separators=(',', ':')) + ';\n})();\n'
    open(P('explorer/items.js'), 'w', encoding='utf-8').write(js)
    print('items', len(table), 'sealed', sum(1 for t in table if t.get('sealed')), 'sprites', len(sprites), 'bytes', len(js))
    print('families', sorted(fams.items(), key=lambda x: -x[1]))
    if preview: render(sprites, table)

def render(sprites, table):
    from PIL import Image
    def img(name, s=3):
        sp = sprites[name]; rows = sp['rows']; pal = sp['pal']; im = Image.new('RGBA', (len(rows[0]), len(rows)), (0, 0, 0, 0))
        for y, row in enumerate(rows):
            for x, ch in enumerate(row):
                if ch != '.': im.putpixel((x, y), tuple(int(pal[ch][i:i + 2], 16) for i in (1, 3, 5)) + (255,))
        return im.resize((im.width * s, im.height * s), Image.NEAREST)
    shown = [t for t in table if t.get('icon')]
    cols = 30; W = cols * 52; Hh = (len(shown) // cols + 2) * 52
    sheet = Image.new('RGB', (W, Hh), (40, 36, 48))
    for i, t in enumerate(shown):
        x, y = (i % cols) * 52 + 2, (i // cols) * 52 + 2
        sheet.paste(img(t['icon']), (x, y), img(t['icon']))
    path = os.environ.get('ITEM_PREVIEW', '/tmp/items_preview.png'); sheet.save(path); print('preview', path)

if __name__ == '__main__':
    build('--preview' in sys.argv)
