# Spec Delta

## MODIFIED Requirements

### Requirement: Acceso a las secciones principales
**[Acordado]** El sistema SHALL permitir al usuario llegar desde el menú principal a las ocho áreas acordadas: Inicio, Proyectos, Libros, Notas, Fuentes y recursos, Etiquetas, Glosario y Citas.

#### Scenario: Ir a libros
- **WHEN** el usuario usa la navegación principal para ir a libros
- **THEN** el sistema muestra la lista de sus libros

#### Scenario: Ir a citas
- **WHEN** el usuario usa la navegación principal para ir a citas
- **THEN** el sistema muestra la sección de citas

### Requirement: Estructura del menú propuesta
**[Acordado]** Las ocho áreas tienen sección propia en el menú, y Citas es una de ellas. El orden definitivo y el diseño del menú siguen pendientes y MUST NOT considerarse definitivos sin confirmación explícita.

#### Scenario: Menú provisional configurable
- **WHEN** se apruebe una estructura de menú distinta
- **THEN** cambiar el orden o las entradas del menú no afecta al contenido ni a las relaciones del usuario

### Requirement: Contenido de Inicio pendiente
**[Acordado]** Inicio SHALL mostrar las notas recientes, los libros y las citas guardadas más recientes en listas, y MUST NOT incluir métricas de tiempo ni de productividad. Su diseño visual sigue en revisión.

#### Scenario: Inicio sin métricas
- **WHEN** el usuario abre Inicio
- **THEN** no se muestran métricas de tiempo, rachas ni indicadores de rendimiento

#### Scenario: Citas recientes en Inicio
- **WHEN** el usuario tiene citas guardadas y abre Inicio
- **THEN** ve las más recientes con su autor o «Sin autor»

## ADDED Requirements

### Requirement: Búsqueda en la cabecera
**[Acordado]** La cabecera de todas las páginas con sesión SHALL incluir un cuadro de búsqueda global que lleve a la página de resultados.

#### Scenario: Buscar desde cualquier sección
- **WHEN** el usuario escribe «plusvalía» en la cabecera desde la página de un libro y confirma
- **THEN** el sistema muestra los resultados de la búsqueda
