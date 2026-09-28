import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import { useCart } from '../context/CartContext'

export default function ProductDetail() {
  const { id }           = useParams()
  const navigate         = useNavigate()
  const { addToCart }    = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty,     setQty]     = useState(1)
  const [added,   setAdded]   = useState(false)

  useEffect(() => {
    api.get(`/api/products/${id}`)
      .then(r => { setProduct(r.data); setLoading(false) })
      .catch(() => { setLoading(false) })
  }, [id])

  function handleAdd() {
    addToCart(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) return (
    <div className="page">
      <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
    </div>
  )

  if (!product) return (
    <div className="page">
      <div className="empty-state">
        <span className="empty-icon">😕</span>
        <p>Product not found.</p>
        <button className="btn btn-outline" onClick={() => navigate('/')}>← Back to Shop</button>
      </div>
    </div>
  )

  const outOfStock = product.stock === 0

  return (
    <main>
      <div className="page">
        <button className="btn btn-outline btn-sm" style={{ marginBottom: '1.5rem' }} onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="detail-grid">
          {/* Image */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <img
              src={product.image_url || 'https://picsum.photos/600/400'}
              alt={product.name}
              style={{ width: '100%', height: 380, objectFit: 'cover' }}
            />
          </div>

          {/* Info */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <span className="cat-pill">{product.category_name}</span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.3 }}>
              {product.name}
            </h1>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              {product.description}
            </p>
            <p style={{ fontSize: '2rem', fontWeight: 800 }} className="product-card-price">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </p>

            {/* Stock */}
            {outOfStock ? (
              <span className="stock-badge out-stock" style={{ alignSelf: 'flex-start', padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                ❌ Out of Stock
              </span>
            ) : (
              <span className="stock-badge in-stock" style={{ alignSelf: 'flex-start', padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                ✅ {product.stock} in stock
              </span>
            )}

            {/* Qty + Add */}
            {!outOfStock && (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                  <span className="qty-num">{qty}</span>
                  <button className="qty-btn" onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
                </div>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAdd}>
                  {added ? '✅ Added!' : '🛒 Add to Cart'}
                </button>
              </div>
            )}
          </div>
        </div>

        <style>{`
          @media (max-width: 700px) {
            .detail-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </main>
  )
}
