import { render, screen } from "@testing-library/react"
import { Greeting } from "@/components/Greeting"

describe("Greeting", () => {
  it("renders the name correctly", () => {
    render(<Greeting name="Zahra" />)
    expect(screen.getByTestId("greeting")).toHaveTextContent("Hello, Zahra!")
  })
})
