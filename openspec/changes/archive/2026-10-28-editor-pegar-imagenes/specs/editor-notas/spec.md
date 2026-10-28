## MODIFIED Requirements

### Requirement: Imágenes subidas
**[Acordado]** El editor SHALL permitir subir una imagen PNG, JPEG, GIF o WebP de hasta 5 MB e insertarla en la nota, desde el cuadro «Imagen», pegándola o arrastrando el archivo al editor (decidido el 2026-10-28). La imagen MUST guardarse de forma privada: solo su propietario puede verla. Si la subida falla, el usuario MUST recibir un aviso y no se inserta nada.

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

#### Scenario: Pegar una captura
- **WHEN** el usuario pega en el editor una captura de pantalla
- **THEN** se ve «Subiendo imagen…», después la imagen aparece donde estaba el cursor y sigue viéndose al reabrir la nota

#### Scenario: Arrastrar un archivo de imagen
- **WHEN** el usuario arrastra un archivo PNG desde su ordenador y lo suelta entre dos párrafos
- **THEN** la imagen se sube y aparece donde la soltó

#### Scenario: Pegar algo que no es una imagen admitida
- **WHEN** el usuario pega un archivo de más de 5 MB o que no es PNG, JPEG, GIF ni WebP
- **THEN** recibe el aviso correspondiente y no se inserta nada

### Requirement: Imágenes desde una URL
**[Acordado]** El editor SHALL permitir insertar una imagen indicando su dirección web (http o https), y al pegar contenido copiado de una web sus imágenes con dirección web se insertan igual. Se MUST guardar solo la dirección; la imagen se carga desde su origen. Si no se puede cargar, la nota MUST mostrar un aviso en su lugar sin afectar al resto del contenido.

#### Scenario: Imagen desde la web
- **WHEN** el usuario inserta la imagen de una dirección https
- **THEN** la imagen se ve en la nota y al reabrirla se carga desde esa dirección

#### Scenario: Imagen no disponible
- **WHEN** la dirección de una imagen insertada deja de responder
- **THEN** en su lugar aparece el aviso «No se pudo cargar la imagen.» y el resto de la nota se ve con normalidad

#### Scenario: Dirección no web
- **WHEN** el usuario indica una dirección que no empieza por http:// o https://
- **THEN** no se inserta la imagen y se explica por qué

#### Scenario: Pegar contenido de una web con imágenes
- **WHEN** el usuario copia de una web un texto con una imagen https y lo pega en la nota
- **THEN** se pegan el texto y la imagen, que se carga desde su dirección
