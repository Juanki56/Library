// Fechas como metadatos (spec notas): siempre una fecha concreta, nunca duraciones
// ni tiempos relativos que sugieran medir el estudio (spec exclusiones-alcance).
const FORMATO = new Intl.DateTimeFormat("es", { dateStyle: "long" });

export function fecha(iso: string) {
  return FORMATO.format(new Date(iso));
}
