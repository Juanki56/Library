# Design

## Context

- Contenido de las notas: JSON de Tiptap filtrado en el servidor (`services/contenidoNota.ts`), con guardado automático por versión (fase 1) y nodo `referencia` (fase 2).
- Supabase con RLS en todo el esquema `public`; aún no se usa Storage.
- Next.js 15: las Server Actions aceptan por defecto cuerpos de hasta 1 MB. El middleware de sesión no se ejecuta en rutas que terminan en `.png`, `.jpg`, etc.

## Goals / Non-Goals

**Goals:**
- Imágenes privadas por usuario, con validación real del tipo y tamaño.
- Imágenes desde URL y vídeos sin guardar nada ejecutable: solo datos que el servidor valida.
- Sin archivos huérfanos en el almacenamiento, sin perder imágenes que siguen en uso.

**Non-Goals:**
- Edición de imágenes (tamaño, recorte, alineación) ni subida de vídeos.
- Copiar al archivo las imágenes desde URL (decidido: solo el enlace).

## Decisions

### D1. Nodos en el contenido
- `imagen` (bloque, atómico):
  - subida: `{ origen: "archivo", ruta, alt, pie }`, con `ruta` = `<usuario>/<nota>/<uuid>.<ext>` (UUIDs y extensión `png|jpg|gif|webp`);
  - desde URL: `{ origen: "web", src, alt, pie }`, con `src` http/https (`esEnlaceWeb`).
  - `alt` y `pie`: texto de hasta 500 caracteres, vacío si no se indica.
- `video` (bloque, atómico): `{ proveedor: "youtube" | "vimeo", id }`, con `id` de 11 caracteres `[A-Za-z0-9_-]` (YouTube) o solo dígitos (Vimeo). La dirección del reproductor la construye la app, nunca se guarda.
- El filtro descarta cualquier otra variante y otros atributos. `textoPlano` incluye el pie de la imagen, para que se pueda buscar.

### D2. Almacenamiento privado
- Bucket `imagenes` de Supabase Storage, **no público**, con `file_size_limit` de 5 MB y tipos `image/png`, `image/jpeg`, `image/gif`, `image/webp` (sin SVG, que puede contener código).
- Políticas en `storage.objects`: leer, crear y borrar solo si `bucket_id = 'imagenes'` y la primera carpeta de la ruta es el `auth.uid()` del usuario.
- Tabla `imagenes_nota (ruta, nota_id, usuario_id, creado_en)`: registra cada imagen subida y su nota, con clave foránea compuesta `(nota_id, usuario_id)` y RLS de propietario (leer, crear, borrar).

### D3. Subida
- Server Action `subirImagen(notaId, formulario)`; el límite de las Server Actions se sube a 6 MB en `next.config.ts`.
- El servicio comprueba: nota propia y existente, tamaño ≤ 5 MB y **firma del archivo** (los primeros bytes) de PNG, JPEG, GIF o WebP; el tipo declarado por el navegador no basta.
- Sube con la sesión del usuario (las políticas aplican), registra la fila en `imagenes_nota` y devuelve la `ruta`. Si el registro falla, borra el archivo subido.
- Mensajes: «La imagen no puede superar 5 MB.», «Solo se admiten imágenes PNG, JPEG, GIF o WebP.», «No se pudo subir la imagen. Inténtalo de nuevo.».
- El editor solo inserta el nodo cuando la subida ha terminado bien.

### D4. Servir imágenes privadas
- Ruta `GET /imagen?ruta=<ruta>` (consulta en lugar de ruta con extensión, para que pase por el middleware de sesión).
- Crea con la sesión del usuario una URL firmada de 1 hora y redirige a ella. Sin sesión o sin permiso, responde 404.
- Cabecera `Cache-Control: private, max-age=3000`, menor que la caducidad de la URL firmada.

### D5. Imágenes desde URL
- `<img src>` con `referrerPolicy="no-referrer"` y `loading="lazy"`.
- Si el navegador no puede cargarla (`onError`), la vista muestra «No se pudo cargar la imagen.» con la dirección como enlace, sin romper la nota.

### D6. Vídeos
- `reconocerVideo(url)` (función pura): acepta `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/shorts/`, `youtube.com/embed/`, `m.youtube.com` y `vimeo.com/<número>` (también `player.vimeo.com/video/<número>`).
- Reproductor: `<iframe>` a `https://www.youtube-nocookie.com/embed/<id>` o `https://player.vimeo.com/video/<id>`, con `loading="lazy"`, `referrerPolicy="strict-origin-when-cross-origin"` y título accesible. Debajo, un enlace «Ver en YouTube» o «Ver en Vimeo».

### D7. Cuadros y menús
- «/» añade «Imagen» y «Vídeo»; la barra añade los botones «Imagen» y «Vídeo».
- `CuadroImagen`: elegir entre «Subir archivo» y «Desde una dirección web», más «Texto alternativo» y «Pie de imagen (opcional)». Con una imagen seleccionada, el botón pasa a «Editar imagen» y el cuadro solo edita alt y pie.
- `CuadroVideo`: campo «Enlace del vídeo» con validación inmediata.

### D8. Limpieza
- **Al eliminar una nota:** el servicio lee antes sus rutas en `imagenes_nota`, elimina la nota (las filas caen en cascada) y borra los archivos del almacenamiento.
- **Al quitar una imagen del texto:** al abrir la nota, el servidor compara sus filas de `imagenes_nota` con las rutas del contenido guardado y borra las que ya no aparecen (archivo y fila).
  - Se hace al abrir y no en cada guardado automático para que deshacer (Ctrl+Z) durante la edición no deje una imagen rota. También limpia las subidas que nunca llegaron a guardarse.
  - Solo se borran las subidas hace más de **2 minutos**: una imagen recién subida puede no estar aún en el contenido guardado si el guardado automático está en curso (por ejemplo, al recargar justo después de subirla).
  - La spec lo refleja: «como tarde la siguiente vez que se abre la nota pasados dos minutos desde su subida».

**Alternativa descartada:** borrar filas de `storage.objects` desde un trigger SQL. Supabase no borra así el archivo real, que quedaría huérfano.

## Risks / Trade-offs

- [Imágenes desde URL pueden desaparecer o rastrear] → Decidido por el usuario; `no-referrer` y aviso si fallan.
- [Si el borrado en Storage falla tras eliminar la nota] → Se registra el error sin bloquear la eliminación; el archivo queda privado e inaccesible para otros.
- [Server Actions de 6 MB] → Solo afecta al tamaño máximo aceptado; la validación real es de 5 MB.

## Migration Plan

Migración nueva: bucket, políticas de Storage y tabla `imagenes_nota` con RLS. No hay datos que migrar. Para volver atrás se borran tabla, políticas y bucket; las imágenes del contenido las descartaría el filtro anterior al guardar.

## Open Questions

Ninguna: las tres dudas de producto se decidieron el 2026-10-28.
