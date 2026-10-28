import { useStats } from '../hooks/useTasks'
import { Skeleton } from './Skeleton'

export function StatsPanel() {
  const { data, isLoading, isError, error, isFetching, dataUpdatedAt } = useStats()

  if (isLoading) {
    return (
      <div className="stats">
        {Array.from({ length: 6 }, (_, i) => <div key={i} className="stat"><Skeleton height={34} width={60} /><Skeleton height={12} width={90} /></div>)}
      </div>
    )
  }
  if (isError) return <div className="state-box state-error">Could not load stats: {error.message}</div>
  if (!data) return null

  const items: { label: string; value: number; tone?: string }[] = [
    { label: 'Total tasks', value: data.total },
    { label: 'To do', value: data.by_status.todo },
    { label: 'In progress', value: data.by_status.in_progress },
    { label: 'Done', value: data.by_status.done },
    { label: 'Overdue', value: data.overdue, tone: data.overdue > 0 ? 'danger' : undefined },
    { label: 'Completed this week', value: data.completed_this_week, tone: 'good' },
  ]

  return (
    <section aria-label="Task statistics">
      <div className="stats">
        {items.map((s) => (
          <div key={s.label} className={`stat ${s.tone ? `stat-${s.tone}` : ''}`}>
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
      <p className="live-note">
        <span className={`dot ${isFetching ? 'dot-busy' : ''}`} />
        {isFetching ? 'Refreshing…' : `Live — refreshes every 10s, last updated ${new Date(dataUpdatedAt).toLocaleTimeString()}`}
      </p>
    </section>
  )
}
