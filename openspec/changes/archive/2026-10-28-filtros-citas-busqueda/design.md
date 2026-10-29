# Design

## Context

- `public.buscar(consulta, filtro)` (SQL, `security invoker`) une los seis tipos, busca por prefijo sin tildes y devuelve hasta 50 resultados por relevancia.
- Vínculos en tablas de enlace (`nota_proyecto`, `nota_libro`, `libro_proyecto`, `recurso_proyecto`, `recurso_libro`), etiquetas en `etiqueta_<tipo>` y el enlace de una cita en `citas.libro_id`.
- `services/citas.listarCitas` devuelve todas las citas, las más recientes primero.

## Decisions

### D1. Filtros dentro de `buscar`
Nueva firma `buscar(consulta, filtro, autor, etiqueta, desde, hasta, proyecto, libro)` (todos opcionales); se elimina la de dos parámetros para que no haya ambigüedad.
- Cada documento lleva además `autor` (libro: autores; recurso: autor; cita: autor; resto: nulo) y `modificado` (`actualizado_en`).
- **Autor:** `normalizar(autor) like '%' || normalizar(texto) || '%'`; sin autor, el documento no pasa.
- **Etiqueta / proyecto / libro:** `exists` en la tabla de enlace que corresponde al tipo; los tipos sin esa relación no pasan.
- **Fecha:** `modificado >= desde` y `modificado < hasta + 1 día`.
- **Sin texto:** si no hay términos pero sí algún filtro adicional, se devuelven los que cumplen los filtros, los modificados más recientemente primero. Sin texto ni filtros, nada (como hasta ahora).
- Sigue siendo `security invoker`: la RLS limita todo al usuario, también las tablas de enlace consultadas.

Filtrar dentro de la función, y no después en el servidor, evita perder resultados por el límite de 50.

### D2. Página de resultados
- Parámetros en la dirección: `q`, `tipo`, `autor`, `etiqueta`, `desde`, `hasta`, `proyecto`, `libro`. Los enlaces de tipo conservan los demás filtros.
- Panel «Filtros» (`<details>`, abierto si hay alguno activo) con un formulario GET: «Autor» (texto), «Etiqueta», «Proyecto» y «Libro» (listas con lo del usuario), «Modificado desde» y «hasta» (fechas), «Aplicar filtros» y «Quitar filtros».
- El servicio valida identificadores, fechas y longitud del autor; un valor no válido se ignora.

### D3. Filtros de Citas
- Parámetros `tipo` (`cita`, `frase`, `proverbio`) y `autor` (texto exacto normalizado, o `-` para «Sin autor»).
- Se filtra en el servidor sobre la lista completa (volumen personal); los autores disponibles salen de las mismas citas, agrupando sin mayúsculas ni tildes.
- Tipo con enlaces (como el filtro de recursos); autor con una lista que aplica el filtro al cambiarla.

## Risks / Trade-offs

- [Filtro de autor por fragmento] → «marx» encuentra «Karl Marx»; es lo esperado en un archivo personal.
- [Búsqueda sin texto con un filtro muy amplio] → Límite de 50 resultados, como siempre.

## Migration Plan

Migración que elimina `buscar(text, text)` y crea la nueva función con permisos solo para usuarios autenticados.

## Open Questions

Ninguna.
