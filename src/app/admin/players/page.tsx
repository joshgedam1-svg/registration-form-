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
  ExternalLink,
  Plus,
  Trash2,
  Edit,
  ShieldAlert,
  UserPlus,
  CheckSquare,
  Square
} from 'lucide-react';
import { PlayerWithPayment } from '@/types/player';
import { formatDate } from '@/lib/utils/format';

export default function PlayersAdminPage() {
  const [players, setPlayers] = useState<PlayerWithPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerWithPayment | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Multi-Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<PlayerWithPayment | null>(null);
  const [deletingPlayer, setDeletingPlayer] = useState<PlayerWithPayment | null>(null);
  const [isDeleteSelectedModalOpen, setIsDeleteSelectedModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [deleteAllConfirmText, setDeleteAllConfirmText] = useState('');

  // Rejection Dialog State
  const [rejectingPlayer, setRejectingPlayer] = useState<PlayerWithPayment | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Add Player Form State
  const [addForm, setAddForm] = useState({
    full_name: '',
    email: '',
    mobile: '',
    date_of_birth: '2000-01-01',
    city: '',
    address: '',
    playing_role: 'batsman',
    batting_style: 'right_hand',
    bowling_arm: 'right_arm',
    bowling_type: 'medium',
    payment_status: 'verified',
    amount: 500,
    utr_number: ''
  });

  // Edit Player Form State
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    mobile: '',
    city: '',
    address: '',
    playing_role: 'batsman',
    batting_style: 'right_hand',
    bowling_arm: 'right_arm',
    bowling_type: 'medium',
    registration_status: 'approved'
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, message });
    setTimeout(() => setToastMessage(null), 4000);
  };

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

  // Selection helpers
  const toggleSelectAll = () => {
    if (selectedIds.size === players.length && players.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(players.map(p => p.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  // ==============================================================================
  // CREATE (Add Player)
  // ==============================================================================
  const handleAddPlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const res = await fetch('/api/admin/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm)
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showToast(`Player ${addForm.full_name} added successfully!`);
        setIsAddModalOpen(false);
        setAddForm({
          full_name: '',
          email: '',
          mobile: '',
          date_of_birth: '2000-01-01',
          city: '',
          address: '',
          playing_role: 'batsman',
          batting_style: 'right_hand',
          bowling_arm: 'right_arm',
          bowling_type: 'medium',
          payment_status: 'verified',
          amount: 500,
          utr_number: ''
        });
        fetchPlayers();
      } else {
        alert(json.error || 'Failed to add player');
      }
    } catch (err) {
      alert('Error creating player');
    } finally {
      setActionLoading(false);
    }
  };

  // ==============================================================================
  // UPDATE (Edit Player)
  // ==============================================================================
  const openEditModal = (player: PlayerWithPayment) => {
    setEditingPlayer(player);
    setEditForm({
      full_name: player.full_name,
      email: player.email,
      mobile: player.mobile,
      city: player.city,
      address: player.address,
      playing_role: player.playing_role,
      batting_style: player.batting_style,
      bowling_arm: player.bowling_arm,
      bowling_type: player.bowling_type,
      registration_status: player.registration_status
    });
  };

  const handleEditPlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/admin/players/${editingPlayer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showToast(`Profile for ${editForm.full_name} updated successfully!`);
        setPlayers(prev =>
          prev.map(p => (p.id === editingPlayer.id ? ({ ...p, ...editForm } as PlayerWithPayment) : p))
        );
        if (selectedPlayer?.id === editingPlayer.id) {
          setSelectedPlayer(prev => (prev ? ({ ...prev, ...editForm } as PlayerWithPayment) : null));
        }
        setEditingPlayer(null);
      } else {
        alert(json.error || 'Failed to update player');
      }
    } catch (err) {
      alert('Error updating player');
    } finally {
      setActionLoading(false);
    }
  };

  // ==============================================================================
  // DELETE (Single Player)
  // ==============================================================================
  const handleDeleteSingle = async () => {
    if (!deletingPlayer) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/admin/players/${deletingPlayer.id}`, {
        method: 'DELETE'
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showToast(`Player ${deletingPlayer.full_name} deleted.`);
        setPlayers(prev => prev.filter(p => p.id !== deletingPlayer.id));
        if (selectedIds.has(deletingPlayer.id)) {
          const next = new Set(selectedIds);
          next.delete(deletingPlayer.id);
          setSelectedIds(next);
        }
        if (selectedPlayer?.id === deletingPlayer.id) {
          setSelectedPlayer(null);
        }
        setDeletingPlayer(null);
      } else {
        alert(json.error || 'Failed to delete player');
      }
    } catch (err) {
      alert('Error deleting player');
    } finally {
      setActionLoading(false);
    }
  };

  // ==============================================================================
  // BULK DELETE (Selected Players)
  // ==============================================================================
  const handleDeleteSelected = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setActionLoading(true);

    try {
      const res = await fetch('/api/admin/players', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showToast(`Successfully deleted ${ids.length} selected players.`);
        setPlayers(prev => prev.filter(p => !selectedIds.has(p.id)));
        setSelectedIds(new Set());
        setIsDeleteSelectedModalOpen(false);
      } else {
        alert(json.error || 'Failed to delete selected players');
      }
    } catch (err) {
      alert('Error during bulk deletion');
    } finally {
      setActionLoading(false);
    }
  };

  // ==============================================================================
  // DELETE ALL PLAYERS
  // ==============================================================================
  const handleDeleteAll = async () => {
    if (deleteAllConfirmText !== 'DELETE ALL') {
      alert('Please type DELETE ALL exactly to confirm.');
      return;
    }
    setActionLoading(true);

    try {
      const res = await fetch('/api/admin/players', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showToast('All player registrations have been deleted.');
        setPlayers([]);
        setSelectedIds(new Set());
        setIsDeleteAllModalOpen(false);
        setDeleteAllConfirmText('');
      } else {
        alert(json.error || 'Failed to delete all players');
      }
    } catch (err) {
      alert('Error deleting all players');
    } finally {
      setActionLoading(false);
    }
  };

  // Status Approvals
  const handleApprove = async (playerId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/registrations/${playerId}/approve`, {
        method: 'POST'
      });
      const json = await res.json();
      if (json.success) {
        setPlayers(prev =>
          prev.map(p => (p.id === playerId ? { ...p, registration_status: 'approved', rejection_reason: null } : p))
        );
        if (selectedPlayer?.id === playerId) {
          setSelectedPlayer(prev => (prev ? { ...prev, registration_status: 'approved', rejection_reason: null } : null));
        }
        showToast('Player approved successfully!');
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
        showToast('Player registration rejected.');
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

  const isAllSelected = players.length > 0 && selectedIds.size === players.length;

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className={`p-4 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2.5 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : 'bg-red-900 text-white border-red-700'
          }`}>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{toastMessage.message}</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-brand-border rounded-2xl p-5 sm:p-6 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
            Player Roster & Management
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
            Full CRUD controls: create players, edit records, manage approvals, and bulk delete.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Add Player Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-green hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-xs active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Player</span>
          </button>

          {/* Delete All Button */}
          {players.length > 0 && (
            <button
              onClick={() => setIsDeleteAllModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-all shadow-xs active:scale-95"
              title="Delete all registered players"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span>Delete All</span>
            </button>
          )}

          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-brand-border text-xs font-semibold text-brand-dark transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-primary-green" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={fetchPlayers}
            className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-brand-border text-brand-dark transition-colors shadow-xs"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4 text-primary-green" />
          </button>
        </div>
      </div>

      {/* Floating / Sticky Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-16 z-30 p-3.5 bg-brand-dark text-white rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-200 border border-white/10">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-primary-green text-white font-bold text-xs flex items-center justify-center font-mono">
              {selectedIds.size}
            </span>
            <span className="text-xs sm:text-sm font-semibold">
              {selectedIds.size} player{selectedIds.size > 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={deselectAll}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              Deselect All
            </button>
            <button
              onClick={() => setIsDeleteSelectedModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.size})</span>
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-brand-border rounded-2xl p-4 shadow-xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by player name, registration ID, mobile, or city..."
            className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-brand-border text-xs sm:text-sm text-brand-dark bg-white focus-ring"
          />
        </div>

        {/* Filter Chips + Select All Helper on Mobile */}
        <div className="flex items-center justify-between gap-2 pt-1 overflow-x-auto pb-1">
          <div className="flex items-center gap-1.5 shrink-0">
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

          {/* Quick Select All Toggle */}
          {players.length > 0 && (
            <button
              onClick={toggleSelectAll}
              className="text-xs font-semibold text-primary-green hover:underline whitespace-nowrap shrink-0 ml-2"
            >
              {isAllSelected ? 'Deselect All' : `Select All (${players.length})`}
            </button>
          )}
        </div>
      </div>

      {/* Players List */}
      {loading ? (
        <div className="py-20 text-center space-y-2 bg-white rounded-2xl border border-brand-border">
          <Loader2 className="w-7 h-7 animate-spin text-primary-green mx-auto" />
          <p className="text-xs text-brand-muted">Fetching players roster...</p>
        </div>
      ) : players.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-brand-border p-6">
          <UserX className="w-10 h-10 text-brand-muted mx-auto" />
          <p className="text-sm font-bold text-brand-dark">No players match the criteria</p>
          <p className="text-xs text-brand-muted">Try adjusting your filters, search terms, or add a new player.</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-green text-white text-xs font-bold transition-all shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Player Now</span>
          </button>
        </div>
      ) : (
        <>
          {/* Mobile Responsive Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-3.5">
            {players.map(player => {
              const isSelected = selectedIds.has(player.id);
              return (
                <div
                  key={player.id}
                  className={`bg-white border rounded-2xl p-4 shadow-xs space-y-3 transition-all ${
                    isSelected
                      ? 'border-primary-green ring-2 ring-primary-green/20 bg-light-green/10'
                      : 'border-brand-border'
                  }`}
                >
                  {/* Header: Checkbox + Photo + Name + Role */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(player.id)}
                        className="w-4 h-4 accent-primary-green rounded cursor-pointer shrink-0 mt-0.5"
                      />
                      <img
                        src={
                          player.profile_photo_path ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                        }
                        alt={player.full_name}
                        className="w-11 h-11 rounded-xl object-cover border border-gray-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-brand-dark truncate">{player.full_name}</h3>
                        <span className="font-mono text-xs font-bold text-primary-green block">
                          {player.registration_id}
                        </span>
                        <span className="text-[11px] text-brand-muted truncate block">
                          {player.email}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-light-green text-primary-green border border-primary-green/20 shrink-0">
                      {player.playing_role.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs py-2.5 px-3 bg-gray-50/80 rounded-xl border border-gray-100">
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
                        {player.bowling_arm === 'do_not_bowl'
                          ? 'Do not bowl'
                          : `${player.bowling_arm === 'right_arm' ? 'Right Arm' : 'Left Arm'} • ${player.bowling_type.replace('_', ' ')}`}
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

                  {/* Mobile Actions: View, Edit, Approve, Reject, Delete */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <button
                      onClick={() => setSelectedPlayer(player)}
                      className="flex-1 h-8 rounded-lg border border-brand-border bg-white hover:bg-gray-50 text-xs font-semibold text-brand-dark flex items-center justify-center gap-1 transition-colors shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-brand-muted" />
                      <span>View</span>
                    </button>

                    <button
                      onClick={() => openEditModal(player)}
                      className="px-2.5 h-8 rounded-lg border border-brand-border bg-white hover:bg-gray-50 text-xs font-semibold text-blue-700 flex items-center gap-1 transition-colors shadow-2xs"
                      title="Edit player profile"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    {player.registration_status !== 'approved' && (
                      <button
                        onClick={() => handleApprove(player.id)}
                        disabled={actionLoading}
                        className="px-2.5 h-8 rounded-lg bg-primary-green hover:bg-primary-dark text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                        title="Approve player"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}

                    {player.registration_status !== 'rejected' && (
                      <button
                        onClick={() => setRejectingPlayer(player)}
                        className="px-2 h-8 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Reject player"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => setDeletingPlayer(player)}
                      className="px-2 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Delete player"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-white border border-brand-border rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-brand-border text-brand-muted font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 accent-primary-green rounded cursor-pointer"
                        title="Select/Deselect All"
                      />
                    </th>
                    <th className="py-3.5 px-4 text-left whitespace-nowrap min-w-[190px]">Player</th>
                    <th className="py-3.5 px-4 text-left whitespace-nowrap min-w-[140px]">Registration ID</th>
                    <th className="py-3.5 px-4 text-left whitespace-nowrap min-w-[110px]">Role</th>
                    <th className="py-3.5 px-4 text-left whitespace-nowrap min-w-[140px]">Mobile & City</th>
                    <th className="py-3.5 px-4 text-left whitespace-nowrap min-w-[170px]">Batting / Bowling</th>
                    <th className="py-3.5 px-4 text-left whitespace-nowrap min-w-[120px]">Payment</th>
                    <th className="py-3.5 px-4 text-left whitespace-nowrap min-w-[110px]">Reg Status</th>
                    <th className="py-3.5 px-4 text-right whitespace-nowrap min-w-[210px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {players.map(player => {
                    const isSelected = selectedIds.has(player.id);
                    return (
                      <tr
                        key={player.id}
                        className={`transition-colors ${
                          isSelected ? 'bg-light-green/20' : 'hover:bg-gray-50/70'
                        }`}
                      >
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(player.id)}
                            className="w-4 h-4 accent-primary-green rounded cursor-pointer"
                          />
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                player.profile_photo_path ||
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                              }
                              alt={player.full_name}
                              className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0"
                            />
                            <div>
                              <span className="font-bold text-sm text-brand-dark block whitespace-nowrap">
                                {player.full_name}
                              </span>
                              <span className="text-[11px] text-brand-muted block whitespace-nowrap">
                                {player.email}
                              </span>
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

                        {/* Full CRUD Actions on Desktop */}
                        <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap min-w-[210px]">
                          <button
                            onClick={() => setSelectedPlayer(player)}
                            className="px-2.5 py-1.5 rounded-lg border border-brand-border bg-white hover:bg-gray-50 text-brand-dark font-semibold text-xs transition-colors shadow-2xs"
                            title="View full player dossier"
                          >
                            View
                          </button>

                          <button
                            onClick={() => openEditModal(player)}
                            className="px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-blue-700 font-semibold text-xs transition-colors"
                            title="Edit player record"
                          >
                            Edit
                          </button>

                          {player.registration_status !== 'approved' && (
                            <button
                              onClick={() => handleApprove(player.id)}
                              disabled={actionLoading}
                              className="px-2.5 py-1.5 rounded-lg bg-primary-green hover:bg-primary-dark text-white font-semibold text-xs transition-colors shadow-2xs"
                              title="Approve player"
                            >
                              Approve
                            </button>
                          )}

                          {player.registration_status !== 'rejected' && (
                            <button
                              onClick={() => setRejectingPlayer(player)}
                              className="px-2 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-xs transition-colors"
                              title="Reject player registration"
                            >
                              Reject
                            </button>
                          )}

                          <button
                            onClick={() => setDeletingPlayer(player)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors inline-flex items-center"
                            title="Delete player"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ============================================================================== */}
      {/* MODAL 1: ADD NEW PLAYER (CREATE) */}
      {/* ============================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-brand-border max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-light-green text-primary-green flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-brand-dark">Add New Player Registration</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-brand-muted hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPlayerSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-brand-dark mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.full_name}
                    onChange={e => setAddForm({ ...addForm, full_name: e.target.value })}
                    placeholder="e.g. Virat Kohli"
                    className="w-full h-10 px-3 rounded-lg border border-brand-border text-xs text-brand-dark focus-ring"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-dark mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={addForm.email}
                    onChange={e => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="virat@example.com"
                    className="w-full h-10 px-3 rounded-lg border border-brand-border text-xs text-brand-dark focus-ring"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-dark mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={addForm.mobile}
                    onChange={e => setAddForm({ ...addForm, mobile: e.target.value })}
                    placeholder="9876543210"
                    className="w-full h-10 px-3 rounded-lg border border-brand-border text-xs text-brand-dark focus-ring"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-dark mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.city}
                    onChange={e => setAddForm({ ...addForm, city: e.target.value })}
                    placeholder="e.g. Delhi"
                    className="w-full h-10 px-3 rounded-lg border border-brand-border text-xs text-brand-dark focus-ring"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-dark mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={addForm.address}
                  onChange={e => setAddForm({ ...addForm, address: e.target.value })}
                  placeholder="Street / Area"
                  className="w-full h-10 px-3 rounded-lg border border-brand-border text-xs text-brand-dark focus-ring"
                />
              </div>

              {/* Cricket Capabilities */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-brand-dark mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={addForm.playing_role}
                    onChange={e => setAddForm({ ...addForm, playing_role: e.target.value })}
                    className="w-full h-9 px-2 rounded-lg border border-brand-border text-xs text-brand-dark bg-white"
                  >
                    <option value="batsman">Batsman</option>
                    <option value="bowler">Bowler</option>
                    <option value="all_rounder">All-Rounder</option>
                    <option value="wicketkeeper">Wicketkeeper</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-brand-dark mb-1">
                    Batting
                  </label>
                  <select
                    value={addForm.batting_style}
                    onChange={e => setAddForm({ ...addForm, batting_style: e.target.value })}
                    className="w-full h-9 px-2 rounded-lg border border-brand-border text-xs text-brand-dark bg-white"
                  >
                    <option value="right_hand">Right Hand</option>
                    <option value="left_hand">Left Hand</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-brand-dark mb-1">
                    Bowling Arm
                  </label>
                  <select
                    value={addForm.bowling_arm}
                    onChange={e => setAddForm({ ...addForm, bowling_arm: e.target.value })}
                    className="w-full h-9 px-2 rounded-lg border border-brand-border text-xs text-brand-dark bg-white"
                  >
                    <option value="right_arm">Right Arm</option>
                    <option value="left_arm">Left Arm</option>
                    <option value="do_not_bowl">Do Not Bowl</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-brand-dark mb-1">
                    Bowling Craft
                  </label>
                  <select
                    value={addForm.bowling_type}
                    onChange={e => setAddForm({ ...addForm, bowling_type: e.target.value })}
                    className="w-full h-9 px-2 rounded-lg border border-brand-border text-xs text-brand-dark bg-white"
                  >
                    <option value="fast">Fast</option>
                    <option value="medium">Medium</option>
                    <option value="spin">Spin</option>
                    <option value="not_applicable">None</option>
                  </select>
                </div>
              </div>

              {/* Payment Status & UTR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-brand-dark mb-1">
                    Payment Status
                  </label>
                  <select
                    value={addForm.payment_status}
                    onChange={e => setAddForm({ ...addForm, payment_status: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-brand-border text-xs text-brand-dark bg-white"
                  >
                    <option value="verified">Verified (₹500 Paid)</option>
                    <option value="pending_verification">Pending Verification</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-dark mb-1">
                    UTR Reference (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={12}
                    value={addForm.utr_number}
                    onChange={e => setAddForm({ ...addForm, utr_number: e.target.value })}
                    placeholder="12-digit UTR"
                    className="w-full h-10 px-3 rounded-lg border border-brand-border text-xs font-mono text-brand-dark focus-ring"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-muted hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-primary-green hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-xs"
                >
                  {actionLoading ? 'Creating...' : 'Register Player'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* MODAL 2: EDIT PLAYER PROFILE (UPDATE) */}
      {/* ============================================================================== */}
      {editingPlayer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-brand-border max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-base text-brand-dark">Edit Player Record</h3>
                <span className="font-mono text-xs font-bold text-primary-green">
                  {editingPlayer.registration_id}
                </span>
              </div>
              <button
                onClick={() => setEditingPlayer(null)}
                className="p-1 rounded-lg text-brand-muted hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditPlayerSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-brand-dark mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.full_name}
                    onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-brand-border text-xs text-brand-dark focus-ring"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-dark mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-brand-border text-xs text-brand-dark focus-ring"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-dark mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={editForm.mobile}
                    onChange={e => setEditForm({ ...editForm, mobile: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-brand-border text-xs text-brand-dark focus-ring"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-dark mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.city}
                    onChange={e => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-brand-border text-xs text-brand-dark focus-ring"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-dark mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-brand-border text-xs text-brand-dark focus-ring"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-brand-dark mb-1">
                    Playing Role
                  </label>
                  <select
                    value={editForm.playing_role}
                    onChange={e => setEditForm({ ...editForm, playing_role: e.target.value })}
                    className="w-full h-9 px-2 rounded-lg border border-brand-border text-xs text-brand-dark bg-white"
                  >
                    <option value="batsman">Batsman</option>
                    <option value="bowler">Bowler</option>
                    <option value="all_rounder">All-Rounder</option>
                    <option value="wicketkeeper">Wicketkeeper</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-brand-dark mb-1">
                    Batting
                  </label>
                  <select
                    value={editForm.batting_style}
                    onChange={e => setEditForm({ ...editForm, batting_style: e.target.value })}
                    className="w-full h-9 px-2 rounded-lg border border-brand-border text-xs text-brand-dark bg-white"
                  >
                    <option value="right_hand">Right Hand</option>
                    <option value="left_hand">Left Hand</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-brand-dark mb-1">
                    Bowling Arm
                  </label>
                  <select
                    value={editForm.bowling_arm}
                    onChange={e => setEditForm({ ...editForm, bowling_arm: e.target.value })}
                    className="w-full h-9 px-2 rounded-lg border border-brand-border text-xs text-brand-dark bg-white"
                  >
                    <option value="right_arm">Right Arm</option>
                    <option value="left_arm">Left Arm</option>
                    <option value="do_not_bowl">Do Not Bowl</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-brand-dark mb-1">
                    Reg Status
                  </label>
                  <select
                    value={editForm.registration_status}
                    onChange={e => setEditForm({ ...editForm, registration_status: e.target.value })}
                    className="w-full h-9 px-2 rounded-lg border border-brand-border text-xs text-brand-dark bg-white"
                  >
                    <option value="approved">Approved</option>
                    <option value="under_review">Under Review</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingPlayer(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-muted hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-primary-green hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-xs"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* MODAL 3: DELETE CONFIRMATION (SINGLE PLAYER) */}
      {/* ============================================================================== */}
      {deletingPlayer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-red-200 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-brand-dark">Delete Player Registration?</h3>
              <p className="text-xs text-brand-muted">
                Are you sure you want to delete <strong>{deletingPlayer.full_name}</strong> ({deletingPlayer.registration_id})? This will permanently remove their profile and payment records.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPlayer(null)}
                className="flex-1 py-2 rounded-xl border border-brand-border text-xs font-semibold text-brand-dark hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSingle}
                disabled={actionLoading}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs"
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* MODAL 4: DELETE SELECTED CONFIRMATION (BULK) */}
      {/* ============================================================================== */}
      {isDeleteSelectedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-red-200 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-brand-dark">
                Delete {selectedIds.size} Selected Players?
              </h3>
              <p className="text-xs text-brand-muted">
                You are about to permanently delete <strong>{selectedIds.size}</strong> players and their associated payment verification records.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteSelectedModalOpen(false)}
                className="flex-1 py-2 rounded-xl border border-brand-border text-xs font-semibold text-brand-dark hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={actionLoading}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs"
              >
                {actionLoading ? 'Deleting...' : `Delete ${selectedIds.size} Players`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* MODAL 5: DELETE ALL PLAYERS CONFIRMATION */}
      {/* ============================================================================== */}
      {isDeleteAllModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-red-300 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6 text-red-600" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-red-900">Emergency: Delete All Players</h3>
              <p className="text-xs text-brand-muted">
                This will delete <strong>ALL {players.length} player registrations</strong> and clear the entire tournament docket. This action is irreversible.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-brand-dark uppercase">
                Type <span className="text-red-600">DELETE ALL</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteAllConfirmText}
                onChange={e => setDeleteAllConfirmText(e.target.value)}
                placeholder="DELETE ALL"
                className="w-full h-10 px-3 rounded-lg border border-red-300 font-mono text-xs text-red-900 bg-red-50/50 focus-ring"
              />
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteAllModalOpen(false);
                  setDeleteAllConfirmText('');
                }}
                className="flex-1 py-2 rounded-xl border border-brand-border text-xs font-semibold text-brand-dark hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAll}
                disabled={actionLoading || deleteAllConfirmText !== 'DELETE ALL'}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-bold shadow-xs"
              >
                {actionLoading ? 'Deleting...' : 'Confirm Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* MODAL 6: REJECTION REASON DIALOG */}
      {/* ============================================================================== */}
      {rejectingPlayer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-amber-200">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-brand-dark">Reject Registration</h3>
              </div>
              <button
                onClick={() => setRejectingPlayer(null)}
                className="p-1 rounded-lg text-brand-muted hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <p className="text-xs text-brand-muted">
                Please provide an official justification for rejecting{' '}
                <strong>{rejectingPlayer.full_name}</strong> ({rejectingPlayer.registration_id}).
              </p>

              <div>
                <label className="block text-xs font-semibold text-brand-dark mb-1">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="e.g. Invalid UTR reference, blurry payment screenshot, or age requirement not met..."
                  className="w-full p-3 rounded-lg border border-brand-border text-xs text-brand-dark focus-ring"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setRejectingPlayer(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-muted hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !rejectionReason.trim()}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* MODAL 7: VIEW PLAYER FULL DOSSIER */}
      {/* ============================================================================== */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-xl border border-brand-border max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <img
                  src={
                    selectedPlayer.profile_photo_path ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                  }
                  alt={selectedPlayer.full_name}
                  className="w-14 h-14 rounded-2xl object-cover border border-gray-200"
                />
                <div>
                  <h3 className="font-extrabold text-lg text-brand-dark">{selectedPlayer.full_name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs font-bold text-primary-green">
                      {selectedPlayer.registration_id}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs font-semibold capitalize text-brand-muted">
                      {selectedPlayer.playing_role.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const target = selectedPlayer;
                    setSelectedPlayer(null);
                    openEditModal(target);
                  }}
                  className="p-2 rounded-lg text-blue-700 hover:bg-blue-50"
                  title="Edit player"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="p-2 rounded-lg text-brand-muted hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Dossier Content */}
            <div className="space-y-4 text-xs">
              {/* Contact Information */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-primary-green">
                  Contact & Residence
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-[11px] text-brand-muted block">Phone</span>
                    <span className="font-semibold text-brand-dark font-mono">{selectedPlayer.mobile}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-[11px] text-brand-muted block">Email</span>
                    <span className="font-semibold text-brand-dark truncate block">{selectedPlayer.email}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-[11px] text-brand-muted block">City</span>
                    <span className="font-semibold text-brand-dark">{selectedPlayer.city}</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[11px] text-brand-muted block">Full Residential Address</span>
                  <p className="font-medium text-brand-dark mt-0.5 leading-relaxed">{selectedPlayer.address}</p>
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border bg-white hover:bg-gray-100 text-brand-dark font-semibold text-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Receipt Screenshot</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <button
                onClick={() => {
                  const p = selectedPlayer;
                  setSelectedPlayer(null);
                  setDeletingPlayer(p);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Player</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlayer(null)}
                  className="px-4 py-2 rounded-xl border border-brand-border text-xs font-semibold text-brand-dark hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedPlayer.registration_status !== 'approved' && (
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedPlayer.id)}
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-xl bg-primary-green hover:bg-primary-dark text-white text-xs font-bold shadow-xs"
                  >
                    Approve Registration
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
