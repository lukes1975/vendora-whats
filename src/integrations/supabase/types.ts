export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          sort_order: number | null
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          sort_order?: number | null
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          sort_order?: number | null
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_suggestions: {
        Row: {
          id: string
          submitted_at: string
          suggestion_text: string
          vendor_id: string
        }
        Insert: {
          id?: string
          submitted_at?: string
          suggestion_text: string
          vendor_id: string
        }
        Update: {
          id?: string
          submitted_at?: string
          suggestion_text?: string
          vendor_id?: string
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          attempt_time: string
          email: string
          id: string
          ip_address: unknown | null
          success: boolean
          user_agent: string | null
        }
        Insert: {
          attempt_time?: string
          email: string
          id?: string
          ip_address?: unknown | null
          success?: boolean
          user_agent?: string | null
        }
        Update: {
          attempt_time?: string
          email?: string
          id?: string
          ip_address?: unknown | null
          success?: boolean
          user_agent?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string
          id: string
          order_notes: string | null
          product_id: string
          quantity: number
          status: string | null
          store_id: string
          total_price: number
          unit_price: number
          updated_at: string | null
          vendor_id: string
          whatsapp_message: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          id?: string
          order_notes?: string | null
          product_id: string
          quantity?: number
          status?: string | null
          store_id: string
          total_price: number
          unit_price: number
          updated_at?: string | null
          vendor_id: string
          whatsapp_message?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          id?: string
          order_notes?: string | null
          product_id?: string
          quantity?: number
          status?: string | null
          store_id?: string
          total_price?: number
          unit_price?: number
          updated_at?: string | null
          vendor_id?: string
          whatsapp_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      pro_interest: {
        Row: {
          email: string
          id: string
          name: string
          submitted_at: string
          user_id: string | null
          whatsapp: string | null
        }
        Insert: {
          email: string
          id?: string
          name: string
          submitted_at?: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          email?: string
          id?: string
          name?: string
          submitted_at?: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          status: string | null
          store_id: string
          updated_at: string | null
          vendor_id: string
          views: number | null
          whatsapp_clicks: number | null
        }
        Insert: {
          category?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          status?: string | null
          store_id: string
          updated_at?: string | null
          vendor_id: string
          views?: number | null
          whatsapp_clicks?: number | null
        }
        Update: {
          category?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          status?: string | null
          store_id?: string
          updated_at?: string | null
          vendor_id?: string
          views?: number | null
          whatsapp_clicks?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          billing_cycle: string | null
          created_at: string | null
          email: string
          first_login_done: boolean | null
          full_name: string | null
          id: string
          next_billing_date: string | null
          onboarding_email_sent: boolean | null
          paystack_customer_code: string | null
          paystack_subscription_code: string | null
          plan: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          setup_completed: boolean | null
          setup_completed_at: string | null
          subdomain: string | null
          subscription_created_at: string | null
          subscription_status: string | null
          subscription_updated_at: string | null
          updated_at: string | null
        }
        Insert: {
          billing_cycle?: string | null
          created_at?: string | null
          email: string
          first_login_done?: boolean | null
          full_name?: string | null
          id: string
          next_billing_date?: string | null
          onboarding_email_sent?: boolean | null
          paystack_customer_code?: string | null
          paystack_subscription_code?: string | null
          plan?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          setup_completed?: boolean | null
          setup_completed_at?: string | null
          subdomain?: string | null
          subscription_created_at?: string | null
          subscription_status?: string | null
          subscription_updated_at?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_cycle?: string | null
          created_at?: string | null
          email?: string
          first_login_done?: boolean | null
          full_name?: string | null
          id?: string
          next_billing_date?: string | null
          onboarding_email_sent?: boolean | null
          paystack_customer_code?: string | null
          paystack_subscription_code?: string | null
          plan?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          setup_completed?: boolean | null
          setup_completed_at?: string | null
          subdomain?: string | null
          subscription_created_at?: string | null
          subscription_status?: string | null
          subscription_updated_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          created_at: string | null
          event_details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      stores: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          slug: string | null
          updated_at: string | null
          vendor_id: string
          whatsapp_number: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          slug?: string | null
          updated_at?: string | null
          vendor_id: string
          whatsapp_number?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          slug?: string | null
          updated_at?: string | null
          vendor_id?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          amount: number
          billing_cycle: string
          created_at: string | null
          id: string
          is_active: boolean | null
          paystack_plan_code: string
          plan_name: string
        }
        Insert: {
          amount: number
          billing_cycle: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          paystack_plan_code: string
          plan_name: string
        }
        Update: {
          amount?: number
          billing_cycle?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          paystack_plan_code?: string
          plan_name?: string
        }
        Relationships: []
      }
      user_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          session_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          session_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_metrics: {
        Row: {
          created_at: string
          first_product_added_at: string | null
          first_sale_at: string | null
          first_share_at: string | null
          id: string
          last_active_at: string | null
          referral_code: string | null
          referred_by: string | null
          signup_date: string
          store_created_at: string | null
          total_orders: number | null
          total_products: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          first_product_added_at?: string | null
          first_sale_at?: string | null
          first_share_at?: string | null
          id?: string
          last_active_at?: string | null
          referral_code?: string | null
          referred_by?: string | null
          signup_date: string
          store_created_at?: string | null
          total_orders?: number | null
          total_products?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          first_product_added_at?: string | null
          first_sale_at?: string | null
          first_share_at?: string | null
          id?: string
          last_active_at?: string | null
          referral_code?: string | null
          referred_by?: string | null
          signup_date?: string
          store_created_at?: string | null
          total_orders?: number | null
          total_products?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_setup_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          section_id: string
          task_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          section_id: string
          task_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          section_id?: string
          task_id?: string
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
      check_rate_limit: {
        Args: {
          user_email: string
          client_ip: unknown
          max_attempts?: number
          window_minutes?: number
        }
        Returns: boolean
      }
      generate_referral_code: {
        Args: { user_email: string }
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      log_security_event: {
        Args: {
          event_type: string
          event_details?: Json
          target_user_id?: string
        }
        Returns: undefined
      }
      send_email_reminders: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_user_role: {
        Args: {
          target_user_id: string
          new_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      validate_subdomain: {
        Args: { subdomain_input: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "vendor" | "admin"
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
      user_role: ["vendor", "admin"],
    },
  },
} as const
