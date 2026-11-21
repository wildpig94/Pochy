#!/usr/bin/env bash
# Publica el sitio en el orden correcto: cifrar, armar el offline, commit, push.
#
#   POCHY_PASS='...' ./tools/publicar.sh "mensaje del commit"
#
# Si no pasas POCHY_PASS, la pide sin eco.
set -euo pipefail
cd "$(dirname "$0")/.."

MSG="${1:-}"
if [ -z "$MSG" ]; then
  echo "falta el mensaje:  ./tools/publicar.sh 'mensaje del commit'" >&2
  exit 1
fi

if [ ! -f fuente/index.html ]; then
  echo "falta fuente/index.html (la página en claro)." >&2
  exit 1
fi

if [ -z "${POCHY_PASS:-}" ]; then
  read -r -s -p "contraseña del candado: " POCHY_PASS
  echo
fi
if [ -z "$POCHY_PASS" ]; then
  echo "sin contraseña no se puede cifrar." >&2
  exit 1
fi

echo "· candado"
node tools/candado.mjs "$POCHY_PASS"
echo "· offline"
node tools/offline.mjs

git add -A
if git diff --cached --quiet; then
  echo "· sin cambios que publicar"
  exit 0
fi

echo "· commit"
git commit -m "$MSG"
echo "· push"
git push origin main
echo "publicado: https://pochy.site/"
