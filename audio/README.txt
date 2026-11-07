Las canciones, ya dentro.

  admv.m4a                    → ADMV — Maluma
  perdonar-y-agradecer.m4a    → Perdonar y Agradecer — Sharif
  si-tu-no-vuelves.m4a        → Si Tú No Vuelves — Miguel Bosé   (todavía falta)

Las dos primeras son AAC de 128 kbps (3.1 MB y 3.7 MB). Salieron de los
originales que estaban en Escritorio/capitulo 4: 8.8 MB y 10.6 MB. La duración es
la misma al milisegundo, así que las letras siguen cuadrando. Van con faststart,
que quiere decir que empiezan a sonar sin esperar a que baje el archivo completo.

Los originales no se tocaron; siguen en Escritorio/capitulo 4.

Con los archivos aquí, la música suena desde el teléfono: sin anuncios, sin
depender de YouTube y sin gastar datos. Las letras están cronometradas contra el
tiempo del audio, así que no se desfasan.

Si un archivo no está, esa canción cae sola al reproductor de YouTube (el de
siempre). Para forzar YouTube aunque los archivos existan, abre el sitio con
?source=yt al final de la dirección.

Miguel Bosé está en ese caso: suena por YouTube hasta que dejes el archivo con el
nombre de arriba. Es la única sin letra cronometrada, porque la letra se ajusta
contra el archivo. Para dejarla lista:

  ffmpeg -i "Si tu no vuelves.mp3" -vn -c:a aac -b:a 128k -movflags +faststart \
    si-tu-no-vuelves.m4a

Reemplazar una canción: deja el archivo con el mismo nombre (sirve .m4a o .mp3,
el reproductor prueba las dos) y sube:

  cd ~/Trabajo/Clientes/carmen-3-meses
  node tools/candado.mjs 'la-contrasena'
  node tools/offline.mjs
  git add -A && git commit -m "Song" && git push

Nota: las letras del sitio están cronometradas a las versiones de estudio.
Si la versión que pusiste tiene la entrada más larga, la letra se adelanta o se
atrasa; se corrige con el número `offset` de esa canción en fuente/index.html
(segundos: positivo atrasa la letra). Solo aplica a la reproducción local.
