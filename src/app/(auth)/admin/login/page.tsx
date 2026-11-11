'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { isSupabaseConfigured, createClient } from '@/lib/supabase/client';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@cricketauctionleague.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (authError) {
          throw new Error(authError.message);
        }
      }

      // Set cookie and navigate cleanly
      document.cookie = 'cal_admin_session=true; path=/; max-age=604800; SameSite=Lax';
      window.location.href = '/admin/dashboard';
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
      setLoading(false);
    }
  };

  const handleInstantDemoLogin = () => {
    document.cookie = 'cal_admin_session=true; path=/; max-age=604800; SameSite=Lax';
    window.location.href = '/admin/dashboard';
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-canvas">
      <div className="w-full max-w-md bg-white border border-brand-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-light-green text-primary-green border border-primary-green/20 flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-brand-dark tracking-tight">Admin Authentication</h1>
          <p className="text-xs sm:text-sm text-brand-muted">
            Official Cricket Auction League committee & verification portal
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Instant Demo Login Banner */}
        <div className="p-4 bg-light-green/70 border border-primary-green/30 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-primary-green font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Quick Admin Access</span>
          </div>
          <p className="text-xs text-brand-dark">
            Click below for instant one-click access into the Tournament Admin Dashboard.
          </p>
          <button
            type="button"
            onClick={handleInstantDemoLogin}
            className="w-full h-10 rounded-lg bg-primary-green hover:bg-primary-dark text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Enter Admin Portal (1-Click)</span>
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-brand-dark mb-1">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@cricketauctionleague.com"
                className="w-full h-11 pl-10 pr-3.5 rounded-lg border border-brand-border text-sm text-brand-dark bg-white focus-ring"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-brand-dark">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-3.5 rounded-lg border border-brand-border text-sm text-brand-dark bg-white focus-ring"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg border border-brand-border bg-white hover:bg-gray-50 text-brand-dark font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-primary-green" /> : <ShieldCheck className="w-4 h-4 text-primary-green" />}
            <span>Sign In with Password</span>
          </button>
        </form>

        <div className="text-center pt-1">
          <Link
            href="/register"
            className="text-xs text-brand-muted hover:text-primary-green transition-colors inline-flex items-center gap-1 font-medium"
          >
            <span>Back to Public Player Registration</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
