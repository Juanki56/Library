# Spec Delta

## Purpose

Define cómo se vinculan proyectos, notas, libros y recursos entre sí sin crear copias, y cómo se muestran los elementos relacionados para navegar el archivo de conocimiento.

## ADDED Requirements

### Requirement: Vínculos sin duplicación
**[Acordado]** El sistema SHALL permitir relacionar notas, libros, recursos y proyectos entre sí mediante vínculos, y MUST NOT crear copias del elemento vinculado.

#### Scenario: Vincular una nota existente a otro proyecto
- **WHEN** el usuario vincula la nota existente "La lucha de clases" al proyecto "Historia social"
- **THEN** el proyecto muestra esa misma nota y el número total de notas del usuario no cambia

#### Scenario: Vínculo repetido
- **WHEN** el usuario intenta vincular una nota a un proyecto con el que ya está vinculada
- **THEN** el sistema no crea un segundo vínculo y la nota aparece una sola vez en el proyecto

### Requirement: Desvincular sin eliminar
**[Acordado]** Quitar un vínculo SHALL eliminar solo la relación, nunca el elemento.

#### Scenario: Quitar una nota de un proyecto
- **WHEN** el usuario desvincula una nota del proyecto "Comunismo"
- **THEN** la nota sigue existiendo y sigue vinculada a los demás espacios

### Requirement: Elementos relacionados visibles
**[Acordado]** Cada elemento SHALL mostrar en su página la lista de elementos con los que está relacionado, con enlaces para navegar a ellos. La forma visual de esa lista queda **pendiente** ("cómo se muestran los elementos relacionados").

#### Scenario: Navegar desde una nota
- **WHEN** el usuario abre una nota vinculada a dos proyectos y un libro
- **THEN** la nota muestra esos tres elementos como enlaces navegables

### Requirement: Eliminación de un elemento vinculado
**[Acordado]** Al eliminar un elemento, el sistema SHALL eliminar también todos sus vínculos sin borrar los elementos relacionados, y SHALL advertir al usuario de cuántas relaciones se perderán antes de confirmar.

#### Scenario: Eliminar un proyecto con notas
- **WHEN** el usuario confirma la eliminación de un proyecto que tiene notas vinculadas
- **THEN** el proyecto desaparece y las notas siguen existiendo con sus demás vínculos
