import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Debugging PWA Registration
(window as any).PWA_STATUS = {
    sw: 'init',
    error: null,
    scope: null,
    ready: 'no'
};
(window as any).PWA_STATUS.ready = document.readyState;

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)

if ('serviceWorker' in navigator) {
    const registerSW = () => {
        (window as any).PWA_STATUS.sw = 'registering...';
        navigator.serviceWorker
            .register('/sw.js')
            .then((registration) => {
                (window as any).PWA_STATUS.sw = 'registered';
                (window as any).PWA_STATUS.scope = registration.scope;
                console.log('[PWA] Service Worker registered:', registration.scope);

                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.log('[PWA] New version available! Refresh to update.');
                            }
                        });
                    }
                });
            })
            .catch((error) => {
                (window as any).PWA_STATUS.sw = 'failed';
                (window as any).PWA_STATUS.error = error.message;
                console.error('[PWA] Service Worker registration failed:', error);
            });
    };

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        registerSW();
    } else {
        window.addEventListener('load', registerSW);
    }
} else {
    (window as any).PWA_STATUS.sw = 'not-supported';
}

