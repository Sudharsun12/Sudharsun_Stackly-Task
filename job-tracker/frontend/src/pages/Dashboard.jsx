import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ApplicationCard from '../components/ApplicationCard'
import api from '../api'

const STATUS_LIST = [
  'Applied',
  'Shortlisted',
  'Interview Scheduled',
  'Offer Received',
  'Rejected',
]

const STATUS_STYLES = {
  'Applied':              { cls: 'stat-applied',  emoji: '📤' },
  'Shortlisted':          { cls: 'stat-short',    emoji: '⭐' },
  'Interview Scheduled':  { cls: 'stat-interview',emoji: '🗓️' },
  'Offer Received':       { cls: 'stat-offer',    emoji: '🎉' },
  'Rejected':             { cls: 'stat-rejected', emoji: '❌' },
}

export default function Dashboard() {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    api.get('/api/applications/stats')
      .then(res => setStats(res.data))
      .catch(() => setError('Failed to load dashboard stats.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-content">

        <div className="page-header">
          <h1>📊 Dashboard</h1>
          <p>Your job search overview at a glance</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading-wrap">
            <div className="spinner" />
            <span>Loading stats…</span>
          </div>
        ) : stats && (
          <>
            {/* ── Stat Cards ─────────────────────────────────────── */}
            <div className="stats-grid">
              {/* Total */}
              <div className="stat-card stat-total" style={{ animationDelay: '0ms' }}>
                <div className="stat-number">{stats.total}</div>
                <div className="stat-label">Total Applications</div>
              </div>

              {/* Per status */}
              {STATUS_LIST.map((status, i) => {
                const { cls, emoji } = STATUS_STYLES[status]
                return (
                  <div
                    key={status}
                    className={`stat-card ${cls}`}
                    style={{ animationDelay: `${(i + 1) * 60}ms` }}
                  >
                    <div className="stat-number">
                      {stats.status_counts[status] || 0}
                    </div>
                    <div className="stat-label">{emoji} {status}</div>
                  </div>
                )
              })}
            </div>

            {/* ── Latest Applications ─────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
              <div>
                <div className="section-title">🕐 Latest Applications</div>
                <div className="card">
                  {stats.latest.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📭</div>
                      <h3>No applications yet</h3>
                      <p>
                        <Link to="/add" style={{ color: 'var(--accent-light)' }}>
                          Add your first application →
                        </Link>
                      </p>
                    </div>
                  ) : (
                    stats.latest.map(app => (
                      <ApplicationCard key={app.id} app={app} />
                    ))
                  )}
                </div>
              </div>

              {/* ── Quick Actions ───────────────────────────────────── */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link to="/add" className="btn btn-primary" style={{ width: 'auto' }}>
                  ➕ Add Application
                </Link>
                <Link to="/applications" className="btn btn-secondary">
                  📋 View All Applications
                </Link>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
