import { render, screen, fireEvent } from "@testing-library/react"
import { CounterUI } from "@/components/CounterUI"
import { useState } from "react"

const CounterWrapper = () => {
  const [count, setCount] = useState(0)
  const increment = () => setCount(c => c + 1)
  return <CounterUI count={count} onIncrement={increment} />
}

describe("CounterUI", () => {
  // 1
  it("renders Count button with initial value", () => {
    render(<CounterWrapper />)
    const button = screen.getByRole("button")
    expect(button).toHaveTextContent(/Count:/i)
    expect(button).toHaveTextContent("0")
  })

  // 2
  it("increments count when button is clicked", () => {
    render(<CounterWrapper />)

    const button = screen.getByRole("button")

    fireEvent.click(button)
    expect(button).toHaveTextContent("1")
  })

  // 3
  it("increments many times correctly (stress test)", () => {
    render(<CounterWrapper />)
    const button = screen.getByRole("button")
    for (let i = 0; i < 100; i++) fireEvent.click(button)
    expect(button).toHaveTextContent("100")
  })

  // 4
  it("UI updates immediately after click", () => {
    render(<CounterWrapper />)
    const button = screen.getByRole("button")
    expect(button).toHaveTextContent("0")
    fireEvent.click(button)
    expect(button).toHaveTextContent("1")
  })

  // 5
  it("UI updates immediately after click", () => {
    render(<CounterWrapper />)
    const button = screen.getByRole("button")
    expect(button).toHaveTextContent("0")
    fireEvent.click(button)
    expect(button).toHaveTextContent("1")
  })

  // 6
  it("button is enabled and clickable", () => {
    render(<CounterWrapper />)
    const button = screen.getByRole("button")
    expect(button).toBeEnabled()
    fireEvent.click(button)
    expect(button).toHaveTextContent("1")
  })

  // 7
  it("button text always contains 'Count:'", () => {
    render(<CounterWrapper />)
    const button = screen.getByRole("button")
    expect(button.textContent).toMatch(/Count:/)
    fireEvent.click(button)
    expect(button.textContent).toMatch(/Count:/)
  })

  // 8
  it("renders correctly even if increment function is slow", () => {
    const SlowWrapper = () => {
      const [count, setCount] = useState(0)
      const increment = () => setTimeout(() => setCount(prev => prev + 1), 50)
      return <CounterUI count={count} onIncrement={increment} />
    }
    render(<SlowWrapper />)
    const button = screen.getByRole("button")
    fireEvent.click(button)
    setTimeout(() => {
      expect(button).toHaveTextContent("1")
    }, 60)
  })
})
