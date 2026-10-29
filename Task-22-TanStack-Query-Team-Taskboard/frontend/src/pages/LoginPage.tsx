import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useTheme } from '../context/ThemeContext'
import { errorMessage } from '../api/axios'

export default function LoginPage() {
  const { login, register, hasToken } = useAuth()
  const { theme, toggleTheme } = useTheme()
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
      showToast('Account created successfully! Please log in to continue.')
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
      {/* Top action bar: theme toggle before signing in */}
      <div className="auth-top-bar">
        <div className="auth-top-brand">
          <span className="auth-brand-icon">⬡</span>
          <span className="auth-brand-title">TeamTaskboard</span>
        </div>
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme mode"
        >
          <span className="theme-toggle-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span className="theme-toggle-label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
      </div>

      <div className="auth-wrapper">
        <form className="auth-card" onSubmit={handleSubmit}>
          {/* Header */}
          <div className="auth-card-header">
            <div className="auth-logo-badge">
              <span>⬡</span>
            </div>
            <h2>{mode === 'login' ? 'Welcome back' : 'Create an account'}</h2>
            <p className="auth-card-subtitle">
              {mode === 'login'
                ? 'Sign in to access your synchronized task workspace'
                : 'Get started with team collaboration in seconds'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setMode('login')
                active.reset()
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => {
                setMode('register')
                active.reset()
              }}
            >
              Register
            </button>
          </div>

          {/* Form Fields */}
          <div className="auth-fields">
            {mode === 'register' && (
              <label>
                <span className="label-text">Full Name</span>
                <input
                  type="text"
                  placeholder="e.g. Sudharsun A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </label>
            )}

            <label>
              <span className="label-text">Email Address</span>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus={mode === 'login'}
              />
            </label>

            <label>
              <span className="label-text">Password</span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </label>
          </div>

          {active.isError && (
            <div className="auth-error-banner" role="alert">
              <span>⚠️</span>
              <p>{errorMessage(active.error)}</p>
            </div>
          )}

          <button className="btn btn-auth-submit" type="submit" disabled={active.isPending}>
            {active.isPending ? (
              <span className="btn-loading-state">
                <span className="spinner" aria-hidden="true" />
                Connecting…
              </span>
            ) : mode === 'login' ? (
              'Sign In to Dashboard →'
            ) : (
              'Create My Account →'
            )}
          </button>

          {mode === 'register' && (
            <p className="auth-admin-note">
              ℹ️ The first registered user automatically becomes the <strong>System Admin</strong>.
            </p>
          )}

          <div className="auth-security-footer">
            <span>🔒 256-bit JWT Session Encryption · Real-Time Query Sync</span>
          </div>
        </form>
      </div>
    </div>
  )
}
