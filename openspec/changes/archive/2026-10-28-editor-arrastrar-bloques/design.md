# Design

## Context

- `moverBloques.ts` (fase 4) ya sabe qué es «un bloque»: el nodo seleccionado o el ancestro más profundo que sea elemento de lista o hijo directo del documento.
- ProseMirror trae arrastrar y soltar nativo: si al empezar un arrastre `view.dragging` contiene `{ slice, move: true }`, al soltar mueve ese contenido a la posición de destino y muestra el cursor de destino (`dropcursor`, incluido en StarterKit).

## Goals / Non-Goals

**Goals:** arrastrar cualquier bloque con el ratón, sin dependencias nuevas y sin romper la edición.

**Non-Goals:** selección múltiple de bloques, arrastrar entre notas, teclado (ya cubierto por Alt+↑/↓).

## Decisions

### D1. Extensión `ArrastrarBloques`
Plugin de ProseMirror con una vista propia:
- Crea un elemento asa (`⠿`, `draggable="true"`, `aria-hidden`, `title="Arrastrar para mover"`) dentro del contenedor del editor, posicionado de forma absoluta.
- **Al mover el ratón** sobre el editor, busca con `posAtCoords` (un poco a la derecha del borde izquierdo del texto, a la altura del puntero) el bloque bajo el puntero, con la misma regla que `moverBloques` (función compartida `bloqueEn`), y coloca el asa a la izquierda de su primera línea. Se oculta al salir del editor.
- **Al empezar a arrastrar el asa:** selecciona el bloque (`NodeSelection`), pone `view.dragging = { slice, move: true }`, rellena `dataTransfer` con `view.serializeForClipboard(slice)` y usa el propio bloque como imagen de arrastre.
- **Al soltar:** lo hace ProseMirror. La transacción pasa por `onUpdate` y el guardado automático.
- Solo en modo editable.

**Alternativa descartada:** `@tiptap/extension-drag-handle`, por sus dependencias de colaboración (Yjs), como en la fase 4.

### D2. Aspecto
Asa en el margen izquierdo, tono suave, que se oscurece al pasar el ratón y cambia el cursor a `grab`. El contenedor del editor deja margen izquierdo suficiente para que no tape el texto. En pantallas táctiles no aparece (sin `hover`); ahí siguen los botones.

## Risks / Trade-offs

- [Arrastre nativo en navegadores] → Es el mecanismo estándar de ProseMirror; se prueba en Chromium.
- [Soltar dentro de otro bloque] → ProseMirror ajusta la posición para que el documento siga siendo válido.

## Migration Plan

Solo código.

## Open Questions

Ninguna.
