# Design

## Context

- La app ya funciona con la arquitectura del cambio archivado `2026-10-27-especificacion-inicial-app-estudio`:
  - Next.js por capas (D9): `app → frontend → controllers → services → repositories`.
  - Supabase con RLS en todas las tablas y una prueba que falla si alguna tabla queda sin RLS.
  - Vínculos en tablas de enlace con clave compuesta y claves foráneas compuestas `(id, usuario_id)` (D3).
- El menú y la cabecera ya existen. Etiquetas, Glosario y Citas aparecen sin enlace y el buscador está desactivado.
- Motivación y alcance: ver `proposal.md`. Requisitos: ver las specs de este cambio.

## Goals / Non-Goals

**Goals:**
- Reutilizar los patrones existentes: claves compuestas por usuario, RLS, la capa `repositories` como única que consulta Supabase, `enviarSinVaciar`, `ConfirmarEliminacion` y los estilos editoriales.
- Garantizar en la base de datos la unicidad normalizada de etiquetas y términos, y el «un solo enlace» de cada cita.
- Hacer la búsqueda en la base de datos con una sola consulta que respeta RLS.

**Non-Goals:**
- No se cambia el editor de notas.
- No se implementa nada de §9.3: etiquetas en citas o glosario, relaciones del glosario ni filtros adicionales.
- No se crean índices de búsqueda de texto completo. Para un archivo personal basta con calcular sobre la marcha; si crece, se añaden después sin cambiar el comportamiento.

## Decisions

### D1. Normalización con una función inmutable en la base de datos
Se crea `public.normalizar(texto) returns text immutable`: `lower(unaccent(regexp_replace(btrim(texto), '\s+', ' ', 'g')))`, con la extensión `unaccent` llamada con su diccionario explícito para que la función pueda ser `immutable`.

`etiquetas.nombre_normalizado` y `glosario.termino_normalizado` son **columnas generadas** a partir de ella, con `unique (usuario_id, …_normalizado)`.

**Por qué:** la base de datos garantiza «Filosofía» = «filosofia» aunque el código fallara, y la misma regla sirve para la búsqueda.

**Alternativa:** normalizar solo en TypeScript, descartada porque un fallo en una ruta permitiría duplicados.

### D2. Citas: una tabla con enlace opcional y exclusivo
Tabla `citas`:

| Columna | Tipo |
|---|---|
| `id` | |
| `usuario_id` | |
| `texto` | not null, no vacío |
| `tipo` | `text`, check `cita` · `frase` · `proverbio`, default `cita` |
| `autor` | null |
| `fuente` | null |
| `libro_id` | null |
| `recurso_id` | null |
| `creado_en`, `actualizado_en` | con el trigger existente |

Reglas:
- `check (libro_id is null or recurso_id is null)`: como mucho un enlace.
- Claves foráneas compuestas `(libro_id, usuario_id) → libros(id, usuario_id) on delete set null (libro_id)`, y lo mismo para `recurso_id`. Usa la sintaxis de PostgreSQL 15 que anula solo esa columna.

**Por qué:** el enlace es único y opcional (E1), así que no hace falta una tabla de enlace. Con `set null` la cita sobrevive al borrar el libro (spec `relaciones`), y la clave compuesta impide enlazar con un libro de otro usuario.

**Alternativa:** tablas `cita_libro` y `cita_recurso`, descartada porque permitirían varios enlaces y complican la regla de exclusividad.

Las citas **no** entran en `services/catalogo.ts`, porque no participan en los vínculos genéricos entre las cuatro entidades.

### D3. Etiquetas: tabla propia y una tabla de asignación por tipo
- **`etiquetas`:** `id`, `usuario_id`, `nombre` (no vacío), `nombre_normalizado` (generada, D1), `creado_en`, `actualizado_en`, `unique (id, usuario_id)`.
- **Asignaciones:** `etiqueta_nota`, `etiqueta_libro`, `etiqueta_proyecto` y `etiqueta_recurso`. Usan el mismo patrón que los vínculos de D3 del cambio anterior: clave primaria compuesta, claves foráneas compuestas por usuario y `on delete cascade` en ambos lados. Políticas `select`, `insert` y `delete`, sin `update`.

En el código, un catálogo `TIPOS_ETIQUETABLES` (entidad → tabla de asignación) reutiliza `ENTIDADES` de `catalogo.ts`.

**Asignar con creación (spec «Crear al asignar»):** el servicio busca por `nombre_normalizado`. Si no existe, la inserta; si la inserción choca con la restricción `23505` porque se creó a la vez, la vuelve a leer. Después inserta la asignación con `upsert ignoreDuplicates`, de modo que asignar dos veces no da error.

**Eliminar con advertencia:** cuenta las asignaciones de las cuatro tablas para el aviso, con el mismo `ConfirmarEliminacion`. El texto es «Se quitará de N elementos. Esos elementos no se borrarán.».

### D4. Glosario: una tabla
`glosario`:

| Columna | Restricción |
|---|---|
| `id`, `usuario_id` | |
| `termino` | no vacío |
| `termino_normalizado` | generada, única por usuario |
| `definicion` | not null, no vacía |
| `ejemplo` | null |
| `informacion_adicional` | null |
| `creado_en`, `actualizado_en` | |

**Duplicado (spec «Término duplicado»):** al recibir `23505`, el servicio busca la entrada existente por el término normalizado y devuelve su `id`. La pantalla muestra «Ese término ya existe» con un enlace para abrirla.

**Consulta alfabética:** se ordena por `termino_normalizado` y se agrupa por la primera letra normalizada (A–Z, más «#» para lo que no empieza por letra). Las letras con términos son enlaces a anclas.

### D5. Búsqueda: una función SQL con `security invoker`
`public.buscar(consulta text, tipo text default null) returns table(tipo, id, titulo, fragmento, rango)` es `language sql stable security invoker`, así que **se aplica la RLS del usuario**.

- **Consulta:** se normaliza con D1, se parte en palabras y cada palabra se convierte en un prefijo `palabra:*` unido con `&`. Se construye con `to_tsquery('simple', …)`. Los caracteres especiales se eliminan antes en el servicio, con una lista blanca de letras y dígitos.
- **Documento por tipo:** `to_tsvector('simple', normalizar(concat_ws(' ', campos…)))`, con exactamente los campos de la spec `busqueda`:
  - Proyecto: nombre y descripción.
  - Nota: título y `contenido_texto`.
  - Libro: título, autores y notas bibliográficas.
  - Recurso: título, autor y descripción.
  - Cita: texto, autor y fuente.
  - Término: término, definición, ejemplo e información adicional.
  - Se usa la configuración `simple` (sin raíces del español) para que «materia» coincida por prefijo de forma predecible.
- **Relevancia:** `ts_rank` con más peso para el título (`setweight` A al título y B al resto).
- **Fragmento:** `ts_headline` sobre el texto original no normalizado, con `StartSel=«` y `StopSel=»`. El frontend lo muestra como texto plano, sin HTML, así que no hay riesgo de inyección. Las marcas «» se sustituyen por `<mark>` en React partiendo la cadena, nunca con `dangerouslySetInnerHTML`.
- **Título de las citas:** las citas no tienen título, así que se usa un extracto de 80 caracteres de su texto.
- **Unicidad:** `union all` de una fila por elemento, así que cada elemento aparece una vez. Se limita a 50 resultados por consulta.
- **Relaciones en el resultado** (spec existente «Resultados sin duplicados»): las notas encontradas muestran sus proyectos y libros. Se obtienen con una consulta adicional en el servicio para los ids de nota del resultado, reutilizando las tablas de vínculo.

**Alternativa:** `ILIKE` con `unaccent` desde el cliente, descartada porque no da relevancia ni fragmentos y obliga a seis consultas.

### D6. Interfaz: rutas y piezas
- **Rutas nuevas:**
  - `/citas`, `/citas/nueva`, `/citas/[id]`
  - `/etiquetas`, `/etiquetas/[id]?tipo=…`
  - `/glosario`, `/glosario/nuevo`, `/glosario/[id]`
  - `/buscar?q=…&tipo=…`
- **Cabecera:** el buscador pasa a ser un `<form method="get" action="/buscar">` real; se quita el estado «próximamente».
- **Fichas:** un componente nuevo, `EtiquetasElemento`, se añade a las fichas de nota, libro, proyecto y recurso. Muestra las etiquetas asignadas, cada una con «Quitar», y un campo con `<datalist>` de las etiquetas existentes para asignar o crear.
- **Libros y recursos:** las fichas añaden un bloque «Citas» con sus citas enlazadas.
- **Inicio:** el bloque «Citas guardadas» muestra las 3 más recientes.
- **Menú:** `navegacion.ts` marca Etiquetas, Glosario y Citas como `disponible: true`.
- **Estilos:** todo usa los tokens y estilos editoriales existentes; no hay colores nuevos.

## Risks / Trade-offs

- [`unaccent` no es `immutable` por defecto] → La función `normalizar` llama a `unaccent('public.unaccent', …)` con el diccionario explícito y se declara `immutable`. Es la técnica documentada y necesaria para las columnas generadas.
- [Búsqueda sin índice] → Basta para un archivo personal. Si se vuelve lenta, se añaden columnas `tsvector` generadas e índices GIN sin cambiar la función ni la spec.
- [Inyección en `to_tsquery`] → El servicio solo deja letras, dígitos y espacios antes de llamar a la función, y la función vuelve a filtrar con `regexp_replace`.
- [Fragmento con HTML] → Se usan marcadores de texto («») y React los renderiza como elementos; nunca se inserta HTML.
- [Carrera al crear una etiqueta desde dos pestañas] → La restricción única más la relectura ante `23505` dejan una sola etiqueta.

## Migration Plan

Tres migraciones nuevas: `…_citas_etiquetas_glosario.sql` (tablas, normalización y RLS), `…_busqueda.sql` (función `buscar`) y la regeneración de tipos (`npm run db:tipos`).

La prueba de RLS existente cubre automáticamente las tablas nuevas. Para volver atrás, se aplica una migración que elimine las tablas y la función. Ninguna tabla existente cambia.

## Open Questions

Ninguna que afecte a las specs o a las tareas.
