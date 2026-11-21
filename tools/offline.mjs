#!/usr/bin/env node
/**
 * Arma sw.js: la lista de lo que se guarda en el telefono para que la pagina
 * abra sin senal. Se corre despues del candado, y antes de publicar.
 *
 *   node tools/candado.mjs 'la-contrasena'
 *   node tools/offline.mjs
 *
 * Orden de precarga:
 *   1. Nucleo critico (candado, pagina cifrada, manifest e icono).
 *   2. Fotos ligeras (-480.webp.enc; se omiten -900 porque la pagina no las usa).
 *   3. Primeras placas y miniaturas de cada capitulo del webtoon.
 *   4. Canciones al final (pesan mas y se soportan con Range 206).
 */
import { readdirSync, statSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const CIFRADO = join(ROOT, 'cifrado');

if (!existsSync(join(CIFRADO, 'pagina.enc'))) {
  console.error('falta cifrado/pagina.enc\n\n  corre primero: node tools/candado.mjs \'la-contrasena\'\n');
  process.exit(1);
}

function recorrer(dir, base) {
  const salida = [];
  for (const nombre of readdirSync(dir).sort()) {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) {
      salida.push(...recorrer(ruta, base));
    } else if (/\.enc$/i.test(nombre)) {
      salida.push(ruta.slice(base.length + 1).split('\\').join('/'));
    }
  }
  return salida;
}

const criticos = [
  './',
  'index.html',
  'cifrado/pagina.enc',
  'manifest.webmanifest',
  'icons/icon-192.png',
];

const fotos = recorrer(join(CIFRADO, 'fotos'), ROOT)
  .filter((r) => r.includes('/web/') && r.endsWith('-480.webp.enc'));

// Por cada capitulo dibujado: todas las miniaturas -480 y las 3 primeras placas.
const webtoon = [];
const dirWebtoon = join(CIFRADO, 'webtoon');
if (existsSync(dirWebtoon)) {
  const caps = readdirSync(dirWebtoon)
    .filter((n) => statSync(join(dirWebtoon, n)).isDirectory())
    .sort((a, b) => {
      const na = parseInt(a.replace(/\D+/g, ''), 10) || 0;
      const nb = parseInt(b.replace(/\D+/g, ''), 10) || 0;
      return na - nb || a.localeCompare(b);
    });
  for (const cap of caps) {
    const archivos = recorrer(join(dirWebtoon, cap), ROOT).sort();
    const minis = archivos.filter((r) => /-480\.webp\.enc$/i.test(r));
    const placas = archivos.filter((r) => !/-480\.webp\.enc$/i.test(r)).slice(0, 3);
    webtoon.push(...minis, ...placas);
  }
}

const audio = readdirSync(join(ROOT, 'audio'))
  .filter((n) => /\.(m4a|mp3)$/i.test(n))
  .sort()
  .map((n) => 'audio/' + n);

// Conserva el orden por prioridad y elimina duplicados.
const vistos = new Set();
const lista = [...criticos, ...fotos, ...webtoon, ...audio].filter((r) => {
  if (vistos.has(r)) return false;
  vistos.add(r);
  return true;
});

const bytes = lista.reduce((total, r) => {
  if (r === './') return total;
  try { return total + statSync(join(ROOT, r)).size; } catch (e) { return total; }
}, 0);

const plantilla = readFileSync(join(ROOT, 'tools', 'sw.plantilla.js'), 'utf8');

// La version cambia si cambia el contenido real de cualquier archivo listado o la plantilla.
const hash = createHash('sha1');
for (const r of lista) {
  if (r === './') continue;
  hash.update(r + '\n');
  hash.update(readFileSync(join(ROOT, r)));
}
hash.update('\n---plantilla---\n');
hash.update(plantilla);
const version = hash.digest('hex').slice(0, 10);

const sw = plantilla
  .replace('__VERSION__', version)
  .replace('__CRITICOS__', JSON.stringify(criticos, null, 2))
  .replace('__LISTA__', JSON.stringify(lista, null, 2));

writeFileSync(join(ROOT, 'sw.js'), sw);

console.log('sw.js: ' + lista.length + ' archivos, ' + (bytes / 1048576).toFixed(1) + ' MB');
console.log('  criticos: ' + criticos.length + ' + ' + fotos.length + ' fotos ligeras + ' +
  webtoon.length + ' placas webtoon + ' + audio.length + ' canciones');
console.log('  version ' + version);
