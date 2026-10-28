## MODIFIED Requirements

### Requirement: Funciones del editor por fases
**[Acordado]** Las funciones del editor que no están implementadas se añaden por fases acordadas: imágenes y vídeos de YouTube y Vimeo (fase 3), y mover bloques, índice de la nota y tablas (fase 4). Ninguna MUST implementarse antes de aprobar el cambio de su fase. Los bloques de código y subir vídeos propios quedan fuera. Las referencias a notas (fase 2) ya forman parte del editor.

#### Scenario: Función de una fase futura no incluida
- **WHEN** se usa el editor de esta fase
- **THEN** no ofrece insertar imágenes, vídeos ni tablas

## ADDED Requirements

### Requirement: Referencias a otras notas
**[Acordado]** El editor SHALL permitir insertar en el texto una referencia a otra nota del mismo usuario, elegida por su título. La referencia MUST guardar solo el tipo y el identificador del elemento referido (en esta fase, solo notas), sin copiar su contenido ni su título, y MUST mostrar siempre el título actual.

#### Scenario: Insertar una referencia
- **WHEN** el usuario elige «Referencia a una nota» en el menú «/» o en la barra de formato, busca «manifiesto» y elige la nota «El Manifiesto comunista»
- **THEN** la nota muestra una referencia con el título «El Manifiesto comunista» y al reabrirla la referencia se conserva

#### Scenario: Búsqueda sin tildes
- **WHEN** el usuario busca «historia economica» en el cuadro de referencias
- **THEN** aparece la nota «Historia económica»

#### Scenario: Título actualizado
- **WHEN** una nota referencia a otra y después se cambia el título de la nota referida
- **THEN** al abrir la primera nota la referencia muestra el título nuevo

#### Scenario: Abrir la nota referida
- **WHEN** el usuario pulsa una referencia
- **THEN** se abre la nota referida

#### Scenario: Nota referida eliminada
- **WHEN** se elimina una nota que otra nota referencia
- **THEN** la referencia se muestra como «Nota eliminada», sin enlace, y el resto del contenido de la nota no cambia

#### Scenario: Referencia no válida descartada
- **WHEN** llega al servidor una referencia con un identificador mal formado o de un tipo no admitido
- **THEN** esa referencia no se guarda y el resto del contenido sí

#### Scenario: Notas de otro usuario
- **WHEN** el contenido de una nota incluye el identificador de una nota de otro usuario
- **THEN** no se muestra su título ni aparece en las menciones de esa nota

### Requirement: Notas que la mencionan
**[Acordado]** Cada nota SHALL mostrar una sección «Notas que la mencionan» con las notas del mismo usuario que contienen una referencia a ella, cada una una sola vez, con su título actual y un enlace para abrirla. La lista MUST reflejar el contenido guardado: al quitar o añadir una referencia y guardarse la nota, la lista de la nota referida se actualiza. Una nota no aparece en su propia lista.

#### Scenario: Mención visible
- **WHEN** la nota «Lucha de clases» referencia dos veces a «El Manifiesto comunista»
- **THEN** la sección «Notas que la mencionan» de «El Manifiesto comunista» muestra «Lucha de clases» una sola vez, con enlace

#### Scenario: Quitar la referencia
- **WHEN** el usuario borra la referencia de «Lucha de clases» y la nota se guarda
- **THEN** «Lucha de clases» deja de aparecer en «Notas que la mencionan» de «El Manifiesto comunista»

#### Scenario: Sin menciones
- **WHEN** ninguna nota referencia a una nota
- **THEN** la sección indica que ninguna nota la menciona todavía
