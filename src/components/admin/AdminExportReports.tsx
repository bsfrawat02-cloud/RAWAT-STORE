import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { playSound } from '../../utils/audio';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Check,
  Shield,
  Layers,
  Database,
  Calendar,
  CreditCard,
  Users,
  Wallet,
  Receipt
} from 'lucide-react';

export const AdminExportReports: React.FC = () => {
  const { orders, users, transactions, paymentRequests, auditLogs, cards, soundEnabled } = useStore();
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Helper to trigger browser download of a CSV text file
  const downloadCSV = (filename: string, csvContent: string) => {
    playSound('purchase', soundEnabled);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(`Exported: ${filename}`);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  // Export 1: All Orders & Acquisitions
  const exportOrders = () => {
    const headers = ['Order ID', 'Order Number', 'User ID', 'Card Name', 'Tier', 'Finish', 'Original Price (INR)', 'Discount (INR)', 'Final Price (INR)', 'Coupon Used', 'Status', 'Date', 'Transaction Ref', 'Vault Token'];
    const rows = orders.map((o) => [
      `"${o.id}"`,
      `"${o.orderNumber}"`,
      `"${o.userId || ''}"`,
      `"${o.cardName}"`,
      `"${o.cardTier}"`,
      `"${o.cardFinish}"`,
      o.originalPrice,
      o.discountAmount,
      o.finalPrice,
      `"${o.couponUsed || 'NONE'}"`,
      `"${o.status}"`,
      `"${o.purchaseDate}"`,
      `"${o.transactionRef}"`,
      `"${o.vaultTokenId}"`
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCSV(`rawat_store_orders_${Date.now()}.csv`, csv);
  };

  // Export 2: Customer Base & VIP Tiers
  const exportUsers = () => {
    const headers = ['User ID', 'Username', 'Full Name', 'Email', 'Phone', 'Role', 'Membership Tier', 'Status', 'Email Verified', 'Referral Code', 'Total Referral Earnings (INR)', 'Registered At'];
    const rows = users.map((u) => [
      `"${u.id}"`,
      `"${u.username}"`,
      `"${u.fullName || ''}"`,
      `"${u.email}"`,
      `"${u.phone || ''}"`,
      `"${u.role}"`,
      `"${u.membershipTier}"`,
      `"${u.status}"`,
      u.isEmailVerified ? 'YES' : 'NO',
      `"${u.referralCode}"`,
      (u.totalReferralBonusEarned || 0) + (u.totalReferralCommissionEarned || 0),
      `"${u.createdAt}"`
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCSV(`rawat_store_collectors_${Date.now()}.csv`, csv);
  };

  // Export 3: Wallet Transactions Ledger
  const exportTransactions = () => {
    const headers = ['Txn ID', 'User ID', 'Username', 'Type', 'Amount (INR)', 'Balance Before', 'Balance After', 'Status', 'Description', 'Created By', 'Timestamp', 'Reference ID'];
    const rows = transactions.map((t) => [
      `"${t.id}"`,
      `"${t.userId}"`,
      `"${t.username}"`,
      `"${t.type}"`,
      t.amount,
      t.balanceBefore,
      t.balanceAfter,
      `"${t.status}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.createdBy}"`,
      `"${t.createdAt}"`,
      `"${t.referenceId || ''}"`
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCSV(`rawat_store_transactions_${Date.now()}.csv`, csv);
  };

  // Export 4: Payment Requests & UPI Deposits
  const exportPayments = () => {
    const headers = ['Payment ID', 'User ID', 'Username', 'User Email', 'Amount (INR)', 'Status', 'UTR Reference', 'Requested At', 'Reviewed At', 'Reviewed By', 'Rejection Reason'];
    const rows = paymentRequests.map((p) => [
      `"${p.id}"`,
      `"${p.userId}"`,
      `"${p.username}"`,
      `"${p.userEmail}"`,
      p.amount,
      `"${p.status}"`,
      `"${p.utrRef || ''}"`,
      `"${p.requestedAt}"`,
      `"${p.reviewedAt || ''}"`,
      `"${p.reviewedBy || ''}"`,
      `"${p.rejectionReason || ''}"`
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCSV(`rawat_store_upi_deposits_${Date.now()}.csv`, csv);
  };

  // Export 5: Admin Audit Trails
  const exportAuditLogs = () => {
    const headers = ['Log ID', 'Action', 'Admin Username', 'Target Username', 'Amount', 'Timestamp', 'Reason'];
    const rows = auditLogs.map((l) => [
      `"${l.id}"`,
      `"${l.action}"`,
      `"${l.adminUsername}"`,
      `"${l.targetUsername || ''}"`,
      l.amount || 0,
      `"${l.timestamp}"`,
      `"${l.reason.replace(/"/g, '""')}"`
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCSV(`rawat_store_audit_logs_${Date.now()}.csv`, csv);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-zinc-950/80 border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-1">
          <Database className="w-4 h-4 text-purple-400" />
          <span className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">
            Data Ledger & Compliance Hub
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black font-tech text-white tracking-tight">
          Export Storefront Datasets & Audit Reports
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xl">
          Generate structured CSV exports formatted for Excel, accounting systems, and compliance audits with a single click.
        </p>
      </div>

      {downloadSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{downloadSuccess} downloaded successfully.</span>
        </div>
      )}

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Card 1: Orders */}
        <div className="p-5 rounded-3xl bg-zinc-950/70 border border-white/10 hover:border-purple-500/30 transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <Receipt className="w-5 h-5" />
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">
                {orders.length} Records
              </span>
            </div>
            <h4 className="font-tech text-base font-bold text-white">Acquisitions & Orders</h4>
            <p className="text-slate-400 text-xs mt-1">
              Complete log of all digital card orders, customer IDs, prices, discounts, and vault tokens.
            </p>
          </div>

          <button
            onClick={exportOrders}
            className="w-full py-2.5 px-4 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/30 font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Orders (CSV)</span>
          </button>
        </div>

        {/* Card 2: Customers */}
        <div className="p-5 rounded-3xl bg-zinc-950/70 border border-white/10 hover:border-sky-500/30 transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-300 border border-sky-500/30">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">
                {users.length} Users
              </span>
            </div>
            <h4 className="font-tech text-base font-bold text-white">Collector Base Roster</h4>
            <p className="text-slate-400 text-xs mt-1">
              Registered users, VIP membership tiers, referral codes, commission sums, and verification status.
            </p>
          </div>

          <button
            onClick={exportUsers}
            className="w-full py-2.5 px-4 rounded-xl bg-sky-600/20 hover:bg-sky-600 text-sky-200 hover:text-white border border-sky-500/30 font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Collectors (CSV)</span>
          </button>
        </div>

        {/* Card 3: Wallet Transactions */}
        <div className="p-5 rounded-3xl bg-zinc-950/70 border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">
                {transactions.length} Txns
              </span>
            </div>
            <h4 className="font-tech text-base font-bold text-white">Wallet Transactions Ledger</h4>
            <p className="text-slate-400 text-xs mt-1">
              Complete credit/debit transaction history, opening/closing balances, timestamps, and reason tags.
            </p>
          </div>

          <button
            onClick={exportTransactions}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-200 hover:text-white border border-emerald-500/30 font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Ledger (CSV)</span>
          </button>
        </div>

        {/* Card 4: UPI Payment Deposits */}
        <div className="p-5 rounded-3xl bg-zinc-950/70 border border-white/10 hover:border-amber-500/30 transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">
                {paymentRequests.length} Deposits
              </span>
            </div>
            <h4 className="font-tech text-base font-bold text-white">UPI Payment Inflow</h4>
            <p className="text-slate-400 text-xs mt-1">
              Deposit request audit logs, customer UTR numbers, approval timestamps, and admin notes.
            </p>
          </div>

          <button
            onClick={exportPayments}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-600/20 hover:bg-amber-600 text-amber-200 hover:text-white border border-amber-500/30 font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export UPI Requests (CSV)</span>
          </button>
        </div>

        {/* Card 5: System Audit Logs */}
        <div className="p-5 rounded-3xl bg-zinc-950/70 border border-white/10 hover:border-rose-500/30 transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">
                {auditLogs.length} Audit Logs
              </span>
            </div>
            <h4 className="font-tech text-base font-bold text-white">Security & Admin Audit</h4>
            <p className="text-slate-400 text-xs mt-1">
              Immutable record of administrative balance adjustments, status changes, and settings updates.
            </p>
          </div>

          <button
            onClick={exportAuditLogs}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/30 font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Audit Trail (CSV)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
