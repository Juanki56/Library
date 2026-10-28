# Proposal

## Why

El editor ya permite escribir con formato y referenciar notas, pero no admite imágenes ni vídeos, que forman parte de la dirección acordada (§3.1 y §3.2 de `openspec/especificacion_app_estudio.md`). Esta es la fase 3 del plan: imágenes subidas o desde una URL y vídeos de YouTube y Vimeo, con los detalles decididos el 2026-10-28.

## What Changes

- **Imágenes subidas:**
  - Desde el menú «/» («Imagen») o la barra se abre el cuadro «Insertar imagen» y se elige un archivo PNG, JPEG, GIF o WebP de hasta **5 MB**.
  - Se guardan de forma **privada por usuario**: nadie más puede verlas, ni con el enlace.
  - Si la subida falla, se avisa y no se inserta nada. Si después falla el guardado, el indicador lo muestra como cualquier otro cambio sin guardar.
- **Imágenes desde una URL:** se guarda solo la dirección web (http/https); la imagen se carga desde su origen. Si no se puede cargar, la nota muestra un aviso en su lugar.
- **Texto alternativo y pie de imagen** opcionales en ambos casos, editables después desde el mismo cuadro («Editar imagen»).
- **Limpieza:** las imágenes subidas que dejan de usarse se borran del almacenamiento, al eliminar la nota o al quitarlas del texto una vez guardada la nota.
- **Vídeos:** desde «/» («Vídeo») o la barra, se pega un enlace de YouTube o Vimeo y se inserta el reproductor. Cualquier otro enlace se rechaza con un mensaje. Los enlaces normales a vídeos siguen funcionando como enlaces.
- **Seguridad:** el servidor solo admite imágenes de los tipos permitidos (comprobando el contenido del archivo) y vídeos de YouTube o Vimeo, guardando solo el identificador del vídeo.

### Fuera de alcance

- Subir vídeos propios (descartado por ahora).
- Redimensionar, recortar o alinear imágenes; galerías.
- Mover bloques, índice de la nota y tablas (fase 4).

## Capabilities

### New Capabilities

_Ninguna._

### Modified Capabilities

- `editor-notas`: añade imágenes (subidas y desde URL), vídeos de YouTube y Vimeo y la limpieza de imágenes; la fase 3 deja de figurar como futura.

## Impact

- **Base de datos y almacenamiento:** espacio privado de imágenes en Supabase Storage con límite de 5 MB y tipos permitidos, políticas por usuario y tabla de imágenes por nota para la limpieza. Nueva migración.
- **Backend:** filtro de contenido (nodos `imagen` y `video`), servicio de imágenes (subir, servir, limpiar), eliminación de notas.
- **Next.js:** límite de tamaño de las Server Actions a 6 MB; ruta que sirve las imágenes privadas.
- **Frontend:** `EditorNota` (nodos, cuadros «Insertar imagen» e «Insertar vídeo», opciones en «/» y en la barra).
- **Pruebas:** unitarias (filtro, reconocimiento de vídeos y tipos de imagen), integración (políticas de almacenamiento y limpieza) y E2E.
