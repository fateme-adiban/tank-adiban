import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { Card, Action } from "../types"
import toast from "react-hot-toast"

export function CardItem({ card, boardId, columnId, editingCard, setEditingCard, dispatch, dispatchOptimistic }: { card: Card; boardId: string; columnId: string; editingCard: { boardId: string; columnId: string; card: Card } | null; setEditingCard: React.Dispatch<React.SetStateAction<{ boardId: string; columnId: string; card: Card } | null>>; dispatch: React.Dispatch<Action>; dispatchOptimistic: (action: Action, api?: () => Promise<void>) => Promise<void> }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    disabled: editingCard?.card.id === card.id
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: editingCard?.card.id === card.id ? "default" : "move",
    opacity: isDragging ? 0.5 : 1,
    boxShadow: isDragging ? "0 8px 20px rgba(0,0,0,0.25)" : "none",
    scale: isDragging ? "1.05" : "1",
    zIndex: isDragging ? 999 : "auto"
  }

  return (
    <li id={card.id} ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex justify-start items-center gap-3 mt-5 bg-zinc-700 p-3 rounded shadow-md">
      {editingCard?.card.id === card.id ? (
        <>
          <label htmlFor={`edit-card-${card.id}`} className="sr-only">
            Edit title for card {card.id}
          </label>
          <input id={`edit-card-${card.id}`} className="w-[150px] border border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 rounded-[3px] px-1" value={editingCard.card.title} onChange={e => setEditingCard({ ...editingCard, card: { ...editingCard.card, title: e.target.value } })} />
          <button
            aria-label={`Save changes of card ${card.id}`}
            className="w-[50px] p-1 text-sm bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 transition-all duration-200 rounded-[3px] cursor-pointer"
            onPointerDown={e => e.stopPropagation()}
            onClick={async () => {
              if (!editingCard) return

              await dispatchOptimistic({ type: "UPDATE_CARD", data: { ...editingCard } }, async () => {
                await new Promise((res, rej) => setTimeout(() => (Math.random() < 0.9 ? res(null) : rej("Fake network error")), 300))
                toast.success("Successfully Edited!")
              })

              setEditingCard(null)
            }}
          >
            Save
          </button>
        </>
      ) : (
        <div className="flex justify-between gap-3 w-full">
          <p className="w-30">{card.title}</p>
          <div className="flex gap-2">
            <button aria-label={`Edit card ${card.id}`} className="w-[50px] text-sm bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 transition-all duration-200 rounded-[3px] cursor-pointer" onPointerDown={e => e.stopPropagation()} onClick={() => setEditingCard({ boardId, columnId, card })}>
              Edit
            </button>
            <button
              aria-label={`Delete card ${card.id}`}
              className="w-[60px] text-sm bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 transition-all duration-200 text-white rounded-[3px] cursor-pointer"
              onPointerDown={e => e.stopPropagation()}
              onClick={async () => {
                await dispatchOptimistic({ type: "DELETE_CARD", data: { boardId, columnId, cardId: card.id } }, async () => {
                  await new Promise((res, rej) => setTimeout(() => (Math.random() < 0.8 ? res(null) : rej("Fake network error")), 500))
                  toast.success("Successfully Deleted!")
                })
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </li>
  )
}
