# libros Specification

## Purpose
Cada libro funciona como un espacio propio que reúne sus datos bibliográficos y el contenido asociado (notas, citas, ideas, preguntas y reflexiones), conectado con los proyectos en los que se estudia.

## Requirements

### Requirement: Gestión de libros
**[Acordado]** El sistema SHALL permitir al usuario crear, consultar, editar y eliminar libros, cada uno con al menos un título.

#### Scenario: Crear un libro
- **WHEN** el usuario crea el libro "El manifiesto comunista"
- **THEN** el libro aparece en su lista de libros y tiene su propia página

### Requirement: Página propia del libro
**[Acordado]** La página de un libro SHALL mostrar sus datos bibliográficos y el contenido relacionado: notas, recursos y proyectos.

#### Scenario: Consultar notas desde el libro
- **WHEN** el usuario abre "El manifiesto comunista", que está relacionado con la nota "La lucha de clases"
- **THEN** la página del libro muestra esa nota, y se trata de la misma nota canónica que aparece en los proyectos

### Requirement: Relación con proyectos
**[Acordado]** Un libro SHALL poder relacionarse con uno o varios proyectos sin duplicarse.

#### Scenario: Libro en dos proyectos
- **WHEN** el usuario relaciona "El manifiesto comunista" con los proyectos "Comunismo" e "Historia social"
- **THEN** ambos proyectos muestran el mismo libro y la lista de libros lo contiene una sola vez

### Requirement: Campos del libro
**[Acordado]** Un libro SHALL tener título obligatorio y, opcionalmente, autor o autores, descripción, editorial, año de publicación, ISBN, portada y estado de lectura, además de sus etiquetas y relaciones. Las antiguas «notas bibliográficas» MUST conservarse como descripción.

#### Scenario: Libro con solo título
- **WHEN** el usuario crea un libro indicando solo el título
- **THEN** el sistema lo guarda y deja vacíos los demás campos

#### Scenario: Libro completo
- **WHEN** el usuario guarda «El capital» con autor «Karl Marx», descripción, editorial «Siglo XXI», año 1867 e ISBN 978-84-323-0291-6
- **THEN** al reabrir el libro se ven todos esos datos

#### Scenario: Notas bibliográficas existentes
- **WHEN** un libro guardado antes tenía notas bibliográficas
- **THEN** ese texto aparece como su descripción

### Requirement: ISBN válido
**[Acordado]** El ISBN SHALL admitirse como ISBN-10 o ISBN-13, con o sin guiones ni espacios, y MUST rechazarse si su dígito de control no es correcto, con el aviso «El ISBN no es válido.».

#### Scenario: ISBN con guiones
- **WHEN** el usuario escribe el ISBN «978-84-323-0291-6»
- **THEN** se guarda y se muestra

#### Scenario: ISBN incorrecto
- **WHEN** el usuario escribe el ISBN «978-84-323-0291-3»
- **THEN** recibe el aviso «El ISBN no es válido.» y el libro no se guarda con ese dato

### Requirement: Estado de lectura
**[Acordado]** Un libro SHALL poder tener el estado de lectura «Por leer», «Leyendo» o «Leído», o no tener ninguno. El estado MUST mostrarse en la lista de libros y en la página del libro.

#### Scenario: Marcar como leyendo
- **WHEN** el usuario cambia el estado de un libro a «Leyendo»
- **THEN** la lista de libros lo muestra como «Leyendo»

#### Scenario: Libro solo como referencia
- **WHEN** el usuario no elige ningún estado
- **THEN** el libro se guarda sin estado y no se muestra ninguno

### Requirement: Portada del libro
**[Acordado]** Un libro SHALL poder tener una portada subida (PNG, JPEG, GIF o WebP de hasta 5 MB, privada para su propietario) o indicada por una dirección web (http o https), que se muestra en su página. Al cambiarla, quitarla o eliminar el libro, la portada subida MUST borrarse del almacenamiento.

#### Scenario: Subir una portada
- **WHEN** el usuario sube una imagen PNG como portada
- **THEN** la página del libro la muestra, también al reabrirla

#### Scenario: Portada desde la web
- **WHEN** el usuario indica la dirección https de una portada
- **THEN** la página del libro la muestra desde esa dirección

#### Scenario: Cambiar o quitar la portada
- **WHEN** el usuario sube otra portada o quita la actual
- **THEN** la imagen subida anterior se borra del almacenamiento

#### Scenario: Archivo no válido
- **WHEN** el usuario sube como portada un archivo que no es una imagen admitida o pesa más de 5 MB
- **THEN** recibe un aviso y la portada no cambia
