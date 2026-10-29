# citas Specification

## Purpose
Sección propia para guardar citas, frases de autor y proverbios, con autor y origen opcionales y un enlace opcional a un libro o recurso, sin duplicar la cita.

## Requirements

### Requirement: Sección de citas
**[Acordado]** El sistema SHALL ofrecer una sección propia de citas, accesible desde el menú principal, donde el usuario guarda citas, frases de autores y proverbios directamente, sin tener que asociarlos a un proyecto, libro o nota.

#### Scenario: Guardar una cita sin asociarla
- **WHEN** el usuario crea una cita escribiendo solo su texto
- **THEN** la cita queda guardada y aparece en la sección de citas sin pedir ningún vínculo

### Requirement: Contenido de una cita
**[Acordado]** Cada cita SHALL tener un texto obligatorio, un tipo (cita, frase de autor o proverbio; por defecto «cita»), un autor opcional y una fuente u origen opcional en texto libre.

#### Scenario: Tipo por defecto
- **WHEN** el usuario guarda una cita sin elegir tipo
- **THEN** la cita queda registrada como «cita»

#### Scenario: Texto vacío
- **WHEN** el usuario intenta guardar una cita sin texto
- **THEN** el sistema no la guarda e indica que el texto es obligatorio

### Requirement: Autor u origen desconocidos
**[Acordado]** El sistema SHALL permitir guardar citas sin autor ni origen y MUST mostrar «Sin autor» o «Sin origen» en su lugar, sin inventar ninguno.

#### Scenario: Proverbio popular
- **WHEN** el usuario guarda el proverbio «Poco a poco se va lejos» sin autor ni origen
- **THEN** la cita se muestra con «Sin autor» y «Sin origen»

### Requirement: Enlace opcional con un libro o recurso
**[Acordado]** Una cita SHALL poder enlazarse, de forma opcional, con un único libro o un único recurso ya guardado del mismo usuario, además de su fuente en texto libre. El enlace MUST NOT ser obligatorio.

#### Scenario: Cita enlazada a un libro
- **WHEN** el usuario guarda una cita y la enlaza al libro «Tesis sobre Feuerbach»
- **THEN** la cita conserva su propia entrada en la sección de citas y queda enlazada a ese libro

#### Scenario: Libro y recurso a la vez
- **WHEN** el usuario intenta enlazar una misma cita a un libro y a un recurso a la vez
- **THEN** el sistema solo permite uno de los dos enlaces

### Requirement: Consulta, edición y eliminación de citas
**[Acordado]** El sistema SHALL permitir consultar, editar y eliminar citas. La lista de citas SHALL mostrar primero las más recientes.

#### Scenario: Orden de la lista
- **WHEN** el usuario abre la sección de citas
- **THEN** la cita guardada más recientemente aparece la primera

#### Scenario: Eliminar una cita enlazada
- **WHEN** el usuario elimina una cita enlazada a un libro
- **THEN** la cita desaparece y el libro sigue existiendo

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
