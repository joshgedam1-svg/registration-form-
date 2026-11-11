// Cricket Auction League - Mobile Push Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listen for push notifications
self.addEventListener('push', (event) => {
  let payload = {
    title: 'Cricket Auction League',
    body: 'New player payment received',
    url: '/admin/players'
  };

  if (event.data) {
    try {
      payload = event.data.json();
    } catch (e) {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,
    icon: '/logo.svg',
    badge: '/logo.svg',
    vibrate: [250, 100, 250, 100, 250],
    data: { url: payload.url || '/admin/players' },
    tag: 'cal-payment-notification',
    renotify: true
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

// Handle clicking the notification on mobile
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/admin/players';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/admin/players') && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
