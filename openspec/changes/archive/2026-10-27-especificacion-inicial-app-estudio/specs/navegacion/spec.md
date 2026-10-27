# Spec Delta

## Purpose

Define cómo se accede a las secciones de la aplicación y qué muestra la pantalla de Inicio. La estructura del menú y el contenido de Inicio son propuestas de trabajo, no decisiones definitivas.

## ADDED Requirements

### Requirement: Acceso a las secciones principales
**[Acordado]** El sistema SHALL permitir al usuario llegar a cada sección de contenido existente (proyectos, libros, notas y fuentes y recursos) desde la navegación principal.

#### Scenario: Ir a libros
- **WHEN** el usuario usa la navegación principal para ir a libros
- **THEN** el sistema muestra la lista de sus libros

### Requirement: Estructura del menú propuesta
**[Exploratorio]** Pendiente: "definir la estructura final del menú". La propuesta de trabajo es: Inicio, Proyectos, Libros, Notas, Fuentes y recursos, Etiquetas, Glosario. Las citas no tienen ubicación asignada. Esta estructura MUST NOT considerarse definitiva sin confirmación explícita.

#### Scenario: Menú provisional configurable
- **WHEN** se apruebe una estructura de menú distinta
- **THEN** cambiar el orden o las entradas del menú no afecta al contenido ni a las relaciones del usuario

### Requirement: Contenido de Inicio pendiente
**[Exploratorio]** Pendiente: "definir qué aparece en Inicio y cómo se organiza". Inicio MUST NOT incluir métricas de tiempo ni de productividad. Su estructura y contenido no están aprobados.

#### Scenario: Inicio sin métricas
- **WHEN** el usuario abre Inicio
- **THEN** no se muestran métricas de tiempo, rachas ni indicadores de rendimiento
