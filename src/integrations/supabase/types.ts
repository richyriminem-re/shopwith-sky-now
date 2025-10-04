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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          alt_text: string | null
          created_at: string | null
          cta_position: string | null
          cta_size: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string
          is_active: boolean | null
          link_target: string | null
          link_text: string | null
          link_url: string | null
          title: string
          updated_at: string | null
          webp_url: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          cta_position?: string | null
          cta_size?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_active?: boolean | null
          link_target?: string | null
          link_text?: string | null
          link_url?: string | null
          title: string
          updated_at?: string | null
          webp_url?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          cta_position?: string | null
          cta_size?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          link_target?: string | null
          link_text?: string | null
          link_url?: string | null
          title?: string
          updated_at?: string | null
          webp_url?: string | null
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          image_url: string
          product_id: string
          sort_order: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url: string
          product_id: string
          sort_order?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url?: string
          product_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          color: string | null
          compare_price: number | null
          created_at: string
          id: string
          price: number
          product_id: string
          size: string | null
          sku: string
          stock: number
          updated_at: string
        }
        Insert: {
          color?: string | null
          compare_price?: number | null
          created_at?: string
          id?: string
          price: number
          product_id: string
          size?: string | null
          sku: string
          stock?: number
          updated_at?: string
        }
        Update: {
          color?: string | null
          compare_price?: number | null
          created_at?: string
          id?: string
          price?: number
          product_id?: string
          size?: string | null
          sku?: string
          stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          created_at: string
          description: string | null
          featured: boolean | null
          handle: string
          id: string
          is_active: boolean
          primary_category: string
          seo_description: string | null
          seo_title: string | null
          subcategory: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          brand?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          handle: string
          id?: string
          is_active?: boolean
          primary_category: string
          seo_description?: string | null
          seo_title?: string | null
          subcategory: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          brand?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          handle?: string
          id?: string
          is_active?: boolean
          primary_category?: string
          seo_description?: string | null
          seo_title?: string | null
          subcategory?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
