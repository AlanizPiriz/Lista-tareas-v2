import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import type { Task } from '../Types';
import BackButton from './BackButton';

interface HistorialItem extends Task {
  eliminadoEn: Date | string;
  tipo: 'tarea' | 'mantenimiento';
}

const HistorialPage = () => {
  const [historial, setHistorial] = useState<HistorialItem[]>([]);

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'historial'));
        const data: HistorialItem[] = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            ...(d as Omit<HistorialItem, 'id'>),
          };
        });

        // Ordenar por fecha de eliminación descendente
        data.sort((a, b) => {
          const fechaA = new Date(a.eliminadoEn).getTime();
          const fechaB = new Date(b.eliminadoEn).getTime();
          return fechaB - fechaA;
        });

        setHistorial(data);
      } catch (error) {
        console.error('❌ Error al cargar historial:', error);
      }
    };

    fetchHistorial();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>🕓 Historial de eliminados</h2>

      {historial.length === 0 ? (
        <p>No hay elementos eliminados.</p>
      ) : (
        <ul style={{ padding: 0 }}>
          {historial.map((item) => {
            const creado = item.createdAt?.toDate
              ? item.createdAt.toDate().toLocaleString()
              : new Date(item.createdAt).toLocaleString();

            //const eliminado = new Date(item.eliminadoEn).toLocaleString();

            return (
                  <li
                    key={item.id}
                    style={{
                      padding: '8px 12px',
                      marginBottom: '8px',
                      border: '1px solid #ccc',
                      borderRadius: 4,
                      background: '#333',
                      color: 'white',
                      listStyle: 'none',
                    }}
                  >
                    <strong>{item.text}</strong> <br />
                    📁 Área: {item.area} | 📂 Sección: {item.section} <br />
                    🗓️ Creado: {creado} <br />
                    🏷️ Tipo: {item.tipo}
                  </li>
                );
          })}
        </ul>
      )}

      <BackButton />
    </div>
  );
};

export default HistorialPage;
