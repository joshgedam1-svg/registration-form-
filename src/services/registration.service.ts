import { isSupabaseConfigured } from '@/lib/supabase/client';
import { getAdminClient } from '@/lib/supabase/admin';
import { mockStore } from '@/lib/mockStore';
import { registrationSchema, RegistrationFormData } from '@/lib/validations/registration';
import { normalizeMobile } from '@/lib/utils/format';
import { settingsService } from './settings.service';

export const registrationService = {
  async submitRegistration(input: RegistrationFormData) {
    // 1. Server-side Zod validation
    const validated = registrationSchema.parse(input);

    // 2. Normalize inputs
    const normalizedMobile = normalizeMobile(validated.mobile);
    const normalizedEmail = validated.email.trim().toLowerCase();

    // 3. Verify registration is open & check capacity
    const settings = await settingsService.getPublicSettings();
    if (!settings.registration_open) {
      throw new Error('Tournament registrations are currently closed by the organizers.');
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = getAdminClient();

        // Check duplicate mobile in Supabase
        const { data: existingPlayer } = await supabase
          .from('players')
          .select('id, registration_id')
          .eq('mobile', normalizedMobile)
          .maybeSingle();

        if (existingPlayer) {
          const ep = existingPlayer as any;
          throw new Error(
            `Mobile number ${normalizedMobile} is already registered under Registration ID: ${ep.registration_id}`
          );
        }

        // Check duplicate UTR in Supabase
        const { data: existingUtr } = await supabase
          .from('payments')
          .select('id, utr_number')
          .eq('utr_number', validated.utr_number)
          .maybeSingle();

        if (existingUtr) {
          throw new Error(
            `Transaction Reference / UTR ${validated.utr_number} has already been submitted for verification.`
          );
        }

        // Insert Player Record
        const { data: player, error: playerError } = await supabase
          .from('players')
          .insert({
            full_name: validated.full_name.trim(),
            email: normalizedEmail,
            mobile: normalizedMobile,
            date_of_birth: validated.date_of_birth,
            city: validated.city.trim(),
            address: validated.address.trim(),
            profile_photo_path: validated.profile_photo_path || null,
            playing_role: validated.playing_role,
            batting_style: validated.batting_style,
            bowling_arm: validated.bowling_arm,
            bowling_type: validated.bowling_type,
            experience_level: validated.experience_level || 'beginner',
            previous_team_name: validated.previous_team_name?.trim() || null,
            previous_captain_name: validated.previous_captain_name?.trim() || null,
            previous_tournament: validated.previous_tournament ?? false,
            previous_tournament_name: validated.previous_tournament_name?.trim() || null,
            additional_information: validated.additional_information?.trim() || null,
            emergency_contact_name: validated.emergency_contact_name.trim(),
            emergency_relationship: validated.emergency_relationship.trim(),
            emergency_mobile: normalizeMobile(validated.emergency_mobile),
            registration_status: 'under_review'
          } as any)
          .select()
          .single();

        if (playerError || !player) {
          console.error('Player creation error in Supabase:', playerError);
          throw new Error(playerError?.message || 'Failed to create player profile');
        }

        const p = player as any;

        // Insert Payment Record
        const { data: payment, error: paymentError } = await supabase
          .from('payments')
          .insert({
            player_id: p.id,
            amount: validated.amount || settings.registration_fee || 500,
            currency: 'INR',
            payment_method: 'UPI',
            utr_number: validated.utr_number.trim(),
            screenshot_path: validated.screenshot_path,
            payment_status: 'pending_verification'
          } as any)
          .select()
          .single();

        if (paymentError || !payment) {
          console.error('Payment creation error in Supabase:', paymentError);
          // Rollback player if needed
          await supabase.from('players').delete().eq('id', p.id);
          throw new Error(paymentError?.message || 'Failed to submit payment details');
        }

        return {
          player: p,
          payment
        };
      } catch (err: any) {
        console.warn('Supabase submission fallback to in-memory store:', err.message);
        if (!err.message?.includes('fetch failed')) {
          throw err;
        }
      }
    }

    // Mock store fallback for instant development testing
    return mockStore.createRegistration({
      ...validated,
      mobile: normalizedMobile,
      email: normalizedEmail,
      emergency_mobile: normalizeMobile(validated.emergency_mobile)
    });
  },

  async getRegistrationById(idOrRegId: string) {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getAdminClient();
        const { data: player, error } = await supabase
          .from('players')
          .select('*, payments(*)')
          .or(`id.eq.${idOrRegId},registration_id.ilike.${idOrRegId}`)
          .maybeSingle();

        if (!error && player) {
          const p = player as any;
          const payment = p.payments?.[0] || null;
          return {
            ...p,
            payment
          };
        }
      } catch (err) {
        console.error('Failed to get registration from Supabase:', err);
      }
    }

    return mockStore.getPlayerById(idOrRegId);
  }
};
