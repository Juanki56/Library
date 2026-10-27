# Tasks

> Solo fase 1. Sin imágenes, vídeos, referencias ni tablas.

## 1. Contenido y compatibilidad

- [x] 1.1 Ampliar el filtro `contenidoNota.ts` (design D2) con `underline`, `highlight`, `horizontalRule`, `taskList` y `taskItem` (`checked`), y tratar `taskItem` como bloque en `textoPlano`. Verificar con pruebas unitarias:
  - se conservan los formatos nuevos y la casilla marcada;
  - se descartan `codeBlock`, `image`, el color de resaltado y atributos desconocidos;
  - **una nota del formato anterior sale idéntica del filtro.**
- [x] 1.2 Mover `esEnlaceWeb` a un módulo compartido sin acceso a datos, usado por el servidor y el cuadro de enlaces. Verificar que las pruebas existentes del filtro siguen pasando.

## 2. Guardado con versión (backend)

- [x] 2.1 Añadir `actualizarNotaSiVersion` al repositorio y adaptar `services/notas` para guardar con versión base (design D7). Debe devolver `ok` con la versión nueva, `conflicto` con la versión actual o «no existe». Verificar con pruebas de integración contra Supabase:
  - guardar con la versión correcta funciona y devuelve una versión nueva;
  - guardar con una versión antigua devuelve conflicto y **no modifica la nota**;
  - guardar encima con la versión actual funciona;
  - otro usuario no puede guardar.
- [x] 2.2 Crear la Server Action `guardarNotaAutomatico` (design D5) y verificar que devuelve los tres tipos de resultado, y el error de validación con un título vacío.

## 3. Guardado automático (frontend)

- [x] 3.1 Implementar el hook `useGuardadoAutomatico` (D5): espera de 1,5 s, una sola petición a la vez, guardado al perder el foco o al ocultar la pestaña, reintentos con espera creciente y evento `online`, y `beforeunload` con cambios pendientes. Verificar con pruebas unitarias de su lógica de estados usando temporizadores simulados:
  - nunca pasa a «Guardado» sin `ok`;
  - encadena los cambios que llegan durante un guardado;
  - reintenta tras un fallo de red;
  - no reintenta un error de validación.
- [x] 3.2 Implementar la copia local (D6) dentro de `try/catch`, más el aviso «Recuperar cambios no guardados / Descartar» al abrir una nota. Verificar con pruebas unitarias que se crea con cambios pendientes, que se borra al guardar y que la app funciona si `localStorage` no está disponible.
- [x] 3.3 Integrar el guardado automático en la página de la nota (D8): quitar el botón «Guardar», mostrar el indicador junto a las fechas y el aviso de conflicto en línea. Verificar con E2E:
  - escribir y recargar conserva lo escrito, y el indicador pasa por «Guardando…» y «Guardado»;
  - navegar a otra sección justo después de escribir conserva los cambios;
  - con la red cortada (simulación de Playwright) aparece «Sin conexión», y al restaurarla se guarda;
  - un fallo del servidor muestra el error con «Reintentar» y no muestra «Guardado»;
  - **conflicto entre dos pestañas:** la segunda no sobrescribe y avisa; «Cargar la versión más reciente» muestra la otra versión y «Guardar mis cambios encima» guarda la propia;
  - recuperar la copia local tras cerrar sin conexión.

## 4. Formatos y menús

- [x] 4.1 Añadir subrayado, resaltado, separadores y listas de tareas al editor (D1) y reorganizar la barra superior en grupos. Verificar con E2E que se aplican los cuatro formatos, que marcar una tarea se guarda y que todo se conserva al recargar.
- [x] 4.2 Añadir el menú al seleccionar texto (D3). Verificar con E2E que aparece al seleccionar, que aplica el resaltado, que marca los formatos activos y que no se pierde la primera tecla tras usarlo.
- [x] 4.3 Añadir el menú «/» (D3). Verificar con E2E que «/tar» + Intro crea una lista de tareas y elimina el texto «/tar», que se maneja con las flechas y que Escape cierra el menú dejando «/» como texto.
- [x] 4.4 Añadir el cuadro de enlaces (D4), quitar `window.prompt` y el atajo Ctrl+K. Verificar con E2E que añade, edita y quita enlaces, y que rechaza `javascript:` con su explicación.

## 5. Integración

- [x] 5.1 Comprobar la compatibilidad con notas existentes: abrir una nota creada con el formato anterior (subtítulos, listas, cita y enlace), editarla y verificar con E2E que se ve igual y que se guarda sin perder nada.
- [x] 5.2 Actualizar las pruebas E2E existentes que usaban el botón «Guardar» de la nota y ejecutar la batería completa (unitarias, integración, E2E, lint y build).

## Workflow follow-up

- Revisar y aprobar este cambio antes de `/opsx:apply`.
- Al archivar, actualizar el `## Purpose` de la spec `editor-notas` y marcar la fase 1 como implementada en `openspec/especificacion_app_estudio.md` (§3.2).
