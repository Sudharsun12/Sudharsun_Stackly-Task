import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const DAILY_QUOTE = "Discipline is choosing between what you want now and what you want most."

export function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
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

      {/* Main nav bar with centered brand and no dashboard/tasks links */}
      <div className="navbar-inner navbar-inner-centered">
        {/* Left balance spacer */}
        <div className="navbar-left-spacer" aria-hidden="true" />

        {/* Brand — Centered Team Task Board */}
        <div className="brand-wrap brand-center">
          <span className="brand-icon" aria-hidden="true">⬡</span>
          <div className="brand-text">
            <span className="brand-name">Team Task Board</span>
            <span className="brand-tagline">Powered by TanStack Query</span>
          </div>
        </div>

        {/* User + theme toggle + logout — right */}
        <div className="navbar-user">
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme mode"
          >
            <span className="theme-toggle-icon" aria-hidden="true">
              {theme === 'dark' ? '☀️' : '🌙'}
            </span>
            <span className="theme-toggle-label">
              {theme === 'dark' ? 'Light' : 'Dark'}
            </span>
          </button>

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
