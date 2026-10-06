import React from 'react';
import { CardNetwork } from '../../types';

interface CardNetworkLogoProps {
  network?: CardNetwork;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const CardNetworkLogo: React.FC<CardNetworkLogoProps> = ({
  network = 'RAWAT',
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    xs: 'h-3.5 px-1.5 py-0.5 text-[8px]',
    sm: 'h-4.5 px-2 py-0.5 text-[9px]',
    md: 'h-6 px-2.5 py-1 text-[10px]',
    lg: 'h-8 px-3.5 py-1.5 text-xs',
  };

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4.5 h-4.5',
  };

  // Original RAWAT Signature Network Crests
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 backdrop-blur-md font-mono font-bold tracking-widest uppercase text-white shadow-sm select-none ${sizeMap[size]} ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {/* Geometric RAWAT Vault Emblem */}
        <div className={`${iconSizes[size]} border border-purple-400 rotate-45 flex items-center justify-center`}>
          <div className="w-1 h-1 bg-white rounded-full" />
        </div>
      </div>
      <span className="leading-none text-slate-200">RAWAT</span>
    </div>
  );
};
