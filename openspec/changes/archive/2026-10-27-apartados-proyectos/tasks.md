# Tasks

## 1. Base de datos

- [x] 1.1 Crear la migración de `apartados` y de `apartado_nota`, `apartado_libro` y `apartado_recurso` (design D1 y D2) con RLS, y la función `mover_apartado` (D3). Aplicarla con `npm run db:push`, regenerar los tipos y verificar que la prueba de RLS existente pasa con las tablas nuevas.
- [x] 1.2 Añadir pruebas de integración:
  - no se puede asignar un elemento que no está en el proyecto;
  - desvincular del proyecto lo quita de sus apartados;
  - eliminar un apartado conserva los vínculos con el proyecto;
  - borrar el proyecto borra sus apartados;
  - `mover_apartado` intercambia posiciones y no hace nada en los extremos;
  - otro usuario no ve ni modifica apartados ajenos.

## 2. Backend

- [x] 2.1 Implementar `repositories/apartados.ts` y `services/apartados.ts` (D4):
  - crear, editar, eliminar, mover;
  - asignar, vinculando al proyecto si hace falta;
  - quitar;
  - resumen de eliminación;
  - organización del proyecto con «Sin apartado» y candidatos.
  Verificar con pruebas unitarias de validación y del texto del aviso, y con pruebas de integración del ejemplo «Estudiar filosofía» (una nota en dos apartados, un libro en «Sin apartado»).
- [x] 2.2 Añadir `controllers/apartados.ts` (acciones de servidor) y la lectura de la organización en `controllers/lecturas.ts`. Verificar que compila y que pasan las pruebas de tipos y lint.

## 3. Interfaz

- [x] 3.1 Crear el componente `ApartadosProyecto` (D5) e integrarlo en la página del proyecto. Verificar con E2E el ejemplo «Estudiar filosofía»:
  - crear tres apartados numerados;
  - subir «Ética»;
  - poner una nota en dos apartados;
  - añadir un libro que no estaba en el proyecto;
  - quitar de un apartado la deja en «Sin apartado»;
  - eliminar un apartado con aviso conserva el contenido en el proyecto.
- [x] 3.2 Verificar que las pruebas E2E existentes de proyectos siguen pasando sin cambios en «Elementos relacionados».

## 4. Integración

- [x] 4.1 Ejecutar la batería completa (unitarias, integración, E2E, lint y build) y comprobar que no hay acceso cruzado entre usuarios ni métricas de tiempo.

## Workflow follow-up

- Al archivar, actualizar el `## Purpose` de la spec oficial `proyectos` para mencionar los apartados.
- Registrar en `openspec/especificacion_app_estudio.md` que los apartados quedan implementados (§2.1 y §9.5).
