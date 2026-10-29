import { useState } from 'react'
import { Link } from 'react-router-dom'
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

  // Parallel Query: tasks list fires simultaneously with StatsPanel's useQuery
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
      {/* Unique Welcome Hero Banner */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <div className="hero-tag">
            <span className="hero-calendar-icon">📅</span>
            <span>{todayFormatted}</span>
            <span className="hero-dot">•</span>
            <span className="hero-role-pill">{user?.role?.toUpperCase()} PORTAL</span>
          </div>
          <h1>
            Hello, <span className="hero-highlight">{user?.name || 'Team Member'}</span> 👋
          </h1>
          <p className="hero-subtitle">
            Here is your real-time operational overview. All data is cached and synchronized with TanStack Query.
          </p>
        </div>
        <div className="hero-actions">
          <button className="btn btn-hero-add" onClick={() => setFormOpen(true)}>
            <span className="btn-icon">＋</span> Add New Task
          </button>
          <Link to="/tasks" className="btn btn-ghost btn-hero-link">
            Full Board →
          </Link>
        </div>
      </div>

      {/* Analytics KPI Section */}
      <StatsPanel />

      {/* Recent Tasks Card */}
      <div className="dashboard-tasks-section">
        <div className="section-head">
          <div className="section-title-wrap">
            <h2>Recent Tasks</h2>
            <span className="section-count-badge">
              {data ? `${data.items.length} of ${data.total} tasks` : 'Loading…'}
            </span>
          </div>
          <Link to="/tasks" className="link-all-tasks">
            View all with pagination →
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
            <button className="btn" onClick={() => refetch()}>
              Retry
            </button>
          </div>
        )}

        {data && (
          data.items.length === 0 ? (
            <div className="state-box empty-tasks-state">
              <span className="empty-state-icon">📋</span>
              <h3>No tasks found</h3>
              <p>No tasks match the selected filters. Create one to get started.</p>
              <button className="btn btn-sm" onClick={() => setFormOpen(true)}>
                + Create Task
              </button>
            </div>
          ) : (
            <ul className="task-list">
              {data.items.map((t) => (
                <TaskCard key={t.id} task={t} onEdit={handleEdit} />
              ))}
            </ul>
          )
        )}
      </div>

      {formOpen && <TaskForm task={editingTask} onClose={closeForm} />}
    </div>
  )
}
