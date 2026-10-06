import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import { CardProduct, CardRarity, CardTier } from '../../types';
import { Realistic3DCard } from '../cards/Realistic3DCard';
import { RarityBadge } from '../cards/RarityBadge';
import { getRarityConfig } from '../../utils/rarity';
import { playSound } from '../../utils/audio';
import {
  X,
  ArrowLeftRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Check,
  Minus,
  Crown,
  Flame,
  ChevronDown,
  Heart,
  Sliders,
  TrendingUp,
  Scan,
  Swords
} from 'lucide-react';

interface CardComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CardComparisonModal: React.FC<CardComparisonModalProps> = ({ isOpen, onClose }) => {
  const {
    cards,
    comparisonCardIds,
    setComparisonSlot,
    formatPrice,
    setSelectedCard,
    purchaseDemoCard,
    ownedCardIds,
    soundEnabled,
    isInWishlist,
    toggleWishlist
  } = useStore();

  // Selected card objects for Slot 1 and Slot 2
  const [card1Id, setCard1Id] = useState<string>('');
  const [card2Id, setCard2Id] = useState<string>('');

  // Dropdown open states for fast card switcher
  const [isPicker1Open, setIsPicker1Open] = useState(false);
  const [isPicker2Open, setIsPicker2Open] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Synchronize with comparisonCardIds from store or pick smart defaults
  useEffect(() => {
    if (isOpen && cards.length >= 2) {
      const firstId = comparisonCardIds[0] || cards[0]?.id || '';
      let secondId = comparisonCardIds[1] || '';
      
      if (!secondId || secondId === firstId) {
        const alternate = cards.find((c) => c.id !== firstId);
        secondId = alternate ? alternate.id : cards[1]?.id || '';
      }

      setCard1Id(firstId);
      setCard2Id(secondId);
      playSound('whoosh', soundEnabled);
    }
  }, [isOpen, comparisonCardIds, cards]);

  if (!isOpen) return null;

  const card1 = cards.find((c) => c.id === card1Id) || cards[0];
  const card2 = cards.find((c) => c.id === card2Id) || cards[1] || cards[0];

  if (!card1 || !card2) return null;

  const rarity1 = getRarityConfig(card1.rarity);
  const rarity2 = getRarityConfig(card2.rarity);

  const isOwned1 = ownedCardIds.includes(card1.id);
  const isOwned2 = ownedCardIds.includes(card2.id);

  const isWishlisted1 = isInWishlist(card1.id);
  const isWishlisted2 = isInWishlist(card2.id);

  // Rarity numerical power index calculation
  const getRarityScore = (r?: CardRarity) => {
    switch (r) {
      case 'Legendary': return 99;
      case 'Mythic': return 92;
      case 'Epic': return 82;
      case 'Rare': return 68;
      case 'Common': default: return 45;
    }
  };

  const getTierScore = (tier: CardTier) => {
    switch (tier) {
      case 'SPECIAL': return 100;
      case 'BLACK': return 95;
      case 'ELITE': return 88;
      case 'PLATINUM': return 80;
      case 'GOLD': return 75;
      default: return 60;
    }
  };

  const score1 = Math.round((getRarityScore(card1.rarity) * 0.6) + (getTierScore(card1.tier) * 0.4));
  const score2 = Math.round((getRarityScore(card2.rarity) * 0.6) + (getTierScore(card2.tier) * 0.4));

  // Trigger Laser Scan
  const handleTriggerLaserScan = () => {
    setIsScanning(true);
    playSound('laser', soundEnabled);
    setTimeout(() => {
      setIsScanning(false);
    }, 1200);
  };

  // Swap Left and Right Cards
  const handleSwap = () => {
    playSound('whoosh', soundEnabled);
    const temp = card1Id;
    setCard1Id(card2Id);
    setCard2Id(temp);
    setComparisonSlot(0, card2Id);
    setComparisonSlot(1, temp);
  };

  const allPerks = Array.from(new Set([...(card1.perks || []), ...(card2.perks || [])]));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
        {/* Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-xl z-40 cursor-pointer"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-5xl rounded-3xl border border-white/15 bg-[#090a0f]/95 shadow-[0_0_80px_rgba(0,0,0,0.9)] backdrop-blur-2xl z-50 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Ambient Holographic Header Glow */}
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-purple-600/15 via-sky-600/10 to-transparent pointer-events-none" />

          {/* Modal Header Bar */}
          <div className="flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5 border-b border-white/10 relative z-20 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-500/20 to-sky-500/20 border border-white/15 shadow-inner">
                <Swords className="w-5 h-5 text-purple-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
                  <span className="font-mono text-[10px] text-purple-400 uppercase tracking-widest font-bold">
                    3D Holographic Comparison Arena
                  </span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white font-tech">
                  Instrument Duel & Spec Matrix
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleTriggerLaserScan}
                title="Scan Cards with Laser"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-mono text-xs font-semibold transition-all cursor-pointer"
              >
                <Scan className="w-3.5 h-3.5" />
                <span>Laser Scan</span>
              </button>

              <button
                onClick={handleSwap}
                title="Swap Cards"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white font-mono text-xs font-semibold transition-all cursor-pointer"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Swap Slots</span>
              </button>

              <button
                onClick={() => {
                  playSound('click', soundEnabled);
                  onClose();
                }}
                className="p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 scrollbar-thin">
            
            {/* 3D Holographic Visualizer Comparison Stage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 relative">
              
              {/* Central Glowing "VS" Indicator */}
              <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex-col items-center gap-2 pointer-events-none">
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  className="w-12 h-12 rounded-full bg-black/90 border border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.6)] flex items-center justify-center backdrop-blur-xl"
                >
                  <span className="font-tech font-black text-sm tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-sky-200 to-rose-300">
                    VS
                  </span>
                </motion.div>
              </div>

              {/* CARD 1 STAGE (LEFT) */}
              <motion.div
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className={`relative flex flex-col items-center rounded-3xl border p-4 sm:p-6 bg-gradient-to-b from-black/60 to-black/30 backdrop-blur-md shadow-2xl transition-all ${rarity1.cardBorderGlow}`}
              >
                {/* Specular Ambient Glow */}
                <div className={`absolute -inset-px rounded-3xl opacity-30 pointer-events-none blur-xl bg-gradient-to-b ${rarity1.cardAuraClass}`} />

                {/* Laser Scan Beam Overlay */}
                {isScanning && (
                  <motion.div
                    initial={{ top: '0%' }}
                    animate={{ top: '100%' }}
                    transition={{ duration: 1.1, ease: 'linear' }}
                    className="absolute inset-x-0 h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] z-40 pointer-events-none"
                  />
                )}

                {/* Card 1 Picker / Selector Header */}
                <div className="w-full relative z-20 mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold">
                      Slot 01 (Primary)
                    </span>
                    <button
                      onClick={() => toggleWishlist(card1.id)}
                      className="p-1 rounded-full text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isWishlisted1 ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  </div>

                  {/* Dropdown Selector Button */}
                  <div className="relative">
                    <button
                      onClick={() => setIsPicker1Open(!isPicker1Open)}
                      className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/25 text-left text-xs font-mono text-white transition-all cursor-pointer"
                    >
                      <span className="truncate font-semibold">{card1.name}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                    </button>

                    {/* Popover Card Picker */}
                    {isPicker1Open && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 max-h-56 overflow-y-auto rounded-xl bg-zinc-950/95 border border-white/20 shadow-2xl z-50 p-1.5 space-y-1 backdrop-blur-xl">
                        {cards.map((c) => (
                          <button
                            key={`picker1-${c.id}`}
                            onClick={() => {
                              playSound('click', soundEnabled);
                              setCard1Id(c.id);
                              setComparisonSlot(0, c.id);
                              setIsPicker1Open(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono text-left transition-colors cursor-pointer ${
                              c.id === card1.id ? 'bg-purple-600/30 text-purple-200 font-bold' : 'hover:bg-white/10 text-slate-300'
                            }`}
                          >
                            <span className="truncate">{c.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 ml-2 shrink-0">
                              {c.rarity}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3D Holographic Card Live Display */}
                <div className="py-2 flex justify-center items-center w-full z-10 scale-95 sm:scale-100 transition-transform">
                  <Realistic3DCard
                    card={card1}
                    size="md"
                    showFlipButton={true}
                    interactiveTilt={true}
                    isOwned={isOwned1}
                    activeScanAnimation={isScanning}
                    onClick={() => {
                      playSound('click', soundEnabled);
                      setSelectedCard(card1);
                    }}
                  />
                </div>

                {/* Holographic Rarity Tag & Power Gauge */}
                <div className="w-full mt-4 pt-3 border-t border-white/10 z-10 space-y-2">
                  <div className="flex items-center justify-between">
                    <RarityBadge rarity={card1.rarity || 'Rare'} size="sm" showGlow={true} />
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                        Power Index
                      </span>
                      <span className="text-sm font-bold font-mono text-white tracking-tight">
                        {score1}<span className="text-[10px] text-slate-500">/100</span>
                      </span>
                    </div>
                  </div>

                  {/* Animated Score Bar */}
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${score1}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${score1 >= score2 ? 'bg-gradient-to-r from-purple-500 to-emerald-400' : 'bg-purple-600'}`}
                    />
                  </div>
                </div>
              </motion.div>

              {/* CARD 2 STAGE (RIGHT) */}
              <motion.div
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className={`relative flex flex-col items-center rounded-3xl border p-4 sm:p-6 bg-gradient-to-b from-black/60 to-black/30 backdrop-blur-md shadow-2xl transition-all ${rarity2.cardBorderGlow}`}
              >
                {/* Specular Ambient Glow */}
                <div className={`absolute -inset-px rounded-3xl opacity-30 pointer-events-none blur-xl bg-gradient-to-b ${rarity2.cardAuraClass}`} />

                {/* Laser Scan Beam Overlay */}
                {isScanning && (
                  <motion.div
                    initial={{ top: '0%' }}
                    animate={{ top: '100%' }}
                    transition={{ duration: 1.1, ease: 'linear' }}
                    className="absolute inset-x-0 h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] z-40 pointer-events-none"
                  />
                )}

                {/* Card 2 Picker / Selector Header */}
                <div className="w-full relative z-20 mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-sky-400 uppercase tracking-widest font-bold">
                      Slot 02 (Secondary)
                    </span>
                    <button
                      onClick={() => toggleWishlist(card2.id)}
                      className="p-1 rounded-full text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isWishlisted2 ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  </div>

                  {/* Dropdown Selector Button */}
                  <div className="relative">
                    <button
                      onClick={() => setIsPicker2Open(!isPicker2Open)}
                      className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/25 text-left text-xs font-mono text-white transition-all cursor-pointer"
                    >
                      <span className="truncate font-semibold">{card2.name}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                    </button>

                    {/* Popover Card Picker */}
                    {isPicker2Open && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 max-h-56 overflow-y-auto rounded-xl bg-zinc-950/95 border border-white/20 shadow-2xl z-50 p-1.5 space-y-1 backdrop-blur-xl">
                        {cards.map((c) => (
                          <button
                            key={`picker2-${c.id}`}
                            onClick={() => {
                              playSound('click', soundEnabled);
                              setCard2Id(c.id);
                              setComparisonSlot(1, c.id);
                              setIsPicker2Open(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono text-left transition-colors cursor-pointer ${
                              c.id === card2.id ? 'bg-sky-600/30 text-sky-200 font-bold' : 'hover:bg-white/10 text-slate-300'
                            }`}
                          >
                            <span className="truncate">{c.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 ml-2 shrink-0">
                              {c.rarity}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3D Holographic Card Live Display */}
                <div className="py-2 flex justify-center items-center w-full z-10 scale-95 sm:scale-100 transition-transform">
                  <Realistic3DCard
                    card={card2}
                    size="md"
                    showFlipButton={true}
                    interactiveTilt={true}
                    isOwned={isOwned2}
                    activeScanAnimation={isScanning}
                    onClick={() => {
                      playSound('click', soundEnabled);
                      setSelectedCard(card2);
                    }}
                  />
                </div>

                {/* Holographic Rarity Tag & Power Gauge */}
                <div className="w-full mt-4 pt-3 border-t border-white/10 z-10 space-y-2">
                  <div className="flex items-center justify-between">
                    <RarityBadge rarity={card2.rarity || 'Rare'} size="sm" showGlow={true} />
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                        Power Index
                      </span>
                      <span className="text-sm font-bold font-mono text-white tracking-tight">
                        {score2}<span className="text-[10px] text-slate-500">/100</span>
                      </span>
                    </div>
                  </div>

                  {/* Animated Score Bar */}
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${score2}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${score2 >= score1 ? 'bg-gradient-to-r from-sky-500 to-emerald-400' : 'bg-sky-600'}`}
                    />
                  </div>
                </div>
              </motion.div>

            </div>

            {/* STATS COMPARISON MATRIX TABLE */}
            <div className="rounded-3xl border border-white/10 bg-black/40 p-5 sm:p-6 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <h3 className="font-tech text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                    Core Specifications Matrix
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  Direct Field Evaluation
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                
                {/* Rarity Tier Row */}
                <div className="grid grid-cols-12 gap-2 sm:gap-4 items-center p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="col-span-5 text-left truncate">
                    <span className="font-bold text-white">{card1.rarity || 'Rare'}</span>
                    <span className="block text-[10px] text-slate-400 truncate">{rarity1.dropRate}</span>
                  </div>
                  <div className="col-span-2 text-center text-[10px] uppercase font-bold text-purple-400">
                    Rarity
                  </div>
                  <div className="col-span-5 text-right truncate">
                    <span className="font-bold text-white">{card2.rarity || 'Rare'}</span>
                    <span className="block text-[10px] text-slate-400 truncate">{rarity2.dropRate}</span>
                  </div>
                </div>

                {/* Spending / Credit Limit Row */}
                <div className="grid grid-cols-12 gap-2 sm:gap-4 items-center p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="col-span-5 text-left">
                    <span className="font-bold text-emerald-400 text-sm">
                      ₹{(card1.limit || (card1.price ? Math.round(card1.price * 12) : 6500)).toLocaleString('en-IN')}
                    </span>
                    {(card1.limit || (card1.price ? Math.round(card1.price * 12) : 6500)) > (card2.limit || (card2.price ? Math.round(card2.price * 12) : 6500)) && (
                      <span className="inline-block text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 ml-1.5 font-bold">
                        +₹{((card1.limit || (card1.price ? Math.round(card1.price * 12) : 6500)) - (card2.limit || (card2.price ? Math.round(card2.price * 12) : 6500))).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <div className="col-span-2 text-center text-[10px] uppercase font-bold text-purple-400">
                    Credit Limit
                  </div>
                  <div className="col-span-5 text-right">
                    {(card2.limit || (card2.price ? Math.round(card2.price * 12) : 6500)) > (card1.limit || (card1.price ? Math.round(card1.price * 12) : 6500)) && (
                      <span className="inline-block text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 mr-1.5 font-bold">
                        +₹{((card2.limit || (card2.price ? Math.round(card2.price * 12) : 6500)) - (card1.limit || (card1.price ? Math.round(card1.price * 12) : 6500))).toLocaleString('en-IN')}
                      </span>
                    )}
                    <span className="font-bold text-emerald-400 text-sm">
                      ₹{(card2.limit || (card2.price ? Math.round(card2.price * 12) : 6500)).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Price Row */}
                <div className="grid grid-cols-12 gap-2 sm:gap-4 items-center p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="col-span-5 text-left">
                    <span className="font-bold text-white text-sm">{formatPrice(card1.price)}</span>
                    {card1.price < card2.price && (
                      <span className="inline-block text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 ml-1.5 font-bold">
                        Best Value
                      </span>
                    )}
                  </div>
                  <div className="col-span-2 text-center text-[10px] uppercase font-bold text-purple-400">
                    Price
                  </div>
                  <div className="col-span-5 text-right">
                    {card2.price < card1.price && (
                      <span className="inline-block text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 mr-1.5 font-bold">
                        Best Value
                      </span>
                    )}
                    <span className="font-bold text-white text-sm">{formatPrice(card2.price)}</span>
                  </div>
                </div>

                {/* Material Finish Row */}
                <div className="grid grid-cols-12 gap-2 sm:gap-4 items-center p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="col-span-5 text-left font-semibold text-slate-200 capitalize truncate">
                    {card1.finish.replace('_', ' ')}
                  </div>
                  <div className="col-span-2 text-center text-[10px] uppercase font-bold text-purple-400">
                    Finish
                  </div>
                  <div className="col-span-5 text-right font-semibold text-slate-200 capitalize truncate">
                    {card2.finish.replace('_', ' ')}
                  </div>
                </div>

                {/* Payment Network Architecture Row */}
                <div className="grid grid-cols-12 gap-2 sm:gap-4 items-center p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="col-span-5 text-left font-semibold text-slate-200 truncate">
                    {card1.network || 'RAWAT SIGNATURE'}
                  </div>
                  <div className="col-span-2 text-center text-[10px] uppercase font-bold text-purple-400">
                    Network
                  </div>
                  <div className="col-span-5 text-right font-semibold text-slate-200 truncate">
                    {card2.network || 'RAWAT SIGNATURE'}
                  </div>
                </div>
              </div>
            </div>

            {/* SIDE-BY-SIDE PERKS & PRIVILEGES CHECKLIST */}
            <div className="rounded-3xl border border-white/10 bg-black/40 p-5 sm:p-6 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <h3 className="font-tech text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                    Privileges & Capabilities Checklist
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {allPerks.length} Distinct Capabilities
                </span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                {allPerks.map((perk, idx) => {
                  const has1 = card1.perks?.includes(perk);
                  const has2 = card2.perks?.includes(perk);

                  return (
                    <div
                      key={`perk-${idx}`}
                      className="grid grid-cols-12 gap-2 sm:gap-4 items-center p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-colors"
                    >
                      <div className="col-span-2 sm:col-span-1 text-center">
                        {has1 ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-white/5 text-slate-600 flex items-center justify-center mx-auto">
                            <Minus className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      <div className="col-span-8 sm:col-span-10 text-center sm:text-left text-slate-300 font-medium px-2 truncate">
                        {perk}
                      </div>

                      <div className="col-span-2 sm:col-span-1 text-center">
                        {has2 ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-white/5 text-slate-600 flex items-center justify-center mx-auto">
                            <Minus className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BOTTOM ACTION BUTTONS BAR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Card 1 Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setSelectedCard(card1);
                  }}
                  className="flex-1 py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-200 font-mono text-xs font-bold transition-all cursor-pointer text-center"
                >
                  INSPECT {card1.tier}
                </button>
                <button
                  onClick={() => {
                    if (isOwned1) {
                      setSelectedCard(card1);
                    } else {
                      purchaseDemoCard(card1);
                    }
                  }}
                  className={`flex-1 py-3 px-4 rounded-2xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg ${
                    isOwned1
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-white text-black hover:bg-slate-200'
                  }`}
                >
                  {isOwned1 ? <ShieldCheck className="w-4 h-4" /> : <Zap className="w-4 h-4 fill-current" />}
                  <span>{isOwned1 ? 'OWNED' : `GET FOR ${formatPrice(card1.price)}`}</span>
                </button>
              </div>

              {/* Card 2 Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setSelectedCard(card2);
                  }}
                  className="flex-1 py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-200 font-mono text-xs font-bold transition-all cursor-pointer text-center"
                >
                  INSPECT {card2.tier}
                </button>
                <button
                  onClick={() => {
                    if (isOwned2) {
                      setSelectedCard(card2);
                    } else {
                      purchaseDemoCard(card2);
                    }
                  }}
                  className={`flex-1 py-3 px-4 rounded-2xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg ${
                    isOwned2
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-white text-black hover:bg-slate-200'
                  }`}
                >
                  {isOwned2 ? <ShieldCheck className="w-4 h-4" /> : <Zap className="w-4 h-4 fill-current" />}
                  <span>{isOwned2 ? 'OWNED' : `GET FOR ${formatPrice(card2.price)}`}</span>
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
