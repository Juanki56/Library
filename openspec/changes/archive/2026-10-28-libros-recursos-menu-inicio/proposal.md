# Proposal

## Why

Libros y fuentes tenían fichas provisionales a la espera de decidir sus campos y tipos, y el orden del menú y el contenido de Inicio seguían pendientes. El 2026-10-28 el usuario decidió los campos de los libros y los tipos y datos de los recursos, y dejó el menú e Inicio a criterio de la implementación, buscando la mayor comodidad (§2.3, §2.4 y §6 de `openspec/especificacion_app_estudio.md`).

## What Changes

- **Libros:**
  - Campos nuevos: **descripción** (las actuales «notas bibliográficas», con su texto), **ISBN** (ISBN-10 o ISBN-13 válido), **portada** (subida o desde una dirección web) y **estado de lectura** opcional: «Por leer», «Leyendo» o «Leído».
  - La lista y la página del libro muestran el estado y la portada.
  - Se mantienen título (obligatorio), autores, editorial, año, etiquetas y relaciones.
- **Fuentes y recursos:**
  - **Tipo** obligatorio de una lista: Artículo, Página web, Vídeo, Podcast, Documento o PDF, Curso, Audio u Otro («Otro» por defecto y para los existentes).
  - **Fecha de publicación** opcional; «Autor» pasa a «Autor o creador».
  - La lista se puede **filtrar por tipo** y muestra el tipo de cada recurso.
- **Menú:** Inicio, Notas, Proyectos, Libros, Fuentes y recursos, Citas, Glosario, Etiquetas.
- **Inicio:** accesos rápidos para crear nota, libro, recurso y cita; notas recientes; «Leyendo ahora» (o los últimos libros si no hay ninguno en lectura); proyectos recientes y citas guardadas. Sin métricas ni contadores.
- **Búsqueda:** en los libros busca en título, autores y descripción (el mismo texto que antes, con su nuevo nombre).

### Fuera de alcance

- Tipos o categorías de libro (no decididos).
- Buscar datos de un libro por su ISBN en servicios externos.
- Filtros de la búsqueda global (siguen para más adelante).

## Capabilities

### New Capabilities

_Ninguna._

### Modified Capabilities

- `libros`: campos definitivos, estado de lectura y portada.
- `fuentes-recursos`: tipos y datos definitivos, filtro por tipo.
- `navegacion`: orden del menú y contenido de Inicio.
- `busqueda`: el campo de los libros pasa a llamarse descripción.

## Impact

- **Base de datos:** migración que renombra `notas_bibliograficas` a `descripcion` y añade `isbn`, `portada_ruta`, `portada_url` y `estado_lectura` a `libros`, y `tipo` y `fecha_publicacion` a `recursos`; actualiza la función `buscar`.
- **Backend:** servicios y repositorios de libros (validación de ISBN, portada con limpieza) y recursos, Inicio.
- **Frontend:** formularios y páginas de libros y recursos, listas, menú lateral e Inicio.
- **Pruebas:** unitarias (ISBN, tipos), integración (validación y portada) y E2E (fichas, filtro, menú e Inicio); se ajustan las existentes que usaban «Notas bibliográficas» o el orden del menú.
