import React from 'react';

interface CardSkeletonProps {
  className?: string;
  delayIndex?: number;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ className = '', delayIndex = 0 }) => {
  return (
    <div
      className={`group relative flex flex-col items-center rounded-3xl border border-white/10 bg-black/40 p-4 sm:p-5 backdrop-blur-md shadow-2xl overflow-hidden ${className}`}
      style={{
        animationDelay: `${delayIndex * 100}ms`
      }}
    >
      {/* Luxury Continuous Metallic Shimmer Wave */}
      <div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent animate-shimmer pointer-events-none z-20"
        style={{
          animationDelay: `${(delayIndex % 4) * 200}ms`,
          animationDuration: '2.2s'
        }}
      />

      {/* Top Meta: Simulated Rarity Badge, Tier, and Wishlist Button */}
      <div className="flex items-center justify-between w-full mb-3 z-10">
        <div className="flex items-center gap-2">
          {/* Rarity Pill Skeleton */}
          <div className="h-6 w-20 rounded-full bg-white/[0.08] border border-white/[0.05] animate-pulse" />
          {/* Tier Pill Skeleton */}
          <div className="h-5 w-14 rounded-full bg-white/[0.05] border border-white/[0.03] animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          {/* Wishlist Button Skeleton */}
          <div className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/[0.08] animate-pulse" />
          {/* Status Indicator */}
          <div className="flex items-center gap-1.5 pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 animate-pulse" />
            <div className="w-12 h-2.5 rounded bg-white/[0.06] animate-pulse" />
          </div>
        </div>
      </div>

      {/* 3D Realistic Credit Card Canvas Placeholder */}
      <div className="py-2 flex justify-center items-center w-full z-10">
        <div className="relative w-[260px] sm:w-[280px] h-[164px] sm:h-[176px] rounded-2xl bg-gradient-to-br from-white/[0.09] via-white/[0.04] to-white/[0.01] border border-white/15 p-4 sm:p-5 flex flex-col justify-between shadow-2xl overflow-hidden max-w-full">
          {/* Internal card ambient foil gradient */}
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-transparent to-sky-500/5 pointer-events-none" />

          {/* Card Top Row: Chip & Contactless */}
          <div className="flex items-center justify-between relative z-10">
            {/* EMV Microchip skeleton */}
            <div className="w-9 h-7 rounded-md bg-amber-400/20 border border-amber-400/30 flex items-center justify-center overflow-hidden">
              <div className="w-full h-px bg-amber-400/30 my-0.5" />
            </div>
            {/* Contactless symbol skeleton */}
            <div className="w-5 h-5 rounded-full bg-white/[0.08] animate-pulse" />
          </div>

          {/* Card Middle: Hologram & Name skeleton */}
          <div className="space-y-2 relative z-10 my-auto">
            <div className="h-3.5 w-3/4 rounded bg-white/[0.08] animate-pulse" />
            <div className="h-2.5 w-1/2 rounded bg-white/[0.05] animate-pulse" />
          </div>

          {/* Card Bottom Row: Masked Number & Network Logo */}
          <div className="flex items-end justify-between relative z-10 pt-2 border-t border-white/[0.08]">
            <div className="space-y-1">
              <div className="h-2 w-12 rounded bg-white/[0.05]" />
              <div className="h-3 w-28 rounded bg-white/[0.1] tracking-widest font-mono" />
            </div>
            {/* Brand/Network placeholder */}
            <div className="w-10 h-6 rounded bg-white/[0.08] border border-white/[0.05]" />
          </div>
        </div>
      </div>

      {/* Card Info & Bottom Action Row */}
      <div className="flex w-full flex-col mt-4 pt-3 border-t border-white/10 z-10 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 rounded bg-white/[0.1] animate-pulse" />
          <div className="h-3 w-16 rounded bg-white/[0.06] animate-pulse" />
        </div>

        <div className="flex items-center justify-between">
          <div className="h-3 w-24 rounded bg-white/[0.06]" />
          <div className="h-3.5 w-20 rounded bg-emerald-500/15 border border-emerald-500/20" />
        </div>

        <div className="mt-1 flex items-center justify-between pt-1">
          {/* Price skeleton */}
          <div className="h-5 w-20 rounded bg-white/[0.12] animate-pulse" />

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <div className="h-7 w-16 rounded-full bg-white/[0.06] border border-white/10" />
            <div className="w-8 h-8 rounded-full bg-white/[0.1] border border-white/15 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

interface CardsGridSkeletonProps {
  count?: number;
}

export const CardsGridSkeleton: React.FC<CardsGridSkeletonProps> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <CardSkeleton key={`card-skeleton-${idx}`} delayIndex={idx} />
      ))}
    </div>
  );
};
