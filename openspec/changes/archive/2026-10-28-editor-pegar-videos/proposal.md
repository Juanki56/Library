# Proposal

## Why

Al pegar un enlace de YouTube en una nota se queda como enlace de texto: para ver el reproductor hay que usar «/vid» o el botón «Vídeo». El 2026-10-28 el usuario pidió que pegarlo baste, como en Notion.

## What Changes

- Pegar un enlace de YouTube o Vimeo **solo, en una línea vacía**, inserta el reproductor en esa línea.
- Pegado **dentro de un texto** (la línea ya tiene algo), o junto a más texto, sigue siendo un enlace normal, para no romper lo escrito.
- Los enlaces de otros sitios no cambian de comportamiento.

## Capabilities

### New Capabilities

_Ninguna._

### Modified Capabilities

- `editor-notas`: «Vídeos de YouTube y Vimeo» admite pegar el enlace en una línea vacía.

## Impact

- **Frontend:** regla de pegado en el nodo `video` (`nodosMedios.tsx`), reutilizando `reconocerVideo`. Sin cambios en el servidor ni en la base de datos.
- **Pruebas:** E2E de pegar en línea vacía (YouTube y Vimeo), dentro de un texto y un enlace de otro sitio; también en el servidor de desarrollo.
