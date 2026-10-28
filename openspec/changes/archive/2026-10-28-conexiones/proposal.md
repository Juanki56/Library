# Proposal

## Why

Las relaciones de cada elemento se muestran hoy al final de la página en cuatro listas fijas, también vacías, con solo el título y un desplegable por tipo; lo conectado queda repartido entre «Elementos relacionados», «Notas que la mencionan», citas y etiquetas. El 2026-10-28 el usuario aceptó una propuesta para mostrarlo de forma más cómoda (§2.8 de `openspec/especificacion_app_estudio.md`).

## What Changes

- **Sección «Conexiones»** en las páginas de nota, libro, recurso y proyecto: columna lateral fija en pantallas anchas, debajo del contenido en pantallas estrechas.
- **Reúne** etiquetas, vínculos por tipo, «Notas que la mencionan» (en notas) y citas enlazadas (en libros y recursos).
- **Contexto de cada elemento:** extracto y fecha en notas; autores, editorial, año y estado en libros; tipo, autor y sitio en recursos; descripción en proyectos.
- **Solo grupos con contenido;** sin conexiones, una frase que invita a vincular.
- **«Vincular…»:** un buscador único en todos los tipos que se pueden vincular, sin distinguir tildes ni mayúsculas, con teclado. Sustituye a los desplegables por tipo.
- **Quitar vínculo** junto a cada elemento, sin borrarlo (como hasta ahora).
- **«Nueva nota vinculada»** en libros, recursos y proyectos: crea la nota y la vincula.

### Fuera de alcance

- Mapa o grafo de conexiones; conexiones indirectas.
- Cambios en los apartados de los proyectos (siguen organizando su contenido).

## Capabilities

### New Capabilities

_Ninguna._

### Modified Capabilities

- `relaciones`: forma visual de los elementos relacionados (deja de estar pendiente), vincular con buscador y crear nota vinculada.

## Impact

- **Sin cambios en la base de datos.**
- **Backend:** el servicio de relacionados devuelve el contexto de cada elemento; crear nota acepta un vínculo inicial.
- **Frontend:** componente `Conexiones` (sustituye a `ElementosRelacionados`, `NotasQueMencionan` y `CitasEnlazadas` en las páginas), cuadro «Vincular…», disposición en dos columnas de las páginas de detalle, formulario de nueva nota.
- **Pruebas:** se actualizan las E2E que usaban los desplegables y listas anteriores; nuevas E2E de Conexiones.
