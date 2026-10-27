import EntradaGlosario from "@/frontend/pantallas/EntradaGlosario";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EntradaGlosario id={id} />;
}
