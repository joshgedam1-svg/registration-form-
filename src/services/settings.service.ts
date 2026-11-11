import { isSupabaseConfigured } from '@/lib/supabase/client';
import { getAdminClient } from '@/lib/supabase/admin';
import { mockStore } from '@/lib/mockStore';
import { TournamentSettingsRow, PublicTournamentSettings } from '@/types/settings';

export const settingsService = {
  async getPublicSettings(): Promise<PublicTournamentSettings> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getAdminClient();
        const { data, error } = await supabase
          .from('tournament_settings')
          .select('tournament_name, registration_fee, upi_id, upi_qr_path, maximum_player_capacity, registration_open, registration_instructions')
          .limit(1)
          .single();

        if (error || !data) {
          console.warn('Error fetching Supabase settings, falling back to store:', error);
          const mock = mockStore.getSettings();
          return {
            tournament_name: mock.tournament_name,
            registration_fee: mock.registration_fee,
            upi_id: mock.upi_id,
            upi_qr_path: mock.upi_qr_path,
            maximum_player_capacity: mock.maximum_player_capacity,
            registration_open: mock.registration_open,
            registration_instructions: mock.registration_instructions
          };
        }

        return data as PublicTournamentSettings;
      } catch (err) {
        console.error('Failed to query Supabase settings:', err);
      }
    }

    const mock = mockStore.getSettings();
    return {
      tournament_name: mock.tournament_name,
      registration_fee: mock.registration_fee,
      upi_id: mock.upi_id,
      upi_qr_path: mock.upi_qr_path,
      maximum_player_capacity: mock.maximum_player_capacity,
      registration_open: mock.registration_open,
      registration_instructions: mock.registration_instructions
    };
  },

  async getAllSettings(): Promise<TournamentSettingsRow> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getAdminClient();
        const { data, error } = await supabase
          .from('tournament_settings')
          .select('*')
          .limit(1)
          .single();

        if (!error && data) {
          return data as TournamentSettingsRow;
        }
      } catch (err) {
        console.error('Failed to query Supabase settings:', err);
      }
    }

    return mockStore.getSettings();
  },

  async updateSettings(updates: Partial<TournamentSettingsRow>, adminId?: string): Promise<TournamentSettingsRow> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getAdminClient();
        const { data: current } = await supabase.from('tournament_settings').select('id').limit(1).single();

        if (current && (current as any).id) {
          const currentId = (current as any).id;
          const { data, error } = await supabase
            .from('tournament_settings')
            .update({
              ...updates,
              updated_by: adminId || null,
              updated_at: new Date().toISOString()
            })
            .eq('id', currentId)
            .select()
            .single();

          if (!error && data) {
            // Also log activity
            await supabase.from('admin_activity_logs').insert({
              admin_id: adminId || null,
              action: 'settings_updated',
              entity_type: 'tournament_settings',
              entity_id: currentId,
              new_values: updates
            });

            return data as TournamentSettingsRow;
          }
        }
      } catch (err) {
        console.error('Failed to update Supabase settings:', err);
      }
    }

    return mockStore.updateSettings(updates);
  }
};
