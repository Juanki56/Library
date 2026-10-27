# etiquetas Specification

## Purpose
Las etiquetas clasifican notas, libros, proyectos y fuentes o recursos mediante palabras clave compartidas, creadas una sola vez y consultables por etiqueta con filtro por tipo.

## Requirements

### Requirement: Etiquetas como clasificación transversal
**[Acordado]** El sistema SHALL ofrecer etiquetas para clasificar contenido de notas, libros, proyectos y fuentes o recursos mediante palabras clave compartidas. Una misma etiqueta SHALL poder usarse en los cuatro tipos y etiquetar MUST NOT copiar ni duplicar contenido.

#### Scenario: Encontrar contenido por etiqueta
- **WHEN** el usuario abre una etiqueta
- **THEN** el sistema muestra todos los elementos que la tienen, cada uno una sola vez

#### Scenario: Una etiqueta en varios tipos
- **WHEN** el usuario asigna «Filosofía» a una nota, un libro, un proyecto y un recurso
- **THEN** la página de «Filosofía» muestra los cuatro elementos

### Requirement: Elementos etiquetables
**[Acordado]** Las notas, libros, proyectos y fuentes o recursos SHALL admitir varias etiquetas cada uno. Desde la página de cada elemento el usuario SHALL poder asignar una etiqueta existente, crear una nueva en ese momento y quitar una etiqueta sin borrar el elemento.

#### Scenario: Nota con varias etiquetas
- **WHEN** el usuario asigna las etiquetas «marxismo» y «economía» a una nota
- **THEN** la nota aparece al consultar cualquiera de las dos etiquetas

#### Scenario: Crear al asignar
- **WHEN** el usuario escribe una etiqueta que no existe al asignarla a un libro
- **THEN** la etiqueta se crea y queda asignada al libro

#### Scenario: Quitar una etiqueta
- **WHEN** el usuario quita la etiqueta «economía» de una nota
- **THEN** la nota sigue existiendo y deja de aparecer en «economía»

### Requirement: Administración de etiquetas
**[Acordado]** Desde la sección Etiquetas el usuario SHALL poder crear, renombrar y eliminar etiquetas. Renombrar SHALL reflejarse en todos los elementos que la usan. Eliminar SHALL quitar la etiqueta de todos sus elementos sin borrarlos y MUST mostrar antes una advertencia con cuántos elementos la usan.

#### Scenario: Eliminar una etiqueta
- **WHEN** el usuario elimina la etiqueta «economía»
- **THEN** los elementos que la tenían siguen existiendo sin esa etiqueta

#### Scenario: Advertencia antes de eliminar
- **WHEN** el usuario pide eliminar una etiqueta usada por tres elementos
- **THEN** el sistema le avisa de que se quitará de tres elementos y que estos no se borrarán, antes de confirmar

#### Scenario: Renombrar
- **WHEN** el usuario renombra «filosofia» a «Filosofía»
- **THEN** todos sus elementos muestran «Filosofía»

### Requirement: Etiqueta única sin distinguir mayúsculas ni tildes
**[Acordado]** Cada etiqueta MUST existir una sola vez por usuario. Al comparar nombres, el sistema MUST ignorar mayúsculas, tildes y espacios sobrantes, y SHALL conservar la forma escrita la primera vez.

#### Scenario: Variantes del mismo nombre
- **WHEN** existe «Filosofía» y el usuario asigna «filosofia» a una nota
- **THEN** se reutiliza «Filosofía» y no se crea una etiqueta nueva

#### Scenario: Renombrar a un nombre ya existente
- **WHEN** el usuario intenta renombrar una etiqueta con el nombre de otra que ya existe
- **THEN** el sistema no lo permite e indica que esa etiqueta ya existe

### Requirement: Página de una etiqueta con filtro por tipo
**[Acordado]** La página de una etiqueta SHALL mostrar sus elementos agrupados por tipo y ordenados alfabéticamente, y SHALL permitir filtrar para ver todos o solo notas, libros, proyectos o recursos.

#### Scenario: Filtrar por libros
- **WHEN** el usuario abre «Filosofía» y elige el filtro «Libros»
- **THEN** solo se muestran los libros con esa etiqueta

#### Scenario: Cada elemento enlaza a su página
- **WHEN** el usuario pulsa un elemento en la página de una etiqueta
- **THEN** el sistema abre la página de ese elemento
