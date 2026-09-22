import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import Footer from '../components/Footer'
import '../styles/dashboard.css'

export default function Profile() {
  const { user, logout }    = useAuth()
  const [profile, setProfile] = useState(null)
  const [error, setError]     = useState('')
  const navigate              = useNavigate()

  useEffect(() => {
    api.get('/api/profile')
      .then(res => setProfile(res.data))
      .catch(() => setError('Failed to load profile.'))
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="dashboard-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">🔐 Auth System — JWT</div>
        <div className="nav-links">
          <span className="nav-user">👤 {user?.username}</span>
          <span className={`role-badge ${user?.role}`}>{user?.role}</span>
          <button onClick={() => navigate('/dashboard')} className="btn-nav">Dashboard</button>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-card">
          <h2>👤 My Profile</h2>
          <p>Your account details fetched from the database using a JWT-protected route.</p>
        </div>

        {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>{error}</div>}

        {profile ? (
          <div className="info-card profile-card">
            <h3>Account Information</h3>
            <table className="profile-table">
              <tbody>
                <tr>
                  <td className="field-label">User ID</td>
                  <td className="field-value">{profile.id}</td>
                </tr>
                <tr>
                  <td className="field-label">Username</td>
                  <td className="field-value">{profile.username}</td>
                </tr>
                <tr>
                  <td className="field-label">Email</td>
                  <td className="field-value">{profile.email}</td>
                </tr>
                <tr>
                  <td className="field-label">Role</td>
                  <td className="field-value">
                    <span className={`role-badge ${profile.role}`}>{profile.role}</span>
                  </td>
                </tr>
                <tr>
                  <td className="field-label">Registered On</td>
                  <td className="field-value">{profile.created_at}</td>
                </tr>
              </tbody>
            </table>

            <div className="jwt-note">
              <strong>🔒 JWT Protected Route</strong> — This data was fetched from{' '}
              <code>GET /api/profile</code> with the{' '}
              <code>Authorization: Bearer &lt;token&gt;</code> header automatically
              added by the Axios interceptor. No session cookie was used.
            </div>
          </div>
        ) : (
          !error && <p className="loading-text">Loading profile...</p>
        )}
      </div>
      <Footer />
    </div>
  )
}
