import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../api'

const STATUSES = [
  'Applied',
  'Shortlisted',
  'Interview Scheduled',
  'Offer Received',
  'Rejected',
]

export default function EditApplicationPage() {
  const { id }      = useParams()
  const location    = useLocation()
  const navigate    = useNavigate()

  // If we navigated from the table with state, pre-fill immediately
  const initial = location.state?.app

  const [form,    setForm]    = useState(null)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(!initial)
  const [saving,  setSaving]  = useState(false)

  // If no state was passed (e.g. direct URL access), fetch from API
  useEffect(() => {
    if (initial) {
      setForm({
        company:    initial.company    || '',
        role:       initial.role       || '',
        status:     initial.status     || 'Applied',
        applied_on: initial.applied_on || '',
        location:   initial.location   || '',
        job_url:    initial.job_url    || '',
        notes:      initial.notes      || '',
      })
      return
    }
    // Fetch all applications and find the one with this id
    api.get('/api/applications')
      .then(res => {
        const found = res.data.applications.find(a => String(a.id) === String(id))
        if (!found) { setError('Application not found.'); return }
        setForm({
          company:    found.company    || '',
          role:       found.role       || '',
          status:     found.status     || 'Applied',
          applied_on: found.applied_on || '',
          location:   found.location   || '',
          job_url:    found.job_url    || '',
          notes:      found.notes      || '',
        })
      })
      .catch(() => setError('Failed to load application.'))
      .finally(() => setLoading(false))
  }, [id, initial])

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await api.put(`/api/applications/${id}`, form)
      navigate('/applications')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update application.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-content">

        <div className="page-header">
          <h1>✏️ Edit Application</h1>
          <p>Update the details for this application</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading-wrap"><div className="spinner" /></div>
        ) : form && (
          <div className="form-card">
            <form onSubmit={handleSubmit} id="edit-app-form">
              <div className="form-grid">

                <div className="form-group">
                  <label htmlFor="edit-company">Company *</label>
                  <input
                    id="edit-company"
                    name="company"
                    type="text"
                    value={form.company}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-role">Role / Position *</label>
                  <input
                    id="edit-role"
                    name="role"
                    type="text"
                    value={form.role}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-status">Status</label>
                  <select
                    id="edit-status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-date">Applied On *</label>
                  <input
                    id="edit-date"
                    name="applied_on"
                    type="date"
                    value={form.applied_on}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-location">Location</label>
                  <input
                    id="edit-location"
                    name="location"
                    type="text"
                    value={form.location}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-url">Job URL</label>
                  <input
                    id="edit-url"
                    name="job_url"
                    type="url"
                    value={form.job_url}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="edit-notes">Notes</label>
                  <textarea
                    id="edit-notes"
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-actions">
                <Link to="/applications" className="btn btn-secondary">Cancel</Link>
                <button
                  id="edit-submit"
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: 'auto' }}
                  disabled={saving}
                >
                  {saving ? 'Saving…' : '✓ Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
