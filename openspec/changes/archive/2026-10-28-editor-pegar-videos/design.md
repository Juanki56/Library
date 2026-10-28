# Design

## Context

- El nodo `video` (fase 3) solo se crea desde `CuadroVideo`; `reconocerVideo(enlace)` ya extrae proveedor e identificador de los enlaces de YouTube y Vimeo.
- La extensión `PegarImagenes` trata el pegado de archivos; si no hay archivos, deja actuar a ProseMirror.

## Decisions

### D1. Regla de pegado en el nodo `video`
Plugin con `handlePaste` en el nodo `video`:
- Solo actúa si el portapapeles no trae archivos, la selección está vacía, el cursor está en un párrafo **vacío** y el texto pegado, recortado, es **un único enlace** que `reconocerVideo` acepta.
- Entonces sustituye ese párrafo por el nodo `video` (`{ proveedor, id }`) y deja el cursor en un párrafo después, para seguir escribiendo.
- En cualquier otro caso devuelve `false` y el pegado sigue su curso normal (el enlace se convierte en enlace con `autolink`/`linkOnPaste`).

## Risks / Trade-offs

- [Querer el enlace como texto en una línea propia] → Ctrl+Z deshace el reproductor. Para dejarlo como enlace basta con pegarlo dentro de una frase o escribir algo antes en la línea.

## Migration Plan

Solo código.

## Open Questions

Ninguna.
