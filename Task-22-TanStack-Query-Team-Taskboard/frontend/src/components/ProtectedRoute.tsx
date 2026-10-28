import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute() {
  const { hasToken, user, isLoading } = useAuth()
  if (!hasToken) return <Navigate to="/login" replace />
  if (isLoading || !user) return <div className="state-box"><p>Loading your workspace…</p></div>
  return <Outlet />
}
