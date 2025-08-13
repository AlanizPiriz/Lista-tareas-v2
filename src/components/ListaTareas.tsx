import type { Task } from '../Types';

interface Props {
  listaTareas: Task[];
  borrarTarea: (index: number) => void;
}

export const ListaTareas = ({ listaTareas, borrarTarea }: Props) => {
  return (
    <ul>
      {listaTareas.map((task, index) => (
        <li key={task.id} className='task'>
          {task.text} <button onClick={() => borrarTarea(index)}>Borrar</button>
        </li>
      ))}
    </ul>
  );
};
