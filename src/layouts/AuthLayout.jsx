import { Outlet } from 'react-router-dom'
import Logo from '../components/Logo'

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md animate-slide-up">
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>
        <div className="hud-card p-6 sm:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
