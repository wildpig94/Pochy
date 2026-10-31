#!/usr/bin/env node
/**
 * El candado: cifra la pagina y las fotos, y deja un index.html que solo pide
 * la contrasena.
 *
 *   node tools/candado.mjs 'la-contrasena'
 *
 * Lee de:   fuente/index.html   (la pagina de trabajo)
 *           fotos/              (originales y versiones ligeras)
 * Escribe:  index.html          (el candado: lo unico que se publica de la pagina)
 *           cifrado/            (pagina.enc y una version cifrada de cada foto)
 *
 * Sin la contrasena, lo que hay en el repositorio no se puede leer: AES-GCM con
 * la llave derivada por PBKDF2-SHA256. El nombre de cada foto si se ve (memoria1.jpg
 * y cosas asi), lo que se ve de una foto es su nombre, no su contenido.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, rmSync } from 'node:fs';
import { webcrypto } from 'node:crypto';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const ITERACIONES = 300000;
const CARPETA_CIFRADA = join(ROOT, 'cifrado');

// La clave se normaliza igual que en el candado: sin espacios en las orillas y
// sin mayusculas. Asi "toky", "TOKY" y " Toky " abren lo mismo.
const normalizar = (t) => String(t).trim().toLowerCase();
const password = normalizar(process.argv[2] || process.env.POCHY_PASS || '');
if (!password) {
  console.error("falta la contrasena:\n\n  node tools/candado.mjs 'la-contrasena'\n");
  process.exit(1);
}

const subtle = webcrypto.subtle;
const sal = webcrypto.getRandomValues(new Uint8Array(16));

async function derivar(pass) {
  const base = await subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
  return subtle.deriveKey(
    { name: 'PBKDF2', salt: sal, iterations: ITERACIONES, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
}

async function cifrar(llave, bytes) {
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const cuerpo = new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv }, llave, bytes));
  const fuera = new Uint8Array(12 + cuerpo.length);
  fuera.set(iv, 0);
  fuera.set(cuerpo, 12);
  return fuera;
}

function archivosFoto(dir) {
  const salida = [];
  for (const nombre of readdirSync(dir).sort()) {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) {
      salida.push(...archivosFoto(ruta));
    } else if (/\.(jpe?g|png|webp)$/i.test(nombre)) {
      salida.push(ruta);
    }
  }
  return salida;
}

async function main() {
  const llave = await derivar(password);
  const cuenta = { pagina: 0, fotos: 0, bytesIn: 0, bytesOut: 0 };

  rmSync(CARPETA_CIFRADA, { recursive: true, force: true });
  mkdirSync(join(CARPETA_CIFRADA, 'fotos', 'web'), { recursive: true });

  // 1. la pagina
  const pagina = readFileSync(join(ROOT, 'fuente', 'index.html'));
  const paginaCifrada = await cifrar(llave, pagina);
  writeFileSync(join(CARPETA_CIFRADA, 'pagina.enc'), paginaCifrada);
  cuenta.pagina = 1;
  cuenta.bytesIn += pagina.length;
  cuenta.bytesOut += paginaCifrada.length;

  // 2. las fotos
  for (const ruta of archivosFoto(join(ROOT, 'fotos'))) {
    const relativa = ruta.slice(join(ROOT, 'fotos').length + 1);
    const bytes = readFileSync(ruta);
    const cifrada = await cifrar(llave, bytes);
    const destino = join(CARPETA_CIFRADA, 'fotos', relativa + '.enc');
    mkdirSync(dirname(destino), { recursive: true });
    writeFileSync(destino, cifrada);
    cuenta.fotos += 1;
    cuenta.bytesIn += bytes.length;
    cuenta.bytesOut += cifrada.length;
  }

  // 3. el candado
  const plantilla = readFileSync(join(ROOT, 'tools', 'candado.plantilla.html'), 'utf8');
  const candado = plantilla
    .replace('__SAL__', Buffer.from(sal).toString('base64'))
    .replace('__ITER__', String(ITERACIONES));
  writeFileSync(join(ROOT, 'index.html'), candado);

  console.log('pagina cifrada: 1 archivo');
  console.log('fotos cifradas: ' + cuenta.fotos);
  console.log('de ' + (cuenta.bytesIn / 1048576).toFixed(1) + ' MB a ' +
    (cuenta.bytesOut / 1048576).toFixed(1) + ' MB en el repositorio');
  console.log('escrito: index.html (el candado) y cifrado/');
  console.log('para publicar: git add -A && git commit -m "Candado" && git push');
}

main().catch((e) => { console.error(e); process.exit(1); });
