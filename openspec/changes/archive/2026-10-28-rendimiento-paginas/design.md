# Design

## Context

Una página de detalle esperaba, en cadena: la consulta de sesión del middleware al servidor de autenticación; la carga del elemento; y, en paralelo, sus relacionados (dos consultas por tipo: vinculados y todos los candidatos), etiquetas, citas y el aviso de eliminación (comprobar que existe y contar sus vínculos, en serie). El camino más largo marcaba el tiempo.

## Decisions

### D1. `getClaims()` en el middleware
Verifica y, si hace falta, renueva la sesión comprobando la firma del token con las claves públicas del proyecto (en caché). Es el método que recomienda Supabase para el middleware de Next.js. Si el proyecto usara claves simétricas, Supabase recurre por sí mismo a consultar el servidor, como antes. La RLS sigue protegiendo cada consulta.

### D2. Candidatos bajo demanda
`obtenerRelacionados(cliente, ref, { conCandidatos })` solo trae la lista completa cuando se pide. `Conexiones` ya no la pide; `CuadroVincular` llama a la Server Action `candidatosParaVincular` al abrirse. Los apartados del proyecto sí la piden (`conCandidatos: true`).

### D3. Aviso de eliminación bajo demanda
`ConfirmarEliminacion` acepta `avisoDe` (tipo del elemento) y, al abrir el cuadro, llama a la Server Action `avisoParaEliminar`. Se mantiene `aviso` para los casos en que ya se conoce (apartados).

## Risks / Trade-offs

- [Un instante de «Cargando…» al abrir «Vincular…» o «Eliminar»] → Una sola consulta, mucho menor que lo que costaba en cada visita; Intro durante la carga se respeta.

## Migration Plan

Solo código.

## Open Questions

Ninguna.
