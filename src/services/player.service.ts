import { isSupabaseConfigured } from '@/lib/supabase/client';
import { getAdminClient } from '@/lib/supabase/admin';
import { mockStore } from '@/lib/mockStore';
import { PlayerWithPayment } from '@/types/player';

export const playerService = {
  async getPlayers(filter?: { status?: string; role?: string; search?: string }): Promise<PlayerWithPayment[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getAdminClient();
        let query = supabase.from('players').select('*, payments(*)').order('created_at', { ascending: false });

        if (filter?.role) {
          query = query.eq('playing_role', filter.role);
        }

        if (filter?.status) {
          if (filter.status === 'verified' || filter.status === 'pending') {
            // will filter via payment status
          } else {
            query = query.eq('registration_status', filter.status);
          }
        }

        if (filter?.search) {
          query = query.or(`full_name.ilike.%${filter.search}%,registration_id.ilike.%${filter.search}%,city.ilike.%${filter.search}%`);
        }

        const { data, error } = await query;
        if (!error && data) {
          let mapped: PlayerWithPayment[] = data.map((p: any) => ({
            ...p,
            payment: p.payments?.[0] || null
          }));

          if (filter?.status === 'verified') {
            mapped = mapped.filter(p => p.payment?.payment_status === 'verified');
          } else if (filter?.status === 'pending') {
            mapped = mapped.filter(p => p.payment?.payment_status === 'pending_verification');
          } else if (filter?.status === 'rejected') {
            mapped = mapped.filter(p => p.payment?.payment_status === 'rejected' || p.registration_status === 'rejected');
          }

          return mapped;
        }
      } catch (err) {
        console.error('Supabase getPlayers error:', err);
      }
    }

    return mockStore.getPlayers(filter);
  },

  async getPlayerById(id: string): Promise<PlayerWithPayment | null> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getAdminClient();
        const { data, error } = await supabase
          .from('players')
          .select('*, payments(*)')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          const p = data as any;
          return {
            ...p,
            payment: p.payments?.[0] || null
          } as PlayerWithPayment;
        }
      } catch (err) {
        console.error('Supabase getPlayerById error:', err);
      }
    }

    return mockStore.getPlayerById(id) || null;
  },

  async approveRegistration(id: string, adminId: string = 'admin'): Promise<PlayerWithPayment> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getAdminClient();
        const { data, error } = await supabase
          .from('players')
          .update({
            registration_status: 'approved',
            rejection_reason: null,
            updated_at: new Date().toISOString()
          } as any)
          .eq('id', id)
          .select('*, payments(*)')
          .single();

        if (!error && data) {
          await supabase.from('admin_activity_logs').insert({
            admin_id: adminId !== 'admin' ? adminId : null,
            action: 'registration_approved',
            entity_type: 'player',
            entity_id: id,
            new_values: { registration_status: 'approved' }
          } as any);

          const p = data as any;
          return {
            ...p,
            payment: p.payments?.[0] || null
          } as PlayerWithPayment;
        }
      } catch (err) {
        console.error('Supabase approveRegistration error:', err);
      }
    }

    return mockStore.approveRegistration(id, adminId);
  },

  async rejectRegistration(id: string, reason: string, adminId: string = 'admin'): Promise<PlayerWithPayment> {
    if (!reason || !reason.trim()) {
      throw new Error('A rejection reason is required');
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = getAdminClient();
        const { data, error } = await supabase
          .from('players')
          .update({
            registration_status: 'rejected',
            rejection_reason: reason.trim(),
            updated_at: new Date().toISOString()
          } as any)
          .eq('id', id)
          .select('*, payments(*)')
          .single();

        if (!error && data) {
          await supabase.from('admin_activity_logs').insert({
            admin_id: adminId !== 'admin' ? adminId : null,
            action: 'registration_rejected',
            entity_type: 'player',
            entity_id: id,
            new_values: { registration_status: 'rejected', rejection_reason: reason.trim() }
          } as any);

          const p = data as any;
          return {
            ...p,
            payment: p.payments?.[0] || null
          } as PlayerWithPayment;
        }
      } catch (err) {
        console.error('Supabase rejectRegistration error:', err);
      }
    }

    return mockStore.rejectRegistration(id, reason.trim(), adminId);
  },

  async updatePlayer(id: string, updates: Partial<PlayerWithPayment>, adminId: string = 'admin'): Promise<PlayerWithPayment> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getAdminClient();
        const { data, error } = await supabase
          .from('players')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          } as any)
          .eq('id', id)
          .select('*, payments(*)')
          .single();

        if (!error && data) {
          await supabase.from('admin_activity_logs').insert({
            admin_id: adminId !== 'admin' ? adminId : null,
            action: 'player_details_updated',
            entity_type: 'player',
            entity_id: id,
            new_values: updates
          } as any);

          const p = data as any;
          return {
            ...p,
            payment: p.payments?.[0] || null
          } as PlayerWithPayment;
        }
      } catch (err) {
        console.error('Supabase updatePlayer error:', err);
      }
    }

    const player = mockStore.getPlayerById(id);
    if (!player) throw new Error('Player not found');
    Object.assign(player, updates, { updated_at: new Date().toISOString() });
    return player;
  }
};
