#!/usr/bin/env node
/**
 * Arma sw.js: la lista de lo que se guarda en el telefono para que la pagina
 * abra sin senal. Se corre despues del candado, y antes de publicar.
 *
 *   node tools/candado.mjs 'la-contrasena'
 *   node tools/offline.mjs
 *
 * Lo que entra en la lista: el candado, la pagina cifrada, las versiones ligeras
 * de las fotos y las canciones. Los originales a tamano completo, los PDF y las
 * tipografias se guardan la primera vez que se abren.
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

const fijos = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'cifrado/pagina.enc'];

const fotos = recorrer(join(CIFRADO, 'fotos'), ROOT)
  .filter((r) => r.includes('/web/'));

const audio = readdirSync(join(ROOT, 'audio'))
  .filter((n) => /\.(m4a|mp3)$/i.test(n))
  .sort()
  .map((n) => 'audio/' + n);

const lista = Array.from(new Set([...fijos, ...fotos, ...audio])).sort();

const bytes = lista.reduce((total, r) => {
  try { return total + statSync(join(ROOT, r)).size; } catch (e) { return total; }
}, 0);

const version = createHash('sha1')
  .update(lista.join('\n') + '|' + bytes)
  .digest('hex')
  .slice(0, 10);

const plantilla = readFileSync(join(ROOT, 'tools', 'sw.plantilla.js'), 'utf8');
const sw = plantilla
  .replace('__VERSION__', version)
  .replace('__LISTA__', JSON.stringify(lista, null, 2));

writeFileSync(join(ROOT, 'sw.js'), sw);

console.log('sw.js: ' + lista.length + ' archivos, ' + (bytes / 1048576).toFixed(1) + ' MB');
console.log('  candado + pagina cifrada + ' + fotos.length + ' fotos ligeras + ' + audio.length + ' canciones');
console.log('  version ' + version);
