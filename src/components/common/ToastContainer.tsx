import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import { ToastNotification } from '../../types';
import {
  Gift,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  Wallet,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { playSound } from '../../utils/audio';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast, setActiveTab, soundEnabled, formatPrice } = useStore();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      id="global-toast-container"
      className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex flex-col gap-3 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
            onNavigate={(tab) => {
              setActiveTab(tab as any);
              playSound('click', soundEnabled);
              removeToast(toast.id);
            }}
            formatPrice={formatPrice}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface ToastItemProps {
  toast: ToastNotification;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  formatPrice: (amount: number) => string;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose, onNavigate, formatPrice }) => {
  const isReferralReward = toast.type === 'referral_reward';
  const isDepositSuccess = toast.type === 'deposit_success';
  const isOrderSuccess = toast.type === 'order_success';
  const isBonus = toast.type === 'bonus';
  const isError = toast.type === 'error';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-2xl border transition-all ${
        isReferralReward
          ? 'bg-[#06140d]/95 border-emerald-500/50 shadow-emerald-950/80 shadow-[0_0_30px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400/30'
          : isDepositSuccess
          ? 'bg-[#06121e]/95 border-cyan-500/40 shadow-cyan-950/80'
          : isOrderSuccess
          ? 'bg-[#12081f]/95 border-purple-500/40 shadow-purple-950/80'
          : isBonus
          ? 'bg-[#181102]/95 border-amber-500/40 shadow-amber-950/80'
          : isError
          ? 'bg-[#1a0505]/95 border-rose-500/40 shadow-rose-950/80'
          : 'bg-[#0a0a0c]/95 border-white/15 shadow-black/80'
      }`}
    >
      {/* Animated Top Accent Glow Line */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
          isReferralReward
            ? 'from-emerald-400 via-teal-300 to-emerald-500'
            : isDepositSuccess
            ? 'from-cyan-400 via-sky-300 to-blue-500'
            : isOrderSuccess
            ? 'from-purple-400 via-indigo-300 to-purple-500'
            : isBonus
            ? 'from-amber-400 via-yellow-300 to-amber-500'
            : isError
            ? 'from-rose-500 via-red-400 to-rose-600'
            : 'from-slate-400 to-slate-600'
        }`}
      />

      <div className="flex items-start gap-3.5">
        {/* Left Icon Badge */}
        <div
          className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner ${
            isReferralReward
              ? 'bg-emerald-950/90 border-emerald-400/50 text-emerald-300'
              : isDepositSuccess
              ? 'bg-cyan-950/90 border-cyan-400/50 text-cyan-300'
              : isOrderSuccess
              ? 'bg-purple-950/90 border-purple-400/50 text-purple-300'
              : isBonus
              ? 'bg-amber-950/90 border-amber-400/50 text-amber-300'
              : isError
              ? 'bg-rose-950/90 border-rose-400/50 text-rose-300'
              : 'bg-white/10 border-white/20 text-white'
          }`}
        >
          {isReferralReward ? (
            <Sparkles className="w-5 h-5 animate-pulse text-emerald-400" />
          ) : isDepositSuccess ? (
            <Wallet className="w-5 h-5 text-cyan-400" />
          ) : isOrderSuccess ? (
            <ShieldCheck className="w-5 h-5 text-purple-400" />
          ) : isBonus ? (
            <Gift className="w-5 h-5 text-amber-400" />
          ) : isError ? (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          ) : (
            <Info className="w-5 h-5 text-slate-300" />
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4
              className={`font-tech font-extrabold text-sm sm:text-base leading-tight tracking-tight ${
                isReferralReward
                  ? 'text-emerald-300'
                  : isDepositSuccess
                  ? 'text-cyan-300'
                  : isOrderSuccess
                  ? 'text-purple-300'
                  : isBonus
                  ? 'text-amber-300'
                  : isError
                  ? 'text-rose-300'
                  : 'text-white'
              }`}
            >
              {toast.title}
            </h4>

            {isReferralReward && toast.amount !== undefined && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-mono font-black text-xs">
                +{formatPrice(toast.amount)}
              </span>
            )}
          </div>

          <p className="text-xs font-mono text-slate-300 leading-relaxed break-words">
            {toast.message}
          </p>

          {/* Additional Referral Breakdown Pill if available */}
          {isReferralReward && (toast.friendDepositAmount || toast.commissionPercent) && (
            <div className="mt-2.5 pt-2 border-t border-emerald-500/20 flex flex-wrap items-center gap-2 text-[10px] font-mono text-emerald-400/90">
              <div className="flex items-center gap-1 bg-emerald-950/70 px-2 py-1 rounded-md border border-emerald-500/30">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span>Friend Deposited: {formatPrice(toast.friendDepositAmount || 0)}</span>
              </div>
              <div className="flex items-center gap-1 bg-emerald-950/70 px-2 py-1 rounded-md border border-emerald-500/30">
                <Gift className="w-3 h-3 text-emerald-400" />
                <span>Rate: {toast.commissionPercent || 20}% Automated Payout</span>
              </div>
            </div>
          )}

          {/* Action Button Row if defined */}
          {toast.actionLabel && toast.actionTab && (
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => onNavigate(toast.actionTab!)}
                className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  isReferralReward
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-md shadow-emerald-500/30'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <span>{toast.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          title="Dismiss notification"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Subtle Auto-Dismiss Countdown Indicator */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: (toast.duration || 6000) / 1000, ease: 'linear' }}
        className={`absolute bottom-0 left-0 h-0.5 ${
          isReferralReward
            ? 'bg-emerald-400/50'
            : isDepositSuccess
            ? 'bg-cyan-400/50'
            : isOrderSuccess
            ? 'bg-purple-400/50'
            : 'bg-white/20'
        }`}
      />
    </motion.div>
  );
};
