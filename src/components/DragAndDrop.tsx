"use client"
import { useState, useEffect } from "react"
import { closestCorners, DndContext, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core"
import Column from "./Column"
import Input from "./Input"
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import type { DragEndEvent } from "@dnd-kit/core"

type Task = {
  id: number
  title: string
}

function DragAndDrop() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const saved = localStorage.getItem("tasks")
    if (saved) {
      setTasks(JSON.parse(saved))
    } else {
      setTasks([
        { id: 1, title: "Lestat" },
        { id: 2, title: "Hannibal" },
        { id: 3, title: "Louis" }
      ])
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tasks", JSON.stringify(tasks))
    }
  }, [tasks])

  const addTask = (title: string) => {
    setTasks(tasks => [...tasks, { id: tasks.length + 1, title }])
  }

  const getTaskPos = (id: number) => tasks.findIndex(task => task.id === id)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    if (active.id === over.id) return

    setTasks(tasks => {
      const originalPos = getTaskPos(Number(active.id))
      const newPos = getTaskPos(Number(over.id))
      return arrayMove(tasks, originalPos, newPos)
    })
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  if (!isClient) return null

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center gap-[50px] mt-[10px]">
      <h1>My Tasks ✅</h1>
      <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners} sensors={sensors}>
        <Input onSubmit={addTask} />
        <Column tasks={tasks} />
      </DndContext>
    </div>
  )
}

export default DragAndDrop
