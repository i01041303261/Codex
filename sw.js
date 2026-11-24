/* CODEX RPG Service Worker
 * 전략: Network-First (게임이 자주 업데이트되므로 항상 네트워크 우선, 실패 시에만 캐시)
 * - 같은 출처(origin)의 GET 요청만 다룬다. 외부 CDN(PeerJS 등)·다른 출처·non-GET은 그대로 통과.
 */
const CACHE_VERSION = 'codex-v2026.11.24a';
const CACHE_PREFIX = 'codex-runtime-';
const CACHE_NAME = CACHE_PREFIX + CACHE_VERSION;

/* 오프라인 첫 진입용 최소 셸 */
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png?v=20261124a',
  './icons/icon-512.png?v=20261124a',
  './icons/icon-maskable-512.png?v=20261124a',
  './icons/apple-touch-icon.png?v=20261124a'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // 하나가 실패해도 설치 자체는 진행
    await Promise.all(PRECACHE_URLS.map(async (url) => {
      try {
        const res = await fetch(new Request(url, { cache: 'reload' }));
        if (res && (res.ok || res.type === 'opaque')) await cache.put(url, res.clone());
      } catch (e) {
        // 무시: 런타임에 다시 캐시된다
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => {
      if (key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME) return caches.delete(key);
      return Promise.resolve(false);
    }));
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.disable(); } catch (e) {}
    }
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SKIP_WAITING') self.skipWaiting();
  if (data.type === 'CLEAR_CACHE') {
    event.waitUntil(caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k.startsWith(CACHE_PREFIX)).map((k) => caches.delete(k)))
    ));
  }
});

function isCacheableResponse(res) {
  return res && res.ok && res.type === 'basic' && res.status === 200;
}

async function networkFirst(request, fallbackUrl, opts) {
  const cache = await caches.open(CACHE_NAME);
  // HTML 문서는 브라우저 HTTP 캐시(GitHub Pages 10분)까지 건너뛰고 항상 최신을 받는다
  const fetchInit = (opts && opts.noHttpCache) ? { cache: 'no-store' } : undefined;
  try {
    const response = await fetch(request, fetchInit);
    if (isCacheableResponse(response)) {
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request, { ignoreSearch: false });
    if (cached) return cached;
    if (fallbackUrl) {
      const fallback = await cache.match(fallbackUrl);
      if (fallback) return fallback;
    }
    // 캐시에도 없으면 오프라인 안내 페이지
    return new Response(
      '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>CODEX · 오프라인</title>' +
      '<body style="margin:0;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;' +
      'background:#070913;color:#f8f9fa;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;text-align:center;padding:24px">' +
      '<div style="font-size:44px">🌌</div>' +
      '<h1 style="font-size:20px;margin:14px 0 8px">지금은 오프라인 상태예요</h1>' +
      '<p style="color:#a0aec0;font-size:14px;line-height:1.6;margin:0 0 20px">인터넷에 연결되면 CODEX의 차원이 다시 열립니다.<br>연결 후 이 화면을 새로고침해 주세요.</p>' +
      '<button onclick="location.reload()" style="background:linear-gradient(135deg,#8338ec,#00f5d4);border:0;color:#08101a;font-weight:800;padding:12px 22px;border-radius:12px;font-size:15px">다시 시도</button>' +
      '</body>',
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // GET 외 요청은 건드리지 않는다
  if (request.method !== 'GET') return;

  let url;
  try { url = new URL(request.url); } catch (e) { return; }

  // http/https + 같은 출처만 처리 (PeerJS 등 외부 CDN 통과)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  if (url.origin !== self.location.origin) return;

  // 서비스 워커 자신은 항상 네트워크에서 최신으로
  if (url.pathname.endsWith('/sw.js')) return;

  // Range 요청(부분 다운로드)은 그대로 통과
  if (request.headers.get('range')) return;
  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, './index.html', { noHttpCache: true }));
    return;
  }

  event.respondWith(networkFirst(request));
});
