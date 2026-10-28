# Design

## Context

- El editor (fases 1 a 3) usa Tiptap 3.32 con extensiones propias (`comandosBarra`, nodos de referencia, imagen y vídeo) y un filtro de contenido por listas blancas en el servidor.
- La extensión oficial para arrastrar bloques (`@tiptap/extension-drag-handle`) tiene como dependencias obligatorias `@tiptap/extension-collaboration` y `@tiptap/y-tiptap` (Yjs), propias de la edición colaborativa.
- La extensión oficial de tablas (`@tiptap/extension-table` 3.32.0, MIT) no tiene dependencias ajenas.

## Goals / Non-Goals

**Goals:**
- Reordenar el contenido sin cortar y pegar, usable con teclado.
- Recorrer notas largas con un índice siempre actualizado.
- Tablas sencillas, guardadas y filtradas como el resto del contenido.

**Non-Goals:**
- Arrastrar con el ratón, combinar celdas, anchos de columna.

## Decisions

### D1. Mover bloques con una extensión propia
Extensión `MoverBloques` con el comando `moverBloque("arriba" | "abajo")` y los atajos Alt+↑ / Alt+↓:
- **Qué bloque:** si hay un nodo seleccionado (imagen, vídeo), ese; si no, el ancestro más profundo del cursor que sea un elemento de lista (`listItem`, `taskItem`) o un hijo directo del documento. Así, dentro de una lista se mueve el elemento; fuera, el bloque entero (una lista o tabla completa se mueve si el cursor está en ella pero no en un elemento de lista… salvo en tablas, donde se mueve la tabla).
- **Cómo:** en una sola transacción se borra el bloque y se inserta antes del hermano anterior o después del siguiente; la selección se traslada con él. En el borde no hace nada (devuelve `false`).
- Botones «Subir bloque» y «Bajar bloque» en la barra.

**Alternativa descartada:** `@tiptap/extension-drag-handle`, por sus dependencias de colaboración (Yjs).

### D2. Índice calculado del contenido
- Componente `IndiceNota` dentro del editor, encima del texto. Usa `useEditorState` para recorrer el documento y obtener `{ nivel, texto, posición }` de cada `heading`.
- `<nav aria-label="Índice de la nota">` con una lista ordenada; los subtítulos menores (nivel 3) van sangrados. Solo se dibuja si hay al menos un subtítulo.
- Pulsar una entrada: `setTextSelection` al inicio del subtítulo, foco en el editor y `scrollIntoView` del elemento.
- No se guarda nada: el índice siempre coincide con el contenido.

### D3. Tablas
- `TableKit` de `@tiptap/extension-table` con `resizable: false`.
- Insertar: `insertTable({ rows: 3, cols: 3, withHeaderRow: true })` desde la barra («Tabla») y desde «/».
- Con el cursor en una tabla, la barra muestra un grupo con «Añadir fila», «Añadir columna», «Eliminar fila», «Eliminar columna» y «Eliminar tabla» (`addRowAfter`, `addColumnAfter`, `deleteRow`, `deleteColumn`, `deleteTable`).
- **Filtro del servidor:** nodos `table`, `tableRow`, `tableHeader` y `tableCell`. En las celdas solo se conservan `colspan` y `rowspan` (enteros de 1 a 50) y `colwidth` (`null` o lista de enteros de 1 a 2000); cualquier otro atributo se descarta. Una celda sin contenido recibe un párrafo vacío, para que el documento siga siendo válido.
- **Texto plano:** cada celda es un bloque, así que su texto entra en `contenido_texto` y en la búsqueda.

## Risks / Trade-offs

- [Sin arrastrar con el ratón] → Botones y teclado cubren la necesidad; arrastrar se puede añadir si el usuario lo pide.
- [Tablas anchas en móvil] → Contenedor con desplazamiento horizontal propio, sin desplazar la página.

## Migration Plan

Sin cambios en la base de datos. Las notas existentes no tienen tablas; el filtro las deja igual. Para volver atrás se retira la extensión; el filtro anterior descartaría las tablas al guardar.

## Open Questions

Ninguna.
