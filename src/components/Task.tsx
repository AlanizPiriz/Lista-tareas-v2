import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ListaTareas } from '../components/ListaTareas';
import type { Task, Area } from '../Types';

interface Props {
  tasks: Task[];
  addTask: (text: string, area: Area) => void;
  deleteTask: (area: Area, index: number) => void;
  subscribeToTasks: (area: Area) => () => void;
}

const TaskPage = ({ tasks, addTask, deleteTask, subscribeToTasks }: Props) => {
  const { area } = useParams<{ area: Area }>();
  const [input, setInput] = useState('');

  useEffect(() => {
    if (!area || (area !== 'tienda' && area !== 'pista')) return;
    const unsubscribe = subscribeToTasks(area);
    return () => unsubscribe();
  }, [area]);

  if (!area || (area !== 'tienda' && area !== 'pista')) return <p>Área inválida</p>;

  const filteredTasks = tasks.filter((task) => task.area === area);

  const handleAdd = () => {
    if (input.trim()) {
      addTask(input, area);
      setInput('');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Tareas en {area.toUpperCase()}</h2>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Nueva tarea"
      />
      <button onClick={handleAdd}>Agregar</button>

      <ListaTareas
        listaTareas={filteredTasks}
        borrarTarea={(index) => deleteTask(area, index)}
      />

      <Link to="/"><button className='volver'>← Volver</button></Link>
    </div>
  );
};

export default TaskPage;
