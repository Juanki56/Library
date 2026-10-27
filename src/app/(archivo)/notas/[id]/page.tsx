import Nota from "@/frontend/pantallas/Nota";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Nota id={id} />;
}
