"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

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

  const handleSignUp = () => {
    if (!username || !password) return setError("Please fill in the fields")

    const users = JSON.parse(localStorage.getItem("users") || "[]") as User[]
    const userExists = users.find(user => user.username === username)

    if (userExists) {
      setError("User already exists")
      toast.error("Oops! We couldn’t complete your sign-up")
    } else {
      const newUser = { username, password }
      users.push(newUser)
      localStorage.setItem("users", JSON.stringify(users))
      localStorage.setItem("session", username)
      router.push("/kanbanBoard")
      toast.success("Signed up successfully!")
    }
  }

  const handleLogin = () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]") as User[]
    const user = users.find(user => user.username === username && user.password === password)

    if (user) {
      localStorage.setItem("session", username)
      router.push("/kanbanBoard")
      toast.success("Logged in successfully!")
    } else {
      setError("Incorrect username or password")
      toast.error("Oops! We couldn’t log you in.")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (isLogin) {
      handleLogin()
    } else {
      handleSignUp()
    }
  }

  return (
    <main className="h-screen flex justify-center items-center" role="main">
      <div className="w-[85%] sm:w-[80%] md:w-[40vw] mx-auto p-5 bg-gradient-to-r from-yellow-400 via-amber-500 to-rose-400 rounded-[8px]" aria-labelledby="form-title">
        <h2 id="form-title" className="text-2xl font-bold mb-5">
          {isLogin ? "Login" : "Sign up"}
        </h2>

        <form onSubmit={handleSubmit} aria-describedby={error ? "form-error" : undefined}>
          <div className="flex justify-evenly">
            <label htmlFor="username" className="sr-only">
              Username
            </label>
            <input id="username" type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="w-[45%] mb-2.5 p-2 border-2 border-black rounded-[5px] focus:outline-none focus:ring-2 focus:ring-amber-500" aria-required="true" />

            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input id="password" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-[45%] mb-2.5 p-2 border-2 border-black rounded-[5px] focus:outline-none focus:ring-2 focus:ring-amber-500" aria-required="true" />
          </div>

          {error && (
            <p id="form-error" role="alert" className="text-zinc-700 mt-1.5">
              {error}
            </p>
          )}

          <div className="flex justify-center">
            <button type="submit" className="flex justify-center items-center px-2 py-1 w-[25%] border-2 border-black rounded-[5px] mt-2.5 cursor-pointer font-semibold">
              {isLogin ? "Login" : "Sign up"}
            </button>
          </div>
        </form>

        <p className="mt-10 flex items-center justify-center font-semibold">
          {isLogin ? "Don’t have an account?" : "Already signed up?"}
          <button onClick={() => setIsLogin(!isLogin)} className="text-zinc-500 text-lg cursor-pointer ml-2" aria-pressed={!isLogin}>
            {isLogin ? "Sign up" : "Login"}
          </button>
        </p>
      </div>
    </main>
  )
}

export default LoginPage
