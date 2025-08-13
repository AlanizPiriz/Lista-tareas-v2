import type { Task } from '../Types';
import { Tarea } from './Tarea'; 

type Props = {
  listaTareas: Task[];
  borrarTarea: (index: number) => void;
};

export const ListaTareas = ({ listaTareas, borrarTarea }: Props) => {
  return (
    <ul>
      {listaTareas.map((task, index) => (
        <Tarea 
          key={task.id} 
          tarea={task} 
          borrarTarea={() => borrarTarea(index)} 
        />
      ))}
    </ul>
  );
};
