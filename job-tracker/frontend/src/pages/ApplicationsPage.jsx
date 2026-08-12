import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getStatusClass } from '../components/ApplicationCard'
import api from '../api'

const STATUSES = [
  'All',
  'Applied',
  'Shortlisted',
  'Interview Scheduled',
  'Offer Received',
  'Rejected',
]

export default function ApplicationsPage() {
  const [apps,    setApps]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  // Filter + Search state (BONUS features)
  const [filterStatus, setFilterStatus] = useState('All')
  const [search,       setSearch]       = useState('')
  const [sortBy,       setSortBy]       = useState('date-desc')

  // ─── Load applications ─────────────────────────────────────────────
  const loadApps = () => {
    setLoading(true)
    api.get('/api/applications')
      .then(res => setApps(res.data.applications))
      .catch(() => setError('Failed to load applications.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadApps() }, [])

  // ─── Delete ────────────────────────────────────────────────────────
  const handleDelete = async (id, company) => {
    if (!window.confirm(`Delete application for "${company}"?`)) return
    try {
      await api.delete(`/api/applications/${id}`)
      setApps(prev => prev.filter(a => a.id !== id))
    } catch {
      alert('Failed to delete. Please try again.')
    }
  }

  // ─── Filter + Search + Sort ────────────────────────────────────────
  const filtered = apps
    .filter(a => filterStatus === 'All' || a.status === filterStatus)
    .filter(a => {
      const q = search.toLowerCase()
      return (
        a.company.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q)    ||
        (a.location || '').toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.applied_on) - new Date(a.applied_on)
      if (sortBy === 'date-asc')  return new Date(a.applied_on) - new Date(b.applied_on)
      if (sortBy === 'company')   return a.company.localeCompare(b.company)
      if (sortBy === 'status')    return a.status.localeCompare(b.status)
      return 0
    })

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-content">

        <div className="page-header">
          <h1>📋 Applications</h1>
          <p>
            {apps.length} total application{apps.length !== 1 ? 's' : ''}
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* ── Toolbar ─────────────────────────────────────────────── */}
        <div className="toolbar">
          <input
            id="app-search"
            className="search-input"
            type="text"
            placeholder="🔍  Search company, role, location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <select
            id="filter-status"
            className="filter-select"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            {STATUSES.map(s => (
              <option key={s} value={s}>{s === 'All' ? '📂 All Status' : s}</option>
            ))}
          </select>

          <select
            id="sort-by"
            className="filter-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="company">Company A–Z</option>
            <option value="status">Status</option>
          </select>

          <Link to="/add" className="btn btn-primary" style={{ width: 'auto', whiteSpace: 'nowrap' }}>
            ➕ Add New
          </Link>
        </div>

        {/* ── Table ───────────────────────────────────────────────── */}
        {loading ? (
          <div className="loading-wrap">
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>{search || filterStatus !== 'All' ? 'No results found' : 'No applications yet'}</h3>
              <p>
                {search || filterStatus !== 'All'
                  ? 'Try changing your search or filter.'
                  : <Link to="/add" style={{ color: 'var(--accent-light)' }}>Add your first application →</Link>
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="card table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Company / Role</th>
                  <th>Status</th>
                  <th>Applied On</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(app => (
                  <tr key={app.id}>
                    <td>
                      <div className="company-name">{app.company}</div>
                      <div className="role-name">{app.role}</div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusClass(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td>
                      <span className="date-text">{app.applied_on}</span>
                    </td>
                    <td>
                      <span className="date-text">{app.location || '—'}</span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <Link
                          to={`/edit/${app.id}`}
                          state={{ app }}
                          className="btn btn-edit btn-sm"
                          id={`edit-btn-${app.id}`}
                        >
                          ✏️ Edit
                        </Link>
                        <button
                          className="btn btn-danger btn-sm"
                          id={`delete-btn-${app.id}`}
                          onClick={() => handleDelete(app.id, app.company)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
