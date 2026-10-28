import type { SupabaseClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";
import type { Database, Json } from "@/backend/repositories/tipos-db";
import { admin, borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";
import { entrarComo } from "./sesion";

// Tarea 4.1 (editor-fase3-imagenes-videos): imágenes subidas y desde URL, vídeos y limpieza.
let usuario: UsuarioPrueba, otro: UsuarioPrueba;
let datos: SupabaseClient<Database>;

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);
const WEB = "https://imagenes.ejemplo.test";

test.beforeAll(async () => {
  usuario = await crearUsuario({ confirmado: true });
  otro = await crearUsuario({ confirmado: true });
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
  await borrarUsuario(otro);
});

test.beforeEach(async ({ page }) => {
  // Ni la web de ejemplo ni los reproductores salen a internet durante las pruebas.
  // En Playwright gana la última ruta registrada: la general va primero y la rota después.
  await page.route(`${WEB}/**`, (r) => r.fulfill({ contentType: "image/png", body: PNG }));
  await page.route(`${WEB}/rota.png`, (r) => r.abort());
  await page.route(/youtube-nocookie\.com|player\.vimeo\.com/, (r) =>
    r.fulfill({ contentType: "text/html", body: "<p>reproductor</p>" }),
  );
  await entrarComo(page, usuario);
});

async function crearNota(titulo: string, contenido?: Json) {
  const { data } = await datos
    .from("notas")
    .insert(contenido ? { titulo, contenido } : { titulo })
    .select("id")
    .single();
  return data!.id;
}

const editor = (page: Page) => page.getByLabel("Contenido de la nota");
const estado = (page: Page) => page.getByRole("status", { name: "Estado del guardado" });
const barra = (page: Page) => page.getByRole("toolbar", { name: "Formato", exact: true });
const cuadroImagen = (page: Page) => page.getByRole("dialog", { name: "Insertar imagen" });

async function abrir(page: Page, id: string) {
  await page.goto(`/notas/${id}`);
  await expect(editor(page)).toBeVisible();
}

async function cargada(page: Page) {
  const img = editor(page).locator("figure img").first();
  await expect(img).toBeVisible();
  // Margen amplio: la primera petición a /imagen compila la ruta en el servidor de desarrollo.
  await expect
    .poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0), { timeout: 20_000 })
    .toBe(true);
  return img;
}

async function rutasSubidas(notaId: string) {
  const { data } = await admin().from("imagenes_nota").select("ruta").eq("nota_id", notaId);
  return (data ?? []).map((r) => r.ruta);
}

async function existeArchivo(ruta: string) {
  const carpeta = ruta.slice(0, ruta.lastIndexOf("/"));
  const archivo = ruta.slice(ruta.lastIndexOf("/") + 1);
  const { data } = await admin().storage.from("imagenes").list(carpeta, { search: archivo });
  return (data ?? []).some((a) => a.name === archivo);
}

async function subirDesdeMenu(page: Page, archivo: { name: string; mimeType: string; buffer: Buffer }) {
  await editor(page).click();
  await page.keyboard.type("/imag");
  await page.getByRole("listbox", { name: "Insertar bloque" }).getByRole("option", { name: /^Imagen/ }).click();
  await cuadroImagen(page).getByLabel(/Archivo de imagen/).setInputFiles(archivo);
}

test("sube una imagen con alt y pie, se ve al reabrir y el pie se edita (escenarios «Subir una imagen» y «Añadir y editar»)", async ({
  page,
}) => {
  const id = await crearNota("Con retrato");
  await abrir(page, id);
  await subirDesdeMenu(page, { name: "retrato.png", mimeType: "image/png", buffer: PNG });
  await cuadroImagen(page).getByLabel("Texto alternativo").fill("Retrato de Marx");
  await cuadroImagen(page).getByLabel("Pie de imagen (opcional)").fill("Londres, 1875");
  await cuadroImagen(page).getByRole("button", { name: "Insertar" }).click();

  await expect(cuadroImagen(page)).toBeHidden();
  await expect(await cargada(page)).toHaveAttribute("alt", "Retrato de Marx");
  await expect(editor(page).locator("figcaption")).toHaveText("Londres, 1875");
  await expect(estado(page)).toHaveText("Guardado");

  await page.reload();
  await cargada(page);
  await editor(page).locator("figure").first().click();
  await barra(page).getByRole("button", { name: "Editar imagen" }).click();
  const editar = page.getByRole("dialog", { name: "Editar imagen" });
  await expect(editar.getByLabel("Pie de imagen (opcional)")).toHaveValue("Londres, 1875");
  await editar.getByLabel("Pie de imagen (opcional)").fill("Londres, 1875 (detalle)");
  await editar.getByRole("button", { name: "Aplicar" }).click();
  await expect(estado(page)).toHaveText("Guardado");

  await page.reload();
  await expect(editor(page).locator("figcaption")).toHaveText("Londres, 1875 (detalle)");
  await expect(editor(page).locator("figure img")).toHaveAttribute("alt", "Retrato de Marx");
});

test("rechaza imágenes grandes y archivos que no son imágenes (escenarios «Imagen demasiado grande» y «Tipo no admitido»)", async ({
  page,
}) => {
  const id = await crearNota("Rechazos");
  await abrir(page, id);
  await subirDesdeMenu(page, { name: "enorme.png", mimeType: "image/png", buffer: Buffer.concat([PNG, Buffer.alloc(6 * 1024 * 1024)]) });
  await cuadroImagen(page).getByRole("button", { name: "Insertar" }).click();
  await expect(cuadroImagen(page).getByRole("alert")).toHaveText("La imagen no puede superar 5 MB.");

  await cuadroImagen(page).getByLabel(/Archivo de imagen/).setInputFiles({
    name: "falsa.png",
    mimeType: "image/png",
    buffer: Buffer.from("<svg xmlns='http://www.w3.org/2000/svg' onload='alert(1)'/>"),
  });
  await cuadroImagen(page).getByRole("button", { name: "Insertar" }).click();
  await expect(cuadroImagen(page).getByRole("alert")).toHaveText("Solo se admiten imágenes PNG, JPEG, GIF o WebP.");
  await cuadroImagen(page).getByRole("button", { name: "Cancelar" }).click();
  await expect(editor(page).locator("figure")).toHaveCount(0);
  expect(await rutasSubidas(id)).toEqual([]);
});

test("una imagen subida no se puede abrir desde otra cuenta ni sin sesión (escenario «Imagen privada»)", async ({
  page,
  browser,
}) => {
  const id = await crearNota("Privada");
  await abrir(page, id);
  await subirDesdeMenu(page, { name: "privada.png", mimeType: "image/png", buffer: PNG });
  await cuadroImagen(page).getByRole("button", { name: "Insertar" }).click();
  await cargada(page);
  const [ruta] = await rutasSubidas(id);
  const direccion = `/imagen?ruta=${encodeURIComponent(ruta)}`;

  const propia = await page.request.get(direccion, { maxRedirects: 0 });
  expect(propia.status()).toBe(302);

  const ajeno = await browser.newContext({ baseURL: test.info().project.use.baseURL });
  const paginaAjena = await ajeno.newPage();
  await entrarComo(paginaAjena, otro);
  const respuestaAjena = await paginaAjena.request.get(direccion, { maxRedirects: 0 });
  expect(respuestaAjena.status()).toBe(404);

  const anonimo = await browser.newContext({ baseURL: test.info().project.use.baseURL });
  const sinSesion = await anonimo.request.get(direccion, { maxRedirects: 0 });
  expect(sinSesion.headers()["location"] ?? "").not.toContain("supabase");
  expect(sinSesion.headers()["content-type"] ?? "").not.toContain("image");
  await ajeno.close();
  await anonimo.close();
});

test("inserta una imagen desde la web y rechaza direcciones no web (escenarios «Imagen desde la web» y «Dirección no web»)", async ({
  page,
}) => {
  const id = await crearNota("Desde la web");
  await abrir(page, id);
  await editor(page).click();
  await barra(page).getByRole("button", { name: "Imagen", exact: true }).click();
  await cuadroImagen(page).getByLabel("Desde una dirección web").check();
  await cuadroImagen(page).getByLabel("Dirección de la imagen").fill("javascript:alert(1)");
  await cuadroImagen(page).getByRole("button", { name: "Insertar" }).click();
  await expect(cuadroImagen(page).getByRole("alert")).toHaveText(
    "Solo se admiten direcciones web que empiecen por http:// o https://",
  );

  await cuadroImagen(page).getByLabel("Dirección de la imagen").fill(`${WEB}/manifiesto.png`);
  await cuadroImagen(page).getByRole("button", { name: "Insertar" }).click();
  await expect(await cargada(page)).toHaveAttribute("src", `${WEB}/manifiesto.png`);
  await expect(estado(page)).toHaveText("Guardado");
  await page.reload();
  await expect(await cargada(page)).toHaveAttribute("src", `${WEB}/manifiesto.png`);
  expect(await rutasSubidas(id)).toEqual([]);
});

test("una imagen web que no carga muestra un aviso y el resto se ve (escenario «Imagen no disponible»)", async ({
  page,
}) => {
  const id = await crearNota("Imagen rota", {
    type: "doc",
    content: [
      { type: "imagen", attrs: { origen: "web", src: `${WEB}/rota.png`, alt: "", pie: "Una lámina" } },
      { type: "paragraph", content: [{ type: "text", text: "Texto que sigue" }] },
    ],
  });
  await abrir(page, id);
  await expect(editor(page).getByText("No se pudo cargar la imagen.")).toBeVisible();
  await expect(editor(page)).toContainText("Texto que sigue");
  await expect(editor(page).locator("figcaption")).toHaveText("Una lámina");
});

test.describe("vídeos (requisito «Vídeos de YouTube y Vimeo»)", () => {
  test("inserta un vídeo de YouTube desde «/» y se conserva", async ({ page }) => {
    const id = await crearNota("Con vídeo");
    await abrir(page, id);
    await editor(page).click();
    await page.keyboard.type("/vid");
    await page.getByRole("listbox", { name: "Insertar bloque" }).getByRole("option", { name: /^Vídeo/ }).click();
    const cuadro = page.getByRole("dialog", { name: "Insertar vídeo" });
    await cuadro.getByLabel("Enlace del vídeo").fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    await cuadro.getByRole("button", { name: "Insertar" }).click();

    const reproductor = editor(page).locator("iframe[title='Vídeo de YouTube']");
    await expect(reproductor).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
    await expect(estado(page)).toHaveText("Guardado");
    await page.reload();
    await expect(reproductor).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
    await expect(editor(page).getByRole("link", { name: "Ver en YouTube" })).toHaveAttribute(
      "href",
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    );
  });

  test("inserta un vídeo de Vimeo desde la barra y rechaza otros sitios", async ({ page }) => {
    const id = await crearNota("Vimeo");
    await abrir(page, id);
    await editor(page).click();
    await barra(page).getByRole("button", { name: "Vídeo" }).click();
    const cuadro = page.getByRole("dialog", { name: "Insertar vídeo" });
    await cuadro.getByLabel("Enlace del vídeo").fill("https://www.dailymotion.com/video/x7tgad0");
    await cuadro.getByRole("button", { name: "Insertar" }).click();
    await expect(cuadro.getByRole("alert")).toHaveText("Solo se admiten vídeos de YouTube o Vimeo.");

    await cuadro.getByLabel("Enlace del vídeo").fill("https://vimeo.com/76979871");
    await cuadro.getByRole("button", { name: "Insertar" }).click();
    await expect(editor(page).locator("iframe[title='Vídeo de Vimeo']")).toHaveAttribute(
      "src",
      "https://player.vimeo.com/video/76979871",
    );
  });
});

test.describe("limpieza (requisito «Limpieza de imágenes subidas»)", () => {
  async function conImagenSubida(page: Page, titulo: string) {
    const id = await crearNota(titulo);
    await abrir(page, id);
    await subirDesdeMenu(page, { name: "lamina.png", mimeType: "image/png", buffer: PNG });
    await cuadroImagen(page).getByRole("button", { name: "Insertar" }).click();
    await cargada(page);
    await expect(estado(page)).toHaveText("Guardado");
    const [ruta] = await rutasSubidas(id);
    expect(await existeArchivo(ruta)).toBe(true);
    return { id, ruta };
  }

  test("quitar la imagen del texto la borra al volver a abrir la nota (escenario «Quitar una imagen del texto»)", async ({
    page,
  }) => {
    const { id, ruta } = await conImagenSubida(page, "Quitar imagen");
    await editor(page).locator("figure").first().click();
    await page.keyboard.press("Delete");
    await expect(editor(page).locator("figure")).toHaveCount(0);
    await expect(estado(page)).toHaveText("Guardado");

    // Simula que la subida fue hace más de dos minutos.
    await admin().from("imagenes_nota").update({ creado_en: new Date(Date.now() - 10 * 60_000).toISOString() }).eq("ruta", ruta);
    await abrir(page, id);
    await expect.poll(() => existeArchivo(ruta)).toBe(false);
    expect(await rutasSubidas(id)).toEqual([]);
  });

  test("eliminar la nota borra sus imágenes (escenario «Eliminar la nota»)", async ({ page }) => {
    const { ruta } = await conImagenSubida(page, "Nota con lámina");
    await page.getByRole("button", { name: "Eliminar", exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Eliminar definitivamente" }).click();
    await expect(page).toHaveURL(/\/notas$/);
    await expect.poll(() => existeArchivo(ruta)).toBe(false);
  });
});
