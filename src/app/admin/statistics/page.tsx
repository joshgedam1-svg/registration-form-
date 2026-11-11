'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  CreditCard,
  PieChart,
  Award,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { formatCurrencyINR } from '@/lib/utils/format';
import { PlayerWithPayment } from '@/types/player';

export default function StatisticsAdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [players, setPlayers] = useState<PlayerWithPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, playersRes] = await Promise.all([
        fetch('/api/admin/statistics'),
        fetch('/api/admin/players')
      ]);

      const statsJson = await statsRes.json();
      const playersJson = await playersRes.json();

      if (statsJson.success) setStats(statsJson.data);
      if (playersJson.success) setPlayers(playersJson.data);
    } catch (err) {
      console.error('Failed to load statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-2">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-green mx-auto" />
        <p className="text-sm text-brand-muted">Aggregating tournament telemetry...</p>
      </div>
    );
  }

  // Calculate deep breakdown
  const verifiedPlayers = players.filter(p => p.payment?.payment_status === 'verified');
  const verifiedCount = verifiedPlayers.length;

  const battingStats = {
    right_hand: verifiedPlayers.filter(p => p.batting_style === 'right_hand').length,
    left_hand: verifiedPlayers.filter(p => p.batting_style === 'left_hand').length
  };

  const bowlingArmStats = {
    right_arm: verifiedPlayers.filter(p => p.bowling_arm === 'right_arm').length,
    left_arm: verifiedPlayers.filter(p => p.bowling_arm === 'left_arm').length,
    do_not_bowl: verifiedPlayers.filter(p => p.bowling_arm === 'do_not_bowl').length
  };

  const bowlingTypeStats = {
    fast: verifiedPlayers.filter(p => p.bowling_type === 'fast').length,
    medium: verifiedPlayers.filter(p => p.bowling_type === 'medium').length,
    spin: verifiedPlayers.filter(p => p.bowling_type === 'spin').length,
    not_applicable: verifiedPlayers.filter(p => p.bowling_type === 'not_applicable').length
  };

  const experienceStats = {
    beginner: verifiedPlayers.filter(p => p.experience_level === 'beginner').length,
    '1_2_years': verifiedPlayers.filter(p => p.experience_level === '1_2_years').length,
    '3_5_years': verifiedPlayers.filter(p => p.experience_level === '3_5_years').length,
    '5_plus_years': verifiedPlayers.filter(p => p.experience_level === '5_plus_years').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-dark tracking-tight">
            Cricket & Tournament Statistics
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
            Technical player skill distribution, batting/bowling demographics, and financial collections.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-brand-border text-xs font-semibold text-brand-dark hover:bg-gray-50 transition-colors shadow-xs self-start"
        >
          <RefreshCw className="w-3.5 h-3.5 text-primary-green" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-brand-border rounded-xl p-5 shadow-xs space-y-1">
          <span className="text-xs text-brand-muted font-semibold uppercase tracking-wider">
            Verified Athletes
          </span>
          <div className="text-3xl font-bold text-primary-green">{verifiedCount}</div>
          <p className="text-[11px] text-brand-muted">Out of {players.length} total registrants</p>
        </div>

        <div className="bg-white border border-brand-border rounded-xl p-5 shadow-xs space-y-1">
          <span className="text-xs text-brand-muted font-semibold uppercase tracking-wider">
            Verified Collection
          </span>
          <div className="text-3xl font-bold text-primary-green">
            {formatCurrencyINR(stats?.totalCollection || 0)}
          </div>
          <p className="text-[11px] text-brand-muted">₹500 per verified registration</p>
        </div>

        <div className="bg-white border border-brand-border rounded-xl p-5 shadow-xs space-y-1">
          <span className="text-xs text-brand-muted font-semibold uppercase tracking-wider">
            Tournament Fill Rate
          </span>
          <div className="text-3xl font-bold text-brand-dark">
            {stats?.capacityProgress || 0}%
          </div>
          <p className="text-[11px] text-brand-muted">{stats?.remainingSlots || 0} slots remaining</p>
        </div>
      </div>

      {/* Grid of Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Batting Hand Distribution */}
        <div className="bg-white border border-brand-border rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="font-bold text-sm text-brand-dark">Batting Hand Profile</h3>
            <span className="text-xs text-brand-muted">{verifiedCount} Verified</span>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Right Hand Batsmen', count: battingStats.right_hand, color: 'bg-primary-green' },
              { label: 'Left Hand Batsmen', count: battingStats.left_hand, color: 'bg-teal-600' }
            ].map(item => {
              const pct = verifiedCount > 0 ? Math.round((item.count / verifiedCount) * 100) : 0;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-brand-dark">{item.label}</span>
                    <span className="font-mono text-brand-muted">{item.count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className={`${item.color} h-full rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bowling Arm Distribution */}
        <div className="bg-white border border-brand-border rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="font-bold text-sm text-brand-dark">Bowling Arm Profile</h3>
            <span className="text-xs text-brand-muted">{verifiedCount} Verified</span>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Right Arm', count: bowlingArmStats.right_arm, color: 'bg-emerald-600' },
              { label: 'Left Arm', count: bowlingArmStats.left_arm, color: 'bg-teal-600' },
              { label: 'Do Not Bowl', count: bowlingArmStats.do_not_bowl, color: 'bg-gray-400' }
            ].map(item => {
              const pct = verifiedCount > 0 ? Math.round((item.count / verifiedCount) * 100) : 0;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-brand-dark">{item.label}</span>
                    <span className="font-mono text-brand-muted">{item.count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className={`${item.color} h-full rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bowling Types */}
        <div className="bg-white border border-brand-border rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="font-bold text-sm text-brand-dark">Bowling Craft Breakdown</h3>
            <span className="text-xs text-brand-muted">Verified Bowlers</span>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Pace / Fast Bowlers', count: bowlingTypeStats.fast, color: 'bg-primary-green' },
              { label: 'Medium Pacers', count: bowlingTypeStats.medium, color: 'bg-emerald-600' },
              { label: 'Spin Specialists', count: bowlingTypeStats.spin, color: 'bg-teal-600' }
            ].map(item => {
              const bowlersCount = verifiedCount - bowlingArmStats.do_not_bowl;
              const pct = bowlersCount > 0 ? Math.round((item.count / bowlersCount) * 100) : 0;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-brand-dark">{item.label}</span>
                    <span className="font-mono text-brand-muted">{item.count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className={`${item.color} h-full rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Experience Brackets */}
        <div className="bg-white border border-brand-border rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="font-bold text-sm text-brand-dark">Experience Tiers</h3>
            <span className="text-xs text-brand-muted">Years of Competitive Play</span>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Beginner', count: experienceStats.beginner, color: 'bg-gray-400' },
              { label: '1–2 Years', count: experienceStats['1_2_years'], color: 'bg-lime-600' },
              { label: '3–5 Years', count: experienceStats['3_5_years'], color: 'bg-emerald-600' },
              { label: '5+ Years (Veteran)', count: experienceStats['5_plus_years'], color: 'bg-primary-green' }
            ].map(item => {
              const pct = verifiedCount > 0 ? Math.round((item.count / verifiedCount) * 100) : 0;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-brand-dark">{item.label}</span>
                    <span className="font-mono text-brand-muted">{item.count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className={`${item.color} h-full rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
