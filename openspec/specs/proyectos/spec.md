# proyectos Specification

## Purpose
Los proyectos de estudio organizan el trabajo sobre un tema o área de interés (por ejemplo, "Comunismo" o "Estudiar filosofía"), reúnen las notas, libros y recursos relevantes y pueden dividirse en apartados ordenados para estructurar ese contenido sin duplicarlo.

## Requirements

### Requirement: Gestión de proyectos
**[Acordado]** El sistema SHALL permitir al usuario crear, consultar, renombrar y eliminar proyectos de estudio, cada uno con al menos un nombre.

#### Scenario: Crear un proyecto
- **WHEN** el usuario crea un proyecto llamado "Comunismo"
- **THEN** el proyecto aparece en su lista de proyectos

### Requirement: Contenido relacionado del proyecto
**[Acordado]** La página de un proyecto SHALL mostrar las notas, libros y fuentes o recursos relacionados con él, organizados en sus apartados en el orden elegido, más un grupo «Sin apartado» con los elementos que no están en ninguno.

#### Scenario: Ver contenido del proyecto
- **WHEN** el usuario abre el proyecto "Comunismo", relacionado con la nota "La lucha de clases" y el libro "El manifiesto comunista"
- **THEN** la página del proyecto muestra esa nota y ese libro como elementos relacionados

#### Scenario: Contenido organizado por apartados
- **WHEN** el usuario abre «Estudiar filosofía», con una nota de Platón en «Filosofía antigua» y un libro en ningún apartado
- **THEN** la nota aparece en «1. Filosofía antigua» y el libro en «Sin apartado»

### Requirement: Estructura detallada del proyecto
**[Acordado]** Un proyecto SHALL tener nombre, descripción opcional en texto libre y, opcionalmente, apartados para organizar su contenido. Los apartados tienen un solo nivel: un apartado MUST NOT contener otros apartados.

#### Scenario: Proyecto con descripción opcional
- **WHEN** el usuario crea un proyecto sin descripción
- **THEN** el sistema lo guarda correctamente con solo su nombre

#### Scenario: Proyecto sin apartados
- **WHEN** el usuario no crea ningún apartado en un proyecto
- **THEN** todo su contenido aparece en «Sin apartado» y el proyecto funciona igual que antes

### Requirement: Gestión de apartados
**[Acordado]** El usuario SHALL poder crear, editar y eliminar apartados dentro de un proyecto. Cada apartado tiene un título obligatorio y una descripción breve opcional.

#### Scenario: Crear apartados
- **WHEN** el usuario crea en «Estudiar filosofía» los apartados «Filosofía antigua», «Filosofía moderna» y «Ética»
- **THEN** el proyecto muestra los tres apartados numerados 1, 2 y 3 en ese orden

#### Scenario: Título vacío
- **WHEN** el usuario intenta crear un apartado sin título
- **THEN** el sistema no lo guarda e indica que el título es obligatorio

### Requirement: Orden manual de los apartados
**[Acordado]** Los apartados SHALL mostrarse en el orden que elija el usuario, numerados desde 1, y el usuario SHALL poder subir o bajar cada apartado una posición.

#### Scenario: Subir un apartado
- **WHEN** el usuario sube «Ética» por encima de «Filosofía moderna»
- **THEN** el orden queda: 1. Filosofía antigua, 2. Ética, 3. Filosofía moderna

### Requirement: Elementos en varios apartados sin duplicarse
**[Acordado]** Una nota, libro o recurso del proyecto SHALL poder estar en uno o varios apartados del mismo proyecto, siempre como el mismo elemento y no como una copia. Quitarlo de un apartado MUST NOT quitarlo del proyecto ni borrarlo.

#### Scenario: Nota en dos apartados
- **WHEN** el usuario coloca la nota «Kant y el deber» en «Filosofía moderna» y en «Ética»
- **THEN** la nota aparece en ambos apartados, y un cambio en ella se ve en los dos

#### Scenario: Añadir un elemento que no estaba en el proyecto
- **WHEN** el usuario añade a «Ética» un libro que aún no estaba vinculado al proyecto
- **THEN** el libro queda vinculado al proyecto y aparece en «Ética»

#### Scenario: Quitar de un apartado
- **WHEN** el usuario quita una nota de su único apartado
- **THEN** la nota sigue en el proyecto, en «Sin apartado»

### Requirement: Eliminar un apartado sin perder contenido
**[Acordado]** Eliminar un apartado SHALL conservar todo su contenido en el proyecto. Los elementos que no estén en otro apartado pasan a «Sin apartado». Antes de confirmar, el sistema MUST avisar de cuántos elementos contiene el apartado.

#### Scenario: Eliminar con aviso
- **WHEN** el usuario pide eliminar «Ética», que contiene dos notas y un libro
- **THEN** el sistema avisa de que los tres elementos seguirán en el proyecto y, tras confirmar, aparecen en «Sin apartado» o en sus otros apartados
