import { PromoCoupon } from '../types';

export const DEFAULT_COUPONS: PromoCoupon[] = [
  {
    id: 'c-1',
    code: 'RAWAT20',
    discountType: 'percentage',
    discountValue: 20,
    minOrderValue: 400,
    description: '20% OFF any premium fictional card in the collection.',
    isActive: true,
    usageCount: 142,
    expiresAt: '2026-12-31'
  },
  {
    id: 'c-2',
    code: 'RAWATVIP',
    discountType: 'flat',
    discountValue: 100,
    minOrderValue: 500,
    description: '₹100 Instant Discount on VIP Tier Cards.',
    isActive: true,
    usageCount: 89,
    expiresAt: '2026-12-31'
  },
  {
    id: 'c-3',
    code: 'LUXE50',
    discountType: 'percentage',
    discountValue: 50,
    minOrderValue: 1000,
    description: '50% Flash Discount for Diamond Vault Collectors.',
    isActive: true,
    usageCount: 35,
    expiresAt: '2026-09-30'
  },
  {
    id: 'c-4',
    code: 'ROYALE250',
    discountType: 'flat',
    discountValue: 250,
    minOrderValue: 1200,
    description: '₹250 Flat Off on Elite & Special Edition Cards.',
    isActive: true,
    usageCount: 64,
    expiresAt: '2026-11-30'
  }
];
