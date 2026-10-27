import type { SupabaseClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";
import type { Database } from "@/backend/repositories/tipos-db";
import { borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";
import { entrarComo } from "./sesion";

// Tareas 2.2 a 2.4: sección de citas, citas en su libro y en Inicio, y aviso al eliminar (specs citas, relaciones).
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

const lista = (page: Page) => page.getByRole("list", { name: "Lista de citas" });

test("guarda un proverbio sin autor ni origen, sin inventar datos", async ({ page }) => {
  await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Citas" }).click();
  await page.getByRole("link", { name: "Nueva cita" }).click();
  await page.getByLabel("Texto de la cita").fill("Poco a poco se va lejos.");
  await page.getByLabel("Tipo").selectOption("proverbio");
  await page.getByRole("button", { name: "Guardar cita" }).click();

  await expect(page).toHaveURL(/\/citas$/);
  const cita = lista(page).getByRole("listitem").filter({ hasText: "Poco a poco se va lejos." });
  await expect(cita).toContainText("Sin autor");
  await expect(cita).toContainText("Sin origen");
  await expect(cita).toContainText("Proverbio");
});

test("el tipo por defecto es «cita» y las más recientes van primero", async ({ page }) => {
  await datos.from("citas").insert({ texto: "Cita más antigua" });
  await page.goto("/citas/nueva");
  await expect(page.getByLabel("Tipo")).toHaveValue("cita");
  await page.getByLabel("Texto de la cita").fill("Sapere aude.");
  await page.getByLabel("Autor (opcional)").fill("Horacio");
  await page.getByLabel("Fuente u origen (opcional)").fill("Epístolas, I, 2");
  await page.getByRole("button", { name: "Guardar cita" }).click();

  await expect(lista(page).getByRole("listitem").first()).toContainText("Sapere aude.");
  await expect(lista(page).getByRole("listitem").first()).toContainText("— Horacio");
});

test("una cita enlazada a un libro aparece en él y en Inicio; editarla se refleja en ambos", async ({ page }) => {
  const { data: libro } = await datos.from("libros").insert({ titulo: "Tesis sobre Feuerbach" }).select("id").single();

  await page.goto("/citas/nueva");
  await page.getByLabel("Texto de la cita").fill("Los filósofos no han hecho más que interpretar el mundo.");
  await page.getByLabel("Autor (opcional)").fill("Karl Marx");
  await page.getByLabel("Enlazar con un libro o recurso (opcional)").selectOption({ label: "Tesis sobre Feuerbach" });
  await page.getByRole("button", { name: "Guardar cita" }).click();
  await expect(page).toHaveURL(/\/citas$/);

  await page.goto(`/libros/${libro!.id}`);
  const enLibro = page.getByRole("list", { name: "Citas enlazadas" });
  await expect(enLibro).toContainText("Los filósofos no han hecho más que interpretar el mundo.");

  // Editar desde Citas.
  await enLibro.getByRole("link", { name: /Los filósofos/ }).click();
  await page.getByLabel("Texto de la cita").fill("Los filósofos no han hecho más que interpretar de diversos modos el mundo.");
  await page.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Guardado.");

  await page.goto(`/libros/${libro!.id}`);
  await expect(page.getByRole("list", { name: "Citas enlazadas" })).toContainText("de diversos modos");
  await page.goto("/");
  await expect(page.getByRole("list", { name: "Citas guardadas" })).toContainText("de diversos modos");
});

test("eliminar un libro avisa de las citas y estas se conservan sin enlace", async ({ page }) => {
  const { data: libro } = await datos.from("libros").insert({ titulo: "Libro con citas" }).select("id").single();
  await datos.from("citas").insert([
    { texto: "Primera cita del libro", libro_id: libro!.id },
    { texto: "Segunda cita del libro", libro_id: libro!.id },
  ]);

  await page.goto(`/libros/${libro!.id}`);
  await page.getByRole("button", { name: "Eliminar", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("2 citas perderán su enlace con él (no se borrarán).");
  await page.getByRole("button", { name: "Eliminar definitivamente" }).click();
  await expect(page).toHaveURL(/\/libros$/);

  await page.goto("/citas");
  const cita = lista(page).getByRole("listitem").filter({ hasText: "Primera cita del libro" });
  await expect(cita).toContainText("Sin origen");
});

test("editar y eliminar una cita con confirmación", async ({ page }) => {
  const { data: cita } = await datos.from("citas").insert({ texto: "Cita para borrar" }).select("id").single();
  await page.goto(`/citas/${cita!.id}`);
  await page.getByRole("button", { name: "Eliminar", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("La cita se eliminará.");
  await page.getByRole("button", { name: "Eliminar definitivamente" }).click();
  await expect(page).toHaveURL(/\/citas$/);
  await expect(page.getByText("Cita para borrar")).toHaveCount(0);
});
