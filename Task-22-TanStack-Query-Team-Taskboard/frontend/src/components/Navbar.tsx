import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const DAILY_QUOTE = "Discipline is choosing between what you want now and what you want most."

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="navbar">
      {/* Quote strip — centred above main nav */}
      <div className="navbar-quote-strip">
        <span className="navbar-quote">✦ {DAILY_QUOTE} ✦</span>
      </div>

      {/* Main nav bar */}
      <div className="navbar-inner">
        {/* Brand — left */}
        <div className="brand-wrap">
          <span className="brand-icon" aria-hidden="true">⬡</span>
          <div className="brand-text">
            <span className="brand-name">TeamTaskboard</span>
            <span className="brand-tagline">Powered by TanStack Query</span>
          </div>
        </div>

        {/* Nav links — centred */}
        <nav className="navbar-center" aria-label="Main navigation">
          <NavLink to="/dashboard">
            <span className="nav-icon">▦</span> Dashboard
          </NavLink>
          <NavLink to="/tasks">
            <span className="nav-icon">✓</span> Tasks
          </NavLink>
        </nav>

        {/* User + logout — right */}
        <div className="navbar-user">
          {user && (
            <div className="user-pill">
              <span className="user-avatar" aria-hidden="true">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.role}</span>
              </div>
            </div>
          )}
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} aria-label="Log out">
            Log out
          </button>
        </div>
      </div>
    </header>
  )
}
