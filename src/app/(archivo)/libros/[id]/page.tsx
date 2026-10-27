import Libro from "@/frontend/pantallas/Libro";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Libro id={id} />;
}
