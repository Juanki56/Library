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

### Requirement: Tipos de recurso y datos bibliográficos
**[Propuesta para revisión]** Mientras no se definan "los tipos de fuentes y recursos y sus datos", el sistema SHALL ofrecer como propuesta provisional: título (obligatorio), dirección web opcional, autor opcional y descripción libre. Una clasificación por tipos MUST NOT implementarse sin decisión explícita.

#### Scenario: Recurso sin dirección web
- **WHEN** el usuario crea un recurso indicando solo el título y una descripción
- **THEN** el sistema lo guarda correctamente
