import type { SupabaseClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";
import type { Database, Json } from "@/backend/repositories/tipos-db";
import { borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";
import { entrarComo } from "./sesion";

// Tarea 3.1 (editor-fase4-organizacion-tablas): mover bloques, índice de la nota y tablas.
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

const texto = (t: string) => ({ type: "text", text: t });
const parrafo = (t: string) => ({ type: "paragraph", content: [texto(t)] });
const subtitulo = (t: string, level = 2) => ({ type: "heading", attrs: { level }, content: [texto(t)] });
const lista = (...elementos: string[]) => ({
  type: "bulletList",
  content: elementos.map((e) => ({ type: "listItem", content: [parrafo(e)] })),
});

async function abrirNota(page: Page, titulo: string, ...bloques: object[]) {
  const contenido = { type: "doc", content: bloques.length ? bloques : [{ type: "paragraph" }] } as unknown as Json;
  const { data } = await datos.from("notas").insert({ titulo, contenido }).select("id").single();
  await page.goto(`/notas/${data!.id}`);
  await expect(editor(page)).toBeVisible();
  return data!.id;
}

const editor = (page: Page) => page.getByLabel("Contenido de la nota");
const estado = (page: Page) => page.getByRole("status", { name: "Estado del guardado" });
const barra = (page: Page) => page.getByRole("toolbar", { name: "Formato", exact: true });
// Bloques con texto: tras un subtítulo final, el editor añade un párrafo vacío para seguir escribiendo.
const bloques = (page: Page) => editor(page).locator(":scope > *").filter({ hasText: /\S/ });
const indice = (page: Page) => page.getByRole("navigation", { name: "Índice de la nota" });

test.describe("mover bloques (requisito «Mover bloques»)", () => {
  test("«Subir bloque» sube el tercer párrafo y el orden se conserva (escenario «Subir un párrafo»)", async ({ page }) => {
    await abrirNota(page, "Orden", parrafo("Uno"), parrafo("Dos"), { type: "paragraph", content: [{ ...texto("Tres"), marks: [{ type: "bold" }] }] });
    await editor(page).getByText("Tres").click();
    await barra(page).getByRole("button", { name: "Subir bloque" }).click();
    await expect(bloques(page)).toHaveText(["Uno", "Tres", "Dos"]);
    await expect(editor(page).locator("strong")).toHaveText("Tres");
    await expect(estado(page)).toHaveText("Guardado");
    await page.reload();
    await expect(bloques(page)).toHaveText(["Uno", "Tres", "Dos"]);
  });

  test("Alt+↓ baja un subtítulo y el cursor sigue en él (escenario «Mover con el teclado»)", async ({ page }) => {
    await abrirNota(page, "Teclado", subtitulo("Contexto"), parrafo("Detalle"));
    await editor(page).getByText("Contexto").click();
    await page.keyboard.press("Alt+ArrowDown");
    await expect(bloques(page)).toHaveText(["Detalle", "Contexto"]);
    await page.keyboard.press("End");
    await page.keyboard.type(" histórico");
    await expect(editor(page).locator("h2")).toHaveText("Contexto histórico");
  });

  test("Alt+↑ sube un elemento dentro de su lista (escenario «Mover un elemento de lista»)", async ({ page }) => {
    await abrirNota(page, "Lista", lista("Burguesía", "Proletariado"));
    await editor(page).getByText("Proletariado").click();
    await page.keyboard.press("Alt+ArrowUp");
    await expect(editor(page).locator("ul > li")).toHaveText(["Proletariado", "Burguesía"]);
    await expect(editor(page).locator("ul")).toHaveCount(1);
  });

  test("el primer bloque no sube (escenario «En el borde»)", async ({ page }) => {
    await abrirNota(page, "Borde", parrafo("Primero"), parrafo("Segundo"));
    await editor(page).getByText("Primero").click();
    await page.keyboard.press("Alt+ArrowUp");
    await barra(page).getByRole("button", { name: "Subir bloque" }).click();
    await expect(bloques(page)).toHaveText(["Primero", "Segundo"]);
  });
});

test.describe("índice (requisito «Índice de la nota»)", () => {
  test("muestra subtítulos y subtítulos menores sangrados, y lleva al subtítulo", async ({ page }) => {
    const relleno = Array.from({ length: 30 }, (_, i) => parrafo(`Párrafo de relleno ${i + 1}`));
    await abrirNota(page, "Con índice", subtitulo("Contexto"), ...relleno, subtitulo("Tesis"), subtitulo("Primera tesis", 3), parrafo("Final"));
    const entradas = indice(page).getByRole("listitem");
    await expect(entradas).toHaveText(["Contexto", "Tesis", "Primera tesis"]);
    await expect(entradas.nth(2)).toHaveCSS("padding-left", /[1-9]/);
    await expect(entradas.nth(1)).toHaveCSS("padding-left", "0px");

    const tesis = editor(page).locator("h2", { hasText: "Tesis" });
    await indice(page).getByRole("button", { name: "Tesis", exact: true }).click();
    await expect(tesis).toBeInViewport();
    await page.keyboard.type("Las ");
    await expect(tesis).toHaveText("Las Tesis");
  });

  test("se actualiza al escribir y no aparece sin subtítulos (escenarios «Índice actualizado» y «Nota sin subtítulos»)", async ({
    page,
  }) => {
    await abrirNota(page, "Sin subtítulos", parrafo("Solo texto"), { type: "paragraph" });
    await expect(indice(page)).toHaveCount(0);
    // Un párrafo vacío propio: el cursor queda en él sin depender de mover el cursor con teclas.
    await editor(page).locator(":scope > p").last().click();
    await barra(page).getByRole("button", { name: "Subtítulo", exact: true }).click();
    await page.keyboard.type("Nuevo apartado");
    await expect(indice(page).getByRole("listitem")).toHaveText(["Nuevo apartado"]);
    await expect(editor(page).locator("p").first()).toHaveText("Solo texto");
  });
});

test.describe("tablas (requisito «Tablas»)", () => {
  test("inserta desde «/», rellena y se conserva al reabrir (escenario «Insertar y rellenar una tabla»)", async ({ page }) => {
    await abrirNota(page, "Con tabla");
    await editor(page).click();
    await page.keyboard.type("/tabla");
    await page.getByRole("listbox", { name: "Insertar bloque" }).getByRole("option", { name: /^Tabla/ }).click();
    await expect(editor(page).locator("table tr")).toHaveCount(3);
    await expect(editor(page).locator("table th")).toHaveCount(3);

    await editor(page).locator("table th").first().click();
    await page.keyboard.type("Autor");
    await editor(page).locator("table td").first().click();
    await page.keyboard.type("Marx");
    await expect(estado(page)).toHaveText("Guardado");

    await page.reload();
    await expect(editor(page).locator("table th").first()).toHaveText("Autor");
    await expect(editor(page).locator("table td").first()).toHaveText("Marx");
  });

  test("añade fila y columna, y elimina la tabla sin tocar el resto (escenario «Añadir y eliminar filas y columnas»)", async ({
    page,
  }) => {
    const id = await abrirNota(page, "Tabla editable", parrafo("Antes"));
    await editor(page).getByText("Antes").click();
    await page.keyboard.press("End");
    await barra(page).getByRole("button", { name: "Tabla", exact: true }).click();
    await expect(barra(page).getByRole("button", { name: "Añadir fila" })).toBeVisible();

    await barra(page).getByRole("button", { name: "Añadir fila" }).click();
    await barra(page).getByRole("button", { name: "Añadir columna" }).click();
    await expect(editor(page).locator("table tr")).toHaveCount(4);
    await expect(editor(page).locator("table tr").first().locator("th, td")).toHaveCount(4);

    await barra(page).getByRole("button", { name: "Eliminar tabla" }).click();
    await expect(editor(page).locator("table")).toHaveCount(0);
    await expect(barra(page).getByRole("button", { name: "Añadir fila" })).toHaveCount(0);
    await expect(editor(page)).toContainText("Antes");
    await expect(estado(page)).toHaveText("Guardado");
    const { data } = await datos.from("notas").select("contenido_texto").eq("id", id).single();
    expect(data!.contenido_texto).toBe("Antes");
  });

  test("el texto de una tabla se encuentra con la búsqueda", async ({ page }) => {
    const celda = (tipo: string, t: string) => ({ type: tipo, attrs: { colspan: 1, rowspan: 1, colwidth: null }, content: [parrafo(t)] });
    const id = await abrirNota(page, "Cronología", {
      type: "table",
      content: [
        { type: "tableRow", content: [celda("tableHeader", "Año"), celda("tableHeader", "Hecho")] },
        { type: "tableRow", content: [celda("tableCell", "1848"), celda("tableCell", "Primavera de los pueblos")] },
      ],
    });
    // Un cambio cualquiera hace pasar la tabla por el servidor y genera el texto de búsqueda.
    await editor(page).getByText("Primavera de los pueblos").click();
    await page.keyboard.press("End");
    await page.keyboard.type(" en Europa");
    await expect(estado(page)).toHaveText("Guardado");
    const { data } = await datos.from("notas").select("contenido_texto").eq("id", id).single();
    expect(data!.contenido_texto).toContain("Primavera de los pueblos en Europa");

    await page.goto(`/buscar?q=${encodeURIComponent("primavera pueblos")}`);
    await expect(page.getByRole("link", { name: "Cronología" })).toBeVisible();
  });
});
