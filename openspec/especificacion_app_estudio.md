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

#### Apartados del proyecto

**Estado: acordado e implementado (2026-10-27).**

Un proyecto conserva su nombre, pero puede **dividirse en apartados** para organizar mejor su contenido.

Ejemplo: el proyecto **Estudiar filosofía** con los apartados:
1. **Filosofía antigua:** notas de Platón y Aristóteles, libros y recursos relacionados.
2. **Filosofía moderna:** notas sobre Descartes, Kant y otros autores.
3. **Ética:** contenido agrupado por esa temática.

**Acordado:**

- Cada apartado tiene un **título** y una **descripción breve opcional**.
- Hay un solo nivel: un apartado no contiene otros apartados.
- Los apartados se ordenan **en el orden que elija el usuario** y se numeran (1, 2, 3…).
- Las notas, libros y recursos del proyecto pueden colocarse en **uno o varios apartados** del mismo proyecto, **sin duplicarse**: siguen siendo el mismo elemento.
- Lo que no está en ningún apartado aparece en el proyecto como **«Sin apartado»**.
- **Eliminar un apartado** no quita su contenido del proyecto: las notas, libros y recursos siguen vinculados y, si no están en otro apartado, pasan a «Sin apartado». Se avisa antes de confirmar.

### 2.2 Notas

Las notas son piezas centrales del archivo de conocimiento. Pueden contener explicaciones, aprendizajes, ideas, preguntas, reflexiones y referencias.

Una nota puede estar relacionada con varios proyectos, libros o recursos. Debe existir una sola nota canónica: si aparece dentro de varios espacios, se trata de la misma nota, no de copias independientes.

Ejemplo: una nota titulada **La lucha de clases** puede estar vinculada a los proyectos *Comunismo* e *Historia social* y al libro *El manifiesto comunista*.

Las fechas de creación o modificación pueden utilizarse como metadatos para ordenar o consultar notas. **No representan tiempo dedicado al estudio.**

### 2.3 Libros

Cada libro funciona como un espacio propio dentro de la aplicación y puede incluir información bibliográfica, notas, citas, ideas, preguntas y reflexiones relacionadas con su contenido.

Un libro puede conectarse con uno o varios proyectos. Sus notas relacionadas deben seguir siendo notas únicas, aunque se consulten desde la página del libro o desde un proyecto.

Ejemplo: *El manifiesto comunista* puede tener sus propios datos bibliográficos y contenido asociado, y estar relacionado con el proyecto *Comunismo*.

**Campos del libro (decidido el 2026-10-28):**

| Campo | ¿Obligatorio? |
|---|---|
| Título | Sí |
| Autor o autores | No |
| Descripción | No |
| Editorial | No |
| Año de publicación | No |
| ISBN | No |
| Portada | No |
| Estado de lectura | No |
| Etiquetas | No |
| Notas y proyectos relacionados | No |

- **Estado de lectura:** «Por leer», «Leyendo» o «Leído». Es opcional: un libro registrado solo como referencia puede quedarse sin estado.
- **Detalles de implementación (propuestos al implementar, revisables):**
  - Las «notas bibliográficas» actuales pasan a llamarse **Descripción**, conservando su texto.
  - La **portada** se sube (PNG, JPEG, GIF o WebP, hasta 5 MB, privada) o se indica su dirección web, igual que las imágenes de las notas. Al cambiarla, quitarla o eliminar el libro, la imagen subida se borra.
  - El **ISBN** admite ISBN-10 o ISBN-13, con o sin guiones, y se comprueba su dígito de control.

### 2.4 Fuentes y recursos

Las fuentes y recursos permiten guardar materiales utilizados o considerados relevantes para estudiar: por ejemplo, páginas web, artículos u otros materiales.

Un recurso debe crearse una sola vez y poder relacionarse con varios proyectos, libros o notas. Al consultarlo desde distintos espacios, no debe duplicarse.

**Tipos y datos (decidido el 2026-10-28):**

- **Tipos:** Artículo, Página web, Vídeo, Podcast, Documento o PDF, Curso, Audio y Otro.
- **Datos:** título (obligatorio) y, opcionalmente, dirección web, autor o creador, descripción, fecha de publicación, etiquetas y relaciones con libros, notas y proyectos.
- **Detalles de implementación (propuestos al implementar, revisables):**
  - El tipo se elige siempre de la lista; por defecto, y para los recursos ya guardados, es «Otro».
  - La fecha de publicación es una fecha completa (día, mes y año).
  - La lista de recursos se puede filtrar por tipo.

### 2.5 Etiquetas

**Estado: acordada (2026-10-27), incluida su administración. Implementada (2026-10-27).**

Las etiquetas permiten clasificar contenido de distintas áreas de la aplicación mediante palabras clave compartidas. Tienen su propia sección en el menú (ver §6).

**Requisitos acordados:**

- Una misma etiqueta puede utilizarse en **notas, libros, proyectos y fuentes o recursos**.
- La etiqueta se crea **una sola vez** y se reutiliza; no se duplica para cada tipo de contenido.
- Al abrir una etiqueta, el usuario puede consultar **todos los elementos que la utilizan**.
- Los resultados de una etiqueta se pueden **filtrar por tipo de contenido** (solo notas, solo libros, solo proyectos o solo recursos) o mostrarse todos juntos.
- Se conserva la identidad de cada elemento: etiquetar no copia ni duplica contenido. Un elemento aparece una sola vez en los resultados de una etiqueta.

Ejemplo: la etiqueta **«Filosofía»** puede reunir notas, libros, proyectos y recursos de diferentes áreas. El usuario puede ver todos los resultados o filtrar por una categoría concreta.

**Administración acordada (2026-10-27):**

- Asignar una etiqueta existente a un elemento, o **crear una nueva en ese mismo momento**.
- Quitar una etiqueta de un elemento (el elemento no se borra).
- Crear una etiqueta desde la sección Etiquetas.
- Consultar la lista de etiquetas y abrir cada una.
- **Renombrar** una etiqueta. El cambio se ve en todos los elementos que la usan.
- **Eliminar** una etiqueta: se desvincula de todos sus elementos **sin borrarlos**, con una **advertencia antes de confirmar**.
- «Filosofía», «filosofía» y «Filosofia» son **la misma etiqueta**: no se distinguen mayúsculas, tildes ni espacios sobrantes. Se conserva la forma escrita la primera vez.
- En la página de una etiqueta, los elementos se **agrupan por tipo** y se ordenan **alfabéticamente**.

**Se deja para más adelante:** etiquetas en **citas** y en **términos del glosario**.

### 2.6 Glosario

**Estado: acordada (2026-10-27). Implementada (2026-10-27).**

El glosario es una sección independiente para registrar palabras y conceptos, con su propia entrada en el menú (ver §6). Cumple su función por sí mismo: **no es necesario crear ni vincular una nota** para registrar un término.

**Cada entrada contiene:**

- El **término** o concepto. **Obligatorio.**
- Su **definición**. **Obligatoria.**
- Un **ejemplo** que ayude a entenderlo o a ver cómo se utiliza. Opcional.
- **Información adicional**, cuando resulte útil. Opcional.

**Acordado (2026-10-27):**

- **Sin entradas duplicadas:** cada término existe una sola vez. Las distintas acepciones se recogen en la **misma entrada**. Como en las etiquetas, no se distinguen mayúsculas, tildes ni espacios sobrantes al comparar términos.
- Las entradas se pueden **editar** y **eliminar**.
- El glosario se consulta en **orden alfabético**, con **acceso por letra**.
- Las relaciones con notas, libros o proyectos **no son obligatorias**.

**Se deja para más adelante:** relaciones opcionales con notas, libros o proyectos, y etiquetas en el glosario.

### 2.7 Citas, frases y proverbios

**Estado: acordada (2026-10-27). Implementada (2026-10-27).**

La aplicación tendrá una **sección independiente** para guardar citas, frases de autores y proverbios, con su propia entrada en el menú (ver §6). Ya no es una posibilidad pendiente.

**Requisitos acordados:**

- Guardar una cita **directamente**, sin tener que asociarla obligatoriamente a un proyecto, libro o nota. No se añaden pasos de asociación obligatorios que dificulten el guardado.
- Guardar el **texto** de la cita o frase.
- Disponer de un campo para el **autor**.
- Disponer de información sobre la **fuente u origen**, cuando corresponda.
- Permitir guardar citas cuyo **autor u origen se desconozca**, sin inventar información (por ejemplo, un proverbio popular).
- Poder **consultar** las citas guardadas.
- La sección debe ser **práctica y suficientemente completa**, no una implementación excesivamente básica.

**Acordado (2026-10-27):**

- **Tipo:** cada cita es **cita**, **frase de autor** o **proverbio**. Por defecto, «cita».
- **Fuente u origen:** siempre se puede escribir como **texto libre**. Además, la cita puede **enlazarse opcionalmente** a un **libro** o a un **recurso** ya guardado.
- Una cita enlazada **sigue existiendo de forma independiente** y **aparece también** en la página del libro o recurso, **sin duplicarse**. Con esto se cumple «un libro puede incluir citas» (§2.3).
- Las citas se pueden **editar** y **eliminar**.
- La lista muestra primero las **más recientes**.
- Si no hay autor u origen, se muestra «Sin autor» o «Sin origen», **sin inventar** ninguno.

**Se deja para más adelante:** filtros propios de la sección (por autor o por tipo) y etiquetas en citas.

**Diseño visual:** sigue la dirección aprobada (§7).

### 2.8 Conexiones: cómo se muestran los elementos relacionados

**Decidido el 2026-10-28.** El usuario aceptó la propuesta y pidió que, además, «se vea cómodo»:

1. **Una sección «Conexiones»** en la página de cada nota, libro, recurso y proyecto. En pantallas anchas va en una columna lateral fija junto al contenido; en pantallas estrechas, debajo.
2. **Todo lo conectado en un solo lugar:** etiquetas, vínculos agrupados por tipo, «Notas que la mencionan» y citas enlazadas.
3. **Cada elemento con su contexto:**
   - nota: extracto y fecha de modificación;
   - libro: autores · editorial · año y estado de lectura;
   - recurso: tipo · autor · sitio web;
   - proyecto: su descripción, recortada.
4. **Solo los grupos que tienen algo.** Sin ninguna conexión, una frase breve que invita a vincular.
5. **Un único botón «Vincular…»** que abre un buscador en todos los tipos que se pueden vincular, sin distinguir tildes ni mayúsculas, manejable con teclado.
6. **Crear y vincular:** desde un libro, recurso o proyecto, «Nueva nota vinculada» crea la nota ya vinculada.

Se descarta por ahora el mapa o grafo de conexiones (ver §5), y se deja para más adelante mostrar conexiones indirectas.

## 3. Editor de notas

**Estado: dirección funcional acordada (2026-10-27). Alcance técnico y forma de implementar cada capacidad pendientes.**

**Objetivo:** un editor de calidad, ordenado y agradable de usar, con una experiencia parecida a escribir en Word o Notion, y una estructura técnica que permita evolucionar sin reconstrucciones innecesarias.

### 3.1 Dirección funcional acordada

El editor debe permitir:

- Escribir texto con **títulos, subtítulos, párrafos y formato**.
- Usar **negrita, cursiva, listas, citas y enlaces**.
- Insertar **imágenes y vídeos**, además de **enlaces a materiales externos**.
- Incorporar **referencias a otras notas** de la aplicación **sin duplicar su contenido**.
- Mantener el documento **bien organizado** aunque combine distintos tipos de contenido.

Se distinguen como capacidades diferentes:

| Contenido | Enlazar | Incrustar o insertar |
|---|---|---|
| **Vídeo** | Un enlace (texto pulsable) que abre el vídeo fuera de la nota. | El vídeo se ve y se reproduce **dentro** de la nota. |
| **Imagen** | Un enlace a una imagen que está en otro sitio. | La imagen se ve **dentro** de la nota: insertada desde una dirección web o **adjuntada** (subida a la aplicación). |
| **Otra nota** | — | Una **referencia** a la nota existente: muestra su título actual y lleva a ella; **no copia** su contenido. |

### 3.2 Alcance técnico acordado (2026-10-27)

**Evaluación:** el editor actual (Tiptap 3 sobre ProseMirror, contenido en JSON y filtrado en el servidor) es una base adecuada. **Se amplía, no se reconstruye**, y las notas existentes siguen siendo válidas.

**Decisiones:**

1. **Imágenes:** se pueden **subir** (máximo 5 MB por imagen) y también **insertar desde una URL**.
   - Se almacenan de forma **privada por usuario** y siguen apareciendo al volver a abrir la nota.
   - Si falla la subida o el guardado, el usuario recibe un aviso y el contenido **no se da por guardado**.
   - **Desde una URL** se guarda solo el enlace: la imagen se carga desde su web original y, si deja de estar disponible, la nota muestra un aviso en su lugar (decidido el 2026-10-28).
   - **Imágenes subidas que dejan de usarse** se borran del almacenamiento: al eliminar la nota y al quitarlas del texto tras guardarse (decidido el 2026-10-28).
   - Cada imagen admite **texto alternativo** y un **pie de imagen** opcional visible debajo (decidido el 2026-10-28).
   - **Pegar o arrastrar imágenes:** una imagen pegada (por ejemplo, una captura) o un archivo de imagen arrastrado al editor se sube igual que con el cuadro «Imagen»; las imágenes de contenido copiado de una web se insertan como imágenes desde esa dirección (decidido el 2026-10-28).
2. **Vídeos:** solo **enlaces** e **incrustaciones de YouTube y Vimeo**. Subir vídeos propios queda fuera por ahora.
3. **Referencias:**
   - Por ahora, a **otras notas**.
   - La referencia guarda el **identificador** y muestra siempre el **título actualizado**, sin duplicar contenido.
   - El diseño debe permitir ampliarla después a otros tipos de elementos.
4. **«Notas que la mencionan»:** cada nota muestra qué otras notas hacen referencia a ella.
5. **Guardado automático:**
   - Muestra claramente «Guardando…», «Guardado» o un mensaje de error.
   - Evita perder cambios al navegar, al cerrar la nota o ante problemas de conexión.
   - **No sobrescribe cambios más recientes.**
6. **Formato:**
   - Fase 1: subrayado, resaltado, separadores y listas de tareas.
   - Fase 4: tablas.
   - Sin bloques de código por ahora.
7. **Orden de implementación:**
   - **Fase 1:** experiencia de escritura (guardado automático, menú al seleccionar, menú «/», cuadro de enlaces y formatos nuevos).
   - **Fase 2:** referencias a notas y «Notas que la mencionan».
   - **Fase 3:** imágenes y vídeos.
   - **Fase 4:** mover bloques, índice de la nota y tablas.

### 3.3 Estado actual

**Las cuatro fases están implementadas (2026-10-27 y 2026-10-28).** El editor tiene títulos y subtítulos, negrita, cursiva, subrayado, resaltado, listas con viñetas, numeradas y de tareas, citas en bloque, separadores y enlaces web con cuadro propio, menú al seleccionar y menú «/», y referencias a otras notas que muestran su título actual, con la sección «Notas que la mencionan»; imágenes subidas (privadas, hasta 5 MB) o desde la web, con texto alternativo y pie, y vídeos de YouTube y Vimeo; subir y bajar bloques (botones y Alt+↑/↓), índice de la nota a partir de sus subtítulos y tablas. Guarda automáticamente con versión (sin sobrescribir cambios más recientes) y copia local de seguridad. El contenido se guarda en formato estructurado (JSON). Cada fase se prepara como un cambio de OpenSpec antes de implementarla.

## 4. Búsqueda global

**Estado: acordada e implementada (2026-10-27), incluidos los campos por tipo y el funcionamiento.**

La aplicación tendrá una **búsqueda global** para encontrar contenido en toda la aplicación. La prioridad es una búsqueda útil, bien construida y ampliable. **No** se incorpora desde el principio un panel complejo de búsqueda avanzada.

**Requisitos acordados:**

- Buscar en **títulos** y en el **contenido textual** de los elementos que lo permitan.
- Incluir **proyectos, libros, notas, fuentes y recursos, citas y términos del glosario**.
- **Filtrar** los resultados por tipo de contenido.
- Mostrar **cada elemento una sola vez** en los resultados, aunque esté relacionado con varios espacios de la aplicación.
- **Acceder** al elemento encontrado desde los resultados.

**No aprobados como requisitos iniciales:** filtros adicionales por autor, etiquetas, fechas, proyecto o libro.

### 4.1 Campos de búsqueda por tipo de elemento

**Acordado (2026-10-27).** Cada tipo de contenido tiene una estructura distinta, así que no todos se buscan igual. Las columnas indican qué campo se muestra como título del resultado y en qué campos se busca.

| Tipo | Título del resultado | Se busca en | Observaciones |
|---|---|---|---|
| Proyecto | Nombre | Nombre y descripción | La descripción es opcional; si está vacía solo se busca en el nombre. |
| Nota | Título | Título y texto del contenido (versión en texto plano del editor) | El formato (negritas, listas…) no influye en la búsqueda. |
| Libro | Título | Título, **autores** y descripción (antes «notas bibliográficas») | Los autores se buscan como texto; no hay filtro por autor. La editorial no se incluye. |
| Fuente o recurso | Título | Título, **autor** y descripción | La dirección web no se incluye. |
| Cita | Extracto del texto | Texto, **autor** y **fuente u origen** (texto libre) | Las citas no tienen título propio. |
| Término del glosario | Término | Término, definición, ejemplo e información adicional | — |

**Funcionamiento acordado (2026-10-27):**

- Ignora **mayúsculas y tildes**: «filosofia» encuentra «Filosofía».
- Encuentra palabras que **empiezan** por lo escrito: «materia» encuentra «materialismo».
- Ordena primero por **relevancia**.
- Cada resultado muestra el **tipo** de elemento y un **fragmento** del texto donde aparece la coincidencia.
- Se accede desde un **cuadro de búsqueda en la cabecera**, que lleva a una página de resultados con **filtro por tipo**.
- Las **etiquetas** no aparecen como resultados, porque tienen su propia sección.

**Se deja para más adelante:** filtros por autor, etiqueta, fecha, proyecto o libro.

## 5. Exclusiones explícitas

La aplicación **no** debe incorporar un módulo de sesiones de estudio ni funciones cuyo propósito sea registrar cuánto tiempo se estudia.

En particular, no se deben introducir sin una nueva decisión explícita:

- Cronómetros de estudio o seguimiento del tiempo dedicado.
- Historial de sesiones de lectura o estudio.
- Métricas de productividad basadas en duración.
- Paneles de rendimiento o rachas que desplacen el foco del conocimiento.

La aplicación se centra en estudiar y registrar lo aprendido, no en medir cuánto tiempo se dedicó.

Un mapa gráfico de conocimiento se dejó como posible idea futura, no como requisito actual. La prioridad es mostrar relaciones mediante enlaces y listas de elementos relacionados.

## 6. Menú principal

**Estado: áreas acordadas (2026-10-27). Orden e Inicio decididos el 2026-10-28.**

Las principales áreas de la aplicación tienen **secciones independientes** en el menú. Las áreas acordadas son:

- Inicio
- Proyectos
- Libros
- Notas
- Fuentes y recursos
- Etiquetas
- Glosario
- Citas

**Citas tiene su propia sección en el menú principal.** No es una posibilidad pendiente.

**Orden del menú (2026-10-28):** el usuario lo dejó a criterio de la implementación, buscando la mayor comodidad. Se ordena por uso previsto, con las notas como pieza central:

1. Inicio
2. Notas
3. Proyectos
4. Libros
5. Fuentes y recursos
6. Citas
7. Glosario
8. Etiquetas

**Inicio (2026-10-28):** también a criterio de la implementación, buscando la mayor comodidad, sin métricas ni contadores (§5):

- **Accesos rápidos** para crear: nota, libro, recurso y cita.
- **Notas recientes**, para seguir escribiendo.
- **Leyendo ahora:** libros con estado «Leyendo»; si no hay ninguno, los últimos libros añadidos.
- **Proyectos** modificados recientemente.
- **Citas guardadas** más recientes.

La búsqueda global está en la cabecera (§4). El diseño visual del menú es el aprobado en §7.

## 7. Dirección visual

**Estado: aprobada el 2026-10-27**, tal como está implementada en la aplicación.

### Dirección visual aprobada

- **Concepto:** biblioteca clásica y archivo personal de conocimiento.
- **Composición:** menú lateral permanente con iconos, las ocho áreas y la sección activa resaltada; cabecera con la búsqueda global; área principal con columna de lectura.
- **Paleta:** pergamino cálido con luz de papel, marfil y beige tostado, con marrón suave y terracota como acentos. Contraste AA. Hay modo oscuro en tinta y sepia.
- **Tipografía:** Cormorant Garamond para títulos y EB Garamond para el texto. Versalitas para etiquetas, fechas y referencias.
- **Ornamentos:** ornamento dibujado, filetes dobles bajo los títulos de página y rombos en los encabezados. Siempre discretos.
- **Contenido:** listas editoriales con separadores punteados, sin tarjetas; hojas de marfil con sombra para el editor, los formularios y los diálogos.
- **Inicio:** portada con «Archivo de conocimiento», más las notas recientes, los libros y las citas guardadas.
- Todos los valores están centralizados en `src/frontend/styles/tokens.css`.

Pendiente: el **orden definitivo del menú** (§6).

### Referencias exploradas (origen de la dirección aprobada)

Se exploraron estas referencias:

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

*(Esta exploración desembocó en la dirección aprobada el 2026-10-27, descrita al principio de esta sección.)*

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

Las funciones de Citas, Etiquetas, Glosario, Búsqueda global y las ocho áreas del menú **están acordadas**, con sus detalles (§2.5–§2.7, §4, §6).

### 9.1 Decisiones esenciales: confirmadas el 2026-10-27

| # | Decisión acordada | Dónde |
|---|---|---|
| E1 | **Citas:** fuente u origen en texto libre más un enlace **opcional** a un libro o recurso. La cita sigue siendo independiente y aparece también en el libro o recurso, sin duplicarse. | §2.7 |
| E2 | **Citas:** tipo cita, frase de autor o proverbio, con «cita» por defecto. | §2.7 |
| E3 | **Etiquetas:** se pueden renombrar y eliminar. Al eliminar, se desvinculan de sus elementos sin borrarlos, con advertencia previa. | §2.5 |
| E4 | **Glosario:** sin entradas duplicadas para el mismo término; las acepciones van en la misma entrada. | §2.6 |
| E5 | **Glosario:** término y definición obligatorios; ejemplo opcional. | §2.6 |
| E6 | **Búsqueda:** se busca también en los nombres de autores, sin filtro independiente por autor. | §4.1 |

### 9.2 Comportamientos de detalle: confirmados el 2026-10-27

Incorporados en §2.5 (etiquetas), §2.6 (glosario), §2.7 (citas) y §4.1 (búsqueda).

### 9.3 Se deja para más adelante (confirmado el 2026-10-27)

- Etiquetas en **citas** y **términos del glosario**.
- Relaciones opcionales del **glosario** con notas, libros o proyectos.
- Filtros propios dentro de la sección **Citas** (por autor, por tipo).
- Filtros de búsqueda por autor, etiqueta, fecha, proyecto o libro.

### 9.4 Otros pendientes generales

- [x] **Editor:** evaluado y con alcance técnico acordado en cuatro fases (2026-10-27, §3.2).
- [x] Orden y diseño del menú: decidido el 2026-10-28 (§6).
- [x] Qué aparece en Inicio y cómo se organiza: decidido el 2026-10-28 (§6).
- [x] Dirección visual: aprobada el 2026-10-27 (§7).
- [x] Estructura de los proyectos: apartados (2026-10-27, §2.1).
- [x] Campos de los libros: decididos el 2026-10-28 (§2.3).
- [x] Tipos de fuentes y recursos y sus datos: decididos el 2026-10-28 (§2.4).
- [x] Cómo se muestran los elementos relacionados: decidido el 2026-10-28 (§2.8).
- [ ] Separar explícitamente los requisitos de primera versión de las ideas futuras.

### Puntos a revisar: contradicciones detectadas el 2026-10-27

1. **Editor de notas. Resuelto el 2026-10-27.** El alcance mínimo registrado durante la implementación no es el definitivo. El usuario fijó la dirección funcional (§3.1) y decidió mantener el editor actual como **base provisional**, sin ampliarlo, recortarlo ni reconstruirlo hasta revisarlo.
2. **Specs de OpenSpec desactualizadas.** El cambio `especificacion-inicial-app-estudio` (implementado, aún no archivado) contiene specs de `etiquetas`, `glosario`, `citas`, `busqueda` y `navegacion` escritas antes de estas decisiones. Contradicen este documento, por ejemplo: citas con «ubicación sin decidir», búsqueda avanzada «no aprobada», menú sin Citas, glosario con relaciones propuestas y término único. La spec `editor-notas` marca como [Acordado] un alcance que ahora vuelve a estar pendiente. **No se han modificado.** Mientras no se actualicen, **este documento prevalece**.
3. **Libros y citas (§2.3 y §2.7). Resuelto el 2026-10-27 (E1).** Una cita puede enlazarse opcionalmente a un libro o recurso y aparece en su página sin duplicarse, así que «un libro puede incluir citas» se cumple sin que la asociación sea obligatoria.
4. **Búsqueda y fechas (§2.2 y §4).** §2.2 permite usar las fechas para «ordenar o consultar notas», y §4 indica que los filtros por fecha no están aprobados para la búsqueda global. No se contradicen: el orden por fechas ya existe en la lista de notas y no forma parte de la búsqueda. Se anota para que no se interprete como filtro aprobado.

### 9.5 Estado por área

Actualizar este documento **no** cambia el código ni las specs históricas de OpenSpec.

| Área | Implementado | Acordado, sin implementar | Exploratorio o pendiente |
|---|---|---|---|
| Cuentas | Registro con confirmación, entrada, salida, aislamiento por usuario | — | SMTP propio (aplazado) |
| Proyectos | Crear, editar, eliminar con aviso, relacionados, apartados (§2.1) | — | — |
| Notas | Crear, editar, ordenar por fechas, eliminar con aviso, relacionados | — | — |
| Libros | Ficha definitiva (§2.3): descripción, ISBN, portada y estado de lectura; relacionados, eliminar con aviso | — | Tipos de libro (no decididos) |
| Fuentes y recursos | Tipos y datos definitivos (§2.4), filtro por tipo, relacionados, eliminar con aviso | — | — |
| Relaciones | Vínculos sin duplicar entre las 4 entidades; enlace de citas con libros o recursos; sección «Conexiones» (§2.8) | — | Conexiones indirectas y mapa (más adelante) |
| Editor de notas | Fases 1 a 4 (§3.3), arrastrar bloques, pegar y arrastrar imágenes | — | — |
| Menú e Inicio | Las ocho áreas en el orden de §6; Inicio con accesos rápidos, notas, «Leyendo ahora», proyectos y citas | — | — |
| Citas | Sección completa (§2.7) | — | Filtros propios (más adelante) |
| Etiquetas | Sección completa (§2.5) | — | Etiquetas en citas y glosario (más adelante) |
| Glosario | Sección completa (§2.6) | — | Relaciones opcionales (más adelante) |
| Búsqueda global | Completa (§4) | — | Filtros adicionales (más adelante) |
| Identidad visual | Dirección aprobada aplicada a toda la app (§7) | — | — |

### 9.6 OpenSpec: documentos que habrá que actualizar en el próximo cambio

El cambio `especificacion-inicial-app-estudio` refleja lo **implementado** y no se reescribe. Antes de preparar el siguiente cambio habrá que decidir si se **archiva** primero. Al archivarlo, sus specs pasan a `openspec/specs/`, incluidas las de etiquetas, glosario, citas y búsqueda, que están desactualizadas. El cambio siguiente las corregiría con deltas `MODIFIED` o `REMOVED`.

| Spec | Qué necesitará |
|---|---|
| `navegacion` | Ocho áreas con sección propia, Citas incluida (§6); acceso a la búsqueda. |
| `citas` | Sustituir la propuesta «ubicación sin decidir» por los requisitos de §2.7 (incluidos E1 y E2). |
| `etiquetas` | Sustituir la propuesta por los requisitos de §2.5 (incluido E3). |
| `glosario` | Sustituir la propuesta por los requisitos de §2.6 (incluidos E4 y E5); quitar las relaciones propuestas, que se dejan para más adelante. |
| `busqueda` | Sustituir «búsqueda avanzada no aprobada» por la búsqueda global de §4 y §4.1 (incluido E6). |
| `editor-notas` | Pasar el alcance actual de [Acordado] a base provisional y añadir la dirección de §3.1. Solo cuando se trabaje el editor. |
| `relaciones` | Añadir el enlace opcional de una cita con un libro o recurso (E1), sin duplicar la cita. |
| `design.md` (nuevo cambio) | Tablas de citas, etiquetas y glosario; método de búsqueda (texto sin tildes, por prefijo); almacenamiento de imágenes si se aprueba adjuntarlas. |

### Registro de decisiones

- **2026-10-26 — Plataforma:** la aplicación será web, accesible por internet y con cuenta de usuario; cada persona ve solo su propio contenido. Motivo: elección del usuario al preparar las specs en OpenSpec (cambio `especificacion-inicial-app-estudio`). 
- **2026-10-26 — Tecnología:** Next.js (TypeScript) + PostgreSQL en Supabase + Prisma + Auth.js. Motivo: propuesta de `design.md` aprobada por el usuario. *(Prisma y Auth.js se sustituyeron el 2026-10-27, ver más abajo.)*
- **2026-10-27 — Estructura:** una sola app con `src/frontend` y `src/backend` (controllers, services, repositories). Motivo: preferencia del usuario por una separación ordenada por capas.
- **2026-10-27 — Supabase en lugar de Prisma y Auth.js:** la base de datos se consulta directamente con el cliente de Supabase, el inicio de sesión usa Supabase Auth (correo y contraseña) y el aislamiento por usuario lo garantiza Row Level Security. Motivo: decisión del usuario de usar Supabase completo.
- **2026-10-27 — Contenido de las notas:** se guarda en formato estructurado (JSON del editor) más una copia en texto plano para búsquedas futuras. Motivo: evita convertir las notas si se aprueba un editor más completo. El alcance del editor sigue pendiente.
- **2026-10-27 — Editor de notas:** la primera versión tendrá títulos y subtítulos, negrita, cursiva, listas, citas en bloque y enlaces web. Siguen fuera, como exploración: subrayado, separadores, imágenes, mover secciones y enlaces internos. *(Revisado más abajo: el alcance definitivo vuelve a estar pendiente.)*
- **2026-10-26 — Inicio de sesión:** correo electrónico y contraseña.
- **2026-10-26 — Eliminación con vínculos:** al eliminar un elemento se borran solo sus vínculos, nunca los elementos relacionados, y se avisa antes de cuántos se perderán.
- **2026-10-27 — Menú principal:** las áreas con sección propia son Inicio, Proyectos, Libros, Notas, Fuentes y recursos, Etiquetas, Glosario y Citas. Siguen pendientes el orden, el diseño y la pantalla Inicio. Motivo: decisión del usuario.
- **2026-10-27 — Citas:** sección independiente para citas, frases y proverbios, con texto, autor y fuente u origen. Se pueden guardar sin asociarlas a nada y sin autor u origen conocidos. Motivo: decisión del usuario.
- **2026-10-27 — Etiquetas:** compartidas entre notas, libros, proyectos y recursos, creadas una sola vez, con vista por etiqueta y filtro por tipo. Motivo: decisión del usuario.
- **2026-10-27 — Glosario:** sección independiente con término, definición, ejemplo e información adicional opcional; no requiere notas ni vínculos. Motivo: decisión del usuario.
- **2026-10-27 — Búsqueda global:** sobre proyectos, libros, notas, recursos, citas y glosario, en títulos y contenido textual, con filtro por tipo y sin duplicados. Sin panel avanzado ni filtros por autor, etiqueta o fecha al inicio. Motivo: decisión del usuario.
- **2026-10-27 — Revisión del editor de notas:** el alcance definitivo, el tipo de editor y la organización del contenido vuelven a estar **pendientes**. El editor construido se mantiene sin cambios como provisional. Motivo: aclaración del usuario de que no aprobó limitarse a un editor mínimo ni uno completo por bloques. Ver «Puntos a revisar», 1.
- **2026-10-27 — Dirección del editor:** experiencia parecida a Word o Notion, con texto con formato, imágenes y vídeos (distinguiendo entre enlazar e incrustar o adjuntar), enlaces externos y referencias a otras notas sin duplicar contenido (§3.1). El editor actual se mantiene como base provisional, sin cambios, hasta revisar qué tiene, qué le falta y qué arquitectura conviene. Motivo: decisión del usuario.
- **2026-10-27 — Detalles de Citas, Etiquetas, Glosario y Búsqueda (E1–E6 y §9.2):** citas con fuente en texto libre, enlace opcional a un libro o recurso y tipo (cita por defecto); etiquetas que se pueden renombrar y eliminar con advertencia, sin distinguir mayúsculas ni tildes y creables al asignarlas; glosario sin términos duplicados, con término y definición obligatorios; búsqueda también por autores, sin tildes, por prefijo y con cuadro en la cabecera. Se dejan para más adelante los puntos de §9.3. Motivo: confirmación del usuario de las recomendaciones.
- **2026-10-27 — Dirección visual aprobada:** el diseño implementado (biblioteca clásica, pergamino, menú lateral, Cormorant y EB Garamond, listas editoriales) queda aprobado (§7). Motivo: aprobación del usuario.
- **2026-10-27 — Apartados en los proyectos:** un proyecto puede dividirse en apartados ordenados por el usuario, con título y descripción opcional. Las notas, libros y recursos del proyecto pueden estar en varios apartados sin duplicarse; lo que no está en ninguno aparece como «Sin apartado»; eliminar un apartado no quita su contenido del proyecto (§2.1). Motivo: decisión del usuario.
- **2026-10-27 — Apartados implementados:** cambio `apartados-proyectos` archivado; las specs oficiales `proyectos` y `relaciones` incluyen los apartados.
- **2026-10-27 — Citas, Etiquetas, Glosario y Búsqueda implementados:** cambio `secciones-citas-etiquetas-glosario-busqueda` archivado; specs oficiales actualizadas.
- **2026-10-27 — Alcance técnico del editor:** se amplía el editor actual en cuatro fases. Imágenes subidas (5 MB, privadas) o desde URL; solo vídeos de YouTube y Vimeo; referencias a notas por identificador, ampliables a otros tipos; «Notas que la mencionan»; guardado automático sin sobrescribir cambios más recientes; subrayado, resaltado, separadores y listas de tareas, y tablas en la fase 4 (§3.2). Motivo: decisión del usuario sobre la evaluación propuesta.
- **2026-10-27 — Fase 1 del editor implementada:** cambio `editor-fase1-escritura` archivado; la spec oficial `editor-notas` incluye guardado automático, formatos nuevos, menús y cuadro de enlaces.
- **2026-10-28 — Fase 2 del editor implementada:** cambio `editor-fase2-referencias` archivado. Las referencias guardan solo tipo e identificador; una nota eliminada se muestra como «Nota eliminada»; las menciones las mantiene la base de datos al guardar.
- **2026-10-28 — Detalles de imágenes (fase 3):** las imágenes desde una URL guardan solo el enlace; las subidas que dejan de usarse se borran del almacenamiento; cada imagen tiene texto alternativo y pie opcional (§3.2). Motivo: decisión del usuario.
- **2026-10-28 — Fase 3 del editor implementada:** cambio `editor-fase3-imagenes-videos` archivado. Las imágenes subidas que dejan de usarse se borran al abrir la nota pasados dos minutos desde su subida, para no borrar una imagen cuyo guardado está en curso.
- **2026-10-28 — Fase 4 del editor implementada:** cambio `editor-fase4-organizacion-tablas` archivado. Los bloques se mueven con botones y Alt+↑/↓; arrastrar con el ratón no se incluye porque la extensión oficial exige paquetes de edición colaborativa (Yjs). El índice se calcula del contenido y no se guarda. Tablas sin combinar celdas ni ajustar anchos.
- **2026-10-28 — Campos de los libros:** título obligatorio; autores, descripción, editorial, año, ISBN, portada, estado de lectura (Por leer, Leyendo, Leído), etiquetas y relaciones opcionales (§2.3). Motivo: decisión del usuario.
- **2026-10-28 — Tipos de fuentes y recursos:** Artículo, Página web, Vídeo, Podcast, Documento o PDF, Curso, Audio y Otro; título obligatorio y dirección web, autor o creador, descripción, fecha de publicación, etiquetas y relaciones opcionales (§2.4). Motivo: decisión del usuario.
- **2026-10-28 — Orden del menú e Inicio:** el usuario los deja a criterio de la implementación, buscando la mayor comodidad; se registran en §6. Motivo: delegación del usuario.
- **2026-10-28 — Libros, recursos, menú e Inicio implementados:** cambio `libros-recursos-menu-inicio` archivado; specs oficiales `libros`, `fuentes-recursos`, `navegacion` y `busqueda` actualizadas.
- **2026-10-28 — Conexiones:** los elementos relacionados se muestran en una sección «Conexiones» lateral con contexto de cada elemento, solo los grupos con contenido, un buscador «Vincular…» y «Nueva nota vinculada» (§2.8). Motivo: aceptación de la propuesta por el usuario, que pidió además que se vea cómodo.
- **2026-10-28 — Conexiones implementadas:** cambio `conexiones` archivado; spec oficial `relaciones` actualizada.
- **2026-10-28 — Arrastrar bloques con el ratón:** el usuario lo pide. Se implementa con un asa propia junto al bloque, sin la extensión oficial (que exige paquetes de edición colaborativa); los botones y Alt+↑/↓ se mantienen. Motivo: decisión del usuario.
- **2026-10-28 — Pegar y arrastrar imágenes en el editor:** el usuario esperaba poder pegar imágenes directamente. Se suben como las del cuadro «Imagen» (§3.2). Motivo: petición del usuario.
- **2026-10-28 — Arrastrar bloques y pegar imágenes implementados:** cambios `editor-arrastrar-bloques` y `editor-pegar-imagenes` archivados; spec oficial `editor-notas` actualizada. Las pruebas E2E compilan en su propia carpeta y también se pueden pasar contra el servidor de desarrollo (`npm run test:e2e:desarrollo`).

## 10. Prompt de trabajo para Specs o Claude Code

Usa este documento como fuente de referencia del proyecto.

Antes de proponer o implementar una función, identifica si está:
- **Acordada:** descrita como decisión funcional explícita.
- **Exploratoria:** mencionada como posibilidad o dirección visual que aún debe evaluarse.
- **Pendiente:** necesita una decisión antes de considerarse requisito.

No trates las secciones exploratorias como aprobación. No rellenes las decisiones pendientes con suposiciones silenciosas. Cuando un punto pendiente afecte a la arquitectura o a la experiencia de usuario, pregunta antes de implementarlo o registra claramente la alternativa propuesta para revisión.

Respeta las exclusiones explícitas, en especial la ausencia de seguimiento del tiempo de estudio y de módulos de sesiones. Mantén el foco en el archivo personal de conocimiento, las notas y sus relaciones. Evita duplicar notas o recursos que estén vinculados a varios espacios.

No declares terminado ni aprobado el diseño visual, el menú o la pantalla Inicio sin confirmación explícita. Actualiza este documento cuando se tome una decisión nueva y conserva un registro claro de qué cambió y por qué.
