import type { SupabaseClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";
import type { Database, Json } from "@/backend/repositories/tipos-db";
import { borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";
import { entrarComo } from "./sesion";

// Tareas 4.1 a 4.4 y 5.1 (editor-fase1-escritura): formatos, menús, enlaces y notas antiguas.
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

async function abrirNota(page: Page, titulo: string, contenido?: Json) {
  const { data } = await datos
    .from("notas")
    .insert(contenido ? { titulo, contenido } : { titulo })
    .select("id")
    .single();
  await page.goto(`/notas/${data!.id}`);
  await expect(editor(page)).toBeVisible();
  return data!.id;
}

const editor = (page: Page) => page.getByLabel("Contenido de la nota");
const barra = (page: Page) => page.getByRole("toolbar", { name: "Formato", exact: true });
const burbuja = (page: Page) => page.getByRole("toolbar", { name: "Formato de la selección" });
const estado = (page: Page) => page.getByRole("status", { name: "Estado del guardado" });

async function guardadoYRecargado(page: Page) {
  await expect(estado(page)).toHaveText("Guardado");
  await page.reload();
  await expect(editor(page)).toBeVisible();
}

test("subrayado, resaltado, separador y lista de tareas se conservan (escenario «Formatos nuevos conservados»)", async ({
  page,
}) => {
  await abrirNota(page, "Formatos nuevos");
  await editor(page).click();
  await barra(page).getByRole("button", { name: "Subrayado" }).click();
  await page.keyboard.type("subrayado");
  await barra(page).getByRole("button", { name: "Subrayado" }).click();
  await barra(page).getByRole("button", { name: "Resaltar" }).click();
  await page.keyboard.type(" resaltado");
  await barra(page).getByRole("button", { name: "Resaltar" }).click();
  await page.keyboard.press("Enter");
  await barra(page).getByRole("button", { name: "Separador" }).click();
  await barra(page).getByRole("button", { name: "Lista de tareas" }).click();
  await page.keyboard.type("Leer el Manifiesto");
  await editor(page).locator('ul[data-type="taskList"] input[type="checkbox"]').first().check();

  await guardadoYRecargado(page);
  await expect(editor(page).locator("u")).toHaveText("subrayado");
  await expect(editor(page).locator("mark")).toHaveText("resaltado");
  await expect(editor(page).locator("hr")).toHaveCount(1);
  await expect(editor(page).locator('ul[data-type="taskList"] li > div')).toHaveText("Leer el Manifiesto");
  await expect(editor(page).getByRole("checkbox", { name: "Tarea hecha: Leer el Manifiesto" })).toBeChecked();
  await expect(editor(page).locator('ul[data-type="taskList"] input[type="checkbox"]')).toBeChecked();
});

test("el menú al seleccionar resalta y marca los formatos activos sin perder la siguiente tecla", async ({ page }) => {
  await abrirNota(page, "Menú de selección");
  await editor(page).click();
  await page.keyboard.type("frase para resaltar");
  await page.keyboard.press("Shift+Home");
  await expect(burbuja(page)).toBeVisible();
  await burbuja(page).getByRole("button", { name: "Resaltar" }).click();
  await expect(editor(page).locator("mark")).toHaveText("frase para resaltar");
  await expect(burbuja(page).getByRole("button", { name: "Resaltar" })).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("End");
  await page.keyboard.type("!");
  await expect(editor(page)).toContainText("frase para resaltar!");
});

test.describe("menú «/»", () => {
  test("«/tar» + Intro crea una lista de tareas y elimina la orden", async ({ page }) => {
    await abrirNota(page, "Barra tareas");
    await editor(page).click();
    await page.keyboard.type("/tar");
    await expect(page.getByRole("listbox", { name: "Insertar bloque" }).getByRole("option")).toHaveText(
      /Lista de tareas/,
    );
    await page.keyboard.press("Enter");
    await expect(editor(page).locator('ul[data-type="taskList"]')).toHaveCount(1);
    await expect(editor(page)).not.toContainText("/tar");
  });

  test("se maneja con las flechas", async ({ page }) => {
    await abrirNota(page, "Barra flechas");
    await editor(page).click();
    await page.keyboard.type("/");
    const lista = page.getByRole("listbox", { name: "Insertar bloque" });
    await expect(lista.getByRole("option").first()).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowDown");
    await expect(lista.getByRole("option", { name: /Subtítulo menor/ })).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Enter");
    await page.keyboard.type("Apartado");
    await expect(editor(page).locator("h3")).toHaveText("Apartado");
  });

  test("Escape cierra el menú y deja «/» como texto (escenario «Cerrar sin insertar»)", async ({ page }) => {
    await abrirNota(page, "Barra escape");
    await editor(page).click();
    await page.keyboard.type("/");
    await expect(page.getByRole("listbox", { name: "Insertar bloque" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("listbox", { name: "Insertar bloque" })).toHaveCount(0);
    await expect(editor(page)).toContainText("/");
  });
});

test.describe("cuadro de enlaces", () => {
  test("añade un enlace con Ctrl+K, lo edita y lo quita", async ({ page }) => {
    await abrirNota(page, "Enlaces");
    await editor(page).click();
    await page.keyboard.type("Archivo marxista");
    await page.keyboard.press("Shift+Home");
    await page.keyboard.press("Control+k");
    const cuadro = page.getByRole("dialog", { name: "Añadir enlace" });
    await cuadro.getByLabel("Dirección web").fill("https://www.marxists.org");
    await cuadro.getByRole("button", { name: "Aplicar" }).click();
    await expect(editor(page).locator("a")).toHaveAttribute("href", "https://www.marxists.org");

    await editor(page).locator("a").click();
    await barra(page).getByRole("button", { name: "Editar enlace" }).click();
    const editar = page.getByRole("dialog", { name: "Editar enlace" });
    await expect(editar.getByLabel("Dirección web")).toHaveValue("https://www.marxists.org");
    await editar.getByLabel("Dirección web").fill("https://www.marxists.org/espanol/");
    await editar.getByRole("button", { name: "Aplicar" }).click();
    await expect(editor(page).locator("a")).toHaveAttribute("href", "https://www.marxists.org/espanol/");

    await editor(page).locator("a").click();
    await barra(page).getByRole("button", { name: "Editar enlace" }).click();
    await page.getByRole("dialog", { name: "Editar enlace" }).getByRole("button", { name: "Quitar enlace" }).click();
    await expect(editor(page).locator("a")).toHaveCount(0);
    await expect(editor(page)).toContainText("Archivo marxista");
  });

  test("rechaza direcciones que no son web y explica por qué (escenario «Dirección no válida»)", async ({ page }) => {
    await abrirNota(page, "Enlace peligroso");
    await editor(page).click();
    await page.keyboard.type("peligro");
    await page.keyboard.press("Shift+Home");
    await barra(page).getByRole("button", { name: "Enlace" }).click();
    const cuadro = page.getByRole("dialog", { name: "Añadir enlace" });
    await cuadro.getByLabel("Dirección web").fill("javascript:alert(1)");
    await cuadro.getByRole("button", { name: "Aplicar" }).click();
    await expect(cuadro.getByRole("alert")).toHaveText(
      "Solo se admiten direcciones web que empiecen por http:// o https://",
    );
    await cuadro.getByRole("button", { name: "Cancelar" }).click();
    await expect(editor(page).locator("a")).toHaveCount(0);
  });
});

test("una nota del formato anterior se ve igual y se guarda sin perder nada (escenario «Nota antigua»)", async ({ page }) => {
  const antigua = {
    type: "doc",
    content: [
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Idea central" }] },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "La historia es la historia de la " },
          { type: "text", text: "lucha de clases", marks: [{ type: "bold" }] },
        ],
      },
      { type: "bulletList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Burguesía" }] }] }] },
      { type: "blockquote", content: [{ type: "paragraph", content: [{ type: "text", text: "Una cita" }] }] },
      {
        type: "paragraph",
        content: [{ type: "text", text: "enlace", marks: [{ type: "link", attrs: { href: "https://ejemplo.com" } }] }],
      },
    ],
  };
  const id = await abrirNota(page, "Nota antigua", antigua);
  await expect(editor(page).locator("h2")).toHaveText("Idea central");
  await expect(editor(page).locator("strong")).toHaveText("lucha de clases");
  await expect(editor(page).locator("ul li")).toHaveText("Burguesía");
  await expect(editor(page).locator("blockquote")).toHaveText("Una cita");
  await expect(editor(page).locator("a")).toHaveAttribute("href", "https://ejemplo.com");

  await editor(page).locator("blockquote").click();
  await page.keyboard.press("End");
  await page.keyboard.type(" ampliada");
  await expect(estado(page)).toHaveText("Guardado");

  const { data } = await datos.from("notas").select("contenido").eq("id", id).single();
  const guardado = JSON.stringify(data!.contenido);
  for (const fragmento of ['"heading"', '"bold"', '"bulletList"', '"blockquote"', "Una cita ampliada", "https://ejemplo.com"]) {
    expect(guardado).toContain(fragmento);
  }
});
