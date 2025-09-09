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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      bank_accounts: {
        Row: {
          account_holder_name: string
          account_number: string
          bank_code: string | null
          bank_name: string
          created_at: string
          id: string
          is_active: boolean | null
          subaccount_code: string | null
          subaccount_status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_holder_name: string
          account_number: string
          bank_code?: string | null
          bank_name: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          subaccount_code?: string | null
          subaccount_status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_holder_name?: string
          account_number?: string
          bank_code?: string | null
          bank_name?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          subaccount_code?: string | null
          subaccount_status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bulk_messaging_campaigns: {
        Row: {
          campaign_name: string
          completed_at: string | null
          created_at: string
          credits_used: number
          id: string
          message_template: string
          messages_delivered: number
          messages_failed: number
          messages_sent: number
          scheduled_at: string | null
          started_at: string | null
          status: string
          target_audience: Json
          total_recipients: number
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign_name: string
          completed_at?: string | null
          created_at?: string
          credits_used?: number
          id?: string
          message_template: string
          messages_delivered?: number
          messages_failed?: number
          messages_sent?: number
          scheduled_at?: string | null
          started_at?: string | null
          status?: string
          target_audience?: Json
          total_recipients?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign_name?: string
          completed_at?: string | null
          created_at?: string
          credits_used?: number
          id?: string
          message_template?: string
          messages_delivered?: number
          messages_failed?: number
          messages_sent?: number
          scheduled_at?: string | null
          started_at?: string | null
          status?: string
          target_audience?: Json
          total_recipients?: number
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
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          meta: Json | null
          reference_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          meta?: Json | null
          reference_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          meta?: Json | null
          reference_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      customer_authorizations: {
        Row: {
          authorization_code: string
          bank: string
          card_type: string
          created_at: string
          customer_email: string
          exp_month: string
          exp_year: string
          id: string
          last_4: string
          updated_at: string
        }
        Insert: {
          authorization_code: string
          bank: string
          card_type: string
          created_at?: string
          customer_email: string
          exp_month: string
          exp_year: string
          id?: string
          last_4: string
          updated_at?: string
        }
        Update: {
          authorization_code?: string
          bank?: string
          card_type?: string
          created_at?: string
          customer_email?: string
          exp_month?: string
          exp_year?: string
          id?: string
          last_4?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_sessions: {
        Row: {
          address: string | null
          created_at: string
          id: string
          ip_hash: string
          last_seen_at: string
          lat: number | null
          lng: number | null
          name: string | null
          phone: string | null
          updated_at: string
          user_agent_hash: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          ip_hash: string
          last_seen_at?: string
          lat?: number | null
          lng?: number | null
          name?: string | null
          phone?: string | null
          updated_at?: string
          user_agent_hash: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          ip_hash?: string
          last_seen_at?: string
          lat?: number | null
          lng?: number | null
          name?: string | null
          phone?: string | null
          updated_at?: string
          user_agent_hash?: string
        }
        Relationships: []
      }
      delivery_assignments: {
        Row: {
          accepted_at: string | null
          completed_at: string | null
          created_at: string
          customer_rating: number | null
          delivery_address: string | null
          delivery_fee_kobo: number | null
          delivery_lat: number
          delivery_lng: number
          delivery_notes: string | null
          distance_km: number | null
          estimated_duration_minutes: number | null
          id: string
          offered_at: string
          order_id: string | null
          pickup_address: string | null
          pickup_lat: number
          pickup_lng: number
          proof_of_delivery_url: string | null
          rider_session_id: string | null
          status: string | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          completed_at?: string | null
          created_at?: string
          customer_rating?: number | null
          delivery_address?: string | null
          delivery_fee_kobo?: number | null
          delivery_lat: number
          delivery_lng: number
          delivery_notes?: string | null
          distance_km?: number | null
          estimated_duration_minutes?: number | null
          id?: string
          offered_at?: string
          order_id?: string | null
          pickup_address?: string | null
          pickup_lat: number
          pickup_lng: number
          proof_of_delivery_url?: string | null
          rider_session_id?: string | null
          status?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          completed_at?: string | null
          created_at?: string
          customer_rating?: number | null
          delivery_address?: string | null
          delivery_fee_kobo?: number | null
          delivery_lat?: number
          delivery_lng?: number
          delivery_notes?: string | null
          distance_km?: number | null
          estimated_duration_minutes?: number | null
          id?: string
          offered_at?: string
          order_id?: string | null
          pickup_address?: string | null
          pickup_lat?: number
          pickup_lng?: number
          proof_of_delivery_url?: string | null
          rider_session_id?: string | null
          status?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_assignments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_assignments_rider_session_id_fkey"
            columns: ["rider_session_id"]
            isOneToOne: false
            referencedRelation: "rider_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_options: {
        Row: {
          created_at: string
          delivery_fee: number
          id: string
          is_active: boolean | null
          is_free_shipping: boolean | null
          location_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_fee?: number
          id?: string
          is_active?: boolean | null
          is_free_shipping?: boolean | null
          location_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_fee?: number
          id?: string
          is_active?: boolean | null
          is_free_shipping?: boolean | null
          location_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      manual_payment_confirmations: {
        Row: {
          amount_kobo: number
          bank_details: Json
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          currency: string
          customer_reference: string | null
          id: string
          order_id: string
          proof_image_url: string | null
          rejected_reason: string | null
          status: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          amount_kobo: number
          bank_details?: Json
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          currency?: string
          customer_reference?: string | null
          id?: string
          order_id: string
          proof_image_url?: string | null
          rejected_reason?: string | null
          status?: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          amount_kobo?: number
          bank_details?: Json
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          currency?: string
          customer_reference?: string | null
          id?: string
          order_id?: string
          proof_image_url?: string | null
          rejected_reason?: string | null
          status?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: []
      }
      marketplace_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          university_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          university_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          university_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_categories_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "university_marketplaces"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          dashboard_notifications: boolean | null
          email_notifications: boolean | null
          id: string
          updated_at: string
          user_id: string
          whatsapp_notifications: boolean | null
        }
        Insert: {
          created_at?: string
          dashboard_notifications?: boolean | null
          email_notifications?: boolean | null
          id?: string
          updated_at?: string
          user_id: string
          whatsapp_notifications?: boolean | null
        }
        Update: {
          created_at?: string
          dashboard_notifications?: boolean | null
          email_notifications?: boolean | null
          id?: string
          updated_at?: string
          user_id?: string
          whatsapp_notifications?: boolean | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          name: string
          order_id: string
          product_id: string | null
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          order_id: string
          product_id?: string | null
          quantity?: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
      orders_v2: {
        Row: {
          chat_id: string | null
          created_at: string
          currency: string
          customer_address: Json
          customer_lat: number | null
          customer_lng: number | null
          customer_name: string
          customer_phone: string
          delivery_fee: number
          distance_km: number | null
          eta_minutes: number | null
          id: string
          items: Json
          meta: Json | null
          notes: string | null
          payment_link: string | null
          payment_method: string | null
          payment_provider: string | null
          payment_reference: string | null
          service_fee: number
          status: string
          store_id: string
          subtotal: number
          surge_multiplier: number
          total: number
          updated_at: string
          vendor_id: string
          whatsapp_message: string | null
        }
        Insert: {
          chat_id?: string | null
          created_at?: string
          currency?: string
          customer_address?: Json
          customer_lat?: number | null
          customer_lng?: number | null
          customer_name: string
          customer_phone: string
          delivery_fee?: number
          distance_km?: number | null
          eta_minutes?: number | null
          id?: string
          items?: Json
          meta?: Json | null
          notes?: string | null
          payment_link?: string | null
          payment_method?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          service_fee?: number
          status?: string
          store_id: string
          subtotal?: number
          surge_multiplier?: number
          total?: number
          updated_at?: string
          vendor_id: string
          whatsapp_message?: string | null
        }
        Update: {
          chat_id?: string | null
          created_at?: string
          currency?: string
          customer_address?: Json
          customer_lat?: number | null
          customer_lng?: number | null
          customer_name?: string
          customer_phone?: string
          delivery_fee?: number
          distance_km?: number | null
          eta_minutes?: number | null
          id?: string
          items?: Json
          meta?: Json | null
          notes?: string | null
          payment_link?: string | null
          payment_method?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          service_fee?: number
          status?: string
          store_id?: string
          subtotal?: number
          surge_multiplier?: number
          total?: number
          updated_at?: string
          vendor_id?: string
          whatsapp_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_v2_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_v2_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_reconciliation: {
        Row: {
          created_at: string
          id: string
          manual_confirmation_id: string | null
          notes: string | null
          order_id: string
          payment_method: string
          paystack_reference: string | null
          reconciled_amount_kobo: number
          reconciled_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          manual_confirmation_id?: string | null
          notes?: string | null
          order_id: string
          payment_method: string
          paystack_reference?: string | null
          reconciled_amount_kobo: number
          reconciled_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          manual_confirmation_id?: string | null
          notes?: string | null
          order_id?: string
          payment_method?: string
          paystack_reference?: string | null
          reconciled_amount_kobo?: number
          reconciled_by?: string | null
          status?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          meta: Json
          order_id: string
          provider: string
          received_at: string | null
          reference: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          meta?: Json
          order_id: string
          provider: string
          received_at?: string | null
          reference?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          meta?: Json
          order_id?: string
          provider?: string
          received_at?: string | null
          reference?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_v2"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          created_at: string | null
          id: string
          metric_type: string
          metric_value: number
          tags: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metric_type: string
          metric_value: number
          tags?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metric_type?: string
          metric_value?: number
          tags?: Json | null
        }
        Relationships: []
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
      product_analytics: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          product_id: string
          user_session_id: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          product_id: string
          user_session_id?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          product_id?: string
          user_session_id?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_analytics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_inquiries: {
        Row: {
          answer: string | null
          answered_at: string | null
          created_at: string
          id: string
          inquirer_id: string | null
          is_public: boolean | null
          product_id: string
          question: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          answer?: string | null
          answered_at?: string | null
          created_at?: string
          id?: string
          inquirer_id?: string | null
          is_public?: boolean | null
          product_id: string
          question: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          answer?: string | null
          answered_at?: string | null
          created_at?: string
          id?: string
          inquirer_id?: string | null
          is_public?: boolean | null
          product_id?: string
          question?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_inquiries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_ratings: {
        Row: {
          created_at: string | null
          helpful_votes: number | null
          id: string
          is_verified_purchase: boolean | null
          product_id: string | null
          rating: number | null
          review_images: Json | null
          review_text: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          helpful_votes?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          product_id?: string | null
          rating?: number | null
          review_images?: Json | null
          review_text?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          helpful_votes?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          product_id?: string | null
          rating?: number | null
          review_images?: Json | null
          review_text?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_ratings_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          marketplace_category_id: string | null
          name: string
          price: number
          status: string | null
          store_id: string
          university_marketplace_id: string | null
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
          marketplace_category_id?: string | null
          name: string
          price: number
          status?: string | null
          store_id: string
          university_marketplace_id?: string | null
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
          marketplace_category_id?: string | null
          name?: string
          price?: number
          status?: string | null
          store_id?: string
          university_marketplace_id?: string | null
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
            foreignKeyName: "products_marketplace_category_id_fkey"
            columns: ["marketplace_category_id"]
            isOneToOne: false
            referencedRelation: "marketplace_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_university_marketplace_id_fkey"
            columns: ["university_marketplace_id"]
            isOneToOne: false
            referencedRelation: "university_marketplaces"
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
          individual_store_enabled: boolean | null
          is_student_verified: boolean | null
          next_billing_date: string | null
          onboarding_email_sent: boolean | null
          paystack_customer_code: string | null
          paystack_subscription_code: string | null
          plan: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          setup_completed: boolean | null
          setup_completed_at: string | null
          student_verification_date: string | null
          subdomain: string | null
          subscription_created_at: string | null
          subscription_status: string | null
          subscription_updated_at: string | null
          university_email: string | null
          updated_at: string | null
        }
        Insert: {
          billing_cycle?: string | null
          created_at?: string | null
          email: string
          first_login_done?: boolean | null
          full_name?: string | null
          id: string
          individual_store_enabled?: boolean | null
          is_student_verified?: boolean | null
          next_billing_date?: string | null
          onboarding_email_sent?: boolean | null
          paystack_customer_code?: string | null
          paystack_subscription_code?: string | null
          plan?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          setup_completed?: boolean | null
          setup_completed_at?: string | null
          student_verification_date?: string | null
          subdomain?: string | null
          subscription_created_at?: string | null
          subscription_status?: string | null
          subscription_updated_at?: string | null
          university_email?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_cycle?: string | null
          created_at?: string | null
          email?: string
          first_login_done?: boolean | null
          full_name?: string | null
          id?: string
          individual_store_enabled?: boolean | null
          is_student_verified?: boolean | null
          next_billing_date?: string | null
          onboarding_email_sent?: boolean | null
          paystack_customer_code?: string | null
          paystack_subscription_code?: string | null
          plan?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          setup_completed?: boolean | null
          setup_completed_at?: string | null
          student_verification_date?: string | null
          subdomain?: string | null
          subscription_created_at?: string | null
          subscription_status?: string | null
          subscription_updated_at?: string | null
          university_email?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rider_assignments: {
        Row: {
          accepted_at: string | null
          assigned_at: string
          created_at: string
          eta_minutes: number | null
          id: string
          live_location_url: string | null
          order_id: string
          rider_id: string | null
          status: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          accepted_at?: string | null
          assigned_at?: string
          created_at?: string
          eta_minutes?: number | null
          id?: string
          live_location_url?: string | null
          order_id: string
          rider_id?: string | null
          status?: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          accepted_at?: string | null
          assigned_at?: string
          created_at?: string
          eta_minutes?: number | null
          id?: string
          live_location_url?: string | null
          order_id?: string
          rider_id?: string | null
          status?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rider_assignments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rider_assignments_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "riders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rider_assignments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rider_sessions: {
        Row: {
          created_at: string
          current_lat: number | null
          current_lng: number | null
          device_fingerprint: string
          id: string
          is_available: boolean
          last_seen_at: string
          phone: string
          rider_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          device_fingerprint: string
          id?: string
          is_available?: boolean
          last_seen_at?: string
          phone: string
          rider_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          device_fingerprint?: string
          id?: string
          is_available?: boolean
          last_seen_at?: string
          phone?: string
          rider_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      riders: {
        Row: {
          created_at: string
          current_lat: number | null
          current_lng: number | null
          full_name: string
          id: string
          phone: string
          rating: number | null
          status: string
          updated_at: string
          vehicle_type: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          full_name: string
          id?: string
          phone: string
          rating?: number | null
          status?: string
          updated_at?: string
          vehicle_type?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          full_name?: string
          id?: string
          phone?: string
          rating?: number | null
          status?: string
          updated_at?: string
          vehicle_type?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "riders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      selling_methods: {
        Row: {
          created_at: string
          id: string
          method: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          method: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          method?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          base_location_address: string | null
          base_location_lat: number | null
          base_location_lng: number | null
          created_at: string
          delivery_pricing: Json
          google_maps_enabled: boolean
          id: string
          store_id: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          base_location_address?: string | null
          base_location_lat?: number | null
          base_location_lng?: number | null
          created_at?: string
          delivery_pricing?: Json
          google_maps_enabled?: boolean
          id?: string
          store_id: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          base_location_address?: string | null
          base_location_lat?: number | null
          base_location_lng?: number | null
          created_at?: string
          delivery_pricing?: Json
          google_maps_enabled?: boolean
          id?: string
          store_id?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_settings_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: true
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_settings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          use_ai_chat: boolean | null
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
          use_ai_chat?: boolean | null
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
          use_ai_chat?: boolean | null
          vendor_id?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      student_verifications: {
        Row: {
          created_at: string | null
          department: string | null
          graduation_year: number | null
          id: string
          student_id: string
          university_id: string | null
          updated_at: string | null
          user_id: string | null
          verification_status: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          graduation_year?: number | null
          id?: string
          student_id: string
          university_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          graduation_year?: number | null
          id?: string
          student_id?: string
          university_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_verifications_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "university_marketplaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_verifications_enhanced: {
        Row: {
          created_at: string
          department: string | null
          id: string
          level_of_study: string | null
          student_id: string
          university_email: string
          updated_at: string
          user_id: string
          verification_code: string | null
          verification_status: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          department?: string | null
          id?: string
          level_of_study?: string | null
          student_id: string
          university_email: string
          updated_at?: string
          user_id: string
          verification_code?: string | null
          verification_status?: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          department?: string | null
          id?: string
          level_of_study?: string | null
          student_id?: string
          university_email?: string
          updated_at?: string
          user_id?: string
          verification_code?: string | null
          verification_status?: string
          verified_at?: string | null
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
      system_audit_log: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      university_marketplaces: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_credit_balances: {
        Row: {
          current_balance: number
          last_updated_at: string
          total_purchased: number
          total_used: number
          user_id: string
        }
        Insert: {
          current_balance?: number
          last_updated_at?: string
          total_purchased?: number
          total_used?: number
          user_id: string
        }
        Update: {
          current_balance?: number
          last_updated_at?: string
          total_purchased?: number
          total_used?: number
          user_id?: string
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
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_vendor_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_vendor_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_vendor_id?: string
          id?: string
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
      user_wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_ratings: {
        Row: {
          created_at: string | null
          customer_id: string | null
          id: string
          order_id: string | null
          rating: number | null
          review_text: string | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          order_id?: string | null
          rating?: number | null
          review_text?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          order_id?: string | null
          rating?: number | null
          review_text?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_ratings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_ratings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wa_chats: {
        Row: {
          chat_id: string
          context: Json | null
          created_at: string | null
          expires_at: string | null
          id: string
          last_message_at: string | null
          state: string
          store_id: string
          updated_at: string | null
        }
        Insert: {
          chat_id: string
          context?: Json | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          last_message_at?: string | null
          state?: string
          store_id: string
          updated_at?: string | null
        }
        Update: {
          chat_id?: string
          context?: Json | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          last_message_at?: string | null
          state?: string
          store_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wa_chats_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      wa_sessions: {
        Row: {
          created_at: string | null
          id: string
          last_seen: string | null
          session_json: Json | null
          status: string | null
          store_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_seen?: string | null
          session_json?: Json | null
          status?: string | null
          store_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_seen?: string | null
          session_json?: Json | null
          status?: string | null
          store_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wa_sessions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          created_at: string
          direction: string
          from_number: string
          id: string
          media_url: string | null
          message: string | null
          order_id: string | null
          session_id: string | null
          status: string | null
          timestamp: string
          to_number: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          direction: string
          from_number: string
          id?: string
          media_url?: string | null
          message?: string | null
          order_id?: string | null
          session_id?: string | null
          status?: string | null
          timestamp?: string
          to_number: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          direction?: string
          from_number?: string
          id?: string
          media_url?: string | null
          message?: string | null
          order_id?: string | null
          session_id?: string | null
          status?: string | null
          timestamp?: string
          to_number?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bootstrap_admin_user: {
        Args: { user_email: string }
        Returns: boolean
      }
      calculate_trending_score: {
        Args: { days_back?: number; product_id: string }
        Returns: number
      }
      check_rate_limit: {
        Args: {
          client_ip: unknown
          max_attempts?: number
          user_email: string
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
      get_customer_authorization: {
        Args: { email: string }
        Returns: {
          authorization_code: string
          bank: string
          card_type: string
          customer_email: string
          exp_month: string
          exp_year: string
          last_4: string
        }[]
      }
      get_unified_orders: {
        Args: { vendor_id_param: string }
        Returns: {
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          id: string
          source_table: string
          status: string
          store_id: string
          total_amount: number
          updated_at: string
          vendor_id: string
        }[]
      }
      get_vendor_analytics: {
        Args: { vendor_id_param: string }
        Returns: {
          avg_order_value: number
          last_order_date: string
          orders_last_30d: number
          orders_last_7d: number
          revenue_last_30d: number
          revenue_last_7d: number
          total_orders: number
          total_revenue: number
          vendor_id: string
        }[]
      }
      log_performance_metric: {
        Args: {
          metric_type_param: string
          metric_value_param: number
          tags_param?: Json
        }
        Returns: undefined
      }
      log_security_event: {
        Args: {
          event_details?: Json
          event_type: string
          target_user_id?: string
        }
        Returns: undefined
      }
      refresh_vendor_analytics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      send_email_reminders: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_user_role: {
        Args: {
          new_role: Database["public"]["Enums"]["user_role"]
          target_user_id: string
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
