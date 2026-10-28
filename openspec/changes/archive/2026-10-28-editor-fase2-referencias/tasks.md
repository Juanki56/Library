## 1. Base de datos

- [x] 1.1 Migración `referencias_nota`: tabla, claves foráneas compuestas, índice por destino, RLS de solo lectura y trigger que la mantiene desde el contenido (design D4); aplicar y regenerar tipos
- [x] 1.2 Pruebas de integración: el guardado crea y quita menciones, una sola fila por nota, sin autorreferencias, ids ajenos ignorados, cascada al eliminar, RLS y escritura directa denegada

## 2. Servidor

- [x] 2.1 Filtro de contenido: nodo `referencia` con `tipo: "nota"` e `id` UUID; descartar el resto (design D1) y pruebas unitarias
- [x] 2.2 Repositorio y servicio de referencias: títulos de las notas referenciadas, menciones de una nota y lista para el cuadro de búsqueda (design D2, D3, D6)

## 3. Editor

- [x] 3.1 Nodo de referencia con vista React: título actual con enlace o «Nota eliminada» (design D2)
- [x] 3.2 Cuadro «Referencia a una nota» con búsqueda sin tildes y teclado; opción en el menú «/» y botón en la barra (design D3)

## 4. Pantalla de la nota

- [x] 4.1 Pasar los títulos referenciados al editor y mostrar la sección «Notas que la mencionan» (design D5)

## 5. Pruebas y cierre

- [x] 5.1 E2E: insertar desde «/» y desde la barra, búsqueda sin tildes, título actualizado, abrir la nota referida, menciones (una vez, quitar, vacía) y nota eliminada
- [x] 5.2 Ejecutar la batería completa (unitarias, integración, E2E, lint y build)
