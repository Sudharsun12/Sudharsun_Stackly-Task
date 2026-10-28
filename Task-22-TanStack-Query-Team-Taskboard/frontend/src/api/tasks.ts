import axiosInstance from './axios'
import type {
  AuthResponse, PaginatedTasks, RegisterInput, Stats, Task, TaskFilters, TaskInput, User,
} from '../types'

// ---- auth ----
export const loginRequest = (email: string, password: string): Promise<AuthResponse> =>
  axiosInstance.post('/api/login', { email, password }).then((r) => r.data)

export const registerRequest = (input: RegisterInput): Promise<{ message: string }> =>
  axiosInstance.post('/api/register', input).then((r) => r.data)

export const fetchMe = (): Promise<User> => axiosInstance.get('/api/me').then((r) => r.data)

export const logoutRequest = (): Promise<void> => axiosInstance.get('/api/logout').then(() => undefined)

// ---- tasks ----
export const fetchTasks = (filters: TaskFilters): Promise<PaginatedTasks> => {
  // drop empty values so they don't end up in the query string
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined),
  )
  return axiosInstance.get('/api/tasks', { params }).then((r) => r.data)
}

export const fetchTask = (id: number): Promise<Task> =>
  axiosInstance.get(`/api/tasks/${id}`).then((r) => r.data)

export const createTask = (input: TaskInput): Promise<Task> =>
  axiosInstance.post('/api/tasks', input).then((r) => r.data)

export const updateTask = ({ id, ...input }: TaskInput & { id: number }): Promise<Task> =>
  axiosInstance.put(`/api/tasks/${id}`, input).then((r) => r.data)

export const deleteTask = (id: number): Promise<void> =>
  axiosInstance.delete(`/api/tasks/${id}`).then(() => undefined)

// ---- dashboard / users ----
export const fetchStats = (): Promise<Stats> => axiosInstance.get('/api/stats').then((r) => r.data)

export const fetchUsers = (): Promise<User[]> => axiosInstance.get('/api/users').then((r) => r.data)
