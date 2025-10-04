"use client"
import React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { Card, Action } from "../types"

type CardItemProps = {
  card: Card
  boardId: string
  columnId: string
  editingCard: { boardId: string; columnId: string; card: Card } | null
  setEditingCard: React.Dispatch<React.SetStateAction<{ boardId: string; columnId: string; card: Card } | null>>
  dispatch: React.Dispatch<Action>
}

export function CardItem({ card, boardId, columnId, editingCard, setEditingCard, dispatch }: CardItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: card.id,
    disabled: editingCard?.card.id === card.id // disable drag while editing
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: editingCard?.card.id === card.id ? "default" : "move"
  }

  return (
    <li key={card.id} id={card.id} ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex justify-start items-center gap-3 mt-5 bg-zinc-700 p-3 rounded shadow-md">
      {editingCard?.card.id === card.id ? (
        <>
          <input className="w-[150px] border border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 rounded-[3px] px-1" value={editingCard.card.title} onChange={e => setEditingCard({ ...editingCard, card: { ...editingCard.card, title: e.target.value } })} />
          <button
            className="w-[60px] text-sm bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 transition-all duration-200 rounded-[3px] cursor-pointer"
            onPointerDown={e => e.stopPropagation()}
            onClick={() => {
              if (editingCard) {
                dispatch({ type: "UPDATE_CARD", data: { ...editingCard } })
                setEditingCard(null)
              }
            }}
          >
            Save
          </button>
        </>
      ) : (
        <div className="flex justify-between gap-3 w-full">
          <p className="w-30">{card.title}</p>
          <div className="flex gap-2">
            <button className="w-[50px] text-sm bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 transition-all duration-200 rounded-[3px] cursor-pointer" onPointerDown={e => e.stopPropagation()} onClick={() => setEditingCard({ boardId, columnId, card })}>
              Edit
            </button>
            <button
              className="w-[60px] text-sm bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 transition-all duration-200 text-white rounded-[3px] cursor-pointer"
              onPointerDown={e => e.stopPropagation()}
              onClick={() =>
                dispatch({
                  type: "DELETE_CARD",
                  data: { boardId, columnId, cardId: card.id }
                })
              }
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </li>
  )
}
