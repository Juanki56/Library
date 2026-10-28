## ADDED Requirements

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

## REMOVED Requirements

### Requirement: Campos bibliográficos y tipos de libro
**Reason**: El 2026-10-28 el usuario decidió los campos del libro (§2.3 del documento de especificación); la propuesta provisional deja de aplicarse. Los tipos de libro siguen sin decidirse y no se implementan.
**Migration**: Ver «Campos del libro», «ISBN válido», «Estado de lectura» y «Portada del libro».
