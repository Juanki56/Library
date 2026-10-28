import { esTipoRecurso } from "@/backend/services/fichas";
import ListaRecursos from "@/frontend/pantallas/ListaRecursos";

export default async function Page({ searchParams }: { searchParams: Promise<{ tipo?: string }> }) {
  const { tipo } = await searchParams;
  return <ListaRecursos tipo={esTipoRecurso(tipo) ? tipo : undefined} />;
}
