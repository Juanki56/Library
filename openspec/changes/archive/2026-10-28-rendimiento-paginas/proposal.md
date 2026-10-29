# Proposal

## Why

El usuario notaba lenta cada página. Al medir (tiempo hasta que el servidor empieza a responder, compilación de producción), la página de un libro tardaba ~1,03 s, la de un proyecto ~0,94 s y la de una nota ~0,76 s. Casi todo era espera de consultas a Supabase que la página no necesitaba para mostrarse.

## What Changes

- **Sesión sin consulta al servidor en cada página:** el middleware verifica la sesión con `getClaims()` (firma del token con las claves públicas de Supabase) en lugar de preguntar al servidor de autenticación en cada navegación.
- **«Vincular…» carga su lista al abrirse:** la página ya no trae todas las notas, libros, recursos y proyectos para ofrecerlos; el cuadro los pide al abrirlo («Cargando…»). Si se pulsa Intro mientras carga, se elige el primer resultado al llegar.
- **El aviso de «Eliminar» se calcula al abrir el cuadro:** la página ya no cuenta vínculos en cada visita («Comprobando qué vínculos se perderán…»).
- Los apartados de un proyecto siguen cargando su lista completa, porque la necesitan para añadir elementos.

Sin cambios de comportamiento visibles más allá de esos avisos de carga: las specs no cambian.

## Capabilities

### New Capabilities

_Ninguna._

### Modified Capabilities

_Ninguna_ (mejora de rendimiento sin cambio de requisitos).

## Impact

- `auth/sesionMiddleware.ts`, `services/relacionados.ts`, `controllers/relaciones.ts`, `CuadroVincular`, `Conexiones`, `ConfirmarEliminacion` y las pantallas de nota, libro, recurso y proyecto.
- Resultado medido con los mismos datos: libro **415 ms** (−60 %), proyecto **428 ms** (−54 %), nota **346 ms** (−54 %).
