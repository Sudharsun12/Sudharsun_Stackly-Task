import { useStats } from '../hooks/useTasks'
import { Skeleton } from './Skeleton'

export function StatsPanel() {
  const { data, isLoading, isError, error } = useStats()

  if (isLoading) {
    return (
      <div className="stats-essential-grid">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="essential-card skeleton-stat">
            <Skeleton height={20} width={60} />
            <Skeleton height={36} width={80} />
            <Skeleton height={14} width={120} />
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="state-box state-error">
        <p>Could not load metrics: {error.message}</p>
      </div>
    )
  }

  if (!data) return null

  const completionRate = data.total > 0 ? Math.round((data.by_status.done / data.total) * 100) : 0

  return (
    <section className="stats-essential-section" aria-label="Essential Metrics">
      <div className="stats-live-bar">
        <span className="stats-section-label">Key Performance Indicators</span>
      </div>

      <div className="stats-essential-grid">
        {/* 1. Total Workload */}
        <div className="essential-card card-total">
          <div className="card-top">
            <span className="card-label">Total Workload</span>
            <span className="card-icon" aria-hidden="true">📊</span>
          </div>
          <div className="card-main-val">
            <strong>{data.total}</strong>
            <span className="card-unit">tasks</span>
          </div>
          <div className="card-sub-info">
            <span className="badge-pill">{data.by_status.in_progress} in progress</span>
            <span className="badge-pill">{data.by_status.todo} to do</span>
          </div>
        </div>

        {/* 2. Completed & Completion Rate */}
        <div className="essential-card card-completed">
          <div className="card-top">
            <span className="card-label">Completed</span>
            <span className="card-icon" aria-hidden="true">✅</span>
          </div>
          <div className="card-main-val">
            <strong>{data.by_status.done}</strong>
            <span className="card-rate-pill">{completionRate}% Done</span>
          </div>
          <div className="card-progress-bar" title={`${completionRate}% complete`}>
            <div className="card-progress-fill" style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        {/* 3. Overdue Attention */}
        <div className={`essential-card card-overdue ${data.overdue > 0 ? 'has-overdue' : ''}`}>
          <div className="card-top">
            <span className="card-label">Overdue Alerts</span>
            <span className="card-icon" aria-hidden="true">🚨</span>
          </div>
          <div className="card-main-val">
            <strong className={data.overdue > 0 ? 'text-danger' : 'text-good'}>{data.overdue}</strong>
            <span className={`card-status-note ${data.overdue > 0 ? 'note-alert' : 'note-good'}`}>
              {data.overdue > 0 ? 'Needs attention' : 'Deadlines on track'}
            </span>
          </div>
          <div className="card-sub-info">
            <span className="sub-caption">Auto-calculated by due dates</span>
          </div>
        </div>

        {/* 4. Weekly Momentum */}
        <div className="essential-card card-velocity">
          <div className="card-top">
            <span className="card-label">Closed This Week</span>
            <span className="card-icon" aria-hidden="true">🚀</span>
          </div>
          <div className="card-main-val">
            <strong>{data.completed_this_week}</strong>
            <span className="card-unit">resolved</span>
          </div>
          <div className="card-sub-info">
            <span className="sub-caption">Rolling 7-day velocity</span>
          </div>
        </div>
      </div>
    </section>
  )
}
