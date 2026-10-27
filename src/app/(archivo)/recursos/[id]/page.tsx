import Recurso from "@/frontend/pantallas/Recurso";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Recurso id={id} />;
}
