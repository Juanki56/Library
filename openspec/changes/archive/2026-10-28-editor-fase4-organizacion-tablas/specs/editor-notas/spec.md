## MODIFIED Requirements

### Requirement: Alcance inicial del editor
**[Acordado]** El editor SHALL ofrecer títulos y subtítulos, negrita, cursiva, subrayado, resaltado, listas con viñetas, numeradas y de tareas, citas en bloque, separadores y enlaces web (http/https). Cualquier otro formato MUST descartarse al guardar (decidido el 2026-10-27).

#### Scenario: Enlace no web rechazado
- **WHEN** el usuario intenta añadir un enlace que no empieza por http:// o https://
- **THEN** el enlace no se guarda en la nota

#### Scenario: Formato básico conservado
- **WHEN** el usuario aplica un subtítulo, una lista y una cita en bloque y guarda la nota
- **THEN** al reabrirla el formato se mantiene

#### Scenario: Formatos nuevos conservados
- **WHEN** el usuario aplica subrayado y resaltado a un texto, inserta un separador y crea una lista de tareas con una tarea marcada
- **THEN** al reabrir la nota se conservan el subrayado, el resaltado, el separador, la lista de tareas y la tarea marcada

#### Scenario: Formato no permitido descartado
- **WHEN** llega al servidor contenido con un formato fuera del alcance, como un bloque de código
- **THEN** ese formato no se guarda y el resto del contenido sí

### Requirement: Funciones del editor por fases
**[Acordado]** Las cuatro fases acordadas del editor están implementadas: escritura (fase 1), referencias a notas (fase 2), imágenes y vídeos (fase 3), y mover bloques, índice de la nota y tablas (fase 4). Los bloques de código y subir vídeos propios quedan fuera; cualquier función nueva MUST acordarse antes de implementarse.

#### Scenario: Función de una fase futura no incluida
- **WHEN** se usa el editor
- **THEN** no ofrece insertar bloques de código ni subir vídeos propios

## ADDED Requirements

### Requirement: Mover bloques
**[Acordado]** El editor SHALL permitir subir o bajar el bloque donde está el cursor, con botones de la barra y con el teclado (Alt+↑ y Alt+↓), sin cambiar su contenido. Dentro de una lista se mueve el elemento entre los de su lista. El nuevo orden MUST guardarse como cualquier otro cambio.

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

### Requirement: Índice de la nota
**[Acordado]** Si la nota tiene subtítulos, SHALL mostrarse un índice con sus subtítulos y subtítulos menores, en el orden del texto y con los menores sangrados. Pulsar una entrada MUST llevar a ese subtítulo. El índice se actualiza mientras se escribe y no se guarda como contenido. Si la nota no tiene subtítulos, no se muestra.

#### Scenario: Índice de una nota con subtítulos
- **WHEN** una nota tiene los subtítulos «Contexto» y «Tesis» y el subtítulo menor «Primera tesis» bajo «Tesis»
- **THEN** el índice muestra «Contexto», «Tesis» y, sangrado, «Primera tesis»

#### Scenario: Ir a un subtítulo
- **WHEN** el usuario pulsa «Tesis» en el índice
- **THEN** el editor lleva el cursor a ese subtítulo y lo muestra en pantalla

#### Scenario: Índice actualizado al escribir
- **WHEN** el usuario añade un subtítulo nuevo
- **THEN** aparece en el índice sin recargar la página

#### Scenario: Nota sin subtítulos
- **WHEN** una nota no tiene subtítulos
- **THEN** no se muestra índice

### Requirement: Tablas
**[Acordado]** El editor SHALL permitir insertar una tabla con fila de encabezado, añadir y eliminar filas y columnas, y eliminar la tabla. Las celdas admiten texto con el formato permitido en la nota. La tabla MUST conservarse al reabrir la nota y el texto de sus celdas MUST poder encontrarse con la búsqueda.

#### Scenario: Insertar y rellenar una tabla
- **WHEN** el usuario inserta una tabla, escribe «Autor» en el encabezado y «Marx» en la primera celda, y la nota se guarda
- **THEN** al reabrirla la tabla tiene ese encabezado y esa celda

#### Scenario: Añadir y eliminar filas y columnas
- **WHEN** el usuario añade una fila y una columna a una tabla de 3 × 3 y después elimina la tabla
- **THEN** la tabla pasa a ser de 4 × 4 y, al eliminarla, desaparece sin afectar al resto de la nota

#### Scenario: Tabla manipulada
- **WHEN** llega al servidor una tabla con atributos o nodos no permitidos
- **THEN** se descartan esos atributos y nodos y se conserva el resto de la tabla
