import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { entornoSupabase } from "./entorno";

// Rutas accesibles sin sesión (spec cuentas-usuario).
const RUTAS_PUBLICAS = ["/entrar", "/registro", "/auth/"];
const RUTAS_SOLO_SIN_SESION = ["/entrar", "/registro"];

function empiezaPor(ruta: string, prefijos: string[]) {
  return prefijos.some((p) => ruta === p || ruta.startsWith(p.endsWith("/") ? p : `${p}/`));
}

// Renueva la sesión de Supabase en cada petición y protege las rutas de contenido (design D5).
export async function actualizarSesion(request: NextRequest) {
  const { url, clavePublicable } = entornoSupabase();
  let respuesta = NextResponse.next({ request });

  const supabase = createServerClient(url, clavePublicable, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(porGuardar) {
        porGuardar.forEach(({ name, value }) => request.cookies.set(name, value));
        respuesta = NextResponse.next({ request });
        porGuardar.forEach(({ name, value, options }) =>
          respuesta.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ruta = request.nextUrl.pathname;

  if (!user && !empiezaPor(ruta, RUTAS_PUBLICAS)) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/entrar";
    destino.search = "";
    return NextResponse.redirect(destino);
  }

  if (user && empiezaPor(ruta, RUTAS_SOLO_SIN_SESION)) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/";
    destino.search = "";
    return NextResponse.redirect(destino);
  }

  return respuesta;
}
