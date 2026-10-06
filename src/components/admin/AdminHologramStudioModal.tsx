import React, { useState } from 'react';
import { CardProduct, HolographicOverlayType } from '../../types';
import { Realistic3DCard } from '../cards/Realistic3DCard';
import { RarityBadge } from '../cards/RarityBadge';
import { HOLOGRAM_CONFIGS, ALL_HOLOGRAMS, getHologramConfig } from '../../utils/hologram';
import { playSound } from '../../utils/audio';
import {
  X,
  Sparkles,
  Zap,
  Moon,
  Crown,
  Cpu,
  Droplets,
  Gem,
  Flame,
  Radio,
  Layers,
  Eye,
  Sliders,
  Check,
  RotateCw,
  Sun,
  Shield,
  Lock,
  Unlock,
  Save,
  HelpCircle
} from 'lucide-react';

interface AdminHologramStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardProduct | null;
  onSaveCardOverlay?: (cardId: string, overlay: HolographicOverlayType) => Promise<void> | void;
  soundEnabled?: boolean;
}

export const AdminHologramStudioModal: React.FC<AdminHologramStudioModalProps> = ({
  isOpen,
  onClose,
  card,
  onSaveCardOverlay,
  soundEnabled = true,
}) => {
  if (!isOpen || !card) return null;

  const [activeOverlay, setActiveOverlay] = useState<HolographicOverlayType>(
    card.holographicOverlay || 'prism_rainbow'
  );
  const [intensity, setIntensity] = useState<number>(0.85);
  const [perspective, setPerspective] = useState<'unowned' | 'owned'>('unowned');
  const [activeScan, setActiveScan] = useState<boolean>(true);
  const [environment, setEnvironment] = useState<'void' | 'grid' | 'vault' | 'cyber'>('void');
  const [cardScale, setCardScale] = useState<'md' | 'lg' | 'hero'>('lg');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currentConfig = getHologramConfig(activeOverlay);

  const getOverlayIcon = (type: HolographicOverlayType) => {
    switch (type) {
      case 'prism_rainbow':
        return <Sparkles className="w-4 h-4 text-sky-400" />;
      case 'quantum_laser':
        return <Zap className="w-4 h-4 text-cyan-400" />;
      case 'cosmic_starlight':
        return <Moon className="w-4 h-4 text-purple-400" />;
      case 'hyper_gold_foil':
        return <Crown className="w-4 h-4 text-amber-400" />;
      case 'obsidian_circuit':
        return <Cpu className="w-4 h-4 text-fuchsia-400" />;
      case 'iridescent_liquid':
        return <Droplets className="w-4 h-4 text-teal-400" />;
      case 'amethyst_flare':
        return <Gem className="w-4 h-4 text-pink-400" />;
      case 'emerald_aurora':
        return <Flame className="w-4 h-4 text-emerald-400" />;
      case 'glitch_hologram':
        return <Radio className="w-4 h-4 text-rose-400" />;
      case 'none':
      default:
        return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleSave = async () => {
    if (!onSaveCardOverlay) return;
    setIsSaving(true);
    try {
      await onSaveCardOverlay(card.id, activeOverlay);
      playSound('success', soundEnabled);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to save card overlay:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Environment backdrop styles
  const getEnvBg = () => {
    switch (environment) {
      case 'grid':
        return 'bg-grid-pattern bg-[#090b14]';
      case 'vault':
        return 'bg-gradient-to-b from-[#1c1407] via-[#0d0903] to-black border-amber-500/20';
      case 'cyber':
        return 'bg-gradient-to-tr from-[#16021f] via-[#080d1e] to-black border-cyan-500/20';
      case 'void':
      default:
        return 'bg-gradient-to-b from-black via-zinc-950 to-black';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-40 cursor-pointer"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-6xl rounded-3xl border border-white/20 bg-[#07080d] shadow-2xl backdrop-blur-2xl z-50 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                  Holographic Inspector Studio
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[9px] font-mono font-bold">
                  ADMIN LIVE PREVIEW
                </span>
              </div>
              <h2 className="text-xl font-bold font-tech text-white flex items-center gap-2">
                <span>{card.name}</span>
                <span className="text-xs font-mono text-slate-400 font-normal">({card.tier} Tier)</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onSaveCardOverlay && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Saved to Store!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Apply Overlay to Store</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Workspace Layout */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Interactive 3D Holographic Stage (7 Cols) */}
          <div className={`lg:col-span-7 rounded-3xl border border-white/10 p-6 flex flex-col justify-between items-center relative overflow-hidden min-h-[460px] ${getEnvBg()}`}>
            
            {/* Top Stage Badges & Perspective Pill */}
            <div className="w-full flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-black/60 border border-white/15 backdrop-blur-md text-[10px] font-mono font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: currentConfig.accentColor }} />
                  <span>{currentConfig.badge}</span>
                </span>
                <RarityBadge rarity={card.rarity || 'Epic'} size="sm" showGlow={true} />
              </div>

              {/* Perspective Simulator Toggle */}
              <div className="flex items-center p-1 rounded-xl bg-black/70 border border-white/15 backdrop-blur-md">
                <button
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setPerspective('unowned');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    perspective === 'unowned'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Preview as store customer before buying (Masked details, AVAILABLE status)"
                >
                  <Lock className="w-3 h-3" />
                  <span>Unowned User</span>
                </button>
                <button
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setPerspective('owned');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    perspective === 'owned'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Preview as vault owner after buying (Full 16 digits, CVV/PIN on flip)"
                >
                  <Unlock className="w-3 h-3" />
                  <span>Owner View</span>
                </button>
              </div>
            </div>

            {/* 3D Realistic Card with Active Hologram Shader */}
            <div className="py-6 flex items-center justify-center w-full my-auto z-10">
              <Realistic3DCard
                card={card}
                size={cardScale}
                interactiveTilt={true}
                showFlipButton={true}
                overlay={activeOverlay}
                overlayIntensity={intensity}
                activeScanAnimation={activeScan}
                simulationPerspective={perspective}
              />
            </div>

            {/* Bottom Interactive Guidance & Stage Environment Controls */}
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 z-10 pt-4 border-t border-white/10">
              <p className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
                <span>Move cursor to sweep holographic light • Click FLIP to inspect back</span>
              </p>

              {/* Environment presets */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Backdrop:</span>
                {[
                  { id: 'void', label: 'Void' },
                  { id: 'grid', label: 'Grid' },
                  { id: 'vault', label: 'Vault' },
                  { id: 'cyber', label: 'Cyber' },
                ].map((env) => (
                  <button
                    key={env.id}
                    onClick={() => setEnvironment(env.id as any)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                      environment === env.id
                        ? 'bg-white/20 text-white font-bold border border-white/30'
                        : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {env.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Holographic Overlay Palette & Tuning Controls (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Active Shader Bio Card */}
            <div
              className="p-4 rounded-2xl border bg-black/60 backdrop-blur-md space-y-2 transition-all"
              style={{ borderColor: `${currentConfig.accentColor}55` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="p-2 rounded-xl border flex items-center justify-center"
                    style={{
                      backgroundColor: `${currentConfig.accentColor}20`,
                      borderColor: `${currentConfig.accentColor}40`,
                    }}
                  >
                    {getOverlayIcon(activeOverlay)}
                  </div>
                  <div>
                    <h3 className="font-tech font-bold text-white text-base">
                      {currentConfig.name}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400">
                      {currentConfig.tagline}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-300 font-mono leading-relaxed pt-1">
                {currentConfig.description}
              </p>
            </div>

            {/* Holographic Overlays Selector Grid */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Select Holographic Overlay Effect</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ALL_HOLOGRAMS.map((holoId) => {
                  const cfg = HOLOGRAM_CONFIGS[holoId];
                  const isSelected = activeOverlay === holoId;
                  return (
                    <button
                      key={holoId}
                      onClick={() => {
                        playSound('click', soundEnabled);
                        setActiveOverlay(holoId);
                        setIntensity(cfg.defaultIntensity);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer relative overflow-hidden group ${
                        isSelected
                          ? 'bg-white/[0.08] text-white shadow-lg ring-1'
                          : 'bg-black/40 border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                      style={{
                        borderColor: isSelected ? cfg.accentColor : undefined,
                      }}
                    >
                      {/* Active Indicator Glow */}
                      {isSelected && (
                        <div
                          className="absolute -right-6 -bottom-6 w-16 h-16 rounded-full blur-xl pointer-events-none opacity-50"
                          style={{ backgroundColor: cfg.accentColor }}
                        />
                      )}

                      <div
                        className="p-1.5 rounded-lg border shrink-0 transition-transform group-hover:scale-110"
                        style={{
                          backgroundColor: `${cfg.accentColor}20`,
                          borderColor: `${cfg.accentColor}40`,
                        }}
                      >
                        {getOverlayIcon(holoId)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="font-tech font-bold text-xs truncate text-white">
                          {cfg.name}
                        </div>
                        <div className="text-[9px] font-mono text-slate-500 truncate">
                          {cfg.badge}
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 text-cyan-400 shrink-0 ml-auto" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fine-Tuning Sliders & Visual Controls */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-purple-400" />
                  <span>Optical & Shader Controls</span>
                </span>
                <span className="text-xs font-mono text-cyan-400 font-bold">
                  {Math.round(intensity * 100)}% Luminescence
                </span>
              </div>

              {/* Intensity Slider */}
              <div className="space-y-1.5">
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={intensity}
                  onChange={(e) => setIntensity(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>Subtle (20%)</span>
                  <span>Balanced (80%)</span>
                  <span>Hyper-Glow (100%)</span>
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeScan}
                    onChange={(e) => setActiveScan(e.target.checked)}
                    className="rounded bg-zinc-900 border-white/20 text-cyan-500 focus:ring-0"
                  />
                  <span className="text-xs font-mono text-slate-300 select-none">Light Sweep Beam</span>
                </label>

                {/* Card Scale Selector */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-xs font-mono text-slate-400">Scale:</span>
                  <div className="flex gap-1">
                    {(['md', 'lg', 'hero'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setCardScale(s)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                          cardScale === s ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Info note */}
            <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <p className="text-[11px] font-mono text-cyan-200/80 leading-relaxed">
                When you apply a holographic overlay, all store visitors and vault owners will experience this animated shader when inspecting or tilting this card.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
