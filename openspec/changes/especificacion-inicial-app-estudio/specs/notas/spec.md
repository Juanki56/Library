# Spec Delta

## Purpose

Las notas son la pieza central del archivo de conocimiento: guardan explicaciones, aprendizajes, ideas, preguntas, reflexiones y referencias, y existen una sola vez aunque se relacionen con varios espacios.

## ADDED Requirements

### Requirement: Gestión de notas
**[Acordado]** El sistema SHALL permitir al usuario crear, consultar, editar y eliminar notas con un título y un contenido.

#### Scenario: Crear una nota
- **WHEN** el usuario crea una nota titulada "La lucha de clases" con contenido
- **THEN** la nota queda guardada y puede consultarse desde el listado de notas

#### Scenario: Editar una nota
- **WHEN** el usuario modifica el contenido de una nota existente
- **THEN** el sistema guarda el cambio y lo muestra la próxima vez que se consulte la nota

### Requirement: Nota canónica única
**[Acordado]** Cada nota MUST existir como un único elemento canónico. Si aparece en varios proyectos, libros o recursos, todos muestran la misma nota y no copias independientes.

#### Scenario: Edición visible en todos los espacios
- **WHEN** la nota "La lucha de clases" está vinculada a los proyectos "Comunismo" e "Historia social" y el usuario la edita desde "Comunismo"
- **THEN** el cambio se ve también al abrirla desde "Historia social" y desde cualquier otro espacio vinculado

#### Scenario: Sin duplicados en el listado de notas
- **WHEN** una nota está vinculada a varios espacios
- **THEN** el listado general de notas la muestra una sola vez

### Requirement: Fechas como metadatos
**[Acordado]** El sistema SHALL registrar las fechas de creación y última modificación de cada nota como metadatos para ordenar o consultar. Estas fechas MUST NOT presentarse ni interpretarse como tiempo dedicado al estudio.

#### Scenario: Ordenar por fecha
- **WHEN** el usuario ordena sus notas por fecha de modificación
- **THEN** el sistema las muestra ordenadas según esa fecha

#### Scenario: Sin cálculo de tiempo de estudio
- **WHEN** el usuario consulta una nota o el listado de notas
- **THEN** el sistema no muestra duraciones, tiempo invertido ni métricas derivadas de las fechas
