import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import Footer from '../components/Footer'
import '../styles/auth.css'

export default function Login() {
  const [form, setForm]       = useState({ username: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const { login }   = useAuth()
  const navigate    = useNavigate()

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await api.post('/api/login', form)

      const { access_token, refresh_token, user } = res.data

      // Store tokens and update AuthContext
      login(user, access_token, refresh_token)

      navigate('/dashboard')

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🔐 Auth System</h1>
          <p>JWT Authentication · Task 16</p>
        </div>

        <h2>Login</h2>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account?{' '}
          <Link to="/register">Register here</Link>
        </p>
      </div>
      <Footer />
    </div>
  )
}
