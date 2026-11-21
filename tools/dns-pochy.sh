#!/usr/bin/env bash
# Crea (o corrige) los registros DNS de pochy.site en Cloudflare, para GitHub
# Pages. Idempotente: si ya existen, los deja como deben estar.
#
#   CLOUDFLARE_API_TOKEN=... ./tools/dns-pochy.sh
#
# El token necesita: Zone:Read + DNS:Edit, limitado a la zona pochy.site.
# Todos los registros van en "DNS only" (proxied=false): con proxy, GitHub no
# puede emitir el certificado.
set -euo pipefail

TOKEN="${CLOUDFLARE_API_TOKEN:-}"
if [ -z "$TOKEN" ]; then
  echo "falta CLOUDFLARE_API_TOKEN. Uso:" >&2
  echo "  CLOUDFLARE_API_TOKEN=... ./tools/dns-pochy.sh" >&2
  exit 1
fi

API="https://api.cloudflare.com/client/v4"
DOMINIO="pochy.site"

api() { curl -sS -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" "$@"; }

ZONA=$(api "$API/zones?name=$DOMINIO" | jq -r '.result[0].id // empty')
if [ -z "$ZONA" ]; then
  echo "no encuentro la zona $DOMINIO con este token." >&2
  echo "revisa que el token tenga Zone:Read y que la zona sea $DOMINIO." >&2
  exit 1
fi
echo "zona: $DOMINIO ($ZONA)"

poner() { # tipo, nombre, contenido
  local tipo="$1" nombre="$2" contenido="$3"
  local cuerpo id existe
  cuerpo=$(jq -n --arg t "$tipo" --arg n "$nombre" --arg c "$contenido" \
    '{type:$t,name:$n,content:$c,ttl:1,proxied:false}')
  id=$(api "$API/zones/$ZONA/dns_records?type=$tipo&name=$nombre" | jq -r '.result[0].id // empty')
  if [ -n "$id" ]; then
    existe=$(api -X PUT "$API/zones/$ZONA/dns_records/$id" --data "$cuerpo" | jq -r '.success')
    echo "  $tipo $nombre -> $contenido  (actualizado: $existe)"
  else
    existe=$(api -X POST "$API/zones/$ZONA/dns_records" --data "$cuerpo" | jq -r '.success')
    echo "  $tipo $nombre -> $contenido  (creado: $existe)"
  fi
}

for ip in 185.199.108.153 185.199.109.153 185.199.110.153 185.199.111.153; do
  poner A "@" "$ip"
done
for ip in 2606:50c0:8000::153 2606:50c0:8001::153 2606:50c0:8002::153 2606:50c0:8003::153; do
  poner AAAA "@" "$ip"
done
poner CNAME "www" "wildpig94.github.io"

echo
echo "listo. comprueba en un minuto:"
echo "  dig +short $DOMINIO A"
echo "  dig +short www.$DOMINIO"
