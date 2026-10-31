#!/usr/bin/env node
/**
 * Arma los PDF que ella imprime: los cinco cupones y todas las fotografias.
 *
 *   node tools/imprimir.mjs
 *
 * Usa el propio index.html (sus estilos y sus fotos) y lo manda a la impresora
 * de Chrome sin abrir ventana. Escribe pdf/cupones.pdf y pdf/fotos.pdf.
 *
 * Un PDF se imprime igual en cualquier telefono: se toca, se abre y ya. En vez
 * de depender del dialogo de impresion del navegador, que es donde se rompia.
 */
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SALIDA = join(ROOT, 'pdf');
const CHROME = process.env.REA_BROWSER_EXECUTABLE
  || '/home/alexis/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let corridas = 0;

async function conPagina(fn) {
  const puerto = 9391 + (corridas++);
  const chrome = spawn(CHROME, [
    '--headless=new', '--remote-debugging-port=' + puerto,
    '--user-data-dir=/tmp/chrome-imprimir-' + puerto, '--no-first-run', '--no-default-browser-check',
    '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
    '--window-size=1240,1754', 'about:blank'
  ], { stdio: 'ignore' });

  let target = null;
  for (let i = 0; i < 60 && !target; i++) {
    try {
      const list = await (await fetch('http://127.0.0.1:' + puerto + '/json/list')).json();
      target = list.find((t) => t.type === 'page');
    } catch (e) { /* arrancando */ }
    if (!target) await sleep(250);
  }
  if (!target) { chrome.kill(); throw new Error('el navegador no arranco'); }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

  let id = 0;
  const pendientes = new Map();
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pendientes.has(m.id)) {
      const { res, rej } = pendientes.get(m.id);
      pendientes.delete(m.id);
      m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
    }
  };
  const send = (method, params = {}) => new Promise((res, rej) => {
    const i = ++id;
    pendientes.set(i, { res, rej });
    ws.send(JSON.stringify({ id: i, method, params }));
  });
  const evaluar = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };

  try {
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Page.navigate', { url: pathToFileURL(join(ROOT, 'index.html')).href });
    await sleep(2200);
    return await fn(send, evaluar);
  } finally {
    try { chrome.kill(); } catch (e) { /* ya */ }
    await sleep(600);   // que el navegador anterior suelte el puerto y el perfil
  }
}

const PREPARAR = `
(async function(){
  var caja = document.getElementById('printArea');
  var hoja = document.createElement('div');
  hoja.className = 'print-sheet cols-2';
  return true;
})();
`;

async function pdf(send, nombre) {
  const out = await send('Page.printToPDF', {
    printBackground: true, paperWidth: 8.5, paperHeight: 11, marginsType: 1,
    marginTop: 0.45, marginBottom: 0.45, marginLeft: 0.45, marginRight: 0.45,
    preferCSSPageSize: false, displayHeaderFooter: false
  });
  mkdirSync(SALIDA, { recursive: true });
  writeFileSync(join(SALIDA, nombre), Buffer.from(out.data, 'base64'));
  return Buffer.from(out.data, 'base64').length;
}

async function main() {
  const tamanos = {};

  await conPagina(async (send, evaluar) => {
    // 1. CUPONES: se clonan los del propio sitio dentro de la hoja de impresion
    await evaluar(`
      (document.getElementById('overlay')||document.body).classList.add('hidden');
      (function(){
        var src = document.querySelectorAll('.voucher');
        var preambulo = document.querySelector('.de-cupon');
        var html = '<div class="print-sheet cols-1">';
        html += '<div class="print-title">Coupons &mdash; Pocha &amp; Pocho</div>';
        if (preambulo) html += '<div class="print-item">' + preambulo.outerHTML + '</div>';
        for (var i=0;i<src.length;i++){
          var copia = src[i].cloneNode(true);
          var yapas = copia.querySelectorAll('details');
          for (var j=0;j<yapas.length;j++){ yapas[j].open = true; }
          html += '<div class="print-item voucher-wrap">' + copia.outerHTML + '</div>';
        }
        html += '</div>';
        document.getElementById('printArea').innerHTML = html;
      })();
      'ok'`);
    await sleep(600);
    tamanos.cupones = await pdf(send, 'cupones.pdf');
  });

  await conPagina(async (send, evaluar) => {
    // 2. FOTOGRAFIAS: todas, en el orden en que estan en la pagina
    const cuantas = await evaluar(`
      (function(){
        var fotos = [].slice.call(document.querySelectorAll('img[data-full]'));
        var html = '<div class="print-sheet cols-2">';
        html += '<div class="print-title">Pocha &amp; Pocho</div>';
        for (var i = 0; i < fotos.length; i++) {
          var ruta = fotos[i].getAttribute('data-full');
          if (!ruta) continue;
          html += '<div class="print-item"><img src="' + ruta + '" alt=""></div>';
        }
        html += '</div>';
        var caja = document.getElementById('printArea');
        caja.innerHTML = html;
        [].slice.call(caja.querySelectorAll('img')).forEach(function(im){
          im.addEventListener('error', function(){
            var r = im.getAttribute('data-respaldo');
            if (r) { im.removeAttribute('data-respaldo'); im.src = r; }
          });
        });
        return caja.querySelectorAll('img').length;
      })()`);
    await sleep(2500);
    tamanos.fotos = await pdf(send, 'fotos.pdf');
    console.log('fotografias en el PDF: ' + cuantas);
  });

  for (const k of Object.keys(tamanos)) {
    console.log(k + '.pdf: ' + (tamanos[k] / 1048576).toFixed(2) + ' MB');
  }
  console.log('escrito en pdf/');
}

main().catch((e) => { console.error(e); process.exit(1); });
