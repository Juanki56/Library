## MODIFIED Requirements

### Requirement: Elementos relacionados visibles
**[Acordado]** Cada nota, libro, recurso y proyecto SHALL mostrar en su página una sección «Conexiones» con sus etiquetas, los elementos con los que está vinculado agrupados por tipo y, según el caso, las notas que la mencionan y las citas enlazadas. Cada elemento MUST mostrarse con un enlace y su contexto (decidido el 2026-10-28). Solo se muestran los grupos con contenido.

#### Scenario: Navegar desde una nota
- **WHEN** el usuario abre una nota vinculada a dos proyectos y un libro
- **THEN** la nota muestra esos tres elementos como enlaces navegables

#### Scenario: Contexto de cada elemento
- **WHEN** una nota está vinculada a «El capital» (Karl Marx, 1867, en estado «Leyendo») y a un podcast de David Harvey
- **THEN** «Conexiones» muestra el libro con «Karl Marx · 1867 · Leyendo» y el recurso con «Podcast · David Harvey»

#### Scenario: Solo grupos con contenido
- **WHEN** un libro solo está vinculado a notas
- **THEN** «Conexiones» muestra el grupo de notas y no muestra grupos vacíos de proyectos ni de recursos

#### Scenario: Sin conexiones
- **WHEN** un elemento no tiene ningún vínculo, mención ni cita
- **THEN** «Conexiones» muestra una frase que invita a vincular

#### Scenario: Todo en un sitio
- **WHEN** una nota tiene etiquetas, vínculos y otra nota que la menciona
- **THEN** los tres aparecen dentro de «Conexiones»

## ADDED Requirements

### Requirement: Vincular con un buscador
**[Acordado]** «Conexiones» SHALL ofrecer un único botón «Vincular…» que abre un buscador con los elementos que se pueden vincular de todos los tipos permitidos, sin los ya vinculados. Busca sin distinguir tildes ni mayúsculas, indica el tipo de cada resultado y se maneja con flechas e Intro.

#### Scenario: Vincular un libro a una nota
- **WHEN** el usuario pulsa «Vincular…» en una nota, escribe «capital» y elige el libro «El capital»
- **THEN** el libro aparece en «Conexiones» de la nota y la nota en «Conexiones» del libro

#### Scenario: Sin duplicados
- **WHEN** un libro ya está vinculado a la nota
- **THEN** el buscador no lo ofrece

### Requirement: Crear una nota vinculada
**[Acordado]** Desde la página de un libro, recurso o proyecto, «Nueva nota vinculada» SHALL crear una nota y vincularla a ese elemento.

#### Scenario: Nota sobre un libro
- **WHEN** el usuario pulsa «Nueva nota vinculada» en «El capital» y crea la nota «Mercancía»
- **THEN** se abre la nota «Mercancía» y su sección «Conexiones» muestra «El capital»
