import { esTipoBusqueda } from "@/backend/services/busqueda";
import Buscar from "@/frontend/pantallas/Buscar";

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; tipo?: string }> }) {
  const { q, tipo } = await searchParams;
  return <Buscar consulta={(q ?? "").trim().slice(0, 200)} filtro={esTipoBusqueda(tipo) ? tipo : undefined} />;
}
