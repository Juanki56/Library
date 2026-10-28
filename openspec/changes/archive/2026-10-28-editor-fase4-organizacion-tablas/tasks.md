## 1. Servidor

- [x] 1.1 Filtro de contenido: nodos de tabla con solo `colspan`, `rowspan` y `colwidth` válidos, celdas vacías con párrafo, texto de las celdas en el texto plano (design D3); pruebas unitarias

## 2. Editor

- [x] 2.1 Extensión `MoverBloques`: comando, atajos Alt+↑ / Alt+↓ y botones «Subir bloque» / «Bajar bloque» (design D1)
- [x] 2.2 Índice de la nota calculado del contenido, con salto al subtítulo (design D2)
- [x] 2.3 Tablas: instalar `@tiptap/extension-table` 3.32.0, insertar desde «/» y la barra, grupo de acciones de tabla y estilos (design D3)

## 3. Pruebas y cierre

- [x] 3.1 E2E: subir y bajar bloques con botones y teclado (párrafo, subtítulo, elemento de lista, borde), índice (entradas, sangría, salto, actualización, sin subtítulos), tablas (insertar, rellenar, filas y columnas, eliminar, conservar al reabrir)
- [x] 3.2 Ejecutar la batería completa (unitarias, integración, E2E, lint y build)
