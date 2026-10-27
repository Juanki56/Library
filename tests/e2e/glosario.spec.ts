import type { SupabaseClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";
import type { Database } from "@/backend/repositories/tipos-db";
import { borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";
import { entrarComo } from "./sesion";

// Tarea 4.2: sección Glosario (spec glosario).
let usuario: UsuarioPrueba;
let datos: SupabaseClient<Database>;

test.beforeAll(async () => {
  usuario = await crearUsuario({ confirmado: true });
  datos = await clienteDe(usuario);
});

test.afterAll(async () => {
  await borrarUsuario(usuario);
});

test.beforeEach(async ({ page }) => {
  await entrarComo(page, usuario);
});

test("registra un término sin ejemplo y aparece en su letra", async ({ page }) => {
  await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Glosario" }).click();
  await page.getByRole("link", { name: "Nuevo término" }).click();
  await page.getByLabel("Término").fill("Plusvalía");
  await page.getByLabel("Definición").fill("Valor que produce el trabajo por encima del salario.");
  await page.getByRole("button", { name: "Añadir al glosario" }).click();

  await expect(page).toHaveURL(/\/glosario$/);
  const letra = page.getByRole("region", { name: "Letra P" });
  await expect(letra.getByRole("link", { name: "Plusvalía" })).toBeVisible();
  await expect(letra).toContainText("Valor que produce el trabajo por encima del salario.");
});

test("un término duplicado ofrece abrir la entrada existente", async ({ page }) => {
  const { data } = await datos.from("glosario").insert({ termino: "Alienación", definicion: "Extrañamiento." }).select("id").single();
  await page.goto("/glosario/nuevo");
  await page.getByLabel("Término").fill("alienacion");
  await page.getByLabel("Definición").fill("Otra definición.");
  await page.getByRole("button", { name: "Añadir al glosario" }).click();

  await expect(page.locator("main").getByRole("alert")).toContainText("Ese término ya existe en tu glosario.");
  await page.getByRole("link", { name: "Abrir «Alienación»" }).click();
  await expect(page).toHaveURL(new RegExp(`/glosario/${data!.id}$`));
});

test("acceso por letra y edición de la definición", async ({ page }) => {
  await datos.from("glosario").insert([
    { termino: "Dialéctica", definicion: "Método de razonamiento." },
    { termino: "Ética", definicion: "Reflexión sobre la moral.", ejemplo: "La ética de Aristóteles." },
    { termino: "Reificación", definicion: "Provisional." },
  ]);
  await page.goto("/glosario");
  const abecedario = page.getByRole("navigation", { name: "Ir a la letra" });
  await abecedario.getByRole("link", { name: "E", exact: true }).click();
  await expect(page).toHaveURL(/#letra-E$/);
  await expect(page.getByRole("region", { name: "Letra E" })).toContainText("Ejemplo: La ética de Aristóteles.");

  await page.getByRole("link", { name: "Reificación" }).click();
  await page.getByLabel("Definición").fill("Cosificación de las relaciones sociales.");
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByRole("status")).toHaveText("Guardado.");
  await page.goto("/glosario");
  await expect(page.getByRole("region", { name: "Letra R" })).toContainText("Cosificación de las relaciones sociales.");
});
