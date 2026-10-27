# Spec Delta

## MODIFIED Requirements

### Requirement: Sección de glosario
**[Acordado]** El sistema SHALL ofrecer una sección propia de glosario, accesible desde el menú principal, donde el usuario pueda registrar palabras o conceptos con su significado. Registrar un término MUST NOT requerir crear ni vincular una nota.

#### Scenario: Añadir un término
- **WHEN** el usuario registra el término "plusvalía" con su significado
- **THEN** el término aparece en el glosario

### Requirement: Estructura de la entrada del glosario
**[Acordado]** Cada entrada SHALL tener un término y una definición obligatorios, y un ejemplo y una información adicional opcionales. Las distintas acepciones de un término se recogen en su misma entrada.

#### Scenario: Término duplicado
- **WHEN** el usuario intenta crear un término que ya existe en su glosario
- **THEN** el sistema le ofrece abrir la entrada existente en lugar de crear un duplicado

#### Scenario: Entrada sin ejemplo
- **WHEN** el usuario guarda un término con definición pero sin ejemplo
- **THEN** la entrada queda guardada

#### Scenario: Definición vacía
- **WHEN** el usuario intenta guardar un término sin definición
- **THEN** el sistema no lo guarda e indica que la definición es obligatoria

## ADDED Requirements

### Requirement: Términos sin duplicar
**[Acordado]** Cada término MUST existir una sola vez por usuario. Al comparar términos, el sistema MUST ignorar mayúsculas, tildes y espacios sobrantes.

#### Scenario: Variante con tilde
- **WHEN** existe «Plusvalía» y el usuario intenta crear «plusvalia»
- **THEN** el sistema lo trata como el mismo término y ofrece abrir la entrada existente

### Requirement: Consulta alfabética con acceso por letra
**[Acordado]** El glosario SHALL mostrarse en orden alfabético, agrupado por letra inicial y con acceso directo a cada letra que tenga términos.

#### Scenario: Ir a una letra
- **WHEN** el usuario pulsa la letra «P»
- **THEN** el sistema lleva a los términos que empiezan por «P»

### Requirement: Edición y eliminación de entradas
**[Acordado]** El sistema SHALL permitir editar y eliminar las entradas del glosario.

#### Scenario: Corregir una definición
- **WHEN** el usuario edita la definición de un término y guarda
- **THEN** el glosario muestra la definición nueva

## REMOVED Requirements

### Requirement: Relación del glosario con otros elementos
**Reason**: El 2026-10-27 se decidió que las relaciones del glosario con notas, libros o proyectos no son obligatorias y se dejan para más adelante (§9.3 del documento de especificación).
**Migration**: Ninguna: no estaba implementado. Se volverá a proponer cuando se decida.
