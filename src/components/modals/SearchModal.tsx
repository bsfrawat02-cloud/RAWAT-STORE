import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { CardNetworkLogo } from '../cards/CardNetworkLogo';
import { Search, X, Layers, ArrowRight } from 'lucide-react';
import { playSound } from '../../utils/audio';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { cards, setSelectedCard, soundEnabled, formatPrice } = useStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const results = cards.filter((card) => {
    if (!query.trim()) return false;
    const q = query.toLowerCase().trim();
    return (
      card.name.toLowerCase().includes(q) ||
      card.tagline.toLowerCase().includes(q) ||
      card.tier.toLowerCase().includes(q) ||
      (card.network && card.network.toLowerCase().includes(q)) ||
      card.finish.toLowerCase().includes(q) ||
      card.edition.toLowerCase().includes(q) ||
      card.maskedIdentifier.includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 md:p-6 pt-16 sm:pt-24 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
        onClick={() => {
          playSound('click', soundEnabled);
          onClose();
        }}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0c0d15]/95 backdrop-blur-2xl shadow-2xl z-10 overflow-hidden space-y-4">
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-white/5 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Visa, Mastercard, Noir, Gold, Platinum, Edition..."
            className="flex-1 bg-transparent border-none text-white text-sm font-mono placeholder:text-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => {
              playSound('click', soundEnabled);
              onClose();
            }}
            className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Search Results */}
        <div className="p-4 sm:p-5 max-h-[60vh] overflow-y-auto space-y-2">
          {!query.trim() ? (
            <div className="py-12 text-center text-slate-500 font-mono text-xs space-y-2">
              <Layers className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p>Type keywords to discover Visa & Mastercard editions or special finishes.</p>
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                {['Visa', 'Mastercard', 'Obsidian', 'Gold', 'Titanium', 'Emerald', 'Platinum'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-300 hover:bg-white/10 cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center font-mono text-xs text-slate-500">
              No matching cards found for "{query}".
            </div>
          ) : (
            results.map((card) => (
              <div
                key={card.id}
                onClick={() => {
                  playSound('click', soundEnabled);
                  setSelectedCard(card);
                  onClose();
                }}
                className="p-3.5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-7 rounded-lg bg-gradient-to-br from-purple-900 to-slate-900 border border-white/20 flex items-center justify-center">
                    <CardNetworkLogo network={card.network || 'RAWAT'} size="xs" />
                  </div>
                  <div>
                    <h4 className="font-tech font-bold text-sm text-white group-hover:text-purple-300 transition-colors">
                      {card.name}
                    </h4>
                    <p className="text-[11px] font-mono text-slate-400">{card.edition}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-xs text-white">
                    {formatPrice(card.price)}
                  </span>
                  {card.network && (
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/10">
                      {card.network}
                    </span>
                  )}
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    {card.tier}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
