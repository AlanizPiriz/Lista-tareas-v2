
type Props = {
  tarea: string
  borrarTarea: () => void
}

export const Tarea = ({ tarea, borrarTarea }: Props) => {
  return (
    <li className="task">
      {tarea}
      <button onClick={borrarTarea}>Borrar</button>
    </li>
  )
}
