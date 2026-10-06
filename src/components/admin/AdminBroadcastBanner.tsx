import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { StoreAnnouncement, VIPTier } from '../../types';
import { updateSettings as updateSettingsFB } from '../../services/firebase/settings';
import { playSound } from '../../utils/audio';
import {
  Megaphone,
  Sparkles,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Bell,
  Send,
  Radio,
  Mail,
  RefreshCw,
  Users
} from 'lucide-react';

export const AdminBroadcastBanner: React.FC = () => {
  const { soundEnabled, addAuditLog, users, sendAdminAnnouncementEmail } = useStore();

  const [announcements, setAnnouncements] = useState<StoreAnnouncement[]>(() => {
    try {
      const saved = localStorage.getItem('rawat_store_announcements_v3');
      return saved ? JSON.parse(saved) : [
        {
          id: 'ann-1',
          title: '🔥 FLASH SALE: 20% Off All Obsidian Noir Cards',
          message: 'Apply promo code "RAWAT20" at checkout for instant savings. Limited Genesis stock remaining in vault.',
          type: 'SALE',
          isActive: true,
          createdAt: new Date().toISOString(),
          targetTier: 'ALL'
        },
        {
          id: 'ann-2',
          title: '⚡ Instant UPI QR Inflow Online',
          message: 'Add funds with Zero Gateway Convenience fee using your preferred UPI Apps (GPay, PhonePe, Paytm).',
          type: 'INFO',
          isActive: true,
          createdAt: new Date().toISOString(),
          targetTier: 'ALL'
        }
      ];
    } catch {
      return [];
    }
  });

  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'INFO' | 'SALE' | 'ALERT' | 'UPDATE'>('SALE');
  const [targetTier, setTargetTier] = useState<'ALL' | VIPTier>('ALL');
  const [sendEmailNotification, setSendEmailNotification] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const saveAnnouncements = async (list: StoreAnnouncement[]) => {
    setAnnouncements(list);
    try {
      await updateSettingsFB({ announcements: list } as any);
    } catch (err) {
      console.warn('[Firestore Announcements Save]', err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSending(true);
    playSound('purchase', soundEnabled);

    const newAnn: StoreAnnouncement = {
      id: `ann-${Date.now()}`,
      title: title.trim(),
      message: message.trim(),
      type,
      isActive: true,
      createdAt: new Date().toISOString(),
      targetTier
    };

    const updated = [newAnn, ...announcements];
    await saveAnnouncements(updated);

    let emailReport = '';
    if (sendEmailNotification) {
      const eligibleRecipients = users
        .filter((u) => u.email && (targetTier === 'ALL' || u.membershipTier === targetTier))
        .map((u) => ({ email: u.email, username: u.username }));

      if (eligibleRecipients.length > 0) {
        try {
          const res = await sendAdminAnnouncementEmail({
            title: title.trim(),
            message: message.trim(),
            recipients: eligibleRecipients,
            type,
          });
          if (res.success) {
            emailReport = ` & email announcement sent to ${res.sentCount || eligibleRecipients.length} customer(s).`;
          }
        } catch (err) {
          console.warn('[Email Announcement Dispatch]', err);
        }
      }
    }

    addAuditLog({
      action: 'SETTINGS_UPDATED',
      reason: `Broadcasted store announcement: "${title}"${emailReport}`
    });

    setIsSending(false);
    setFeedback(`Announcement broadcasted successfully${emailReport}`);
    setTimeout(() => setFeedback(null), 5000);

    setTitle('');
    setMessage('');
    setIsCreating(false);
  };

  const toggleStatus = (id: string) => {
    playSound('click', soundEnabled);
    const updated = announcements.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a));
    saveAnnouncements(updated);
  };

  const handleDelete = (id: string) => {
    playSound('click', soundEnabled);
    const updated = announcements.filter((a) => a.id !== id);
    saveAnnouncements(updated);
  };

  const eligibleCount = users.filter(
    (u) => u.email && (targetTier === 'ALL' || u.membershipTier === targetTier)
  ).length;

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-zinc-950/80 border border-white/10 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
            <span className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">
              Storefront Broadcast & Announcement Center
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-tech text-white tracking-tight">
            Broadcast Announcements & Push Notifications
          </h2>
        </div>

        <button
          onClick={() => {
            playSound('click', soundEnabled);
            setIsCreating(!isCreating);
          }}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition-all shadow-lg shadow-purple-900/30 cursor-pointer flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* CREATE BROADCAST FORM */}
      {isCreating && (
        <form onSubmit={handleCreate} className="p-6 rounded-3xl bg-zinc-950/90 border border-purple-500/30 backdrop-blur-xl space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <Megaphone className="w-4 h-4 text-purple-400" />
            <h3 className="font-tech text-base font-bold text-white uppercase">
              Compose Store Announcement
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Announcement Headline / Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 🔥 NEW LUXURY VAULT DROP: 20% OFF"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500 font-tech font-bold text-sm"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Alert Category
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as typeof type)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none cursor-pointer"
              >
                <option value="SALE">🔥 Flash Sale / Offer</option>
                <option value="INFO">💡 Information / Guide</option>
                <option value="ALERT">⚠️ Security / SLA Notice</option>
                <option value="UPDATE">✨ Vault Feature Update</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              Announcement Message Body *
            </label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter the message content for customers..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sendEmailNotification}
                onChange={(e) => setSendEmailNotification(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-black/60 text-purple-600 focus:ring-0"
              />
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-400" />
                <span className="text-slate-200 font-bold">Send Announcement Email to Target Customers</span>
              </div>
            </label>

            <span className="text-[11px] text-purple-300 font-mono">
              ({eligibleCount} recipient{eligibleCount === 1 ? '' : 's'})
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">Audience:</span>
              <select
                value={targetTier}
                onChange={(e) => setTargetTier(e.target.value as typeof targetTier)}
                className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 text-white text-xs focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Store Customers ({users.length})</option>
                <option value="GOLD">Gold VIP Tier</option>
                <option value="PLATINUM">Platinum Elite Tier</option>
                <option value="OBSIDIAN">Obsidian Royale Tier</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSending}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
              >
                {isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{isSending ? 'Broadcasting...' : 'Publish Announcement'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ANNOUNCEMENT FEED */}
      <div className="space-y-3">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className={`p-5 rounded-3xl border backdrop-blur-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              ann.isActive
                ? 'bg-zinc-950/80 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.1)]'
                : 'bg-zinc-950/40 border-white/5 opacity-60'
            }`}
          >
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  ann.type === 'SALE' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  ann.type === 'ALERT' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                  ann.type === 'UPDATE' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                  'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                }`}>
                  {ann.type}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(ann.createdAt).toLocaleDateString()}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-purple-300 font-bold border border-white/5">
                  Target: {ann.targetTier || 'ALL'}
                </span>
              </div>

              <h4 className="font-tech text-base font-bold text-white">
                {ann.title}
              </h4>
              <p className="text-slate-300 text-xs">
                {ann.message}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
              <button
                onClick={() => toggleStatus(ann.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs ${
                  ann.isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-zinc-800 text-zinc-400 border border-white/5'
                }`}
              >
                {ann.isActive ? 'LIVE ON STORE' : 'PAUSED'}
              </button>

              <button
                onClick={() => handleDelete(ann.id)}
                className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                title="Delete Announcement"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
