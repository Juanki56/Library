# Proposal

## Why

Hace falta un espacio personal para estudiar temas, escribir lo aprendido y construir un archivo de conocimiento relacionado, sin que el estudio se convierta en un sistema de seguimiento de productividad. Este cambio traslada el documento de referencia `openspec/especificacion_app_estudio.md` a specs verificables antes de escribir código. Así queda claro qué está acordado y qué sigue pendiente.

## What Changes

- Se define una aplicación **web accesible por internet con cuenta de usuario**: cada persona ve únicamente su propio archivo de conocimiento. *(Decisión nueva tomada el 2026-10-26; no figuraba en el documento fuente.)*
- Se introducen las entidades centrales acordadas: **proyectos**, **notas**, **libros** y **fuentes y recursos**.
- Se establece la regla de **elemento canónico**: una nota o un recurso existe una sola vez y puede relacionarse con varios proyectos, libros o notas sin duplicarse.
- Se recogen como **propuestas para revisión** (no decisiones) las etiquetas, el glosario y las citas, frases y proverbios.
- Se recogen como **exploratorios** el editor de notas, la búsqueda avanzada, la estructura del menú y la identidad visual ("biblioteca clásica", Inicio como "portada de libro antiguo").
- Se fijan como requisitos las **exclusiones explícitas**: no hay sesiones de estudio ni registro de tiempo.

Convención usada en las specs: cada requisito indica su estado con una de estas etiquetas: **[Acordado]**, **[Propuesta para revisión]** o **[Exploratorio]**. Solo los requisitos [Acordado] pueden implementarse sin una nueva decisión explícita.

### Fuera de alcance

- Módulo de sesiones de estudio, cronómetros o seguimiento del tiempo dedicado.
- Historial de sesiones de lectura o estudio.
- Métricas de productividad basadas en duración, rachas y paneles de rendimiento.
- Mapa gráfico de conocimiento. Queda como posible idea futura; las relaciones se muestran mediante enlaces y listas.

### Decisiones pendientes

Copiadas de la sección 9 del documento fuente. Ninguna se resuelve por suposición en este cambio:

- [ ] Definir la estructura final del menú.
- [ ] Definir qué aparece en Inicio y cómo se organiza.
- [ ] Continuar explorando la propuesta visual de portada de libro antiguo.
- [ ] Acordar el alcance inicial del editor de notas.
- [ ] Definir la estructura de los proyectos.
- [ ] Definir los campos y tipos de libros.
- [ ] Definir los tipos de fuentes y recursos y sus datos.
- [ ] Definir cómo funcionan las etiquetas.
- [ ] Definir la estructura del glosario.
- [ ] Decidir dónde viven las citas, frases y proverbios.
- [ ] Decidir si la búsqueda avanzada forma parte de la primera versión.
- [ ] Definir cómo se muestran los elementos relacionados.
- [ ] Separar explícitamente los requisitos de primera versión de las ideas futuras.

Pendientes nuevas, derivadas de la decisión de plataforma:

- [x] Confirmar la pila tecnológica propuesta en `design.md`. Aprobada el 2026-10-26 y revisada el 2026-10-27: Next.js + Supabase (base de datos, Auth y RLS).
- [x] Definir el método de inicio de sesión. Decidido el 2026-10-26: correo y contraseña.
- [x] Definir qué ocurre con las relaciones cuando se elimina un elemento enlazado. Decidido el 2026-10-26: se borran solo los vínculos y se avisa antes.

## Capabilities

### New Capabilities

- `cuentas-usuario`: registro, inicio y cierre de sesión, y aislamiento de los datos de cada usuario.
- `proyectos`: proyectos de estudio que organizan un tema y agrupan notas, libros y recursos.
- `notas`: notas canónicas del archivo de conocimiento y sus metadatos.
- `libros`: libros como espacios propios con datos bibliográficos y contenido asociado.
- `fuentes-recursos`: materiales de estudio (páginas web, artículos…) creados una vez y reutilizables.
- `relaciones`: vínculos entre elementos sin duplicación y presentación de los elementos relacionados.
- `etiquetas`: clasificación transversal del contenido (propuesta para revisión).
- `glosario`: registro de palabras o conceptos y sus significados (propuesta para revisión).
- `citas`: citas, frases de autores y proverbios (propuesta para revisión; ubicación sin decidir).
- `editor-notas`: capacidades de edición del contenido de las notas (exploratorio).
- `busqueda`: búsqueda y filtrado del archivo de conocimiento (exploratorio).
- `navegacion`: estructura del menú y pantalla de Inicio (exploratorio).
- `identidad-visual`: dirección estética y criterios de legibilidad de la interfaz (exploratorio).
- `exclusiones-alcance`: funciones prohibidas de forma explícita, en particular el seguimiento del tiempo de estudio.

### Modified Capabilities

Ninguna. El proyecto todavía no tiene specs.

## Impact

- Proyecto nuevo: no hay código existente afectado.
- Se necesitará una aplicación web con servidor, base de datos persistente y autenticación (ver `design.md`).
- El documento fuente `openspec/especificacion_app_estudio.md` sigue siendo la referencia de producto. Las decisiones nuevas deben registrarse también allí.
