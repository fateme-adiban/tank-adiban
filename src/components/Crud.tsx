"use client"
import React, { useEffect, useReducer, useState } from "react"

type Card = { id: string; title: string; description?: string }
type Column = { id: string; title: string; cards: Card[] }
type Board = { id: string; title: string; columns: Column[] }
type State = { boards: Board[] }
type Action = { type: "ADD_BOARD"; data: { title: string } } | { type: "UPDATE_BOARD"; data: { boardId: string; title: string } } | { type: "DELETE_BOARD"; data: { boardId: string } } | { type: "ADD_COLUMN"; data: { boardId: string; title: string } } | { type: "UPDATE_COLUMN"; data: { boardId: string; columnId: string; title: string } } | { type: "DELETE_COLUMN"; data: { boardId: string; columnId: string } } | { type: "ADD_CARD"; data: { boardId: string; columnId: string; title: string } } | { type: "UPDATE_CARD"; data: { boardId: string; columnId: string; card: Card } } | { type: "DELETE_CARD"; data: { boardId: string; columnId: string; cardId: string } }

function reducer(state: State, action: Action | { type: "__INIT__"; data: State }): State {
  switch (action.type) {
    case "__INIT__":
      return action.data

    case "ADD_BOARD":
      return { ...state, boards: [...state.boards, { id: crypto.randomUUID(), title: action.data.title, columns: [] }] }

    case "UPDATE_BOARD":
      return { ...state, boards: state.boards.map(board => (board.id === action.data.boardId ? { ...board, title: action.data.title } : board)) }

    case "DELETE_BOARD":
      return { ...state, boards: state.boards.filter(board => board.id !== action.data.boardId) }

    case "ADD_COLUMN":
      return { ...state, boards: state.boards.map(board => (board.id === action.data.boardId ? { ...board, columns: [...board.columns, { id: crypto.randomUUID(), title: action.data.title, cards: [] }] } : board)) }

    case "UPDATE_COLUMN":
      return { ...state, boards: state.boards.map(board => (board.id === action.data.boardId ? { ...board, columns: board.columns.map(column => (column.id === action.data.columnId ? { ...column, title: action.data.title } : column)) } : board)) }

    case "DELETE_COLUMN":
      return { ...state, boards: state.boards.map(board => (board.id === action.data.boardId ? { ...board, columns: board.columns.filter(column => column.id !== action.data.columnId) } : board)) }

    case "ADD_CARD":
      return { ...state, boards: state.boards.map(board => (board.id === action.data.boardId ? { ...board, columns: board.columns.map(column => (column.id === action.data.columnId ? { ...column, cards: [...column.cards, { id: crypto.randomUUID(), title: action.data.title }] } : column)) } : board)) }

    case "UPDATE_CARD":
      return { ...state, boards: state.boards.map(board => (board.id === action.data.boardId ? { ...board, columns: board.columns.map(column => (column.id === action.data.columnId ? { ...column, cards: column.cards.map(card => (card.id === action.data.card.id ? action.data.card : card)) } : column)) } : board)) }

    case "DELETE_CARD":
      return { ...state, boards: state.boards.map(board => (board.id === action.data.boardId ? { ...board, columns: board.columns.map(column => (column.id === action.data.columnId ? { ...column, cards: column.cards.filter(card => card.id !== action.data.cardId) } : column)) } : board)) }

    default:
      return state
  }
}

const useBoardState = () => {
  const [state, dispatch] = useReducer(reducer, { boards: [] })

  // Load from localStorage on the client
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("boards")
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          dispatch({ type: "__INIT__", data: parsed }) // custom init action
        } catch (err) {
          console.error("Failed to parse boards from localStorage:", err)
        }
      }
    }
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("boards", JSON.stringify(state))
    }
  }, [state])

  return { state, dispatch }
}

const Crud = () => {
  const { state, dispatch } = useBoardState()
  const [boardTitle, setBoardTitle] = useState("")
  const [columnTitles, setColumnTitles] = useState<{ [boardId: string]: string }>({})
  const [cardTitles, setCardTitles] = useState<{ [columnId: string]: string }>({})
  const [editingCard, setEditingCard] = useState<{ boardId: string; columnId: string; card: Card } | null>(null)

  return (
    <div className="h-screen flex justify-center items-center">
      <div className="flex flex-col gap-10 justify-between border border-blue-500 w-[1280px] mx-auto p-10 rounded-[20px]">
        <h1 className="text-xl flex justify-center items-center">Boards CRUD</h1>

        {/* ADD BOARD */}

        <div className="flex gap-3 justify-center items-center">
          <input className="w-[20%] border border-blue-500 rounded-[5px] px-1" value={boardTitle} onChange={e => setBoardTitle(e.target.value)} placeholder="New board title" />

          <button
            className="w-[8%] bg-green-500 text-white rounded-[5px] cursor-pointer"
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

        {state.boards.map(board => (
          <div key={board.id} className="bg-blue-200 rounded-[10px] p-5 flex flex-col gap-8 justify-between items-start">
            <h2 className="flex gap-3">
              <input className="w-[110px] border border-black rounded-[5px] px-1" value={board.title} onChange={e => dispatch({ type: "UPDATE_BOARD", data: { boardId: board.id, title: e.target.value } })} />
              <button className="w-[110px] bg-red-500 text-white rounded-[5px] cursor-pointer" onClick={() => dispatch({ type: "DELETE_BOARD", data: { boardId: board.id } })}>
                Delete Board
              </button>
            </h2>

            {/* ADD COLUMNS */}
            <div className="flex gap-3">
              <input className="w-[200px] border border-blue-500 rounded-[5px] px-1" value={columnTitles[board.id] || ""} onChange={e => setColumnTitles({ ...columnTitles, [board.id]: e.target.value })} placeholder="New column title" />
              <button
                className="w-[110px] bg-green-500 text-white rounded-[5px] cursor-pointer"
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

            {/* COLUMNS */}

            <div className="flex gap-[1rem] mt-[1rem]">
              {board.columns.map(column => (
                <div key={column.id} className="bg-white border flex flex-col gap-5 border-blue-200 p-[1rem] min-w-[200px] rounded-[5px]">
                  <h3 className="flex gap-3">
                    <input className="w-[100px] border border-black rounded-[5px] px-1" value={column.title} onChange={e => dispatch({ type: "UPDATE_COLUMN", data: { boardId: board.id, columnId: column.id, title: e.target.value } })} />
                    <button className="w-[70px] bg-red-500 text-white rounded-[5px] cursor-pointer" onClick={() => dispatch({ type: "DELETE_COLUMN", data: { boardId: board.id, columnId: column.id } })}>
                      Delete
                    </button>
                  </h3>

                  {/* ADD CARD */}
                  <div className="flex gap-3">
                    <input className="w-[150px] border border-blue-500 rounded-[5px] px-1" value={cardTitles[column.id] || ""} onChange={e => setCardTitles({ ...cardTitles, [column.id]: e.target.value })} />
                    <button
                      className="w-[80px] bg-green-500 text-white rounded-[5px] cursor-pointer"
                      onClick={() => {
                        const title = cardTitles[column.id]
                        if (title.trim()) {
                          dispatch({ type: "ADD_CARD", data: { boardId: board.id, columnId: column.id, title } })
                          setCardTitles({ ...cardTitles, [column.id]: "" })
                        }
                      }}
                    >
                      Add Card
                    </button>
                  </div>

                  {/* CARDS */}

                  <ul>
                    {column.cards.map(card => (
                      <li key={card.id} className="flex justify-end gap-3 mt-5">
                        {editingCard?.card.id === card.id ? (
                          <>
                            <input className="w-[150px] border border-blue-500 rounded-[5px] px-1" value={editingCard.card.title} onChange={e => setEditingCard({ ...editingCard, card: { ...editingCard.card, title: e.target.value } })} />
                            <button
                              className="w-[60px] bg-green-500 text-white rounded-[5px] cursor-pointer"
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
                          <>
                            {card.title}
                            <button className="w-[60px] bg-green-500 text-white rounded-[5px] cursor-pointer" onClick={() => setEditingCard({ boardId: board.id, columnId: column.id, card })}>
                              Edit
                            </button>
                            <button className="w-[60px] bg-red-500 text-white rounded-[5px] cursor-pointer" onClick={() => dispatch({ type: "DELETE_CARD", data: { boardId: board.id, columnId: column.id, cardId: card.id } })}>
                              Delete
                            </button>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Crud
