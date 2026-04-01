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
      budgets: {
        Row: {
          amount: number
          category: string
          created_at: string
          id: string
          updated_at: string
          user_id: string | null
          year: number
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string | null
          year: number
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string | null
          year?: number
        }
        Relationships: []
      }
      expenses: {
        Row: {
          category: string
          created_at: string
          id: string
          items: Json
          month: string
          updated_at: string
          user_id: string | null
          year: number
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          items?: Json
          month: string
          updated_at?: string
          user_id?: string | null
          year: number
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          items?: Json
          month?: string
          updated_at?: string
          user_id?: string | null
          year?: number
        }
        Relationships: []
      }
      group_expenses: {
        Row: {
          added_by: string
          amount: number
          category: string
          created_at: string
          description: string | null
          expense_date: string
          group_id: string
          id: string
          receipt_url: string | null
          spent_by: string
          updated_at: string
        }
        Insert: {
          added_by: string
          amount: number
          category: string
          created_at?: string
          description?: string | null
          expense_date?: string
          group_id: string
          id?: string
          receipt_url?: string | null
          spent_by: string
          updated_at?: string
        }
        Update: {
          added_by?: string
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          expense_date?: string
          group_id?: string
          id?: string
          receipt_url?: string | null
          spent_by?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_expenses_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "investment_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_investments: {
        Row: {
          added_by: string
          amount: number
          created_at: string
          description: string | null
          group_id: string
          id: string
          invested_date: string
          member_email: string | null
          member_name: string
          updated_at: string
        }
        Insert: {
          added_by: string
          amount: number
          created_at?: string
          description?: string | null
          group_id: string
          id?: string
          invested_date?: string
          member_email?: string | null
          member_name: string
          updated_at?: string
        }
        Update: {
          added_by?: string
          amount?: number
          created_at?: string
          description?: string | null
          group_id?: string
          id?: string
          invested_date?: string
          member_email?: string | null
          member_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_investments_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "investment_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          created_at: string
          email: string
          group_id: string
          id: string
          invited_by: string
          permissions: Database["public"]["Enums"]["group_permission"][]
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          group_id: string
          id?: string
          invited_by: string
          permissions?: Database["public"]["Enums"]["group_permission"][]
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          group_id?: string
          id?: string
          invited_by?: string
          permissions?: Database["public"]["Enums"]["group_permission"][]
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "investment_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_completions: {
        Row: {
          completed_date: string
          created_at: string
          habit_id: string
          id: string
        }
        Insert: {
          completed_date: string
          created_at?: string
          habit_id: string
          id?: string
        }
        Update: {
          completed_date?: string
          created_at?: string
          habit_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_completions_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          best_streak: number
          category: string
          color: string
          created_at: string
          description: string | null
          icon: string
          id: string
          is_active: boolean
          name: string
          reminder_enabled: boolean
          reminder_time: string | null
          streak: number
          target_days: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          best_streak?: number
          category: string
          color?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          name: string
          reminder_enabled?: boolean
          reminder_time?: string | null
          streak?: number
          target_days?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          best_streak?: number
          category?: string
          color?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          reminder_enabled?: boolean
          reminder_time?: string | null
          streak?: number
          target_days?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      investment_groups: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      recurring_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          end_date: string | null
          frequency: string
          icon: string | null
          id: string
          is_active: boolean
          last_applied: string | null
          name: string
          notes: string | null
          start_date: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          end_date?: string | null
          frequency: string
          icon?: string | null
          id?: string
          is_active?: boolean
          last_applied?: string | null
          name: string
          notes?: string | null
          start_date: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          end_date?: string | null
          frequency?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          last_applied?: string | null
          name?: string
          notes?: string | null
          start_date?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_pins: {
        Row: {
          created_at: string
          failed_attempts: number
          id: string
          locked_until: string | null
          pin_hash: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          failed_attempts?: number
          id?: string
          locked_until?: string | null
          pin_hash: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          failed_attempts?: number
          id?: string
          locked_until?: string | null
          pin_hash?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_group_permission: {
        Args: {
          _group_id: string
          _permission: Database["public"]["Enums"]["group_permission"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_group_member: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      set_pin: { Args: { p_pin: string }; Returns: undefined }
      verify_pin: {
        Args: { p_pin: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      group_permission:
        | "view"
        | "add_expense"
        | "add_investment"
        | "edit"
        | "admin"
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
      group_permission: [
        "view",
        "add_expense",
        "add_investment",
        "edit",
        "admin",
      ],
    },
  },
} as const
