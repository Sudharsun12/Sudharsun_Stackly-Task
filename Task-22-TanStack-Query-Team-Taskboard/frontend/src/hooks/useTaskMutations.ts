import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTask, deleteTask, updateTask } from '../api/tasks'
import { errorMessage } from '../api/axios'
import { useToast } from '../context/ToastContext'
import type { Task, TaskInput } from '../types'

/** After any write, both the task lists/details (['tasks', ...]) and the
 *  dashboard numbers (['stats']) are stale — invalidate both. */
function useRefreshAfterWrite() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['tasks'] }),
      queryClient.invalidateQueries({ queryKey: ['stats'] }),
    ])
}

export function useCreateTask(onDone?: () => void) {
  const refresh = useRefreshAfterWrite()
  const showToast = useToast()
  return useMutation<Task, unknown, TaskInput>({
    mutationFn: createTask,
    onSuccess: () => {
      refresh()
      showToast('Task added!', 'success')
      onDone?.()
    },
    onError: (err) => showToast(errorMessage(err, 'Failed to add task'), 'error'),
  })
}

export function useUpdateTask(onDone?: () => void) {
  const refresh = useRefreshAfterWrite()
  const showToast = useToast()
  return useMutation<Task, unknown, TaskInput & { id: number }>({
    mutationFn: updateTask,
    onSuccess: () => {
      refresh()
      showToast('Task updated', 'success')
      onDone?.()
    },
    onError: (err) => showToast(errorMessage(err, 'Failed to update task'), 'error'),
  })
}

export function useDeleteTask(onDone?: () => void) {
  const refresh = useRefreshAfterWrite()
  const showToast = useToast()
  return useMutation<void, unknown, number>({
    mutationFn: deleteTask,
    onSuccess: () => {
      refresh()
      showToast('Task deleted', 'success')
      onDone?.()
    },
    onError: (err) => showToast(errorMessage(err, 'Failed to delete task'), 'error'),
  })
}
