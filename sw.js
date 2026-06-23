// WIGO PWA 서비스 워커 — 앱 셸 캐시(오프라인 기동) + 네트워크 우선(API)
const CACHE = 'wigo-v1';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './icon-maskable.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Supabase API/인증/함수 호출은 항상 네트워크 (캐시 금지).
  if (url.hostname.endsWith('supabase.co') || url.hostname.endsWith('esm.sh')) {
    return; // 브라우저 기본 처리
  }
  // 앱 셸: 캐시 우선, 없으면 네트워크.
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).catch(() => caches.match('./index.html')))
  );
});
