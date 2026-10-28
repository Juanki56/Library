# Design

## Context

- `services/relacionados.obtenerRelacionados` devuelve por tipo los vinculados `{id, nombre}` y los candidatos; `ElementosRelacionados` los pinta con un `<select>` por tipo y un botón «Quitar».
- `NotasQueMencionan`, `CitasEnlazadas` y `EtiquetasElemento` son secciones separadas al final de cada página.
- Las páginas de detalle usan `.pagina` con el ancho de lectura (`--ancho-lectura`).

## Goals / Non-Goals

**Goals:** ver de un vistazo con qué está conectado un elemento y por qué, y vincular sin buscar en desplegables largos.

**Non-Goals:** grafo, conexiones indirectas, cambios de datos.

## Decisions

### D1. Datos con contexto
`obtenerRelacionados` pide al repositorio columnas de contexto por tipo y devuelve `ElementoConexion { id, nombre, detalle, extracto? }`:
- nota: `extracto` (primera línea, como en Inicio) y `detalle` «Modificada el …» (fecha formateada en el frontend: el servicio devuelve la fecha ISO);
- libro: autores · editorial · año · estado;
- recurso: tipo · autor · sitio web;
- proyecto: descripción recortada a una línea.
Los candidatos siguen siendo `{id, nombre}` por tipo.

### D2. Disposición
- Nuevo contenedor `.paginaDetalle` en `Seccion.module.css`: rejilla `minmax(0, var(--ancho-lectura))` + `19rem` desde 72 rem de ancho; una sola columna por debajo.
- `<aside aria-label="Conexiones">` con `position: sticky; top` y desplazamiento propio si es más alto que la ventana. Fondo marfil, filete a la izquierda, encabezados en versalitas como Inicio.
- Orden dentro: botón «Vincular…» (y «Nueva nota vinculada» donde aplica), etiquetas, grupos de vínculos (Notas, Proyectos, Libros, Fuentes y recursos), «La mencionan», «Citas».

### D3. «Vincular…»
`CuadroVincular`: `<dialog>` como los del editor, con combobox «Buscar» y lista de resultados con el tipo de cada uno. Filtra en el cliente con `sinTildes`. Al elegir, llama a la Server Action `vincularElementos` existente con un `FormData` y cierra; la página se refresca por `revalidatePath`.

### D4. Quitar
Botón «×» con nombre accesible «Quitar vínculo con «…»», visible siempre con poco contraste y resaltado al pasar o enfocar. Usa `desvincularElementos`.

### D5. Nueva nota vinculada
Enlace a `/notas/nueva?vincular=<tipo>:<id>`. La página valida el parámetro y muestra «Se vinculará con «…».»; el formulario envía `vincularTipo`/`vincularId`. `crearNota` crea la nota y después llama a `vinculos.vincular`; si el vínculo falla, la nota se conserva y se abre igualmente.

### D6. Componentes
`Conexiones` (servidor) compone `EtiquetasElemento`, los grupos, menciones y citas; sustituye a `ElementosRelacionados`, `NotasQueMencionan` y `CitasEnlazadas`, que se eliminan.

## Risks / Trade-offs

- [Proyectos: su contenido aparece en los apartados y en Conexiones] → Se acepta: los apartados organizan, Conexiones vincula y desvincula.
- [Muchos candidatos] → Filtro en el cliente con hasta 20 resultados visibles; volumen personal.

## Migration Plan

Solo código. Sin datos que migrar.

## Open Questions

Ninguna.
