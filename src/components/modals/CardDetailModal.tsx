import React, { useState } from 'react';
import { CardProduct } from '../../types';
import { Realistic3DCard } from '../cards/Realistic3DCard';
import { CardNetworkLogo } from '../cards/CardNetworkLogo';
import { RarityBadge } from '../cards/RarityBadge';
import { getRarityConfig } from '../../utils/rarity';
import {
  X,
  ShieldCheck,
  Tag,
  Zap,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  Heart,
  Download,
  Copy,
  Receipt,
  Eye,
  Check,
  ArrowLeftRight
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { playSound } from '../../utils/audio';
import { downloadDigitalCard, downloadReceiptHtml, copyToClipboard } from '../../utils/cardExport';

interface CardDetailModalProps {
  card: CardProduct | null;
  onClose: () => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({ card, onClose }) => {
  const {
    formatPrice,
    purchaseDemoCard,
    applyCoupon,
    coupons,
    soundEnabled,
    ownedCardIds,
    orders,
    currentUser,
    setActiveTab,
    isInWishlist,
    toggleWishlist,
    openComparisonWithCards,
    triggerCinematicUnlock
  } = useStore();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCouponInfo, setAppliedCouponInfo] = useState<{
    code: string;
    discount: number;
    message: string;
  } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!card) return null;

  const isOwned = ownedCardIds.includes(card.id);
  const isBookmarked = isInWishlist(card.id);
  const matchingOrder = orders.find((o) => o.cardId === card.id);

  const handleCopy = (text: string, key: string) => {
    copyToClipboard(text);
    playSound('click', soundEnabled);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = codeToApply || couponCode;
    if (!code.trim()) return;

    setCouponError('');
    const result = applyCoupon(code, card.price);

    if (result.valid) {
      setAppliedCouponInfo({
        code: code.toUpperCase(),
        discount: result.discount,
        message: result.message
      });
      setCouponCode(code.toUpperCase());
    } else {
      setCouponError(result.message);
      setAppliedCouponInfo(null);
    }
  };

  const currentDiscount = appliedCouponInfo?.discount || 0;
  const finalPrice = Math.max(0, card.price - currentDiscount);

  const handlePurchase = () => {
    setIsProcessing(true);
    setPurchaseError('');

    setTimeout(() => {
      const res = purchaseDemoCard(card, appliedCouponInfo?.code);
      setIsProcessing(false);

      if (res.success) {
        onClose();
        triggerCinematicUnlock(card);
      } else {
        setPurchaseError(res.message);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Dark backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={() => {
          playSound('click', soundEnabled);
          onClose();
        }}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl rounded-3xl border border-white/10 bg-[#0c0d15]/95 backdrop-blur-2xl shadow-2xl overflow-hidden z-10 my-auto">
        {/* Top Header Row */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
            <span className="font-mono text-xs text-slate-300 uppercase tracking-widest font-semibold">
              RAWAT CARD DETAILS
            </span>
            <span className="hidden sm:inline-block text-slate-600 font-mono">•</span>
            <span className="hidden sm:inline-block font-mono text-xs text-purple-400">
              {card.edition}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                openComparisonWithCards(card.id);
              }}
              title="Compare with another card"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 transition-all cursor-pointer shadow-sm"
            >
              <ArrowLeftRight size={13} className="text-purple-400" />
              <span className="font-semibold">COMPARE</span>
            </button>

            <button
              id={`modal-wishlist-btn-${card.id}`}
              onClick={() => toggleWishlist(card.id)}
              title={isBookmarked ? 'Remove from Wishlist' : 'Add to Wishlist'}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border transition-all cursor-pointer ${
                isBookmarked
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.25)]'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/15 hover:text-white'
              }`}
            >
              <Heart
                size={13}
                className={isBookmarked ? 'fill-rose-500 text-rose-500' : ''}
              />
              <span className="font-semibold">{isBookmarked ? 'WISHLISTED' : 'WISHLIST'}</span>
            </button>

            <button
              onClick={() => {
                playSound('click', soundEnabled);
                onClose();
              }}
              className="p-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center max-h-[80vh] overflow-y-auto">
          {/* Left Column: Realistic 3D Card Interactive Preview */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center py-4 rounded-3xl border border-white/10 bg-black/40 p-4 sm:p-6 relative overflow-hidden backdrop-blur-md">
            <div className="text-center mb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
                INTERACTIVE 3D PREVIEW
              </span>
            </div>

            <Realistic3DCard
              card={card}
              size="lg"
              showFlipButton={true}
              interactiveTilt={true}
              isOwned={isOwned}
            />

            <p className="text-[11px] font-mono text-slate-400 mt-4 text-center">
              Rotate your cursor or tap FLIP to inspect back details.
            </p>
          </div>

          {/* Right Column: Specifications & Checkout */}
          <div className="lg:col-span-6 space-y-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <RarityBadge
                  rarity={card.rarity || 'Rare'}
                  size="md"
                  showGlow={true}
                />
                <span className="px-3 py-1 rounded-full text-xs font-mono tracking-wider bg-white/10 text-slate-200 border border-white/10 uppercase font-semibold">
                  {card.tier} TIER
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-mono tracking-wider bg-purple-950/60 text-purple-300 border border-purple-800/40 uppercase flex items-center gap-1.5 font-semibold">
                  <CardNetworkLogo network={card.network || 'RAWAT'} size="xs" />
                  <span>RAWAT VAULT</span>
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-mono tracking-wider bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 uppercase font-semibold">
                  {card.status}
                </span>
              </div>

              <h2 className="font-tech font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                {card.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                {card.description}
              </p>
            </div>

            {/* Spec Matrix Table */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono rounded-2xl border border-white/10 bg-black/30 p-3.5">
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <p className="text-[10px] text-slate-500">RARITY GRADE</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-white font-bold">{card.rarity || 'Rare'}</span>
                  <span className="text-[10px] text-slate-400">({getRarityConfig(card.rarity).dropRate})</span>
                </div>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <p className="text-[10px] text-slate-500">EDITION / NETWORK</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <CardNetworkLogo network={card.network || 'RAWAT'} size="xs" />
                  <p className="text-slate-200 font-semibold">{card.network || 'RAWAT Exclusive'}</p>
                </div>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-slate-500">SPENDING LIMIT</p>
                  {card.price && (card.limit || Math.round(card.price * 12)) >= card.price * 10 && (
                    <span className="text-[8px] font-mono font-black text-amber-300 bg-amber-950/70 border border-amber-500/30 px-1 rounded">
                      {Math.round((card.limit || Math.round(card.price * 12)) / card.price)}X+
                    </span>
                  )}
                </div>
                <p className="text-emerald-400 font-bold mt-0.5">
                  ₹{(card.limit || (card.price ? Math.round(card.price * 12) : 6500)).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <p className="text-[10px] text-slate-500">CARD NUMBER</p>
                <p className="text-purple-300 font-semibold mt-0.5">
                  {isOwned
                    ? (card.cardNumber || card.maskedIdentifier || '4532 8912 3456 4821')
                    : (card.maskedIdentifier || '•••• •••• •••• 4821')}
                </p>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <p className="text-[10px] text-slate-500">EXPIRY / CVV</p>
                <p className="text-slate-200 font-semibold mt-0.5">
                  {isOwned ? (card.expDate || '12/29') : '**/**'} / {isOwned ? (card.cvv || '821') : '***'}
                </p>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <p className="text-[10px] text-slate-500">AVAILABILITY</p>
                <p className="text-emerald-400 font-semibold mt-0.5">{card.status} ({card.stockCount} left)</p>
              </div>
            </div>

            {/* If Owned: Display Unlocked Full Credentials & Instant Download Actions */}
            {isOwned ? (
              <div className="space-y-3 pt-2">
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <span className="font-tech font-bold text-sm text-emerald-300 tracking-wider uppercase">
                        COLLECTED ASSET • FULL CREDENTIALS UNLOCKED
                      </span>
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                      AUTHENTICATED
                    </span>
                  </div>

                  {/* Credentials Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-slate-400 block">CARD NUMBER (16 DIGITS)</span>
                        <span className="font-bold text-white tracking-widest text-sm">
                          {card.cardNumber || card.maskedIdentifier || '4532 8912 3456 4821'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(card.cardNumber || card.maskedIdentifier || '4532 8912 3456 4821', 'cardNum')}
                        className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-slate-300 transition-colors"
                        title="Copy Card Number"
                      >
                        {copiedKey === 'cardNum' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-slate-400 block">EXPIRY & CVV</span>
                        <span className="font-bold text-white tracking-widest text-sm">
                          {card.expDate || '12/29'} • CVV: {card.cvv || '821'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(`${card.expDate || '12/29'} CVV:${card.cvv || '821'}`, 'expCvv')}
                        className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-slate-300 transition-colors"
                        title="Copy Expiry & CVV"
                      >
                        {copiedKey === 'expCvv' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-slate-400 block">CREDIT LIMIT</span>
                          {card.price && (card.limit || Math.round(card.price * 12)) >= card.price * 10 && (
                            <span className="text-[8px] font-mono font-black text-amber-300 bg-amber-950/70 border border-amber-500/30 px-1 rounded">
                              {Math.round((card.limit || Math.round(card.price * 12)) / card.price)}X+ Limit
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-emerald-400 text-sm">
                          ₹{(card.limit || (card.price ? Math.round(card.price * 12) : 6500)).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500 uppercase">Pre-Approved</span>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-slate-400 block">ATM PIN / BANK</span>
                        <span className="font-bold text-purple-300 text-sm">
                          PIN: {card.cardPin || '4821'} • {card.bankName || 'RAWAT BANK'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(card.cardPin || '4821', 'pin')}
                        className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-slate-300 transition-colors"
                        title="Copy PIN"
                      >
                        {copiedKey === 'pin' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Customer Download Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        playSound('click', soundEnabled);
                        downloadReceiptHtml(matchingOrder, card, currentUser);
                      }}
                      className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-mono font-bold transition-all cursor-pointer shadow-sm"
                    >
                      <Receipt size={14} />
                      <span>DOWNLOAD RECEIPT</span>
                    </button>

                    <button
                      onClick={() => {
                        playSound('click', soundEnabled);
                        downloadDigitalCard(card, matchingOrder, currentUser);
                      }}
                      className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 text-xs font-mono font-bold transition-all cursor-pointer shadow-sm"
                    >
                      <Download size={14} />
                      <span>DOWNLOAD CARD PASS</span>
                    </button>

                    <button
                      onClick={() => {
                        playSound('click', soundEnabled);
                        onClose();
                        setActiveTab('vault');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-mono font-bold transition-all cursor-pointer"
                    >
                      OPEN COLLECTION
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        triggerCinematicUnlock(card);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>UNBOXING CEREMONY</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Perks */}
                <div className="space-y-1.5">
                  <p className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>INCLUDED VAULT PERKS</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {card.perks.map((perk, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-slate-300 rounded-xl border border-white/5 bg-white/5 px-3 py-1.5 font-mono"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="truncate">{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Promo Coupon Section */}
                <div className="pt-2 border-t border-white/5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5 font-semibold">
                    <Tag className="w-3.5 h-3.5 text-purple-400" />
                    <span>APPLY PROMO COUPON</span>
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        setCouponError('');
                      }}
                      placeholder="e.g. RAWAT20 or RAWATVIP"
                      className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none uppercase focus:border-white/30"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      className="rounded-full bg-white/10 hover:bg-white/20 px-5 py-2 text-slate-200 text-xs font-mono font-semibold transition-colors shrink-0 cursor-pointer"
                    >
                      APPLY
                    </button>
                  </div>

                  {/* Quick Coupon Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-slate-500 font-mono">Available:</span>
                    {coupons.slice(0, 3).map((cp) => (
                      <button
                        key={cp.id}
                        type="button"
                        onClick={() => handleApplyCoupon(cp.code)}
                        className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-purple-300 hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        {cp.code} ({cp.discountType === 'percentage' ? `${cp.discountValue}%` : `₹${cp.discountValue}`})
                      </button>
                    ))}
                  </div>

                  {appliedCouponInfo && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-950/30 border border-emerald-800/40 p-2.5 rounded-2xl">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{appliedCouponInfo.message}</span>
                    </div>
                  )}

                  {couponError && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-400 font-mono bg-rose-950/30 border border-rose-800/40 p-2.5 rounded-2xl">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{couponError}</span>
                    </div>
                  )}
                </div>

                {/* Price Breakdown & Purchase Button */}
                <div className="pt-3 border-t border-white/5 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                        TOTAL PRICE
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-mono font-bold text-white">
                          {formatPrice(finalPrice)}
                        </span>
                        {currentDiscount > 0 && (
                          <span className="text-sm font-mono line-through text-slate-500">
                            {formatPrice(card.price)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-500 block">DELIVERY</span>
                      <span className="text-xs font-mono text-emerald-400 font-semibold">
                        Instant Vault Asset
                      </span>
                    </div>
                  </div>

                  {purchaseError && (
                    <div className="text-xs text-rose-400 font-mono bg-rose-950/40 border border-rose-800/50 p-2.5 rounded-2xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{purchaseError}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handlePurchase}
                    className="w-full rounded-full bg-white px-8 py-3.5 text-sm font-tech font-bold uppercase tracking-wider text-black hover:bg-slate-200 transition-all shadow-xl active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-current" />
                        <span>PURCHASE NOW</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 justify-center">
                    <Lock className="w-3 h-3 text-slate-500" />
                    <span>Instant unmasked 16-digit card, CVV, expiry & limit unlocked upon acquisition.</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
