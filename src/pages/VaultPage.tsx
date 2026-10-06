import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Realistic3DCard } from '../components/cards/Realistic3DCard';
import { CardNetworkLogo } from '../components/cards/CardNetworkLogo';
import { RarityBadge } from '../components/cards/RarityBadge';
import {
  Sparkles,
  Shield,
  Layers,
  ArrowRight,
  Plus,
  Eye,
  Calendar,
  Hash,
  Download,
  Receipt,
  Copy,
  Check,
  EyeOff,
  CreditCard,
  Lock
} from 'lucide-react';
import { playSound } from '../utils/audio';
import { downloadDigitalCard, downloadReceiptHtml, copyToClipboard } from '../utils/cardExport';
import { DigitalUnboxingModal } from '../components/vault/DigitalUnboxingModal';
import { DigitalSecretKeyModal } from '../components/vault/DigitalSecretKeyModal';
import { VaultPageSkeleton } from '../components/common/Skeletons';

export const VaultPage: React.FC = () => {
  const {
    cards,
    ownedCardIds,
    orders,
    setSelectedCard,
    setActiveTab,
    currentUser,
    soundEnabled,
    setIsAuthModalOpen,
    setAuthModalMode,
    isInitialLoading,
  } = useStore();

  const [selectedVaultIndex, setSelectedVaultIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'stage' | 'grid'>('stage');
  const [revealSecrets, setRevealSecrets] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isUnboxingModalOpen, setIsUnboxingModalOpen] = useState(false);
  const [isSecretKeyModalOpen, setIsSecretKeyModalOpen] = useState(false);
  const [isPedestalMode, setIsPedestalMode] = useState(true);
  const [pedestalLighting, setPedestalLighting] = useState<'gold' | 'cyan' | 'ruby'>('gold');

  if (isInitialLoading) {
    return <VaultPageSkeleton />;
  }

  const ownedCards = currentUser ? cards.filter((c) => ownedCardIds.includes(c.id)) : [];

  const activeCard = ownedCards.length > 0 ? (ownedCards[selectedVaultIndex] || ownedCards[0]) : null;

  // Helper to find associated order for a card
  const getCardOrder = (cardId: string) => {
    return orders.find((o) => o.cardId === cardId);
  };

  const handleCopy = (text: string, key: string) => {
    copyToClipboard(text);
    playSound('click', soundEnabled);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const activeOrder = activeCard ? getCardOrder(activeCard.id) : undefined;

  return (
    <div className="space-y-6 sm:space-y-8 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/5 w-full min-w-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="font-mono text-xs text-purple-400 uppercase tracking-widest font-semibold">
              MY DIGITAL COLLECTION
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tighter text-white mt-1">
            Purchased Collection
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Inspect your permanently owned fictional cards in real-time 3D, check masked card identifiers, and review vault certificate ledgers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 self-start md:self-auto min-w-0">
          {ownedCards.length > 0 && (
            <div className="flex items-center p-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
              <button
                onClick={() => {
                  playSound('click', soundEnabled);
                  setViewMode('stage');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                  viewMode === 'stage'
                    ? 'bg-white text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>3D Stage</span>
              </button>
              <button
                onClick={() => {
                  playSound('click', soundEnabled);
                  setViewMode('grid');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Grid View</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                  {ownedCards.length}
                </span>
              </button>
            </div>
          )}

          <button
            onClick={() => {
              playSound('click', soundEnabled);
              setActiveTab('cards');
            }}
            className="rounded-full bg-white px-5 py-2 sm:py-2.5 text-xs font-mono font-bold text-black hover:bg-slate-200 transition-all flex items-center gap-2 shadow-lg cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>BROWSE STORE</span>
          </button>
        </div>
      </div>

      {!currentUser ? (
        <div className="py-20 text-center rounded-3xl border border-white/10 bg-white/5 p-8 space-y-5 backdrop-blur-md max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto shadow-[0_0_20px_rgba(168,85,247,0.15)]">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-tech font-bold text-2xl text-white">Private Vault Locked</h3>
            <p className="text-xs sm:text-sm font-mono text-slate-400 max-w-md mx-auto">
              Please sign up or log in to access your private collection vault. Only cards you officially purchase will be safely stored and unlocked here.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                playSound('click', soundEnabled);
                setAuthModalMode('login');
                setIsAuthModalOpen(true);
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              SIGN IN / REGISTER
            </button>
            <button
              onClick={() => {
                playSound('click', soundEnabled);
                setActiveTab('cards');
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold border border-white/15 transition-all cursor-pointer"
            >
              BROWSE STORE
            </button>
          </div>
        </div>
      ) : ownedCards.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-white/10 bg-white/5 p-8 space-y-4 backdrop-blur-md max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-400 mx-auto">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="font-tech font-bold text-xl text-white">Your Collection is Empty</h3>
          <p className="text-xs font-mono text-slate-400 max-w-md mx-auto">
            You don't own any digital cards in your collection yet. Browse the store and purchase your first luxury card!
          </p>
          <button
            onClick={() => {
              playSound('click', soundEnabled);
              setActiveTab('cards');
            }}
            className="px-8 py-3 rounded-full bg-white text-black font-mono text-xs font-bold shadow-lg hover:bg-slate-200 transition-all cursor-pointer"
          >
            EXPLORE STORE
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Full Responsive Cards Grid View */
        <div className="space-y-4 w-full min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-slate-400">
              Showing <span className="text-white font-bold">{ownedCards.length}</span> owned collection cards
            </p>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active Storage
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full min-w-0">
            {ownedCards.map((card, idx) => {
              const order = getCardOrder(card.id);
              return (
                <div
                  key={card.id}
                  className="flex flex-col items-center rounded-3xl border border-white/10 bg-black/50 p-4 sm:p-5 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-purple-500/40 w-full min-w-0"
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <RarityBadge rarity={card.rarity || 'Rare'} size="sm" showGlow={false} />
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono tracking-wider border border-purple-500/30 bg-purple-500/10 text-purple-300 uppercase font-semibold">
                      {card.tier}
                    </span>
                  </div>

                  <div
                    className="py-2 cursor-pointer w-full flex justify-center"
                    onClick={() => {
                      playSound('click', soundEnabled);
                      setSelectedVaultIndex(idx);
                      setSelectedCard(card);
                    }}
                  >
                    <Realistic3DCard card={card} size="md" interactiveTilt={true} isOwned={true} />
                  </div>

                  <div className="w-full mt-3 pt-3 border-t border-white/10 space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-tech font-bold text-white text-sm truncate max-w-[170px]">
                        {card.name}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold">OWNED</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-purple-300">
                      <span>{card.maskedIdentifier || '•••• •••• •••• 4821'}</span>
                      <span className="text-slate-400">{card.expDate || '12/29'}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => {
                          playSound('click', soundEnabled);
                          setSelectedVaultIndex(idx);
                          setViewMode('stage');
                        }}
                        className="py-1.5 px-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Eye size={12} />
                        <span>Inspect</span>
                      </button>

                      <button
                        onClick={() => {
                          playSound('click', soundEnabled);
                          downloadDigitalCard(card, order, currentUser);
                        }}
                        className="py-1.5 px-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Download size={12} />
                        <span>Pass</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* 3D Stage & Inspector View */
        <div className="space-y-6 sm:space-y-8 w-full min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start w-full min-w-0">
            <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-md shadow-2xl w-full min-w-0">
              <div className="flex items-center justify-between w-full mb-6 z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                    COLLECTION ASSET {selectedVaultIndex + 1} OF {ownedCards.length}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <RarityBadge
                    rarity={activeCard.rarity || 'Rare'}
                    size="sm"
                    showGlow={false}
                  />
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-white/10 text-slate-200 border border-white/10 uppercase font-semibold flex items-center gap-1">
                    <CardNetworkLogo network={activeCard.network || 'RAWAT'} size="xs" />
                    <span>{activeCard.network || 'RAWAT'}</span>
                  </span>
                  <span className="px-3 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-white/10 text-slate-200 border border-white/10 uppercase font-semibold">
                    {activeCard.tier}
                  </span>
                </div>
              </div>

              {/* 3D Museum Pedestal Stage Controls */}
              <div className="flex items-center justify-between w-full mb-2 z-10 px-2 text-[10px] font-mono">
                <button
                  onClick={() => {
                    playSound('swiss_tick', soundEnabled);
                    setIsPedestalMode(!isPedestalMode);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all cursor-pointer ${
                    isPedestalMode
                      ? 'bg-amber-500/20 border-amber-400/60 text-amber-300 shadow-[0_0_12px_rgba(212,175,55,0.25)]'
                      : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Museum Pedestal: {isPedestalMode ? 'ACTIVE' : 'OFF'}</span>
                </button>

                {isPedestalMode && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-500">Aura:</span>
                    {(['gold', 'cyan', 'ruby'] as const).map((clr) => (
                      <button
                        key={clr}
                        onClick={() => {
                          playSound('click', soundEnabled);
                          setPedestalLighting(clr);
                        }}
                        className={`w-4 h-4 rounded-full border transition-transform cursor-pointer ${
                          pedestalLighting === clr ? 'scale-125 ring-2 ring-white/50' : 'opacity-60 hover:opacity-100'
                        } ${
                          clr === 'gold'
                            ? 'bg-amber-400 border-amber-300'
                            : clr === 'cyan'
                            ? 'bg-cyan-400 border-cyan-300'
                            : 'bg-rose-500 border-rose-400'
                        }`}
                        title={`${clr} Spotlight`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* 3D Card Interactive Visual with Marble Pedestal */}
              <div className="relative py-4 z-10 w-full flex flex-col items-center justify-center">
                {/* Museum Top-Down Spotlight */}
                {isPedestalMode && (
                  <div
                    className={`absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-44 blur-3xl pointer-events-none transition-colors duration-700 ${
                      pedestalLighting === 'gold'
                        ? 'bg-amber-400/20'
                        : pedestalLighting === 'cyan'
                        ? 'bg-cyan-400/20'
                        : 'bg-rose-500/20'
                    }`}
                  />
                )}

                <Realistic3DCard
                  card={activeCard}
                  size="hero"
                  showFlipButton={true}
                  interactiveTilt={true}
                  isOwned={true}
                  allowSlabToggle={true}
                  initialEncased={true}
                />

                {/* 3D Floating Black Marble Pedestal Base */}
                {isPedestalMode && (
                  <div className="mt-4 sm:mt-6 w-64 sm:w-80 h-7 sm:h-9 rounded-2xl pedestal-marble border border-white/20 relative flex items-center justify-center shadow-2xl">
                    {/* Golden Inlay Line */}
                    <div
                      className={`h-[1px] w-3/4 rounded-full transition-colors duration-500 ${
                        pedestalLighting === 'gold'
                          ? 'bg-gradient-to-r from-transparent via-amber-400/80 to-transparent'
                          : pedestalLighting === 'cyan'
                          ? 'bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent'
                          : 'bg-gradient-to-r from-transparent via-rose-400/80 to-transparent'
                      }`}
                    />
                    <span className="absolute -bottom-4 text-[7px] font-mono tracking-[0.25em] text-zinc-500 uppercase">
                      RAWAT OBSIDIAN PEDESTAL SHOWCASE
                    </span>
                  </div>
                )}
              </div>

              {/* Unmasked Credentials & Direct Actions Bar */}
              <div className="mt-6 z-10 w-full pt-4 border-t border-white/10 space-y-4 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-3 min-w-0">
                  <div className="min-w-0">
                    <p className="font-tech font-bold text-base sm:text-lg text-white truncate">{activeCard.name}</p>
                    <p className="text-xs font-mono text-purple-300">
                      {revealSecrets
                        ? (activeCard.cardNumber || activeCard.maskedIdentifier || '4532 8912 3456 4821')
                        : (activeCard.maskedIdentifier || '•••• •••• •••• 4821')}{' '}
                      • {activeCard.expDate || '12/29'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setRevealSecrets(!revealSecrets)}
                      className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-mono text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {revealSecrets ? <EyeOff size={13} /> : <Eye size={13} />}
                      <span>{revealSecrets ? 'MASK' : 'REVEAL'}</span>
                    </button>

                    <button
                      onClick={() => {
                        playSound('click', soundEnabled);
                        setSelectedCard(activeCard);
                      }}
                      className="rounded-full bg-white px-3.5 sm:px-4 py-1.5 text-xs font-mono font-bold text-black hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>DETAILS</span>
                    </button>
                  </div>
                </div>

                {/* Card Credentials Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono bg-black/50 border border-white/10 rounded-2xl p-3 sm:p-3.5 w-full min-w-0">
                  <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex items-center justify-between min-w-0">
                    <div className="min-w-0">
                      <span className="text-[9px] text-slate-400 block">CARD NUMBER (16-DIGIT)</span>
                      <span className="font-bold text-white tracking-wider text-xs truncate block">
                        {revealSecrets
                          ? (activeCard.cardNumber || activeCard.maskedIdentifier || '4532 8912 3456 4821')
                          : (activeCard.maskedIdentifier || '•••• •••• •••• 4821')}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(activeCard.cardNumber || activeCard.maskedIdentifier || '4532 8912 3456 4821', 'vCardNum')}
                      className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-slate-300 shrink-0 ml-2"
                      title="Copy Card Number"
                    >
                      {copiedKey === 'vCardNum' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    </button>
                  </div>

                  <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex items-center justify-between min-w-0">
                    <div className="min-w-0">
                      <span className="text-[9px] text-slate-400 block">EXPIRY & CVV</span>
                      <span className="font-bold text-white tracking-wider text-xs truncate block">
                        {activeCard.expDate || '12/29'} • CVV: {revealSecrets ? (activeCard.cvv || '821') : '•••'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(`${activeCard.expDate || '12/29'} CVV:${activeCard.cvv || '821'}`, 'vExpCvv')}
                      className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-slate-300 shrink-0 ml-2"
                      title="Copy Expiry & CVV"
                    >
                      {copiedKey === 'vExpCvv' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    </button>
                  </div>

                  <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex items-center justify-between min-w-0">
                    <div className="min-w-0">
                      <span className="text-[9px] text-slate-400 block">SPENDING LIMIT</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-emerald-400 text-xs truncate block">
                          ₹{(activeCard.limit || (activeCard.price ? Math.round(activeCard.price * 12) : 6500)).toLocaleString('en-IN')}
                        </span>
                        {activeCard.price && (activeCard.limit || Math.round(activeCard.price * 12)) >= activeCard.price * 10 && (
                          <span className="text-[8px] font-mono font-black text-amber-300 bg-amber-950/70 border border-amber-500/30 px-1 rounded">
                            {Math.round((activeCard.limit || Math.round(activeCard.price * 12)) / activeCard.price)}X+
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[8px] font-bold text-emerald-400/80 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded shrink-0 ml-2">
                      ACTIVE
                    </span>
                  </div>

                  <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex items-center justify-between min-w-0">
                    <div className="min-w-0">
                      <span className="text-[9px] text-slate-400 block">ATM PIN / BANK</span>
                      <span className="font-bold text-purple-300 text-xs truncate block">
                        PIN: {revealSecrets ? (activeCard.cardPin || '4821') : '••••'} • {activeCard.bankName || 'RAWAT BANK'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(activeCard.cardPin || '4821', 'vPin')}
                      className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-slate-300 shrink-0 ml-2"
                      title="Copy PIN"
                    >
                      {copiedKey === 'vPin' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>

                {/* Customer Unbox and Download Buttons */}
                <div className="space-y-2 pt-1 w-full min-w-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full min-w-0">
                    <button
                      type="button"
                      onClick={() => {
                        playSound('purchase', soundEnabled);
                        setIsSecretKeyModalOpen(true);
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-tech font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/30 transition-all transform hover:scale-[1.01]"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Instant Secret Key & Codes</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playSound('purchase', soundEnabled);
                        setIsUnboxingModalOpen(true);
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-tech font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-pink-600/30 transition-all transform hover:scale-[1.01]"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>3D Hologram Unbox</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full min-w-0">
                    <button
                      onClick={() => {
                        playSound('click', soundEnabled);
                        downloadReceiptHtml(activeOrder, activeCard, currentUser);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-mono font-bold transition-all cursor-pointer shadow-sm"
                    >
                      <Receipt size={14} />
                      <span>DOWNLOAD RECEIPT</span>
                    </button>

                    <button
                      onClick={() => {
                        playSound('click', soundEnabled);
                        downloadDigitalCard(activeCard, activeOrder, currentUser);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 text-xs font-mono font-bold transition-all cursor-pointer shadow-sm"
                    >
                      <Download size={14} />
                      <span>DOWNLOAD CARD PASS</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Collection Cards List with Masked Details */}
            <div className="lg:col-span-5 space-y-4 w-full min-w-0">
              <div className="rounded-3xl border border-white/10 bg-black/40 p-4 sm:p-5 space-y-4 backdrop-blur-xl w-full min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-tech font-bold text-base text-white">Your Collection ({ownedCards.length})</h3>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    Persistent Storage
                  </span>
                </div>

                {/* Cards List with Order IDs & Dates */}
                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {ownedCards.map((card, idx) => {
                    const isSelected = selectedVaultIndex === idx;
                    const order = getCardOrder(card.id);
                    const orderId = order?.orderNumber
                      ? (order.orderNumber.startsWith('RWT-') ? order.orderNumber : `RWT-${order.orderNumber}`)
                      : `RWT-VLT-${card.id.slice(-4).toUpperCase()}`;
                    const purchaseDate = order?.purchaseDate
                      ? new Date(order.purchaseDate).toLocaleDateString()
                      : 'Vault Acquired';

                    return (
                      <div
                        key={card.id}
                        onClick={() => {
                          playSound('click', soundEnabled);
                          setSelectedVaultIndex(idx);
                        }}
                        className={`p-3 sm:p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-white/10 border-purple-500/40 text-white shadow-lg shadow-purple-950/40'
                            : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5 gap-2">
                          <p className="font-tech font-bold text-xs text-white leading-tight truncate max-w-[170px]">
                            {card.name}
                          </p>
                          <div className="flex items-center gap-1 shrink-0">
                            <RarityBadge rarity={card.rarity || 'Rare'} size="xs" showGlow={false} />
                            <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-semibold">
                              {card.tier}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-white/5">
                          <span className="flex items-center gap-1 text-slate-300">
                            <Hash className="w-3 h-3 text-purple-400" />
                            {orderId}
                          </span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <Calendar className="w-3 h-3" />
                            {purchaseDate}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-1">
                          <span className="font-mono text-xs font-semibold text-purple-300 tracking-wider">
                            {card.maskedIdentifier || '**** **** **** 4821'}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playSound('click', soundEnabled);
                              setSelectedCard(card);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-mono font-semibold transition-colors flex items-center gap-1"
                          >
                            <span>DETAILS</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Certificate of Authenticity */}
              <div className="rounded-3xl border border-white/10 bg-black/40 p-4 sm:p-5 space-y-3 font-mono text-xs backdrop-blur-xl w-full min-w-0">
                <div className="flex items-center gap-2 text-slate-300 font-semibold border-b border-white/5 pb-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>VAULT CERTIFICATE OF AUTHENTICITY</span>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-400">
                  <div className="flex justify-between">
                    <span>TOKEN ID:</span>
                    <span className="text-purple-400 font-bold">RWT-VLT-{activeCard.id.slice(-4).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CARD NUMBER:</span>
                    <span className="text-white font-bold">{activeCard.maskedIdentifier || '**** **** **** 4821'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>EXP / CVV:</span>
                    <span className="text-slate-200">{activeCard.expDate || '**/**'} / {activeCard.cvv || '***'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>STATUS:</span>
                    <span className="text-emerald-400 font-bold">Secured & Verified</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 pt-2 border-t border-white/5 leading-relaxed">
                  Fictional digital asset stored permanently in your RAWAT Card Store customer account.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Digital Unboxing & Scratch Modal */}
      {activeCard && (
        <DigitalUnboxingModal
          card={activeCard}
          isOpen={isUnboxingModalOpen}
          onClose={() => setIsUnboxingModalOpen(false)}
        />
      )}

      {/* Instant Decrypted Secret Key Modal */}
      {activeCard && (
        <DigitalSecretKeyModal
          card={activeCard}
          order={activeOrder}
          isOpen={isSecretKeyModalOpen}
          onClose={() => setIsSecretKeyModalOpen(false)}
        />
      )}
    </div>
  );
};

