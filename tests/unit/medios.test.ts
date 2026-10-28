import { describe, expect, it } from "vitest";
import { normalizarContenido, textoPlano, type NodoContenido } from "@/backend/services/contenidoNota";
import {
  enlaceVideo,
  extensionPorFirma,
  reconocerVideo,
  reproductorVideo,
  rutasImagenes,
} from "@/backend/services/medios";

// Tarea 2.1 (editor-fase3-imagenes-videos): imágenes y vídeos en el filtro (design D1 y D6).
const U = "3f2b1c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d";
const N = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const F = "11111111-2222-4333-8444-555555555555";
const RUTA = `${U}/${N}/${F}.png`;
const doc = (...content: NodoContenido[]) => ({ type: "doc", content });
const imagen = (attrs: Record<string, unknown>): NodoContenido => ({ type: "imagen", attrs });
const video = (attrs: Record<string, unknown>): NodoContenido => ({ type: "video", attrs });

describe("imágenes en el contenido (spec editor-notas)", () => {
  it("conserva una imagen subida y una desde la web, con alt y pie", () => {
    const d = doc(
      imagen({ origen: "archivo", ruta: RUTA, alt: "Retrato de Marx", pie: "Londres, 1875" }),
      imagen({ origen: "web", src: "https://ejemplo.com/foto.jpg", alt: "", pie: "" }),
    );
    expect(normalizarContenido(d)).toEqual(d);
  });

  it("descarta otros atributos y rellena alt y pie vacíos", () => {
    const limpio = normalizarContenido(doc(imagen({ origen: "web", src: "https://ejemplo.com/a.png", onerror: "x", width: 9 })));
    expect(limpio).toEqual(doc(imagen({ origen: "web", src: "https://ejemplo.com/a.png", alt: "", pie: "" })));
  });

  it("descarta imágenes no válidas", () => {
    for (const attrs of [
      { origen: "web", src: "javascript:alert(1)" },
      { origen: "web", src: "data:image/png;base64,AAAA" },
      { origen: "archivo", ruta: "../otra/cosa.png" },
      { origen: "archivo", ruta: `${U}/${N}/${F}.svg` },
      { origen: "archivo", src: "https://ejemplo.com/a.png" },
      {},
    ]) {
      expect(normalizarContenido(doc(imagen(attrs), { type: "paragraph" }))).toEqual(doc({ type: "paragraph" }));
    }
  });

  it("recorta alt y pie demasiado largos", () => {
    const limpio = normalizarContenido(doc(imagen({ origen: "archivo", ruta: RUTA, alt: "a".repeat(900), pie: "p" })))!;
    expect((limpio.content![0].attrs!.alt as string).length).toBe(500);
  });

  it("el pie entra en el texto plano para la búsqueda", () => {
    const d = normalizarContenido(doc(imagen({ origen: "archivo", ruta: RUTA, pie: "Londres, 1875" })))!;
    expect(textoPlano(d)).toBe("Londres, 1875");
  });

  it("rutasImagenes devuelve solo las imágenes subidas", () => {
    const d = doc(
      imagen({ origen: "archivo", ruta: RUTA }),
      imagen({ origen: "archivo", ruta: RUTA }),
      imagen({ origen: "web", src: "https://ejemplo.com/a.png" }),
    );
    expect(rutasImagenes(d)).toEqual([RUTA]);
  });
});

describe("vídeos (spec editor-notas: «Vídeos de YouTube y Vimeo»)", () => {
  it("reconoce los enlaces de YouTube y Vimeo", () => {
    const yt = { proveedor: "youtube", id: "dQw4w9WgXcQ" };
    for (const enlace of [
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "https://youtube.com/watch?v=dQw4w9WgXcQ&t=42s",
      "https://youtu.be/dQw4w9WgXcQ?si=abc",
      "https://m.youtube.com/watch?v=dQw4w9WgXcQ",
      "https://www.youtube.com/shorts/dQw4w9WgXcQ",
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    ]) {
      expect(reconocerVideo(enlace)).toEqual(yt);
    }
    expect(reconocerVideo("https://vimeo.com/76979871")).toEqual({ proveedor: "vimeo", id: "76979871" });
    expect(reconocerVideo("https://player.vimeo.com/video/76979871")).toEqual({ proveedor: "vimeo", id: "76979871" });
  });

  it("rechaza otros sitios y enlaces mal formados (escenario «Enlace de otro sitio»)", () => {
    for (const enlace of [
      "https://www.dailymotion.com/video/x7tgad0",
      "https://youtube.com.ejemplo.com/watch?v=dQw4w9WgXcQ",
      "https://www.youtube.com/watch?v=corto",
      "javascript:alert(1)",
      "no es un enlace",
      "https://vimeo.com/canal",
    ]) {
      expect(reconocerVideo(enlace)).toBeNull();
    }
  });

  it("construye el reproductor y el enlace sin guardar la dirección", () => {
    expect(reproductorVideo({ proveedor: "youtube", id: "dQw4w9WgXcQ" })).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
    expect(reproductorVideo({ proveedor: "vimeo", id: "76979871" })).toBe("https://player.vimeo.com/video/76979871");
    expect(enlaceVideo({ proveedor: "vimeo", id: "76979871" })).toBe("https://vimeo.com/76979871");
  });

  it("el filtro conserva vídeos válidos y descarta los manipulados (escenario «Vídeo manipulado descartado»)", () => {
    const valido = doc(video({ proveedor: "youtube", id: "dQw4w9WgXcQ" }));
    expect(normalizarContenido(valido)).toEqual(valido);
    expect(normalizarContenido(doc(video({ proveedor: "vimeo", id: "1", src: "https://malo" })))).toEqual(
      doc(video({ proveedor: "vimeo", id: "1" })),
    );
    for (const attrs of [{ proveedor: "dailymotion", id: "x7tgad0" }, { proveedor: "youtube", id: "\"><script>" }, {}]) {
      expect(normalizarContenido(doc(video(attrs), { type: "paragraph" }))).toEqual(doc({ type: "paragraph" }));
    }
  });
});

describe("firma de las imágenes", () => {
  const bytes = (...b: number[]) => new Uint8Array([...b, ...new Array(16).fill(0)]);
  it("reconoce PNG, JPEG, GIF y WebP por su contenido", () => {
    expect(extensionPorFirma(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toBe("png");
    expect(extensionPorFirma(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("jpg");
    expect(extensionPorFirma(bytes(0x47, 0x49, 0x46, 0x38, 0x39, 0x61))).toBe("gif");
    expect(extensionPorFirma(bytes(0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50))).toBe("webp");
  });

  it("rechaza lo que no es una imagen admitida, aunque se llame .png", () => {
    expect(extensionPorFirma(new TextEncoder().encode("<svg xmlns='http://www.w3.org/2000/svg'/>"))).toBeNull();
    expect(extensionPorFirma(new TextEncoder().encode("%PDF-1.7"))).toBeNull();
    expect(extensionPorFirma(new Uint8Array())).toBeNull();
  });
});
