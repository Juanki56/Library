import Entrar from "@/frontend/pantallas/Entrar";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ confirmacion?: string }>;
}) {
  const { confirmacion } = await searchParams;
  return <Entrar confirmacionFallida={confirmacion === "fallida"} />;
}
