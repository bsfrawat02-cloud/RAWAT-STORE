import React, { useState, useEffect } from 'react';
import { Flame, Clock, Zap } from 'lucide-react';

interface FlashDealCountdownProps {
  endsAt?: string;
  discountPercent?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const FlashDealCountdown: React.FC<FlashDealCountdownProps> = ({
  endsAt,
  discountPercent = 40,
  label = 'FLASH DEAL',
  size = 'sm'
}) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 3,
    minutes: 45,
    seconds: 12
  });

  useEffect(() => {
    if (!endsAt) return;

    const calculateTime = () => {
      const difference = new Date(endsAt).getTime() - Date.now();
      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20 border border-amber-500/40 text-amber-300 font-mono shadow-sm">
      <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce shrink-0" />
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-0.5 text-[11px] font-extrabold text-white bg-black/50 px-1.5 py-0.5 rounded border border-white/10">
        <span>{pad(timeLeft.hours)}</span>
        <span className="text-amber-400 animate-pulse">:</span>
        <span>{pad(timeLeft.minutes)}</span>
        <span className="text-amber-400 animate-pulse">:</span>
        <span>{pad(timeLeft.seconds)}</span>
      </div>
    </div>
  );
};
