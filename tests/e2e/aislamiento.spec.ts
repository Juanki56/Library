import { expect, test } from "@playwright/test";
import { borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";
import { entrarComo } from "./sesion";

// Tarea 9.2: con dos usuarios, ninguno ve el contenido del otro en la interfaz (spec cuentas-usuario).
let a: UsuarioPrueba, b: UsuarioPrueba;
const rutasDeA: string[] = [];

test.beforeAll(async () => {
  a = await crearUsuario({ confirmado: true });
  b = await crearUsuario({ confirmado: true });
  const datosA = await clienteDe(a);
  const nota = await datosA.from("notas").insert({ titulo: "Secreto de A: nota" }).select("id").single();
  const proyecto = await datosA.from("proyectos").insert({ nombre: "Secreto de A: proyecto" }).select("id").single();
  const libro = await datosA.from("libros").insert({ titulo: "Secreto de A: libro" }).select("id").single();
  const recurso = await datosA.from("recursos").insert({ titulo: "Secreto de A: recurso" }).select("id").single();
  rutasDeA.push(
    `/notas/${nota.data!.id}`,
    `/proyectos/${proyecto.data!.id}`,
    `/libros/${libro.data!.id}`,
    `/recursos/${recurso.data!.id}`,
  );
});

test.afterAll(async () => {
  await borrarUsuario(a);
  await borrarUsuario(b);
});

test("otro usuario no puede abrir las páginas de A aunque conozca la dirección", async ({ page }) => {
  await entrarComo(page, b);
  for (const ruta of rutasDeA) {
    // Con «Cargando…» la respuesta empieza antes de saber que no existe: el código HTTP es 200 y
    // lo que cuenta es la página de «no encontrada» (cambio velocidad-respuesta).
    await page.goto(ruta);
    await expect(page.getByText("This page could not be found."), ruta).toBeVisible();
    await expect(page.getByText(/Secreto de A/)).toHaveCount(0);
  }
});

test("las listas de B no muestran nada de A, ni siquiera para vincular", async ({ page }) => {
  await entrarComo(page, b);
  for (const ruta of ["/notas", "/proyectos", "/libros", "/recursos"]) {
    await page.goto(ruta);
    await expect(page.getByText(/Secreto de A/)).toHaveCount(0);
  }

  const datosB = await clienteDe(b);
  const { data } = await datosB.from("notas").insert({ titulo: "Nota de B" }).select("id").single();
  await page.goto(`/notas/${data!.id}`);
  await expect(page.getByRole("option", { name: /Secreto de A/ })).toHaveCount(0);
});

test("A sí ve su propio contenido", async ({ page }) => {
  await entrarComo(page, a);
  for (const ruta of rutasDeA) {
    const respuesta = await page.goto(ruta);
    expect(respuesta?.status(), ruta).toBe(200);
  }
});
