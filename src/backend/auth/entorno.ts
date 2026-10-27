// Variables públicas de Supabase (design D2). La clave secreta nunca se lee aquí.
export function entornoSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clavePublicable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !clavePublicable) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en .env.local",
    );
  }
  return { url, clavePublicable };
}
