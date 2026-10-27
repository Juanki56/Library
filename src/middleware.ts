import type { NextRequest } from "next/server";
import { actualizarSesion } from "@/backend/auth/sesionMiddleware";

export function middleware(request: NextRequest) {
  return actualizarSesion(request);
}

export const config = {
  // Todo salvo archivos estáticos e imágenes.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
