## MODIFIED Requirements

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
