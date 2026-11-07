// Generado por tools/offline.mjs — no editar a mano.
//
// Guarda el candado, la pagina, las fotos ligeras y las dos canciones para que
// el sitio abra sin senal. Lo que no este aqui (originales a tamano completo,
// PDF, tipografias) se guarda la primera vez que se abre, y despues ya esta.
const VERSION = '__VERSION__';
const PRECACHE = __LISTA__;

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
