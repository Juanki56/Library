import type { Page } from "@playwright/test";
import type { UsuarioPrueba } from "../utilidades/usuarios";

export async function entrarComo(page: Page, usuario: UsuarioPrueba) {
  await page.goto("/entrar");
  await page.getByLabel("Correo electrónico").fill(usuario.correo);
  await page.getByLabel("Contraseña").fill(usuario.contrasena);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL((url) => url.pathname === "/");
}
