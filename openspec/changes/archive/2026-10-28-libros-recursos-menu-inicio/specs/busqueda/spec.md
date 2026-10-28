## MODIFIED Requirements

### Requirement: Campos de búsqueda por tipo
**[Acordado]** La búsqueda SHALL usar, por tipo: proyecto (nombre y descripción), nota (título y texto), libro (título, autores y descripción, antes llamada «notas bibliográficas»), recurso (título, autor o creador y descripción), cita (texto, autor y fuente u origen) y término (término, definición, ejemplo e información adicional).

#### Scenario: Buscar por autor
- **WHEN** el usuario busca «Marx» y tiene un libro de Karl Marx y una cita de Marx
- **THEN** aparecen el libro y la cita, aunque «Marx» no esté en sus títulos

#### Scenario: Campo no incluido
- **WHEN** el usuario busca el nombre de una editorial que solo figura en ese campo de un libro
- **THEN** el libro no aparece por esa coincidencia
