import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { OrderRecord } from '../types';
import { CardNetworkLogo } from '../components/cards/CardNetworkLogo';
import {
  ShoppingBag,
  CheckCircle2,
  Download,
  Search,
  Eye,
  CreditCard,
  Hash,
  Calendar,
  Receipt,
  FileText,
  Sparkles,
  Layers,
  RotateCcw,
  Clock,
  AlertTriangle,
  X,
  ShieldAlert,
  Check,
  Trash2
} from 'lucide-react';
import { playSound } from '../utils/audio';
import { downloadReceiptHtml, downloadDigitalCard } from '../utils/cardExport';
import { OrdersListSkeleton } from '../components/common/Skeletons';

export const OrdersPage: React.FC = () => {
  const {
    orders,
    formatPrice,
    setSelectedCard,
    cards,
    soundEnabled,
    setActiveTab,
    currentUser,
    isAdmin,
    ownedCardIds,
    requestOrderRefund,
    deleteOrder,
    clearAllPurchasingHistory,
    setIsAuthModalOpen,
    setAuthModalMode,
    isInitialLoading,
  } = useStore();

  const [searchFilter, setSearchFilter] = useState('');
  const [selectedOrderForRefund, setSelectedOrderForRefund] = useState<OrderRecord | null>(null);
  const [refundReasonType, setRefundReasonType] = useState<string>('Accidental purchase');
  const [refundNotes, setRefundNotes] = useState<string>('');
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);

  // Visible orders: If customer is logged in, show their orders (or all if admin)
  const userOrders = orders.filter((order) => {
    if (isAdmin) return true;
    if (!currentUser) return false;
    return (
      order.userId === currentUser.id ||
      order.userId === currentUser.username ||
      (currentUser.email && order.customerEmail && order.customerEmail.toLowerCase() === currentUser.email.toLowerCase())
    );
  });

  const filteredOrders = userOrders.filter((order) => {
    const q = searchFilter.toLowerCase().trim();
    if (!q) return true;
    const orderId = order.orderNumber.startsWith('RWT-') ? order.orderNumber : `RWT-${order.orderNumber}`;
    return (
      order.id.toLowerCase().includes(q) ||
      orderId.toLowerCase().includes(q) ||
      order.cardName.toLowerCase().includes(q) ||
      order.transactionRef.toLowerCase().includes(q) ||
      order.vaultTokenId.toLowerCase().includes(q)
    );
  });

  const handleInspectCard = (cardId: string) => {
    const target = cards.find((c) => c.id === cardId);
    if (target) {
      playSound('click', soundEnabled);
      setSelectedCard(target);
    }
  };

  const handleViewInVault = (cardId: string) => {
    playSound('purchase', soundEnabled);
    const target = cards.find((c) => c.id === cardId);
    if (target) {
      setSelectedCard(target);
    }
    setActiveTab('vault');
  };

  const handleDownloadReceipt = (order: OrderRecord) => {
    const card = cards.find((c) => c.id === order.cardId);
    downloadReceiptHtml(order, card, currentUser);
    playSound('click', soundEnabled);
  };

  const handleDownloadCard = (order: OrderRecord) => {
    const card = cards.find((c) => c.id === order.cardId);
    if (card) {
      downloadDigitalCard(card, order, currentUser);
      playSound('click', soundEnabled);
    }
  };

  const handleOpenRefundModal = (order: OrderRecord) => {
    playSound('click', soundEnabled);
    setSelectedOrderForRefund(order);
    setRefundReasonType('Accidental purchase');
    setRefundNotes('');
  };

  const handleSubmitRefundRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForRefund) return;

    setIsSubmittingRefund(true);
    const fullReason = refundNotes.trim()
      ? `${refundReasonType}: ${refundNotes.trim()}`
      : refundReasonType;

    const res = await requestOrderRefund(selectedOrderForRefund.id, fullReason);
    setIsSubmittingRefund(false);

    if (res.success) {
      setSelectedOrderForRefund(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="font-mono text-xs text-purple-400 uppercase tracking-widest font-semibold">
              CUSTOMER ORDER HISTORY & VAULT ASSETS
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tighter text-white mt-1">
            Order History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            All your completed card purchases are saved here and directly accessible in your Collection Vault.
          </p>
        </div>

        {/* Quick Search & Vault Link */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search Order ID or Card..."
              className="w-full rounded-full border border-white/10 bg-white/5 pl-10 pr-4 py-2 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-white/25 transition-all"
            />
          </div>

          {isAdmin && orders.length > 0 && (
            <button
              onClick={async () => {
                if (window.confirm('⚠️ WARNING: Delete ALL purchasing history and reset store cards to brand new?')) {
                  await clearAllPurchasingHistory();
                }
              }}
              className="px-3.5 py-2 rounded-full bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-mono font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
              title="Wipe all purchasing history"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">CLEAR ALL HISTORY</span>
            </button>
          )}

          <button
            onClick={() => {
              playSound('click', soundEnabled);
              setActiveTab('vault');
            }}
            className="px-4 py-2 rounded-full bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-mono font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>MY COLLECTION ({ownedCardIds.length})</span>
          </button>
        </div>
      </div>

      {/* Orders Grid / List */}
      {isInitialLoading ? (
        <OrdersListSkeleton count={3} />
      ) : !currentUser ? (
        <div className="py-20 text-center rounded-3xl border border-white/10 bg-white/5 p-8 space-y-5 backdrop-blur-md max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-tech text-xl text-white font-bold">Sign In to View Orders</h3>
            <p className="text-xs font-mono text-slate-400 max-w-md mx-auto">
              Please sign in to access your purchase invoices, digital card passes, and transaction history.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                playSound('click', soundEnabled);
                setAuthModalMode('login');
                setIsAuthModalOpen(true);
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              SIGN IN / REGISTER
            </button>
            <button
              onClick={() => {
                playSound('click', soundEnabled);
                setActiveTab('cards');
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold border border-white/15 transition-all cursor-pointer"
            >
              EXPLORE STORE
            </button>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-white/10 bg-white/5 p-8 space-y-4 backdrop-blur-md">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mx-auto">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="font-tech text-lg text-white font-bold">No orders found</h3>
          <p className="text-xs font-mono text-slate-400 max-w-md mx-auto">
            You haven't placed any orders yet. Explore our store to purchase your first luxury card.
          </p>
          <button
            onClick={() => {
              playSound('click', soundEnabled);
              setActiveTab('cards');
            }}
            className="px-6 py-2.5 rounded-full bg-white text-black font-mono text-xs font-bold transition-all shadow-lg hover:bg-slate-200 cursor-pointer"
          >
            EXPLORE STORE
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const orderId = order.orderNumber.startsWith('RWT-') ? order.orderNumber : `RWT-${order.orderNumber}`;
            const isRefunded = order.status === 'REFUNDED' || order.refundStatus === 'COMPLETED';
            const isRefundPending = !isRefunded && order.refundStatus === 'REQUESTED';

            return (
              <div
                key={order.id}
                className={`p-3.5 sm:p-5 rounded-2xl border transition-all shadow-xl backdrop-blur-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 overflow-hidden w-full ${
                  isRefunded
                    ? 'border-emerald-500/20 bg-emerald-950/10 hover:bg-emerald-950/20'
                    : isRefundPending
                    ? 'border-amber-500/20 bg-amber-950/10 hover:bg-amber-950/20'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                {/* Order Info */}
                <div className="flex flex-col sm:flex-row sm:items-start lg:items-center gap-3 sm:gap-4 min-w-0 w-full lg:w-auto">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center shrink-0 ${
                    isRefunded
                      ? 'bg-gradient-to-tr from-emerald-950 to-slate-950 border-emerald-500/30 text-emerald-400'
                      : isRefundPending
                      ? 'bg-gradient-to-tr from-amber-950 to-slate-950 border-amber-500/30 text-amber-400'
                      : 'bg-gradient-to-tr from-purple-900 to-slate-900 border-white/15 text-purple-300'
                  }`}>
                    <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="font-mono font-bold text-xs sm:text-sm text-white tracking-wider">
                        {orderId}
                      </span>
                      <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-wider font-semibold bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1">
                        <CardNetworkLogo network={order.cardNetwork || 'RAWAT'} size="xs" />
                        <span>{order.cardNetwork || 'RAWAT'}</span>
                      </span>

                      {/* Status Badges */}
                      {isRefunded ? (
                        <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-wider font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                          <span>REFUND COMPLETED</span>
                        </span>
                      ) : isRefundPending ? (
                        <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-wider font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-pulse">
                          <Clock className="w-2.5 h-2.5 text-amber-400" />
                          <span>REFUND PENDING REVIEW</span>
                        </span>
                      ) : (
                        <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-wider font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>COMPLETED</span>
                        </span>
                      )}

                      {order.couponUsed && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-white/10 text-slate-300 border border-white/10">
                          COUPON: {order.couponUsed}
                        </span>
                      )}
                    </div>

                    <p className="font-tech font-bold text-sm sm:text-base text-slate-100 truncate">
                      {order.cardName}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-mono text-slate-400">
                      <span className="text-purple-300 font-semibold">{order.maskedIdentifier || '**** **** **** 4821'}</span>
                      <span>•</span>
                      <span className="truncate max-w-[140px] sm:max-w-none">Token: {order.vaultTokenId}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.purchaseDate).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Refund Notice / Audit Details */}
                    {isRefunded && (
                      <p className="text-[10px] font-mono text-emerald-400/90 pt-0.5 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Amount of {formatPrice(order.finalPrice)} was credited back to your Collector Wallet.</span>
                      </p>
                    )}
                    {isRefundPending && (
                      <p className="text-[10px] font-mono text-amber-400/90 pt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>Your refund request has been received and is being verified by admin.</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Meta & Actions */}
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-3 sm:gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/5 w-full lg:w-auto">
                  <div className="text-left lg:text-right shrink-0">
                    <p className="text-[9px] sm:text-[10px] font-mono uppercase text-slate-500">
                      {isRefunded ? 'REFUNDED AMOUNT' : 'PAID TOTAL'}
                    </p>
                    <p className={`font-mono font-bold text-sm sm:text-base ${
                      isRefunded ? 'text-emerald-400' : 'text-emerald-400'
                    }`}>
                      {formatPrice(order.finalPrice)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {!isRefunded && (
                      <button
                        onClick={() => handleViewInVault(order.cardId)}
                        className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:text-white hover:bg-purple-600/40 transition-colors flex items-center gap-1 text-[11px] sm:text-xs font-mono font-semibold cursor-pointer shadow-sm"
                        title="Open in Vault Collection"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span>VAULT</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleInspectCard(order.cardId)}
                      className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1 text-[11px] sm:text-xs font-mono cursor-pointer"
                      title="Inspect card details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">DETAILS</span>
                    </button>

                    <button
                      onClick={() => handleDownloadReceipt(order)}
                      className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/15 hover:text-white transition-colors flex items-center gap-1 text-[11px] sm:text-xs font-mono font-semibold cursor-pointer shadow-sm"
                      title="Download printable tax invoice / receipt"
                    >
                      <Receipt className="w-3.5 h-3.5 text-purple-400" />
                      <span className="hidden sm:inline">RECEIPT</span>
                    </button>

                    {!isRefunded && (
                      <button
                        onClick={() => handleDownloadCard(order)}
                        className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30 hover:text-white transition-colors flex items-center gap-1 text-[11px] sm:text-xs font-mono font-semibold cursor-pointer shadow-sm"
                        title="Download card pass credentials"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="hidden sm:inline">PASS</span>
                      </button>
                    )}

                    {/* Refund Action Logic:
                        - Once refund is approved & processed (isRefunded), the option to request a refund is PERMANENTLY REMOVED from the user's view.
                        - When refund is pending review (isRefundPending), displays a disabled status pill to prevent duplicate requests.
                        - When eligible and completed, provides the "Request Refund" button.
                    */}
                    {!isRefunded && !isRefundPending && (
                      <button
                        onClick={() => handleOpenRefundModal(order)}
                        className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 hover:text-white transition-colors flex items-center gap-1 text-[11px] sm:text-xs font-mono font-semibold cursor-pointer shadow-sm active:scale-95"
                        title="Request refund for this order"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                        <span>REFUND</span>
                      </button>
                    )}

                    {isRefundPending && (
                      <span className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-semibold flex items-center gap-1 cursor-default">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>IN REVIEW</span>
                      </span>
                    )}

                    {isAdmin && (
                      <button
                        onClick={async () => {
                          if (window.confirm(`Delete order ${orderId}?`)) {
                            await deleteOrder(order.id);
                          }
                        }}
                        className="p-1.5 rounded-xl bg-rose-950/30 hover:bg-rose-900/60 border border-rose-500/30 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete order record (Admin)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          REFUND REQUEST MODAL
      ======================================================== */}
      {selectedOrderForRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-[#0d0d16] p-6 sm:p-8 shadow-2xl space-y-6 overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-60 h-40 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-tech font-bold text-white tracking-wide">
                    Request Order Refund
                  </h3>
                  <p className="text-xs font-mono text-slate-400">
                    Order {selectedOrderForRefund.orderNumber} • {selectedOrderForRefund.cardName}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrderForRefund(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Summary Box */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 font-mono text-xs relative z-10">
              <div className="flex justify-between items-center text-slate-400">
                <span>Card Item:</span>
                <span className="font-bold text-white">{selectedOrderForRefund.cardName}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Refund Credit Amount:</span>
                <span className="font-bold text-emerald-400 text-sm">{formatPrice(selectedOrderForRefund.finalPrice)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Destination:</span>
                <span className="text-purple-300 font-semibold">Collector Wallet Balance</span>
              </div>
            </div>

            {/* Refund Form */}
            <form onSubmit={handleSubmitRefundRequest} className="space-y-4 relative z-10">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Select Reason for Refund
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                  {[
                    'Accidental purchase',
                    'Selected wrong card tier',
                    'Duplicate in vault',
                    'Changed my mind',
                    'Other reason',
                  ].map((reason) => (
                    <button
                      type="button"
                      key={reason}
                      onClick={() => setRefundReasonType(reason)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        refundReasonType === reason
                          ? 'bg-rose-950/60 border-rose-500/60 text-white font-bold'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  placeholder="Provide any additional context or details for the review team..."
                  rows={3}
                  className="w-full rounded-2xl border border-white/10 bg-black/60 p-3 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500 transition-all resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 text-[11px] font-mono text-rose-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>
                  Once approved and processed, the card will be released from your vault and the amount of{' '}
                  <strong>{formatPrice(selectedOrderForRefund.finalPrice)}</strong> will be credited to your balance. The refund option will be permanently completed.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForRefund(null)}
                  disabled={isSubmittingRefund}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-mono text-xs font-bold transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRefund}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-rose-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingRefund ? (
                    <span>SUBMITTING...</span>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>SUBMIT REFUND REQUEST</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


