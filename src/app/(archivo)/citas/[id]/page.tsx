import Cita from "@/frontend/pantallas/Cita";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Cita id={id} />;
}
