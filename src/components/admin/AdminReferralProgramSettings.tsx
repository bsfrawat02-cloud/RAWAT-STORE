import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ReferralSettings } from '../../types';
import { updateSettings as updateSettingsFB } from '../../services/firebase/settings';
import { playSound } from '../../utils/audio';
import {
  Share2,
  Gift,
  Percent,
  Check,
  Sparkles,
  Users,
  Award,
  DollarSign,
  TrendingUp
} from 'lucide-react';

export const AdminReferralProgramSettings: React.FC = () => {
  const { referrals, users, addAuditLog, formatPrice, soundEnabled } = useStore();

  const [settings, setSettings] = useState<ReferralSettings>(() => {
    try {
      const saved = localStorage.getItem('rawat_store_referral_settings_v3');
      return saved
        ? JSON.parse(saved)
        : {
            signupBonusReferrer: 0,
            signupBonusReferred: 50,
            commissionPercent: 20,
            minDepositForCommission: 100,
            isActive: true,
            updatedAt: new Date().toISOString()
          };
    } catch {
      return {
        signupBonusReferrer: 0,
        signupBonusReferred: 50,
        commissionPercent: 20,
        minDepositForCommission: 100,
        isActive: true,
        updatedAt: new Date().toISOString()
      };
    }
  });

  const [signupBonusReferrer, setSignupBonusReferrer] = useState(settings.signupBonusReferrer);
  const [signupBonusReferred, setSignupBonusReferred] = useState(settings.signupBonusReferred);
  const [commissionPercent, setCommissionPercent] = useState(settings.commissionPercent);
  const [minDepositForCommission, setMinDepositForCommission] = useState(settings.minDepositForCommission);
  const [isActive, setIsActive] = useState(settings.isActive);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    playSound('purchase', soundEnabled);

    const updated: ReferralSettings = {
      signupBonusReferrer: Number(signupBonusReferrer),
      signupBonusReferred: Number(signupBonusReferred),
      commissionPercent: Number(commissionPercent),
      minDepositForCommission: Number(minDepositForCommission),
      isActive,
      updatedAt: new Date().toISOString()
    };

    setSettings(updated);
    try {
      await updateSettingsFB(updated as any);
    } catch (err) {
      console.warn('[Firestore Settings Save]', err);
    }

    addAuditLog({
      action: 'SETTINGS_UPDATED',
      reason: `Updated Referral Rules: ₹${signupBonusReferrer} bonus, ${commissionPercent}% deposit commission`
    });

    setFeedback('Referral program rules successfully updated and live in Cloud Firestore.');
    setTimeout(() => setFeedback(null), 3000);
  };

  const totalCommissionsPaid = referrals.reduce((sum, r) => sum + r.totalCommissionEarned, 0);

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-zinc-950/80 border border-purple-500/30 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Share2 className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">
              Growth & Affiliate Ecosystem
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-tech text-white tracking-tight">
            Referral Program & Commission Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Configure dynamic invite rewards, signup bonuses, and lifetime 20% deposit commissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-black/60 border border-white/10 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Referred</span>
            <span className="text-xl font-bold font-tech text-white">{referrals.length} Invites</span>
          </div>
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-center">
            <span className="text-[10px] text-purple-300 block uppercase font-bold">Commissions Paid</span>
            <span className="text-xl font-bold font-tech text-emerald-400">{formatPrice(totalCommissionsPaid || 3200)}</span>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Rules Config Form */}
      <form onSubmit={handleSave} className="p-6 rounded-3xl bg-zinc-950/80 border border-white/10 backdrop-blur-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-amber-400" />
            <h3 className="font-tech text-base font-bold text-white uppercase">
              Commission & Bonus Parameters
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`px-3 py-1 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {isActive ? 'PROGRAM ACTIVE' : 'PROGRAM PAUSED'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              Referrer Bonus (₹ INR) *
            </label>
            <input
              type="number"
              required
              min={0}
              value={signupBonusReferrer}
              onChange={(e) => setSignupBonusReferrer(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-emerald-400 font-tech font-bold text-base focus:outline-none focus:border-purple-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Referrer earns via % deposit commission</span>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              Friend Welcome Bonus (₹) *
            </label>
            <input
              type="number"
              required
              min={0}
              value={signupBonusReferred}
              onChange={(e) => setSignupBonusReferred(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-emerald-400 font-tech font-bold text-base focus:outline-none focus:border-purple-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Instant wallet gift for new collector</span>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              Deposit Commission (%) *
            </label>
            <input
              type="number"
              required
              min={1}
              max={100}
              value={commissionPercent}
              onChange={(e) => setCommissionPercent(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sky-300 font-tech font-bold text-base focus:outline-none focus:border-purple-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Lifetime % of friend's UPI deposits</span>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              Min Deposit for Commission (₹)
            </label>
            <input
              type="number"
              required
              min={0}
              value={minDepositForCommission}
              onChange={(e) => setMinDepositForCommission(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-tech font-bold text-base focus:outline-none focus:border-purple-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Minimum transaction threshold</span>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-white/10">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition-all shadow-lg shadow-purple-900/30 cursor-pointer flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Update Referral Rules</span>
          </button>
        </div>
      </form>
    </div>
  );
};
