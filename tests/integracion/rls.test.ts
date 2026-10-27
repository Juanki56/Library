import { describe, expect, it } from "vitest";
import { admin } from "../utilidades/usuarios";

// Tarea 2.4 (design D4): ninguna tabla del esquema public puede quedar sin RLS.
describe("Row Level Security", () => {
  it("está activado en todas las tablas del esquema public", async () => {
    const { data, error } = await admin().rpc("tablas_sin_rls");
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("la comprobación no está disponible para usuarios normales", async () => {
    const { createClient } = await import("@supabase/supabase-js");
    const anonimo = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );
    const { error } = await anonimo.rpc("tablas_sin_rls");
    expect(error).not.toBeNull();
  });
});
