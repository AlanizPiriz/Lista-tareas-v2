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


//capturar errores 




const App = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
  // ✅ Detectar si es iPhone
  const isIphone =
    /iPhone/.test(navigator.userAgent) && !(window as any).MSStream;

  if (isIphone) {
    // ✅ Capturar errores generales
    window.addEventListener('error', (event) => {
      console.error(
        '🛑 Error capturado en iPhone:',
        event.message,
        event.filename,
        event.lineno
      );
      alert(
        `Error en iPhone:\n${event.message}\nArchivo: ${event.filename}\nLínea: ${event.lineno}`
      );
    });

    // ✅ Capturar promesas no manejadas
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Promesa no manejada:', event.reason);
      alert(`Promesa no manejada en iPhone:\n${event.reason}`);
    });

    console.log('📱 Dispositivo iPhone detectado');
  }

  // ✅ Verificar que Notification está disponible
  if ('Notification' in window) {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        getToken(messaging, {
          vapidKey: 'BC0g1ahj7ENwUrpQeS8Kd8xcUOJT24JxkpW4YfYkuDWlvHiix9Ykzf6cRHiN4zGjPdoJIE-YU01cssRD5f3fKjY',
        }).then((currentToken) => {
          if (currentToken) {
            console.log('Token FCM:', currentToken);
          } else {
            console.log('No se pudo obtener el token.');
          }
        });
      }
    });

    // ✅ Escuchar notificaciones entrantes
    onMessage(messaging, (payload) => {
      console.log('Mensaje recibido:', payload);
      alert(`Notificación: ${payload.notification?.title}`);
    });
  } else {
    console.warn('🔕 API Notification no soportada en este navegador.');
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

  const addTask = async (text: string, area: Area) => {
  await addDoc(collection(db, 'tasks'), {
    text,
    area,
    fecha: new Date().toISOString(), 
  });
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

