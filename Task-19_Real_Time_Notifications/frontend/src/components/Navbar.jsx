import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import NotificationBell from './NotificationBell'

// ── Avatar helper — shows image if avatar_url exists, else initials circle ──
function UserAvatar({ user }) {
  if (user?.avatar_url) {
    return (
      <img
        src={`http://localhost:5000${user.avatar_url}`}
        alt={user.name}
        className="nav-avatar"
      />
    )
  }
  // Initials fallback
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'
  return <span className="nav-avatar-initials">{initials}</span>
}

export default function Navbar({ theme, onToggleTheme }) {
  const { user, isAdmin, logout } = useAuth()
  const { cartCount }             = useCart()
  const navigate                  = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      {/* ── Left ── */}
      <div className="navbar-left">
        {user && (
          <Link to="/" className="nav-link">🏠 Home</Link>
        )}
        {user && !isAdmin && (
          <Link to="/orders" className="nav-link">📦 Orders</Link>
        )}
        {isAdmin && (
          <>
            <Link to="/admin/products" className="nav-link admin-link">🛠 Products</Link>
            <Link to="/admin/orders"   className="nav-link admin-link">📋 Orders</Link>
          </>
        )}
      </div>

      {/* ── Center ── */}
      <div className="navbar-center">
        <Link to="/" className="navbar-brand" style={{ textDecoration: 'none' }}>
          <div className="brand-icon">🛍️</div>
          <div className="brand-text">
            <h1>ShopSphere</h1>
            <p className="navbar-quote">"Quality products, delivered to your door."</p>
          </div>
        </Link>
      </div>

      {/* ── Right ── */}
      <div className="navbar-right">
        {user && !isAdmin && (
          <Link to="/cart">
            <button className="cart-btn">
              🛒 Cart
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </button>
          </Link>
        )}

        {!user && (
          <>
            <Link to="/login"    className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </>
        )}

        {/* ── Notification Bell — visible to all logged-in users ── */}
        {user && <NotificationBell />}

        {/* ── Profile avatar + name link ── */}
        {user && (
          <Link to="/profile" className="nav-profile-link" title="My Profile">
            <UserAvatar user={user} />
            <span className="nav-username">{user.name}</span>
          </Link>
        )}

        {user && (
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        )}

        <button
          className="dark-toggle"
          onClick={onToggleTheme}
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>
    </nav>
  )
}
