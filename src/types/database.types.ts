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
      group_stage_prediction_picks: {
        Row: {
          id: string
          is_correct: boolean
          predicted_position: number
          prediction_id: string
          team_id: number
        }
        Insert: {
          id?: string
          is_correct?: boolean
          predicted_position: number
          prediction_id: string
          team_id: number
        }
        Update: {
          id?: string
          is_correct?: boolean
          predicted_position?: number
          prediction_id?: string
          team_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "group_stage_prediction_picks_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "group_stage_predictions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_stage_prediction_picks_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      group_stage_predictions: {
        Row: {
          group_name: string
          group_points: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          group_name: string
          group_points?: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          group_name?: string
          group_points?: number
          id?: string
          updated_at?: string
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
          booking_points: number
          drawn: number
          goal_difference: number
          goals_against: number
          goals_for: number
          group_name: string
          group_position: number | null
          lost: number
          played: number
          points: number
          team_id: number
          won: number
        }
        Insert: {
          booking_points?: number
          drawn?: number
          goal_difference?: number
          goals_against?: number
          goals_for?: number
          group_name: string
          group_position?: number | null
          lost?: number
          played?: number
          points?: number
          team_id: number
          won?: number
        }
        Update: {
          booking_points?: number
          drawn?: number
          goal_difference?: number
          goals_against?: number
          goals_for?: number
          group_name?: string
          group_position?: number | null
          lost?: number
          played?: number
          points?: number
          team_id?: number
          won?: number
        }
        Relationships: [
          {
            foreignKeyName: "group_standings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      knockout_predictions: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean
          match_id: number
          points_awarded: number
          predicted_winner_id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct?: boolean
          match_id: number
          points_awarded?: number
          predicted_winner_id: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean
          match_id?: number
          points_awarded?: number
          predicted_winner_id?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knockout_predictions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knockout_predictions_predicted_winner_id_fkey"
            columns: ["predicted_winner_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
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
      knockout_round_points: {
        Row: {
          points: number
          stage: string
        }
        Insert: {
          points: number
          stage: string
        }
        Update: {
          points?: number
          stage?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          away_booking_score: number | null
          away_team_id: number | null
          duration: Database["public"]["Enums"]["match_duration"] | null
          full_time_away: number | null
          full_time_home: number | null
          group_name: string | null
          half_time_away: number | null
          half_time_home: number | null
          home_booking_score: number | null
          home_team_id: number | null
          id: number
          matchday: number | null
          next_match_id: number | null
          next_match_loser_id: number | null
          next_match_loser_slot: string | null
          next_match_slot: string | null
          stage: string
          status: Database["public"]["Enums"]["match_status"] | null
          utc_date: string
          winner_id: number | null
        }
        Insert: {
          away_booking_score?: number | null
          away_team_id?: number | null
          duration?: Database["public"]["Enums"]["match_duration"] | null
          full_time_away?: number | null
          full_time_home?: number | null
          group_name?: string | null
          half_time_away?: number | null
          half_time_home?: number | null
          home_booking_score?: number | null
          home_team_id?: number | null
          id: number
          matchday?: number | null
          next_match_id?: number | null
          next_match_loser_id?: number | null
          next_match_loser_slot?: string | null
          next_match_slot?: string | null
          stage: string
          status?: Database["public"]["Enums"]["match_status"] | null
          utc_date: string
          winner_id?: number | null
        }
        Update: {
          away_booking_score?: number | null
          away_team_id?: number | null
          duration?: Database["public"]["Enums"]["match_duration"] | null
          full_time_away?: number | null
          full_time_home?: number | null
          group_name?: string | null
          half_time_away?: number | null
          half_time_home?: number | null
          home_booking_score?: number | null
          home_team_id?: number | null
          id?: number
          matchday?: number | null
          next_match_id?: number | null
          next_match_loser_id?: number | null
          next_match_loser_slot?: string | null
          next_match_slot?: string | null
          stage?: string
          status?: Database["public"]["Enums"]["match_status"] | null
          utc_date?: string
          winner_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_next_match_id_fkey"
            columns: ["next_match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_next_match_loser_id_fkey"
            columns: ["next_match_loser_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string
          created_at: string
          display_name: string
          email: string
          favorite_team: number
          id: string
          rick_rolled: boolean | null
          updated_at: string
        }
        Insert: {
          avatar_url: string
          created_at?: string
          display_name: string
          email: string
          favorite_team: number
          id: string
          rick_rolled?: boolean | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string
          created_at?: string
          display_name?: string
          email?: string
          favorite_team?: number
          id?: string
          rick_rolled?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      score_predictions: {
        Row: {
          created_at: string
          match_id: number
          points_awarded: number | null
          predicted_away: number
          predicted_home: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          match_id: number
          points_awarded?: number | null
          predicted_away: number
          predicted_home: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          match_id?: number
          points_awarded?: number | null
          predicted_away?: number
          predicted_home?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "score_predictions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
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
          created_at?: string | null
          crest_url?: string | null
          group_name?: string | null
          id: number
          name: string
          short_name?: string | null
          tla?: string | null
          updated_at?: string | null
        }
        Update: {
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
          feature1_points: number | null
          feature2_points: number | null
          final: number
          group_stage_points: number
          knockout_points: number
          last_16: number
          last_32: number
          matchday1: number
          matchday2: number
          matchday3: number
          qf: number
          sf: number
          third: number
          total_points: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          feature1_points?: number | null
          feature2_points?: number | null
          final?: number
          group_stage_points?: number
          knockout_points?: number
          last_16?: number
          last_32?: number
          matchday1?: number
          matchday2?: number
          matchday3?: number
          qf?: number
          sf?: number
          third?: number
          total_points?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          feature1_points?: number | null
          feature2_points?: number | null
          final?: number
          group_stage_points?: number
          knockout_points?: number
          last_16?: number
          last_32?: number
          matchday1?: number
          matchday2?: number
          matchday3?: number
          qf?: number
          sf?: number
          third?: number
          total_points?: number | null
          updated_at?: string
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
      match_duration: "REGULAR" | "EXTRA_TIME" | "PENALTY_SHOOTOUT"
      match_status:
        | "SCHEDULED"
        | "TIMED"
        | "IN_PLAY"
        | "PAUSED"
        | "EXTRA_TIME"
        | "PENALTY_SHOOTOUT"
        | "FINISHED"
        | "SUSPENDED"
        | "POSTPONED"
        | "CANCELLED"
        | "AWARDED"
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
    Enums: {
      match_duration: ["REGULAR", "EXTRA_TIME", "PENALTY_SHOOTOUT"],
      match_status: [
        "SCHEDULED",
        "TIMED",
        "IN_PLAY",
        "PAUSED",
        "EXTRA_TIME",
        "PENALTY_SHOOTOUT",
        "FINISHED",
        "SUSPENDED",
        "POSTPONED",
        "CANCELLED",
        "AWARDED",
      ],
    },
  },
} as const
