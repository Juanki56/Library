import Proyecto from "@/frontend/pantallas/Proyecto";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Proyecto id={id} />;
}
