// Generado por tools/offline.mjs — no editar a mano.
//
// Guarda el candado, la pagina, las fotos ligeras, el arranque del webtoon y
// las canciones para que el sitio abra sin senal. Lo demas (originales, PDF,
// resto de placas y tipografias) se guarda la primera vez que se abre.
const VERSION = '__VERSION__';
const CRITICOS = __CRITICOS__;
const PRECACHE = __LISTA__;

// Baja lo que falte, sin repetir lo que ya esta. Si se corta a la mitad (se
// acabo la senal, se cerro la pestana), la siguiente visita online lo termina.
let completando = false;
async function completar() {
  if (completando) return;
  completando = true;
  try {
    const c = await caches.open(VERSION);
    for (const u of PRECACHE) {
      if (await c.match(u, { ignoreSearch: true })) continue;
      try { await c.add(new Request(u, { cache: 'reload' })); } catch (err) { /* luego */ }
    }
  } finally {
    completando = false;
  }
}

async function responderRango(req) {
  const c = await caches.open(VERSION);
  const guardado = await c.match(req.url, { ignoreSearch: true });
  if (!guardado) {
    return fetch(req);
  }
  const rango = req.headers.get('range') || '';
  const m = /bytes=(\d*)-(\d*)/i.exec(rango);
  if (!m) {
    return guardado;
  }
  const blob = await guardado.blob();
  const total = blob.size;
  let ini, fin;
  if (m[1] === '' && m[2] !== '') {
    const suf = parseInt(m[2], 10);
    ini = Math.max(0, total - suf);
    fin = total - 1;
  } else {
    ini = m[1] === '' ? 0 : parseInt(m[1], 10);
    fin = m[2] === '' ? total - 1 : Math.min(parseInt(m[2], 10), total - 1);
  }
  if (isNaN(ini) || isNaN(fin) || ini < 0 || ini > fin || ini >= total) {
    return new Response(null, {
      status: 416,
      headers: { 'Content-Range': 'bytes */' + total },
    });
  }
  const trozo = blob.slice(ini, fin + 1);
  return new Response(trozo, {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': guardado.headers.get('Content-Type') || 'application/octet-stream',
      'Content-Range': 'bytes ' + ini + '-' + fin + '/' + total,
      'Content-Length': String(trozo.size),
      'Accept-Ranges': 'bytes',
    },
  });
}

self.addEventListener('install', function (e) {
  e.waitUntil((async function () {
    const c = await caches.open(VERSION);
    // Si falla el nucleo critico, falla install y se conserva el SW viejo.
    await c.addAll(CRITICOS.map(function (u) { return new Request(u, { cache: 'reload' }); }));
    await completar();
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
    completar();
  })());
});

self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const propio = url.origin === self.location.origin;
  const tipografia = /^(fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(url.host);
  if (!propio && !tipografia) return;

  // Audio y medios piden rangos de bytes: servir 206 desde cache si existe.
  if (req.headers.has('range')) {
    if (!propio) return;
    e.respondWith(responderRango(req));
    return;
  }

  // Navegar: primero la red (para ver los cambios), y si no hay, lo guardado.
  if (req.mode === 'navigate') {
    e.respondWith((async function () {
      try {
        const fresco = await fetch(req);
        if (fresco && fresco.ok) {
          const c = await caches.open(VERSION);
          c.put(req, fresco.clone());
        }
        e.waitUntil(completar());
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
