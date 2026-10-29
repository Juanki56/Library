import type { SupabaseClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";
import type { Database } from "@/backend/repositories/tipos-db";
import { borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";
import { grupo, ofrecidos, vincular } from "./conexiones";
import { entrarComo } from "./sesion";

// Tareas 5.1 y 5.2: proyectos (specs proyectos, notas, relaciones).
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

async function crearProyecto(nombre: string) {
  const { data } = await datos.from("proyectos").insert({ nombre }).select("id").single();
  return data!.id;
}


test("crea un proyecto sin descripción y aparece en la lista (spec proyectos)", async ({ page }) => {
  await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Proyectos" }).click();
  // Espera a la lista: Inicio también tiene un acceso «Nuevo proyecto» y no debe pulsarse ese a mitad de navegación.
  await expect(page).toHaveURL(/\/proyectos$/);
  await page.getByRole("link", { name: "Nuevo proyecto" }).click();
  await page.getByRole("textbox", { name: "Nombre", exact: true }).fill("Comunismo");
  await page.getByRole("button", { name: "Crear proyecto" }).click();

  await expect(page).toHaveURL(/\/proyectos\/[0-9a-f-]{36}$/);
  await expect(page.getByRole("heading", { level: 1, name: "Comunismo" })).toBeVisible();

  await page.getByRole("link", { name: "Volver a proyectos" }).click();
  await expect(
    page.getByRole("list", { name: "Lista de proyectos" }).getByRole("link", { name: "Comunismo" }),
  ).toBeVisible();
});

test("renombra un proyecto y edita su descripción", async ({ page }) => {
  const id = await crearProyecto("Nombre provisional");
  await page.goto(`/proyectos/${id}`);
  await page.getByRole("textbox", { name: "Nombre", exact: true }).fill("Historia social");
  await page.getByLabel("Descripción (opcional)").fill("Movimientos y clases sociales");
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByRole("status")).toHaveText("Guardado.");

  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Historia social" })).toBeVisible();
  await expect(page.getByLabel("Descripción (opcional)")).toHaveValue("Movimientos y clases sociales");
});

test("ejemplo «Comunismo»: notas y libros relacionados, sin copias (specs proyectos, notas)", async ({ page }) => {
  const comunismo = await crearProyecto("Comunismo (ejemplo)");
  const historia = await crearProyecto("Historia social (ejemplo)");
  await datos.from("notas").insert({ titulo: "La lucha de clases" });
  const { data: libro } = await datos.from("libros").insert({ titulo: "El manifiesto comunista" }).select("id").single();
  await datos.from("libro_proyecto").insert({ libro_id: libro!.id, proyecto_id: comunismo });

  // Vincula la nota existente a los dos proyectos desde la interfaz.
  for (const id of [comunismo, historia]) {
    await page.goto(`/proyectos/${id}`);
    await vincular(page, "La lucha de clases");
    await expect(grupo(page, "Notas").getByRole("link", { name: "La lucha de clases" })).toBeVisible();
  }

  // La página de Comunismo muestra la nota y el libro (spec proyectos).
  await page.goto(`/proyectos/${comunismo}`);
  await expect(grupo(page, "Libros").getByText("El manifiesto comunista")).toBeVisible();

  // Una nota ya vinculada no se ofrece otra vez (spec relaciones: sin duplicación).
  await expect(await ofrecidos(page, "La lucha de clases")).toHaveCount(0);
  await page.keyboard.press("Escape");

  // Un cambio hecho desde un proyecto se ve desde el otro (spec notas).
  await grupo(page, "Notas").getByRole("link", { name: "La lucha de clases" }).click();
  await page.getByRole("textbox", { name: "Título", exact: true }).fill("La lucha de clases (revisada)");
  await expect(page.getByRole("status", { name: "Estado del guardado" })).toHaveText("Guardado");

  await page.goto(`/proyectos/${historia}`);
  await expect(grupo(page, "Notas").getByRole("link", { name: "La lucha de clases (revisada)" })).toBeVisible();

  // Sigue siendo una sola nota en el listado general.
  await page.goto("/notas");
  await expect(page.getByRole("link", { name: "La lucha de clases (revisada)" })).toHaveCount(1);

  // La nota muestra sus dos proyectos y el libro no (no está vinculado a la nota).
  await page.getByRole("link", { name: "La lucha de clases (revisada)" }).click();
  await expect(grupo(page, "Proyectos").getByRole("link")).toHaveText([
    "Comunismo (ejemplo)",
    "Historia social (ejemplo)",
  ]);
});

test("quitar un vínculo no borra la nota (spec relaciones)", async ({ page }) => {
  const proyecto = await crearProyecto("Proyecto con nota");
  const { data: nota } = await datos.from("notas").insert({ titulo: "Nota que se queda" }).select("id").single();
  await datos.from("nota_proyecto").insert({ nota_id: nota!.id, proyecto_id: proyecto });

  await page.goto(`/proyectos/${proyecto}`);
  await grupo(page, "Notas").getByRole("button", { name: "Quitar vínculo con «Nota que se queda»" }).click();
  // Sin notas vinculadas, el grupo no se muestra (solo grupos con contenido).
  await expect(grupo(page, "Notas")).toHaveCount(0);

  await page.goto("/notas");
  await expect(page.getByRole("link", { name: "Nota que se queda" })).toBeVisible();
});

test("eliminar un proyecto avisa y conserva sus notas y libros (spec relaciones)", async ({ page }) => {
  const proyecto = await crearProyecto("Proyecto a eliminar");
  const { data: nota } = await datos.from("notas").insert({ titulo: "Nota conservada" }).select("id").single();
  const { data: libro } = await datos.from("libros").insert({ titulo: "Libro conservado" }).select("id").single();
  await datos.from("nota_proyecto").insert({ nota_id: nota!.id, proyecto_id: proyecto });
  await datos.from("libro_proyecto").insert({ libro_id: libro!.id, proyecto_id: proyecto });

  await page.goto(`/proyectos/${proyecto}`);
  await page.getByRole("button", { name: "Eliminar", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "Se quitarán 2 vínculos con 1 nota y 1 libro. Esos elementos no se borrarán.",
  );
  await page.getByRole("button", { name: "Eliminar definitivamente" }).click();

  await expect(page).toHaveURL(/\/proyectos$/);
  await expect(page.getByRole("link", { name: "Proyecto a eliminar" })).toHaveCount(0);
  const notas = await datos.from("notas").select("id").eq("id", nota!.id);
  const libros = await datos.from("libros").select("id").eq("id", libro!.id);
  expect(notas.data).toHaveLength(1);
  expect(libros.data).toHaveLength(1);
});
