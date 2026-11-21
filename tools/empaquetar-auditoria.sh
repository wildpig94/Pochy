#!/usr/bin/env bash
# Arma un zip para que un modelo externo (Gemini y compañía) revise el sitio
# sin ver las fotos, la música ni la contraseña.
#
#   ./tools/empaquetar-auditoria.sh [salida.zip]
set -euo pipefail
cd "$(dirname "$0")/.."

SALIDA="${1:-$HOME/Documentos/auditoria-pochy-$(date +%Y%m%d-%H%M).zip}"
[ -f fuente/index.html ] || { echo "falta fuente/index.html" >&2; exit 1; }

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/pochy/fuente"

cp -r tools "$TMP/pochy/"
rm -f "$TMP/pochy/tools/sal.txt"
cp README.md GEMINI.md manifest.webmanifest robots.txt "$TMP/pochy/" 2>/dev/null || true
cp sw.js "$TMP/pochy/" 2>/dev/null || true
cp fuente/index.html "$TMP/pochy/fuente/index.html"

cat > "$TMP/pochy/LEEME-AUDITORIA.md" <<'TXT'
# Paquete de auditoría — Pocha & Pocho

Qué hay aquí:

- `fuente/index.html` — la página completa en claro (texto, CSS y JS del sitio).
- `tools/` — candado (AES-GCM), generador del service worker, herramientas de
  fotos y PDF. **No incluye `sal.txt` ni la contraseña.**
- `sw.js`, `manifest.webmanifest`, `robots.txt`, `README.md`, `GEMINI.md`.

Qué **no** hay, a propósito: fotografías, música, PDFs, el contenido cifrado y
la contraseña.

Pide: auditar accesibilidad, rendimiento, robustez offline y seguridad del
candado; y devolver cambios como parches sobre `fuente/index.html`, sin tocar
`index.html` ni `sw.js` (son generados).
TXT

( cd "$TMP" && zip -qr "$SALIDA" pochy )
echo "listo: $SALIDA ($(du -h "$SALIDA" | cut -f1))"
echo "revisa que no viaje nada de fotos/ ni la contraseña: unzip -l \"$SALIDA\""
