import { render, screen } from "@testing-library/react"
import { ColumnComponent } from "@/components/ColumnComponent"
import type { Board, Column } from "@/types"

describe("ColumnComponent", () => {
  const mockBoard: Board = { id: "b1", title: "Board 1", userId: "u1", columns: [] }
  const mockColumn: Column = { id: "col1", title: "Todo", cards: [] }
  const mockDispatch = jest.fn()
  const mockDispatchOptimistic = jest.fn()
  const mockSetCardTitles = jest.fn()
  const mockSetEditingCard = jest.fn()

  it("renders the column title", () => {
    render(<ColumnComponent board={mockBoard} column={mockColumn} cardTitles={{}} setCardTitles={mockSetCardTitles} editingCard={null} setEditingCard={mockSetEditingCard} dispatch={mockDispatch} dispatchOptimistic={mockDispatchOptimistic} />)

    expect(screen.getByDisplayValue("Todo")).toBeInTheDocument()
  })

  // it("adds a card when Add Card button is clicked", () => {
  //   render(<ColumnComponent board={mockBoard} column={mockColumn} cardTitles={{ col1: "New Task" }} setCardTitles={mockSetCardTitles} editingCard={null} setEditingCard={mockSetEditingCard} dispatch={mockDispatch} dispatchOptimistic={mockDispatchOptimistic} />)

  //   fireEvent.click(screen.getByText("Add Card"))

  //   expect(mockDispatch).toHaveBeenCalledWith({
  //     type: "ADD_CARD",
  //     data: { boardId: "b1", columnId: "col1", title: "New Task" }
  //   })
  // })
})
