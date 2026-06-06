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
      group_stage_predictions: {
        Row: {
          created_at: string | null
          group: string
          id: string
          points: number
          predicted_order: number[]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          group: string
          id?: string
          points?: number
          predicted_order: number[]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          group?: string
          id?: string
          points?: number
          predicted_order?: number[]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_stage_predictions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_standings: {
        Row: {
          drawn: number
          goal_difference: number | null
          goals_against: number
          goals_for: number
          group_name: string
          id: number
          lost: number
          played: number
          points: number | null
          position: number
          team_api_id: number
          updated_at: string | null
          won: number
        }
        Insert: {
          drawn?: number
          goal_difference?: number | null
          goals_against?: number
          goals_for?: number
          group_name: string
          id?: number
          lost?: number
          played?: number
          points?: number | null
          position?: number
          team_api_id: number
          updated_at?: string | null
          won?: number
        }
        Update: {
          drawn?: number
          goal_difference?: number | null
          goals_against?: number
          goals_for?: number
          group_name?: string
          id?: number
          lost?: number
          played?: number
          points?: number | null
          position?: number
          team_api_id?: number
          updated_at?: string | null
          won?: number
        }
        Relationships: [
          {
            foreignKeyName: "group_standings_team_api_id_fkey"
            columns: ["team_api_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["api_id"]
          },
        ]
      }
      knockout_predictions: {
        Row: {
          created_at: string | null
          id: string
          last_calculated_at: string | null
          match_external_id: number
          points: number
          predicted_winner: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_calculated_at?: string | null
          match_external_id: number
          points?: number
          predicted_winner: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_calculated_at?: string | null
          match_external_id?: number
          points?: number
          predicted_winner?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knockout_predictions_match_external_id_fkey"
            columns: ["match_external_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["external_id"]
          },
          {
            foreignKeyName: "knockout_predictions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          away_score: number | null
          away_team_id: number | null
          away_team_name: string | null
          external_id: number
          group: string | null
          home_score: number | null
          home_team_id: number | null
          home_team_name: string | null
          id: string
          minute: number | null
          stage: string
          status: string
          updated_at: string | null
          utc_date: string
          winner: string | null
        }
        Insert: {
          away_score?: number | null
          away_team_id?: number | null
          away_team_name?: string | null
          external_id: number
          group?: string | null
          home_score?: number | null
          home_team_id?: number | null
          home_team_name?: string | null
          id?: string
          minute?: number | null
          stage: string
          status?: string
          updated_at?: string | null
          utc_date: string
          winner?: string | null
        }
        Update: {
          away_score?: number | null
          away_team_id?: number | null
          away_team_name?: string | null
          external_id?: number
          group?: string | null
          home_score?: number | null
          home_team_id?: number | null
          home_team_name?: string | null
          id?: string
          minute?: number | null
          stage?: string
          status?: string
          updated_at?: string | null
          utc_date?: string
          winner?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string
          created_at: string
          display_name: string
          email: string
          favorite_team: number
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url: string
          created_at?: string
          display_name: string
          email: string
          favorite_team: number
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string
          created_at?: string
          display_name?: string
          email?: string
          favorite_team?: number
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      score_predictions: {
        Row: {
          created_at: string | null
          id: string
          last_calculated_at: string | null
          match_external_id: number
          points: number
          predicted_away: number
          predicted_home: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_calculated_at?: string | null
          match_external_id: number
          points?: number
          predicted_away: number
          predicted_home: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_calculated_at?: string | null
          match_external_id?: number
          points?: number
          predicted_away?: number
          predicted_home?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "score_predictions_match_external_id_fkey"
            columns: ["match_external_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["external_id"]
          },
          {
            foreignKeyName: "score_predictions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          api_id: number
          created_at: string | null
          crest_url: string | null
          group_name: string | null
          id: number
          name: string
          short_name: string | null
          tla: string | null
          updated_at: string | null
        }
        Insert: {
          api_id: number
          created_at?: string | null
          crest_url?: string | null
          group_name?: string | null
          id?: number
          name: string
          short_name?: string | null
          tla?: string | null
          updated_at?: string | null
        }
        Update: {
          api_id?: number
          created_at?: string | null
          crest_url?: string | null
          group_name?: string | null
          id?: number
          name?: string
          short_name?: string | null
          tla?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_scores: {
        Row: {
          feature1_points: number
          feature2_points: number
          total_points: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          feature1_points?: number
          feature2_points?: number
          total_points?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          feature1_points?: number
          feature2_points?: number
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
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
      group_stage_open: { Args: never; Returns: boolean }
      knockout_stage_open: { Args: never; Returns: boolean }
      match_open: { Args: { match_ext_id: number }; Returns: boolean }
      recalculate_group_standings: { Args: never; Returns: undefined }
      rollup_user_scores: { Args: never; Returns: undefined }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
