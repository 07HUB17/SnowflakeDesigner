// キャッシュ名とキャッシュ対象のファイルリスト
const CACHE_NAME = 'snowflake-designer-v1';
const urlsToCache = [
    './snowflake_designer.html',
    './manifest.json',
    'https://cdn.tailwindcss.com' // 外部リソースもキャッシュ
];

// インストールイベント: ファイルをキャッシュに追加
self.addEventListener('install', (event) => {
    // 古いService Workerがすぐに停止し、新しいService Workerが有効になることを保証
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache and caching core assets');
                // 全てのコアファイルをキャッシュに追加
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('Service Worker install failed:', error);
            })
    );
});

// fetchイベント: キャッシュから提供する (Cache-First戦略)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // キャッシュに見つかったらそれを返す
                if (response) {
                    return response;
                }
                
                // キャッシュにない場合はネットワークから取得
                return fetch(event.request).catch(() => {
                    // ネットワークエラーでオフラインの場合、何らかのフォールバックを返すことも可能だが、今回は単にエラーを返す
                    console.log('Fetch failed, request:', event.request.url);
                });
            })
    );
});

// アクティベートイベント: 古いキャッシュをクリーンアップ
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
