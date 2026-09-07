import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

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
