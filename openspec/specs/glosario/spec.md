# glosario Specification

## Purpose
El glosario registra palabras o conceptos nuevos y sus significados. Su existencia como sección propia está contemplada; la estructura de cada entrada y sus relaciones siguen pendientes.

## Requirements

### Requirement: Sección de glosario
**[Acordado]** El sistema SHALL ofrecer una sección propia de glosario donde el usuario pueda registrar palabras o conceptos con su significado.

#### Scenario: Añadir un término
- **WHEN** el usuario registra el término "plusvalía" con su significado
- **THEN** el término aparece en el glosario

### Requirement: Estructura de la entrada del glosario
**[Propuesta para revisión]** Pendiente: "definir la estructura del glosario". Se propone que cada entrada SHALL tener término (obligatorio y único por usuario) y significado, con un campo opcional de fuente o contexto. Esta propuesta MUST confirmarse antes de implementarse.

#### Scenario: Término duplicado
- **WHEN** el usuario intenta crear un término que ya existe en su glosario
- **THEN** el sistema le ofrece abrir la entrada existente en lugar de crear un duplicado

### Requirement: Relación del glosario con otros elementos
**[Propuesta para revisión]** Se propone que las entradas del glosario SHALL poder relacionarse con notas, proyectos y libros mediante los mismos vínculos sin duplicación. Esta propuesta MUST confirmarse antes de implementarse.

#### Scenario: Término vinculado a un libro
- **WHEN** el usuario vincula "plusvalía" al libro "El capital"
- **THEN** la página del libro muestra el término entre sus elementos relacionados
