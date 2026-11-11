'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  UserCheck,
  UserX,
  Phone,
  Mail,
  MapPin,
  Calendar,
  X,
  AlertTriangle,
  Loader2,
  FileSpreadsheet,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { PlayerWithPayment } from '@/types/player';
import { formatDate } from '@/lib/utils/format';

export default function PlayersAdminPage() {
  const [players, setPlayers] = useState<PlayerWithPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerWithPayment | null>(null);

  // Rejection Dialog State
  const [rejectingPlayer, setRejectingPlayer] = useState<PlayerWithPayment | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      let url = '/api/admin/players';
      const params = new URLSearchParams();

      if (activeFilter === 'verified' || activeFilter === 'pending' || activeFilter === 'rejected') {
        params.append('status', activeFilter);
      } else if (['batsman', 'bowler', 'all_rounder', 'wicketkeeper'].includes(activeFilter)) {
        params.append('role', activeFilter);
      }

      if (search.trim()) {
        params.append('search', search.trim());
      }

      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setPlayers(json.data);
      }
    } catch (err) {
      console.error('Failed to load players:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchPlayers();
    }, 250);
    return () => clearTimeout(timeout);
  }, [activeFilter, search]);

  const handleApprove = async (playerId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/registrations/${playerId}/approve`, {
        method: 'POST'
      });
      const json = await res.json();
      if (json.success) {
        // Refresh local state
        setPlayers(prev =>
          prev.map(p => (p.id === playerId ? { ...p, registration_status: 'approved', rejection_reason: null } : p))
        );
        if (selectedPlayer?.id === playerId) {
          setSelectedPlayer(prev => (prev ? { ...prev, registration_status: 'approved', rejection_reason: null } : null));
        }
      } else {
        alert(json.error || 'Failed to approve registration');
      }
    } catch (err) {
      alert('Error approving registration');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingPlayer || !rejectionReason.trim()) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/registrations/${rejectingPlayer.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason.trim() })
      });
      const json = await res.json();
      if (json.success) {
        setPlayers(prev =>
          prev.map(p =>
            p.id === rejectingPlayer.id
              ? { ...p, registration_status: 'rejected', rejection_reason: rejectionReason.trim() }
              : p
          )
        );
        if (selectedPlayer?.id === rejectingPlayer.id) {
          setSelectedPlayer(prev =>
            prev ? { ...prev, registration_status: 'rejected', rejection_reason: rejectionReason.trim() } : null
          );
        }
        setRejectingPlayer(null);
        setRejectionReason('');
      } else {
        alert(json.error || 'Failed to reject registration');
      }
    } catch (err) {
      alert('Error rejecting registration');
    } finally {
      setActionLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = [
      'Registration ID',
      'Name',
      'Email',
      'Mobile',
      'Role',
      'Batting',
      'Bowling',
      'City',
      'Payment Status',
      'UTR',
      'Registration Status'
    ];
    const rows = players.map(p => [
      p.registration_id,
      p.full_name,
      p.email,
      p.mobile,
      p.playing_role,
      p.batting_style,
      p.bowling_arm,
      p.city,
      p.payment?.payment_status || 'N/A',
      p.payment?.utr_number || 'N/A',
      p.registration_status
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.map(x => `"${x}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CAL_Players_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-dark tracking-tight">
            Player Registration Management
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
            Review submitted profiles, examine cricket experience, and manage eligibility approval.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-brand-border text-xs font-semibold text-brand-dark hover:bg-gray-50 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-primary-green" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={fetchPlayers}
            className="p-2 rounded-lg bg-white border border-brand-border text-brand-dark hover:bg-gray-50 transition-colors shadow-xs"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4 text-primary-green" />
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-brand-border rounded-xl p-4 shadow-xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by player name, registration ID, mobile, or city..."
            className="w-full h-10 pl-10 pr-3.5 rounded-lg border border-brand-border text-xs sm:text-sm text-brand-dark bg-white focus-ring"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Players' },
            { id: 'verified', label: 'Verified Payments' },
            { id: 'pending', label: 'Pending Payments' },
            { id: 'rejected', label: 'Rejected Payments' },
            { id: 'batsman', label: 'Batsmen' },
            { id: 'bowler', label: 'Bowlers' },
            { id: 'all_rounder', label: 'All-Rounders' },
            { id: 'wicketkeeper', label: 'Wicketkeepers' }
          ].map(f => {
            const active = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors shrink-0 whitespace-nowrap ${
                  active
                    ? 'bg-primary-green text-white shadow-xs'
                    : 'bg-gray-100 text-brand-muted hover:text-brand-dark hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Players List - Mobile Cards & Desktop Table */}
      {loading ? (
        <div className="py-20 text-center space-y-2 bg-white rounded-xl border border-brand-border">
          <Loader2 className="w-7 h-7 animate-spin text-primary-green mx-auto" />
          <p className="text-xs text-brand-muted">Fetching players roster...</p>
        </div>
      ) : players.length === 0 ? (
        <div className="py-16 text-center space-y-2 bg-white rounded-xl border border-brand-border p-6">
          <p className="text-sm font-semibold text-brand-dark">No player records found</p>
          <p className="text-xs text-brand-muted">Try clearing the search query or changing active filters.</p>
        </div>
      ) : (
        <>
          {/* Mobile Responsive Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-3.5">
            {players.map(player => (
              <div
                key={player.id}
                className="bg-white border border-brand-border rounded-xl p-4 shadow-xs space-y-3"
              >
                {/* Header: Photo, Name, Reg ID, Role */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={
                        player.profile_photo_path ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                      }
                      alt={player.full_name}
                      className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-brand-dark truncate">{player.full_name}</h3>
                      <span className="font-mono text-xs font-semibold text-primary-green block">
                        {player.registration_id}
                      </span>
                      <span className="text-[11px] text-brand-muted truncate block">
                        {player.email}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase bg-light-green text-primary-green border border-primary-green/20 shrink-0">
                    {player.playing_role.replace('_', ' ')}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2.5 text-xs py-2.5 px-3 bg-gray-50/80 rounded-lg border border-gray-100">
                  <div>
                    <span className="text-brand-muted text-[11px] block">City & Phone:</span>
                    <span className="font-medium text-brand-dark block">{player.city}</span>
                    <span className="font-mono text-brand-muted text-[11px]">{player.mobile}</span>
                  </div>
                  <div>
                    <span className="text-brand-muted text-[11px] block">Batting & Bowling:</span>
                    <span className="font-semibold text-brand-dark block">
                      {player.batting_style === 'right_hand' ? 'Right Hand Bat' : 'Left Hand Bat'}
                    </span>
                    <span className="text-[11px] text-brand-muted block">
                      {player.bowling_arm === 'do_not_bowl' ? 'Do not bowl' : `${player.bowling_arm === 'right_arm' ? 'Right Arm' : 'Left Arm'} • ${player.bowling_type.replace('_', ' ')}`}
                    </span>
                  </div>
                  <div className="pt-1.5 border-t border-gray-200/60">
                    <span className="text-brand-muted text-[11px] block">Payment:</span>
                    {player.payment?.payment_status === 'verified' ? (
                      <span className="font-semibold text-green-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Verified (₹500)
                      </span>
                    ) : player.payment?.payment_status === 'rejected' ? (
                      <span className="font-semibold text-red-600 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Rejected
                      </span>
                    ) : (
                      <span className="font-semibold text-amber-600 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Pending
                      </span>
                    )}
                  </div>
                  <div className="pt-1.5 border-t border-gray-200/60">
                    <span className="text-brand-muted text-[11px] block">Reg Status:</span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold capitalize ${
                        player.registration_status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : player.registration_status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-200 text-brand-dark'
                      }`}
                    >
                      {player.registration_status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Mobile Action Buttons */}
                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    onClick={() => setSelectedPlayer(player)}
                    className="flex-1 h-9 rounded-lg border border-brand-border bg-white hover:bg-gray-50 text-xs font-semibold text-brand-dark flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-brand-muted" />
                    <span>View Dossier</span>
                  </button>

                  {player.registration_status !== 'approved' && (
                    <button
                      onClick={() => handleApprove(player.id)}
                      disabled={actionLoading}
                      className="px-3.5 h-9 rounded-lg bg-primary-green hover:bg-primary-dark text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
                      title="Approve player"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  )}

                  {player.registration_status !== 'rejected' && (
                    <button
                      onClick={() => setRejectingPlayer(player)}
                      className="px-3 h-9 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Reject player"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (Visible on lg and above) */}
          <div className="hidden lg:block bg-white border border-brand-border rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-brand-border text-brand-muted font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-4 text-left whitespace-nowrap min-w-[200px]">Player</th>
                    <th className="py-3.5 px-4 text-left whitespace-nowrap min-w-[140px]">Registration ID</th>
                    <th className="py-3.5 px-4 text-left whitespace-nowrap min-w-[120px]">Role</th>
                    <th className="py-3.5 px-4 text-left whitespace-nowrap min-w-[150px]">Mobile & City</th>
                    <th className="py-3.5 px-4 text-left whitespace-nowrap min-w-[180px]">Batting / Bowling</th>
                    <th className="py-3.5 px-4 text-left whitespace-nowrap min-w-[130px]">Payment</th>
                    <th className="py-3.5 px-4 text-left whitespace-nowrap min-w-[120px]">Reg Status</th>
                    <th className="py-3.5 px-4 text-right whitespace-nowrap min-w-[190px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {players.map(player => (
                    <tr key={player.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              player.profile_photo_path ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                            }
                            alt={player.full_name}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-sm text-brand-dark block whitespace-nowrap">{player.full_name}</span>
                            <span className="text-[11px] text-brand-muted block whitespace-nowrap">{player.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-primary-green whitespace-nowrap">
                        {player.registration_id}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-light-green text-primary-green border border-primary-green/20 capitalize">
                          {player.playing_role.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-brand-dark font-medium block whitespace-nowrap">{player.mobile}</span>
                        <span className="text-[11px] text-brand-muted block">{player.city}</span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-brand-dark">
                          {player.batting_style === 'right_hand' ? 'Right Hand Bat' : 'Left Hand Bat'}
                        </div>
                        <div className="text-[11px] text-brand-muted mt-0.5">
                          {player.bowling_arm === 'do_not_bowl'
                            ? 'Do not bowl'
                            : `${player.bowling_arm === 'right_arm' ? 'Right Arm' : 'Left Arm'} • ${player.bowling_type.replace('_', ' ')}`}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {player.payment?.payment_status === 'verified' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified
                          </span>
                        ) : player.payment?.payment_status === 'rejected' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                            <XCircle className="w-3.5 h-3.5 text-red-600" /> Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                            player.registration_status === 'approved'
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : player.registration_status === 'rejected'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-gray-100 text-brand-dark border border-gray-200'
                          }`}
                        >
                          {player.registration_status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap min-w-[190px]">
                        <button
                          onClick={() => setSelectedPlayer(player)}
                          className="px-2.5 py-1.5 rounded-lg border border-brand-border bg-white hover:bg-gray-50 text-brand-dark font-semibold text-xs transition-colors shadow-xs"
                        >
                          View
                        </button>
                        {player.registration_status !== 'approved' && (
                          <button
                            onClick={() => handleApprove(player.id)}
                            disabled={actionLoading}
                            className="px-3 py-1.5 rounded-lg bg-primary-green hover:bg-primary-dark text-white font-semibold text-xs transition-colors shadow-xs"
                          >
                            Approve
                          </button>
                        )}
                        {player.registration_status !== 'rejected' && (
                          <button
                            onClick={() => setRejectingPlayer(player)}
                            className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs transition-colors"
                          >
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ============================================================================== */}
      {/* FULL PLAYER DOSSIER MODAL */}
      {/* ============================================================================== */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-brand-border animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-light-green text-primary-green flex items-center justify-center font-bold">
                  {selectedPlayer.full_name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-base text-brand-dark leading-tight">
                    {selectedPlayer.full_name}
                  </h3>
                  <span className="font-mono text-xs font-semibold text-primary-green">
                    {selectedPlayer.registration_id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlayer(null)}
                className="p-1.5 rounded-lg text-brand-muted hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5 text-xs sm:text-sm">
              {/* Photo & Core Bio */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-xl bg-gray-50 border border-brand-border">
                <img
                  src={
                    selectedPlayer.profile_photo_path ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
                  }
                  alt={selectedPlayer.full_name}
                  className="w-20 h-20 rounded-xl object-cover border border-gray-200 shadow-xs"
                />
                <div className="space-y-1 text-center sm:text-left flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="font-bold text-base text-brand-dark">{selectedPlayer.full_name}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-light-green text-primary-green border border-primary-green/20 uppercase">
                      {selectedPlayer.playing_role.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-brand-muted flex items-center justify-center sm:justify-start gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{selectedPlayer.city} • {selectedPlayer.address}</span>
                  </p>
                  <p className="text-brand-muted flex items-center justify-center sm:justify-start gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{selectedPlayer.mobile} • {selectedPlayer.email}</span>
                  </p>
                </div>
              </div>

              {/* Cricket Technical Profile */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-primary-green">
                  Cricket Technical Profile
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-[11px] text-brand-muted block">Batting Style</span>
                    <span className="font-semibold text-brand-dark capitalize">
                      {selectedPlayer.batting_style.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-[11px] text-brand-muted block">Bowling Arm</span>
                    <span className="font-semibold text-brand-dark capitalize">
                      {selectedPlayer.bowling_arm.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-[11px] text-brand-muted block">Bowling Type</span>
                    <span className="font-semibold text-brand-dark capitalize">
                      {selectedPlayer.bowling_type.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Prior League Record (shown only if provided) */}
                {(selectedPlayer.previous_team_name || selectedPlayer.previous_tournament_name || selectedPlayer.additional_information) && (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
                    {selectedPlayer.previous_team_name && (
                      <div className="flex justify-between">
                        <span className="text-brand-muted">Previous Club / Team:</span>
                        <span className="font-medium text-brand-dark">
                          {selectedPlayer.previous_team_name} {selectedPlayer.previous_captain_name ? `(Capt: ${selectedPlayer.previous_captain_name})` : ''}
                        </span>
                      </div>
                    )}
                    {selectedPlayer.previous_tournament_name && (
                      <div className="flex justify-between">
                        <span className="text-brand-muted">Prior Tournament:</span>
                        <span className="font-medium text-brand-dark">
                          {selectedPlayer.previous_tournament_name}
                        </span>
                      </div>
                    )}
                    {selectedPlayer.additional_information && (
                      <div className="pt-1 text-[11px] text-brand-muted">
                        <strong>Remarks / Accolades:</strong> {selectedPlayer.additional_information}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Emergency Contact */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-primary-green">
                  Emergency Contact Details
                </h4>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-brand-dark">{selectedPlayer.emergency_contact_name}</span>
                    <span className="text-xs text-brand-muted ml-2">({selectedPlayer.emergency_relationship})</span>
                  </div>
                  <span className="font-mono font-medium text-brand-dark">{selectedPlayer.emergency_mobile}</span>
                </div>
              </div>

              {/* Payment Receipt Preview */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-primary-green">
                  Submitted Payment Receipt
                </h4>
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-brand-muted">UTR Reference:</span>
                      <span className="font-mono font-bold text-brand-dark">
                        {selectedPlayer.payment?.utr_number || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-brand-muted">Amount:</span>
                      <span className="font-semibold text-primary-green">₹{selectedPlayer.payment?.amount || 500}</span>
                      <span className="text-brand-muted">• UPI</span>
                    </div>
                  </div>

                  {selectedPlayer.payment?.screenshot_path && (
                    <a
                      href={selectedPlayer.payment.screenshot_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg border border-brand-border bg-white hover:bg-gray-100 text-xs font-semibold text-brand-dark flex items-center gap-1.5 shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-primary-green" />
                      <span>View Screenshot</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedPlayer(null)}
                  className="px-4 py-2 rounded-lg border border-brand-border text-brand-dark font-medium hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>

                {selectedPlayer.registration_status !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => {
                      setRejectingPlayer(selectedPlayer);
                      setSelectedPlayer(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors"
                  >
                    Reject Registration
                  </button>
                )}

                {selectedPlayer.registration_status !== 'approved' && (
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedPlayer.id)}
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-lg bg-primary-green hover:bg-primary-dark text-white font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Registration</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* REJECTION REASON DIALOG */}
      {/* ============================================================================== */}
      {rejectingPlayer && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleRejectSubmit}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-brand-border space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-brand-dark">Reject Player Registration</h3>
                <p className="text-xs text-brand-muted">{rejectingPlayer.full_name} ({rejectingPlayer.registration_id})</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-dark mb-1">
                Mandatory Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="e.g. Invalid identification, disqualified due to duplicate entry, incomplete profile"
                className="w-full p-3 rounded-lg border border-brand-border text-xs sm:text-sm text-brand-dark bg-white focus-ring"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRejectingPlayer(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 rounded-lg border border-brand-border text-brand-dark font-medium text-xs hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading || !rejectionReason.trim()}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs disabled:opacity-60"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                <span>Confirm Rejection</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

