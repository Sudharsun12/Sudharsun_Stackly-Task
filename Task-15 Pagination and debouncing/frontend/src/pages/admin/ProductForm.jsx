import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api'

export default function ProductForm() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const isEdit   = Boolean(id)

  // ── Categories ────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState([])

  // ── Product text fields ───────────────────────────────────────────────────
  const [form, setForm] = useState({
    name: '', description: '', price: '', stock: '', category_id: ''
  })

  // ── Image upload state ────────────────────────────────────────────────────
  // file           → the File object selected by the admin
  // preview        → a local blob URL shown instantly (no network call needed)
  // existingImgUrl → the image_url already stored in DB (used in edit mode)
  const [file,           setFile]           = useState(null)
  const [preview,        setPreview]        = useState(null)
  const [existingImgUrl, setExistingImgUrl] = useState('')

  // ── UI state ──────────────────────────────────────────────────────────────
  const [error,        setError]        = useState('')
  const [uploadStatus, setUploadStatus] = useState('')   // "Uploading…", "Image uploaded!" etc.
  const [loading,      setLoading]      = useState(false)

  // ── On mount: load categories + product data (edit mode) ─────────────────
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
        })
        // Store the existing image URL so we can keep it if no new file is chosen
        setExistingImgUrl(p.image_url || '')
      })
    }
  }, [id, isEdit])

  // ── Generic field change handler ──────────────────────────────────────────
  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  // ── File picker handler ───────────────────────────────────────────────────
  // This runs the moment the admin picks a file — NO network call yet.
  // URL.createObjectURL() reads the file directly from memory and creates
  // a temporary local URL so the preview shows up instantly.
  function handleFileChange(e) {
    const selected = e.target.files[0]
    if (!selected) return
    setFile(selected)
    // Revoke any previous blob URL to free memory, then create new one
    if (preview) URL.revokeObjectURL(preview)
    setPreview(URL.createObjectURL(selected))
    setUploadStatus('')
  }

  // ── Submit handler — two steps ────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()

    if (!form.name || !form.price || !form.stock) {
      setError('Name, price, and stock are required.')
      return
    }

    setLoading(true)
    setError('')
    setUploadStatus('')

    try {
      // ── STEP 1: Upload the image if a new file was selected ───────────────
      // If the admin didn't pick a new file (edit mode), keep the existing URL
      let finalImageUrl = existingImgUrl

      if (file) {
        // FormData is the standard way to send a file over HTTP
        // It encodes the request as multipart/form-data (not JSON)
        const formData = new FormData()
        formData.append('image', file)   // 'image' must match request.files['image'] in Flask

        setUploadStatus('⏳ Uploading image...')

        const uploadRes = await api.post('/api/upload', formData, {
          // Tell the browser this is a file upload, not JSON
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        finalImageUrl = uploadRes.data.image_url   // e.g. /static/uploads/a3f8b2.jpg
        setUploadStatus('✅ Image uploaded!')
      }

      // ── STEP 2: Save the product with the image URL ───────────────────────
      const payload = {
        ...form,
        price:       parseFloat(form.price),
        stock:       parseInt(form.stock),
        category_id: form.category_id || null,
        image_url:   finalImageUrl,   // the path returned from Flask upload
      }

      if (isEdit) {
        await api.put(`/api/products/${id}`, payload)
      } else {
        await api.post('/api/products', payload)
      }

      navigate('/admin/products')

    } catch (err) {
      // Show specific error if upload failed, generic if product save failed
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
      setUploadStatus('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <div className="page" style={{ maxWidth: 640 }}>
        <button
          className="btn btn-outline btn-sm"
          style={{ marginBottom: '1.5rem' }}
          onClick={() => navigate('/admin/products')}
        >
          ← Back to Products
        </button>

        <h1 className="page-title">{isEdit ? '✏️ Edit Product' : '➕ Add New Product'}</h1>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>

            {/* ── Product Name ── */}
            <div className="form-group">
              <label>Product Name *</label>
              <input
                placeholder="e.g. Wireless Headphones"
                value={form.name}
                onChange={set('name')}
                required
              />
            </div>

            {/* ── Description ── */}
            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="Brief product description…"
                value={form.description}
                onChange={set('description')}
              />
            </div>

            {/* ── Price + Stock ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Price (₹) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.price}
                  onChange={set('price')}
                  required
                />
              </div>
              <div className="form-group">
                <label>Stock *</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.stock}
                  onChange={set('stock')}
                  required
                />
              </div>
            </div>

            {/* ── Category ── */}
            <div className="form-group">
              <label>Category</label>
              <select value={form.category_id} onChange={set('category_id')}>
                <option value="">— Select Category —</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* ── Image Upload (replaces the old text URL input) ── */}
            <div className="form-group">
              <label>Product Image</label>

              {/* File picker — only accepts image files */}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ padding: '0.4rem 0' }}
              />

              {/* Upload status message ("Uploading…" / "Image uploaded!") */}
              {uploadStatus && (
                <p style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {uploadStatus}
                </p>
              )}

              {/*
                Preview logic:
                - If admin just picked a new file → show blob preview (preview state)
                - Else if in edit mode and product has an existing image → show it from Flask
                - Otherwise → show nothing
              */}
              {preview ? (
                // New file selected — show instant local preview (no upload yet)
                <div style={{ marginTop: '0.75rem' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    New image preview:
                  </p>
                  <img
                    src={preview}
                    alt="New image preview"
                    style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 10 }}
                  />
                </div>
              ) : existingImgUrl ? (
                // Edit mode — no new file picked yet, show the currently stored image
                <div style={{ marginTop: '0.75rem' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    Current image (pick a new file above to replace it):
                  </p>
                  <img
                    src={`http://localhost:5000${existingImgUrl}`}
                    alt="Current product image"
                    style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 10 }}
                  />
                </div>
              ) : null}
            </div>

            {/* ── Submit Button ── */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading
                ? (file && !uploadStatus.includes('✅') ? '⏳ Uploading…' : '💾 Saving…')
                : isEdit
                  ? '✅ Update Product'
                  : '✅ Add Product'}
            </button>

          </form>
        </div>
      </div>
    </main>
  )
}
