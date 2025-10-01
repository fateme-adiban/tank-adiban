import React from "react"

type GreetingProps = {
  name: string
}

export const Greeting: React.FC<GreetingProps> = ({ name }) => {
  return (
    <div className="flex justify-center items-center h-screen">
      <h1 className="text-[10vw] text-blue-400" data-testid="greeting">
        Hello, {name}!
      </h1>
    </div>
  )
}
