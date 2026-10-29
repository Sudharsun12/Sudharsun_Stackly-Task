import { useStats } from '../hooks/useTasks'
import { Skeleton } from './Skeleton'

export function StatsPanel() {
  const { data, isLoading, isError, error, isFetching, dataUpdatedAt } = useStats()

  if (isLoading) {
    return (
      <div className="stats-grid">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="stat-card skeleton-stat">
            <Skeleton height={28} width={40} />
            <Skeleton height={14} width={80} />
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="state-box state-error">
        <p>Could not load live metrics: {error.message}</p>
      </div>
    )
  }

  if (!data) return null

  const items = [
    {
      label: 'Total Tasks',
      value: data.total,
      icon: '📊',
      variant: 'primary',
      description: 'Active workload',
    },
    {
      label: 'To Do',
      value: data.by_status.todo,
      icon: '📌',
      variant: 'todo',
      description: 'Pending kickoff',
    },
    {
      label: 'In Progress',
      value: data.by_status.in_progress,
      icon: '⚡',
      variant: 'in-progress',
      description: 'Active execution',
    },
    {
      label: 'Completed',
      value: data.by_status.done,
      icon: '✅',
      variant: 'done',
      description: 'Successfully finished',
    },
    {
      label: 'Overdue',
      value: data.overdue,
      icon: '🚨',
      variant: data.overdue > 0 ? 'overdue' : 'neutral',
      description: data.overdue > 0 ? 'Requires attention' : 'All deadlines on track',
    },
    {
      label: 'Done This Week',
      value: data.completed_this_week,
      icon: '🏆',
      variant: 'weekly',
      description: 'Weekly momentum',
    },
  ]

  return (
    <section className="stats-section" aria-label="Task Analytics">
      <div className="stats-header">
        <div className="stats-title-block">
          <h3>Workplace Metrics</h3>
          <p className="stats-sub">Auto-synchronized with backend server state</p>
        </div>
        <div className="stats-live-badge">
          <span className={`live-pulse-dot ${isFetching ? 'is-fetching' : ''}`} />
          <span>{isFetching ? 'Syncing…' : `Live (every 10s) · ${new Date(dataUpdatedAt).toLocaleTimeString()}`}</span>
        </div>
      </div>

      <div className="stats-grid">
        {items.map((stat) => (
          <div key={stat.label} className={`stat-card stat-${stat.variant}`}>
            <div className="stat-top">
              <span className="stat-icon" aria-hidden="true">{stat.icon}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
            <div className="stat-value-wrap">
              <strong className="stat-number">{stat.value}</strong>
            </div>
            <span className="stat-desc">{stat.description}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
