import type { SupabaseClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";
import type { Database } from "@/backend/repositories/tipos-db";
import { borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";
import { entrarComo } from "./sesion";

// Tareas 3.2 y 3.3: etiquetas en las fichas y sección Etiquetas (spec etiquetas).
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

const bloque = (page: Page) => page.getByRole("region", { name: "Etiquetas" });

async function etiquetar(page: Page, ruta: string, nombre: string) {
  await page.goto(ruta);
  await bloque(page).getByLabel("Añadir etiqueta").fill(nombre);
  await bloque(page).getByRole("button", { name: "Añadir" }).click();
  await expect(bloque(page).getByRole("list", { name: "Etiquetas del elemento" })).toContainText(/filosof/i);
}

test("ejemplo «Filosofía»: una sola etiqueta en los cuatro tipos, agrupados y con filtro", async ({ page }) => {
  const { data: nota } = await datos.from("notas").insert({ titulo: "Platón y las ideas" }).select("id").single();
  const { data: libro } = await datos.from("libros").insert({ titulo: "La República" }).select("id").single();
  const { data: proyecto } = await datos.from("proyectos").insert({ nombre: "Estudiar filosofía" }).select("id").single();
  const { data: recurso } = await datos.from("recursos").insert({ titulo: "Enciclopedia de Stanford" }).select("id").single();

  // Crear al asignar y reutilizar sin distinguir mayúsculas ni tildes.
  await etiquetar(page, `/notas/${nota!.id}`, "Filosofía");
  await etiquetar(page, `/libros/${libro!.id}`, "filosofia");
  await etiquetar(page, `/proyectos/${proyecto!.id}`, "FILOSOFÍA");
  await etiquetar(page, `/recursos/${recurso!.id}`, "Filosofia");

  await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Etiquetas" }).click();
  const lista = page.getByRole("list", { name: "Lista de etiquetas" });
  await expect(lista.getByRole("link")).toHaveText(["Filosofía"]);

  await lista.getByRole("link", { name: "Filosofía" }).click();
  for (const [grupo, nombre] of [
    ["Notas", "Platón y las ideas"],
    ["Libros", "La República"],
    ["Proyectos", "Estudiar filosofía"],
    ["Fuentes y recursos", "Enciclopedia de Stanford"],
  ]) {
    await expect(page.getByRole("region", { name: grupo }).getByRole("link", { name: nombre })).toBeVisible();
  }

  await page.getByRole("navigation", { name: "Filtrar por tipo" }).getByRole("link", { name: "Libros" }).click();
  await expect(page).toHaveURL(/tipo=libro/);
  await expect(page.locator("main").getByRole("link", { name: "La República" })).toBeVisible();
  await expect(page.locator("main").getByRole("link", { name: "Platón y las ideas" })).toHaveCount(0);

  // Abrir un elemento desde la etiqueta.
  await page.locator("main").getByRole("link", { name: "La República" }).click();
  await expect(page).toHaveURL(new RegExp(`/libros/${libro!.id}$`));
});

test("quitar una etiqueta no borra el elemento", async ({ page }) => {
  const { data: nota } = await datos.from("notas").insert({ titulo: "Nota con etiqueta" }).select("id").single();
  await page.goto(`/notas/${nota!.id}`);
  await bloque(page).getByLabel("Añadir etiqueta").fill("Economía");
  await bloque(page).getByRole("button", { name: "Añadir" }).click();
  await bloque(page).getByRole("button", { name: "Quitar la etiqueta «Economía»" }).click();
  await expect(bloque(page).getByText("Sin etiquetas.")).toBeVisible();
  await page.goto("/notas");
  await expect(page.getByRole("link", { name: "Nota con etiqueta" })).toBeVisible();
});

test("crear, renombrar y eliminar con advertencia conservando los elementos", async ({ page }) => {
  const { data: nota } = await datos.from("notas").insert({ titulo: "Nota marxista" }).select("id").single();
  await page.goto("/etiquetas");
  await page.getByLabel("Nueva etiqueta").fill("marxismo");
  await page.getByRole("button", { name: "Crear etiqueta" }).click();
  const lista = page.getByRole("list", { name: "Lista de etiquetas" });
  await expect(lista.getByRole("link", { name: "marxismo" })).toBeVisible();

  // Renombrar a un nombre existente se rechaza; a uno nuevo funciona.
  await page.getByLabel("Nueva etiqueta").fill("Teoría crítica");
  await page.getByRole("button", { name: "Crear etiqueta" }).click();
  const fila = lista.getByRole("listitem").filter({ hasText: "marxismo" });
  await fila.getByText("Renombrar").click();
  await fila.getByLabel("Nuevo nombre").fill("TEORIA CRITICA");
  await fila.getByRole("button", { name: "Guardar nombre" }).click();
  await expect(fila.getByRole("alert")).toHaveText("Ya existe una etiqueta con ese nombre.");
  await fila.getByLabel("Nuevo nombre").fill("Marxismo");
  await fila.getByRole("button", { name: "Guardar nombre" }).click();
  await expect(lista.getByRole("link", { name: "Marxismo", exact: true })).toBeVisible();

  // Asignarla a la nota y eliminarla con advertencia.
  await page.goto(`/notas/${nota!.id}`);
  await bloque(page).getByLabel("Añadir etiqueta").fill("marxismo");
  await bloque(page).getByRole("button", { name: "Añadir" }).click();
  await expect(bloque(page).getByRole("link", { name: "Marxismo" })).toBeVisible();

  await page.goto("/etiquetas");
  await page.getByRole("button", { name: "Eliminar la etiqueta «Marxismo»" }).click();
  await expect(page.getByRole("dialog", { name: "¿Eliminar «Marxismo»?" })).toContainText(
    "Se quitará de 1 elemento. Ese elemento no se borrará.",
  );
  await page.getByRole("dialog", { name: "¿Eliminar «Marxismo»?" }).getByRole("button", { name: "Eliminar definitivamente" }).click();
  await expect(page.getByRole("list", { name: "Lista de etiquetas" }).getByRole("link", { name: "Marxismo", exact: true })).toHaveCount(0);

  await page.goto(`/notas/${nota!.id}`);
  await expect(page.getByRole("textbox", { name: "Título", exact: true })).toHaveValue("Nota marxista");
  await expect(bloque(page).getByText("Sin etiquetas.")).toBeVisible();
});
