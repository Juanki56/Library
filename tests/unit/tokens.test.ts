import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// design D7: solo tokens.css define valores de color; el resto usa variables.
const COLOR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/;

function archivosCss(dir: string): string[] {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) return archivosCss(ruta);
    return ruta.endsWith(".css") ? [ruta] : [];
  });
}

describe("tokens de diseño", () => {
  const css = archivosCss(join(process.cwd(), "src")).filter(
    (ruta) => !ruta.endsWith("tokens.css"),
  );

  it("hay hojas de estilo que comprobar", () => {
    expect(css.length).toBeGreaterThan(0);
  });

  it.each(css)("%s no contiene colores literales", (ruta) => {
    expect(readFileSync(ruta, "utf8")).not.toMatch(COLOR_LITERAL);
  });
});
