import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { WalletTransaction, PaymentRequest } from '../types';
import {
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Receipt,
  Download,
  ShieldCheck,
  Plus,
  RefreshCw
} from 'lucide-react';
import { playSound } from '../utils/audio';
import { TransactionsPageSkeleton } from '../components/common/Skeletons';

export const TransactionsPage: React.FC = () => {
  const {
    currentUser,
    currentBalance,
    getUserTransactions,
    getUserPaymentRequests,
    setIsPaymentModalOpen,
    formatPrice,
    soundEnabled,
    isInitialLoading,
  } = useStore();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CREDITS' | 'PAYMENTS' | 'PENDING' | 'COMPLETED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTxn, setSelectedTxn] = useState<WalletTransaction | null>(null);

  if (isInitialLoading) {
    return <TransactionsPageSkeleton />;
  }

  const transactions = getUserTransactions();
  const paymentRequests = getUserPaymentRequests();

  // Filter transactions
  const filteredTransactions = transactions.filter((txn) => {
    // Text search
    const matchesSearch =
      txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (txn.reason && txn.reason.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (txn.referenceId && txn.referenceId.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Category filter
    switch (activeFilter) {
      case 'CREDITS':
        return txn.amount > 0;
      case 'PAYMENTS':
        return txn.amount < 0 || txn.type === 'PRODUCT_PURCHASE';
      case 'PENDING':
        return txn.status === 'PENDING';
      case 'COMPLETED':
        return txn.status === 'COMPLETED';
      case 'REJECTED':
        return txn.status === 'REJECTED' || txn.status === 'FAILED';
      case 'ALL':
      default:
        return true;
    }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Banner with Balance & Quick Add Funds */}
      <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-purple-950/40 via-black to-[#0a0a14] p-6 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 font-mono text-[10px] uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3 h-3 text-purple-400" />
              <span>COLLECTOR WALLET LEDGER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-tech font-bold text-white tracking-tight">
              Transaction History
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Real-time immutable financial records for @{currentUser?.username || 'user'}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block">CURRENT BALANCE</span>
              <span className="font-mono font-extrabold text-2xl text-emerald-400">
                {formatPrice(currentBalance)}
              </span>
            </div>
            <button
              onClick={() => {
                playSound('click', soundEnabled);
                setIsPaymentModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-tech font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-purple-600/20 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>ADD FUNDS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {(['ALL', 'CREDITS', 'PAYMENTS', 'PENDING', 'COMPLETED', 'REJECTED'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => {
                playSound('click', soundEnabled);
                setActiveFilter(filter);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeFilter === filter
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 border border-purple-400'
                  : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white hover:bg-white/10'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, product, ref..."
            className="w-full rounded-full border border-white/10 bg-black/60 pl-9 pr-4 py-2 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-2.5" />
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-white/5 bg-black/40 space-y-3">
            <Receipt className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="font-tech font-bold text-white text-base">No Transactions Found</h3>
            <p className="text-xs font-mono text-slate-500 max-w-sm mx-auto">
              No ledger entries match your current filter criteria.
            </p>
          </div>
        ) : (
          filteredTransactions.map((txn) => {
            const isPositive = txn.amount > 0;
            const isPending = txn.status === 'PENDING';
            const isRejected = txn.status === 'REJECTED' || txn.status === 'FAILED';

            return (
              <div
                key={txn.id}
                onClick={() => setSelectedTxn(txn)}
                className="group p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer backdrop-blur-sm"
              >
                {/* Left info */}
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 ${
                      isPending
                        ? 'bg-amber-950/40 border-amber-500/40 text-amber-400'
                        : isRejected
                        ? 'bg-rose-950/40 border-rose-500/40 text-rose-400'
                        : isPositive
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                        : 'bg-purple-950/40 border-purple-500/40 text-purple-400'
                    }`}
                  >
                    {isPending ? (
                      <Clock className="w-5 h-5" />
                    ) : isPositive ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-tech font-bold text-sm text-white group-hover:text-purple-300 transition-colors">
                        {txn.description}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-mono tracking-wider font-semibold uppercase ${
                          isPending
                            ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                            : isRejected
                            ? 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {txn.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] font-mono text-slate-400 mt-1">
                      <span className="text-purple-400 font-bold">{txn.id}</span>
                      <span>•</span>
                      <span>{txn.createdAt}</span>
                      {txn.createdBy && (
                        <>
                          <span>•</span>
                          <span>By: {txn.createdBy}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Amount & Balance */}
                <div className="text-right self-end sm:self-auto shrink-0 font-mono">
                  <div
                    className={`text-base font-extrabold ${
                      isPending
                        ? 'text-amber-400'
                        : isPositive
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {formatPrice(txn.amount)}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Bal: {formatPrice(txn.balanceAfter)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Payment Requests Section */}
      {paymentRequests.length > 0 && (
        <div className="mt-10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-tech font-bold text-lg text-white">Your UPI Payment Requests</h3>
            <span className="text-xs font-mono text-slate-400">
              {paymentRequests.length} submitted
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {paymentRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl border border-white/10 bg-black/50 space-y-3 font-mono text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{req.id}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      req.status === 'APPROVED'
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                        : req.status === 'REJECTED'
                        ? 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-950/80 text-amber-400 border border-amber-500/30 animate-pulse'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span>Amount:</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {formatPrice(req.amount)}
                  </span>
                </div>

                {req.utrRef && (
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span>UTR / Ref:</span>
                    <span className="text-slate-200">{req.utrRef}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-slate-500 text-[10px] border-t border-white/5 pt-2">
                  <span>Date:</span>
                  <span>{req.requestedAt}</span>
                </div>

                {req.rejectionReason && (
                  <p className="text-[10px] text-rose-400 bg-rose-950/30 p-2 rounded-xl border border-rose-500/20">
                    Rejection note: {req.rejectionReason}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
