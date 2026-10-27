import { expect, test, type Page } from "@playwright/test";
import {
  borrarUsuario,
  crearUsuario,
  registrarSinCorreo,
  type UsuarioPrueba,
} from "../utilidades/usuarios";

const ERROR_CREDENCIALES = "Correo o contraseña incorrectos.";

async function entrar(page: Page, correo: string, contrasena: string) {
  await page.goto("/entrar");
  await page.getByLabel("Correo electrónico").fill(correo);
  await page.getByLabel("Contraseña").fill(contrasena);
  await page.getByRole("button", { name: "Entrar" }).click();
}

let confirmado: UsuarioPrueba;
let sinConfirmar: UsuarioPrueba;

test.beforeAll(async () => {
  confirmado = await crearUsuario({ confirmado: true });
  sinConfirmar = await crearUsuario({ confirmado: false });
});

test.afterAll(async () => {
  await borrarUsuario(confirmado);
  await borrarUsuario(sinConfirmar);
});

test("sin sesión, el contenido redirige a /entrar", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/entrar$/);
  await expect(page.getByText("Archivo personal de conocimiento")).toHaveCount(0);
});

test("entra con una cuenta confirmada y sale", async ({ page }) => {
  await entrar(page, confirmado.correo, confirmado.contrasena);
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1, name: "Archivo de conocimiento" })).toBeVisible();

  await page.getByRole("button", { name: "Salir" }).click();
  await expect(page).toHaveURL(/\/entrar$/);

  await page.goto("/");
  await expect(page).toHaveURL(/\/entrar$/);
});

test("con sesión, /entrar lleva al archivo", async ({ page }) => {
  await entrar(page, confirmado.correo, confirmado.contrasena);
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/entrar");
  await expect(page).toHaveURL(/\/$/);
});

test("una cuenta sin confirmar no puede entrar", async ({ page }) => {
  await entrar(page, sinConfirmar.correo, sinConfirmar.contrasena);
  await expect(page.locator("main").getByRole("alert")).toContainText("confirmado tu correo");
  await expect(page).toHaveURL(/\/entrar$/);
});

test("las credenciales incorrectas no revelan si el correo existe", async ({ page }) => {
  await entrar(page, confirmado.correo, "contraseña-equivocada");
  await expect(page.locator("main").getByRole("alert")).toHaveText(ERROR_CREDENCIALES);
  // Tras el error, el correo escrito se conserva.
  await expect(page.getByLabel("Correo electrónico")).toHaveValue(confirmado.correo);

  await entrar(page, "nadie-registrado@ejemplo.com", "contraseña-equivocada");
  await expect(page.locator("main").getByRole("alert")).toHaveText(ERROR_CREDENCIALES);
});

test("registrarse con un correo existente no revela que existe", async ({ page }) => {
  await page.goto("/registro");
  await page.getByLabel("Correo electrónico").fill(confirmado.correo);
  await page.getByLabel("Contraseña").fill("OtraClave-123");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page.getByRole("status")).toContainText("Te hemos enviado un correo");
});

test("el enlace de confirmación funciona en un navegador distinto al del registro", async ({
  browser,
}) => {
  const nuevo = await registrarSinCorreo();
  // Contexto nuevo: sin cookies del registro, como al abrir el correo en otro dispositivo.
  const contexto = await browser.newContext();
  const page = await contexto.newPage();
  try {
    await page.goto(`/auth/confirmar?token_hash=${nuevo.tokenHash}&type=email`);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1, name: "Archivo de conocimiento" })).toBeVisible();
  } finally {
    await contexto.close();
    await borrarUsuario(nuevo);
  }
});

test("un enlace de confirmación no válido lleva a /entrar con aviso", async ({ page }) => {
  await page.goto("/auth/confirmar?token_hash=no-valido&type=email");
  await expect(page).toHaveURL(/\/entrar\?confirmacion=fallida$/);
  await expect(page.locator("main").getByRole("alert")).toContainText("No se pudo completar");
});
