# libros Specification

## Purpose
Cada libro funciona como un espacio propio que reúne sus datos bibliográficos y el contenido asociado (notas, citas, ideas, preguntas y reflexiones), conectado con los proyectos en los que se estudia.

## Requirements

### Requirement: Gestión de libros
**[Acordado]** El sistema SHALL permitir al usuario crear, consultar, editar y eliminar libros, cada uno con al menos un título.

#### Scenario: Crear un libro
- **WHEN** el usuario crea el libro "El manifiesto comunista"
- **THEN** el libro aparece en su lista de libros y tiene su propia página

### Requirement: Página propia del libro
**[Acordado]** La página de un libro SHALL mostrar sus datos bibliográficos y el contenido relacionado: notas, recursos y proyectos.

#### Scenario: Consultar notas desde el libro
- **WHEN** el usuario abre "El manifiesto comunista", que está relacionado con la nota "La lucha de clases"
- **THEN** la página del libro muestra esa nota, y se trata de la misma nota canónica que aparece en los proyectos

### Requirement: Relación con proyectos
**[Acordado]** Un libro SHALL poder relacionarse con uno o varios proyectos sin duplicarse.

#### Scenario: Libro en dos proyectos
- **WHEN** el usuario relaciona "El manifiesto comunista" con los proyectos "Comunismo" e "Historia social"
- **THEN** ambos proyectos muestran el mismo libro y la lista de libros lo contiene una sola vez

### Requirement: Campos bibliográficos y tipos de libro
**[Propuesta para revisión]** Mientras no se definan "los campos y tipos de libros", el sistema SHALL ofrecer como propuesta provisional: título (obligatorio), autor o autores, año, editorial y notas bibliográficas libres. MUST NOT implementarse ninguna clasificación por tipos de libro sin decisión explícita.

#### Scenario: Libro con solo título
- **WHEN** el usuario crea un libro indicando solo el título
- **THEN** el sistema lo guarda y deja vacíos los demás campos bibliográficos
