# Design

> **Estado del documento:** el usuario aprobó el 2026-10-26 la pila (D1), el inicio de sesión con correo y contraseña y el comportamiento de eliminación de D3. El 2026-10-27 aprobó la estructura por capas (D9) y sustituir Prisma y Auth.js por Supabase (D2, D4, D5). El resto sigue como propuesta.

## Context

- Proyecto nuevo, sin código existente.
- Plataforma acordada: aplicación web accesible por internet con cuenta de usuario (ver `proposal.md`).
- Restricción central de producto: cada nota y cada recurso son **canónicos** y se relacionan con varios espacios sin duplicarse (specs `notas`, `fuentes-recursos`, `relaciones`).
- Muchas capacidades siguen pendientes o en exploración. La arquitectura debe permitir añadirlas después sin reestructurar los datos acordados.

## Goals / Non-Goals

**Goals:**
- Modelo de datos que garantice la unicidad de notas y recursos y permita relaciones muchos-a-muchos.
- Aislamiento estricto de los datos por usuario, garantizado por la propia base de datos.
- Estilos centralizados (variables de tema) para que la identidad visual, que aún no está aprobada, pueda cambiarse sin rehacer pantallas.
- Arquitectura sencilla: una sola aplicación y un solo servicio de datos.

**Non-Goals:**
- Colaboración o contenido compartido entre usuarios.
- Aplicación móvil nativa o funcionamiento sin conexión.
- Implementar ahora capacidades marcadas como [Propuesta para revisión] o [Exploratorio]. El diseño solo deja espacio para ellas.

## Decisions

### D1. Pila web full-stack en TypeScript (aprobada)
**Decisión:** Next.js (App Router) con TypeScript, que cubre la interfaz y el servidor en un único proyecto.
**Por qué:** un solo lenguaje y un solo despliegue para una app personal, con renderizado en servidor para páginas de lectura rápidas.
**Alternativas:** SPA (React/Vite) con API separada (Express o FastAPI): dos proyectos y más mantenimiento.

### D2. Supabase como base de datos, sin ORM (aprobada el 2026-10-27)
**Decisión:** PostgreSQL en **Supabase**, consultado con `@supabase/supabase-js` (y `@supabase/ssr` para las cookies de sesión en Next.js). El esquema se define con **migraciones SQL** versionadas en `supabase/migrations/`, que se aplican con el CLI de Supabase (`supabase db push`). Los tipos TypeScript se generan desde la base de datos con `supabase gen types`.
**Por qué:** las relaciones muchos-a-muchos y la integridad referencial son el núcleo del producto, y PostgreSQL las garantiza con claves foráneas y restricciones. Usar Supabase directamente evita una capa intermedia (ORM) y permite aprovechar RLS (D4) y Supabase Auth (D5).
**Alternativas:** Prisma sobre Supabase (descartada por decisión del usuario: añade una capa y no aprovecha RLS); base de documentos (MongoDB), descartada porque favorece copiar datos, justo lo que el producto prohíbe.

### D3. Relaciones mediante tablas de enlace explícitas
**Decisión:** una tabla por tipo (`proyectos`, `notas`, `libros`, `recursos`) y una tabla de enlace por cada par relacionado:
`nota_proyecto`, `nota_libro`, `nota_recurso`, `libro_proyecto`, `recurso_proyecto`, `recurso_libro`.
Cada tabla de enlace tiene **clave primaria compuesta** (por ejemplo, `nota_id + proyecto_id`), una columna `usuario_id` y **claves foráneas compuestas** `(elemento_id, usuario_id)` hacia cada extremo, con `ON DELETE CASCADE`.
**Por qué:** la clave compuesta impide vínculos repetidos. Las claves foráneas compuestas hacen que la base de datos rechace vincular elementos de usuarios distintos. El borrado en cascada elimina **solo el vínculo** al borrar un elemento (spec `relaciones`).
**Procedencia de cada relación:** `nota_proyecto`, `nota_libro` y `nota_recurso` (spec `notas`); `libro_proyecto` (spec `libros`); `recurso_proyecto` y `recurso_libro` (spec `fuentes-recursos`). Cubren los 6 pares posibles entre las 4 entidades. **No se incluyen** nota–nota (enlaces internos, que son [Exploratorio] en `editor-notas`), proyecto–proyecto (no está en las specs) ni etiquetas, glosario o citas (pendientes).
**Implementado en:** `supabase/migrations/20261027170000_entidades.sql` y `20261027170100_vinculos.sql`. Las tablas de vínculo no tienen política de `UPDATE`: un vínculo se crea o se quita.
**Alternativa:** una tabla genérica `vinculos(origen_tipo, origen_id, destino_tipo, destino_id)`. Es más flexible, pero pierde las claves foráneas reales. Se reconsiderará si el número de tipos crece mucho.

### D4. Aislamiento por usuario con Row Level Security (aprobada el 2026-10-27)
**Decisión:** todas las tablas de contenido y de enlace llevan `usuario_id uuid not null default auth.uid()`, que referencia `auth.users` con `ON DELETE CASCADE`. **RLS está activado en todas ellas** con políticas `usuario_id = auth.uid()` para leer, crear, modificar y borrar. La aplicación usa siempre la clave publicable junto con la sesión del usuario. La clave secreta solo se usa en las pruebas automáticas.
**Por qué:** la base de datos impide el acceso a datos ajenos aunque el código tenga un fallo (spec `cuentas-usuario`).
**Alternativa:** filtrar solo en `repositories` con una clave de servicio. Descartada porque un olvido en una consulta expondría datos.

### D5. Autenticación con Supabase Auth (aprobada el 2026-10-27)
**Decisión:** Supabase Auth con **correo y contraseña**. La sesión viaja en cookies gestionadas por `@supabase/ssr`, y un `middleware.ts` de Next.js la renueva y redirige a `/entrar` cuando falta.
**Por qué:** se integra de forma natural con RLS (`auth.uid()`). Supabase guarda las contraseñas con hash, así que no hace falta gestionarlas en el código.
**Alternativa:** Auth.js con proveedor Credentials. Descartada porque obliga a mantener contraseñas propias y a crear un puente manual con RLS.

### D6. Contenido de notas almacenado en formato estructurado (aprobada el 2026-10-27)
**Decisión:** guardar el contenido de la nota como JSON (`notas.contenido jsonb`, formato de documento de Tiptap/ProseMirror) y una columna de texto plano derivada (`notas.contenido_texto`), preparada para una futura búsqueda. La app la rellena al guardar.
**Por qué:** permite empezar con el alcance mínimo del editor y añadir funciones exploradas después sin migrar el contenido existente.
**Alternativa:** Markdown en texto plano, más simple pero más limitado para enlaces internos y movimiento de secciones si se aprueban.

### D7. Tema visual centralizado
**Decisión:** tokens de diseño (colores, tipografías y espaciados) en variables CSS (`src/frontend/styles/tokens.css`). Las pantallas solo usan tokens, y una prueba automática lo comprueba.
**Por qué:** la identidad visual es exploratoria (spec `identidad-visual`). Cambiarla debe consistir en editar los tokens, no las pantallas.

### D8. Despliegue (propuesta)
**Propuesta:** Vercel para la aplicación y Supabase para los datos y la autenticación, con entornos de *preview* y producción.
**Alternativas:** un VPS con Docker: más control y coste fijo, pero más mantenimiento.

### D9. Estructura por capas dentro de una sola aplicación (aprobada el 2026-10-27)
**Decisión:** una única app Next.js con el código separado en frontend y backend:

```
src/
├── app/                 Rutas de Next.js (ubicación obligatoria). Solo enrutan:
│                        cada page.tsx renderiza una pantalla de frontend/.
├── middleware.ts        Renueva la sesión y protege las rutas (D5)
├── frontend/
│   ├── pantallas/       Una pantalla por ruta (Inicio, ListaNotas, Libro…)
│   ├── components/      Piezas reutilizables; las interactivas llevan "use client"
│   └── styles/          tokens.css (D7) y globals.css
└── backend/
    ├── controllers/     Server Actions: reciben formularios y validan la entrada
    ├── services/        Reglas de negocio (vincular sin duplicar, eliminar con aviso…)
    ├── repositories/    Única capa que consulta Supabase (tablas de datos)
    └── auth/            Clientes de Supabase para servidor y middleware; registro, entrada y salida
supabase/
├── config.toml
└── migrations/          Esquema, tablas de enlace y políticas RLS en SQL
```

**Dependencias permitidas:** `app → frontend → controllers → services → repositories`. El frontend nunca importa `services` ni `repositories`, y solo `repositories` y `auth` usan el cliente de Supabase. Única excepción: `services/catalogo.ts` (datos puros: entidades, rutas y relaciones permitidas, sin acceso a datos), que el frontend usa para mostrar los elementos relacionados.
**Por qué:** orden claro por responsabilidades, como en un backend clásico de controllers/services/routes, sin el coste de una API REST separada (despliegue doble, sesión entre dominios y CORS).
**Alternativa descartada:** dos aplicaciones (`backend/` con Express o NestJS y `frontend/` con React). Se reconsiderará si se necesita una app móvil u otro cliente.

## Risks / Trade-offs

- [Implementar como decisiones cosas que solo son propuestas] → Las tareas de capacidades pendientes o exploratorias quedan bloqueadas en `tasks.md` hasta que exista una decisión registrada.
- [Fuga de datos entre usuarios] → RLS en todas las tablas, claves foráneas compuestas en los vínculos y pruebas automáticas de acceso cruzado con dos usuarios reales.
- [Tabla nueva creada sin RLS] → Una prueba recorre todas las tablas del esquema `public` y falla si alguna no tiene RLS activado.
- [Fuga de la clave secreta] → Solo existe en `.env.local` y en las pruebas, nunca en código de la aplicación ni en variables `NEXT_PUBLIC_`.
- [Dependencia de Supabase (datos y autenticación)] → Los datos son PostgreSQL estándar y se pueden exportar; la autenticación sería lo más costoso de migrar. Aceptado.
- [Tablas de enlace que se multiplican al añadir glosario o citas] → Aceptado por ahora a cambio de la integridad referencial; si los tipos crecen, revisar D3.
- [Cambios en la identidad visual que obliguen a rehacer pantallas] → Tokens centralizados (D7).

## Migration Plan

No aplica (proyecto nuevo). El despliegue inicial consiste en enlazar el proyecto de Supabase (`supabase link`), aplicar las migraciones (`supabase db push`) y publicar la aplicación. Para volver atrás se redespliega la versión anterior y se aplica una migración que revierta el cambio.

## Open Questions

- Política de copias de seguridad y exportación de datos del usuario. Puede definirse después del primer despliegue.
