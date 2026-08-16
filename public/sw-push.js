// ==============================================================================
// ALL-STAR SPORTS ACADEMY — NATIVE OS WEB PUSH SERVICE WORKER HANDLERS
// Full spec: icon, badge, image, vibrate, tag, renotify, data.url
// ==============================================================================

// 1. OneSignal Background Service Worker for iOS 16.4+ / Android Lock-Screen Push
try {
  importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
} catch (e) {
  console.log('[AllStar SW] OneSignal SW script import notice:', e);
}

// 2. Native Web Push Handler — Full spec payload
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch (e) {
    payload = {
      title: 'أكاديمية أولستار الرياضية 🇹🇳',
      body: event.data.text() || 'لديك إشعار جديد من إدارة الأكاديمية',
      data: { url: '/' }
    };
  }

  // If this push was already handled by OneSignal, skip duplicate
  if (payload.custom && payload.custom.i) {
    return;
  }

  const title = payload.title || 'أكاديمية أولستار الرياضية 🇹🇳';
  const targetUrl = (payload.data && payload.data.url) || payload.targetUrl || '/';

  const options = {
    body: payload.body || 'تنبيه جديد من الأكاديمية',
    icon: payload.icon || '/icons/icon-512x512.png',
    badge: payload.badge || '/icons/badge-monochrome-96x96.png',
    image: payload.image || undefined,
    vibrate: payload.vibrate || [200, 100, 200],
    tag: payload.tag || ('academy-notification-' + Date.now()),
    renotify: true,
    requireInteraction: false,
    data: {
      url: targetUrl,
      dateOfArrival: (payload.data && payload.data.dateOfArrival) || Date.now()
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 3. Notification Click Handler — Navigate existing window or open new tab
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Find an already-open window that matches the target URL
      for (const client of windowClients) {
        if ('focus' in client) {
          if (client.url.includes(targetUrl)) {
            return client.focus();
          }
        }
      }
      // Navigate any existing window or open a new one
      for (const client of windowClients) {
        if ('navigate' in client && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Last resort: open new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// 4. Push Subscription Change — Re-subscribe on token refresh
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[AllStar SW] Push subscription changed — re-subscribing');
  event.waitUntil(
    self.registration.pushManager.subscribe({ userVisibleOnly: true })
      .then((newSubscription) => {
        console.log('[AllStar SW] Re-subscribed:', newSubscription.endpoint.substring(0, 35));
      })
      .catch((err) => {
        console.warn('[AllStar SW] Re-subscribe failed:', err);
      })
  );
});
