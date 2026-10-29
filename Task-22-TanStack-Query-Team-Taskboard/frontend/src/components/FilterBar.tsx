import type { TaskPriority, TaskStatus, User } from '../types'
import { PRIORITY_LABEL, STATUS_LABEL } from './Badges'

interface Props {
  status: TaskStatus | ''
  priority: TaskPriority | ''
  assignedTo: number | ''
  search?: string
  users?: User[]
  onStatus: (v: TaskStatus | '') => void
  onPriority: (v: TaskPriority | '') => void
  onAssignedTo?: (v: number | '') => void
  onSearch?: (v: string) => void
}

export function FilterBar({
  status,
  priority,
  assignedTo,
  search,
  users,
  onStatus,
  onPriority,
  onAssignedTo,
  onSearch,
}: Props) {
  return (
    <div className="filter-bar">
      {onSearch && (
        <div className="filter-search-box">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            type="search"
            className="filter-search-input"
            placeholder="Search tasks by title…"
            value={search ?? ''}
            onChange={(e) => onSearch(e.target.value)}
            aria-label="Search tasks by title"
          />
        </div>
      )}

      <div className="filter-dropdowns-row">
        <div className="filter-select-wrapper">
          <label className="filter-select-label" htmlFor="filter-status-select">Status</label>
          <select
            id="filter-status-select"
            className="filter-select"
            value={status}
            onChange={(e) => onStatus(e.target.value as TaskStatus | '')}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {(Object.keys(STATUS_LABEL) as TaskStatus[]).map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
        </div>

        <div className="filter-select-wrapper">
          <label className="filter-select-label" htmlFor="filter-priority-select">Priority</label>
          <select
            id="filter-priority-select"
            className="filter-select"
            value={priority}
            onChange={(e) => onPriority(e.target.value as TaskPriority | '')}
            aria-label="Filter by priority"
          >
            <option value="">All priorities</option>
            {(Object.keys(PRIORITY_LABEL) as TaskPriority[]).map((p) => (
              <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>
            ))}
          </select>
        </div>

        {users && onAssignedTo && (
          <div className="filter-select-wrapper">
            <label className="filter-select-label" htmlFor="filter-assignee-select">Assignee</label>
            <select
              id="filter-assignee-select"
              className="filter-select"
              value={assignedTo}
              onChange={(e) => onAssignedTo(e.target.value ? Number(e.target.value) : '')}
              aria-label="Filter by assignee"
            >
              <option value="">Anyone</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  )
}
