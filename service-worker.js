// Nome della cache per questa versione della PWA
const CACHE_NAME = 'pegasus-cache-v1';

// Risorse che compongono l'App Shell e devono essere messe in cache
// L'URL './index.html' dovrà puntare all'effettivo file HTML
const urlsToCache = [
    './index.html', /* L'app stessa */
    'https://cdn.tailwindcss.com', /* La libreria CSS esterna */
    'https://placehold.co/192x192/1e3a8a/ffffff?text=PWA' /* Icona di placeholder */
];

/**
 * Listener 'install': Mette in cache tutte le risorse essenziali (App Shell).
 * Questo evento viene eseguito una sola volta quando il Service Worker viene installato.
 */
self.addEventListener('install', (event) => {
    // Attendiamo l'apertura della cache e l'aggiunta di tutte le risorse necessarie.
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching App Shell');
                return cache.addAll(urlsToCache);
            })
            // self.skipWaiting() forza l'attivazione del nuovo SW immediatamente, senza dover chiudere le schede aperte.
            .then(() => self.skipWaiting()) 
            .catch((error) => console.error('Service Worker: Errore nel caching durante l\'installazione', error))
    );
});

/**
 * Listener 'activate': Pulisce le vecchie cache per garantire che solo la cache corrente sia utilizzata.
 */
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                // Itera su tutte le cache e cancella quelle che non corrispondono a CACHE_NAME
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Eliminazione cache obsoleta:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Prende il controllo delle pagine esistenti subito dopo l'attivazione
    );
});

/**
 * Listener 'fetch': Intercetta ogni richiesta HTTP della pagina.
 * Implementa una strategia "Cache-First, then Network" con aggiornamento della cache.
 */
self.addEventListener('fetch', (event) => {
    // Ignoriamo le richieste che non sono HTTP/HTTPS (es. richieste di estensioni del browser)
    if (event.request.url.startsWith('chrome-extension://')) return;

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 1. Se la risorsa è in cache, la serviamo immediatamente
                if (response) {
                    console.log('Service Worker: Risorsa servita dalla cache:', event.request.url);
                    return response;
                }

                // 2. Altrimenti, andiamo in rete (Network)
                return fetch(event.request).then((networkResponse) => {
                    // Controlliamo se la risposta è valida
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }

                    // Cloniamo la risposta: una copia va al browser, l'altra nella cache
                    const responseToCache = networkResponse.clone();
                    
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                            console.log('Service Worker: Risorsa messa in cache:', event.request.url);
                        });

                    return networkResponse;
                });
            })
            .catch((error) => {
                console.error('Service Worker: Errore nel fetch:', error);
                // In caso di fallimento sia della cache che della rete (es. offline),
                // serviamo la pagina HTML principale (un fallback sicuro).
                return caches.match('./pwa_app.html'); 
            })
    );
});
