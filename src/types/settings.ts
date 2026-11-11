import { Database } from './database.types';

export type TournamentSettingsRow = Database['public']['Tables']['tournament_settings']['Row'];
export type TournamentSettingsInsert = Database['public']['Tables']['tournament_settings']['Insert'];
export type TournamentSettingsUpdate = Database['public']['Tables']['tournament_settings']['Update'];

export interface PublicTournamentSettings {
  tournament_name: string;
  registration_fee: number;
  upi_id: string;
  upi_qr_path: string | null;
  maximum_player_capacity: number;
  registration_open: boolean;
  registration_instructions: string | null;
}
