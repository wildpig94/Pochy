#!/usr/bin/env node
/**
 * El candado: cifra la pagina y las fotos, y deja un index.html que solo pide
 * la contrasena.
 *
 *   node tools/candado.mjs 'la-contrasena'
 *
 * Lee de:   fuente/index.html   (la pagina de trabajo)
 *           fotos/              (originales y versiones ligeras)
 *           pdf/                (los dos pliegos para imprimir)
 * Escribe:  index.html          (el candado: lo unico que se publica de la pagina)
 *           cifrado/            (pagina.enc y una version cifrada de cada foto)
 *
 * Sin la contrasena, lo que hay en el repositorio no se puede leer: AES-GCM con
 * la llave derivada por PBKDF2-SHA256. El nombre de cada foto si se ve (memoria1.jpg
 * y cosas asi), lo que se ve de una foto es su nombre, no su contenido.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync, unlinkSync } from 'node:fs';
import { webcrypto, createHash } from 'node:crypto';
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
const RUTA_SAL = join(ROOT, 'tools', 'sal.txt');
const RUTA_MANIFIESTO = join(CARPETA_CIFRADA, '.manifiesto.json');

// La sal no es secreta (viaja dentro del candado) y se queda fija para que
// reconstruir no vuelva a cifrar las fotos que no cambiaron.
let sal;
if (existsSync(RUTA_SAL)) {
  sal = Buffer.from(readFileSync(RUTA_SAL, 'utf8').trim(), 'hex');
} else {
  sal = Buffer.from(webcrypto.getRandomValues(new Uint8Array(16)));
  writeFileSync(RUTA_SAL, sal.toString('hex') + '\n');
}

function huella(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}
function leerManifiesto() {
  try { return JSON.parse(readFileSync(RUTA_MANIFIESTO, 'utf8')); } catch (e) { return {}; }
}

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
    } else if (/\.(jpe?g|png|webp|pdf)$/i.test(nombre)) {
      salida.push(ruta);
    }
  }
  return salida;
}

async function main() {
  const llave = await derivar(password);
  const cuenta = { nuevos: 0, reusados: 0, bytesIn: 0 };
  const manifiesto = leerManifiesto();
  const siguiente = {};

  mkdirSync(join(CARPETA_CIFRADA, 'fotos', 'web'), { recursive: true });

  async function guardar(etiqueta, relativa, bytes) {
    const marca = huella(bytes);
    const destino = join(CARPETA_CIFRADA, relativa + '.enc');
    if (manifiesto[relativa] === marca && existsSync(destino)) {
      siguiente[relativa] = marca;
      cuenta.reusados += 1;
      return;
    }
    const cifrada = await cifrar(llave, bytes);
    mkdirSync(dirname(destino), { recursive: true });
    writeFileSync(destino, cifrada);
    siguiente[relativa] = marca;
    cuenta.nuevos += 1;
    cuenta.bytesIn += bytes.length;
  }

  // 1. la pagina
  await guardar('pagina', 'pagina', readFileSync(join(ROOT, 'fuente', 'index.html')));

  // 2. las fotos
  for (const ruta of archivosFoto(join(ROOT, 'fotos'))) {
    const relativa = 'fotos/' + ruta.slice(join(ROOT, 'fotos').length + 1);
    await guardar(relativa, relativa, readFileSync(ruta));
  }

  // 2b. los dos pliegos para imprimir
  if (existsSync(join(ROOT, 'pdf'))) {
    for (const ruta of archivosFoto(join(ROOT, 'pdf'))) {
      const relativa = 'pdf/' + ruta.slice(join(ROOT, 'pdf').length + 1);
      await guardar(relativa, relativa, readFileSync(ruta));
    }
  }

  // 3. fuera lo que ya no existe
  const sobra = Object.keys(manifiesto).filter(function (k) { return !(k in siguiente); });
  for (const k of sobra) {
    const ruta = join(CARPETA_CIFRADA, k + '.enc');
    if (existsSync(ruta)) { unlinkSync(ruta); }
  }
  if (sobra.length) { console.log('sobrantes: ' + sobra.join(', ')); }

  // 3. el candado
  const plantilla = readFileSync(join(ROOT, 'tools', 'candado.plantilla.html'), 'utf8');
  const candado = plantilla
    .replace('__SAL__', Buffer.from(sal).toString('base64'))
    .replace('__ITER__', String(ITERACIONES));
  writeFileSync(join(ROOT, 'index.html'), candado);

  writeFileSync(RUTA_MANIFIESTO, JSON.stringify(siguiente, null, 0));
  console.log('cifrados de nuevo: ' + cuenta.nuevos + ' (' +
    (cuenta.bytesIn / 1048576).toFixed(1) + ' MB)');
  console.log('sin cambios, reusados: ' + cuenta.reusados);
  console.log('escrito: index.html (el candado) y cifrado/');
  console.log('para publicar: git add -A && git commit -m "Candado" && git push');
}

main().catch((e) => { console.error(e); process.exit(1); });
