import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse-slow">
          <Logo size="lg" />
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return children
}
