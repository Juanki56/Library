import "server-only";
import type { Cliente } from "./clienteLibre";

export async function buscar(cliente: Cliente, consulta: string, filtro?: string) {
  return cliente.rpc("buscar", { consulta, filtro });
}

// Proyectos y libros de las notas encontradas, para mostrar sus relaciones en los resultados.
export async function relacionesDeNotas(cliente: Cliente, ids: string[]) {
  return Promise.all([
    cliente.from("nota_proyecto").select("nota_id, proyectos(nombre)").in("nota_id", ids),
    cliente.from("nota_libro").select("nota_id, libros(titulo)").in("nota_id", ids),
  ]);
}
