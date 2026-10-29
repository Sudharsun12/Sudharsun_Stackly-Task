import { useEffect, useState } from 'react'
import { BodyNav } from '../components/BodyNav'
import { FilterBar } from '../components/FilterBar'
import { Pagination } from '../components/Pagination'
import { TaskCard } from '../components/TaskCard'
import { TaskForm } from '../components/TaskForm'
import { TaskListSkeleton } from '../components/Skeleton'
import { useTasks, useUsers } from '../hooks/useTasks'
import { useDebounce } from '../hooks/useDebounce'
import { useAuth } from '../context/AuthContext'
import type { Task, TaskPriority, TaskStatus } from '../types'

export default function TasksPage() {
  const { user } = useAuth()
  const [status, setStatus] = useState<TaskStatus | ''>('')
  const [priority, setPriority] = useState<TaskPriority | ''>('')
  const [assignedTo, setAssignedTo] = useState<number | ''>('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Task | undefined>()

  const search = useDebounce(searchInput, 400)
  useEffect(() => setPage(1), [search]) // new search → back to page 1

  const { data: users } = useUsers(user?.role === 'admin')
  const { data, isLoading, isError, error, isFetching, refetch } = useTasks({
    status, priority, assigned_to: assignedTo, search, page, limit: 10,
  })

  const resetPage = <T,>(setter: (v: T) => void) => (v: T) => { setter(v); setPage(1) }
  const closeForm = () => { setFormOpen(false); setEditing(undefined) }

  return (
    <div className="page tasks-page">
      {/* Body navigation switcher (Dashboard & Tasks placed right in page body) */}
      <div className="body-nav-container">
        <BodyNav />
      </div>

      <div className="section-head">
        <div>
          <h1>Team Tasks</h1>
          <p className="section-head-sub">Manage, filter, and track team progress in real time.</p>
        </div>
        <button className="btn btn-primary-add" onClick={() => setFormOpen(true)}>
          <span>＋</span> Add Task
        </button>
      </div>

      <FilterBar
        status={status}
        priority={priority}
        assignedTo={assignedTo}
        search={searchInput}
        users={users}
        onStatus={resetPage(setStatus)}
        onPriority={resetPage(setPriority)}
        onAssignedTo={resetPage(setAssignedTo)}
        onSearch={setSearchInput}
      />

      {isLoading && <TaskListSkeleton />}
      {isError && (
        <div className="state-box state-error">
          <p>Could not load tasks: {error.message}</p>
          <button className="btn btn-ghost" onClick={() => refetch()}>Retry</button>
        </div>
      )}
      {data && (
        <>
          {data.items.length === 0 ? (
            <div className="state-box">
              <p>No tasks found. Try adjusting your filters or click "Add Task" to create one.</p>
            </div>
          ) : (
            <ul className="task-list">
              {data.items.map((t) => (
                <TaskCard key={t.id} task={t} onEdit={(task) => { setEditing(task); setFormOpen(true) }} />
              ))}
            </ul>
          )}
          <Pagination page={data.page} pages={data.pages} total={data.total} isFetching={isFetching} onChange={setPage} />
        </>
      )}

      {formOpen && <TaskForm task={editing} onClose={closeForm} />}
    </div>
  )
}
