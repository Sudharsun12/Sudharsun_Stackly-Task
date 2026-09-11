import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import api from '../api'

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart()
  const navigate                            = useNavigate()
  const [address, setAddress]               = useState('')
  const [error,   setError]                 = useState('')
  const [loading, setLoading]               = useState(false)

  if (cartItems.length === 0) return (
    <main>
      <div className="page">
        <div className="empty-state">
          <span className="empty-icon">🛒</span>
          <p>No items in cart.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Shop Now</Link>
        </div>
      </div>
    </main>
  )

  async function handleOrder() {
    if (!address.trim()) { setError('Please enter a delivery address.'); return }
    setLoading(true); setError('')
    try {
      await api.post('/api/orders', {
        items: cartItems.map(i => ({ product_id: i.id, quantity: i.qty })),
        address: address.trim(),
      })
      clearCart()
      navigate('/orders', { state: { success: true } })
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <div className="page">
        <h1 className="page-title">📦 Checkout</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', alignItems: 'start' }}
             className="checkout-layout">

          {/* Address */}
          <div className="card">
            <p className="card-title"><span className="dot" />Delivery Address</p>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label>Full Delivery Address</label>
              <textarea
                rows={5}
                placeholder="Door No., Street, City, State, PIN code…"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', fontSize: '1rem', padding: '0.8rem' }}
              onClick={handleOrder}
              disabled={loading}
            >
              {loading ? 'Placing Order…' : '✅ Place Order'}
            </button>
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
              <span style={{ fontWeight: 700 }}>Total</span>
              <span className="summary-total">₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 760px) {
            .checkout-layout { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </main>
  )
}
