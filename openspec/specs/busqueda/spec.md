# busqueda Specification

## Purpose
Búsqueda global en proyectos, notas, libros, recursos, citas y glosario, sin distinguir tildes ni mayúsculas, con filtro por tipo y cada elemento una sola vez.

## Requirements

### Requirement: Resultados sin duplicados
**[Acordado]** Cuando exista cualquier forma de búsqueda o listado, un elemento vinculado a varios espacios MUST aparecer como un único resultado que muestre sus relaciones, no como copias.

#### Scenario: Nota vinculada a varios proyectos
- **WHEN** el usuario busca "lucha de clases" y la nota está vinculada a dos proyectos y un libro
- **THEN** la nota aparece una sola vez, indicando los dos proyectos y el libro

### Requirement: Búsqueda global
**[Acordado]** El sistema SHALL ofrecer una búsqueda global sobre proyectos, libros, notas, fuentes y recursos, citas y términos del glosario del usuario. La búsqueda MUST NOT mostrar contenido de otros usuarios.

#### Scenario: Buscar en varios tipos
- **WHEN** el usuario busca «capital» y existe un libro, una nota y una cita que lo contienen
- **THEN** los tres aparecen en los resultados

### Requirement: Campos de búsqueda por tipo
**[Acordado]** La búsqueda SHALL usar, por tipo: proyecto (nombre y descripción), nota (título y texto), libro (título, autores y descripción, antes llamada «notas bibliográficas»), recurso (título, autor o creador y descripción), cita (texto, autor y fuente u origen) y término (término, definición, ejemplo e información adicional).

#### Scenario: Buscar por autor
- **WHEN** el usuario busca «Marx» y tiene un libro de Karl Marx y una cita de Marx
- **THEN** aparecen el libro y la cita, aunque «Marx» no esté en sus títulos

#### Scenario: Campo no incluido
- **WHEN** el usuario busca el nombre de una editorial que solo figura en ese campo de un libro
- **THEN** el libro no aparece por esa coincidencia

### Requirement: Coincidencias sin tildes ni mayúsculas y por inicio de palabra
**[Acordado]** La búsqueda MUST ignorar mayúsculas y tildes, y SHALL encontrar palabras que empiezan por lo escrito.

#### Scenario: Sin tilde
- **WHEN** el usuario busca «filosofia»
- **THEN** aparecen los elementos que contienen «Filosofía»

#### Scenario: Inicio de palabra
- **WHEN** el usuario busca «materia»
- **THEN** aparecen los elementos que contienen «materialismo»

### Requirement: Presentación y acceso a los resultados
**[Acordado]** Los resultados SHALL ordenarse por relevancia y mostrar el tipo de elemento, su título y un fragmento del texto con la coincidencia. Cada resultado SHALL enlazar a la página del elemento.

#### Scenario: Abrir un resultado
- **WHEN** el usuario pulsa un resultado de tipo nota
- **THEN** el sistema abre la página de esa nota

### Requirement: Filtro por tipo de contenido
**[Acordado]** La página de resultados SHALL permitir ver todos los tipos o filtrar por uno solo. Los filtros por autor, etiqueta, fecha, proyecto o libro MUST NOT incluirse en esta versión.

#### Scenario: Solo citas
- **WHEN** el usuario filtra los resultados por «Citas»
- **THEN** solo se muestran citas
