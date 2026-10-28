import type { SupabaseClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";
import type { Database } from "@/backend/repositories/tipos-db";
import { admin, borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";
import { entrarComo } from "./sesion";

// Tarea 5.1 (libros-recursos-menu-inicio): fichas de libros y recursos, e Inicio.
let usuario: UsuarioPrueba;
let datos: SupabaseClient<Database>;

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);
const WEB = "https://portadas.ejemplo.test";

test.beforeAll(async () => {
  usuario = await crearUsuario({ confirmado: true });
  datos = await clienteDe(usuario);
});

test.afterAll(async () => {
  const { data: carpetas } = await admin().storage.from("imagenes").list(usuario.id);
  for (const c of carpetas ?? []) {
    const { data: archivos } = await admin().storage.from("imagenes").list(`${usuario.id}/${c.name}`);
    const rutas = (archivos ?? []).map((a) => `${usuario.id}/${c.name}/${a.name}`);
    if (rutas.length) await admin().storage.from("imagenes").remove(rutas);
  }
  await borrarUsuario(usuario);
});

test.beforeEach(async ({ page }) => {
  await page.route(`${WEB}/**`, (r) => r.fulfill({ contentType: "image/png", body: PNG }));
  await entrarComo(page, usuario);
});

const guardado = (page: Page) => page.locator("form").first().getByRole("status");

test.describe("libros (spec libros)", () => {
  test("guarda la ficha completa y muestra el estado en la lista (escenarios «Libro completo» y «Marcar como leyendo»)", async ({
    page,
  }) => {
    await page.goto("/libros/nuevo");
    await page.getByLabel("Título").fill("El capital");
    await page.getByLabel("Autor o autores").fill("Karl Marx");
    await page.getByLabel("Editorial").fill("Siglo XXI");
    await page.getByLabel("Año de publicación").fill("1867");
    await page.getByLabel("ISBN").fill("978-84-323-0291-6");
    await page.getByLabel("Estado de lectura").selectOption({ label: "Leyendo" });
    await page.getByLabel("Descripción").fill("Crítica de la economía política");
    await page.getByRole("button", { name: "Crear libro" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "El capital" })).toBeVisible();

    await page.reload();
    await expect(page.getByLabel("ISBN")).toHaveValue("9788432302916");
    await expect(page.getByLabel("Estado de lectura")).toHaveValue("leyendo");
    await expect(page.getByLabel("Descripción")).toHaveValue("Crítica de la economía política");
    await expect(page.locator("main")).toContainText("Leyendo · ISBN 9788432302916");

    await page.goto("/libros");
    const elemento = page.getByRole("list", { name: "Lista de libros" }).getByRole("listitem").filter({ hasText: "El capital" });
    await expect(elemento).toContainText("Karl Marx · Siglo XXI · 1867 · Leyendo");
  });

  test("un ISBN incorrecto se rechaza con un aviso (escenario «ISBN incorrecto»)", async ({ page }) => {
    await page.goto("/libros/nuevo");
    await page.getByLabel("Título").fill("ISBN erróneo");
    await page.getByLabel("ISBN").fill("978-84-323-0291-3");
    await page.getByRole("button", { name: "Crear libro" }).click();
    await expect(page.locator("form").getByRole("alert")).toHaveText("El ISBN no es válido.");
    await expect(page).toHaveURL(/\/libros\/nuevo$/);
  });

  test("sube una portada, la cambia por una web y la quita (escenarios de «Portada del libro»)", async ({ page }) => {
    const { data } = await datos.from("libros").insert({ titulo: "Con portada" }).select("id").single();
    await page.goto(`/libros/${data!.id}`);
    const portada = page.getByRole("region", { name: "Portada" });
    await portada.getByLabel(/Imagen de la portada/).setInputFiles({ name: "portada.png", mimeType: "image/png", buffer: PNG });
    await portada.getByRole("button", { name: "Añadir portada" }).click();
    const imagen = portada.getByRole("img", { name: "Portada de Con portada" });
    await expect(imagen).toBeVisible();
    await expect
      .poll(() => imagen.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0), { timeout: 20_000 })
      .toBe(true);

    await page.reload();
    await expect(imagen).toBeVisible();
    await portada.getByLabel("Desde una dirección web").check();
    await portada.getByLabel("Dirección de la portada").fill(`${WEB}/capital.png`);
    await portada.getByRole("button", { name: "Cambiar portada" }).click();
    await expect(portada.getByRole("status")).toHaveText("Portada guardada.");
    await expect(imagen).toHaveAttribute("src", `${WEB}/capital.png`);
    const { data: fila } = await datos.from("libros").select("portada_ruta, portada_url").eq("id", data!.id).single();
    expect(fila).toEqual({ portada_ruta: null, portada_url: `${WEB}/capital.png` });

    await portada.getByRole("button", { name: "Quitar portada" }).click();
    await expect(imagen).toHaveCount(0);
    await expect(portada.getByRole("button", { name: "Añadir portada" })).toBeVisible();
  });

  test("rechaza como portada un archivo que no es una imagen (escenario «Archivo no válido»)", async ({ page }) => {
    const { data } = await datos.from("libros").insert({ titulo: "Portada falsa" }).select("id").single();
    await page.goto(`/libros/${data!.id}`);
    const portada = page.getByRole("region", { name: "Portada" });
    await portada.getByLabel(/Imagen de la portada/).setInputFiles({
      name: "falsa.png",
      mimeType: "image/png",
      buffer: Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'/>"),
    });
    await portada.getByRole("button", { name: "Añadir portada" }).click();
    await expect(portada.getByRole("alert")).toHaveText("Solo se admiten imágenes PNG, JPEG, GIF o WebP.");
    await expect(portada.getByRole("img")).toHaveCount(0);
  });
});

test.describe("recursos (spec fuentes-recursos)", () => {
  test("guarda tipo y fecha de publicación y los muestra (escenarios «Recurso de tipo podcast» y «Fecha de publicación»)", async ({
    page,
  }) => {
    await page.goto("/recursos/nuevo");
    await page.getByLabel("Título").fill("Charla sobre El capital");
    await page.getByLabel("Tipo").selectOption({ label: "Podcast" });
    await page.getByLabel("Fecha de publicación").fill("1883-03-14");
    await page.getByLabel("Autor o creador").fill("David Harvey");
    await page.getByRole("button", { name: "Crear recurso" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Charla sobre El capital" })).toBeVisible();
    await expect(page.locator("main")).toContainText("Podcast · David Harvey · 14 de marzo de 1883");
    await expect(page.getByLabel("Fecha de publicación")).toHaveValue("1883-03-14");
    await expect(guardado(page)).toHaveCount(0);
  });

  test("la lista muestra el tipo y se filtra por tipo (escenario «Filtrar por vídeo»)", async ({ page }) => {
    await datos.from("recursos").insert([
      { titulo: "Conferencia filmada", tipo: "video" },
      { titulo: "Artículo de revista", tipo: "articulo" },
    ]);
    // Aparte: en una inserción múltiple, la columna que falta llegaría como null en vez de su valor por defecto.
    await datos.from("recursos").insert({ titulo: "Recurso antiguo" });
    await page.goto("/recursos");
    const lista = page.getByRole("list", { name: "Lista de recursos" });
    await expect(lista.getByRole("listitem").filter({ hasText: "Recurso antiguo" })).toContainText("Otro");

    await page.getByRole("navigation", { name: "Filtrar por tipo" }).getByRole("link", { name: "Vídeo" }).click();
    await expect(page).toHaveURL(/\/recursos\?tipo=video$/);
    await expect(lista.getByRole("link")).toHaveText(["Conferencia filmada"]);
    await expect(page.getByRole("navigation", { name: "Filtrar por tipo" }).getByText("Vídeo")).toHaveAttribute("aria-current", "true");

    await page.getByRole("navigation", { name: "Filtrar por tipo" }).getByRole("link", { name: "Todos" }).click();
    await expect(lista.getByRole("link", { name: "Artículo de revista" })).toBeVisible();
  });
});

test.describe("Inicio (spec navegacion)", () => {
  test("ofrece accesos para crear y muestra «Leyendo ahora» y proyectos recientes (escenarios «Leyendo ahora» y «Crear desde Inicio»)", async ({
    page,
  }) => {
    await datos.from("libros").insert([
      { titulo: "Libro en lectura", estado_lectura: "leyendo" },
      { titulo: "Libro de referencia" },
    ]);
    await datos.from("proyectos").insert({ nombre: "Proyecto reciente" });
    await page.goto("/");

    const leyendo = page.getByRole("list", { name: "Leyendo ahora" });
    // Solo libros en lectura (otra prueba de este usuario deja «El capital» en «Leyendo»).
    await expect(leyendo.getByRole("link", { name: "Libro en lectura" })).toBeVisible();
    await expect(leyendo.getByRole("link", { name: "Libro de referencia" })).toHaveCount(0);
    await expect(page.getByRole("list", { name: "Proyectos recientes" }).getByRole("link", { name: "Proyecto reciente" })).toBeVisible();
    await expect(page.locator("main")).not.toContainText(/\d+ (notas|libros|proyectos)|racha|hace \d/i);

    const crear = page.getByRole("navigation", { name: "Crear" });
    await expect(crear.getByRole("link")).toHaveText(["Nueva nota", "Nuevo libro", "Nuevo recurso", "Nueva cita"]);
    await crear.getByRole("link", { name: "Nueva nota" }).click();
    await expect(page).toHaveURL(/\/notas\/nueva$/);
  });
});
