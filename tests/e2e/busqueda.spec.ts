import type { SupabaseClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";
import type { Database } from "@/backend/repositories/tipos-db";
import { borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";
import { entrarComo } from "./sesion";

// Tarea 5.2: búsqueda global desde la cabecera (spec busqueda).
let usuario: UsuarioPrueba;
let datos: SupabaseClient<Database>;
let libroId: string;
let notaId: string;

test.beforeAll(async () => {
  usuario = await crearUsuario({ confirmado: true });
  datos = await clienteDe(usuario);
  const { data: libro } = await datos
    .from("libros")
    .insert({ titulo: "El capital", autores: "Karl Marx" })
    .select("id")
    .single();
  libroId = libro!.id;
  await datos.from("citas").insert({
    texto: "Los filósofos no han hecho más que interpretar el mundo.",
    autor: "Karl Marx",
    fuente: "Tesis sobre Feuerbach",
  });
  const { data: nota } = await datos
    .from("notas")
    .insert({ titulo: "La lucha de clases", contenido_texto: "Toda la historia es la historia de la lucha de clases." })
    .select("id")
    .single();
  notaId = nota!.id;
  const { data: proyectos } = await datos
    .from("proyectos")
    .insert([{ nombre: "Comunismo" }, { nombre: "Historia social" }])
    .select("id");
  await datos.from("nota_proyecto").insert(proyectos!.map((p) => ({ nota_id: notaId, proyecto_id: p.id })));
  await datos.from("glosario").insert({ termino: "Filosofía", definicion: "Amor por la sabiduría." });
});

test.afterAll(async () => {
  await borrarUsuario(usuario);
});

test.beforeEach(async ({ page }) => {
  await entrarComo(page, usuario);
});

const resultados = (page: Page) => page.getByRole("list", { name: "Resultados" });

async function buscarDesdeCabecera(page: Page, consulta: string) {
  const buscador = page.getByRole("searchbox", { name: "Buscar en todo el archivo" });
  await buscador.fill(consulta);
  await buscador.press("Enter");
  await expect(page.getByText(`Resultados para «${consulta}»`)).toBeVisible();
}

test("buscar «Marx» desde la ficha de un libro encuentra el libro y la cita por su autor", async ({ page }) => {
  await page.goto(`/libros/${libroId}`);
  await buscarDesdeCabecera(page, "Marx");
  await expect(resultados(page).getByRole("link", { name: "El capital" })).toBeVisible();
  await expect(resultados(page).getByRole("link", { name: /Los filósofos/ })).toBeVisible();
  await expect(resultados(page).locator("mark").first()).toHaveText("Marx");
});

test("el filtro «Citas» deja solo citas y cada resultado abre su página", async ({ page }) => {
  await page.goto("/");
  await buscarDesdeCabecera(page, "Marx");
  await page.getByRole("navigation", { name: "Filtrar por tipo" }).getByRole("link", { name: "Citas" }).click();
  await expect(page).toHaveURL(/tipo=cita/);
  await expect(resultados(page).getByRole("listitem")).toHaveCount(1);
  await resultados(page).getByRole("link", { name: /Los filósofos/ }).click();
  await expect(page).toHaveURL(/\/citas\/[0-9a-f-]{36}$/);
});

test("ignora tildes y busca por inicio de palabra", async ({ page }) => {
  await page.goto("/");
  await buscarDesdeCabecera(page, "filosofia");
  await expect(resultados(page).getByRole("link", { name: "Filosofía" })).toBeVisible();
  await expect(resultados(page).getByRole("listitem").filter({ hasText: "Filosofía" })).toContainText("glosario");
});

test("una nota en dos proyectos aparece una vez con sus relaciones (spec busqueda)", async ({ page }) => {
  await page.goto("/");
  await buscarDesdeCabecera(page, "lucha de clases");
  const nota = resultados(page).getByRole("listitem").filter({ hasText: "La lucha de clases" });
  await expect(nota).toHaveCount(1);
  await expect(nota).toContainText("en Comunismo · Historia social");
  await nota.getByRole("link", { name: "La lucha de clases" }).click();
  await expect(page).toHaveURL(new RegExp(`/notas/${notaId}$`));
});
