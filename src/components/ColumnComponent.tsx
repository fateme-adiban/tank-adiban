import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CardItem } from "./CardItem"
import type { Board, Column, Card, Action } from "../types"
import toast from "react-hot-toast"
export function ColumnComponent({ board, column, cardTitles, setCardTitles, editingCard, setEditingCard, dispatch, dispatchOptimistic }: { board: Board; column: Column; cardTitles: { [columnId: string]: string }; setCardTitles: React.Dispatch<React.SetStateAction<{ [columnId: string]: string }>>; editingCard: { boardId: string; columnId: string; card: Card } | null; setEditingCard: React.Dispatch<React.SetStateAction<{ boardId: string; columnId: string; card: Card } | null>>; dispatch: React.Dispatch<Action>; dispatchOptimistic: (action: Action, api?: () => Promise<void>) => Promise<void> }) {
  const { setNodeRef } = useDroppable({ id: column.id })

  return (
    <div className="w-80 bg-zinc-800 rounded-lg shadow-xl flex flex-col gap-5 p-[1rem]">
      <div className="p-4 flex justify-between items-center text-white font-semibold text-xl rounded-t-md border border-blue-400 bg-gradient-to-r from-blue-600 to-blue-400">
        <label htmlFor={`edit-column-${column.title}`} className="sr-only">
          Edit column title
        </label>
        <input id={`edit-column-${column.title}`} className="w-[90%] border border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-[3px] px-1" value={column.title} onChange={e => dispatch({ type: "UPDATE_COLUMN", data: { boardId: board.id, columnId: column.id, title: e.target.value } })} />
        <button
          aria-label={`Delete column ${column.title}`}
          onClick={async () => {
            await dispatchOptimistic({ type: "DELETE_COLUMN", data: { boardId: board.id, columnId: column.id } }, async () => {
              await new Promise((res, rej) => setTimeout(() => (Math.random() < 0.8 ? res(null) : rej("Fake network error")), 500))
            })
          }}
        >
          <span className="text-zinc-900 text-lg cursor-pointer">x</span>
        </button>
      </div>

      {/* ADD CARD */}
      <div className="flex justify-center gap-3 text-white">
        <label htmlFor={`add-card-${column.title}`} className="sr-only">
          New card title
        </label>
        <input id={`add-card-${column.id}`} className="w-[150px] border border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 rounded-[3px] px-1" value={cardTitles[column.id] || ""} onChange={e => setCardTitles({ ...cardTitles, [column.id]: e.target.value })} />
        <button
          aria-label={`Add Card ${column.title}`}
          className="w-[70px] text-sm bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 transition-all duration-200 text-white rounded-[3px] cursor-pointer"
          onClick={async () => {
            const title = cardTitles[column.id]
            if (!title?.trim()) return

            await dispatchOptimistic({ type: "ADD_CARD", data: { boardId: board.id, columnId: column.id, title } }, async () => {
              await new Promise((res, rej) => setTimeout(() => (Math.random() < 0.8 ? res(null) : rej("Fake network error")), 500))
              toast.success("Card Added Successfully!")
            })

            setCardTitles({ ...cardTitles, [column.id]: "" })
          }}
        >
          Add Card
        </button>
      </div>

      {/* CARDS */}
      <SortableContext items={column.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <ul ref={setNodeRef}>
          {column.cards.map(card => (
            <CardItem key={card.id} card={card} boardId={board.id} columnId={column.id} editingCard={editingCard} setEditingCard={setEditingCard} dispatch={dispatch} dispatchOptimistic={dispatchOptimistic} />
          ))}
        </ul>
      </SortableContext>
    </div>
  )
}
