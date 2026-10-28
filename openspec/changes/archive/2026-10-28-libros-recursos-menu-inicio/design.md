# Design

## Context

- `libros` tiene `titulo`, `autores`, `anio`, `editorial` y `notas_bibliograficas`; `recursos` tiene `titulo`, `url`, `autor` y `descripcion` (migración `entidades`).
- La función `buscar` usa `notas_bibliograficas` de los libros.
- Las imágenes de las notas ya usan el bucket privado `imagenes` (carpeta del usuario como primera parte de la ruta) y la ruta `/imagen` con URL firmada (fase 3 del editor).
- El menú sale de `src/frontend/navegacion.ts`; Inicio, de `services/inicio.ts` y `pantallas/Inicio.tsx`.

## Goals / Non-Goals

**Goals:**
- Fichas definitivas sin perder datos existentes.
- Reutilizar la infraestructura de imágenes para las portadas.
- Inicio útil para el día a día, sin métricas.

**Non-Goals:**
- Tipos de libro, consulta de ISBN en servicios externos, filtros en la búsqueda global.

## Decisions

### D1. Migración sin pérdida
- `libros`: `rename column notas_bibliograficas to descripcion`; nuevas columnas `isbn text` (solo dígitos y X, 10 o 13 caracteres), `estado_lectura text` (`por_leer`, `leyendo`, `leido` o nulo), `portada_ruta text` y `portada_url text` (`http(s)://`), con un `check` que impide tener las dos a la vez.
- `recursos`: `tipo text not null default 'otro'` con `check` sobre los ocho valores (`articulo`, `pagina_web`, `video`, `podcast`, `documento`, `curso`, `audio`, `otro`) y `fecha_publicacion date`.
- `buscar` se redefine igual, cambiando `notas_bibliograficas` por `descripcion`.
- Índice `(usuario_id, estado_lectura)` no hace falta: el volumen es personal.

### D2. ISBN
`normalizarIsbn(texto)` (función pura): quita guiones y espacios y acepta 10 caracteres (dígitos y X final, suma ponderada módulo 11) o 13 dígitos (pesos 1 y 3, módulo 10). Devuelve el ISBN normalizado o `null` si no es válido. Se guarda y se muestra normalizado, sin guiones, para que sea comparable.

### D3. Portada
- Se elige en la página del libro con un formulario propio («Portada»): subir archivo o dirección web, y «Quitar portada».
- Subida: misma validación que las imágenes de notas (firma del archivo, 5 MB, tipos). Ruta `<usuario>/<libro>/<uuid>.<ext>`, que ya cumple el formato de `esRutaImagen` y las políticas del bucket.
- Al guardar una portada nueva o quitarla, el servicio borra la subida anterior; al eliminar el libro, también. Se sirve por `/imagen` como las demás.
- Desde la web: `<img referrerPolicy="no-referrer">` con aviso si no carga, como en las notas.

### D4. Recursos
- Selector «Tipo» con los ocho valores (etiquetas en español en `services/recursos.ts`), «Otro» por defecto.
- Campo «Fecha de publicación» (`<input type="date">`); se muestra como «14 de marzo de 1883».
- Lista: filtro por tipo con enlaces (`?tipo=podcast`), «Todos» por defecto; cada elemento muestra su tipo.

### D5. Menú e Inicio
- `SECCIONES` en el nuevo orden.
- Inicio:
  - accesos rápidos «Nueva nota», «Nuevo libro», «Nuevo recurso» y «Nueva cita»;
  - «Notas recientes» (5) en la columna principal;
  - columna lateral: «Leyendo ahora» (libros en `leyendo`, hasta 4; si no hay, los 4 últimos añadidos con el título «Libros recientes»), «Proyectos» (4 modificados más recientemente) y «Citas guardadas» (3).
  - Sin contadores ni cifras.

## Risks / Trade-offs

- [Renombrar una columna rompe código que aún use el nombre viejo] → Se cambian a la vez repositorio, servicio, tipos y `buscar`; las pruebas cubren búsqueda y fichas.
- [Portadas subidas huérfanas si falla el borrado] → Se registra el error; el archivo sigue siendo privado.

## Migration Plan

Una migración con los cambios de D1. Los datos existentes se conservan (renombrado y valores por defecto). Para volver atrás: renombrar de nuevo y borrar las columnas añadidas.

## Open Questions

Ninguna bloqueante: los detalles propuestos al implementar están registrados en §2.3 y §2.4 como revisables.
