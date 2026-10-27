// Utilidades puras de la búsqueda (sin acceso a datos): limpiar la consulta y construir
// el fragmento con la coincidencia sobre el texto original (design D5).

export type ParteFragmento = { texto: string; marcado: boolean };

const ES_ALFANUMERICO = /[\p{L}\p{N}]/u;
const CONTEXTO = 70;
const SIN_COINCIDENCIA = 140;

// Misma regla que public.normalizar, aplicada a un solo carácter.
function normalizarCaracter(c: string): string {
  return c.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

// Términos de búsqueda: solo letras y dígitos, sin tildes ni mayúsculas.
export function terminosDe(consulta: string): string[] {
  return consulta
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map((t) => [...t].map(normalizarCaracter).join(""))
    .filter(Boolean);
}

// Texto normalizado carácter a carácter, con la posición de cada carácter en el original.
function normalizarConPosiciones(texto: string) {
  let normalizado = "";
  const origen: number[] = [];
  let i = 0;
  for (const c of texto) {
    const n = normalizarCaracter(c);
    for (const _ of n) {
      normalizado += _;
      origen.push(i);
    }
    i += c.length;
  }
  return { normalizado, origen };
}

// Primera palabra que empieza por alguno de los términos, en posiciones del texto original.
export function primeraCoincidencia(texto: string, terminos: string[]): { inicio: number; fin: number } | null {
  const { normalizado, origen } = normalizarConPosiciones(texto);
  let mejor: { inicio: number; fin: number } | null = null;
  for (const termino of terminos) {
    let desde = 0;
    while (desde <= normalizado.length - termino.length) {
      const p = normalizado.indexOf(termino, desde);
      if (p === -1) break;
      const anterior = p > 0 ? normalizado[p - 1] : "";
      if (!anterior || !ES_ALFANUMERICO.test(anterior)) {
        // Fin = después del carácter original del último carácter coincidente (1 o 2 unidades UTF-16).
        const ultimo = origen[p + termino.length - 1];
        const fin = ultimo + ((texto.codePointAt(ultimo) ?? 0) > 0xffff ? 2 : 1);
        if (!mejor || origen[p] < mejor.inicio) mejor = { inicio: origen[p], fin };
        break;
      }
      desde = p + 1;
    }
  }
  return mejor;
}

// Fragmento de unos 70 caracteres a cada lado de la coincidencia, cortando en espacios.
export function fragmento(texto: string, terminos: string[]): ParteFragmento[] {
  const limpio = texto.replace(/\s+/g, " ").trim();
  if (!limpio) return [];
  const coincidencia = primeraCoincidencia(limpio, terminos);
  if (!coincidencia) {
    const corto = limpio.length > SIN_COINCIDENCIA;
    return [{ texto: corto ? `${limpio.slice(0, limpio.lastIndexOf(" ", SIN_COINCIDENCIA) > 0 ? limpio.lastIndexOf(" ", SIN_COINCIDENCIA) : SIN_COINCIDENCIA)}…` : limpio, marcado: false }];
  }
  let desde = Math.max(0, coincidencia.inicio - CONTEXTO);
  let hasta = Math.min(limpio.length, coincidencia.fin + CONTEXTO);
  if (desde > 0) {
    const espacio = limpio.indexOf(" ", desde);
    desde = espacio !== -1 && espacio < coincidencia.inicio ? espacio + 1 : desde;
  }
  if (hasta < limpio.length) {
    const espacio = limpio.lastIndexOf(" ", hasta);
    hasta = espacio > coincidencia.fin ? espacio : hasta;
  }
  const partes: ParteFragmento[] = [];
  const antes = limpio.slice(desde, coincidencia.inicio);
  const despues = limpio.slice(coincidencia.fin, hasta);
  if (desde > 0 || antes) partes.push({ texto: `${desde > 0 ? "…" : ""}${antes}`, marcado: false });
  partes.push({ texto: limpio.slice(coincidencia.inicio, coincidencia.fin), marcado: true });
  if (hasta < limpio.length || despues) partes.push({ texto: `${despues}${hasta < limpio.length ? "…" : ""}`, marcado: false });
  return partes.filter((p) => p.texto);
}
