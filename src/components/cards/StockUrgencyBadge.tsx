import React from 'react';
import { Flame, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface StockUrgencyBadgeProps {
  stockCount: number;
  maxStock?: number;
  showBar?: boolean;
}

export const StockUrgencyBadge: React.FC<StockUrgencyBadgeProps> = ({
  stockCount,
  maxStock = 50,
  showBar = true
}) => {
  if (stockCount <= 0) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-mono font-bold">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
        <span>SOLD OUT</span>
      </div>
    );
  }

  const isCritical = stockCount <= 5;
  const isLow = stockCount <= 12;

  // Percentage for urgency progress bar
  const percentLeft = Math.min(100, Math.max(10, Math.round((stockCount / maxStock) * 100)));

  return (
    <div className="w-full space-y-1 font-mono text-[10px]">
      <div className="flex items-center justify-between">
        {isCritical ? (
          <div className="inline-flex items-center gap-1 text-rose-400 font-bold animate-pulse">
            <Flame className="w-3 h-3 text-rose-500" />
            <span>ALMOST GONE: Only {stockCount} left in Vault!</span>
          </div>
        ) : isLow ? (
          <div className="inline-flex items-center gap-1 text-amber-400 font-bold">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            <span>HIGH DEMAND: {stockCount} cards remaining</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>In Stock ({stockCount} units available)</span>
          </div>
        )}

        <span className="text-slate-400 font-bold">{stockCount} left</span>
      </div>

      {showBar && (
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCritical
                ? 'bg-gradient-to-r from-rose-600 to-amber-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                : isLow
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_6px_rgba(245,158,11,0.6)]'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${percentLeft}%` }}
          />
        </div>
      )}
    </div>
  );
};
