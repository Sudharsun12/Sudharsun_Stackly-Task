import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { fetchTask } from '../api/tasks'
import { useDeleteTask } from '../hooks/useTaskMutations'
import { useAuth } from '../context/AuthContext'
import { PriorityBadge, StatusBadge } from './Badges'
import type { Task } from '../types'

interface Props {
  task: Task
  onEdit?: (task: Task) => void
}

export function TaskCard({ task, onEdit }: Props) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const del = useDeleteTask()

  const canDelete = user?.role === 'admin' || user?.id === task.created_by
  const overdue = !!task.due_date && task.status !== 'done' && new Date(task.due_date) < new Date(new Date().toDateString())

  // Bonus: warm the cache on hover so the detail page opens instantly.
  const prefetch = () =>
    queryClient.prefetchQuery({ queryKey: ['tasks', task.id], queryFn: () => fetchTask(task.id), staleTime: 1000 * 30 })

  const handleDelete = () => {
    if (window.confirm(`Delete "${task.title}"? This cannot be undone.`)) del.mutate(task.id)
  }

  return (
    <li className="task-row" onMouseEnter={prefetch}>
      <div className="task-main">
        <Link to={`/tasks/${task.id}`} className="task-title">{task.title}</Link>
        <p className="task-meta">
          {task.assigned_name ? `Assigned to ${task.assigned_name}` : 'Unassigned'}
          {task.due_date && <span className={overdue ? 'overdue' : ''}> — due {task.due_date}{overdue ? ' (overdue)' : ''}</span>}
        </p>
      </div>
      <div className="task-badges">
        <PriorityBadge priority={task.priority} />
        <StatusBadge status={task.status} />
      </div>
      {onEdit && (
        <div className="task-actions">
          <button className="btn btn-ghost" onClick={() => onEdit(task)}>Edit</button>
          {canDelete && (
            <button className="btn btn-danger" onClick={handleDelete} disabled={del.isPending}>
              {del.isPending ? 'Deleting…' : 'Delete'}
            </button>
          )}
        </div>
      )}
    </li>
  )
}
