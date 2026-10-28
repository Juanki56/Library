import type { SupabaseClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";
import type { Database } from "@/backend/repositories/tipos-db";
import { borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";
import { conexiones, grupo, ofrecidos, vincular } from "./conexiones";
import { entrarComo } from "./sesion";

// Tarea 3.1 (cambio conexiones): sección «Conexiones» (spec relaciones, §2.8 del documento).
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

async function nota(titulo: string, contenido_texto = "") {
  const { data } = await datos.from("notas").insert({ titulo, contenido_texto }).select("id").single();
  return data!.id;
}

test("muestra cada elemento con su contexto y solo los grupos con contenido (escenarios «Contexto» y «Solo grupos con contenido»)", async ({
  page,
}) => {
  const id = await nota("Valor y plusvalía");
  const { data: libro } = await datos
    .from("libros")
    .insert({ titulo: "El capital (conexiones)", autores: "Karl Marx", anio: 1867, estado_lectura: "leyendo" })
    .select("id")
    .single();
  const { data: recurso } = await datos
    .from("recursos")
    .insert({ titulo: "Leyendo El capital", tipo: "podcast", autor: "David Harvey", url: "https://www.davidharvey.org/x" })
    .select("id")
    .single();
  await datos.from("nota_libro").insert({ nota_id: id, libro_id: libro!.id });
  await datos.from("nota_recurso").insert({ nota_id: id, recurso_id: recurso!.id });

  await page.goto(`/notas/${id}`);
  await expect(grupo(page, "Libros").getByRole("listitem")).toContainText("Karl Marx · 1867 · Leyendo");
  await expect(grupo(page, "Fuentes y recursos").getByRole("listitem")).toContainText("Podcast · David Harvey · davidharvey.org");
  await expect(grupo(page, "Proyectos")).toHaveCount(0);
  await expect(grupo(page, "Notas")).toHaveCount(0);

  // Desde el libro: la nota con su extracto y fecha de modificación.
  await datos.from("notas").update({ contenido_texto: "La mercancía es, en primer lugar, un objeto exterior." }).eq("id", id);
  await page.goto(`/libros/${libro!.id}`);
  const enLibro = grupo(page, "Notas").getByRole("listitem");
  await expect(enLibro).toContainText("La mercancía es, en primer lugar, un objeto exterior.");
  await expect(enLibro).toContainText(/Modificada el \d{1,2} de [a-z]+ de \d{4}/);
});

test("sin conexiones invita a vincular, y reúne etiquetas y menciones (escenarios «Sin conexiones» y «Todo en un sitio»)", async ({
  page,
}) => {
  const sola = await nota("Nota solitaria");
  await page.goto(`/notas/${sola}`);
  await expect(conexiones(page)).toContainText("Todavía no hay conexiones.");
  await expect(conexiones(page).getByRole("heading", { name: "Etiquetas" })).toBeVisible();

  const { data: origen } = await datos
    .from("notas")
    .insert({ titulo: "La menciona", contenido: { type: "doc", content: [{ type: "paragraph", content: [{ type: "referencia", attrs: { tipo: "nota", id: sola } }] }] } })
    .select("id")
    .single();
  await page.reload();
  await expect(conexiones(page)).not.toContainText("Todavía no hay conexiones.");
  await expect(conexiones(page).getByRole("region", { name: "Notas que la mencionan" }).getByRole("link")).toHaveText([
    "La menciona",
  ]);
  expect(origen).toBeTruthy();
});

test("«Vincular…» busca sin tildes en todos los tipos y no ofrece lo ya vinculado (escenarios «Vincular un libro a una nota» y «Sin duplicados»)", async ({
  page,
}) => {
  const id = await nota("Economía política (conexiones)");
  const { data: libro } = await datos.from("libros").insert({ titulo: "Crítica económica" }).select("id").single();
  await datos.from("proyectos").insert({ nombre: "Economía clásica" });

  await page.goto(`/notas/${id}`);
  const opciones = await ofrecidos(page, "ECONOMICA");
  await expect(opciones).toHaveCount(1);
  await expect(opciones).toContainText(["Crítica económica"]);
  await expect(opciones).toContainText(["Libro"]);
  await page.keyboard.press("Escape");

  // Con teclado: la búsqueda y Intro eligen el primer resultado.
  await conexiones(page).getByRole("button", { name: "Vincular…" }).click();
  await page.keyboard.type("critica");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Vincular" })).toBeHidden();
  await expect(grupo(page, "Libros").getByRole("link", { name: "Crítica económica" })).toBeVisible();

  // Aparece en los dos extremos y ya no se ofrece.
  await expect(await ofrecidos(page, "critica")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.goto(`/libros/${libro!.id}`);
  await expect(grupo(page, "Notas").getByRole("link", { name: "Economía política (conexiones)" })).toBeVisible();

  // También se vincula un proyecto desde el mismo buscador.
  await page.goto(`/notas/${id}`);
  await vincular(page, "Economía clásica");
  await expect(grupo(page, "Proyectos").getByRole("link", { name: "Economía clásica" })).toBeVisible();

  // Quitar el vínculo no borra el libro.
  await grupo(page, "Libros").getByRole("button", { name: "Quitar vínculo con «Crítica económica»" }).click();
  await expect(grupo(page, "Libros")).toHaveCount(0);
  await page.goto(`/libros/${libro!.id}`);
  await expect(page.getByRole("heading", { level: 1, name: "Crítica económica" })).toBeVisible();
});

test("«Nueva nota vinculada» crea la nota ya vinculada al libro (escenario «Nota sobre un libro»)", async ({ page }) => {
  const { data: libro } = await datos.from("libros").insert({ titulo: "El capital (nueva nota)" }).select("id").single();
  await page.goto(`/libros/${libro!.id}`);
  await conexiones(page).getByRole("link", { name: "Nueva nota vinculada" }).click();
  await expect(page.getByText("Se vinculará con «El capital (nueva nota)».")).toBeVisible();
  await page.getByLabel("Título").fill("Mercancía");
  await page.getByRole("button", { name: "Crear nota" }).click();

  await expect(page.getByRole("textbox", { name: "Título", exact: true })).toHaveValue("Mercancía");
  await expect(grupo(page, "Libros").getByRole("link", { name: "El capital (nueva nota)" })).toBeVisible();
  // En una nota no se ofrece crear otra nota vinculada.
  await expect(conexiones(page).getByRole("link", { name: "Nueva nota vinculada" })).toHaveCount(0);
});

test("en pantalla ancha va al lado del contenido y en estrecha debajo", async ({ page }) => {
  const id = await nota("Disposición");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`/notas/${id}`);
  const editor = page.getByLabel("Contenido de la nota");
  const [cajaEditor, cajaConexiones] = [await editor.boundingBox(), await conexiones(page).boundingBox()];
  expect(cajaConexiones!.x).toBeGreaterThan(cajaEditor!.x + cajaEditor!.width - 1);

  await page.setViewportSize({ width: 390, height: 844 });
  const [estrechoEditor, estrechoConexiones] = [await editor.boundingBox(), await conexiones(page).boundingBox()];
  expect(estrechoConexiones!.y).toBeGreaterThan(estrechoEditor!.y);
  const anchoPagina = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(anchoPagina).toBeLessThanOrEqual(390);
});
