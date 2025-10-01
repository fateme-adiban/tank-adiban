"use client"
import { useState, useEffect } from "react"
import { CounterUI } from "./CounterUI"
import { sendUpdate, onUpdate, UpdateMessage } from "../../broadcast"

export default function Counter() {
  const [count, setCount] = useState<number>(0)

  useEffect(() => {
    onUpdate((data: UpdateMessage) => {
      if (data.type === "COUNT_UPDATE") {
        setCount(data.value)
      }
    })
  }, [])

  const increment = () => {
    setCount(prev => {
      const newValue = prev + 1
      sendUpdate({ type: "COUNT_UPDATE", value: newValue })
      return newValue
    })
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <CounterUI count={count} onIncrement={increment} />
    </div>
  )
}
