# Tasks

> Pila aprobada: Next.js + Supabase (PostgreSQL, Auth con correo y contraseña, RLS). Sin Prisma ni Auth.js desde el 2026-10-27.
> Las tareas con casilla solo cubren requisitos **[Acordado]**. El trabajo de capacidades pendientes o exploratorias aparece al final como viñetas sin casilla: no forma parte del progreso y no debe implementarse hasta que exista una decisión.

## 1. Base del proyecto

- [x] 1.1 Crear el proyecto Next.js con TypeScript, ESLint y un framework de pruebas (Vitest y Playwright), y verificar que `npm run build` y `npm test` terminan sin errores
- [ ] 1.2 Configurar Supabase (CLI, `supabase/`, clientes `@supabase/ssr` y variables de ejemplo en `.env.example`), enlazar el proyecto remoto y verificar que `supabase db push` aplica una migración inicial vacía
- [x] 1.3 Definir los tokens de diseño provisionales (colores, tipografías y espaciados) en variables CSS, y verificar que una página de prueba solo usa tokens (design D7, spec `identidad-visual`)

## 2. Cuentas de usuario

- [ ] 2.1 Integrar Supabase Auth con correo y contraseña (pantallas `/registro` y `/entrar`), con confirmación por correo (ruta de confirmación incluida), y verificar con pruebas: registro con mensaje "revisa tu correo", entrada denegada sin confirmar, correo repetido sin revelar que existe y error de credenciales sin revelar si el correo existe
- [ ] 2.2 Proteger todas las rutas de contenido con `middleware.ts` y verificar con una prueba E2E que sin sesión se redirige al inicio de sesión sin mostrar contenido
- [ ] 2.3 Implementar el cierre de sesión y verificar con una prueba E2E que después no se puede ver el contenido
- [ ] 2.4 Añadir una prueba que falle si alguna tabla del esquema `public` no tiene RLS activado (design D4), y verificar que pasa

## 3. Modelo de datos y relaciones

- [ ] 3.1 Crear la migración de las tablas `proyectos`, `notas`, `libros` y `recursos` con `usuario_id`, fechas de creación y modificación, RLS y políticas `usuario_id = auth.uid()`; verificar que `supabase db push` la aplica y, con pruebas de dos usuarios, que ninguno puede leer ni modificar elementos del otro
- [ ] 3.2 Crear la migración de las tablas de enlace con clave compuesta, claves foráneas compuestas por usuario y borrado en cascada solo del vínculo (design D3), y verificar con pruebas que no se permiten vínculos repetidos ni entre usuarios distintos
- [ ] 3.3 Implementar las operaciones de vincular y desvincular, comprobando que ambos extremos pertenecen al mismo usuario, y verificar con pruebas que al desvincular el elemento sigue existiendo (spec `relaciones`)
- [ ] 3.4 Implementar la eliminación de un elemento con aviso del número de vínculos afectados, y verificar con pruebas que los elementos relacionados no se borran (spec `relaciones`)

## 4. Notas

- [ ] 4.1 Crear el listado de notas sin duplicados y la creación y consulta de notas, y verificar con una prueba E2E que una nota vinculada a dos proyectos aparece una vez en el listado
- [ ] 4.2 Implementar la edición de notas con un editor de texto básico (sin funciones exploratorias), y verificar con una prueba E2E que un cambio hecho desde un proyecto se ve desde otro
- [ ] 4.3 Permitir ordenar por fecha de creación y de modificación, y verificar que no se muestra ninguna duración ni tiempo invertido (spec `notas`)

## 5. Proyectos

- [ ] 5.1 Implementar crear, consultar, renombrar y eliminar proyectos con nombre y descripción opcional, y verificar con pruebas que se puede crear un proyecto sin descripción
- [ ] 5.2 Mostrar en la página del proyecto sus notas, libros y recursos relacionados, y verificar con una prueba E2E del ejemplo "Comunismo"

## 6. Libros

- [ ] 6.1 Implementar crear, consultar, editar y eliminar libros con los campos bibliográficos provisionales, y verificar que se puede guardar un libro con solo el título
- [ ] 6.2 Mostrar en la página del libro sus datos, notas, recursos y proyectos relacionados, y verificar con una prueba E2E que muestra la misma nota canónica que el proyecto
- [ ] 6.3 Permitir relacionar un libro con varios proyectos, y verificar que la lista de libros lo muestra una sola vez

## 7. Fuentes y recursos

- [ ] 7.1 Implementar crear, consultar, editar y eliminar recursos con los campos provisionales, y verificar que se puede guardar un recurso sin dirección web
- [ ] 7.2 Permitir relacionar un recurso con proyectos, libros y notas, y verificar con una prueba E2E que un cambio en el recurso se ve en todos esos espacios

## 8. Navegación y elementos relacionados

- [ ] 8.1 Crear una navegación principal provisional, configurable desde un único archivo, con acceso a proyectos, libros, notas y recursos, y verificar con una prueba E2E que se llega a cada sección
- [ ] 8.2 Mostrar en cada página la lista de elementos relacionados como enlaces navegables, y verificar con una prueba E2E navegando de una nota a su libro y vuelta

## 9. Comprobaciones de integración

- [ ] 9.1 Revisar que no existe ningún cronómetro, sesión, racha ni métrica de tiempo en la interfaz ni en el modelo de datos (spec `exclusiones-alcance`), y verificar con búsqueda en el código y revisión de las pantallas
- [ ] 9.2 Ejecutar la batería completa de pruebas (unitarias y E2E) con dos usuarios de prueba, y verificar que pasan y que no hay acceso cruzado

## Bloqueado hasta que exista una decisión

Estas viñetas no son tareas activas. Al tomar la decisión se registra en `openspec/especificacion_app_estudio.md` y se convierten en tareas mediante `/opsx:update` o un cambio nuevo.

- Estructura detallada de los proyectos (spec `proyectos`).
- Campos y tipos definitivos de libros (spec `libros`).
- Tipos de fuentes y recursos y sus datos (spec `fuentes-recursos`).
- Etiquetas: elementos etiquetables y administración (spec `etiquetas`).
- Glosario: estructura de las entradas y relaciones (spec `glosario`).
- Citas, frases y proverbios: opción A, B o C (spec `citas`).
- Alcance del editor más allá del texto básico (spec `editor-notas`).
- Búsqueda avanzada en la primera versión (spec `busqueda`).
- Estructura final del menú y contenido de Inicio (spec `navegacion`).
- Aprobación de la identidad visual y de la pantalla Inicio "portada de libro antiguo" (spec `identidad-visual`).
- Forma visual de los elementos relacionados (spec `relaciones`).

## Workflow follow-up

- Revisar y aprobar las specs y el diseño antes de `/opsx:apply`.
- Archivar el cambio con `/opsx:archive` cuando las tareas acordadas estén terminadas.
