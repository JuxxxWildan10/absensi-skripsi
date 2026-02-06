import React, { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        console.log('[PWA] InstallPrompt mounted');
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('[PWA] Already in standalone mode');
            setIsInstalled(true);
            return;
        }

        // Check if user previously dismissed
        // const dismissed = localStorage.getItem('pwa-install-dismissed');
        // if (dismissed) {
        //     console.log('[PWA] Install prompt previously dismissed');
        //     return;
        // }

        // Listen for install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            console.log('[PWA] beforeinstallprompt event fired');
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Listen for successful installation
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA installed successfully!');
            setIsInstalled(true);
            setShowPrompt(false);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show install prompt
        await deferredPrompt.prompt();

        // Wait for user choice
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response: ${outcome}`);

        // Clear prompt
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    // For debugging, we can force it to show or add a debug indicator
    const swStatus = (window as any).PWA_STATUS || { sw: 'unknown', ready: '?', error: null };
    const debugInfo = `SW: ${swStatus.sw}${swStatus.error ? ` (${swStatus.error})` : ''}, Ready: ${swStatus.ready}, Prompt: ${!!deferredPrompt}`;

    if (isInstalled) {
        return (
            <div className="fixed bottom-0 right-0 bg-green-500/80 text-white text-[8px] px-2 z-[9999]">
                PWA: Standalone Mode
            </div>
        );
    }

    if (!showPrompt) {
        return (
            <div className="fixed bottom-0 right-0 bg-yellow-500/80 text-white text-[8px] px-2 z-[9999]">
                PWA Debug: {debugInfo}
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
            <div className="glass-panel p-4 rounded-2xl shadow-2xl border border-white/20">
                <div className="text-[8px] text-gray-400 mb-1">Debug: {debugInfo}</div>
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-xl">
                            <Download className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-sm">Install Aplikasi</h3>
                            <p className="text-xs text-gray-500">Gunakan seperti aplikasi native</p>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleInstallClick}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:shadow-lg transition-all"
                    >
                        Install Sekarang
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="px-4 py-2 text-gray-600 text-sm font-medium hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        Nanti
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallPrompt;
