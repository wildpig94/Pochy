#!/usr/bin/env python3
"""Las fotos del archivo y sus leyendas, en un solo lugar.

Esta lista es la unica fuente de verdad del emparejamiento foto/leyenda.
De aqui salen dos cosas:

    python3 tools/fotos.py

  1. Vuelve a escribir los bloques de fotos dentro de index.html (la pagina
     publicada), con el srcset, el tamano y el data-full ya armados. Si nada
     cambio en la tabla, el archivo queda identico byte por byte.
  2. Genera revisar.html, la pagina local donde se ve cada foto con su leyenda
     y su nombre de archivo, para comprobar con los ojos que van juntas.

Para arreglar un emparejamiento: cambia el nombre del archivo en la linea que
no corresponde y vuelve a correrlo. El orden de los grupos no se mueve; dentro
de cada grupo puedes mover o cambiar lineas con libertad.
"""

import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(ROOT, 'index.html')
REVIEW = os.path.join(ROOT, 'revisar.html')
IND_SHEET = ' ' * 8
IND_FIGURE = ' ' * 10

# donde vive el grupo · ancho de la retícula · [(archivo, leyenda), ...]
SECCIONES = [
    # ── I · First contact — A heart, because I had nothing better
    ('I · First contact — A heart, because I had nothing better', 'wide', [
        ('memoria11.jpg', 'the two of us, in a world made of pixels'),
        ('memoria13.jpg', 'where it started'),
    ]),
    # ── I · Two languages — Behind a translator
    ('I · Two languages — Behind a translator', 'wide', [
        ('memoria19.jpg', 'the conversations that taught me a language'),
        ('memoria25.jpg', 'late replies, my fault'),
    ]),
    # ── I · First photo — The voice had a face
    ('I · First photo — The voice had a face', 'sheet', [
        ('memoria5.jpg', 'the first she sent me'),
        ('memoria6.jpg', 'where she was standing'),
    ]),
    # ── I · First call — Nowhere to hide an accent
    ('I · First call — Nowhere to hide an accent', 'sheet', [
        ('memoria14.jpg', 'the afternoon call'),
        ('memoria15.png', 'the hour that became four'),
    ]),
    # ── I · Official — One night the call didn't end
    ("I · Official — One night the call didn't end", 'sheet', [
        ('memoria16.jpg', '2D, and then not'),
    ]),
    # ── II · Every night — One word for a bad line
    ('II · Every night — One word for a bad line', 'sheet', [
        ('memoria1.jpg', 'night one'),
        ('memoria2.jpg', 'still on the call'),
        ('memoria3.jpg', 'carrot'),
        ('memoria4.jpg', 'the line stayed open'),
    ]),
    # ── II · Growing — Two people getting better
    ('II · Growing — Two people getting better', 'sheet', [
        ('memoria7.png', 'the year we started keeping notes'),
        ('memoria8.jpg', 'long conversations'),
        ('memoria9.png', 'unfinished business'),
        ('memoria10.jpg', 'better, slowly'),
        ('memoria12.jpg', 'her side of it'),
    ]),
    # ── II · The plan — One piece of paper
    ('II · The plan — One piece of paper', 'sheet', [
        ('memoria17.jpg', 'the plan, in writing'),
        ('memoria18.jpg', 'the list we keep adding to'),
        ('memoria20.png', 'paper, patience'),
        ('memoria21.png', 'one door'),
        ('memoria22.jpg', 'almost'),
        ('memoria23.jpg', 'the countdown we stopped counting'),
        ('memoria24.jpg', 'the waiting, kept'),
        ('memoria26.jpg', 'still waiting'),
    ]),
    # ── III · Mexico — Not the same as a screen
    ('III · Mexico — Not the same as a screen', 'sheet', [
        ('nueva06.jpg', 'Mexico'),
        ('nueva08.jpg', 'in person'),
        ('nueva09.jpg', 'the week we had'),
        ('nueva12.jpg', 'before she flew back'),
        ('nueva14.jpg', 'the last morning'),
    ]),
    # ── IV · Almost home — The last stretch
    ('IV · Almost home — The last stretch', 'sheet', [
        ('cap4-1.jpg', 'a Tuesday'),
        ('cap4-2.jpg', 'the dog'),
        ('cap4-3.jpg', 'the rabbit'),
        ('cap4-4.jpg', 'a rose, for no reason'),
        ('cap4-5.jpg', 'already knew'),
        ('cap4-6.jpg', 'in her arms'),
        ('cap4-7.jpg', 'an altar to something ordinary'),
        ('cap4-8.jpg', 'one more night of the call'),
    ]),
]


def photo_files():
    carpeta = os.path.join(ROOT, 'fotos')
    return sorted(f for f in os.listdir(carpeta)
                  if os.path.isfile(os.path.join(carpeta, f)) and not f.startswith('.'))


def width_of(name):
    from PIL import Image
    return Image.open(os.path.join(ROOT, 'fotos', name)).size[0]


def sources(name):
    """Las versiones de una foto, de la mas chica a la mas grande."""
    base = os.path.splitext(name)[0]
    salida = []
    for ancho in (480, 900):
        ruta = 'fotos/web/%s-%d.webp' % (base, ancho)
        if os.path.exists(os.path.join(ROOT, ruta)):
            salida.append((ancho, ruta))
    original = width_of(name)
    salida = [(a, r) for (a, r) in salida if a < original]
    salida.append((original, 'fotos/' + name))
    salida.sort()
    return salida


def figure(name, caption):
    srcs = sources(name)
    srcset = ', '.join('%s %dw' % (ruta, ancho) for ancho, ruta in srcs)
    return ('<figure class="plate"><img src="%s" srcset="%s" sizes="(max-width:720px) 45vw, 210px"'
            ' alt="" loading="lazy" data-full="fotos/%s" decoding="async">'
            '<figcaption>%s</figcaption></figure>'
            % (srcs[0][1], srcset, name, caption))


def sheet(ancho, fotos):
    clase = 'sheet wide' if ancho == 'wide' else 'sheet'
    cuerpo = '\n'.join(IND_FIGURE + figure(f, c) for f, c in fotos)
    return '%s<div class="%s">\n%s\n%s</div>' % (IND_SHEET, clase, cuerpo, IND_SHEET)


def apply_index(dry=False):
    src = open(INDEX, encoding='utf-8').read()
    bloques = list(re.finditer(r'[ \t]*<div class="sheet( wide)?">.*?</div>', src, re.S))
    if len(bloques) != len(SECCIONES):
        raise SystemExit('la pagina tiene %d bloques de fotos y la tabla %d: no toco nada'
                         % (len(bloques), len(SECCIONES)))
    piezas, ultimo, cambios = [], 0, 0
    for m, (donde, ancho, fotos) in zip(bloques, SECCIONES):
        nuevo = sheet(ancho, fotos)
        piezas.append(src[ultimo:m.start()])
        piezas.append(nuevo)
        ultimo = m.end()
        if m.group(0) != nuevo:
            cambios += 1
    piezas.append(src[ultimo:])
    if not dry and cambios:
        open(INDEX, 'w', encoding='utf-8').write(''.join(piezas))
    return cambios


CARD = """      <article class="card" data-n="%d">
        <span class="num">%d</span>
        <a class="shot" href="fotos/%s" target="_blank" rel="noopener"><img src="%s" alt="" loading="lazy"></a>
        <div class="meta">
          <div class="cap">%s</div>
          <label class="pick">va con
            <select data-n="%d">%s</select>
          </label>
          <div class="where">%s</div>
        </div>
      </article>"""


def write_review():
    archivos = photo_files()
    filas, n = [], 0
    for donde, ancho, fotos in SECCIONES:
        for nombre, caption in fotos:
            n += 1
            opciones = ''.join(
                '<option value="%s"%s>%s</option>'
                % (a, ' selected' if a == nombre else '', a) for a in archivos)
            chica = 'fotos/web/%s-480.webp' % os.path.splitext(nombre)[0]
            if not os.path.exists(os.path.join(ROOT, chica)):
                chica = 'fotos/' + nombre
            filas.append(CARD % (n, n, nombre, chica, caption, n, opciones, donde))

    pagina = REVIEW_TEMPLATE.replace('__CARDS__', '\n'.join(filas)).replace('__TOTAL__', str(n))
    open(REVIEW, 'w', encoding='utf-8').write(pagina)
    return n


REVIEW_TEMPLATE = open(os.path.join(ROOT, 'tools', 'revisar.plantilla.html'),
                       encoding='utf-8').read()


def main():
    cambios = apply_index()
    cuantas = write_review()
    if cambios:
        print('index.html: %d bloques reescritos' % cambios)
    else:
        print('index.html: sin cambios, ya estaba igual que la tabla')
    print('revisar.html: %d fotos en la lista' % cuantas)
    print('para publicar: git add . && git commit -m "Fotos" && git push')


if __name__ == '__main__':
    main()
