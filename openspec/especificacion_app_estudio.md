# Especificación de la aplicación de estudio y archivo de conocimiento

**Estado del documento:** borrador de trabajo  
**Propósito:** documentar las decisiones conocidas, las exploraciones visuales y las cuestiones pendientes.  
**Regla principal:** lo exploratorio no equivale a una aprobación final.

---

## 1. Propósito del producto

La aplicación será un espacio personal para estudiar temas, escribir lo aprendido, organizar notas y construir progresivamente un archivo de conocimiento relacionado.

Debe ayudar a profundizar en temas y conservar ideas, explicaciones, citas, preguntas, libros y recursos útiles. No debe convertir el estudio en un sistema de seguimiento de productividad.

### Principios de producto

- El conocimiento y el contenido son el centro de la aplicación.
- La organización debe ser flexible y sencilla.
- Una misma nota puede relacionarse con varios proyectos, libros o recursos sin duplicar su contenido.
- La interfaz debe facilitar la lectura, la escritura y la consulta.
- Las decisiones no confirmadas deben permanecer explícitamente pendientes.

## 2. Funcionalidad acordada

### 2.1 Proyectos de estudio

Los proyectos sirven para organizar el estudio de un tema o área de interés. Ejemplo: **Comunismo** o **Historia social**.

Un proyecto puede relacionarse con notas, libros y fuentes o recursos relevantes.

### 2.2 Notas

Las notas son piezas centrales del archivo de conocimiento. Pueden contener explicaciones, aprendizajes, ideas, preguntas, reflexiones y referencias.

Una nota puede estar relacionada con varios proyectos, libros o recursos. Debe existir una sola nota canónica: si aparece dentro de varios espacios, se trata de la misma nota, no de copias independientes.

Ejemplo: una nota titulada **La lucha de clases** puede estar vinculada a los proyectos *Comunismo* e *Historia social* y al libro *El manifiesto comunista*.

Las fechas de creación o modificación pueden utilizarse como metadatos para ordenar o consultar notas. **No representan tiempo dedicado al estudio.**

### 2.3 Libros

Cada libro funciona como un espacio propio dentro de la aplicación y puede incluir información bibliográfica, notas, citas, ideas, preguntas y reflexiones relacionadas con su contenido.

Un libro puede conectarse con uno o varios proyectos. Sus notas relacionadas deben seguir siendo notas únicas, aunque se consulten desde la página del libro o desde un proyecto.

Ejemplo: *El manifiesto comunista* puede tener sus propios datos bibliográficos y contenido asociado, y estar relacionado con el proyecto *Comunismo*.

### 2.4 Fuentes y recursos

Las fuentes y recursos permiten guardar materiales utilizados o considerados relevantes para estudiar: por ejemplo, páginas web, artículos u otros materiales.

Un recurso debe crearse una sola vez y poder relacionarse con varios proyectos, libros o notas. Al consultarlo desde distintos espacios, no debe duplicarse.

La forma exacta de gestionar los tipos de recurso y los datos bibliográficos queda pendiente de especificación.

### 2.5 Etiquetas

Las etiquetas permiten clasificar y relacionar contenido de la aplicación. Su funcionamiento detallado —por ejemplo, qué tipos de elementos admiten etiquetas y cómo se administran— está pendiente de definición.

### 2.6 Glosario

Se contempla una sección propia de glosario para registrar palabras o conceptos nuevos y sus significados.

La estructura de cada entrada y su relación con notas, proyectos y libros todavía deben definirse.

### 2.7 Citas, frases y proverbios

Se ha contemplado la posibilidad de guardar citas, frases de autores y proverbios. La decisión pendiente es cómo organizarlos dentro de la aplicación y si tendrán una sección propia o estarán integrados en libros, notas u otro espacio.

No debe darse por definida su ubicación en el menú.

## 3. Editor de notas: pendiente de detalle

El editor forma parte del concepto de la aplicación, pero su alcance exacto no está cerrado.

Entre las posibilidades que se han explorado están:

- Formato de texto enriquecido.
- Títulos y subtítulos.
- Negrita, cursiva y subrayado.
- Listas y citas en bloque.
- Separadores.
- Imágenes y enlaces.
- Organización o movimiento de secciones del contenido.
- Enlaces a notas, proyectos, libros y recursos relacionados.

Esta lista es una exploración, no una promesa de que todas las funciones estarán en la primera versión. Antes de implementar, hay que acordar el nivel de edición necesario.

## 4. Búsqueda y navegación

Se ha considerado una búsqueda avanzada, pero no está aprobada como requisito definitivo.

Posibles criterios explorados: título y contenido, tipo de elemento, proyecto, etiqueta, autor o libro.

Si una nota está vinculada a varios espacios, los resultados deben identificarla como un único elemento y mostrar sus relaciones, en vez de presentar copias duplicadas.

La navegación exacta y los filtros que estarán disponibles deben definirse más adelante.

## 5. Exclusiones explícitas

La aplicación **no** debe incorporar un módulo de sesiones de estudio ni funciones cuyo propósito sea registrar cuánto tiempo se estudia.

En particular, no se deben introducir sin una nueva decisión explícita:

- Cronómetros de estudio o seguimiento del tiempo dedicado.
- Historial de sesiones de lectura o estudio.
- Métricas de productividad basadas en duración.
- Paneles de rendimiento o rachas que desplacen el foco del conocimiento.

La aplicación se centra en estudiar y registrar lo aprendido, no en medir cuánto tiempo se dedicó.

Un mapa gráfico de conocimiento se dejó como posible idea futura, no como requisito actual. La prioridad es mostrar relaciones mediante enlaces y listas de elementos relacionados.

## 6. Menú: propuesta todavía no aprobada

Se exploró esta posible estructura:

- Inicio
- Proyectos
- Libros
- Notas
- Fuentes y recursos
- Etiquetas
- Glosario

Esta lista es una propuesta de trabajo, no una decisión definitiva. La ubicación de las citas, frases y proverbios, así como la estructura final del menú, siguen pendientes.

## 7. Dirección visual exploratoria

**Estado: exploración, no aprobación final.**

Se están explorando estas referencias:

- **Estética:** biblioteca clásica.
- **Personalidad:** archivo de conocimiento.
- **Sensación de lectura:** cuaderno intelectual.
- **Paleta:** pergamino y tonos tierra.
- **Tipografía:** clásica y literaria.
- **Carácter visual:** clásico ornamental.

### Interpretación visual provisional

La interfaz podría inspirarse en libros antiguos, archivos personales y ediciones literarias: tonos cálidos, tipografía serif, separadores elegantes y ornamentos discretos.

La ornamentación no debe perjudicar la legibilidad ni convertir la interfaz en una reproducción literal de un libro antiguo. La aplicación debe seguir siendo cómoda para escribir, leer y navegar.

### Exploración de Inicio seleccionada

Se eligió explorar la opción **A. Portada de libro antiguo** como punto de partida visual.

La idea provisional incluye:

- Un encabezado protagonista con tipografía clásica.
- Líneas o motivos ornamentales sutiles.
- Tonos pergamino y tierra con contraste suficiente.
- Una composición serena y editorial.

**Importante:** elegir esta opción solo indica qué concepto visual explorar primero. No aprueba la pantalla Inicio, su estructura, su contenido ni el diseño completo de la aplicación.

## 8. Reglas para diseño e implementación

Quien diseñe o implemente la aplicación debe:

1. Distinguir las decisiones acordadas de las ideas exploratorias.
2. No convertir una posibilidad mencionada en un requisito aprobado.
3. No añadir módulos, métricas o funciones por iniciativa propia si alteran el alcance.
4. Mantener una única versión canónica de cada nota o recurso, aunque tenga varias relaciones.
5. Priorizar la lectura, la escritura y la organización del conocimiento.
6. Mantener las decisiones pendientes visibles y solicitar aclaración cuando sean necesarias para avanzar.
7. No considerar aprobada la identidad visual ni la estructura de Inicio hasta que se confirmen explícitamente.

## 9. Decisiones pendientes

Esta lista se debe actualizar conforme se avance, sin resolver los puntos por suposición.

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

### Registro de decisiones

- **2026-10-26 — Plataforma:** la aplicación será web, accesible por internet y con cuenta de usuario; cada persona ve solo su propio contenido. Motivo: elección del usuario al preparar las specs en OpenSpec (cambio `especificacion-inicial-app-estudio`). 
- **2026-10-26 — Tecnología:** Next.js (TypeScript) + PostgreSQL en Supabase + Prisma + Auth.js. Motivo: propuesta de `design.md` aprobada por el usuario.
- **2026-10-27 — Estructura:** una sola app con `src/frontend` y `src/backend` (controllers, services, repositories). Motivo: preferencia del usuario por una separación ordenada por capas.
- **2026-10-27 — Supabase en lugar de Prisma y Auth.js:** la base de datos se consulta directamente con el cliente de Supabase, el inicio de sesión usa Supabase Auth (correo y contraseña) y el aislamiento por usuario lo garantiza Row Level Security. Motivo: decisión del usuario de usar Supabase completo.
- **2026-10-26 — Inicio de sesión:** correo electrónico y contraseña.
- **2026-10-26 — Eliminación con vínculos:** al eliminar un elemento se borran solo sus vínculos, nunca los elementos relacionados, y se avisa antes de cuántos se perderán.

## 10. Prompt de trabajo para Specs o Claude Code

Usa este documento como fuente de referencia del proyecto.

Antes de proponer o implementar una función, identifica si está:
- **Acordada:** descrita como decisión funcional explícita.
- **Exploratoria:** mencionada como posibilidad o dirección visual que aún debe evaluarse.
- **Pendiente:** necesita una decisión antes de considerarse requisito.

No trates las secciones exploratorias como aprobación. No rellenes las decisiones pendientes con suposiciones silenciosas. Cuando un punto pendiente afecte a la arquitectura o a la experiencia de usuario, pregunta antes de implementarlo o registra claramente la alternativa propuesta para revisión.

Respeta las exclusiones explícitas, en especial la ausencia de seguimiento del tiempo de estudio y de módulos de sesiones. Mantén el foco en el archivo personal de conocimiento, las notas y sus relaciones. Evita duplicar notas o recursos que estén vinculados a varios espacios.

No declares terminado ni aprobado el diseño visual, el menú o la pantalla Inicio sin confirmación explícita. Actualiza este documento cuando se tome una decisión nueva y conserva un registro claro de qué cambió y por qué.
