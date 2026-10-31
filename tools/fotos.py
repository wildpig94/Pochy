#!/usr/bin/env python3
"""Las fotografias del archivo, sin leyendas y en su propio espacio.

La historia vive en los capitulos; las fotos viven aqui, agrupadas por la parte
de la espera a la que pertenecen. Esta tabla es el unico lugar donde esta esa
asignacion, y ninguna foto carga con un texto encima.

    python3 tools/fotos.py

  1. Vuelve a escribir la galeria dentro de index.html, entre los marcadores
     FOTOS:inicio y FOTOS:fin. Si nada cambio en la tabla, el archivo queda
     identico byte por byte.
  2. Genera revisar.html: la pagina local donde se ve cada foto con su nombre y
     el grupo en el que esta, para mover alguna de grupo si no corresponde.

Para mover una foto de grupo: cambia la linea de lugar, o hazlo en revisar.html
y pasa la lista.
"""

import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(ROOT, 'fuente', 'index.html')
REVIEW = os.path.join(ROOT, 'revisar.html')
INICIO = '<!-- FOTOS:inicio'
FIN = '<!-- FOTOS:fin'
INICIO_FAN = '<!-- FAN:inicio'
FIN_FAN = '<!-- FAN:fin'
IND_GROUP = ' ' * 6
IND_FIGURE = ' ' * 10

GRUPOS = [
    # I · Before the airport — screens, 2026
    ('Before the airport', 'screens, 2026', [
        'memoria11.jpg',
        'memoria13.jpg',
        'memoria19.jpg',
        'memoria25.jpg',
        'memoria5.jpg',
        'memoria6.jpg',
        'memoria14.jpg',
        'memoria15.png',
        'memoria16.jpg',
    ]),
    # II · The wait — the part nobody photographs
    ('The wait', 'the part nobody photographs', [
        'memoria1.jpg',
        'memoria2.jpg',
        'memoria3.jpg',
        'memoria4.jpg',
        'memoria7.png',
        'memoria8.jpg',
        'memoria9.png',
        'memoria10.jpg',
        'memoria12.jpg',
        'memoria17.jpg',
        'memoria18.jpg',
        'memoria20.png',
        'memoria21.png',
        'memoria22.jpg',
        'memoria23.jpg',
        'memoria24.jpg',
        'memoria26.jpg',
    ]),
    # III · Ten seconds — the airport, then Mexico
    ('Ten seconds', 'the airport, then Mexico', [
        'nueva06.jpg',
        'nueva08.jpg',
        'nueva09.jpg',
        'nueva12.jpg',
        'nueva14.jpg',
    ]),
    # IV · The last door — five months, almost
    ('The last door', 'five months, almost', [
        'cap4-1.jpg',
        'cap4-2.jpg',
        'cap4-3.jpg',
        'cap4-4.jpg',
        'cap4-6.jpg',
        'cap4-9.jpg',
        'cap4-10.jpg',
        'cap4-11.jpg',
    ]),
]


def measure(path):
    """Ancho y alto, para que la reticula reserve el espacio antes de descifrar."""
    from PIL import Image
    return Image.open(os.path.join(ROOT, path)).size


def figure(name, alt):
    """Sin src: la foto la entrega el candado ya descifrada (ver tools/candado.mjs)."""
    chica = 'fotos/web/%s-480.webp' % os.path.splitext(name)[0]
    if not os.path.exists(os.path.join(ROOT, chica)):
        chica = 'fotos/' + name
    ancho, alto = measure(chica)
    return ('<figure class="plate"><img data-abrir="%s" width="%d" height="%d" alt="%s" loading="lazy"'
            ' data-full="fotos/%s" decoding="async"></figure>'
            % (chica, ancho, alto, alt, name))


# Las fotos del bloque "The fan", en el capitulo III. Mismo orden que en la pagina.
FAN = [
    'fan1-1.jpg',
    'fan1-2.jpg',
    'fan1-3.jpg',
    'fan1-4.jpg',
    'fan1-5.jpg',
    'fan1-6.jpg',
]


def fan_gallery():
    total = len(FAN)
    return '\n'.join(
        IND_FIGURE + figure(f, 'Photograph from &ldquo;The fan&rdquo;, %d of %d.' % (i, total))
        for i, f in enumerate(FAN, 1))


def gallery():
    bloques = []
    for titulo, sub, fotos in GRUPOS:
        total = len(fotos)
        filas = '\n'.join(
            IND_FIGURE + figure(f, 'Photograph from &ldquo;%s&rdquo;, %d of %d.' % (titulo, i, total))
            for i, f in enumerate(fotos, 1))
        bloques.append(
            '%s<div class="plates-group">\n'
            '%s  <div class="g-label">%s</div>\n'
            '%s  <div class="g-sub">%s</div>\n'
            '%s  <div class="plates-grid">\n'
            '%s\n'
            '%s  </div>\n'
            '%s</div>' % (IND_GROUP, IND_GROUP, titulo, IND_GROUP, sub,
                          IND_GROUP, filas, IND_GROUP, IND_GROUP))
    return '\n'.join(bloques)


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


def apply_index(dry=False):
    src = open(INDEX, encoding='utf-8').read()
    src, uno = rewrite(src, INICIO, FIN, gallery())
    src, dos = rewrite(src, INICIO_FAN, FIN_FAN, fan_gallery())
    if not dry and (uno or dos):
        open(INDEX, 'w', encoding='utf-8').write(src)
    return uno + dos


CARD = """      <article class="card" data-grupo="%s">
        <span class="num">%s</span>
        <a class="shot" href="fotos/%s" target="_blank" rel="noopener"><img src="%s" alt="" loading="lazy"></a>
        <div class="meta">
          <div class="file">%s</div>
          <label class="pick">grupo
            <select>%s</select>
          </label>
        </div>
      </article>"""

SECCION = """    <section class="grupo" data-grupo="%s">
      <h2>%s <span class="sub">%s</span> <span class="n">%d fotos</span></h2>
      <div class="cards">%s</div>
    </section>"""


def write_review():
    opciones = ''.join('<option value="%s">%s</option>' % (t, t) for t, _, _ in GRUPOS)
    secciones, total = [], 0
    for titulo, sub, fotos in GRUPOS:
        tarjetas = []
        for nombre in fotos:
            total += 1
            chica = 'fotos/web/%s-480.webp' % os.path.splitext(nombre)[0]
            if not os.path.exists(os.path.join(ROOT, chica)):
                chica = 'fotos/' + nombre
            hechas = ''.join(
                '<option value="%s"%s>%s</option>'
                % (t, ' selected' if t == titulo else '', t) for t, _, _ in GRUPOS)
            tarjetas.append(CARD % (titulo, total, nombre, chica, nombre, hechas))
        secciones.append(SECCION % (titulo, titulo, sub, len(fotos), '\n'.join(tarjetas)))

    plantilla = open(os.path.join(ROOT, 'tools', 'revisar.plantilla.html'),
                     encoding='utf-8').read()
    pagina = (plantilla.replace('__SECCIONES__', '\n'.join(secciones))
                      .replace('__TOTAL__', str(total))
                      .replace('__GRUPOS__', str(len(GRUPOS))))
    open(REVIEW, 'w', encoding='utf-8').write(pagina)
    return total


def main():
    cambios = apply_index()
    total = write_review()
    print('index.html: %s' % ('galeria reescrita' if cambios else 'sin cambios, ya estaba igual'))
    print('revisar.html: %d fotos en %d grupos' % (total, len(GRUPOS)))
    print('bloque del fan: %d fotos' % len(FAN))
    print('para publicar: git add . && git commit -m "Fotos" && git push')


if __name__ == '__main__':
    main()
