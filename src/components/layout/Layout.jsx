import { Outlet } from 'react-router-dom'
import { ThemeProvider } from '../../context/ThemeContext.jsx'
import Navbar from './Navbar.jsx'
import CostBar from './CostBar.jsx'

export default function Layout() {
  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
          <Outlet />
        </main>
        <CostBar />
      </div>
    </ThemeProvider>
  )
}
