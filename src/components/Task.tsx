// Task.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  limit,
  deleteField,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Task, Area, Section } from '../Types';
import BackButton from './BackButton';

const TaskPage = () => {
  const { area, section } = useParams<{ area: Area; section: Section }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (!area || !section) return;

    const q = query(
      collection(db, 'tasks'),
      where('area', '==', area),
      where('section', '==', section)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tareas: Task[] = [];
      querySnapshot.forEach((doc) =>
        tareas.push({ ...(doc.data() as Omit<Task, 'id'>), id: doc.id })
      );
      setTasks(tareas);
    });

    return () => unsubscribe();
  }, [area, section]);

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

  const handleAdd = async () => {
    if (!input.trim() || !area || !section) return;

    await addDoc(collection(db, 'tasks'), {
      text: input,
      area,
      section,
      createdAt: new Date(),
    });

    await sendNotificationBackend(`Nueva ${section} en ${area}: ${input}`);
    setInput('');
  };

  const handleDelete = async (id: string) => {
  const taskToDelete = tasks.find((task) => task.id === id);

  if (!taskToDelete) return;

  try {
    // 👇 1. Guardar en historial
    await addDoc(collection(db, 'historial'), {
      ...taskToDelete,
      eliminadoEn: new Date(),
      tipo: section === 'tareas' ? 'tarea' : 'mantenimiento',
    });

    // 👇 2. Eliminar tarea original
    await deleteDoc(doc(db, 'tasks', id));

    // 👇 3. Borrar entradas más viejas si hay más de 100
    const historialRef = collection(db, 'historial');
    const historialSnapshot = await getDocs(query(historialRef, orderBy('eliminadoEn', 'desc')));

    if (historialSnapshot.size > 100) {
      const docsToDelete = historialSnapshot.docs.slice(100); // del 101 en adelante
      for (const docu of docsToDelete) {
        await deleteDoc(docu.ref);
      }
    }

    console.log('🗑️ Tarea movida al historial y historial ajustado');
  } catch (error) {
    console.error('❌ Error al mover al historial:', error);
  }
};


    if (!area || !section) return <p>Área o sección inválida</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>
        {section === 'tareas' ? '📋 Tareas' : '🔧 Mantenimientos'} en{' '}
        {area.toUpperCase()}
      </h2>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={section === 'tareas' ? 'Nueva tarea' : 'Nuevo mantenimiento'}
      />
      <button onClick={handleAdd}>Agregar</button>

      <ul style={{ marginTop: 20, padding: 0 }}>
        {tasks.map((task) => {
          const fecha = task.createdAt?.toDate
            ? task.createdAt.toDate().toLocaleDateString()
            : new Date(task.createdAt).toLocaleDateString();

        
          return (
            <li
              key={task.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                borderBottom: '1px solid #ccc',
                listStyle: 'none',
                color: 'white',
              }}
            >
              <div>
                <strong>{task.text}</strong>
              </div>
              <strong>{fecha}</strong>
              <button onClick={() => handleDelete(task.id)} className='borrar'>Eliminar</button>
            </li>
          );
        })}
      </ul>
      

      <BackButton />
    </div>
  );
};

export default TaskPage;
