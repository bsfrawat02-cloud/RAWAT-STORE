import React, { useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { LogOut, ShieldAlert, X, ShieldCheck, Wallet, User } from 'lucide-react';
import { playSound } from '../../utils/audio';

export const LogoutConfirmModal: React.FC = () => {
  const {
    isLogoutModalOpen,
    setIsLogoutModalOpen,
    confirmLogout,
    currentUser,
    currentBalance,
    formatPrice,
    soundEnabled
  } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLogoutModalOpen) {
        playSound('click', soundEnabled);
        setIsLogoutModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLogoutModalOpen, setIsLogoutModalOpen, soundEnabled]);

  if (!isLogoutModalOpen || !currentUser) return null;

  const handleCancel = () => {
    playSound('click', soundEnabled);
    setIsLogoutModalOpen(false);
  };

  const handleConfirm = () => {
    confirmLogout();
  };

  return (
    <div
      id="logout-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleCancel();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-dialog-title"
    >
      <div
        id="logout-modal-card"
        className="relative w-full max-w-md rounded-3xl border border-white/15 bg-[#090a10]/95 p-6 sm:p-7 shadow-2xl backdrop-blur-2xl text-slate-100 overflow-hidden"
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-28 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          id="logout-modal-close-btn"
          type="button"
          onClick={handleCancel}
          aria-label="Cancel and close dialog"
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Badge */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-400 mb-3 shadow-lg shadow-rose-900/20">
            <LogOut className="w-6 h-6" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono text-[10px] uppercase tracking-wider mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>SESSION TERMINATION CONFIRMATION</span>
          </div>

          <h2
            id="logout-dialog-title"
            className="text-xl sm:text-2xl font-tech font-bold text-white tracking-tight"
          >
            Confirm Session Sign-Out
          </h2>

          <p className="text-xs text-slate-400 font-mono mt-1.5 leading-relaxed">
            Are you sure you want to end your active session? You will need your credentials to sign back in.
          </p>
        </div>

        {/* Account Info Snapshot */}
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-900 via-slate-900 to-black border border-purple-500/50 flex items-center justify-center text-sm font-bold text-white">
                {currentUser.username.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-sm font-tech font-bold text-white">
                  @{currentUser.username}
                </p>
                <p className="text-[11px] font-mono text-slate-400 truncate max-w-[170px]">
                  {currentUser.email}
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase bg-white/10 text-purple-300 border border-white/10">
              {currentUser.role === 'super_admin'
                ? 'Super Admin'
                : currentUser.role === 'admin'
                ? 'Store Admin'
                : currentUser.membershipTier || 'Collector'}
            </span>
          </div>

          <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-slate-400" />
              <span>Available Balance:</span>
            </span>
            <span className="font-bold text-emerald-400 font-mono">
              {formatPrice(currentBalance)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            id="logout-cancel-btn"
            type="button"
            onClick={handleCancel}
            className="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-tech font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer order-2 sm:order-1"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Stay Signed In</span>
          </button>

          <button
            id="logout-confirm-btn"
            type="button"
            onClick={handleConfirm}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-tech font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-600/20 hover:shadow-rose-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer order-1 sm:order-2 active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4" />
            <span>Yes, Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
