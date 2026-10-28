# Proposal

## Why

En la fase 4 se dejó fuera arrastrar bloques con el ratón porque la extensión oficial de Tiptap exige paquetes de edición colaborativa (Yjs). El 2026-10-28 el usuario pidió incluirlo: reorganizar una nota arrastrando es más cómodo que subir y bajar bloque a bloque.

## What Changes

- **Asa de arrastre:** al pasar el ratón junto a un bloque (párrafo, subtítulo, cita, lista, tabla, imagen, vídeo, separador o un elemento de lista) aparece a su izquierda un asa «⠿».
- **Arrastrar y soltar:** con el asa se arrastra el bloque entero y se suelta entre otros bloques; una línea indica dónde quedará. El contenido no cambia y el nuevo orden se guarda como cualquier otro cambio.
- Los botones «Subir bloque» / «Bajar bloque» y Alt+↑ / Alt+↓ se mantienen (alternativa con teclado).

### Fuera de alcance

- Arrastrar varios bloques a la vez; arrastrar entre notas distintas.

## Capabilities

### New Capabilities

_Ninguna._

### Modified Capabilities

- `editor-notas`: «Mover bloques» añade arrastrar con el ratón.

## Impact

- **Frontend:** extensión propia `ArrastrarBloques` (plugin de ProseMirror) en `EditorNota`, estilos del asa. Sin dependencias nuevas.
- **Sin cambios en el servidor ni en la base de datos.**
- **Pruebas:** E2E de arrastrar un párrafo, un elemento de lista y una imagen, con guardado.
