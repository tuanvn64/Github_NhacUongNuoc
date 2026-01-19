
self.addEventListener('install', (event) => {
  self.skipWaiting();
  console.log('SW installed');
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
  console.log('SW activated');
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'HydroFlow', body: 'Đã đến lúc uống nước!' };
  const options = {
    body: data.body,
    icon: 'https://cdn-icons-png.flaticon.com/512/3105/3105807.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/3105/3105807.png',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    tag: 'water-reminder',
    renotify: true
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
