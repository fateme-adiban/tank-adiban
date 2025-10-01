import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

type TaskProps = {
  id: number
  title: string
}

const Task: React.FC<TaskProps> = ({ id, title }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform)
  }

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={style} className="bg-white rounded-[5px] w-full p-5 flex items-center justify-start gap-5 touch-none">
      <input type="checkbox" className="h-5 w-5" />
      {title}
    </div>
  )
}

export default Task
