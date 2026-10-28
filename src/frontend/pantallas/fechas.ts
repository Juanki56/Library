// Fechas como metadatos (spec notas): siempre una fecha concreta, nunca duraciones
// ni tiempos relativos que sugieran medir el estudio (spec exclusiones-alcance).
const FORMATO = new Intl.DateTimeFormat("es", { dateStyle: "long" });

export function fecha(iso: string) {
  return FORMATO.format(new Date(iso));
}

// Fecha sin hora (por ejemplo, la de publicación de un recurso): «AAAA-MM-DD» se interpreta
// en UTC, así que se formatea en UTC para no mostrar el día anterior según la zona horaria.
const FORMATO_DIA = new Intl.DateTimeFormat("es", { dateStyle: "long", timeZone: "UTC" });

export function fechaDia(dia: string) {
  return FORMATO_DIA.format(new Date(`${dia}T00:00:00Z`));
}
