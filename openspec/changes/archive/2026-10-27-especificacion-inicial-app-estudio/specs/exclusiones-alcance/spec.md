# Spec Delta

## Purpose

Fija como requisitos las funciones que la aplicación no debe incorporar, para mantener el foco en estudiar y registrar lo aprendido y no en medir cuánto tiempo se dedica.

## ADDED Requirements

### Requirement: Sin seguimiento del tiempo de estudio
**[Acordado]** El sistema MUST NOT incluir cronómetros, temporizadores ni ningún mecanismo para registrar el tiempo dedicado a estudiar o leer.

#### Scenario: Uso normal sin medición de tiempo
- **WHEN** el usuario crea, lee o edita notas, libros o recursos
- **THEN** el sistema no inicia, registra ni muestra ninguna medición del tiempo dedicado

### Requirement: Sin sesiones de estudio
**[Acordado]** El sistema MUST NOT incluir un módulo de sesiones de estudio ni un historial de sesiones de lectura o estudio.

#### Scenario: Navegación sin sesiones
- **WHEN** el usuario recorre cualquier sección de la aplicación
- **THEN** no existe ninguna sección, botón ni registro de sesiones de estudio

### Requirement: Sin métricas de productividad
**[Acordado]** El sistema MUST NOT mostrar métricas de productividad basadas en duración, rachas ni paneles de rendimiento.

#### Scenario: Pantalla de Inicio sin métricas
- **WHEN** el usuario abre la pantalla de Inicio
- **THEN** no aparecen rachas, contadores de tiempo ni indicadores de rendimiento

### Requirement: Cambios de alcance solo con decisión explícita
**[Acordado]** Ningún módulo, métrica o función que altere el alcance SHALL añadirse sin una decisión explícita registrada en el documento de especificación. El mapa gráfico de conocimiento queda como idea futura y MUST NOT implementarse en esta versión.

#### Scenario: Relaciones sin mapa gráfico
- **WHEN** el usuario consulta las relaciones de un elemento
- **THEN** el sistema las muestra mediante enlaces y listas, no mediante un mapa gráfico
