import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import Footer from '../components/Footer'
import '../styles/dashboard.css'

export default function Dashboard() {
  const { user, logout }          = useAuth()
  const [data, setData]           = useState(null)
  const [tokenInfo, setTokenInfo] = useState(null)
  const navigate                  = useNavigate()

  useEffect(() => {
    // Fetch dashboard data — interceptor attaches Bearer token automatically
    api.get('/api/dashboard')
      .then(res => setData(res.data))
      .catch(() => {})

    // Decode JWT payload to show token info (exp, iat)
    const token = localStorage.getItem('access_token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setTokenInfo(payload)
      } catch {
        // ignore decode errors
      }
    }
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const formatExpiry = (exp) => {
    if (!exp) return 'N/A'
    const date = new Date(exp * 1000)
    return date.toLocaleTimeString()
  }

  const getTokenPreview = () => {
    const token = localStorage.getItem('access_token')
    if (!token) return ''
    return token.substring(0, 40) + '...'
  }

  return (
    <div className="dashboard-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">🔐 Auth System — JWT</div>
        <div className="nav-links">
          <span className="nav-user">👤 {user?.username}</span>
          <span className={`role-badge ${user?.role}`}>{user?.role}</span>
          <button onClick={() => navigate('/profile')} className="btn-nav">Profile</button>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        {/* Welcome card */}
        <div className="welcome-card">
          <h2>🎉 {data?.message || `Welcome, ${user?.username}!`}</h2>
          <p>You are successfully authenticated using <strong>JWT (JSON Web Token)</strong>.</p>
        </div>

        {/* JWT Token Info Card */}
        <div className="info-grid">
          <div className="info-card token-card">
            <h3>🔑 Access Token</h3>
            <div className="token-preview">
              <code>{getTokenPreview()}</code>
            </div>
            <div className="token-meta">
              <div className="meta-item">
                <span className="meta-label">User ID</span>
                <span className="meta-value">{tokenInfo?.sub}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Role</span>
                <span className="meta-value">{tokenInfo?.role}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Issued At</span>
                <span className="meta-value">{formatExpiry(tokenInfo?.iat)}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Expires At</span>
                <span className="meta-value expiry">{formatExpiry(tokenInfo?.exp)}</span>
              </div>
            </div>
          </div>

          <div className="info-card how-card">
            <h3>⚙️ How JWT Works Here</h3>
            <ul className="how-list">
              <li>
                <span className="step">1</span>
                You logged in → server verified credentials → issued <strong>Access Token</strong> (15 min) + <strong>Refresh Token</strong> (7 days)
              </li>
              <li>
                <span className="step">2</span>
                Tokens stored in <strong>localStorage</strong> (not cookies)
              </li>
              <li>
                <span className="step">3</span>
                Every API call automatically gets <strong>Authorization: Bearer &lt;token&gt;</strong> header via Axios interceptor
              </li>
              <li>
                <span className="step">4</span>
                When access token expires → interceptor silently calls <strong>/api/refresh</strong> → retries original request
              </li>
              <li>
                <span className="step">5</span>
                Page refresh → <strong>/api/me</strong> restores your session — no re-login needed
              </li>
            </ul>
          </div>
        </div>

        {/* Storage info */}
        <div className="storage-card">
          <h3>📦 localStorage Tokens</h3>
          <p className="storage-hint">Open DevTools → Application → Local Storage to verify</p>
          <div className="storage-items">
            <div className="storage-item">
              <span className="storage-key">access_token</span>
              <span className="storage-exists">✅ Present</span>
            </div>
            <div className="storage-item">
              <span className="storage-key">refresh_token</span>
              <span className="storage-exists">✅ Present</span>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
