import React from 'react';
import { HolographicOverlayType } from '../../types';
import { getHologramConfig } from '../../utils/hologram';

interface HolographicOverlayProps {
  overlay?: HolographicOverlayType;
  sheenPosition?: { x: number; y: number };
  intensity?: number; // 0 to 1
  isHovered?: boolean;
  activeScanAnimation?: boolean;
  className?: string;
}

export const HolographicOverlay: React.FC<HolographicOverlayProps> = ({
  overlay = 'none',
  sheenPosition = { x: 50, y: 50 },
  intensity = 0.85,
  isHovered = false,
  activeScanAnimation = false,
  className = '',
}) => {
  if (overlay === 'none') {
    return null;
  }

  const config = getHologramConfig(overlay);
  const effectiveOpacity = (isHovered ? 1 : 0.65) * intensity;

  return (
    <div
      className={`absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden transition-opacity duration-300 ${className}`}
      style={{ opacity: effectiveOpacity }}
    >
      {/* 1. Base Dynamic Spectral Hologram Layer */}
      <div
        className="absolute inset-0 transition-transform duration-100 ease-out"
        style={{
          background: config.gradientCss,
          mixBlendMode: config.blendMode,
          transform: `translate(${(sheenPosition.x - 50) * 0.15}%, ${(sheenPosition.y - 50) * 0.15}%) scale(1.05)`,
        }}
      />

      {/* 2. Interactive Specular Beam / Radial Spotlight */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle 180px at ${sheenPosition.x}% ${sheenPosition.y}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.15) 35%, transparent 75%)`,
          mixBlendMode: 'color-dodge',
        }}
      />

      {/* 3. Pattern Specific Shaders */}
      {/* PRISM RAINBOW PATTERN */}
      {config.foilPattern === 'prism' && (
        <div
          className="absolute inset-0 opacity-75 mix-blend-color-dodge"
          style={{
            backgroundImage: `repeating-linear-gradient(
              ${(sheenPosition.x * 2) - 50}deg,
              rgba(255, 0, 0, 0.2) 0px,
              rgba(255, 255, 0, 0.25) 15px,
              rgba(0, 255, 0, 0.2) 30px,
              rgba(0, 255, 255, 0.25) 45px,
              rgba(0, 0, 255, 0.2) 60px,
              rgba(255, 0, 255, 0.25) 75px,
              rgba(255, 0, 0, 0.2) 90px
            )`,
            backgroundSize: '300% 300%',
          }}
        />
      )}

      {/* QUANTUM LASER GRID PATTERN */}
      {config.foilPattern === 'laser' && (
        <div className="absolute inset-0 mix-blend-screen opacity-70">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(6,182,212,0.3) 1px, transparent 1px),
                                linear-gradient(to bottom, rgba(236,72,153,0.3) 1px, transparent 1px)`,
              backgroundSize: '16px 16px',
            }}
          />
          <div
            className="absolute inset-0 bg-gradient-to-tr from-cyan-400/30 via-transparent to-pink-500/30"
            style={{
              transform: `rotate(${sheenPosition.x * 0.5}deg)`,
            }}
          />
        </div>
      )}

      {/* COSMIC STARLIGHT SPARKS */}
      {config.foilPattern === 'starlight' && (
        <div className="absolute inset-0 mix-blend-screen opacity-85">
          {/* Stardust particles */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(1.5px 1.5px at 20px 30px, #ffffff, rgba(0,0,0,0)),
                                radial-gradient(1px 1px at 60px 75px, #fbcfe8, rgba(0,0,0,0)),
                                radial-gradient(2px 2px at 120px 45px, #fef08a, rgba(0,0,0,0)),
                                radial-gradient(1.5px 1.5px at 180px 110px, #c084fc, rgba(0,0,0,0)),
                                radial-gradient(1px 1px at 240px 60px, #38bdf8, rgba(0,0,0,0)),
                                radial-gradient(2px 2px at 90px 130px, #ffffff, rgba(0,0,0,0))`,
              backgroundSize: '200px 160px',
            }}
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-yellow-300/20 to-purple-600/20 animate-pulse"
            style={{ animationDuration: '3s' }}
          />
        </div>
      )}

      {/* 24K GOLD LEAF MICRO-EMBOSS */}
      {config.foilPattern === 'gold_leaf' && (
        <div
          className="absolute inset-0 mix-blend-overlay opacity-90"
          style={{
            backgroundImage: `radial-gradient(circle at ${sheenPosition.x}% ${sheenPosition.y}%, rgba(254, 240, 138, 0.7) 0%, rgba(217, 119, 6, 0.3) 50%, transparent 80%)`,
          }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, #fbbf24 0px, #fbbf24 1px, transparent 1px, transparent 8px)`,
            }}
          />
        </div>
      )}

      {/* OBSIDIAN CIRCUIT TRACE */}
      {config.foilPattern === 'circuit' && (
        <div className="absolute inset-0 mix-blend-screen opacity-75">
          <svg className="w-full h-full opacity-60" xmlns="http://www.w3.org/2000/svg">
            <line x1="10%" y1="20%" x2="40%" y2="20%" stroke="#c084fc" strokeWidth="1.2" strokeDasharray="3 3" />
            <circle cx="40%" cy="20%" r="2" fill="#38bdf8" />
            <line x1="40%" y1="20%" x2="60%" y2="60%" stroke="#38bdf8" strokeWidth="1" />
            <circle cx="60%" cy="60%" r="2.5" fill="#c084fc" />
            <line x1="60%" y1="60%" x2="90%" y2="60%" stroke="#c084fc" strokeWidth="1.2" />
            <line x1="20%" y1="80%" x2="50%" y2="80%" stroke="#a855f7" strokeWidth="1" strokeDasharray="4 2" />
            <line x1="50%" y1="80%" x2="70%" y2="40%" stroke="#38bdf8" strokeWidth="1.2" />
          </svg>
        </div>
      )}

      {/* LIQUID IRIDESCENT CHROME */}
      {config.foilPattern === 'liquid' && (
        <div
          className="absolute inset-0 mix-blend-color-dodge opacity-80"
          style={{
            background: `radial-gradient(ellipse at ${sheenPosition.x}% ${sheenPosition.y}%, rgba(45,212,191,0.5) 0%, rgba(244,63,94,0.4) 40%, rgba(168,85,247,0.3) 70%, transparent 90%)`,
          }}
        />
      )}

      {/* AMETHYST CRYSTAL FACETS */}
      {config.foilPattern === 'crystal' && (
        <div className="absolute inset-0 mix-blend-screen opacity-80">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(
                60deg,
                rgba(217, 70, 239, 0.25) 0px,
                rgba(147, 51, 234, 0.3) 20px,
                rgba(244, 114, 182, 0.2) 40px
              )`,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(
                -60deg,
                rgba(192, 132, 252, 0.2) 0px,
                transparent 20px,
                rgba(236, 72, 153, 0.2) 40px
              )`,
            }}
          />
        </div>
      )}

      {/* EMERALD AURORA WAVE */}
      {config.foilPattern === 'aurora' && (
        <div
          className="absolute inset-0 mix-blend-color-dodge opacity-85"
          style={{
            background: `linear-gradient(${sheenPosition.x * 1.8}deg, rgba(16,185,129,0.4) 0%, rgba(6,182,212,0.35) 50%, rgba(52,211,153,0.4) 100%)`,
          }}
        />
      )}

      {/* CYBER GLITCH SCANLINES */}
      {config.foilPattern === 'glitch' && (
        <div className="absolute inset-0 mix-blend-screen opacity-70">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,0.4) 0px, rgba(0,0,0,0.4) 1px, transparent 1px, transparent 3px)`,
            }}
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-rose-500/20 via-transparent to-cyan-500/20"
            style={{ transform: `translateX(${(sheenPosition.x - 50) * 0.1}px)` }}
          />
        </div>
      )}

      {/* 4. Sweeping Dynamic Light Scan Beam (Active in Holographic Preview Mode or Scan Simulation) */}
      {activeScanAnimation && (
        <div
          className="absolute -inset-full bg-gradient-to-r from-transparent via-white/35 to-transparent -rotate-45 animate-shimmer pointer-events-none"
          style={{ mixBlendMode: 'overlay' }}
        />
      )}
    </div>
  );
};
