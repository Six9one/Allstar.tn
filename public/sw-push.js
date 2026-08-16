// ==============================================================================
// ALL-STAR SPORTS ACADEMY — NATIVE OS WEB PUSH SERVICE WORKER HANDLERS
// ==============================================================================

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

  const title = payload.title || 'أكاديمية أولستار الرياضية 🇹🇳';
  const body = payload.body || 'تنبيه جديد من الأكاديمية';
  const targetUrl = payload.data?.url || payload.targetUrl || '/';
  const iconUrl = payload.icon || 'https://allstar.tn/icon.png';
  const imageUrl = payload.image || payload.imageUrl || undefined;

  const options = {
    body: body,
    icon: iconUrl,
    badge: 'https://allstar.tn/icon.png',
    image: imageUrl,
    vibrate: [200, 100, 200, 100, 200],
    tag: payload.tag || `academy-notif-${Date.now()}`,
    renotify: true,
    requireInteraction: true,
    data: {
      url: targetUrl,
      dateOfArrival: Date.now()
    },
    actions: [
      { action: 'open', title: '📱 فتح التطبيق' }
    ]
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
