## ADDED Requirements

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

## REMOVED Requirements

### Requirement: Tipos de recurso y datos bibliográficos
**Reason**: El 2026-10-28 el usuario decidió los tipos y datos de los recursos (§2.4 del documento de especificación); la propuesta provisional deja de aplicarse.
**Migration**: Ver «Tipos de recurso», «Datos del recurso» y «Filtro por tipo en la lista de recursos».
