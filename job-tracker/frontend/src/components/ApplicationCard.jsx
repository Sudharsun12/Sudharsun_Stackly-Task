/**
 * Returns the CSS class for a status badge.
 */
export function getStatusClass(status) {
  const map = {
    'Applied':              'badge-applied',
    'Shortlisted':          'badge-shortlisted',
    'Interview Scheduled':  'badge-interview',
    'Offer Received':       'badge-offer',
    'Rejected':             'badge-rejected',
  }
  return map[status] || 'badge-applied'
}

/**
 * ApplicationCard — shown in the latest-apps list on Dashboard.
 */
export default function ApplicationCard({ app }) {
  return (
    <div className="latest-row">
      <div className="latest-info">
        <div className="latest-company">{app.company}</div>
        <div className="latest-role">{app.role}</div>
      </div>
      <div className="latest-meta">
        <span className={`badge ${getStatusClass(app.status)}`}>{app.status}</span>
        <div className="latest-date">{app.applied_on}</div>
      </div>
    </div>
  )
}
