// Service Worker بسيط لصخرة العهد
// بيخزن الملفات الأساسية عشان الموقع يفتح بسرعة ويشتغل كتطبيق حتى لو النت ضعيف
const CACHE_NAME = 'sakhrat-al-ahd-v1';
const ASSETS_TO_CACHE = [
  'index.html',
  'family.html',
  'admin.html',
  'styles.css',
  'config.js',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// إستراتيجية: نجرب الشبكة الأول (عشان بيانات المحاضرات تفضل محدثة)، ولو مفيش نت نرجع للنسخة المخزنة
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
