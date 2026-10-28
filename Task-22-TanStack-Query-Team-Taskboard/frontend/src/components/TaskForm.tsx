import { useState, type FormEvent } from 'react'
import { useCreateTask, useUpdateTask } from '../hooks/useTaskMutations'
import { useUsers } from '../hooks/useTasks'
import { useAuth } from '../context/AuthContext'
import { PRIORITY_LABEL, STATUS_LABEL } from './Badges'
import type { Task, TaskPriority, TaskStatus } from '../types'

interface Props {
  task?: Task // present = edit mode
  onClose: () => void
}

const tomorrow = (): string => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

export function TaskForm({ task, onClose }: Props) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const { data: users = [] } = useUsers(isAdmin)

  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'todo')
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'medium')
  const [dueDate, setDueDate] = useState(task?.due_date ?? '')
  const [assignedTo, setAssignedTo] = useState<number | ''>(task?.assigned_to ?? '')
  const [formError, setFormError] = useState<string | null>(null)

  const create = useCreateTask(onClose)
  const update = useUpdateTask(onClose)
  const pending = create.isPending || update.isPending

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return setFormError('Title is required')
    const dueChanged = dueDate !== (task?.due_date ?? '')
    if (dueDate && dueChanged && dueDate < tomorrow()) return setFormError('Due date must be in the future')
    setFormError(null)

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority,
      due_date: dueDate || null,
      ...(isAdmin ? { assigned_to: assignedTo === '' ? null : assignedTo } : {}),
    }
    if (task) update.mutate({ id: task.id, ...payload })
    else create.mutate(payload)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit} aria-label={task ? 'Edit task' : 'Add task'}>
        <h2>{task ? 'Edit task' : 'Add task'}</h2>

        <label>Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} autoFocus />
        </label>
        <label>Description
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <div className="form-row">
          <label>Status
            <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
              {(Object.keys(STATUS_LABEL) as TaskStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
          </label>
          <label>Priority
            <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
              {(Object.keys(PRIORITY_LABEL) as TaskPriority[]).map((p) => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>Due date
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </label>
          {isAdmin && (
            <label>Assign to
              <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value ? Number(e.target.value) : '')}>
                <option value="">Unassigned</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </label>
          )}
        </div>

        {formError && <p className="form-error">{formError}</p>}

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn" disabled={pending}>
            {pending ? 'Saving…' : task ? 'Save changes' : 'Add task'}
          </button>
        </div>
      </form>
    </div>
  )
}
