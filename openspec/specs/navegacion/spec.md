# navegacion Specification

## Purpose
Define cómo se accede a las ocho áreas de la aplicación desde el menú lateral y la búsqueda de la cabecera, y qué muestra la pantalla de Inicio.

## Requirements

### Requirement: Acceso a las secciones principales
**[Acordado]** El sistema SHALL permitir al usuario llegar desde el menú principal a las ocho áreas acordadas: Inicio, Proyectos, Libros, Notas, Fuentes y recursos, Etiquetas, Glosario y Citas.

#### Scenario: Ir a libros
- **WHEN** el usuario usa la navegación principal para ir a libros
- **THEN** el sistema muestra la lista de sus libros

#### Scenario: Ir a citas
- **WHEN** el usuario usa la navegación principal para ir a citas
- **THEN** el sistema muestra la sección de citas

### Requirement: Estructura del menú propuesta
**[Acordado]** Las ocho áreas tienen sección propia en el menú, en este orden (decidido el 2026-10-28): Inicio, Notas, Proyectos, Libros, Fuentes y recursos, Citas, Glosario y Etiquetas. Cambiar el orden MUST NOT afectar al contenido ni a las relaciones del usuario.

#### Scenario: Menú provisional configurable
- **WHEN** el usuario abre el menú principal
- **THEN** ve las ocho áreas en el orden Inicio, Notas, Proyectos, Libros, Fuentes y recursos, Citas, Glosario y Etiquetas

### Requirement: Contenido de Inicio pendiente
**[Acordado]** Inicio SHALL mostrar accesos para crear una nota, un libro, un recurso y una cita; las notas recientes; «Leyendo ahora» con los libros en estado «Leyendo» o, si no hay ninguno, los últimos libros añadidos; los proyectos modificados recientemente y las citas guardadas más recientes. MUST NOT incluir métricas de tiempo, de productividad ni contadores.

#### Scenario: Inicio sin métricas
- **WHEN** el usuario abre Inicio
- **THEN** no se muestran métricas de tiempo, rachas, contadores ni indicadores de rendimiento

#### Scenario: Citas recientes en Inicio
- **WHEN** el usuario tiene citas guardadas y abre Inicio
- **THEN** ve las más recientes con su autor o «Sin autor»

#### Scenario: Leyendo ahora
- **WHEN** el usuario tiene un libro en estado «Leyendo» y otros sin estado
- **THEN** Inicio muestra en «Leyendo ahora» solo el libro que está leyendo

#### Scenario: Sin libros en lectura
- **WHEN** ningún libro está en estado «Leyendo»
- **THEN** la sección muestra los últimos libros añadidos

#### Scenario: Crear desde Inicio
- **WHEN** el usuario pulsa «Nueva nota» en Inicio
- **THEN** se abre el formulario para crear una nota

### Requirement: Búsqueda en la cabecera
**[Acordado]** La cabecera de todas las páginas con sesión SHALL incluir un cuadro de búsqueda global que lleve a la página de resultados.

#### Scenario: Buscar desde cualquier sección
- **WHEN** el usuario escribe «plusvalía» en la cabecera desde la página de un libro y confirma
- **THEN** el sistema muestra los resultados de la búsqueda
