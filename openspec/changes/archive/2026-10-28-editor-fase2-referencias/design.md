# Design

## Context

- El editor (fase 1) usa Tiptap 3.32; el contenido se guarda como JSON, filtrado en el servidor por listas blancas (`services/contenidoNota.ts`), con guardado automático por versión (`guardarConVersion`).
- Los vínculos entre entidades usan tablas de enlace con claves foráneas compuestas `(id, usuario_id)` y RLS (`20261027170100_vinculos.sql`).
- La pantalla `Nota` es un Server Component dinámico: cada vez que se abre lee los datos actuales.

## Goals / Non-Goals

**Goals:**
- Referencias por identificador que siempre muestran el título actual, sin duplicar contenido.
- «Notas que la mencionan» coherente con el contenido guardado, sin pasos manuales.
- Formato ampliable a otros tipos sin migrar notas.

**Non-Goals:**
- Referencias a libros, recursos, citas, etc. (solo se prepara el formato).
- Actualizar títulos en tiempo real en otras pestañas abiertas: se ven al abrir la nota.
- Considerar las menciones como vínculos de la spec `relaciones`.

## Decisions

### D1. Nodo `referencia` en el contenido
Nodo en línea y atómico: `{ "type": "referencia", "attrs": { "tipo": "nota", "id": "<uuid>" } }`.
- No guarda el título: se resuelve al mostrar la nota.
- `tipo` permite añadir otros tipos después; el filtro solo admite `"nota"` por ahora.
- El filtro del servidor descarta la referencia si el tipo no está admitido o el `id` no es un UUID, y elimina cualquier otro atributo.
- `contenido_texto` no incluye el título referido (no está en el contenido); la búsqueda global no cambia.

**Alternativa descartada:** guardar el título junto al id. Se quedaría desactualizado, que es justo lo que pide evitar §3.2.

### D2. Títulos al mostrar
- Al abrir una nota, el servidor extrae los identificadores referenciados del contenido y consulta sus títulos (con la RLS del usuario: una nota ajena o eliminada no se encuentra).
- La pantalla pasa al editor un mapa `id → título`. El nodo se dibuja con un componente React (`ReactNodeViewRenderer`) que lee ese mapa a través de un contexto de React:
  - si el id está en el mapa: enlace a `/notas/<id>` con el título;
  - si no: «Nota eliminada», sin enlace y con estilo atenuado.
- Al insertar una referencia nueva, su título se añade al mapa en el cliente.

### D3. Insertar referencias
- Opción **«Referencia a una nota»** en el menú «/» y botón con el mismo nombre en la barra de formato (grupo de enlaces).
- Abre `CuadroReferencia`, un `<dialog>` como el de enlaces, con un campo «Buscar nota» y una lista (`role="listbox"`) de resultados manejable con flechas e Intro.
- Los títulos se piden al abrir el cuadro mediante una Server Action (`notasParaReferencia`) que devuelve `{id, titulo}` de las notas del usuario, ordenadas por última modificación; se filtran en el cliente sin distinguir tildes ni mayúsculas. Para un archivo personal el volumen es pequeño.
- La nota actual no se ofrece (una nota no se referencia a sí misma).

### D4. Tabla de menciones mantenida por la base de datos
Tabla `referencias_nota (origen_id, destino_id, usuario_id, creado_en)`:
- clave primaria `(origen_id, destino_id)`: una nota aparece una sola vez aunque la referencie varias veces;
- claves foráneas compuestas `(origen_id, usuario_id)` y `(destino_id, usuario_id)` a `notas (id, usuario_id)` con `on delete cascade`: solo notas del mismo usuario; al eliminar una nota desaparecen sus menciones;
- RLS con solo política de lectura del propietario. No hay políticas de escritura: **la tabla solo la escribe un trigger**.

Trigger `after insert or update of contenido on notas`, función `security definer` con `search_path` vacío:
1. borra las filas con `origen_id = new.id`;
2. inserta los ids distintos de `jsonpath $.** ? (@.type == "referencia" && @.attrs.tipo == "nota").attrs.id` que existen en `notas` con el **mismo `usuario_id`** que la nota guardada y no son la propia nota.

Así la lista se actualiza en la misma transacción del guardado (automático o no), sin depender del cliente. Al filtrar por `usuario_id`, un id ajeno nunca produce una fila.

**Alternativa descartada:** mantener la tabla desde el servicio tras guardar. Serían dos escrituras sin transacción y podrían desincronizarse.

### D5. Sección «Notas que la mencionan»
- En la pantalla `Nota`, debajo del editor y antes de las etiquetas: `<section aria-labelledby>` con el título «Notas que la mencionan» y una lista de enlaces con el título actual de cada nota de origen, de la modificada más recientemente a la más antigua.
- Vacía: «Ninguna nota menciona esta todavía.»
- Como la página es dinámica, se actualiza al volver a abrir la nota.

### D6. Capas
- `repositories/referencias.ts`: títulos por ids, menciones de una nota.
- `services/referencias.ts`: funciones puras (`esIdentificador`, `idsReferenciados`) compartidas con el filtro, y lecturas.
- `controllers/lecturas.ts` y `controllers/notas.ts` (`notasParaReferencia`).

## Risks / Trade-offs

- [El trigger recorre el JSON en cada guardado] → Coste pequeño para notas personales (máx. 500 000 caracteres) y solo cuando cambia `contenido`.
- [Título no actualizado en una pestaña ya abierta] → Aceptado: se ve al reabrir; no es edición colaborativa.
- [Referencia a nota eliminada] → Se mantiene en el contenido como «Nota eliminada» para no alterar el texto del usuario; puede borrarla él.

## Migration Plan

Migración nueva con la tabla, índice por `destino_id`, RLS y trigger. Ninguna nota existente contiene referencias, así que no hace falta rellenar datos. Para volver atrás se borran trigger y tabla; las referencias del contenido las descartaría el filtro anterior al guardar.

## Open Questions

- Ninguna bloqueante. El texto «Nota eliminada» puede ajustarse sin cambiar el comportamiento.
