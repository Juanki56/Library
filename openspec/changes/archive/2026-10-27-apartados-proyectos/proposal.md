# Proposal

## Why

Un proyecto grande, como «Estudiar filosofía», reúne muchas notas, libros y recursos en una sola lista, lo que hace difícil seguir un orden de estudio. El 2026-10-27 se acordó que un proyecto pueda **dividirse en apartados**: por ejemplo, Filosofía antigua, Filosofía moderna y Ética (§2.1 de `openspec/especificacion_app_estudio.md`). Este cambio resuelve la decisión pendiente «estructura de los proyectos».

## What Changes

- Un proyecto puede tener **apartados**:
  - Cada apartado tiene un título y una descripción breve opcional, y no contiene otros apartados.
  - Se pueden crear, editar y eliminar.
  - Se ordenan a mano con **subir y bajar** y se muestran **numerados** (1, 2, 3…).
- Las notas, libros y recursos del proyecto se pueden colocar en **uno o varios apartados** del mismo proyecto, **sin duplicarse**, y se pueden quitar de un apartado.
- Se puede añadir a un apartado un elemento que aún no estaba en el proyecto: queda vinculado al proyecto automáticamente.
- La página del proyecto muestra sus apartados en orden, con su contenido, y un grupo **«Sin apartado»** con lo que no está en ninguno.
- **Eliminar un apartado** no quita su contenido del proyecto. Antes avisa de cuántos elementos se verán afectados.
- **Desvincular** un elemento del proyecto lo quita también de los apartados de ese proyecto.

### Fuera de alcance

- Apartados dentro de apartados.
- Mover apartados de un proyecto a otro.
- Ordenar a mano los elementos dentro de un apartado: se muestran por tipo y alfabéticamente.
- Apartados en libros u otras entidades.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `proyectos`: la «Estructura detallada del proyecto» pasa de propuesta a acordada, con nombre, descripción y apartados. El contenido del proyecto se muestra organizado por apartados, y se añaden los requisitos de gestión, orden, asignación y eliminación de apartados.
- `relaciones`: «Desvincular sin eliminar» precisa que quitar un elemento de un proyecto lo quita también de sus apartados.

## Impact

- **Base de datos:** tablas nuevas `apartados`, `apartado_nota`, `apartado_libro` y `apartado_recurso`, con RLS. Hay una función para reordenar los apartados de forma atómica. Las tablas existentes no cambian.
- **Backend:** repository, service y controllers de apartados.
- **Frontend:** un bloque «Apartados» en la página del proyecto. Lo que ya existe en esa página («Elementos relacionados», formulario y eliminación) sigue igual.
- Este cambio es independiente del cambio pendiente `secciones-citas-etiquetas-glosario-busqueda`: modifica otros requisitos.
