import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { PaymentSettings } from '../../types';
import { generateUpiQrSvg, buildUpiUri, formatGoogleDriveDirectImageUrl, DEFAULT_STORE_QR_IMAGE_URL } from '../../utils/qr';
import { playSound } from '../../utils/audio';
import {
  QrCode,
  Upload,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Smartphone,
  Copy,
  Check,
  Settings,
  ListOrdered,
  Plus,
  X,
  ExternalLink,
  Sliders,
  Database,
  Lock,
  Download,
  Info,
  Eye,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Layers,
  Power
} from 'lucide-react';

const PRESET_TEMPLATES = [
  {
    id: 'standard_upi',
    name: 'Standard Multi-App UPI',
    desc: 'Google Pay, PhonePe, Paytm, BHIM & Cred instructions',
    steps: [
      'Open any UPI application on your mobile device (Google Pay, PhonePe, Paytm, BHIM, Cred).',
      'Scan the active store QR code above or copy our verified merchant UPI ID.',
      'Enter the exact top-up amount and add your RAWAT username in the payment note.',
      'Complete the transfer in your banking app and copy the 12-digit UPI Reference (UTR) number.',
      'Click "I Have Paid" below and paste your UTR number to submit instant verification.'
    ],
    security: '🛡️ All top-up deposits are verified against store bank records. Typical ledger confirmation takes 5-15 minutes during active business hours.',
    summary: 'Scan this official UPI QR code using Google Pay, PhonePe, Paytm, BHIM or Cred. Enter the exact amount, complete the transfer, and submit your UTR reference for instant verification.'
  },
  {
    id: 'fast_track',
    name: 'Fast-Track Instant UTR',
    desc: 'Strict UTR requirement with accelerated admin priority queue',
    steps: [
      'Scan the RAWAT official QR code using your preferred UPI app.',
      'Transfer the exact wallet deposit amount without altering transaction notes.',
      'Copy the 12-digit UTR / Bank Reference ID from your payment receipt.',
      'Enter the 12-digit UTR into the verification field below and click "I Have Paid".'
    ],
    security: '⚡ Priority Fast-Track Queue active: Verified UTR submissions are approved within 3-5 minutes.',
    summary: 'Scan the RAWAT official QR code, complete payment, and provide the 12-digit UTR number for priority fast-track verification.'
  },
  {
    id: 'vip_concierge',
    name: 'VIP High-Volume Desk',
    desc: 'For high-tier deposits and vault tier upgrades (₹5,000+)',
    steps: [
      'Scan the RAWAT Black Vault QR code or use our priority merchant VPA.',
      'Execute the transfer from your registered banking account.',
      'Submit payment confirmation with your transaction reference number.',
      'For immediate priority clearance, notify your assigned VIP account manager or telegram support.'
    ],
    security: '👑 VIP Concierge Service: Priority manual processing with direct admin clearance.',
    summary: 'Scan the RAWAT Black Vault QR code and submit payment confirmation for priority VIP clearance.'
  }
];

export const AdminPaymentSettings: React.FC = () => {
  const {
    paymentSettings,
    updatePaymentSettings,
    currentUser,
    soundEnabled,
    formatPrice,
    isFirebaseConnected,
    firebaseSyncStatus,
  } = useStore();

  // Local Form State
  const [displayName, setDisplayName] = useState(paymentSettings.paymentDisplayName);
  const [upiId, setUpiId] = useState(paymentSettings.upiId);
  const [backupUpiId, setBackupUpiId] = useState(paymentSettings.backupUpiId || '');
  const [instructionsSummary, setInstructionsSummary] = useState(paymentSettings.paymentInstructions);
  const [instructionSteps, setInstructionSteps] = useState<string[]>(
    paymentSettings.instructionSteps && paymentSettings.instructionSteps.length > 0
      ? paymentSettings.instructionSteps
      : [
          'Open any UPI application on your mobile device (Google Pay, PhonePe, Paytm, BHIM, Cred).',
          'Scan the store QR code above or copy our verified merchant UPI ID.',
          'Enter the exact top-up amount and add your RAWAT username in the payment note.',
          'Complete the transfer and copy the 12-digit UPI Reference (UTR) number.',
          'Click "I Have Paid" below and paste your UTR number to submit verification.'
        ]
  );
  const [securityNotice, setSecurityNotice] = useState(
    paymentSettings.securityNotice || '🛡️ All top-up deposits are verified against store bank records. Typical ledger confirmation takes 5-15 minutes.'
  );
  const [qrType, setQrType] = useState<'generated' | 'uploaded'>(paymentSettings.qrType);
  const [customQrImage, setCustomQrImage] = useState<string | null>(
    paymentSettings.qrType === 'uploaded' ? paymentSettings.activeQrImageUrl : null
  );
  const [minDeposit, setMinDeposit] = useState<number>(paymentSettings.minDepositAmount ?? 1000);
  const [maxDeposit, setMaxDeposit] = useState<number>(paymentSettings.maxDepositAmount ?? 50000);
  const [presetAmounts, setPresetAmounts] = useState<number[]>(
    paymentSettings.quickPresetAmounts || [1000, 1500, 2000, 3000, 5000, 10000]
  );
  const [requireUtr, setRequireUtr] = useState<boolean>(paymentSettings.requireUtr ?? false);
  const [isPaymentActive, setIsPaymentActive] = useState<boolean>(paymentSettings.isPaymentActive ?? true);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    paymentSettings.maintenanceMessage || 'UPI deposits are temporarily undergoing maintenance. Please check back shortly.'
  );

  // UI state
  const [qrStudioTab, setQrStudioTab] = useState<'upload' | 'generate'>('upload');
  const [qrFrameTheme, setQrFrameTheme] = useState<'dark' | 'glass' | 'monochrome'>('dark');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSizeKb, setUploadedFileSizeKb] = useState<number | null>(null);
  const [driveUrlInput, setDriveUrlInput] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [previewCustomerAmount, setPreviewCustomerAmount] = useState<number>(1000);
  const [previewCustomerUtr, setPreviewCustomerUtr] = useState<string>('');
  const [previewCopied, setPreviewCopied] = useState(false);
  const [activeTabSection, setActiveTabSection] = useState<'qr_and_upi' | 'instructions' | 'limits_and_rules' | 'simulator'>('qr_and_upi');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize with external store updates
  useEffect(() => {
    setDisplayName(paymentSettings.paymentDisplayName);
    setUpiId(paymentSettings.upiId);
    setBackupUpiId(paymentSettings.backupUpiId || '');
    setInstructionsSummary(paymentSettings.paymentInstructions);
    if (paymentSettings.instructionSteps && paymentSettings.instructionSteps.length > 0) {
      setInstructionSteps(paymentSettings.instructionSteps);
    }
    setSecurityNotice(paymentSettings.securityNotice || '');
    setQrType(paymentSettings.qrType);
    if (paymentSettings.qrType === 'uploaded') {
      setCustomQrImage(paymentSettings.activeQrImageUrl);
    }
    setMinDeposit(paymentSettings.minDepositAmount ?? 1000);
    setMaxDeposit(paymentSettings.maxDepositAmount ?? 50000);
    setPresetAmounts(paymentSettings.quickPresetAmounts || [1000, 1500, 2000, 3000, 5000, 10000]);
    setRequireUtr(paymentSettings.requireUtr ?? false);
    setIsPaymentActive(paymentSettings.isPaymentActive ?? true);
    setMaintenanceMessage(paymentSettings.maintenanceMessage || '');
  }, [paymentSettings]);

  // Compute live generated SVG QR
  const liveGeneratedQrSvg = generateUpiQrSvg(
    buildUpiUri({
      upiId: upiId || 'rawatcard@ybl',
      name: displayName || 'PARAMVEER RAWAT',
      amount: previewCustomerAmount
    }),
    280,
    { theme: 'phonepe', centerBadge: 'phonepe' }
  );

  // Active QR preview URL
  const currentActiveQrPreview =
    qrType === 'uploaded' && customQrImage
      ? customQrImage
      : liveGeneratedQrSvg;

  // Validate UPI ID format
  const isUpiValid = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId.trim());

  // Handle QR File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5MB limit. Please upload an image under 5MB.');
      return;
    }

    // Validate mime type
    if (!file.type.startsWith('image/')) {
      setUploadError('Invalid file type. Please upload a PNG, JPG, JPEG, WEBP, or SVG image.');
      return;
    }

    setUploadedFileName(file.name);
    setUploadedFileSizeKb(Math.round(file.size / 1024));

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setCustomQrImage(base64);
      setQrType('uploaded');
      playSound('click', soundEnabled);
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  // Remove uploaded QR
  const handleRemoveCustomQr = () => {
    setCustomQrImage(null);
    setQrType('generated');
    setUploadedFileName(null);
    setUploadedFileSizeKb(null);
    setDriveUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    playSound('click', soundEnabled);
  };

  // Apply Direct Google Drive or Image URL
  const handleApplyDriveUrl = () => {
    if (!driveUrlInput.trim()) {
      setUploadError('Please enter a Google Drive link or image URL.');
      return;
    }
    const directUrl = formatGoogleDriveDirectImageUrl(driveUrlInput.trim());
    setCustomQrImage(directUrl);
    setQrType('uploaded');
    setUploadedFileName('Official Google Drive Store QR');
    setUploadError(null);
    playSound('click', soundEnabled);
    setToastMessage('✓ Google Drive QR link converted and applied to store preview!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Step item operations
  const handleAddStep = () => {
    setInstructionSteps([...instructionSteps, '']);
    playSound('click', soundEnabled);
  };

  const handleUpdateStep = (index: number, text: string) => {
    const updated = [...instructionSteps];
    updated[index] = text;
    setInstructionSteps(updated);
  };

  const handleDeleteStep = (index: number) => {
    const updated = instructionSteps.filter((_, i) => i !== index);
    setInstructionSteps(updated);
    playSound('click', soundEnabled);
  };

  const handleLoadTemplate = (tpl: typeof PRESET_TEMPLATES[0]) => {
    setInstructionSteps(tpl.steps);
    setSecurityNotice(tpl.security);
    setInstructionsSummary(tpl.summary);
    playSound('click', soundEnabled);
    setToastMessage(`Loaded preset template: "${tpl.name}"`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle Preset Amount tag changes
  const handleAddPresetAmount = () => {
    const nextVal = presetAmounts.length > 0 ? presetAmounts[presetAmounts.length - 1] * 2 : 100;
    setPresetAmounts([...presetAmounts, nextVal]);
  };

  const handleRemovePresetAmount = (index: number) => {
    setPresetAmounts(presetAmounts.filter((_, i) => i !== index));
  };

  const handleUpdatePresetAmount = (index: number, val: number) => {
    const updated = [...presetAmounts];
    updated[index] = val;
    setPresetAmounts(updated);
  };

  // Save All Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (!displayName.trim()) {
      setUploadError('Store Merchant Display Name cannot be blank.');
      return;
    }
    if (!upiId.trim() || !isUpiValid) {
      setUploadError('Please provide a valid UPI ID (e.g., username@upi or merchant@okaxis).');
      return;
    }
    if (minDeposit < 1) {
      setUploadError('Minimum deposit must be at least ₹1.');
      return;
    }
    if (maxDeposit <= minDeposit) {
      setUploadError('Maximum deposit must be strictly greater than minimum deposit.');
      return;
    }

    setIsSaving(true);

    try {
      const activeQrUrl =
        qrType === 'uploaded' && customQrImage
          ? customQrImage
          : generateUpiQrSvg(buildUpiUri({ upiId: upiId.trim(), name: displayName.trim() }));

      const updates: Partial<PaymentSettings> = {
        paymentDisplayName: displayName.trim(),
        upiId: upiId.trim(),
        backupUpiId: backupUpiId.trim() || undefined,
        paymentInstructions: instructionsSummary.trim(),
        instructionSteps: instructionSteps.filter((s) => s.trim().length > 0),
        securityNotice: securityNotice.trim(),
        activeQrImageUrl: activeQrUrl,
        qrType,
        minDepositAmount: minDeposit,
        maxDepositAmount: maxDeposit,
        quickPresetAmounts: presetAmounts.filter((p) => p > 0),
        requireUtr,
        isPaymentActive,
        maintenanceMessage: maintenanceMessage.trim(),
        isActive: isPaymentActive
      };

      const res = updatePaymentSettings(updates, qrType === 'uploaded' && customQrImage ? customQrImage : undefined);

      if (res.success) {
        setToastMessage('✓ Payment settings & UPI QR code saved and persisted to database!');
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        setUploadError(res.message);
      }
    } catch (err: any) {
      setUploadError(err?.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  // Download active QR
  const handleDownloadQr = () => {
    const element = document.createElement('a');
    element.setAttribute('href', currentActiveQrPreview);
    element.setAttribute('download', `rawat_store_qr_${Date.now()}.${qrType === 'uploaded' ? 'png' : 'svg'}`);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    playSound('click', soundEnabled);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Persistence Header */}
      <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-[#0c0d16] via-black to-[#07080f] p-6 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-40 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 font-mono text-[10px] uppercase tracking-wider">
                <QrCode className="w-3.5 h-3.5 text-purple-400" />
                <span>UPI GATEWAY CONTROL</span>
              </div>

              {isFirebaseConnected ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-mono text-[10px]">
                  <Database className="w-3 h-3" /> Cloud Firestore Realtime Synced
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-400 font-mono text-[10px]">
                  <Lock className="w-3 h-3" /> Reconnecting to Firestore...
                </span>
              )}

              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] ${
                isPaymentActive
                  ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/80 border border-rose-500/40 text-rose-300'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isPaymentActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                {isPaymentActive ? 'GATEWAY ACTIVE' : 'GATEWAY PAUSED'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-tech font-extrabold text-white tracking-tight">
              Payment & UPI QR Settings
            </h2>
            <p className="text-xs text-slate-400 font-mono max-w-2xl">
              Upload custom merchant QR code, configure UPI IDs, set multi-step customer payment instructions, and enforce wallet deposit limits.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPaymentActive(!isPaymentActive)}
              className={`px-4 py-2 rounded-xl border text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isPaymentActive
                  ? 'bg-rose-950/40 hover:bg-rose-950/60 border-rose-500/40 text-rose-300'
                  : 'bg-emerald-950/40 hover:bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isPaymentActive ? 'Pause Payments' : 'Activate Payments'}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-tech font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {toastMessage && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 font-mono text-xs flex items-center justify-between shadow-lg animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error Message */}
        {uploadError && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 font-mono text-xs flex items-center justify-between shadow-lg animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{uploadError}</span>
            </div>
            <button onClick={() => setUploadError(null)} className="text-rose-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto scrollbar-none">
        {[
          { id: 'qr_and_upi', label: '1. QR Code & UPI Details', icon: QrCode },
          { id: 'instructions', label: '2. Payment Instructions & Templates', icon: ListOrdered },
          { id: 'limits_and_rules', label: '3. Limits, Presets & Gateway Rules', icon: Sliders },
          { id: 'simulator', label: '4. Live Customer Simulator', icon: Eye }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTabSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                playSound('click', soundEnabled);
                setActiveTabSection(tab.id as any);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 border border-purple-400'
                  : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: QR CODE & UPI DETAILS */}
      {activeTabSection === 'qr_and_upi' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: UPI Configuration & QR Studio */}
          <div className="lg:col-span-7 space-y-6">
            {/* Merchant Details Box */}
            <div className="rounded-3xl border border-white/10 bg-black/50 p-6 space-y-4 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-tech font-bold text-base text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Store Merchant Credentials</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-500">REQUIRED</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                    Store Merchant Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. PARAMVEER RAWAT"
                    className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-2.5 font-mono text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-[10px] font-mono text-slate-500 mt-1">
                    Displayed in payment headings, receipts, and UPI transaction requests.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase flex items-center justify-between">
                      <span>Primary UPI ID / VPA</span>
                      {isUpiValid ? (
                        <span className="text-emerald-400 text-[10px] flex items-center gap-1 font-mono">
                          <Check className="w-3 h-3" /> Valid VPA
                        </span>
                      ) : (
                        <span className="text-amber-400 text-[10px] font-mono">Invalid VPA format</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. rawatcard@ybl"
                      className={`w-full rounded-2xl border bg-black/60 px-4 py-2.5 font-mono text-xs text-white focus:outline-none ${
                        isUpiValid ? 'border-white/10 focus:border-purple-500' : 'border-amber-500/50'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                      Secondary / Backup UPI ID <span className="text-slate-600">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={backupUpiId}
                      onChange={(e) => setBackupUpiId(e.target.value)}
                      placeholder="e.g. rawatcard@ibl"
                      className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-2.5 font-mono text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* QR Studio & Uploader */}
            <div className="rounded-3xl border border-white/10 bg-black/50 p-6 space-y-5 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-tech font-bold text-base text-white flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-purple-400" />
                  <span>Active QR Code Source</span>
                </h3>

                {/* QR Source Selector */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setQrType('uploaded');
                      playSound('click', soundEnabled);
                    }}
                    className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      qrType === 'uploaded'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Custom Uploaded QR
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQrType('generated');
                      playSound('click', soundEnabled);
                    }}
                    className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      qrType === 'generated'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Auto-Generated SVG
                  </button>
                </div>
              </div>

              {/* Sub-Tab Selector for QR Configuration */}
              <div className="flex gap-2 border-b border-white/5 pb-2">
                <button
                  type="button"
                  onClick={() => setQrStudioTab('upload')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    qrStudioTab === 'upload'
                      ? 'bg-white/15 text-white font-bold'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  📁 Upload Custom QR Image
                </button>
                <button
                  type="button"
                  onClick={() => setQrStudioTab('generate')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    qrStudioTab === 'generate'
                      ? 'bg-white/15 text-white font-bold'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  ⚡ Dynamic SVG Generator
                </button>
              </div>

              {qrStudioTab === 'upload' ? (
                <div className="space-y-4">
                  {/* File Dropzone */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/20 hover:border-purple-500/60 rounded-3xl p-8 text-center cursor-pointer transition-all bg-white/[0.02] hover:bg-purple-950/10 group space-y-3"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-purple-950/60 border border-purple-500/40 text-purple-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-mono text-white font-bold">
                        Click or Drag & Drop new UPI QR image
                      </p>
                      <p className="text-[10px] font-mono text-slate-500 mt-1">
                        PNG, JPG, WEBP, or SVG • Maximum size: 5MB
                      </p>
                    </div>
                  </div>

                  {/* Direct Google Drive URL or External Link Importer */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-purple-300 font-bold flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                        <span>Or Paste Google Drive / Direct Image URL</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setDriveUrlInput('https://drive.google.com/file/d/19IDRv9zFW6o6-q0BoUhuG1D6oOYtUJfq/view?usp=drivesdk');
                          const direct = formatGoogleDriveDirectImageUrl('https://drive.google.com/file/d/19IDRv9zFW6o6-q0BoUhuG1D6oOYtUJfq/view?usp=drivesdk');
                          setCustomQrImage(direct);
                          setQrType('uploaded');
                          setUploadedFileName('Official Store QR (Google Drive)');
                          playSound('click', soundEnabled);
                        }}
                        className="text-[10px] text-purple-400 hover:text-purple-300 underline font-mono cursor-pointer"
                      >
                        Reset to Official QR
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={driveUrlInput}
                        onChange={(e) => setDriveUrlInput(e.target.value)}
                        placeholder="https://drive.google.com/file/d/19IDRv9zFW6o6-q0BoUhuG1D6oOYtUJfq/view..."
                        className="flex-1 rounded-xl border border-white/10 bg-black/60 px-3 py-2 font-mono text-xs text-white focus:outline-none focus:border-purple-500 placeholder:text-slate-600"
                      />
                      <button
                        type="button"
                        onClick={handleApplyDriveUrl}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-all shrink-0 cursor-pointer"
                      >
                        Apply QR Link
                      </button>
                    </div>
                    <p className="text-[10px] font-mono text-slate-500">
                      Supports Google Drive share links, direct CDN links, or image URLs.
                    </p>
                  </div>

                  {customQrImage && (
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={customQrImage}
                          alt="Uploaded QR Preview"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (target.src.includes('lh3.googleusercontent.com/d/')) {
                              const id = target.src.split('/d/')[1];
                              target.src = `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
                            }
                          }}
                          className="w-12 h-12 rounded-xl object-contain bg-black border border-white/20 p-1"
                        />
                        <div className="space-y-0.5">
                          <p className="text-xs font-mono font-bold text-white truncate max-w-[200px]">
                            {uploadedFileName || 'Custom Store QR Code'}
                          </p>
                          <p className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {uploadedFileSizeKb ? `${uploadedFileSizeKb} KB • Active in store` : 'Active custom QR image'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemoveCustomQr}
                        className="p-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Dynamic SVG Generator Mode */
                <div className="space-y-4 font-mono text-xs">
                  <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 space-y-2">
                    <p className="text-purple-300 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      Dynamic Vector UPI QR Generation
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      The SVG QR code automatically embeds the official NPCI standard format:{' '}
                      <code className="text-purple-300 bg-black/60 px-1.5 py-0.5 rounded">
                        upi://pay?pa={upiId}&pn={displayName}&cu=INR
                      </code>
                      . It supports all bank UPI apps with zero compression artifacts.
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-slate-400 text-[11px]">QR Display Theme</span>
                    <div className="flex gap-1">
                      {(['dark', 'glass', 'monochrome'] as const).map((theme) => (
                        <button
                          key={theme}
                          type="button"
                          onClick={() => setQrFrameTheme(theme)}
                          className={`px-3 py-1 rounded-lg text-[10px] uppercase font-bold transition-all cursor-pointer ${
                            qrFrameTheme === theme
                              ? 'bg-purple-600 text-white'
                              : 'bg-black/40 text-slate-400 hover:text-white'
                          }`}
                        >
                          {theme}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Live Preview Box */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-white/10 bg-black/60 p-6 space-y-6 backdrop-blur-xl sticky top-24">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-purple-400" />
                  LIVE ACTIVE QR PREVIEW
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-purple-950/80 border border-purple-500/40 text-purple-300 uppercase font-bold">
                  {qrType === 'uploaded' ? 'Custom Upload' : 'Auto SVG'}
                </span>
              </div>

              {/* QR Frame */}
              <div className="flex flex-col items-center justify-center space-y-4">
                <div
                  className={`p-4 rounded-3xl border flex items-center justify-center shadow-2xl transition-all ${
                    qrFrameTheme === 'monochrome'
                      ? 'bg-white border-slate-300 text-black shadow-white/5'
                      : qrFrameTheme === 'glass'
                      ? 'bg-white/10 border-white/20 backdrop-blur-2xl'
                      : 'bg-[#06070c] border-white/15 shadow-black/80'
                  }`}
                >
                  <img
                    src={currentActiveQrPreview}
                    alt="Active Store QR"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src.includes('lh3.googleusercontent.com/d/')) {
                        const id = target.src.split('/d/')[1];
                        target.src = `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
                      }
                    }}
                    className="w-52 h-52 sm:w-60 sm:h-60 object-contain rounded-2xl"
                  />
                </div>

                <div className="text-center space-y-1">
                  <p className="font-tech font-bold text-white text-base tracking-wide uppercase">
                    {displayName || 'PARAMVEER RAWAT'}
                  </p>
                  <p className="text-xs font-mono text-purple-400 font-bold">{upiId || 'rawatcard@ybl'}</p>
                  {backupUpiId && (
                    <p className="text-[10px] font-mono text-slate-500">Backup: {backupUpiId}</p>
                  )}
                </div>

                <div className="w-full flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleDownloadQr}
                    className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download QR Image</span>
                  </button>
                </div>
              </div>

              {/* QR Information Spec */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 font-mono text-[11px] space-y-1.5 text-slate-400">
                <div className="flex justify-between">
                  <span>Source Format:</span>
                  <span className="text-white font-bold">{qrType === 'uploaded' ? 'Custom Raster/Vector' : 'Dynamic SVG'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={isPaymentActive ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {isPaymentActive ? 'Active in Customer Flow' : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated:</span>
                  <span className="text-slate-300">{paymentSettings.updatedAt || 'August 2026'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Updated By:</span>
                  <span className="text-purple-300 font-bold">@{paymentSettings.updatedBy || 'admin'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: PAYMENT INSTRUCTIONS & TEMPLATES */}
      {activeTabSection === 'instructions' && (
        <div className="space-y-6">
          {/* Preset Templates Selector */}
          <div className="rounded-3xl border border-white/10 bg-black/50 p-6 space-y-4 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-tech font-bold text-base text-white">1-Click Instruction Presets</h3>
                <p className="text-xs font-mono text-slate-400">
                  Select a pre-crafted instruction template or customize steps individually below.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PRESET_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => handleLoadTemplate(tpl)}
                  className="p-4 rounded-2xl border border-white/10 bg-black/40 hover:bg-purple-950/20 hover:border-purple-500/40 transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-tech font-bold text-sm text-white group-hover:text-purple-300 transition-colors">
                      {tpl.name}
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-slate-600 group-hover:text-purple-400" />
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 leading-relaxed">{tpl.desc}</p>
                  <span className="inline-block text-[10px] font-mono text-purple-400 pt-1">
                    Click to load preset →
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Multi-Step Editor */}
          <div className="rounded-3xl border border-white/10 bg-black/50 p-6 space-y-6 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-tech font-bold text-base text-white flex items-center gap-2">
                  <ListOrdered className="w-4 h-4 text-purple-400" />
                  <span>Step-by-Step Customer Instructions</span>
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  These numbered steps are formatted and displayed directly on the customer payment modal.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddStep}
                className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Step</span>
              </button>
            </div>

            {/* Steps List */}
            <div className="space-y-3">
              {instructionSteps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-black/60 border border-white/10"
                >
                  <span className="w-6 h-6 rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-1">
                    {index + 1}
                  </span>

                  <textarea
                    rows={2}
                    value={step}
                    onChange={(e) => handleUpdateStep(index, e.target.value)}
                    placeholder={`Step ${index + 1} instruction...`}
                    className="flex-1 bg-transparent border-0 font-mono text-xs text-white focus:outline-none placeholder:text-slate-600 resize-none"
                  />

                  {instructionSteps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteStep(index)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Summary Textarea (Fallback) */}
            <div className="space-y-2 pt-4 border-t border-white/5">
              <label className="block text-xs font-mono text-slate-400 uppercase">
                Payment Instructions Summary <span className="text-slate-600">(Quick Paragraph View)</span>
              </label>
              <textarea
                rows={3}
                value={instructionsSummary}
                onChange={(e) => setInstructionsSummary(e.target.value)}
                placeholder="Summary instruction paragraph for quick reference..."
                className="w-full rounded-2xl border border-white/10 bg-black/60 p-3.5 font-mono text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Security Notice / SLA */}
            <div className="space-y-2 pt-4 border-t border-white/5">
              <label className="block text-xs font-mono text-slate-400 uppercase">
                Security Notice & Verification SLA
              </label>
              <textarea
                rows={2}
                value={securityNotice}
                onChange={(e) => setSecurityNotice(e.target.value)}
                placeholder="e.g. Verification takes 5-15 minutes..."
                className="w-full rounded-2xl border border-white/10 bg-black/60 p-3.5 font-mono text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: LIMITS, PRESETS & GATEWAY RULES */}
      {activeTabSection === 'limits_and_rules' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            {/* Limits Box */}
            <div className="rounded-3xl border border-white/10 bg-black/50 p-6 space-y-5 backdrop-blur-md">
              <div className="border-b border-white/10 pb-3">
                <h3 className="font-tech font-bold text-base text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span>Wallet Top-Up Deposit Limits</span>
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  Enforce transaction boundaries for client-side balance recharge requests.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                    Minimum Deposit Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="10"
                    value={minDeposit}
                    onChange={(e) => setMinDeposit(Number(e.target.value))}
                    className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-2.5 font-mono text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-[10px] font-mono text-slate-500 mt-1">Current minimum: {formatPrice(minDeposit)}</p>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                    Maximum Deposit Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="500"
                    value={maxDeposit}
                    onChange={(e) => setMaxDeposit(Number(e.target.value))}
                    className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-2.5 font-mono text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-[10px] font-mono text-slate-500 mt-1">Current maximum: {formatPrice(maxDeposit)}</p>
                </div>
              </div>
            </div>

            {/* Quick Preset Amounts */}
            <div className="rounded-3xl border border-white/10 bg-black/50 p-6 space-y-4 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="font-tech font-bold text-base text-white">Client Preset Amount Buttons</h3>
                  <p className="text-xs font-mono text-slate-400">
                    Preset amount pills rendered in the customer top-up modal.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddPresetAmount}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Amount</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {presetAmounts.map((amt, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 font-mono text-xs"
                  >
                    <span>₹</span>
                    <input
                      type="number"
                      value={amt}
                      onChange={(e) => handleUpdatePresetAmount(idx, Number(e.target.value))}
                      className="w-16 bg-transparent text-white font-bold focus:outline-none border-b border-white/20"
                    />
                    {presetAmounts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePresetAmount(idx)}
                        className="text-slate-500 hover:text-rose-400 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Rules & Maintenance Switch */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-white/10 bg-black/50 p-6 space-y-5 backdrop-blur-md">
              <div className="border-b border-white/10 pb-3">
                <h3 className="font-tech font-bold text-base text-white">Verification & Security Rules</h3>
              </div>

              {/* UTR Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="space-y-0.5 pr-2">
                  <p className="text-xs font-mono font-bold text-white">Require 12-Digit UTR</p>
                  <p className="text-[10px] font-mono text-slate-400">
                    Mandate customers to enter bank UTR before clicking "I Have Paid"
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={requireUtr}
                  onChange={(e) => setRequireUtr(e.target.checked)}
                  className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                />
              </div>

              {/* Gateway State */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="space-y-0.5 pr-2">
                  <p className="text-xs font-mono font-bold text-white">UPI Payment Gateway Status</p>
                  <p className="text-[10px] font-mono text-slate-400">
                    Toggle active customer deposits on or off
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isPaymentActive}
                  onChange={(e) => setIsPaymentActive(e.target.checked)}
                  className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                />
              </div>

              {/* Maintenance Message */}
              {!isPaymentActive && (
                <div className="space-y-2 pt-2 animate-in fade-in">
                  <label className="block text-xs font-mono text-rose-400 uppercase font-bold">
                    Maintenance Banner Message
                  </label>
                  <textarea
                    rows={3}
                    value={maintenanceMessage}
                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                    placeholder="Message shown when payments are paused..."
                    className="w-full rounded-2xl border border-rose-500/40 bg-black/60 p-3 font-mono text-xs text-white focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: LIVE CUSTOMER SIMULATOR */}
      {activeTabSection === 'simulator' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-black/50 p-6 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div>
                <h3 className="font-tech font-bold text-lg text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-400" />
                  <span>Customer Payment Flow Interactive Simulator</span>
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  This preview renders the exact modal UI your customers experience during the add-funds checkout flow.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-mono bg-purple-950/60 border border-purple-500/40 text-purple-300">
                Live Simulator
              </span>
            </div>

            {/* Simulator Container */}
            <div className="max-w-md mx-auto rounded-3xl border border-white/15 bg-[#08090f] p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-slate-100 relative overflow-hidden">
              <div className="absolute -top-20 right-0 w-64 h-32 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

              {!isPaymentActive ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center">
                    <Power className="w-6 h-6" />
                  </div>
                  <h4 className="font-tech font-bold text-lg text-white">Payment Gateway Paused</h4>
                  <p className="text-xs font-mono text-slate-400">{maintenanceMessage}</p>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] uppercase tracking-wider mb-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      <span>SECURE PAYMENT</span>
                    </div>

                    <h3 className="text-xl font-tech font-extrabold text-white tracking-tight uppercase">
                      PAY TO {displayName || 'PARAMVEER RAWAT'}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      Scan QR with any UPI app & request balance verification
                    </p>
                  </div>

                  {/* Preset Amount Pills */}
                  <div className="space-y-3 mb-6">
                    <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider text-center">
                      Select Amount to Add
                    </label>

                    <div className="grid grid-cols-3 gap-1.5">
                      {presetAmounts.slice(0, 6).map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            setPreviewCustomerAmount(preset);
                            playSound('click', soundEnabled);
                          }}
                          className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                            previewCustomerAmount === preset
                              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400'
                              : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                          }`}
                        >
                          ₹{preset}
                        </button>
                      ))}
                    </div>

                    <div className="relative mt-2">
                      <span className="absolute left-4 top-2.5 text-base font-mono font-bold text-purple-400">₹</span>
                      <input
                        type="number"
                        value={previewCustomerAmount}
                        onChange={(e) => setPreviewCustomerAmount(Number(e.target.value))}
                        className="w-full text-center font-mono text-lg font-bold rounded-2xl border border-white/15 bg-black/60 py-2 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* QR Image Box */}
                  <div className="relative rounded-3xl border border-white/15 bg-black/70 p-5 flex flex-col items-center justify-center space-y-4 shadow-2xl backdrop-blur-md">
                    <div className="p-3 bg-black rounded-2xl border border-white/20 shadow-inner flex items-center justify-center">
                      <img
                        src={currentActiveQrPreview}
                        alt="Store QR"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src.includes('lh3.googleusercontent.com/d/')) {
                            const id = target.src.split('/d/')[1];
                            target.src = `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
                          }
                        }}
                        className="w-48 h-48 object-contain rounded-xl"
                      />
                    </div>

                    <div className="text-center space-y-1">
                      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-300 font-mono">
                        <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                        <span>Scan this QR using your UPI app</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Google Pay • PhonePe • Paytm • BHIM • Cred
                      </p>
                    </div>

                    {/* Copy UPI ID Pill */}
                    <div className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/10">
                      <div className="truncate pr-2">
                        <span className="text-[9px] font-mono text-slate-500 uppercase block">UPI ID</span>
                        <span className="text-xs font-mono font-bold text-purple-300 truncate block">
                          {upiId || 'rawatcard@ybl'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(upiId || 'rawatcard@ybl');
                          setPreviewCopied(true);
                          playSound('click', soundEnabled);
                          setTimeout(() => setPreviewCopied(false), 2000);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-mono font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        {previewCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-300">COPIED</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>COPY</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Formatted Numbered Instructions */}
                  <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <p className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                      Payment Steps:
                    </p>
                    <ol className="space-y-1.5 font-mono text-[11px] text-slate-400">
                      {instructionSteps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-purple-400 font-bold shrink-0">{idx + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* UTR Input */}
                  <div className="mt-4">
                    <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                      UPI Reference / UTR Number {requireUtr ? <span className="text-rose-400">*</span> : '(Optional)'}
                    </label>
                    <input
                      type="text"
                      value={previewCustomerUtr}
                      onChange={(e) => setPreviewCustomerUtr(e.target.value)}
                      placeholder="e.g. 982140284729 (12-digit UPI Ref)"
                      className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-2 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Action Button */}
                  <div className="mt-5 space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        playSound('click', soundEnabled);
                        setToastMessage(`Simulated payment request of ₹${previewCustomerAmount} registered!`);
                        setTimeout(() => setToastMessage(null), 3000);
                      }}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 text-white font-tech font-bold text-xs tracking-wider uppercase shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>I HAVE PAID ₹{previewCustomerAmount.toFixed(2)}</span>
                    </button>

                    {securityNotice && (
                      <p className="text-[10px] text-center font-mono text-slate-500">
                        {securityNotice}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
