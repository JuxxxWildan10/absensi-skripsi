import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)

if ('serviceWorker' in navigator) {
    const registerSW = () => {
        navigator.serviceWorker
            .register('/sw.js')
            .then((registration) => {
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
                console.error('[PWA] Service Worker registration failed:', error);
            });
    };

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        registerSW();
    } else {
        window.addEventListener('load', registerSW);
    }
}

