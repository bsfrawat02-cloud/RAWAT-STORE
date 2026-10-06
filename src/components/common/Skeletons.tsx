import React from 'react';
import { motion } from 'motion/react';

// ============================================================================
// BASE SHIMMER PRIMITIVE
// ============================================================================
interface ShimmerProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Shimmer: React.FC<ShimmerProps> = ({ className = '', style }) => {
  return (
    <div
      className={`relative overflow-hidden bg-white/[0.05] border border-white/[0.04] ${className}`}
      style={style}
    >
      {/* High-definition linear metallic laser shimmer sweep */}
      <div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.09] via-purple-400/[0.06] to-transparent animate-shimmer pointer-events-none z-10"
        style={{
          animationDuration: '1.8s',
        }}
      />
    </div>
  );
};

// ============================================================================
// STORE CARD SKELETON (3D Holographic Card Shimmer)
// ============================================================================
export const StoreCardSkeleton: React.FC<{ index?: number }> = ({ index = 0 }) => {
  return (
    <div
      className="group relative flex flex-col items-center rounded-3xl border border-white/10 bg-black/40 p-4 sm:p-5 backdrop-blur-md shadow-2xl overflow-hidden h-full"
      style={{
        animationDelay: `${(index % 4) * 100}ms`,
      }}
    >
      {/* Continuous Metallic Shimmer Wave */}
      <div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.07] to-transparent animate-shimmer pointer-events-none z-20"
        style={{
          animationDelay: `${(index % 4) * 180}ms`,
          animationDuration: '2s',
        }}
      />

      {/* Top Meta: Simulated Rarity Badge, Tier, and Action */}
      <div className="flex items-center justify-between w-full mb-3 z-10">
        <div className="flex items-center gap-2">
          <Shimmer className="h-6 w-20 rounded-full" />
          <Shimmer className="h-5 w-14 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Shimmer className="w-7 h-7 rounded-full" />
          <div className="flex items-center gap-1.5 pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 animate-pulse" />
            <Shimmer className="w-12 h-2.5 rounded" />
          </div>
        </div>
      </div>

      {/* 3D Realistic Credit Card Canvas Placeholder */}
      <div className="py-2 flex justify-center items-center w-full z-10">
        <div className="relative w-[260px] sm:w-[280px] h-[164px] sm:h-[176px] rounded-2xl bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-white/[0.01] border border-white/15 p-4 sm:p-5 flex flex-col justify-between shadow-2xl overflow-hidden max-w-full">
          {/* Internal card ambient foil gradient */}
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-transparent to-sky-500/5 pointer-events-none" />

          {/* Card Top Row: Chip & Contactless */}
          <div className="flex items-center justify-between relative z-10">
            <div className="w-9 h-7 rounded-md bg-amber-400/20 border border-amber-400/30 flex items-center justify-center overflow-hidden">
              <div className="w-full h-px bg-amber-400/40 my-0.5" />
            </div>
            <Shimmer className="w-5 h-5 rounded-full" />
          </div>

          {/* Card Middle: Hologram & Name skeleton */}
          <div className="space-y-2 relative z-10 my-auto">
            <Shimmer className="h-3.5 w-3/4 rounded" />
            <Shimmer className="h-2.5 w-1/2 rounded" />
          </div>

          {/* Card Bottom Row: Masked Number & Network Logo */}
          <div className="flex items-end justify-between relative z-10 pt-2 border-t border-white/[0.08]">
            <div className="space-y-1">
              <Shimmer className="h-2 w-12 rounded" />
              <Shimmer className="h-3 w-28 rounded" />
            </div>
            <Shimmer className="w-10 h-6 rounded" />
          </div>
        </div>
      </div>

      {/* Card Info & Bottom Action Row */}
      <div className="flex w-full flex-col mt-4 pt-3 border-t border-white/10 z-10 space-y-2.5">
        <div className="flex items-center justify-between">
          <Shimmer className="h-4 w-32 rounded" />
          <Shimmer className="h-3 w-16 rounded" />
        </div>

        <div className="flex items-center justify-between">
          <Shimmer className="h-3 w-24 rounded" />
          <Shimmer className="h-3.5 w-20 rounded bg-emerald-500/15" />
        </div>

        <div className="mt-1 flex items-center justify-between pt-1">
          <Shimmer className="h-5 w-20 rounded" />
          <div className="flex items-center gap-2">
            <Shimmer className="h-7 w-16 rounded-full" />
            <Shimmer className="w-8 h-8 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const StoreGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <StoreCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
};

// ============================================================================
// ORDERS & INVOICES SKELETON
// ============================================================================
export const OrderCardSkeleton: React.FC<{ index?: number }> = ({ index = 0 }) => {
  return (
    <div
      className="relative rounded-3xl border border-white/10 bg-black/40 p-5 sm:p-6 backdrop-blur-xl shadow-xl overflow-hidden space-y-5"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent animate-shimmer pointer-events-none z-10" />

      {/* Top Header: Order ID + Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Shimmer className="w-10 h-10 rounded-2xl" />
          <div className="space-y-1.5">
            <Shimmer className="h-4 w-28 rounded" />
            <Shimmer className="h-3 w-36 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Shimmer className="h-6 w-24 rounded-full" />
          <Shimmer className="h-6 w-20 rounded-full" />
        </div>
      </div>

      {/* Main Order Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Left: Card Mini Preview */}
        <div className="md:col-span-5 flex justify-center">
          <div className="w-[240px] h-[140px] rounded-2xl bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-white/[0.01] border border-white/15 p-3 flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="w-7 h-5 rounded bg-amber-400/20 border border-amber-400/30" />
              <Shimmer className="w-4 h-4 rounded-full" />
            </div>
            <div className="space-y-1.5">
              <Shimmer className="h-3 w-3/4 rounded" />
              <Shimmer className="h-2 w-1/2 rounded" />
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-white/[0.08]">
              <Shimmer className="h-2.5 w-24 rounded" />
              <Shimmer className="w-8 h-4 rounded" />
            </div>
          </div>
        </div>

        {/* Right: Metadata Matrix */}
        <div className="md:col-span-7 space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
              <Shimmer className="h-2 w-16 rounded" />
              <Shimmer className="h-3 w-24 rounded" />
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
              <Shimmer className="h-2 w-16 rounded" />
              <Shimmer className="h-3 w-20 rounded" />
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
              <Shimmer className="h-2 w-16 rounded" />
              <Shimmer className="h-3 w-28 rounded" />
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
              <Shimmer className="h-2 w-16 rounded" />
              <Shimmer className="h-3 w-24 rounded" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Shimmer className="h-5 w-24 rounded" />
            <div className="flex items-center gap-2">
              <Shimmer className="h-8 w-24 rounded-full" />
              <Shimmer className="h-8 w-24 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const OrdersListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <OrderCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
};

// ============================================================================
// TRANSACTIONS & LEDGER SKELETON
// ============================================================================
export const TransactionsPageSkeleton: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner Skeleton */}
      <div className="relative rounded-3xl border border-white/10 bg-black/40 p-6 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent animate-shimmer pointer-events-none z-10" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <Shimmer className="h-5 w-40 rounded-full" />
            <Shimmer className="h-8 w-64 rounded-xl" />
            <Shimmer className="h-3.5 w-48 rounded" />
          </div>

          <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl">
            <div className="space-y-1">
              <Shimmer className="h-2.5 w-24 rounded" />
              <Shimmer className="h-7 w-32 rounded" />
            </div>
            <Shimmer className="h-10 w-28 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Filter Tabs Bar Skeleton */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Shimmer key={i} className="h-8 w-20 sm:w-24 rounded-full shrink-0" />
          ))}
        </div>
        <Shimmer className="h-9 w-full sm:w-64 rounded-xl" />
      </div>

      {/* Transactions List Shimmer */}
      <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden divide-y divide-white/5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="p-4 sm:p-5 flex items-center justify-between gap-4 relative overflow-hidden"
          >
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-shimmer pointer-events-none" />
            <div className="flex items-center gap-3.5 min-w-0">
              <Shimmer className="w-10 h-10 rounded-2xl shrink-0" />
              <div className="space-y-1.5 min-w-0">
                <Shimmer className="h-4 w-36 sm:w-48 rounded" />
                <Shimmer className="h-3 w-28 sm:w-36 rounded" />
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right space-y-1">
                <Shimmer className="h-4 w-20 sm:w-24 rounded ml-auto" />
                <Shimmer className="h-2.5 w-14 rounded ml-auto" />
              </div>
              <Shimmer className="h-6 w-20 rounded-full hidden sm:block" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// VAULT PAGE SKELETON
// ============================================================================
export const VaultPageSkeleton: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Vault Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
            <Shimmer className="h-3.5 w-44 rounded" />
          </div>
          <Shimmer className="h-9 w-64 rounded-xl" />
          <Shimmer className="h-3.5 w-80 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <Shimmer className="h-9 w-28 rounded-full" />
          <Shimmer className="h-9 w-32 rounded-full" />
        </div>
      </div>

      {/* 3D Main Stage Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: 3D Stage Card */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 sm:p-10 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-purple-500/[0.08] to-transparent animate-shimmer pointer-events-none" />
          
          <div className="w-[300px] sm:w-[360px] h-[190px] sm:h-[225px] rounded-3xl bg-gradient-to-br from-white/[0.1] via-white/[0.04] to-black/60 border border-white/20 p-6 flex flex-col justify-between shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div className="w-12 h-9 rounded-lg bg-amber-400/20 border border-amber-400/30" />
              <Shimmer className="w-8 h-8 rounded-full" />
            </div>
            <div className="space-y-2">
              <Shimmer className="h-4 w-44 rounded" />
              <Shimmer className="h-3 w-32 rounded" />
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <Shimmer className="h-4 w-36 rounded" />
              <Shimmer className="w-14 h-8 rounded-lg" />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <Shimmer className="h-9 w-32 rounded-full" />
            <Shimmer className="h-9 w-32 rounded-full" />
          </div>
        </div>

        {/* Right: Secret Decryption Matrix */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <Shimmer className="h-5 w-32 rounded" />
              <Shimmer className="h-6 w-20 rounded-full" />
            </div>
            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1.5">
                <Shimmer className="h-2 w-20 rounded" />
                <Shimmer className="h-4 w-44 rounded" />
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1.5">
                <Shimmer className="h-2 w-20 rounded" />
                <Shimmer className="h-4 w-36 rounded" />
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1.5">
                <Shimmer className="h-2 w-20 rounded" />
                <Shimmer className="h-4 w-28 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PROFILE PAGE SKELETON
// ============================================================================
export const ProfilePageSkeleton: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Profile Header Banner */}
      <div className="relative rounded-3xl border border-white/10 bg-black/40 p-6 sm:p-8 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent animate-shimmer pointer-events-none z-10" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <Shimmer className="w-20 h-20 rounded-3xl shrink-0" />
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Shimmer className="h-6 w-36 rounded-lg" />
                <Shimmer className="h-5 w-24 rounded-full" />
              </div>
              <Shimmer className="h-3.5 w-48 rounded" />
              <Shimmer className="h-3 w-32 rounded" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Shimmer className="h-10 w-28 rounded-2xl" />
            <Shimmer className="h-10 w-28 rounded-2xl" />
          </div>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl space-y-3 relative overflow-hidden"
          >
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent animate-shimmer pointer-events-none" />
            <div className="flex items-center justify-between">
              <Shimmer className="w-10 h-10 rounded-2xl" />
              <Shimmer className="h-4 w-12 rounded" />
            </div>
            <div className="space-y-1">
              <Shimmer className="h-6 w-28 rounded" />
              <Shimmer className="h-3 w-20 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Profile Sections Navigation Bar */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Shimmer key={i} className="h-10 w-32 rounded-2xl shrink-0" />
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// ADMIN PAGE SKELETON
// ============================================================================
export const AdminPageSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 w-full">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <Shimmer className="h-3.5 w-36 rounded" />
          </div>
          <Shimmer className="h-8 w-60 rounded-xl" />
        </div>
        <div className="flex items-center gap-3">
          <Shimmer className="h-9 w-32 rounded-xl" />
          <Shimmer className="h-9 w-32 rounded-xl" />
        </div>
      </div>

      {/* 4 Stat Overview Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl space-y-3 relative overflow-hidden"
          >
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-amber-500/[0.05] to-transparent animate-shimmer pointer-events-none" />
            <div className="flex items-center justify-between">
              <Shimmer className="w-10 h-10 rounded-2xl" />
              <Shimmer className="h-4 w-14 rounded-full" />
            </div>
            <div className="space-y-1">
              <Shimmer className="h-6 w-24 rounded" />
              <Shimmer className="h-3 w-28 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Admin Tab Bar Skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <Shimmer key={i} className="h-10 w-28 rounded-2xl shrink-0" />
        ))}
      </div>

      {/* Table Rows Skeleton */}
      <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <Shimmer className="h-5 w-40 rounded" />
          <Shimmer className="h-8 w-48 rounded-xl" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <Shimmer className="w-8 h-8 rounded-xl" />
                <Shimmer className="h-4 w-36 rounded" />
              </div>
              <Shimmer className="h-4 w-20 rounded" />
              <Shimmer className="h-6 w-20 rounded-full" />
              <Shimmer className="h-8 w-20 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
