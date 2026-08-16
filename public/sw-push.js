// ==============================================================================
// ALL-STAR SPORTS ACADEMY — NATIVE OS WEB PUSH SERVICE WORKER HANDLERS
// ==============================================================================

// 1. OneSignal Background Service Worker for iOS 16.4+ / Android Lock-Screen Push
try {
  importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
} catch (e) {
  console.log('OneSignal SW script import notice:', e);
}

// 2. Custom Web Push Fallback Listener
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
  const body = payload.body || 'تنبيه جديد من الأكاديمية';
  const targetUrl = payload.data?.url || payload.targetUrl || '/';
  const iconUrl = payload.icon || 'https://allstar.tn/logo-light.png';
  const imageUrl = payload.image || payload.imageUrl || undefined;

  const options = {
    body: body,
    icon: iconUrl,
    badge: 'https://allstar.tn/logo-light.png',
    image: imageUrl,
    vibrate: [200, 100, 200, 100, 200],
    tag: payload.tag || `academy-notif-${Date.now()}`,
    renotify: true,
    requireInteraction: true,
    data: {
      url: targetUrl,
      dateOfArrival: Date.now()
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it and navigate
      for (const client of windowClients) {
        if ('focus' in client) {
          if (client.url.includes(targetUrl)) {
            return client.focus();
          } else if ('navigate' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
