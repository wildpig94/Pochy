// Generado por tools/offline.mjs — no editar a mano.
//
// Guarda el candado, la pagina, las fotos ligeras y las dos canciones para que
// el sitio abra sin senal. Lo que no este aqui (originales a tamano completo,
// PDF, tipografias) se guarda la primera vez que se abre, y despues ya esta.
const VERSION = '10cce1eab6';
const PRECACHE = [
  "./",
  "audio/admv.m4a",
  "audio/perdonar-y-agradecer.m4a",
  "cifrado/fotos/web/cap4-1-480.webp.enc",
  "cifrado/fotos/web/cap4-1-900.webp.enc",
  "cifrado/fotos/web/cap4-10-480.webp.enc",
  "cifrado/fotos/web/cap4-11-480.webp.enc",
  "cifrado/fotos/web/cap4-2-480.webp.enc",
  "cifrado/fotos/web/cap4-3-480.webp.enc",
  "cifrado/fotos/web/cap4-4-480.webp.enc",
  "cifrado/fotos/web/cap4-6-480.webp.enc",
  "cifrado/fotos/web/cap4-9-480.webp.enc",
  "cifrado/fotos/web/cap4-9-900.webp.enc",
  "cifrado/fotos/web/fan1-1-480.webp.enc",
  "cifrado/fotos/web/fan1-1-900.webp.enc",
  "cifrado/fotos/web/fan1-2-480.webp.enc",
  "cifrado/fotos/web/fan1-2-900.webp.enc",
  "cifrado/fotos/web/fan1-3-480.webp.enc",
  "cifrado/fotos/web/fan1-3-900.webp.enc",
  "cifrado/fotos/web/fan1-4-480.webp.enc",
  "cifrado/fotos/web/fan1-4-900.webp.enc",
  "cifrado/fotos/web/fan1-5-480.webp.enc",
  "cifrado/fotos/web/fan1-5-900.webp.enc",
  "cifrado/fotos/web/fan1-6-480.webp.enc",
  "cifrado/fotos/web/fan1-6-900.webp.enc",
  "cifrado/fotos/web/memoria1-480.webp.enc",
  "cifrado/fotos/web/memoria10-480.webp.enc",
  "cifrado/fotos/web/memoria11-480.webp.enc",
  "cifrado/fotos/web/memoria12-480.webp.enc",
  "cifrado/fotos/web/memoria13-480.webp.enc",
  "cifrado/fotos/web/memoria14-480.webp.enc",
  "cifrado/fotos/web/memoria15-480.webp.enc",
  "cifrado/fotos/web/memoria15-900.webp.enc",
  "cifrado/fotos/web/memoria16-480.webp.enc",
  "cifrado/fotos/web/memoria17-480.webp.enc",
  "cifrado/fotos/web/memoria18-480.webp.enc",
  "cifrado/fotos/web/memoria19-480.webp.enc",
  "cifrado/fotos/web/memoria19-900.webp.enc",
  "cifrado/fotos/web/memoria2-480.webp.enc",
  "cifrado/fotos/web/memoria20-480.webp.enc",
  "cifrado/fotos/web/memoria21-480.webp.enc",
  "cifrado/fotos/web/memoria21-900.webp.enc",
  "cifrado/fotos/web/memoria22-480.webp.enc",
  "cifrado/fotos/web/memoria23-480.webp.enc",
  "cifrado/fotos/web/memoria23-900.webp.enc",
  "cifrado/fotos/web/memoria24-480.webp.enc",
  "cifrado/fotos/web/memoria25-480.webp.enc",
  "cifrado/fotos/web/memoria25-900.webp.enc",
  "cifrado/fotos/web/memoria26-480.webp.enc",
  "cifrado/fotos/web/memoria3-480.webp.enc",
  "cifrado/fotos/web/memoria4-480.webp.enc",
  "cifrado/fotos/web/memoria5-480.webp.enc",
  "cifrado/fotos/web/memoria5-900.webp.enc",
  "cifrado/fotos/web/memoria6-480.webp.enc",
  "cifrado/fotos/web/memoria6-900.webp.enc",
  "cifrado/fotos/web/memoria7-480.webp.enc",
  "cifrado/fotos/web/memoria7-900.webp.enc",
  "cifrado/fotos/web/memoria8-480.webp.enc",
  "cifrado/fotos/web/memoria9-480.webp.enc",
  "cifrado/fotos/web/memoria9-900.webp.enc",
  "cifrado/fotos/web/nuestra-primera-foto-480.webp.enc",
  "cifrado/fotos/web/nuestra-primera-foto-900.webp.enc",
  "cifrado/fotos/web/nueva01-480.webp.enc",
  "cifrado/fotos/web/nueva02-480.webp.enc",
  "cifrado/fotos/web/nueva03-480.webp.enc",
  "cifrado/fotos/web/nueva03-900.webp.enc",
  "cifrado/fotos/web/nueva04-480.webp.enc",
  "cifrado/fotos/web/nueva05-480.webp.enc",
  "cifrado/fotos/web/nueva05-900.webp.enc",
  "cifrado/fotos/web/nueva06-480.webp.enc",
  "cifrado/fotos/web/nueva06-900.webp.enc",
  "cifrado/fotos/web/nueva07-480.webp.enc",
  "cifrado/fotos/web/nueva08-480.webp.enc",
  "cifrado/fotos/web/nueva08-900.webp.enc",
  "cifrado/fotos/web/nueva09-480.webp.enc",
  "cifrado/fotos/web/nueva09-900.webp.enc",
  "cifrado/fotos/web/nueva10-480.webp.enc",
  "cifrado/fotos/web/nueva10-900.webp.enc",
  "cifrado/fotos/web/nueva11-480.webp.enc",
  "cifrado/fotos/web/nueva12-480.webp.enc",
  "cifrado/fotos/web/nueva12-900.webp.enc",
  "cifrado/fotos/web/nueva13-480.webp.enc",
  "cifrado/fotos/web/nueva14-480.webp.enc",
  "cifrado/fotos/web/nueva14-900.webp.enc",
  "cifrado/pagina.enc",
  "icons/icon-192.png",
  "index.html",
  "manifest.webmanifest"
];

self.addEventListener('install', function (e) {
  e.waitUntil((async function () {
    const c = await caches.open(VERSION);
    for (let i = 0; i < PRECACHE.length; i += 12) {
      await Promise.all(PRECACHE.slice(i, i + 12).map(function (u) {
        return c.add(new Request(u, { cache: 'reload' })).catch(function () {});
      }));
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', function (e) {
  e.waitUntil((async function () {
    const nombres = await caches.keys();
    await Promise.all(nombres.map(function (n) {
      return n === VERSION ? null : caches.delete(n);
    }));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.headers.has('range')) return;              // el audio largo pide trozos
  const url = new URL(req.url);
  const propio = url.origin === self.location.origin;
  const tipografia = /^(fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(url.host);
  if (!propio && !tipografia) return;

  // Navegar: primero la red (para ver los cambios), y si no hay, lo guardado.
  if (req.mode === 'navigate') {
    e.respondWith((async function () {
      try {
        const fresco = await fetch(req);
        const c = await caches.open(VERSION);
        c.put(req, fresco.clone());
        return fresco;
      } catch (err) {
        const c = await caches.open(VERSION);
        return (await c.match(req, { ignoreSearch: true }))
          || (await c.match('index.html'))
          || Response.error();
      }
    })());
    return;
  }

  e.respondWith((async function () {
    const c = await caches.open(VERSION);
    const guardado = await c.match(req, { ignoreSearch: true });
    if (guardado) return guardado;
    try {
      const res = await fetch(req);
      if (res && (res.ok || res.type === 'opaque') && res.status !== 206) {
        c.put(req, res.clone());
      }
      return res;
    } catch (err) {
      return guardado || Response.error();
    }
  })());
});
