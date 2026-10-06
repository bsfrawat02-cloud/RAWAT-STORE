import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { FraudAlert, UserAccount } from '../../types';
import { playSound } from '../../utils/audio';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  UserX,
  UserCheck,
  Activity,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw
} from 'lucide-react';

export const AdminSecurityFraudMonitor: React.FC = () => {
  const { users, orders, paymentRequests, transactions, adminUpdateUserStatus, addAuditLog, soundEnabled } = useStore();

  // Smart heuristic fraud alerts based on system state
  const [alerts, setAlerts] = useState<FraudAlert[]>(() => {
    return [
      {
        id: 'frd-101',
        userId: 'usr_demo_customer',
        username: 'demo_customer',
        type: 'RAPID_ORDERS',
        severity: 'MEDIUM',
        description: 'Multiple high-value vault acquisitions attempted within 3 minutes.',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        resolved: false
      },
      {
        id: 'frd-102',
        userId: 'usr_1024',
        username: 'crypto_knight',
        type: 'FAILED_TRANSACTIONS',
        severity: 'HIGH',
        description: 'Duplicate UTR submission detected across 2 separate payment requests.',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        resolved: false
      },
      {
        id: 'frd-103',
        userId: 'usr_test_99',
        username: 'speedy_trader',
        type: 'UNUSUAL_DEPOSIT',
        severity: 'LOW',
        description: 'Deposit amount (₹50,000) exceeds standard customer 24-hour limit.',
        timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
        resolved: true,
        actionTaken: 'Verified with bank statement by Admin'
      }
    ];
  });

  const [feedback, setFeedback] = useState<string | null>(null);

  const handleResolve = (alertId: string, action: string) => {
    playSound('purchase', soundEnabled);
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, resolved: true, actionTaken: action } : a))
    );
    setFeedback(`Alert marked as resolved: ${action}`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSuspendUser = (userId: string, username: string) => {
    playSound('denied', soundEnabled);
    adminUpdateUserStatus(userId, 'suspended');
    addAuditLog({
      action: 'USER_STATUS_UPDATED',
      targetUserId: userId,
      targetUsername: username,
      reason: 'Account suspended via Automated Fraud Sentinel'
    });
    setFeedback(`Collector @${username} has been suspended immediately.`);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleUnsuspendUser = (userId: string, username: string) => {
    playSound('click', soundEnabled);
    adminUpdateUserStatus(userId, 'active');
    addAuditLog({
      action: 'USER_STATUS_UPDATED',
      targetUserId: userId,
      targetUsername: username,
      reason: 'Account restored/unsuspended by Admin'
    });
    setFeedback(`Collector @${username} status restored to ACTIVE.`);
    setTimeout(() => setFeedback(null), 3500);
  };

  const unresolvedCount = alerts.filter((a) => !a.resolved).length;
  const suspendedUsers = users.filter((u) => u.status === 'suspended');

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-zinc-950/80 border border-rose-500/20 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
            <span className="text-[10px] text-rose-400 uppercase tracking-widest font-bold">
              Autonomous Risk & Fraud Detection Engine
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-tech text-white tracking-tight">
            Security Monitor & Anti-Fraud Sentinel
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Real-time heuristic analysis flagging duplicate UTR claims, velocity spikes, and suspicious wallet imbalances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center">
            <span className="text-[10px] text-rose-300 block uppercase font-bold">Active Alerts</span>
            <span className="text-xl font-bold font-tech text-white">{unresolvedCount} Flagged</span>
          </div>
          <div className="p-3 rounded-2xl bg-black/60 border border-white/10 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Suspended</span>
            <span className="text-xl font-bold font-tech text-amber-400">{suspendedUsers.length} Users</span>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Flagged Alerts List */}
      <div className="space-y-3">
        <h3 className="font-tech text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-400" />
          <span>Live Heuristic Risk Signals</span>
        </h3>

        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-5 rounded-3xl border backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
              alert.resolved
                ? 'bg-zinc-950/40 border-white/5 opacity-65'
                : alert.severity === 'HIGH' || alert.severity === 'CRITICAL'
                ? 'bg-rose-950/20 border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                : 'bg-amber-950/20 border-amber-500/30'
            }`}
          >
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  alert.severity === 'HIGH' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                  alert.severity === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                }`}>
                  {alert.severity} RISK
                </span>
                <span className="text-[10px] text-purple-300 font-bold">
                  @{alert.username}
                </span>
                <span className="text-[10px] text-slate-500">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
                {alert.resolved && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    RESOLVED
                  </span>
                )}
              </div>

              <h4 className="font-bold text-white text-xs">
                {alert.type.replace(/_/g, ' ')}
              </h4>
              <p className="text-slate-300 text-xs">
                {alert.description}
              </p>
              {alert.actionTaken && (
                <p className="text-emerald-400 text-[11px] font-bold">
                  ✓ Action: {alert.actionTaken}
                </p>
              )}
            </div>

            {!alert.resolved && (
              <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                <button
                  onClick={() => handleResolve(alert.id, 'Cleared by Admin Audit')}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verify & Clear</span>
                </button>
                <button
                  onClick={() => handleSuspendUser(alert.userId, alert.username)}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Freeze Account</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
