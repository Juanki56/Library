# editor-notas Specification

## Purpose
Describe cómo se escribe y da formato al contenido de las notas. El editor forma parte del concepto, pero su alcance exacto no está cerrado; aquí se separa un mínimo propuesto de las funciones solo exploradas.

## Requirements

### Requirement: Escritura de contenido en notas
**[Acordado]** El sistema SHALL ofrecer un editor que permita escribir y modificar el contenido de una nota de forma cómoda para la lectura y la escritura.

#### Scenario: Escribir y guardar
- **WHEN** el usuario escribe texto en una nota y guarda
- **THEN** el contenido se conserva tal como lo escribió

### Requirement: Alcance inicial del editor
**[Acordado]** El editor de la primera versión SHALL ofrecer títulos y subtítulos, negrita, cursiva, listas (con viñetas y numeradas), citas en bloque y enlaces web (http/https), y nada más (decidido el 2026-10-27).

#### Scenario: Enlace no web rechazado
- **WHEN** el usuario intenta añadir un enlace que no empieza por http:// o https://
- **THEN** el enlace no se guarda en la nota

#### Scenario: Formato básico conservado
- **WHEN** el usuario aplica un subtítulo, una lista y una cita en bloque y guarda la nota
- **THEN** al reabrirla el formato se mantiene

### Requirement: Funciones de edición exploradas
**[Exploratorio]** Subrayado, separadores, imágenes, movimiento de secciones y enlaces internos a notas, proyectos, libros y recursos se han explorado, pero no están comprometidos. Ninguna de estas funciones MUST implementarse sin decisión explícita.

#### Scenario: Función exploratoria no incluida por defecto
- **WHEN** se implementa el editor sin una decisión sobre las funciones exploradas
- **THEN** el editor no incluye esas funciones
