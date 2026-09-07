#!/usr/bin/env python3
"""verify_type_chart_20.py · the 20x20 effectiveness chart, checked not trusted.
Creator: "use logic to verify anything needed."

★★★ The v7.5.16 handoff derived two edges and asked for sign-off:
    Radiant strong vs Aura · Unknown strong vs Radiant
This proves they are FORCED. Strip them, then brute-force all 400 candidate
pairs against the constraints: exactly ONE legal completion exists. That is not
a judgement call, so it does not need one.
"""
# ★ The 20x20 chart exactly as the handoff states it, including the two DERIVED
# edges awaiting sign-off (Radiant>Aura, Unknown>Radiant). Verify, do not trust.
STRONG = {
 'Aura':            ['Corrupted','Spirit','Unknown'],
 'Beast':           ['Creature','Spirit','Verdant'],
 'Creature':        ['Aquatic','Aura','Nature'],
 'Extraterrestrial':['Aura','Divine','Nature'],
 'Humanoid':        ['Beast','Draconic','Ultramax'],
 'Nature':          ['Elemental','Tech','Unknown'],
 'Tech':            ['Crystal','Extraterrestrial','Humanoid'],
 'Spirit':          ['Chrono','Humanoid','Tech'],
 'Ultramax':        ['Astral','Beast','Extraterrestrial'],
 'Unknown':         ['Creature','Radiant','Ultramax'],
 'Draconic':        ['Aquatic','Beast','Elemental'],
 'Crystal':         ['Chrono','Radiant','Spirit'],
 'Radiant':         ['Aquatic','Aura','Chrono'],
 'Divine':          ['Corrupted','Draconic','Unknown'],
 'Corrupted':       ['Humanoid','Radiant','Verdant'],
 'Verdant':         ['Astral','Crystal','Tech'],
 'Aquatic':         ['Corrupted','Elemental','Nature'],
 'Chrono':          ['Astral','Divine','Ultramax'],
 'Astral':          ['Divine','Draconic','Extraterrestrial'],
 'Elemental':       ['Creature','Crystal','Verdant'],
}
WEAK = {
 'Aura':            ['Creature','Extraterrestrial','Radiant'],
 'Beast':           ['Draconic','Humanoid','Ultramax'],
 'Creature':        ['Beast','Elemental','Unknown'],
 'Extraterrestrial':['Astral','Tech','Ultramax'],
 'Humanoid':        ['Corrupted','Spirit','Tech'],
 'Nature':          ['Aquatic','Creature','Extraterrestrial'],
 'Tech':            ['Nature','Spirit','Verdant'],
 'Spirit':          ['Aura','Beast','Crystal'],
 'Ultramax':        ['Chrono','Humanoid','Unknown'],
 'Unknown':         ['Aura','Divine','Nature'],
 'Draconic':        ['Astral','Divine','Humanoid'],
 'Crystal':         ['Elemental','Tech','Verdant'],
 'Radiant':         ['Corrupted','Crystal','Unknown'],
 'Divine':          ['Astral','Chrono','Extraterrestrial'],
 'Corrupted':       ['Aquatic','Aura','Divine'],
 'Verdant':         ['Beast','Corrupted','Elemental'],
 'Aquatic':         ['Creature','Draconic','Radiant'],
 'Chrono':          ['Crystal','Radiant','Spirit'],
 'Astral':          ['Chrono','Ultramax','Verdant'],
 'Elemental':       ['Aquatic','Draconic','Nature'],
}
T = sorted(STRONG)
fail = []
def chk(c, m):
    print(('  ok   · ' if c else '  FAIL · ') + m)
    if not c: fail.append(m)

print('\n=== 20x20 TYPE CHART · verifying the two DERIVED edges ===\n')
chk(len(T)==20, f'{len(T)} types')
chk(set(STRONG)==set(WEAK), 'STRONG and WEAK cover the same 20 types')

# 1 · 3-regular in both directions
bad = [t for t in T if len(STRONG[t])!=3 or len(set(STRONG[t]))!=3]
chk(not bad, '★ every type is strong against exactly 3 (no dupes)' + (' · '+', '.join(bad) if bad else ''))
bad = [t for t in T if len(WEAK[t])!=3 or len(set(WEAK[t]))!=3]
chk(not bad, '★ every type is weak to exactly 3 (no dupes)' + (' · '+', '.join(bad) if bad else ''))

# 2 · no self-loops
bad = [t for t in T if t in STRONG[t] or t in WEAK[t]]
chk(not bad, '★ clean diagonal · nothing beats or loses to itself' + (' · '+', '.join(bad) if bad else ''))

# 3 · ★★ THE REAL TEST · the two tables must be transposes of each other
mismatch = []
for a in T:
    for b in STRONG[a]:
        if b not in WEAK: mismatch.append(f'{a}>{b} · {b} is not a type'); continue
        if a not in WEAK[b]: mismatch.append(f'{a} strong vs {b}, but {b} does not list {a} as a weakness')
for a in T:
    for b in WEAK[a]:
        if b not in STRONG: mismatch.append(f'{a}<{b} · {b} is not a type'); continue
        if a not in STRONG[b]: mismatch.append(f'{a} weak to {b}, but {b} does not list {a} as strong')
chk(not mismatch, '★★★ the STRONG and WEAK columns are exact transposes · every edge agrees from both ends')
for m in mismatch[:12]: print('         ' + m)

# 4 · no mutual counters
mutual = sorted({tuple(sorted((a,b))) for a in T for b in STRONG[a] if b in STRONG and a in STRONG[b]})
chk(not mutual, '★★ zero mutual counter-pairs' + (' · '+', '.join(f'{x}<->{y}' for x,y in mutual) if mutual else ''))

# 5 · edge count
edges = sum(len(v) for v in STRONG.values())
chk(edges==60, f'★ {edges} directed edges (20 x 3)')

# 6 · ★ the two derived edges, stated explicitly
chk('Aura' in STRONG['Radiant'], '★★★ DERIVED · Radiant is strong vs Aura')
chk('Radiant' in STRONG['Unknown'], '★★★ DERIVED · Unknown is strong vs Radiant')
chk('Radiant' in WEAK['Aura'] and 'Unknown' in WEAK['Radiant'],
    '  · and both appear from the losing side too')

# 7 · the handoff's structural claim: each EXPANSION type beats exactly one
#     ORIGINAL and is beaten by exactly one ORIGINAL
ORIG = {'Aura','Beast','Creature','Extraterrestrial','Humanoid','Nature','Tech','Spirit','Ultramax','Unknown'}
EXP  = set(T) - ORIG
chk(len(ORIG)==10 and len(EXP)==10, f'10 original / {len(EXP)} expansion')
b1 = [e for e in EXP if len([x for x in STRONG[e] if x in ORIG])!=1]
b2 = [e for e in EXP if len([x for x in WEAK[e]   if x in ORIG])!=1]
chk(not b1, '★★ each expansion type beats exactly ONE original' + (' · '+', '.join(b1) if b1 else ''))
chk(not b2, '★★ ...and is beaten by exactly ONE original' + (' · '+', '.join(b2) if b2 else ''))

print(f'\n{"★ CHART VERIFIES" if not fail else "★ "+str(len(fail))+" PROBLEM(S)"}\n')

# ── ★★ UNIQUENESS · the claim that actually needed proving ────────────────
ORIG = {'Aura','Beast','Creature','Extraterrestrial','Humanoid','Nature','Tech','Spirit','Ultramax','Unknown'}
EXP  = set(T) - ORIG
base = {a:set(v) for a,v in STRONG.items()}
base['Radiant'].discard('Aura'); base['Unknown'].discard('Radiant')
def legal(g):
    for a in T:
        if len(g[a])!=3 or a in g[a]: return False
        for b in g[a]:
            if a in g[b]: return False
    for t in T:
        if sum(1 for a in T if t in g[a])!=3: return False
    for e in EXP:
        if len([x for x in g[e] if x in ORIG])!=1: return False
        if len([a for a in ORIG if e in g[a]])!=1: return False
    return True
sols = []
for x in T:
    for y in T:
        g = {a:set(v) for a,v in base.items()}
        g['Radiant'].add(x); g['Unknown'].add(y)
        if legal(g): sols.append((x,y))
chk(len(sols)==1, f'★★★ UNIQUENESS · exactly one legal completion of the 58 locked '
                  f'edges (found {len(sols)}) · the derivation was FORCED, not chosen')
if len(sols)==1:
    print(f'         Radiant > {sols[0][0]} · Unknown > {sols[0][1]}')

# ── ★★★ THE DRIFT LOCK · the SHIPPED table must equal this one ────────────
# The whole reason this file exists is that the game and the codex held two
# different charts for months — 35% agreement, 2 of 20 rows matching — and
# nothing compared them. Verifying the canon chart in isolation would have
# caught none of that.
import re, os
HTML = open(os.path.join(os.path.dirname(__file__), '..', 'rp7b.html'), encoding='utf-8').read()
i = HTML.index('const TYPE_STRONG_VS = {')
code = re.sub(r'//[^\n]*', '', HTML[i:HTML.index('\n};', i)])
SHIP = {m.group(1): sorted(x.strip().strip("'") for x in m.group(2).split(',') if x.strip())
        for m in re.finditer(r"\n\s*(\w+):\s*\[([^\]]*)\]", code)}
print()
chk(set(SHIP) == set(STRONG), f'the shipped chart covers the same 20 types ({len(SHIP)})')
drift = [t for t in STRONG if SHIP.get(t) != sorted(STRONG[t])]
chk(not drift, '★★★ the SHIPPED chart is byte-equal to canon' + (' · drifted: ' + ', '.join(drift) if drift else ''))
for t in drift[:8]:
    print(f'         {t:18s} ship {SHIP.get(t)}\n         {"":18s} book {sorted(STRONG[t])}')
chk('Aquatic' in SHIP and len(SHIP['Aquatic']) == 3,
    '★ Aquatic is no longer the empty PROVISIONAL row it shipped as for months')

import sys
sys.exit(1 if fail else 0)
