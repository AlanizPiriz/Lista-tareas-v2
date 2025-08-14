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
  setDoc,
} from 'firebase/firestore';
import { deleteToken } from 'firebase/messaging';
import Home from './components/Home';
import TaskPage from './components/Task';
import type { Task, Area } from './Types';

const App = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  // 🧠 Guarda el token FCM en Firestore
  const saveTokenToFirestore = async (token: string) => {
    try {
      await setDoc(doc(db, 'tokens', token), {
        token,
        userId: 'anon', // podés usar auth.currentUser?.uid si tenés auth
        area: 'General',
        fecha: new Date().toISOString(),
        userAgent: navigator.userAgent,
      });
      console.log('✅ Token guardado en Firestore');
    } catch (error) {
      console.error('❌ Error al guardar token:', error);
    }
  };

  useEffect(() => {
    const isIphone = /iPhone/.test(navigator.userAgent) && !(window as any).MSStream;

    if (isIphone) {
      window.addEventListener('error', (event) => {
        console.error('🛑 Error capturado en iPhone:', event.message, event.filename, event.lineno);
        alert(`Error en iPhone:\n${event.message}\nArchivo: ${event.filename}\nLínea: ${event.lineno}`);
      });

      window.addEventListener('unhandledrejection', (event) => {
        console.error('🚨 Promesa no manejada:', event.reason);
        alert(`Promesa no manejada en iPhone:\n${event.reason}`);
      });

      console.log('📱 Dispositivo iPhone detectado');
    }

    if ('Notification' in window && 'serviceWorker' in navigator) {
      Notification.requestPermission().then(async (permission) => {
        if (permission === 'granted') {
          try {
            const registration = await navigator.serviceWorker.ready;

            // 🧽 Borrar token viejo
            await deleteToken(messaging);

            // 🔐 Obtener token nuevo
            const token = await getToken(messaging, {
              vapidKey: 'BC0g1ahj7ENwUrpQeS8Kd8xcUOJT24JxkpW4YfYkuDWlvHiix9Ykzf6cRHiN4zGjPdoJIE-YU01cssRD5f3fKjY',
              serviceWorkerRegistration: registration,
            });

            if (token) {
              console.log('🔐 Token FCM actualizado:', token);
              setFcmToken(token);
              await saveTokenToFirestore(token); // 🔄 Guardar en Firestore
            } else {
              console.warn('⚠️ No se pudo obtener un token nuevo');
            }
          } catch (err) {
            console.error('❌ Error actualizando token:', err);
          }
        }
      });

      onMessage(messaging, (payload) => {
        console.log('📩 Mensaje recibido:', payload);
        alert(`🔔 Notificación: ${payload.notification?.title}`);
      });
    } else {
      console.warn('🔕 API Notification o Service Worker no soportada');
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

  const sendNotificationBackend = async (token: string, message: string) => {
    try {
      const res = await fetch('https://lista-tareas-backend.onrender.com/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          title: 'Nueva tarea',
          body: message,
        }),
      });

      if (!res.ok) {
        const error = await res.text();
        console.error('⚠️ Error desde el backend:', error);
      } else {
        console.log('✅ Notificación enviada correctamente');
      }
    } catch (error) {
      console.error('❌ Error al hacer fetch al backend:', error);
    }
  };

  const addTask = async (text: string, area: Area) => {
    await addDoc(collection(db, 'tasks'), {
      text,
      area,
      fecha: new Date().toISOString(),
    });

    if (fcmToken) {
      await sendNotificationBackend(fcmToken, `Nueva tarea en ${area}: ${text}`);
    } else {
      console.warn('⚠️ No se encontró token para enviar notificación');
    }
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
