## MODIFIED Requirements

### Requirement: Vídeos de YouTube y Vimeo
**[Acordado]** El editor SHALL permitir insertar un vídeo de YouTube o Vimeo a partir de su enlace, desde el cuadro «Insertar vídeo» o pegando el enlace solo en una línea vacía (decidido el 2026-10-28), mostrando el reproductor en la nota. En el cuadro, cualquier otro enlace MUST rechazarse con un mensaje. Del vídeo se MUST guardar solo el proveedor y su identificador.

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

#### Scenario: Pegar el enlace en una línea vacía
- **WHEN** el usuario pega https://youtu.be/dQw4w9WgXcQ en una línea vacía de la nota
- **THEN** en esa línea aparece el reproductor del vídeo, que se conserva al reabrir la nota

#### Scenario: Pegar el enlace dentro de un texto
- **WHEN** el usuario pega el mismo enlace en una línea que ya tiene texto
- **THEN** se pega como un enlace normal y no aparece ningún reproductor

#### Scenario: Pegar un enlace de otro sitio en una línea vacía
- **WHEN** el usuario pega un enlace que no es de YouTube ni de Vimeo en una línea vacía
- **THEN** se pega como un enlace normal
