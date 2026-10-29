# Proposal

## Why

Ya en Vercel, el usuario notaba lento cada clic, sobre todo al eliminar (1–2 s). Medido en producción con su cuenta: abrir el cuadro de «Eliminar» tardaba 320–425 ms (aviso de vínculos) y confirmar 495–720 ms, casi todo espera del servidor por consultas a Supabase en cadena. Además, ninguna página mostraba nada mientras cargaba, y al entrar Next.js precargaba unas 15 páginas completas a la vez, retrasando el primer clic hasta 1,7 s.

## What Changes

- **«Cargando…» al instante:** `loading.tsx` en la zona con sesión. El menú y la cabecera se quedan y el contenido muestra «Cargando…» hasta que llega la página. Next.js solo precarga hasta ese punto los enlaces visibles.
- **«Eliminando…» al confirmar:** el botón cambia de texto y los dos botones del cuadro se desactivan mientras se elimina.
- **Aviso de eliminación en una sola ronda:** existencia, vínculos y citas se consultan a la vez. Se pide al pasar el ratón (o el foco) por «Eliminar», así suele estar listo al abrir el cuadro.
- **Archivos borrados después de responder:** las imágenes de una nota y la portada de un libro se borran del almacenamiento con `after()`, sin retrasar la respuesta.

## Capabilities

### New Capabilities

_Ninguna._

### Modified Capabilities

_Ninguna_ (mejora de rendimiento sin cambio de requisitos).

## Impact

- `app/(archivo)/loading.tsx`, `ConfirmarEliminacion`, `services/eliminacion.ts`, `services/imagenes.ts`, `services/libros.ts` y los controllers de notas y libros.
- Una página que no existe o es ajena responde con código HTTP 200 (con la página de «no encontrada») en vez de 404, porque la respuesta empieza antes de saberlo. No se muestra nada del elemento.
