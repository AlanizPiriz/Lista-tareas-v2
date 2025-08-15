// App.tsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { db, messaging, getToken, onMessage } from './firebase';
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';

import Home from './components/Home';
import TaskPage from './components/Task';
import type { Task, Area } from './Types';

const App = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

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
                vapidKey: 'TU_VAPID_KEY_AQUI',
                serviceWorkerRegistration: registration,
              });

              if (token) {
                console.log('🔐 Token obtenido:', token);

                // Verificar si ya está guardado
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

          // Escuchar notificaciones recibidas
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

  const subscribeToTasks = (area: Area) => {
    const q = query(collection(db, 'tasks'), where('area', '==', area));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksData: Task[] = [];
      querySnapshot.forEach((doc) =>
        tasksData.push({ id: doc.id, ...(doc.data() as any) })
      );
      setTasks(tasksData);
    });
    return unsubscribe;
  };

  const sendNotificationBackend = async (message: string) => {
    try {
      const res = await fetch('https://lista-tareas-backend.onrender.com/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Nueva tarea',
          body: message,
        }),
      });

      if (!res.ok) {
        const error = await res.text();
        console.error('⚠️ Error del backend:', error);
      } else {
        console.log('✅ Notificación enviada a todos los tokens');
      }
    } catch (error) {
      console.error('❌ Error haciendo fetch:', error);
    }
  };

  const addTask = async (text: string, area: Area) => {
    await addDoc(collection(db, 'tasks'), {
      text,
      area,
      fecha: new Date().toISOString(),
    });

    await sendNotificationBackend(`Nueva tarea en ${area}: ${text}`);
  };

  const deleteTask = async (area: Area, index: number) => {
    const task = tasks.filter((t) => t.area === area)[index];
    if (task && task.id) {
      await deleteDoc(doc(db, 'tasks', task.id));
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/tasks/:area"
          element={
            <TaskPage
              tasks={tasks}
              addTask={addTask}
              deleteTask={deleteTask}
              subscribeToTasks={subscribeToTasks}
            />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
