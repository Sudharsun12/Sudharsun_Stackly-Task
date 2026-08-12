import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../App'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="navbar-brand">
          <span className="icon">🎯</span>
          <span>JobTracker</span>
        </div>

        {/* Nav links */}
        <div className="navbar-links">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            📊 <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/applications"
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            📋 <span>Applications</span>
          </NavLink>
          <NavLink
            to="/add"
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            ➕ <span>Add New</span>
          </NavLink>
        </div>

        {/* Right side */}
        <div className="navbar-right">
          {user && (
            <div className="nav-user">
              👤 <strong>{user.username}</strong>
            </div>
          )}
          <button id="logout-btn" className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
