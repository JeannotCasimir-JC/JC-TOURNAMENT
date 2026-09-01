import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import BottomNav from '../components/BottomNav'

export default function MainLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 pb-24 md:pb-10">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
