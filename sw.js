// Service Worker - 柔道スコアボード
const CACHE_NAME = 'judo-scoreboard-v6';
const ASSETS = [
  './judo_scoreboard.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

// インストール時にキャッシュ
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // 即座に新バージョンに切り替え
});

// 古いキャッシュを削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim(); // 開いているタブも即座に新バージョンに
});

// ネットワーク優先（常に最新を取得、失敗時はキャッシュ）
// cache: 'no-store' でブラウザのHTTPキャッシュも無視し、必ずネットワークから取得する
// （これがないと、再起動直後などmax-age内の再アクセスで古い内容が返り続けることがある）
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then(response => {
        // 取得成功したらキャッシュも更新
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request)) // オフライン時はキャッシュから
  );
});
