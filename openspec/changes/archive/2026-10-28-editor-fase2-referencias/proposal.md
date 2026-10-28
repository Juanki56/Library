# Proposal

## Why

Las notas de un archivo de conocimiento se apoyan unas en otras, pero hoy la única forma de relacionarlas es copiar texto o un enlace web, que se queda desactualizado si la otra nota cambia de título. La fase 2 del editor, acordada el 2026-10-27 (§3.2 de `openspec/especificacion_app_estudio.md`), añade referencias entre notas sin duplicar contenido y muestra en cada nota qué otras la mencionan.

## What Changes

- **Referencias a otras notas dentro del texto:**
  - Se insertan desde el menú «/» («Referencia a una nota») o desde la barra de formato, eligiendo la nota en un cuadro de búsqueda por título (sin distinguir tildes ni mayúsculas).
  - La referencia guarda solo el **identificador** de la nota y muestra siempre su **título actual**. Pulsarla abre la nota referida.
  - Si la nota referida se elimina, la referencia queda como «Nota eliminada», sin enlace, y el resto del contenido no cambia.
  - El formato guardado permite ampliar las referencias a otros tipos de elementos más adelante (libros, citas…), sin convertir las notas.
- **«Notas que la mencionan»:** cada nota muestra la lista de las notas que la referencian, con su título actual y enlace a cada una.
- **Seguridad:** solo se pueden referenciar notas propias; el servidor descarta referencias mal formadas y la lista de menciones nunca incluye notas de otros usuarios.

### Fuera de alcance

- Referencias a libros, recursos, citas u otros tipos (el formato lo permite, pero no se ofrecen).
- Imágenes y vídeos (fase 3); mover bloques, índice de la nota y tablas (fase 4).
- Que las referencias cuenten como «Elementos relacionados» o vínculos de la spec `relaciones`: son menciones en el texto, no vínculos.

## Capabilities

### New Capabilities

_Ninguna._

### Modified Capabilities

- `editor-notas`: añade referencias a notas y «Notas que la mencionan»; la fase 2 deja de figurar como futura.

## Impact

- **Base de datos:** nueva tabla de menciones entre notas, mantenida automáticamente al guardar el contenido, con RLS y claves foráneas del mismo usuario. Nueva migración.
- **Backend:** filtro de contenido (`contenidoNota.ts`) admite el nodo de referencia; lecturas de títulos referenciados y de menciones.
- **Frontend:** `EditorNota` (nodo de referencia, cuadro de selección, opción en el menú «/» y en la barra), pantalla `Nota` (sección «Notas que la mencionan»).
- **Pruebas:** unitarias del filtro, integración de la tabla de menciones y RLS, E2E de insertar, mostrar título actualizado, navegar, menciones y nota eliminada.
