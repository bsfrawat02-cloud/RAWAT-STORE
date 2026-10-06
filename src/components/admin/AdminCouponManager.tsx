import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { PromoCoupon } from '../../types';
import { playSound } from '../../utils/audio';
import {
  Tag,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Percent,
  DollarSign,
  Calendar,
  Sparkles,
  Copy,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export const AdminCouponManager: React.FC = () => {
  const { coupons, addCoupon, updateCoupon, deleteCoupon, soundEnabled } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<PromoCoupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [minOrderValue, setMinOrderValue] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [expiresAt, setExpiresAt] = useState('');

  const openCreateModal = () => {
    playSound('click', soundEnabled);
    setEditingCoupon(null);
    setCode('RAWAT' + Math.floor(10 + Math.random() * 90));
    setDiscountType('percentage');
    setDiscountValue(20);
    setMinOrderValue(0);
    setDescription('Special Collector Promo Discount');
    setIsActive(true);
    setExpiresAt('2026-12-31');
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: PromoCoupon) => {
    playSound('click', soundEnabled);
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDiscountType(coupon.discountType);
    setDiscountValue(coupon.discountValue);
    setMinOrderValue(coupon.minOrderValue || 0);
    setDescription(coupon.description);
    setIsActive(coupon.isActive);
    setExpiresAt(coupon.expiresAt || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    playSound('purchase', soundEnabled);

    if (editingCoupon) {
      updateCoupon(editingCoupon.id, {
        code: code.toUpperCase().trim(),
        discountType,
        discountValue: Number(discountValue),
        minOrderValue: Number(minOrderValue) || undefined,
        description,
        isActive,
        expiresAt: expiresAt || undefined
      });
    } else {
      addCoupon({
        code: code.toUpperCase().trim(),
        discountType,
        discountValue: Number(discountValue),
        minOrderValue: Number(minOrderValue) || undefined,
        description,
        isActive,
        expiresAt: expiresAt || undefined
      });
    }

    setIsModalOpen(false);
  };

  const handleCopy = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    playSound('click', soundEnabled);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-zinc-950/80 border border-white/10 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">
              Marketing & Discount Engine
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-tech text-white tracking-tight">
            Promotional Coupons & Flash Campaigns
          </h2>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition-all shadow-lg shadow-purple-900/30 cursor-pointer flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Promo Code</span>
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className={`p-5 rounded-3xl border backdrop-blur-xl flex flex-col justify-between space-y-4 transition-all ${
              coupon.isActive
                ? 'bg-zinc-950/80 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.1)]'
                : 'bg-zinc-950/40 border-white/5 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  coupon.isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {coupon.isActive ? 'Active Campaign' : 'Paused'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(coupon)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 transition-colors cursor-pointer"
                    title="Edit Coupon"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      playSound('click', soundEnabled);
                      deleteCoupon(coupon.id);
                    }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                    title="Delete Coupon"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Coupon Code Block */}
              <div className="p-3 rounded-2xl bg-black/60 border border-purple-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Promo Code</span>
                  <span className="text-base font-bold font-tech text-purple-300 tracking-wider">
                    {coupon.code}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(coupon.code)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                  title="Copy code"
                >
                  {copiedCode === coupon.code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === coupon.code ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <p className="text-slate-300 text-xs mt-3">
                {coupon.description}
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-white/10 font-mono text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Discount Value:</span>
                <span className="font-bold text-emerald-400">
                  {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} FLAT`}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Min Order Cart:</span>
                <span className="text-white">₹{coupon.minOrderValue || 0}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Redemptions:</span>
                <span className="text-sky-300 font-bold">{coupon.usageCount} times</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 cursor-pointer" />

          <div className="relative w-full max-w-md rounded-3xl border border-white/15 bg-zinc-950/95 p-6 shadow-2xl backdrop-blur-2xl z-50 overflow-hidden space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="font-tech text-base font-bold text-white uppercase">
                  {editingCoupon ? 'Edit Promo Coupon' : 'Create Promo Campaign'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-purple-300 font-tech font-bold text-base focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'flat')}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Cash (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Value {discountType === 'percentage' ? '(%)' : '(₹)'} *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-emerald-400 font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Min Order Threshold (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Campaign Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 20% discount on all Obsidian series"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-slate-300">Campaign Active Status</span>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                    isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {isActive ? 'ENABLED' : 'PAUSED'}
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1.5 shadow"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Campaign</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
