import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth()

  if (loading)  return <div className="empty-state"><p>Loading…</p></div>
  if (!user)    return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/"     replace />
  return children
}
