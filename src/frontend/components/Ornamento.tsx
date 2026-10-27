// Ornamento clásico dibujado (hojas y rombo central) para portadas, encabezados y colofones.
// Decorativo: oculto a los lectores de pantalla.
export default function Ornamento({ ancho = 64, clase }: { ancho?: number; clase?: string }) {
  return (
    <svg
      viewBox="0 0 64 16"
      width={ancho}
      height={(ancho * 16) / 64}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      className={clase}
    >
      <path d="M2 8h18M44 8h18" />
      <path d="M20 8c3-4 7-5 9-3-2 1-5 3-9 3zM20 8c3 4 7 5 9 3-2-1-5-3-9-3z" fill="currentColor" fillOpacity="0.35" />
      <path d="M44 8c-3-4-7-5-9-3 2 1 5 3 9 3zM44 8c-3 4-7 5-9 3 2-1 5-3 9-3z" fill="currentColor" fillOpacity="0.35" />
      <path d="M32 4.5 35.5 8 32 11.5 28.5 8z" fill="currentColor" />
    </svg>
  );
}
