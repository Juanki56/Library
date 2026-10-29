import { esTipoBusqueda } from "@/backend/services/busqueda";
import { limpiarFiltros } from "@/backend/services/filtros";
import Buscar from "@/frontend/pantallas/Buscar";

type Parametros = { q?: string; tipo?: string; autor?: string; etiqueta?: string; desde?: string; hasta?: string; proyecto?: string; libro?: string };

export default async function Page({ searchParams }: { searchParams: Promise<Parametros> }) {
  const { q, tipo, ...resto } = await searchParams;
  return (
    <Buscar
      consulta={(q ?? "").trim().slice(0, 200)}
      filtro={esTipoBusqueda(tipo) ? tipo : undefined}
      filtros={limpiarFiltros(resto)}
    />
  );
}
