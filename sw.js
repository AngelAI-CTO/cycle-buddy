// CYCLE BUDDY Service Worker
const CACHE_NAME = 'cb-v1';

// Install — cache the app shell
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(['/cycle-buddy/', '/cycle-buddy/index.html']))
    );
    self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
        ))
    );
    self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', (e) => {
    e.respondWith(
        fetch(e.request).catch(() => caches.match(e.request))
    );
});

// Listen for messages from the app
self.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'SHOW_NOTIFICATION') {
        const { title, body, tag } = e.data;
        self.registration.showNotification(title, {
            body,
            tag,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%230a0e17" width="100" height="100" rx="20"/><text x="50" y="62" text-anchor="middle" font-size="50" fill="%2300d4ff">◎</text></svg>',
            badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%2300d4ff" width="100" height="100" rx="50"/></svg>',
            vibrate: [200, 100, 200],
            requireInteraction: false,
        });
    }
});

// Click on notification — open the app
self.addEventListener('notificationclick', (e) => {
    e.notification.close();
    e.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            for (const client of windowClients) {
                if (client.url.includes('/cycle-buddy') && 'focus' in client) {
                    return client.focus();
                }
            }
            return clients.openWindow('/cycle-buddy/');
        })
    );
});
