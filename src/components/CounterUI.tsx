import React from "react"

type Props = {
  count: number
  onIncrement: () => void
}

export const CounterUI = ({ count, onIncrement }: Props) => (
  <button className="flex items-center space-x-2 px-6 py-4 bg-gray-100 rounded-lg hover:bg-gray-200 transitio text-2xl" onClick={onIncrement}>
    <h1>Count:</h1>
    <span className="text-violet-400">{count}</span>
  </button>
)
