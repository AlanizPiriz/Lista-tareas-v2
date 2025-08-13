import type { Task } from '../Types';

type Props = {
  tarea: Task;
  borrarTarea: () => void;
};

export const Tarea = ({ tarea, borrarTarea }: Props) => {
  const fechaFormateada = tarea.fecha
    ? new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date(tarea.fecha))
    : 'Sin fecha';

  return (
    <li className="task">
      {tarea.text} <small>({fechaFormateada})</small>
      <button onClick={borrarTarea}>Borrar</button>
    </li>
  );
};
