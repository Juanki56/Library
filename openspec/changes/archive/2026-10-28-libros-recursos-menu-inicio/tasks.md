## 1. Base de datos

- [x] 1.1 Migración: renombrar `notas_bibliograficas` a `descripcion`, añadir ISBN, estado de lectura y portada a `libros`, tipo y fecha de publicación a `recursos`, y actualizar `buscar` (design D1); aplicar y regenerar tipos

## 2. Libros

- [x] 2.1 Validación de ISBN como función pura, con pruebas unitarias (design D2)
- [x] 2.2 Servicio y formulario del libro: descripción, ISBN y estado de lectura; estado en la lista y en la página
- [x] 2.3 Portada: subir, desde la web y quitar, con borrado de la anterior y al eliminar el libro (design D3); pruebas de integración

## 3. Recursos

- [x] 3.1 Tipo y fecha de publicación en servicio y formulario; tipo en la lista y filtro por tipo (design D4)

## 4. Menú e Inicio

- [x] 4.1 Nuevo orden del menú
- [x] 4.2 Inicio: accesos rápidos, «Leyendo ahora» o libros recientes, proyectos recientes (design D5)

## 5. Pruebas y cierre

- [x] 5.1 E2E: ficha completa del libro, ISBN incorrecto, estado en la lista, portada subida y desde la web, recurso con tipo y fecha, filtro por tipo, orden del menú, Inicio (accesos, «Leyendo ahora», sin libros en lectura); actualizar las pruebas existentes
- [x] 5.2 Ejecutar la batería completa (unitarias, integración, E2E, lint y build)
