# Proposal

## Why

El menú ya muestra Etiquetas, Glosario y Citas como «en preparación», y la búsqueda de la cabecera está desactivada. Las cuatro funciones ya tienen sus decisiones acordadas en `openspec/especificacion_app_estudio.md` (§2.5–§2.7, §4, §6, §9.1–§9.3, confirmadas el 2026-10-27). Este cambio las convierte en specs verificables y las construye, de modo que las ocho áreas del menú queden operativas.

## What Changes

- **Citas** (nueva sección):
  - Se guardan sin asociación obligatoria, con texto, tipo (cita, frase de autor o proverbio; «cita» por defecto), autor opcional y fuente u origen en texto libre.
  - Se pueden enlazar de forma opcional a un libro o a un recurso. En ese caso aparecen también en la página de ese libro o recurso, sin duplicarse.
  - Se pueden editar y eliminar, y la lista muestra primero las más recientes.
  - Cuando no hay autor u origen se muestra «Sin autor» o «Sin origen».
- **Etiquetas** (nueva sección):
  - Son compartidas entre notas, libros, proyectos y recursos, y cada una se crea una sola vez, sin distinguir mayúsculas, tildes ni espacios sobrantes.
  - Se pueden asignar o crear desde cada elemento, y quitar.
  - Cada etiqueta tiene su página, con los elementos agrupados por tipo y un filtro por tipo.
  - Se pueden renombrar y eliminar. Al eliminar una etiqueta aparece una advertencia y los elementos no se borran.
- **Glosario** (nueva sección):
  - Cada entrada tiene término y definición obligatorios, y un ejemplo y una información adicional opcionales.
  - No hay términos duplicados.
  - Las entradas se pueden editar y eliminar.
  - El glosario se ordena alfabéticamente y tiene acceso por letra.
- **Búsqueda global**:
  - Se accede desde el cuadro de la cabecera, que pasa a estar activo.
  - Abarca proyectos, libros, notas, recursos, citas y glosario, con los campos acordados por tipo (incluidos los autores).
  - Ignora mayúsculas y tildes, encuentra palabras por su inicio y ordena por relevancia.
  - Muestra un fragmento con la coincidencia y permite filtrar por tipo.
  - Cada elemento aparece una sola vez en los resultados.
- **Menú**: Etiquetas, Glosario y Citas dejan de estar «en preparación» y pasan a ser enlaces.
- **Inicio**: el bloque «Citas guardadas» muestra las citas más recientes.
- **Eliminación con aviso**: al eliminar un libro o un recurso, el aviso indica también cuántas citas perderán su enlace (las citas no se borran).

### Fuera de alcance

Se deja para más adelante, según la §9.3 del documento:
- Etiquetas en citas y en términos del glosario.
- Relaciones del glosario con otros elementos.
- Filtros propios en Citas.
- Filtros de búsqueda por autor, etiqueta, fecha, proyecto o libro.

El **editor de notas** no se modifica en este cambio, porque su alcance técnico sigue pendiente (§3).

## Capabilities

### New Capabilities

Ninguna: todas las capacidades ya existen en `openspec/specs/`.

### Modified Capabilities

- `citas`: se sustituyen las propuestas («ubicación sin decidir») por los requisitos acordados de la sección Citas.
- `etiquetas`: se sustituyen las propuestas por los requisitos acordados de asignación, consulta, filtro y administración.
- `glosario`: se sustituyen las propuestas (incluidas las relaciones, que se dejan para más adelante) por los requisitos acordados de las entradas.
- `busqueda`: se sustituye «búsqueda avanzada no aprobada» por la búsqueda global acordada.
- `navegacion`: el menú pasa a tener ocho áreas con acceso real, el buscador va en la cabecera e Inicio incluye notas, libros y citas recientes.
- `relaciones`: se añaden el enlace opcional de una cita con un libro o recurso y el aviso de citas afectadas al eliminar.

## Impact

- **Base de datos (Supabase):** tablas nuevas `citas`, `etiquetas` (con 4 tablas de asignación) y `glosario`, todas con RLS. También una función de búsqueda que respeta RLS.
- **Backend:** repositories, services y controllers nuevos para citas, etiquetas, glosario y búsqueda. Se amplían `services/eliminacion.ts` y `services/inicio.ts`.
- **Frontend:**
  - Pantallas nuevas en `/citas`, `/etiquetas`, `/glosario` y `/buscar`.
  - Un bloque de etiquetas en las fichas de notas, libros, proyectos y recursos.
  - Citas enlazadas en las fichas de libros y recursos.
  - Buscador activo y menú completo.
- Sin cambios en el editor de notas ni en las funciones ya implementadas.
