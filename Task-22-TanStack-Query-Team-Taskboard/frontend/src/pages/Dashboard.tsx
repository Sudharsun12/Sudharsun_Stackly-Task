import { useState } from 'react'
import { Link } from 'react-router-dom'
import { StatsPanel } from '../components/StatsPanel'
import { FilterBar } from '../components/FilterBar'
import { TaskCard } from '../components/TaskCard'
import { TaskListSkeleton } from '../components/Skeleton'
import { useTasks } from '../hooks/useTasks'
import type { TaskPriority, TaskStatus } from '../types'

export default function Dashboard() {
  const [status, setStatus] = useState<TaskStatus | ''>('')
  const [priority, setPriority] = useState<TaskPriority | ''>('')

  // StatsPanel runs its own useQuery(['stats']) — it and this tasks query fire in parallel.
  const { data, isLoading, isError, error, refetch } = useTasks({ status, priority, page: 1, limit: 8 })

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <StatsPanel />

      <div className="section-head">
        <h2>Recent tasks</h2>
        <Link to="/tasks">View all tasks</Link>
      </div>
      <FilterBar status={status} priority={priority} assignedTo="" onStatus={setStatus} onPriority={setPriority} />

      {isLoading && <TaskListSkeleton />}
      {isError && (
        <div className="state-box state-error">
          <p>Could not load tasks: {error.message}</p>
          <button className="btn" onClick={() => refetch()}>Retry</button>
        </div>
      )}
      {data && (data.items.length === 0
        ? <div className="state-box"><p>No tasks match these filters yet.</p></div>
        : <ul className="task-list">{data.items.map((t) => <TaskCard key={t.id} task={t} />)}</ul>)}
    </div>
  )
}
