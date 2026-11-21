// Generado por tools/offline.mjs — no editar a mano.
//
// Guarda el candado, la pagina, las fotos ligeras, el arranque del webtoon y
// las canciones para que el sitio abra sin senal. Lo demas (originales, PDF,
// resto de placas y tipografias) se guarda la primera vez que se abre.
const VERSION = '60abe4bc94';
const CRITICOS = [
  "./",
  "index.html",
  "cifrado/pagina.enc",
  "manifest.webmanifest",
  "icons/icon-192.png"
];
const PRECACHE = [
  "./",
  "index.html",
  "cifrado/pagina.enc",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "cifrado/fotos/web/cap4-1-480.webp.enc",
  "cifrado/fotos/web/cap4-10-480.webp.enc",
  "cifrado/fotos/web/cap4-11-480.webp.enc",
  "cifrado/fotos/web/cap4-2-480.webp.enc",
  "cifrado/fotos/web/cap4-3-480.webp.enc",
  "cifrado/fotos/web/cap4-4-480.webp.enc",
  "cifrado/fotos/web/cap4-6-480.webp.enc",
  "cifrado/fotos/web/cap4-9-480.webp.enc",
  "cifrado/fotos/web/fan1-1-480.webp.enc",
  "cifrado/fotos/web/fan1-2-480.webp.enc",
  "cifrado/fotos/web/fan1-3-480.webp.enc",
  "cifrado/fotos/web/fan1-4-480.webp.enc",
  "cifrado/fotos/web/fan1-5-480.webp.enc",
  "cifrado/fotos/web/fan1-6-480.webp.enc",
  "cifrado/fotos/web/memoria1-480.webp.enc",
  "cifrado/fotos/web/memoria10-480.webp.enc",
  "cifrado/fotos/web/memoria11-480.webp.enc",
  "cifrado/fotos/web/memoria12-480.webp.enc",
  "cifrado/fotos/web/memoria13-480.webp.enc",
  "cifrado/fotos/web/memoria14-480.webp.enc",
  "cifrado/fotos/web/memoria15-480.webp.enc",
  "cifrado/fotos/web/memoria16-480.webp.enc",
  "cifrado/fotos/web/memoria17-480.webp.enc",
  "cifrado/fotos/web/memoria18-480.webp.enc",
  "cifrado/fotos/web/memoria19-480.webp.enc",
  "cifrado/fotos/web/memoria2-480.webp.enc",
  "cifrado/fotos/web/memoria20-480.webp.enc",
  "cifrado/fotos/web/memoria21-480.webp.enc",
  "cifrado/fotos/web/memoria22-480.webp.enc",
  "cifrado/fotos/web/memoria23-480.webp.enc",
  "cifrado/fotos/web/memoria24-480.webp.enc",
  "cifrado/fotos/web/memoria25-480.webp.enc",
  "cifrado/fotos/web/memoria26-480.webp.enc",
  "cifrado/fotos/web/memoria3-480.webp.enc",
  "cifrado/fotos/web/memoria4-480.webp.enc",
  "cifrado/fotos/web/memoria5-480.webp.enc",
  "cifrado/fotos/web/memoria6-480.webp.enc",
  "cifrado/fotos/web/memoria7-480.webp.enc",
  "cifrado/fotos/web/memoria8-480.webp.enc",
  "cifrado/fotos/web/memoria9-480.webp.enc",
  "cifrado/fotos/web/nuestra-primera-foto-480.webp.enc",
  "cifrado/fotos/web/nueva01-480.webp.enc",
  "cifrado/fotos/web/nueva02-480.webp.enc",
  "cifrado/fotos/web/nueva03-480.webp.enc",
  "cifrado/fotos/web/nueva04-480.webp.enc",
  "cifrado/fotos/web/nueva05-480.webp.enc",
  "cifrado/fotos/web/nueva06-480.webp.enc",
  "cifrado/fotos/web/nueva07-480.webp.enc",
  "cifrado/fotos/web/nueva08-480.webp.enc",
  "cifrado/fotos/web/nueva09-480.webp.enc",
  "cifrado/fotos/web/nueva10-480.webp.enc",
  "cifrado/fotos/web/nueva11-480.webp.enc",
  "cifrado/fotos/web/nueva12-480.webp.enc",
  "cifrado/fotos/web/nueva13-480.webp.enc",
  "cifrado/fotos/web/nueva14-480.webp.enc",
  "cifrado/webtoon/chapter-1/00-cover-480.webp.enc",
  "cifrado/webtoon/chapter-1/00-cover.webp.enc",
  "cifrado/webtoon/chapter-1/01-restaurant-exterior.webp.enc",
  "cifrado/webtoon/chapter-1/02-carmen-wok.webp.enc",
  "cifrado/webtoon/chapter-2/ch02-p01-blackout-onset.webp.enc",
  "cifrado/webtoon/chapter-2/ch02-p02-frozen-street.webp.enc",
  "cifrado/webtoon/chapter-2/ch02-p03-fridge-and-hydroponics.webp.enc",
  "audio/admv.m4a",
  "audio/perdonar-y-agradecer.m4a"
];

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
