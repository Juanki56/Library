import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./tipos-db";

// Acceso a tablas elegidas en tiempo de ejecución (las 6 de vínculos comparten forma),
// que el cliente tipado no puede inferir. Úsalo solo en repositories.
export type FilaLibre = Record<string, unknown>;
type EsquemaLibre = {
  public: {
    Tables: Record<string, { Row: FilaLibre; Insert: FilaLibre; Update: FilaLibre; Relationships: [] }>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
export type ClienteSinTipos = SupabaseClient<EsquemaLibre>;
export type Cliente = SupabaseClient<Database>;

export const sinTipos = (c: Cliente) => c as unknown as ClienteSinTipos;
