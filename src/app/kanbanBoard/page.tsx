"use client"
import React, { useEffect, useReducer, useState } from "react"
import { closestCorners, DndContext, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import type { DragEndEvent } from "@dnd-kit/core"
import { useRouter } from "next/navigation"
import { ColumnComponent } from "../../components/ColumnComponent"
import toast from "react-hot-toast"
import type { State, Action, Card } from "../../types"

// Users and Teams
interface User {
  username: string
  password: string
  teamId?: string
  role?: "admin" | "member"
}

function getCurrentUser() {
  const session = localStorage.getItem("session")
  if (!session) return null
  const allUsers = JSON.parse(localStorage.getItem("users") || "[]")
  return allUsers.find((user: User) => user.username === session) || null
}

function isTeamAdmin(teamId: string) {
  const user = getCurrentUser()
  if (!user) return false
  return user.teamId === teamId && user.role === "admin"
}

function canEditBoard(board: { userId: string; teamId?: string }) {
  const user = getCurrentUser()
  if (!user) return false
  if (board.userId === user.username) return true
  if (board.teamId && isTeamAdmin(board.teamId)) return true
  return false
}

// Reducer
export function reducer(state: State, action: Action | { type: "__INIT__"; data: State }): State {
  const session = typeof window !== "undefined" ? localStorage.getItem("session") || "unknown" : "unknown"

  switch (action.type) {
    case "__INIT__":
      return action.data

    case "ADD_BOARD": {
      const user = JSON.parse(localStorage.getItem("users") || "[]").find((user: User) => user.username === session)
      return {
        ...state,
        boards: [...state.boards, { id: crypto.randomUUID(), title: action.data.title, columns: [], userId: session, teamId: user?.teamId }]
      }
    }

    case "UPDATE_BOARD":
      return {
        ...state,
        boards: state.boards.map(board => (board.id === action.data.boardId && canEditBoard(board) ? { ...board, title: action.data.title } : board))
      }

    case "DELETE_BOARD":
      return {
        ...state,
        boards: state.boards.filter(board => board.id !== action.data.boardId || !canEditBoard(board))
      }

    case "ADD_COLUMN":
      return {
        ...state,
        boards: state.boards.map(board => (board.id === action.data.boardId && canEditBoard(board) ? { ...board, columns: [...board.columns, { id: crypto.randomUUID(), title: action.data.title, cards: [] }] } : board))
      }

    case "UPDATE_COLUMN":
      return {
        ...state,
        boards: state.boards.map(board =>
          board.id === action.data.boardId && canEditBoard(board)
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
        boards: state.boards.map(board => (board.id === action.data.boardId && canEditBoard(board) ? { ...board, columns: board.columns.filter(column => column.id !== action.data.columnId) } : board))
      }

    case "ADD_CARD":
      return {
        ...state,
        boards: state.boards.map(board =>
          board.id === action.data.boardId && canEditBoard(board)
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
          board.id === action.data.boardId && canEditBoard(board)
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
          board.id === action.data.boardId && canEditBoard(board)
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
          if (board.id !== boardId || !canEditBoard(board)) return board

          const fromCol = board.columns.find(c => c.id === fromColumnId)
          const toCol = board.columns.find(c => c.id === toColumnId)
          if (!fromCol || !toCol) return board

          const card = fromCol.cards.find(c => c.id === cardId)
          if (!card) return board

          const newFromCols = board.columns.map(c => (c.id === fromColumnId ? { ...c, cards: c.cards.filter(cd => cd.id !== cardId) } : c))

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

// Tab sync and localStorage
const TabSync = () => {
  const [state, dispatch] = useReducer(reducer, { boards: [] }, initial => {
    try {
      const saved = localStorage.getItem("kanban")
      return saved ? JSON.parse(saved) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    const channel = new BroadcastChannel("kanban_channel")

    channel.onmessage = e => {
      const msg = e.data
      if (msg?.type === "__SYNC__") {
        dispatch({ type: "__INIT__", data: msg.data })
      }
    }

    localStorage.setItem("kanban", JSON.stringify(state))

    channel.postMessage({ type: "__SYNC__", data: state })

    return () => channel.close()
  }, [state])

  return { state, dispatch }
}

// KanbanBoard
const KanbanBoard = () => {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    const users = [
      { username: "fateme", password: "123", teamId: "team1", role: "admin" },
      { username: "ali", password: "123", teamId: "team1", role: "member" }
    ]

    if (!localStorage.getItem("users")) {
      localStorage.setItem("users", JSON.stringify(users))
    }

    const teams = [{ id: "team1", name: "Team One", members: ["fateme", "ali"] }]

    if (!localStorage.getItem("teams")) {
      localStorage.setItem("teams", JSON.stringify(teams))
    }
  }, [router])

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

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over) return
    if (active.id === over.id) return

    const activeId = String(active.id)
    const overId = String(over.id)

    const fromBoardId = findBoardId(state, activeId)
    const fromColumnId = findColumnId(state, activeId)

    let toColumnId = findColumnId(state, overId)
    let toIndex = findCardIndex(state, overId)

    if (!toColumnId) {
      for (const b of state.boards) {
        const col = b.columns.find(c => c.id === overId)
        if (col) {
          toColumnId = col.id
          toIndex = col.cards.length
          break
        }
      }
    }

    if (!fromBoardId || !fromColumnId || !toColumnId) return

    if (toIndex < 0) {
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

  // optimistic updates
  const dispatchOptimistic = async (action: Action, Api?: () => Promise<void>) => {
    const prev = structuredClone(state)
    dispatch(action)

    try {
      if (Api) await Api()
    } catch (err) {
      toast.error("Operation failed!")
      dispatch({ type: "__INIT__", data: prev })
    }
  }

  if (!isClient) return null

  return (
    <div className="min-h-screen flex justify-center items-center py-40">
      <div className="flex flex-col gap-10 justify-between w-[90%] 2xl:w-[1280px] mx-auto">
        <h1 className="flex justify-center items-center text-[30px] md:text-6xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-rose-400">React Kanban Board</h1>

        {/* ADD BOARD */}
        <div className="flex gap-3 justify-center items-center">
          <label htmlFor="new-board-title" className="sr-only">
            New board title
          </label>
          <input id="new-board-title" className="w-[50%] p-3 bg-zinc-700 text-white rounded-[5px] focus:outline-none focus:ring-1 focus:ring-amber-500" value={boardTitle} onChange={e => setBoardTitle(e.target.value)} placeholder="New board title" />
          <button
            aria-label={`Add board`}
            className="w-[30%] lg:w-[15%] xl:w-[9%] p-3 bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-500 transition-all duration-200 text-white rounded-[5px] cursor-pointer"
            onClick={async () => {
              if (!boardTitle.trim()) return

              await dispatchOptimistic({ type: "ADD_BOARD", data: { title: boardTitle } }, async () => {
                await new Promise((res, rej) => setTimeout(() => (Math.random() < 0.8 ? res(null) : rej("Fake network error")), 500))
                toast.success("Board added successfully!")
              })

              setBoardTitle("")
            }}
          >
            Add Board
          </button>
        </div>

        {/* BOARDS */}
        {state.boards
          .filter(board => {
            const user = getCurrentUser()
            if (!user) return false

            return board.userId === user.username || (board.teamId && board.teamId === user.teamId)
          })
          .map(board => (
            <div data-testid="board" key={board.id} className="flex justify-start items-start border-2 border-amber-500 min-h-90 rounded-[10px] p-10 flex-col gap-8 text-white mt-10">
              <div className="flex gap-3">
                <label htmlFor={`edit-board-${board.id}`} className="sr-only">
                  Edit board title
                </label>
                <input id={`edit-board-${board.id}`} className="w-[110px] border border-amber-500 rounded-[3px] p-1 focus:outline-none focus:ring-1 focus:ring-amber-500" value={board.title} onChange={e => dispatch({ type: "UPDATE_BOARD", data: { boardId: board.id, title: e.target.value } })} />
                {canEditBoard(board) && (
                  <button
                    aria-label={`Delete board ${board.title}`}
                    className="w-[110px] bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 transition-all duration-200 rounded-[3px] cursor-pointer text-white text-center flex items-center justify-center"
                    onClick={async () => {
                      await dispatchOptimistic({ type: "DELETE_BOARD", data: { boardId: board.id } }, async () => {
                        await new Promise((res, rej) => setTimeout(() => (Math.random() < 0.8 ? res(null) : rej("Fake network error")), 500))
                        toast.success("Successfully Deleted!")
                      })
                    }}
                  >
                    Delete Board
                  </button>
                )}
              </div>

              {/* ADD COLUMN */}
              <div className="flex gap-3">
                {canEditBoard(board) && (
                  <>
                    <label htmlFor={`add-column-${board.id}`} className="sr-only">
                      New column title
                    </label>
                    <input id={`add-column-${board.id}`} className="w-[200px] border border-amber-500 rounded-[3px] p-1 focus:outline-none focus:ring-1 focus:ring-amber-500" value={columnTitles[board.id] || ""} onChange={e => setColumnTitles({ ...columnTitles, [board.id]: e.target.value })} placeholder="New column title" />
                    <button
                      aria-label={`Add column to ${board.title}`}
                      className="w-[110px] bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 transition-all duration-200 rounded-[3px] cursor-pointer text-white text-center flex items-center justify-center"
                      onClick={async () => {
                        if (!canEditBoard(board)) return

                        const title = columnTitles[board.id]
                        if (!title.trim()) return

                        await dispatchOptimistic({ type: "ADD_COLUMN", data: { boardId: board.id, title } }, async () => {
                          await new Promise((res, rej) => setTimeout(() => (Math.random() < 0.8 ? res(null) : rej("Fake network error")), 500))
                          toast.success("Column Added Successfully!")
                        })

                        setColumnTitles({ ...columnTitles, [board.id]: "" })
                      }}
                    >
                      Add Column
                    </button>
                  </>
                )}
              </div>

              {/* COLUMNS */}
              <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                <div className="flex flex-wrap justify-between gap-[4rem] mt-[2rem]">
                  {board.columns.map(column => (
                    <ColumnComponent key={column.id} board={board} column={column} cardTitles={cardTitles} setCardTitles={setCardTitles} editingCard={editingCard} setEditingCard={setEditingCard} dispatch={dispatch} dispatchOptimistic={dispatchOptimistic} />
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
