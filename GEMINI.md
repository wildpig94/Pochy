# GEMINI.md — cómo trabajar en este repositorio

Sitio privado, estático y **cifrado**, publicado en GitHub Pages:
`https://wildpig94.github.io/Pochy/`. Léelo antes de tocar nada.

## Qué se publica y qué no

| Ruta | Qué es | ¿Se publica? |
|---|---|---|
| `fuente/index.html` | la página en claro, el archivo que se edita | **no** (gitignored) |
| `fotos/`, `pdf/`, `webtoon/` | originales en claro | **no** (gitignored) |
| `cifrado/` | página, fotos, PDF y placas cifradas con AES-GCM | **sí** |
| `index.html` | el candado (pide la contraseña y descifra) | **sí, pero es GENERADO** |
| `sw.js` | lista del modo sin señal | **sí, pero es GENERADO** |
| `audio/` | las canciones | sí |
| `tools/` | candado, offline, fotos, PDF, revisión | sí |

## La contraseña

No está en el repositorio y no debe estarlo: ni en archivos, ni en commits, ni
en `GEMINI.md`, ni en un script. Si necesitas cifrar, pide al dueño que la ponga
en `POCHY_PASS` para esa sesión de terminal y no la imprimas.

## La única forma de publicar

```bash
POCHY_PASS='...' ./tools/publicar.sh "mensaje del commit"
```

Ese script hace, en orden: `tools/candado.mjs` → `tools/offline.mjs` → commit →
push. No publiques a mano ni cambies el orden: el candado tiene que correr
**después** de editar la fuente y **antes** del commit.

## Reglas

1. **No edites `index.html` ni `sw.js` a mano**: son salida de un generador.
2. **No commitees** nada de `fuente/`, `fotos/`, `pdf/` ni `webtoon/`.
   El hook `.githooks/pre-commit` lo bloquea.
3. **No toques `tools/sal.txt`**: cambiarla re-cifra todo y deja ilegible lo ya
   publicado con la sal vieja.
4. **No edites `cifrado/` a mano**: es binario cifrado.
5. Los cambios de diseño, texto o JS del sitio van en `fuente/index.html`.
6. No cambies `robots.txt` ni el candado sin pedirlo.
7. **No hagas `git push` si el dueño no lo pidió.**

## Probar en local

```bash
cd ~/Trabajo/Clientes/carmen-3-meses
python3 -m http.server 8099 --bind 127.0.0.1
# http://127.0.0.1:8099/  (pide la contraseña)
```

El candado tarda ~1 s a propósito (PBKDF2-SHA256, 300 000 rondas).

## Qué conviene auditar, por orden

1. **Accesibilidad** del lector y de las secciones: foco, `aria-*`, contraste,
   teclado (Esc, flechas), `prefers-reduced-motion`.
2. **Rendimiento**: la página son ~150 KB de HTML + 2,6 MB de fotos ligeras;
   el lector descifra y carga por cercanía. Buscar bloqueos, `layout thrash`,
   listeners duplicados.
3. **Robustez offline**: `sw.js` (precarga, versión, `completar()`), qué pasa si
   se corta a la mitad, qué queda sin cachear.
4. **Seguridad del candado**: `tools/candado.mjs` y `candado.plantilla.html`
   (AES-GCM, IV, sal, normalización de la contraseña, qué se filtra en claro).
5. **Legibilidad del código** de `fuente/index.html`: es un solo archivo largo,
   con secciones marcadas (`// ============ ... ============`).

## Cómo entregar cambios

- Cambios pequeños: edita `fuente/index.html` y publica con el script.
- Cambios grandes: propón el diff y espera confirmación; el dueño decide si se
  publica.
- Nunca subas fotos, audio nuevo ni texto íntimo sin que él lo pida.
