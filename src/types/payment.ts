import { Database } from './database.types';

export type PaymentRow = Database['public']['Tables']['payments']['Row'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
export type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

export type PaymentStatus = 'pending_verification' | 'verified' | 'rejected';

export interface PaymentWithPlayer extends PaymentRow {
  player: {
    id: string;
    registration_id: string;
    full_name: string;
    email: string;
    mobile: string;
    playing_role: string;
    city: string;
    profile_photo_path: string | null;
  };
}
