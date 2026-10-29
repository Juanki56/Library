import type { SupabaseClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";
import type { Database } from "@/backend/repositories/tipos-db";
import { borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";
import { entrarComo } from "./sesion";

// Tareas 4.1 a 4.3: notas (specs notas, editor-notas, relaciones).
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

async function crearNota(titulo: string) {
  const { data } = await datos.from("notas").insert({ titulo }).select("id").single();
  return data!.id;
}

test("crear una nota la abre y aparece en el listado", async ({ page }) => {
  await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Notas" }).click();
  // Espera a la lista: Inicio también tiene un acceso «Nueva nota» y no debe pulsarse ese a mitad de navegación.
  await expect(page).toHaveURL(/\/notas$/);
  await page.getByRole("link", { name: "Nueva nota" }).click();
  await page.getByRole("textbox", { name: "Título", exact: true }).fill("Materialismo histórico");
  await page.getByRole("button", { name: "Crear nota" }).click();

  await expect(page).toHaveURL(/\/notas\/[0-9a-f-]{36}$/);
  await expect(page.getByRole("textbox", { name: "Título", exact: true })).toHaveValue("Materialismo histórico");

  await page.getByRole("link", { name: "Volver a notas" }).click();
  await expect(
    page.getByRole("list", { name: "Lista de notas" }).getByRole("link", { name: "Materialismo histórico" }),
  ).toBeVisible();
});

test("el formato se conserva al reabrir la nota (spec editor-notas)", async ({ page }) => {
  const id = await crearNota("Con formato");
  await page.goto(`/notas/${id}`);

  const editor = page.getByLabel("Contenido de la nota");
  await editor.click();
  await page.getByRole("button", { name: "Subtítulo", exact: true }).click();
  await page.keyboard.type("Ideas clave");
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Lista", exact: true }).click();
  await page.keyboard.type("Lucha de clases");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Cita en bloque" }).click();
  await page.keyboard.type("La historia de toda sociedad");

  // Guardado automático (editor-fase1-escritura): ya no hay botón «Guardar».
  await expect(page.getByRole("status", { name: "Estado del guardado" })).toHaveText("Guardado");

  await page.reload();
  await expect(editor.locator("h2")).toHaveText("Ideas clave");
  await expect(editor.locator("ul li")).toHaveText("Lucha de clases");
  await expect(editor.locator("blockquote")).toHaveText("La historia de toda sociedad");
});

test("un enlace que no es web no se añade (spec editor-notas)", async ({ page }) => {
  const id = await crearNota("Con enlace");
  await page.goto(`/notas/${id}`);

  const editor = page.getByLabel("Contenido de la nota");
  await editor.click();
  await page.keyboard.type("peligro");
  await page.keyboard.press("Shift+Home");

  await page.getByRole("toolbar", { name: "Formato", exact: true }).getByRole("button", { name: "Enlace" }).click();
  const cuadro = page.getByRole("dialog", { name: "Añadir enlace" });
  await cuadro.getByLabel("Dirección web").fill("javascript:alert(1)");
  await cuadro.getByRole("button", { name: "Aplicar" }).click();
  await expect(cuadro.getByRole("alert")).toBeVisible();
  await cuadro.getByRole("button", { name: "Cancelar" }).click();
  await expect(editor.locator("a")).toHaveCount(0);
});

test("una nota en dos proyectos aparece una sola vez en el listado (spec notas)", async ({ page }) => {
  const nota = await crearNota("La lucha de clases");
  const { data: proyectos } = await datos
    .from("proyectos")
    .insert([{ nombre: "Comunismo" }, { nombre: "Historia social" }])
    .select("id");
  await datos.from("nota_proyecto").insert(proyectos!.map((p) => ({ nota_id: nota, proyecto_id: p.id })));

  await page.goto("/notas");
  await expect(
    page.getByRole("list", { name: "Lista de notas" }).getByRole("link", { name: "La lucha de clases", exact: true }),
  ).toHaveCount(1);
});

test("eliminar avisa de los vínculos y conserva los proyectos (spec relaciones)", async ({ page }) => {
  const nota = await crearNota("Nota para eliminar");
  const { data: proyectos } = await datos
    .from("proyectos")
    .insert([{ nombre: "Proyecto uno" }, { nombre: "Proyecto dos" }])
    .select("id");
  await datos.from("nota_proyecto").insert(proyectos!.map((p) => ({ nota_id: nota, proyecto_id: p.id })));

  await page.goto(`/notas/${nota}`);
  await page.getByRole("button", { name: "Eliminar", exact: true }).click();
  const dialogo = page.getByRole("dialog");
  await expect(dialogo).toContainText("Se quitarán 2 vínculos con 2 proyectos. Esos elementos no se borrarán.");

  await dialogo.getByRole("button", { name: "Cancelar" }).click();
  await expect(dialogo).toBeHidden();

  await page.getByRole("button", { name: "Eliminar", exact: true }).click();
  await dialogo.getByRole("button", { name: "Eliminar definitivamente" }).click();
  await expect(page).toHaveURL(/\/notas$/);
  await expect(page.getByRole("link", { name: "Nota para eliminar" })).toHaveCount(0);

  const { count } = await datos
    .from("proyectos")
    .select("*", { count: "exact", head: true })
    .in("id", proyectos!.map((p) => p.id));
  expect(count).toBe(2);
});

test("ordena por fecha de modificación o de creación, sin mostrar duraciones (spec notas)", async ({ page }) => {
  const antigua = await crearNota("Orden: antigua");
  await crearNota("Orden: reciente");
  await datos.from("notas").update({ titulo: "Orden: antigua editada" }).eq("id", antigua);

  // Con espera: la página puede mostrar «Cargando…» un instante.
  const titulos = page.getByRole("list", { name: "Lista de notas" }).getByRole("link", { name: /^Orden:/ });

  await page.goto("/notas?orden=modificacion");
  await expect(titulos).toHaveText(["Orden: antigua editada", "Orden: reciente"]);

  await page.getByRole("link", { name: "Creadas recientemente" }).click();
  await expect(page).toHaveURL(/orden=creacion/);
  await expect(titulos).toHaveText(["Orden: reciente", "Orden: antigua editada"]);

  await expect(page.locator("main")).not.toContainText(/hace \d|minutos|horas de estudio|racha/i);
});
