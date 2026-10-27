# Design

## Context

- **Proyectos y vínculos ya existen:** `proyectos` y las tablas `nota_proyecto`, `libro_proyecto` y `recurso_proyecto`, con clave primaria `(elemento_id, proyecto_id)`, claves foráneas compuestas por usuario y RLS (D3 y D4 del cambio archivado).
- **La página del proyecto** (`src/frontend/pantallas/Proyecto.tsx`) muestra el formulario, «Elementos relacionados» (vincular y desvincular) y el botón de eliminar.
- **Motivación:** ver `proposal.md`. **Requisitos:** las specs de este cambio.

## Goals / Non-Goals

**Goals:**
- Que la base de datos garantice que un elemento solo puede estar en un apartado si está vinculado al proyecto, y que al desvincularlo salga de sus apartados.
- Reordenar de forma atómica, sin huecos ni posiciones repetidas visibles.
- Reutilizar los componentes existentes: `ConfirmarEliminacion`, `enviarSinVaciar`, estilos editoriales y `catalogo.ts`.

**Non-Goals:**
- Orden manual dentro de un apartado, apartados anidados y mover apartados entre proyectos (ver la propuesta).

## Decisions

### D1. Tabla `apartados`
Columnas:
- `id`, `usuario_id` (default `auth.uid()`)
- `proyecto_id`
- `titulo` (no vacío)
- `descripcion` (opcional)
- `posicion` (`integer not null`)
- `creado_en`, `actualizado_en` (con el trigger existente)

Restricciones:
- `unique (id, proyecto_id, usuario_id)`, como destino de las claves foráneas.
- `foreign key (proyecto_id, usuario_id) references proyectos(id, usuario_id) on delete cascade`: al borrar el proyecto se borran sus apartados.
- RLS por `usuario_id`.

La `posicion` no es única en la base de datos, para permitir el intercambio dentro de una transacción. Se ordena por `posicion, creado_en`.

### D2. Asignaciones atadas al vínculo con el proyecto
Tablas `apartado_nota`, `apartado_libro` y `apartado_recurso`. Ejemplo con `apartado_nota`:
- Columnas: `apartado_id`, `nota_id`, `proyecto_id`, `usuario_id` (default `auth.uid()`) y `creado_en`.
- `primary key (apartado_id, nota_id)`: un elemento no se repite en el mismo apartado.
- `foreign key (apartado_id, proyecto_id, usuario_id) references apartados(id, proyecto_id, usuario_id) on delete cascade`: eliminar el apartado elimina solo sus asignaciones.
- `foreign key (nota_id, proyecto_id) references nota_proyecto(nota_id, proyecto_id) on delete cascade`: **solo se puede asignar lo que está en el proyecto**, y desvincular del proyecto saca el elemento de sus apartados (spec `relaciones`).
- RLS con `select`, `insert` y `delete`, sin `update`.

**Por qué:** las garantías de las specs quedan en la base de datos y no dependen del código.

**Alternativa:** una sola tabla genérica, descartada por la misma razón que en el cambio anterior: pierde las claves foráneas reales.

### D3. Reordenar con una función atómica
`public.mover_apartado(id uuid, direccion text)` es `security invoker` con `direccion` igual a `subir` o `bajar`. Intercambia la `posicion` con el vecino del mismo proyecto en una sola sentencia. Si no hay vecino (es el primero o el último), no hace nada.

Al crear un apartado, `posicion = coalesce(max(posicion), 0) + 1` dentro del proyecto. La numeración visible (1, 2, 3…) se calcula por su orden en la lista, así que borrar un apartado no deja huecos en los números.

### D4. Servicio
`services/apartados.ts`:
- **`crear`**, **`editar`** y **`eliminar`**: validan el título (obligatorio, ≤200 caracteres) y la descripción (≤1000).
- **`mover`.**
- **`asignar(proyecto, apartado, elemento)`:** si el elemento aún no está en el proyecto, primero lo vincula con `services/vinculos.vincular`, que ya es idempotente, y después inserta la asignación con `upsert ignoreDuplicates`.
- **`quitar`.**
- **`resumenEliminacion`:** cuenta las asignaciones del apartado para el aviso. El texto es «Los N elementos de este apartado seguirán en el proyecto.».
- **`organizacion(proyecto)`:** devuelve los apartados en orden con su contenido (notas, libros y recursos, por tipo y alfabéticamente), el grupo «Sin apartado» (elementos del proyecto sin ninguna asignación) y, para cada apartado, los candidatos que se le pueden añadir (todos los elementos del usuario que no están en ese apartado).

Los tipos asignables se definen con un catálogo `ASIGNABLES` (nota, libro y recurso → tabla de asignación) apoyado en `ENTIDADES` de `catalogo.ts`.

### D5. Interfaz
Nuevo componente `ApartadosProyecto` en `Proyecto.tsx`, entre el formulario y «Elementos relacionados».

- **Encabezado:** «Apartados».
- **Cada apartado:**
  - número y título en Cormorant («1. Filosofía antigua»), con la descripción en cursiva;
  - botones de subir y bajar (deshabilitados en los extremos), editar (en línea) y eliminar (con `ConfirmarEliminacion` y el aviso de D4);
  - su contenido, con el tipo en versalitas y «Quitar»;
  - un selector «Añadir al apartado…» con grupos por tipo (`<optgroup>`).
- **Grupo «Sin apartado»:** al final, con su contenido.
- **Formulario «Nuevo apartado»:** título y descripción.

Usa los estilos editoriales y tokens existentes, sin colores nuevos.

## Risks / Trade-offs

- [Muchos candidatos en el selector] → Para un archivo personal es aceptable. Si crece, se sustituye por una búsqueda dentro del selector.
- [Dos pestañas reordenando a la vez] → La función atómica evita los estados inválidos; como mucho, dos apartados pueden quedar con la misma posición, y se desempatan por `creado_en`.
- [La página del proyecto crece] → «Apartados» y «Elementos relacionados» conviven: el primero organiza y el segundo vincula. Se revisará con el uso.

## Migration Plan

Una migración nueva (tablas, RLS y función) más la regeneración de tipos. La prueba de RLS existente cubre las tablas nuevas. Para volver atrás, se aplica una migración que elimine las cuatro tablas y la función. Ninguna tabla existente cambia.

## Open Questions

Ninguna.
