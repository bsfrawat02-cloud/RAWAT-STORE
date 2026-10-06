import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Home, Layers, ShoppingBag, User, Wallet, Sparkles } from 'lucide-react';
import { playSound } from '../../utils/audio';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, orders, soundEnabled, notifications } = useStore();
  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const navItems: {
    id: 'home' | 'cards' | 'orders' | 'vault' | 'transactions' | 'profile';
    label: string;
    icon: React.ElementType;
    badge?: number;
  }[] = [
    { id: 'home', label: 'HOME', icon: Home },
    { id: 'cards', label: 'STORE', icon: Layers },
    { id: 'orders', label: 'ORDERS', icon: ShoppingBag, badge: orders.length },
    { id: 'vault', label: 'COLLECTION', icon: Sparkles },
    { id: 'transactions', label: 'WALLET', icon: Wallet },
    { id: 'profile', label: 'PROFILE', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#050505]/95 backdrop-blur-2xl border-t border-white/10 px-1 py-1.5 safe-area-pb">
      <div className="grid grid-cols-6 items-center justify-items-center w-full max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                playSound('click', soundEnabled);
                setActiveTab(item.id);
              }}
              className={`relative flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 cursor-pointer w-full ${
                isActive
                  ? 'text-purple-400 bg-white/10 font-bold'
                  : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {item.badge !== undefined && item.badge > 0 && item.id === 'orders' && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-purple-500 text-white rounded-full text-[8px] font-mono font-bold flex items-center justify-center shadow-[0_0_6px_rgba(168,85,247,0.8)]">
                    {item.badge}
                  </span>
                )}
                {item.id === 'profile' && unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-500 rounded-full border border-black shadow-[0_0_6px_rgba(168,85,247,0.8)] animate-pulse" />
                )}
              </div>
              <span className="text-[8px] font-mono mt-0.5 tracking-wider truncate max-w-full">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
