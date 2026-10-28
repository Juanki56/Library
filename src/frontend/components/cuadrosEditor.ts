// Los nodos que se insertan con un cuadro (referencia, imagen, vídeo) guardan en su almacén
// la función que lo abre; así el menú «/» puede abrirlo sin conocer la interfaz React.
export type AlmacenCuadro = { abrir: () => void };

export function abrirCuadro(storage: unknown, nodo: string) {
  (storage as Record<string, AlmacenCuadro | undefined>)[nodo]?.abrir();
}

export function ponerAbridor(storage: unknown, nodo: string, abrir: () => void) {
  const almacen = (storage as Record<string, AlmacenCuadro | undefined>)[nodo];
  if (almacen) almacen.abrir = abrir;
}
