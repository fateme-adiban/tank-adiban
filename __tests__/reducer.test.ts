import { reducer } from "@/app/kanbanBoard/page"
import type { State } from "@/types"

describe("Kanban reducer", () => {
  it("adds a board", () => {
    const initial: State = { boards: [] }

    const result = reducer(initial, { type: "ADD_BOARD", data: { title: "Project A" } })

    expect(result.boards).toHaveLength(1)

    expect(result.boards[0].title).toBe("Project A")
  })

  it("updates a board title", () => {
    const boardId = "b1"

    const state: State = { boards: [{ id: boardId, title: "Old", userId: "u1", columns: [] }] }

    localStorage.setItem("session", "u1")

    const result = reducer(state, { type: "UPDATE_BOARD", data: { boardId, title: "New Title" } })

    expect(result.boards[0].title).toBe("New Title")
  })

  // it("deletes a board", () => {
  //   const boardId = "b1"

  //   const state: State = { boards: [{ id: boardId, title: "Temp", userId: "u1", columns: [] }] }

  //   localStorage.setItem("session", "u1")

  //   const result = reducer(state, { type: "DELETE_BOARD", data: { boardId } })

  //   expect(result.boards).toHaveLength(0)
  // })

  // it("adds a column", () => {
  //   const boardId = "b1"

  //   const state: State = { boards: [{ id: boardId, title: "B", userId: "u1", columns: [] }] }

  //   localStorage.setItem("session", "u1")

  //   const result = reducer(state, { type: "ADD_COLUMN", data: { boardId, title: "Todo" } })

  //   expect(result.boards[0].columns[0].title).toBe("Todo")
  // })

  it("adds a card", () => {
    const boardId = "b1"
    const colId = "c1"

    const state: State = { boards: [{ id: boardId, title: "B", userId: "u1", columns: [{ id: colId, title: "Col", cards: [] }] }] }

    localStorage.setItem("session", "u1")

    const result = reducer(state, { type: "ADD_CARD", data: { boardId, columnId: colId, title: "Task 1" } })

    expect(result.boards[0].columns[0].cards[0].title).toBe("Task 1")
  })
})
