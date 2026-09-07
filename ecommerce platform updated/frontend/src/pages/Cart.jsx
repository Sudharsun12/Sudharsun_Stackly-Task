import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { cartItems, removeFromCart, updateQty, cartTotal } = useCart()

  if (cartItems.length === 0) return (
    <main>
      <div className="page">
        <h1 className="page-title">🛒 Your Cart</h1>
        <div className="empty-state">
          <span className="empty-icon">🛒</span>
          <p>Your cart is empty.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Browse Products
          </Link>
        </div>
      </div>
    </main>
  )

  return (
    <main>
      <div className="page">
        <h1 className="page-title">🛒 Your Cart</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}
             className="cart-layout">

          {/* Items */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {cartItems.map((item, idx) => (
              <div key={item.id} style={{
                display: 'flex', gap: '1rem', padding: '1.25rem',
                borderBottom: idx < cartItems.length - 1 ? '1px solid var(--border)' : 'none',
                alignItems: 'center'
              }}>
                <img
                  src={item.image_url || 'https://picsum.photos/80/80'}
                  alt={item.name}
                  style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{item.name}</p>
                  <span className="cat-pill">{item.category_name}</span>
                  <p style={{ fontWeight: 800, marginTop: '0.4rem' }} className="product-card-price">
                    ₹{Number(item.price).toLocaleString('en-IN')}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                    <span className="qty-num">{item.qty}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Subtotal: ₹{(item.price * item.qty).toLocaleString('en-IN')}
                  </p>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => removeFromCart(item.id)}
                  >
                    🗑 Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="card">
            <p className="card-title"><span className="dot" />Order Summary</p>
            {cartItems.map(item => (
              <div className="summary-row" key={item.id}>
                <span style={{ fontSize: '0.85rem' }}>{item.name} × {item.qty}</span>
                <span style={{ fontWeight: 600 }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div className="summary-row" style={{ marginTop: '0.5rem' }}>
              <span style={{ fontWeight: 700 }}>Grand Total</span>
              <span className="summary-total">₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <Link to="/checkout">
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.25rem' }}>
                Proceed to Checkout →
              </button>
            </Link>
            <Link to="/">
              <button className="btn btn-outline" style={{ width: '100%', marginTop: '0.6rem' }}>
                ← Continue Shopping
              </button>
            </Link>
          </div>
        </div>

        <style>{`
          @media (max-width: 760px) {
            .cart-layout { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </main>
  )
}
