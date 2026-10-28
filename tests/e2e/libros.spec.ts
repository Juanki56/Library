import type { SupabaseClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";
import type { Database } from "@/backend/repositories/tipos-db";
import { borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";
import { grupo, vincular } from "./conexiones";
import { entrarComo } from "./sesion";

// Tareas 6.1 a 6.3: libros (specs libros, notas, relaciones).
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

const campoTitulo = (page: Page) => page.getByRole("textbox", { name: "Título", exact: true });

test("guarda un libro con solo el título (escenario «Libro con solo título»)", async ({ page }) => {
  await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Libros" }).click();
  await page.getByRole("link", { name: "Nuevo libro" }).click();
  await campoTitulo(page).fill("El manifiesto comunista");
  await page.getByRole("button", { name: "Crear libro" }).click();

  await expect(page).toHaveURL(/\/libros\/[0-9a-f-]{36}$/);
  await expect(page.getByRole("heading", { level: 1, name: "El manifiesto comunista" })).toBeVisible();
  await expect(page.getByLabel("Autor o autores")).toHaveValue("");
  await expect(page.getByLabel("Año")).toHaveValue("");
});

test("edita los datos bibliográficos y rechaza un año no válido", async ({ page }) => {
  const { data } = await datos.from("libros").insert({ titulo: "El capital" }).select("id").single();
  await page.goto(`/libros/${data!.id}`);

  await page.getByLabel("Autor o autores").fill("Karl Marx");
  await page.getByLabel("Año").fill("1867");
  await page.getByLabel("Editorial").fill("Siglo XXI");
  await page.getByLabel("Descripción").fill("Tomo I");
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByRole("status")).toHaveText("Guardado.");

  await page.reload();
  await expect(page.getByLabel("Año")).toHaveValue("1867");
  await expect(page.locator("main")).toContainText("Karl Marx · Siglo XXI · 1867");

  // El navegador valida el formato; el servidor rechaza además el rango.
  await page.getByLabel("Año").fill("9999");
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.locator("main").getByRole("alert")).toHaveText(
    "El año debe ser un número entero entre -3000 y 3000.",
  );
  // Tras el error no se pierde lo escrito.
  await expect(page.getByLabel("Año")).toHaveValue("9999");
  await expect(page.getByLabel("Autor o autores")).toHaveValue("Karl Marx");
});

test("la página del libro muestra la misma nota canónica que el proyecto (spec libros)", async ({ page }) => {
  const { data: libro } = await datos.from("libros").insert({ titulo: "Manifiesto (ejemplo)" }).select("id").single();
  const { data: proyecto } = await datos.from("proyectos").insert({ nombre: "Comunismo (libros)" }).select("id").single();
  const { data: nota } = await datos.from("notas").insert({ titulo: "Lucha de clases (libros)" }).select("id").single();
  await datos.from("nota_proyecto").insert({ nota_id: nota!.id, proyecto_id: proyecto!.id });

  // Vincula desde la página del libro la nota que ya está en el proyecto.
  await page.goto(`/libros/${libro!.id}`);
  await vincular(page, "Lucha de clases (libros)");

  const enlaceLibro = grupo(page, "Notas").getByRole("link", { name: "Lucha de clases (libros)" });
  await expect(enlaceLibro).toHaveAttribute("href", `/notas/${nota!.id}`);

  await page.goto(`/proyectos/${proyecto!.id}`);
  await expect(grupo(page, "Notas").getByRole("link", { name: "Lucha de clases (libros)" })).toHaveAttribute(
    "href",
    `/notas/${nota!.id}`,
  );
});

test("un libro en dos proyectos aparece una sola vez en la lista (escenario «Libro en dos proyectos»)", async ({
  page,
}) => {
  const { data: libro } = await datos.from("libros").insert({ titulo: "Libro compartido" }).select("id").single();
  await datos.from("proyectos").insert([{ nombre: "Proyecto A (libros)" }, { nombre: "Proyecto B (libros)" }]);

  await page.goto(`/libros/${libro!.id}`);
  for (const nombre of ["Proyecto A (libros)", "Proyecto B (libros)"]) {
    await vincular(page, nombre);
    await expect(grupo(page, "Proyectos").getByRole("link", { name: nombre })).toBeVisible();
  }

  await page.goto("/libros");
  await expect(
    page.getByRole("list", { name: "Lista de libros" }).getByRole("link", { name: "Libro compartido" }),
  ).toHaveCount(1);
});

test("eliminar un libro avisa y conserva sus notas (spec relaciones)", async ({ page }) => {
  const { data: libro } = await datos.from("libros").insert({ titulo: "Libro a eliminar" }).select("id").single();
  const { data: nota } = await datos.from("notas").insert({ titulo: "Nota del libro" }).select("id").single();
  await datos.from("nota_libro").insert({ nota_id: nota!.id, libro_id: libro!.id });

  await page.goto(`/libros/${libro!.id}`);
  await page.getByRole("button", { name: "Eliminar", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "Se quitará 1 vínculo con 1 nota. Ese elemento no se borrará.",
  );
  await page.getByRole("button", { name: "Eliminar definitivamente" }).click();

  await expect(page).toHaveURL(/\/libros$/);
  const notas = await datos.from("notas").select("id").eq("id", nota!.id);
  expect(notas.data).toHaveLength(1);
});
