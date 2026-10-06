import React, { useState, useMemo } from 'react';
import {
  Layers,
  ShoppingBag,
  Package,
  CheckSquare,
  Square,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  RefreshCw,
  Search,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Download,
  Clock,
  Shield,
  Filter,
  Check,
  Zap,
  Sliders,
  Boxes,
  Plus,
  Minus
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CardProduct, CardTier, CardNetwork, CardRarity, OrderRecord } from '../../types';
import { playSound } from '../../utils/audio';

interface BulkActionPanelProps {
  initialSubTab?: 'orders' | 'stock';
  onNavigateTab?: (tab: any) => void;
}

export const BulkActionPanel: React.FC<BulkActionPanelProps> = ({
  initialSubTab = 'orders',
  onNavigateTab,
}) => {
  const {
    orders,
    cards,
    users,
    formatPrice,
    bulkProcessOrders,
    bulkUpdateCardStock,
    soundEnabled,
    addToast,
  } = useStore();

  const [activeMode, setActiveMode] = useState<'orders' | 'stock'>(initialSubTab);

  // ==========================================
  // 1. BULK ORDERS STATE
  // ==========================================
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'PENDING_REFUND' | 'COMPLETED' | 'REFUNDED'>('ALL');
  const [orderActionReason, setOrderActionReason] = useState('');
  const [isProcessingOrders, setIsProcessingOrders] = useState(false);
  const [orderProgress, setOrderProgress] = useState<{ current: number; total: number } | null>(null);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (orderFilter === 'PENDING_REFUND') {
        if (order.refundStatus !== 'REQUESTED' || order.status === 'REFUNDED') return false;
      } else if (orderFilter === 'COMPLETED') {
        if (order.status !== 'COMPLETED' || order.refundStatus === 'REQUESTED') return false;
      } else if (orderFilter === 'REFUNDED') {
        if (order.status !== 'REFUNDED' && order.refundStatus !== 'COMPLETED') return false;
      }

      // Search filter
      if (orderSearch.trim()) {
        const query = orderSearch.toLowerCase();
        const user = users.find((u) => u.id === order.userId);
        const matchId = order.id.toLowerCase().includes(query);
        const matchCard = order.cardName.toLowerCase().includes(query);
        const matchUser = (user?.username || order.username || '').toLowerCase().includes(query);
        const matchFull = (user?.fullName || '').toLowerCase().includes(query);
        if (!matchId && !matchCard && !matchUser && !matchFull) return false;
      }

      return true;
    });
  }, [orders, orderFilter, orderSearch, users]);

  const pendingRefundOrders = useMemo(() => {
    return orders.filter((o) => o.refundStatus === 'REQUESTED' && o.status !== 'REFUNDED');
  }, [orders]);

  const selectedOrdersValue = useMemo(() => {
    return orders
      .filter((o) => selectedOrderIds.includes(o.id))
      .reduce((sum, o) => sum + (o.finalPrice || 0), 0);
  }, [orders, selectedOrderIds]);

  // Toggle single order
  const handleToggleOrder = (orderId: string) => {
    playSound('click', soundEnabled);
    setSelectedOrderIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  // Select all visible filtered orders
  const handleSelectAllVisibleOrders = () => {
    playSound('click', soundEnabled);
    const visibleIds = filteredOrders.map((o) => o.id);
    const allSelected = visibleIds.every((id) => selectedOrderIds.includes(id));
    if (allSelected) {
      setSelectedOrderIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedOrderIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  // Select all pending refunds helper
  const handleSelectAllPendingRefunds = () => {
    playSound('click', soundEnabled);
    const pendingIds = pendingRefundOrders.map((o) => o.id);
    setSelectedOrderIds(pendingIds);
    setOrderFilter('PENDING_REFUND');
  };

  // Clear order selection
  const handleClearOrderSelection = () => {
    playSound('click', soundEnabled);
    setSelectedOrderIds([]);
  };

  // Execute bulk order action
  const handleExecuteOrderAction = async (
    action: 'REFUND_APPROVE' | 'REFUND_REJECT' | 'MARK_COMPLETED' | 'MARK_VAULT_ARCHIVED' | 'DELETE'
  ) => {
    if (selectedOrderIds.length === 0) {
      addToast({
        title: 'No Orders Selected',
        message: 'Please select at least one order to perform a bulk operation.',
        type: 'info',
      });
      return;
    }

    const actionNames: Record<string, string> = {
      REFUND_APPROVE: 'Approve & Credit Refunds for',
      REFUND_REJECT: 'Decline Refund Requests for',
      MARK_COMPLETED: 'Mark as Completed for',
      MARK_VAULT_ARCHIVED: 'Archive to Vault for',
      DELETE: 'Permanently Delete',
    };

    if (
      !window.confirm(
        `Are you sure you want to ${actionNames[action]} ${selectedOrderIds.length} selected orders?`
      )
    ) {
      return;
    }

    setIsProcessingOrders(true);
    setOrderProgress({ current: 0, total: selectedOrderIds.length });

    try {
      await bulkProcessOrders({
        orderIds: selectedOrderIds,
        action,
        reason: orderActionReason.trim() || undefined,
      });
      setSelectedOrderIds([]);
      setOrderActionReason('');
    } finally {
      setIsProcessingOrders(false);
      setOrderProgress(null);
    }
  };

  // Bulk Export Selected Orders
  const handleExportSelectedOrders = () => {
    const selected = orders.filter((o) => selectedOrderIds.includes(o.id));
    if (selected.length === 0) return;

    const dataStr = JSON.stringify(selected, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rawat-bulk-orders-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    playSound('click', soundEnabled);
  };

  // ==========================================
  // 2. BULK CATEGORY STOCK STATE
  // ==========================================
  const [stockCategoryType, setStockCategoryType] = useState<'tier' | 'network' | 'rarity' | 'all'>('tier');
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('ALL');
  const [selectedNetworkFilter, setSelectedNetworkFilter] = useState<string>('ALL');
  const [selectedRarityFilter, setSelectedRarityFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  const [stockAction, setStockAction] = useState<'SET' | 'ADD' | 'SUBTRACT' | 'AVAILABLE' | 'SOLD'>('SET');
  const [stockValue, setStockValue] = useState<number>(5);
  const [overrideStatus, setOverrideStatus] = useState<string>('KEEP');
  const [excludedCardIds, setExcludedCardIds] = useState<string[]>([]);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

  // Cards matching the category criteria
  const matchingCards = useMemo(() => {
    return cards.filter((card) => {
      if (stockCategoryType === 'tier' && selectedTierFilter !== 'ALL') {
        if (card.tier !== selectedTierFilter) return false;
      }
      if (stockCategoryType === 'network' && selectedNetworkFilter !== 'ALL') {
        if (card.network !== selectedNetworkFilter) return false;
      }
      if (stockCategoryType === 'rarity' && selectedRarityFilter !== 'ALL') {
        if (card.rarity !== selectedRarityFilter) return false;
      }
      if (selectedStatusFilter !== 'ALL') {
        if (card.status !== selectedStatusFilter) return false;
      }
      return true;
    });
  }, [cards, stockCategoryType, selectedTierFilter, selectedNetworkFilter, selectedRarityFilter, selectedStatusFilter]);

  // Non-excluded cards that will actually receive updates
  const effectiveCards = useMemo(() => {
    return matchingCards.filter((c) => !excludedCardIds.includes(c.id));
  }, [matchingCards, excludedCardIds]);

  // Projected stock preview for a card
  const calculateProjectedStock = (currentStock: number) => {
    if (stockAction === 'SET') return Math.max(0, stockValue);
    if (stockAction === 'ADD') return currentStock + Math.max(0, stockValue);
    if (stockAction === 'SUBTRACT') return Math.max(0, currentStock - Math.max(0, stockValue));
    if (stockAction === 'AVAILABLE') return Math.max(1, currentStock);
    if (stockAction === 'SOLD') return 0;
    return currentStock;
  };

  const calculateProjectedStatus = (card: CardProduct, projStock: number) => {
    if (overrideStatus !== 'KEEP') return overrideStatus;
    if (stockAction === 'SOLD' || projStock === 0) return 'SOLD';
    if (stockAction === 'AVAILABLE') return 'AVAILABLE';
    if (card.status === 'SOLD' && projStock > 0) return 'AVAILABLE';
    return card.status;
  };

  // Toggle exclude card from batch
  const handleToggleExcludeCard = (cardId: string) => {
    playSound('click', soundEnabled);
    setExcludedCardIds((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  };

  // Execute bulk stock update
  const handleExecuteStockUpdate = async () => {
    if (effectiveCards.length === 0) {
      addToast({
        title: 'No Cards Selected',
        message: 'No collectible cards selected for bulk stock modification.',
        type: 'info',
      });
      return;
    }

    const confirmMsg = `Are you sure you want to apply bulk stock updates to ${effectiveCards.length} matching cards?`;
    if (!window.confirm(confirmMsg)) return;

    setIsUpdatingStock(true);
    try {
      await bulkUpdateCardStock({
        cardIds: effectiveCards.map((c) => c.id),
        action: stockAction,
        stockValue: stockValue,
        newStatus: overrideStatus !== 'KEEP' ? (overrideStatus as any) : undefined,
      });
      setExcludedCardIds([]);
    } finally {
      setIsUpdatingStock(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================
          TOP HEADER & MODE SELECTOR
      ======================================================== */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-black border border-purple-500/30 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="font-mono text-xs text-purple-400 uppercase tracking-widest font-bold">
                BATCH COMMAND CENTER
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 flex items-center gap-3">
              <span>Bulk Operations & Inventory Manager</span>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                PRO ACTIVE
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Process multiple customer orders simultaneously (instant refund approvals, status completions) or batch-update stock levels across card categories with real-time preview and Firestore synchronization.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1.5 rounded-2xl bg-black/60 border border-white/10 shadow-inner shrink-0">
            <button
              id="bulk-mode-orders-btn"
              onClick={() => {
                playSound('click', soundEnabled);
                setActiveMode('orders');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'orders'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400/50'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Pending Orders Processor</span>
              {pendingRefundOrders.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black animate-pulse">
                  {pendingRefundOrders.length} PENDING
                </span>
              )}
            </button>

            <button
              id="bulk-mode-stock-btn"
              onClick={() => {
                playSound('click', soundEnabled);
                setActiveMode('stock');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'stock'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-600/30 border border-amber-400/50'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Category Stock Synchronizer</span>
              <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-mono">
                {cards.length} Cards
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          MODE 1: BULK ORDERS PROCESSOR
      ======================================================== */}
      {activeMode === 'orders' && (
        <div className="space-y-6">
          {/* Controls Bar & Filters */}
          <div className="p-5 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setOrderFilter('ALL');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                    orderFilter === 'ALL'
                      ? 'bg-white/15 text-white border-white/30'
                      : 'bg-black/30 text-slate-400 border-white/5 hover:text-white'
                  }`}
                >
                  All Orders ({orders.length})
                </button>

                <button
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setOrderFilter('PENDING_REFUND');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                    orderFilter === 'PENDING_REFUND'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md ring-1 ring-amber-400/40'
                      : 'bg-black/30 text-amber-400/80 border-amber-500/20 hover:text-amber-300 hover:bg-amber-500/10'
                  }`}
                >
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Pending Refunds ({pendingRefundOrders.length})</span>
                  {pendingRefundOrders.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </button>

                <button
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setOrderFilter('COMPLETED');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                    orderFilter === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-black/30 text-slate-400 border-white/5 hover:text-white'
                  }`}
                >
                  Completed ({orders.filter((o) => o.status === 'COMPLETED').length})
                </button>

                <button
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setOrderFilter('REFUNDED');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                    orderFilter === 'REFUNDED'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : 'bg-black/30 text-slate-400 border-white/5 hover:text-white'
                  }`}
                >
                  Refunded ({orders.filter((o) => o.status === 'REFUNDED').length})
                </button>
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search orders, customers..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            {/* Selection Quick Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSelectAllVisibleOrders}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-mono text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer border border-white/10"
                >
                  {filteredOrders.length > 0 &&
                  filteredOrders.every((o) => selectedOrderIds.includes(o.id)) ? (
                    <CheckSquare className="w-4 h-4 text-purple-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  <span>Select All Visible ({filteredOrders.length})</span>
                </button>

                {pendingRefundOrders.length > 0 && (
                  <button
                    onClick={handleSelectAllPendingRefunds}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-mono text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Select All Pending Refunds ({pendingRefundOrders.length})</span>
                  </button>
                )}

                {selectedOrderIds.length > 0 && (
                  <button
                    onClick={handleClearOrderSelection}
                    className="text-xs font-mono text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Clear Selection
                  </button>
                )}
              </div>

              {/* Counter Pill */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-400">
                  Selected:{' '}
                  <span className="text-white font-bold">{selectedOrderIds.length}</span> / {orders.length}
                </span>
                {selectedOrderIds.length > 0 && (
                  <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold">
                    Value: {formatPrice(selectedOrdersValue)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sticky / Dedicated Action Execution Bar (Active when >= 1 order selected) */}
          {selectedOrderIds.length > 0 && (
            <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-black border-2 border-purple-500/50 backdrop-blur-xl shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center shrink-0">
                    <CheckSquare className="w-5 h-5 text-purple-300" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">
                      {selectedOrderIds.length} Orders Selected for Bulk Processing
                    </div>
                    <div className="text-xs text-purple-300/80 font-mono">
                      Total Transaction Volume: {formatPrice(selectedOrdersValue)}
                    </div>
                  </div>
                </div>

                {/* Optional Reason Note Input */}
                <div className="w-full lg:w-80">
                  <input
                    type="text"
                    placeholder="Admin note / reason (optional)"
                    value={orderActionReason}
                    onChange={(e) => setOrderActionReason(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Bulk Action Buttons Grid */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-white/10">
                <button
                  disabled={isProcessingOrders}
                  onClick={() => handleExecuteOrderAction('REFUND_APPROVE')}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                  title="Approve refund, credit customer wallets, and restore card inventory"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>⚡ Bulk Approve & Credit Refunds</span>
                </button>

                <button
                  disabled={isProcessingOrders}
                  onClick={() => handleExecuteOrderAction('REFUND_REJECT')}
                  className="px-3.5 py-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-200 font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                  title="Decline refund requests for selected orders"
                >
                  <XCircle className="w-4 h-4 text-amber-400" />
                  <span>Decline Refund Requests</span>
                </button>

                <button
                  disabled={isProcessingOrders}
                  onClick={() => handleExecuteOrderAction('MARK_COMPLETED')}
                  className="px-3.5 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-200 font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <Check className="w-4 h-4 text-blue-400" />
                  <span>Mark as Completed</span>
                </button>

                <button
                  disabled={isProcessingOrders}
                  onClick={() => handleExecuteOrderAction('MARK_VAULT_ARCHIVED')}
                  className="px-3.5 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span>Archive to Vault</span>
                </button>

                <button
                  disabled={isProcessingOrders}
                  onClick={() => handleExecuteOrderAction('DELETE')}
                  className="px-3.5 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 ml-auto"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>Delete Records</span>
                </button>

                <button
                  onClick={handleExportSelectedOrders}
                  className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                  title="Export selected orders as JSON"
                >
                  <Download className="w-4 h-4 text-purple-400" />
                  <span>Export</span>
                </button>
              </div>

              {/* Processing Progress Bar */}
              {isProcessingOrders && orderProgress && (
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs font-mono text-purple-300 mb-1">
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                      <span>Processing selected orders...</span>
                    </span>
                    <span>
                      {orderProgress.current} / {orderProgress.total}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-black/60 overflow-hidden border border-purple-500/30">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-300"
                      style={{
                        width: `${Math.round((orderProgress.current / orderProgress.total) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Orders Table */}
          <div className="rounded-3xl border border-white/10 bg-black/40 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-slate-400 text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-12 text-center">
                      <button
                        onClick={handleSelectAllVisibleOrders}
                        className="cursor-pointer text-slate-400 hover:text-white"
                      >
                        {filteredOrders.length > 0 &&
                        filteredOrders.every((o) => selectedOrderIds.includes(o.id)) ? (
                          <CheckSquare className="w-4 h-4 text-purple-400 inline" />
                        ) : (
                          <Square className="w-4 h-4 inline" />
                        )}
                      </button>
                    </th>
                    <th className="py-3.5 px-4">Order Details</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Card Purchased</th>
                    <th className="py-3.5 px-3">Price Paid</th>
                    <th className="py-3.5 px-3">Current Status</th>
                    <th className="py-3.5 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-14 text-center text-slate-500 font-mono">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <ShoppingBag className="w-8 h-8 text-slate-600 mb-1" />
                          <div className="text-slate-400 font-bold text-sm">No orders matching filter</div>
                          <div className="text-slate-600 text-xs">Try selecting a different filter above.</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const isSelected = selectedOrderIds.includes(order.id);
                      const user = users.find((u) => u.id === order.userId);
                      const isRefunded = order.status === 'REFUNDED' || order.refundStatus === 'COMPLETED';
                      const isRefundPending = !isRefunded && order.refundStatus === 'REQUESTED';

                      return (
                        <tr
                          key={order.id}
                          onClick={() => handleToggleOrder(order.id)}
                          className={`transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-purple-950/30 hover:bg-purple-950/40'
                              : 'hover:bg-white/[0.02]'
                          }`}
                        >
                          <td
                            className="py-3.5 px-4 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleOrder(order.id)}
                              className="w-4 h-4 rounded border-slate-700 text-purple-600 focus:ring-purple-500 cursor-pointer"
                            />
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{order.id}</div>
                            <div className="text-[10px] text-slate-500">{order.transactionRef || order.vaultTokenId}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">
                              {user?.fullName || user?.username || order.username || 'Customer'}
                            </div>
                            <div className="text-[11px] text-purple-400">
                              @{user?.username || order.username || 'collector'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{order.cardName}</div>
                            <div className="text-[10px] text-slate-400">
                              {order.cardTier} Tier • {order.cardRarity || 'Epic'}
                            </div>
                          </td>

                          <td className="py-3.5 px-3 font-bold text-emerald-400 text-sm">
                            {formatPrice(order.finalPrice)}
                          </td>

                          <td className="py-3.5 px-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono inline-flex items-center gap-1 ${
                                isRefunded
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : isRefundPending
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                                  : order.status === 'COMPLETED' || order.status === 'VAULT ARCHIVED'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {isRefunded && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                              {isRefundPending && <Clock className="w-3 h-3 text-amber-400" />}
                              {!isRefunded && !isRefundPending && <Check className="w-3 h-3 text-emerald-400" />}
                              <span>
                                {isRefunded
                                  ? 'REFUND COMPLETED'
                                  : isRefundPending
                                  ? 'REFUND REQUESTED'
                                  : order.status}
                              </span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                            {order.purchaseDate || order.createdAt || 'Recent'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODE 2: CATEGORY STOCK & INVENTORY SYNCHRONIZER
      ======================================================== */}
      {activeMode === 'stock' && (
        <div className="space-y-6">
          {/* Category Filter & Stock Settings Box */}
          <div className="p-6 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
            <div className="border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                <Sliders className="w-4 h-4" />
                <span>STEP 1: Select Target Card Category</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">Choose Which Category of Cards to Update</h3>
            </div>

            {/* Target Selectors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Category Dimension Selector */}
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">
                  Category Type
                </label>
                <select
                  value={stockCategoryType}
                  onChange={(e) => {
                    playSound('click', soundEnabled);
                    setStockCategoryType(e.target.value as any);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="tier" className="bg-slate-900">Card Tier</option>
                  <option value="network" className="bg-slate-900">Card Network</option>
                  <option value="rarity" className="bg-slate-900">Card Rarity</option>
                  <option value="all" className="bg-slate-900">All Catalog Cards</option>
                </select>
              </div>

              {/* Dynamic Value Selector based on Dimension */}
              {stockCategoryType === 'tier' && (
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">
                    Target Tier
                  </label>
                  <select
                    value={selectedTierFilter}
                    onChange={(e) => setSelectedTierFilter(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="ALL" className="bg-slate-900">ALL TIERS</option>
                    <option value="BLACK" className="bg-slate-900">BLACK (Royal)</option>
                    <option value="GOLD" className="bg-slate-900">GOLD (Luxury)</option>
                    <option value="PLATINUM" className="bg-slate-900">PLATINUM (Executive)</option>
                    <option value="ELITE" className="bg-slate-900">ELITE (High-Yield)</option>
                    <option value="SPECIAL" className="bg-slate-900">SPECIAL (Limited Drop)</option>
                  </select>
                </div>
              )}

              {stockCategoryType === 'network' && (
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">
                    Target Network
                  </label>
                  <select
                    value={selectedNetworkFilter}
                    onChange={(e) => setSelectedNetworkFilter(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="ALL" className="bg-slate-900">ALL NETWORKS</option>
                    <option value="VISA" className="bg-slate-900">VISA Infinite</option>
                    <option value="MASTERCARD" className="bg-slate-900">MASTERCARD World</option>
                    <option value="RAWAT" className="bg-slate-900">RAWAT Proprietary Reserve</option>
                  </select>
                </div>
              )}

              {stockCategoryType === 'rarity' && (
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">
                    Target Rarity
                  </label>
                  <select
                    value={selectedRarityFilter}
                    onChange={(e) => setSelectedRarityFilter(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="ALL" className="bg-slate-900">ALL RARITIES</option>
                    <option value="Legendary" className="bg-slate-900">Legendary</option>
                    <option value="Mythic" className="bg-slate-900">Mythic</option>
                    <option value="Epic" className="bg-slate-900">Epic</option>
                    <option value="Rare" className="bg-slate-900">Rare</option>
                    <option value="Common" className="bg-slate-900">Common</option>
                  </select>
                </div>
              )}

              {/* Status Filter */}
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">
                  Current Stock Status
                </label>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="ALL" className="bg-slate-900">ALL STATUSES</option>
                  <option value="AVAILABLE" className="bg-slate-900">AVAILABLE Only</option>
                  <option value="LIMITED" className="bg-slate-900">LIMITED Only</option>
                  <option value="SOLD" className="bg-slate-900">SOLD OUT Only</option>
                  <option value="VAULT_ONLY" className="bg-slate-900">VAULT ONLY</option>
                </select>
              </div>

              {/* Matching Summary Badge */}
              <div className="flex flex-col justify-end">
                <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs font-mono text-amber-300">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Boxes className="w-3.5 h-3.5 text-amber-400" />
                    <span>Matching Cards: {matchingCards.length}</span>
                  </div>
                  <div className="text-[11px] text-amber-300/80 mt-0.5">
                    Current Total Units: {matchingCards.reduce((sum, c) => sum + (c.stockCount || 0), 0)}
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 2: Stock Action Config */}
            <div className="border-t border-white/10 pt-5 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                <Zap className="w-4 h-4" />
                <span>STEP 2: Configure Stock Action & Units</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Stock Action Selector */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">
                    Stock Modification Action
                  </label>
                  <select
                    value={stockAction}
                    onChange={(e) => {
                      playSound('click', soundEnabled);
                      setStockAction(e.target.value as any);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="SET" className="bg-slate-900">Set Exact Stock Count</option>
                    <option value="ADD" className="bg-slate-900">Restock / Add Units (+)</option>
                    <option value="SUBTRACT" className="bg-slate-900">Decrease Units (-)</option>
                    <option value="AVAILABLE" className="bg-slate-900">Restore In Stock (AVAILABLE)</option>
                    <option value="SOLD" className="bg-slate-900">Mark as Sold Out (0 Stock)</option>
                  </select>
                </div>

                {/* Stock Number Input (if SET, ADD, SUBTRACT) */}
                {(stockAction === 'SET' || stockAction === 'ADD' || stockAction === 'SUBTRACT') && (
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">
                      {stockAction === 'SET'
                        ? 'New Stock Quantity'
                        : stockAction === 'ADD'
                        ? 'Units to Add (+)'
                        : 'Units to Subtract (-)'}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="9999"
                        value={stockValue}
                        onChange={(e) => setStockValue(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                      />
                      {/* Quick preset pills */}
                      <div className="flex items-center gap-1 shrink-0">
                        {[1, 5, 10, 25].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setStockValue(preset)}
                            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-slate-300 cursor-pointer"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Optional Status Override */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">
                    Status Override (Optional)
                  </label>
                  <select
                    value={overrideStatus}
                    onChange={(e) => setOverrideStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="KEEP" className="bg-slate-900">Keep / Auto Status</option>
                    <option value="AVAILABLE" className="bg-slate-900">Force AVAILABLE</option>
                    <option value="LIMITED" className="bg-slate-900">Force LIMITED</option>
                    <option value="VAULT_ONLY" className="bg-slate-900">Force VAULT ONLY</option>
                    <option value="SOLD" className="bg-slate-900">Force SOLD OUT</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Execute Button */}
            <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs font-mono text-slate-400">
                Will update <span className="text-amber-400 font-bold">{effectiveCards.length}</span> of{' '}
                <span className="text-white">{matchingCards.length}</span> matching cards.
                {excludedCardIds.length > 0 && (
                  <span className="text-slate-500 ml-1">({excludedCardIds.length} excluded)</span>
                )}
              </div>

              <button
                id="execute-bulk-stock-btn"
                disabled={isUpdatingStock || effectiveCards.length === 0}
                onClick={handleExecuteStockUpdate}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-black font-mono text-xs font-black tracking-wider transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isUpdatingStock ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>Synchronizing Stock to Firestore...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-black" />
                    <span>⚡ APPLY BULK STOCK UPDATE ({effectiveCards.length} CARDS)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Live Preview Diff Table */}
          <div className="rounded-3xl border border-white/10 bg-black/40 overflow-hidden shadow-2xl space-y-2">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">Matching Cards Preview & Diff</h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  Inspect projected stock and status changes before executing. Uncheck any card to exclude from this batch.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExcludedCardIds([])}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 cursor-pointer border border-white/10"
                >
                  Include All
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-slate-400 text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4 w-12 text-center">Include</th>
                    <th className="py-3 px-4">Card Collectible</th>
                    <th className="py-3 px-4">Tier & Network</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Current Stock</th>
                    <th className="py-3 px-4">Projected Stock</th>
                    <th className="py-3 px-4">Projected Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {matchingCards.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500 font-mono">
                        No collectible cards match the selected category criteria.
                      </td>
                    </tr>
                  ) : (
                    matchingCards.map((card) => {
                      const isExcluded = excludedCardIds.includes(card.id);
                      const currentStock = card.stockCount ?? 1;
                      const projStock = calculateProjectedStock(currentStock);
                      const projStatus = calculateProjectedStatus(card, projStock);
                      const stockChanged = currentStock !== projStock;

                      return (
                        <tr
                          key={card.id}
                          className={`transition-colors ${
                            isExcluded
                              ? 'opacity-40 bg-black/40'
                              : stockChanged
                              ? 'hover:bg-amber-500/[0.03]'
                              : 'hover:bg-white/[0.02]'
                          }`}
                        >
                          <td className="py-3 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={!isExcluded}
                              onChange={() => handleToggleExcludeCard(card.id)}
                              className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-400 cursor-pointer"
                            />
                          </td>

                          <td className="py-3 px-4 font-bold text-white">
                            <div className="flex items-center gap-2">
                              <span>{card.name}</span>
                              {card.featured && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                                  FEATURED
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500">{card.id}</div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-300">
                              {card.tier} • {card.network || 'VISA'}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-bold text-emerald-400">
                            {formatPrice(card.price)}
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-300">{currentStock}</span>
                            <span className="text-[10px] text-slate-500 ml-1">({card.status})</span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-bold font-mono text-sm ${
                                  stockChanged
                                    ? projStock > currentStock
                                      ? 'text-emerald-400'
                                      : 'text-rose-400'
                                    : 'text-slate-300'
                                }`}
                              >
                                {projStock}
                              </span>
                              {stockChanged && (
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                                    projStock > currentStock
                                      ? 'bg-emerald-500/20 text-emerald-300'
                                      : 'bg-rose-500/20 text-rose-300'
                                  }`}
                                >
                                  {projStock > currentStock
                                    ? `+${projStock - currentStock}`
                                    : `${projStock - currentStock}`}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                projStatus === 'AVAILABLE'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : projStatus === 'LIMITED'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {projStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
