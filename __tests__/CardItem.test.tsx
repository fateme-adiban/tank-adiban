import { render, screen } from "@testing-library/react"
import { CardItem } from "@/components/CardItem"
import type { Card } from "@/types"

describe("Card Item", () => {
  const mockCard: Card = { id: "c1", title: "Test Card" }
  const mockdDispatchOptimistic = jest.fn()
  const mockSetEditingCard = jest.fn()

  it("renders the card title", () => {
    render(<CardItem card={mockCard} boardId="b1" columnId="col1" editingCard={null} setEditingCard={mockSetEditingCard} dispatchOptimistic={mockdDispatchOptimistic} />)

    expect(screen.getByText("Test Card")).toBeInTheDocument()
  })

  // it("calls setEditingCard when Edit button is clicked", () => {
  //   render(<CardItem card={mockCard} boardId="b1" columnId="col1" editingCard={null} setEditingCard={mockSetEditingCard} dispatch={mockDispatch} dispatchOptimistic={mockdDispatchOptimistic} />)

  //   fireEvent.click(screen.getByText("Edit"))

  //   expect(mockDispatch).toHaveBeenCalledWith({
  //     boardId: "b1",
  //     columnId: "col1",
  //     card: mockCard
  //   })
  // })

  // it("dispatches DELETE_CARD when Delete button is clicked", () => {
  //   render(<CardItem card={mockCard} boardId="b1" columnId="col1" editingCard={null} setEditingCard={mockSetEditingCard} dispatch={mockDispatch} dispatchOptimistic={mockdDispatchOptimistic} />)

  //   fireEvent.click(screen.getByText("Delete"))

  //   expect(mockDispatch).toHaveBeenCalledWith({
  //     type: "DELETE_CARD",
  //     data: { boardId: "b1", columnId: "col1", cardId: "c1" }
  //   })
  // })
})
