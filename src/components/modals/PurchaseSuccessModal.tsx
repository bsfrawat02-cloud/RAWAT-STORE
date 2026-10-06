import React, { useState } from 'react';
import { OrderRecord } from '../../types';
import { Realistic3DCard } from '../cards/Realistic3DCard';
import { CardNetworkLogo } from '../cards/CardNetworkLogo';
import { RarityBadge } from '../cards/RarityBadge';
import {
  CheckCircle2,
  ShieldCheck,
  Download,
  Sparkles,
  X,
  Layers,
  ArrowRight,
  Receipt,
  KeyRound,
  Copy,
  Check,
  Eye,
  EyeOff,
  Lock,
  Unlock
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { playSound } from '../../utils/audio';
import { downloadReceiptHtml, downloadDigitalCard, copyToClipboard } from '../../utils/cardExport';
import { DigitalUnboxingModal } from '../vault/DigitalUnboxingModal';

interface PurchaseSuccessModalProps {
  order: OrderRecord | null;
  onClose: () => void;
}

export const PurchaseSuccessModal: React.FC<PurchaseSuccessModalProps> = ({
  order,
  onClose
}) => {
  const { cards, formatPrice, setActiveTab, soundEnabled, currentUser } = useStore();
  const [showUnboxingModal, setShowUnboxingModal] = useState(false);
  const [isRevealed, setIsRevealed] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!order) return null;

  const card = cards.find((c) => c.id === order.cardId);

  const cardNumber = order.cardNumber || card?.cardNumber || '4532 8912 3456 4821';
  const cvv = order.cvv || card?.cvv || '821';
  const expDate = order.expDate || card?.expDate || '08/31';
  const pin = order.cardPin || card?.cardPin || '4821';
  const licenseKey = order.licenseKey || card?.licenseKey || `RWT-KEY-${order.cardId.toUpperCase()}-7719`;
  const giftCode = order.giftCode || card?.giftCode || `GIFT-RAWAT-${order.orderNumber}`;

  const handleCopy = (text: string, field: string) => {
    copyToClipboard(text);
    playSound('click', soundEnabled);
    setCopiedKey(field);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyAll = () => {
    const fullText = `====================================
RAWAT CARD STORE - INSTANT CREDENTIALS
====================================
Card Name     : ${order.cardName}
Card Number   : ${cardNumber}
Expiry Date   : ${expDate}
CVV Code      : ${cvv}
Card PIN      : ${pin}
License Key   : ${licenseKey}
Gift Code     : ${giftCode}
Vault Token   : ${order.vaultTokenId}
Order Number  : ${order.orderNumber}
Limit         : ₹${(card?.limit || (card?.price ? Math.round(card.price * 12) : 6500)).toLocaleString('en-IN')}
====================================`;
    copyToClipboard(fullText);
    playSound('purchase', soundEnabled);
    setCopiedKey('ALL');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownloadReceipt = () => {
    downloadReceiptHtml(order, card, currentUser);
    playSound('click', soundEnabled);
  };

  const handleDownloadCard = () => {
    if (card) {
      downloadDigitalCard(card, order, currentUser);
      playSound('click', soundEnabled);
    }
  };

  const handleGoToVault = () => {
    playSound('click', soundEnabled);
    onClose();
    setActiveTab('vault');
  };

  const orderDisplayId = order.orderNumber.startsWith('RWT-') ? order.orderNumber : `RWT-${order.orderNumber}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
        onClick={() => {
          playSound('click', soundEnabled);
          onClose();
        }}
      />

      {/* Container */}
      <div className="relative w-full max-w-xl rounded-3xl border border-purple-500/30 bg-[#0c0d15]/95 backdrop-blur-2xl p-5 sm:p-7 shadow-2xl z-10 my-auto text-center space-y-5">
        <button
          onClick={() => {
            playSound('click', soundEnabled);
            onClose();
          }}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Success Icon Badge */}
        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          <CheckCircle2 className="w-8 h-8 animate-bounce" />
        </div>

        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 uppercase font-semibold mb-2">
            <Sparkles className="w-3 h-3" />
            <span>PURCHASE & UNLOCK COMPLETE</span>
          </div>
          <h2 className="font-tech font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            Added to My Digital Vault!
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1 max-w-md mx-auto">
            Your card details and secret license keys have been unlocked instantly below.
          </p>
        </div>

        {/* Card Small 3D Preview */}
        {card && (
          <div className="flex justify-center py-1">
            <Realistic3DCard card={card} size="sm" showFlipButton={true} isOwned={true} />
          </div>
        )}

        {/* Instant Decrypted Secret Key Unlock Box */}
        <div className="rounded-2xl border border-purple-500/40 bg-purple-950/20 p-4 space-y-3 font-mono text-xs text-left backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
            <div className="flex items-center gap-1.5 text-purple-300 font-bold text-xs">
              <KeyRound className="w-4 h-4 text-purple-400" />
              <span>INSTANT UNLOCKED CREDENTIALS</span>
            </div>
            <button
              type="button"
              onClick={() => setIsRevealed(!isRevealed)}
              className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{isRevealed ? 'Hide Details' : 'Reveal Details'}</span>
            </button>
          </div>

          {/* 16 Digit Card Number */}
          <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-white/5">
            <div>
              <span className="text-[9px] text-slate-400 block font-bold">16-DIGIT CARD NUMBER</span>
              <span className={`text-sm font-bold text-white tracking-wider ${!isRevealed ? 'blur-sm select-none' : ''}`}>
                {cardNumber}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(cardNumber, 'CARD')}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer"
              title="Copy Card Number"
            >
              {copiedKey === 'CARD' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Grid: EXP, CVV, PIN */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[9px] text-slate-400 block font-bold">EXPIRY</span>
              <span className={`font-bold text-purple-300 ${!isRevealed ? 'blur-sm select-none' : ''}`}>
                {expDate}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-slate-400 block font-bold">CVV</span>
                <span className={`font-bold text-amber-300 ${!isRevealed ? 'blur-sm select-none' : ''}`}>
                  {cvv}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(cvv, 'CVV')}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                {copiedKey === 'CVV' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-slate-400 block font-bold">PIN</span>
                <span className={`font-bold text-emerald-300 ${!isRevealed ? 'blur-sm select-none' : ''}`}>
                  {pin}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(pin, 'PIN')}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                {copiedKey === 'PIN' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* License Key & Gift Code */}
          <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-white/5">
            <div className="truncate mr-2">
              <span className="text-[9px] text-purple-300 block font-bold">VAULT LICENSE KEY</span>
              <span className={`text-xs font-bold text-purple-200 truncate block ${!isRevealed ? 'blur-sm select-none' : ''}`}>
                {licenseKey}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(licenseKey, 'LICENSE')}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer shrink-0"
              title="Copy License Key"
            >
              {copiedKey === 'LICENSE' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Quick 1-Click Copy All */}
          <button
            type="button"
            onClick={handleCopyAll}
            className="w-full py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedKey === 'ALL' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>All Decrypted Credentials Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>1-Click Copy All Credentials</span>
              </>
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          {card && (
            <button
              onClick={() => {
                playSound('purchase', soundEnabled);
                setShowUnboxingModal(true);
              }}
              className="w-full rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-6 py-3 text-xs font-tech font-bold uppercase tracking-wider text-white transition-all flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>✨ Break Holographic Seal & Unbox in 3D</span>
            </button>
          )}

          <button
            onClick={handleGoToVault}
            className="w-full rounded-2xl bg-white px-6 py-3 text-xs font-mono font-bold uppercase tracking-wider text-black hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>OPEN MY 3D CARD WALLET</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownloadReceipt}
              className="rounded-xl border border-purple-500/30 bg-purple-600/20 hover:bg-purple-600/30 px-3 py-2 text-xs font-mono text-purple-200 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5 text-purple-400" />
              <span>TAX INVOICE</span>
            </button>

            <button
              onClick={handleDownloadCard}
              className="rounded-xl border border-emerald-500/30 bg-emerald-600/20 hover:bg-emerald-600/30 px-3 py-2 text-xs font-mono text-emerald-200 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>DIGITAL PASS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Unboxing Modal Overlay */}
      {card && (
        <DigitalUnboxingModal
          card={card}
          isOpen={showUnboxingModal}
          onClose={() => setShowUnboxingModal(false)}
        />
      )}
    </div>
  );
};
