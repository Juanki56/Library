# Spec Delta

## Purpose

Describe cómo se escribe y da formato al contenido de las notas. El editor forma parte del concepto, pero su alcance exacto no está cerrado; aquí se separa un mínimo propuesto de las funciones solo exploradas.

## ADDED Requirements

### Requirement: Escritura de contenido en notas
**[Acordado]** El sistema SHALL ofrecer un editor que permita escribir y modificar el contenido de una nota de forma cómoda para la lectura y la escritura.

#### Scenario: Escribir y guardar
- **WHEN** el usuario escribe texto en una nota y guarda
- **THEN** el contenido se conserva tal como lo escribió

### Requirement: Alcance mínimo propuesto del editor
**[Propuesta para revisión]** Pendiente: "acordar el alcance inicial del editor de notas". Se propone como mínimo para la primera versión: títulos y subtítulos, negrita, cursiva, listas, citas en bloque y enlaces. Este alcance MUST confirmarse antes de implementarse.

#### Scenario: Formato básico conservado
- **WHEN** el usuario aplica un subtítulo, una lista y una cita en bloque y guarda la nota
- **THEN** al reabrirla el formato se mantiene

### Requirement: Funciones de edición exploradas
**[Exploratorio]** Subrayado, separadores, imágenes, movimiento de secciones y enlaces internos a notas, proyectos, libros y recursos se han explorado, pero no están comprometidos. Ninguna de estas funciones MUST implementarse sin decisión explícita.

#### Scenario: Función exploratoria no incluida por defecto
- **WHEN** se implementa el editor sin una decisión sobre las funciones exploradas
- **THEN** el editor no incluye esas funciones
