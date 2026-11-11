'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  QrCode,
  CreditCard,
  Users,
  ShieldCheck,
  Power
} from 'lucide-react';
import QRCodeDisplay from '@/components/registration/QRCodeDisplay';
import { TournamentSettingsRow } from '@/types/settings';

export default function TournamentSettingsPage() {
  const [settings, setSettings] = useState<TournamentSettingsRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states
  const [tournamentName, setTournamentName] = useState('');
  const [registrationFee, setRegistrationFee] = useState(500);
  const [upiId, setUpiId] = useState('');
  const [capacity, setCapacity] = useState(100);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [instructions, setInstructions] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const json = await res.json();
      if (json.success && json.data) {
        const d: TournamentSettingsRow = json.data;
        setSettings(d);
        setTournamentName(d.tournament_name);
        setRegistrationFee(d.registration_fee);
        setUpiId(d.upi_id);
        setCapacity(d.maximum_player_capacity);
        setRegistrationOpen(d.registration_open);
        setInstructions(d.registration_instructions || '');
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournament_name: tournamentName.trim(),
          registration_fee: Number(registrationFee),
          upi_id: upiId.trim(),
          maximum_player_capacity: Number(capacity),
          registration_open: registrationOpen,
          registration_instructions: instructions.trim()
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setFeedback({ type: 'success', message: 'Tournament settings updated successfully!' });
      } else {
        setFeedback({ type: 'error', message: json.error || 'Failed to update settings' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error updating settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-2">
        <Loader2 className="w-8 h-8 animate-spin text-primary-green mx-auto" />
        <p className="text-sm text-brand-muted">Loading settings configuration...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-dark tracking-tight">
          Tournament Settings & Gateway Configuration
        </h1>
        <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
          Configure tournament parameters, live UPI payment details, player quotas, and registration toggles.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs sm:text-sm flex items-center gap-2.5 ${
            feedback.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          <span className="font-medium">{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Registration Toggle Status Banner */}
        <div
          className={`p-5 rounded-xl border transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            registrationOpen
              ? 'bg-light-green/60 border-primary-green/30'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                registrationOpen
                  ? 'bg-primary-green text-white'
                  : 'bg-red-600 text-white'
              }`}
            >
              <Power className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-brand-dark">
                Registration Status:{' '}
                <span className={registrationOpen ? 'text-primary-green' : 'text-red-600'}>
                  {registrationOpen ? 'OPEN (Accepting Submissions)' : 'CLOSED (Paused)'}
                </span>
              </h3>
              <p className="text-xs text-brand-muted">
                {registrationOpen
                  ? 'Players can currently register and submit UPI receipts on the public portal.'
                  : 'Public registration form is closed. Visitors will see a registration closed notice.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setRegistrationOpen(!registrationOpen)}
            className={`px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-colors shadow-xs ${
              registrationOpen
                ? 'bg-red-100 hover:bg-red-200 text-red-700'
                : 'bg-primary-green hover:bg-primary-dark text-white'
            }`}
          >
            {registrationOpen ? 'Close Registrations' : 'Re-open Registrations'}
          </button>
        </div>

        {/* Core Parameters Box */}
        <div className="bg-white border border-brand-border rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="font-bold text-sm text-brand-dark uppercase tracking-wide pb-2 border-b border-gray-100">
            Tournament Parameters
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-dark mb-1">
                Tournament Name
              </label>
              <input
                type="text"
                required
                value={tournamentName}
                onChange={e => setTournamentName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-lg border border-brand-border text-xs sm:text-sm text-brand-dark bg-white focus-ring"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-dark mb-1">
                Maximum Player Capacity
              </label>
              <input
                type="number"
                min={1}
                max={1000}
                required
                value={capacity}
                onChange={e => setCapacity(Number(e.target.value))}
                className="w-full h-11 px-3.5 rounded-lg border border-brand-border text-xs sm:text-sm text-brand-dark bg-white focus-ring"
              />
              <span className="text-[11px] text-brand-muted mt-0.5 block">
                Total allowed verified players before registrations lock.
              </span>
            </div>
          </div>
        </div>

        {/* UPI Gateway & Payment Config */}
        <div className="bg-white border border-brand-border rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="font-bold text-sm text-brand-dark uppercase tracking-wide pb-2 border-b border-gray-100">
            Official UPI Payment Rails
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-gray-50 border border-brand-border">
            {/* Live QR Preview */}
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <QRCodeDisplay
                upiId={upiId || 'cricketauctionleague@okhdfcbank'}
                amount={registrationFee || 500}
                tournamentName={tournamentName || 'Cricket Auction League'}
              />
              <span className="text-[10px] font-semibold text-brand-muted uppercase">Live QR Preview</span>
            </div>

            {/* Inputs */}
            <div className="flex-1 w-full space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-dark mb-1">
                  Official Receiver UPI ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  placeholder="cricketauctionleague@okhdfcbank"
                  className="w-full h-11 px-3.5 rounded-lg border border-brand-border text-xs sm:text-sm font-mono text-brand-dark bg-white focus-ring"
                />
                <span className="text-[11px] text-brand-muted mt-0.5 block">
                  The UPI ID shown to players and embedded inside the QR code.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-dark mb-1">
                  Fixed Registration Fee (INR) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-brand-muted text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    required
                    value={registrationFee}
                    onChange={e => setRegistrationFee(Number(e.target.value))}
                    className="w-full h-11 pl-8 pr-3.5 rounded-lg border border-brand-border text-xs sm:text-sm font-bold text-brand-dark bg-white focus-ring"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Instructions */}
        <div className="bg-white border border-brand-border rounded-xl p-5 sm:p-6 shadow-xs space-y-3">
          <h2 className="font-bold text-sm text-brand-dark uppercase tracking-wide pb-2 border-b border-gray-100">
            Player Registration Instructions
          </h2>
          <div>
            <textarea
              rows={3}
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="Instructions displayed on the player registration and payment section..."
              className="w-full p-3.5 rounded-lg border border-brand-border text-xs sm:text-sm text-brand-dark bg-white focus-ring"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 h-11 rounded-xl bg-primary-green hover:bg-primary-dark text-white font-semibold text-sm transition-colors flex items-center gap-2 shadow-sm disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Tournament Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
