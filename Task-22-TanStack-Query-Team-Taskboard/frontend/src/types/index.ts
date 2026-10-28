export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'
export type UserRole = 'admin' | 'member'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
}

export interface Task {
  id: number
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  assigned_to: number | null
  assigned_name: string | null
  created_by: number
  created_name: string
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface TaskFilters {
  status?: TaskStatus | ''
  priority?: TaskPriority | ''
  assigned_to?: number | ''
  search?: string
  page?: number
  limit?: number
}

export interface PaginatedTasks {
  items: Task[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface TaskInput {
  title?: string
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  assigned_to?: number | null
  due_date?: string | null
}

export interface Stats {
  total: number
  by_status: Record<TaskStatus, number>
  by_priority: Record<TaskPriority, number>
  overdue: number
  completed_this_week: number
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: User
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}
