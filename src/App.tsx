/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/common/Header';
import { SidebarNav } from './components/common/SidebarNav';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { AmbientBackground } from './components/common/AmbientBackground';
import { CustomCursor } from './components/common/CustomCursor';
import { CoinBurstContainer } from './components/common/CoinBurst';
import { HomePage } from './pages/HomePage';
import { CardsPage } from './pages/CardsPage';
import { OrdersPage } from './pages/OrdersPage';
import { VaultPage } from './pages/VaultPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { CardDetailModal } from './components/modals/CardDetailModal';
import { PurchaseSuccessModal } from './components/modals/PurchaseSuccessModal';
import { SearchModal } from './components/modals/SearchModal';
import { AuthModal } from './components/modals/AuthModal';
import { AuthCelebrationModal } from './components/modals/AuthCelebrationModal';
import { PaymentModal } from './components/modals/PaymentModal';
import { LogoutConfirmModal } from './components/modals/LogoutConfirmModal';
import { CardComparisonModal } from './components/modals/CardComparisonModal';
import { VipUpgradeModal } from './components/modals/VipUpgradeModal';
import { NotificationsDrawerModal } from './components/modals/NotificationsDrawerModal';
import { CinematicVaultUnlockModal } from './components/modals/CinematicVaultUnlockModal';
import { VipConciergeModal } from './components/modals/VipConciergeModal';
import { PrestigeLiveTicker } from './components/common/PrestigeLiveTicker';
import { ToastContainer } from './components/common/ToastContainer';
import { PwaInstallPrompt } from './components/pwa/PwaInstallPrompt';
import { CustomerLiveChat } from './components/chat/CustomerLiveChat';
import { Plus, Send, ExternalLink, Swords, Crown } from 'lucide-react';
import { playSound } from './utils/audio';

function StoreApp() {
  const {
    activeTab,
    setActiveTab,
    selectedCard,
    setSelectedCard,
    completedOrder,
    setCompletedOrder,
    setIsPaymentModalOpen,
    soundEnabled,
    isComparisonModalOpen,
    setIsComparisonModalOpen,
    currentUser,
    authCelebrationData,
    setAuthCelebrationData,
    isVipConciergeOpen,
    setIsVipConciergeOpen,
    cinematicUnlockCard,
    setCinematicUnlockCard,
  } = useStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isVipUpgradeOpen, setIsVipUpgradeOpen] = useState(false);

  const handleCloseCelebration = useCallback(() => {
    setAuthCelebrationData(null);
  }, [setAuthCelebrationData]);

  return (
    <div className="flex min-h-screen bg-[#050505] text-slate-100 font-sans relative selection:bg-purple-500/30 selection:text-purple-200 overflow-x-hidden">
      {/* Aesthetic Cyber Dynamic Stardust Custom Cursor */}
      <CustomCursor />

      {/* Global Interactive Coin & Particle Fountain System */}
      <CoinBurstContainer />

      {/* Immersive Theme Ambient Lighting Glows & Cyber Grid */}
      <AmbientBackground />

      {/* Desktop Left Sidebar Rail Navigation */}
      <SidebarNav />

      {/* Main Content Viewport */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header */}
        <Header
          onOpenSearchModal={() => setIsSearchOpen(true)}
        />

        {/* Main Routed Page Content */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-28 md:pb-16 min-w-0 overflow-x-hidden">
          {activeTab === 'home' && (
            <HomePage
              onOpenVipCeremony={() => setIsVipUpgradeOpen(true)}
            />
          )}
          {activeTab === 'cards' && <CardsPage />}
          {activeTab === 'orders' && <OrdersPage />}
          {activeTab === 'vault' && <VaultPage />}
          {activeTab === 'transactions' && <TransactionsPage />}
          {activeTab === 'profile' && <ProfilePage />}
          {activeTab === 'admin' && <AdminPage />}

          {/* Immersive Theme Clean Footer */}
          <footer className="mt-12 sm:mt-16 flex flex-col sm:flex-row items-center justify-between border-t border-white/5 pt-6 text-[11px] font-mono text-slate-500 gap-4 text-center sm:text-left">
            <div>&copy; 2026 RAWAT CARD STORE. Fictional 3D Collectibles Storefront.</div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 uppercase tracking-widest text-[10px]">
              <button
                onClick={() => {
                  playSound('upgrade', soundEnabled);
                  setIsVipUpgradeOpen(true);
                }}
                className="text-purple-400 hover:text-purple-300 font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <Crown size={11} />
                <span>VIP Matrix</span>
              </button>
              <button
                onClick={() => {
                  playSound('click', soundEnabled);
                  setActiveTab('cards');
                }}
                className="hover:text-purple-400 transition-colors cursor-pointer"
              >
                Collection
              </button>
              <button
                onClick={() => {
                  playSound('click', soundEnabled);
                  setActiveTab('vault');
                }}
                className="hover:text-purple-400 transition-colors cursor-pointer"
              >
                Vault
              </button>
              <button
                onClick={() => {
                  playSound('click', soundEnabled);
                  setActiveTab('transactions');
                }}
                className="hover:text-purple-400 transition-colors cursor-pointer"
              >
                Ledger
              </button>
              <button
                onClick={() => {
                  playSound('click', soundEnabled);
                  setActiveTab('orders');
                }}
                className="hover:text-purple-400 transition-colors cursor-pointer"
              >
                Orders
              </button>
              <a
                href="https://t.me/carderseller1"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playSound('click', soundEnabled)}
                className="hover:text-sky-400 text-sky-400 font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <Send size={11} />
                <span>Support (@carderseller1)</span>
              </a>
            </div>
          </footer>
        </main>
      </div>

      {/* Floating Action Controls Bar (Bottom Left & Right) */}
      
      {/* Floating Telegram Support Quick Trigger */}
      <div className="fixed bottom-6 left-6 md:left-24 z-40 flex h-11 sm:h-14 items-center gap-2 sm:gap-3 rounded-full border border-sky-500/30 bg-[#070b16]/90 px-3.5 sm:px-5 backdrop-blur-2xl shadow-2xl hover:border-sky-400 transition-all group">
        <div className="h-2 w-2 animate-pulse rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
        <a
          href="https://t.me/carderseller1"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => playSound('click', soundEnabled)}
          className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold text-sky-300 group-hover:text-white transition-colors cursor-pointer font-mono"
        >
          <Send size={14} className="text-sky-400 group-hover:translate-x-0.5 transition-transform" />
          <span className="hidden xs:inline">Support:</span>
          <span className="text-sky-400 underline decoration-sky-500/40">@carderseller1</span>
        </a>
      </div>

      {/* Floating Add Funds Quick Trigger */}
      <div className="fixed bottom-6 right-6 z-40 hidden sm:flex h-14 items-center gap-3 rounded-full border border-white/10 bg-black/80 px-5 backdrop-blur-2xl shadow-2xl hover:border-white/20 transition-all">
        <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
        <span className="text-xs font-medium text-slate-300 font-mono">
          UPI Gateway: <span className="text-emerald-400 font-bold">ONLINE</span>
        </span>
        <div className="h-4 w-px bg-white/10 mx-1" />
        <button
          onClick={() => {
            playSound('click', soundEnabled);
            setIsPaymentModalOpen(true);
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer font-mono"
        >
          <Plus size={14} strokeWidth={3} />
          <span>ADD FUNDS</span>
        </button>
      </div>

      {/* Modals & Special Overlay Engines */}
      <AuthModal />

      <AuthCelebrationModal
        data={authCelebrationData}
        onClose={handleCloseCelebration}
      />

      <PaymentModal />

      <LogoutConfirmModal />

      <CardDetailModal
        card={selectedCard}
        onClose={() => setSelectedCard(null)}
      />

      <PurchaseSuccessModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <CardComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
      />

      {/* VIP Tier Ascension Ceremony Modal */}
      <VipUpgradeModal
        isOpen={isVipUpgradeOpen}
        onClose={() => setIsVipUpgradeOpen(false)}
        currentTier={currentUser?.membershipTier || 'Royal Noir'}
      />

      {/* Slide-out Notifications Center Drawer */}
      <NotificationsDrawerModal />

      {/* Cinematic High-Security Vault Unlock & Unboxing Ceremony */}
      <CinematicVaultUnlockModal
        card={cinematicUnlockCard}
        isOpen={!!cinematicUnlockCard}
        onClose={() => setCinematicUnlockCard(null)}
        onNavigateToVault={() => {
          setCinematicUnlockCard(null);
          setActiveTab('vault');
        }}
      />

      {/* VIP Concierge Private High-Roller Lounge */}
      <VipConciergeModal
        isOpen={isVipConciergeOpen}
        onClose={() => setIsVipConciergeOpen(false)}
      />

      {/* Prestige Live Acquisition Ticker (Collector Mint Pulse) */}
      {activeTab !== 'admin' && <PrestigeLiveTicker />}

      {/* Global Interactive Toast Notification System */}
      <ToastContainer />

      {/* PWA Mobile Install & Push Notification Banner */}
      <PwaInstallPrompt />

      {/* In-App Real-Time Customer Live Chat & Auto-Bot (Hidden on Admin Panel) */}
      {activeTab !== 'admin' && <CustomerLiveChat />}

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <StoreApp />
    </StoreProvider>
  );
}
