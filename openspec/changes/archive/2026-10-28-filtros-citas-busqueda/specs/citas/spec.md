## ADDED Requirements

### Requirement: Filtros de la sección Citas
**[Acordado]** La sección Citas SHALL permitir filtrar por tipo (cita, frase de autor o proverbio) y por autor, elegido entre los autores de las citas del usuario o «Sin autor». Los dos filtros se combinan, sin distinguir mayúsculas ni tildes en el autor, y se conservan en la dirección de la página.

#### Scenario: Solo proverbios
- **WHEN** el usuario tiene citas, frases y proverbios y filtra por «Proverbios»
- **THEN** solo se muestran los proverbios

#### Scenario: Citas de un autor
- **WHEN** el usuario elige el autor «Karl Marx» y tiene citas de Marx y de Horacio
- **THEN** solo se muestran las de Marx, aunque alguna esté escrita «karl marx»

#### Scenario: Sin autor
- **WHEN** el usuario elige «Sin autor»
- **THEN** solo se muestran las citas sin autor

#### Scenario: Filtros combinados
- **WHEN** el usuario filtra por «Frases de autor» y el autor «Karl Marx»
- **THEN** solo se muestran las frases de autor de Marx, y si no hay ninguna se indica que no hay citas con esos filtros
