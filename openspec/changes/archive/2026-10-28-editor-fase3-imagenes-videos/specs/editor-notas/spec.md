## MODIFIED Requirements

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

## ADDED Requirements

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
