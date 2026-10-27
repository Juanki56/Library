export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      apartado_libro: {
        Row: {
          apartado_id: string
          creado_en: string
          libro_id: string
          proyecto_id: string
          usuario_id: string
        }
        Insert: {
          apartado_id: string
          creado_en?: string
          libro_id: string
          proyecto_id: string
          usuario_id?: string
        }
        Update: {
          apartado_id?: string
          creado_en?: string
          libro_id?: string
          proyecto_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "apartado_libro_apartado_id_proyecto_id_usuario_id_fkey"
            columns: ["apartado_id", "proyecto_id", "usuario_id"]
            isOneToOne: false
            referencedRelation: "apartados"
            referencedColumns: ["id", "proyecto_id", "usuario_id"]
          },
          {
            foreignKeyName: "apartado_libro_libro_id_proyecto_id_fkey"
            columns: ["libro_id", "proyecto_id"]
            isOneToOne: false
            referencedRelation: "libro_proyecto"
            referencedColumns: ["libro_id", "proyecto_id"]
          },
        ]
      }
      apartado_nota: {
        Row: {
          apartado_id: string
          creado_en: string
          nota_id: string
          proyecto_id: string
          usuario_id: string
        }
        Insert: {
          apartado_id: string
          creado_en?: string
          nota_id: string
          proyecto_id: string
          usuario_id?: string
        }
        Update: {
          apartado_id?: string
          creado_en?: string
          nota_id?: string
          proyecto_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "apartado_nota_apartado_id_proyecto_id_usuario_id_fkey"
            columns: ["apartado_id", "proyecto_id", "usuario_id"]
            isOneToOne: false
            referencedRelation: "apartados"
            referencedColumns: ["id", "proyecto_id", "usuario_id"]
          },
          {
            foreignKeyName: "apartado_nota_nota_id_proyecto_id_fkey"
            columns: ["nota_id", "proyecto_id"]
            isOneToOne: false
            referencedRelation: "nota_proyecto"
            referencedColumns: ["nota_id", "proyecto_id"]
          },
        ]
      }
      apartado_recurso: {
        Row: {
          apartado_id: string
          creado_en: string
          proyecto_id: string
          recurso_id: string
          usuario_id: string
        }
        Insert: {
          apartado_id: string
          creado_en?: string
          proyecto_id: string
          recurso_id: string
          usuario_id?: string
        }
        Update: {
          apartado_id?: string
          creado_en?: string
          proyecto_id?: string
          recurso_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "apartado_recurso_apartado_id_proyecto_id_usuario_id_fkey"
            columns: ["apartado_id", "proyecto_id", "usuario_id"]
            isOneToOne: false
            referencedRelation: "apartados"
            referencedColumns: ["id", "proyecto_id", "usuario_id"]
          },
          {
            foreignKeyName: "apartado_recurso_recurso_id_proyecto_id_fkey"
            columns: ["recurso_id", "proyecto_id"]
            isOneToOne: false
            referencedRelation: "recurso_proyecto"
            referencedColumns: ["recurso_id", "proyecto_id"]
          },
        ]
      }
      apartados: {
        Row: {
          actualizado_en: string
          creado_en: string
          descripcion: string | null
          id: string
          posicion: number
          proyecto_id: string
          titulo: string
          usuario_id: string
        }
        Insert: {
          actualizado_en?: string
          creado_en?: string
          descripcion?: string | null
          id?: string
          posicion: number
          proyecto_id: string
          titulo: string
          usuario_id?: string
        }
        Update: {
          actualizado_en?: string
          creado_en?: string
          descripcion?: string | null
          id?: string
          posicion?: number
          proyecto_id?: string
          titulo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "apartados_proyecto_id_usuario_id_fkey"
            columns: ["proyecto_id", "usuario_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id", "usuario_id"]
          },
        ]
      }
      citas: {
        Row: {
          actualizado_en: string
          autor: string | null
          creado_en: string
          fuente: string | null
          id: string
          libro_id: string | null
          recurso_id: string | null
          texto: string
          tipo: string
          usuario_id: string
        }
        Insert: {
          actualizado_en?: string
          autor?: string | null
          creado_en?: string
          fuente?: string | null
          id?: string
          libro_id?: string | null
          recurso_id?: string | null
          texto: string
          tipo?: string
          usuario_id?: string
        }
        Update: {
          actualizado_en?: string
          autor?: string | null
          creado_en?: string
          fuente?: string | null
          id?: string
          libro_id?: string | null
          recurso_id?: string | null
          texto?: string
          tipo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "citas_libro_id_usuario_id_fkey"
            columns: ["libro_id", "usuario_id"]
            isOneToOne: false
            referencedRelation: "libros"
            referencedColumns: ["id", "usuario_id"]
          },
          {
            foreignKeyName: "citas_recurso_id_usuario_id_fkey"
            columns: ["recurso_id", "usuario_id"]
            isOneToOne: false
            referencedRelation: "recursos"
            referencedColumns: ["id", "usuario_id"]
          },
        ]
      }
      etiqueta_libro: {
        Row: {
          creado_en: string
          etiqueta_id: string
          libro_id: string
          usuario_id: string
        }
        Insert: {
          creado_en?: string
          etiqueta_id: string
          libro_id: string
          usuario_id?: string
        }
        Update: {
          creado_en?: string
          etiqueta_id?: string
          libro_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "etiqueta_libro_etiqueta_id_usuario_id_fkey"
            columns: ["etiqueta_id", "usuario_id"]
            isOneToOne: false
            referencedRelation: "etiquetas"
            referencedColumns: ["id", "usuario_id"]
          },
          {
            foreignKeyName: "etiqueta_libro_libro_id_usuario_id_fkey"
            columns: ["libro_id", "usuario_id"]
            isOneToOne: false
            referencedRelation: "libros"
            referencedColumns: ["id", "usuario_id"]
          },
        ]
      }
      etiqueta_nota: {
        Row: {
          creado_en: string
          etiqueta_id: string
          nota_id: string
          usuario_id: string
        }
        Insert: {
          creado_en?: string
          etiqueta_id: string
          nota_id: string
          usuario_id?: string
        }
        Update: {
          creado_en?: string
          etiqueta_id?: string
          nota_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "etiqueta_nota_etiqueta_id_usuario_id_fkey"
            columns: ["etiqueta_id", "usuario_id"]
            isOneToOne: false
            referencedRelation: "etiquetas"
            referencedColumns: ["id", "usuario_id"]
          },
          {
            foreignKeyName: "etiqueta_nota_nota_id_usuario_id_fkey"
            columns: ["nota_id", "usuario_id"]
            isOneToOne: false
            referencedRelation: "notas"
            referencedColumns: ["id", "usuario_id"]
          },
        ]
      }
      etiqueta_proyecto: {
        Row: {
          creado_en: string
          etiqueta_id: string
          proyecto_id: string
          usuario_id: string
        }
        Insert: {
          creado_en?: string
          etiqueta_id: string
          proyecto_id: string
          usuario_id?: string
        }
        Update: {
          creado_en?: string
          etiqueta_id?: string
          proyecto_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "etiqueta_proyecto_etiqueta_id_usuario_id_fkey"
            columns: ["etiqueta_id", "usuario_id"]
            isOneToOne: false
            referencedRelation: "etiquetas"
            referencedColumns: ["id", "usuario_id"]
          },
          {
            foreignKeyName: "etiqueta_proyecto_proyecto_id_usuario_id_fkey"
            columns: ["proyecto_id", "usuario_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id", "usuario_id"]
          },
        ]
      }
      etiqueta_recurso: {
        Row: {
          creado_en: string
          etiqueta_id: string
          recurso_id: string
          usuario_id: string
        }
        Insert: {
          creado_en?: string
          etiqueta_id: string
          recurso_id: string
          usuario_id?: string
        }
        Update: {
          creado_en?: string
          etiqueta_id?: string
          recurso_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "etiqueta_recurso_etiqueta_id_usuario_id_fkey"
            columns: ["etiqueta_id", "usuario_id"]
            isOneToOne: false
            referencedRelation: "etiquetas"
            referencedColumns: ["id", "usuario_id"]
          },
          {
            foreignKeyName: "etiqueta_recurso_recurso_id_usuario_id_fkey"
            columns: ["recurso_id", "usuario_id"]
            isOneToOne: false
            referencedRelation: "recursos"
            referencedColumns: ["id", "usuario_id"]
          },
        ]
      }
      etiquetas: {
        Row: {
          actualizado_en: string
          creado_en: string
          id: string
          nombre: string
          nombre_normalizado: string | null
          usuario_id: string
        }
        Insert: {
          actualizado_en?: string
          creado_en?: string
          id?: string
          nombre: string
          nombre_normalizado?: string | null
          usuario_id?: string
        }
        Update: {
          actualizado_en?: string
          creado_en?: string
          id?: string
          nombre?: string
          nombre_normalizado?: string | null
          usuario_id?: string
        }
        Relationships: []
      }
      glosario: {
        Row: {
          actualizado_en: string
          creado_en: string
          definicion: string
          ejemplo: string | null
          id: string
          informacion_adicional: string | null
          termino: string
          termino_normalizado: string | null
          usuario_id: string
        }
        Insert: {
          actualizado_en?: string
          creado_en?: string
          definicion: string
          ejemplo?: string | null
          id?: string
          informacion_adicional?: string | null
          termino: string
          termino_normalizado?: string | null
          usuario_id?: string
        }
        Update: {
          actualizado_en?: string
          creado_en?: string
          definicion?: string
          ejemplo?: string | null
          id?: string
          informacion_adicional?: string | null
          termino?: string
          termino_normalizado?: string | null
          usuario_id?: string
        }
        Relationships: []
      }
      libro_proyecto: {
        Row: {
          creado_en: string
          libro_id: string
          proyecto_id: string
          usuario_id: string
        }
        Insert: {
          creado_en?: string
          libro_id: string
          proyecto_id: string
          usuario_id?: string
        }
        Update: {
          creado_en?: string
          libro_id?: string
          proyecto_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "libro_proyecto_libro_id_usuario_id_fkey"
            columns: ["libro_id", "usuario_id"]
            isOneToOne: false
            referencedRelation: "libros"
            referencedColumns: ["id", "usuario_id"]
          },
          {
            foreignKeyName: "libro_proyecto_proyecto_id_usuario_id_fkey"
            columns: ["proyecto_id", "usuario_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id", "usuario_id"]
          },
        ]
      }
      libros: {
        Row: {
          actualizado_en: string
          anio: number | null
          autores: string | null
          creado_en: string
          editorial: string | null
          id: string
          notas_bibliograficas: string | null
          titulo: string
          usuario_id: string
        }
        Insert: {
          actualizado_en?: string
          anio?: number | null
          autores?: string | null
          creado_en?: string
          editorial?: string | null
          id?: string
          notas_bibliograficas?: string | null
          titulo: string
          usuario_id?: string
        }
        Update: {
          actualizado_en?: string
          anio?: number | null
          autores?: string | null
          creado_en?: string
          editorial?: string | null
          id?: string
          notas_bibliograficas?: string | null
          titulo?: string
          usuario_id?: string
        }
        Relationships: []
      }
      nota_libro: {
        Row: {
          creado_en: string
          libro_id: string
          nota_id: string
          usuario_id: string
        }
        Insert: {
          creado_en?: string
          libro_id: string
          nota_id: string
          usuario_id?: string
        }
        Update: {
          creado_en?: string
          libro_id?: string
          nota_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nota_libro_libro_id_usuario_id_fkey"
            columns: ["libro_id", "usuario_id"]
            isOneToOne: false
            referencedRelation: "libros"
            referencedColumns: ["id", "usuario_id"]
          },
          {
            foreignKeyName: "nota_libro_nota_id_usuario_id_fkey"
            columns: ["nota_id", "usuario_id"]
            isOneToOne: false
            referencedRelation: "notas"
            referencedColumns: ["id", "usuario_id"]
          },
        ]
      }
      nota_proyecto: {
        Row: {
          creado_en: string
          nota_id: string
          proyecto_id: string
          usuario_id: string
        }
        Insert: {
          creado_en?: string
          nota_id: string
          proyecto_id: string
          usuario_id?: string
        }
        Update: {
          creado_en?: string
          nota_id?: string
          proyecto_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nota_proyecto_nota_id_usuario_id_fkey"
            columns: ["nota_id", "usuario_id"]
            isOneToOne: false
            referencedRelation: "notas"
            referencedColumns: ["id", "usuario_id"]
          },
          {
            foreignKeyName: "nota_proyecto_proyecto_id_usuario_id_fkey"
            columns: ["proyecto_id", "usuario_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id", "usuario_id"]
          },
        ]
      }
      nota_recurso: {
        Row: {
          creado_en: string
          nota_id: string
          recurso_id: string
          usuario_id: string
        }
        Insert: {
          creado_en?: string
          nota_id: string
          recurso_id: string
          usuario_id?: string
        }
        Update: {
          creado_en?: string
          nota_id?: string
          recurso_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nota_recurso_nota_id_usuario_id_fkey"
            columns: ["nota_id", "usuario_id"]
            isOneToOne: false
            referencedRelation: "notas"
            referencedColumns: ["id", "usuario_id"]
          },
          {
            foreignKeyName: "nota_recurso_recurso_id_usuario_id_fkey"
            columns: ["recurso_id", "usuario_id"]
            isOneToOne: false
            referencedRelation: "recursos"
            referencedColumns: ["id", "usuario_id"]
          },
        ]
      }
      notas: {
        Row: {
          actualizado_en: string
          contenido: Json
          contenido_texto: string
          creado_en: string
          id: string
          titulo: string
          usuario_id: string
        }
        Insert: {
          actualizado_en?: string
          contenido?: Json
          contenido_texto?: string
          creado_en?: string
          id?: string
          titulo: string
          usuario_id?: string
        }
        Update: {
          actualizado_en?: string
          contenido?: Json
          contenido_texto?: string
          creado_en?: string
          id?: string
          titulo?: string
          usuario_id?: string
        }
        Relationships: []
      }
      proyectos: {
        Row: {
          actualizado_en: string
          creado_en: string
          descripcion: string | null
          id: string
          nombre: string
          usuario_id: string
        }
        Insert: {
          actualizado_en?: string
          creado_en?: string
          descripcion?: string | null
          id?: string
          nombre: string
          usuario_id?: string
        }
        Update: {
          actualizado_en?: string
          creado_en?: string
          descripcion?: string | null
          id?: string
          nombre?: string
          usuario_id?: string
        }
        Relationships: []
      }
      recurso_libro: {
        Row: {
          creado_en: string
          libro_id: string
          recurso_id: string
          usuario_id: string
        }
        Insert: {
          creado_en?: string
          libro_id: string
          recurso_id: string
          usuario_id?: string
        }
        Update: {
          creado_en?: string
          libro_id?: string
          recurso_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurso_libro_libro_id_usuario_id_fkey"
            columns: ["libro_id", "usuario_id"]
            isOneToOne: false
            referencedRelation: "libros"
            referencedColumns: ["id", "usuario_id"]
          },
          {
            foreignKeyName: "recurso_libro_recurso_id_usuario_id_fkey"
            columns: ["recurso_id", "usuario_id"]
            isOneToOne: false
            referencedRelation: "recursos"
            referencedColumns: ["id", "usuario_id"]
          },
        ]
      }
      recurso_proyecto: {
        Row: {
          creado_en: string
          proyecto_id: string
          recurso_id: string
          usuario_id: string
        }
        Insert: {
          creado_en?: string
          proyecto_id: string
          recurso_id: string
          usuario_id?: string
        }
        Update: {
          creado_en?: string
          proyecto_id?: string
          recurso_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurso_proyecto_proyecto_id_usuario_id_fkey"
            columns: ["proyecto_id", "usuario_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id", "usuario_id"]
          },
          {
            foreignKeyName: "recurso_proyecto_recurso_id_usuario_id_fkey"
            columns: ["recurso_id", "usuario_id"]
            isOneToOne: false
            referencedRelation: "recursos"
            referencedColumns: ["id", "usuario_id"]
          },
        ]
      }
      recursos: {
        Row: {
          actualizado_en: string
          autor: string | null
          creado_en: string
          descripcion: string | null
          id: string
          titulo: string
          url: string | null
          usuario_id: string
        }
        Insert: {
          actualizado_en?: string
          autor?: string | null
          creado_en?: string
          descripcion?: string | null
          id?: string
          titulo: string
          url?: string | null
          usuario_id?: string
        }
        Update: {
          actualizado_en?: string
          autor?: string | null
          creado_en?: string
          descripcion?: string | null
          id?: string
          titulo?: string
          url?: string | null
          usuario_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      buscar: {
        Args: { consulta: string; filtro?: string }
        Returns: {
          cuerpo: string
          id: string
          rango: number
          tipo: string
          titulo: string
        }[]
      }
      mover_apartado: {
        Args: { apartado: string; direccion: string }
        Returns: undefined
      }
      normalizar: { Args: { texto: string }; Returns: string }
      tablas_sin_rls: { Args: never; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
