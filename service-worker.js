const CACHE_NAME = 'snowflake-designer-v1';
const urlsToCache = [
    './snowflake_designer.html',
    // PWAを有効化する際に用意するマニフェストとService Worker自身
    './manifest.json',
    './service-worker.js',
    // アプリケーションのコアアセット (アイコンなども含む)
    // '/icons/icon-192x192.png', 
    // '/icons/icon-512x512.png',
    '[https://cdn.tailwindcss.com](https://cdn.tailwindcss.com)' // 外部ライブラリもキャッシュ対象に含める
];

// インストールイベント: アプリケーションシェルをキャッシュ
self.addEventListener('install', (event) => {
    // 古いService Workerを待たずにすぐにアクティベート
    self.skipWaiting(); 
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// アクティベートイベント: 古いキャッシュの削除
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
    // クライアントをすぐに制御開始
    return self.clients.claim();
});

// フェッチイベント: キャッシュまたはネットワークからリソースを取得
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // キャッシュに見つかったらそれを返す
                if (response) {
                    return response;
                }
                // キャッシュになかったらネットワークから取得
                return fetch(event.request);
            })
    );
});
```

---

## 3. PWAを有効化する手順（本番環境向け）

本番環境（**HTTPSプロトコルで提供されるサーバー**）でPWA機能を完全に有効化するには、以下の3つのステップを実行してください。

### ステップ 1: 必要なファイルの作成と配置

上記「2.2. `manifest.json`」と「2.3. `service-worker.js`」の内容でファイルを作成し、**`snowflake_designer.html`と同じディレクトリ**に配置します。

* `snowflake_designer.html`
* `manifest.json`
* `service-worker.js`
* （必要に応じて）`/icons/` ディレクトリにアイコン画像

### ステップ 2: Service Worker登録コードの有効化

`snowflake_designer.html`ファイルを開き、`<script>`タグ内のService Worker登録コードの**コメントアウトを解除**します。

**コメントアウトを削除する箇所（赤枠内）:**

```javascript
/*
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    });
}
*/
```

**有効化後のコード:**

```javascript
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    });
}
```

### ステップ 3: HTTPS環境へのデプロイ

Service Workerは、セキュリティ上の理由から**HTTPS接続**が必須です。（開発環境の`localhost`は例外的に許可されますが、この実行環境のような特殊なプロトコルでは許可されません）。

ファイルをHTTPS対応のウェブサーバーにデプロイすることで、ブラウザがService Workerを正常に登録し、PWA機能が有効になります。