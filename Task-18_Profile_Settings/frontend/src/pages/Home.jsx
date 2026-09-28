import { useState, useEffect } from 'react'
import api from '../api'
import ProductCard from '../components/ProductCard'

export default function Home() {
  const [products,   setProducts]   = useState([])
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [category,   setCategory]   = useState('')
  const [sort,       setSort]       = useState('newest')

  useEffect(() => {
    api.get('/api/categories').then(r => setCategories(r.data))
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search)   params.set('search',   search)
    if (category) params.set('category', category)
    if (sort)     params.set('sort',     sort)

    const timer = setTimeout(() => {
      api.get(`/api/products?${params}`)
        .then(r => setProducts(r.data))
        .finally(() => setLoading(false))
    }, 350)
    return () => clearTimeout(timer)
  }, [search, category, sort])

  return (
    <main>
      <div className="page">
        {/* ── Filter Bar ── */}
        <div className="filter-bar">
          <div className="filter-group" style={{ flex: 2, minWidth: 200 }}>
            <label>Search</label>
            <input
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Sort By</label>
            <select value={sort} onChange={e => setSort(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
            </select>
          </div>
          {(search || category) && (
            <div className="filter-group" style={{ justifyContent: 'flex-end' }}>
              <label style={{ visibility: 'hidden' }}>x</label>
              <button
                className="btn btn-outline"
                onClick={() => { setSearch(''); setCategory(''); }}
              >
                ✕ Clear
              </button>
            </div>
          )}
        </div>

        {/* ── Results ── */}
        <p className="section-label">
          {loading ? 'Loading…' : `${products.length} product${products.length !== 1 ? 's' : ''} found`}
        </p>

        {loading ? (
          <div className="product-grid">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="product-card">
                <div className="skeleton" style={{ height: 180 }} />
                <div className="product-card-body">
                  <div className="skeleton skeleton-text" style={{ width: '60%' }} />
                  <div className="skeleton skeleton-text" style={{ width: '90%' }} />
                  <div className="skeleton skeleton-text" style={{ width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <p>No products found. Try a different search.</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </main>
  )
}
