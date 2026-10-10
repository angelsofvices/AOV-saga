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

json.dump(homes, open(P('game_roster/codex_homes.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
hdr = '// ★ GENERATED by tools/explorer/build_codex.py from the Master Codex v16.3 · do not hand-edit.\n'
open(P('explorer/codex_beings.js'), 'w', encoding='utf-8').write(hdr + 'window.AOV_CODEX = ' + json.dumps({'version': '16.3', 'beings': beings}, ensure_ascii=False, separators=(',', ':')) + ';\n')
open(P('explorer/codex_reference.js'), 'w', encoding='utf-8').write(hdr + 'window.AOV_CODEX_REF = ' + json.dumps({'version': '16.3', 'lore': lore, 'sections': sections, 'index': index}, ensure_ascii=False, separators=(',', ':')) + ';\n')
from collections import Counter
print(len(beings), 'beings ·', Counter((b['kind'], b['place']) for b in beings))
print('sections', [(s['key'], len(s['pages'])) for s in sections], 'index', len(index))
print('humanoid homes', Counter(str(b['home']['world']) if b['home'] else 'none' for b in beings if b['kind'] == 'humanoid').most_common(12))
