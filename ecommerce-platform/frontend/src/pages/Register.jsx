import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register }    = useAuth()
  const navigate        = useNavigate()
  const [name,  setName]      = useState('')
  const [email, setEmail]     = useState('')
  const [pw,    setPw]        = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (pw.length < 6) { setError('Password must be at least 6 characters.'); return }
    setError(''); setLoading(true)
    try {
      await register(name, email, pw)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div className="brand-icon" style={{ margin: '0 auto 0.75rem', width: 52, height: 52, fontSize: '1.5rem' }}>
            🛍️
          </div>
          <h2>Create Account</h2>
          <p className="auth-sub">Join ShopSphere today — it's free!</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text" placeholder="Your name"
              value={name} onChange={e => setName(e.target.value)} required
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password" placeholder="Min. 6 characters"
              value={pw} onChange={e => setPw(e.target.value)} required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account…' : 'Create Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
