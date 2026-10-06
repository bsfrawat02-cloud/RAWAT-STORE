import React from 'react';
import { CardProduct } from '../../types';
import { Realistic3DCard } from './Realistic3DCard';
import { ShieldCheck, Zap, Bookmark, Heart, ArrowLeftRight, KeyRound } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { playSound } from '../../utils/audio';
import { RarityBadge } from './RarityBadge';
import { getRarityConfig } from '../../utils/rarity';
import { FlashDealCountdown } from './FlashDealCountdown';
import { StockUrgencyBadge } from './StockUrgencyBadge';

interface CardItemProps {
  card: CardProduct;
}

export const CardItem: React.FC<CardItemProps> = ({ card }) => {
  const {
    setSelectedCard,
    formatPrice,
    ownedCardIds,
    purchaseDemoCard,
    soundEnabled,
    isInWishlist,
    toggleWishlist,
    comparisonCardIds,
    toggleCardForComparison,
    openComparisonWithCards
  } = useStore();
  const isOwned = ownedCardIds.includes(card.id);
  const isBookmarked = isInWishlist(card.id);
  const isCompared = comparisonCardIds.includes(card.id);
  const rarityConfig = getRarityConfig(card.rarity);

  const getTierBadgeStyle = (tier: string) => {
    switch (tier) {
      case 'GOLD':
        return 'text-amber-300 border-amber-500/30 bg-amber-500/10';
      case 'PLATINUM':
        return 'text-slate-200 border-white/30 bg-white/10';
      case 'ELITE':
        return 'text-purple-300 border-purple-500/30 bg-purple-500/10';
      case 'SPECIAL':
        return 'text-cyan-300 border-cyan-500/30 bg-cyan-500/10';
      case 'BLACK':
      default:
        return 'text-slate-400 border-white/10 bg-white/5';
    }
  };

  // Distinct container border and hover glow based on card rarity
  const getRarityCardContainerBorder = (rarity?: string) => {
    switch (rarity) {
      case 'Legendary':
        return 'border-amber-500/40 shadow-[0_0_18px_rgba(251,191,36,0.15)] hover:border-amber-400 hover:shadow-[0_0_35px_rgba(251,191,36,0.4)]';
      case 'Mythic':
        return 'border-rose-500/40 shadow-[0_0_18px_rgba(244,63,94,0.15)] hover:border-rose-400 hover:shadow-[0_0_35px_rgba(244,63,94,0.4)]';
      case 'Epic':
        return 'border-purple-500/30 shadow-[0_0_12px_rgba(192,132,252,0.1)] hover:border-purple-400 hover:shadow-[0_0_28px_rgba(192,132,252,0.35)]';
      case 'Rare':
        return 'border-sky-500/30 hover:border-sky-400 hover:shadow-[0_0_24px_rgba(56,189,248,0.25)]';
      case 'Common':
      default:
        return 'border-slate-500/25 hover:border-slate-400/60 hover:shadow-[0_0_18px_rgba(148,163,184,0.2)]';
    }
  };

  return (
    <div
      className={`group relative flex flex-col items-center rounded-3xl border bg-black/50 p-4 sm:p-5 transition-all duration-300 hover:bg-white/[0.06] backdrop-blur-md shadow-xl ${getRarityCardContainerBorder(
        card.rarity
      )}`}
    >
      {/* Subtle Rarity Background Ambience */}
      <div
        className={`absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-md bg-gradient-to-b ${rarityConfig.cardAuraClass}`}
      />

      {/* Top Meta: Rarity Badge with distinct border, Tier Badge & Wishlist Action */}
      <div className="flex items-center justify-between w-full mb-3 z-10">
        <div className="flex items-center gap-1.5 flex-wrap">
          <RarityBadge
            rarity={card.rarity || 'Rare'}
            size="sm"
            showGlow={false}
          />
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono tracking-wider border font-semibold uppercase ${getTierBadgeStyle(card.tier)}`}>
            {card.tier}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            id={`compare-btn-${card.id}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleCardForComparison(card.id);
            }}
            title={isCompared ? 'Remove from Comparison' : 'Add to Comparison'}
            className={`p-1.5 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center border ${
              isCompared
                ? 'bg-purple-600/30 text-purple-300 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)] scale-105'
                : 'bg-white/5 text-slate-400 border-white/10 hover:text-purple-300 hover:bg-white/15'
            }`}
          >
            <ArrowLeftRight size={13} className={isCompared ? 'text-purple-300' : ''} />
          </button>

          <button
            id={`wishlist-btn-${card.id}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(card.id);
            }}
            title={isBookmarked ? 'Remove from Wishlist' : 'Add to Wishlist'}
            className={`p-1.5 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center border ${
              isBookmarked
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)] scale-105'
                : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/15'
            }`}
          >
            <Heart
              size={13}
              className={`transition-transform duration-200 ${
                isBookmarked ? 'fill-rose-500 text-rose-500 scale-110' : 'hover:scale-110'
              }`}
            />
          </button>
          <div className="flex items-center gap-1.5 pl-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(160,255,200,0.8)]" />
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-semibold">
              {isOwned ? 'COLLECTED' : card.status}
            </span>
          </div>
        </div>
      </div>

      {/* Flash Deal Countdown Tag if active */}
      {card.isFlashDeal && (
        <div className="w-full flex justify-center mb-1.5 z-10 animate-in fade-in">
          <FlashDealCountdown
            endsAt={card.flashEndsAt}
            discountPercent={card.flashDiscountPercent || 40}
            label={card.flashDealLabel || 'FLASH DEAL'}
          />
        </div>
      )}

      {/* 3D Card Artwork Display */}
      <div className="py-2 flex justify-center items-center w-full z-10">
        <Realistic3DCard
          card={card}
          size="md"
          showFlipButton={true}
          interactiveTilt={true}
          isOwned={isOwned}
          onClick={() => {
            playSound('click', soundEnabled);
            setSelectedCard(card);
          }}
        />
      </div>

      {/* Card Info & Bottom Action Row */}
      <div className="flex w-full flex-col mt-4 pt-3 border-t border-white/10 z-10 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white tracking-wide uppercase font-tech truncate">
            {card.name}
          </span>
          <span className="text-[9px] font-mono text-slate-500 shrink-0 ml-2">
            {rarityConfig.tagline}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[10px] font-mono text-slate-400 truncate flex items-center gap-1">
            <KeyRound size={11} className="text-purple-400 shrink-0" />
            <span>{isOwned ? (card.cardNumber || card.maskedIdentifier) : (card.maskedIdentifier || '•••• •••• •••• 4821')}</span>
          </p>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded">
              Limit ₹{(card.limit || (card.price ? Math.round(card.price * 12) : 6500)).toLocaleString('en-IN')}
            </span>
            {card.price && (card.limit || Math.round(card.price * 12)) >= card.price * 10 && (
              <span className="text-[8px] font-mono font-black text-amber-300 bg-amber-950/70 border border-amber-500/40 px-1 py-0.5 rounded shadow-sm shadow-amber-500/10">
                {Math.round((card.limit || Math.round(card.price * 12)) / card.price)}X+
              </span>
            )}
          </div>
        </div>

        {/* Stock Scarcity Urgency Progress */}
        <StockUrgencyBadge stockCount={card.stockCount || 5} />

        {/* Price & Primary Action Buttons */}
        <div className="pt-1 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold font-mono text-white tracking-tight">
                {formatPrice(card.price)}
              </span>
              {card.originalPrice && card.originalPrice > card.price && (
                <span className="text-[11px] font-mono text-slate-500 line-through">
                  {formatPrice(card.originalPrice)}
                </span>
              )}
            </div>
            {card.flashDiscountPercent && (
              <span className="text-[9px] font-mono font-bold text-amber-400">
                Save {card.flashDiscountPercent}% Instantly
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                playSound('click', soundEnabled);
                setSelectedCard(card);
              }}
              className="rounded-full bg-white/5 hover:bg-white/15 px-3 py-1.5 text-[10px] font-mono font-bold border border-white/15 text-slate-200 transition-all cursor-pointer"
            >
              DETAILS
            </button>

            <button
              onClick={() => {
                if (isOwned) {
                  setSelectedCard(card);
                } else {
                  purchaseDemoCard(card);
                }
              }}
              title={isOwned ? 'Inspect collected card' : 'Purchase card with instant delivery'}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                isOwned
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-white text-black border-white hover:bg-slate-200 shadow-md shadow-white/10'
              }`}
            >
              {isOwned ? <ShieldCheck size={14} /> : <Zap size={14} className="fill-current" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

