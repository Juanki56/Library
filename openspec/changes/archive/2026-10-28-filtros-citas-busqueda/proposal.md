# Proposal

## Why

Con el archivo creciendo, encontrar algo concreto exige filtrar. Los filtros de la sección Citas y los filtros adicionales de la búsqueda global se dejaron para más adelante el 2026-10-27; el 2026-10-28 el usuario pidió incluirlos (§2.7 y §4.1 de `openspec/especificacion_app_estudio.md`).

## What Changes

- **Citas:** filtro por **tipo** (todas, citas, frases de autor, proverbios) y por **autor** (elegido de los autores de tus citas, o «Sin autor»), combinables. Se aplican al momento y se ven en la dirección, para volver a ellos.
- **Búsqueda global:** además del tipo, filtros por **autor**, **etiqueta**, **fecha de modificación** (desde / hasta), **proyecto** y **libro**:
  - se combinan entre sí y con el tipo;
  - con algún filtro se puede buscar **sin texto**;
  - los tipos sin ese dato (por ejemplo, notas al filtrar por autor) no aparecen;
  - un panel «Filtros» en la página de resultados, con «Quitar filtros».

## Capabilities

### New Capabilities

_Ninguna._

### Modified Capabilities

- `citas`: filtros de la sección.
- `busqueda`: «Filtro por tipo de contenido» admite los filtros adicionales y la búsqueda sin texto con filtros.

## Impact

- **Base de datos:** la función `buscar` acepta los filtros (migración nueva).
- **Backend:** servicios de búsqueda y de citas.
- **Frontend:** pantallas `Buscar` y `ListaCitas`.
- **Pruebas:** unitarias, integración (función `buscar` con filtros y aislamiento) y E2E, también en el servidor de desarrollo.
