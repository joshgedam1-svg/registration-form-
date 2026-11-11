import { Database } from './database.types';

export type PlayerRow = Database['public']['Tables']['players']['Row'];
export type PlayerInsert = Database['public']['Tables']['players']['Insert'];
export type PlayerUpdate = Database['public']['Tables']['players']['Update'];

export type PlayingRole = 'batsman' | 'bowler' | 'all_rounder' | 'wicketkeeper';
export type BattingStyle = 'right_hand' | 'left_hand';
export type BowlingArm = 'right_arm' | 'left_arm' | 'do_not_bowl';
export type BowlingType = 'fast' | 'medium' | 'spin' | 'not_applicable';
export type ExperienceLevel = 'beginner' | '1_2_years' | '3_5_years' | '5_plus_years';
export type RegistrationStatus = 'under_review' | 'approved' | 'rejected';

export interface PlayerWithPayment extends PlayerRow {
  payment?: {
    id: string;
    amount: number;
    currency: string;
    payment_method: string;
    utr_number: string;
    screenshot_path: string;
    payment_status: 'pending_verification' | 'verified' | 'rejected';
    rejection_reason: string | null;
    verified_at: string | null;
  } | null;
}
