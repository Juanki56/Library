# editor-notas Specification

## Purpose
Describe cómo se escribe y da formato al contenido de las notas. El alcance se amplía por fases acordadas; están implementadas la fase 1 (formatos, menús, cuadro de enlaces y guardado automático sin sobrescribir cambios más recientes), la fase 2 (referencias a notas y «Notas que la mencionan») y la fase 3 (imágenes subidas o desde la web y vídeos de YouTube y Vimeo).

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
- **WHEN** llega al servidor contenido con un formato fuera del alcance, como un bloque de código o una tabla en esta fase
- **THEN** ese formato no se guarda y el resto del contenido sí

### Requirement: Funciones del editor por fases
**[Acordado]** Las funciones del editor que no están implementadas se añaden por fases acordadas: mover bloques, índice de la nota y tablas (fase 4). Ninguna MUST implementarse antes de aprobar el cambio de su fase. Los bloques de código y subir vídeos propios quedan fuera. Las referencias a notas (fase 2) y las imágenes y vídeos (fase 3) ya forman parte del editor.

#### Scenario: Función de una fase futura no incluida
- **WHEN** se usa el editor de esta fase
- **THEN** no ofrece insertar tablas ni subir vídeos propios

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

### Requirement: Referencias a otras notas
**[Acordado]** El editor SHALL permitir insertar en el texto una referencia a otra nota del mismo usuario, elegida por su título. La referencia MUST guardar solo el tipo y el identificador del elemento referido (en esta fase, solo notas), sin copiar su contenido ni su título, y MUST mostrar siempre el título actual.

#### Scenario: Insertar una referencia
- **WHEN** el usuario elige «Referencia a una nota» en el menú «/» o en la barra de formato, busca «manifiesto» y elige la nota «El Manifiesto comunista»
- **THEN** la nota muestra una referencia con el título «El Manifiesto comunista» y al reabrirla la referencia se conserva

#### Scenario: Búsqueda sin tildes
- **WHEN** el usuario busca «historia economica» en el cuadro de referencias
- **THEN** aparece la nota «Historia económica»

#### Scenario: Título actualizado
- **WHEN** una nota referencia a otra y después se cambia el título de la nota referida
- **THEN** al abrir la primera nota la referencia muestra el título nuevo

#### Scenario: Abrir la nota referida
- **WHEN** el usuario pulsa una referencia
- **THEN** se abre la nota referida

#### Scenario: Nota referida eliminada
- **WHEN** se elimina una nota que otra nota referencia
- **THEN** la referencia se muestra como «Nota eliminada», sin enlace, y el resto del contenido de la nota no cambia

#### Scenario: Referencia no válida descartada
- **WHEN** llega al servidor una referencia con un identificador mal formado o de un tipo no admitido
- **THEN** esa referencia no se guarda y el resto del contenido sí

#### Scenario: Notas de otro usuario
- **WHEN** el contenido de una nota incluye el identificador de una nota de otro usuario
- **THEN** no se muestra su título ni aparece en las menciones de esa nota

### Requirement: Notas que la mencionan
**[Acordado]** Cada nota SHALL mostrar una sección «Notas que la mencionan» con las notas del mismo usuario que contienen una referencia a ella, cada una una sola vez, con su título actual y un enlace para abrirla. La lista MUST reflejar el contenido guardado: al quitar o añadir una referencia y guardarse la nota, la lista de la nota referida se actualiza. Una nota no aparece en su propia lista.

#### Scenario: Mención visible
- **WHEN** la nota «Lucha de clases» referencia dos veces a «El Manifiesto comunista»
- **THEN** la sección «Notas que la mencionan» de «El Manifiesto comunista» muestra «Lucha de clases» una sola vez, con enlace

#### Scenario: Quitar la referencia
- **WHEN** el usuario borra la referencia de «Lucha de clases» y la nota se guarda
- **THEN** «Lucha de clases» deja de aparecer en «Notas que la mencionan» de «El Manifiesto comunista»

#### Scenario: Sin menciones
- **WHEN** ninguna nota referencia a una nota
- **THEN** la sección indica que ninguna nota la menciona todavía

### Requirement: Imágenes subidas
**[Acordado]** El editor SHALL permitir subir una imagen PNG, JPEG, GIF o WebP de hasta 5 MB e insertarla en la nota. La imagen MUST guardarse de forma privada: solo su propietario puede verla. Si la subida falla, el usuario MUST recibir un aviso y no se inserta nada.

#### Scenario: Subir una imagen
- **WHEN** el usuario sube una imagen PNG de 200 KB en una nota y la nota se guarda
- **THEN** la imagen se ve en la nota y sigue viéndose al reabrirla

#### Scenario: Imagen demasiado grande
- **WHEN** el usuario intenta subir una imagen de más de 5 MB
- **THEN** recibe el aviso «La imagen no puede superar 5 MB.» y no se inserta nada

#### Scenario: Tipo de archivo no admitido
- **WHEN** el usuario intenta subir un archivo que no es una imagen PNG, JPEG, GIF o WebP, aunque tenga una extensión de imagen
- **THEN** recibe un aviso y no se inserta nada

#### Scenario: Imagen privada
- **WHEN** otro usuario, o alguien sin sesión, intenta abrir la dirección de una imagen subida
- **THEN** no obtiene la imagen

### Requirement: Imágenes desde una URL
**[Acordado]** El editor SHALL permitir insertar una imagen indicando su dirección web (http o https). Se MUST guardar solo la dirección; la imagen se carga desde su origen. Si no se puede cargar, la nota MUST mostrar un aviso en su lugar sin afectar al resto del contenido.

#### Scenario: Imagen desde la web
- **WHEN** el usuario inserta la imagen de una dirección https
- **THEN** la imagen se ve en la nota y al reabrirla se carga desde esa dirección

#### Scenario: Imagen no disponible
- **WHEN** la dirección de una imagen insertada deja de responder
- **THEN** en su lugar aparece el aviso «No se pudo cargar la imagen.» y el resto de la nota se ve con normalidad

#### Scenario: Dirección no web
- **WHEN** el usuario indica una dirección que no empieza por http:// o https://
- **THEN** no se inserta la imagen y se explica por qué

### Requirement: Texto alternativo y pie de imagen
**[Acordado]** Cada imagen SHALL admitir un texto alternativo y un pie de imagen opcionales, que se pueden añadir al insertarla y editar después. El pie MUST mostrarse debajo de la imagen.

#### Scenario: Añadir y editar los datos de la imagen
- **WHEN** el usuario inserta una imagen con el texto alternativo «Retrato de Marx» y el pie «Londres, 1875», y después cambia el pie a «Londres, 1875 (detalle)»
- **THEN** al reabrir la nota la imagen tiene ese texto alternativo y muestra el pie «Londres, 1875 (detalle)»

### Requirement: Limpieza de imágenes subidas
**[Acordado]** Las imágenes subidas que una nota deja de usar MUST borrarse del almacenamiento: al eliminar la nota, y al quitarlas del texto una vez guardada la nota. Las imágenes que siguen en el contenido guardado MUST conservarse.

#### Scenario: Eliminar la nota
- **WHEN** el usuario elimina una nota con imágenes subidas
- **THEN** esas imágenes se borran del almacenamiento

#### Scenario: Quitar una imagen del texto
- **WHEN** el usuario borra una imagen subida del texto y la nota se guarda
- **THEN** esa imagen se borra del almacenamiento, como tarde la siguiente vez que se abre la nota pasados dos minutos desde su subida, y las demás imágenes se conservan

### Requirement: Vídeos de YouTube y Vimeo
**[Acordado]** El editor SHALL permitir insertar un vídeo de YouTube o Vimeo a partir de su enlace, mostrando el reproductor en la nota. Cualquier otro enlace MUST rechazarse con un mensaje. Del vídeo se MUST guardar solo el proveedor y su identificador.

#### Scenario: Insertar un vídeo de YouTube
- **WHEN** el usuario pega el enlace https://www.youtube.com/watch?v=dQw4w9WgXcQ en el cuadro «Insertar vídeo»
- **THEN** la nota muestra el reproductor de ese vídeo y lo conserva al reabrirla

#### Scenario: Insertar un vídeo de Vimeo
- **WHEN** el usuario pega el enlace https://vimeo.com/76979871
- **THEN** la nota muestra el reproductor de ese vídeo

#### Scenario: Enlace de otro sitio
- **WHEN** el usuario pega un enlace que no es de YouTube ni de Vimeo
- **THEN** recibe el aviso «Solo se admiten vídeos de YouTube o Vimeo.» y no se inserta nada

#### Scenario: Vídeo manipulado descartado
- **WHEN** llega al servidor un vídeo de otro proveedor o con un identificador no válido
- **THEN** ese vídeo no se guarda y el resto del contenido sí
