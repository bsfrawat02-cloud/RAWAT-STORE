import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Home,
  Layers,
  ShoppingBag,
  User,
  Sparkles,
  Receipt,
  Settings,
  Shield,
  Send,
  Bell
} from 'lucide-react';
import { playSound } from '../../utils/audio';

export const SidebarNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    soundEnabled,
    isAdmin,
    notifications,
    isNotificationsModalOpen,
    setIsNotificationsModalOpen
  } = useStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navLinks: {
    id: 'home' | 'cards' | 'orders' | 'vault' | 'transactions' | 'profile';
    label: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
  }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'cards', label: '3D Cards', icon: Layers },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'vault', label: 'Vault', icon: Sparkles },
    { id: 'transactions', label: 'Ledger', icon: Receipt },
    { id: 'profile', label: 'Dashboard', icon: User },
  ];

  return (
    <aside className="z-30 hidden md:flex w-20 flex-col items-center justify-between border-r border-white/5 bg-black/40 py-8 backdrop-blur-xl shrink-0 h-screen sticky top-0">
      {/* Brand Icon Mark */}
      <div
        onClick={() => {
          playSound('click', soundEnabled);
          setActiveTab('home');
        }}
        title="RAWAT CARD STORE"
        className="mb-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/20 transition-transform hover:scale-105 active:scale-95 text-white font-tech font-black text-sm"
      >
        R
      </div>

      {/* Navigation Icons Stack */}
      <nav className="flex flex-1 flex-col gap-6">
        {navLinks.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                playSound('click', soundEnabled);
                setActiveTab(item.id);
              }}
              title={item.label}
              className={`relative flex items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-purple-400 opacity-100 bg-white/5 shadow-[0_0_16px_rgba(168,85,247,0.25)]'
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={20} />
              {isActive && (
                <span className="absolute -left-2 w-1 h-5 rounded-r-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              )}
            </button>
          );
        })}

        {/* Notifications Flyout Trigger */}
        <button
          onClick={() => {
            playSound('click', soundEnabled);
            setIsNotificationsModalOpen(true);
          }}
          title={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notification Center'}
          className={`relative flex items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer group ${
            isNotificationsModalOpen
              ? 'text-purple-400 bg-white/10 shadow-[0_0_16px_rgba(168,85,247,0.3)]'
              : 'text-slate-500 hover:text-white hover:bg-white/5'
          }`}
        >
          <Bell size={20} className="group-hover:rotate-12 transition-transform" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500 text-[9px] font-mono font-bold text-white shadow-sm shadow-purple-500/50 animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Telegram Support Link */}
        <a
          href="https://t.me/carderseller1"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => playSound('click', soundEnabled)}
          title="Telegram Support: @carderseller1"
          className="relative flex items-center justify-center p-2.5 rounded-xl text-sky-400 hover:text-white hover:bg-sky-500/20 transition-all cursor-pointer border border-sky-500/20 group"
        >
          <Send size={18} />
        </a>
      </nav>
    </aside>
  );
};
