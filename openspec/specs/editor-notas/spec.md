# editor-notas Specification

## Purpose
Describe cómo se escribe y da formato al contenido de las notas. El alcance se amplía por fases acordadas; la fase 1 (formatos, menús, cuadro de enlaces y guardado automático sin sobrescribir cambios más recientes) está implementada.

## Requirements

### Requirement: Escritura de contenido en notas
**[Acordado]** El sistema SHALL ofrecer un editor que permita escribir y modificar el título y el contenido de una nota de forma cómoda para la lectura y la escritura, con una experiencia parecida a la de un procesador de textos. Los cambios SHALL guardarse automáticamente, sin botón de guardar.

#### Scenario: Escribir y guardar
- **WHEN** el usuario escribe texto en una nota y deja de escribir
- **THEN** el contenido se guarda solo y se conserva tal como lo escribió al reabrir la nota

### Requirement: Alcance inicial del editor
**[Acordado]** El editor SHALL ofrecer títulos y subtítulos, negrita, cursiva, subrayado, resaltado, listas con viñetas, numeradas y de tareas, citas en bloque, separadores y enlaces web (http/https). Cualquier otro formato MUST descartarse al guardar (decidido el 2026-10-27).

#### Scenario: Enlace no web rechazado
- **WHEN** el usuario intenta añadir un enlace que no empieza por http:// o https://
- **THEN** el enlace no se guarda en la nota

#### Scenario: Formato básico conservado
- **WHEN** el usuario aplica un subtítulo, una lista y una cita en bloque y guarda la nota
- **THEN** al reabrirla el formato se mantiene

#### Scenario: Formatos nuevos conservados
- **WHEN** el usuario aplica subrayado y resaltado a un texto, inserta un separador y crea una lista de tareas con una tarea marcada
- **THEN** al reabrir la nota se conservan el subrayado, el resaltado, el separador, la lista de tareas y la tarea marcada

#### Scenario: Formato no permitido descartado
- **WHEN** llega al servidor contenido con un formato fuera del alcance, como un bloque de código o una imagen en esta fase
- **THEN** ese formato no se guarda y el resto del contenido sí

### Requirement: Funciones del editor por fases
**[Acordado]** Las funciones del editor que no están en esta fase se implementan por fases acordadas: referencias a otras notas (fase 2), imágenes y vídeos de YouTube y Vimeo (fase 3), y mover bloques, índice de la nota y tablas (fase 4). Ninguna MUST implementarse antes de aprobar el cambio de su fase. Los bloques de código y subir vídeos propios quedan fuera.

#### Scenario: Función de una fase futura no incluida
- **WHEN** se usa el editor de esta fase
- **THEN** no ofrece insertar imágenes, vídeos, referencias a notas ni tablas

### Requirement: Guardado automático con indicador de estado
**[Acordado]** El título y el contenido SHALL guardarse automáticamente poco después de dejar de escribir. Un indicador visible SHALL mostrar en todo momento «Guardando…», «Guardado» o un mensaje de error, y MUST NOT mostrar «Guardado» si el guardado no terminó correctamente.

#### Scenario: Guardado tras dejar de escribir
- **WHEN** el usuario escribe en una nota y deja de escribir
- **THEN** el indicador muestra «Guardando…» y después «Guardado», y al recargar la página aparece lo escrito

#### Scenario: Error al guardar
- **WHEN** el guardado falla, por ejemplo por un problema de conexión
- **THEN** el indicador muestra un mensaje de error con una opción para reintentar, y no muestra «Guardado»

#### Scenario: Título vacío
- **WHEN** el usuario deja vacío el título de la nota
- **THEN** el sistema no guarda ese cambio, el indicador explica que la nota necesita un título y el contenido no se pierde

### Requirement: Sin pérdida de cambios
**[Acordado]** El sistema MUST NOT perder cambios del usuario al navegar a otra página, cerrar la nota o la pestaña, o tener problemas de conexión. Los cambios pendientes SHALL guardarse antes de salir cuando sea posible, reintentarse si falla la conexión y conservarse en una copia local del navegador hasta que se guarden.

#### Scenario: Navegar con cambios pendientes
- **WHEN** el usuario escribe y enseguida va a otra sección de la aplicación
- **THEN** los cambios se guardan y aparecen al volver a la nota

#### Scenario: Cerrar con cambios sin guardar
- **WHEN** el usuario intenta cerrar o recargar la pestaña mientras hay cambios sin guardar
- **THEN** el navegador le avisa antes de salir

#### Scenario: Sin conexión
- **WHEN** se pierde la conexión mientras el usuario escribe
- **THEN** el indicador lo avisa, los cambios se conservan en una copia local y se guardan cuando vuelve la conexión

#### Scenario: Recuperar una copia local
- **WHEN** el usuario vuelve a abrir una nota con una copia local más reciente que la guardada, por ejemplo tras cerrar sin conexión
- **THEN** el sistema le ofrece recuperar esos cambios o descartarlos

### Requirement: Sin sobrescribir cambios más recientes
**[Acordado]** El guardado MUST NOT sobrescribir una versión de la nota más reciente que la que el usuario tenía abierta, por ejemplo una editada en otra pestaña o dispositivo. En ese caso el sistema SHALL avisar y dejar elegir entre cargar la versión más reciente o conservar los propios cambios guardándolos encima.

#### Scenario: Nota editada en otra pestaña
- **WHEN** el usuario tiene una nota abierta en dos pestañas, la edita y guarda en la segunda, y después escribe en la primera
- **THEN** la primera pestaña no sobrescribe la nota y avisa de que hay una versión más reciente

#### Scenario: Elegir la versión más reciente
- **WHEN** ante ese aviso el usuario elige cargar la versión más reciente
- **THEN** el editor muestra la versión guardada en la otra pestaña

#### Scenario: Conservar los propios cambios
- **WHEN** ante ese aviso el usuario elige conservar sus cambios
- **THEN** sus cambios se guardan como versión actual de la nota

### Requirement: Menú al seleccionar texto
**[Acordado]** Al seleccionar texto, el editor SHALL mostrar junto a la selección un menú con negrita, cursiva, subrayado, resaltado y enlace, indicando qué formatos están activos.

#### Scenario: Resaltar desde la selección
- **WHEN** el usuario selecciona una frase y pulsa «Resaltar» en el menú
- **THEN** la frase queda resaltada y el botón aparece activo

### Requirement: Menú «/» para insertar bloques
**[Acordado]** Al escribir «/» al principio de un bloque vacío, el editor SHALL mostrar una lista filtrable para insertar subtítulo, subtítulo menor, lista, lista numerada, lista de tareas, cita y separador. La lista SHALL poder usarse con el teclado y cerrarse con Escape.

#### Scenario: Insertar una lista de tareas
- **WHEN** el usuario escribe «/tar» y pulsa Intro
- **THEN** el bloque se convierte en una lista de tareas y el texto «/tar» desaparece

#### Scenario: Cerrar sin insertar
- **WHEN** el usuario escribe «/» y pulsa Escape
- **THEN** el menú se cierra y la barra «/» queda como texto normal

### Requirement: Cuadro de enlaces
**[Acordado]** El editor SHALL ofrecer un cuadro propio para añadir, editar y quitar el enlace de un texto, sin ventanas del navegador. El cuadro MUST rechazar direcciones que no sean http o https e indicar por qué.

#### Scenario: Añadir un enlace
- **WHEN** el usuario selecciona un texto, abre el cuadro de enlaces y escribe «https://ejemplo.com»
- **THEN** el texto queda enlazado a esa dirección

#### Scenario: Editar y quitar un enlace
- **WHEN** el usuario sitúa el cursor sobre un enlace, abre el cuadro y cambia la dirección o pulsa «Quitar enlace»
- **THEN** el enlace se actualiza o desaparece y el texto se conserva

#### Scenario: Dirección no válida
- **WHEN** el usuario escribe «javascript:alert(1)» en el cuadro
- **THEN** el cuadro no crea el enlace y explica que solo admite direcciones http o https

### Requirement: Compatibilidad con notas existentes
**[Acordado]** Las notas creadas antes de esta fase MUST abrirse, editarse y guardarse sin perder contenido ni formato.

#### Scenario: Nota antigua
- **WHEN** el usuario abre una nota guardada con el editor anterior, con subtítulos, listas, citas y enlaces
- **THEN** se ve igual, y al editarla se guarda sin perder nada
