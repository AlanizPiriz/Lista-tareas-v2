importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAduw3rNK7888j3YJ6h1JhG8HRxq2cubwo",
  authDomain: "tareas-celemyr.firebaseapp.com",
  projectId: "tareas-celemyr",
  storageBucket: "tareas-celemyr.firebasestorage.app",
  messagingSenderId: "665957687992",
  appId: "1:665957687992:web:685172daa7d1eeba4a4a4d"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/firebase-logo.png'
  });
});
