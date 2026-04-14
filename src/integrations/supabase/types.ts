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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_auto_withdraw: {
        Row: {
          admin_id: string
          cold_wallet: string
          created_at: string
          enabled: boolean
          frequency: string
          id: string
          last_withdraw_at: string | null
          min_amount: number
        }
        Insert: {
          admin_id: string
          cold_wallet: string
          created_at?: string
          enabled?: boolean
          frequency?: string
          id?: string
          last_withdraw_at?: string | null
          min_amount?: number
        }
        Update: {
          admin_id?: string
          cold_wallet?: string
          created_at?: string
          enabled?: boolean
          frequency?: string
          id?: string
          last_withdraw_at?: string | null
          min_amount?: number
        }
        Relationships: []
      }
      anti_phishing_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      dead_drop_locations: {
        Row: {
          created_at: string
          id: string
          instructions: string | null
          latitude: number
          longitude: number
          order_id: string
          photo_url: string | null
          picked_up: boolean
          vendor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          instructions?: string | null
          latitude: number
          longitude: number
          order_id: string
          photo_url?: string | null
          picked_up?: boolean
          vendor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          instructions?: string | null
          latitude?: number
          longitude?: number
          order_id?: string
          photo_url?: string | null
          picked_up?: boolean
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dead_drop_locations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      dispute_messages: {
        Row: {
          created_at: string
          dispute_id: string
          from_user_id: string
          id: string
          text: string
        }
        Insert: {
          created_at?: string
          dispute_id: string
          from_user_id: string
          id?: string
          text: string
        }
        Update: {
          created_at?: string
          dispute_id?: string
          from_user_id?: string
          id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispute_messages_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          amount: number
          buyer_id: string
          created_at: string
          id: string
          product_name: string
          seller_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          buyer_id: string
          created_at?: string
          id?: string
          product_name: string
          seller_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          buyer_id?: string
          created_at?: string
          id?: string
          product_name?: string
          seller_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      encrypted_messages: {
        Row: {
          created_at: string
          encrypted_text: string
          id: string
          iv: string
          order_id: string
          receiver_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          encrypted_text: string
          id?: string
          iv: string
          order_id: string
          receiver_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          encrypted_text?: string
          id?: string
          iv?: string
          order_id?: string
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "encrypted_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      escrow_pool: {
        Row: {
          amount: number
          buyer_id: string
          commission: number
          created_at: string
          id: string
          order_id: string | null
          released_at: string | null
          seller_id: string
          status: string
        }
        Insert: {
          amount?: number
          buyer_id: string
          commission?: number
          created_at?: string
          id?: string
          order_id?: string | null
          released_at?: string | null
          seller_id: string
          status?: string
        }
        Update: {
          amount?: number
          buyer_id?: string
          commission?: number
          created_at?: string
          id?: string
          order_id?: string | null
          released_at?: string | null
          seller_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "escrow_pool_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          buyer_hash: string | null
          buyer_id: string
          created_at: string
          delivery_confirmed: boolean
          delivery_confirmed_at: string | null
          delivery_method: string
          id: string
          ltc_address: string | null
          product_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          buyer_hash?: string | null
          buyer_id: string
          created_at?: string
          delivery_confirmed?: boolean
          delivery_confirmed_at?: string | null
          delivery_method?: string
          id?: string
          ltc_address?: string | null
          product_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          buyer_hash?: string | null
          buyer_id?: string
          created_at?: string
          delivery_confirmed?: boolean
          delivery_confirmed_at?: string | null
          delivery_method?: string
          id?: string
          ltc_address?: string | null
          product_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_addresses: {
        Row: {
          address: string
          amount: number
          created_at: string
          expires_at: string
          id: string
          order_id: string | null
          used: boolean
          user_id: string
        }
        Insert: {
          address: string
          amount?: number
          created_at?: string
          expires_at: string
          id?: string
          order_id?: string | null
          used?: boolean
          user_id: string
        }
        Update: {
          address?: string
          amount?: number
          created_at?: string
          expires_at?: string
          id?: string
          order_id?: string | null
          used?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_addresses_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          commission_rate: number | null
          created_at: string
          delivery_data: string | null
          description: string | null
          id: string
          image_emoji: string | null
          image_url: string | null
          name: string
          price: number
          stock: number
          tracking_number: string | null
          type: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          category?: string | null
          commission_rate?: number | null
          created_at?: string
          delivery_data?: string | null
          description?: string | null
          id?: string
          image_emoji?: string | null
          image_url?: string | null
          name: string
          price?: number
          stock?: number
          tracking_number?: string | null
          type?: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          category?: string | null
          commission_rate?: number | null
          created_at?: string
          delivery_data?: string | null
          description?: string | null
          id?: string
          image_emoji?: string | null
          image_url?: string | null
          name?: string
          price?: number
          stock?: number
          tracking_number?: string | null
          type?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          anonymize_after: string | null
          created_at: string
          device: string | null
          id: string
          ip: string | null
          success: boolean
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          anonymize_after?: string | null
          created_at?: string
          device?: string | null
          id?: string
          ip?: string | null
          success?: boolean
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          anonymize_after?: string | null
          created_at?: string
          device?: string | null
          id?: string
          ip?: string | null
          success?: boolean
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      shipping_tracking: {
        Row: {
          carrier: string
          created_at: string
          events: Json | null
          id: string
          last_checked_at: string | null
          order_id: string
          status: string
          tracking_code: string
          updated_at: string
        }
        Insert: {
          carrier?: string
          created_at?: string
          events?: Json | null
          id?: string
          last_checked_at?: string | null
          order_id: string
          status?: string
          tracking_code: string
          updated_at?: string
        }
        Update: {
          carrier?: string
          created_at?: string
          events?: Json | null
          id?: string
          last_checked_at?: string | null
          order_id?: string
          status?: string
          tracking_code?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipping_tracking_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendor_bonds: {
        Row: {
          amount: number
          created_at: string
          deposit_address: string | null
          id: string
          paid_at: string | null
          required_amount: number
          status: string
          vendor_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          deposit_address?: string | null
          id?: string
          paid_at?: string | null
          required_amount?: number
          status?: string
          vendor_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          deposit_address?: string | null
          id?: string
          paid_at?: string | null
          required_amount?: number
          status?: string
          vendor_id?: string
        }
        Relationships: []
      }
      vendor_ratings: {
        Row: {
          buyer_id: string
          comment: string | null
          created_at: string
          id: string
          order_id: string
          rating: number
          vendor_id: string
        }
        Insert: {
          buyer_id: string
          comment?: string | null
          created_at?: string
          id?: string
          order_id: string
          rating: number
          vendor_id: string
        }
        Update: {
          buyer_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          order_id?: string
          rating?: number
          vendor_id?: string
        }
        Relationships: []
      }
      vendor_wallets: {
        Row: {
          available: number
          bond_amount: number
          bond_status: string
          commission: number
          id: string
          pending: number
          total: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          available?: number
          bond_amount?: number
          bond_status?: string
          commission?: number
          id?: string
          pending?: number
          total?: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          available?: number
          bond_amount?: number
          bond_status?: string
          commission?: number
          id?: string
          pending?: number
          total?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: []
      }
      withdraw_history: {
        Row: {
          admin_id: string
          amount: number
          created_at: string
          id: string
          status: string
          wallet_address: string
        }
        Insert: {
          admin_id: string
          amount: number
          created_at?: string
          id?: string
          status?: string
          wallet_address: string
        }
        Update: {
          admin_id?: string
          amount?: number
          created_at?: string
          id?: string
          status?: string
          wallet_address?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      anonymize_completed_order: {
        Args: { _order_id: string }
        Returns: undefined
      }
      anonymize_security_logs: { Args: never; Returns: undefined }
      assign_role_on_signup: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: undefined
      }
      cleanup_expired_payment_addresses: { Args: never; Returns: undefined }
      confirm_delivery: { Args: { _order_id: string }; Returns: Json }
      generate_payment_address: {
        Args: { _amount: number; _order_id: string }
        Returns: Json
      }
      get_commission_rate: {
        Args: { _category?: string; _product_type: string }
        Returns: number
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_vendor_rating: { Args: { _vendor_id: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      panic_destroy: { Args: never; Returns: Json }
      process_order_payment: {
        Args: { _ltc_address: string; _order_id: string }
        Returns: Json
      }
      release_escrow: { Args: { _escrow_id: string }; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "vendor" | "buyer"
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
      app_role: ["admin", "vendor", "buyer"],
    },
  },
} as const
