import ListaNotas from "@/frontend/pantallas/ListaNotas";

export default async function Page({ searchParams }: { searchParams: Promise<{ orden?: string }> }) {
  const { orden } = await searchParams;
  return <ListaNotas orden={orden === "creacion" ? "creacion" : "modificacion"} />;
}
