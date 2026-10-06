import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  QrCode,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Smartphone,
  Download,
  Power,
  ListOrdered,
  RefreshCw,
  Wallet as WalletIcon,
  ChevronDown,
  ChevronUp,
  Lock,
  ExternalLink,
  Zap,
  Info
} from 'lucide-react';
import { playSound } from '../../utils/audio';
import { GooglePayLogo, PhonePeLogo, PaytmLogo, UpiIconBadge, BhimLogo } from './payment/UpiLogos';
import { PaymentMethodType, PaymentRequestStatus } from '../../types';
import { buildUpiUri, generateUpiQrSvg } from '../../utils/qr';
import { ScratchCardModal } from '../rewards/ScratchCardModal';

type CheckoutStep = 'AMOUNT_ENTRY' | 'UPI_SELECTION' | 'PAYMENT_STATUS';

export const PaymentModal: React.FC = () => {
  const {
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    paymentSettings,
    currentUser,
    currentBalance,
    createPaymentRequest,
    createUpiPaymentOrder,
    verifyUpiPayment,
    pollPaymentStatus,
    simulateDevPayment,
    paymentRequests,
    formatPrice,
    soundEnabled
  } = useStore();

  const minAmount = paymentSettings.minDepositAmount ?? 100;
  const maxAmount = paymentSettings.maxDepositAmount ?? 50000;
  const presetAmounts = paymentSettings.quickPresetAmounts && paymentSettings.quickPresetAmounts.length > 0
    ? paymentSettings.quickPresetAmounts
    : [500, 1000, 2000, 3000, 5000, 10000];

  const defaultInitialAmount = presetAmounts.includes(500) ? 500 : (presetAmounts[0] || 500);

  // Form & Step State
  const [step, setStep] = useState<CheckoutStep>('AMOUNT_ENTRY');
  const [paymentTab, setPaymentTab] = useState<'UPI_APPS' | 'QR_CODE' | 'DIRECT_UPI'>('QR_CODE');
  const [amount, setAmount] = useState<number>(defaultInitialAmount);
  const [customAmount, setCustomAmount] = useState<string>(defaultInitialAmount.toString());
  const [showScratchCardModal, setShowScratchCardModal] = useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(null);
  const [activePaymentOrder, setActivePaymentOrder] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentRequestStatus>('PROCESSING');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [utrRef, setUtrRef] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedBackupUpi, setCopiedBackupUpi] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isTestMode, setIsTestMode] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 minutes countdown
  const [isVerifying, setIsVerifying] = useState(false);

  const pollingRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Detect Mobile device for native deep links
  const isMobile = typeof window !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = typeof window !== 'undefined' && /Android/i.test(navigator.userAgent);

  // Sync real-time Firestore updates on the current active payment
  useEffect(() => {
    if (!activePaymentOrder?.paymentId) return;

    const matchedRequest = paymentRequests.find((r) => r.id === activePaymentOrder.paymentId);
    if (matchedRequest) {
      if (matchedRequest.status === 'APPROVED' || matchedRequest.status === 'SUCCESS') {
        setPaymentStatus('SUCCESS');
        setStatusMessage('Payment verified and credited to your wallet!');
      } else if (matchedRequest.status === 'REJECTED' || matchedRequest.status === 'FAILED') {
        setPaymentStatus('FAILED');
        setStatusMessage(matchedRequest.rejectionReason || 'Payment verification failed.');
      } else if (matchedRequest.status === 'CANCELLED') {
        setPaymentStatus('CANCELLED');
        setStatusMessage('Payment was cancelled.');
      }
    }
  }, [paymentRequests, activePaymentOrder?.paymentId]);

  // Polling loop for server verification
  useEffect(() => {
    if (step === 'PAYMENT_STATUS' && paymentStatus === 'PROCESSING' && activePaymentOrder?.paymentId) {
      // Start 15-minute countdown (900 seconds) for generous payment completion time
      setTimerSeconds(900);
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Do not immediately fail; allow user to enter UTR or verify
            setStatusMessage('Time window completed. If you sent the payment, please enter your UTR number below to verify.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Poll status every 3 seconds
      pollingRef.current = setInterval(async () => {
        const res = await pollPaymentStatus(activePaymentOrder.paymentId);
        if (res.success && res.status === 'SUCCESS') {
          clearInterval(pollingRef.current);
          clearInterval(timerRef.current);
          setPaymentStatus('SUCCESS');
          playSound('purchase', soundEnabled);
        } else if (res.status === 'FAILED' || res.status === 'CANCELLED') {
          clearInterval(pollingRef.current);
          clearInterval(timerRef.current);
          setPaymentStatus(res.status);
        }
      }, 3000);

      return () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [step, paymentStatus, activePaymentOrder?.paymentId, pollPaymentStatus, soundEnabled]);

  if (!isPaymentModalOpen) return null;

  const isGatewayActive = paymentSettings.isPaymentActive ?? true;

  const handleClose = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    playSound('click', soundEnabled);
    setIsPaymentModalOpen(false);
    setStep('AMOUNT_ENTRY');
    setActivePaymentOrder(null);
    setPaymentStatus('PROCESSING');
    setErrorMsg(null);
    setSelectedMethod(null);
    setIsVerifying(false);
  };

  const handlePresetSelect = (val: number) => {
    setAmount(val);
    setCustomAmount(val.toString());
    setErrorMsg(null);
    playSound('click', soundEnabled);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setAmount(num);
    }
  };

  const handleContinueToPayment = () => {
    setErrorMsg(null);
    if (!currentUser) {
      setErrorMsg('Please sign in to your RAWAT account before adding funds.');
      return;
    }
    if (amount < minAmount) {
      setErrorMsg(`Minimum deposit amount is ${formatPrice(minAmount)}.`);
      return;
    }
    if (amount > maxAmount) {
      setErrorMsg(`Maximum deposit limit per transaction is ${formatPrice(maxAmount)}.`);
      return;
    }

    playSound('click', soundEnabled);
    setStep('UPI_SELECTION');
  };

  const handleSelectUpiMethod = async (method: PaymentMethodType) => {
    setErrorMsg(null);
    setSelectedMethod(method);
    setIsVerifying(true);
    playSound('click', soundEnabled);

    try {
      const res = await createUpiPaymentOrder({
        amount,
        paymentMethod: method,
        deviceType: isMobile ? 'mobile' : 'desktop',
        isTestMode,
      });

      if (!res.success || !res.order) {
        setErrorMsg(res.message || 'Failed to initialize payment.');
        setIsVerifying(false);
        return;
      }

      setActivePaymentOrder(res.order);
      setPaymentStatus('PROCESSING');
      setStep('PAYMENT_STATUS');
      setIsVerifying(false);

      // Determine standard and app-specific intent link with pre-filled amount & notes
      const cleanAmt = amount.toFixed(2);
      const merchantUpi = paymentSettings.upiId || 'rawatstore@upi';
      const merchantName = paymentSettings.paymentDisplayName || 'RAWAT CARD STORE';
      const note = `RAWAT Store ${res.order.paymentId}`;

      let intentUrl = `upi://pay?pa=${encodeURIComponent(merchantUpi)}&pn=${encodeURIComponent(merchantName)}&am=${cleanAmt}&cu=INR&tn=${encodeURIComponent(note)}&tr=${encodeURIComponent(res.order.paymentId)}`;

      if (method === 'GOOGLE_PAY') {
        intentUrl = `tez://upi/pay?pa=${encodeURIComponent(merchantUpi)}&pn=${encodeURIComponent(merchantName)}&am=${cleanAmt}&cu=INR&tn=${encodeURIComponent(note)}&tr=${encodeURIComponent(res.order.paymentId)}`;
      } else if (method === 'PHONEPE') {
        intentUrl = `phonepe://pay?pa=${encodeURIComponent(merchantUpi)}&pn=${encodeURIComponent(merchantName)}&am=${cleanAmt}&cu=INR&tn=${encodeURIComponent(note)}&tr=${encodeURIComponent(res.order.paymentId)}`;
      } else if (method === 'PAYTM') {
        intentUrl = `paytmmp://pay?pa=${encodeURIComponent(merchantUpi)}&pn=${encodeURIComponent(merchantName)}&am=${cleanAmt}&cu=INR&tn=${encodeURIComponent(note)}&tr=${encodeURIComponent(res.order.paymentId)}`;
      }

      // Automatically launch direct UPI App intent on mobile device
      if (method !== 'QR_SCAN' && method !== 'MANUAL_UTR') {
        try {
          // Standard URI launch for native UPI apps with amount prefilled
          window.location.href = intentUrl;
        } catch (e) {
          console.warn('Could not launch direct intent, falling back to QR display', e);
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to initiate UPI transaction.');
      setIsVerifying(false);
    }
  };

  const handleDirectUtrSubmit = async () => {
    if (!utrRef.trim()) {
      setErrorMsg('Please enter the 12-digit UTR or Transaction Reference number from your UPI app.');
      return;
    }
    setErrorMsg(null);
    setIsVerifying(true);
    playSound('click', soundEnabled);

    const orderAmount = activePaymentOrder?.amount || amount;
    try {
      const res = createPaymentRequest(orderAmount, utrRef.trim());
      setIsVerifying(false);
      if (res.success && res.request) {
        setActivePaymentOrder({
          paymentId: res.request.id,
          amount: res.request.amount,
          paymentMethod: res.request.paymentMethod,
          utrRef: res.request.utrRef,
          providerReference: res.request.utrRef,
        });
        setPaymentStatus('PENDING_VERIFICATION');
        setStatusMessage('Deposit request submitted! Once verified by the admin, funds will be credited to your account.');
        setStep('PAYMENT_STATUS');
        playSound('click', soundEnabled);
      } else {
        setErrorMsg(res.message || 'Failed to submit payment request.');
      }
    } catch (e: any) {
      setIsVerifying(false);
      setErrorMsg(e?.message || 'Failed to submit payment request.');
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(paymentSettings.upiId);
    setCopiedUpi(true);
    playSound('click', soundEnabled);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyBackupUpi = () => {
    if (paymentSettings.backupUpiId) {
      navigator.clipboard.writeText(paymentSettings.backupUpiId);
      setCopiedBackupUpi(true);
      playSound('click', soundEnabled);
      setTimeout(() => setCopiedBackupUpi(false), 2000);
    }
  };

  const handleSimulateDevAction = async (result: 'SUCCESS' | 'FAILED' | 'CANCELLED') => {
    if (!activePaymentOrder?.paymentId) return;
    setIsVerifying(true);
    await simulateDevPayment({
      paymentId: activePaymentOrder.paymentId,
      simulateResult: result,
    });
    setIsVerifying(false);
  };

  // Generate dynamic UPI Deep Link URI for current amount or active order
  const currentUpiDeepLink = buildUpiUri({
    upiId: paymentSettings.upiId || 'rawatstore@upi',
    name: paymentSettings.paymentDisplayName || 'RAWAT CARD STORE',
    amount: activePaymentOrder?.amount || amount,
    note: activePaymentOrder?.paymentId ? `RAWAT Topup ${activePaymentOrder.paymentId}` : `RAWAT Topup ₹${amount}`,
  });

  const handleDownloadQr = () => {
    const svgEl = document.getElementById('upi-dynamic-qrcode-svg');
    const cleanAmt = (activePaymentOrder?.amount || amount).toFixed(2);
    if (svgEl) {
      const svgData = new XMLSerializer().serializeToString(svgEl);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `UPI-QR-RAWAT-${cleanAmt}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      const svgData = generateUpiQrSvg(currentUpiDeepLink, 400, { theme: 'phonepe', centerBadge: 'phonepe' });
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `UPI-QR-RAWAT-${cleanAmt}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    playSound('click', soundEnabled);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-[#08090f]/95 p-5 sm:p-7 shadow-2xl backdrop-blur-2xl text-slate-100 overflow-hidden max-h-[94vh] overflow-y-auto">
        {/* Glow Accent */}
        <div className="absolute -top-20 right-0 w-64 h-32 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {!isGatewayActive ? (
          /* ========================================================
             MAINTENANCE / GATEWAY PAUSED STATE
          ======================================================== */
          <div className="text-center py-10 space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Power className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono tracking-wider bg-rose-950/80 text-rose-400 border border-rose-500/30 uppercase font-semibold">
                PAYMENT GATEWAY PAUSED
              </span>
              <h2 className="text-2xl font-tech font-bold text-white">Temporary Gateway Maintenance</h2>
              <p className="text-xs text-slate-400 font-mono max-w-sm mx-auto">
                {paymentSettings.maintenanceMessage ||
                  'UPI deposits are temporarily undergoing scheduled maintenance. Please check back shortly.'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="mt-4 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-tech font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Return to Store
            </button>
          </div>
        ) : step === 'AMOUNT_ENTRY' ? (
          /* ========================================================
             STEP 1: ENTER AMOUNT (ADD FUNDS FLOW)
          ======================================================== */
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Header & Balance Context */}
            <div className="text-center space-y-1.5 pt-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 font-mono text-[10px] uppercase tracking-wider">
                <WalletIcon className="w-3.5 h-3.5 text-purple-400" />
                <span>RAWAT VAULT WALLET</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-tech font-extrabold text-white tracking-tight uppercase">
                ADD FUNDS
              </h2>
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-mono">
                <span>Current Balance:</span>
                <span className="text-emerald-400 font-bold">{formatPrice(currentBalance)}</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2 animate-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Amount Selection Card */}
            <div className="rounded-2xl border border-white/15 bg-black/60 p-4 space-y-4 shadow-inner">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <span>Enter Amount</span>
                <span>Limits: {formatPrice(minAmount)} - {formatPrice(maxAmount)}</span>
              </div>

              {/* Quick Preset Pills */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {presetAmounts.slice(0, 6).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      amount === preset
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400'
                        : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>

              {/* Custom Input Field */}
              <div className="relative">
                <span className="absolute left-4 top-3 text-2xl font-mono font-bold text-purple-400">₹</span>
                <input
                  type="number"
                  min={minAmount}
                  max={maxAmount}
                  step="1"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  placeholder={`Min ${minAmount} - Max ${maxAmount}`}
                  className="w-full text-center font-mono text-2xl sm:text-3xl font-bold rounded-2xl border border-white/15 bg-black/80 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 shadow-inner"
                />
              </div>
            </div>

            {/* Order Summary Breakdown */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-400">
                <span>Deposit Amount:</span>
                <span className="text-white font-bold">{formatPrice(amount)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Payment Processing Fee:</span>
                <span className="text-emerald-400 font-bold">₹0.00 (100% Free)</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Payment Method:</span>
                <span className="text-purple-300 font-bold">UPI Instant Checkout</span>
              </div>
              <div className="flex items-center justify-between text-slate-300 pt-2 border-t border-white/10">
                <span className="font-bold">Total Wallet Credit:</span>
                <span className="text-emerald-400 font-extrabold text-sm">{formatPrice(amount)}</span>
              </div>
            </div>

            {/* CTA Continue to Payment */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleContinueToPayment}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-tech font-bold text-sm tracking-wider uppercase shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Continue to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-slate-500 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>256-bit Encrypted Banking & Server-Verified UPI Settlement</span>
              </div>
            </div>
          </div>
        ) : step === 'UPI_SELECTION' ? (
          /* ========================================================
             STEP 2: UPI PAYMENT OPTIONS & INTENT SELECTION
          ======================================================== */
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Header with Back Navigation */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <button
                type="button"
                onClick={() => {
                  playSound('click', soundEnabled);
                  setStep('AMOUNT_ENTRY');
                }}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div className="text-center">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Amount to Pay</div>
                <div className="text-lg font-tech font-extrabold text-emerald-400">{formatPrice(amount)}</div>
              </div>
              <div className="w-12 text-right">
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-bold">
                  UPI
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2 animate-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Top Payment Mode Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-black/60 border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setPaymentTab('QR_CODE');
                  playSound('click', soundEnabled);
                }}
                className={`py-2 px-1 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  paymentTab === 'QR_CODE'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Scan QR</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentTab('UPI_APPS');
                  playSound('click', soundEnabled);
                }}
                className={`py-2 px-1 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  paymentTab === 'UPI_APPS'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>UPI Apps</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentTab('DIRECT_UPI');
                  playSound('click', soundEnabled);
                }}
                className={`py-2 px-1 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  paymentTab === 'DIRECT_UPI'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Copy className="w-3.5 h-3.5" />
                <span>UPI ID / UTR</span>
              </button>
            </div>

            {/* TAB 1: PROMINENT DYNAMIC QR CODE SCANNER */}
            {paymentTab === 'QR_CODE' && (
              <div className="space-y-4 animate-in fade-in-50">
                <div className="p-4 sm:p-5 rounded-3xl bg-black/80 border border-purple-500/25 shadow-inner text-center space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold shadow-sm">
                    <span>Scan & Pay:</span>
                    <span className="text-white text-sm font-extrabold">{formatPrice(amount)}</span>
                  </div>

                  {/* Auto-Prefilled Dynamic UPI QR Code */}
                  <div className="flex justify-center pt-1">
                    <div className="relative inline-block p-4 bg-white rounded-2xl shadow-xl shadow-purple-600/15 border-2 border-purple-500/30">
                      <QRCodeSVG
                        id="upi-dynamic-qrcode-svg"
                        value={currentUpiDeepLink}
                        size={210}
                        level="H"
                        bgColor="#ffffff"
                        fgColor="#0f172a"
                        marginSize={1}
                        className="w-48 h-48 sm:w-52 sm:h-52 rounded-lg"
                      />
                      <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-mono text-[10px] font-bold shadow-md uppercase tracking-wider whitespace-nowrap">
                        Auto-Prefilled ₹{amount}
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] font-mono text-slate-400 max-w-xs mx-auto pt-2">
                    Scan with <strong className="text-slate-200">PhonePe, Google Pay, Paytm, BHIM</strong> or any UPI scanner.
                  </p>

                  {/* Verified UPI ID Details */}
                  <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/10 max-w-xs mx-auto text-left space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400">Primary UPI:</span>
                      <span className="text-purple-300 font-bold font-mono">{paymentSettings.upiId || 'rawatcard@ybl'}</span>
                    </div>
                    {paymentSettings.backupUpiId && (
                      <div className="flex items-center justify-between text-[10px] font-mono border-t border-white/5 pt-1">
                        <span className="text-slate-500">Backup UPI:</span>
                        <span className="text-slate-300 font-mono">{paymentSettings.backupUpiId}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons: Copy UPI ID & Download */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      {copiedUpi ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">UPI Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-purple-400" />
                          <span>Copy UPI: {paymentSettings.upiId || 'rawatcard@ybl'}</span>
                        </>
                      )}
                    </button>

                    {paymentSettings.backupUpiId && (
                      <button
                        type="button"
                        onClick={handleCopyBackupUpi}
                        className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedBackupUpi ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-300">Backup Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>Copy Backup</span>
                          </>
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleDownloadQr}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Download QR Image"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download QR</span>
                    </button>
                  </div>
                </div>

                {/* UTR Input Section */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                    <span className="font-bold text-purple-300">After payment, enter 12-digit UTR:</span>
                    <span className="text-[10px] text-slate-400">Ref / Txn No.</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={utrRef}
                      onChange={(e) => setUtrRef(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                      placeholder="e.g. 423589123456"
                      maxLength={20}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/70 text-white font-mono text-xs placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="button"
                      disabled={isVerifying}
                      onClick={handleDirectUtrSubmit}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-tech font-bold text-xs uppercase tracking-wider shadow-md shadow-purple-600/30 transition-all cursor-pointer whitespace-nowrap"
                    >
                      {isVerifying ? 'Submitting...' : 'Submit UTR'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ONE-CLICK UPI APPS INTENT */}
            {paymentTab === 'UPI_APPS' && (
              <div className="space-y-2 animate-in fade-in-50">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider px-1">
                  <span>Select UPI App</span>
                  <span className="text-[10px] text-emerald-400 font-bold">Opens with ₹{amount}</span>
                </div>

                {/* 1. Google Pay */}
                <button
                  type="button"
                  disabled={isVerifying}
                  onClick={() => handleSelectUpiMethod('GOOGLE_PAY')}
                  className="w-full p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-blue-500/40 transition-all flex items-center justify-between group cursor-pointer shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center p-2 border border-white/10 group-hover:border-blue-500/30 transition-colors">
                      <GooglePayLogo className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-tech font-bold text-white group-hover:text-blue-400 transition-colors">
                        Google Pay
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {isAndroid ? 'Direct checkout on Android' : 'Pay via GPay app / UPI'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 text-[10px] font-mono font-semibold">
                      Instant
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>

                {/* 2. PhonePe */}
                <button
                  type="button"
                  disabled={isVerifying}
                  onClick={() => handleSelectUpiMethod('PHONEPE')}
                  className="w-full p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-purple-500/40 transition-all flex items-center justify-between group cursor-pointer shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center p-2 border border-white/10 group-hover:border-purple-500/30 transition-colors">
                      <PhonePeLogo className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-tech font-bold text-white group-hover:text-purple-400 transition-colors">
                        PhonePe
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">Instant UPI authorization</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 text-[10px] font-mono font-semibold">
                      Recommended
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>

                {/* 3. Paytm */}
                <button
                  type="button"
                  disabled={isVerifying}
                  onClick={() => handleSelectUpiMethod('PAYTM')}
                  className="w-full p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-500/40 transition-all flex items-center justify-between group cursor-pointer shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center p-2 border border-white/10 group-hover:border-cyan-500/30 transition-colors">
                      <PaytmLogo className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-tech font-bold text-white group-hover:text-cyan-400 transition-colors">
                        Paytm UPI
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">Pay directly via Paytm app</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>

                {/* 4. Other UPI Apps */}
                <button
                  type="button"
                  disabled={isVerifying}
                  onClick={() => handleSelectUpiMethod('OTHER_UPI')}
                  className="w-full p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-emerald-500/40 transition-all flex items-center justify-between group cursor-pointer shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center p-2 border border-white/10 group-hover:border-emerald-500/30 transition-colors">
                      <UpiIconBadge className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-tech font-bold text-white group-hover:text-emerald-400 transition-colors">
                        Other UPI Apps
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">BHIM, Cred, Amazon Pay, or Any Bank UPI</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              </div>
            )}

            {/* TAB 3: DIRECT UPI ID & MANUAL UTR SUBMISSION */}
            {paymentTab === 'DIRECT_UPI' && (
              <div className="space-y-4 animate-in fade-in-50">
                {/* Primary UPI ID Box */}
                <div className="p-4 rounded-2xl bg-black/80 border border-white/15 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>Store Merchant UPI ID:</span>
                    <span className="text-emerald-400 font-bold">100% Verified</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-purple-950/40 border border-purple-500/30">
                    <span className="font-mono text-sm sm:text-base font-bold text-white tracking-wide">
                      {paymentSettings.upiId || 'rawatstore@upi'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedUpi ? 'COPIED' : 'COPY'}</span>
                    </button>
                  </div>

                  {paymentSettings.backupUpiId && (
                    <div className="pt-1">
                      <div className="text-[11px] font-mono text-slate-400 mb-1">Backup UPI ID:</div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="font-mono text-xs text-slate-300">{paymentSettings.backupUpiId}</span>
                        <button
                          type="button"
                          onClick={handleCopyBackupUpi}
                          className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-200 font-mono text-[10px] transition-all flex items-center gap-1 cursor-pointer"
                        >
                          {copiedBackupUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedBackupUpi ? 'COPIED' : 'COPY'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Instructions */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs font-mono space-y-1.5 text-slate-300">
                  <div className="text-purple-300 font-bold text-[11px]">HOW TO PAY MANUALLY:</div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400">
                    <li>Copy the Merchant UPI ID above.</li>
                    <li>Open any UPI App and send exact amount: <strong className="text-white">{formatPrice(amount)}</strong>.</li>
                    <li>Copy the 12-digit UTR / Reference ID from the payment receipt.</li>
                    <li>Paste below and click Submit to get your balance credited.</li>
                  </ol>
                </div>

                {/* UTR Input Form */}
                <div className="space-y-2">
                  <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                    Enter 12-Digit UTR / Transaction Reference ID:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={utrRef}
                      onChange={(e) => setUtrRef(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                      placeholder="e.g. 423589123456"
                      maxLength={20}
                      className="flex-1 px-3.5 py-3 rounded-2xl border border-white/15 bg-black/80 text-white font-mono text-xs placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="button"
                      disabled={isVerifying}
                      onClick={handleDirectUtrSubmit}
                      className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-tech font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all cursor-pointer whitespace-nowrap"
                    >
                      {isVerifying ? 'Submitting...' : 'Submit Deposit'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Test Sandbox Badge for Dev Testing */}
            <div className="pt-2 flex items-center justify-between px-2 text-[10px] font-mono text-slate-500">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTestMode}
                  onChange={(e) => setIsTestMode(e.target.checked)}
                  className="rounded border-white/20 bg-black/40 text-purple-600 focus:ring-0"
                />
                <span className="text-slate-400">Sandbox Test Mode</span>
              </label>
              <div className="flex items-center gap-1 text-slate-500">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Verified Merchant: {paymentSettings.paymentDisplayName}</span>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================
             STEP 3: REAL-TIME PAYMENT STATUS SCREEN
          ======================================================== */
          <div className="py-3 space-y-5 animate-in zoom-in-95 duration-200">
            {paymentStatus === 'PENDING_VERIFICATION' ? (
              /* PENDING ADMIN APPROVAL STATE */
              <div className="text-center space-y-5 animate-in zoom-in-95">
                <div className="relative w-18 h-18 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
                  <div className="w-16 h-16 rounded-full bg-amber-950/70 border border-amber-500/50 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <Clock className="w-8 h-8 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="px-3.5 py-1 rounded-full text-[10px] font-mono tracking-wider bg-amber-950/80 text-amber-300 border border-amber-500/40 uppercase font-bold inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    PENDING ADMIN VERIFICATION
                  </span>
                  <h3 className="text-2xl font-tech font-bold text-white">Deposit Request Submitted!</h3>
                  <p className="text-xs text-slate-300 font-mono max-w-sm mx-auto leading-relaxed">
                    Your deposit request has been submitted to the Admin Panel. Once verified by the administrator, ₹{(activePaymentOrder?.amount || amount).toFixed(2)} will be automatically credited to your RAWAT Vault.
                  </p>
                </div>

                {/* Receipt Details Card */}
                <div className="p-4 rounded-2xl border border-white/10 bg-black/70 text-xs font-mono space-y-2.5 text-left max-w-sm mx-auto shadow-inner">
                  <div className="flex justify-between text-slate-400">
                    <span>Request ID:</span>
                    <span className="font-bold text-white">{activePaymentOrder?.paymentId}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Deposit Amount:</span>
                    <span className="font-bold text-emerald-400">{formatPrice(activePaymentOrder?.amount || amount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>UTR / Ref No:</span>
                    <span className="font-bold text-purple-300">{activePaymentOrder?.utrRef || utrRef || 'Pending Ref'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 border-t border-white/5 pt-2">
                    <span>Verification Status:</span>
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Awaiting Admin Approval
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 max-w-sm mx-auto text-left flex items-start gap-2.5 text-slate-400 text-xs font-mono">
                  <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    You can safely close this window. Your balance will be updated automatically and you will receive a notification once verified.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-tech font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                >
                  Done & Return to Store
                </button>
              </div>
            ) : paymentStatus === 'PROCESSING' ? (
              <div className="text-center space-y-4">
                {/* Radar / Pulsing Animation */}
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-purple-600/20 animate-ping" />
                  <div className="absolute inset-2 rounded-full bg-indigo-600/30 animate-pulse" />
                  <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-purple-600/40">
                    <Smartphone className="w-7 h-7" />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono tracking-wider bg-purple-950/80 text-purple-300 border border-purple-500/30 uppercase font-semibold">
                    UPI PAYMENT INITIATED
                  </span>
                  <h3 className="text-2xl font-tech font-bold text-white">Complete in UPI App</h3>
                  <p className="text-xs text-slate-300 font-mono max-w-sm mx-auto">
                    Pay ₹{(activePaymentOrder?.amount || amount).toFixed(2)} in your UPI app, then submit the 12-digit UTR below for admin verification.
                  </p>
                </div>

                {/* Re-Open App or Launch Intent Button */}
                {activePaymentOrder && (
                  <div className="max-w-sm mx-auto space-y-2">
                    <a
                      href={
                        selectedMethod === 'GOOGLE_PAY'
                          ? `tez://upi/pay?pa=${encodeURIComponent(paymentSettings.upiId || 'rawatstore@upi')}&pn=${encodeURIComponent(paymentSettings.paymentDisplayName || 'RAWAT CARD STORE')}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`RAWAT Store ${activePaymentOrder.paymentId}`)}&tr=${encodeURIComponent(activePaymentOrder.paymentId)}`
                          : selectedMethod === 'PHONEPE'
                          ? `phonepe://pay?pa=${encodeURIComponent(paymentSettings.upiId || 'rawatstore@upi')}&pn=${encodeURIComponent(paymentSettings.paymentDisplayName || 'RAWAT CARD STORE')}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`RAWAT Store ${activePaymentOrder.paymentId}`)}&tr=${encodeURIComponent(activePaymentOrder.paymentId)}`
                          : selectedMethod === 'PAYTM'
                          ? `paytmmp://pay?pa=${encodeURIComponent(paymentSettings.upiId || 'rawatstore@upi')}&pn=${encodeURIComponent(paymentSettings.paymentDisplayName || 'RAWAT CARD STORE')}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`RAWAT Store ${activePaymentOrder.paymentId}`)}&tr=${encodeURIComponent(activePaymentOrder.paymentId)}`
                          : `upi://pay?pa=${encodeURIComponent(paymentSettings.upiId || 'rawatstore@upi')}&pn=${encodeURIComponent(paymentSettings.paymentDisplayName || 'RAWAT CARD STORE')}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`RAWAT Store ${activePaymentOrder.paymentId}`)}&tr=${encodeURIComponent(activePaymentOrder.paymentId)}`
                      }
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-tech font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Open {selectedMethod === 'GOOGLE_PAY' ? 'Google Pay' : selectedMethod === 'PHONEPE' ? 'PhonePe' : selectedMethod === 'PAYTM' ? 'Paytm' : 'UPI App'} ({formatPrice(amount)})</span>
                    </a>
                  </div>
                )}

                <div className="p-4 rounded-2xl border border-white/10 bg-black/60 text-xs font-mono space-y-2 text-left max-w-sm mx-auto shadow-inner">
                  <div className="flex justify-between text-slate-400">
                    <span>Order ID:</span>
                    <span className="font-bold text-white">{activePaymentOrder?.paymentId}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Amount:</span>
                    <span className="font-bold text-emerald-400">{formatPrice(activePaymentOrder?.amount || amount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Payment Method:</span>
                    <span className="font-bold text-purple-300">{selectedMethod || 'UPI Intent'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 border-t border-white/5 pt-2">
                    <span>Session Expires In:</span>
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimer(timerSeconds)}
                    </span>
                  </div>
                </div>

                {/* Submit UTR to Admin Form */}
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 max-w-sm mx-auto space-y-2 text-left">
                  <label className="block text-[11px] font-mono text-slate-300 font-bold">
                    After payment, enter 12-digit UTR number:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={utrRef}
                      onChange={(e) => setUtrRef(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                      placeholder="e.g. 982140284729"
                      maxLength={20}
                      className="flex-1 rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="button"
                      disabled={isVerifying}
                      onClick={handleDirectUtrSubmit}
                      className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1"
                    >
                      {isVerifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>Submit UTR</span>
                    </button>
                  </div>
                </div>

                {/* Dev Simulator Controller (Dev only) */}
                {(isTestMode || activePaymentOrder?.isTestMode) && (
                  <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 max-w-sm mx-auto space-y-2 text-left">
                    <div className="text-[10px] font-mono text-purple-300 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>DEVELOPMENT TEST SIMULATOR</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSimulateDevAction('SUCCESS')}
                        className="py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold transition-all"
                      >
                        Simulate Success
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSimulateDevAction('FAILED')}
                        className="py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-rose-300 text-[10px] font-mono font-bold transition-all"
                      >
                        Simulate Fail
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSimulateDevAction('CANCELLED')}
                        className="py-1.5 rounded-lg bg-slate-600/30 hover:bg-slate-600/50 border border-slate-500/40 text-slate-300 text-[10px] font-mono font-bold transition-all"
                      >
                        Simulate Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-xs font-mono text-slate-400 hover:text-white transition-colors underline cursor-pointer"
                  >
                    Cancel & Return to Store
                  </button>
                </div>
              </div>
            ) : paymentStatus === 'SUCCESS' ? (
              /* PAYMENT SUCCESS STATE */
              <div className="text-center space-y-5 animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/50 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-9 h-9 animate-bounce" />
                </div>

                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 uppercase font-semibold">
                    ✓ PAYMENT COMPLETED
                  </span>
                  <h3 className="text-2xl font-tech font-bold text-white">Funds Added Successfully!</h3>
                  <p className="text-xs text-slate-300 font-mono max-w-sm mx-auto">
                    ₹{(activePaymentOrder?.amount || amount).toFixed(2)} has been credited to your RAWAT Vault.
                  </p>
                </div>

                {/* Receipt Card */}
                <div className="p-4 rounded-2xl border border-white/10 bg-black/60 text-xs font-mono space-y-2 text-left max-w-sm mx-auto">
                  <div className="flex justify-between text-slate-400">
                    <span>Payment ID:</span>
                    <span className="font-bold text-white">{activePaymentOrder?.paymentId}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>New Wallet Balance:</span>
                    <span className="font-bold text-emerald-400">{formatPrice(currentBalance)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 border-t border-white/5 pt-2">
                    <span>Status:</span>
                    <span className="text-emerald-400 font-bold">COMPLETED & VERIFIED</span>
                  </div>
                </div>

                {/* Lucky Scratch Card Reward Trigger if deposit >= 500 */}
                {(activePaymentOrder?.amount || amount) >= 500 && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-amber-500/20 border border-amber-500/40 text-center space-y-2 max-w-sm mx-auto shadow-lg shadow-amber-500/10">
                    <div className="flex items-center justify-center gap-1.5 text-amber-300 font-tech font-bold text-sm">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>YOU EARNED A LUCKY SCRATCH CARD!</span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-300">
                      Deposit of ₹{(activePaymentOrder?.amount || amount).toFixed(0)} qualified for instant cashback rewards.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowScratchCardModal(true)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-tech font-extrabold text-xs uppercase tracking-wider shadow-md cursor-pointer transition-all transform hover:scale-[1.02]"
                    >
                      🎁 Scratch Now & Claim Instant Bonus
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-tech font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  Done & Continue Shopping
                </button>
              </div>
            ) : paymentStatus === 'FAILED' ? (
              /* PAYMENT FAILED STATE */
              <div className="text-center space-y-4 animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center shadow-lg shadow-rose-500/20">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono tracking-wider bg-rose-950/80 text-rose-400 border border-rose-500/30 uppercase font-semibold">
                    PAYMENT FAILED / REJECTED
                  </span>
                  <h3 className="text-2xl font-tech font-bold text-white">Deposit Unsuccessful</h3>
                  <p className="text-xs text-slate-300 font-mono max-w-sm mx-auto">
                    {statusMessage || 'The payment was not completed or was declined.'}
                  </p>
                </div>

                <div className="flex gap-2 max-w-sm mx-auto pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('AMOUNT_ENTRY')}
                    className="flex-1 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-tech font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Try Again
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-tech font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              /* PAYMENT CANCELLED OR EXPIRED STATE */
              <div className="text-center space-y-4 animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-white/20 text-slate-400 mx-auto flex items-center justify-center">
                  <Clock className="w-8 h-8 text-amber-400" />
                </div>
                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono tracking-wider bg-slate-800 text-slate-300 border border-white/20 uppercase font-semibold">
                    {paymentStatus === 'CANCELLED' ? 'PAYMENT CANCELLED' : 'SESSION WINDOW CLOSED'}
                  </span>
                  <h3 className="text-2xl font-tech font-bold text-white">
                    {paymentStatus === 'CANCELLED' ? 'Checkout Cancelled' : 'Payment Verification Window'}
                  </h3>
                  <p className="text-xs text-slate-300 font-mono max-w-sm mx-auto">
                    {paymentStatus === 'CANCELLED'
                      ? 'You cancelled the payment request.'
                      : 'If you already completed the transfer in your UPI app, enter your 12-digit UTR below to submit for admin approval.'}
                  </p>
                </div>

                {/* Submit UTR */}
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 max-w-sm mx-auto space-y-2 text-left">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase">
                    Enter 12-Digit UTR / Ref Number:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={utrRef}
                      onChange={(e) => setUtrRef(e.target.value)}
                      placeholder="e.g. 982140284729"
                      className="flex-1 rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="button"
                      disabled={isVerifying}
                      onClick={handleDirectUtrSubmit}
                      className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1"
                    >
                      {isVerifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>Submit to Admin</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 max-w-sm mx-auto pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('AMOUNT_ENTRY');
                      setPaymentStatus('PROCESSING');
                      setErrorMsg(null);
                    }}
                    className="flex-1 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-tech font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Start New Deposit
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-tech font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lucky Deposit Scratch Card Modal */}
      <ScratchCardModal
        isOpen={showScratchCardModal}
        depositAmount={activePaymentOrder?.amount || amount}
        onClose={() => {
          setShowScratchCardModal(false);
          handleClose();
        }}
      />
    </div>
  );
};
