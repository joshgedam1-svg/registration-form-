'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  CreditCard,
  UserCheck,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  RefreshCw,
  Award
} from 'lucide-react';
import { formatCurrencyINR } from '@/lib/utils/format';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      const json = await res.json();
      if (json.success && json.data) {
        setStats(json.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh interval (every 10 seconds for live admin view)
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-green mx-auto" />
        <p className="text-sm text-brand-muted">Loading live dashboard telemetry...</p>
      </div>
    );
  }

  const roleStats = stats?.roleStats || { batsman: 0, bowler: 0, all_rounder: 0, wicketkeeper: 0 };
  const verifiedCount = stats?.verifiedPlayersCount || 0;
  const maxCap = stats?.maximumCapacity || 100;
  const progressPct = stats?.capacityProgress || 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-dark tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
            Realtime player registration counts, verified financial collections, and slot capacity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-brand-border text-xs font-semibold text-brand-dark hover:bg-gray-50 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-primary-green ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
          <Link
            href="/admin/payments"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary-green hover:bg-primary-dark text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Verify Payments</span>
          </Link>
        </div>
      </div>

      {/* Over-capacity alert if any */}
      {stats?.remainingSlots === 0 && verifiedCount >= maxCap && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <h4 className="font-bold">Maximum Player Capacity Reached!</h4>
            <p className="mt-0.5 leading-relaxed">
              The tournament has reached its full limit of {maxCap} verified players. Further payment verifications are paused to protect tournament slots.
            </p>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* 6 MAIN METRICS CARDS */}
      {/* ============================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        {/* Card 1: Total Registrations */}
        <div className="bg-white border border-brand-border rounded-xl p-4 sm:p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-brand-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Registrations</span>
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-brand-dark">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-brand-dark">
            {stats?.totalRegistrations || 0}
          </div>
          <p className="text-[11px] text-brand-muted">Total submitted player profiles</p>
        </div>

        {/* Card 2: Paid & Verified Players */}
        <div className="bg-white border border-brand-border rounded-xl p-4 sm:p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-brand-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Verified Players</span>
            <div className="w-8 h-8 rounded-lg bg-light-green text-primary-green flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-primary-green">
            {stats?.verifiedPlayersCount || 0}
          </div>
          <p className="text-[11px] text-brand-muted">Confirmed ₹500 bank payments</p>
        </div>

        {/* Card 3: Pending Verification */}
        <div className="bg-white border border-brand-border rounded-xl p-4 sm:p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-brand-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Verification</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-600">
            {stats?.pendingPaymentsCount || 0}
          </div>
          <p className="text-[11px] text-brand-muted">Awaiting administrator approval</p>
        </div>

        {/* Card 4: Rejected Payments */}
        <div className="bg-white border border-brand-border rounded-xl p-4 sm:p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-brand-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Rejected Payments</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-red-600">
            {stats?.rejectedPaymentsCount || 0}
          </div>
          <p className="text-[11px] text-brand-muted">Invalid or duplicate UTRs</p>
        </div>

        {/* Card 5: Remaining Player Slots */}
        <div className="bg-white border border-brand-border rounded-xl p-4 sm:p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-brand-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Remaining Slots</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-brand-dark">
            {stats?.remainingSlots || 0}
            <span className="text-xs font-normal text-brand-muted ml-1.5">/ {maxCap}</span>
          </div>
          <p className="text-[11px] text-brand-muted">Available tournament slots</p>
        </div>

        {/* Card 6: Total Verified Collection */}
        <div className="bg-white border border-brand-border rounded-xl p-4 sm:p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-brand-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Verified Collection</span>
            <div className="w-8 h-8 rounded-lg bg-light-green text-primary-green flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-primary-green">
            {formatCurrencyINR(stats?.totalCollection || 0)}
          </div>
          <p className="text-[11px] text-brand-muted">100% verified UPI receipts</p>
        </div>
      </div>

      {/* ============================================================================== */}
      {/* REGISTRATION CAPACITY & PROGRESS */}
      {/* ============================================================================== */}
      <div className="bg-white border border-brand-border rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-brand-dark">Tournament Registration Capacity</h3>
            <p className="text-xs text-brand-muted">
              Live capacity tracking calculated strictly from verified payments.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary-green bg-light-green px-3 py-1 rounded-full border border-primary-green/20">
              {verifiedCount} Verified / {maxCap} Target
            </span>
            <span className="text-xs font-semibold text-brand-dark font-mono">
              {progressPct}% Filled
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-3.5 overflow-hidden p-0.5">
          <div
            className="bg-primary-green h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, progressPct)}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
          <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
            <span className="text-brand-muted block text-[11px]">Maximum Target</span>
            <span className="font-bold text-sm text-brand-dark">{maxCap}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-light-green/50 border border-primary-green/20">
            <span className="text-primary-green block text-[11px] font-semibold">Verified</span>
            <span className="font-bold text-sm text-primary-green">{verifiedCount}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
            <span className="text-brand-muted block text-[11px]">Slots Remaining</span>
            <span className="font-bold text-sm text-brand-dark">{stats?.remainingSlots || 0}</span>
          </div>
        </div>
      </div>

      {/* ============================================================================== */}
      {/* ROLE-WISE VERIFIED STATISTICS */}
      {/* ============================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Role Distribution Card */}
        <div className="bg-white border border-brand-border rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-brand-dark">Role-Wise Verified Players</h3>
              <p className="text-xs text-brand-muted">Distribution of paid & verified athletes</p>
            </div>
            <Link
              href="/admin/players"
              className="text-xs font-semibold text-primary-green hover:underline flex items-center gap-1"
            >
              <span>View Roster</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3.5 pt-1">
            {[
              { role: 'batsman', label: 'Batsmen', count: roleStats.batsman, color: 'bg-primary-green' },
              { role: 'bowler', label: 'Bowlers', count: roleStats.bowler, color: 'bg-emerald-600' },
              { role: 'all_rounder', label: 'All-Rounders', count: roleStats.all_rounder, color: 'bg-teal-600' },
              { role: 'wicketkeeper', label: 'Wicketkeepers', count: roleStats.wicketkeeper, color: 'bg-lime-600' }
            ].map(item => {
              const pct = verifiedCount > 0 ? Math.round((item.count / verifiedCount) * 100) : 0;
              return (
                <div key={item.role} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-brand-dark">{item.label}</span>
                    <span className="font-mono text-brand-muted">
                      <strong>{item.count}</strong> ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`${item.color} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Review & Recent Actions */}
        <div className="bg-white border border-brand-border rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-brand-dark">Pending Review Actions</h3>
              <p className="text-xs text-brand-muted">Immediate items requiring attention</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              {stats?.pendingPaymentsCount || 0} Pending
            </span>
          </div>

          <div className="space-y-3 pt-1">
            <div className="p-4 rounded-xl bg-gray-50 border border-brand-border flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-brand-dark">Payment Verification Queue</h4>
                <p className="text-xs text-brand-muted mt-0.5">
                  Inspect UPI screenshots and cross-check UTR numbers
                </p>
              </div>
              <Link
                href="/admin/payments"
                className="px-3.5 py-2 rounded-lg bg-primary-green hover:bg-primary-dark text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <span>Verify Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-brand-border flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-brand-dark">Player Roster & Profiles</h4>
                <p className="text-xs text-brand-muted mt-0.5">
                  Review complete player dossiers, roles, and emergency info
                </p>
              </div>
              <Link
                href="/admin/players"
                className="px-3.5 py-2 rounded-lg border border-brand-border bg-white hover:bg-gray-100 text-brand-dark text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
