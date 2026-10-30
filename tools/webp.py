#!/usr/bin/env python3
"""Rehace las versiones ligeras de fotos/ en fotos/web/ (480 y 900 px, WebP).

Úsalo cada vez que agregues o cambies una foto:

    python3 tools/webp.py

No toca los originales: solo escribe fotos/web/<nombre>-480.webp y -900.webp,
que son los que carga la página. Los originales se usan al abrir una foto en
grande y al imprimir.
"""
import glob
import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'fotos')
OUT = os.path.join(SRC, 'web')
WIDTHS = (480, 900)


def main():
    os.makedirs(OUT, exist_ok=True)
    before = after = 0
    made = 0
    for path in sorted(glob.glob(os.path.join(SRC, '*.*'))):
        base = os.path.splitext(os.path.basename(path))[0]
        image = Image.open(path).convert('RGB')
        width, height = image.size
        before += os.path.getsize(path)
        for target in WIDTHS:
            if width <= target:
                continue
            out = os.path.join(OUT, '%s-%d.webp' % (base, target))
            if os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(path):
                after += os.path.getsize(out)
                continue
            height_out = round(height * target / width)
            image.resize((target, height_out), Image.LANCZOS).save(
                out, 'WEBP', quality=74, method=6)
            after += os.path.getsize(out)
            made += 1
    print('nuevas: %d' % made)
    print('originales: %.1f MB' % (before / 1048576))
    print('versiones ligeras: %.1f MB' % (after / 1048576))
    print('acumulado en fotos/web: %.1f MB total' % (
        sum(os.path.getsize(f) for f in glob.glob(os.path.join(OUT, '*.webp'))) / 1048576))


if __name__ == '__main__':
    main()
