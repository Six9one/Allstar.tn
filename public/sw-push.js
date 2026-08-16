// ==============================================================================
// ALL-STAR SPORTS ACADEMY — NATIVE OS WEB PUSH SERVICE WORKER HANDLERS
// ==============================================================================

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch (e) {
    payload = {
      title: 'أكاديمية أولستار الرياضية',
      body: event.data.text(),
      data: { url: '/' }
    };
  }

  const options = {
    body: payload.body,
    icon: payload.icon || '/icon.png',
    badge: payload.badge || '/icon.png',
    image: payload.image || null,
    vibrate: payload.vibrate || [200, 100, 200],
    tag: payload.tag || `academy-notification-${Date.now()}`,
    renotify: true,
    data: {
      url: payload.data?.url || payload.targetUrl || '/'
    }
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
