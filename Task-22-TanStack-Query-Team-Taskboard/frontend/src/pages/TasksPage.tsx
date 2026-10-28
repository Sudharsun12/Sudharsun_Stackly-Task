import { useEffect, useState } from 'react'
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
    <div className="page">
      <div className="section-head">
        <h1>Tasks</h1>
        <button className="btn" onClick={() => setFormOpen(true)}>Add task</button>
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
          <button className="btn" onClick={() => refetch()}>Retry</button>
        </div>
      )}
      {data && (
        <>
          {data.items.length === 0
            ? <div className="state-box"><p>No tasks found. Add one to get started.</p></div>
            : (
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
