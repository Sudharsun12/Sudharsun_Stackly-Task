import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api'

export default function ProductForm() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const isEdit       = Boolean(id)

  const [categories, setCategories] = useState([])
  const [form,       setForm]       = useState({
    name: '', description: '', price: '', stock: '', category_id: '', image_url: ''
  })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/api/categories').then(r => setCategories(r.data))
    if (isEdit) {
      api.get(`/api/products/${id}`).then(r => {
        const p = r.data
        setForm({
          name:        p.name,
          description: p.description || '',
          price:       p.price,
          stock:       p.stock,
          category_id: p.category_id || '',
          image_url:   p.image_url || '',
        })
      })
    }
  }, [id, isEdit])

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.price || !form.stock) {
      setError('Name, price, and stock are required.'); return
    }
    setLoading(true); setError('')
    try {
      const payload = {
        ...form,
        price:       parseFloat(form.price),
        stock:       parseInt(form.stock),
        category_id: form.category_id || null,
      }
      if (isEdit) {
        await api.put(`/api/products/${id}`, payload)
      } else {
        await api.post('/api/products', payload)
      }
      navigate('/admin/products')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <div className="page" style={{ maxWidth: 640 }}>
        <button className="btn btn-outline btn-sm" style={{ marginBottom: '1.5rem' }} onClick={() => navigate('/admin/products')}>
          ← Back to Products
        </button>

        <h1 className="page-title">{isEdit ? '✏️ Edit Product' : '➕ Add New Product'}</h1>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Product Name *</label>
              <input placeholder="e.g. Wireless Headphones" value={form.name} onChange={set('name')} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea placeholder="Brief product description…" value={form.description} onChange={set('description')} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Price (₹) *</label>
                <input type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={set('price')} required />
              </div>
              <div className="form-group">
                <label>Stock *</label>
                <input type="number" min="0" placeholder="0" value={form.stock} onChange={set('stock')} required />
              </div>
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={form.category_id} onChange={set('category_id')}>
                <option value="">— Select Category —</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Image URL</label>
              <input placeholder="https://…" value={form.image_url} onChange={set('image_url')} />
              {form.image_url && (
                <img src={form.image_url} alt="preview" style={{ marginTop: '0.5rem', width: '100%', height: 140, objectFit: 'cover', borderRadius: 10 }} />
              )}
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Saving…' : isEdit ? '✅ Update Product' : '✅ Add Product'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
