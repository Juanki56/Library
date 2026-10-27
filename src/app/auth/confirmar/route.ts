import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { crearClienteServidor } from "@/backend/auth/clienteServidor";

// Destino del enlace de confirmación del correo (spec cuentas-usuario).
// Con token_hash se valida en el servidor y funciona aunque el enlace se abra en
// otro navegador o dispositivo; "code" se mantiene por compatibilidad con PKCE.
export async function GET(request: NextRequest) {
  const parametros = request.nextUrl.searchParams;
  const tokenHash = parametros.get("token_hash");
  const tipo = parametros.get("type") as EmailOtpType | null;
  const codigo = parametros.get("code");

  const destino = request.nextUrl.clone();
  destino.search = "";

  const supabase = await crearClienteServidor();
  let error: unknown = true;
  if (tokenHash && tipo) {
    ({ error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: tipo }));
  } else if (codigo) {
    ({ error } = await supabase.auth.exchangeCodeForSession(codigo));
  }

  if (!error) {
    destino.pathname = "/";
    return NextResponse.redirect(destino);
  }

  destino.pathname = "/entrar";
  destino.searchParams.set("confirmacion", "fallida");
  return NextResponse.redirect(destino);
}
