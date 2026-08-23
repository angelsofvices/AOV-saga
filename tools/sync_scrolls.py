#!/usr/bin/env python3
"""
sync_scrolls.py · data/scroll_lore_source.py  ->  rp7b.html

The 180 scroll pages are PROSE. Editing prose inside a 38,000-line HTML file is
miserable and error-prone, so the text lives in one readable Python file and
this script regenerates the JS block between the SCROLL_THEMES markers.

    edit  data/scroll_lore_source.py
    run   python3 tools/sync_scrolls.py
    play

It validates before it writes: 18 themes, 10 pages each, no blank pages, and
every theme still pointing at an artwork that exists on disk. A bad edit is
refused rather than half-applied.
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC  = os.path.join(ROOT, 'data', 'scroll_lore_source.py')
HTML = os.path.join(ROOT, 'rp7b.html')
ART  = os.path.join(ROOT, 'assets', '2D sprites', 'decor', 'scrolls')
DISTRICTS = ['malezor','zarvane','andrannor','veridan','netharion',
             'vorashil','xilnar','baelgor','thardin','korathen']
BEGIN = '// ── SCROLL_THEMES:BEGIN ──\n'
END   = '// ── SCROLL_THEMES:END ──\n'

def die(msg):
    print('✗ ' + msg); sys.exit(1)

def main():
    ns = {}
    exec(open(SRC, encoding='utf-8').read(), ns)
    T = ns.get('T')
    if not T: die('scroll_lore_source.py defines no T')

    # ── validate BEFORE touching the game file ──
    if len(T) != 18: die(f'expected 18 themes, found {len(T)}')
    on_disk = set(os.listdir(ART)) if os.path.isdir(ART) else set()
    for i, item in enumerate(T):
        if len(item) != 3: die(f'theme {i} is not (name, key, pages)')
        name, key, pages = item
        if len(pages) != len(DISTRICTS):
            die(f'"{name}" has {len(pages)} pages, needs {len(DISTRICTS)} (one per district)')
        for j, page in enumerate(pages):
            if not str(page).strip():
                die(f'"{name}" page {j+1} ({DISTRICTS[j]}) is blank')
        art = f'scroll_{i:02d}.png'
        if on_disk and art not in on_disk:
            die(f'"{name}" wants {art}, which is not in assets/2D sprites/decor/scrolls/')

    def esc(x): return str(x).replace('\\', '\\\\').replace("'", "\\'")
    out = ['const SCROLL_THEMES = [']
    for i, (name, key, pages) in enumerate(T):
        out.append(f"  {{ key:'{key}', title:'{esc(name)}', art:'scroll_{i:02d}.png', pages:[")
        for j, page in enumerate(pages):
            out.append(f"    '{esc(page)}',   // {DISTRICTS[j]}")
        out.append('  ]},')
    out.append('];')
    block = '\n'.join(out) + '\n'

    html = open(HTML, encoding='utf-8').read()
    if BEGIN not in html or END not in html:
        die('markers not found in rp7b.html · has the block been hand-edited away?')
    head, rest = html.split(BEGIN, 1)
    old, tail  = rest.split(END, 1)

    if old == block:
        print('· no change · rp7b.html already matches the source'); return

    # report what actually moved, so a sync is never a silent overwrite
    def pages_of(text):
        return re.findall(r"^    '(.*)',   // (\w+)$", text, re.M)
    before, after = pages_of(old), pages_of(block)
    changed = sum(1 for a, b in zip(before, after) if a != b)
    open(HTML, 'w', encoding='utf-8').write(head + BEGIN + block + END + tail)
    print(f'✓ synced · {len(T)} themes · {len(T)*len(DISTRICTS)} pages'
          f' · {changed} page(s) changed'
          f'{" · page COUNT changed" if len(before) != len(after) else ""}')

if __name__ == '__main__':
    main()
