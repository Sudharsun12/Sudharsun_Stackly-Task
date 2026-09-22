import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Wraps protected routes — redirects to /login if no user
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}
