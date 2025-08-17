// App.tsx
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { db, messaging, getToken, onMessage } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import Home from './components/Home';
import SectionSelector from './components/SectionSelector';
import TaskPage from './components/Task';

const App = () => {
  useEffect(() => {
    const isIphone = /iPhone/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (isIphone && !isStandalone) {
      alert('⚠️ Para recibir notificaciones, debes agregar esta app a tu pantalla de inicio desde Safari.');
    }

    if ('Notification' in window && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then(async (registration) => {
          console.log('✅ Service Worker registrado:', registration);

          if (Notification.permission === 'denied') {
            alert('🚫 Las notificaciones están bloqueadas. Activá permisos en Ajustes > Safari > Notificaciones.');
            return;
          }

          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            try {
              const token = await getToken(messaging, {
                vapidKey: 'BC0g1ahj7ENwUrpQeS8Kd8xcUOJT24JxkpW4YfYkuDWlvHiix9Ykzf6cRHiN4zGjPdoJIE-YU01cssRD5f3fKjY',
                serviceWorkerRegistration: registration,
              });

              if (token) {
                console.log('🔐 Token obtenido:', token);

                const docRef = doc(db, 'tokens', token);
                const existing = await getDoc(docRef);

                if (!existing.exists()) {
                  await setDoc(docRef, {
                    token,
                    createdAt: new Date(),
                    platform: isIphone ? 'ios' : 'web',
                  });
                  console.log('✅ Token guardado en Firestore');
                } else {
                  console.log('ℹ️ Token ya existe en Firestore');
                }
              } else {
                console.warn('⚠️ No se pudo obtener token FCM');
              }
            } catch (err) {
              console.error('❌ Error obteniendo token:', err);
            }
          }

          onMessage(messaging, (payload) => {
            console.log('📩 Mensaje recibido:', payload);
            alert(`🔔 Notificación: ${payload.notification?.title}`);
          });
        })
        .catch((err) => {
          console.error('❌ Error al registrar SW:', err);
        });
    } else {
      console.warn('🔕 Service Worker o Notification API no soportada');
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/areas" />} />
        <Route path="/areas" element={<Home />} />
        <Route path="/areas/:area" element={<SectionSelector />} />
        <Route path="/areas/:area/:section" element={<TaskPage />} />
      </Routes>
    </Router>
  );
};

export default App;
