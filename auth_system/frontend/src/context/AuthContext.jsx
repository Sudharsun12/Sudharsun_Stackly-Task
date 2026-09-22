import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api'

// ─── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext(null)

// ─── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)   // waiting for restore check

  // On app load — restore session from localStorage if token exists
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      api.get('/api/me')
        .then(res => setUser(res.data))
        .catch(() => {
          // Token invalid / expired beyond refresh — clear storage
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  // Called by Login page after successful login
  const login = (userData, accessToken, refreshToken) => {
    localStorage.setItem('access_token',  accessToken)
    localStorage.setItem('refresh_token', refreshToken)
    localStorage.setItem('user',          JSON.stringify(userData))
    setUser(userData)
  }

  // Called by logout button
  const logout = async () => {
    try {
      await api.post('/api/logout')
    } catch {
      // Even if the call fails, clear tokens locally
    }
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Custom hook ───────────────────────────────────────────────────────────────
export function useAuth() {
  return useContext(AuthContext)
}
