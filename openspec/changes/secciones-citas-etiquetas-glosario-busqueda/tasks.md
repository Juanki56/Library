# Tasks

> No se toca el editor de notas. Lo de §9.3 del documento (etiquetas en citas y glosario, relaciones del glosario y filtros adicionales) queda fuera.

## 1. Base de datos

- [ ] 1.1 Crear la migración con la extensión `unaccent`, la función `normalizar` (design D1) y las tablas `citas` (D2), `etiquetas` con sus 4 tablas de asignación (D3) y `glosario` (D4), todas con RLS y políticas por usuario. Aplicarla con `npm run db:push`, regenerar los tipos y verificar que la prueba de RLS existente sigue pasando con las tablas nuevas.
- [ ] 1.2 Crear la migración de la función `buscar` (design D5) con `security invoker`. Verificar con pruebas de integración:
  - encuentra por título, por autor y por prefijo, sin tildes ni mayúsculas;
  - no encuentra por campos excluidos, como la editorial;
  - no devuelve contenido de otro usuario;
  - cada elemento aparece una sola vez.
- [ ] 1.3 Añadir pruebas de integración de las restricciones:
  - etiqueta y término únicos sin distinguir mayúsculas ni tildes;
  - una cita no puede tener libro y recurso a la vez, ni enlazar con un libro de otro usuario;
  - al borrar un libro, sus citas siguen existiendo sin enlace;
  - al borrar una etiqueta se borran sus asignaciones pero no los elementos.

## 2. Citas

- [ ] 2.1 Implementar repository, service y controllers de citas:
  - crear sin asociación, con texto obligatorio y tipo por defecto «cita»;
  - editar, eliminar y listar las más recientes primero;
  - enlace opcional a un libro o a un recurso.
  Verificar con pruebas unitarias de validación y de integración.
- [ ] 2.2 Crear las pantallas `/citas`, `/citas/nueva` y `/citas/[id]`, con selector de tipo, autor, fuente y enlace opcional a un libro o recurso, y «Sin autor» o «Sin origen» cuando faltan. Verificar con E2E:
  - guardar un proverbio sin autor ni origen;
  - guardar con tipo por defecto;
  - editar;
  - eliminar con confirmación.
- [ ] 2.3 Mostrar las citas enlazadas en las fichas de libro y de recurso, y las 3 más recientes en el bloque «Citas guardadas» de Inicio. Verificar con E2E que una cita editada desde Citas se ve cambiada en su libro y en Inicio (spec `relaciones`, «Citas visibles en su libro o recurso»).
- [ ] 2.4 Ampliar `services/eliminacion.ts` para que el aviso al eliminar un libro o recurso indique cuántas citas perderán su enlace. Verificar con pruebas unitarias del texto y con E2E que, tras eliminar el libro, las citas siguen existiendo.

## 3. Etiquetas

- [ ] 3.1 Implementar repository, service y controllers de etiquetas:
  - asignar una existente o crear al asignar, con reutilización normalizada y sin error si ya estaba asignada;
  - quitar, crear, renombrar (rechazando un nombre que ya existe) y eliminar;
  - contar los elementos para el aviso.
  Verificar con pruebas de integración.
- [ ] 3.2 Añadir el bloque `EtiquetasElemento` a las fichas de nota, libro, proyecto y recurso. Verificar con E2E:
  - asignar «Filosofía» y después «filosofia» al mismo u otro elemento reutiliza la misma etiqueta;
  - quitar no borra el elemento.
- [ ] 3.3 Crear las pantallas `/etiquetas` (lista, crear, renombrar y eliminar con advertencia) y `/etiquetas/[id]` (elementos agrupados por tipo, ordenados alfabéticamente y con filtro por tipo). Verificar con E2E:
  - el ejemplo «Filosofía» con los cuatro tipos;
  - el filtro «Libros»;
  - eliminar con advertencia conserva los elementos.

## 4. Glosario

- [ ] 4.1 Implementar repository, service y controllers del glosario:
  - término y definición obligatorios;
  - término duplicado que devuelve la entrada existente;
  - editar, eliminar y listar en orden alfabético.
  Verificar con pruebas de integración.
- [ ] 4.2 Crear las pantallas `/glosario` (agrupado por letra con acceso por letra), `/glosario/nuevo` y `/glosario/[id]`. Verificar con E2E:
  - guardar sin ejemplo;
  - un término duplicado ofrece abrir el existente;
  - ir a una letra;
  - editar la definición.

## 5. Búsqueda global

- [ ] 5.1 Implementar el service y el controller de búsqueda:
  - limpieza de la consulta;
  - llamada a `buscar`;
  - relaciones de las notas encontradas;
  - fragmento con marcadores convertido en elementos sin HTML.
  Verificar con pruebas unitarias de la limpieza y del troceado del fragmento.
- [ ] 5.2 Crear la página `/buscar` (resultados con tipo, título, fragmento y relaciones de las notas, filtro por tipo) y activar el buscador de la cabecera. Verificar con E2E:
  - buscar «Marx» desde la ficha de un libro encuentra el libro y la cita;
  - el filtro «Citas» deja solo citas;
  - cada resultado abre su página;
  - una nota en dos proyectos aparece una vez con sus relaciones.

## 6. Navegación e integración

- [ ] 6.1 Marcar Etiquetas, Glosario y Citas como disponibles en `navegacion.ts`. Verificar con la prueba E2E del menú actualizada: las ocho áreas son enlaces y la activa queda marcada.
- [ ] 6.2 Ejecutar la batería completa (unitarias, integración, E2E, lint y build) y comprobar que no aparece ninguna métrica de tiempo y que no hay acceso cruzado entre usuarios en las tablas nuevas.

## Workflow follow-up

- Al archivar, actualizar el `## Purpose` de las specs oficiales `citas`, `etiquetas`, `glosario`, `busqueda` y `navegacion`, que todavía describen la etapa de propuesta.
- Registrar en `openspec/especificacion_app_estudio.md` que las cuatro funciones quedan implementadas (§9.5).
