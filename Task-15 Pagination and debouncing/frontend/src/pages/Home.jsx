import { useState, useEffect } from 'react'
import api from '../api'
import ProductCard from '../components/ProductCard'
import Pagination from '../components/Pagination'
import { useDebounce } from '../hooks/useDebounce'

const LIMIT_OPTIONS = [8, 16, 24]

export default function Home() {
  const [products,     setProducts]     = useState([])
  const [categories,   setCategories]   = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [category,     setCategory]     = useState('')
  const [sort,         setSort]         = useState('newest')
  const [currentPage,  setCurrentPage]  = useState(1)
  const [totalPages,   setTotalPages]   = useState(1)
  const [totalCount,   setTotalCount]   = useState(0)
  const [limit,        setLimit]        = useState(8)

  // Debounce the raw search input — API only fires 300ms after user stops typing
  const debouncedSearch = useDebounce(search, 300)

  // Load categories once on mount
  useEffect(() => {
    api.get('/api/categories').then(r => setCategories(r.data))
  }, [])

  // Reset to page 1 whenever the debounced search term, category, or limit changes
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, category, limit])

  // Fetch products whenever page, debounced search, category, sort, or limit changes
  useEffect(() => {
    setLoading(true)

    const params = new URLSearchParams({
      page:     currentPage,
      limit,
      search:   debouncedSearch,
      category,
      sort,
    })

    api.get(`/api/products?${params}`)
      .then(r => {
        setProducts(r.data.products)
        setTotalPages(r.data.total_pages)
        setTotalCount(r.data.total)
      })
      .finally(() => setLoading(false))
  }, [currentPage, debouncedSearch, category, sort, limit])

  // Scroll to top of page when page number changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  function handlePageChange(newPage) {
    setCurrentPage(newPage)
  }

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

          {/* Items per page selector (Bonus) */}
          <div className="filter-group">
            <label>Per Page</label>
            <select value={limit} onChange={e => setLimit(Number(e.target.value))}>
              {LIMIT_OPTIONS.map(n => (
                <option key={n} value={n}>{n} items</option>
              ))}
            </select>
          </div>

          {(search || category) && (
            <div className="filter-group" style={{ justifyContent: 'flex-end' }}>
              <label style={{ visibility: 'hidden' }}>x</label>
              <button
                className="btn btn-outline"
                onClick={() => { setSearch(''); setCategory('') }}
              >
                ✕ Clear
              </button>
            </div>
          )}
        </div>

        {/* ── Result count ── */}
        <p className="section-label">
          {loading
            ? 'Loading…'
            : totalCount === 0
              ? 'No products found'
              : `Showing ${products.length} of ${totalCount} product${totalCount !== 1 ? 's' : ''}`
          }
        </p>

        {/* ── Product Grid or Skeleton or Empty State ── */}
        {loading ? (
          <div className="product-grid">
            {Array(limit).fill(0).map((_, i) => (
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

        {/* ── Pagination Controls ── */}
        {!loading && products.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}

      </div>
    </main>
  )
}
