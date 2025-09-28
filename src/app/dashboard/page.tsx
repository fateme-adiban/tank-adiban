"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const Dashboard = () => {
  const [username, setUsername] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const session = localStorage.getItem("session")
    if (!session) {
      router.push("/")
    } else {
      setUsername(session)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("session")
    router.push("/")
  }

  return (
    <div className="max-w-[400px] mx-auto mt-12 text-center border border-black rounded-[5px] p-12 text-xl">
      <h1>
        Welcome <span className="text-blue-500">{username}</span>
      </h1>
      <button onClick={handleLogout} className="px-4 py-1 w-[40%] border border-black rounded-[5px] mt-5 cursor-pointer">
        Logout
      </button>
    </div>
  )
}

export default Dashboard
