# relaciones Specification

## Purpose
Define cómo se vinculan proyectos, notas, libros y recursos entre sí sin crear copias, y cómo se muestran los elementos relacionados para navegar el archivo de conocimiento.

## Requirements

### Requirement: Vínculos sin duplicación
**[Acordado]** El sistema SHALL permitir relacionar notas, libros, recursos y proyectos entre sí mediante vínculos, y MUST NOT crear copias del elemento vinculado.

#### Scenario: Vincular una nota existente a otro proyecto
- **WHEN** el usuario vincula la nota existente "La lucha de clases" al proyecto "Historia social"
- **THEN** el proyecto muestra esa misma nota y el número total de notas del usuario no cambia

#### Scenario: Vínculo repetido
- **WHEN** el usuario intenta vincular una nota a un proyecto con el que ya está vinculada
- **THEN** el sistema no crea un segundo vínculo y la nota aparece una sola vez en el proyecto

### Requirement: Desvincular sin eliminar
**[Acordado]** Quitar un vínculo SHALL eliminar solo la relación, nunca el elemento. Desvincular un elemento de un proyecto SHALL quitarlo también de los apartados de ese proyecto.

#### Scenario: Quitar una nota de un proyecto
- **WHEN** el usuario desvincula una nota del proyecto "Comunismo"
- **THEN** la nota sigue existiendo y sigue vinculada a los demás espacios

#### Scenario: Desvincular quita de los apartados
- **WHEN** el usuario desvincula de «Estudiar filosofía» una nota que estaba en «Ética»
- **THEN** la nota deja de aparecer en «Ética» y sigue existiendo en la app

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

### Requirement: Eliminación de un elemento vinculado
**[Acordado]** Al eliminar un elemento, el sistema SHALL eliminar también todos sus vínculos sin borrar los elementos relacionados, y SHALL advertir al usuario de cuántas relaciones se perderán antes de confirmar. Si el elemento es un libro o un recurso con citas enlazadas, el aviso SHALL indicar también cuántas citas perderán su enlace; esas citas MUST NOT borrarse.

#### Scenario: Eliminar un proyecto con notas
- **WHEN** el usuario confirma la eliminación de un proyecto que tiene notas vinculadas
- **THEN** el proyecto desaparece y las notas siguen existiendo con sus demás vínculos

#### Scenario: Eliminar un libro con citas enlazadas
- **WHEN** el usuario pide eliminar un libro con dos citas enlazadas
- **THEN** el aviso indica que dos citas perderán su enlace, y tras confirmar las citas siguen existiendo sin enlace

### Requirement: Citas visibles en su libro o recurso
**[Acordado]** La página de un libro o de un recurso SHALL mostrar las citas enlazadas a él. Cada cita aparece una sola vez y es la misma que figura en la sección de citas: no es una copia.

#### Scenario: Cita en la página del libro
- **WHEN** el usuario abre un libro con una cita enlazada
- **THEN** la página del libro muestra la cita con su autor, y al editarla desde Citas el cambio también se ve en el libro

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
