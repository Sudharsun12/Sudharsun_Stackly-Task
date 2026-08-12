import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../api'

const STATUSES = [
  'Applied',
  'Shortlisted',
  'Interview Scheduled',
  'Offer Received',
  'Rejected',
]

const EMPTY = {
  company:    '',
  role:       '',
  status:     'Applied',
  applied_on: new Date().toISOString().split('T')[0],
  location:   '',
  job_url:    '',
  notes:      '',
}

export default function AddApplicationPage() {
  const navigate = useNavigate()
  const [form,    setForm]    = useState(EMPTY)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/api/applications', form)
      navigate('/applications')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add application.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-content">

        <div className="page-header">
          <h1>➕ Add Application</h1>
          <p>Track a new job you've applied to</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-card">
          <form onSubmit={handleSubmit} id="add-app-form">
            <div className="form-grid">

              <div className="form-group">
                <label htmlFor="add-company">Company *</label>
                <input
                  id="add-company"
                  name="company"
                  type="text"
                  placeholder="e.g. Google"
                  value={form.company}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="add-role">Role / Position *</label>
                <input
                  id="add-role"
                  name="role"
                  type="text"
                  placeholder="e.g. Software Engineer"
                  value={form.role}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="add-status">Status</label>
                <select
                  id="add-status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="add-date">Applied On *</label>
                <input
                  id="add-date"
                  name="applied_on"
                  type="date"
                  value={form.applied_on}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="add-location">Location</label>
                <input
                  id="add-location"
                  name="location"
                  type="text"
                  placeholder="e.g. Bangalore, Remote"
                  value={form.location}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="add-url">Job URL</label>
                <input
                  id="add-url"
                  name="job_url"
                  type="url"
                  placeholder="https://…"
                  value={form.job_url}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="add-notes">Notes</label>
                <textarea
                  id="add-notes"
                  name="notes"
                  placeholder="Referral details, recruiter name, interview rounds…"
                  value={form.notes}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <Link to="/applications" className="btn btn-secondary">Cancel</Link>
              <button
                id="add-submit"
                type="submit"
                className="btn btn-primary"
                style={{ width: 'auto' }}
                disabled={loading}
              >
                {loading ? 'Saving…' : '✓ Add Application'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
