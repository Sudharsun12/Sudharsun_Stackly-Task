import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { errorMessage } from '../api/axios'

export default function LoginPage() {
  const { login, register, hasToken } = useAuth()
  const showToast = useToast()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const loginMutation = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: () => navigate('/dashboard'),
  })
  const registerMutation = useMutation({
    mutationFn: () => register({ name, email, password }),
    onSuccess: () => {
      showToast('Account created — log in to continue')
      setMode('login')
      setPassword('')
    },
  })

  const active = mode === 'login' ? loginMutation : registerMutation
  if (hasToken) return <Navigate to="/dashboard" replace />

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    active.mutate()
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Taskboard</h1>
        <p className="muted">{mode === 'login' ? 'Log in to your team workspace.' : 'Create your account.'}</p>

        {mode === 'register' && (
          <label>Name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
        )}
        <label>Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
        </label>

        {active.isError && <p className="form-error">{errorMessage(active.error)}</p>}

        <button className="btn" type="submit" disabled={active.isPending}>
          {active.isPending ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
        </button>
        <button type="button" className="link-btn" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); active.reset() }}>
          {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Log in'}
        </button>
        {mode === 'register' && <p className="muted small">The first account created becomes the admin.</p>}
      </form>
    </div>
  )
}
