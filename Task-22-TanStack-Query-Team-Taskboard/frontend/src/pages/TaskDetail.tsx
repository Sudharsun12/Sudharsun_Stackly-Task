import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTask, useUsers } from '../hooks/useTasks'
import { useDeleteTask, useUpdateTask } from '../hooks/useTaskMutations'
import { useAuth } from '../context/AuthContext'
import { PriorityBadge, STATUS_LABEL } from '../components/Badges'
import { TaskForm } from '../components/TaskForm'
import { Skeleton } from '../components/Skeleton'
import type { TaskStatus } from '../types'

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>()
  const taskId = Number(id)
  const navigate = useNavigate()
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)

  const { data: task, isLoading, isError, error } = useTask(taskId)

  // Dependent query: only runs once the task has loaded AND the viewer is an admin.
  const { data: users = [] } = useUsers(user?.role === 'admin' && !!task)
  const assignee = users.find((u) => u.id === task?.assigned_to)

  const update = useUpdateTask()
  const del = useDeleteTask(() => navigate('/tasks'))

  if (isLoading) return <div className="page"><Skeleton height={28} width="40%" /><br /><Skeleton height={120} /></div>
  if (isError) return <div className="page"><div className="state-box state-error"><p>{error.message}</p><Link to="/tasks">Back to tasks</Link></div></div>
  if (!task) return null

  const canDelete = user?.role === 'admin' || user?.id === task.created_by

  return (
    <div className="page">
      <Link to="/tasks">← Back to tasks</Link>
      <div className="detail">
        <div className="section-head">
          <h1>{task.title}</h1>
          <PriorityBadge priority={task.priority} />
        </div>
        <p className="detail-desc">{task.description || 'No description provided.'}</p>

        <dl className="detail-grid">
          <div><dt>Status</dt>
            <dd>
              <select
                value={task.status}
                disabled={update.isPending}
                onChange={(e) => update.mutate({ id: task.id, status: e.target.value as TaskStatus })}
                aria-label="Change status"
              >
                {(Object.keys(STATUS_LABEL) as TaskStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
            </dd>
          </div>
          <div><dt>Assigned to</dt><dd>{assignee?.name ?? task.assigned_name ?? 'Unassigned'}</dd></div>
          <div><dt>Created by</dt><dd>{task.created_name}</dd></div>
          <div><dt>Due date</dt><dd>{task.due_date ?? 'No due date'}</dd></div>
          <div><dt>Created</dt><dd>{new Date(task.created_at).toLocaleString()}</dd></div>
          <div><dt>Last updated</dt><dd>{new Date(task.updated_at).toLocaleString()}</dd></div>
        </dl>

        <div className="modal-actions" style={{ justifyContent: 'flex-start' }}>
          <button className="btn" onClick={() => setEditing(true)}>Edit task</button>
          {canDelete && (
            <button
              className="btn btn-danger"
              disabled={del.isPending}
              onClick={() => { if (window.confirm('Delete this task?')) del.mutate(task.id) }}
            >
              {del.isPending ? 'Deleting…' : 'Delete task'}
            </button>
          )}
        </div>
      </div>
      {editing && <TaskForm task={task} onClose={() => setEditing(false)} />}
    </div>
  )
}
