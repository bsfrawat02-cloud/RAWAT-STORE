import React, { useState, useRef } from 'react';
import { CardProduct, CardFinish, HolographicOverlayType } from '../../types';
import { Sparkles, Shield, RotateCw, Wifi, Flame, Crown, Gem, Layers } from 'lucide-react';
import { playSound } from '../../utils/audio';
import { useStore } from '../../context/StoreContext';
import { CardNetworkLogo } from './CardNetworkLogo';
import { getRarityConfig } from '../../utils/rarity';
import { RarityBadge } from './RarityBadge';
import { HolographicOverlay } from './HolographicOverlay';
import { AcrylicGradingSlab } from './AcrylicGradingSlab';
import { ShieldCheck, Box } from 'lucide-react';

interface Realistic3DCardProps {
  card: CardProduct;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showFlipButton?: boolean;
  interactiveTilt?: boolean;
  autoAnimate?: boolean;
  className?: string;
  isOwned?: boolean;
  overlay?: HolographicOverlayType;
  overlayIntensity?: number;
  activeScanAnimation?: boolean;
  simulationPerspective?: 'unowned' | 'owned';
  allowSlabToggle?: boolean;
  initialEncased?: boolean;
  onClick?: () => void;
}

export const Realistic3DCard: React.FC<Realistic3DCardProps> = ({
  card,
  size = 'md',
  showFlipButton = true,
  interactiveTilt = true,
  autoAnimate = false,
  className = '',
  isOwned = false,
  overlay,
  overlayIntensity = 0.85,
  activeScanAnimation = false,
  simulationPerspective,
  allowSlabToggle = true,
  initialEncased = false,
  onClick
}) => {
  const { soundEnabled } = useStore();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEncasedInSlab, setIsEncasedInSlab] = useState(initialEncased);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [sheenPosition, setSheenPosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut to flip card on Space or F
  React.useEffect(() => {
    if (!isHovered) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key.toLowerCase() === 'f') {
        e.preventDefault();
        playSound('flip', soundEnabled);
        setIsFlipped((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHovered, soundEnabled]);

  const toggleSlab = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('acrylic_snap', soundEnabled);
    setIsEncasedInSlab((prev) => !prev);
  };

  const effectiveIsOwned = simulationPerspective !== undefined ? simulationPerspective === 'owned' : isOwned;
  const effectiveOverlay: HolographicOverlayType = overlay !== undefined
    ? overlay
    : card.holographicOverlay || (card.finish === 'iridescent' ? 'prism_rainbow' : 'none');

  const rarityConfig = getRarityConfig(card.rarity);

  // Size mapping with accurate credit-card ratio
  const sizeClasses = {
    sm: 'w-[240px] h-[151px] text-[10px] rounded-xl p-3 max-w-full',
    md: 'w-[275px] h-[173px] sm:w-[330px] sm:h-[208px] text-xs rounded-2xl p-3.5 sm:p-4 max-w-full',
    lg: 'w-[290px] h-[183px] sm:w-[380px] sm:h-[239px] text-xs rounded-2xl p-4 sm:p-5 sm:text-sm max-w-full',
    hero: 'w-[275px] h-[173px] sm:w-[400px] sm:h-[252px] md:w-[450px] md:h-[284px] text-xs sm:text-sm rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 max-w-full',
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactiveTilt || isFlipped || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -12;
    const rY = ((x - centerX) / centerX) * 12;

    setRotateX(rX);
    setRotateY(rY);
    setSheenPosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!interactiveTilt || isFlipped || !cardRef.current || e.touches.length === 0) return;
    const rect = cardRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = Math.max(-12, Math.min(12, ((y - centerY) / centerY) * -10));
    const rY = Math.max(-12, Math.min(12, ((x - centerX) / centerX) * 10));

    setRotateX(rX);
    setRotateY(rY);
    setSheenPosition({
      x: Math.max(0, Math.min(100, (x / rect.width) * 100)),
      y: Math.max(0, Math.min(100, (y / rect.height) * 100)),
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setSheenPosition({ x: 50, y: 50 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    playSound('hover', soundEnabled);
  };

  const toggleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('flip', soundEnabled);
    setIsFlipped(!isFlipped);
  };

  // Luxury visual themes according to finish
  const getThemeStyles = (finish: CardFinish) => {
    switch (finish) {
      case 'gold':
        return {
          bg: 'bg-gradient-to-br from-[#2a1d05] via-[#45310b] to-[#1a1202]',
          border: 'border-amber-400/40',
          accent: 'text-amber-300',
          chip: 'bg-gradient-to-tr from-amber-600 to-yellow-300 border-amber-300',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          shadow: 'shadow-[0_20px_50px_rgba(234,179,8,0.18)]',
        };
      case 'platinum':
        return {
          bg: 'bg-gradient-to-br from-[#0c121e] via-[#1a2333] to-[#080d17]',
          border: 'border-sky-300/40',
          accent: 'text-sky-200',
          chip: 'bg-gradient-to-tr from-slate-400 to-sky-200 border-sky-200',
          badge: 'bg-sky-500/20 text-sky-200 border-sky-400/40',
          shadow: 'shadow-[0_20px_50px_rgba(56,189,248,0.18)]',
        };
      case 'amethyst':
        return {
          bg: 'bg-gradient-to-br from-[#1a0826] via-[#2d0e40] to-[#0d0214]',
          border: 'border-purple-400/50',
          accent: 'text-purple-200',
          chip: 'bg-gradient-to-tr from-purple-700 to-pink-300 border-purple-300',
          badge: 'bg-purple-500/25 text-purple-200 border-purple-400/40',
          shadow: 'shadow-[0_20px_50px_rgba(168,85,247,0.22)]',
        };
      case 'emerald':
        return {
          bg: 'bg-gradient-to-br from-[#031d14] via-[#083324] to-[#02110c]',
          border: 'border-emerald-400/40',
          accent: 'text-emerald-300',
          chip: 'bg-gradient-to-tr from-emerald-600 to-teal-200 border-emerald-300',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          shadow: 'shadow-[0_20px_50px_rgba(16,185,129,0.18)]',
        };
      case 'rose_gold':
        return {
          bg: 'bg-gradient-to-br from-[#280d15] via-[#3d1622] to-[#16060c]',
          border: 'border-rose-300/40',
          accent: 'text-rose-200',
          chip: 'bg-gradient-to-tr from-rose-600 to-orange-200 border-rose-300',
          badge: 'bg-rose-500/20 text-rose-200 border-rose-400/40',
          shadow: 'shadow-[0_20px_50px_rgba(251,113,133,0.18)]',
        };
      case 'carbon':
        return {
          bg: 'bg-gradient-to-br from-[#0b0c10] via-[#14161f] to-[#07080b]',
          border: 'border-cyan-500/40',
          accent: 'text-cyan-300',
          chip: 'bg-gradient-to-tr from-zinc-700 to-cyan-300 border-cyan-400',
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
          shadow: 'shadow-[0_20px_50px_rgba(6,182,212,0.18)]',
        };
      case 'obsidian':
      default:
        return {
          bg: 'bg-gradient-to-br from-[#09090e] via-[#12121c] to-[#050508]',
          border: 'border-purple-500/35',
          accent: 'text-purple-300',
          chip: 'bg-gradient-to-tr from-zinc-600 to-purple-300 border-zinc-500',
          badge: 'bg-purple-950/60 text-purple-300 border-purple-500/30',
          shadow: 'shadow-[0_20px_50px_rgba(147,51,234,0.18)]',
        };
    }
  };

  const theme = getThemeStyles(card.finish);

  // Rarity glow border and aura classes
  const rarityBorderClass = card.rarity === 'Legendary'
    ? 'border-amber-400/90 shadow-[0_0_32px_rgba(251,191,36,0.5)]'
    : card.rarity === 'Mythic'
    ? 'border-rose-500/90 shadow-[0_0_32px_rgba(244,63,94,0.5)]'
    : card.rarity === 'Epic'
    ? 'border-purple-400/80 shadow-[0_0_24px_rgba(192,132,252,0.4)]'
    : card.rarity === 'Rare'
    ? 'border-sky-400/75 shadow-[0_0_20px_rgba(56,189,248,0.35)]'
    : 'border-slate-500/50 shadow-[0_0_14px_rgba(148,163,184,0.2)]';

  return (
    <div
      className={`relative select-none perspective-[1200px] cursor-pointer group ${className}`}
      onClick={onClick}
    >
      <AcrylicGradingSlab card={card} isEncased={isEncasedInSlab}>
        {/* Outer Rarity Ambient Aura Glow (Pulsing halo behind the 3D card) */}
        <div
          className={`absolute -inset-2 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-xl bg-gradient-to-tr ${rarityConfig.cardAuraClass}`}
        />

        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`relative ${sizeClasses[size]} preserve-3d transition-transform duration-200 ease-out ${
            autoAnimate ? 'animate-pulse' : ''
          }`}
          style={{
            transform: isFlipped
              ? 'rotateY(180deg)'
              : `rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${isHovered ? 'scale3d(1.02, 1.02, 1.02)' : 'scale3d(1, 1, 1)'}`,
          }}
        >
        {/* FRONT OF THE CARD */}
        <div
          className={`absolute inset-0 backface-hidden rounded-[inherit] ${theme.bg} border-2 ${rarityBorderClass} ${theme.shadow} overflow-hidden flex flex-col justify-between p-4 sm:p-5`}
        >
          {/* Dynamic Specular Sheen / Light Reflection */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle 220px at ${sheenPosition.x}% ${sheenPosition.y}%, rgba(255, 255, 255, 0.22), transparent 75%)`,
              opacity: isHovered ? 1 : 0.25,
            }}
          />

          {/* Active Holographic Overlay Shader */}
          <HolographicOverlay
            overlay={effectiveOverlay}
            sheenPosition={sheenPosition}
            intensity={overlayIntensity}
            isHovered={isHovered}
            activeScanAnimation={activeScanAnimation}
          />

          {/* Rarity Holographic Edge Shimmer Overlay */}
          {card.rarity === 'Legendary' && effectiveOverlay === 'none' && (
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-amber-500/10 via-yellow-300/5 to-transparent opacity-60 mix-blend-screen" />
          )}

          {/* Micro-texture Pattern */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-grid-pattern mix-blend-overlay" />

          {/* Top Row: Brand, Rarity Badge & WiFi */}
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 border border-purple-400 rotate-45 flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-full" />
                  </div>
                </div>
                <div>
                  <h3 className="font-brand font-bold tracking-[0.18em] text-white text-xs sm:text-sm leading-tight">
                    RAWAT CARD STORE
                  </h3>
                  <p className="text-[8px] sm:text-[9px] tracking-widest text-zinc-400 font-medium">
                    DIGITAL VAULT
                  </p>
                </div>
              </div>
            </div>

            {/* Top Right: Rarity Indicator Badge + Tier & NFC */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <RarityBadge
                rarity={card.rarity || 'Rare'}
                size={size === 'sm' ? 'xs' : 'sm'}
                showGlow={isHovered}
              />
              <span
                className={`hidden sm:inline-block px-2 py-0.5 rounded-full text-[9px] font-mono tracking-wider border uppercase backdrop-blur-md font-semibold ${theme.badge}`}
              >
                {card.tier}
              </span>
              <Wifi className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/60 rotate-90 shrink-0" />
            </div>
          </div>

          {/* Middle Row: Gold Chip & Holographic Insignia */}
          <div className="relative z-10 flex items-center justify-between my-auto py-1">
            {/* Realistic EMV Smart Chip */}
            <div className="relative">
              <div
                className={`w-9 h-7 sm:w-11 sm:h-9 rounded-md border ${theme.chip} p-0.5 shadow-inner overflow-hidden flex flex-col justify-between`}
              >
                <div className="h-full w-full border border-black/30 rounded-sm relative grid grid-cols-2 grid-rows-3 gap-[1px] bg-black/10">
                  <div className="border-r border-b border-black/20" />
                  <div className="border-b border-black/20" />
                  <div className="border-r border-b border-black/20" />
                  <div className="border-b border-black/20" />
                  <div className="border-r border-b border-black/20" />
                  <div className="" />
                </div>
              </div>
            </div>

            {/* Holographic Security Crest / Limit Tag */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/50 border border-white/15 backdrop-blur-md shadow-sm">
              <Sparkles className={`w-3 h-3 ${theme.accent} animate-pulse`} />
              <span className="font-mono text-[9px] tracking-wider text-zinc-300 uppercase font-semibold">
                LIMIT: ₹{(card.limit || (card.price ? Math.round(card.price * 12) : 6500)).toLocaleString('en-IN')}
              </span>
              {card.price && (card.limit || Math.round(card.price * 12)) >= card.price * 10 && (
                <span className="text-[8px] font-mono font-black text-amber-300 bg-amber-950/80 px-1 py-0.2 rounded border border-amber-500/30">
                  {Math.round((card.limit || Math.round(card.price * 12)) / card.price)}X+
                </span>
              )}
            </div>
          </div>

          {/* Bottom Row: Card Number, Name & Status */}
          <div className="relative z-10 space-y-1 sm:space-y-1.5">
            {/* Card Number Display (Unmasked if owned, Masked if preview) */}
            <div className="flex items-center justify-between font-mono tracking-[0.16em] sm:tracking-[0.22em] text-white/95 text-xs sm:text-sm font-semibold drop-shadow">
              <span>
                {effectiveIsOwned
                  ? (card.cardNumber || card.maskedIdentifier || '4532 8912 3456 4821')
                  : (card.maskedIdentifier || '•••• •••• •••• 4821')}
              </span>
            </div>

            <div className="flex items-end justify-between pt-1 border-t border-white/10">
              <div>
                <p className="text-[7px] sm:text-[8px] uppercase tracking-wider text-zinc-400 font-mono">
                  CARDHOLDER / ASSET
                </p>
                <p className="font-tech font-bold text-white text-[10px] sm:text-xs tracking-wider truncate max-w-[130px] sm:max-w-[170px]">
                  {card.cardHolder || card.name}
                </p>
                <p className="text-[7px] sm:text-[8px] font-mono text-zinc-400 mt-0.5">
                  VALID THRU {card.expDate || '**/**'}
                </p>
              </div>

              {/* Right Side: Network Brand Logo & Status */}
              <div className="flex flex-col items-end justify-end gap-1">
                <div className="flex items-center gap-1 justify-end">
                  <Shield className="w-2.5 h-2.5 text-emerald-400" />
                  <span className="text-[7px] sm:text-[8px] font-mono text-emerald-400 font-medium uppercase tracking-wider">
                    {effectiveIsOwned ? 'COLLECTED' : 'AVAILABLE'}
                  </span>
                </div>
                <div className="pt-0.5 flex items-center justify-end">
                  <CardNetworkLogo
                    network={card.network || 'RAWAT'}
                    size={size === 'hero' || size === 'lg' ? 'md' : 'sm'}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BACK OF THE CARD */}
        <div
          className={`absolute inset-0 backface-hidden rotate-y-180 rounded-[inherit] ${theme.bg} border-2 ${rarityBorderClass} ${theme.shadow} overflow-hidden flex flex-col justify-between py-4`}
        >
          {/* Top Magnetic Stripe */}
          <div>
            <div className="w-full h-8 sm:h-10 bg-black/90 border-y border-white/10 shadow-inner flex items-center px-4 justify-between">
              <span className="text-[7px] font-mono text-zinc-500 tracking-widest uppercase">
                RAWAT CARD STORE ENCRYPTED VAULT
              </span>
              <span className="text-[7px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
                {rarityConfig.label}
              </span>
            </div>
          </div>

          {/* Middle: Signature Strip & CVV (Revealed if owned, masked otherwise) */}
          <div className="px-4 sm:px-5 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 h-7 sm:h-8 bg-zinc-200/90 rounded px-2 flex items-center justify-between text-zinc-900">
                <span className="font-brand italic text-[9px] sm:text-[10px] tracking-wider font-bold">
                  {card.cardHolder || 'Rawat Digital Vault'}
                </span>
                <span className="font-mono text-[8px] tracking-widest text-zinc-500 uppercase">
                  {effectiveIsOwned ? 'OWNED ASSET' : 'AUTHORIZED ASSET'}
                </span>
              </div>
              <div className="bg-black/60 border border-white/20 px-2 py-1.5 rounded text-center">
                <p className="text-[6px] text-zinc-400 font-mono">CVV</p>
                <p className="font-mono font-bold text-white text-[9px] tracking-widest">
                  {effectiveIsOwned ? (card.cvv || '821') : '•••'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[7px] text-zinc-400 leading-tight">
              <span>Limit: ₹{(card.limit || (card.price ? Math.round(card.price * 12) : 6500)).toLocaleString('en-IN')}</span>
              <span>PIN: {effectiveIsOwned ? (card.cardPin || '4821') : '••••'}</span>
            </div>
          </div>

          {/* Bottom Back: Hologram Strip & RAWAT Insignia */}
          <div className="px-4 sm:px-5 flex items-center justify-between border-t border-white/10 pt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-white/20 border border-white/40 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
              <span className="font-brand text-[9px] font-bold tracking-widest text-white">
                RAWAT VAULT
              </span>
            </div>

            <div className="flex items-center gap-2">
              <CardNetworkLogo network={card.network || 'RAWAT'} size="xs" />
              <span className="font-mono text-[8px] text-zinc-400 tracking-wider">
                {card.edition}
              </span>
            </div>
          </div>
        </div>
        </div>
      </AcrylicGradingSlab>

      {/* Quick Action Controls: SLAB Toggle & 360 FLIP */}
      <div className="absolute -bottom-2.5 right-2 sm:bottom-2 sm:right-2 z-20 flex items-center gap-1.5 pointer-events-auto">
        {allowSlabToggle !== false && (
          <button
            onClick={toggleSlab}
            title={isEncasedInSlab ? 'Uncase Card (Remove Slab)' : 'Encase in PSA 10 Acrylic Grading Slab'}
            className={`p-1.5 sm:p-2 rounded-full border backdrop-blur-md shadow-lg transition-all duration-150 active:scale-95 flex items-center gap-1 text-[10px] cursor-pointer ${
              isEncasedInSlab
                ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-amber-500/30 ring-1 ring-amber-400/40'
                : 'bg-zinc-900/90 border-white/20 text-zinc-400 hover:text-white hover:border-amber-400/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline font-mono text-[9px] font-bold">SLAB</span>
          </button>
        )}
        {showFlipButton && (
          <button
            onClick={toggleFlip}
            title="360° Double-Sided Inspection (or press Space / F)"
            className="p-1.5 sm:p-2 rounded-full bg-zinc-900/90 border border-white/20 hover:border-purple-500 text-zinc-300 hover:text-white backdrop-blur-md shadow-lg transition-all duration-150 active:scale-95 flex items-center gap-1 text-[10px] cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-mono text-[9px] font-bold">FLIP</span>
          </button>
        )}
      </div>
    </div>
  );
};
