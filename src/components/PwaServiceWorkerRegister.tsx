'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export default function PwaServiceWorkerRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // 1. Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.log('SW registration error:', err));
    }

    // 2. Capture mobile PWA install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show install prompt if not previously dismissed
      const dismissed = sessionStorage.getItem('cal_pwa_dismissed');
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem('cal_pwa_dismissed', 'true');
  };

  if (!showInstallBanner) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-4 left-3 right-3 sm:left-auto sm:right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-slate-900 text-white p-3 sm:p-3.5 rounded-xl shadow-2xl border border-slate-700/80 flex items-center justify-between gap-3 max-w-sm sm:max-w-md mx-auto">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-primary-green p-1.5 shrink-0 flex items-center justify-center">
            <img src="/logo.svg" alt="CAL App" className="w-full h-full object-contain invert brightness-0" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold leading-tight truncate">Install CAL 2026 App</p>
            <p className="text-[11px] text-slate-400 leading-tight truncate">Add to mobile home screen for quick access</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-2.5 py-1.5 rounded-lg bg-primary-green hover:bg-primary-dark text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

