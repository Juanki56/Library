# Spec Delta

## Purpose

Recoge la dirección estética explorada (biblioteca clásica, archivo de conocimiento, cuaderno intelectual) y los criterios de legibilidad que la limitan. La identidad visual no está aprobada.

## ADDED Requirements

### Requirement: Legibilidad por encima de la ornamentación
**[Acordado]** La interfaz MUST priorizar la lectura, la escritura y la navegación cómodas. Ningún elemento decorativo SHALL reducir la legibilidad del texto ni el contraste necesario para leerlo.

#### Scenario: Texto legible sobre fondo decorado
- **WHEN** se muestra contenido de una nota sobre un fondo con tonos o motivos ornamentales
- **THEN** el texto mantiene un contraste suficiente para leerse con comodidad

### Requirement: Dirección estética exploratoria
**[Exploratorio]** Pendiente: "continuar explorando la propuesta visual de portada de libro antiguo". La dirección en exploración usa tonos pergamino y tierra, tipografía serif clásica y literaria, separadores elegantes y ornamentos discretos, sin reproducir literalmente un libro antiguo. MUST NOT considerarse aprobada sin confirmación explícita.

#### Scenario: Estilo aplicado de forma reversible
- **WHEN** se implementa la interfaz antes de aprobar la identidad visual
- **THEN** colores y tipografías se definen de forma centralizada para poder cambiarlos sin modificar cada pantalla

### Requirement: Inicio como portada de libro antiguo
**[Exploratorio]** La opción "A. Portada de libro antiguo" se eligió solo como primer concepto visual para explorar: encabezado protagonista, motivos ornamentales sutiles y composición serena y editorial. Esta elección MUST NOT tratarse como aprobación de la pantalla Inicio.

#### Scenario: Pantalla Inicio pendiente de aprobación
- **WHEN** se presenta un diseño de Inicio basado en esta opción
- **THEN** se presenta como exploración para revisión y no como diseño final
