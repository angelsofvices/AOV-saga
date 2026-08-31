"""★★★ ASSET FORMAT AUDIT · RP7

Every file under assets/ must actually BE the format its extension claims.

WHY THIS TOOL EXISTS
--------------------
Creator, 2026-08-30: *"for some reason I cant see rizer run animation.
failsafes to a faster walk."*

`assets/2D sprites/rizer/run.png` was a PHOTOSHOP DOCUMENT with a .png
extension -- Save As kept the filename and wrote PSD bytes. Everything
downstream behaved "correctly":

  · Python/PIL opened it fine (PIL reads PSD), so every measurement I took
    off it was right, which is exactly why nothing looked wrong on my side
  · the BROWSER cannot decode PSD, so img.onload never fired
  · loaded stayed false, and the draw path did what it is supposed to do
    when a sheet is missing -- fell back to the walk sheet
  · so Rizer ran at run SPEED playing the WALK animation, and the only
    evidence was one console warning nobody was watching

A silent failure that every layer handles gracefully is the hardest kind to
see. The fix is not to make the engine louder; it is to never ship the file.

WHAT IT CHECKS
--------------
Magic bytes against the extension. PNG, JPEG, GIF, WEBP, MP3/MP4/WAV.
A PSD, a renamed JPEG, or a truncated download all fail here in one second
instead of after a playtest.

    python3 tools/audit_asset_formats.py            # assets/ + video/ + audio/
    python3 tools/audit_asset_formats.py --quiet    # only failures
"""
import os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCAN = ['assets', 'video', 'audio']

# extension -> list of acceptable leading-byte signatures
MAGIC = {
    '.png':  [b'\x89PNG\r\n\x1a\n'],
    '.jpg':  [b'\xff\xd8\xff'],
    '.jpeg': [b'\xff\xd8\xff'],
    '.gif':  [b'GIF87a', b'GIF89a'],
    '.webp': [b'RIFF'],
    '.wav':  [b'RIFF'],
    '.mp3':  [b'ID3', b'\xff\xfb', b'\xff\xf3', b'\xff\xf2'],
    '.mp4':  [None],       # box-based · checked separately
    '.m4a':  [None],
}
# what the WRONG bytes actually are, so the report names the real format
KNOWN = [
    (b'8BPS',              'Adobe Photoshop document (PSD)'),
    (b'\x89PNG\r\n\x1a\n', 'PNG'),
    (b'\xff\xd8\xff',      'JPEG'),
    (b'GIF8',              'GIF'),
    (b'RIFF',              'RIFF (WAV/WEBP)'),
    (b'%PDF',              'PDF'),
    (b'PK\x03\x04',        'ZIP archive'),
    (b'II*\x00',           'TIFF'),
    (b'MM\x00*',           'TIFF'),
]


def identify(head):
    for sig, name in KNOWN:
        if head.startswith(sig):
            return name
    if len(head) > 8 and head[4:8] == b'ftyp':
        return 'MP4/MOV container'
    return 'unrecognised (' + ' '.join(f'{b:02x}' for b in head[:8]) + ')'


def main():
    quiet = '--quiet' in sys.argv
    checked = bad = 0
    problems = []
    for base in SCAN:
        top = os.path.join(ROOT, base)
        if not os.path.isdir(top):
            continue
        for d, _dirs, files in os.walk(top):
            for fn in sorted(files):
                ext = os.path.splitext(fn)[1].lower()
                if ext not in MAGIC:
                    continue
                p = os.path.join(d, fn)
                try:
                    with open(p, 'rb') as fh:
                        head = fh.read(16)
                except Exception as e:
                    problems.append((os.path.relpath(p, ROOT), f'unreadable: {e}'))
                    bad += 1
                    continue
                checked += 1
                sigs = MAGIC[ext]
                if sigs == [None]:                      # mp4/m4a · box-based
                    okmagic = len(head) > 8 and head[4:8] == b'ftyp'
                else:
                    okmagic = any(head.startswith(s) for s in sigs)
                if not okmagic:
                    problems.append((os.path.relpath(p, ROOT),
                                     f'named {ext} but the bytes are {identify(head)}'))
                    bad += 1

    for rel, why in problems:
        print(f'  ❌ {rel}\n       {why}')
    if not quiet or bad:
        print(f'\n{checked} files checked · {bad} mislabelled')
    if bad:
        print('\nA mislabelled sheet does not crash -- the browser simply never')
        print('decodes it, `loaded` stays false, and the draw path falls back.')
        print('Re-export from the editor with the correct format.')
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
