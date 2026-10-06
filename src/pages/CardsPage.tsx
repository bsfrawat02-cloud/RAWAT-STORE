import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { CardItem } from '../components/cards/CardItem';
import { CardsGridSkeleton } from '../components/cards/CardSkeleton';
import { CardTier, CardRarity } from '../types';
import {
  Search,
  Sparkles,
  X,
  RefreshCw,
  Flame,
  Crown,
  Gem,
  Zap,
  Layers,
  Heart,
  Bookmark,
  Trash2,
  ArrowRight,
  ArrowLeftRight
} from 'lucide-react';
import { playSound } from '../utils/audio';
import { RarityBadge } from '../components/cards/RarityBadge';

export const CardsPage: React.FC = () => {
  const {
    cards,
    ownedCardIds,
    selectedTier,
    setSelectedTier,
    selectedNetwork,
    setSelectedNetwork,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    soundEnabled,
    wishlistCardIds,
    wishlistCards,
    clearWishlist,
    comparisonCardIds,
    openComparisonWithCards,
    clearComparison,
    setActiveTab
  } = useStore();

  const [viewMode, setViewMode] = useState<'all' | 'wishlist'>('all');
  const [selectedFinish, setSelectedFinish] = useState<string>('ALL');
  const [selectedRarity, setSelectedRarity] = useState<'ALL' | CardRarity>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initial load simulation / skeleton display
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const rarities: ('ALL' | CardRarity)[] = ['ALL', 'Common', 'Rare', 'Epic', 'Mythic', 'Legendary'];
  const tiers: ('ALL' | CardTier)[] = ['ALL', 'BLACK', 'GOLD', 'PLATINUM', 'ELITE', 'SPECIAL'];
  const networks: { id: 'ALL' | 'VISA' | 'MASTERCARD' | 'RAWAT'; label: string; icon?: string }[] = [
    { id: 'ALL', label: 'All Networks' },
    { id: 'VISA', label: 'Visa' },
    { id: 'MASTERCARD', label: 'Mastercard' },
    { id: 'RAWAT', label: 'Signature Exclusive' },
  ];
  const finishes: { id: string; label: string }[] = [
    { id: 'ALL', label: 'All Materials' },
    { id: 'obsidian', label: 'Obsidian Noir' },
    { id: 'gold', label: '24K Gold' },
    { id: 'platinum', label: 'Liquid Platinum' },
    { id: 'amethyst', label: 'Amethyst Royale' },
    { id: 'emerald', label: 'Cyber Emerald' },
    { id: 'carbon', label: 'Carbon Stealth' },
    { id: 'rose_gold', label: 'Rose Aurora' },
  ];

  // Base list depending on view mode
  const baseCards = viewMode === 'wishlist' ? wishlistCards : cards;

  // Filtering - only show available unpurchased cards in the store
  const filteredCards = baseCards
    .filter((card) => {
      // If card is already purchased / owned or marked SOLD, remove from store purchase catalog
      if (card.status === 'SOLD' || (card.stockCount !== undefined && card.stockCount <= 0) || ownedCardIds.includes(card.id)) {
        return false;
      }
      if (selectedRarity !== 'ALL' && (card.rarity || 'Rare') !== selectedRarity) return false;
      if (selectedTier !== 'ALL' && card.tier !== selectedTier) return false;
      if (selectedNetwork !== 'ALL' && card.network !== selectedNetwork) return false;
      if (selectedFinish !== 'ALL' && card.finish !== selectedFinish) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          card.name.toLowerCase().includes(q) ||
          card.tagline.toLowerCase().includes(q) ||
          card.tier.toLowerCase().includes(q) ||
          (card.rarity && card.rarity.toLowerCase().includes(q)) ||
          (card.network && card.network.toLowerCase().includes(q)) ||
          card.finish.toLowerCase().includes(q) ||
          card.maskedIdentifier.includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const resetAllFilters = () => {
    setIsLoading(true);
    setSelectedRarity('ALL');
    setSelectedTier('ALL');
    setSelectedNetwork('ALL');
    setSelectedFinish('ALL');
    setSearchQuery('');
    setSortBy('featured');
    playSound('click', soundEnabled);
    setTimeout(() => setIsLoading(false), 300);
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full min-w-0">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/5 w-full min-w-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="font-mono text-xs text-purple-400 uppercase tracking-widest font-semibold">
              {viewMode === 'wishlist' ? 'BOOKMARKED FAVORITES' : 'COMPLETE DIGITAL CATALOG'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tighter text-white mt-1 font-tech">
            {viewMode === 'wishlist' ? 'Your Saved Wishlist' : 'Explore Collectible Cards'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            {viewMode === 'wishlist'
              ? 'View and manage all your bookmarked cards. Saved in your cloud profile and synced across devices in real-time.'
              : 'Browse our fictional gallery of premium digital cards, inspect material shaders, explore rarity tiers, and test interactive 3D physics.'}
          </p>
        </div>

        {/* View Switcher & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto min-w-0">
          {/* Main Segmented Toggle: All Cards vs Wishlist */}
          <div className="flex items-center p-1 rounded-2xl sm:rounded-full bg-black/60 border border-white/10 backdrop-blur-md overflow-x-auto scrollbar-none w-full sm:w-auto max-w-full shrink-0">
            <button
              id="tab-all-cards"
              onClick={() => {
                playSound('click', soundEnabled);
                setViewMode('all');
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-full text-[11px] sm:text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                viewMode === 'all'
                  ? 'bg-white text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Cards</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${viewMode === 'all' ? 'bg-black/10 text-black' : 'bg-white/10 text-slate-300'}`}>
                {cards.length}
              </span>
            </button>

            <button
              id="tab-wishlist-cards"
              onClick={() => {
                playSound('click', soundEnabled);
                setViewMode('wishlist');
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-full text-[11px] sm:text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                viewMode === 'wishlist'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${wishlistCardIds.length > 0 ? 'fill-rose-400 text-rose-400' : ''}`} />
              <span>Wishlist</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${viewMode === 'wishlist' ? 'bg-white/20 text-white' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                {wishlistCardIds.length}
              </span>
            </button>

            <button
              id="btn-open-comparison"
              onClick={() => openComparisonWithCards()}
              className="flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-full text-[11px] sm:text-xs font-mono font-bold transition-all cursor-pointer border border-purple-500/30 bg-purple-600/10 hover:bg-purple-600/25 text-purple-300 shadow-sm whitespace-nowrap shrink-0"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-purple-400" />
              <span>Compare</span>
              {comparisonCardIds.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/40">
                  {comparisonCardIds.length}
                </span>
              )}
            </button>
          </div>

          {/* Search Bar Input */}
          <div className="relative w-full sm:w-64 md:w-72 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cards..."
              className="w-full rounded-full border border-white/10 bg-white/5 pl-10 pr-9 py-2.5 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-white/25 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-3.5 sm:p-5 backdrop-blur-md space-y-4 w-full min-w-0">
        {/* Rarity Selector */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 font-semibold">
            Rarity Level:
          </label>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {rarities.map((r) => {
              const isSelected = selectedRarity === r;
              return (
                <button
                  key={r}
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setSelectedRarity(r);
                  }}
                  className={`rounded-full px-3 sm:px-3.5 py-1.5 text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? r === 'Legendary'
                        ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/30 border border-amber-400'
                        : r === 'Mythic'
                        ? 'bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/30 border border-rose-400'
                        : r === 'Epic'
                        ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/30 border border-purple-400'
                        : r === 'Rare'
                        ? 'bg-sky-500 text-black font-bold shadow-lg shadow-sky-500/30 border border-sky-400'
                        : r === 'Common'
                        ? 'bg-slate-300 text-slate-950 font-bold shadow-lg shadow-slate-500/20 border border-slate-200'
                        : 'bg-white text-black font-bold shadow-md'
                      : 'border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {r === 'Legendary' && <Crown className="w-3.5 h-3.5 text-amber-900" />}
                  {r === 'Mythic' && <Zap className="w-3.5 h-3.5 text-rose-200" />}
                  {r === 'Epic' && <Flame className="w-3.5 h-3.5 text-purple-200" />}
                  {r === 'Rare' && <Gem className="w-3.5 h-3.5 text-sky-900" />}
                  {r === 'Common' && <Layers className="w-3.5 h-3.5 text-slate-900" />}
                  <span>{r === 'ALL' ? 'All Rarities' : r}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Network Selector Pills */}
        <div className="pt-3 border-t border-white/5">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 font-semibold">
            Payment Network / Architecture:
          </label>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {networks.map((net) => {
              const isSelected = selectedNetwork === net.id;
              return (
                <button
                  key={net.id}
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setSelectedNetwork(net.id);
                  }}
                  className={`rounded-full px-3.5 sm:px-4 py-1.5 text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/30 border border-purple-400/50'
                      : 'border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {net.id === 'VISA' && <span className="font-sans font-black italic tracking-tighter text-sky-400">VISA</span>}
                  {net.id === 'MASTERCARD' && (
                    <span className="inline-flex items-center -space-x-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 opacity-90" />
                    </span>
                  )}
                  {net.id === 'RAWAT' && <Sparkles className="w-3 h-3 text-purple-300" />}
                  <span>{net.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tier Pills */}
        <div className="pt-3 border-t border-white/5">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 font-semibold">
            Card Edition Tier:
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            {tiers.map((t) => (
              <button
                key={t}
                onClick={() => {
                  playSound('click', soundEnabled);
                  setSelectedTier(t);
                }}
                className={`rounded-full px-3.5 sm:px-4 py-1.5 text-xs font-mono font-medium transition-all cursor-pointer ${
                  selectedTier === t
                    ? 'bg-white text-black font-bold shadow-md'
                    : 'border border-white/10 bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Material Finish & Sort Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-3 border-t border-white/5">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
              Material Finish:
            </label>
            <select
              value={selectedFinish}
              onChange={(e) => {
                playSound('click', soundEnabled);
                setSelectedFinish(e.target.value);
              }}
              className="w-full bg-black/50 border border-white/10 text-slate-200 text-xs font-mono rounded-xl px-3 py-2 focus:outline-none focus:border-white/25 cursor-pointer"
            >
              {finishes.map((f) => (
                <option key={f.id} value={f.id} className="bg-zinc-950 text-white">
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
              Sort By:
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                playSound('click', soundEnabled);
                setSortBy(e.target.value as typeof sortBy);
              }}
              className="w-full bg-black/50 border border-white/10 text-slate-200 text-xs font-mono rounded-xl px-3 py-2 focus:outline-none focus:border-white/25 cursor-pointer"
            >
              <option value="featured" className="bg-zinc-950 text-white">Featured First</option>
              <option value="price-asc" className="bg-zinc-950 text-white">Price: Low to High</option>
              <option value="price-desc" className="bg-zinc-950 text-white">Price: High to Low</option>
              <option value="name" className="bg-zinc-950 text-white">Name (A-Z)</option>
            </select>
          </div>

          <div className="flex items-end justify-between sm:justify-end gap-2">
            <button
              onClick={resetAllFilters}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Results */}
      <div className="w-full min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <p className="text-xs font-mono text-slate-400">
              Showing <span className="text-white font-bold">{filteredCards.length}</span> {viewMode === 'wishlist' ? 'wishlisted' : ''} cards
            </p>
            {viewMode === 'wishlist' && wishlistCardIds.length > 0 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Synced to Cloud
              </span>
            )}
          </div>

          {viewMode === 'wishlist' && wishlistCardIds.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear your wishlist?')) {
                  clearWishlist();
                }
              }}
              className="flex items-center gap-1 text-xs font-mono text-rose-400/80 hover:text-rose-300 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Wishlist</span>
            </button>
          )}
        </div>

        {isLoading ? (
          <motion.div
            key="cards-skeleton-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardsGridSkeleton count={8} />
          </motion.div>
        ) : filteredCards.length === 0 ? (
          viewMode === 'wishlist' ? (
            <div className="py-20 text-center rounded-3xl border border-white/10 bg-gradient-to-b from-rose-950/20 to-black/40 p-8 space-y-4 backdrop-blur-md max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
                <Heart className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="font-tech text-xl text-white font-bold">Your Wishlist is Empty</h3>
                <p className="text-xs font-mono text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                  Bookmark your favorite 3D cards by clicking the heart icon on any card card item or modal to save them here for later inspection or checkout.
                </p>
              </div>
              <button
                onClick={() => {
                  playSound('click', soundEnabled);
                  setViewMode('all');
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black font-mono text-xs font-bold transition-all cursor-pointer hover:bg-slate-200 shadow-xl"
              >
                <span>Browse All Cards</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="py-20 text-center rounded-3xl border border-white/10 bg-white/5 p-8 space-y-3 backdrop-blur-md">
              <p className="font-tech text-lg text-white font-bold">No cards match the selected criteria.</p>
              <p className="text-xs font-mono text-slate-500">Try broadening your search or resetting filters.</p>
              <button
                onClick={resetAllFilters}
                className="px-6 py-2.5 rounded-full bg-white text-black font-mono text-xs font-bold transition-all cursor-pointer hover:bg-slate-200"
              >
                Reset All Filters
              </button>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full min-w-0">
            {filteredCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 22, scale: 0.985 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-40px 0px -20px 0px' }}
                transition={{
                  duration: 0.45,
                  delay: Math.min((index % 4) * 0.07, 0.28),
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="h-full w-full min-w-0"
              >
                <CardItem card={card} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Comparison Tray Dock */}
      <AnimatePresence>
        {comparisonCardIds.length > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 sm:gap-3 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full bg-zinc-950/90 border border-purple-500/40 shadow-[0_10px_35px_rgba(0,0,0,0.85)] backdrop-blur-xl text-xs font-mono max-w-[calc(100vw-24px)]"
          >
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-white font-bold text-[11px] sm:text-xs">{comparisonCardIds.length}/2 Staged</span>
            </div>
            <div className="h-4 w-px bg-white/20" />
            <button
              onClick={() => openComparisonWithCards()}
              className="px-3 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-purple-900/30 whitespace-nowrap"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Launch Comparison</span>
            </button>
            <button
              onClick={clearComparison}
              className="p-1 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Clear staging"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
