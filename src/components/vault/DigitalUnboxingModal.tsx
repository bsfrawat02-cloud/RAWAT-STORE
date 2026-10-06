import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { CardProduct, OrderRecord } from '../../types';
import { playSound } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Eye,
  EyeOff,
  Copy,
  Check,
  Download,
  Lock,
  Unlock,
  ShieldCheck,
  X,
  CreditCard,
  Zap,
  Award,
  Share2
} from 'lucide-react';

interface DigitalUnboxingModalProps {
  card: CardProduct | OrderRecord;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalUnboxingModal: React.FC<DigitalUnboxingModalProps> = ({
  card,
  isOpen,
  onClose,
}) => {
  const { soundEnabled, formatPrice } = useStore();
  const [isRevealed, setIsRevealed] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isScratching, setIsScratching] = useState(false);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setIsRevealed(false);
      setShowSensitive(false);
      setCopiedField(null);
    }
  }, [isOpen]);

  if (!isOpen || !card) return null;

  // Synthesize realistic secure card credentials
  const cardNumber = (card as any).cardNumber || `4532 8912 ${Math.floor(1000 + Math.random() * 9000)} ${card.maskedIdentifier.replace(/[^0-9]/g, '') || '4821'}`;
  const expDate = (card as any).expDate || '08/31';
  const cvv = (card as any).cvv || '821';
  const cardPin = (card as any).cardPin || '4821';
  const cardHolder = (card as any).cardHolder || 'RAWAT VIP HOLDER';
  const bankName = (card as any).bankName || 'RAWAT RESERVE VAULT';
  const vaultTokenId = (card as any).vaultTokenId || `RWT-VLT-${Math.floor(100000 + Math.random() * 900000)}`;

  const handleBreakSeal = () => {
    playSound('purchase', soundEnabled);
    setIsScratching(true);

    setTimeout(() => {
      setIsRevealed(true);
      setIsScratching(false);
      playSound('purchase', soundEnabled);

      // Trigger Confetti Burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#d946ef', '#06b6d4', '#f59e0b', '#ffffff'],
      });
    }, 800);
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    playSound('click', soundEnabled);
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleExportCertificate = () => {
    playSound('click', soundEnabled);
    const content = `=====================================================
RAWAT CARD STORE — OFFICIAL DIGITAL VAULT CERTIFICATE
=====================================================
INSTRUMENT: ${card.name || (card as any).cardName}
VAULT TOKEN ID: ${vaultTokenId}
CARD TIER: ${(card as any).cardTier || (card as any).tier}
CARD FINISH: ${(card as any).cardFinish || (card as any).finish}

SECURE CREDENTIALS:
- 16-Digit Card Number: ${cardNumber}
- Expiration Date: ${expDate}
- Security CVV: ${cvv}
- Security PIN: ${cardPin}
- Cardholder Moniker: ${cardHolder}
- Custody Vault: ${bankName}
- Timestamp: ${new Date().toISOString()}

STATUS: VERIFIED GENUINE & ENCRYPTED IN CLOUD VAULT
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RAWAT_VAULT_${vaultTokenId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl bg-zinc-950/95 border border-purple-500/40 p-6 shadow-2xl shadow-purple-950/80 font-mono text-xs text-white space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-tech font-bold text-white text-base">Digital Vault Unboxing</h3>
              <p className="text-[10px] text-purple-400 font-bold uppercase">Token: {vaultTokenId}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3D Holographic Card Visual Preview */}
        <div className="relative rounded-2xl p-6 bg-gradient-to-br from-zinc-900 via-purple-950/40 to-black border border-purple-500/40 shadow-xl overflow-hidden min-h-[220px] flex flex-col justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent pointer-events-none" />

          {/* Top of Card */}
          <div className="flex items-center justify-between relative z-10">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-widest">{bankName}</span>
              <h4 className="text-base font-black font-tech text-white tracking-wide">{card.name || (card as any).cardName}</h4>
            </div>

            <div className="px-2.5 py-1 rounded-lg bg-black/60 border border-purple-500/30 text-purple-300 font-bold text-[10px] flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              <span>{(card as any).cardTier || (card as any).tier || 'OBSIDIAN'}</span>
            </div>
          </div>

          {/* EMV Chip & NFC */}
          <div className="flex items-center gap-4 my-3 relative z-10">
            <div className="w-10 h-7 rounded bg-gradient-to-tr from-amber-300 via-amber-400 to-yellow-500 border border-amber-600 shadow-inner flex items-center justify-center">
              <div className="w-6 h-4 border border-amber-800/40 rounded-xs" />
            </div>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>

          {/* Card Number & Sensitive Fields */}
          <div className="space-y-2 relative z-10">
            <div className="flex items-center justify-between">
              <div className="text-sm sm:text-base font-tech font-black tracking-widest text-white">
                {isRevealed ? (showSensitive ? cardNumber : card.maskedIdentifier || '•••• •••• •••• 4821') : '•••• •••• •••• ••••'}
              </div>

              {isRevealed && (
                <button
                  type="button"
                  onClick={() => setShowSensitive(!showSensitive)}
                  className="p-1 rounded-lg bg-black/40 hover:bg-black/60 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Toggle Mask"
                >
                  {showSensitive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-300 pt-1 border-t border-white/10">
              <div>
                <span className="text-[8px] text-slate-500 uppercase block font-bold">Cardholder</span>
                <span className="font-bold">{cardHolder}</span>
              </div>
              <div>
                <span className="text-[8px] text-slate-500 uppercase block font-bold">Expires</span>
                <span className="font-bold">{isRevealed ? expDate : '••/••'}</span>
              </div>
              <div>
                <span className="text-[8px] text-slate-500 uppercase block font-bold">CVV</span>
                <span className="font-bold">{isRevealed && showSensitive ? cvv : '•••'}</span>
              </div>
            </div>
          </div>

          {/* Scratch / Unbox Overlay before reveal */}
          {!isRevealed && (
            <div className="absolute inset-0 z-20 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-900/60 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-lg shadow-purple-900/50">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="font-tech font-bold text-white text-base">Digital Vault Security Seal Intact</h4>
              <p className="text-[11px] text-slate-400 max-w-xs">
                Tap below to break the cryptographic tamper seal and reveal all instrument credentials.
              </p>

              <button
                type="button"
                onClick={handleBreakSeal}
                disabled={isScratching}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-tech font-bold text-xs uppercase tracking-wider shadow-xl shadow-purple-600/40 flex items-center gap-2 cursor-pointer transition-all transform hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isScratching ? 'Decrypting Vault Seal...' : 'Break Cryptographic Seal'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Revealed Credentials Table */}
        {isRevealed && (
          <div className="space-y-3 p-4 rounded-2xl bg-black/60 border border-white/10 animate-in fade-in duration-300">
            <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Vault Decryption Complete
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(cardNumber, 'all')}
                className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
              >
                {copiedField === 'all' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedField === 'all' ? 'Copied All!' : 'Copy Credentials'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-white/5">
                <span className="text-[9px] text-slate-500 block uppercase font-bold">Card Number</span>
                <span className="font-tech font-bold text-white block truncate">{cardNumber}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-900 border border-white/5">
                <span className="text-[9px] text-slate-500 block uppercase font-bold">Expiry Date</span>
                <span className="font-tech font-bold text-white block">{expDate}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-900 border border-white/5">
                <span className="text-[9px] text-slate-500 block uppercase font-bold">Security CVV</span>
                <span className="font-tech font-bold text-white block">{cvv}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-900 border border-white/5">
                <span className="text-[9px] text-slate-500 block uppercase font-bold">Card PIN</span>
                <span className="font-tech font-bold text-purple-300 block">{cardPin}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Footer */}
        {isRevealed && (
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleExportCertificate}
              className="flex-1 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-purple-500/30 text-purple-300 font-tech font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export Official Vault Pass (.TXT)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-tech font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md shadow-purple-600/30"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
