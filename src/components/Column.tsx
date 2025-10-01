import Task from "./Task"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"

type Task = {
  id: number
  title: string
}

type Column = {
  tasks: Task[]
}

const Column: React.FC<Column> = ({ tasks }) => {
  return (
    <div className="bg-[#c4c4fb] rounded-[5px] p-[15px] w-4/5 max-w-[500px] flex flex-col gap-[15px]">
      <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
        {tasks.map(task => (
          <Task id={task.id} title={task.title} key={task.id} />
        ))}
      </SortableContext>
    </div>
  )
}

export default Column
