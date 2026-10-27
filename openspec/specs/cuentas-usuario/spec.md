# cuentas-usuario Specification

## Purpose
Permite que cada persona acceda por internet a su propio archivo de conocimiento mediante una cuenta, garantizando que nadie más pueda ver ni modificar su contenido.

## Requirements

### Requirement: Registro de cuenta
**[Acordado]** El sistema SHALL permitir que una persona cree una cuenta con correo y contraseña. La cuenta MUST confirmarse mediante un enlace enviado al correo antes de poder entrar (decidido el 2026-10-27).

#### Scenario: Registro correcto
- **WHEN** una persona completa el registro con datos válidos
- **THEN** el sistema le indica que revise su correo para confirmar la cuenta

#### Scenario: Confirmación de la cuenta
- **WHEN** la persona abre el enlace de confirmación recibido
- **THEN** la cuenta queda activa y accede a un archivo de conocimiento vacío

#### Scenario: Entrada sin confirmar
- **WHEN** una persona intenta entrar con una cuenta que aún no ha confirmado
- **THEN** el sistema deniega el acceso y le recuerda que debe confirmar su correo

#### Scenario: Correo ya registrado
- **WHEN** una persona intenta registrarse con un correo que ya pertenece a otra cuenta
- **THEN** el sistema muestra el mismo mensaje que en un registro correcto, no crea una cuenta nueva y no revela que el correo ya existía

### Requirement: Inicio y cierre de sesión
**[Acordado]** El sistema SHALL exigir que el usuario inicie sesión para acceder a su contenido y SHALL permitirle cerrar la sesión. El inicio de sesión SHALL hacerse con correo electrónico y contraseña (decidido el 2026-10-26).

#### Scenario: Acceso sin sesión
- **WHEN** una persona sin sesión iniciada intenta abrir cualquier página de contenido
- **THEN** el sistema le pide que inicie sesión y no muestra ningún contenido

#### Scenario: Credenciales incorrectas
- **WHEN** una persona intenta iniciar sesión con credenciales no válidas
- **THEN** el sistema deniega el acceso sin revelar si el identificador existe

#### Scenario: Cierre de sesión
- **WHEN** el usuario cierra la sesión
- **THEN** el sistema deja de mostrar su contenido hasta que vuelva a iniciar sesión

### Requirement: Aislamiento de datos por usuario
**[Acordado]** El sistema MUST garantizar que cada usuario solo pueda ver, buscar, relacionar y modificar el contenido de su propia cuenta.

#### Scenario: Acceso a contenido ajeno
- **WHEN** un usuario intenta abrir una nota, libro, proyecto o recurso que pertenece a otra cuenta
- **THEN** el sistema deniega el acceso y no revela el contenido

#### Scenario: Relación con contenido ajeno
- **WHEN** un usuario intenta relacionar uno de sus elementos con un elemento de otra cuenta
- **THEN** el sistema rechaza la relación
