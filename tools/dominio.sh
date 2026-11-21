#!/usr/bin/env bash
# Prende o apaga el dominio propio en GitHub Pages.
#
#   ./tools/dominio.sh on    # vuelve a pochy.site  (exige DNS ya apuntando)
#   ./tools/dominio.sh off   # vuelve a wildpig94.github.io/Pochy/
#
set -euo pipefail
cd "$(dirname "$0")/.."

case "${1:-}" in
  on)
    printf 'pochy.site\n' > CNAME
    timeout 30 gh api -X PUT repos/wildpig94/Pochy/pages -f cname=pochy.site >/dev/null
    git add CNAME && git commit -m "Dominio: pochy.site" && git push origin main
    echo "dominio activo: https://pochy.site/ (espera el certificado y activa HTTPS forzado)"
    ;;
  off)
    git rm -q -f CNAME 2>/dev/null || true
    timeout 30 gh api -X PUT repos/wildpig94/Pochy/pages -F cname=null >/dev/null || true
    git add -A && git commit -m "Dominio: de vuelta a github.io" && git push origin main
    echo "de vuelta: https://wildpig94.github.io/Pochy/"
    ;;
  *)
    echo "uso: $0 on|off" >&2
    exit 1
    ;;
esac
