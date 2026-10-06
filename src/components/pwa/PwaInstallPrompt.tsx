import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { requestNotificationPermission, getNotificationPermission, sendBrowserPushNotification } from '../../utils/notifications';
import { playSound } from '../../utils/audio';
import {
  Download,
  Smartphone,
  Bell,
  CheckCircle2,
  X,
  Sparkles,
  Share,
  ShieldCheck,
  Zap
} from 'lucide-react';

export const PwaInstallPrompt: React.FC = () => {
  const { soundEnabled } = useStore();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return localStorage.getItem('rawat_pwa_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');
  const [isIos, setIsIos] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(true);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Capture PWA beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Initial notification permission
    setNotifPermission(getNotificationPermission());

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    playSound('click', soundEnabled);
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosInstructions(true);
    } else {
      alert('To install RAWAT Card Store on your device:\n\n1. Open your browser settings menu (⋮ or ⋯)\n2. Tap "Add to Home Screen" or "Install App"');
    }
  };

  const handleEnableNotifications = async () => {
    playSound('purchase', soundEnabled);
    const granted = await requestNotificationPermission();
    setNotifPermission(getNotificationPermission());
    if (granted) {
      sendBrowserPushNotification('🔔 RAWAT Store Alerts Activated!', {
        body: 'You will now receive instant push alerts for wallet deposits, order reveals, and limited card drops.',
      });
    }
  };

  const handleDismiss = () => {
    playSound('click', soundEnabled);
    setIsDismissed(true);
    try {
      localStorage.setItem('rawat_pwa_banner_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  if (isDismissed && isInstalled && notifPermission === 'granted') {
    return null;
  }

  return (
    <>
      {/* Floating Bottom Quick Bar or Mini Pill */}
      <div className="fixed bottom-20 left-4 z-40 max-w-sm w-[calc(100%-2rem)] sm:w-auto animate-in slide-in-from-bottom-5 duration-300">
        {!isDismissed ? (
          <div className="rounded-2xl bg-black/90 border border-purple-500/40 p-4 shadow-2xl shadow-purple-950/60 backdrop-blur-xl flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30 flex-shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-tech font-bold text-white tracking-wide text-sm">
                  <span>RAWAT APP</span>
                  <span className="px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-300 text-[9px] uppercase">
                    PRO PWA
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {notifPermission !== 'granted'
                    ? 'Enable push alerts & install for 1-tap access'
                    : 'Install app for offline vault & instant reveal'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {notifPermission !== 'granted' && (
                <button
                  type="button"
                  onClick={handleEnableNotifications}
                  title="Enable Push Alerts"
                  className="p-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-300 transition-all cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-tech font-bold text-xs uppercase tracking-wider shadow-md shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="p-1 rounded-lg text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* iOS Instructions Modal */}
      {showIosInstructions && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-zinc-950 border border-purple-500/40 p-6 space-y-5 text-white font-mono text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-tech font-bold">Install on iPhone / iPad</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIosInstructions(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-300">
              Follow these simple steps in Safari to add RAWAT Card Store to your home screen:
            </p>

            <div className="space-y-3 p-4 rounded-2xl bg-black/60 border border-white/10">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-900/60 text-purple-300 font-bold flex items-center justify-center flex-shrink-0">
                  1
                </span>
                <p className="text-slate-200">
                  Tap the <strong className="text-purple-400 inline-flex items-center gap-1"><Share className="w-3 h-3" /> Share</strong> button in your Safari toolbar.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-900/60 text-purple-300 font-bold flex items-center justify-center flex-shrink-0">
                  2
                </span>
                <p className="text-slate-200">
                  Scroll down and tap <strong className="text-purple-400">"Add to Home Screen"</strong>.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-900/60 text-purple-300 font-bold flex items-center justify-center flex-shrink-0">
                  3
                </span>
                <p className="text-slate-200">
                  Tap <strong className="text-purple-400">"Add"</strong> in the top right corner to launch it anytime.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosInstructions(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-tech font-bold text-xs uppercase tracking-wider text-white shadow-lg"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
