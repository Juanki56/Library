// Regla compartida por el servidor y el editor (sin acceso a datos): solo enlaces web.
export function esEnlaceWeb(href: unknown): href is string {
  if (typeof href !== "string") return false;
  try {
    const url = new URL(href);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
