import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { UserAccount } from '../../types';
import { playSound } from '../../utils/audio';
import {
  X,
  Wallet,
  Plus,
  Minus,
  Check,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  ShieldCheck,
  Gift
} from 'lucide-react';

interface AdminWalletAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: UserAccount | null;
}

export const AdminWalletAdjustmentModal: React.FC<AdminWalletAdjustmentModalProps> = ({
  isOpen,
  onClose,
  targetUser
}) => {
  const { adminCreditBalance, adminDebitBalance, wallets, formatPrice, soundEnabled } = useStore();

  const [actionType, setActionType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [amount, setAmount] = useState<string>('500');
  const [reason, setReason] = useState<string>('Manual administrative wallet adjustment');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen || !targetUser) return null;

  const currentBalance = wallets[targetUser.id]?.balance || 0;

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFeedback('Error: Enter a valid positive number');
      return;
    }

    if (actionType === 'CREDIT') {
      const res = adminCreditBalance(targetUser.id, numAmount, reason || 'Admin wallet credit bonus');
      if (res.success) {
        playSound('purchase', soundEnabled);
        setFeedback(`Success: Credited ₹${numAmount} to ${targetUser.username}`);
        setTimeout(() => {
          setFeedback(null);
          onClose();
        }, 1500);
      } else {
        setFeedback(`Error: ${res.message}`);
      }
    } else {
      const res = adminDebitBalance(targetUser.id, numAmount, reason || 'Admin wallet debit adjustment');
      if (res.success) {
        playSound('click', soundEnabled);
        setFeedback(`Success: Debited ₹${numAmount} from ${targetUser.username}`);
        setTimeout(() => {
          setFeedback(null);
          onClose();
        }, 1500);
      } else {
        setFeedback(`Error: ${res.message}`);
      }
    }
  };

  const presetAmounts = [100, 250, 500, 1000, 2500, 5000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 cursor-pointer" />

      <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-zinc-950/95 p-6 shadow-2xl backdrop-blur-2xl z-50 overflow-hidden font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/20 border border-purple-500/30">
              <Wallet className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <span className="text-[10px] text-purple-400 uppercase tracking-widest font-bold block">
                Treasury Adjustment Engine
              </span>
              <h3 className="text-lg font-bold font-tech text-white">
                Adjust Collector Balance
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Collector Info Badge */}
        <div className="mt-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">Target Collector</span>
            <span className="text-sm font-bold text-white block font-tech">{targetUser.fullName || targetUser.username}</span>
            <span className="text-[10px] text-slate-400">{targetUser.email}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">Current Balance</span>
            <span className="text-base font-bold text-emerald-400 font-tech">
              {formatPrice(currentBalance)}
            </span>
          </div>
        </div>

        {/* Action Toggle (Credit vs Debit) */}
        <form onSubmit={handleExecute} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                playSound('click', soundEnabled);
                setActionType('CREDIT');
              }}
              className={`py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                actionType === 'CREDIT'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
              <span>Credit Funds (+)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playSound('click', soundEnabled);
                setActionType('DEBIT');
              }}
              className={`py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                actionType === 'DEBIT'
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-rose-400" />
              <span>Debit Funds (-)</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">
              Adjustment Amount (₹ INR) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                required
                min={1}
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-tech text-base focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {presetAmounts.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(String(p))}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 border border-white/5 text-[11px] font-bold cursor-pointer"
                >
                  +₹{p}
                </button>
              ))}
            </div>
          </div>

          {/* Reason / Audit Remark */}
          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">
              Audit Note & Reason *
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Promotional VIP Cashback / Compensation"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          {feedback && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              feedback.startsWith('Success')
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              <span>{feedback}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/15 text-slate-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl font-bold text-white transition-all shadow-lg cursor-pointer flex items-center gap-1.5 ${
                actionType === 'CREDIT'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/30'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Confirm {actionType === 'CREDIT' ? 'Credit' : 'Debit'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
