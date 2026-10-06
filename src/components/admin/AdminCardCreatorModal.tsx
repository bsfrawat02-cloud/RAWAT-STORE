import React, { useState, useEffect } from 'react';
import { CardProduct, CardTier, CardFinish, CardNetwork, CardRarity, HolographicOverlayType } from '../../types';
import { Realistic3DCard } from '../cards/Realistic3DCard';
import { RarityBadge } from '../cards/RarityBadge';
import { playSound } from '../../utils/audio';
import { HOLOGRAM_CONFIGS, ALL_HOLOGRAMS, getHologramConfig } from '../../utils/hologram';
import {
  X,
  Sparkles,
  Plus,
  Trash2,
  Check,
  CreditCard,
  Layers,
  ShieldCheck,
  Eye,
  Calendar,
  Lock,
  Hash,
  DollarSign,
  User,
  Building,
  KeyRound,
  Wand2,
  HelpCircle,
  RefreshCw,
  Zap
} from 'lucide-react';

interface AdminCardCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCard: (card: Omit<CardProduct, 'id' | 'createdAt'>, cardIdToUpdate?: string) => void;
  initialCard?: CardProduct | null;
  soundEnabled?: boolean;
}

export const AdminCardCreatorModal: React.FC<AdminCardCreatorModalProps> = ({
  isOpen,
  onClose,
  onSaveCard,
  initialCard,
  soundEnabled = true
}) => {
  // Helper to format card number with spaces every 4 digits
  const formatCardNumberString = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '').slice(0, 16);
    return digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  // Helper to parse expiry month & year from expDate string (e.g. "08/31" -> month "08", year "2031")
  const parseExpMonth = (card?: CardProduct | null) => {
    if (card?.expMonth) return card.expMonth.padStart(2, '0');
    if (card?.expDate && card.expDate.includes('/')) {
      return card.expDate.split('/')[0].padStart(2, '0');
    }
    return '08';
  };

  const parseExpYear = (card?: CardProduct | null) => {
    if (card?.expYear) {
      return card.expYear.length === 2 ? `20${card.expYear}` : card.expYear;
    }
    if (card?.expDate && card.expDate.includes('/')) {
      const yr = card.expDate.split('/')[1];
      return yr.length === 2 ? `20${yr}` : yr;
    }
    return '2032';
  };

  // Primary State declarations
  const [name, setName] = useState('RAWAT CHRONO OBSIDIAN');
  const [tagline, setTagline] = useState('Next-Gen Quantum Luxury Metal');
  const [tier, setTier] = useState<CardTier>('BLACK');
  const [rarity, setRarity] = useState<CardRarity>('Epic');
  const [finish, setFinish] = useState<CardFinish>('obsidian');
  const [holographicOverlay, setHolographicOverlay] = useState<HolographicOverlayType>('prism_rainbow');
  const [network, setNetwork] = useState<CardNetwork>('RAWAT');
  const [price, setPrice] = useState<number>(499);
  const [limit, setLimit] = useState<number>(6500);
  const [dailyLimit, setDailyLimit] = useState<number>(3000);
  const [monthlyLimit, setMonthlyLimit] = useState<number>(6500);
  const [stockCount, setStockCount] = useState<number>(50);
  const [edition, setEdition] = useState('First Issue #01');
  const [description, setDescription] = useState(
    'Engineered with titanium alloy and a holographic reflective prism lattice for ultra collectors.'
  );
  const [perks, setPerks] = useState<string[]>([
    'Zero Forex Markup',
    'Airport Lounge Access',
    '3D Hologram Shader',
    '24/7 Security Concierge'
  ]);
  const [newPerkInput, setNewPerkInput] = useState('');
  const [accentColor, setAccentColor] = useState('#a855f7');
  const [featured, setFeatured] = useState<boolean>(false);
  const [status, setStatus] = useState<'AVAILABLE' | 'LIMITED' | 'VAULT_ONLY'>('AVAILABLE');

  // Specific Card Security & Payment Credentials
  const [cardNumber, setCardNumber] = useState('4532 8912 3456 4821');
  const [maskedIdentifier, setMaskedIdentifier] = useState('•••• •••• •••• 4821');
  const [expMonth, setExpMonth] = useState('08');
  const [expYear, setExpYear] = useState('2032');
  const [cvv, setCvv] = useState('821');
  const [cardHolder, setCardHolder] = useState('RAWAT VIP MEMBER');
  const [bankName, setBankName] = useState('RAWAT RESERVE BANK');
  const [cardPin, setCardPin] = useState('4821');

  // Form Validation & Feedback
  const [formError, setFormError] = useState<string | null>(null);

  // Sync state whenever initialCard changes or modal opens
  useEffect(() => {
    if (initialCard) {
      setName(initialCard.name || '');
      setTagline(initialCard.tagline || '');
      setTier(initialCard.tier || 'BLACK');
      setRarity(initialCard.rarity || 'Epic');
      setFinish(initialCard.finish || 'obsidian');
      setHolographicOverlay(initialCard.holographicOverlay || 'prism_rainbow');
      setNetwork(initialCard.network || 'RAWAT');
      setPrice(initialCard.price !== undefined ? initialCard.price : 499);
      const cardLimit = initialCard.limit !== undefined ? initialCard.limit : 250000;
      setLimit(cardLimit);
      setDailyLimit(initialCard.dailyLimit !== undefined ? initialCard.dailyLimit : Math.round(cardLimit * 0.3));
      setMonthlyLimit(initialCard.monthlyLimit !== undefined ? initialCard.monthlyLimit : cardLimit);
      setStockCount(initialCard.stockCount !== undefined ? initialCard.stockCount : 50);
      setEdition(initialCard.edition || 'First Issue #01');
      setDescription(initialCard.description || '');
      setPerks(initialCard.perks || ['Zero Forex Markup', '3D Hologram Shader']);
      setAccentColor(initialCard.accentColor || '#a855f7');
      setFeatured(!!initialCard.featured);
      setStatus(initialCard.status || 'AVAILABLE');

      // Credentials
      const formattedNum = formatCardNumberString(
        initialCard.cardNumber || initialCard.maskedIdentifier?.replace(/[^0-9]/g, '') || '4532891234564821'
      );
      setCardNumber(formattedNum || '4532 8912 3456 4821');
      setMaskedIdentifier(
        initialCard.maskedIdentifier ||
          `•••• •••• •••• ${formattedNum.slice(-4) || '4821'}`
      );
      setExpMonth(parseExpMonth(initialCard));
      setExpYear(parseExpYear(initialCard));
      setCvv(initialCard.cvv || '821');
      setCardHolder(initialCard.cardHolder || 'RAWAT VIP MEMBER');
      setBankName(initialCard.bankName || 'RAWAT RESERVE BANK');
      setCardPin(initialCard.cardPin || '4821');
    } else {
      // Defaults for brand new card creation
      const randLast4 = String(Math.floor(1000 + Math.random() * 9000));
      const randMid4 = String(Math.floor(1000 + Math.random() * 9000));
      const randMid4B = String(Math.floor(1000 + Math.random() * 9000));
      const newCardNum = `4532 ${randMid4} ${randMid4B} ${randLast4}`;

      setName('RAWAT TITANIUM CHRONO');
      setTagline('Next-Gen Quantum Luxury Metal');
      setTier('BLACK');
      setRarity('Epic');
      setFinish('obsidian');
      setNetwork('RAWAT');
      setPrice(599);
      setLimit(250000);
      setDailyLimit(75000);
      setMonthlyLimit(250000);
      setStockCount(50);
      setEdition('Genesis Issue #01');
      setDescription(
        'Engineered with titanium alloy and a holographic reflective prism lattice for ultra collectors.'
      );
      setPerks(['Zero Forex Markup', 'Airport Lounge Access', '3D Hologram Shader', '24/7 Security Concierge']);
      setAccentColor('#a855f7');
      setFeatured(false);
      setStatus('AVAILABLE');

      setCardNumber(newCardNum);
      setMaskedIdentifier(`•••• •••• •••• ${randLast4}`);
      setExpMonth('08');
      setExpYear('2032');
      setCvv(String(Math.floor(100 + Math.random() * 900)));
      setCardHolder('RAWAT VIP MEMBER');
      setBankName('RAWAT RESERVE BANK');
      setCardPin(randLast4);
    }
    setFormError(null);
  }, [initialCard, isOpen]);

  if (!isOpen) return null;

  // Format Expiry Date string MM/YY
  const formattedExpDate = `${expMonth.padStart(2, '0')}/${expYear.slice(-2)}`;

  // Handle Card Number Input Change
  const handleCardNumberChange = (val: string) => {
    const formatted = formatCardNumberString(val);
    setCardNumber(formatted);
    const rawDigits = formatted.replace(/\s+/g, '');
    const last4 = rawDigits.slice(-4);
    if (last4) {
      setMaskedIdentifier(`•••• •••• •••• ${last4}`);
    }
  };

  // Quick Random Generator for Credentials
  const handleRandomizeCredentials = () => {
    playSound('click', soundEnabled);
    const prefixes = network === 'VISA' ? '4123' : network === 'MASTERCARD' ? '5412' : '4532';
    const rand2 = String(Math.floor(1000 + Math.random() * 9000));
    const rand3 = String(Math.floor(1000 + Math.random() * 9000));
    const rand4 = String(Math.floor(1000 + Math.random() * 9000));
    const newNum = `${prefixes} ${rand2} ${rand3} ${rand4}`;
    const newCvv = String(Math.floor(100 + Math.random() * 900));
    const newPin = rand4;
    const months = ['01', '03', '05', '07', '08', '09', '11', '12'];
    const newMonth = months[Math.floor(Math.random() * months.length)];
    const newYear = String(2028 + Math.floor(Math.random() * 8));

    setCardNumber(newNum);
    setMaskedIdentifier(`•••• •••• •••• ${rand4}`);
    setCvv(newCvv);
    setCardPin(newPin);
    setExpMonth(newMonth);
    setExpYear(newYear);
  };

  // Live Card Preview Object
  const previewCard: CardProduct = {
    id: initialCard?.id || 'preview-temp-id',
    name,
    tagline,
    tier,
    rarity,
    finish,
    holographicOverlay,
    network,
    price: Number(price) || 0,
    limit: Number(limit) || 0,
    dailyLimit: Number(dailyLimit) || 0,
    monthlyLimit: Number(monthlyLimit) || 0,
    stockCount: Number(stockCount) || 0,
    edition,
    description,
    perks,
    accentColor,
    featured,
    status,
    cardNumber: cardNumber.trim(),
    maskedIdentifier: maskedIdentifier.trim() || `•••• •••• •••• ${cardNumber.replace(/\s+/g, '').slice(-4) || '4821'}`,
    expMonth,
    expYear,
    expDate: formattedExpDate,
    cvv: cvv.trim() || '821',
    cardHolder: cardHolder.trim() || 'RAWAT VIP MEMBER',
    bankName: bankName.trim() || 'RAWAT RESERVE BANK',
    cardPin: cardPin.trim() || '4821',
    gradientClass: 'from-zinc-950 via-zinc-900 to-black',
    borderGlowClass: 'group-hover:border-purple-500/50',
    createdAt: initialCard?.createdAt || new Date().toISOString().split('T')[0]
  };

  const handleAddPerk = () => {
    if (!newPerkInput.trim()) return;
    setPerks([...perks, newPerkInput.trim()]);
    setNewPerkInput('');
  };

  const handleRemovePerk = (index: number) => {
    setPerks(perks.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setFormError('Card Name is required.');
      return;
    }
    if (price < 0) {
      setFormError('Price must be greater than or equal to 0.');
      return;
    }

    const cleanCardNumber = cardNumber.replace(/\s+/g, '');
    if (cleanCardNumber.length < 12) {
      setFormError('Please enter a valid card number (at least 12-16 digits).');
      return;
    }
    if (!cvv.trim()) {
      setFormError('CVV is required.');
      return;
    }

    setFormError(null);
    playSound('purchase', soundEnabled);

    const numericLimit = typeof limit === 'number' && !isNaN(limit) && limit >= 0 ? limit : Number(limit) || 0;
    const numericDailyLimit = typeof dailyLimit === 'number' && !isNaN(dailyLimit) && dailyLimit >= 0 ? dailyLimit : numericLimit;
    const numericMonthlyLimit = typeof monthlyLimit === 'number' && !isNaN(monthlyLimit) && monthlyLimit >= 0 ? monthlyLimit : numericLimit;

    onSaveCard(
      {
        name: name.trim(),
        tagline: tagline.trim(),
        tier,
        rarity,
        finish,
        holographicOverlay,
        network,
        price: Number(price),
        limit: numericLimit,
        dailyLimit: numericDailyLimit,
        monthlyLimit: numericMonthlyLimit,
        stockCount: Number(stockCount) || 0,
        edition: edition.trim(),
        description: description.trim(),
        perks,
        accentColor,
        featured,
        status,
        cardNumber: cardNumber.trim(),
        maskedIdentifier:
          maskedIdentifier.trim() || `•••• •••• •••• ${cleanCardNumber.slice(-4)}`,
        expMonth,
        expYear,
        expDate: formattedExpDate,
        cvv: cvv.trim(),
        cardHolder: cardHolder.trim() || 'RAWAT VIP MEMBER',
        bankName: bankName.trim() || 'RAWAT RESERVE BANK',
        cardPin: cardPin.trim() || cleanCardNumber.slice(-4),
        gradientClass: 'from-zinc-950 via-zinc-900 to-black',
        borderGlowClass: 'group-hover:border-purple-500/50'
      },
      initialCard?.id
    );
    onClose();
  };

  const finishes: CardFinish[] = [
    'obsidian',
    'gold',
    'platinum',
    'emerald',
    'amethyst',
    'carbon',
    'iridescent',
    'rose_gold'
  ];

  const tiers: CardTier[] = ['BLACK', 'GOLD', 'PLATINUM', 'ELITE', 'SPECIAL'];
  const rarities: CardRarity[] = ['Common', 'Rare', 'Epic', 'Mythic', 'Legendary'];
  const networks: CardNetwork[] = ['RAWAT', 'MASTERCARD', 'VISA'];

  const years = Array.from({ length: 14 }, (_, i) => String(2026 + i));
  const months = [
    { num: '01', label: '01 - Jan' },
    { num: '02', label: '02 - Feb' },
    { num: '03', label: '03 - Mar' },
    { num: '04', label: '04 - Apr' },
    { num: '05', label: '05 - May' },
    { num: '06', label: '06 - Jun' },
    { num: '07', label: '07 - Jul' },
    { num: '08', label: '08 - Aug' },
    { num: '09', label: '09 - Sep' },
    { num: '10', label: '10 - Oct' },
    { num: '11', label: '11 - Nov' },
    { num: '12', label: '12 - Dec' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-xl z-40 cursor-pointer"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-6xl rounded-3xl border border-white/20 bg-[#090a0f]/98 shadow-2xl backdrop-blur-2xl z-50 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-300 shadow-md shadow-purple-500/10">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold">
                  Card Architecture Engine
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[9px] font-mono font-bold">
                  {initialCard ? 'EDIT MODE' : 'CREATE MODE'}
                </span>
              </div>
              <h2 className="text-xl font-bold font-tech text-white">
                {initialCard ? `Edit Card: ${initialCard.name}` : 'Create New 3D Holographic Card'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body: Split Grid with Live 3D Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Left: 3D Holographic Live Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-start space-y-4 p-5 rounded-3xl bg-black/60 border border-white/10 backdrop-blur-md sticky top-0 self-start">
            <div className="flex items-center justify-between w-full pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-400" />
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  Live 3D Specimen
                </span>
              </div>
              <RarityBadge rarity={rarity} size="sm" showGlow={true} />
            </div>

            {/* 3D Card Interactive Preview */}
            <div className="py-4 flex items-center justify-center w-full min-h-[220px]">
              <Realistic3DCard
                card={previewCard}
                size="md"
                interactiveTilt={true}
                showFlipButton={true}
                isOwned={true}
                overlay={holographicOverlay}
                activeScanAnimation={true}
              />
            </div>
            
            {/* Quick Holographic Overlay Live Switcher in Preview */}
            <div className="w-full space-y-1.5 p-3 rounded-2xl bg-black/50 border border-purple-500/20">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-purple-300 uppercase tracking-wider font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>Live Hologram Overlay</span>
                </span>
                <span className="text-[9px] font-mono text-cyan-400 font-bold">
                  {getHologramConfig(holographicOverlay).badge}
                </span>
              </div>
              
              <select
                value={holographicOverlay}
                onChange={(e) => {
                  playSound('click', soundEnabled);
                  setHolographicOverlay(e.target.value as HolographicOverlayType);
                }}
                className="w-full px-3 py-1.5 rounded-xl bg-black/80 border border-purple-500/40 text-white font-mono text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {ALL_HOLOGRAMS.map((holoId) => (
                  <option key={holoId} value={holoId}>
                    {HOLOGRAM_CONFIGS[holoId].name}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-[10px] font-mono text-slate-400 text-center flex items-center gap-1">
              <RefreshCw className="w-3 h-3 text-purple-400 inline" />
              <span>Hover to tilt &bull; Click FLIP to inspect back with CVV & PIN</span>
            </p>

            {/* Live Card Credentials Summary Pill Grid */}
            <div className="w-full space-y-2.5 font-mono text-xs pt-3 border-t border-white/10 bg-white/[0.02] p-3.5 rounded-2xl">
              <div className="flex justify-between items-center text-slate-400">
                <span>Card Number:</span>
                <span className="text-white font-bold tracking-wider">{cardNumber || '•••• •••• •••• 4821'}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Expiry & CVV:</span>
                <span className="text-purple-300 font-bold">
                  {formattedExpDate} &bull; CVV: <strong className="text-white font-bold">{cvv}</strong>
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Overall Credit Limit:</span>
                <span className="text-sky-300 font-bold">₹{Number(limit || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Daily / Monthly Limit:</span>
                <span className="text-cyan-300 font-bold">
                  ₹{Number(dailyLimit || 0).toLocaleString('en-IN')} / ₹{Number(monthlyLimit || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Vault Price:</span>
                <span className="text-emerald-400 font-bold">₹{Number(price || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>ATM / Security PIN:</span>
                <span className="text-amber-300 font-bold">{cardPin || '4821'}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Issuing Bank:</span>
                <span className="text-slate-200 truncate max-w-[150px]">{bankName}</span>
              </div>
            </div>

            {/* Quick Generator Button */}
            <button
              type="button"
              onClick={handleRandomizeCredentials}
              className="w-full py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Wand2 className="w-4 h-4 text-purple-400" />
              <span>⚡ Generate Random Credentials</span>
            </button>
          </div>

          {/* Right: Form Controls (7 cols) */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6 font-mono text-xs">
            
            {formError && (
              <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
                <X className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* ========================================================
                SECTION 1: CARD NUMBER, CVV, EXPIRY YEAR/MONTH & LIMITS
            ======================================================== */}
            <div className="p-4 sm:p-5 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
                <div className="flex items-center gap-2 text-white font-tech font-bold text-sm">
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  <span>Card Credentials, CVV, Expiry & Limits</span>
                </div>
                <span className="text-[10px] text-purple-300 uppercase tracking-widest font-mono">
                  Essential Specs
                </span>
              </div>

              {/* Card Number & Masked Identifier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-purple-300 uppercase font-semibold mb-1 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-purple-400" />
                    <span>Card Number (16-Digit) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    placeholder="4532 8912 3456 4821"
                    maxLength={19}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/70 border border-purple-500/40 text-white font-mono font-bold text-sm tracking-wider focus:outline-none focus:border-purple-400"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Unmasked number delivered upon vault acquisition.
                  </span>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 uppercase font-semibold mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Masked Identifier (Storefront Display)</span>
                  </label>
                  <input
                    type="text"
                    value={maskedIdentifier}
                    onChange={(e) => setMaskedIdentifier(e.target.value)}
                    placeholder="•••• •••• •••• 4821"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-slate-300 font-mono text-sm tracking-wider focus:outline-none focus:border-purple-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Auto-synced with card number last 4 digits.
                  </span>
                </div>
              </div>

              {/* CVV, Expiry Month & Expiry Year */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] text-purple-300 uppercase font-semibold mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>CVV / CVC Code *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="821"
                    maxLength={4}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/70 border border-purple-500/40 text-white font-mono font-bold text-sm tracking-widest focus:outline-none focus:border-purple-400 text-center"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block text-center">
                    3 or 4-digit security code
                  </span>
                </div>

                <div>
                  <label className="text-[11px] text-purple-300 uppercase font-semibold mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    <span>Expiry Month *</span>
                  </label>
                  <select
                    value={expMonth}
                    onChange={(e) => setExpMonth(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/80 border border-purple-500/40 text-white text-xs font-mono focus:outline-none focus:border-purple-400 cursor-pointer"
                  >
                    {months.map((m) => (
                      <option key={m.num} value={m.num}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-purple-300 uppercase font-semibold mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    <span>Expiry Year *</span>
                  </label>
                  <select
                    value={expYear}
                    onChange={(e) => setExpYear(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/80 border border-purple-500/40 text-white text-xs font-mono focus:outline-none focus:border-purple-400 cursor-pointer"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y} ({y.slice(-2)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Total Credit Limit (₹) & Presets */}
              <div className="space-y-2 pt-2 border-t border-purple-500/20">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-sky-300 uppercase font-semibold flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-sky-400" />
                    <span>Overall Credit / Spending Limit (₹ INR) *</span>
                  </label>
                  <span className="text-sky-300 font-bold">
                    ₹{Number(limit || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="number"
                  required
                  min={0}
                  step="any"
                  value={limit}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : Number(e.target.value);
                    setLimit(val);
                  }}
                  placeholder="Enter any limit (e.g. 500000)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/70 border border-sky-500/40 text-sky-300 font-bold text-base focus:outline-none focus:border-sky-400"
                />
                <p className="text-[10px] text-slate-400">
                  Customizable: Enter any arbitrary limit you want with no restrictions or auto-adjustments.
                </p>
                {/* 10x+ Quick Multipliers based on Card Price */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-amber-400 font-bold uppercase font-mono mr-1">
                    ⚡ 10X+ Multipliers:
                  </span>
                  {[
                    { label: '10X', mult: 10 },
                    { label: '12X', mult: 12 },
                    { label: '15X', mult: 15 },
                    { label: '20X', mult: 20 },
                  ].map(({ label, mult }) => {
                    const calculated = Math.round((Number(price) || 499) * mult);
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          playSound('click', soundEnabled);
                          setLimit(calculated);
                          setDailyLimit(Math.round(calculated * 0.45));
                          setMonthlyLimit(calculated);
                        }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          limit === calculated
                            ? 'bg-amber-400 text-black border border-amber-300 shadow-sm shadow-amber-500/30'
                            : 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/50 border border-amber-500/30'
                        }`}
                      >
                        {label} (₹{calculated.toLocaleString('en-IN')})
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[5000, 10000, 15000, 25000, 35000, 50000, 100000, 250000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        playSound('click', soundEnabled);
                        setLimit(preset);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                        limit === preset
                          ? 'bg-sky-500 text-black font-bold'
                          : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      ₹{preset >= 100000 ? `${(preset / 100000).toFixed(preset >= 1000000 ? 0 : 1)} Lakh` : `${preset.toLocaleString('en-IN')}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily Limit & Monthly Limit Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-purple-500/20">
                {/* Daily Limit */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-cyan-300 uppercase font-semibold flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Daily Limit (₹ INR) *</span>
                    </label>
                    <span className="text-cyan-300 font-bold text-[11px]">
                      ₹{Number(dailyLimit || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={dailyLimit}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : Number(e.target.value);
                      setDailyLimit(val);
                    }}
                    placeholder="Enter daily limit"
                    className="w-full px-3 py-2 rounded-xl bg-black/70 border border-cyan-500/40 text-cyan-200 font-bold text-sm focus:outline-none focus:border-cyan-400"
                  />
                  <div className="flex flex-wrap gap-1 mt-1">
                    {[10000, 25000, 50000, 100000, 200000, 500000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          playSound('click', soundEnabled);
                          setDailyLimit(preset);
                        }}
                        className={`px-2 py-0.5 rounded text-[9px] font-mono transition-all cursor-pointer ${
                          dailyLimit === preset
                            ? 'bg-cyan-500 text-black font-bold'
                            : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                        }`}
                      >
                        ₹{(preset / 1000).toFixed(0)}k
                      </button>
                    ))}
                  </div>
                </div>

                {/* Monthly Limit */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-indigo-300 uppercase font-semibold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Monthly Limit (₹ INR) *</span>
                    </label>
                    <span className="text-indigo-300 font-bold text-[11px]">
                      ₹{Number(monthlyLimit || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={monthlyLimit}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : Number(e.target.value);
                      setMonthlyLimit(val);
                    }}
                    placeholder="Enter monthly limit"
                    className="w-full px-3 py-2 rounded-xl bg-black/70 border border-indigo-500/40 text-indigo-200 font-bold text-sm focus:outline-none focus:border-indigo-400"
                  />
                  <div className="flex flex-wrap gap-1 mt-1">
                    {[50000, 100000, 250000, 500000, 1000000, 2500000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          playSound('click', soundEnabled);
                          setMonthlyLimit(preset);
                        }}
                        className={`px-2 py-0.5 rounded text-[9px] font-mono transition-all cursor-pointer ${
                          monthlyLimit === preset
                            ? 'bg-indigo-500 text-black font-bold'
                            : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                        }`}
                      >
                        ₹{preset >= 100000 ? `${(preset / 100000).toFixed(preset >= 1000000 ? 0 : 1)}L` : `${preset.toLocaleString('en-IN')}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cardholder Name, Issuing Bank, and ATM PIN */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-purple-500/20">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold mb-1 block">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="RAWAT VIP MEMBER"
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold mb-1 block">
                    Issuing Bank / Entity
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="RAWAT RESERVE BANK"
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold mb-1 block">
                    ATM / Security PIN
                  </label>
                  <input
                    type="text"
                    value={cardPin}
                    onChange={(e) => setCardPin(e.target.value.slice(0, 6))}
                    placeholder="4821"
                    maxLength={6}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-amber-300 font-bold text-xs focus:outline-none focus:border-purple-500 text-center"
                  />
                </div>
              </div>
            </div>

            {/* ========================================================
                SECTION 2: GENERAL INFORMATION & PRICING
            ======================================================== */}
            <div className="space-y-4">
              {/* Card Name & Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-slate-300 uppercase font-semibold mb-1 block">
                    Card Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. RAWAT CHRONO OBSIDIAN"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-tech text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 uppercase font-semibold mb-1 block">
                    Tagline / Subtitle
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Next-Gen Quantum Luxury Metal"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Price, Stock Units & Edition */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] text-emerald-400 uppercase font-semibold mb-1 block">
                    Vault Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-emerald-500/30 text-emerald-400 font-bold text-sm focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 uppercase font-semibold mb-1 block">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={stockCount}
                    onChange={(e) => setStockCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 uppercase font-semibold mb-1 block">
                    Edition Serial
                  </label>
                  <input
                    type="text"
                    value={edition}
                    onChange={(e) => setEdition(e.target.value)}
                    placeholder="First Issue #01"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* ========================================================
                SECTION 3: MATERIAL FINISH & AESTHETICS
            ======================================================== */}
            <div className="space-y-4">
              <div>
                <label className="text-[11px] text-slate-300 uppercase font-semibold mb-1.5 block">
                  Material Shader Finish
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {finishes.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => {
                        playSound('click', soundEnabled);
                        setFinish(f);
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs capitalize transition-all cursor-pointer ${
                        finish === f
                          ? 'bg-purple-600/30 text-purple-200 border-purple-400 font-bold shadow'
                          : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {f.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Holographic Overlay FX Shader */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] text-cyan-300 uppercase font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Holographic Diffraction Overlay Effect</span>
                  </label>
                  <span className="text-[10px] font-mono text-cyan-400">
                    {getHologramConfig(holographicOverlay).name}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {ALL_HOLOGRAMS.map((holoId) => {
                    const cfg = HOLOGRAM_CONFIGS[holoId];
                    const isSelected = holographicOverlay === holoId;
                    return (
                      <button
                        key={holoId}
                        type="button"
                        onClick={() => {
                          playSound('click', soundEnabled);
                          setHolographicOverlay(holoId);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                          isSelected
                            ? 'bg-white/[0.08] text-white shadow-md ring-1'
                            : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.05]'
                        }`}
                        style={{
                          borderColor: isSelected ? cfg.accentColor : undefined,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: cfg.accentColor }}
                          />
                          {isSelected && <Check className="w-3 h-3 text-cyan-400" />}
                        </div>
                        <div className="font-tech font-bold text-xs truncate mt-1 text-white">
                          {cfg.name.split(' ')[0]}
                        </div>
                        <div className="text-[8px] font-mono text-slate-500 truncate">
                          {cfg.badge}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tier, Rarity, Network & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 uppercase font-semibold mb-1 block">
                  Card Tier
                </label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value as CardTier)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none cursor-pointer"
                >
                  {tiers.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 uppercase font-semibold mb-1 block">
                  Rarity Grade
                </label>
                <select
                  value={rarity}
                  onChange={(e) => setRarity(e.target.value as CardRarity)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none cursor-pointer"
                >
                  {rarities.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 uppercase font-semibold mb-1 block">
                  Payment Network
                </label>
                <select
                  value={network}
                  onChange={(e) => setNetwork(e.target.value as CardNetwork)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none cursor-pointer"
                >
                  {networks.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 uppercase font-semibold mb-1 block">
                  Catalog Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none cursor-pointer"
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="LIMITED">LIMITED</option>
                  <option value="VAULT_ONLY">VAULT ONLY</option>
                </select>
              </div>
            </div>

            {/* Ambient Glow Accent Color */}
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/10">
              <label className="text-[11px] text-slate-300 uppercase font-semibold">
                Ambient Glow Color
              </label>
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-24 px-2 py-1 rounded-lg bg-black/50 border border-white/10 text-slate-300 text-xs font-mono"
                />
                <div className="flex items-center gap-1.5 ml-auto">
                  {['#a855f7', '#eab308', '#38bdf8', '#10b981', '#f43f5e', '#ec4899'].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setAccentColor(col)}
                      style={{ backgroundColor: col }}
                      className="w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition-transform cursor-pointer"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-[11px] text-slate-300 uppercase font-semibold mb-1 block">
                Card Description & Heritage
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Elite collectible card description..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            {/* Perks Builder */}
            <div>
              <label className="text-[11px] text-slate-300 uppercase font-semibold mb-1.5 block">
                Vault Perks & Capabilities
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="e.g. 5% Forex Zero Markup & Airport Lounge Pass"
                  value={newPerkInput}
                  onChange={(e) => setNewPerkInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPerk();
                    }
                  }}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={handleAddPerk}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {perks.map((p, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-[11px]"
                  >
                    <span>{p}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePerk(idx)}
                      className="text-slate-400 hover:text-rose-400 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Submit Bar */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 sticky bottom-0 bg-[#090a0f] py-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/15 text-slate-300 font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition-all shadow-lg shadow-purple-900/40 cursor-pointer flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>{initialCard ? 'Save All Card Changes' : 'Deploy Card to Store'}</span>
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};
