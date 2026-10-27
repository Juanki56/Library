# Proposal

## Why

El editor de notas funciona, pero está lejos de la experiencia tipo Word o Notion que se acordó (§3 de `openspec/especificacion_app_estudio.md`):
- Solo hay una barra fija con 8 botones.
- Los enlaces se piden con una ventana del navegador.
- Faltan formatos básicos.
- **Si el usuario olvida pulsar «Guardar», pierde lo escrito.**

Esta fase 1, acordada el 2026-10-27 (§3.2), mejora la escritura diaria y sienta la base de las fases siguientes (referencias, imágenes y vídeos, organización).

## What Changes

- **Guardado automático:**
  - Título y contenido se guardan solos poco después de dejar de escribir, sin botón «Guardar».
  - Un indicador muestra «Guardando…», «Guardado» o un mensaje de error con opción de reintentar.
  - No se pierden cambios al navegar a otra página, cerrar la pestaña o perder la conexión: se reintenta y se conserva una copia local hasta guardar.
  - **No se sobrescriben cambios más recientes:** si la nota cambió en otro sitio (otra pestaña u otro dispositivo), se avisa en lugar de pisarla.
- **Menú al seleccionar texto:** negrita, cursiva, subrayado, resaltado y enlace junto a la selección.
- **Menú «/»:** al escribir «/» al principio de un bloque aparece una lista para insertar subtítulo, subtítulo menor, lista, lista numerada, lista de tareas, cita y separador.
- **Cuadro propio de enlaces:** añadir, editar y quitar enlaces sin ventanas del navegador. Solo enlaces web (http y https), como hasta ahora.
- **Formatos nuevos:** subrayado, resaltado, separadores y listas de tareas (con casillas que se pueden marcar).
- **Compatibilidad:** las notas existentes se abren, se editan y se guardan sin cambios ni pérdidas.

### Fuera de alcance (fases siguientes)

- Referencias a otras notas y «Notas que la mencionan» (fase 2).
- Imágenes y vídeos (fase 3).
- Mover bloques, índice de la nota y tablas (fase 4).
- Bloques de código (descartados por ahora).

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `editor-notas`:
  - El alcance del editor pasa a incluir subrayado, resaltado, separadores y listas de tareas.
  - Se añaden el guardado automático (indicador, sin pérdida de cambios y sin sobrescribir cambios más recientes), el menú al seleccionar, el menú «/» y el cuadro de enlaces.
  - La lista de «funciones exploradas» se sustituye por las fases acordadas.

## Impact

- **Frontend:** `EditorNota.tsx` y `FormularioNota.tsx` se amplían (menús, cuadro de enlaces y guardado automático); la página de la nota pierde el botón «Guardar».
- **Backend:** `services/notas.ts` y `repositories/notas.ts` guardan con comprobación de versión (la fecha de modificación) para detectar cambios más recientes, y `services/contenidoNota.ts` admite los formatos nuevos en su filtro de seguridad.
- **Dependencias:** extensiones de Tiptap 3 para resaltado y listas de tareas, más la utilidad de sugerencias para el menú «/». Son de la misma familia y versión que ya usa el proyecto.
- **Base de datos:** sin cambios. El contenido sigue siendo JSON y las notas existentes siguen siendo válidas.
