import { Route, Routes } from "react-router-dom"
import { SideNav } from "./components/layout/SideNav.tsx"
import HomeRoute from "./pages/Home/index.tsx"
import TrashRoute from "./pages/Trash/index.tsx"

function App() {
  return (
    <>
      <SideNav />
      <Routes>
        <Route path="/" element={<HomeRoute />} />
      <Route path="/trash" element={<TrashRoute />} />
        <Route path="*" element={<HomeRoute />} />
      </Routes>
    </>
  )
}

export default App
