import ListaCitas from "@/frontend/pantallas/ListaCitas";

const TIPOS = ["cita", "frase", "proverbio"];

export default async function Page({ searchParams }: { searchParams: Promise<{ tipo?: string; autor?: string }> }) {
  const { tipo, autor } = await searchParams;
  return <ListaCitas tipo={tipo && TIPOS.includes(tipo) ? tipo : undefined} autor={autor?.trim().slice(0, 300) || undefined} />;
}
