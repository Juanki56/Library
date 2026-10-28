import NuevaNota from "@/frontend/pantallas/NuevaNota";

export default async function Page({ searchParams }: { searchParams: Promise<{ vincular?: string }> }) {
  const { vincular } = await searchParams;
  return <NuevaNota vincular={vincular} />;
}
