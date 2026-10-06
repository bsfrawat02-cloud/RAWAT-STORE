import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Bell,
  CheckCircle2,
  Trash2,
  X,
  ShoppingBag,
  Wallet,
  Sparkles,
  Shield,
  Layers,
  ArrowRight,
  Clock,
  Check
} from 'lucide-react';
import { playSound } from '../../utils/audio';

export const NotificationsDrawerModal: React.FC = () => {
  const {
    isNotificationsModalOpen,
    setIsNotificationsModalOpen,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    soundEnabled,
    setActiveTab
  } = useStore();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'order' | 'wallet'>('all');

  if (!isNotificationsModalOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((notif) => {
    if (activeFilter === 'unread') return !notif.read;
    if (activeFilter === 'order') return notif.type === 'order';
    if (activeFilter === 'wallet') return notif.type === 'payment' || notif.type === 'wallet';
    return true;
  });

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-purple-400" />;
      case 'payment':
      case 'wallet':
        return <Wallet className="w-4 h-4 text-emerald-400" />;
      case 'coupon':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'security':
        return <Shield className="w-4 h-4 text-rose-400" />;
      default:
        return <Bell className="w-4 h-4 text-blue-400" />;
    }
  };

  const handleAction = (notif: (typeof notifications)[0]) => {
    markNotificationAsRead(notif.id);
    setIsNotificationsModalOpen(false);
    playSound('click', soundEnabled);

    if (notif.type === 'order') {
      setActiveTab('orders');
    } else if (notif.type === 'payment' || notif.type === 'wallet') {
      setActiveTab('transactions');
    } else if (notif.type === 'coupon') {
      setActiveTab('cards');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notifications-drawer-title"
      className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
    >
      {/* Backdrop click to dismiss */}
      <div
        className="absolute inset-0"
        onClick={() => {
          playSound('click', soundEnabled);
          setIsNotificationsModalOpen(false);
        }}
      />

      {/* Slide-out Drawer Panel */}
      <aside className="relative z-10 w-full max-w-md bg-[#0a0b12] border-l border-white/10 shadow-2xl flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="notifications-drawer-title" className="font-tech font-bold text-base sm:text-lg text-white">
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-mono font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-slate-400">Order updates, wallet alerts & announcements</p>
            </div>
          </div>

          <button
            onClick={() => {
              playSound('click', soundEnabled);
              setIsNotificationsModalOpen(false);
            }}
            className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close notifications drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Bar & Quick Controls */}
        <div className="px-4 py-3 border-b border-white/5 bg-black/40 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'unread', label: `Unread (${unreadCount})` },
                { id: 'order', label: 'Orders' },
                { id: 'wallet', label: 'Wallet' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  playSound('click', soundEnabled);
                  setActiveFilter(tab.id);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {unreadCount > 0 && (
              <button
                onClick={() => {
                  playSound('click', soundEnabled);
                  markAllNotificationsAsRead();
                }}
                title="Mark all as read"
                className="text-[11px] font-mono text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 cursor-pointer px-1.5 py-0.5 rounded hover:bg-purple-950/40"
              >
                <Check className="w-3 h-3" />
                <span className="hidden sm:inline">Read All</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={() => {
                  playSound('click', soundEnabled);
                  clearNotifications();
                }}
                title="Clear all notifications"
                className="text-[11px] font-mono text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer px-1.5 py-0.5 rounded hover:bg-rose-950/30"
              >
                <Trash2 className="w-3 h-3" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications Scroll List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 text-slate-500">
              <div className="h-14 w-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-slate-600">
                <Bell className="w-6 h-6" />
              </div>
              <p className="font-tech font-bold text-slate-300 text-sm">Inbox is completely clear</p>
              <p className="text-xs font-mono text-slate-500 mt-1 max-w-xs">
                {activeFilter === 'unread'
                  ? 'No unread notifications left.'
                  : 'New purchases, vault updates, and credit receipts will appear here.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markNotificationAsRead(notif.id)}
                className={`relative p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer group ${
                  notif.read
                    ? 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/15'
                    : 'bg-purple-950/25 border-purple-500/30 text-slate-200 shadow-sm hover:border-purple-400/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10 shrink-0 mt-0.5">
                    {getNotifIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <h4 className="font-semibold text-xs sm:text-sm text-white truncate group-hover:text-purple-300 transition-colors">
                          {notif.title}
                        </h4>
                        {!notif.read && (
                          <span className="h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.9)] shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {notif.timestamp}
                      </span>
                    </div>

                    <p className="text-[11px] sm:text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>

                    {/* Quick navigation action pill */}
                    <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-white/5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(notif);
                        }}
                        className="text-[10px] font-mono font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>
                          {notif.type === 'order'
                            ? 'View Order'
                            : notif.type === 'payment' || notif.type === 'wallet'
                            ? 'Open Wallet'
                            : notif.type === 'coupon'
                            ? 'Open Store'
                            : 'View Details'}
                        </span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>

                      {!notif.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markNotificationAsRead(notif.id);
                          }}
                          className="text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-white/[0.02] text-center text-[10px] font-mono text-slate-500">
          RAWAT CARD STORE &bull; Instant Notification Channel
        </div>
      </aside>
    </div>
  );
};
