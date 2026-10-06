import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { SupportTicket } from '../../types';
import { updateSettings as updateSettingsFB } from '../../services/firebase/settings';
import { playSound } from '../../utils/audio';
import {
  LifeBuoy,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
  User,
  Search,
  Filter,
  Check,
  X
} from 'lucide-react';

export const AdminSupportTickets: React.FC = () => {
  const { currentUser, soundEnabled, addAuditLog } = useStore();

  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    try {
      const saved = localStorage.getItem('rawat_store_support_tickets_v3');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'TCK-8921',
              userId: 'usr_demo_customer',
              username: 'demo_customer',
              email: 'collector@rawatcards.store',
              subject: 'UPI UTR Verification Timing',
              category: 'PAYMENT',
              message: 'I submitted my deposit of ₹500 via PhonePe with UTR 9821498124. How fast will the balance reflect?',
              status: 'OPEN',
              priority: 'HIGH',
              createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
            },
            {
              id: 'TCK-8922',
              userId: 'usr_1024',
              username: 'rawat_collector',
              email: 'rawatdream2026@gmail.com',
              subject: 'Card 3D Hologram Shader Inquiry',
              category: 'CARD_ISSUE',
              message: 'Can I engrave my custom moniker on the Obsidian Royale card before vault issuance?',
              status: 'IN_PROGRESS',
              priority: 'MEDIUM',
              createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
              adminReply: 'Yes, as a VIP Gold collector, custom laser engraving is included complimentary. Our vault team is preparing your instrument.',
              adminUsername: 'super_admin'
            },
            {
              id: 'TCK-8923',
              userId: 'usr_collector_99',
              username: 'vip_investor',
              email: 'vip@invest.org',
              subject: 'Discount Code Not Applying',
              category: 'ORDER',
              message: 'Tried using RAWAT20 on special edition drop, received coupon invalid alert.',
              status: 'RESOLVED',
              priority: 'LOW',
              createdAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
              resolvedAt: new Date().toISOString(),
              adminReply: 'Resolved: The coupon minimum cart was adjusted, you can now apply RAWAT20 on all tiers.',
              adminUsername: 'admin'
            }
          ];
    } catch {
      return [];
    }
  });

  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const saveTickets = async (updated: SupportTicket[]) => {
    setTickets(updated);
    try {
      await updateSettingsFB({ supportTickets: updated } as any);
    } catch (err) {
      console.warn('[Firestore Support Tickets Save]', err);
    }
  };

  const handleUpdateStatus = (ticketId: string, newStatus: SupportTicket['status']) => {
    playSound('click', soundEnabled);
    const updated = tickets.map((t) =>
      t.id === ticketId
        ? {
            ...t,
            status: newStatus,
            resolvedAt: newStatus === 'RESOLVED' ? new Date().toISOString() : t.resolvedAt
          }
        : t
    );
    saveTickets(updated);
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    setFeedback(`Ticket ${ticketId} marked as ${newStatus}`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    playSound('purchase', soundEnabled);
    const updated = tickets.map((t) =>
      t.id === selectedTicket.id
        ? {
            ...t,
            adminReply: replyText.trim(),
            adminUsername: currentUser?.username || 'admin',
            status: 'IN_PROGRESS' as const
          }
        : t
    );

    saveTickets(updated);
    setSelectedTicket((prev) =>
      prev ? { ...prev, adminReply: replyText.trim(), adminUsername: currentUser?.username || 'admin', status: 'IN_PROGRESS' } : null
    );

    addAuditLog({
      action: 'SETTINGS_UPDATED',
      targetUserId: selectedTicket.userId,
      targetUsername: selectedTicket.username,
      reason: `Replied to support ticket ${selectedTicket.id}: "${replyText.substring(0, 40)}..."`
    });

    setFeedback('Reply sent to collector.');
    setTimeout(() => setFeedback(null), 3000);
    setReplyText('');
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const openCount = tickets.filter((t) => t.status === 'OPEN').length;

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-zinc-950/80 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LifeBuoy className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">
              Collector Care & SLA Resolution Hub
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-tech text-white tracking-tight">
            Customer Support & Ticket Resolver
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Review customer payment inquiries, custom card engraving requests, and order assistance tickets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
            <span className="text-[10px] text-amber-300 block uppercase font-bold">Open Inquiries</span>
            <span className="text-xl font-bold font-tech text-white">{openCount} Pending</span>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Ticket Inbox (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-3xl bg-zinc-950/80 border border-white/10 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search inquiries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="px-2.5 py-1.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredTickets.map((ticket) => {
              const isSelected = selectedTicket?.id === ticket.id;
              return (
                <div
                  key={ticket.id}
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setSelectedTicket(ticket);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-950/30 border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-white text-xs truncate max-w-[180px]">
                      {ticket.subject}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      ticket.status === 'OPEN' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      ticket.status === 'IN_PROGRESS' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-slate-400 text-[11px] line-clamp-2 mb-2">
                    {ticket.message}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>@{ticket.username}</span>
                    <span>{new Date(ticket.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Ticket Detail & Reply (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-zinc-950/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between space-y-4">
          {selectedTicket ? (
            <div className="space-y-5">
              {/* Top Meta Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-bold">{selectedTicket.id}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-300 capitalize">{selectedTicket.category.toLowerCase().replace('_', ' ')}</span>
                  </div>
                  <h3 className="font-tech text-lg font-bold text-white mt-1">
                    {selectedTicket.subject}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {selectedTicket.status !== 'RESOLVED' ? (
                    <button
                      onClick={() => handleUpdateStatus(selectedTicket.id, 'RESOLVED')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all cursor-pointer flex items-center gap-1 shadow"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(selectedTicket.id, 'OPEN')}
                      className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 font-bold transition-all cursor-pointer"
                    >
                      Re-open Ticket
                    </button>
                  )}
                </div>
              </div>

              {/* Customer Message Box */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
                      {selectedTicket.username.substring(0, 1).toUpperCase()}
                    </div>
                    <span className="font-bold text-white">@{selectedTicket.username}</span>
                    <span className="text-slate-400">({selectedTicket.email})</span>
                  </div>
                  <span className="text-slate-500">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-slate-200 text-xs leading-relaxed">
                  {selectedTicket.message}
                </p>
              </div>

              {/* Admin Reply History */}
              {selectedTicket.adminReply && (
                <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-purple-300 font-bold">
                      ✓ Vault Support Response ({selectedTicket.adminUsername || 'Admin'})
                    </span>
                  </div>
                  <p className="text-slate-200 text-xs leading-relaxed">
                    {selectedTicket.adminReply}
                  </p>
                </div>
              )}

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="pt-2 border-t border-white/10 space-y-3">
                <label className="text-[10px] text-slate-400 uppercase font-bold block">
                  Send Response to Collector
                </label>
                <textarea
                  rows={3}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type official response, solution, or verification confirmation..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500 resize-none"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reply</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-600" />
              <p>Select an inquiry from the inbox to review & resolve.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
