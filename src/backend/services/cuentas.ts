import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ResultadoCuenta = { ok: true; mensaje?: string } | { ok: false; error: string };

export const MENSAJE_REVISA_CORREO =
  "Te hemos enviado un correo. Abre el enlace para confirmar tu cuenta.";
export const ERROR_CREDENCIALES = "Correo o contraseña incorrectos.";
export const ERROR_SIN_CONFIRMAR =
  "Todavía no has confirmado tu correo. Revisa tu bandeja de entrada.";
export const ERROR_GENERICO = "No se ha podido completar la operación. Inténtalo más tarde.";

const LONGITUD_MINIMA_CONTRASENA = 8;
const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarCredenciales(correo: string, contrasena: string): string | null {
  if (!FORMATO_CORREO.test(correo)) return "Introduce un correo válido.";
  if (contrasena.length < LONGITUD_MINIMA_CONTRASENA)
    return `La contraseña debe tener al menos ${LONGITUD_MINIMA_CONTRASENA} caracteres.`;
  return null;
}

// Registro con confirmación por correo. Un correo ya registrado recibe la misma
// respuesta que un registro nuevo para no revelar que existe (spec cuentas-usuario).
export async function registrar(
  supabase: SupabaseClient,
  correo: string,
  contrasena: string,
  urlConfirmacion: string,
): Promise<ResultadoCuenta> {
  const invalido = validarCredenciales(correo, contrasena);
  if (invalido) return { ok: false, error: invalido };

  const { error } = await supabase.auth.signUp({
    email: correo,
    password: contrasena,
    options: { emailRedirectTo: urlConfirmacion },
  });

  if (error && error.code !== "user_already_exists") {
    return { ok: false, error: ERROR_GENERICO };
  }
  return { ok: true, mensaje: MENSAJE_REVISA_CORREO };
}

// Inicio de sesión. Un fallo de credenciales no indica si el correo existe.
export async function entrar(
  supabase: SupabaseClient,
  correo: string,
  contrasena: string,
): Promise<ResultadoCuenta> {
  if (!correo || !contrasena) return { ok: false, error: ERROR_CREDENCIALES };

  const { error } = await supabase.auth.signInWithPassword({
    email: correo,
    password: contrasena,
  });

  if (!error) return { ok: true };
  if (error.code === "email_not_confirmed") return { ok: false, error: ERROR_SIN_CONFIRMAR };
  if (error.code === "invalid_credentials") return { ok: false, error: ERROR_CREDENCIALES };
  return { ok: false, error: ERROR_GENERICO };
}

export async function salir(supabase: SupabaseClient): Promise<void> {
  await supabase.auth.signOut();
}
