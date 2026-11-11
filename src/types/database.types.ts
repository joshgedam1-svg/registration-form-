export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          role: 'super_admin' | 'admin'
          is_active: boolean
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          role?: 'super_admin' | 'admin'
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          role?: 'super_admin' | 'admin'
          is_active?: boolean
          created_at?: string
        }
      }
      tournament_settings: {
        Row: {
          id: string
          tournament_name: string
          registration_fee: number
          upi_id: string
          upi_qr_path: string | null
          maximum_player_capacity: number
          registration_open: boolean
          registration_instructions: string | null
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          tournament_name?: string
          registration_fee?: number
          upi_id?: string
          upi_qr_path?: string | null
          maximum_player_capacity?: number
          registration_open?: boolean
          registration_instructions?: string | null
          updated_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          tournament_name?: string
          registration_fee?: number
          upi_id?: string
          upi_qr_path?: string | null
          maximum_player_capacity?: number
          registration_open?: boolean
          registration_instructions?: string | null
          updated_by?: string | null
          updated_at?: string
        }
      }
      players: {
        Row: {
          id: string
          registration_id: string
          full_name: string
          email: string
          mobile: string
          date_of_birth: string
          city: string
          address: string
          profile_photo_path: string | null
          playing_role: 'batsman' | 'bowler' | 'all_rounder' | 'wicketkeeper'
          batting_style: 'right_hand' | 'left_hand'
          bowling_arm: 'right_arm' | 'left_arm' | 'do_not_bowl'
          bowling_type: 'fast' | 'medium' | 'spin' | 'not_applicable'
          experience_level: 'beginner' | '1_2_years' | '3_5_years' | '5_plus_years'
          previous_team_name: string | null
          previous_captain_name: string | null
          previous_tournament: boolean
          previous_tournament_name: string | null
          additional_information: string | null
          emergency_contact_name: string
          emergency_relationship: string
          emergency_mobile: string
          registration_status: 'under_review' | 'approved' | 'rejected'
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          registration_id?: string
          full_name: string
          email: string
          mobile: string
          date_of_birth: string
          city: string
          address: string
          profile_photo_path?: string | null
          playing_role: 'batsman' | 'bowler' | 'all_rounder' | 'wicketkeeper'
          batting_style: 'right_hand' | 'left_hand'
          bowling_arm: 'right_arm' | 'left_arm' | 'do_not_bowl'
          bowling_type: 'fast' | 'medium' | 'spin' | 'not_applicable'
          experience_level: 'beginner' | '1_2_years' | '3_5_years' | '5_plus_years'
          previous_team_name?: string | null
          previous_captain_name?: string | null
          previous_tournament?: boolean
          previous_tournament_name?: string | null
          additional_information?: string | null
          emergency_contact_name: string
          emergency_relationship: string
          emergency_mobile: string
          registration_status?: 'under_review' | 'approved' | 'rejected'
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          registration_id?: string
          full_name?: string
          email?: string
          mobile?: string
          date_of_birth?: string
          city?: string
          address?: string
          profile_photo_path?: string | null
          playing_role?: 'batsman' | 'bowler' | 'all_rounder' | 'wicketkeeper'
          batting_style?: 'right_hand' | 'left_hand'
          bowling_arm?: 'right_arm' | 'left_arm' | 'do_not_bowl'
          bowling_type?: 'fast' | 'medium' | 'spin' | 'not_applicable'
          experience_level?: 'beginner' | '1_2_years' | '3_5_years' | '5_plus_years'
          previous_team_name?: string | null
          previous_captain_name?: string | null
          previous_tournament?: boolean
          previous_tournament_name?: string | null
          additional_information?: string | null
          emergency_contact_name?: string
          emergency_relationship?: string
          emergency_mobile?: string
          registration_status?: 'under_review' | 'approved' | 'rejected'
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          player_id: string
          amount: number
          currency: string
          payment_method: string
          utr_number: string
          screenshot_path: string
          payment_status: 'pending_verification' | 'verified' | 'rejected'
          rejection_reason: string | null
          verified_by: string | null
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          player_id: string
          amount?: number
          currency?: string
          payment_method?: string
          utr_number: string
          screenshot_path: string
          payment_status?: 'pending_verification' | 'verified' | 'rejected'
          rejection_reason?: string | null
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          amount?: number
          currency?: string
          payment_method?: string
          utr_number?: string
          screenshot_path?: string
          payment_status?: 'pending_verification' | 'verified' | 'rejected'
          rejection_reason?: string | null
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      admin_activity_logs: {
        Row: {
          id: string
          admin_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          old_values: Json | null
          new_values: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          created_at?: string
        }
      }
    }
  }
}

