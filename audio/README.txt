Las dos canciones, ya dentro.

  admv.m4a                    → ADMV — Maluma
  perdonar-y-agradecer.m4a    → Perdonar y Agradecer — Sharif

Son AAC de 128 kbps (3.1 MB y 3.7 MB). Salieron de los originales que estaban
en Escritorio/capitulo 4: 8.8 MB y 10.6 MB. La duración es la misma al
milisegundo, así que las letras siguen cuadrando. Van con faststart, que quiere
decir que empiezan a sonar sin esperar a que baje el archivo completo.

Los originales no se tocaron; siguen en Escritorio/capitulo 4.

Con los archivos aquí, la música suena desde el teléfono: sin anuncios, sin
depender de YouTube y sin gastar datos. Las letras están cronometradas contra el
tiempo del audio, así que no se desfasan.

Si un archivo no está, esa canción cae sola al reproductor de YouTube (el de
siempre). Para forzar YouTube aunque los archivos existan, abre el sitio con
?source=yt al final de la dirección.

Reemplazar una canción: deja el archivo con el mismo nombre (sirve .m4a o .mp3,
el reproductor prueba las dos) y sube:

  cd ~/Trabajo/Clientes/carmen-3-meses
  git add audio && git commit -m "Song" && git push

Para volver a comprimir un MP3 nuevo sin perder calidad de más:

  ffmpeg -i original.mp3 -vn -c:a aac -b:a 128k -movflags +faststart nombre.m4a

Nota: las letras del sitio están cronometradas a las versiones de estudio.
Si la versión que pusiste tiene la entrada más larga, la letra se adelanta o se
atrasa; se corrige con el número `offset` de esa canción en index.html
(segundos: positivo atrasa la letra). Solo aplica a la reproducción local.
