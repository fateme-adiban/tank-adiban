"use client"
import React, { useEffect, useReducer, useState } from "react"
import { closestCorners, DndContext, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import type { DragEndEvent } from "@dnd-kit/core"
import { useRouter } from "next/navigation"
import { CardItem } from "@/components/CardItem"

import type { State, Action, Board, Column, Card } from "../../types"

// Reducer
function reducer(state: State, action: Action | { type: "__INIT__"; data: State }): State {
  const session = typeof window !== "undefined" ? localStorage.getItem("session") || "unknown" : "unknown"

  switch (action.type) {
    case "__INIT__":
      return action.data

    case "ADD_BOARD":
      return {
        ...state,
        boards: [...state.boards, { id: crypto.randomUUID(), title: action.data.title, columns: [], userId: session }]
      }

    case "UPDATE_BOARD":
      return {
        ...state,
        boards: state.boards.map(board => (board.id === action.data.boardId && board.userId === session ? { ...board, title: action.data.title } : board))
      }

    case "DELETE_BOARD":
      return {
        ...state,
        boards: state.boards.filter(board => board.id !== action.data.boardId || board.userId !== session)
      }

    case "ADD_COLUMN":
      return {
        ...state,
        boards: state.boards.map(board => (board.id === action.data.boardId && board.userId === session ? { ...board, columns: [...board.columns, { id: crypto.randomUUID(), title: action.data.title, cards: [] }] } : board))
      }

    case "UPDATE_COLUMN":
      return {
        ...state,
        boards: state.boards.map(board =>
          board.id === action.data.boardId && board.userId === session
            ? {
                ...board,
                columns: board.columns.map(column => (column.id === action.data.columnId ? { ...column, title: action.data.title } : column))
              }
            : board
        )
      }

    case "DELETE_COLUMN":
      return {
        ...state,
        boards: state.boards.map(board => (board.id === action.data.boardId && board.userId === session ? { ...board, columns: board.columns.filter(column => column.id !== action.data.columnId) } : board))
      }

    case "ADD_CARD":
      return {
        ...state,
        boards: state.boards.map(board =>
          board.id === action.data.boardId && board.userId === session
            ? {
                ...board,
                columns: board.columns.map(column => (column.id === action.data.columnId ? { ...column, cards: [...column.cards, { id: crypto.randomUUID(), title: action.data.title }] } : column))
              }
            : board
        )
      }

    case "UPDATE_CARD":
      return {
        ...state,
        boards: state.boards.map(board =>
          board.id === action.data.boardId && board.userId === session
            ? {
                ...board,
                columns: board.columns.map(column =>
                  column.id === action.data.columnId
                    ? {
                        ...column,
                        cards: column.cards.map(card => (card.id === action.data.card.id ? action.data.card : card))
                      }
                    : column
                )
              }
            : board
        )
      }

    case "DELETE_CARD":
      return {
        ...state,
        boards: state.boards.map(board =>
          board.id === action.data.boardId && board.userId === session
            ? {
                ...board,
                columns: board.columns.map(column => (column.id === action.data.columnId ? { ...column, cards: column.cards.filter(card => card.id !== action.data.cardId) } : column))
              }
            : board
        )
      }

    case "MOVE_CARD": {
      const { boardId, fromColumnId, toColumnId, cardId, toIndex } = action.data
      return {
        ...state,
        boards: state.boards.map(board => {
          if (board.id !== boardId || board.userId !== session) return board
          const fromCol = board.columns.find(c => c.id === fromColumnId)
          const toCol = board.columns.find(c => c.id === toColumnId)
          if (!fromCol || !toCol) return board
          const card = fromCol.cards.find(c => c.id === cardId)
          if (!card) return board

          // remove from source
          const newFromCols = board.columns.map(c => (c.id === fromColumnId ? { ...c, cards: c.cards.filter(cd => cd.id !== cardId) } : c))

          // insert into destination
          const newToColumns = newFromCols.map(c => {
            if (c.id !== toColumnId) return c
            const destCards = [...c.cards]
            const index = typeof toIndex === "number" ? Math.max(0, Math.min(toIndex, destCards.length)) : destCards.length
            destCards.splice(index, 0, card)
            return { ...c, cards: destCards }
          })

          return { ...board, columns: newToColumns }
        })
      }
    }

    default:
      return state
  }
}

// Helpers
function findBoardId(state: State, cardId: string) {
  for (const board of state.boards) {
    for (const col of board.columns) {
      if (col.cards.some(c => c.id === cardId)) return board.id
    }
  }
  return ""
}

function findColumnId(state: State, cardId: string) {
  for (const board of state.boards) {
    for (const col of board.columns) {
      if (col.cards.some(c => c.id === cardId)) return col.id
    }
  }
  return ""
}

function findCardIndex(state: State, cardId: string) {
  for (const board of state.boards) {
    for (const col of board.columns) {
      const idx = col.cards.findIndex(c => c.id === cardId)
      if (idx !== -1) return idx
    }
  }
  return -1
}

// Hook for tab sync with localStorage persistence
const TabSync = () => {
  const [state, baseDispatch] = useReducer(reducer, { boards: [] }, initial => {
    try {
      const saved = localStorage.getItem("kanban_state")
      return saved ? JSON.parse(saved) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    const channel = new BroadcastChannel("kanban_channel")

    channel.onmessage = event => {
      const msg = event.data
      if (msg?.type === "__SYNC__") {
        baseDispatch({ type: "__INIT__", data: msg.data })
      }
    }

    // ✅ Persist state to localStorage
    localStorage.setItem("kanban_state", JSON.stringify(state))

    // ✅ Broadcast to other tabs
    channel.postMessage({ type: "__SYNC__", data: state })

    return () => channel.close()
  }, [state])

  // Wrapper dispatch
  const dispatch: React.Dispatch<Action> = action => {
    baseDispatch(action)
  }

  return { state, dispatch }
}

function ColumnComponent({ board, column, cardTitles, setCardTitles, editingCard, setEditingCard, dispatch }: { board: Board; column: Column; cardTitles: { [columnId: string]: string }; setCardTitles: React.Dispatch<React.SetStateAction<{ [columnId: string]: string }>>; editingCard: { boardId: string; columnId: string; card: Card } | null; setEditingCard: React.Dispatch<React.SetStateAction<{ boardId: string; columnId: string; card: Card } | null>>; dispatch: React.Dispatch<Action> }) {
  const { setNodeRef } = useDroppable({ id: column.id })

  return (
    <div key={column.id} className="w-80 bg-zinc-800 rounded-lg shadow-xl flex flex-col gap-5 p-[1rem]">
      <div className="p-4 flex justify-between items-center text-white font-semibold text-xl rounded-t-md border border-blue-400 bg-gradient-to-r from-blue-600 to-blue-400">
        <input className="w-[90%] border border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-[3px] px-1" value={column.title} onChange={e => dispatch({ type: "UPDATE_COLUMN", data: { boardId: board.id, columnId: column.id, title: e.target.value } })} />
        <button onClick={() => dispatch({ type: "DELETE_COLUMN", data: { boardId: board.id, columnId: column.id } })}>
          <span className="text-zinc-900 text-lg cursor-pointer">x</span>
        </button>
      </div>

      {/* ADD CARD */}
      <div className="flex justify-center gap-3 text-white">
        <input className="w-[150px] border border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 rounded-[3px] px-1" value={cardTitles[column.id] || ""} onChange={e => setCardTitles({ ...cardTitles, [column.id]: e.target.value })} />
        <button
          className="w-[70px] text-sm bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 transition-all duration-200 text-white rounded-[3px] cursor-pointer"
          onClick={() => {
            const title = cardTitles[column.id]
            if (title && title.trim()) {
              dispatch({ type: "ADD_CARD", data: { boardId: board.id, columnId: column.id, title } })
              setCardTitles({ ...cardTitles, [column.id]: "" })
            }
          }}
        >
          Add Card
        </button>
      </div>

      {/* CARDS with DnD */}
      <SortableContext items={column.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <ul ref={setNodeRef}>
          {column.cards.map(card => (
            <CardItem key={card.id} card={card} boardId={board.id} columnId={column.id} editingCard={editingCard} setEditingCard={setEditingCard} dispatch={dispatch} />
          ))}
        </ul>
      </SortableContext>
    </div>
  )
}

// KanbanBoard
const KanbanBoard = () => {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const session = localStorage.getItem("session")
    if (!session) router.push("/")
  }, [router])

  const { state, dispatch } = TabSync()
  const [boardTitle, setBoardTitle] = useState("")
  const [columnTitles, setColumnTitles] = useState<{ [boardId: string]: string }>({})
  const [cardTitles, setCardTitles] = useState<{ [columnId: string]: string }>({})
  const [editingCard, setEditingCard] = useState<{ boardId: string; columnId: string; card: Card } | null>(null)

  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    if (String(active.id) === String(over.id)) return

    const activeId = String(active.id)
    const overId = String(over.id)

    const fromBoardId = findBoardId(state, activeId)
    const fromColumnId = findColumnId(state, activeId)

    // destination column — could be a card id or a column id (columns are registered as droppable)
    let toColumnId = findColumnId(state, overId)
    let toIndex = findCardIndex(state, overId)

    // if overId refers to a column (dropping into empty column), set index to end
    if (!toColumnId) {
      for (const b of state.boards) {
        const col = b.columns.find(c => c.id === overId)
        if (col) {
          toColumnId = col.id
          toIndex = col.cards.length // put at end
          break
        }
      }
    }

    if (!fromBoardId || !fromColumnId || !toColumnId) return

    // ensure valid index
    if (typeof toIndex !== "number" || toIndex < 0) {
      const toCol = state.boards.find(b => b.columns.some(c => c.id === toColumnId))!.columns.find(c => c.id === toColumnId)!
      toIndex = toCol.cards.length
    }

    dispatch({
      type: "MOVE_CARD",
      data: {
        boardId: fromBoardId,
        fromColumnId,
        toColumnId,
        cardId: activeId,
        toIndex
      }
    })
  }

  if (!isClient) return null

  return (
    <div className="min-h-screen flex justify-center items-center py-40">
      <div className="flex flex-col gap-10 justify-between w-[90%] 2xl:w-[1280px] mx-auto">
        <h1 className="flex justify-center items-center text-[30px] md:text-6xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-rose-400">React Kanban Board</h1>

        {/* ADD BOARD */}
        <div className="flex gap-3 justify-center items-center">
          <input className="w-[50%] p-3 bg-zinc-700 text-white rounded-[5px] focus:outline-none focus:ring-1 focus:ring-amber-500" value={boardTitle} onChange={e => setBoardTitle(e.target.value)} placeholder="New board title" />
          <button
            className="w-[30%] lg:w-[15%] xl:w-[9%] p-3 bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-500 transition-all duration-200 text-white rounded-[5px] cursor-pointer"
            onClick={() => {
              if (boardTitle.trim()) {
                dispatch({ type: "ADD_BOARD", data: { title: boardTitle } })
                setBoardTitle("")
              }
            }}
          >
            Add Board
          </button>
        </div>

        {/* BOARDS */}
        {state.boards
          .filter(board => board.userId === localStorage.getItem("session"))
          .map(board => (
            <div key={board.id} className="flex justify-start items-start border-2 border-amber-500 min-h-90 rounded-[10px] p-10 flex-col gap-8 text-white mt-10">
              <div className="flex gap-3">
                <input className="w-[110px] border border-amber-500 rounded-[3px] p-1 focus:outline-none focus:ring-1 focus:ring-amber-500" value={board.title} onChange={e => dispatch({ type: "UPDATE_BOARD", data: { boardId: board.id, title: e.target.value } })} />
                <button className="w-[110px] bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 transition-all duration-200 rounded-[3px] cursor-pointer text-white text-center flex items-center justify-center" onClick={() => dispatch({ type: "DELETE_BOARD", data: { boardId: board.id } })}>
                  Delete Board
                </button>
              </div>

              {/* ADD COLUMN */}
              <div className="flex gap-3">
                <input className="w-[200px] border border-amber-500 rounded-[3px] p-1 focus:outline-none focus:ring-1 focus:ring-amber-500" value={columnTitles[board.id] || ""} onChange={e => setColumnTitles({ ...columnTitles, [board.id]: e.target.value })} placeholder="New column title" />
                <button
                  className="w-[110px] bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 transition-all duration-200 rounded-[3px] cursor-pointer text-white text-center flex items-center justify-center"
                  onClick={() => {
                    const title = columnTitles[board.id]
                    if (title.trim()) {
                      dispatch({ type: "ADD_COLUMN", data: { boardId: board.id, title } })
                      setColumnTitles({ ...columnTitles, [board.id]: "" })
                    }
                  }}
                >
                  Add Column
                </button>
              </div>

              {/* COLUMNS (single DndContext for the board) */}
              <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                <div className="flex flex-wrap justify-between gap-[4rem] mt-[2rem]">
                  {board.columns.map(column => (
                    <ColumnComponent key={column.id} board={board} column={column} cardTitles={cardTitles} setCardTitles={setCardTitles} editingCard={editingCard} setEditingCard={setEditingCard} dispatch={dispatch} />
                  ))}
                </div>
              </DndContext>
            </div>
          ))}
      </div>
    </div>
  )
}

export default KanbanBoard
