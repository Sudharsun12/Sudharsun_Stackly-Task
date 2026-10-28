import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchStats, fetchTask, fetchTasks, fetchUsers } from '../api/tasks'
import type { PaginatedTasks, Stats, Task, TaskFilters, User } from '../types'

/** Paginated + filtered list. The whole filter object is part of the key,
 *  so every filter/page combination is cached separately. */
export function useTasks(filters: TaskFilters) {
  return useQuery<PaginatedTasks>({
    queryKey: ['tasks', filters],
    queryFn: () => fetchTasks(filters),
    placeholderData: keepPreviousData, // keep old page on screen while next loads
  })
}

export function useTask(id: number) {
  return useQuery<Task>({
    queryKey: ['tasks', id],
    queryFn: () => fetchTask(id),
    enabled: Number.isFinite(id) && id > 0,
  })
}

/** Dashboard stats — polled every 10s in the background. */
export function useStats() {
  return useQuery<Stats>({
    queryKey: ['stats'],
    queryFn: fetchStats,
    refetchInterval: 1000 * 10,
  })
}

/** Users rarely change, so a long staleTime avoids pointless refetches.
 *  `enabled` lets callers make this a dependent query (admins only). */
export function useUsers(enabled: boolean) {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
    enabled,
    staleTime: 1000 * 60 * 5,
  })
}
