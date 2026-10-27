# Spec Delta

## MODIFIED Requirements

### Requirement: Eliminación de un elemento vinculado
**[Acordado]** Al eliminar un elemento, el sistema SHALL eliminar también todos sus vínculos sin borrar los elementos relacionados, y SHALL advertir al usuario de cuántas relaciones se perderán antes de confirmar. Si el elemento es un libro o un recurso con citas enlazadas, el aviso SHALL indicar también cuántas citas perderán su enlace; esas citas MUST NOT borrarse.

#### Scenario: Eliminar un proyecto con notas
- **WHEN** el usuario confirma la eliminación de un proyecto que tiene notas vinculadas
- **THEN** el proyecto desaparece y las notas siguen existiendo con sus demás vínculos

#### Scenario: Eliminar un libro con citas enlazadas
- **WHEN** el usuario pide eliminar un libro con dos citas enlazadas
- **THEN** el aviso indica que dos citas perderán su enlace, y tras confirmar las citas siguen existiendo sin enlace

## ADDED Requirements

### Requirement: Citas visibles en su libro o recurso
**[Acordado]** La página de un libro o de un recurso SHALL mostrar las citas enlazadas a él. Cada cita aparece una sola vez y es la misma que figura en la sección de citas: no es una copia.

#### Scenario: Cita en la página del libro
- **WHEN** el usuario abre un libro con una cita enlazada
- **THEN** la página del libro muestra la cita con su autor, y al editarla desde Citas el cambio también se ve en el libro
