import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import type { Database } from "@/backend/repositories/tipos-db";

function variable(nombre: string) {
  const valor = process.env[nombre];
  if (!valor) throw new Error(`Falta ${nombre} en .env.local`);
  return valor;
}

// Cliente de administración SOLO para pruebas: crea y borra usuarios y salta RLS (design D4).
export function admin() {
  return createClient<Database>(
    variable("NEXT_PUBLIC_SUPABASE_URL"),
    variable("SUPABASE_SECRET_KEY"),
    { auth: { persistSession: false } },
  );
}

// Acceso sin tipos a tablas elegidas en tiempo de ejecución (mismo ayudante que repositories).
export { sinTipos, type FilaLibre } from "@/backend/repositories/clienteLibre";

// Cliente con la clave publicable y la sesión del usuario, igual que la app real: RLS aplica.
export async function clienteDe(usuario: UsuarioPrueba): Promise<SupabaseClient<Database>> {
  const cliente = createClient<Database>(
    variable("NEXT_PUBLIC_SUPABASE_URL"),
    variable("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { error } = await cliente.auth.signInWithPassword({
    email: usuario.correo,
    password: usuario.contrasena,
  });
  if (error) throw error;
  return cliente;
}

export type UsuarioPrueba = { id: string; correo: string; contrasena: string };

export async function crearUsuario({ confirmado }: { confirmado: boolean }): Promise<UsuarioPrueba> {
  const correo = `prueba-${randomUUID()}@ejemplo.com`;
  const contrasena = `Clave-${randomUUID()}`;
  const { data, error } = await admin().auth.admin.createUser({
    email: correo,
    password: contrasena,
    email_confirm: confirmado,
  });
  if (error) throw error;
  return { id: data.user.id, correo, contrasena };
}

// Registra un usuario sin enviar correo y devuelve el token del enlace de confirmación.
export async function registrarSinCorreo(): Promise<UsuarioPrueba & { tokenHash: string }> {
  const correo = `prueba-${randomUUID()}@ejemplo.com`;
  const contrasena = `Clave-${randomUUID()}`;
  const { data, error } = await admin().auth.admin.generateLink({
    type: "signup",
    email: correo,
    password: contrasena,
  });
  if (error) throw error;
  return {
    id: data.user.id,
    correo,
    contrasena,
    tokenHash: data.properties.hashed_token,
  };
}

export async function borrarUsuario(usuario: UsuarioPrueba | undefined) {
  if (usuario) await admin().auth.admin.deleteUser(usuario.id);
}
