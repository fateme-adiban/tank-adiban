"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type User = {
  username: string
  password: string
}

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const session = localStorage.getItem("session")
    if (session) {
      router.push("/dashboard")
    }
  }, [])

  const handleSignUp = () => {
    if (!username || !password) return setError("Please fill in the fields")

    const users = JSON.parse(localStorage.getItem("users") || "[]") as User[]
    const userExists = users.find(user => user.username === username)

    if (userExists) {
      setError("User already exists")
    } else {
      const newUser = { username, password }
      users.push(newUser)
      localStorage.setItem("users", JSON.stringify(users))
      localStorage.setItem("session", username)
      router.push("/dashboard")
    }
  }

  const handleLogin = () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]") as User[]
    const user = users.find(user => user.username === username && user.password === password)

    if (user) {
      localStorage.setItem("session", username)
      router.push("/dashboard")
    } else {
      setError("Incorrect username or password")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    isLogin ? handleLogin() : handleSignUp()
  }

  return (
    <div className="h-screen flex justify-center items-center">
      <div className="w-[40vw] mx-auto p-5 border border-black rounded-[20px]">
        <h2 className="text-xl mb-5">{isLogin ? "Login" : "Sign up"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="flex justify-evenly">
            <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="w-[45%] mb-2.5 p-2 border border-black rounded-[5px]" />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-[45%] mb-2.5 p-2 border border-black rounded-[5px]" />
          </div>

          {error && <p className="text-red-500 mt-1.5">{error}</p>}

          <div className="flex justify-center">
            <button type="submit" className="px-2 py-1 w-[20%] border border-black rounded-[5px] mt-2.5 cursor-pointer">
              {isLogin ? "Login" : "Sign up"}
            </button>
          </div>
        </form>
        <p className="mt-10 flex justify-center">
          {isLogin ? "Don’t have an account?" : "Already signed up?"}{" "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-blue-500 cursor-pointer ml-2">
            {isLogin ? " Sign up" : " Login"}
          </button>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
