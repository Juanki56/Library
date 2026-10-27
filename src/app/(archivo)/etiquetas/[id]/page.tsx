import { esEntidad } from "@/backend/services/catalogo";
import Etiqueta from "@/frontend/pantallas/Etiqueta";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tipo?: string }>;
}) {
  const [{ id }, { tipo }] = await Promise.all([params, searchParams]);
  return <Etiqueta id={id} filtro={esEntidad(tipo) ? tipo : undefined} />;
}
