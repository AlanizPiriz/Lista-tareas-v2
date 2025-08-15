/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// 🔥 Configuración de tu proyecto Firebase
firebase.initializeApp({
  apiKey: "AIzaSyAduw3rNK7888j3YJ6h1JhG8HRxq2cubwo",
  authDomain: "tareas-celemyr.firebaseapp.com",
  projectId: "tareas-celemyr",
  storageBucket: "tareas-celemyr.firebasestorage.app",
  messagingSenderId: "665957687992",
  appId: "1:665957687992:web:685172daa7d1eeba4a4a4d"
});

// ⚙️ Inicializa Firebase Messaging
const messaging = firebase.messaging();

// ✅ Escucha mensajes push directamente (este es el que realmente funciona)
self.addEventListener('push', function (event) {
  console.log('[firebase-messaging-sw.js] Push recibido:', event);

  if (!event.data) return;

  const data = event.data.json();

  const notificationTitle = data.notification?.title || 'Notificación';
  const notificationOptions = {
    body: data.notification?.body || '',
    icon: '/firebase-logo.png',
    badge: '/firebase-logo.png',
    data: {
      url: '/' // puedes cambiar esto si querés redirigir a otra ruta
    }
  };

  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
  );
});

// ✅ Click en notificación: redirige a la app
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function (clientList) {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
