#!/usr/bin/env python3
"""Build explorer/fauna.js for the Living Master Codex.

Sources (canon, do not hand-edit the output):
  game_roster/roster.json   Zyraxis Zyrex: tier, types, base stats, moves, district
  rp7b.html                 the canonical 20-type effectiveness chart (TYPE_STRONG_VS)
  explorer/environments.js  the other worlds (for provisional fauna and their peoples)

Rules:
  * Zyraxis Aethren are canon roster species. Tier 9-10 beings, easter eggs and
    entries marked "(invented)" are left out of the wild.
  * Every other world gets PROVISIONAL fauna: 1936 descriptions only, no canon
    name (canon:null), recoloured from the four native body plans. They are
    placeholders for the Creator's species and are flagged provisional.
  * Peoples come from each world's canon "first race". Worlds whose canon has no
    people (no humanoids, axis-beings, gone) get carved records instead.
Run:  python3 tools/explorer/build_fauna.py
"""
import json, re, os, hashlib
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
R = json.load(open(os.path.join(ROOT, 'game_roster/roster.json')))

# ── the canon chart, read straight out of rp7b.html ──
src = open(os.path.join(ROOT, 'rp7b.html'), encoding='utf-8').read()
block = src[src.index('const TYPE_STRONG_VS = {'):]
block = block[:block.index('};')]
STRONG = {m.group(1): re.findall(r"'([A-Za-z]+)'", m.group(2)) for m in re.finditer(r"^\s*([A-Za-z]+):\s*\[([^\]]*)\]", block, re.M)}
assert len(STRONG) == 20, len(STRONG)
ALIAS = {'Mechanical':'Tech', 'Astra':'Astral', 'Void':'Corrupted', 'Converted':'Corrupted', 'Normal':'Creature',
         'Unknown-Void':'Unknown', 'Humanoid-Noid':'Humanoid'}
COLORS = {'Aura':'#e8c878','Beast':'#a86b3c','Creature':'#48a878','Extraterrestrial':'#4a5c98','Humanoid':'#c95c5c','Nature':'#2fe6a8',
  'Tech':'#5cd0ff','Spirit':'#b87cff','Ultramax':'#ff8c1a','Unknown':'#8a5cd0','Draconic':'#5c8aff','Crystal':'#b0e0ff','Radiant':'#fff28a',
  'Divine':'#fff5db','Corrupted':'#7a1a5c','Verdant':'#3aa66e','Aquatic':'#4a78c2','Chrono':'#c8b8ff','Astral':'#9878ff','Elemental':'#ff5c1a','Ultimate':'#ffffff'}
def ct(t): return ALIAS.get(t, t) if t else None

# body plans: which native sprite each species is drawn from (redraw any species in the Art Studio)
def body(types):
    p = types[0]
    if p in ('Spirit','Radiant','Aura','Astral','Divine','Chrono'): return 'wing'
    if p in ('Nature','Verdant','Aquatic','Creature'): return 'amph'
    if p in ('Tech','Crystal','Elemental','Ultramax','Draconic','Corrupted','Extraterrestrial'): return 'spine'
    return 'quad'
NOUN = {'quad':'QUADRUPED', 'amph':'AMPHIBIAN', 'wing':'WINGED CREATURE', 'spine':'SPINED BEAST'}
HUE = {'Aura':'GOLDEN','Beast':'BROWN-FURRED','Creature':'SCALED','Extraterrestrial':'BLUE-SKINNED','Humanoid':'UPRIGHT','Nature':'GREEN',
  'Tech':'METALLIC','Spirit':'VIOLET','Ultramax':'ORANGE','Unknown':'SHADOWED','Draconic':'WYRM-LIKE','Crystal':'CRYSTALLINE','Radiant':'LUMINOUS',
  'Divine':'PALE','Corrupted':'DARK','Verdant':'LEAF-CLAD','Aquatic':'FINNED','Chrono':'SHIMMERING','Astral':'STARRED','Elemental':'EMBER-BACKED'}
JOURNAL = {
  'quad':'Four-legged, quick, close to the ground. ',
  'amph':'Moist-skinned and upright, as comfortable in water as out of it. ',
  'wing':'Airborne. The wings throw off a light of their own. ',
  'spine':'Heavy, plated and spined. The air shimmers around it. '}
TEMPER = {'curious':'It edged closer to look at me.', 'skittish':'It fled at the first heavy step. Approach low and slow.',
  'flighty':'It never holds still. Wait for it to hover.', 'territorial':'It defends its ground. Keep your distance.'}
KEEP = {'otterlin':'curious', 'verdanix':'skittish', 'aetherwing':'flighty', 'volcanut':'territorial'}
def h(s): return int(hashlib.md5(s.encode()).hexdigest()[:8], 16)
def temperament(sid, types, tier, b):
    if sid in KEEP: return KEEP[sid]
    if tier >= 6: return 'territorial'
    if b == 'wing': return 'flighty'
    if types[0] in ('Nature','Verdant'): return 'skittish'
    return ['curious','skittish','territorial','curious'][h(sid) % 4]
def moves(v, types):
    names = []
    bm = v.get('basicMoves') or {}
    names = [n for n in (bm.get('names') or [])][:3]
    if len(names) < 3:
        for m in v.get('codexMoves') or []:
            n = m.get('name') or ''
            if '[open]' in n or m.get('slot') == 'R' or n in names: continue
            names.append(n)
    while len(names) < 3: names.append(types[0] + ' ' + ['Strike','Surge','Burst'][len(names)])
    om = v.get('originalMove') or {}
    t3 = ct(om.get('type')) if om.get('type') else types[0]
    if t3 not in STRONG: t3 = types[0]
    t2 = types[1] if len(types) > 1 else types[0]
    return [{'n':names[0], 't':types[0], 'p':40, 's':'A1'}, {'n':names[1], 't':t2, 'p':60, 's':'A2'}, {'n':names[2], 't':t3, 'p':90, 's':'A3'}]

DISTRICTS = ['malezor','zarvane','andrannor','veridan','netharion','vorashil','xilnar','baelgor','thardin','korathen']
species, lex = {}, {}
seen_unknown = {}
for v in sorted(R.values(), key=lambda v: (v['tier'], v['id'])):
    d = v.get('primaryDistrict')
    if d not in DISTRICTS: continue
    if v['tier'] >= 9 or v.get('easterEgg') or 'invented' in (v.get('archetype') or ''): continue
    types = [t for t in (ct(v.get('type')), ct(v.get('type2')), ct(v.get('type3'))) if t in STRONG]
    if not types: continue
    b = body(types)
    if v['id'] in ('otterlin','volcanut'): b = 'quad' if v['id'] == 'otterlin' else 'spine'
    if v['id'] == 'verdanix': b = 'amph'
    if v['id'] == 'aetherwing': b = 'wing'
    tm = temperament(v['id'], types, v['tier'], b)
    unk = HUE.get(types[0], 'STRANGE') + ' ' + NOUN[b]
    k = (d, unk); seen_unknown[k] = seen_unknown.get(k, 0) + 1
    if seen_unknown[k] > 1: unk += ' · VARIANT ' + str(seen_unknown[k])
    first = (v.get('flavor') or '').split('\n')[0]
    note = first.split('·')[-1].strip() if v.get('source') == 'hand' else ''
    species[v['id']] = {'name': v['name'].upper(), 'tier': v['tier'], 'types': types, 'base': v['base'], 'moves': moves(v, types),
      'body': b, 'col': COLORS.get(types[0]), 'col2': COLORS.get(types[1] if len(types) > 1 else types[0]),
      'world': 9, 'district': d, 'temperament': tm, 'canon': True, 'note': note,
      'journal': JOURNAL[b] + TEMPER[tm], 'unknown': unk}

# ── provisional fauna for the other worlds ──
ENVS = {}
js = open(os.path.join(ROOT, 'explorer/environments.js'), encoding='utf-8').read()
arr = js[js.index('window.AOV_ENV = ') + len('window.AOV_ENV = '):]
arr = arr[:arr.index('\n];') + 2]
for e in json.loads(arr):
    ENVS[e['id']] = e
# a provisional affinity per world, for battles only (not canon): types the chart already has
AFFINITY = {1:['Divine','Draconic'], 2:['Radiant','Divine'], 3:['Draconic','Elemental'], 4:['Verdant','Nature'], 5:['Aquatic','Creature'],
  6:['Elemental','Ultramax'], 7:['Unknown','Astral'], 8:['Tech','Creature'], 10:['Humanoid','Divine'], 11:['Beast','Ultramax'],
  12:['Crystal','Chrono'], 13:['Spirit','Unknown'], 14:['Humanoid','Chrono'], 15:['Chrono','Astral'], 16:['Verdant','Spirit'],
  17:['Corrupted','Beast'], 18:['Elemental','Corrupted'], 19:['Unknown','Spirit'], 20:['Aquatic','Spirit'], 21:['Astral','Beast'],
  22:['Spirit','Tech'], 23:['Astral','Nature'], 24:['Crystal','Radiant'], 25:['Ultramax','Extraterrestrial'], 26:['Tech','Crystal'],
  27:['Nature','Beast']}
for e in ENVS.values():
    if e['kind'] != 'world' or e['no'] in (9, 28): continue
    no, aff = e['no'], AFFINITY[e['no']]
    ring = (no + 3) // 4
    for i, b in enumerate(['quad', 'amph', 'wing', 'spine'][:3 if no % 2 else 4]):
        types = [aff[i % 2]] + ([aff[(i + 1) % 2]] if i % 2 else [])
        tier = max(1, min(8, ring + (i // 2)))
        sid = 'w%02d_%s' % (no, b)
        tm = temperament(sid, types, tier, b)
        base = {k: tier * 333 // 5 + (h(sid + k) % 9) - 4 for k in ('hp','atk','def','spd','spc')}
        pal = e.get('palette') or {}
        main = (list((pal.get('special') or pal.get('liquid') or {}).values()) or ['#888888'])[0]
        species[sid] = {'name': None, 'tier': tier, 'types': types, 'base': base,
          'moves': [{'n':'Strike','t':types[0],'p':40,'s':'A1'}, {'n':'Lunge','t':types[-1],'p':60,'s':'A2'}, {'n':'Surge','t':types[0],'p':90,'s':'A3'}],
          'body': b, 'col': COLORS.get(types[0]), 'col2': main, 'world': no, 'district': None, 'temperament': tm, 'canon': False,
          'provisional': True, 'note': '', 'journal': JOURNAL[b] + TEMPER[tm],
          'unknown': HUE.get(types[0], 'STRANGE') + ' ' + NOUN[b] + ' · BODY No. ' + str(no)}

# ── peoples · from each world's canon first race ──
# race: the canon name the Codex teaches. record: no people to meet, carved records teach instead.
PEOPLES = {
  1:{'record':'The Firsts are marked, not spoken. No people live here.'},
  2:{'race':'ASTRUMS', 'unknown':'BEINGS OF LIGHT'},
  3:{'race':'DRACOLORDS', 'unknown':'TALL SCALED INHABITANTS'},
  4:{'record':'The planet itself is the Great Root. Its records grow in the bark.'},
  5:{'record':'The Great Fin moves below. Only the reef carries its record.'},
  6:{'record':'The Great Fang is the world. Its record is cut in the cooled rock.'},
  7:{'record':'The Great Scale is the world. Its record lies at the bottom of every slope.'},
  8:{'race':'SYNTHRAX', 'unknown':'INSECTOID INHABITANTS'},
  10:{'race':'HUMANOIDS', 'unknown':'ROBED INHABITANTS'},
  11:{'race':'BEASTFOLK', 'unknown':'ANIMAL-FACED INHABITANTS'},
  12:{'race':'ARCHIVE LIFEFORMS', 'unknown':'FROZEN INHABITANTS'},
  13:{'record':'Minimal life. The truth is written plainly in the stone.'},
  14:{'record':'Egnellahc’s Congregation is gone. Only what they left remains.'},
  15:{'race':'AVIANS', 'unknown':'FEATHERED INHABITANTS'},
  16:{'race':'BEASTFOLK OF THE CANOPY', 'unknown':'FOREST INHABITANTS'},
  17:{'race':'GREATKIN CYCLOPES', 'unknown':'ONE-EYED GIANTS'},
  18:{'race':'REPTILOIDS', 'unknown':'SCALED FIRE-DWELLERS'},
  19:{'record':'Here, what is observed is built. The records shift when you look away.'},
  20:{'race':'AQUATICS', 'unknown':'GILLED INHABITANTS'},
  21:{'race':'AVIANS', 'unknown':'WINGED INHABITANTS'},
  22:{'race':'SOUND-CARRIERS', 'unknown':'HUMMING INHABITANTS'},
  23:{'race':'THE ELYTHER SKY PRIESTS', 'unknown':'AERONAUTS'},
  24:{'race':'XYLORANS', 'unknown':'CRYSTAL-VOICED INHABITANTS'},
  25:{'race':'ENDURERS', 'unknown':'LOW, HEAVY INHABITANTS'},
  26:{'race':'MACHINE-WROUGHT', 'unknown':'IRON-BODIED INHABITANTS'},
  27:{'race':'VIRIDIANS', 'unknown':'PEOPLE WHO LOOK LIKE US'},
  9:{'race':'HAEMEN', 'unknown':'HUMANOID INHABITANTS'}}

out = {'generated':'tools/explorer/build_fauna.py', 'strong': STRONG, 'alias': ALIAS, 'colors': COLORS, 'species': species, 'peoples': PEOPLES}
p = os.path.join(ROOT, 'explorer/fauna.js')
open(p, 'w', encoding='utf-8').write(
  '// ★ GENERATED by tools/explorer/build_fauna.py · do not hand-edit.\n'
  '// Canon: game_roster/roster.json (Zyraxis Zyrex) and the 20-type chart in rp7b.html.\n'
  '// Species with provisional:true are placeholders until the Creator supplies that world’s Aethren.\n'
  'window.AOV_FAUNA = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(len(species), 'species ·', sum(1 for s in species.values() if s['canon']), 'canon ·', len(STRONG), 'types')
