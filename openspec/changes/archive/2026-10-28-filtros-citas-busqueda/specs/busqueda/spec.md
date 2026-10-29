## MODIFIED Requirements

### Requirement: Filtro por tipo de contenido
**[Acordado]** La página de resultados SHALL permitir ver todos los tipos o filtrar por uno solo, y además filtrar por autor, etiqueta, fecha de modificación, proyecto o libro (decidido el 2026-10-28). Los filtros se combinan; los tipos que no tienen el dato filtrado no aparecen. Con algún filtro adicional se puede buscar sin escribir texto.

#### Scenario: Solo citas
- **WHEN** el usuario filtra los resultados por «Citas»
- **THEN** solo se muestran citas

#### Scenario: Filtrar por autor
- **WHEN** el usuario busca «capital» con el filtro de autor «marx» y tiene un libro de Karl Marx, una cita de Marx y una nota sobre el capital
- **THEN** aparecen el libro y la cita, y no la nota

#### Scenario: Filtrar por etiqueta y proyecto sin texto
- **WHEN** el usuario no escribe texto y filtra por el proyecto «Comunismo» y la etiqueta «Clases»
- **THEN** aparecen las notas, libros y recursos vinculados a «Comunismo» que tienen la etiqueta «Clases»

#### Scenario: Filtrar por libro
- **WHEN** el usuario filtra por el libro «El capital»
- **THEN** aparecen las notas y recursos vinculados a ese libro y las citas enlazadas a él

#### Scenario: Filtrar por fecha
- **WHEN** el usuario filtra por «modificado desde» el 1 de octubre de 2026
- **THEN** solo aparecen elementos modificados ese día o después

#### Scenario: Quitar filtros
- **WHEN** el usuario pulsa «Quitar filtros»
- **THEN** vuelve a ver los resultados de su búsqueda sin filtros adicionales
