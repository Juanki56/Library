# Design

## Context

Medido en Vercel (`iad1`, igual región que Supabase `us-east-1`): cada ronda de consultas a Supabase cuesta ~100–150 ms. El aviso de eliminación hacía 2 rondas (existe → conteos); eliminar una nota, 3–4 (imágenes → borrar → archivos → página siguiente).

## Decisions

### D1. `loading.tsx` en `(archivo)`
Respuesta inmediata en cada navegación. Consecuencia: el código HTTP se envía antes de que la página llame a `notFound()`, así que una página inexistente responde 200 con el contenido de «no encontrada» (Next añade `noindex`). Para una app personal es aceptable; la prueba de aislamiento comprueba lo que se ve en vez del código.

### D2. Aviso en una ronda y precargado
`resumenEliminacion` lanza a la vez la comprobación de existencia, los conteos de vínculos y (en libros y recursos) el de citas. Si el elemento no existe o es ajeno, la RLS deja los conteos en cero y se devuelve `null` como antes. Un identificador no válido devuelve `null` sin consultar. `ConfirmarEliminacion` pide el aviso al entrar el puntero o el foco en el botón y lo descarta al salir, para no mostrar uno antiguo si los vínculos cambian.

### D3. Borrado de archivos con `after()`
Los servicios aceptan un `diferir` opcional; los controllers pasan `after` de Next. Sin él (pruebas de integración), el borrado se espera como antes.

## Risks / Trade-offs

- [404 → 200 en páginas inexistentes] → Solo afecta al código HTTP; la interfaz es la misma.
- [Si el borrado diferido falla, quedan archivos huérfanos] → Igual que antes: se registra el error y la eliminación del elemento no se deshace.

## Migration Plan

Solo código.

## Open Questions

Ninguna.
