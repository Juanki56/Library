import { expect, test } from "@playwright/test";
import { borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";
import { conexiones } from "./conexiones";
import { entrarComo } from "./sesion";

// Tareas 8.1 y 8.2: navegación principal y elementos relacionados navegables (specs navegacion, relaciones).
let usuario: UsuarioPrueba;

test.beforeAll(async () => {
  usuario = await crearUsuario({ confirmado: true });
});

test.afterAll(async () => {
  await borrarUsuario(usuario);
});

test.beforeEach(async ({ page }) => {
  await entrarComo(page, usuario);
});

test("el menú principal lleva a cada sección de contenido (spec navegacion)", async ({ page }) => {
  const menu = page.getByRole("navigation", { name: "Principal" });
  const secciones: [string, RegExp, string][] = [
    ["Proyectos", /\/proyectos$/, "Proyectos"],
    ["Libros", /\/libros$/, "Libros"],
    ["Notas", /\/notas$/, "Notas"],
    ["Fuentes y recursos", /\/recursos$/, "Fuentes y recursos"],
    ["Inicio", /\/$/, "Archivo de conocimiento"],
  ];
  for (const [enlace, url, titulo] of secciones) {
    await menu.getByRole("link", { name: enlace, exact: true }).click();
    await expect(page).toHaveURL(url);
    await expect(page.getByRole("heading", { level: 1, name: titulo, exact: true })).toBeVisible();
    // La sección activa queda marcada en el menú (§6).
    await expect(menu.getByRole("link", { name: enlace, exact: true })).toHaveAttribute("aria-current", "page");
  }
});

test("el menú da acceso a las ocho áreas acordadas (spec navegacion)", async ({ page }) => {
  const menu = page.getByRole("navigation", { name: "Principal" });
  await expect(menu.getByRole("link")).toHaveText([
    "Inicio",
    "Notas",
    "Proyectos",
    "Libros",
    "Fuentes y recursos",
    "Citas",
    "Glosario",
    "Etiquetas",
  ]);
  for (const [enlace, titulo] of [["Etiquetas", "Etiquetas"], ["Glosario", "Glosario"], ["Citas", "Citas"]]) {
    await menu.getByRole("link", { name: enlace, exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: titulo, exact: true })).toBeVisible();
    await expect(menu.getByRole("link", { name: enlace, exact: true })).toHaveAttribute("aria-current", "page");
  }
});

test("desde una nota se navega a su libro y de vuelta (spec relaciones)", async ({ page }) => {
  const datos = await clienteDe(usuario);
  const { data: nota } = await datos.from("notas").insert({ titulo: "Plusvalía" }).select("id").single();
  const { data: libro } = await datos.from("libros").insert({ titulo: "El capital" }).select("id").single();
  const { data: proyecto } = await datos.from("proyectos").insert({ nombre: "Economía política" }).select("id").single();
  await datos.from("nota_libro").insert({ nota_id: nota!.id, libro_id: libro!.id });
  await datos.from("nota_proyecto").insert({ nota_id: nota!.id, proyecto_id: proyecto!.id });

  const relacionados = conexiones(page);

  await page.goto(`/notas/${nota!.id}`);
  await relacionados.getByRole("region", { name: "Libros" }).getByRole("link", { name: "El capital" }).click();
  await expect(page).toHaveURL(new RegExp(`/libros/${libro!.id}$`));
  await expect(page.getByRole("heading", { level: 1, name: "El capital" })).toBeVisible();

  await relacionados.getByRole("region", { name: "Notas" }).getByRole("link", { name: "Plusvalía" }).click();
  await expect(page).toHaveURL(new RegExp(`/notas/${nota!.id}$`));

  await relacionados.getByRole("region", { name: "Proyectos" }).getByRole("link", { name: "Economía política" }).click();
  await expect(page).toHaveURL(new RegExp(`/proyectos/${proyecto!.id}$`));
  await expect(relacionados.getByRole("region", { name: "Notas" }).getByRole("link", { name: "Plusvalía" })).toBeVisible();
});
