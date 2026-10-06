import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { VIPTier, UserAccount } from '../../types';
import { VIP_CONFIGS, getVIPConfig } from '../../utils/vip';
import { playSound } from '../../utils/audio';
import {
  Crown,
  Shield,
  Sparkles,
  Check,
  Percent,
  Zap,
  Users,
  Search,
  ArrowUpRight,
  ShieldAlert,
  Edit2,
  Gift
} from 'lucide-react';

export const AdminVIPTierManager: React.FC = () => {
  const {
    users,
    currentUser,
    updateUser,
    adminUpdateUserStatus,
    adminCreditBalance,
    addAuditLog,
    formatPrice,
    soundEnabled
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState<'ALL' | VIPTier>('ALL');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // VIP Tier List
  const tierKeys: VIPTier[] = ['STANDARD', 'SILVER', 'GOLD', 'PLATINUM', 'OBSIDIAN'];

  // Handle tier change for user
  const handleAssignTier = async (userId: string, newTier: VIPTier) => {
    playSound('click', soundEnabled);
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    // Update user directly via StoreContext (syncs to Cloud Firestore in real-time)
    await updateUser(userId, {
      membershipTier: newTier,
      updatedAt: new Date().toISOString()
    });

    addAuditLog({
      action: 'USER_UPDATED',
      targetUserId: userId,
      targetUsername: target.username,
      reason: `VIP Status tier upgraded/changed to ${newTier}`
    });

    setFeedbackMessage(`Success: ${target.username} has been assigned ${newTier} VIP status in Cloud Firestore.`);
    setTimeout(() => setFeedbackMessage(null), 3500);
    setEditingUserId(null);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.fullName || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const userTier = getVIPConfig(u.membershipTier).tier;
    const matchesTier = selectedTierFilter === 'ALL' || userTier === selectedTierFilter;

    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Strategy Overview */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-zinc-950/80 to-amber-950/40 border border-purple-500/30 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-5 h-5 text-amber-400" />
              <span className="font-mono text-xs text-amber-400 uppercase tracking-widest font-bold">
                VIP Membership & Privileges Matrix
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-tech text-white tracking-tight">
              Customer VIP Status & Automatic Discount Controls
            </h2>
            <p className="text-xs font-mono text-slate-300 mt-1 max-w-2xl">
              Assign VIP membership tiers to collectors to instantly unlock exclusive checkout discounts, deposit cashbacks, and holographic profile halos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-black/50 border border-white/10 text-center font-mono">
              <span className="text-[10px] text-slate-400 block uppercase">Total Collectors</span>
              <span className="text-xl font-bold text-white">{users.length}</span>
            </div>
          </div>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* 5-TIER BENEFIT CARDS PREVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {tierKeys.map((key) => {
          const cfg = VIP_CONFIGS[key];
          const membersInTier = users.filter((u) => getVIPConfig(u.membershipTier).tier === key).length;

          return (
            <div
              key={key}
              className={`p-4 rounded-2xl border backdrop-blur-md flex flex-col justify-between space-y-3 transition-all ${cfg.badgeBg} ${cfg.badgeBorder} ${cfg.glowClass}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono uppercase font-bold tracking-wider ${cfg.badgeText}`}>
                    {cfg.tier}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/40 text-slate-300 border border-white/10">
                    {membersInTier} Users
                  </span>
                </div>
                <h4 className="font-tech text-base font-bold text-white mt-1">
                  {cfg.label}
                </h4>
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Card Discount:</span>
                  <span className="font-bold text-emerald-400">{cfg.discountPercent}% OFF</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Deposit Cashback:</span>
                  <span className="font-bold text-sky-400">+{cfg.depositBonusPercent}%</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 space-y-1">
                {cfg.perks.slice(0, 2).map((perk, i) => (
                  <div key={i} className="flex items-center gap-1 text-[10px] font-mono text-slate-300 truncate">
                    <Sparkles className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                    <span className="truncate">{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* USER LIST & VIP ASSIGNMENT TABLE */}
      <div className="p-5 sm:p-6 rounded-3xl bg-zinc-950/80 border border-white/10 backdrop-blur-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            <h3 className="font-tech text-base font-bold text-white uppercase tracking-wider">
              Collector VIP Assignment Roster
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Box */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search collector..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Tier Filter */}
            <select
              value={selectedTierFilter}
              onChange={(e) => setSelectedTierFilter(e.target.value as typeof selectedTierFilter)}
              className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Tiers</option>
              <option value="STANDARD">Standard</option>
              <option value="SILVER">Silver VIP</option>
              <option value="GOLD">Gold VIP</option>
              <option value="PLATINUM">Platinum Elite</option>
              <option value="OBSIDIAN">Obsidian Royale</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Collector</th>
                <th className="py-3 px-3">Current VIP Tier</th>
                <th className="py-3 px-3">Unlocked Benefits</th>
                <th className="py-3 px-3">Account Role</th>
                <th className="py-3 px-3 text-right">Assign VIP Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((u) => {
                const currentConfig = getVIPConfig(u.membershipTier);
                const isEditing = editingUserId === u.id;

                return (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-sky-500/20 border border-white/10 flex items-center justify-center font-bold text-white text-xs">
                          {u.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-white block">{u.fullName || u.username}</span>
                          <span className="text-[10px] text-slate-400 block">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold ${currentConfig.badgeBg} ${currentConfig.badgeBorder} ${currentConfig.badgeText}`}>
                        <Crown className="w-3 h-3" />
                        <span>{currentConfig.label}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">{currentConfig.discountPercent}% OFF</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-sky-300">+{currentConfig.depositBonusPercent}% Cashback</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'super_admin' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                        u.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                        'bg-white/5 text-slate-400'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {tierKeys.map((tierKey) => (
                          <button
                            key={tierKey}
                            onClick={() => handleAssignTier(u.id, tierKey)}
                            title={`Assign ${tierKey}`}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                              currentConfig.tier === tierKey
                                ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                                : 'bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white border-white/10'
                            }`}
                          >
                            {tierKey.substring(0, 3)}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
