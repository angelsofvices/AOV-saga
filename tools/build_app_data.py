#!/usr/bin/env python3
"""Build app/data/codex.json for the home-screen app (/app/).

Sources of truth stay where they are:
  - codex.html            <script id="cx-data"> — the 358-entry master codex
  - game_roster/roster.json — Zyrex base stats + evolution links

Codex entries get stats attached when a roster species shares their name.
Roster-only Zyrex (not yet in the codex page) are appended as their own
entries so the app's codex can still show them.

Re-run after either source changes:
    python3 tools/build_app_data.py
"""
import html
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']


def clean(s):
    return html.unescape(s or '').strip()


def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')


def main():
    src = open(os.path.join(ROOT, 'codex.html'), encoding='utf-8').read()
    m = re.search(r'<script id="cx-data" type="application/json">(.*?)</script>', src, re.S)
    codex = json.loads(m.group(1))['data'].values()
    roster = json.load(open(os.path.join(ROOT, 'game_roster/roster.json'), encoding='utf-8'))
    by_name = {v['name'].lower(): v for v in roster.values()}
    name_of = {k: v['name'] for k, v in roster.items()}

    def stats_for(r):
        b = r.get('base') or {}
        evo = None
        if r.get('evolveTo'):
            evo = {'to': name_of.get(r['evolveTo'], r['evolveTo'].title()), 'lv': r.get('evolveLv')}
        return {
            'stats': [b.get(k, 0) for k in ('hp', 'atk', 'def', 'spd', 'spc')],
            'district': r.get('primaryDistrictName'),
            'evolve': evo,
        }

    out, seen = [], set()
    for e in codex:
        name = clean(e['n'])
        item = {
            'k': slug(name),
            'n': name,
            'id': e['id'],
            't': e['tier'],
            'c': e['cat'],
            'tag': clean(e['tag']),
            'types': clean(e['types']),
            'lore': clean(e['lore']),
            'b': bool(e['bondable']),
        }
        r = by_name.get(name.lower())
        if r:
            item.update(stats_for(r))
            seen.add(name.lower())
        out.append(item)

    for r in roster.values():
        if r['name'].lower() in seen:
            continue
        name = r['name'].title() if r['name'].isupper() else r['name']
        types = ' / '.join(t for t in (r.get('type'), r.get('type2'), r.get('type3')) if t)
        item = {
            'k': slug(name),
            'n': name,
            'id': 'ZYREX',
            't': r['tier'],
            'c': 'zyrex',
            'tag': 'Zyrex · ' + types,
            'types': types,
            'lore': '',
            'b': True,
        }
        item.update(stats_for(r))
        out.append(item)

    # Evolution "from" links, so a detail page can show the whole chain.
    by_lower = {o['n'].lower(): o for o in out}
    for o in out:
        evo = o.get('evolve')
        if evo and evo['to'].lower() in by_lower:
            target = by_lower[evo['to'].lower()]
            evo['to'], evo['k'] = target['n'], target['k']
            target['from'] = {'n': o['n'], 'k': o['k'], 'lv': evo['lv']}

    out.sort(key=lambda o: (-o['t'], o['n']))
    dest = os.path.join(ROOT, 'app/data/codex.json')
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, 'w', encoding='utf-8') as f:
        json.dump({'entries': out}, f, ensure_ascii=False, separators=(',', ':'))
    print(f'wrote {len(out)} entries ({sum("stats" in o for o in out)} with stats) -> app/data/codex.json')


if __name__ == '__main__':
    main()
