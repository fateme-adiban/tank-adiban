"use client"
import { useState } from "react"
import Books from "../data/data.json"

type Item = {
  id: number
  title: string
}

const FetchData = () => {
  const [items, setItems] = useState<Item[]>([
    { id: 1, title: "Fateme Adiban" },
    { id: 2, title: "Zahra Adiban" },
    { id: 3, title: "Zeinab Sheidaei" }
  ])

  return (
    <div className="flex items-center justify-evenly h-screen">
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-xl mb-5">Books</h2>
        <ul className="space-y-4">
          {Books.map(book => (
            <li key={book.id} className="flex justify-center items-center px-4 py-1.5 border rounded-[20px]">
              {book.title}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col items-center justify-center">
        <h2 className="text-xl mb-5">People</h2>
        <ul className="space-y-4">
          {items.map(item => (
            <li key={item.id} className="flex justify-center items-center px-4 py-1.5 border rounded-[20px]">
              {item.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default FetchData
