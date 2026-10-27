import { expect, test } from "@playwright/test";
import { borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";
import { entrarComo } from "./sesion";

// Inicio: notas recientes, libros y citas en listas editoriales (§6 y §7 del documento),
// sin métricas ni tiempos relativos (specs exclusiones-alcance, navegacion, notas).
let usuario: UsuarioPrueba;

test.beforeAll(async () => {
  usuario = await crearUsuario({ confirmado: true });
});

test.afterAll(async () => {
  await borrarUsuario(usuario);
});

test("con el archivo vacío, cada bloque lo indica con un enlace para empezar", async ({ page }) => {
  await entrarComo(page, usuario);
  const principal = page.locator("main");
  await expect(principal.getByRole("heading", { level: 1, name: "Archivo de conocimiento" })).toBeVisible();
  await expect(principal.getByText("Todavía no has escrito ninguna nota.")).toBeVisible();
  await expect(principal.getByRole("link", { name: "Escribir la primera" })).toHaveAttribute("href", "/notas/nueva");
  await expect(principal.getByText("Todavía no has añadido ningún libro.")).toBeVisible();
  await expect(principal.getByRole("region", { name: "Citas guardadas" })).toContainText(
    "cuando la sección de citas esté disponible",
  );
});

test("muestra las notas recientes con extracto, fecha y proyectos, y los libros", async ({ page }) => {
  const datos = await clienteDe(usuario);
  const { data: nota } = await datos
    .from("notas")
    .insert({ titulo: "La lucha de clases", contenido_texto: "La historia de toda sociedad es la historia de la lucha de clases." })
    .select("id")
    .single();
  const { data: proyectos } = await datos
    .from("proyectos")
    .insert([{ nombre: "Comunismo" }, { nombre: "Historia social" }])
    .select("id");
  await datos.from("nota_proyecto").insert(proyectos!.map((p) => ({ nota_id: nota!.id, proyecto_id: p.id })));
  await datos.from("libros").insert({ titulo: "El manifiesto comunista", autores: "Karl Marx, Friedrich Engels", anio: 1848 });

  await entrarComo(page, usuario);
  const notas = page.getByRole("list", { name: "Notas recientes" });
  const elemento = notas.getByRole("listitem").filter({ hasText: "La lucha de clases" });
  await expect(elemento.getByRole("link", { name: "La lucha de clases" })).toHaveAttribute("href", `/notas/${nota!.id}`);
  await expect(elemento).toContainText("La historia de toda sociedad es la historia de la lucha de clases.");
  await expect(elemento).toContainText(/Modificada el \d{1,2} de [a-z]+ de \d{4} · en Comunismo · Historia social/);

  const libros = page.getByRole("list", { name: "Libros" });
  await expect(libros.getByRole("link", { name: "El manifiesto comunista" })).toBeVisible();
  await expect(libros).toContainText("Karl Marx, Friedrich Engels · 1848");

  // Sin métricas, contadores ni tiempos relativos.
  await expect(page.locator("main")).not.toContainText(/hace \d|racha|minutos|horas de estudio|\d+ notas|\d+ libros/i);
  await expect(page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Inicio" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("la búsqueda global está en la cabecera, desactivada hasta que exista (§4)", async ({ page }) => {
  await entrarComo(page, usuario);
  const buscador = page.getByRole("searchbox", { name: "Buscar en todo el archivo" });
  await expect(buscador).toBeVisible();
  await expect(buscador).toBeDisabled();
});
