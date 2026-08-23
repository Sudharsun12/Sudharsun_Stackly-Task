import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [summary,  setSummary]  = useState(null)
  const navigate                = useNavigate()

  function fetchProducts() {
    api.get('/api/products')
      .then(r => setProducts(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchProducts()
    api.get('/api/admin/summary').then(r => setSummary(r.data)).catch(() => {})
  }, [])

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    await api.delete(`/api/products/${id}`)
    fetchProducts()
  }

  return (
    <main>
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 className="page-title" style={{ margin: 0 }}>🛠 Product Management</h1>
          <Link to="/admin/products/add">
            <button className="btn btn-primary">+ Add New Product</button>
          </Link>
        </div>

        {/* ── Admin Summary ── */}
        {summary && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
            {[
              { label: 'Total Orders',   value: summary.total_orders,                       icon: '📦' },
              { label: 'Total Revenue',  value: `₹${Number(summary.total_revenue).toLocaleString('en-IN')}`, icon: '💰' },
              { label: 'Total Products', value: products.length,                             icon: '🏷️' },
            ].map(kpi => (
              <div key={kpi.label} className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                <p style={{ fontSize: '1.75rem' }}>{kpi.icon}</p>
                <p style={{ fontWeight: 800, fontSize: '1.3rem', marginTop: '0.25rem' }}>{kpi.value}</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{kpi.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div className="empty-state" style={{ padding: '2rem' }}><p>Loading…</p></div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{p.id}</td>
                      <td>
                        <img
                          src={p.image_url || 'https://picsum.photos/40/40'}
                          alt={p.name}
                          style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8 }}
                        />
                      </td>
                      <td style={{ fontWeight: 600, maxWidth: 200 }}>{p.name}</td>
                      <td><span className="cat-pill">{p.category_name}</span></td>
                      <td style={{ fontWeight: 700 }}>₹{Number(p.price).toLocaleString('en-IN')}</td>
                      <td>
                        {p.stock < 5 && p.stock > 0 && (
                          <span className="low-stock-dot" title="Low stock!" />
                        )}
                        <span className={p.stock === 0 ? 'stock-badge out-stock' : p.stock < 5 ? 'stock-badge low-stock' : 'stock-badge in-stock'}>
                          {p.stock === 0 ? 'Out' : p.stock}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => navigate(`/admin/products/edit/${p.id}`)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(p.id, p.name)}
                          >
                            🗑 Del
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
