# fuentes-recursos Specification

## Purpose
Permite guardar los materiales utilizados o considerados relevantes para estudiar, como páginas web, artículos u otros, creándolos una sola vez y reutilizándolos en varios espacios.

## Requirements

### Requirement: Gestión de fuentes y recursos
**[Acordado]** El sistema SHALL permitir al usuario crear, consultar, editar y eliminar fuentes o recursos, cada uno con al menos un título.

#### Scenario: Guardar una página web
- **WHEN** el usuario crea un recurso con título y dirección web
- **THEN** el recurso queda guardado y aparece en su lista de fuentes y recursos

### Requirement: Recurso canónico único
**[Acordado]** Cada recurso MUST crearse una sola vez y poder relacionarse con varios proyectos, libros o notas sin duplicarse.

#### Scenario: Recurso usado en varios espacios
- **WHEN** un artículo está relacionado con el proyecto "Comunismo" y con la nota "La lucha de clases"
- **THEN** ambos espacios muestran el mismo recurso, y un cambio en él se ve en los dos

### Requirement: Tipos de recurso
**[Acordado]** Cada recurso SHALL tener un tipo de esta lista: Artículo, Página web, Vídeo, Podcast, Documento o PDF, Curso, Audio u Otro. Si no se elige, es «Otro»; los recursos guardados antes también pasan a «Otro».

#### Scenario: Recurso de tipo podcast
- **WHEN** el usuario crea un recurso de tipo «Podcast»
- **THEN** la lista y la página del recurso muestran el tipo «Podcast»

#### Scenario: Recursos existentes
- **WHEN** el usuario abre un recurso guardado antes de existir los tipos
- **THEN** su tipo es «Otro»

### Requirement: Datos del recurso
**[Acordado]** Un recurso SHALL tener título obligatorio y, opcionalmente, dirección web (http o https), autor o creador, descripción, fecha de publicación, etiquetas y relaciones con libros, notas y proyectos.

#### Scenario: Recurso sin dirección web
- **WHEN** el usuario crea un recurso indicando solo el título y una descripción
- **THEN** el sistema lo guarda correctamente

#### Scenario: Fecha de publicación
- **WHEN** el usuario guarda un artículo con fecha de publicación 14 de marzo de 1883
- **THEN** al reabrirlo se ve esa fecha

### Requirement: Filtro por tipo en la lista de recursos
**[Acordado]** La lista de fuentes y recursos SHALL poder filtrarse por tipo, mostrando todos cuando no hay filtro.

#### Scenario: Filtrar por vídeo
- **WHEN** el usuario tiene un vídeo y un artículo y filtra por «Vídeo»
- **THEN** solo aparece el vídeo
