# busqueda Specification

## Purpose
Permite encontrar contenido dentro del archivo de conocimiento. La búsqueda avanzada no está aprobada; esta spec fija la regla acordada de no mostrar duplicados y deja los criterios como exploración.

## Requirements

### Requirement: Resultados sin duplicados
**[Acordado]** Cuando exista cualquier forma de búsqueda o listado, un elemento vinculado a varios espacios MUST aparecer como un único resultado que muestre sus relaciones, no como copias.

#### Scenario: Nota vinculada a varios proyectos
- **WHEN** el usuario busca "lucha de clases" y la nota está vinculada a dos proyectos y un libro
- **THEN** la nota aparece una sola vez, indicando los dos proyectos y el libro

### Requirement: Búsqueda avanzada no aprobada
**[Exploratorio]** Pendiente: "decidir si la búsqueda avanzada forma parte de la primera versión". Los criterios explorados son título y contenido, tipo de elemento, proyecto, etiqueta, autor y libro. La búsqueda avanzada MUST NOT implementarse sin decisión explícita.

#### Scenario: Decisión antes de implementar filtros
- **WHEN** se planifique añadir filtros de búsqueda avanzada
- **THEN** debe existir una decisión registrada que los incluya en la versión correspondiente
