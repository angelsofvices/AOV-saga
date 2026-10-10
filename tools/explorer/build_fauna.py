#!/usr/bin/env python3
"""Build explorer/fauna.js for the Living Master Codex.

Sources (canon, do not hand-edit the output):
  game_roster/roster.json   Zyraxis Zyrex: tier, types, base stats, moves, district
  rp7b.html                 the canonical 20-type effectiveness chart (TYPE_STRONG_VS)
  explorer/environments.js  the other worlds (for provisional fauna and their peoples)

Rules:
  * Zyraxis Aethren are exactly the official roster (game_roster/aethren_official.json).
    Tier 9-10 beings, easter eggs and hidden names are never wild. Older roster
    species not on the official list are kept as retired (cards held still work).
  * Every other world gets PROVISIONAL fauna: 1936 descriptions only, no canon
    name (canon:null), recoloured from the four native body plans. They are
    placeholders for the Creator's species and are flagged provisional.
  * Peoples come from each world's canon "first race". Worlds whose canon has no
    people (no humanoids, axis-beings, gone) get carved records instead.
Run:  python3 tools/explorer/build_fauna.py
"""
import json, re, os, hashlib, unicodedata
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
def norm(n): return re.sub(r'[^a-z0-9]', '', n.lower())

# ── THE OFFICIAL ROSTER (game_roster/aethren_official.json) decides who is wild on Zyraxis ──
# Data for each name comes from the newest source that has it: rp7b.html's live dex index (tier, types),
# then roster.json (tier, types, stats, moves, district), then roster_v7 and the v8 evolution lines.
# A name no source knows yet is filed provisionally (flagged) until the Creator gives its tier and types.
OFF = json.load(open(os.path.join(ROOT, 'game_roster/aethren_official.json'), encoding='utf-8'))
IDX = {norm(m.group(1)): (int(m.group(2)), m.group(3)) for m in re.finditer(r"\{n:'([^']+)',t:(\d+),ty:'([^']+)'\}", src)}
RJ = {norm(v['name']): v for v in R.values()}
v7src = open(os.path.join(ROOT, 'assets/2D sprites/battle/roster_v7.js'), encoding='utf-8').read()
V7 = {}
for m in re.finditer(r"name: '([^']+)', type: '([^']+)', type2: (null|'[^']+'), type3: (null|'[^']+'), region: '([^']+)',\s*tier: (\d+)", v7src):
    V7[norm(m.group(1))] = {'types': [m.group(2)] + [x.strip("'") for x in (m.group(3), m.group(4)) if x != 'null'], 'district': m.group(5).lower(), 'tier': int(m.group(6))}
EV = {}
for c in json.load(open(os.path.join(ROOT, 'data/rp7_evolution_lines_v8.json')))['chains']:
    for st in c['stages']:
        if st.get('name') and st.get('tier'): EV[norm(st['name'])] = st['tier']
TIER_HOME = {1:'malezor', 2:'zarvane', 3:'andrannor', 4:'veridan', 5:'netharion', 6:'vorashil', 7:'xilnar', 8:'baelgor', 9:'thardin', 10:'korathen'}
NAME_TYPE = [('frost|glaci|fros|frez|snow','Crystal'), ('cinder|ember|flare|blaz|volca|torch|ign|pyr|solar|sol','Elemental'), ('volt|bolt|spark|buzz|jet','Tech'),
  ('gear|cog|byte|mech|nano|rust|ferr|g-','Tech'), ('tide|reef|abyss|otter|dredg|luxquid|nytop|pyranh|barrac|celeseal','Aquatic'),
  ('moss|thorn|sprout|bramb|flor|verd|bog|gloom|seed|bark|sweed|foong|terra|stag','Verdant'), ('grave|bone|skull|mort|dusk|umbra|nyx|noct|void|obsid|obsy','Corrupted'),
  ('chrono','Chrono'), ('astra|astro|celest|luna|star|stel','Astral'), ('aur|halo|lumin|radi|sun','Radiant'), ('drak|drac|wyrm|wyn','Draconic'),
  ('rift|aeth|cryp|sigil|sygil|invis|invish|cereb|phren','Unknown'), ('wing|crow|hawk|strix|sky','Spirit')]
def guess_types(name):
    n = name.lower()
    for keys, t in NAME_TYPE:
        if any(k in n for k in keys.split('|')): return [t, 'Beast'] if t != 'Beast' else ['Beast']
    return ['Beast', 'Creature']
def pool(sid, tier, types):
    w = {'hp':1, 'atk':1, 'def':1, 'spd':1, 'spc':1}
    if types[0] in ('Tech','Crystal','Corrupted'): w['def'] += .25
    if types[0] in ('Spirit','Radiant','Astral','Aura','Chrono','Unknown'): w['spc'] += .25
    if types[0] in ('Beast','Elemental','Draconic'): w['atk'] += .25
    t = sum(w.values()); return {k: int(tier * 333 * w[k] / t) + (h(sid + k) % 9) - 4 for k in w}

def add_species(sid, name, tier, types, d, base, mv, note, flags):
    b = body(types)
    if sid in ('otterlin','volcanut'): b = 'quad' if sid == 'otterlin' else 'spine'
    if sid == 'verdanix': b = 'amph'
    if sid == 'aetherwing': b = 'wing'
    tm = temperament(sid, types, tier, b)
    unk = HUE.get(types[0], 'STRANGE') + ' ' + NOUN[b]
    k = (d, unk); seen_unknown[k] = seen_unknown.get(k, 0) + 1
    if seen_unknown[k] > 1: unk += ' · VARIANT ' + str(seen_unknown[k])
    sp = {'name': name.upper(), 'tier': tier, 'types': types, 'base': base, 'moves': mv,
      'body': b, 'col': COLORS.get(types[0]), 'col2': COLORS.get(types[1] if len(types) > 1 else types[0]),
      'world': 9, 'district': d, 'temperament': tm, 'canon': True, 'note': note,
      'journal': JOURNAL[b] + TEMPER[tm], 'unknown': unk}
    sp.update(flags); species[sid] = sp

hidden = {norm(n) for n in OFF.get('hidden', [])}
official_ids, report = set(), {'provisional': [], 'aliased': []}
FORMS = OFF.get('forms', {})
for line, shown in [(l, f) for l in OFF['roster'] for f in FORMS.get(l, [l])]:
    keys = [norm(shown)] + [norm(a) for a in OFF['aliases'].get(shown, [])]
    rj = next((RJ[k] for k in keys if k in RJ), None)
    ix = next((IDX[k] for k in keys if k in IDX), None)
    v7 = next((V7[k] for k in keys if k in V7), None)
    ev = next((EV[k] for k in keys if k in EV), None)
    sid = rj['id'] if rj else norm(shown)
    if norm(shown) != sid and sid not in keys[:1]: report['aliased'].append(shown + ' ← ' + (rj['name'] if rj else sid))
    flags = {}
    tier = (ix and ix[0]) or (rj and rj['tier']) or ev or (v7 and v7['tier'])
    types = [ct(t) for t in ix[1].split('/')] if ix else [t for t in (ct(rj.get('type')), ct(rj.get('type2')), ct(rj.get('type3'))) if t] if rj else [ct(t) for t in v7['types']] if v7 else None
    types = [t for t in (types or []) if t in STRONG]
    if not tier or not types:
        flags['provisionalData'] = True; report['provisional'].append(shown)
        tier = tier or 1; types = types or guess_types(shown)
    d = (rj and rj.get('primaryDistrict')) or (v7 and v7['district'])
    if d not in DISTRICTS: d = TIER_HOME[min(10, tier)] if tier > 1 else ('malezor' if h(sid) % 2 else 'zarvane')
    # Creator 2026-10-10: "include everything from codex" · tier IX+, the easter-egg line and Mealux all spawn
    if norm(shown) in hidden: flags['hidden'] = True
    base = rj['base'] if rj else pool(sid, tier, types)
    mv = moves(rj, types) if rj else moves({}, types)
    note = ''
    if line in FORMS: note = 'Same species as ' + ' and '.join(f.upper() for f in FORMS[line] if f != shown) + ', with a different type.'
    if rj and rj.get('source') == 'hand': note = (rj.get('flavor') or '').split('\n')[0].split('·')[-1].strip()
    add_species(sid, shown, tier, types, d, base, mv, note, flags)
    official_ids.add(sid)

# ── the Master Codex Aethren (Creator 2026-10-10: Codex Aethren spawn too) ──
# Each Codex Aethren not on the official list joins the wild on its home world / district
# (game_roster/codex_homes.json, built by build_codex.py), with the Codex's tier, types and stats.
# A species an older roster already defined keeps its id, so cards already held still match.
HOMES = json.load(open(os.path.join(ROOT, 'game_roster/codex_homes.json'), encoding='utf-8'))
ROSTER = json.load(open(os.path.join(ROOT, 'game_roster/aa1936_roster.json'), encoding='utf-8'))
ROMAN = {'I':1,'II':2,'III':3,'IV':4,'V':5,'VI':6,'VII':7,'VIII':8,'IX':9,'X':10}
codex_ids = set()
for e in ROSTER['entries']:
    if e['kind'] != 'aethren' or not e['source'].startswith('Master'): continue
    cx = e.get('codex') or {}
    hid = re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', unicodedata.normalize('NFKD', e['name']).encode('ascii', 'ignore').decode().lower())).strip('-')
    hm = HOMES.get(hid) or {}
    if hm.get('place') != 'wild': continue
    tier = ROMAN.get(str(cx.get('tier') or '').strip()) or 1
    types = [ct(t) for t in (cx.get('types') or [])]; types = [t for t in types if t in STRONG] or guess_types(e['name'])
    stv = cx.get('stats') or {}
    base = {k: int(stv[k]) for k in ('hp','atk','def','spd','spc') if stv.get(k)} if all(stv.get(k) for k in ('hp','atk','def','spd','spc')) else None
    old = RJ.get(norm(e['name']))
    sid = old['id'] if old else 'cx-' + hid
    if sid in species: continue
    hh = hm.get('home') or {}
    world, d = hh.get('world') or 9, hh.get('district')
    if world == 9 and d not in DISTRICTS: d = (old or {}).get('primaryDistrict') if (old or {}).get('primaryDistrict') in DISTRICTS else (TIER_HOME[min(10, tier)] if tier > 1 else ('malezor' if h(sid) % 2 else 'zarvane'))
    flags = {'codex': True}
    note = ''
    add_species(sid, e['name'], tier, types, d if world == 9 else None, base or pool(sid, tier, types), moves(old, types) if old else moves({}, types), note, flags)
    species[sid]['world'] = world
    codex_ids.add(sid)
official_ids |= codex_ids

# species from older rosters that are NOT on the official list stay defined (cards already held keep
# working) but are retired: never spawned, never counted toward a set.
for v in sorted(R.values(), key=lambda v: (v['tier'], v['id'])):
    if v['id'] in official_ids or v.get('primaryDistrict') not in DISTRICTS: continue
    types = [t for t in (ct(v.get('type')), ct(v.get('type2')), ct(v.get('type3'))) if t in STRONG]
    if not types: continue
    add_species(v['id'], v['name'], v['tier'], types, v['primaryDistrict'], v['base'], moves(v, types), '', {'retired': True})

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

# VEILED (Creator 2026-10-10: "gemsight reveals hidden aethren"): tier IX-X and the easter-egg line spawn,
# but stay unseen until the player holds ANCIENT GEMSIGHT (all nine Zyraxis district shrines visited).
VEILED = {'elzebub', 'elzimir', 'elzoran', 'omegoran', 'mealux'}
for sid, sp in species.items():
    if sp.get('retired'): continue
    if (sp.get('tier') or 0) >= 9 or sid in VEILED: sp['veiled'] = True
out = {'generated':'tools/explorer/build_fauna.py', 'strong': STRONG, 'alias': ALIAS, 'colors': COLORS, 'species': species, 'peoples': PEOPLES}
p = os.path.join(ROOT, 'explorer/fauna.js')
open(p, 'w', encoding='utf-8').write(
  '// ★ GENERATED by tools/explorer/build_fauna.py · do not hand-edit.\n'
  '// Canon: game_roster/roster.json (Zyraxis Zyrex) and the 20-type chart in rp7b.html.\n'
  '// Species with provisional:true are placeholders until the Creator supplies that world’s Aethren.\n'
  'window.AOV_FAUNA = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(len(species), 'species ·', len(official_ids) - len(codex_ids), 'official ·', len(codex_ids), 'from the Codex ·', sum(1 for s in species.values() if s.get('retired')), 'retired ·', len(STRONG), 'types')
print('PROVISIONAL DATA:', ', '.join(report['provisional']))
print('READ FROM OLDER SPELLINGS:', ', '.join(report['aliased']))
