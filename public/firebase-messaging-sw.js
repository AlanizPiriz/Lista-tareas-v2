
/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// ✅ Tu configuración de Firebase
firebase.initializeApp({
  apiKey: "AIzaSyAduw3rNK7888j3YJ6h1JhG8HRxq2cubwo",
  authDomain: "tareas-celemyr.firebaseapp.com",
  projectId: "tareas-celemyr",
  storageBucket: "tareas-celemyr.firebasestorage.app",
  messagingSenderId: "665957687992",
  appId: "1:665957687992:web:685172daa7d1eeba4a4a4d"
});

// ✅ Inicializa Firebase Messaging
const messaging = firebase.messaging();

// ✅ Manejador de mensajes en segundo plano
messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Mensaje en background:', payload);

  const notificationTitle = payload.notification.title || 'Notificación';
  const notificationOptions = {
    body: payload.notification.body || '',
    icon: '/firebase-logo.png', // reemplazá por el ícono de tu app
    badge: '/firebase-logo.png', // opcional, ícono pequeño
    data: {
      url: '/' // opcional: redirigir a una URL cuando hacen clic
    }
  };

  // ⚠️ Esta parte es CRUCIAL para iOS:
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// ✅ Click en la notificación (opcional)
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function (clientList) {
      // Abre la app si ya está abierta o crea una nueva ventana
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
