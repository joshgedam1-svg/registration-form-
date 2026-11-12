'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid email or password');
      }

      // Successful authentication
      window.location.href = '/admin/dashboard';
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
      setLoading(false);
    }
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
                placeholder="Enter admin email"
                autoComplete="email"
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
                placeholder="Enter password"
                autoComplete="current-password"
                className="w-full h-11 pl-10 pr-3.5 rounded-lg border border-brand-border text-sm text-brand-dark bg-white focus-ring"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg bg-primary-green hover:bg-primary-dark text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-white" />
            )}
            <span>Sign In to Admin Portal</span>
          </button>
        </form>

        <div className="text-center pt-1 border-t border-slate-100">
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
