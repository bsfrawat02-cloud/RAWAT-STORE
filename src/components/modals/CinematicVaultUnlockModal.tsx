import React, { useState, useEffect } from 'react';
import { CardProduct } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Realistic3DCard } from '../cards/Realistic3DCard';
import { playSound } from '../../utils/audio';
import { getRarityConfig } from '../../utils/rarity';
import {
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  Share2,
  X,
  Shield,
  Layers,
  Award,
  Crown,
  Flame,
  ArrowRight
} from 'lucide-react';

interface CinematicVaultUnlockModalProps {
  card: CardProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToVault?: () => void;
}

export const CinematicVaultUnlockModal: React.FC<CinematicVaultUnlockModalProps> = ({
  card,
  isOpen,
  onClose,
  onNavigateToVault,
}) => {
  const { soundEnabled, setActiveTab } = useStore();
  const [phase, setPhase] = useState<'locked' | 'unlocking' | 'revealed'>('locked');
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  useEffect(() => {
    if (isOpen && card) {
      setPhase('locked');
      setIsCardFlipped(false);
      playSound('vault_unsealed', soundEnabled);

      // Transition to unlocking phase after 600ms
      const t1 = setTimeout(() => {
        setPhase('unlocking');
        playSound('gold_chime', soundEnabled);
      }, 700);

      // Auto-reveal after suspense or wait for click
      const t2 = setTimeout(() => {
        setPhase('revealed');
        playSound('prismatic_glint', soundEnabled);
      }, 2000);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [isOpen, card, soundEnabled]);

  if (!isOpen || !card) return null;

  const rarity = getRarityConfig(card.rarity);

  const handleRevealClick = () => {
    if (phase !== 'revealed') {
      setPhase('revealed');
      playSound('prismatic_glint', soundEnabled);
      playSound('gold_chime', soundEnabled);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300 overflow-y-auto"
    >
      {/* Background Cinematic Atmosphere & Light Beams */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Glowing Top-down Vault Spotlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-gradient-to-b from-amber-400/15 via-purple-500/10 to-transparent blur-3xl opacity-80" />
        
        {/* Floating Golden Embers */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.08)_0%,transparent_60%)]" />
      </div>

      {/* Main Modal Chamber */}
      <div className="relative w-full max-w-xl mx-auto flex flex-col items-center justify-center text-center z-10 py-6 sm:py-10">
        {/* Close Button */}
        <button
          onClick={() => {
            playSound('click', soundEnabled);
            onClose();
          }}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 h-9 w-9 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
          aria-label="Close unboxing ceremony"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Phase Header */}
        <div className="mb-6 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
            {phase === 'locked' ? (
              <>
                <Lock className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                <span>DISENGAGING VAULT HYDRAULICS...</span>
              </>
            ) : phase === 'unlocking' ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                <span>AUTHENTICATING MINTED LEDGER...</span>
              </>
            ) : (
              <>
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold tracking-wider">OFFICIAL VAULT UNSEALING COMPLETE</span>
              </>
            )}
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-tech">
            {phase === 'revealed' ? (
              <span className="gold-text-gradient font-brand">
                {card.name}
              </span>
            ) : (
              'High-Security Vault Unboxing'
            )}
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto font-mono">
            {phase === 'revealed'
              ? `Officially minted asset #${card.id.slice(-6).toUpperCase()} sealed with PSA Gem-Mint 10 Authenticity.`
              : 'Hold tight while the encrypted cryptographic seal is verified against the ledger.'}
          </p>
        </div>

        {/* Central 3D Card Stage with Vault Door Aura */}
        <div
          onClick={handleRevealClick}
          className="relative my-4 flex items-center justify-center cursor-pointer transition-transform duration-500 hover:scale-105"
        >
          {/* Circular Vault Mechanism Wheel Glow */}
          <div
            className={`absolute -inset-10 rounded-full border border-amber-500/20 bg-gradient-to-tr from-amber-500/10 via-purple-500/10 to-transparent blur-xl transition-all duration-1000 ${
              phase === 'revealed' ? 'scale-125 opacity-100' : 'scale-95 opacity-50'
            }`}
          />

          {/* Interactive Card Presentation */}
          <div className="relative z-10">
            <Realistic3DCard
              card={card}
              size="hero"
              showFlipButton={true}
              interactiveTilt={true}
              initialEncased={true}
              allowSlabToggle={true}
              simulationPerspective="owned"
            />
          </div>
        </div>

        {/* Revealed Action Controls */}
        {phase === 'revealed' && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={() => {
                playSound('gold_chime', soundEnabled);
                onClose();
                if (onNavigateToVault) {
                  onNavigateToVault();
                } else {
                  setActiveTab('vault');
                }
              }}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-black font-tech font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Inspect in 3D Vault Pedestal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                playSound('acrylic_snap', soundEnabled);
                onClose();
              }}
              className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white font-mono text-xs border border-white/10 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
