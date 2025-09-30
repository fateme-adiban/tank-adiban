import Crud from "@/components/Crud"
import FetchData from "@/components/FetchData"
import LoginPage from "@/components/LoginPage"

export default function Home() {
  return (
    <>
      <FetchData />
      <LoginPage />
      <Crud />
    </>
  )
}
