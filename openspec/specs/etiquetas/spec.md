# etiquetas Specification

## Purpose
Las etiquetas permiten clasificar y relacionar contenido de forma transversal. Su funcionamiento detallado sigue pendiente; esta spec recoge una propuesta para revisión, no una decisión.

## Requirements

### Requirement: Etiquetas como clasificación transversal
**[Acordado]** El sistema SHALL ofrecer etiquetas para clasificar y relacionar contenido de la aplicación.

#### Scenario: Encontrar contenido por etiqueta
- **WHEN** el usuario abre una etiqueta
- **THEN** el sistema muestra todos los elementos que la tienen, cada uno una sola vez

### Requirement: Elementos etiquetables
**[Propuesta para revisión]** Pendiente: "definir cómo funcionan las etiquetas". Se propone que notas, libros, recursos y proyectos SHALL admitir varias etiquetas cada uno. Esta propuesta MUST confirmarse antes de implementarse.

#### Scenario: Nota con varias etiquetas
- **WHEN** el usuario asigna las etiquetas "marxismo" y "economía" a una nota
- **THEN** la nota aparece al consultar cualquiera de las dos etiquetas

### Requirement: Administración de etiquetas
**[Propuesta para revisión]** Se propone que el usuario SHALL poder crear etiquetas al asignarlas y renombrarlas o eliminarlas desde una sección de etiquetas. Al eliminar una etiqueta se quita de los elementos, pero los elementos no se borran. Esta propuesta MUST confirmarse antes de implementarse.

#### Scenario: Eliminar una etiqueta
- **WHEN** el usuario elimina la etiqueta "economía"
- **THEN** los elementos que la tenían siguen existiendo sin esa etiqueta
