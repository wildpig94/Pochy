#!/usr/bin/env python3
"""Genera revisar.html: todas las fotos del archivo junto a su leyenda.

Sirve para un solo trabajo: comprobar, con los ojos, que cada foto es la que
debe estar debajo de cada leyenda. El resultado no se publica (está en
.gitignore); vive solo en la carpeta local.

    python3 tools/revisar.py
    # y luego se abre revisar.html en el navegador
"""
import os
import re
import html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CHAPTER_NAMES = {'ch1': 'I', 'ch2': 'II', 'ch3': 'III', 'ch4': 'IV', 'ch5': 'V'}


def read_index():
    with open(os.path.join(ROOT, 'index.html'), encoding='utf-8') as fh:
        return fh.read()


def egg_texts(src):
    """Las notas que abren las letras escondidas, sacadas del propio JS."""
    block = re.search(r'var EGG_TEXTS=\{(.*?)\n  \};', src, re.S)
    if not block:
        return {}
    out = {}
    for key, text in re.findall(r'(e\d)\s*:\s*"((?:[^"\\]|\\.)*)"', block.group(1)):
        out[key] = text.replace('\\"', '"')
    return out


def chapter_blocks(src):
    """Devuelve [(id, texto del capitulo)] en orden."""
    marks = [(m.start(), m.group(1)) for m in
             re.finditer(r'<section class="chapter[^"]*" id="(ch\d)">', src)]
    spans = []
    for i, (start, cid) in enumerate(marks):
        end = marks[i + 1][0] if i + 1 < len(marks) else src.find('</footer>', start)
        spans.append((cid, src[start:end]))
    return spans


def entry_groups(block):
    """Agrupa las figuras por entrada, conservando su 'when' y su titulo."""
    groups = []
    for m in re.finditer(
            r'<div class="when">(.*?)</div>(.*?)(?=<div class="when">|<div class="ring-block"|<div class="specimen"|$)',
            block, re.S):
        when = re.sub(r'<[^>]+>', ' ', m.group(1)).strip()
        body = m.group(2)
        title = re.search(r'<h3[^>]*>(.*?)</h3>', body, re.S)
        title = re.sub(r'<[^>]+>', '', title.group(1)).strip() if title else ''
        figures = []
        for fig in re.finditer(r'<figure class="plate">(.*?)</figure>', body, re.S):
            img = re.search(r'<img[^>]*>', fig.group(1)).group(0)
            full = re.search(r'data-full="([^"]+)"', img)
            src = full.group(1) if full else re.search(r'src="([^"]+)"', img).group(1)
            cap = re.search(r'<figcaption>(.*?)</figcaption>', fig.group(1), re.S)
            figures.append((src, re.sub(r'<[^>]+>', '', cap.group(1)).strip() if cap else ''))
        if figures:
            groups.append((when, title, figures))
    return groups


def hidden_things(block, notes):
    out = []
    for m in re.finditer(r'data-file="([^"]+)"\s+data-(?:egg|text)="([^"]*)"', block):
        out.append((m.group(1), m.group(2)))
    return out


def visible_text(fragment):
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', fragment)).strip()


def build():
    src = read_index()
    notes = egg_texts(src)
    cards = []
    n = 0
    hidden = []

    for cid, block in chapter_blocks(src):
        groups = entry_groups(block)
        for when, title, figures in groups:
            for path, cap in figures:
                n += 1
                cards.append(dict(n=n, chapter=CHAPTER_NAMES.get(cid, cid), when=when,
                                  title=title, path=path, cap=cap))
        for path, key in hidden_things(block, notes):
            word = ''
            wm = re.search(r'class="egg-word"[^>]*data-file="%s"[^>]*>(.*?)</span>' % re.escape(path), block, re.S)
            if wm:
                word = visible_text(wm.group(1))
            hidden.append((path, notes.get(key, key), word))

    rows = []
    for c in cards:
        rows.append("""      <article class="card">
        <div class="num">%d</div>
        <a href="%s" target="_blank" rel="noopener"><img src="%s" alt="" loading="lazy"></a>
        <div class="meta">
          <div class="cap">%s</div>
          <div class="file">%s</div>
          <div class="where">capitulo %s · %s%s</div>
        </div>
      </article>""" % (
            c['n'], html.escape(c['path']), html.escape(c['path']),
            html.escape(c['cap']) or '<span class="empty">(sin leyenda)</span>',
            html.escape(os.path.basename(c['path'])),
            html.escape(c['chapter']), html.escape(c['when']),
            (' · ' + html.escape(c['title'])) if c['title'] else ''))

    hidden_rows = []
    for path, text, word in hidden:
        hidden_rows.append("""      <article class="card">
        <a href="%s" target="_blank" rel="noopener"><img src="%s" alt="" loading="lazy"></a>
        <div class="meta">
          <div class="cap">%s</div>
          <div class="file">%s%s</div>
          <div class="where">letra escondida</div>
        </div>
      </article>""" % (
            html.escape(path), html.escape(path), html.escape(text),
            html.escape(os.path.basename(path)),
            ('  ·  se abre con la palabra «%s»' % html.escape(word)) if word else ''))

    listing = "\n".join(
        "%d\t%s\t%s" % (c['n'], c['cap'], os.path.basename(c['path'])) for c in cards)

    return """<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Revisión de fotos y leyendas</title>
<style>
  :root{--bg:#07080f;--card:#0d1224;--ink:#e9e6f3;--muted:#9d96b6;--line:#262243;--lilac:#c3a6f5;--blue:#8ab4ec;}
  *{box-sizing:border-box;}
  body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 Georgia,serif;}
  header{padding:32px 24px 10px;max-width:1200px;margin:0 auto;}
  h1{font-size:26px;margin:0 0 10px;font-weight:400;}
  header p{color:var(--muted);max-width:70ch;font-size:15px;}
  header b{color:var(--ink);}
  .tools{max-width:1200px;margin:0 auto;padding:0 24px 8px;display:flex;gap:10px;flex-wrap:wrap;align-items:center;}
  button{font:12px/1 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;background:transparent;color:var(--ink);border:1px solid var(--line);padding:10px 14px;cursor:pointer;}
  button:hover{border-color:var(--lilac);color:var(--lilac);}
  .hint{font:11px/1.4 system-ui,sans-serif;color:var(--muted);letter-spacing:.06em;}
  main,.grid{max-width:1200px;margin:0 auto;padding:12px 24px 80px;display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));}
  .card{background:var(--card);border:1px solid var(--line);padding:10px;position:relative;display:flex;gap:12px;}
  .card img{width:120px;height:150px;object-fit:cover;display:block;border:1px solid var(--line);flex:0 0 auto;}
  .meta{min-width:0;display:flex;flex-direction:column;gap:6px;}
  .cap{font-size:15px;line-height:1.35;}
  .file{font:11px/1.3 ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--blue);word-break:break-all;}
  .where{font:10px/1.4 system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);}
  .num{position:absolute;top:6px;right:8px;font:11px/1 system-ui,sans-serif;color:var(--lilac);}
  .empty{color:#e6889c;}
  h2{max-width:1200px;margin:26px auto 0;padding:0 24px;font-weight:400;font-size:19px;color:var(--lilac);}
  textarea{display:none;width:100%;max-width:1200px;margin:10px auto;height:220px;background:#0a1024;color:var(--ink);border:1px solid var(--line);font:12px/1.5 ui-monospace,monospace;padding:12px;}
  .hidden-sec{display:none;}
</style>
</head>
<body>
<header>
  <h1>Revisión: cada foto con su leyenda</h1>
  <p>Esto no se publica ni se sube a GitHub; es solo para revisar con los ojos. Van en el
  <b>mismo orden</b> en que aparecen en el sitio, cada una con su <b>leyenda</b> y su
  <b>nombre de archivo</b>. Si alguna foto no corresponde a lo que dice su leyenda, dime
  el número y con qué archivo va, por ejemplo: <b>12 va con cap4-5, 13 va con cap4-2</b>.
  Clic en una foto para verla en grande.</p>
</header>
<div class="tools">
  <button id="copy">Copiar la lista</button>
  <button id="toggle">Ver las letras escondidas</button>
  <span class="hint">__NCARDS__ fotos con leyenda · __NHIDDEN__ letras escondidas</span>
</div>
<textarea id="listing" readonly>__LISTING__</textarea>
<main>
__CARDS__
</main>
<section class="hidden-sec" id="hiddenSec">
  <h2>Letras escondidas</h2>
  <div class="grid">
__HIDDEN__
  </div>
</section>
<script>
  document.getElementById('copy').addEventListener('click',function(){
    var t=document.getElementById('listing');
    t.style.display='block'; t.select();
    try{document.execCommand('copy');}catch(e){}
    if(navigator.clipboard)navigator.clipboard.writeText(t.value);
    this.textContent='copiado';
    setTimeout(function(){document.getElementById('copy').textContent='copiar la lista';},1500);
  });
  document.getElementById('toggle').addEventListener('click',function(){
    var s=document.getElementById('hiddenSec');
    var on=s.style.display==='block';
    s.style.display=on?'none':'block';
    this.textContent=on?'ver las letras escondidas':'ocultar';
  });
</script>
</body>
</html>
""".replace("__NCARDS__", str(len(cards))).replace("__NHIDDEN__", str(len(hidden))).replace("__LISTING__", html.escape(listing)).replace("__CARDS__", "\n".join(rows)).replace("__HIDDEN__", "\n".join(hidden_rows))


if __name__ == '__main__':
    out = os.path.join(ROOT, 'revisar.html')
    with open(out, 'w', encoding='utf-8') as fh:
        fh.write(build())
    print('escrito:', out)
