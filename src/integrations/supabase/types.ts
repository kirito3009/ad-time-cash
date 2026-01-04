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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ads: {
        Row: {
          ad_type: string
          created_at: string | null
          description: string | null
          duration: number
          id: string
          image_url: string | null
          is_active: boolean | null
          link_url: string | null
          placement: string[]
          priority: number
          reward_amount: number
          title: string
          video_url: string
        }
        Insert: {
          ad_type?: string
          created_at?: string | null
          description?: string | null
          duration: number
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_url?: string | null
          placement?: string[]
          priority?: number
          reward_amount: number
          title: string
          video_url: string
        }
        Update: {
          ad_type?: string
          created_at?: string | null
          description?: string | null
          duration?: number
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_url?: string | null
          placement?: string[]
          priority?: number
          reward_amount?: number
          title?: string
          video_url?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ads_watched: number | null
          avatar_url: string | null
          created_at: string | null
          current_streak: number | null
          full_name: string | null
          id: string
          last_streak_date: string | null
          longest_streak: number | null
          total_earnings: number | null
          total_watch_time: number | null
          updated_at: string | null
        }
        Insert: {
          ads_watched?: number | null
          avatar_url?: string | null
          created_at?: string | null
          current_streak?: number | null
          full_name?: string | null
          id: string
          last_streak_date?: string | null
          longest_streak?: number | null
          total_earnings?: number | null
          total_watch_time?: number | null
          updated_at?: string | null
        }
        Update: {
          ads_watched?: number | null
          avatar_url?: string | null
          created_at?: string | null
          current_streak?: number | null
          full_name?: string | null
          id?: string
          last_streak_date?: string | null
          longest_streak?: number | null
          total_earnings?: number | null
          total_watch_time?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action_type: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          admin_reply: string | null
          created_at: string | null
          id: string
          message: string
          status: string | null
          subject: string
          user_id: string
        }
        Insert: {
          admin_reply?: string | null
          created_at?: string | null
          id?: string
          message: string
          status?: string | null
          subject: string
          user_id: string
        }
        Update: {
          admin_reply?: string | null
          created_at?: string | null
          id?: string
          message?: string
          status?: string | null
          subject?: string
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
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      watch_history: {
        Row: {
          ad_id: string
          completed: boolean | null
          created_at: string | null
          earned_amount: number
          id: string
          user_id: string
          watch_time: number
        }
        Insert: {
          ad_id: string
          completed?: boolean | null
          created_at?: string | null
          earned_amount: number
          id?: string
          user_id: string
          watch_time: number
        }
        Update: {
          ad_id?: string
          completed?: boolean | null
          created_at?: string | null
          earned_amount?: number
          id?: string
          user_id?: string
          watch_time?: number
        }
        Relationships: [
          {
            foreignKeyName: "watch_history_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawals: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string | null
          id: string
          payment_details: string | null
          payment_method: string | null
          processed_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string | null
          id?: string
          payment_details?: string | null
          payment_method?: string | null
          processed_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string | null
          id?: string
          payment_details?: string | null
          payment_method?: string | null
          processed_at?: string | null
          status?: string | null
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
          p_action_type: string
          p_max_count: number
          p_user_id: string
          p_window_minutes: number
        }
        Returns: boolean
      }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      decrypt_payment_details: {
        Args: { encrypted_data: string }
        Returns: string
      }
      encrypt_payment_details: {
        Args: { payment_data: string }
        Returns: string
      }
      get_support_message_sender_info: {
        Args: { _user_id: string }
        Returns: {
          email: string
          full_name: string
        }[]
      }
      get_user_email: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      record_rate_limit: {
        Args: { p_action_type: string; p_user_id: string }
        Returns: undefined
      }
      update_user_streak: { Args: { p_user_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
