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
} from 'firebase/firestore';
import Home from './components/Home';
import TaskPage from './components/Task';
import type { Task, Area } from './Types';

const App = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

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
        const registration = await navigator.serviceWorker.ready;
        const token = await getToken(messaging, {
          vapidKey: 'BC0g1ahj7ENwUrpQeS8Kd8xcUOJT24JxkpW4YfYkuDWlvHiix9Ykzf6cRHiN4zGjPdoJIE-YU01cssRD5f3fKjY', // ← pon tu VAPID key aquí
          serviceWorkerRegistration: registration,
        });

        if (token) {
          console.log('🔐 Token FCM:', token);
          // Puedes enviarlo al backend o guardarlo si hace falta
        } else {
          console.warn('No se pudo obtener el token FCM');
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
  await fetch('https://lista-tareas-backend.onrender.com/send-notification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token,
      title: 'Nueva tarea',
      body: message,
    }),
  });
};

const addTask = async (text: string, area: Area) => {
  await addDoc(collection(db, 'tasks'), {
    text,
    area,
    fecha: new Date().toISOString(),
  });

  const currentToken = await getToken(messaging, {
    vapidKey: 'BC0g1ahj7ENwUrpQeS8Kd8xcUOJT24JxkpW4YfYkuDWlvHiix9Ykzf6cRHiN4zGjPdoJIE-YU01cssRD5f3fKjY',
  });

  if (currentToken) {
    await sendNotificationBackend(currentToken, `Nueva tarea en ${area}: ${text}`);
  } else {
    console.warn('No se pudo obtener el token para enviar la notificación.');
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
