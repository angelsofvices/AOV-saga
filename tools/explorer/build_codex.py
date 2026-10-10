#!/usr/bin/env python3
"""Merge the Master Codex into Aethryx Adventures: 1936.

Sources:
  data/codex/The_AOV_Saga_Master_Codex_v16.3.xlsx   every sheet of the Master Codex
  game_roster/aa1936_roster.json                     the 1936 master roster (kinds ruled by the Creator)
  explorer/environments.js                           world and district names
  docs/card-explorer/02_CARL_NASARO_LIVING_MASTER_CODEX_CANON.md   names the 1936 canon handoff reserves

Outputs:
  game_roster/codex_homes.json   each being's home (world / Zyraxis district) and how it appears in game
  explorer/codex_beings.js       compact being table (always loaded)
  explorer/codex_reference.js    full lore and every reference sheet (loaded when the Codex opens)

Placement (Creator 2026-10-10: Codex Aethren spawn; humanoids are placed):
  aethren   wild on its home world / district (tier IX+ and hidden entries never spawn)
  humanoid  'npc'     every humanoid is alive in 1936 and can be met on their home world
                      (Creator 2026-10-10: "non canon. no one is dead here. full saga living")
  Humanoids whose lore names no world live on Viridia (Creator ruling, 2026-10-10).
Run: python3 tools/explorer/build_codex.py   (then python3 tools/explorer/build_fauna.py)
"""
import json, os, re, unicodedata, openpyxl
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P = lambda *a: os.path.join(ROOT, *a)
def norm(s): return re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode().lower())
def slug(s): return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode().lower())).strip('-')
ROM = {'I':1,'II':2,'III':3,'IV':4,'V':5,'VI':6,'VII':7,'VIII':8,'IX':9,'X':10}

envjs = open(P('explorer/environments.js'), encoding='utf-8').read()
arr = envjs[envjs.index('window.AOV_ENV = ') + 17:]; arr = arr[:arr.index('\n];') + 2]
ENVS = json.loads(arr)
WORLDS = {e['id']: e['no'] for e in ENVS if e['kind'] == 'world'}
DISTRICTS = [e['id'] for e in ENVS if e['kind'] == 'district']
NAMES = {}
for e in ENVS:
    NAMES[e['id']] = ('district', e['id']) if e['kind'] == 'district' else ('world', e['no'])
NAMES['aep28'] = None; NAMES['ovauron'] = None                    # sealed: nothing is placed on AEP-28

roster = json.load(open(P('game_roster/aa1936_roster.json'), encoding='utf-8'))
canon02 = open(P('docs/card-explorer/02_CARL_NASARO_LIVING_MASTER_CODEX_CANON.md'), encoding='utf-8').read()
RESERVED_TIERS = {'God', 'Immortal', 'Demigod', 'Supreme', 'Aetheon'}
DATED = re.compile(r'\b\d{1,4}\s*(CE|BCE|AE|BYA|MYA)\b|\b~?\d+(\.\d+)?\s*(Bya|Mya)\b', re.I)

def home_of(text):
    t = norm(text)
    hits = []
    for key, val in NAMES.items():
        if not val: continue
        i = t.find(key)
        if i >= 0: hits.append((t.count(key), -i, val))
    if not hits: return None
    hits.sort(reverse=True)
    kind, v = hits[0][2]
    return {'world': 9, 'district': v} if kind == 'district' else {'world': v, 'district': None}

wb = openpyxl.load_workbook(P('data/codex/The_AOV_Saga_Master_Codex_v16.3.xlsx'), read_only=True)

# ── beings ──
beings, lore, homes = [], {}, {}
for e in roster['entries']:
    cx = e.get('codex') or {}
    if e['kind'] == 'world': continue                               # Ovauron is AEP-28, sealed
    bid = slug(e['name'])
    text = ' '.join(str(x or '') for x in (cx.get('lore'), cx.get('card')))
    tier = ROM.get(str(cx.get('tier') or '').strip())
    h = home_of(text)
    if not h and e['kind'] == 'humanoid': h = {'world': 27, 'district': None, 'ruled': True}   # Creator 2026-10-10: humanoids with no world named are all on Viridia
    place, why = None, ''
    if e['kind'] == 'aethren':
        place = 'wild'; why = 'Aethren' + (' · home from Codex lore' if h else ' · home by tier (Zyraxis)')
    else:
        place, why = 'npc', 'alive in 1936 (Creator: no one is dead here · full saga living)'
    st = cx.get('stats') or {}
    blurb = re.sub(r'^\s*\[[^\]]*\]\s*', '', next((p for p in re.split(r'\n\s*\n', str(cx.get('lore') or '')) if p.strip() and not p.strip().startswith('★') and not re.search(r'\bv\d+\.\d+', p)), '')).strip()
    blurb = re.split(r'(?<=[.!?])\s', blurb)[0][:280] if blurb else ''
    b = {'id': bid, 'name': e['name'], 'kind': e['kind'], 'cls': cx.get('class'), 'tier': tier, 'tierName': cx.get('tierName'),
         'types': cx.get('types') or [], 'arch': cx.get('archetype'), 'stats': {k: st.get(k) for k in ('hp','atk','def','spd','spc','total')} if st else None,
         'home': h, 'place': place, 'blurb': blurb, 'official': e['source'].startswith('1936'), 'aliases': e.get('aliases', [])}
    beings.append(b)
    # player-facing lore: drop the Codex's editorial notes (★ correction/reframe paragraphs, version tags)
    paras = []
    for x in (cx.get('lore'), cx.get('card')):
        for para in re.split(r'\n\s*\n|\n(?=★)', str(x or '')):
            t = para.split('★')[0].strip()
            t = ' '.join(x for x in re.split(r'(?<=[.!?])\s+', t) if not re.search(r'\bv\d+\.\d+', x)).strip()
            if not t or t.startswith('★') or re.search(r'\bv\d+\.\d+|\bCANON (CORRECTION|NOTE|REFRAME)|\bREFRAME\b|\bretcon', t, re.I): continue
            paras.append(t)
    if paras: lore[bid] = '\n\n'.join(paras)
    homes[bid] = {'name': e['name'], 'kind': e['kind'], 'home': h, 'place': place, 'why': why}

# ── reference sheets: pages split at ★ headers ──
def pages(sheet, title):
    ws = wb[sheet]; out = []; cur = None
    for r in ws.iter_rows(values_only=True):
        vals = [str(v).strip() for v in r if v is not None and str(v).strip() not in ('', 'None')]
        if not vals: continue
        if len(vals) == 1 and vals[0].startswith('★'):
            cur = {'title': vals[0].strip('★ ').strip(), 'rows': []}; out.append(cur); continue
        if cur is None: cur = {'title': title, 'rows': []}; out.append(cur)
        cur['rows'].append(vals)
    return out
sections = [{'key': 'worlds', 'title': 'WORLDS', 'pages': pages('WORLDS', 'WORLDS')},
            {'key': 'cosmic', 'title': 'COSMIC THEORIES', 'pages': pages('COSMIC THEORIES', 'COSMIC THEORIES')},
            {'key': 'books', 'title': 'BOOKS', 'pages': pages('BOOKS', 'BOOKS')},
            {'key': 'games', 'title': 'GAMES', 'pages': pages('GAMES', 'GAMES')}]
index = []
for r in wb['INDEX'].iter_rows(min_row=4, values_only=True):
    if r[1] and r[0] and not str(r[0]).startswith('★'): index.append([str(r[0]), str(r[1]), str(r[2] or '')])

# ── the TIMELINE (timeline.html on the site): one page per era card ──
tl = open(P('timeline.html'), encoding='utf-8').read()
def strip(h): return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', h)).strip()
tlpages = []
for card in re.findall(r'<div class="era-card">(.*?)</div>\s*</div>', tl, re.S):
    name = re.search(r'class="era-name">(.*?)</h3>', card, re.S); span = re.search(r'class="era-span">(.*?)</div>', card, re.S)
    sub = re.search(r'class="era-sub">(.*?)</div>', card, re.S); body = re.findall(r'class="era-body">(.*?)</p>', card, re.S)
    facts = re.findall(r'class="planet-fact">(.*?)</div>', card, re.S)
    if not name: continue
    rows = [[strip(x)] for x in ([span.group(1)] if span else []) + ([sub.group(1)] if sub else []) + body + facts if strip(x)]
    tlpages.append({'title': strip(name.group(1)), 'rows': rows})
sections.append({'key': 'timeline', 'title': 'TIMELINE', 'pages': tlpages})

# ── EVERYTHING ON THE GROUND (Creator 2026-10-10: "make sure all entries are placed in world ... all things
# mentioned in every file"). Each Index entry that is not a being, and every page of every section, gets a
# physical place: a landmark (places), a find (items, relics), or a record stone (events, concepts, pages).
# Home = the world / district the text names most; Books → Viridia, Games → Zyraxis, the rest → Lumeria
# (the Recorder World). AEP-28 is sealed, so nothing about it can be placed.
being_keys = {norm(b['name']) for b in beings} | {norm(a) for b in beings for a in b.get('aliases', [])}
WORLD_KEYS = {k for k in NAMES if NAMES[k]}
PLACE_RX = re.compile(r'\((?:North|South|East|West|Central)[a-z]* Region|\b(city|capital|district|valley|docks?|towers?|sacred site|canyon|temple|academy|harbou?r|port|fortress|citadel|keep|castle|palace|village|town|forest|mountain|peaks?|lake|sea|ocean|desert|plains?|fields|junction|gate|bridge|ruins?|shrine|cathedral|arena|market|quarter|vale|reach|isle|island|coast|marsh|swamp|caverns?|mines?)\b', re.I)
META_RX = re.compile(r'(formula|structure|codification|per[- ]district|endgame|routes|network|chart|\brule\b|\bcanon\b|\bv\d|distribution|origin|affinity| vs )', re.I)
REGION_RX = re.compile(r'\((?:North|South|East|West|Central)[a-z]* Region|^\s*(?:a|the)?\s*(?:city|capital|district|valley|temple|fortress|citadel|village|town|region|sacred site)\b', re.I)
ITEM_RX = re.compile(r'\b(relic|gem|gemstone|astralite|prism|seed|sword|blade|crown|orb|scroll|tome|artifact|artefact|amulet|ring|key|shard|stone of|staff|spear|shield|armou?r|vessel|zycube|serum|potion|elixir|core)\b', re.I)
def home_or(text, fallback):
    h = home_of(text)
    if h: return h
    return fallback
LUMERIA = {'world': WORLDS['lumeria'], 'district': None}
VIRIDIA = {'world': 27, 'district': None}
ZYR = {'world': 9, 'district': None}
SEALED = re.compile(r'ovauron|primalutonia|drift planet|aep[- ]?28|\bae-28\b', re.I)
places = []
for letter, term, desc in index:
    k = norm(term)
    if k in being_keys or k in WORLD_KEYS: continue                     # beings are placed already; worlds are the worlds
    if SEALED.search(term): continue   # sealed: AEP-28 under every name (descriptions that mention it are redacted in game)
    kind = 'rec' if META_RX.search(term) else 'lm' if PLACE_RX.search(term) or REGION_RX.search(desc[:80]) else 'find' if ITEM_RX.search(term) else 'rec'
    places.append({'t': kind, 'home': home_or(term + ' ' + desc, LUMERIA), 'term': term})
for sec in sections:
    fb = VIRIDIA if sec['key'] == 'books' else ZYR if sec['key'] == 'games' else LUMERIA
    for i, pg in enumerate(sec['pages']):
        text = pg['title'] + ' ' + ' '.join(' '.join(r) for r in pg['rows'])
        if SEALED.search(pg['title']): continue
        h = home_of(pg['title']) or (fb if sec['key'] in ('books', 'games') else home_of(text) or fb)
        places.append({'t': 'rec', 'home': h, 'page': sec['key'] + ':' + i.__str__()})
# group records five to a stone, per world (and district)
grouped, stones = {}, []
for pl in places:
    if pl['t'] != 'rec': continue
    key = (pl['home']['world'], pl['home'].get('district'))
    grouped.setdefault(key, []).append(pl)
for (w, d), items in grouped.items():
    for k in range(0, len(items), 5):
        chunk = items[k:k + 5]
        stones.append({'t': 'rec', 'home': {'world': w, 'district': d}, 'terms': [c['term'] for c in chunk if 'term' in c], 'pages': [c['page'] for c in chunk if 'page' in c]})
placements = [p for p in places if p['t'] != 'rec'] + stones
from collections import Counter as _C
print('placements', _C(p['t'] for p in placements), 'index entries placed', sum(1 for p in places if 'term' in p), 'pages placed', sum(1 for p in places if 'page' in p))
print('by world', _C(p['home']['world'] for p in placements).most_common(8))

json.dump(homes, open(P('game_roster/codex_homes.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
hdr = '// ★ GENERATED by tools/explorer/build_codex.py from the Master Codex v16.3 · do not hand-edit.\n'
open(P('explorer/codex_beings.js'), 'w', encoding='utf-8').write(hdr + 'window.AOV_CODEX = ' + json.dumps({'version': '16.3', 'beings': beings, 'placements': placements}, ensure_ascii=False, separators=(',', ':')) + ';\n')
open(P('explorer/codex_reference.js'), 'w', encoding='utf-8').write(hdr + 'window.AOV_CODEX_REF = ' + json.dumps({'version': '16.3', 'lore': lore, 'sections': sections, 'index': index}, ensure_ascii=False, separators=(',', ':')) + ';\n')
from collections import Counter
print(len(beings), 'beings ·', Counter((b['kind'], b['place']) for b in beings))
print('sections', [(s['key'], len(s['pages'])) for s in sections], 'index', len(index))
print('humanoid homes', Counter(str(b['home']['world']) if b['home'] else 'none' for b in beings if b['kind'] == 'humanoid').most_common(12))
