# Design

## Context

- El nodo `imagen` (fase 3) solo se crea desde `CuadroImagen`, que llama a la Server Action `subirImagen(notaId, formulario)`. Su regla de lectura de HTML solo reconoce `figure[data-imagen]`, así que un `<img>` pegado se descarta.
- El arrastre de bloques (cambio `editor-arrastrar-bloques`) usa el soltar nativo de ProseMirror con `moved = true`.

## Decisions

### D1. Extensión `PegarImagenes`
Plugin con `handlePaste` y `handleDrop`:
- Toma los archivos de imagen del portapapeles o de lo soltado (`clipboardData.files` / `dataTransfer.files`). Si no hay ninguno, deja actuar a ProseMirror (texto, HTML, arrastre de bloques con `moved = true`).
- Para cada archivo: comprueba en el cliente tamaño (5 MB) y tipo declarado; llama a la subida y, si va bien, inserta un nodo `imagen` (`origen: "archivo"`) donde está el cursor (al pegar) o en el punto de soltar (`posAtCoords`).
- La subida y los avisos los da `EditorNota` (función `subir` pasada a la extensión), que muestra un aviso en línea: «Subiendo imagen…» (`role="status"`) o el error (`role="alert"`), con «Cerrar».
- El servidor valida de nuevo (firma, tamaño, nota propia), como en la fase 3.

### D2. `<img>` pegado desde una web
Nueva regla de lectura del nodo `imagen`: `img[src]` con `src` http/https crea `{ origen: "web", src, alt }`. Si el `src` no es web (por ejemplo `data:`), se descarta, como hace el filtro del servidor. Tiene menos prioridad que `figure[data-imagen]`, así que copiar y pegar imágenes dentro de la app conserva su origen.

## Risks / Trade-offs

- [Varias imágenes pegadas a la vez] → Se suben una tras otra y se insertan en orden.
- [La subida tarda y el usuario sigue escribiendo] → La imagen se inserta en la posición guardada, ajustada con los cambios hechos entretanto (mapeo de la transacción).

## Migration Plan

Solo código.

## Open Questions

Ninguna.
