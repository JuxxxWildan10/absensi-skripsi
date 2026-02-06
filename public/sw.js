const CACHE_NAME = 'absensi-v2';
const DYNAMIC_CACHE = 'absensi-dynamic-v2';

// Assets to precache (if possible, otherwise we rely on runtime caching)
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    console.log('[SW] Installing new version...', CACHE_NAME);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Precaching core assets');
                // We use addAll with catch to avoid failing if one file is missing (robustness)
                return cache.addAll(PRECACHE_URLS).catch(err => {
                    console.warn('[SW] Precache warning:', err);
                });
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Activating new version...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME && cache !== DYNAMIC_CACHE) {
                        console.log('[SW] Clearing old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // 1. Ignore non-http(s) requests (e.g., extensions)
    if (!url.protocol.startsWith('http')) return;

    // 2. Ignore API/Supabase calls (Network Only) for fresh data
    // Adjust this condition based on your actual API endpoints
    if (url.href.includes('supabase') || url.pathname.startsWith('/api')) {
        return;
    }

    // 3. Navigation Requests (HTML) - Network First, fall back to Cache
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((networkResponse) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                    });
                })
                .catch(() => {
                    return caches.match(request).then((cachedResponse) => {
                        if (cachedResponse) return cachedResponse;
                        // Optional: Return a specific offline page if you have one
                        return caches.match('/index.html');
                    });
                })
        );
        return;
    }

    // 4. Static Assets (JS, CSS, Images, Fonts) - Stale-While-Revalidate
    // This returns the cache immediately while updating it in the background
    if (
        request.destination === 'script' ||
        request.destination === 'style' ||
        request.destination === 'image' ||
        request.destination === 'font'
    ) {
        event.respondWith(
            caches.open(DYNAMIC_CACHE).then((cache) => {
                return cache.match(request).then((cachedResponse) => {
                    const fetchPromise = fetch(request).then((networkResponse) => {
                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                    });
                    // Return cached response if available, otherwise wait for network
                    return cachedResponse || fetchPromise;
                });
            })
        );
        return;
    }

    // 5. Default fallback (Network First) for everything else
    event.respondWith(
        fetch(request).catch(() => caches.match(request))
    );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
