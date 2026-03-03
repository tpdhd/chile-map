// Kill old service worker: clear caches and unregister
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(n => Promise.all(n.map(c => caches.delete(c))))
      .then(() => self.registration.unregister())
  )
})
