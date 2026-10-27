import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import {
  ERROR_CREDENCIALES,
  ERROR_GENERICO,
  ERROR_SIN_CONFIRMAR,
  MENSAJE_REVISA_CORREO,
  entrar,
  registrar,
} from "@/backend/services/cuentas";

function supabaseFalso(error: { code: string } | null) {
  const auth = {
    signUp: vi.fn().mockResolvedValue({ data: {}, error }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error }),
  };
  return { cliente: { auth } as unknown as SupabaseClient, auth };
}

describe("registro", () => {
  it("pide revisar el correo y envía la URL de confirmación", async () => {
    const { cliente, auth } = supabaseFalso(null);
    const r = await registrar(cliente, "ana@ejemplo.com", "contrasena1", "http://x/auth/confirmar");
    expect(r).toEqual({ ok: true, mensaje: MENSAJE_REVISA_CORREO });
    expect(auth.signUp).toHaveBeenCalledWith({
      email: "ana@ejemplo.com",
      password: "contrasena1",
      options: { emailRedirectTo: "http://x/auth/confirmar" },
    });
  });

  it("responde igual cuando el correo ya está registrado", async () => {
    const { cliente } = supabaseFalso({ code: "user_already_exists" });
    const r = await registrar(cliente, "ana@ejemplo.com", "contrasena1", "u");
    expect(r).toEqual({ ok: true, mensaje: MENSAJE_REVISA_CORREO });
  });

  it("rechaza correos y contraseñas no válidos sin llamar a Supabase", async () => {
    const { cliente, auth } = supabaseFalso(null);
    expect((await registrar(cliente, "no-es-correo", "contrasena1", "u")).ok).toBe(false);
    expect((await registrar(cliente, "ana@ejemplo.com", "corta", "u")).ok).toBe(false);
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it("devuelve un error genérico ante otros fallos", async () => {
    const { cliente } = supabaseFalso({ code: "over_email_send_rate_limit" });
    const r = await registrar(cliente, "ana@ejemplo.com", "contrasena1", "u");
    expect(r).toEqual({ ok: false, error: ERROR_GENERICO });
  });
});

describe("entrada", () => {
  it("entra con credenciales correctas", async () => {
    const { cliente } = supabaseFalso(null);
    expect(await entrar(cliente, "ana@ejemplo.com", "contrasena1")).toEqual({ ok: true });
  });

  it("usa el mismo mensaje para credenciales incorrectas", async () => {
    const { cliente } = supabaseFalso({ code: "invalid_credentials" });
    expect(await entrar(cliente, "ana@ejemplo.com", "mal")).toEqual({
      ok: false,
      error: ERROR_CREDENCIALES,
    });
  });

  it("recuerda confirmar el correo", async () => {
    const { cliente } = supabaseFalso({ code: "email_not_confirmed" });
    expect(await entrar(cliente, "ana@ejemplo.com", "contrasena1")).toEqual({
      ok: false,
      error: ERROR_SIN_CONFIRMAR,
    });
  });
});
