## MODIFIED Requirements

### Requirement: Mover bloques
**[Acordado]** El editor SHALL permitir mover el bloque donde está el cursor con botones de la barra y con el teclado (Alt+↑ y Alt+↓), y arrastrar cualquier bloque con el ratón desde un asa que aparece a su izquierda (decidido el 2026-10-28), sin cambiar su contenido. Dentro de una lista se mueve el elemento. El nuevo orden MUST guardarse como cualquier otro cambio.

#### Scenario: Subir un párrafo
- **WHEN** el usuario sitúa el cursor en el tercer párrafo de una nota y pulsa «Subir bloque»
- **THEN** ese párrafo pasa a ser el segundo, con el mismo texto y formato, y al reabrir la nota se conserva el nuevo orden

#### Scenario: Mover con el teclado
- **WHEN** el usuario pulsa Alt+↓ en un subtítulo seguido de un párrafo
- **THEN** el subtítulo queda debajo de ese párrafo y el cursor sigue en el subtítulo

#### Scenario: Mover un elemento de lista
- **WHEN** el usuario pulsa Alt+↑ en el segundo elemento de una lista
- **THEN** ese elemento pasa a ser el primero de la misma lista

#### Scenario: En el borde
- **WHEN** el usuario intenta subir el primer bloque de la nota
- **THEN** no cambia nada

#### Scenario: Arrastrar un párrafo
- **WHEN** el usuario pasa el ratón junto al primer párrafo y arrastra su asa debajo del tercero
- **THEN** el párrafo queda el último, con el mismo texto y formato, y al reabrir la nota se conserva el nuevo orden

#### Scenario: Arrastrar un elemento de lista
- **WHEN** el usuario arrastra el asa del último elemento de una lista encima del primero
- **THEN** ese elemento pasa a ser el primero de la lista

#### Scenario: Arrastrar una imagen
- **WHEN** el usuario arrastra el asa de una imagen debajo del párrafo siguiente
- **THEN** la imagen queda después de ese párrafo, con su texto alternativo y su pie
