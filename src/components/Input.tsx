import React, { useState } from "react"

interface InputProps {
  onSubmit: (value: string) => void
}

const Input: React.FC<InputProps> = ({ onSubmit }) => {
  const [input, setInput] = useState<string>("")

  const handleSubmit = () => {
    if (!input.trim()) return
    onSubmit(input)
    setInput("")
  }

  return (
    <div className="flex gap-2">
      <input type="text" className="border-2 border-gray-300 rounded-[10px] p-2.5" value={input} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)} />
      <button onClick={handleSubmit} className="rounded-[10px] px-5 py-0.5 bg-blue-600 text-white cursor-pointer">
        Add
      </button>
    </div>
  )
}

export default Input
