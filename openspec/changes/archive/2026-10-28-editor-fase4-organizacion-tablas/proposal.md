# Proposal

## Why

Las notas largas de un archivo de estudio necesitan reorganizarse y recorrerse con facilidad, y algunos contenidos (comparaciones, cronologías, glosas) se leen mejor en tabla. Es la fase 4 y última del plan acordado el 2026-10-27 (§3.2 de `openspec/especificacion_app_estudio.md`): mover bloques, índice de la nota y tablas.

## What Changes

- **Mover bloques:** subir o bajar el bloque donde está el cursor (párrafo, subtítulo, cita, imagen, vídeo, tabla, lista entera o un elemento dentro de su lista) con los botones «Subir bloque» y «Bajar bloque» de la barra o con Alt+↑ y Alt+↓. El contenido del bloque no cambia y el cambio se guarda como cualquier otro.
- **Índice de la nota:** si la nota tiene subtítulos, aparece un índice («Índice de la nota») con sus subtítulos y subtítulos menores, en orden y con sangría. Pulsar una entrada lleva a ese subtítulo. Se actualiza mientras se escribe y no se guarda: se calcula del contenido.
- **Tablas:**
  - Se insertan desde «/» («Tabla») o la barra: 3 × 3 con fila de encabezado.
  - Con el cursor en una tabla, la barra ofrece «Añadir fila», «Añadir columna», «Eliminar fila», «Eliminar columna» y «Eliminar tabla».
  - Las celdas admiten el mismo texto con formato que el resto de la nota.
  - El servidor filtra la estructura de la tabla como el resto del contenido, y el texto de las celdas entra en la búsqueda.

### Fuera de alcance

- Arrastrar bloques con el ratón: se descarta en esta fase porque la extensión oficial de Tiptap exige paquetes de edición colaborativa (Yjs) ajenos a la app. Se puede revisar más adelante.
- Combinar o dividir celdas, cambiar el ancho de las columnas, ordenar tablas.
- Bloques de código y subir vídeos propios (siguen excluidos).

## Capabilities

### New Capabilities

_Ninguna._

### Modified Capabilities

- `editor-notas`: añade mover bloques, índice de la nota y tablas; las cuatro fases quedan implementadas.

## Impact

- **Dependencia:** `@tiptap/extension-table` 3.32.0 (MIT), de la misma familia y versión que el resto del editor.
- **Backend:** filtro de contenido (`contenidoNota.ts`) con los nodos de tabla.
- **Frontend:** `EditorNota` (extensión para mover bloques, tablas, índice, botones y opciones de «/»).
- **Sin cambios en la base de datos.**
- **Pruebas:** unitarias (filtro de tablas y texto plano) y E2E (mover, índice, tablas, guardado).
