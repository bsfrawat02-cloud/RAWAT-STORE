import React from 'react';
import { CardProduct } from '../../types';
import { ShieldCheck, Sparkles, QrCode } from 'lucide-react';
import { getRarityConfig } from '../../utils/rarity';

interface AcrylicGradingSlabProps {
  card: CardProduct;
  children: React.ReactNode;
  isEncased: boolean;
  onToggleEncase?: () => void;
  className?: string;
}

export const AcrylicGradingSlab: React.FC<AcrylicGradingSlabProps> = ({
  card,
  children,
  isEncased,
  onToggleEncase,
  className = '',
}) => {
  if (!isEncased) {
    return <>{children}</>;
  }

  const rarity = getRarityConfig(card.rarity);
  const gradeScore = card.rarity === 'mythic' ? 'PRISTINE 10' : card.rarity === 'legendary' ? 'GEM MINT 10' : 'MINT 9.5';
  const certNumber = `RGA-${(card.id.length * 89231 + 104928).toString().slice(0, 8)}`;

  return (
    <div
      className={`relative p-3.5 sm:p-5 rounded-3xl border-2 border-white/20 bg-gradient-to-b from-white/10 via-white/[0.03] to-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(255,255,255,0.06),inset_0_1px_2px_rgba(255,255,255,0.5),inset_0_-1px_2px_rgba(255,255,255,0.2)] backdrop-blur-md group transition-all duration-300 ${className}`}
      style={{
        boxShadow: '0 30px 70px -10px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(255,255,255,0.25), inset 0 2px 4px rgba(255,255,255,0.4)',
      }}
    >
      {/* 4 Corner Brass Magnetic Assembly Pins */}
      <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 shadow-[0_0_4px_rgba(212,175,55,0.8)] border border-black/40" />
      <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 shadow-[0_0_4px_rgba(212,175,55,0.8)] border border-black/40" />
      <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 shadow-[0_0_4px_rgba(212,175,55,0.8)] border border-black/40" />
      <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 shadow-[0_0_4px_rgba(212,175,55,0.8)] border border-black/40" />

      {/* Top Acrylic Grading Label Header (PSA/BGS Style) */}
      <div className="mb-3 rounded-xl overflow-hidden border border-amber-500/40 bg-gradient-to-r from-zinc-950 via-[#141208] to-zinc-950 shadow-md p-2 font-mono relative">
        {/* Holographic Security Micro-Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-300 via-purple-300 via-cyan-300 to-amber-300 animate-foil opacity-80" />

        <div className="flex items-center justify-between gap-2 pt-1 text-[9px] sm:text-[10px]">
          <div className="flex items-center gap-1.5">
            <div className="h-5 w-5 rounded bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-brand font-black text-amber-300 tracking-wider text-[10px] sm:text-[11px] leading-tight">
                RAWAT GRADING AUTHORITY
              </p>
              <p className="text-[8px] text-zinc-400 font-mono tracking-widest">
                CERTIFIED AUTHENTIC &bull; {certNumber}
              </p>
            </div>
          </div>

          {/* Grade Badge */}
          <div className="bg-gradient-to-br from-amber-500/30 to-amber-900/40 border border-amber-400/60 rounded px-2 py-0.5 text-center shrink-0 shadow-inner">
            <p className="text-[7px] text-amber-300/80 font-bold uppercase tracking-wider">GRADE</p>
            <p className="font-tech font-black text-amber-300 text-xs sm:text-sm tracking-tight leading-none">
              {gradeScore}
            </p>
          </div>
        </div>

        {/* Sub-line metadata */}
        <div className="mt-1 pt-1 border-t border-white/10 flex items-center justify-between text-[8px] text-zinc-400">
          <span className="truncate max-w-[170px] uppercase font-semibold text-zinc-300">
            {card.name} &bull; {card.edition}
          </span>
          <span className="text-amber-400 font-bold tracking-wider">
            {rarity.label.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Card Body Container Inside Slab */}
      <div className="relative rounded-2xl overflow-hidden shadow-inner">
        {children}
      </div>

      {/* Bottom Frosted Bevel Highlight */}
      <div className="mt-2.5 flex items-center justify-between px-1 text-[8px] font-mono text-zinc-400">
        <span className="flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-amber-400" />
          <span className="text-[8px] text-zinc-400 tracking-widest uppercase">PSA 10 PROTECTED SLAB</span>
        </span>
        <span className="text-zinc-500 tracking-tighter">TAMPER-PROOF UV SEAL</span>
      </div>
    </div>
  );
};
