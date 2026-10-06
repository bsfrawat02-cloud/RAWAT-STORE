import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ShieldCheck,
  Crown,
  Lock,
  Unlock,
  CheckCircle2,
  Layers,
  ArrowRight,
  Wallet,
  Zap,
  Gift,
  Star,
  Check,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AuthCelebrationData } from '../../types';
import { useStore } from '../../context/StoreContext';
import { playSound } from '../../utils/audio';

interface AuthCelebrationModalProps {
  data: AuthCelebrationData | null;
  onClose: () => void;
}

export const AuthCelebrationModal: React.FC<AuthCelebrationModalProps> = ({ data, onClose }) => {
  const { setActiveTab, formatPrice, wallets, soundEnabled } = useStore();
  const [progress, setProgress] = useState(100);
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // Stabilize onClose reference to prevent re-triggering effects or calling during render
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Trigger celebration sounds & multi-stage confetti explosion
  useEffect(() => {
    if (!data) {
      setProgress(100);
      return;
    }

    setProgress(100);

    // 1. Play auditory SFX
    playSound('supernova', soundEnabled);
    const upgradeTimer = setTimeout(() => {
      playSound('upgrade', soundEnabled);
    }, 450);

    // 2. High-impact confetti barrage
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 99999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      try {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      } catch {}
    }

    // Center fountain
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#fbbf24', '#f59e0b', '#d97706', '#ffffff'],
    });
    fire(0.2, {
      spread: 60,
      colors: ['#a855f7', '#c084fc', '#9333ea', '#38bdf8'],
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#fbbf24', '#a855f7', '#38bdf8', '#34d399', '#ec4899'],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ['#ffd700', '#c084fc', '#ffffff'],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ['#fbbf24', '#38bdf8'],
    });

    // Left and Right Cannon bursts after 280ms
    const cannonTimer = setTimeout(() => {
      try {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.65 },
          colors: ['#a855f7', '#fbbf24', '#38bdf8'],
          zIndex: 99999,
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.65 },
          colors: ['#fbbf24', '#ec4899', '#38bdf8'],
          zIndex: 99999,
        });
      } catch {}
    }, 280);

    // Auto-progress countdown (dismisses after 6s unless user interacts)
    // CRITICAL: dismissTimer is decoupled from setProgress updater to prevent "setState while rendering" error
    const duration = 6000;
    const dismissTimer = setTimeout(() => {
      onCloseRef.current();
    }, duration);

    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const progressTimer = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - step));
    }, intervalTime);

    return () => {
      clearTimeout(upgradeTimer);
      clearTimeout(cannonTimer);
      clearTimeout(dismissTimer);
      clearInterval(progressTimer);
    };
  }, [data, soundEnabled]);

  if (!data) return null;

  const isRegister = data.type === 'register';
  const user = data.user;
  const userWallet = wallets[user.id];
  const userBalance = userWallet ? userWallet.balance : (data.bonusGranted ? 50 : 0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    setMousePos({ x: xPercent, y: yPercent });
    const rotX = (y / rect.height - 0.5) * -12;
    const rotY = (x / rect.width - 0.5) * 12;
    setTilt({ rotateX: rotX, rotateY: rotY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
    setMousePos({ x: 50, y: 50 });
  };

  const handleEnterVault = () => {
    playSound('click', soundEnabled);
    onClose();
    setActiveTab('vault');
  };

  const handleEnterStore = () => {
    playSound('click', soundEnabled);
    onClose();
    setActiveTab('cards');
  };

  return (
    <AnimatePresence>
      <div
        id="auth-celebration-overlay"
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/94 backdrop-blur-2xl overflow-y-auto"
        style={{ perspective: '1200px' }}
      >
        {/* Dynamic Multi-Orb Ambient Aurora Glow */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 select-none">
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.35, 0.65, 0.35],
              rotate: [0, 90, 180, 270, 360],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] rounded-full bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.25)_0%,rgba(168,85,247,0.3)_40%,transparent_70%)] blur-[110px]"
          />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
        </div>

        {/* 3D Holographic Celebration Card */}
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          initial={{
            opacity: 0,
            scale: 0.65,
            y: 80,
            rotateX: 20,
            filter: 'blur(16px)',
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            rotateX: tilt.rotateX,
            rotateY: tilt.rotateY,
            filter: 'blur(0px)',
            transition: {
              type: 'spring',
              stiffness: 350,
              damping: 22,
            },
          }}
          exit={{
            opacity: 0,
            scale: 0.75,
            y: 40,
            filter: 'blur(10px)',
            transition: { duration: 0.2 },
          }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-full max-w-lg rounded-[36px] p-6 sm:p-9 shadow-[0_0_90px_rgba(234,179,8,0.35),0_30px_70px_-15px_rgba(0,0,0,0.95)] backdrop-blur-3xl text-slate-100 overflow-hidden my-auto border border-amber-400/40 bg-gradient-to-b from-[#131124]/95 via-[#0b0c16]/98 to-[#05060c]"
        >
          {/* Animated Rainbow / Gold Border Shimmer */}
          <div
            className="absolute -inset-[2px] rounded-[38px] -z-10 opacity-80 blur-[4px] pointer-events-none animate-pulse"
            style={{
              background:
                'linear-gradient(135deg, rgba(234, 179, 8, 0.9) 0%, rgba(168, 85, 247, 0.9) 35%, rgba(56, 189, 248, 0.8) 70%, rgba(236, 72, 153, 0.8) 100%)',
            }}
          />

          {/* Holographic Dynamic Shine Layer */}
          <div
            className="absolute inset-0 pointer-events-none rounded-[36px] transition-opacity duration-200"
            style={{
              background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255, 255, 255, 0.16) 0%, rgba(234, 179, 8, 0.08) 40%, transparent 70%)`,
            }}
          />

          {/* Close button */}
          <button
            id="auth-celebration-close-btn"
            onClick={() => {
              playSound('click', soundEnabled);
              onClose();
            }}
            aria-label="Dismiss Welcome Banner"
            className="absolute top-4 right-4 p-2.5 rounded-full text-slate-400 hover:text-white bg-white/5 hover:bg-white/15 border border-white/10 transition-all cursor-pointer z-30 shadow-lg"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Cyber Corner Accents */}
          <div className="absolute top-3.5 left-3.5 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-400 rounded-tl pointer-events-none" />
          <div className="absolute top-3.5 right-3.5 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 rounded-tr pointer-events-none" />
          <div className="absolute bottom-3.5 left-3.5 w-3.5 h-3.5 border-b-2 border-l-2 border-purple-400 rounded-bl pointer-events-none" />
          <div className="absolute bottom-3.5 right-3.5 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-400 rounded-br pointer-events-none" />

          {/* Top Gold Glowing Laser Trim */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_20px_rgba(251,191,36,1)]" />

          {/* Main Content Area */}
          <div className="space-y-6 text-center relative z-10 pt-2">
            {/* 3D Animated Hero Crest / Badge */}
            <div className="relative inline-flex items-center justify-center">
              {/* Rotating Outer Cyber Rings */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-4 rounded-full border border-dashed border-amber-400/40 pointer-events-none"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-7 rounded-full border border-dotted border-purple-500/30 pointer-events-none"
              />

              {/* Glowing Pulse Aura */}
              <div className="absolute -inset-5 rounded-3xl bg-gradient-to-tr from-amber-500 via-purple-600 to-cyan-400 opacity-60 blur-xl animate-pulse" />

              {/* Central Metallic 3D Shield */}
              <motion.div
                initial={{ scale: 0.3, rotate: -25 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.15 }}
                className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-3xl bg-gradient-to-tr from-amber-400 via-purple-500 to-indigo-600 p-[2.5px] shadow-[0_0_35px_rgba(251,191,36,0.6)] flex items-center justify-center"
              >
                <div className="w-full h-full rounded-[21px] bg-[#090b16] flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.45),transparent_75%)]" />
                  
                  {isRegister ? (
                    <Sparkles className="w-10 h-10 sm:w-11 sm:h-11 text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)] animate-pulse" />
                  ) : (
                    <ShieldCheck className="w-10 h-10 sm:w-11 sm:h-11 text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
                  )}

                  {/* Shimmer Glint Sweep */}
                  <motion.div
                    animate={{ x: [-90, 90] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.8 }}
                    className="absolute inset-0 w-10 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                  />
                </div>
              </motion.div>
            </div>

            {/* Title & Personalized Greeting */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-950/80 via-purple-950/80 to-black border border-amber-500/50 text-[10px] sm:text-[11px] font-mono tracking-widest text-amber-300 uppercase shadow-inner">
                <Crown className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                <span>{isRegister ? 'COLLECTOR ACCESS ACTIVATED' : 'QUANTUM ACCESS GRANTED'}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)] animate-pulse" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-tech font-black text-white tracking-tight leading-tight">
                {isRegister ? (
                  <>
                    <span>Welcome to </span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-purple-300 to-cyan-300">
                      RAWAT CARD STORE
                    </span>
                  </>
                ) : (
                  <>
                    <span>Welcome Back, </span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-purple-300 to-cyan-300">
                      @{user.username}
                    </span>
                  </>
                )}
              </h2>

              <p className="text-xs sm:text-sm font-mono text-slate-300 max-w-sm mx-auto leading-relaxed">
                {isRegister
                  ? `Your VIP Collector profile has been initialized with 256-bit encrypted Vault access.`
                  : `Your identity has been verified in real-time. Your Private Vault and active cards are unlocked.`}
              </p>
            </div>

            {/* Feature Perks & Status Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left pt-1">
              {/* Perk 1: Vault Status */}
              <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 flex items-center gap-3 backdrop-blur-md">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                  <Unlock className="w-4 h-4 text-purple-300" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Private Vault</div>
                  <div className="text-xs font-tech font-bold text-white truncate flex items-center gap-1.5">
                    <span>Activated & Ready</span>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                </div>
              </div>

              {/* Perk 2: Wallet & Balance */}
              <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 flex items-center gap-3 backdrop-blur-md">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Wallet className="w-4 h-4 text-amber-300" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Wallet Balance</div>
                  <div className="text-xs font-tech font-bold text-amber-300 truncate">
                    {formatPrice(userBalance)}
                    {data.bonusGranted && (
                      <span className="ml-1 text-[10px] text-emerald-400 font-mono font-normal">(+₹50 Bonus)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Perk 3: Membership Tier */}
              <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 flex items-center gap-3 backdrop-blur-md">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <Crown className="w-4 h-4 text-cyan-300" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">VIP Membership</div>
                  <div className="text-xs font-tech font-bold text-cyan-300 truncate">
                    {user.membershipTier || 'ROYAL NOIR'}
                  </div>
                </div>
              </div>

              {/* Perk 4: Security Encryption */}
              <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 flex items-center gap-3 backdrop-blur-md">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Security Engine</div>
                  <div className="text-xs font-tech font-bold text-emerald-300 truncate">
                    256-Bit Quantum
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                id="celebration-enter-vault-btn"
                onClick={handleEnterVault}
                className="w-full sm:flex-1 h-12 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-tech font-bold text-sm tracking-wider uppercase shadow-[0_0_30px_rgba(147,51,234,0.5)] transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 border border-white/20"
              >
                <Layers className="w-4 h-4" />
                <span>ENTER VAULT</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="celebration-explore-store-btn"
                onClick={handleEnterStore}
                className="w-full sm:w-auto px-6 h-12 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white font-tech font-bold text-sm tracking-wider uppercase border border-white/15 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>EXPLORE STORE</span>
              </button>
            </div>

            {/* Auto-Dismiss Progress Bar & Timer */}
            <div className="space-y-1.5 pt-1">
              <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 via-purple-500 to-cyan-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Auto-entering in a few seconds...</span>
                <button
                  onClick={() => {
                    playSound('click', soundEnabled);
                    onClose();
                  }}
                  className="text-amber-400/80 hover:text-amber-300 underline cursor-pointer"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
