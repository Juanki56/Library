# Proposal

## Why

El usuario esperaba poder pegar una imagen directamente en el editor y verla, como en Word o Notion. Hoy solo se insertan desde el cuadro «Imagen»; al pegar o arrastrar una imagen, el editor la ignora.

## What Changes

- **Pegar una imagen** (por ejemplo, una captura de pantalla o una imagen copiada) la sube como las del cuadro «Imagen» y la inserta donde está el cursor.
- **Arrastrar un archivo de imagen** desde el ordenador al editor la sube y la inserta donde se suelta.
- **Pegar contenido copiado de una web** con imágenes las inserta como imágenes desde su dirección (http o https); las que no tienen una dirección web válida se descartan.
- Mientras se sube se muestra «Subiendo imagen…»; si falla (tamaño, tipo o red), se avisa y no se inserta nada. Mismos límites que el cuadro: PNG, JPEG, GIF o WebP de hasta 5 MB, privadas.

## Capabilities

### New Capabilities

_Ninguna._

### Modified Capabilities

- `editor-notas`: «Imágenes subidas» e «Imágenes desde una URL» admiten pegar y arrastrar.

## Impact

- **Frontend:** extensión `PegarImagenes` (pegar y soltar archivos), regla de lectura de `<img>` en el nodo `imagen`, aviso de subida en `EditorNota`. Reutiliza la Server Action `subirImagen`.
- **Sin cambios en el servidor ni en la base de datos.**
- **Pruebas:** E2E de pegar, arrastrar, contenido web pegado y rechazos; comprobación en el servidor de desarrollo.
