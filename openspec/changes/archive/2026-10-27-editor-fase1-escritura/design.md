# Design

## Context

- **Editor actual** (`src/frontend/components/EditorNota.tsx`):
  - Tiptap 3.32 con `StarterKit`, que desactiva code, codeBlock, horizontalRule, strike y underline.
  - Barra fija de 8 botones.
  - El enlace se pide con `window.prompt`.
  - El JSON del documento va a un `<input type="hidden">`.
- **Guardado actual:**
  - `FormularioNota.tsx` envía título y contenido con un botón «Guardar» a la Server Action `guardarNota` (`controllers/notas.ts`).
  - Esta llama a `services/notas.guardarNota`, que valida, normaliza con `normalizarContenido` y actualiza con `repositories/notas.actualizarNota` sin comprobar versión.
- **Filtro de seguridad** (`services/contenidoNota.ts`): listas blancas `NODOS`, `MARCAS` y `NIVELES_TITULO`. Descarta todo lo demás y deriva `contenido_texto`.
- `notas.actualizado_en` lo mantiene un trigger (`tocar_actualizado_en`) en cada `UPDATE`.

## Goals / Non-Goals

**Goals:**
- Guardado automático fiable: nunca mostrar «Guardado» sin confirmación del servidor, no perder cambios y no pisar versiones más recientes.
- Formatos y menús nuevos sin romper las notas existentes ni el filtro de seguridad.
- Mantener las capas (D9): la lógica de versión en `services`, la consulta en `repositories` y el estado de guardado en el frontend.

**Non-Goals:**
- Edición colaborativa en tiempo real ni fusión automática de cambios: ante un conflicto se pregunta al usuario.
- Historial de versiones.
- Lo previsto para las fases 2 a 4.

## Decisions

### D1. Formatos nuevos con extensiones oficiales de Tiptap 3
- **Subrayado y separador:** se activan en `StarterKit` (`underline` y `horizontalRule`).
- **Resaltado:** `@tiptap/extension-highlight` 3.32.0, en un solo color sin variantes, que toma el color del token de resaltado.
- **Listas de tareas:** `TaskList` y `TaskItem` de `@tiptap/extension-list`, ya instalado, con `nested: true`.

Ventajas: misma familia y versión, sin dependencias ajenas, y JSON estándar (`underline`, `highlight`, `horizontalRule`, `taskList` y `taskItem` con el atributo `checked`).

### D2. Filtro de seguridad ampliado
`contenidoNota.ts` añade:
- nodos `horizontalRule`, `taskList` y `taskItem` (solo el atributo `checked: boolean`);
- marcas `underline` y `highlight` (sin atributos de color).

`textoPlano` trata `taskItem` como bloque, para que su texto entre en la búsqueda. Se mantiene la regla de que un documento vacío tiene un párrafo. Las notas antiguas solo contienen nodos que siguen permitidos, así que **se guardan idénticas**, cosa que se comprueba con una prueba que pasa una nota antigua por el filtro.

### D3. Menú al seleccionar y menú «/»
- **Al seleccionar:** `BubbleMenu` de `@tiptap/react` (ya disponible a través de `@tiptap/extension-bubble-menu`), con botones de negrita, cursiva, subrayado, resaltado y enlace. Usan `aria-pressed` y `onMouseDown` con `preventDefault`, el patrón actual que evita perder el foco.
- **«/»:** extensión propia `ComandosBarra`, construida con `@tiptap/suggestion` 3.32.0. Se activa con `/` al principio de un bloque y filtra sin distinguir tildes reutilizando `normalizar`. Se maneja con las flechas, Intro y Escape. La lista se renderiza con un componente React accesible (`role="listbox"` y opciones con `aria-selected`).
- **La barra superior se mantiene,** reorganizada en grupos e incluyendo los formatos nuevos, para quien prefiera usar el ratón.

### D4. Cuadro de enlaces
Componente `CuadroEnlace`, un `<dialog>` propio con estilos editoriales:
- campo de URL con validación `esEnlaceWeb` (la misma función del servidor, que se mueve a un módulo compartido sin acceso a datos);
- botones «Aplicar», «Quitar enlace» y «Cancelar».

Se abre desde la barra, desde el menú de selección o con Ctrl+K, y sustituye a `window.prompt`.

### D5. Guardado automático: estado, cola y reintentos
Hook de cliente `useGuardadoAutomatico(nota)` con un estado explícito: `guardado`, `pendiente`, `guardando`, `error`, `sin-conexion` y `conflicto`.

- **Cuándo guarda:**
  - Cada cambio de título o contenido marca `pendiente` y programa el guardado a **1,5 s** de inactividad.
  - Además se guarda de inmediato al perder el foco el editor, al ocultarse la pestaña (`visibilitychange`) y al salir de la página dentro de la app (desmontaje del componente).
- **Una sola petición a la vez:** si llegan cambios durante un guardado, se guardan en cuanto este termina, con la versión que devuelve. Así nunca se envían en paralelo.
- **Envío:** una Server Action **dedicada**, `guardarNotaAutomatico(id, titulo, contenido, versionBase)`, que devuelve `{ ok, version }`, `{ conflicto }` o `{ error }`. No es un `<form>`: el hook la llama directamente.
- **Indicador:** muestra «Guardando…», «Guardado», «Sin conexión: se guardará al volver» o el mensaje de error con un botón «Reintentar». **«Guardado» solo aparece tras recibir `ok` del servidor.**
- **Errores de red:** reintentos automáticos con espera creciente (2, 4, 8 y 16 s, máximo 30 s), más un reintento inmediato con el evento `online`.
- **Errores de validación** (título vacío): no se reintenta; se muestra el mensaje y se espera a que el usuario corrija.
- **Salir con cambios sin guardar:** mientras el estado no sea `guardado`, se registra `beforeunload` para que el navegador avise al cerrar o recargar.

### D6. Copia local de seguridad
- Mientras haya cambios sin confirmar, el hook guarda en `localStorage` (clave `biblioteca:borrador:<idNota>`) el título, el contenido y la versión base. Se borra al confirmarse un guardado.
- Al abrir una nota, si existe una copia local, se compara su versión base con la del servidor:
  - **Si son iguales,** la copia local tiene cambios que no llegaron a guardarse. Se ofrece **«Recuperar cambios no guardados»** o **«Descartar»**.
  - **Si la del servidor es más reciente,** se ofrecen las mismas opciones, avisando de que recuperar sustituirá esa versión más reciente.
- Todo acceso a `localStorage` va dentro de `try/catch`: si no está disponible (modo privado, sin espacio), el resto funciona y solo se pierde esta red de seguridad. Es una conveniencia de este dispositivo, no la fuente de verdad.

### D7. Sin sobrescribir: guardado con versión
- La versión es `actualizado_en`, que ya mantiene el trigger.
- `repositories/notas.actualizarNotaSiVersion(id, cambios, versionBase)` hace `update … where id = :id and actualizado_en = :versionBase returning actualizado_en`.
- **Si no actualiza ninguna fila,** el servicio comprueba si la nota existe:
  - si existe, es un **conflicto**: devuelve `{ conflicto: true, versionActual }`;
  - si no existe, devuelve «La nota no existe o ya se eliminó».
- **El usuario elige ante el conflicto:**
  - **«Cargar la versión más reciente»** descarta la copia local y recarga la nota. *(Revisado al implementar: si se conservara, al recargar se ofrecería recuperarla y el usuario ya eligió no hacerlo.)*
  - **«Guardar mis cambios encima»** reenvía con `versionBase = versionActual`.
- La comparación se hace con el valor exacto que devolvió la base de datos, sin pasar por `Date`, para no perder los microsegundos.

**Alternativa descartada:** guardar sin comprobar versión («gana el último»). Incumple el requisito.

### D8. Interfaz de la página de la nota
- Desaparece el botón «Guardar».
- El indicador de estado va junto a las fechas de la nota, en versalitas discretas. El error se muestra en el color de error, con un botón «Reintentar».
- El aviso de conflicto y el de la copia local aparecen como un aviso en línea sobre el editor, no como ventana modal, para no bloquear la lectura.

## Risks / Trade-offs

- [Guardado frecuente → muchas peticiones] → La espera de 1,5 s y una sola petición a la vez lo limitan. El volumen es irrelevante para un uso personal.
- [Cerrar la pestaña justo al escribir] → `beforeunload` avisa y la copia local cubre el caso extremo: al volver se ofrece recuperar.
- [Conflictos de reloj o de precisión] → La versión la fija siempre la base de datos y se compara como texto exacto.
- [Formatos nuevos en notas antiguas] → No existen en ellas, así que el filtro las deja idénticas. Hay una prueba de regresión con una nota del formato anterior.
- [Accesibilidad de los menús flotantes] → Roles ARIA, manejo con teclado y el foco vuelve al editor al cerrar.

## Migration Plan

Sin migraciones de base de datos. Para volver atrás se restaura la versión anterior del código. Las notas guardadas con formatos nuevos se seguirían mostrando, pero el filtro anterior descartaría esos formatos en el siguiente guardado.

## Open Questions

- El tiempo de espera del guardado automático (1,5 s) puede ajustarse tras el uso real sin cambiar las specs.
