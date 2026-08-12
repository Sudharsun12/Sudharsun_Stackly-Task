import { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import api from './api'

import LoginPage           from './pages/LoginPage'
import RegisterPage        from './pages/RegisterPage'
import Dashboard           from './pages/Dashboard'
import ApplicationsPage    from './pages/ApplicationsPage'
import AddApplicationPage  from './pages/AddApplicationPage'
import EditApplicationPage from './pages/EditApplicationPage'
import ProtectedRoute      from './components/ProtectedRoute'

import './index.css'

// ─── Auth Context ──────────────────────────────────────────────────────────
export const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

// ─── App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount — check if user is already logged in via session cookie
  useEffect(() => {
    api.get('/api/me')
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login  = (userData) => setUser(userData)
  const logout = async () => {
    await api.get('/api/logout').catch(() => {})
    setUser(null)
  }

  if (loading) {
    return (
      <div className="loading-wrap" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
        <span>Loading…</span>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard"    element={<Dashboard />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/add"          element={<AddApplicationPage />} />
            <Route path="/edit/:id"     element={<EditApplicationPage />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}
