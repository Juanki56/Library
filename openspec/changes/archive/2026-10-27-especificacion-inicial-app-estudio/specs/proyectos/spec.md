# Spec Delta

## Purpose

Los proyectos de estudio organizan el trabajo sobre un tema o área de interés (por ejemplo, "Comunismo" o "Historia social") y reúnen las notas, libros y recursos relevantes.

## ADDED Requirements

### Requirement: Gestión de proyectos
**[Acordado]** El sistema SHALL permitir al usuario crear, consultar, renombrar y eliminar proyectos de estudio, cada uno con al menos un nombre.

#### Scenario: Crear un proyecto
- **WHEN** el usuario crea un proyecto llamado "Comunismo"
- **THEN** el proyecto aparece en su lista de proyectos

### Requirement: Contenido relacionado del proyecto
**[Acordado]** La página de un proyecto SHALL mostrar las notas, libros y fuentes o recursos relacionados con él.

#### Scenario: Ver contenido del proyecto
- **WHEN** el usuario abre el proyecto "Comunismo", relacionado con la nota "La lucha de clases" y el libro "El manifiesto comunista"
- **THEN** la página del proyecto muestra esa nota y ese libro como elementos relacionados

### Requirement: Estructura detallada del proyecto
**[Propuesta para revisión]** Los campos adicionales del proyecto (por ejemplo, descripción u objetivos) y su organización interna MUST NOT implementarse hasta que se defina "la estructura de los proyectos". Mientras tanto, un proyecto SHALL tener solo nombre y descripción opcional en texto libre.

#### Scenario: Proyecto con descripción opcional
- **WHEN** el usuario crea un proyecto sin descripción
- **THEN** el sistema lo guarda correctamente con solo su nombre
