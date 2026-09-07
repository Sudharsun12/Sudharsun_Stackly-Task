import { useState, useEffect } from 'react'
import api from '../../api'

const STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']

function fmt(dateStr) {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export default function AdminOrders() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/orders')
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false))
  }, [])

  async function handleStatus(orderId, status) {
    await api.put(`/api/orders/${orderId}/status`, { status })
    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status } : o)
    )
  }

  return (
    <main>
      <div className="page">
        <h1 className="page-title">📋 All Orders</h1>

        {loading ? (
          <div className="empty-state"><p>Loading orders…</p></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <p>No orders yet.</p>
          </div>
        ) : (
          orders.map(order => (
            <div className="order-card" key={order.id}>
              <div className="order-header">
                <div>
                  <p className="order-id">Order #{order.id}</p>
                  <p className="order-date">{fmt(order.ordered_at)}</p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    👤 {order.customer_name} &nbsp;·&nbsp; {order.customer_email}
                  </p>
                </div>

                {/* Inline status dropdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end' }}>
                  <span className={`status-badge status-${order.status}`}>{order.status}</span>
                  <select
                    value={order.status}
                    onChange={e => handleStatus(order.id, e.target.value)}
                    style={{
                      background: 'var(--bg-primary)', border: '1px solid var(--border)',
                      borderRadius: 8, padding: '0.35rem 0.65rem',
                      fontSize: '0.82rem', color: 'var(--text-primary)',
                      fontFamily: 'inherit', cursor: 'pointer', outline: 'none'
                    }}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <p style={{ fontWeight: 800, fontSize: '1.05rem' }} className="product-card-price">
                  ₹{Number(order.total_amount).toLocaleString('en-IN')}
                </p>
              </div>

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
