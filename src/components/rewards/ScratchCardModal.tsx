import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Sparkles, Gift, Check, ArrowRight, X, Trophy, Wallet, Zap } from 'lucide-react';
import { playSound } from '../../utils/audio';

interface ScratchCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  depositAmount?: number;
  forcedReward?: number;
}

export const ScratchCardModal: React.FC<ScratchCardModalProps> = ({
  isOpen,
  onClose,
  depositAmount = 1000,
  forcedReward
}) => {
  const { soundEnabled, topUpBalance, formatPrice, addToast } = useStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isScratched, setIsScratched] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);

  // Generate reward: min 3% to max 10% of deposit (e.g. ₹25 to ₹150)
  const [rewardAmount] = useState<number>(() => {
    if (forcedReward) return forcedReward;
    const min = Math.max(15, Math.floor(depositAmount * 0.03));
    const max = Math.max(50, Math.floor(depositAmount * 0.08));
    const random = Math.floor(Math.random() * (max - min + 1)) + min;
    // Round to nearest 5
    return Math.round(random / 5) * 5;
  });

  // Setup Canvas scratch layer
  useEffect(() => {
    if (!isOpen) {
      setIsScratched(false);
      setScratchPercent(0);
      setIsClaimed(false);
      return;
    }

    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Draw metallic silver/gold holographic scratch cover
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#334155');
      gradient.addColorStop(0.3, '#64748b');
      gradient.addColorStop(0.5, '#94a3b8');
      gradient.addColorStop(0.7, '#64748b');
      gradient.addColorStop(1, '#1e293b');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Add decorative patterns and text on scratch cover
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('✨ RAWAT CASHBACK ✨', width / 2, height / 2 - 15);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '12px monospace';
      ctx.fillText('⚡ Scratch here to reveal ⚡', width / 2, height / 2 + 15);
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen]);

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isScratched) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2, false);
    ctx.fill();

    checkScratchProgress(ctx, canvas.width, canvas.height);
  };

  const checkScratchProgress = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    try {
      const imageData = ctx.getImageData(0, 0, width, height);
      const pixels = imageData.data;
      let transparentPixels = 0;
      const totalPixels = pixels.length / 4;

      for (let i = 3; i < pixels.length; i += 16) {
        if (pixels[i] === 0) {
          transparentPixels += 4;
        }
      }

      const percent = Math.min(100, Math.round((transparentPixels / totalPixels) * 100));
      setScratchPercent(percent);

      if (percent > 40 && !isScratched) {
        setIsScratched(true);
        playSound('purchase', soundEnabled);
      }
    } catch {
      // Fallback
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    scratch(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const touch = e.touches[0];
    if (touch) scratch(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const touch = e.touches[0];
    if (touch) scratch(touch.clientX, touch.clientY);
  };

  const handleClaim = () => {
    if (isClaimed) return;
    setIsClaimed(true);
    playSound('success', soundEnabled);

    // Credit reward to wallet balance
    topUpBalance(rewardAmount);

    addToast({
      title: '🎁 Cashback Credited!',
      message: `₹${rewardAmount} lucky scratch bonus has been added to your wallet!`,
      type: 'bonus',
      amount: rewardAmount
    });

    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleQuickReveal = () => {
    setIsScratched(true);
    setScratchPercent(100);
    playSound('purchase', soundEnabled);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-sm rounded-3xl border border-purple-500/40 bg-zinc-950/95 backdrop-blur-2xl p-6 shadow-2xl shadow-purple-600/20 z-10 my-auto text-center space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest bg-amber-500/20 border border-amber-500/40 text-amber-300 uppercase font-bold mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>LUCKY DEPOSIT CASHBACK</span>
          </div>
          <h3 className="font-tech text-2xl font-black text-white tracking-tight">
            Scratch & Win Bonus
          </h3>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            You earned 1 Lucky Scratch Card for your deposit of {formatPrice(depositAmount)}!
          </p>
        </div>

        {/* Scratch Card Interactive Area */}
        <div className="relative w-full h-44 rounded-2xl overflow-hidden border-2 border-purple-500/50 shadow-inner bg-gradient-to-br from-purple-950 via-zinc-900 to-indigo-950 flex flex-col items-center justify-center p-4 select-none cursor-crosshair">
          {/* Underneath Reward Surface */}
          <div className="text-center space-y-1 z-0 animate-in fade-in">
            <div className="inline-flex p-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Gift className="w-6 h-6 animate-bounce" />
            </div>
            <div className="font-mono text-xs text-purple-300 font-bold uppercase tracking-wider">
              YOU WON INSTANT CASHBACK
            </div>
            <div className="font-tech text-4xl font-extrabold text-white text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 drop-shadow-md">
              ₹{rewardAmount}
            </div>
            <div className="text-[10px] font-mono text-emerald-400 font-semibold">
              Instant Wallet Deposit Credit
            </div>
          </div>

          {/* Canvas Scratch Mask */}
          {!isScratched && (
            <canvas
              ref={canvasRef}
              width={320}
              height={176}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
              className="absolute inset-0 w-full h-full z-10 touch-none"
            />
          )}
        </div>

        {/* Scratch Progress & Controls */}
        <div className="space-y-3 pt-1">
          {!isScratched ? (
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Scratch Progress: {scratchPercent}%</span>
              <button
                type="button"
                onClick={handleQuickReveal}
                className="text-purple-400 hover:text-purple-300 underline text-[11px] cursor-pointer"
              >
                Quick Reveal
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleClaim}
              disabled={isClaimed}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold font-mono text-sm transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {isClaimed ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Credited to Wallet!</span>
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  <span>Claim ₹{rewardAmount} to Wallet</span>
                </>
              )}
            </button>
          )}

          <p className="text-[10px] font-mono text-slate-500">
            Cashback is instantly available for ordering any card from the store collection.
          </p>
        </div>
      </div>
    </div>
  );
};
