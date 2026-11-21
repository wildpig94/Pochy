#!/usr/bin/env python3
"""Construye los capitulos de la tira dentro de fuente/index.html.

    python3 tools/tira.py --extraer   # saca capitulo.json de los capitulos actuales
    python3 tools/tira.py --nuevo 3   # convierte imagenes de webtoon/chapter-3/ a webp y crea capitulo.json
    python3 tools/tira.py             # actualiza CAPS, aviso y botones en fuente/index.html

Un panel dentro de capitulo.json puede ser una placa:
    {"f": "01-escena.webp", "alt": "Descripcion breve."}
o una cartela de texto (sin imagen):
    {"texto": "Three days later."}
"""

import html
import json
import os
import re
import shutil
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(ROOT, 'fuente', 'index.html')
WEBTOON = os.path.join(ROOT, 'webtoon')
ORIGINALES = os.path.join(ROOT, 'webtoon-originales')

INICIO_CAPS = '// TIRA:inicio'
FIN_CAPS = '// TIRA:fin'
INICIO_AVISO = '<!-- TIRA-AVISO:inicio'
FIN_AVISO = '<!-- TIRA-AVISO:fin'
INICIO_BOTONES = '<!-- TIRA-BOTONES:inicio'
FIN_BOTONES = '<!-- TIRA-BOTONES:fin'

UNIDADES = [
    'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
    'seventeen', 'eighteen', 'nineteen',
]
DECENAS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']


def en_palabras(n):
    if n < 20:
        return UNIDADES[n]
    if n < 100:
        d, u = divmod(n, 10)
        return DECENAS[d] if u == 0 else DECENAS[d] + '-' + UNIDADES[u]
    return str(n)


def rewrite(src, inicio, fin, contenido):
    a, b = src.find(inicio), src.find(fin)
    if a < 0 or b < a:
        raise SystemExit('no encuentro los marcadores %s / %s' % (inicio, fin))
    desde = src.find('\n', a) + 1
    hasta = src.rfind('\n', 0, b) + 1
    nuevo = contenido + '\n'
    if src[desde:hasta] == nuevo:
        return src, 0
    return src[:desde] + nuevo + src[hasta:], 1


def extraer():
    src = open(INDEX, encoding='utf-8').read()
    a, b = src.find(INICIO_CAPS), src.find(FIN_CAPS)
    if a < 0 or b < a:
        raise SystemExit('no encuentro los marcadores TIRA:inicio / TIRA:fin')
    bloque = src[a:b]
    m = re.search(r'var\s+CAPS\s*=\s*(\[.*\])\s*;', bloque)
    if not m:
        raise SystemExit('no encuentro var CAPS=[...]; entre los marcadores')
    caps = json.loads(m.group(1))
    escritos = 0
    for c in caps:
        carpeta = os.path.join(WEBTOON, 'chapter-%d' % c['n'])
        os.makedirs(carpeta, exist_ok=True)
        destino = os.path.join(carpeta, 'capitulo.json')
        if os.path.exists(destino):
            print('ya existe, omitido: %s' % os.path.relpath(destino, ROOT))
            continue
        paneles = []
        for p in c['paneles']:
            if 'f' in p:
                paneles.append({'f': os.path.basename(p['f']), 'alt': p.get('alt', '')})
            elif 'texto' in p:
                paneles.append({'texto': p['texto']})
        data = {
            'ordinal': c['ordinal'],
            'kicker': c['kicker'],
            'titulo': c['titulo'],
            'sub': c['sub'],
            'cierre': c['cierre'],
            'paneles': paneles,
        }
        with open(destino, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write('\n')
        escritos += 1
        print('escrito: %s (%d paneles)' % (os.path.relpath(destino, ROOT), len(paneles)))
    if not escritos:
        print('nada nuevo que extraer.')


def nuevo_capitulo(num):
    from PIL import Image

    carpeta = os.path.join(WEBTOON, 'chapter-%d' % num)
    if not os.path.isdir(carpeta):
        os.makedirs(carpeta, exist_ok=True)
        print('carpeta creada: %s' % os.path.relpath(carpeta, ROOT))
        print('deja ahi las imagenes del capitulo y vuelve a correr: python3 tools/tira.py --nuevo %d' % num)
        return

    respaldo = os.path.join(ORIGINALES, 'chapter-%d' % num)
    convertidas = 0
    for nombre in sorted(os.listdir(carpeta)):
        if not re.search(r'\.(jpe?g|png)$', nombre, re.I):
            continue
        origen = os.path.join(carpeta, nombre)
        base = os.path.splitext(nombre)[0]
        destino_webp = os.path.join(carpeta, base + '.webp')
        with Image.open(origen) as im:
            if im.mode not in ('RGB', 'RGBA'):
                im = im.convert('RGB')
            w, h = im.size
            if w > 848:
                nh = round(h * 848 / w)
                im = im.resize((848, nh), Image.Resampling.LANCZOS)
            im.save(destino_webp, 'WEBP', quality=82, method=6)
        os.makedirs(respaldo, exist_ok=True)
        shutil.move(origen, os.path.join(respaldo, nombre))
        convertidas += 1

    if convertidas:
        print('convertidas a webp (max 848 px): %d (originales en %s)' % (
            convertidas, os.path.relpath(respaldo, ROOT)))

    destino_json = os.path.join(carpeta, 'capitulo.json')
    if os.path.exists(destino_json):
        print('ya existe %s — no se sobrescribe.' % os.path.relpath(destino_json, ROOT))
        return

    webps = [
        n for n in sorted(os.listdir(carpeta))
        if n.lower().endswith('.webp') and not n.lower().endswith('-480.webp')
    ]
    ordinal = en_palabras(num)
    data = {
        'ordinal': ordinal,
        'kicker': 'Chapter ' + ordinal,
        'titulo': 'TODO',
        'sub': 'TODO',
        'cierre': 'TODO',
        'paneles': [{'f': n, 'alt': ''} for n in webps],
    }
    with open(destino_json, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print('creado: %s (%d placas). Rellena titulo, sub, cierre y alt, y corre: python3 tools/tira.py' % (
        os.path.relpath(destino_json, ROOT), len(webps)))


def listar_capitulos():
    if not os.path.isdir(WEBTOON):
        raise SystemExit('no existe la carpeta webtoon/')
    encontrados = []
    for nombre in os.listdir(WEBTOON):
        m = re.match(r'^chapter-(\d+)$', nombre)
        if not m:
            continue
        ruta = os.path.join(WEBTOON, nombre)
        if os.path.isdir(ruta):
            encontrados.append((int(m.group(1)), ruta))
    encontrados.sort(key=lambda x: x[0])
    return encontrados


def construir():
    from PIL import Image

    caps_out = []
    total_placas = 0

    for num, carpeta in listar_capitulos():
        ruta_json = os.path.join(carpeta, 'capitulo.json')
        if not os.path.exists(ruta_json):
            raise SystemExit('falta %s (corre python3 tools/tira.py --extraer o --nuevo %d)' % (
                os.path.relpath(ruta_json, ROOT), num))
        meta = json.load(open(ruta_json, encoding='utf-8'))

        for campo in ('ordinal', 'kicker', 'titulo', 'sub', 'cierre'):
            val = str(meta.get(campo, '')).strip()
            if not val or 'TODO' in val:
                raise SystemExit('%s: falta completar "%s" (aun dice TODO o esta vacio)' % (
                    os.path.relpath(ruta_json, ROOT), campo))

        ordinal = meta['ordinal']
        paneles_out = []
        num_placa = 0
        for p in meta.get('paneles', []):
            if 'texto' in p and not p.get('f'):
                txt = str(p['texto']).strip()
                if not txt or 'TODO' in txt:
                    raise SystemExit('%s: cartela vacia o con TODO' % os.path.relpath(ruta_json, ROOT))
                paneles_out.append({'texto': txt})
            elif 'f' in p:
                nombre = p['f']
                ruta_img = os.path.join(carpeta, nombre)
                if not os.path.exists(ruta_img):
                    raise SystemExit('%s: no existe la placa %s' % (
                        os.path.relpath(ruta_json, ROOT), nombre))
                num_placa += 1
                total_placas += 1
                with Image.open(ruta_img) as im:
                    w, h = im.size
                kb = round(os.path.getsize(ruta_img) / 1024)
                alt = str(p.get('alt', '')).strip()
                if not alt:
                    alt = 'Plate %d of chapter %s.' % (num_placa, ordinal)
                    print('aviso: %s/%s sin alt — usando "%s"' % (
                        os.path.basename(carpeta), nombre, alt))
                paneles_out.append({
                    'f': 'webtoon/chapter-%d/%s' % (num, nombre),
                    'w': w,
                    'h': h,
                    'alt': alt,
                    'kb': kb,
                })
            else:
                raise SystemExit('%s: panel invalido (necesita "f" o "texto")' % os.path.relpath(ruta_json, ROOT))

        caps_out.append({
            'n': num,
            'ordinal': ordinal,
            'kicker': meta['kicker'],
            'titulo': meta['titulo'],
            'sub': meta['sub'],
            'cierre': meta['cierre'],
            'paneles': paneles_out,
        })

    if not caps_out:
        raise SystemExit('no hay capitulos en webtoon/')

    linea_caps = '    var CAPS=' + json.dumps(
        caps_out, ensure_ascii=False, separators=(',', ':')
    ).replace('</', '<\\/') + ';'

    n_caps = len(caps_out)
    pal_caps = en_palabras(n_caps).capitalize()
    etiqueta_caps = 'chapter' if n_caps == 1 else 'chapters'
    titulos_sub = ' · '.join(html.escape(c['titulo']) for c in caps_out)
    pal_placas = en_palabras(total_placas)
    bloque_aviso = '\n'.join([
        '        <span class="sf-tag" id="sfTag">New</span>',
        '        <span class="sf-title">%s %s, <em>drawn.</em></span>' % (pal_caps, etiqueta_caps),
        '        <span class="sf-sub">%s · %s plates.</span>' % (titulos_sub, pal_placas),
    ])

    botones = []
    for idx in range(1, len(caps_out)):
        c = caps_out[idx]
        botones.append(
            '      <button class="sf-cta" type="button" data-cap="%d">Chapter %s · %s &rarr;</button>' % (
                idx, html.escape(c['ordinal']), html.escape(c['titulo'])
            )
        )
    bloque_botones = '\n'.join(botones)

    src = open(INDEX, encoding='utf-8').read()
    src, c1 = rewrite(src, INICIO_CAPS, FIN_CAPS, linea_caps)
    src, c2 = rewrite(src, INICIO_AVISO, FIN_AVISO, bloque_aviso)
    src, c3 = rewrite(src, INICIO_BOTONES, FIN_BOTONES, bloque_botones)
    cambios = c1 + c2 + c3
    if cambios:
        open(INDEX, 'w', encoding='utf-8').write(src)
    print('fuente/index.html: %s (%d capitulos, %d placas)' % (
        'actualizado' if cambios else 'sin cambios, ya estaba igual', n_caps, total_placas))


def main():
    args = sys.argv[1:]
    if args == ['--extraer']:
        extraer()
    elif len(args) == 2 and args[0] == '--nuevo' and args[1].isdigit():
        nuevo_capitulo(int(args[1]))
    elif not args:
        construir()
    else:
        print('uso:\n  python3 tools/tira.py\n  python3 tools/tira.py --extraer\n  python3 tools/tira.py --nuevo N', file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
