import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchMe, loginRequest, logoutRequest, registerRequest } from '../api/tasks'
import { TOKEN_KEY } from '../api/axios'
import type { RegisterInput, User } from '../types'

interface AuthContextValue {
  user: User | null
  hasToken: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))

  // The current user is server state too, so it lives in the query cache.
  const { data: user = null, isLoading } = useQuery<User>({
    queryKey: ['me'],
    queryFn: fetchMe,
    enabled: !!token,
    staleTime: Infinity,
    retry: false,
  })

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginRequest(email, password)
    localStorage.setItem(TOKEN_KEY, res.access_token)
    queryClient.setQueryData(['me'], res.user)
    setToken(res.access_token)
  }, [queryClient])

  const register = useCallback(async (input: RegisterInput) => {
    await registerRequest(input)
  }, [])

  const logout = useCallback(async () => {
    try { await logoutRequest() } catch { /* token may already be invalid */ }
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    queryClient.clear()
  }, [queryClient])

  return (
    <AuthContext.Provider value={{ user, hasToken: !!token, isLoading: !!token && isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
