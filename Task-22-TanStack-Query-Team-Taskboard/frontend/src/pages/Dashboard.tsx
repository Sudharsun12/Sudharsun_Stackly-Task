import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BodyNav } from '../components/BodyNav'
import { StatsPanel } from '../components/StatsPanel'
import { FilterBar } from '../components/FilterBar'
import { TaskCard } from '../components/TaskCard'
import { TaskForm } from '../components/TaskForm'
import { TaskListSkeleton } from '../components/Skeleton'
import { useTasks } from '../hooks/useTasks'
import { useAuth } from '../context/AuthContext'
import type { Task, TaskPriority, TaskStatus } from '../types'

export default function Dashboard() {
  const { user } = useAuth()
  const [status, setStatus] = useState<TaskStatus | ''>('')
  const [priority, setPriority] = useState<TaskPriority | ''>('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()

  // Parallel Query: recent tasks fire concurrently with StatsPanel's useQuery
  const { data, isLoading, isError, error, refetch } = useTasks({
    status,
    priority,
    page: 1,
    limit: 8,
  })

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date())

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingTask(undefined)
  }

  return (
    <div className="page dashboard-page">
      {/* Body navigation switcher (Dashboard & Tasks placed right in page body) */}
      <div className="body-nav-container">
        <BodyNav />
      </div>

      {/* Clean, open executive greeting header */}
      <header className="dashboard-header-open">
        <div className="header-meta-row">
          <span className="live-date-pill">📅 {todayFormatted}</span>
          <span className="user-role-badge">{user?.role?.toUpperCase()} SESSION</span>
        </div>
        <div className="header-main-row">
          <div>
            <h1 className="header-greeting">
              Welcome, <span className="text-highlight">{user?.name || 'Developer'}</span>
            </h1>
            <p className="header-subtext">
              Real-time task synchronization powered by TanStack Query server state.
            </p>
          </div>
          <div className="header-actions">
            <button className="btn btn-primary-add" onClick={() => setFormOpen(true)}>
              <span>＋</span> New Task
            </button>
            <Link to="/tasks" className="btn btn-ghost">
              All Tasks →
            </Link>
          </div>
        </div>
      </header>

      {/* Essential 4-Metric Executive KPI Cards */}
      <StatsPanel />

      {/* Recent Tasks List (natural flow, no nested card container) */}
      <section className="dashboard-tasks-flow" aria-label="Recent Tasks">
        <div className="flow-header">
          <div className="flow-title-wrap">
            <h2>Recent Tasks</h2>
            <span className="count-pill">
              {data ? `${data.items.length} of ${data.total}` : 'Loading…'}
            </span>
          </div>
          <Link to="/tasks" className="link-view-all">
            Open full board & filters →
          </Link>
        </div>

        <FilterBar
          status={status}
          priority={priority}
          assignedTo=""
          onStatus={setStatus}
          onPriority={setPriority}
        />

        {isLoading && <TaskListSkeleton />}

        {isError && (
          <div className="state-box state-error">
            <p>Could not load tasks: {error.message}</p>
            <button className="btn btn-ghost" onClick={() => refetch()}>
              Retry Fetch
            </button>
          </div>
        )}

        {data && (
          <>
            {data.items.length === 0 ? (
              <div className="empty-clean-state">
                <span className="empty-icon" aria-hidden="true">📋</span>
                <p>No recent tasks match the current filter.</p>
                <button className="btn btn-ghost btn-sm" onClick={() => { setStatus(''); setPriority('') }}>
                  Clear filters
                </button>
              </div>
            ) : (
              <ul className="task-list">
                {data.items.map((task) => (
                  <TaskCard key={task.id} task={task} onEdit={handleEdit} />
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      {formOpen && <TaskForm task={editingTask} onClose={closeForm} />}
    </div>
  )
}
