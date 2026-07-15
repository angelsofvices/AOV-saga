#!/usr/bin/env python3
"""Regenerate game_roster/roster.json + GAME_ROSTER.md.

Merges the hand-written SPECIES block in rizers.html with the codex.js
auto-hydrated payload (which itself comes from
data/aov_game_codex_v11.1.xlsx via data/build_codex.py).

Rule: hand-written entries win on collision — mirrors the game's runtime
hydration rule at rizers.html V2.30 (`if (SPECIES[id]) continue`).

Usage:
    python3 data/build_codex.py         # first, regen codex.js
    python3 tools/regen_game_roster.py  # then, regen roster + MD

Outputs:
    game_roster/roster.json    (merged, ~131 entries)
    GAME_ROSTER.md             (tier-grouped markdown table + chain summary)
"""
import re, json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASIC_BASE = {'hp': 66, 'atk': 66, 'def': 66, 'spd': 66, 'spc': 69}
ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X']
DIST = ['malezor','zarvane','andrannor','veridan','netharion','vorashil','xilnar','baelgor','thardin','korathen']
DIST_NAMES = ['Malezor','Zarvane','Andrannor','Veridan','Netharion','Vorashil','Xilnar','Baelgor','Thardin','Korathen']


def parse_species_entry(id_, text):
    entry = {'id': id_, 'source': 'hand'}
    for field, pat in [
        ('name',     r"name:\s*'([^']+)'"),
        ('type',     r"type:\s*'([^']+)'"),
        ('type2',    r"type2:\s*'([^']+)'"),
        ('type3',    r"type3:\s*'([^']+)'"),
        ('region',   r"region:\s*'([^']+)'"),
        ('evolveTo', r"evolveTo:\s*'([^']+)'"),
    ]:
        m = re.search(pat, text)
        if m:
            entry[field] = m.group(1)
    for field, pat in [('tier', r"tier:\s*(\d+)"),
                       ('evolveLv', r"evolveLv:\s*(\d+)"),
                       ('catchRate', r"catchRate:\s*(\d+)")]:
        m = re.search(pat, text)
        if m:
            entry[field] = int(m.group(1))
    m_base = re.search(r"base:\s*(BASIC_BASE|\{[^}]*\})", text)
    if m_base:
        if m_base.group(1) == 'BASIC_BASE':
            entry['base'] = dict(BASIC_BASE)
        else:
            b = {}
            for k in ['hp', 'atk', 'def', 'spd', 'spc']:
                mm = re.search(rf"{k}:\s*(\d+)", m_base.group(1))
                if mm:
                    b[k] = int(mm.group(1))
            entry['base'] = b
    entry['easterEgg'] = 'easterEgg: true' in text
    m_om = re.search(r"originalMove:\s*\{([^}]*)\}", text)
    if m_om:
        omt = m_om.group(1)
        n = re.search(r"name:\s*'([^']+)'", omt)
        t = re.search(r"type:\s*'([^']+)'", omt)
        p = re.search(r"power:\s*(\d+)", omt)
        entry['originalMove'] = {
            'name': n.group(1) if n else None,
            'type': t.group(1) if t else None,
            'power': int(p.group(1)) if p else None,
        }
    m_bm = re.search(r"basicMoves\('([^']+)',\s*\[([^\]]+)\]\)", text)
    if m_bm:
        entry['basicMoves'] = {
            'type': m_bm.group(1),
            'names': re.findall(r"'([^']+)'", m_bm.group(2)),
        }
    return entry


def parse_rizers_species(html):
    sp_start = html.index('const SPECIES = {')
    sp_end = html.index('\n};', sp_start)
    sp_body = html[sp_start:sp_end]

    hand = {}
    lines = sp_body.split('\n')
    current = None
    buf = []
    for line in lines:
        m = re.match(r"^  (\w+):\s*\{", line)
        if m:
            if current and buf:
                hand[current] = parse_species_entry(current, '\n'.join(buf))
            current = m.group(1)
            buf = [line]
        elif current:
            buf.append(line)
    if current and buf:
        hand[current] = parse_species_entry(current, '\n'.join(buf))
    return hand


def load_codex_js(js_text):
    m = re.search(r'window\.CODEX_ZYREX\s*=\s*(\{.*\});?', js_text, re.DOTALL)
    return json.loads(m.group(1))


def merge_rosters(hand, codex, full_entries):
    merged = {}
    for id_, e in codex.items():
        merged[id_] = dict(e)
        merged[id_]['source'] = 'codex'
    for id_, e in hand.items():
        if id_ in merged:
            for k, v in e.items():
                merged[id_][k] = v
        else:
            merged[id_] = e
    for id_, e in merged.items():
        tier = e.get('tier') or 1
        idx = max(0, min(9, tier - 1))
        e['primaryDistrict'] = DIST[idx]
        e['primaryDistrictName'] = DIST_NAMES[idx]
        fe = full_entries.get(id_)
        if fe:
            e['flavor'] = fe.get('flavor')
            e['worldsense'] = fe.get('worldsense')
            e['archetype'] = fe.get('archetype')
            m = fe.get('moves') or {}
            arr = []
            for slot in ('a1', 'a2', 'a3', 'r'):
                m2 = m.get(slot)
                if m2 and isinstance(m2, dict) and m2.get('name'):
                    arr.append({'slot': slot.upper(), 'name': m2['name'], 'raw': m2.get('raw', '')})
            e['codexMoves'] = arr
    return merged


def stat_pool(e):
    b = e.get('base') or {}
    return (b.get('hp') or 0) + (b.get('atk') or 0) + (b.get('def') or 0) + (b.get('spd') or 0) + (b.get('spc') or 0)


def write_markdown(merged):
    by_tier = {}
    for e in merged.values():
        by_tier.setdefault(e.get('tier') or 1, []).append(e)
    for t in by_tier:
        by_tier[t].sort(key=lambda x: x['name'])
    chains = [(id_, e['evolveTo'], e.get('evolveLv'), merged.get(e['evolveTo'], {}).get('name', e['evolveTo'].upper()))
              for id_, e in merged.items() if e.get('evolveTo')]

    md = []
    md.append('# RIZING POWERS OF ZYRAXIS — Official Game Roster')
    md.append('')
    md.append(f'*Auto-generated {len(merged)} Zyrex.  Regenerate via `python3 tools/regen_game_roster.py`.  Source of truth: `rizers.html` SPECIES + `data/codex.js`.*')
    md.append('')
    md.append('## Overview')
    md.append('')
    md.append('| Metric | Count |')
    md.append('|---|---:|')
    md.append(f'| Total Zyrex in game | {len(merged)} |')
    md.append(f'| Explicit evolution links | {len(chains)} |')
    md.append(f'| Easter-egg-only species | {sum(1 for e in merged.values() if e.get("easterEgg"))} |')
    tier_counts = ', '.join(f'{ROMAN[t-1]}={len(by_tier.get(t, []))}' for t in sorted(by_tier))
    md.append(f'| Per-tier | {tier_counts} |')
    md.append('')
    md.append('- Full color-coded browsable pokedex: [`game_roster/index.html`](game_roster/index.html) — open in a browser.')
    md.append('- Raw merged data: [`game_roster/roster.json`](game_roster/roster.json).')
    md.append('- Canonical stat rule: **every species base pool = tier × 333** (see `data/RPG_MASTERY_BLUEPRINT.md`).')
    md.append('')
    md.append('## Evolution Chains')
    md.append('')
    md.append(f'{len(chains)} explicit `evolveTo` links currently in canon.  Terminal species (no evolution) are not listed here.')
    md.append('')
    md.append('| From | Tier | → Evolve @ Lv | To | New Tier |')
    md.append('|---|---:|---:|---|---:|')
    for id_, to_id, lv, to_name in sorted(chains, key=lambda x: (merged.get(x[0], {}).get('tier', 0), x[0])):
        from_e = merged.get(id_, {})
        to_e = merged.get(to_id, {})
        md.append(f'| **{from_e.get("name", id_.upper())}** | {ROMAN[from_e.get("tier", 1) - 1]} | Lv {lv or "?"} | **{to_name}** | {ROMAN[to_e.get("tier", 1) - 1] if to_e else "?"} |')
    md.append('')
    md.append('## Full Roster (grouped by tier)')
    md.append('')
    md.append('Columns: **Name** (bold if hand-crafted in `rizers.html`; plain if auto-hydrated from codex) · **Types** · **District** (primary tier home) · **Pool** (T×333 target) · **Evolves →**')
    md.append('')

    for t in sorted(by_tier):
        md.append(f'### Tier {ROMAN[t - 1]} ({t}×333 = {t * 333} pool)')
        md.append('')
        md.append('| Name | Types | District | HP | ATK | DEF | SPD | SPC | Pool | Evolves → |')
        md.append('|---|---|---|---:|---:|---:|---:|---:|---:|---|')
        for e in by_tier[t]:
            name = f'**{e["name"]}**' if e.get('source') == 'hand' else e['name']
            types = ' / '.join(x for x in [e.get('type'), e.get('type2'), e.get('type3')] if x)
            b = e.get('base') or {}
            pool = stat_pool(e)
            pool_str = f'{pool}' if pool == t * 333 else f'{pool} ⚠︎'
            if e.get('evolveTo'):
                to = merged.get(e['evolveTo'], {})
                evo = f'{to.get("name", e["evolveTo"].upper())} @ Lv {e.get("evolveLv", "?")}'
            elif e.get('easterEgg'):
                evo = '_(easter egg)_'
            else:
                evo = '—'
            md.append(f'| {name} | {types} | {e.get("primaryDistrictName", "—")} | {b.get("hp", 0)} | {b.get("atk", 0)} | {b.get("def", 0)} | {b.get("spd", 0)} | {b.get("spc", 0)} | {pool_str} | {evo} |')
        md.append('')

    md.append('---')
    md.append('')
    md.append('_Regeneration:_ `python3 data/build_codex.py` (rebuilds codex from xlsx) followed by `python3 tools/regen_game_roster.py` (this script).')
    return '\n'.join(md)


def main():
    html = (ROOT / 'rizers.html').read_text()
    js = (ROOT / 'data' / 'codex.js').read_text()
    codex_full = json.loads((ROOT / 'data' / 'codex.json').read_text())
    hand = parse_rizers_species(html)
    codex = load_codex_js(js)
    merged = merge_rosters(hand, codex, codex_full.get('entries', {}))
    (ROOT / 'game_roster').mkdir(exist_ok=True)
    (ROOT / 'game_roster' / 'roster.json').write_text(json.dumps(merged, indent=1, ensure_ascii=False))
    (ROOT / 'GAME_ROSTER.md').write_text(write_markdown(merged))
    print(f'Wrote game_roster/roster.json  —  {len(merged)} entries')
    print(f'Wrote GAME_ROSTER.md')
    # V2.65 — canon exemptions (Ultharis = God, stays 999x5=4995)
    CANON_STAT_EXEMPT = {'ultharis'}
    bad = []
    exempted = 0
    for e in merged.values():
        if e['id'] in CANON_STAT_EXEMPT:
            exempted += 1
            continue
        target = (e.get('tier') or 1) * 333
        if stat_pool(e) != target:
            bad.append((e['id'], e.get('tier'), stat_pool(e), target))
    if bad:
        print(f'\nT*333 audit: {len(bad)} mismatch(es):')
        for id_, tier, p, target in bad:
            print(f'  {id_:20s} T{tier}  pool={p:5d}  (needs {target})')
    else:
        print(f'T*333 audit: OK — all {len(merged) - exempted} non-exempt satisfy pool = tier * 333  ({exempted} exempt: {sorted(CANON_STAT_EXEMPT)})')


if __name__ == '__main__':
    main()
