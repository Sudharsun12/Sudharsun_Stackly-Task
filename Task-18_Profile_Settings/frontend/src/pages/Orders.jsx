import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../api'

function fmt(dateStr) {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export default function Orders() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const location              = useLocation()
  const justOrdered           = location.state?.success

  useEffect(() => {
    api.get('/api/orders/my')
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main>
      <div className="page">
        <h1 className="page-title">📦 My Orders</h1>

        {justOrdered && (
          <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
            🎉 Your order was placed successfully! We'll get it to you soon.
          </div>
        )}

        {loading ? (
          <div className="empty-state"><p>Loading orders…</p></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📦</span>
            <p>You haven't placed any orders yet.</p>
          </div>
        ) : (
          orders.map(order => (
            <div className="order-card" key={order.id}>
              <div className="order-header">
                <div>
                  <p className="order-id">Order #{order.id}</p>
                  <p className="order-date">{fmt(order.ordered_at)}</p>
                </div>
                <span className={`status-badge status-${order.status}`}>{order.status}</span>
                <p style={{ fontWeight: 800, fontSize: '1.05rem' }} className="product-card-price">
                  ₹{Number(order.total_amount).toLocaleString('en-IN')}
                </p>
              </div>

              {/* Items */}
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, i) => (
                      <tr key={i}>
                        <td>{item.product_name}</td>
                        <td>{item.quantity}</td>
                        <td>₹{Number(item.unit_price).toLocaleString('en-IN')}</td>
                        <td style={{ fontWeight: 600 }}>
                          ₹{(item.unit_price * item.quantity).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                📍 {order.address}
              </p>
            </div>
          ))
        )}
      </div>
    </main>
  )
}
