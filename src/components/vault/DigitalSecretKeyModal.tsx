import React, { useState } from 'react';
import { CardProduct, OrderRecord } from '../../types';
import { Realistic3DCard } from '../cards/Realistic3DCard';
import { RarityBadge } from '../cards/RarityBadge';
import {
  KeyRound,
  ShieldCheck,
  Copy,
  Check,
  Eye,
  EyeOff,
  Download,
  FileText,
  Lock,
  Unlock,
  Sparkles,
  X,
  CreditCard,
  Hash,
  Shield,
  Layers
} from 'lucide-react';
import { playSound } from '../../utils/audio';
import { copyToClipboard } from '../../utils/cardExport';

interface DigitalSecretKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardProduct;
  order?: OrderRecord;
}

export const DigitalSecretKeyModal: React.FC<DigitalSecretKeyModalProps> = ({
  isOpen,
  onClose,
  card,
  order
}) => {
  const [revealed, setRevealed] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !card) return null;

  const cardNumber = order?.cardNumber || card.cardNumber || '4532 8912 3456 4821';
  const cvv = order?.cvv || card.cvv || '821';
  const expDate = order?.expDate || card.expDate || '08/31';
  const pin = order?.cardPin || card.cardPin || '4821';
  const licenseKey = order?.licenseKey || card.licenseKey || `RWT-KEY-${card.id.toUpperCase()}-8821`;
  const giftCode = order?.giftCode || card.giftCode || `GIFT-RAWAT-${card.id.slice(0, 5).toUpperCase()}`;
  const holder = order?.cardHolder || card.cardHolder || 'RAWAT VIP HOLDER';
  const bank = order?.bankName || card.bankName || 'RAWAT RESERVE BANK';

  const handleCopy = (text: string, field: string) => {
    copyToClipboard(text);
    playSound('click', true);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCopyAll = () => {
    const fullText = `====================================
RAWAT CARD STORE - DECRYPTED CREDENTIALS
====================================
Product Name  : ${card.name}
Edition       : ${card.edition}
Card Number   : ${cardNumber}
Expiry Date   : ${expDate}
CVV Code      : ${cvv}
Card PIN      : ${pin}
Card Holder   : ${holder}
Issuing Bank  : ${bank}
Spending Limit: ₹${(card.limit || (card.price ? Math.round(card.price * 12) : 6500)).toLocaleString('en-IN')}
License Key   : ${licenseKey}
Gift / Redeem : ${giftCode}
Vault Token ID: ${order?.vaultTokenId || 'RWT-VLT-7719'}
Order Number  : ${order?.orderNumber || 'RAWAT1024'}
Security      : End-to-End Cryptographically Sealed
====================================`;
    copyToClipboard(fullText);
    playSound('purchase', true);
    setCopiedField('ALL');
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleDownloadTxt = () => {
    const textContent = `====================================
RAWAT CARD STORE - DECRYPTED SECRET CREDENTIALS
====================================
Product Name   : ${card.name}
Card Edition   : ${card.edition}
Card Number    : ${cardNumber}
Expiry Date    : ${expDate}
CVV Code       : ${cvv}
Card PIN       : ${pin}
Cardholder     : ${holder}
Issuing Bank   : ${bank}
Credit Limit   : ₹${(card.limit || (card.price ? Math.round(card.price * 12) : 6500)).toLocaleString('en-IN')}
Secret License : ${licenseKey}
Redeem Code    : ${giftCode}
Vault Token ID : ${order?.vaultTokenId || 'RWT-VLT-7719'}
Order Reference: ${order?.orderNumber || 'RAWAT1024'}
Timestamp      : ${new Date().toISOString()}
====================================`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RAWAT-CREDENTIALS-${card.name.replace(/\s+/g, '-').toUpperCase()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    playSound('click', true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl rounded-3xl border border-purple-500/30 bg-zinc-950/95 backdrop-blur-2xl p-5 sm:p-8 shadow-2xl shadow-purple-600/20 z-10 my-auto space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest">
                  DECRYPTED VAULT ASSET
                </span>
                <RarityBadge rarity={card.rarity || 'Rare'} size="xs" showGlow={false} />
              </div>
              <h3 className="font-tech text-xl sm:text-2xl font-black text-white">
                Instant Secret Credentials Unlock
              </h3>
            </div>
          </div>

          {/* Privacy Blur Toggle */}
          <button
            type="button"
            onClick={() => setRevealed(!revealed)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto ${
              revealed
                ? 'bg-purple-600/20 border-purple-500/40 text-purple-300'
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            {revealed ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{revealed ? 'Sensitive Info Revealed' : 'Hidden for Privacy'}</span>
          </button>
        </div>

        {/* 3D Visual & Credential Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* 3D Card Interactive Preview */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-3 rounded-2xl bg-black/40 border border-white/5">
            <Realistic3DCard card={card} size="sm" showFlipButton={true} isOwned={true} />
            <span className="text-[10px] font-mono text-slate-500 mt-2">
              Flip to view physical reverse texture
            </span>
          </div>

          {/* Decrypted Credential Fields */}
          <div className="md:col-span-7 space-y-3 font-mono text-xs">
            {/* 16-Digit Card Number */}
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold block">16-DIGIT CARD NUMBER</span>
                <span className={`font-mono text-sm sm:text-base font-bold text-white tracking-widest ${!revealed ? 'blur-sm select-none' : ''}`}>
                  {cardNumber}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(cardNumber, 'CARD_NUM')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Copy Card Number"
              >
                {copiedField === 'CARD_NUM' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* EXPIRY & CVV & PIN */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/10">
                <span className="text-[9px] text-slate-400 block font-bold">EXPIRY</span>
                <span className={`font-mono text-sm font-bold text-purple-300 ${!revealed ? 'blur-sm select-none' : ''}`}>
                  {expDate}
                </span>
              </div>

              <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold">CVV</span>
                  <span className={`font-mono text-sm font-bold text-amber-300 ${!revealed ? 'blur-sm select-none' : ''}`}>
                    {cvv}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(cvv, 'CVV')}
                  className="p-1 text-slate-400 hover:text-white cursor-pointer"
                  title="Copy CVV"
                >
                  {copiedField === 'CVV' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold">PIN</span>
                  <span className={`font-mono text-sm font-bold text-emerald-300 ${!revealed ? 'blur-sm select-none' : ''}`}>
                    {pin}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(pin, 'PIN')}
                  className="p-1 text-slate-400 hover:text-white cursor-pointer"
                  title="Copy PIN"
                >
                  {copiedField === 'PIN' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Secret License Key */}
            <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between gap-2">
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] text-purple-300 font-bold block">VAULT SECRET LICENSE KEY</span>
                <span className={`font-mono text-xs font-bold text-purple-200 truncate block ${!revealed ? 'blur-sm select-none' : ''}`}>
                  {licenseKey}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(licenseKey, 'LICENSE')}
                className="p-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 transition-colors cursor-pointer shrink-0"
                title="Copy License Key"
              >
                {copiedField === 'LICENSE' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Instant Redeem / Gift Code */}
            <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between gap-2">
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] text-emerald-300 font-bold block">INSTANT REDEEM / GIFT CODE</span>
                <span className={`font-mono text-xs font-bold text-emerald-200 truncate block ${!revealed ? 'blur-sm select-none' : ''}`}>
                  {giftCode}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(giftCode, 'GIFT')}
                className="p-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 transition-colors cursor-pointer shrink-0"
                title="Copy Gift Code"
              >
                {copiedField === 'GIFT' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons: Copy All & Export */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={handleCopyAll}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold font-mono text-xs transition-all shadow-lg shadow-purple-900/30 flex items-center gap-2 cursor-pointer"
          >
            {copiedField === 'ALL' ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>All Decrypted Credentials Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy All Decrypted Credentials</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadTxt}
            className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-mono text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Keyfile (.txt)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
