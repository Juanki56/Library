## 1. Base de datos y almacenamiento

- [x] 1.1 Migración: bucket privado `imagenes` (5 MB, tipos permitidos), políticas de Storage por usuario y tabla `imagenes_nota` con RLS (design D2); aplicar y regenerar tipos
- [x] 1.2 Pruebas de integración: otro usuario no puede leer, subir ni borrar en la carpeta ajena; tabla con RLS

## 2. Servidor

- [x] 2.1 Filtro de contenido: nodos `imagen` y `video`, pie en el texto plano (design D1); reconocimiento de vídeos y de firmas de imagen como funciones puras, con pruebas unitarias
- [x] 2.2 Servicio de imágenes: subir con validación de tamaño y firma, servir por URL firmada, limpiar al abrir la nota y al eliminarla (design D3, D4, D8); límite de 6 MB en Server Actions
- [x] 2.3 Pruebas de integración del servicio: subida válida y rechazos, limpieza de imágenes no usadas y al eliminar la nota

## 3. Editor

- [x] 3.1 Nodos `imagen` y `video` con vista React: imagen subida o desde URL con pie y aviso si falla; reproductor de YouTube o Vimeo (design D5, D6)
- [x] 3.2 Cuadros «Insertar imagen» / «Editar imagen» e «Insertar vídeo»; opciones en «/» y botones en la barra (design D7)

## 4. Pruebas y cierre

- [x] 4.1 E2E: subir imagen y verla al reabrir, rechazos de tamaño y tipo, imagen privada para otro usuario, imagen desde URL y aviso si falla, alt y pie editables, vídeos de YouTube y Vimeo y enlace rechazado, limpieza al quitar y al eliminar
- [x] 4.2 Ejecutar la batería completa (unitarias, integración, E2E, lint y build)
