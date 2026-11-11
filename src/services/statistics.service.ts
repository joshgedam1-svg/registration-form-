import { isSupabaseConfigured } from '@/lib/supabase/client';
import { getAdminClient } from '@/lib/supabase/admin';
import { mockStore } from '@/lib/mockStore';
import { PlayingRole } from '@/types/player';

export const statisticsService = {
  async getDashboardStatistics() {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getAdminClient();

        // 1. Fetch settings
        const { data: settings } = await supabase
          .from('tournament_settings')
          .select('maximum_player_capacity, registration_open')
          .limit(1)
          .single();

        const maximumCapacity = (settings as any)?.maximum_player_capacity ?? 100;
        const registrationOpen = (settings as any)?.registration_open ?? true;

        // 2. Fetch counts
        const { count: totalRegistrations } = await supabase
          .from('players')
          .select('*', { count: 'exact', head: true });

        const { data: verifiedPayments, error: verErr } = await supabase
          .from('payments')
          .select('amount, player_id, players(playing_role)')
          .eq('payment_status', 'verified');

        const { count: pendingPaymentsCount } = await supabase
          .from('payments')
          .select('*', { count: 'exact', head: true })
          .eq('payment_status', 'pending_verification');

        const { count: rejectedPaymentsCount } = await supabase
          .from('payments')
          .select('*', { count: 'exact', head: true })
          .eq('payment_status', 'rejected');

        const { data: recentLogs } = await supabase
          .from('admin_activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (!verErr && verifiedPayments) {
          const verifiedPlayersCount = verifiedPayments.length;
          const totalCollection = verifiedPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
          const remainingSlots = Math.max(0, maximumCapacity - verifiedPlayersCount);
          const capacityProgress = maximumCapacity > 0
            ? Math.min(100, Math.round((verifiedPlayersCount / maximumCapacity) * 100))
            : 0;

          const roleStats: Record<PlayingRole, number> = {
            batsman: 0,
            bowler: 0,
            all_rounder: 0,
            wicketkeeper: 0
          };

          verifiedPayments.forEach((p: any) => {
            const role = p.players?.playing_role as PlayingRole;
            if (role && roleStats[role] !== undefined) {
              roleStats[role]++;
            }
          });

          return {
            totalRegistrations: totalRegistrations || 0,
            verifiedPlayersCount,
            pendingPaymentsCount: pendingPaymentsCount || 0,
            rejectedPaymentsCount: rejectedPaymentsCount || 0,
            maximumCapacity,
            remainingSlots,
            capacityProgress,
            totalCollection,
            roleStats,
            registrationOpen,
            recentLogs: recentLogs || []
          };
        }
      } catch (err) {
        console.error('Supabase getDashboardStatistics error:', err);
      }
    }

    return mockStore.getStatistics();
  }
};
