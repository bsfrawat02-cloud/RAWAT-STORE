import React from 'react';
import { motion } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import { CardItem } from '../cards/CardItem';
import { CardTier } from '../../types';
import { SlidersHorizontal, Sparkles, ArrowLeftRight } from 'lucide-react';
import { playSound } from '../../utils/audio';
import { StoreGridSkeleton } from '../common/Skeletons';

export const CollectionSection: React.FC = () => {
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
    openComparisonWithCards,
    comparisonCardIds,
    isInitialLoading
  } = useStore();

  const filterTiers: ('ALL' | CardTier)[] = ['ALL', 'BLACK', 'GOLD', 'PLATINUM', 'ELITE', 'SPECIAL'];
  const filterNetworks: { id: 'ALL' | 'VISA' | 'MASTERCARD' | 'RAWAT'; label: string }[] = [
    { id: 'ALL', label: 'All' },
    { id: 'VISA', label: 'Visa' },
    { id: 'MASTERCARD', label: 'Mastercard' },
  ];

  // Filter & Sort logic - only show unpurchased available cards in store
  const filteredCards = cards
    .filter((card) => {
      // If card is already purchased / owned or marked SOLD, remove from store catalog
      if (card.status === 'SOLD' || (card.stockCount !== undefined && card.stockCount <= 0) || ownedCardIds.includes(card.id)) {
        return false;
      }
      if (selectedTier !== 'ALL' && card.tier !== selectedTier) return false;
      if (selectedNetwork !== 'ALL' && card.network !== selectedNetwork) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          card.name.toLowerCase().includes(q) ||
          card.tagline.toLowerCase().includes(q) ||
          card.tier.toLowerCase().includes(q) ||
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

  return (
    <section className="flex flex-1 flex-col gap-6">
      {/* Section Header with Immersive Pill Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-white">Exclusive Selection</h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            {filteredCards.length} collectible instruments available • Visa & Mastercard Editions
          </p>
        </div>

        {/* Filter Navigation Bar Pills */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 max-w-full overflow-x-auto pb-1 scrollbar-none">
          {/* Network quick toggle */}
          <div className="flex gap-1 rounded-full border border-purple-500/20 bg-purple-950/30 p-1 backdrop-blur-md shrink-0">
            {filterNetworks.map((net) => {
              const isSelected = selectedNetwork === net.id;
              return (
                <button
                  key={net.id}
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setSelectedNetwork(net.id);
                  }}
                  className={`rounded-full px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-mono font-medium transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-purple-600 text-white font-bold shadow-sm'
                      : 'text-purple-300/70 hover:text-white'
                  }`}
                >
                  {net.label}
                </button>
              );
            })}
          </div>

          {/* Tier Pills */}
          <div className="flex gap-1 sm:gap-1.5 rounded-full border border-white/5 bg-black/40 p-1 backdrop-blur-md overflow-x-auto shrink-0 scrollbar-none">
            {filterTiers.map((tier) => {
              const isSelected = selectedTier === tier;
              return (
                <button
                  key={tier}
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setSelectedTier(tier);
                  }}
                  className={`rounded-full px-2.5 sm:px-3.5 py-1 text-[11px] sm:text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-white/10 text-white shadow-sm font-semibold'
                      : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {tier}
                </button>
              );
            })}
          </div>

          {/* Sort Dropdown & Compare Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => openComparisonWithCards()}
              className="flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-950/40 hover:bg-purple-900/40 px-3 py-1 text-xs font-mono text-purple-300 font-semibold transition-all cursor-pointer shadow-sm shrink-0"
              title="Compare cards side-by-side"
            >
              <ArrowLeftRight size={13} className="text-purple-400" />
              <span>Compare</span>
              {comparisonCardIds.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/30 text-purple-200">
                  {comparisonCardIds.length}
                </span>
              )}
            </button>

            <div className="hidden xl:flex items-center gap-1.5 rounded-full border border-white/5 bg-black/40 px-3 py-1 text-xs font-mono text-slate-400">
              <SlidersHorizontal size={13} className="text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-transparent text-slate-300 text-xs font-mono focus:outline-none cursor-pointer"
              >
                <option value="featured" className="bg-zinc-950 text-white">Featured</option>
                <option value="price-asc" className="bg-zinc-950 text-white">Price: Low to High</option>
                <option value="price-desc" className="bg-zinc-950 text-white">Price: High to Low</option>
                <option value="name" className="bg-zinc-950 text-white">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 4-column Card Grid or Skeleton */}
      {isInitialLoading ? (
        <StoreGridSkeleton count={8} />
      ) : filteredCards.length === 0 ? (
        <div className="py-16 text-center rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
          <p className="font-tech text-lg text-white font-bold">No cards found</p>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Try adjusting your filter or search query.
          </p>
          <button
            onClick={() => {
              setSelectedTier('ALL');
              setSearchQuery('');
            }}
            className="mt-4 px-6 py-2 rounded-full bg-white text-black font-mono text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              className="h-full"
            >
              <CardItem card={card} />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};
