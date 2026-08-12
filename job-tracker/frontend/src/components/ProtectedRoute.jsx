import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../App'

/**
 * ProtectedRoute — wraps routes that require authentication.
 *
 * How it works:
 *   • Reads `user` from AuthContext (set in App.jsx by /api/me check).
 *   • If user is null (not logged in) → redirect to /login.
 *   • If user exists → render the nested <Route> via <Outlet />.
 *
 * Usage in App.jsx:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *   </Route>
 */
export default function ProtectedRoute() {
  const { user } = useAuth()

  if (!user) {
    // Replace so the user can't hit Back to get back in
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
