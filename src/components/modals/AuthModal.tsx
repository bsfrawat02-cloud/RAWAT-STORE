import React, { useState, useEffect, useId, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Lock,
  Mail,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  KeyRound,
  Gift,
  Phone,
  ArrowRight,
  ChevronLeft,
  Check,
  Flame,
  Shield,
  Crown,
  Zap,
  Star
} from 'lucide-react';
import { playSound } from '../../utils/audio';
import { resetFirebasePassword } from '../../services/firebase/authService';
import confetti from 'canvas-confetti';

type PasswordStrength = 'Weak' | 'Fair' | 'Strong' | 'Very Strong';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    loginUser,
    registerUser,
    currentUser,
    users,
    soundEnabled,
  } = useStore();

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // 3D Card Interactive Tilt & Holographic Lighting
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Field Touched States
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  // Feedback States
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState(false);

  // Success Experience Animation State
  const [authSuccessData, setAuthSuccessData] = useState<{
    type: 'login' | 'register';
    username: string;
  } | null>(null);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Mouse move handler for 3D card tilt & holo shine
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    setMousePos({ x: xPercent, y: yPercent });

    // Subtle 3D perspective rotation (max +/- 7 degrees)
    const rotX = ((y / rect.height) - 0.5) * -12;
    const rotY = ((x / rect.width) - 0.5) * 12;
    setTilt({ rotateX: rotX, rotateY: rotY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0 });
    setMousePos({ x: 50, y: 50 });
  };

  // Auto-detect referral code from URL query params (e.g. ?ref=RAWAT2026)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlRef = params.get('ref');
      if (urlRef) {
        setReferralCode(urlRef.trim().toUpperCase());
      }
    } catch {
      // ignore
    }
  }, []);

  // Sync forgotEmail with email if provided
  useEffect(() => {
    if (email && !forgotEmail) {
      setForgotEmail(email);
    }
  }, [email, forgotEmail]);

  // Reset errors and touch state on mode switch
  useEffect(() => {
    setError(null);
    setSuccessMsg(null);
    setShakeTrigger(false);
    setForgotStatus('idle');
    setForgotError(null);
  }, [authModalMode]);

  // Helper to mark field as touched
  const handleBlur = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  // Password Strength Calculation
  const passwordStrengthInfo = useMemo<{
    score: number;
    label: PasswordStrength;
    color: string;
    width: string;
    glowColor: string;
  }>(() => {
    if (!password) {
      return { score: 0, label: 'Weak', color: 'bg-slate-700', width: 'w-0', glowColor: 'transparent' };
    }

    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: 'bg-rose-500', width: 'w-1/4', glowColor: 'rgba(244,63,94,0.5)' };
      case 2:
        return { score: 2, label: 'Fair', color: 'bg-amber-500', width: 'w-2/4', glowColor: 'rgba(245,158,11,0.5)' };
      case 3:
        return { score: 3, label: 'Strong', color: 'bg-emerald-500', width: 'w-3/4', glowColor: 'rgba(16,185,129,0.5)' };
      case 4:
      default:
        return { score: 4, label: 'Very Strong', color: 'bg-cyan-400', width: 'w-full', glowColor: 'rgba(34,211,238,0.6)' };
    }
  }, [password]);

  // Validation Checks
  const isEmailValid = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }, [email]);

  const isUsernameAvailable = useMemo(() => {
    const clean = username.trim().toLowerCase();
    if (clean.length < 3) return null;
    const exists = users.some((u) => u.username.toLowerCase() === clean);
    return !exists;
  }, [username, users]);

  const doPasswordsMatch = useMemo(() => {
    if (!confirmPassword) return null;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    if (!currentUser) {
      setError('Please create an account or sign in to explore RAWAT CARD STORE.');
      setShakeTrigger(true);
      setTimeout(() => setShakeTrigger(false), 500);
      return;
    }
    playSound('click', soundEnabled);
    setIsAuthModalOpen(false);
    setError(null);
    setSuccessMsg(null);
    setAuthSuccessData(null);
  };

  const triggerErrorAnimation = (msg: string) => {
    setError(msg);
    setShakeTrigger(true);
    playSound('denied', soundEnabled);
    setTimeout(() => setShakeTrigger(false), 600);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Validate fields
    if (username.trim().length < 3) {
      triggerErrorAnimation('Username must be at least 3 characters.');
      return;
    }

    if (!isEmailValid) {
      triggerErrorAnimation('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      triggerErrorAnimation('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      triggerErrorAnimation("Passwords don't match.");
      return;
    }

    setIsLoading(true);
    const res = await registerUser(
      username.trim(),
      email.trim(),
      password,
      referralCode.trim(),
      fullName.trim(),
      phone.trim()
    );
    setIsLoading(false);

    if (!res.success) {
      triggerErrorAnimation(res.message);
    } else {
      setIsAuthModalOpen(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!username.trim()) {
      triggerErrorAnimation('Please enter your email or username.');
      return;
    }
    if (!password) {
      triggerErrorAnimation('Please enter your password.');
      return;
    }

    setIsLoading(true);
    const res = await loginUser(username.trim(), password, rememberMe);
    setIsLoading(false);

    if (!res.success) {
      triggerErrorAnimation(res.message);
    } else {
      setIsAuthModalOpen(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (!forgotEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail.trim())) {
      setForgotError('Please enter a valid email address.');
      playSound('denied', soundEnabled);
      return;
    }

    setForgotStatus('sending');
    try {
      await resetFirebasePassword(forgotEmail.trim());
      setForgotStatus('sent');
      playSound('success', soundEnabled);
    } catch (err: any) {
      console.warn('[Password Reset]', err);
      setForgotStatus('sent');
      playSound('success', soundEnabled);
    }
  };

  return (
    <div
      id="customer-auth-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/92 backdrop-blur-2xl overflow-y-auto"
      style={{
        perspective: '1200px',
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
      }}
    >
      {/* Dynamic Animated Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 select-none">
        {/* Floating Neon Aurora Orbs */}
        <motion.div
          animate={{
            x: [0, 50, -40, 0],
            y: [0, -40, 50, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[540px] h-96 sm:h-[540px] rounded-full bg-gradient-to-tr from-purple-600/20 via-indigo-600/15 to-transparent blur-[130px]"
        />

        <motion.div
          animate={{
            x: [0, -50, 40, 0],
            y: [0, 45, -35, 0],
            scale: [1, 0.9, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 sm:w-[500px] h-80 sm:h-[500px] rounded-full bg-gradient-to-bl from-amber-500/15 via-rose-600/10 to-transparent blur-[140px]"
        />

        {/* Cyber Grid Pattern with Star Highlights */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(168,85,247,0.2)_1px,transparent_1px)] [background-size:28px_28px] opacity-35" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.7)_100%)]" />
      </div>

      {/* ========================================================
          LUXURIOUS 3D HOLOGRAPHIC AUTHENTICATION CARD
      ======================================================== */}
      <motion.div
        ref={cardRef}
        layout
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        initial={{
          opacity: 0,
          scale: 0.78,
          y: 70,
          rotateX: 18,
          filter: 'blur(12px)',
        }}
        animate={
          shakeTrigger
            ? {
                opacity: 1,
                scale: 1,
                y: 0,
                rotateX: 0,
                rotateY: 0,
                filter: 'blur(0px)',
                x: [-10, 10, -8, 8, -4, 4, 0],
                transition: { duration: 0.45 },
              }
            : {
                opacity: 1,
                scale: 1,
                y: 0,
                rotateX: tilt.rotateX,
                rotateY: tilt.rotateY,
                filter: 'blur(0px)',
                transition: {
                  type: 'spring',
                  stiffness: isHovered ? 400 : 300,
                  damping: 24,
                },
              }
        }
        exit={{
          opacity: 0,
          scale: 0.82,
          y: 50,
          rotateX: -15,
          filter: 'blur(8px)',
          transition: { duration: 0.25 },
        }}
        style={{
          transformStyle: 'preserve-3d',
        }}
        className="relative w-full max-w-md sm:max-w-lg rounded-[32px] p-6 sm:p-9 shadow-[0_0_80px_-15px_rgba(147,51,234,0.45),0_25px_50px_-12px_rgba(0,0,0,0.9)] backdrop-blur-3xl text-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col justify-between group border border-white/15 bg-gradient-to-b from-[#0e101f]/95 via-[#080913]/98 to-[#04050a]"
      >
        {/* Animated Rotating Holographic Rainbow/Gold Border Aura */}
        <div
          className="absolute -inset-[2px] rounded-[34px] -z-10 opacity-70 blur-[3px] pointer-events-none transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              'linear-gradient(135deg, rgba(234, 179, 8, 0.6) 0%, rgba(168, 85, 247, 0.8) 35%, rgba(56, 189, 248, 0.7) 70%, rgba(236, 72, 153, 0.6) 100%)',
          }}
        />

        {/* Dynamic Holographic Shine Layer on Mouse Position */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-[32px]"
          style={{
            background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255, 255, 255, 0.12) 0%, rgba(168, 85, 247, 0.06) 35%, transparent 65%)`,
            opacity: isHovered ? 1 : 0.4,
          }}
        />

        {/* Cyber-Luxury Corner Accents */}
        <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-amber-400/80 rounded-tl pointer-events-none" />
        <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-cyan-400/80 rounded-tr pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-purple-400/80 rounded-bl pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-amber-400/80 rounded-br pointer-events-none" />

        {/* Top Glowing Laser Edge */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_rgba(251,191,36,0.9)]" />

        {/* Dismiss / Close Button (Only if already authenticated) */}
        {currentUser && (
          <button
            id="auth-modal-close-btn"
            onClick={handleClose}
            aria-label="Close Authentication Modal"
            className="absolute top-4 right-4 p-2.5 rounded-full text-slate-400 hover:text-white bg-white/5 hover:bg-white/15 border border-white/10 transition-all cursor-pointer z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 shadow-lg"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Scrollable Container */}
        <div className="overflow-y-auto pr-0.5 -mr-0.5 space-y-4.5">
          {/* ========================================================
              1. RAWAT BRAND LUXURY HEADER WITH 3D EMBLEM
          ======================================================== */}
          <div className="text-center pt-1 pb-1">
            <motion.div
              initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20, delay: 0.1 }}
              className="relative inline-flex items-center justify-center mb-3"
            >
              {/* Outer Radiant Gold/Purple Glow Pulse */}
              <div className="absolute -inset-3 rounded-2xl bg-gradient-to-tr from-amber-500 via-purple-600 to-cyan-400 opacity-50 blur-lg animate-pulse" />

              {/* 3D Cyber Emblem */}
              <div className="relative h-16 w-16 sm:h-18 sm:w-18 rounded-2xl bg-gradient-to-tr from-amber-400 via-purple-500 to-indigo-600 p-[2px] shadow-2xl flex items-center justify-center">
                <div className="w-full h-full rounded-[14px] bg-[#090b16] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.35),transparent_70%)]" />
                  <span className="font-tech font-black text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-200 to-purple-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]">
                    R
                  </span>
                  {/* Subtle Glint */}
                  <motion.div
                    animate={{ x: [-80, 80] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                    className="absolute inset-0 w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                  />
                </div>
              </div>
            </motion.div>

            {/* Brand Title */}
            <h1 className="text-2xl sm:text-3xl font-tech font-black text-white tracking-tight leading-tight flex items-center justify-center gap-2">
              <span>RAWAT</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-purple-300 to-cyan-300 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                CARD STORE
              </span>
            </h1>

            {/* Subtitle VIP Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-950/60 via-purple-950/60 to-black border border-amber-500/40 text-[9.5px] sm:text-[10.5px] font-mono tracking-widest text-amber-300 uppercase mt-2 shadow-inner">
              <Crown className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span>ELITE CARD VAULT • V2.6</span>
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,1)] animate-pulse" />
            </div>
          </div>

          {/* ========================================================
              2. LUXURY MODE SWITCHING TABS (SIGN IN ↔ CREATE ACCOUNT)
          ======================================================== */}
          {authModalMode !== 'forgot_password' && (
            <div className="relative p-1.5 rounded-2xl bg-black/70 border border-white/15 grid grid-cols-2 gap-1.5 select-none shadow-inner">
              <button
                id="auth-tab-login"
                type="button"
                onClick={() => {
                  playSound('click', soundEnabled);
                  setAuthModalMode('login');
                }}
                className={`relative py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-2 z-10 ${
                  authModalMode === 'login' ? 'text-white font-extrabold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {authModalMode === 'login' && (
                  <motion.div
                    layoutId="auth-tab-pill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 shadow-[0_0_20px_rgba(147,51,234,0.5)] border border-white/20"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>SIGN IN</span>
                </span>
              </button>

              <button
                id="auth-tab-register"
                type="button"
                onClick={() => {
                  playSound('click', soundEnabled);
                  setAuthModalMode('register');
                }}
                className={`relative py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-2 z-10 ${
                  authModalMode === 'register' ? 'text-white font-extrabold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {authModalMode === 'register' && (
                  <motion.div
                    layoutId="auth-tab-pill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 shadow-[0_0_20px_rgba(245,158,11,0.5)] border border-white/20"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>CREATE ACCOUNT</span>
                </span>
              </button>
            </div>
          )}

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                id="auth-error-banner"
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs font-mono flex items-center gap-2.5 shadow-[0_0_20px_rgba(244,63,94,0.25)] overflow-hidden"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 animate-pulse" />
                <span className="flex-1 font-medium">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Overlay Banner */}
          <AnimatePresence>
            {authSuccessData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: -10 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/95 via-purple-950/95 to-amber-950/95 border border-emerald-400/60 text-emerald-200 text-center space-y-2 shadow-[0_0_35px_rgba(16,185,129,0.4)]"
              >
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-tech font-black text-base tracking-widest uppercase">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-bounce" />
                  <span>
                    {authSuccessData.type === 'login' ? '✓ ACCESS GRANTED' : '✓ VIP ACCOUNT ACTIVATED'}
                  </span>
                </div>
                <p className="text-xs font-mono text-white font-bold">
                  {authSuccessData.type === 'login'
                    ? `WELCOME BACK, @${authSuccessData.username.toUpperCase()}`
                    : 'WELCOME TO THE EXCLUSIVE RAWAT VAULT'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ========================================================
              3. DYNAMIC SCREEN TRANSITIONS WITH LUXURY AESTHETICS
          ======================================================== */}
          <AnimatePresence mode="wait">
            {/* ========================================================================= */}
            {/* LOGIN PAGE VIEW */}
            {/* ========================================================================= */}
            {authModalMode === 'login' && !authSuccessData && (
              <motion.div
                key="login-view"
                initial={{ opacity: 0, x: -25, filter: 'blur(4px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: 25, filter: 'blur(4px)' }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4"
              >
                {/* Header */}
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-tech font-bold text-white tracking-tight flex items-center gap-2">
                    <span>Sign In to Vault</span>
                    <Zap className="w-4 h-4 text-amber-400 fill-amber-400/30" />
                  </h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Enter your collector credentials to access live balance & cards.
                  </p>
                </div>

                <form id="auth-login-form" onSubmit={handleLogin} className="space-y-3.5">
                  {/* Email / Username Field */}
                  <div className="space-y-1">
                    <label
                      htmlFor="login-username-input"
                      className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider font-semibold"
                    >
                      Email / Username
                    </label>
                    <div className="relative group">
                      <input
                        id="login-username-input"
                        type="text"
                        required
                        autoComplete="username"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          if (error) setError(null);
                        }}
                        onBlur={() => handleBlur('login_username')}
                        placeholder="e.g. RAWATCARDER or email"
                        className="w-full h-11 sm:h-12 rounded-2xl border border-white/15 bg-black/60 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all font-mono shadow-inner"
                      />
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="login-password-input"
                        className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider font-semibold"
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          playSound('click', soundEnabled);
                          setAuthModalMode('forgot_password');
                        }}
                        className="text-[11px] font-mono text-amber-400 hover:text-amber-300 transition-colors underline decoration-amber-500/40 cursor-pointer font-bold"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative group">
                      <input
                        id="login-password-input"
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (error) setError(null);
                        }}
                        onBlur={() => handleBlur('login_password')}
                        placeholder="••••••••••••"
                        className="w-full h-11 sm:h-12 rounded-2xl border border-white/15 bg-black/60 pl-11 pr-11 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono shadow-inner"
                      />
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                      <button
                        type="button"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between pt-0.5">
                    <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-white/20 bg-black/60 text-purple-600 focus:ring-0 w-4 h-4 cursor-pointer"
                      />
                      <span>Keep me authenticated</span>
                    </label>
                  </div>

                  {/* LUXURY SIGN IN BUTTON */}
                  <button
                    id="login-submit-btn"
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full h-12 sm:h-13 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-tech font-black text-sm tracking-widest uppercase shadow-[0_0_30px_rgba(147,51,234,0.45)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden mt-3 border border-white/20"
                  >
                    {/* Animated Holographic Light Sweep Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />

                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-purple-200" />
                        <span>Verifying Security Protocol...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-amber-300" />
                        <span>SIGN IN TO VAULT</span>
                        <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1.5 transition-transform" />
                      </>
                    )}
                  </button>

                  {/* Switch to Register */}
                  <div className="text-center text-xs font-mono text-slate-400 pt-1">
                    New to RAWAT CARD STORE?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        playSound('click', soundEnabled);
                        setAuthModalMode('register');
                      }}
                      className="text-amber-400 font-bold hover:text-amber-300 underline decoration-amber-500/40 cursor-pointer ml-1"
                    >
                      Create Account
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* SIGN UP PAGE VIEW */}
            {/* ========================================================================= */}
            {authModalMode === 'register' && !authSuccessData && (
              <motion.div
                key="register-view"
                initial={{ opacity: 0, x: 25, filter: 'blur(4px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: -25, filter: 'blur(4px)' }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-3.5"
              >
                {/* Header */}
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-tech font-bold text-white tracking-tight flex items-center gap-2">
                    <span>Create Collector Account</span>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Get ₹50 signup bonus with referral + instant digital card delivery.
                  </p>
                </div>

                <form id="auth-register-form" onSubmit={handleRegister} className="space-y-3">
                  {/* Full Name & Username */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label
                        htmlFor="register-fullname-input"
                        className="block text-[10.5px] font-mono text-slate-300 uppercase tracking-wider font-semibold"
                      >
                        Full Name
                      </label>
                      <div className="relative group">
                        <input
                          id="register-fullname-input"
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          onBlur={() => handleBlur('fullName')}
                          placeholder="e.g. Rawat"
                          className="w-full h-10.5 sm:h-11 rounded-xl border border-white/15 bg-black/60 pl-9 pr-3 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all font-mono shadow-inner"
                        />
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-amber-400" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="register-username-input"
                        className="block text-[10.5px] font-mono text-slate-300 uppercase tracking-wider font-semibold"
                      >
                        Username
                      </label>
                      <div className="relative group">
                        <input
                          id="register-username-input"
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                          onBlur={() => handleBlur('username')}
                          placeholder="e.g. rawat"
                          className={`w-full h-10.5 sm:h-11 rounded-xl border bg-black/60 pl-9 pr-8 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 transition-all font-mono shadow-inner ${
                            touchedFields.username && isUsernameAvailable === true
                              ? 'border-emerald-500/80 focus:border-emerald-500 focus:ring-emerald-500/20'
                              : touchedFields.username && isUsernameAvailable === false
                              ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20'
                              : 'border-white/15 focus:border-purple-500 focus:ring-purple-500/30'
                          }`}
                        />
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                        {touchedFields.username && isUsernameAvailable === true && (
                          <Check className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>
                      {/* Inline Validation Check */}
                      {touchedFields.username && isUsernameAvailable === true && (
                        <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>✓ Username available</span>
                        </div>
                      )}
                      {touchedFields.username && isUsernameAvailable === false && (
                        <div className="text-[10px] font-mono text-rose-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Username already taken</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label
                        htmlFor="register-email-input"
                        className="block text-[10.5px] font-mono text-slate-300 uppercase tracking-wider font-semibold"
                      >
                        Email Address
                      </label>
                      <div className="relative group">
                        <input
                          id="register-email-input"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onBlur={() => handleBlur('email')}
                          placeholder="yourname@gmail.com"
                          className={`w-full h-10.5 sm:h-11 rounded-xl border bg-black/60 pl-9 pr-8 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 transition-all font-mono shadow-inner ${
                            touchedFields.email && isEmailValid
                              ? 'border-emerald-500/80 focus:border-emerald-500 focus:ring-emerald-500/20'
                              : touchedFields.email && !isEmailValid
                              ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20'
                              : 'border-white/15 focus:border-purple-500 focus:ring-purple-500/30'
                          }`}
                        />
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                        {touchedFields.email && isEmailValid && (
                          <Check className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>
                      {/* Inline Validation Check */}
                      {touchedFields.email && isEmailValid && (
                        <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>✓ Email format valid</span>
                        </div>
                      )}
                      {touchedFields.email && !isEmailValid && (
                        <div className="text-[10px] font-mono text-rose-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Enter a valid email address</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="register-phone-input"
                        className="block text-[10.5px] font-mono text-slate-300 uppercase tracking-wider font-semibold flex items-center justify-between"
                      >
                        <span>Phone Number</span>
                        <span className="text-[9px] text-slate-500 font-normal">Optional</span>
                      </label>
                      <div className="relative group">
                        <input
                          id="register-phone-input"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full h-10.5 sm:h-11 rounded-xl border border-white/15 bg-black/60 pl-9 pr-3 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all font-mono shadow-inner"
                        />
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                      </div>
                    </div>
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label
                        htmlFor="register-password-input"
                        className="block text-[10.5px] font-mono text-slate-300 uppercase tracking-wider font-semibold"
                      >
                        Password
                      </label>
                      <div className="relative group">
                        <input
                          id="register-password-input"
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onBlur={() => handleBlur('password')}
                          placeholder="Min 6 characters"
                          className="w-full h-10.5 sm:h-11 rounded-xl border border-white/15 bg-black/60 pl-9 pr-9 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all font-mono shadow-inner"
                        />
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                        <button
                          type="button"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Password Strength Indicator */}
                      {password.length > 0 && (
                        <div className="pt-1 space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-slate-400">Strength:</span>
                            <span
                              className={`font-semibold ${
                                passwordStrengthInfo.score === 1
                                  ? 'text-rose-400'
                                  : passwordStrengthInfo.score === 2
                                  ? 'text-amber-400'
                                  : passwordStrengthInfo.score === 3
                                  ? 'text-emerald-400'
                                  : 'text-cyan-400'
                              }`}
                            >
                              {passwordStrengthInfo.label}
                            </span>
                          </div>
                          {/* 4-Segment Meter */}
                          <div className="grid grid-cols-4 gap-1 h-1 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                passwordStrengthInfo.score >= 1 ? passwordStrengthInfo.color : 'bg-transparent'
                              }`}
                            />
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                passwordStrengthInfo.score >= 2 ? passwordStrengthInfo.color : 'bg-transparent'
                              }`}
                            />
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                passwordStrengthInfo.score >= 3 ? passwordStrengthInfo.color : 'bg-transparent'
                              }`}
                            />
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                passwordStrengthInfo.score >= 4 ? passwordStrengthInfo.color : 'bg-transparent'
                              }`}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="register-confirm-password-input"
                        className="block text-[10.5px] font-mono text-slate-300 uppercase tracking-wider font-semibold"
                      >
                        Confirm Password
                      </label>
                      <div className="relative group">
                        <input
                          id="register-confirm-password-input"
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          onBlur={() => handleBlur('confirmPassword')}
                          placeholder="Re-enter password"
                          className={`w-full h-10.5 sm:h-11 rounded-xl border bg-black/60 pl-9 pr-9 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 transition-all font-mono shadow-inner ${
                            touchedFields.confirmPassword && doPasswordsMatch === true
                              ? 'border-emerald-500/80 focus:border-emerald-500 focus:ring-emerald-500/20'
                              : touchedFields.confirmPassword && doPasswordsMatch === false
                              ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20'
                              : 'border-white/15 focus:border-purple-500 focus:ring-purple-500/30'
                          }`}
                        />
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                        <button
                          type="button"
                          aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Inline Validation Check */}
                      {touchedFields.confirmPassword && doPasswordsMatch === true && (
                        <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 pt-0.5">
                          <Check className="w-3 h-3" />
                          <span>✓ Passwords match</span>
                        </div>
                      )}
                      {touchedFields.confirmPassword && doPasswordsMatch === false && (
                        <div className="text-[10px] font-mono text-rose-400 flex items-center gap-1 pt-0.5">
                          <AlertCircle className="w-3 h-3" />
                          <span>Passwords don&apos;t match</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Referral Code (Optional) with ₹50 Bonus Badge */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="register-referral-input"
                        className="block text-[10.5px] font-mono text-slate-300 uppercase tracking-wider font-semibold"
                      >
                        Referral Code (Optional)
                      </label>
                      <span className="text-[10px] font-mono text-amber-300 font-bold bg-amber-950/70 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        <Gift className="w-3 h-3 text-amber-400" />
                        <span>₹50 Instant Bonus</span>
                      </span>
                    </div>
                    <div className="relative group">
                      <input
                        id="register-referral-input"
                        type="text"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                        placeholder="e.g. RAWAT2026"
                        className="w-full h-10.5 sm:h-11 rounded-xl border border-white/15 bg-black/60 pl-9 pr-3 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 font-mono uppercase shadow-inner"
                      />
                      <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-amber-400" />
                    </div>
                  </div>

                  {/* LUXURY CREATE ACCOUNT BUTTON */}
                  <button
                    id="register-submit-btn"
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full h-12 sm:h-13 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-tech font-black text-sm tracking-widest uppercase shadow-[0_0_30px_rgba(245,158,11,0.45)] hover:shadow-[0_0_40px_rgba(147,51,234,0.5)] transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden mt-3 border border-white/20"
                  >
                    {/* Animated Light Sweep Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />

                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-200" />
                        <span>Initializing Vault Security...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>CREATE COLLECTOR ACCOUNT</span>
                        <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1.5 transition-transform" />
                      </>
                    )}
                  </button>

                  {/* Switch to Login */}
                  <div className="text-center text-xs font-mono text-slate-400 pt-1">
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        playSound('click', soundEnabled);
                        setAuthModalMode('login');
                      }}
                      className="text-amber-400 font-bold hover:text-amber-300 underline decoration-amber-500/40 cursor-pointer ml-1"
                    >
                      Sign In
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* FORGOT PASSWORD VIEW / DRAWER */}
            {/* ========================================================================= */}
            {authModalMode === 'forgot_password' && (
              <motion.div
                key="forgot-password-view"
                initial={{ opacity: 0, scale: 0.94, filter: 'blur(4px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.94, filter: 'blur(4px)' }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="space-y-4"
              >
                {/* Back Button & Title */}
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      playSound('click', soundEnabled);
                      setAuthModalMode('login');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-amber-400 transition-colors mb-2 cursor-pointer font-bold"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back to Sign In</span>
                  </button>

                  <h2 className="text-lg sm:text-xl font-tech font-bold text-white tracking-tight">
                    Reset Vault Password
                  </h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Enter your registered email address to receive password recovery instructions.
                  </p>
                </div>

                {/* Status Messages */}
                {forgotStatus === 'sent' && (
                  <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-mono space-y-1 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <div className="flex items-center gap-2 font-bold text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Recovery Email Dispatched</span>
                    </div>
                    <p className="text-slate-300">
                      Password reset instructions have been sent to <span className="text-white font-bold">{forgotEmail}</span>. Please check your inbox and spam folder.
                    </p>
                  </div>
                )}

                {forgotError && (
                  <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>Unable to send: {forgotError}</span>
                  </div>
                )}

                <form onSubmit={handleForgotPasswordSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label
                      htmlFor="forgot-email-input"
                      className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider font-semibold"
                    >
                      Email Address
                    </label>
                    <div className="relative group">
                      <input
                        id="forgot-email-input"
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => {
                          setForgotEmail(e.target.value);
                          if (forgotError) setForgotError(null);
                        }}
                        placeholder="yourname@gmail.com"
                        className="w-full h-11 sm:h-12 rounded-2xl border border-white/15 bg-black/60 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all font-mono shadow-inner"
                      />
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                    </div>
                  </div>

                  <button
                    id="forgot-submit-btn"
                    type="submit"
                    disabled={forgotStatus === 'sending'}
                    className="w-full h-12 sm:h-13 rounded-2xl bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-tech font-bold text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(147,51,234,0.4)] transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 border border-white/15"
                  >
                    {forgotStatus === 'sending' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-purple-200" />
                        <span>Sending Instructions...</span>
                      </>
                    ) : forgotStatus === 'sent' ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Resend Reset Link</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 text-amber-300" />
                        <span>SEND RESET LINK</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        playSound('click', soundEnabled);
                        setAuthModalMode('login');
                      }}
                      className="text-xs font-mono text-slate-400 hover:text-amber-400 underline decoration-white/20 cursor-pointer"
                    >
                      Return to Sign In
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ========================================================
            4. BOTTOM SECURITY & AUTHENTICATION FOOTER
        ======================================================== */}
        <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between text-[10.5px] font-mono text-slate-400 select-none">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold">256-BIT QUANTUM VAULT</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <Star className="w-3 h-3 text-purple-400 fill-purple-400" />
            <span>RAWAT VERIFIED</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
