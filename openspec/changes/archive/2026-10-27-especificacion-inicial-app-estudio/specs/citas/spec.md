# Spec Delta

## Purpose

Recoge la posibilidad de guardar citas, frases de autores y proverbios. Dónde se organizan dentro de la aplicación sigue pendiente; esta spec documenta las opciones sin decidir.

## ADDED Requirements

### Requirement: Guardar citas, frases y proverbios
**[Propuesta para revisión]** Se propone que el usuario SHALL poder guardar citas, frases de autores y proverbios con su texto y, de forma opcional, el autor y la procedencia. Esta capacidad MUST confirmarse antes de implementarse.

#### Scenario: Guardar una cita de un libro
- **WHEN** el usuario guarda una cita indicando su texto, autor y libro de procedencia
- **THEN** la cita queda guardada y se puede consultar desde el libro

### Requirement: Ubicación de las citas sin decidir
**[Propuesta para revisión]** Pendiente: "decidir dónde viven las citas, frases y proverbios". Las opciones son (A) sección propia, (B) integradas en libros y notas o (C) ambas: un elemento canónico visible en su sección y en sus espacios relacionados. Su ubicación en el menú MUST NOT darse por definida.

#### Scenario: Decisión registrada antes de implementar
- **WHEN** se vaya a implementar la gestión de citas
- **THEN** debe existir una decisión explícita sobre la opción A, B o C registrada en el documento de especificación
